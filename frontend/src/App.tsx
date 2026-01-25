import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import SchedulePage from './pages/SchedulePage';
import ServicesPage from './pages/ServicesPage';
import InventoryPage from './pages/InventoryPage';
import FinancePage from './pages/FinancePage';
import AiAnalysisPage from './pages/AiAnalysisPage';
import LoginPage from './pages/LoginPage';
import { isAuthenticated } from './services/auth';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes - Wrapped in Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Redirect root to dashboard */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="patients" element={<PatientsPage />} />
                    <Route path="patients/:id" element={<PatientProfilePage />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="finance" element={<FinancePage />} />
                    <Route path="ai-analysis" element={<AiAnalysisPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;