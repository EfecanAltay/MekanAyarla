import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/layout/AppLayout';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const ResourceTypesPage = lazy(() => import('./pages/ResourceTypesPage'));
const AdminReservationsPage = lazy(() => import('./pages/AdminReservationsPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicBookingPage = lazy(() => import('./pages/PublicBookingPage'));

const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/book/:resourceId" element={<PublicBookingPage />} />
          <Route path="/public/booking/:resourceId" element={<PublicBookingPage />} />

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
    </Suspense>
  );
}

export default App;
