import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PendingSession } from "@tarot-saju/shared";
import { createStorageAdapter } from "./createStorageAdapter";

const MAX_SESSIONS = 3;

function isToday(dateStr: string): boolean {
  const created = new Date(dateStr);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  );
}

interface PendingState {
  sessions: PendingSession[];

  addSession: (session: PendingSession) => void;
  removeSession: (id: string) => void;
  getActiveSessions: () => PendingSession[];
  clearExpired: () => void;
  clearAll: () => void;
}

export const usePendingStore = create<PendingState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => {
          const updated = [...state.sessions, session];
          // FIFO: if over max, remove oldest (first in array)
          if (updated.length > MAX_SESSIONS) {
            return { sessions: updated.slice(updated.length - MAX_SESSIONS) };
          }
          return { sessions: updated };
        }),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      getActiveSessions: () => get().sessions.filter((s) => isToday(s.createdAt)),

      clearExpired: () =>
        set((state) => ({
          sessions: state.sessions.filter((s) => isToday(s.createdAt)),
        })),

      clearAll: () => set({ sessions: [] }),
    }),
    {
      name: "pending_sessions",
      storage: createJSONStorage(() => createStorageAdapter()),
    },
  ),
);
