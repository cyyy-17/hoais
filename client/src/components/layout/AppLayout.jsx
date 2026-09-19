import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, DollarSign, Bell, Settings, LogOut, 
  Wrench, Calendar, FileText, Menu, ChevronLeft 
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import useToastStore from '../../store/useToastStore';
import Avatar from '../ui/Avatar';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const addToast = useToastStore((state) => state.addToast);

  const mainNav = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Residents', path: '/residents', icon: Users },
    { name: 'Dues', path: '/dues', icon: DollarSign },
    { name: 'Announcements', path: '/announcements', icon: Bell },
  ];

  const managementNav = [
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Facilities', path: '/facilities', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    addToast('You have been logged out.', 'info');
    navigate('/login');
  };

  const NavItem = ({ item }) => (
    <Link
      to={item.path}
      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
      title={sidebarCollapsed ? item.name : undefined}
    >
      <item.icon size={22} style={{ flexShrink: 0 }} />
      {!sidebarCollapsed && <span>{item.name}</span>}
    </Link>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', height: '40px' }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="white" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--neu-primary)' }}>
                HOA Sys
              </span>
            </div>
          )}
          
          <button 
            className="neu-button icon-only" 
            onClick={toggleSidebar}
            style={{ padding: '8px', boxShadow: 'none', margin: sidebarCollapsed ? '0 auto' : '0' }}
          >
            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!sidebarCollapsed && <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neu-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 16px', marginBottom: '4px' }}>Main</div>}
            {mainNav.map(item => <NavItem key={item.path} item={item} />)}
          </nav>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!sidebarCollapsed && <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neu-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 16px', marginBottom: '4px' }}>Management</div>}
            {managementNav.map(item => <NavItem key={item.path} item={item} />)}
          </nav>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '2px solid rgba(255, 255, 255, 0.4)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavItem item={{ name: 'Settings', path: '/settings', icon: Settings }} />
          <a href="#" onClick={handleLogout} className="nav-link" style={{ color: 'var(--neu-danger)' }} title={sidebarCollapsed ? "Logout" : undefined}>
            <LogOut size={22} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Logout</span>}
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>
              {[...mainNav, ...managementNav, {path: '/settings', name: 'Settings'}].find(i => i.path === location.pathname)?.name || 'Welcome'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button className="neu-button icon-only" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', backgroundColor: 'var(--neu-danger)', borderRadius: '50%', border: '2px solid var(--neu-bg)' }} />
            </button>
            
            <div className="neu-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '100px' }}>
              <Avatar name={user?.name || 'Admin User'} size={36} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user?.name || 'Admin User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neu-text-muted)', fontWeight: '600' }}>{user?.role?.replace('_', ' ') || 'Super Admin'}</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content with View Transition capability */}
        <div style={{ flex: 1, backgroundColor: 'transparent', display: 'flex', flexDirection: 'column' }} className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
