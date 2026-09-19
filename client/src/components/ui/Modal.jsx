import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(221, 225, 231, 0.8)', // Matching neumorphic base with opacity
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="neu-card animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
          <button className="neu-button icon-only" onClick={onClose} style={{ padding: '8px', boxShadow: 'none' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
