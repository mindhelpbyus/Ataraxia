// Normalize API URL to handle trailing slashes and /api duplication
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';



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
