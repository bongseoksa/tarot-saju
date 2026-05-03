import { useCallback } from "react";

const AD_TIMEOUT_MS = 5000;

/**
 * Ad gate hook. MVP: no ad SDK — always resolves to false (silent skip).
 * Replace showAd internals when integrating AdSense/AdMob in Phase 5.
 */
export function useAdGate() {
  const showAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // MVP: simulate ad load timeout then skip
      setTimeout(() => resolve(false), AD_TIMEOUT_MS);
    });
  }, []);

  return { showAd };
}
