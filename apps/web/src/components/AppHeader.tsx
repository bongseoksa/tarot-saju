import { Link, useLocation, useNavigate, useParams } from "react-router";
import { THEMES } from "@tarot-saju/shared";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isHome = location.pathname === "/";
  const isResult = location.pathname.startsWith("/result");

  const theme = params.themeId
    ? THEMES.find((t) => t.id === params.themeId)
    : null;

  return (
    <header className="flex h-14 items-center justify-between px-5">
      {isHome ? (
        <div className="flex items-center gap-2">
          <img src={mascotIdle} alt="" className="size-7 rounded-full" />
          <h1 className="text-lg font-bold text-primary">점하나</h1>
        </div>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center"
          aria-label="뒤로 가기"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}

      {!isHome && theme && (
        <h2 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-on-surface">
          {theme.title}
        </h2>
      )}

      {isHome && (
        <Link
          to="/history"
          className="flex size-10 items-center justify-center"
          aria-label="히스토리"
        >
          <span className="material-symbols-outlined">history</span>
        </Link>
      )}

      {isResult && (
        <button
          className="flex size-10 items-center justify-center"
          aria-label="공유하기"
        >
          <span className="material-symbols-outlined">share</span>
        </button>
      )}
    </header>
  );
}
