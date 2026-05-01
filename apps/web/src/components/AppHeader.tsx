import { useNavigate } from "react-router";
import Icon from "./ui/Icon";
import type { ReactNode } from "react";

interface HomeHeaderProps {
  variant: "home";
}

interface SubHeaderProps {
  variant: "sub";
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

type AppHeaderProps = HomeHeaderProps | SubHeaderProps;

export default function AppHeader(props: AppHeaderProps) {
  const navigate = useNavigate();

  if (props.variant === "home") {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex justify-between items-center px-4 h-16 w-full max-w-md mx-auto">
          <div className="text-xl font-black text-zinc-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span>점하나</span>
          </div>
          <button
            className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors"
            onClick={() => navigate("/history")}
          >
            <Icon name="history" />
          </button>
        </div>
      </header>
    );
  }

  const { title, onBack, rightAction } = props;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-md mx-auto">
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-colors"
          onClick={onBack ?? (() => navigate(-1))}
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-zinc-900">
          {title}
        </h1>
        {rightAction ?? <div className="w-10 h-10" />}
      </div>
    </header>
  );
}
