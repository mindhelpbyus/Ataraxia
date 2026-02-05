// Use VITE_API_BASE_URL as single source of truth with localhost:3002 as development fallback
let apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

// Remove trailing slash only - don't remove /api as it might be intentional
apiUrl = apiUrl.replace(/\/$/, '');

export const config = {
    api: {
        baseUrl: apiUrl, // Remove /api prefix since backend handles both /api and direct routes
        endpoints: {
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                firebaseLogin: '/auth/firebase-login', // This will become http://localhost:3005/auth/firebase-login
                me: '/auth/me'
            }
        }
    }
};
