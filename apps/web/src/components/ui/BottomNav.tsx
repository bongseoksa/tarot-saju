import { useLocation, useNavigate } from "react-router";
import Icon from "./Icon";

const TABS = [
  { path: "/", icon: "home", label: "홈" },
  { path: "/reading", icon: "style", label: "타로" },
  { path: "/history", icon: "history", label: "히스토리" },
  { path: "/profile", icon: "person", label: "내정보" },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="max-w-md mx-auto bg-white rounded-t-3xl border-t border-zinc-100
                    shadow-[0_-4px_20px_rgba(139,92,246,0.06)]
                    flex justify-around items-center px-6 pb-6 pt-3"
      >
        {TABS.map((tab) => {
          const isActive = tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={
                isActive
                  ? "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl bg-violet-50 text-violet-500 transition-colors"
                  : "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-zinc-400 hover:text-violet-400 transition-colors"
              }
            >
              <Icon name={tab.icon} size={24} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
