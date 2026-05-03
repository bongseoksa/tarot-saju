import { useCallback, useState } from "react";
import type { ReadingResult } from "@tarot-saju/shared";
import { saveSharedReading } from "../utils/shareService";

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (result: ReadingResult) => {
    setIsSharing(true);
    try {
      const shareId = await saveSharedReading(result);
      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
    } catch {
      // Silently fail — no throw to caller
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { share, isSharing };
}
