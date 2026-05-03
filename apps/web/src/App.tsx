import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import AppLayout from "./components/AppLayout";
import PageTransition from "./components/PageTransition";
import HomePage from "./pages/HomePage";
import ReadingPage from "./pages/ReadingPage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import SharedResultPage from "./pages/SharedResultPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/reading/:themeId" element={<PageTransition><ReadingPage /></PageTransition>} />
        <Route path="/result/:resultId" element={<PageTransition><ResultPage /></PageTransition>} />
        <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
        <Route path="/shared/:shareId" element={<PageTransition><SharedResultPage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AnimatedRoutes />
      </AppLayout>
    </BrowserRouter>
  );
}
