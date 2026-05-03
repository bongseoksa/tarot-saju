/**
 * Trigger a short haptic feedback via the Vibration API.
 * Silently ignores unsupported browsers.
 */
export function triggerHaptic(duration = 10): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(duration);
  }
}
