import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import './App.css';
import { useInterviewDashboard } from './hooks/useInterviewDashboard';
import { useMasterReport } from './hooks/useMasterReport';
import DashboardLayout from './layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/InterviewPage';
import MasterReportPage from './pages/MasterReportPage';
import PipelinePage from './pages/PipelinePage';
import RecruiterPage from './pages/RecruiterPage';
import SalesPage from './pages/SalesPage';
import { LoginPage } from './pages';
import SettingsPage from './pages/SettingsPage';
import { useAppSelector } from './store/hooks';
import { getDefaultRouteForRole } from './store/authSlice';

function AuthenticatedApp() {
  const dashboard = useInterviewDashboard();
  const masterReport = useMasterReport();

  return (
    <DashboardLayout activeRecords={dashboard.summary.total}>
      <Routes>
        <Route path="/" element={<DashboardPage dashboard={dashboard} />} />
        <Route path="/interviews" element={<InterviewPage dashboard={dashboard} />} />
        <Route path="/pipeline" element={<PipelinePage dashboard={dashboard} />} />
        <Route
          path="/master-report"
          element={<MasterReportPage masterReport={masterReport} />}
        />
        <Route path="/recruiter">
          <Route index element={<Navigate replace to="all" />} />
          <Route path="all" element={<RecruiterPage view="all" />} />
          <Route path="todo" element={<RecruiterPage view="todo" />} />
        </Route>
        <Route path="/sales">
          <Route index element={<Navigate replace to="all" />} />
          <Route path="all" element={<SalesPage view="all" />} />
          <Route path="todo" element={<SalesPage view="todo" />} />
        </Route>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </DashboardLayout>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    return <Navigate replace to={getDefaultRouteForRole(user.role)} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AuthenticatedApp />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
