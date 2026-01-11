// Normalize API URL to handle trailing slashes and /api duplication
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// FORCE FIX: If apiUrl is pointing to port 3001 (old config), force it to 3002
if (apiUrl.includes('3001')) {
    console.warn('⚠️ Detected port 3001 in VITE_API_URL. Forcing update to port 3002.');
    apiUrl = apiUrl.replace('3001', '3002');
}

apiUrl = apiUrl.replace(/\/$/, '').replace(/\/api$/, ''); // Remove trailing /api or /

export const config = {
    api: {
        baseUrl: `${apiUrl}/api`,
        endpoints: {
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                firebaseLogin: '/auth/firebase-login',
                me: '/auth/me'
            }
        }
    }
};
