export interface GuardResult {
  pass: boolean;
  failures: string[];
}

const REQUIRED_SECTIONS = [
  "과거 해석",
  "현재 해석",
  "미래 해석",
  "종합 조언",
  "한줄 요약",
];

const FORBIDDEN_WORDS = ["죽음을 맞이", "파멸", "절망적", "최악의"];

export function validateResponse(raw: string): GuardResult {
  const failures: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (!raw.includes(section)) {
      failures.push(`missing_section:${section}`);
    }
  }

  if (raw.length < 50) {
    failures.push("too_short");
  }
  if (raw.length > 1500) {
    failures.push("too_long");
  }

  for (const word of FORBIDDEN_WORDS) {
    if (raw.includes(word)) {
      failures.push(`forbidden_word:${word}`);
    }
  }

  return { pass: failures.length === 0, failures };
}
