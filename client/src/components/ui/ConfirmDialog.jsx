import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {isDestructive && (
            <div style={{ color: 'var(--neu-danger)', padding: '12px', background: 'var(--neu-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-pressed)' }}>
              <AlertTriangle size={24} />
            </div>
          )}
          <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--neu-text-main)', marginTop: '8px' }}>
            {message}
          </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button className="neu-button" onClick={onClose}>{cancelText}</button>
          <button 
            className="neu-button" 
            style={{ 
              backgroundColor: isDestructive ? 'var(--neu-danger)' : 'var(--neu-primary)', 
              color: 'white',
              boxShadow: isDestructive ? '0 4px 12px rgba(220, 38, 38, 0.3)' : '0 4px 12px var(--neu-primary-glow)'
            }} 
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
