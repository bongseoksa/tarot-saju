import { describe, it, expect } from "vitest";
import { parseResponse, validateResponse } from "@tarot-saju/shared";

const VALID_RESPONSE = `### 과거 해석
과거에 대한 해석 내용입니다. 지금까지의 흐름에서 중요한 의미를 가집니다.

### 현재 해석
현재 상황에 대한 해석입니다. 지금 이 순간 느끼고 계신 감정과 연결됩니다.

### 미래 해석
앞으로의 방향에 대한 해석입니다. 새로운 가능성이 열리고 있습니다.

### 종합 조언
세 카드의 흐름을 연결하면, 지금은 변화를 받아들이고 내면의 목소리에 귀 기울일 때입니다.

### 한줄 요약
변화를 받아들이세요`;

describe("parseResponse", () => {
  it("should extract summary from valid response", () => {
    const result = parseResponse(VALID_RESPONSE);
    expect(result.summary).toBe("변화를 받아들이세요");
  });

  it("should extract interpretation without summary section", () => {
    const result = parseResponse(VALID_RESPONSE);
    expect(result.interpretation).not.toContain("### 한줄 요약");
    expect(result.interpretation).not.toContain("변화를 받아들이세요");
    expect(result.interpretation).toContain("### 과거 해석");
    expect(result.interpretation).toContain("### 종합 조언");
  });

  it("should return empty summary when no summary section exists", () => {
    const noSummary = `### 과거 해석
내용입니다.

### 현재 해석
내용입니다.

### 미래 해석
내용입니다.

### 종합 조언
내용입니다.`;
    const result = parseResponse(noSummary);
    expect(result.summary).toBe("");
    expect(result.interpretation).toContain("### 과거 해석");
  });
});

describe("validateResponse", () => {
  it("should pass for valid response", () => {
    const result = validateResponse(VALID_RESPONSE);
    expect(result.pass).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("should fail when sections are missing", () => {
    const incomplete = `### 과거 해석
내용입니다.

### 현재 해석
내용입니다.`;
    const result = validateResponse(incomplete);
    expect(result.pass).toBe(false);
    expect(result.failures).toContain("missing_section:미래 해석");
    expect(result.failures).toContain("missing_section:종합 조언");
    expect(result.failures).toContain("missing_section:한줄 요약");
  });

  it("should fail when response is too short", () => {
    const tooShort = "짧은 응답";
    const result = validateResponse(tooShort);
    expect(result.pass).toBe(false);
    expect(result.failures).toContain("too_short");
  });

  it("should fail when forbidden words are used", () => {
    const forbidden = `### 과거 해석
이 관계는 절망적입니다. 파멸의 길을 걷고 있습니다.

### 현재 해석
현재 상황입니다.

### 미래 해석
미래 내용입니다.

### 종합 조언
종합 내용입니다.

### 한줄 요약
요약`;
    const result = validateResponse(forbidden);
    expect(result.pass).toBe(false);
    expect(result.failures).toContain("forbidden_word:파멸");
    expect(result.failures).toContain("forbidden_word:절망적");
  });
});
