import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px' 
        }}>
          <div className="neu-card" style={{ 
            maxWidth: '500px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            alignItems: 'center' 
          }}>
            <div style={{ color: 'var(--neu-danger)', padding: '16px', background: 'var(--neu-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-pressed)' }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ margin: 0, color: 'var(--neu-danger)' }}>Something went wrong.</h2>
            <p style={{ color: 'var(--neu-text-muted)', fontSize: '0.95rem' }}>
              We encountered an unexpected error while rendering this page.
            </p>
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: 'var(--neu-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--neu-text-main)', overflow: 'auto', maxHeight: '150px', width: '100%' }}>
              {this.state.error && this.state.error.toString()}
            </details>
            <button 
              className="neu-button gradient" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px' }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}
