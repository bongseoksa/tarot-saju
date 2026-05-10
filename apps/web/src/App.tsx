import { Routes, Route, Navigate } from "react-router";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import ReadingPage from "@/pages/ReadingPage";
import ResultPage from "@/pages/ResultPage";
import HistoryPage from "@/pages/HistoryPage";
import SharedResultPage from "@/pages/SharedResultPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="reading/:themeId" element={<ReadingPage />} />
        <Route path="result/:resultId" element={<ResultPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="shared/:shareId" element={<SharedResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
