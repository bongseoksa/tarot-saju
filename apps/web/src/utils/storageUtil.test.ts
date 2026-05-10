import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/utils/storageUtil";

describe("storageUtil", () => {
  it("encrypts and decrypts data correctly", () => {
    const original = JSON.stringify({ key: "value", num: 42 });
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe("");
  });

  it("handles unicode (Korean) text", () => {
    const original = "오늘의 타로 운세";
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
