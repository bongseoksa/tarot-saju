export interface ParsedResponse {
  interpretation: string;
  summary: string;
}

export function parseResponse(raw: string): ParsedResponse {
  const summaryMatch = raw.match(/###\s*한줄 요약\s*\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/###\s*한줄 요약\s*\n.+/, "").trim();
  return { interpretation, summary };
}
