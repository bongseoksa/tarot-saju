import { storageUtil } from "./storageUtil";

const SUPPRESSION_KEY = "pending_modal_suppressed_until";

export function isSuppressed(): boolean {
  const until = storageUtil.get<number>(SUPPRESSION_KEY);
  if (until === null) return false;
  return Date.now() < until;
}

export function suppressUntilMidnight(): void {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  storageUtil.set(SUPPRESSION_KEY, midnight.getTime());
}

export function clearSuppression(): void {
  storageUtil.remove(SUPPRESSION_KEY);
}
