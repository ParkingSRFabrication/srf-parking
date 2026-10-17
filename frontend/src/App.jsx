import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import './App.css';

// Public & Common Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Role Dashboards
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage.jsx';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';

// Operator Daily Operations Pages
import { EntryPage } from './pages/EntryPage.jsx';
import { ExitPage } from './pages/ExitPage.jsx';
import { MonthlyPassPage } from './pages/MonthlyPassPage.jsx';
import { TokensPage } from './pages/TokensPage.jsx';
import { PassesPage } from './pages/PassesPage.jsx';
import { VehiclesPage } from './pages/VehiclesPage.jsx';

// Admin Restricted Pages
import { ReportsPage } from './pages/ReportsPage.jsx';
import { TariffsPage } from './pages/TariffsPage.jsx';
import { OperatorsPage } from './pages/OperatorsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Role-Based Route Guard:
 * Blocks users from accessing another role's dashboard or restricted screens by URL tampering.
 * Automatically bounces unauthorized users to their own role's dashboard.
 */
function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const isAllowed = allowedRoles.some(
    r =>
      r === role ||
      (r === 'customer' && role === 'commuter') ||
      (r === 'commuter' && role === 'customer')
  );

  if (!isAllowed) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'operator') return <Navigate to="/operator/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

/**
 * Dynamic Dashboard Resolver:
 * Routes /dashboard to the user's specific role dashboard
 */
function RoleDashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'operator') return <Navigate to="/operator/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Landing Page & User Manual */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/manual" element={<LandingPage />} />

          {/* Dedicated Login & Sign-Up Screen */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Generic /dashboard redirects based on role */}
            <Route path="/dashboard" element={<RoleDashboardRedirect />} />

            {/* 1. ADMIN EXCLUSIVE ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <ReportsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/tariffs"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <TariffsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/operators"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <OperatorsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </RoleRoute>
              }
            />

            {/* 2. OPERATOR & ADMIN DAILY OPERATIONS ROUTES */}
            <Route
              path="/operator/dashboard"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <OperatorDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/entry"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <EntryPage />
                </RoleRoute>
              }
            />
            <Route
              path="/exit"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <ExitPage />
                </RoleRoute>
              }
            />
            <Route
              path="/monthly-pass"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <MonthlyPassPage />
                </RoleRoute>
              }
            />
            <Route
              path="/tokens"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <TokensPage />
                </RoleRoute>
              }
            />
            <Route
              path="/passes"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <PassesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <RoleRoute allowedRoles={['operator', 'admin']}>
                  <VehiclesPage />
                </RoleRoute>
              }
            />

            {/* 3. VEHICLE USER / CUSTOMER ROUTES */}
            <Route
              path="/customer/dashboard"
              element={
                <RoleRoute allowedRoles={['customer', 'commuter', 'admin']}>
                  <CustomerDashboardPage defaultTab="overview" />
                </RoleRoute>
              }
            />
            <Route
              path="/customer/vehicles"
              element={
                <RoleRoute allowedRoles={['customer', 'commuter', 'admin']}>
                  <CustomerDashboardPage defaultTab="vehicles" />
                </RoleRoute>
              }
            />
            <Route
              path="/customer/passes"
              element={
                <RoleRoute allowedRoles={['customer', 'commuter', 'admin']}>
                  <CustomerDashboardPage defaultTab="passes" />
                </RoleRoute>
              }
            />
            <Route
              path="/customer/history"
              element={
                <RoleRoute allowedRoles={['customer', 'commuter', 'admin']}>
                  <CustomerDashboardPage defaultTab="history" />
                </RoleRoute>
              }
            />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}
