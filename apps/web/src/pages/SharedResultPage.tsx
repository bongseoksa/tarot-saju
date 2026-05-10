import { useParams, Link } from "react-router";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

export default function SharedResultPage() {
  const { shareId } = useParams<{ shareId: string }>();

  // TODO: Sprint 2 - fetch shared result from Supabase
  // Placeholder UI matching design mockup structure
  return (
    <div className="px-5 pb-8">
      {/* Logo */}
      <div className="mt-4 text-center">
        <h1 className="text-xl font-bold text-primary">점하나</h1>
      </div>

      {/* Mascot Greeting */}
      <section className="mt-6 flex flex-col items-center">
        <div className="rounded-2xl bg-surface-container-high px-5 py-3">
          <p className="text-sm text-on-surface-variant">
            점하나가 전해준 타로 결과예요...
          </p>
        </div>
        <div className="mt-3 w-24">
          <img src={mascotIdle} alt="점하나 마스코트" className="h-auto w-full" />
        </div>
      </section>

      {/* Card Summary Placeholder */}
      <section className="mt-6">
        <h3 className="text-center text-sm font-semibold text-on-surface">뽑은 카드</h3>
        <div className="mt-3 flex justify-center gap-4">
          {["과거", "현재", "미래"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] text-primary">
                {label}
              </span>
              <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-[#C4A050]/20 border border-[#C4A050]/40">
                <span className="text-xs text-on-surface-variant">?</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Takeaway Placeholder */}
      <section className="mt-6 rounded-2xl bg-primary-container px-4 py-4 text-center">
        <p className="text-sm font-semibold text-on-primary-container">
          공유 결과를 불러오는 중... (ID: {shareId})
        </p>
      </section>

      {/* Timeline Placeholder */}
      <section className="mt-6">
        <h3 className="text-sm font-semibold text-on-surface">상세 풀이</h3>
        <div className="mt-3 space-y-4 border-l-2 border-outline-variant pl-5">
          {["과거", "현재", "미래"].map((label, i) => (
            <div key={label} className="relative">
              <div
                className={`absolute -left-[25px] top-1 size-3 rounded-full border-2 ${
                  i === 1
                    ? "border-primary bg-primary"
                    : "border-outline-variant bg-surface-container-lowest"
                }`}
              />
              <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Sprint 2에서 구현 예정
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Advice Card Placeholder */}
      <section className="mt-6 overflow-hidden rounded-2xl border-2 border-primary">
        <div className="h-1 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <p className="text-sm font-semibold text-on-surface">종합 조언</p>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sprint 2에서 구현 예정
          </p>
        </div>
      </section>

      {/* CTA */}
      <Link
        to="/"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 text-base font-semibold text-on-secondary"
      >
        나도 점 하나 찍어볼까?
        <span className="material-symbols-outlined text-xl">arrow_forward</span>
      </Link>
      <p className="mt-3 text-center text-xs text-on-surface-variant">
        AI 타로 서비스 점하나(JeomHana)
      </p>
    </div>
  );
}
