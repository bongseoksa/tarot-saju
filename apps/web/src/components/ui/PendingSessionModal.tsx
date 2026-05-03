import type { PendingSession } from "@tarot-saju/shared";

interface PendingSessionModalProps {
  sessions: PendingSession[];
  onResume: (sessionId: string) => void;
  onClose: () => void;
  onSuppress: () => void;
}

export default function PendingSessionModal({
  sessions,
  onResume,
  onClose,
  onSuppress,
}: PendingSessionModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          이어서 볼 수 있는 결과가 있어요
        </h2>

        <ul className="space-y-3 mb-6">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between border border-zinc-100 rounded-xl p-3"
            >
              <span className="text-sm font-medium text-zinc-800">
                {session.themeTitle}
              </span>
              <button
                onClick={() => onResume(session.id)}
                className="text-sm font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10"
              >
                이어서 보기
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              onChange={onSuppress}
              className="rounded border-zinc-300"
            />
            더 이상 보지 않기
          </label>
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 px-3 py-1.5"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
