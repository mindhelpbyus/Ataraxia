/**
 * Authentication Example Component
 * 
 * Demonstrates how to use the new pure Cognito authentication service
 * in the Ataraxia frontend.
 */

import React, { useState, useEffect } from 'react';
import authService, { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  confirmSignUp,
  sendPasswordResetEmail,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  getTherapistStatus,
  isAuthenticated,
  getUserRole,
  isAdmin,
  isTherapist,
  isClient,
  setAuthStrategy,
  getAuthConfig
} from '../services/authService';

export const AuthExample: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authConfig, setAuthConfigState] = useState(getAuthConfig());

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'client' | 'therapist'>('client');
  const [confirmationCode, setConfirmationCode] = useState('');

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      console.log('Auth state changed:', user);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await signInWithEmailAndPassword(email, password);
      setMessage(`✅ Login successful! Welcome ${result.user.email}`);
      console.log('Login result:', result);
    } catch (error: any) {
      setMessage(`❌ Login failed: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await createUserWithEmailAndPassword(email, password, {
        firstName,
        lastName,
        role,
        phoneNumber: '' // Optional
      });
      setMessage(`✅ Registration successful! Please check your email for verification code.`);
      console.log('Registration result:', result);
    } catch (error: any) {
      setMessage(`❌ Registration failed: ${error.message}`);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!email || !confirmationCode) {
      setMessage('Please enter email and confirmation code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await confirmSignUp(email, confirmationCode);
      setMessage('✅ Email confirmed successfully! You can now login.');
    } catch (error: any) {
      setMessage(`❌ Email confirmation failed: ${error.message}`);
      console.error('Confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await sendPasswordResetEmail(email);
      setMessage('✅ Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setMessage(`❌ Password reset failed: ${error.message}`);
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');

    try {
      await signOut();
      setMessage('✅ Logged out successfully');
    } catch (error: any) {
      setMessage(`❌ Logout failed: ${error.message}`);
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTherapistStatus = async () => {
    if (!user) {
      setMessage('Please login first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const status = await getTherapistStatus(user.uid);
      setMessage(`✅ Therapist status: ${JSON.stringify(status, null, 2)}`);
      console.log('Therapist status:', status);
    } catch (error: any) {
      setMessage(`❌ Failed to get therapist status: ${error.message}`);
      console.error('Therapist status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthStrategy = () => {
    const newStrategy = !authConfig.useApiFirst;
    setAuthStrategy(newStrategy);
    setAuthConfigState(getAuthConfig());
    setMessage(`🔧 Auth strategy changed to: ${newStrategy ? 'Lambda API First' : 'Direct Cognito First'}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Ataraxia Authentication Demo</h2>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
        {user && (
          <>
            <p><strong>User ID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
            <p><strong>Role:</strong> {getUserRole()}</p>
            <p><strong>Is Admin:</strong> {isAdmin() ? '✅' : '❌'}</p>
            <p><strong>Is Therapist:</strong> {isTherapist() ? '✅' : '❌'}</p>
            <p><strong>Is Client:</strong> {isClient() ? '✅' : '❌'}</p>
          </>
        )}
      </div>

      {/* Auth Configuration */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Configuration</h3>
        <p><strong>Strategy:</strong> {authConfig.useApiFirst ? 'Lambda API First' : 'Direct Cognito First'}</p>
        <p><strong>Cognito Configured:</strong> {authConfig.cognitoConfigured ? '✅' : '❌'}</p>
        <button
          onClick={toggleAuthStrategy}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Switch to {authConfig.useApiFirst ? 'Cognito First' : 'API First'}
        </button>
      </div>

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
            placeholder="Password"
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
            value={role}
            onChange={(e) => setRole(e.target.value as 'client' | 'therapist')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="client">Client</option>
            <option value="therapist">Therapist</option>
          </select>
        </div>

        {/* Confirmation code */}
        <input
          type="text"
          placeholder="Confirmation Code"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
          <button
            onClick={handleConfirmEmail}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Confirm Email'}
          </button>
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Reset Password'}
          </button>
        </div>

        {user && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Logout'}
            </button>
            <button
              onClick={handleGetTherapistStatus}
              disabled={loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Therapist Status'}
            </button>
          </div>
        )}
      </div>

      {/* Message display */}
      {message && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthExample;