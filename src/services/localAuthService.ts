/**
 * Local Auth Service for Development
 * Bypasses real authentication for local testing
 */

export const localAuthService = {
  /**
   * Mock login - accepts any password for test users
   */
  async login(email: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test users mapping
    const testUsers: Record<string, any> = {
      'admin@ataraxia.local': {
        id: '1',
        email: 'admin@ataraxia.local',
        name: 'Super Admin',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        account_status: 'active',
      },
      'therapist@ataraxia.local': {
        id: '2',
        email: 'therapist@ataraxia.local',
        name: 'Dr. Sarah Johnson',
        first_name: 'Dr. Sarah',
        last_name: 'Johnson',
        role: 'therapist',
        account_status: 'active',
      },
      'newtherapist@ataraxia.local': {
        id: '3',
        email: 'newtherapist@ataraxia.local',
        name: 'Dr. Michael Chen',
        first_name: 'Dr. Michael',
        last_name: 'Chen',
        role: 'therapist',
        account_status: 'registered', // Needs profile completion
      },
      'client@ataraxia.local': {
        id: '4',
        email: 'client@ataraxia.local',
        name: 'Jane Smith',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'client',
        account_status: 'active',
      },
      'orgadmin@ataraxia.local': {
        id: '5',
        email: 'orgadmin@ataraxia.local',
        name: 'Organization Admin',
        first_name: 'Organization',
        last_name: 'Admin',
        role: 'org_admin',
        account_status: 'active',
      },
    };

    const user = testUsers[email.toLowerCase()];

    if (!user) {
      throw new Error('User not found. Use one of the test accounts.');
    }

    // For local testing, accept any password
    if (!password || password.length < 3) {
      throw new Error('Please enter a password (any password works for testing)');
    }

    return {
      user,
      tokens: {
        accessToken: 'local-test-token-' + Date.now(),
        refreshToken: 'local-refresh-token-' + Date.now(),
        expiresIn: 3600,
      },
      token: 'local-test-token-' + Date.now(),
    };
  },

  /**
   * Mock registration - simply reflects back the data as a new user
   */
  async register(data: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Construct a "newUser" object
    const newUser = {
      id: `local-user-${Date.now()}`,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role || 'client',
      account_status: 'registered', // Default status for new users
    };

    return {
      user: newUser,
      tokens: {
        accessToken: 'local-test-token-' + Date.now(),
        refreshToken: 'local-refresh-token-' + Date.now(),
        expiresIn: 3600,
      },
      token: 'local-test-token-' + Date.now(),
    };
  },

  /**
   * Check if we're in local development mode
   */
  isLocalMode(): boolean {
    return import.meta.env.VITE_API_BASE_URL?.includes('localhost') ||
      import.meta.env.VITE_NODE_ENV === 'development';
  },
};
