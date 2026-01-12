// Helper to sanitize base URL
const getBaseUrl = () => {
    let url = import.meta.env.VITE_THERAPIST_SERVICE_URL || 'http://localhost:3002';
    // Remove trailing slash
    if (url.endsWith('/')) url = url.slice(0, -1);
    // If url ends with /api, remove it so we can append it consistently
    if (url.endsWith('/api')) url = url.slice(0, -4);
    return url;
};

const BASE_URL = getBaseUrl();

export interface VerificationUpdatePayload {
    stage: 'documents' | 'background_check' | 'final';
    status: 'approved' | 'rejected';
    notes?: string;
}

export const verificationService = {
    async getAllTherapists() {
        try {
            // Call the endpoint we just modified
            const response = await fetch(`${BASE_URL}/api/therapists?status=all`);
            if (!response.ok) {
                throw new Error('Failed to fetch therapists');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching verification list:', error);
            throw error;
        }
    },

    async updateVerificationStage(id: string, payload: VerificationUpdatePayload) {
        try {
            const response = await fetch(`${BASE_URL}/api/therapists/${id}/verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header here if needed, e.g. from local storage or auth context
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update verification stage');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating verification stage:', error);
            throw error;
        }
    }
};
