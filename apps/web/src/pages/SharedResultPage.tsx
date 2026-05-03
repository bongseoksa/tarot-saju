import { useNavigate } from "react-router";
import TarotCardImage from "../components/ui/TarotCardImage";
import Icon from "../components/ui/Icon";
import TimelineInterpretation from "../components/shared/TimelineInterpretation";

// Mock data for Phase 2
const MOCK_CARDS = [
  { position: "과거", cardId: 0, cardName: "The Fool" },
  { position: "현재", cardId: 6, cardName: "The Lovers" },
  { position: "미래", cardId: 17, cardName: "The Star" },
];

const MOCK_TIMELINE = [
  {
    position: "과거",
    title: "새로운 시작",
    body: "무언가를 새롭게 시작하려던 순수한 에너지가 가득했습니다. 결과보다는 과정 자체에서 즐거움을 찾던 시기였네요.",
  },
  {
    position: "현재",
    title: "선택의 순간",
    body: "중요한 선택의 기로에 서 있습니다. 머리보다는 마음이 이끄는 대로, 조화로운 관계를 우선시하는 것이 좋습니다.",
    highlight: true,
  },
  {
    position: "미래",
    title: "희망의 발견",
    body: "길었던 고민이 해결되고 명확한 비전이 보이기 시작합니다. 당신의 노력은 곧 밝은 빛으로 보상받을 거예요.",
  },
];

export default function SharedResultPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[448px] mx-auto bg-white min-h-screen shadow-xl flex flex-col">
      {/* Logo Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50 flex justify-center items-center px-4 h-16 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-xl font-black text-zinc-900 font-['Plus_Jakarta_Sans']">
            점하나
          </span>
        </div>
      </header>

      <main className="flex-grow p-[--spacing-container-padding] pb-32">
        {/* Greeting Bubble */}
        <div className="flex items-start gap-3 mb-[--spacing-xl]">
          <div className="w-10 h-10 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
          </div>
          <div className="bg-white border border-zinc-100 p-[--spacing-md] rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
            <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface">
              점하나가 전해준 타로 결과예요.
              <br />
              당신의 고민에 작은 점 하나가 찍혔길 바라요.
            </p>
          </div>
        </div>

        {/* Card Summary */}
        <section className="mb-[--spacing-xl]">
          <div className="grid grid-cols-3 gap-[--spacing-gutter]">
            {MOCK_CARDS.map((card, i) => {
              const isCurrent = i === 1;
              return (
                <div
                  key={card.cardId}
                  className="flex flex-col items-center gap-[--spacing-xs]"
                >
                  <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-500">
                    {card.position}
                  </span>
                  <div
                    className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-white ${
                      isCurrent ? "scale-110 z-10" : ""
                    }`}
                  >
                    <TarotCardImage cardId={card.cardId} />
                  </div>
                  <span
                    className={`text-[length:--font-size-caption] leading-[1.4] font-semibold text-center ${
                      isCurrent ? "text-zinc-900" : "text-zinc-700"
                    }`}
                  >
                    {card.cardName}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* One-line Summary */}
        <div className="bg-primary-fixed-dim/20 border border-primary-fixed-dim rounded-2xl p-[--spacing-lg] mb-[--spacing-xl] text-center">
          <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] font-bold text-primary mb-[--spacing-xs] block">
            오늘의 한 줄 요약
          </span>
          <h2 className="text-[length:--font-size-display-title] leading-tight tracking-[-0.02em] font-bold text-on-surface-variant">
            "망설임은 끝내고,
            <br />
            진심이 닿는 방향으로 움직이세요."
          </h2>
        </div>

        {/* Timeline Interpretation */}
        <TimelineInterpretation items={MOCK_TIMELINE} />

        {/* Advice Card */}
        <div className="bg-surface-container rounded-2xl p-[--spacing-lg] mt-[--spacing-xl]">
          <div className="flex items-center gap-2 mb-[--spacing-sm]">
            <Icon name="lightbulb" size={24} className="text-primary" />
            <h3 className="text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold text-on-surface">
              점하나의 조언
            </h3>
          </div>
          <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant">
            지금 가장 필요한 것은 스스로에 대한 믿음입니다. 타인의 시선보다는
            당신이 느끼는 행복의 가치에 집중하세요.
          </p>
        </div>
      </main>

      {/* Bottom CTA */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] p-[--spacing-container-padding] bg-gradient-to-t from-white via-white to-transparent z-50">
        <button
          onClick={() => navigate("/")}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[length:--font-size-display-title] leading-[1.4] shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          나도 점 하나 찍어볼까?
          <Icon name="arrow_forward" size={20} />
        </button>
        <p className="text-center text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400 mt-[--spacing-sm]">
          AI 타로 서비스 점하나(JeomHana)
        </p>
      </footer>
    </div>
  );
}
