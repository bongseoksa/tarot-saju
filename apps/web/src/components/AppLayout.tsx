import type { ReactNode } from "react";
import { useLocation } from "react-router";
import BottomNav from "./ui/BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

const BOTTOM_NAV_PATHS = ["/", "/history"];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const showBottomNav = BOTTOM_NAV_PATHS.includes(location.pathname);

  return (
    <div className="bg-background text-on-background min-h-screen">
      {children}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
