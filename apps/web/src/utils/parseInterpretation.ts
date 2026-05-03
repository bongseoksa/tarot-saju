export function parseInterpretation(raw: string): {
  interpretation: string;
  summary: string;
} {
  const summaryMatch = raw.match(/### 한줄 요약\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/### 한줄 요약\n.+/, "").trim();
  return { interpretation, summary };
}
