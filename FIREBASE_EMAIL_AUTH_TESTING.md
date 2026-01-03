# Firebase Email/Password Authentication Testing Guide

## Overview
This guide shows you how to test Firebase's Email/Password authentication features in your Ataraxia frontend.

## Features Implemented

### 1. **Sign Up (Create Account)**
- Create new user with email and password
- Automatically sends email verification
- Returns Firebase ID token for backend sync

### 2. **Sign In (Login)**
- Authenticate existing users
- Check email verification status
- Get Firebase ID token

### 3. **Email Verification**
- Automatic verification email on signup
- Resend verification option
- Check verification status

### 4. **Password Reset**
- Send password reset email
- Firebase handles the reset flow
- User clicks link in email to reset

### 5. **Update Email** (Available in helper functions)
- Change user's email address
- Requires re-authentication

### 6. **Update Password** (Available in helper functions)
- Change user's password
- Requires re-authentication

## How to Test

### Option 1: Use the Test Component

1. **Import the test component** in your `App.tsx`:

```typescript
import { FirebaseEmailAuthTest } from './components/FirebaseEmailAuthTest';

// In your App component, add a route or button to show it:
function App() {
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);
  
  if (showFirebaseTest) {
    return <FirebaseEmailAuthTest />;
  }
  
  // ... rest of your app
}
```

2. **Or create a dedicated test route**:
   - Navigate to `http://localhost:3000/firebase-test`
   - The component will display all testing options

### Option 2: Integrate into LoginPage

Add Firebase Email/Password as an option in your existing `LoginPage.tsx`:

```typescript
import { firebaseEmailAuth } from '../lib/firebase';

// In your email/password login handler:
const handleEmailLogin = async () => {
  try {
    // Option A: Use Firebase
    const userCredential = await firebaseEmailAuth.signIn(email, password);
    const idToken = await userCredential.user.getIdToken();
    
    // Sync with your backend
    const response = await fetch('http://localhost:3001/api/auth/firebase-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    // Option B: Use your backend directly (current implementation)
    // const response = await authService.login(email, password);
  } catch (error) {
    console.error(error);
  }
};
```

## Testing Steps

### Test Sign Up:
1. Open the test component
2. Switch to "Sign Up" mode
3. Enter email: `test@example.com`
4. Enter password: `Test123!` (min 6 characters)
5. Click "Sign Up"
6. **Check your email** for verification link
7. Click the verification link
8. User is now verified!

### Test Sign In:
1. Enter the email you registered
2. Enter your password
3. Click "Sign In"
4. You'll see user info displayed
5. Check console for Firebase ID token

### Test Password Reset:
1. Enter your email in the "Reset Password" section
2. Click "Send Reset Email"
3. **Check your email** for reset link
4. Click the link
5. Enter new password
6. Try signing in with new password

### Test Email Verification:
1. Sign up with a new email
2. If not verified, click "Resend Verification"
3. Check email and click verification link
4. Refresh the page - status should show "Verified"

## Firebase Console Setup

### Enable Email/Password Authentication:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ataraxia-c150f`
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Email/Password**
5. Enable both:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - Optional
6. Click **Save**

### Configure Email Templates:
1. In Firebase Console → **Authentication** → **Templates**
2. Customize:
   - **Email address verification**
   - **Password reset**
   - **Email address change**
3. Set your app name and sender email

## Integration with Your Backend

When a user signs in with Firebase, you get an **ID Token**. Send this to your backend:

```typescript
// Frontend
const idToken = await user.getIdToken();

const response = await fetch('http://localhost:3001/api/auth/firebase-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    idToken,
    // Optional: pass additional data
    first_name: 'John',
    last_name: 'Doe'
  })
});

const data = await response.json();
// data contains: { token, user }
```

Your backend already has the `/api/auth/firebase-login` endpoint that:
1. Verifies the Firebase ID token
2. Creates/updates user in your database
3. Returns your own JWT token

## Available Helper Functions

All functions are exported from `src/lib/firebase.ts`:

```typescript
import { firebaseEmailAuth } from '../lib/firebase';

// Sign up
await firebaseEmailAuth.signUp(email, password);

// Sign in
await firebaseEmailAuth.signIn(email, password);

// Send verification
await firebaseEmailAuth.sendVerification(user);

// Reset password
await firebaseEmailAuth.resetPassword(email);

// Change email
await firebaseEmailAuth.changeEmail(user, newEmail);

// Change password
await firebaseEmailAuth.changePassword(user, newPassword);

// Sign out
await firebaseEmailAuth.signOut();
```

## Security Notes

1. **Password Requirements**: Firebase requires minimum 6 characters
2. **Email Verification**: Users can sign in before verifying, but you can check `user.emailVerified`
3. **Rate Limiting**: Firebase automatically rate limits authentication attempts
4. **ID Token Expiry**: Tokens expire after 1 hour, refresh as needed

## Troubleshooting

### "Email already in use"
- User already exists in Firebase
- Try signing in instead

### "Invalid email"
- Check email format
- Firebase validates email format

### "Weak password"
- Use at least 6 characters
- Include mix of letters and numbers

### "Too many requests"
- Firebase rate limiting activated
- Wait a few minutes and try again

### Email not received
- Check spam folder
- Verify email settings in Firebase Console
- Try resending verification

## Next Steps

1. **Test all flows** using the test component
2. **Enable Email/Password** in Firebase Console
3. **Customize email templates** for your brand
4. **Integrate** into your main LoginPage
5. **Sync users** with your backend via `/api/auth/firebase-login`

## Questions?

- Firebase Auth Docs: https://firebase.google.com/docs/auth/web/password-auth
- Your Firebase Project: https://console.firebase.google.com/project/ataraxia-c150f
