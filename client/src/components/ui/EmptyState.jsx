import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = "No Data Found", 
  message = "There's nothing here yet.",
  actionButton = null 
}) {
  return (
    <div className="neu-card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '48px 24px',
      textAlign: 'center',
      gap: '16px',
      width: '100%',
      minHeight: '300px'
    }}>
      <div style={{ 
        padding: '24px', 
        borderRadius: '50%', 
        backgroundColor: 'var(--neu-surface)', 
        boxShadow: 'var(--shadow-pressed)',
        color: 'var(--neu-text-muted)'
      }}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--neu-text-main)' }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--neu-text-muted)', fontSize: '0.95rem' }}>{message}</p>
      </div>
      {actionButton && (
        <div style={{ marginTop: '16px' }}>
          {actionButton}
        </div>
      )}
    </div>
  );
}
