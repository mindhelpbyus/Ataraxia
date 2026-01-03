export const config = {
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
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
