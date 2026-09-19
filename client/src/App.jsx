import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import Residents from './pages/residents/Residents';
import Dues from './pages/dues/Dues';
import Announcements from './pages/announcements/Announcements';
import Maintenance from './pages/maintenance/Maintenance';
import Facilities from './pages/facilities/Facilities';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

import ToastContainer from './components/ui/Toast';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="dues" element={<Dues />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      </Routes>
    </>
  );
}

export default App;
