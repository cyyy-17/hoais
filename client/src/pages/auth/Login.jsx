import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';
import { Eye, EyeOff, Building2, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      login({ email, name: 'Admin User', role: 'SUPER_ADMIN' });
      addToast('Successfully signed in. Welcome back!', 'success');
      navigate('/');
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--neu-bg)' }}>
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div style={{ 
        flex: 1, 
        padding: '64px',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        background: 'var(--gradient-primary)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }} className="login-brand-panel">
        
        {/* Abstract decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '24px', backdropFilter: 'blur(10px)', marginBottom: '32px' }}>
            <Building2 size={48} color="white" />
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', color: 'white' }}>
            HOA<br/>Command Center
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '48px', lineHeight: 1.6 }}>
            The award-winning platform designed to elevate your community management to the next level.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}><ShieldCheck size={24} /></div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Bank-grade security & audit logging</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}><Zap size={24} /></div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Lightning-fast real-time analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '32px'
      }}>
        <div className="neu-card animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '48px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: 'var(--neu-text-muted)' }}>Enter your credentials to access the system.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="neu-label">Email Address</label>
              <input 
                type="email" 
                className="neu-input" 
                placeholder="admin@hoa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="neu-label">Password</label>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--neu-primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="neu-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '48px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neu-text-muted)',
                    display: 'flex', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="neu-button gradient" 
              style={{ marginTop: '16px', width: '100%', padding: '16px', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
