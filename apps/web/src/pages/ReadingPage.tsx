import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { THEMES, TAROT_CARDS } from "@tarot-saju/shared";
import { useReadingStore } from "@/stores/useReadingStore";
import { getCardBackUrl, getCardImageUrl, getRandomReversed } from "@/utils/cardUtils";

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
    <div className="px-4 pb-8">
      {/* Slots */}
      <section className="mt-2 flex justify-center gap-4">
        {positionLabels.map((label, i) => {
          const card = cards[i];
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex h-28 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant bg-surface-container">
                {card ? (
                  <img
                    src={getCardImageUrl(card.cardId)}
                    alt=""
                    className={`h-full w-full object-cover ${card.isReversed ? "rotate-180" : ""}`}
                  />
                ) : (
                  <span className="text-2xl text-outline-variant">?</span>
                )}
              </div>
              <span className="text-xs text-on-surface-variant">{label}</span>
            </div>
          );
        })}
      </section>

      {/* Card Grid */}
      <section className="mt-6 grid grid-cols-4 gap-2">
        {TAROT_CARDS.map((card) => {
          const isSelected = selectedCardIds.has(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleCardSelect(card.id)}
              disabled={allSelected || isSelected}
              className={`relative aspect-[2/3] overflow-hidden rounded-lg transition-transform ${
                isSelected ? "opacity-40" : "hover:scale-105 active:scale-95"
              } ${allSelected && !isSelected ? "opacity-60" : ""}`}
              aria-label={`${card.nameKo} 카드 선택`}
            >
              <img
                src={cardBackUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="material-symbols-outlined text-white">
                    check_circle
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </section>

      {/* CTA */}
      <div className="mt-6">
        <button
          onClick={handleViewResult}
          disabled={!allSelected}
          className="w-full rounded-2xl bg-secondary py-4 text-base font-semibold text-on-secondary transition-colors disabled:bg-surface-dim disabled:text-on-surface-variant"
        >
          점 보기
        </button>
      </div>
    </div>
  );
}
