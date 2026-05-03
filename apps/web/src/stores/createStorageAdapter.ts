import type { StateStorage } from "zustand/middleware";
import { storageUtil } from "../utils/storageUtil";

export function createStorageAdapter(): StateStorage {
  return {
    getItem: (name) => {
      return storageUtil.get<string>(name) ?? null;
    },
    setItem: (name, value) => {
      storageUtil.set(name, value);
    },
    removeItem: (name) => {
      storageUtil.remove(name);
    },
  };
}
