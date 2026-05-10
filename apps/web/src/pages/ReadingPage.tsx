import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { THEMES, TAROT_CARDS } from "@tarot-saju/shared";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardBackUrl, getCardImageUrl, getRandomReversed } from "@/utils/cardUtils";
import mascotIdle from "@/assets/mascot/mascot-idle.png";

export default function ReadingPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { cards, setTheme, addCard, reset } = useReadingStore();

  const theme = THEMES.find((t) => t.id === themeId);

  useEffect(() => {
    if (themeId) setTheme(themeId);
    return () => reset();
  }, [themeId, setTheme, reset]);

  if (!theme) {
    navigate("/", { replace: true });
    return null;
  }

  const selectedCardIds = new Set(cards.map((c) => c.cardId));
  const positionLabels = theme.positions;
  const cardBackUrl = getCardBackUrl();
  const allSelected = cards.length >= 3;

  const handleCardSelect = (cardId: number) => {
    if (allSelected || selectedCardIds.has(cardId)) return;
    addCard({
      cardId,
      positionIndex: cards.length,
      isReversed: getRandomReversed(),
    });
  };

  const handleViewResult = () => {
    const resultId = crypto.randomUUID();
    navigate(`/result/${resultId}`);
  };

  return (
    <div className="flex flex-col px-5 pb-24">
      {/* Mascot Instruction */}
      <section className="mt-2 flex items-start gap-3">
        <div className="w-10 shrink-0">
          <img src={mascotIdle} alt="" className="h-auto w-full rounded-full" />
        </div>
        <div className="rounded-2xl rounded-tl-none bg-surface-container-high px-4 py-3">
          <p className="text-sm text-on-surface">
            세 장의 카드를 신중하게 골라주세요
          </p>
        </div>
      </section>

      {/* Card Slots */}
      <section className="mt-5 flex justify-center gap-4">
        {positionLabels.map((label, i) => {
          const card = cards[i];
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-28 w-20 items-center justify-center overflow-hidden rounded-xl ${
                  card
                    ? "bg-primary-container"
                    : "border-2 border-dashed border-primary/40 bg-surface-container"
                }`}
              >
                {card ? (
                  <img
                    src={getCardImageUrl(card.cardId)}
                    alt=""
                    className={`h-full w-full object-cover ${card.isReversed ? "rotate-180" : ""}`}
                  />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-primary/40">
                    add
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${card ? "text-on-surface" : "text-on-surface-variant"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </section>

      {/* Card Grid */}
      <section className="mt-6 rounded-t-[32px] bg-surface-container-lowest p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {TAROT_CARDS.map((card) => {
            const isSelected = selectedCardIds.has(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card.id)}
                disabled={allSelected || isSelected}
                className={`relative aspect-[2/3] overflow-hidden rounded-xl transition-transform ${
                  isSelected
                    ? "opacity-40 grayscale"
                    : "hover:-translate-y-1 active:scale-95"
                } ${allSelected && !isSelected ? "opacity-60" : ""}`}
                aria-label={`${card.nameKo} 카드 선택`}
              >
                <img
                  src={cardBackUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                    <span className="material-symbols-outlined rounded-full bg-white/20 p-1">
                      check_circle
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-screen-sm bg-surface/80 px-5 py-3 backdrop-blur-sm">
        <button
          onClick={handleViewResult}
          disabled={!allSelected}
          className="w-full rounded-2xl bg-secondary py-4 text-base font-semibold text-on-secondary transition-colors disabled:bg-surface-dim disabled:text-on-surface-variant"
        >
          점 보기 ({cards.length}/3)
        </button>
      </div>
    </div>
  );
}
