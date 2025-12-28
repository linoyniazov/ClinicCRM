import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import PatientsPage from "./pages/PatientsPage";
import FinancePage from "./pages/FinancePage";
import InventoryPage from "./pages/InventoryPage";
import AiAnalysisPage from "./pages/AiAnalysisPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/ai-analysis" element={<AiAnalysisPage />} />
          <Route path="/book" element={<BookAppointmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
