import { config } from '../config';

export interface Role {
    id: number;
    name: string;
    display_name: string;
    description?: string;
}

export interface RolesResponse {
    success: boolean;
    roles: Role[];
}

export interface UserRoleResponse {
    success: boolean;
    roles: Role[];
    primaryRole: Role;
    legacyRole?: string;
}

/**
 * Fetch all active roles from the database
 * No authentication required - for signup forms
 */
export const getAllRoles = async (): Promise<Role[]> => {
    try {
        const response = await fetch(`${config.api.baseUrl}/api/roles-metadata/all`);

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const data: RolesResponse = await response.json();
        return data.roles;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

/**
 * Fetch professional roles only (excludes 'client')
 * For signup forms where only professionals should register
 */
export const getProfessionalRoles = async (): Promise<Role[]> => {
    try {
        const response = await fetch(`${config.api.baseUrl}/api/roles-metadata/professional`);

        if (!response.ok) {
            throw new Error('Failed to fetch professional roles');
        }

        const data: RolesResponse = await response.json();
        return data.roles;
    } catch (error) {
        console.error('Error fetching professional roles:', error);
        throw error;
    }
};

/**
 * Get current user's role(s)
 * Requires authentication
 */
export const getUserRole = async (token: string): Promise<UserRoleResponse> => {
    try {
        const response = await fetch(`${config.api.baseUrl}/api/roles-metadata/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user role');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user role:', error);
        throw error;
    }
};

/**
 * Validate if a role exists and is active
 */
export const validateRole = async (roleName: string): Promise<boolean> => {
    try {
        const response = await fetch(`${config.api.baseUrl}/api/roles-metadata/validate/${roleName}`);

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.valid;
    } catch (error) {
        console.error('Error validating role:', error);
        return false;
    }
};

/**
 * Check if user has a specific role
 */
export const userHasRole = async (token: string, roleName: string): Promise<boolean> => {
    try {
        const userRoleData = await getUserRole(token);
        return userRoleData.roles.some(role => role.name === roleName);
    } catch (error) {
        console.error('Error checking user role:', error);
        return false;
    }
};

/**
 * Check if user is a professional (not a client)
 */
export const isProfessional = async (token: string): Promise<boolean> => {
    try {
        const userRoleData = await getUserRole(token);
        return userRoleData.primaryRole.name !== 'client';
    } catch (error) {
        console.error('Error checking if professional:', error);
        return false;
    }
};
