import { describe, it, expect, beforeEach } from "vitest";
import { createEncryptedStorage } from "@/utils/storageAdapter";

describe("storageAdapter", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storage: any;

  beforeEach(() => {
    localStorage.clear();
    storage = createEncryptedStorage();
  });

  it("stores and retrieves encrypted data", () => {
    const data = JSON.stringify({ results: [{ id: "test" }] });
    storage.setItem("key", data);

    // raw localStorage should be encrypted
    const raw = localStorage.getItem("key");
    expect(raw).not.toBe(data);
    expect(raw).toBeTruthy();

    // retrieval should decrypt
    const retrieved = storage.getItem("key");
    expect(retrieved).toBe(data);
  });

  it("returns null for non-existent key", () => {
    expect(storage.getItem("nonexistent")).toBeNull();
  });

  it("removes item", () => {
    storage.setItem("key", "value");
    storage.removeItem("key");
    expect(storage.getItem("key")).toBeNull();
    expect(localStorage.getItem("key")).toBeNull();
  });

  it("handles corrupted data gracefully", () => {
    // decrypt() returns "" for invalid cipher, so createJSONStorage's
    // JSON.parse("") throws SyntaxError. This verifies the error surfaces.
    localStorage.setItem("corrupted", "not-valid-encrypted-data!!!");
    expect(() => storage.getItem("corrupted")).toThrow(SyntaxError);
  });

  it("handles empty string", () => {
    storage.setItem("empty", "");
    expect(storage.getItem("empty")).toBe("");
  });

  it("handles large data (Korean text)", () => {
    const largeData = "가".repeat(10000);
    storage.setItem("large", largeData);
    expect(storage.getItem("large")).toBe(largeData);
  });
});
