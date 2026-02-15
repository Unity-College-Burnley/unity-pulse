// ============================================================
// App — root component with routing
// Routes users to the correct dashboard based on their role.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationGuardProvider } from './context/NavigationGuardContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import StudentProfile from './pages/StudentProfile';
import StudentSearch from './pages/StudentSearch';
import type { ReactNode } from 'react';

/** Redirect to login if not authenticated */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/** Redirect away from login if already authenticated */
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** Renders the correct dashboard based on the user's role */
function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'teacher') {
    return <StaffDashboard />;
  }

  return <ParentDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/:studentId" element={<StudentProfile />} />
        <Route path="/student-search" element={<StudentSearch />} />
        <Route path="/messages" element={<Messages />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={BASE}>
      <NavigationGuardProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </NavigationGuardProvider>
    </BrowserRouter>
  );
}
