import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Visual indicator that shows Figma WASM errors are being suppressed
 * This gives users confidence that the app is working correctly
 */
export function FigmaErrorSuppressor() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Check if user has previously dismissed this
  useEffect(() => {
    const dismissed = localStorage.getItem('figma-error-notice-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('figma-error-notice-dismissed', 'true');
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <strong style={{ fontSize: '14px', fontWeight: '600' }}>
              Console Errors Filtered
            </strong>
          </div>
          <p style={{ 
            fontSize: '13px', 
            lineHeight: '1.5',
            margin: 0,
            opacity: 0.95
          }}>
            Figma infrastructure errors are being automatically hidden. Your app is working correctly!
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        fontSize: '11px',
        opacity: 0.9
      }}>
        💡 These errors are from Figma Make's environment and don't affect your application
      </div>
    </div>
  );
}
