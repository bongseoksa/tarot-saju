import type { DrawnCard } from "@shared/types";

/** POST /functions/v1/interpret request body */
export interface InterpretRequest {
  themeId: string;
  cards: DrawnCard[];
}

/** SSE event type */
export type SSEEventType = "chunk" | "done" | "error";

/** SSE event data */
export interface SSEEvent {
  type: SSEEventType;
  data: string; // chunk: text fragment, done: full text, error: error message
}

/** interpret final result (parsed from done event) */
export interface InterpretResult {
  interpretation: string;
  summary: string;
}

/** interpret error response (HTTP 400/500) */
export interface InterpretError {
  error: string;
}
