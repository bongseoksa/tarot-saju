import type { SSEEvent, InterpretRequest } from "@tarot-saju/shared";

interface SSECallbacks {
  onChunk: (text: string) => void;
  onComplete: (data: string) => void;
  onError: (error: Error) => void;
}

const INITIAL_TIMEOUT = 30_000;
const RETRY_TIMEOUT = 15_000;

export async function requestInterpretation(
  request: InterpretRequest,
  callbacks: SSECallbacks,
  apiUrl: string,
): Promise<void> {
  try {
    await fetchSSE(apiUrl, request, callbacks, INITIAL_TIMEOUT);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      try {
        await fetchSSE(apiUrl, request, callbacks, RETRY_TIMEOUT);
      } catch (retryErr) {
        callbacks.onError(
          retryErr instanceof Error ? retryErr : new Error("Retry failed"),
        );
      }
    } else {
      callbacks.onError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }
}

async function fetchSSE(
  url: string,
  body: InterpretRequest,
  callbacks: SSECallbacks,
  timeoutMs: number,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        try {
          const event: SSEEvent = JSON.parse(json);
          switch (event.type) {
            case "chunk":
              callbacks.onChunk(event.data);
              break;
            case "done":
              callbacks.onComplete(event.data);
              return;
            case "error":
              callbacks.onError(new Error(event.data));
              return;
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
