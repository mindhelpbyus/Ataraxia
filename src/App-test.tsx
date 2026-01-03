import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #EFF6FF, #EDE9FE)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 50px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1e40af',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Ataraxia
        </h1>
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Wellness Management System
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Email
          </label>
          <input 
            type="email"
            placeholder="admin@ataraxia.com"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Password
          </label>
          <input 
            type="password"
            placeholder="admin123"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button style={{
          width: '100%',
          padding: '12px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Sign In
        </button>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#eff6ff',
          borderRadius: '6px',
          border: '1px solid #bfdbfe'
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#1e40af',
            margin: 0,
            fontWeight: '500'
          }}>
            ✅ App is working! If you see this, the basic React app is rendering correctly.
          </p>
          <p style={{ 
            fontSize: '11px', 
            color: '#6b7280',
            margin: '8px 0 0 0'
          }}>
            Figma webpack errors in console are normal and harmless.
          </p>
        </div>
      </div>
    </div>
  );
}
