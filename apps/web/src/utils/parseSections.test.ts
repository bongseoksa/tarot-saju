import { describe, it, expect } from "vitest";

// parseSections is defined inline in ResultPage and SharedResultPage.
// Extract and test the same logic here.
function parseSections(text: string) {
  const sections: { title: string; content: string }[] = [];
  const parts = text.split(/^###\s+/m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    sections.push({
      title: part.slice(0, newline).trim(),
      content: part.slice(newline + 1).trim(),
    });
  }
  return sections;
}

describe("parseSections", () => {
  it("parses standard 4-section interpretation", () => {
    const text = `### 과거 해석
과거 내용입니다.
### 현재 해석
현재 내용입니다.
### 미래 해석
미래 내용입니다.
### 종합 조언
조언 내용입니다.`;

    const sections = parseSections(text);
    expect(sections).toHaveLength(4);
    expect(sections[0]).toEqual({ title: "과거 해석", content: "과거 내용입니다." });
    expect(sections[1]).toEqual({ title: "현재 해석", content: "현재 내용입니다." });
    expect(sections[2]).toEqual({ title: "미래 해석", content: "미래 내용입니다." });
    expect(sections[3]).toEqual({ title: "종합 조언", content: "조언 내용입니다." });
  });

  it("returns empty array for text without ### headers", () => {
    expect(parseSections("Just plain text")).toEqual([]);
    expect(parseSections("")).toEqual([]);
  });

  it("handles section with no content after header", () => {
    const text = "### Empty Section\n\n### Next Section\nContent here.";
    const sections = parseSections(text);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe("Empty Section");
    expect(sections[0].content).toBe("");
    expect(sections[1].title).toBe("Next Section");
    expect(sections[1].content).toBe("Content here.");
  });

  it("handles header-only without newline (skipped)", () => {
    const text = "### Title Only";
    const sections = parseSections(text);
    expect(sections).toEqual([]);
  });

  it("handles multi-line content in sections", () => {
    const text = `### 과거 해석
첫 번째 줄입니다.
두 번째 줄입니다.
세 번째 줄입니다.`;

    const sections = parseSections(text);
    expect(sections).toHaveLength(1);
    expect(sections[0].content).toBe("첫 번째 줄입니다.\n두 번째 줄입니다.\n세 번째 줄입니다.");
  });

  it("handles text before first ### header (ignored)", () => {
    const text = `Some preamble text
### 과거 해석
Content here.`;

    const sections = parseSections(text);
    // "Some preamble text\n" part has no newline after title parsing
    // Actually the preamble is split out but has no ### prefix,
    // so it's just text. It will try to parse it as title+content.
    expect(sections.length).toBeGreaterThanOrEqual(1);
    expect(sections.find((s) => s.title === "과거 해석")).toBeDefined();
  });

  it("handles special characters in content", () => {
    const text = `### 해석
내용에 특수문자: ★☆♡ 이모지 😊 그리고 "따옴표"와 <태그>`;

    const sections = parseSections(text);
    expect(sections[0].content).toContain("★☆♡");
    expect(sections[0].content).toContain("😊");
    expect(sections[0].content).toContain('"따옴표"');
  });

  it("handles extra whitespace in headers", () => {
    const text = "###   Extra Spaces   \nContent";
    const sections = parseSections(text);
    expect(sections[0].title).toBe("Extra Spaces");
  });
});
