import { useEffect } from 'react';
import useToastStore from '../../store/useToastStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} className="animate-fade-in-up neu-card" style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          backgroundColor: 'var(--neu-bg)',
          borderLeft: `4px solid ${
            toast.type === 'success' ? 'var(--neu-success)' :
            toast.type === 'error' ? 'var(--neu-danger)' :
            'var(--neu-primary)'
          }`
        }}>
          {toast.type === 'success' && <CheckCircle size={20} color="var(--neu-success)" />}
          {toast.type === 'error' && <AlertCircle size={20} color="var(--neu-danger)" />}
          {toast.type === 'info' && <Info size={20} color="var(--neu-primary)" />}
          
          <div style={{ flex: 1, fontWeight: '600', fontSize: '0.95rem' }}>{toast.message}</div>
          
          <button 
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neu-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
