import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, Users, DollarSign, Bell, Settings, LogOut, 
  Wrench, Calendar, FileText, Menu, ChevronLeft, Moon, Sun 
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import useToastStore from '../../store/useToastStore';
import Avatar from '../ui/Avatar';
import api from '../../api';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, toggleMobileMenu, closeMobileMenu, theme, toggleTheme } = useUIStore();
  const addToast = useToastStore((state) => state.addToast);

  const [alerts, setAlerts] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/reports/alerts');
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };
    if (user) {
      fetchAlerts();
    }
  }, [user]);

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
      onClick={closeMobileMenu}
    >
      <item.icon size={22} style={{ flexShrink: 0 }} />
      {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.name}</span>}
    </Link>
  );

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '2px solid var(--neu-bg)' }}>
          {(!sidebarCollapsed || mobileMenuOpen) && (
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
            {(!sidebarCollapsed || mobileMenuOpen) && <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neu-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 16px', marginBottom: '4px' }}>Main</div>}
            {mainNav.map(item => <NavItem key={item.path} item={item} />)}
          </nav>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!sidebarCollapsed || mobileMenuOpen) && <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neu-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 16px', marginBottom: '4px' }}>Management</div>}
            {managementNav.map(item => <NavItem key={item.path} item={item} />)}
          </nav>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '2px solid rgba(255, 255, 255, 0.4)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavItem item={{ name: 'Settings', path: '/settings', icon: Settings }} />
          <a href="#" onClick={handleLogout} className="nav-link" style={{ color: 'var(--neu-danger)' }} title={sidebarCollapsed ? "Logout" : undefined}>
            <LogOut size={22} style={{ flexShrink: 0 }} />
            {(!sidebarCollapsed || mobileMenuOpen) && <span>Logout</span>}
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Desktop toggle */}
            <button className="neu-button icon-only" onClick={toggleSidebar} style={{ display: 'none' }} id="desktop-toggle">
              <Menu size={20} />
            </button>
            {/* Mobile toggle */}
            <button className="neu-button icon-only" onClick={toggleMobileMenu} id="mobile-toggle">
              <Menu size={20} />
            </button>
            <style>{`
              @media (min-width: 769px) { #mobile-toggle { display: none !important; } #desktop-toggle { display: inline-flex !important; } }
              @media (max-width: 768px) { #desktop-toggle { display: none !important; } #mobile-toggle { display: inline-flex !important; } }
            `}</style>
            
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              {[...mainNav, ...managementNav, {path: '/settings', name: 'Settings'}].find(i => i.path === location.pathname)?.name || 'Welcome'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              className="neu-button icon-only" 
              style={{ position: 'relative' }}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div style={{ position: 'relative' }}>
              <button 
                className="neu-button icon-only" 
                style={{ position: 'relative' }}
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', backgroundColor: 'var(--neu-danger)', borderRadius: '50%', border: '2px solid var(--neu-bg)' }} />
                )}
              </button>

              {showNotificationDropdown && (
                <div className="neu-card" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  padding: '16px',
                  width: '320px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h4 style={{ margin: 0, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>Notifications</h4>
                  {alerts.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--neu-text-muted)', fontSize: '0.9rem' }}>No new alerts.</div>
                  ) : alerts.map(alert => (
                    <Link key={alert.id} to={alert.link} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setShowNotificationDropdown(false)}>
                      <div style={{ padding: '12px', background: 'var(--neu-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.type === 'warning' ? 'var(--neu-warning)' : 'var(--neu-primary)', marginTop: '6px' }} />
                        <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{alert.message}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
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
