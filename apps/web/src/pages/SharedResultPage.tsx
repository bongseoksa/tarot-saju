import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getSharedReading, type SharedReading } from "@/lib/shareService";
import { getCardById, getCardImageUrl } from "@/utils/cardUtils";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

const SECTION_LABELS = ["과거 해석", "현재 해석", "미래 해석", "종합 조언"];

function parseSections(text: string) {
  const sections: { title: string; content: string }[] = [];
  const parts = text.split(/^###\s+/m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    sections.push({
      title: part.slice(0, newline).trim(),
      content: part.slice(newline + 1).trim(),
    });
  }
  return sections;
}

export default function SharedResultPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [reading, setReading] = useState<SharedReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    if (!shareId) return;
    getSharedReading(shareId)
      .then((data) => {
        if (data) setReading(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 pt-20">
        <div className="w-20">
          <img src={mascotIdle} alt="" className="h-auto w-full animate-pulse" />
        </div>
        <p className="text-sm text-on-surface-variant">결과를 불러오는 중이에요</p>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 pt-20 text-center">
        <span className="material-symbols-outlined text-5xl text-error">error</span>
        <p className="text-on-surface-variant">
          결과를 찾을 수 없어요.
          <br />만료되었거나 잘못된 링크예요.
        </p>
        <Link to="/" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary">
          점하나 시작하기
        </Link>
      </div>
    );
  }

  const positionLabels = ["과거", "현재", "미래"];
  const sections = parseSections(reading.interpretation);

  return (
    <div className="px-5 pb-8">
      {/* Logo */}
      <div className="mt-4 text-center">
        <Link to="/" className="text-xl font-bold text-primary">점하나</Link>
      </div>

      {/* Mascot Bubble */}
      <section className="mt-5 flex items-start gap-3">
        <div className="w-10 shrink-0">
          <img src={mascotIdle} alt="" className="h-auto w-full rounded-full" />
        </div>
        <div className="rounded-2xl rounded-tl-none bg-surface-container-high px-4 py-3">
          <p className="text-sm text-on-surface-variant">
            {reading.theme_title} 결과를 공유받으셨어요
          </p>
        </div>
      </section>

      {/* Card Summary */}
      <section className="mt-5 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex justify-center gap-5">
          {reading.cards.map((dc, i) => {
            const card = getCardById(dc.cardId);
            if (!card) return null;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-on-surface-variant">{positionLabels[i]}</span>
                <div className="h-24 w-16 overflow-hidden rounded-lg border border-outline-variant">
                  <img
                    src={getCardImageUrl(dc.cardId)}
                    alt={card.nameKo}
                    className={`h-full w-full object-cover ${dc.isReversed ? "rotate-180" : ""}`}
                  />
                </div>
                <span className="text-xs font-medium text-on-surface">{card.nameKo}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    dc.isReversed
                      ? "bg-secondary-container text-secondary"
                      : "bg-primary-container text-primary"
                  }`}
                >
                  {dc.isReversed ? "역방향" : "정방향"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* One-line Takeaway */}
      {reading.summary && (
        <section className="mt-5 flex items-start gap-2 rounded-2xl bg-primary-container px-4 py-4">
          <span className="material-symbols-outlined text-xl text-primary">auto_awesome</span>
          <p className="text-sm font-semibold leading-relaxed text-on-primary-container">
            {reading.summary}
          </p>
        </section>
      )}

      {/* Accordion Sections */}
      <section className="mt-5 space-y-3">
        {(sections.length > 0 ? sections : SECTION_LABELS.map((t) => ({ title: t, content: "" }))).map(
          (sec, i) => {
            const isOpen = openSection === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
                <button
                  onClick={() => setOpenSection(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-on-surface">{sec.title}</span>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {isOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-l-2 border-primary mx-4 mb-4 pl-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                      {sec.content}
                    </p>
                  </div>
                )}
              </div>
            );
          },
        )}
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
