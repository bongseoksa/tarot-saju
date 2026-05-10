/**
 * Evaluator: assess AI response quality using shared guard + additional checks.
 */

import {
  validateResponse,
  parseResponse,
} from "@tarot-saju/shared";
import type { DrawnCard } from "@tarot-saju/shared";

export interface EvalResult {
  pass: boolean;
  failures: string[];
  summary: string;
  responseLength: number;
}

export function evaluate(raw: string, cards: DrawnCard[]): EvalResult {
  const failures: string[] = [];

  // 1. Shared guard validation (sections, length, forbidden words)
  const guardResult = validateResponse(raw);
  failures.push(...guardResult.failures);

  // 2. Length check (300~1500 chars)
  if (raw.length < 300) failures.push("eval_too_short");
  if (raw.length > 1500) failures.push("eval_too_long");

  // 3. Korean language check — should not have garbled characters
  const koreanRatio = (raw.match(/[\uAC00-\uD7AF]/g)?.length ?? 0) / raw.length;
  if (koreanRatio < 0.3) failures.push("low_korean_ratio");

  // 4. Parse summary
  const parsed = parseResponse(raw);

  return {
    pass: failures.length === 0,
    failures,
    summary: parsed.summary,
    responseLength: raw.length,
  };
}
