interface ErrorModalProps {
  onHome: () => void;
  onRetry: () => void;
}

export default function ErrorModal({ onHome, onRetry }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-[--spacing-container-padding]">
      <div className="bg-white w-full max-w-xs rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(107,56,212,0.15)] flex flex-col items-center p-[--spacing-xl] text-center">
        {/* Character */}
        <div className="mb-[--spacing-lg] relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-2xl" />
          <div className="relative z-10 w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white rounded-full -translate-y-1" />
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white rounded-full -translate-y-1" />
            <div className="absolute bottom-6 w-6 h-2 border-b-2 border-white/60 rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-[--spacing-sm] mb-[--spacing-xl]">
          <h2 className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-on-surface">
            죄송해요!
          </h2>
          <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant px-[--spacing-sm]">
            일시적으로 해석을 불러오지 못했어요.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-[--spacing-sm]">
          <button
            className="w-full py-[--spacing-md] bg-primary text-on-primary text-[length:--font-size-section-header] leading-[1.4] font-semibold rounded-xl active:scale-95 transition-transform"
            onClick={onHome}
          >
            홈으로 돌아가기
          </button>
          <button
            className="w-full py-[--spacing-sm] bg-transparent text-outline text-[length:--font-size-sub-text] leading-[1.5] hover:text-primary transition-colors"
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
