import { useCallback, useRef } from "react";
import type { ReadingRequest } from "@tarot-saju/shared";
import { streamInterpretation } from "../utils/sseClient";
import { parseInterpretation } from "../utils/parseInterpretation";
import { useReadingStore } from "../stores/useReadingStore";
import { useHistoryStore } from "../stores/useHistoryStore";
import { usePendingStore } from "../stores/usePendingStore";
import { THEMES } from "../data/themes";

export function useInterpretation() {
  const abortRef = useRef<AbortController | null>(null);

  const interpret = useCallback(async (request: ReadingRequest) => {
    const store = useReadingStore.getState();
    store.setPhase("streaming");

    let lastError: Error | null = null;

    // Try up to 2 times (initial + 1 retry)
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      abortRef.current = controller;

      const success = await new Promise<boolean>((resolve) => {
        streamInterpretation(
          request,
          (chunk) => {
            useReadingStore.getState().appendInterpretation(chunk);
          },
          (fullText) => {
            const { interpretation, summary } = parseInterpretation(fullText);
            const resultId = crypto.randomUUID();

            useReadingStore.getState().completeReading(
              interpretation,
              summary,
              resultId,
            );

            useHistoryStore.getState().addResult({
              id: resultId,
              request,
              interpretation,
              summary,
              createdAt: new Date().toISOString(),
            });

            resolve(true);
          },
          (error) => {
            lastError = error;
            resolve(false);
          },
          controller.signal,
        );
      });

      if (success) return;

      // Reset interpretation for retry
      if (attempt === 0) {
        useReadingStore.setState({ interpretation: "" });
      }
    }

    // Both attempts failed — save pending session
    useReadingStore.getState().setPhase("error");

    const theme = THEMES.find((t) => t.id === request.themeId);
    usePendingStore.getState().addSession({
      id: crypto.randomUUID(),
      themeId: request.themeId,
      themeTitle: theme?.title ?? "",
      cards: request.cards,
      createdAt: new Date().toISOString(),
      adWatched: true,
    });

    void lastError; // acknowledged
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { interpret, abort };
}
