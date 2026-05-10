import mascotSleep from "@/assets/mascot/mascot-sleep.png";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div className="w-48 sm:w-56">
          <img src={mascotSleep} alt="로딩 중 마스코트" className="h-auto w-full" />
        </div>
        <p className="mt-6 text-xl font-bold text-on-surface">
          당신을 위한 점, 하나 준비 중
        </p>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          <span className="size-2 animate-[blink_1.4s_infinite_0s] rounded-full bg-primary" />
          <span className="size-2 animate-[blink_1.4s_infinite_0.2s] rounded-full bg-primary" />
          <span className="size-2 animate-[blink_1.4s_infinite_0.4s] rounded-full bg-primary" />
        </div>
        <span className="sr-only">운세를 불러오는 중입니다</span>
      </div>

      {/* Ad Area */}
      <div className="relative mx-5 mb-5 rounded-2xl border border-outline-variant bg-[#F0F0F0] py-8 text-center">
        <span className="absolute left-3 top-2 rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant">
          광고
        </span>
        <p className="text-sm text-on-surface-variant">스폰서 콘텐츠 배너 영역</p>
      </div>
    </div>
  );
}
