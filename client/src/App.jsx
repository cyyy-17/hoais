import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Residents = lazy(() => import('./pages/residents/Residents'));
const Dues = lazy(() => import('./pages/dues/Dues'));
const Announcements = lazy(() => import('./pages/announcements/Announcements'));
const Maintenance = lazy(() => import('./pages/maintenance/Maintenance'));
const Facilities = lazy(() => import('./pages/facilities/Facilities'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Settings = lazy(() => import('./pages/settings/Settings'));

import ToastContainer from './components/ui/Toast';
import PrivateRoute from './components/auth/PrivateRoute';
import useUIStore from './store/useUIStore';
import { useEffect } from 'react';

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
    <div style={{ color: 'var(--neu-text-muted)', fontWeight: 'bold' }}>Loading page...</div>
  </div>
);

function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        } />
      
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ErrorBoundary>
            } />
            <Route path="residents" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Residents /></Suspense></ErrorBoundary>
            } />
            <Route path="dues" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Dues /></Suspense></ErrorBoundary>
            } />
            <Route path="announcements" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Announcements /></Suspense></ErrorBoundary>
            } />
            <Route path="maintenance" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Maintenance /></Suspense></ErrorBoundary>
            } />
            <Route path="facilities" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Facilities /></Suspense></ErrorBoundary>
            } />
            <Route path="reports" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Reports /></Suspense></ErrorBoundary>
            } />
            <Route path="settings" element={
              <ErrorBoundary><Suspense fallback={<PageLoader />}><Settings /></Suspense></ErrorBoundary>
            } />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
