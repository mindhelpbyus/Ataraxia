/**
 * Enhanced Auth Demo Component
 * 
 * Demonstrates the Firebase-like experience with Cognito:
 * ✅ Automatic token refresh
 * ✅ Session persistence
 * ✅ Auto-login after registration
 * ✅ Real-time auth state updates
 * ✅ Comprehensive error handling
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../hooks/useEnhancedAuth';

export const EnhancedAuthDemo: React.FC = () => {
  const {
    // User state
    user,
    isAuthenticated,
    isLoading,
    role,
    isAdmin,
    isTherapist,
    isClient,
    
    // Auth actions
    login,
    register,
    logout,
    confirmEmail,
    resendConfirmationCode,
    resetPassword,
    confirmPasswordReset,
    
    // Token management
    getIdToken,
    getAccessToken,
    refreshTokens,
    
    // Utility functions
    needsEmailVerification,
    getTokenInfo,
    
    // Error state
    error,
    clearError
  } = useEnhancedAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState<'client' | 'therapist'>('therapist');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Demo states
  const [message, setMessage] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Update token info periodically
  useEffect(() => {
    if (isAuthenticated) {
      const updateTokenInfo = async () => {
        const info = await getTokenInfo();
        setTokenInfo(info);
      };
      
      updateTokenInfo();
      const interval = setInterval(updateTokenInfo, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, getTokenInfo]);

  // Clear messages when error changes
  useEffect(() => {
    if (error) {
      setMessage('');
    }
  }, [error]);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      setMessage('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      const result = await register(email, password, {
        firstName,
        lastName,
        role: userRole,
        phoneNumber: ''
      });

      if (result.requiresVerification) {
        if (result.user && isAuthenticated) {
          setMessage(`✅ Registration successful! You're now logged in as ${result.user.email}. Please verify your email when convenient.`);
        } else {
          setMessage(`✅ Registration successful! Please check your email for a verification code.`);
        }
      } else {
        setMessage(`✅ Registration and login successful! Welcome ${result.user.email}`);
      }
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Registration error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter email and password');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      const result = await login(email, password);
      setMessage(`✅ Login successful! Welcome back ${result.user.email}`);
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Login error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!email || !confirmationCode) {
      setMessage('Please enter email and confirmation code');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await confirmEmail(email, confirmationCode);
      setMessage('✅ Email confirmed successfully! You can now use all features.');
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Email confirmation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await resendConfirmationCode(email);
      setMessage('✅ Confirmation code sent! Check your email.');
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Resend code error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await resetPassword(email);
      setMessage('✅ Password reset email sent! Check your inbox.');
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Password reset error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPasswordReset = async () => {
    if (!email || !resetCode || !newPassword) {
      setMessage('Please fill in all password reset fields');
      return;
    }

    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await confirmPasswordReset(email, resetCode, newPassword);
      setMessage('✅ Password reset successful! You can now login with your new password.');
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Password reset confirmation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await logout();
      setMessage('✅ Logged out successfully');
      setTokenInfo(null);
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Logout error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetTokens = async () => {
    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      const idToken = await getIdToken();
      const accessToken = await getAccessToken();
      
      setMessage(`✅ Tokens retrieved:\nID Token: ${idToken ? 'Valid' : 'None'}\nAccess Token: ${accessToken ? 'Valid' : 'None'}`);
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Get tokens error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshTokens = async () => {
    setActionLoading(true);
    setMessage('');
    clearError();

    try {
      await refreshTokens();
      setMessage('✅ Tokens refreshed successfully!');
    } catch (err: any) {
      // Error is handled by the hook
      console.error('Refresh tokens error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Enhanced Cognito Auth Demo</h2>
      <p className="text-center text-gray-600 mb-6">Firebase-like experience with automatic session management</p>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
              </>
            )}
          </div>
          <div>
            <p><strong>Role:</strong> {role || 'None'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? '✅' : '❌'}</p>
            <p><strong>Is Therapist:</strong> {isTherapist ? '✅' : '❌'}</p>
            <p><strong>Is Client:</strong> {isClient ? '✅' : '❌'}</p>
            <p><strong>Needs Email Verification:</strong> {needsEmailVerification() ? '⚠️ Yes' : '✅ No'}</p>
          </div>
        </div>
      </div>

      {/* Token Information */}
      {isAuthenticated && tokenInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Token Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Expires At:</strong> {tokenInfo.expiresAt ? tokenInfo.expiresAt.toLocaleString() : 'Unknown'}</p>
            <p><strong>Expires In:</strong> {tokenInfo.expiresIn ? `${Math.round(tokenInfo.expiresIn / 60)} minutes` : 'Unknown'}</p>
            <p><strong>Is Expired:</strong> {tokenInfo.isExpired ? '❌ Yes' : '✅ No'}</p>
          </div>
        </div>
      )}

      {/* Forms */}
      <div className="space-y-4">
        {/* Email and Password */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password (12+ chars, complex)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Registration fields */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'client' | 'therapist')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="client">Client</option>
            <option value="therapist">Therapist</option>
          </select>
        </div>

        {/* Verification codes */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Email Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Password Reset Code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleLogin}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Login'}
          </button>
          <button
            onClick={handleRegister}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Register'}
          </button>
          <button
            onClick={handleConfirmEmail}
            disabled={actionLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Confirm Email'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleResendCode}
            disabled={actionLoading}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Resend Code'}
          </button>
          <button
            onClick={handleResetPassword}
            disabled={actionLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Reset Password'}
          </button>
          <button
            onClick={handleConfirmPasswordReset}
            disabled={actionLoading}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Confirm Reset'}
          </button>
        </div>

        {isAuthenticated && (
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={handleLogout}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Logout'}
            </button>
            <button
              onClick={handleGetTokens}
              disabled={actionLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Get Tokens'}
            </button>
            <button
              onClick={handleRefreshTokens}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Refresh Tokens'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Test Persistence
            </button>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Message display */}
      {message && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-green-800">{message}</pre>
        </div>
      )}

      {/* Features showcase */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🚀 Enhanced Features</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">✅ Automatic Features:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Token refresh (5 min before expiry)</li>
              <li>• Session persistence across reloads</li>
              <li>• Auto-login after registration (therapists)</li>
              <li>• Real-time auth state updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">🔧 Manual Features:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Force token refresh</li>
              <li>• Token expiration monitoring</li>
              <li>• Comprehensive error handling</li>
              <li>• Role-based access control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthDemo;