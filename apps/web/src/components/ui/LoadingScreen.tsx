export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAF9] touch-none pointer-events-none select-none">
      {/* Bouncing Character */}
      <div className="relative mb-[--spacing-lg] flex flex-col items-center">
        <div className="w-32 h-32 flex items-center justify-center animate-[bounce-custom_0.8s_ease-in-out_infinite]">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white rounded-full" />
            <div className="absolute bottom-6 w-8 h-3 bg-white/20 rounded-full" />
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-md" />
          </div>
        </div>
        <div className="w-16 h-3 bg-black/10 blur-sm rounded-[100%] mt-4 animate-[shadow-pulse_0.8s_ease-in-out_infinite]" />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-[--spacing-xs]">
        <h1 className="text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold text-on-surface">
          점하나
        </h1>
        <p className="text-[length:--font-size-sub-text] leading-[1.5] text-on-surface-variant opacity-80">
          당신을 위한 점, 하나 준비 중
        </p>
      </div>

      {/* Dots */}
      <div className="mt-[--spacing-xl] flex gap-[--spacing-xs]">
        <div className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        <div className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:200ms]" />
        <div className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:400ms]" />
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-12 left-0 right-0 flex justify-center opacity-40">
        <span className="text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em] text-on-surface-variant">
          JeomHana AI Tarot System
        </span>
      </div>
    </div>
  );
}
