/**
 * Permission-Based UI Components
 * 
 * React components for conditional rendering based on user permissions and roles
 */

import React from 'react';
import { useAuthStore } from '../../store/authStore';

export function useProviderAgnosticAuth() {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    const hasRole = (role: string) => user?.role === role;
    const hasPermission = (permission: string) => (user as any)?.permissions?.includes(permission) ?? false;
    const hasAnyPermission = (permissions: string[]) => permissions.some(hasPermission);
    const hasAllPermissions = (permissions: string[]) => permissions.every(hasPermission);

    return {
        user,
        isAuthenticated,
        loading: isLoading,
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
}
// ============================================================================
// PERMISSION-BASED COMPONENTS
// ============================================================================

/**
 * Render children only if user has the specified permission
 * 
 * Usage:
 *   <HasPermission permission="clients.create">
 *     <CreateClientButton />
 *   </HasPermission>
 */
export function HasPermission({
    permission,
    children
}: {
    permission: string;
    children: React.ReactNode;
}) {
    const { hasPermission } = useProviderAgnosticAuth();

    if (!hasPermission(permission)) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Render children only if user has ANY of the specified permissions
 * 
 * Usage:
 *   <HasAnyPermission permissions={['clients.read', 'admin.access']}>
 *     <ClientList />
 *   </HasAnyPermission>
 */
export function HasAnyPermission({
    permissions,
    children
}: {
    permissions: string[];
    children: React.ReactNode;
}) {
    const { hasAnyPermission } = useProviderAgnosticAuth();

    if (!hasAnyPermission(permissions)) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Render children only if user has ALL of the specified permissions
 * 
 * Usage:
 *   <HasAllPermissions permissions={['clients.read', 'clients.update']}>
 *     <EditClientForm />
 *   </HasAllPermissions>
 */
export function HasAllPermissions({
    permissions,
    children
}: {
    permissions: string[];
    children: React.ReactNode;
}) {
    const { hasAllPermissions } = useProviderAgnosticAuth();

    if (!hasAllPermissions(permissions)) {
        return null;
    }

    return <>{children}</>;
}

// ============================================================================
// ROLE-BASED COMPONENTS
// ============================================================================

/**
 * Render children only if user has the specified role
 * 
 * Usage:
 *   <HasRole role="admin">
 *     <AdminPanel />
 *   </HasRole>
 */
export function HasRole({
    role,
    children
}: {
    role: string;
    children: React.ReactNode;
}) {
    const { hasRole } = useProviderAgnosticAuth();

    if (!hasRole(role)) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Render children only if user has ANY of the specified roles
 * 
 * Usage:
 *   <HasAnyRole roles={['admin', 'therapist']}>
 *     <Dashboard />
 *   </HasAnyRole>
 */
export function HasAnyRole({
    roles,
    children
}: {
    roles: string[];
    children: React.ReactNode;
}) {
    const { hasRole } = useProviderAgnosticAuth();

    const hasAnyRole = roles.some(role => hasRole(role));

    if (!hasAnyRole) {
        return null;
    }

    return <>{children}</>;
}

// ============================================================================
// CONDITIONAL RENDERING COMPONENTS
// ============================================================================

/**
 * Render different content based on permission
 * 
 * Usage:
 *   <PermissionSwitch
 *     permission="clients.update"
 *     granted={<EditButton />}
 *     denied={<ViewOnlyMessage />}
 *   />
 */
export function PermissionSwitch({
    permission,
    granted,
    denied
}: {
    permission: string;
    granted: React.ReactNode;
    denied?: React.ReactNode;
}) {
    const { hasPermission } = useProviderAgnosticAuth();

    return <>{hasPermission(permission) ? granted : denied}</>;
}

/**
 * Render different content based on role
 * 
 * Usage:
 *   <RoleSwitch
 *     role="therapist"
 *     granted={<TherapistDashboard />}
 *     denied={<ClientDashboard />}
 *   />
 */
export function RoleSwitch({
    role,
    granted,
    denied
}: {
    role: string;
    granted: React.ReactNode;
    denied?: React.ReactNode;
}) {
    const { hasRole } = useProviderAgnosticAuth();

    return <>{hasRole(role) ? granted : denied}</>;
}

// ============================================================================
// AUTHENTICATION COMPONENTS
// ============================================================================

/**
 * Render children only if user is authenticated
 * 
 * Usage:
 *   <Authenticated>
 *     <UserProfile />
 *   </Authenticated>
 */
export function Authenticated({
    children
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useProviderAgnosticAuth();

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Render children only if user is NOT authenticated
 * 
 * Usage:
 *   <Unauthenticated>
 *     <LoginForm />
 *   </Unauthenticated>
 */
export function Unauthenticated({
    children
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useProviderAgnosticAuth();

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Render different content based on authentication status
 * 
 * Usage:
 *   <AuthSwitch
 *     authenticated={<Dashboard />}
 *     unauthenticated={<LandingPage />}
 *   />
 */
export function AuthSwitch({
    authenticated,
    unauthenticated
}: {
    authenticated: React.ReactNode;
    unauthenticated: React.ReactNode;
}) {
    const { isAuthenticated } = useProviderAgnosticAuth();

    return <>{isAuthenticated ? authenticated : unauthenticated}</>;
}

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

/**
 * Show loading state while auth is initializing
 * 
 * Usage:
 *   <AuthLoading fallback={<Spinner />}>
 *     <App />
 *   </AuthLoading>
 */
export function AuthLoading({
    children,
    fallback
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { loading } = useProviderAgnosticAuth();

    if (loading) {
        return <>{fallback || <div>Loading...</div>}</>;
    }

    return <>{children}</>;
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check permissions programmatically
 * 
 * Usage:
 *   const canCreate = usePermission('clients.create');
 *   if (canCreate) { ... }
 */
export function usePermission(permission: string): boolean {
    const { hasPermission } = useProviderAgnosticAuth();
    return hasPermission(permission);
}

/**
 * Hook to check roles programmatically
 * 
 * Usage:
 *   const isAdmin = useRole('admin');
 *   if (isAdmin) { ... }
 */
export function useRole(role: string): boolean {
    const { hasRole } = useProviderAgnosticAuth();
    return hasRole(role);
}

/**
 * Hook to get user's permissions
 * 
 * Usage:
 *   const permissions = usePermissions();
 *   console.log('User has', permissions.length, 'permissions');
 */
export function usePermissions() {
    const { user } = useProviderAgnosticAuth();
    return (user as any)?.permissions || [];
}

/**
 * Hook to get user's roles
 * 
 * Usage:
 *   const roles = useRoles();
 *   console.log('User has', roles.length, 'roles');
 */
export function useRoles() {
    const { user } = useProviderAgnosticAuth();
    return user?.role ? [user.role] : [];
}
