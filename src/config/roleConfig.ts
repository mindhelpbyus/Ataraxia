/**
 * Role Configuration
 * 
 * This file defines how roles are assigned based on platform, URL, or other context.
 * 
 * ROLE ASSIGNMENT STRATEGY:
 * 1. Web Platform (default): therapist
 * 2. Client Portal (subdomain/path): client
 * 3. Super Admin: local auth only (created directly in database)
 * 4. Org Admin: assigned by super admin in database
 * 5. Other admin roles: assigned by super admin in database
 */

export type UserRole = 'therapist' | 'client' | 'super_admin' | 'org_admin' | 'admin';

export interface RoleConfig {
  defaultRole: UserRole;
  allowRoleSelection: boolean;
  availableRoles: UserRole[];
  roleDetectionMethod: 'url' | 'subdomain' | 'path' | 'header' | 'manual';
}

/**
 * Platform-specific role configurations
 */
export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  // Main web platform - therapists only
  web: {
    defaultRole: 'therapist',
    allowRoleSelection: false,
    availableRoles: ['therapist'],
    roleDetectionMethod: 'url'
  },
  
  // Client portal - clients only
  client: {
    defaultRole: 'client',
    allowRoleSelection: false,
    availableRoles: ['client'],
    roleDetectionMethod: 'subdomain'
  },
  
  // Development/testing - allow manual selection
  dev: {
    defaultRole: 'therapist',
    allowRoleSelection: true,
    availableRoles: ['therapist', 'client'],
    roleDetectionMethod: 'manual'
  }
};

/**
 * URL patterns for role detection
 */
export const ROLE_URL_PATTERNS = {
  therapist: [
    /^(https?:\/\/)?(www\.)?ataraxia\.(com|io|app)/i,
    /^(https?:\/\/)?therapist\./i,
    /^(https?:\/\/)?provider\./i,
    /\/therapist/i,
    /\/provider/i,
    /\/register-therapist/i
  ],
  client: [
    /^(https?:\/\/)?client\./i,
    /^(https?:\/\/)?patient\./i,
    /^(https?:\/\/)?app\./i,
    /\/client/i,
    /\/patient/i,
    /\/register-client/i,
    /\/book/i
  ]
};

/**
 * Detect role based on current URL/context
 */
export function detectRoleFromContext(): UserRole {
  const url = window.location.href;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Check for client patterns first (more specific)
  for (const pattern of ROLE_URL_PATTERNS.client) {
    if (pattern.test(url) || pattern.test(hostname) || pattern.test(pathname)) {
      return 'client';
    }
  }

  // Check for therapist patterns
  for (const pattern of ROLE_URL_PATTERNS.therapist) {
    if (pattern.test(url) || pattern.test(hostname) || pattern.test(pathname)) {
      return 'therapist';
    }
  }

  // Check environment variable override
  const envRole = import.meta.env.VITE_DEFAULT_REGISTRATION_ROLE;
  if (envRole && ['therapist', 'client'].includes(envRole)) {
    return envRole as UserRole;
  }

  // Default to therapist for main web platform
  return 'therapist';
}

/**
 * Get role configuration for current context
 */
export function getCurrentRoleConfig(): RoleConfig {
  const isDev = import.meta.env.DEV || import.meta.env.VITE_ENVIRONMENT === 'development';
  
  // Development mode - allow manual selection
  if (isDev) {
    return ROLE_CONFIGS.dev;
  }

  // Detect based on URL
  const detectedRole = detectRoleFromContext();
  
  if (detectedRole === 'client') {
    return ROLE_CONFIGS.client;
  }

  // Default to web (therapist)
  return ROLE_CONFIGS.web;
}

/**
 * Check if role selection should be shown
 */
export function shouldShowRoleSelection(): boolean {
  const config = getCurrentRoleConfig();
  return config.allowRoleSelection;
}

/**
 * Get default role for registration
 */
export function getDefaultRegistrationRole(): UserRole {
  const config = getCurrentRoleConfig();
  return config.defaultRole;
}

/**
 * Get available roles for selection (if allowed)
 */
export function getAvailableRoles(): UserRole[] {
  const config = getCurrentRoleConfig();
  return config.availableRoles;
}

/**
 * Validate if a role is allowed in current context
 */
export function isRoleAllowed(role: UserRole): boolean {
  const config = getCurrentRoleConfig();
  return config.availableRoles.includes(role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    therapist: 'Therapist / Provider',
    client: 'Client / Patient',
    super_admin: 'Super Administrator',
    org_admin: 'Organization Administrator',
    admin: 'Administrator'
  };
  return displayNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    therapist: 'Mental health professionals providing therapy services',
    client: 'Individuals seeking therapy and mental health support',
    super_admin: 'System administrators with full access',
    org_admin: 'Organization-level administrators',
    admin: 'Administrative users with elevated permissions'
  };
  return descriptions[role] || '';
}

/**
 * Get redirect URL after registration based on role
 */
export function getPostRegistrationRedirect(role: UserRole): string {
  const redirects: Record<UserRole, string> = {
    therapist: '/therapist/home',
    client: '/client/dashboard',
    super_admin: '/admin/dashboard',
    org_admin: '/org/dashboard',
    admin: '/admin/dashboard'
  };
  return redirects[role] || '/';
}

/**
 * Configuration for environment variables
 * Add these to your .env file:
 * 
 * # Default role for registration (therapist | client)
 * VITE_DEFAULT_REGISTRATION_ROLE=therapist
 * 
 * # Allow manual role selection in registration (true | false)
 * VITE_ALLOW_ROLE_SELECTION=false
 * 
 * # Environment (development | staging | production)
 * VITE_ENVIRONMENT=production
 */
