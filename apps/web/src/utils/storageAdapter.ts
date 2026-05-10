import { createJSONStorage } from "zustand/middleware";
import { encrypt, decrypt } from "@/utils/storageUtil";

export function createEncryptedStorage() {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return decrypt(raw);
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      localStorage.setItem(name, encrypt(value));
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  }));
}
