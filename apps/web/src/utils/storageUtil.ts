import CryptoJS from "crypto-js";
import LZString from "lz-string";

const ENCRYPTION_KEY = "jeomhana-storage-v1";

export const storageUtil = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const decrypted = CryptoJS.AES.decrypt(raw, ENCRYPTION_KEY).toString(
        CryptoJS.enc.Utf8,
      );
      if (!decrypted) return null;

      const decompressed = LZString.decompressFromBase64(decrypted);
      if (!decompressed) return null;

      return JSON.parse(decompressed) as T;
    } catch {
      console.warn(`[storageUtil] Failed to read key "${key}"`);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      const compressed = LZString.compressToBase64(json);
      const encrypted = CryptoJS.AES.encrypt(
        compressed,
        ENCRYPTION_KEY,
      ).toString();
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error(`[storageUtil] Failed to write key "${key}"`, e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};
