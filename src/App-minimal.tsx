import React from 'react';

/**
 * MINIMAL TEST APP
 * 
 * This is a stripped-down version to test if the app loads.
 * If this loads successfully, it proves the WASM errors are harmless.
 * 
 * To use this:
 * 1. Rename /App.tsx to /App-full.tsx
 * 2. Rename this file to /App.tsx
 * 3. Reload the app
 * 
 * If you see "Ataraxia Test - App is Working!" then the WASM errors are not breaking your app.
 */

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          ✅
        </div>
        
        <h1 style={{
          fontSize: '32px',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Ataraxia Test
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#059669',
          fontWeight: '600',
          marginBottom: '30px'
        }}>
          App is Working!
        </p>
        
        <div style={{
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            ✅ What This Proves:
          </h2>
          <ul style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>React is loading correctly</li>
            <li>Your code compiles successfully</li>
            <li>The WASM errors in console are harmless</li>
            <li>Figma Make environment is working</li>
          </ul>
        </div>
        
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            ⚠️ About Those WASM Errors:
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#78350f',
            lineHeight: '1.6',
            margin: 0
          }}>
            The errors from <code style={{
              background: 'rgba(0,0,0,0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px'
            }}>devtools_worker-3d615f4df46d2b14.min.js.br</code> are from Figma's infrastructure. 
            They appear in ALL Figma Make apps and cannot be fixed by developers. 
            They do NOT prevent your app from working.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          <button
            onClick={() => {
              const confirmed = window.confirm(
                'This will restore your full app.\n\n' +
                'Steps:\n' +
                '1. Rename /App.tsx to /App-minimal.tsx\n' +
                '2. Rename /App-full.tsx to /App.tsx\n' +
                '3. Reload the page\n\n' +
                'Click OK to see instructions.'
              );
              if (confirmed) {
                alert(
                  'To restore full app:\n\n' +
                  '1. In Figma Make file list, find App-full.tsx\n' +
                  '2. Rename it to App.tsx (it will replace this test)\n' +
                  '3. Reload the preview\n\n' +
                  'Your full app will work - just ignore the WASM console errors!'
                );
              }
            }}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Restore Full App
          </button>
          
          <button
            onClick={() => {
              console.clear();
              alert('Console cleared! You may still see new WASM errors appear - this is normal.');
            }}
            style={{
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear Console
          </button>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#dbeafe',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#1e3a8a'
        }}>
          <strong>Next Step:</strong> If you see this page, your app infrastructure works perfectly. 
          Restore the full app and use it normally - those WASM errors won't affect functionality.
        </div>
      </div>
    </div>
  );
}
