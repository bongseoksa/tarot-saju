import { describe, it, expect } from "vitest";
import { getCardById, getRandomReversed } from "@/utils/cardUtils";

describe("cardUtils", () => {
  it("getCardById returns correct card", () => {
    const fool = getCardById(0);
    expect(fool).toBeDefined();
    expect(fool!.name).toBe("The Fool");
    expect(fool!.nameKo).toBe("광대");
  });

  it("getCardById returns undefined for invalid id", () => {
    expect(getCardById(999)).toBeUndefined();
  });

  it("getRandomReversed returns boolean", () => {
    const result = getRandomReversed();
    expect(typeof result).toBe("boolean");
  });
});
