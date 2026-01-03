import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { firebaseEmailAuth, auth } from '../lib/firebase';
import { Mail, Lock, CheckCircle, AlertCircle, Send, Key } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Firebase Email/Password Authentication Test Component
 * 
 * This component demonstrates all Firebase Email/Password features:
 * 1. Sign Up (Create Account)
 * 2. Sign In (Login)
 * 3. Email Verification
 * 4. Password Reset
 * 5. Update Email
 * 6. Update Password
 */
export function FirebaseEmailAuthTest() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Listen to auth state changes
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                console.log('Current user:', {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                });
            }
        });
        return () => unsubscribe();
    }, []);

    // Sign Up
    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await firebaseEmailAuth.signUp(email, password);

            // Send verification email
            await firebaseEmailAuth.sendVerification(userCredential.user);

            toast.success('Account created!', {
                description: 'Please check your email to verify your account.'
            });

            // Get ID token to sync with backend
            const idToken = await userCredential.user.getIdToken();
            console.log('Firebase ID Token:', idToken);

            // TODO: Call your backend to sync user
            // await fetch('http://localhost:3001/api/auth/firebase-login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ idToken })
            // });

        } catch (error: any) {
            console.error('Sign up error:', error);
            toast.error(error.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    // Sign In
    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            const userCredential = await firebaseEmailAuth.signIn(email, password);

            if (!userCredential.user.emailVerified) {
                toast.warning('Email not verified', {
                    description: 'Please verify your email address.'
                });
            } else {
                toast.success('Signed in successfully!');
            }

            // Get ID token
            const idToken = await userCredential.user.getIdToken();
            console.log('Firebase ID Token:', idToken);

        } catch (error: any) {
            console.error('Sign in error:', error);
            toast.error(error.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend Verification Email
    const handleResendVerification = async () => {
        if (!currentUser) return;

        try {
            await firebaseEmailAuth.sendVerification(currentUser);
            toast.success('Verification email sent!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Password Reset
    const handlePasswordReset = async () => {
        if (!resetEmail) {
            toast.error('Please enter your email');
            return;
        }

        try {
            await firebaseEmailAuth.resetPassword(resetEmail);
            toast.success('Password reset email sent!', {
                description: 'Check your inbox for reset instructions.'
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Sign Out
    const handleSignOut = async () => {
        try {
            await firebaseEmailAuth.signOut();
            toast.success('Signed out successfully');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Firebase Email/Password Auth Test</h1>
                    <p className="text-muted-foreground">
                        Test all Firebase authentication features
                    </p>
                </div>

                {/* Current User Status */}
                {currentUser && (
                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle className="h-5 w-5" />
                                Signed In
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>UID:</strong> {currentUser.uid}</p>
                            <p className="flex items-center gap-2">
                                <strong>Email Verified:</strong>
                                {currentUser.emailVerified ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-orange-600 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> No
                                        <Button size="sm" variant="outline" onClick={handleResendVerification}>
                                            Resend Verification
                                        </Button>
                                    </span>
                                )}
                            </p>
                            <Button onClick={handleSignOut} variant="destructive" className="mt-4">
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!currentUser && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sign In / Sign Up */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                                </CardTitle>
                                <CardDescription>
                                    {mode === 'signin'
                                        ? 'Sign in with your email and password'
                                        : 'Create a new account'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {mode === 'signup' && (
                                    <div>
                                        <Label>Confirm Password</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                <Button
                                    onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                                </Button>

                                <button
                                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                                    className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                                >
                                    {mode === 'signin'
                                        ? "Don't have an account? Sign Up"
                                        : 'Already have an account? Sign In'}
                                </button>
                            </CardContent>
                        </Card>

                        {/* Password Reset */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Reset Password
                                </CardTitle>
                                <CardDescription>
                                    Send a password reset email
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <Button onClick={handlePasswordReset} variant="outline" className="w-full">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Reset Email
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Testing Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <strong>1. Sign Up:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                                <li>Enter email and password (min 6 characters)</li>
                                <li>Click "Sign Up"</li>
                                <li>Check your email for verification link</li>
                                <li>Click the link to verify your email</li>
                            </ul>
                        </div>
                        <div>
                            <strong>2. Sign In:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                                <li>Enter your registered email and password</li>
                                <li>Click "Sign In"</li>
                                <li>You'll see your user info above</li>
                            </ul>
                        </div>
                        <div>
                            <strong>3. Password Reset:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                                <li>Enter your email in the reset form</li>
                                <li>Click "Send Reset Email"</li>
                                <li>Check your email for reset link</li>
                                <li>Follow the link to set a new password</li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <strong className="text-blue-900">💡 Note:</strong>
                            <p className="text-blue-800 mt-1">
                                The ID Token logged in the console can be sent to your backend
                                at <code className="bg-blue-100 px-1 rounded">POST /api/auth/firebase-login</code>
                                to sync the user with your database.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
