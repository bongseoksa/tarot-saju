import { describe, it, expect } from "vitest";
import { parseInterpretation } from "./parseInterpretation";

describe("parseInterpretation", () => {
  it("should extract summary from ### 한줄 요약 section", () => {
    const raw = `### 과거 해석
과거 텍스트

### 현재 해석
현재 텍스트

### 한줄 요약
망설임을 멈추고 진심을 따르세요`;

    const result = parseInterpretation(raw);
    expect(result.summary).toBe("망설임을 멈추고 진심을 따르세요");
  });

  it("should return interpretation without summary section", () => {
    const raw = `### 과거 해석
과거 텍스트

### 한줄 요약
요약 문구`;

    const result = parseInterpretation(raw);
    expect(result.interpretation).toContain("과거 텍스트");
    expect(result.interpretation).not.toContain("요약 문구");
    expect(result.interpretation).not.toContain("### 한줄 요약");
  });

  it("should return empty summary when section is missing", () => {
    const raw = `### 과거 해석
텍스트만 있고 요약 없음`;

    const result = parseInterpretation(raw);
    expect(result.summary).toBe("");
    expect(result.interpretation).toContain("텍스트만 있고 요약 없음");
  });

  it("should handle quoted summary", () => {
    const raw = `### 한줄 요약
"따옴표가 있는 요약"`;

    const result = parseInterpretation(raw);
    expect(result.summary).toBe('"따옴표가 있는 요약"');
  });

  it("should trim whitespace", () => {
    const raw = `### 과거 해석
텍스트

### 한줄 요약
  요약  `;

    const result = parseInterpretation(raw);
    expect(result.summary).toBe("요약");
    expect(result.interpretation.trim()).toBe("### 과거 해석\n텍스트");
  });
});
