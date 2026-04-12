import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import BrowsePage from './pages/BrowsePage';
import ResourcesPage from './pages/ResourcesPage';
import SchedulePage from './pages/SchedulePage';
import ResourceTypesPage from './pages/ResourceTypesPage';
import AdminReservationsPage from './pages/AdminReservationsPage';
import BranchesPage from './pages/BranchesPage';
import ProfilePage from './pages/ProfilePage';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<BrowsePage />} />  {/* Default authenticated route usually maps to Browse or Dashboard */}
          <Route path="/bookings" element={<Bookings />} />
          {/* Admin routes (could be guarded by role, but simplified for demo) */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/admin/resource-types" element={<ResourceTypesPage />} />
          <Route path="/admin/branches" element={<BranchesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/reservations" element={<AdminReservationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
