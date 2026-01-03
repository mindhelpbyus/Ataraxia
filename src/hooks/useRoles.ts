import { useState, useEffect } from 'react';
import { getAllRoles, getProfessionalRoles, getUserRole, type Role } from '../api/services/roles';

/**
 * Hook to fetch all roles from the database
 * Use in signup forms, dropdowns, etc.
 */
export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const data = await getAllRoles();
                setRoles(data);
                setError(null);
            } catch (err) {
                setError('Failed to load roles');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { roles, loading, error };
}

/**
 * Hook to fetch professional roles only (excludes 'client')
 * Use in professional signup forms
 */
export function useProfessionalRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const data = await getProfessionalRoles();
                setRoles(data);
                setError(null);
            } catch (err) {
                setError('Failed to load roles');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { roles, loading, error };
}

/**
 * Hook to get current user's role
 * Requires authentication token
 */
export function useUserRole(token: string | null) {
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [allUserRoles, setAllUserRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUserRole = async () => {
            try {
                setLoading(true);
                const data = await getUserRole(token);
                setUserRole(data.primaryRole);
                setAllUserRoles(data.roles);
                setError(null);
            } catch (err) {
                setError('Failed to load user role');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [token]);

    return {
        userRole,
        allUserRoles,
        loading,
        error,
        isClient: userRole?.name === 'client',
        isProfessional: userRole?.name !== 'client',
        isSuperAdmin: userRole?.name === 'super_admin',
        isOrgAdmin: userRole?.name === 'org_admin',
        isTherapist: userRole?.name === 'therapist',
        isDoctor: userRole?.name === 'doctor',
        isReceptionist: userRole?.name === 'org_receptionist'
    };
}
