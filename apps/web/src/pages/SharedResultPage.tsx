import { useParams, Link } from "react-router";

export default function SharedResultPage() {
  const { shareId } = useParams<{ shareId: string }>();

  // TODO: Sprint 2 - fetch shared result from Supabase
  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
      <span className="material-symbols-outlined text-5xl text-primary">
        share
      </span>
      <p className="text-on-surface-variant">
        공유 결과 페이지 (ID: {shareId})
      </p>
      <Link
        to="/"
        className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary"
      >
        나도 점 보러 가기
      </Link>
    </div>
  );
}
