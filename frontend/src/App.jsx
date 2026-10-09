import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

// Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { EntryPage } from './pages/EntryPage.jsx';
import { ExitPage } from './pages/ExitPage.jsx';
import { MonthlyPassPage } from './pages/MonthlyPassPage.jsx';
import { TokensPage } from './pages/TokensPage.jsx';
import { PassesPage } from './pages/PassesPage.jsx';
import { VehiclesPage } from './pages/VehiclesPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { TariffsPage } from './pages/TariffsPage.jsx';
import { OperatorsPage } from './pages/OperatorsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="entry" element={<EntryPage />} />
            <Route path="exit" element={<ExitPage />} />
            <Route path="monthly-pass" element={<MonthlyPassPage />} />
            <Route path="tokens" element={<TokensPage />} />
            <Route path="passes" element={<PassesPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />

            {/* Admin Restricted Screens */}
            <Route path="reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
            <Route path="tariffs" element={<AdminRoute><TariffsPage /></AdminRoute>} />
            <Route path="operators" element={<AdminRoute><OperatorsPage /></AdminRoute>} />
            <Route path="settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
            <Route path="audit-logs" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
