import { Outlet } from "react-router";
import AppHeader from "@/components/AppHeader";

export default function AppLayout() {
  return (
    <div className="relative mx-auto min-h-dvh max-w-screen-sm bg-surface">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
