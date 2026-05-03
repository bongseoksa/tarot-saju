import { describe, it, expect, beforeEach } from "vitest";
import { storageUtil } from "./storageUtil";

describe("storageUtil", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("set and get", () => {
    it("should store and retrieve a string value", () => {
      storageUtil.set("test-key", "hello");
      expect(storageUtil.get<string>("test-key")).toBe("hello");
    });

    it("should store and retrieve an object value", () => {
      const data = { name: "tarot", count: 3, nested: { a: 1 } };
      storageUtil.set("obj-key", data);
      expect(storageUtil.get("obj-key")).toEqual(data);
    });

    it("should store and retrieve an array value", () => {
      const data = [1, "two", { three: 3 }];
      storageUtil.set("arr-key", data);
      expect(storageUtil.get("arr-key")).toEqual(data);
    });

    it("should store and retrieve boolean/number/null values", () => {
      storageUtil.set("bool", true);
      storageUtil.set("num", 42);
      expect(storageUtil.get<boolean>("bool")).toBe(true);
      expect(storageUtil.get<number>("num")).toBe(42);
    });
  });

  describe("encryption", () => {
    it("should not store plaintext in localStorage", () => {
      const secret = { password: "super-secret-data-12345" };
      storageUtil.set("encrypted", secret);

      const raw = localStorage.getItem("encrypted");
      expect(raw).not.toBeNull();
      // Raw value must not contain the plaintext
      expect(raw).not.toContain("super-secret-data-12345");
      expect(raw).not.toContain("password");
    });

    it("should store a base64-like encoded string", () => {
      storageUtil.set("b64", { data: "test" });
      const raw = localStorage.getItem("b64");
      expect(raw).not.toBeNull();
      // Should be a non-empty string (base64 encoded)
      expect(typeof raw).toBe("string");
      expect(raw!.length).toBeGreaterThan(0);
    });
  });

  describe("get edge cases", () => {
    it("should return null for non-existent key", () => {
      expect(storageUtil.get("missing")).toBeNull();
    });

    it("should return null for corrupted data", () => {
      localStorage.setItem("corrupted", "not-valid-encrypted-data!!!");
      expect(storageUtil.get("corrupted")).toBeNull();
    });

    it("should return null for empty string value", () => {
      localStorage.setItem("empty", "");
      expect(storageUtil.get("empty")).toBeNull();
    });
  });

  describe("remove", () => {
    it("should remove a stored key", () => {
      storageUtil.set("to-remove", "value");
      expect(storageUtil.get("to-remove")).toBe("value");

      storageUtil.remove("to-remove");
      expect(storageUtil.get("to-remove")).toBeNull();
      expect(localStorage.getItem("to-remove")).toBeNull();
    });

    it("should not throw when removing non-existent key", () => {
      expect(() => storageUtil.remove("non-existent")).not.toThrow();
    });
  });

  describe("roundtrip with complex data", () => {
    it("should handle large objects without data loss", () => {
      const largeData = {
        results: Array.from({ length: 20 }, (_, i) => ({
          id: `result-${i}`,
          themeId: `theme-${i}`,
          interpretation: `Interpretation text ${i} `.repeat(50),
          summary: `Summary ${i}`,
          createdAt: new Date().toISOString(),
          cards: [
            { cardId: i, positionIndex: 0, isReversed: false },
            { cardId: i + 1, positionIndex: 1, isReversed: true },
            { cardId: i + 2, positionIndex: 2, isReversed: false },
          ],
        })),
      };

      storageUtil.set("large", largeData);
      expect(storageUtil.get("large")).toEqual(largeData);
    });
  });
});
