import { useNavigate } from "react-router";
import AppHeader from "../components/AppHeader";
import CardSummary from "../components/result/CardSummary";
import InterpretationCard from "../components/result/InterpretationCard";
import AdviceCard from "../components/result/AdviceCard";
import Icon from "../components/ui/Icon";

// Mock data for Phase 2 — will be replaced with real data in Phase 3
const MOCK_CARDS = [
  { position: "과거", cardId: 0, cardName: "0. 광대", isReversed: false },
  { position: "현재", cardId: 6, cardName: "6. 연인", isReversed: false },
  { position: "미래", cardId: 17, cardName: "17. 별", isReversed: true },
];

const MOCK_INTERPRETATIONS = [
  {
    icon: "history",
    title: "과거의 흐름",
    body: "당신은 최근 새로운 시작을 위해 많은 것을 내려놓았습니다. '광대' 카드는 당신이 가졌던 순수한 열정과 두려움 없는 도전을 상징합니다.",
  },
  {
    icon: "favorite",
    title: "현재의 상황",
    body: "현재 당신의 중심에는 '관계'와 '선택'이 놓여 있습니다. '연인' 카드는 조화로운 결합을 의미하며, 주변 사람들과의 긍정적인 상호작용이 당신에게 큰 에너지를 주고 있습니다.",
    highlight: true,
  },
  {
    icon: "auto_awesome",
    title: "미래의 가능성",
    body: "머지않아 당신의 목표가 뚜렷해지고 희망적인 소식이 찾아올 것입니다. '별' 카드는 치유와 영감을 상징합니다.",
  },
];

const MOCK_ADVICE = {
  advice:
    "너무 멀리 보려 하기보다, 지금 당신 곁에 있는 소중한 사람들의 손을 꼭 잡아보세요.",
  summary: "마음이 이끄는 대로, 사랑을 선택하세요.",
};

export default function ResultPage() {
  const navigate = useNavigate();

  const shareButton = (
    <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-colors">
      <Icon name="share" />
    </button>
  );

  return (
    <>
      <AppHeader
        variant="sub"
        title="오늘의 운세 결과"
        rightAction={shareButton}
      />
      <main className="max-w-[448px] mx-auto px-[--spacing-container-padding] pt-[--spacing-lg] pb-40 space-y-[--spacing-lg]">
        <CardSummary cards={MOCK_CARDS} />

        {/* Mascot Indicator */}
        <div className="flex items-center gap-[--spacing-sm]">
          <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div className="bg-white px-[--spacing-md] py-[--spacing-sm] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm border border-zinc-100">
            <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant">
              점하나가 당신의 카드를 읽고 있어요...
            </p>
          </div>
        </div>

        {/* Interpretation Cards */}
        <section className="space-y-[--spacing-md]">
          {MOCK_INTERPRETATIONS.map((interp) => (
            <InterpretationCard
              key={interp.title}
              icon={interp.icon}
              title={interp.title}
              body={interp.body}
              highlight={interp.highlight}
            />
          ))}
          <AdviceCard advice={MOCK_ADVICE.advice} summary={MOCK_ADVICE.summary} />
        </section>

        {/* Ad Banner */}
        <section className="w-full py-[--spacing-md]">
          <div className="bg-zinc-100 rounded-xl h-24 flex items-center justify-center border border-zinc-200 border-dashed">
            <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-zinc-400 uppercase tracking-widest">
              Advertisement
            </span>
          </div>
        </section>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md px-6 pb-8 pt-4 max-w-[448px] mx-auto space-y-3 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-zinc-50">
        <div className="flex gap-3">
          <button className="flex-1 h-14 bg-white border border-violet-200 text-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-violet-50 transition-colors active:scale-95 duration-200">
            <Icon name="share" />
            공유하기
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-[2] h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(107,56,212,0.2)] hover:bg-primary/90 active:scale-95 transition-colors duration-200"
          >
            점 하나 더 찍어볼까?
            <Icon name="arrow_forward" />
          </button>
        </div>
      </footer>
    </>
  );
}
