import { Link, useLocation, useNavigate } from "react-router";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <header className="flex h-14 items-center justify-between px-4">
      {isHome ? (
        <h1 className="text-lg font-bold text-primary">점하나</h1>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center"
          aria-label="뒤로 가기"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
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
    </header>
  );
}
