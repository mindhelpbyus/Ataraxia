/**
 * Demo Users for Testing
 * 
 * These are pre-configured users for testing the calendar system.
 * Each user has credentials for easy login.
 */

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'therapist' | 'client' | 'admin' | 'superadmin';
  avatar?: string;
  specialization?: string; // For therapists
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Demo Therapists
 * Use these credentials to login as a therapist
 */
export const DEMO_THERAPISTS: DemoUser[] = [
  // Original demo therapists
  {
    id: '1',
    email: 'therapist3@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. Sarah Mitchell',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    role: 'therapist',
    specialization: 'Clinical Psychology',
    phoneNumber: '+1 (555) 101-1001'
  },
  {
    id: '2',
    email: 'therapist4@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. James Chen',
    firstName: 'James',
    lastName: 'Chen',
    role: 'therapist',
    specialization: 'Cognitive Behavioral Therapy',
    phoneNumber: '+1 (555) 102-1002'
  },
  {
    id: 'll3Zs4qw6LBkVTJphzya',
    email: 'newtest@example.com',
    password: 'Test123!',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'therapist',
    specialization: 'General Practice',
    phoneNumber: '+1 (555) 103-1003'
  },
  {
    id: 'USR-THERAPIST-TEST',
    email: 'therapist-test@example.com',
    password: 'Test123!',
    name: 'User USR-THERAPIST-TEST',
    firstName: 'Test',
    lastName: 'Therapist',
    role: 'therapist',
    specialization: 'General Practice',
    phoneNumber: '+1 (555) 104-1004'
  },
  // 10 New Test Therapists for Backend Testing
  {
    id: 'USR-THERAPIST-001',
    email: 'therapist001@example.com',
    password: 'Test123!',
    name: 'Dr. Emily Johnson',
    firstName: 'Emily',
    lastName: 'Johnson',
    role: 'therapist',
    specialization: 'Family Therapy',
    phoneNumber: '+1 (555) 201-0001'
  },
  {
    id: 'USR-THERAPIST-002',
    email: 'therapist002@example.com',
    password: 'Test123!',
    name: 'Dr. Michael Brown',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'therapist',
    specialization: 'Trauma Therapy',
    phoneNumber: '+1 (555) 201-0002'
  },
  {
    id: 'USR-THERAPIST-003',
    email: 'therapist003@example.com',
    password: 'Test123!',
    name: 'Dr. Sophia Davis',
    firstName: 'Sophia',
    lastName: 'Davis',
    role: 'therapist',
    specialization: 'Child Psychology',
    phoneNumber: '+1 (555) 201-0003'
  },
  {
    id: 'USR-THERAPIST-004',
    email: 'therapist004@example.com',
    password: 'Test123!',
    name: 'Dr. David Wilson',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'therapist',
    specialization: 'Addiction Counseling',
    phoneNumber: '+1 (555) 201-0004'
  },
  {
    id: 'USR-THERAPIST-005',
    email: 'therapist005@example.com',
    password: 'Test123!',
    name: 'Dr. Olivia Martinez',
    firstName: 'Olivia',
    lastName: 'Martinez',
    role: 'therapist',
    specialization: 'Couples Therapy',
    phoneNumber: '+1 (555) 201-0005'
  },
  {
    id: 'USR-THERAPIST-006',
    email: 'therapist006@example.com',
    password: 'Test123!',
    name: 'Dr. William Garcia',
    firstName: 'William',
    lastName: 'Garcia',
    role: 'therapist',
    specialization: 'Anxiety Disorders',
    phoneNumber: '+1 (555) 201-0006'
  },
  {
    id: 'USR-THERAPIST-007',
    email: 'therapist007@example.com',
    password: 'Test123!',
    name: 'Dr. Emma Rodriguez',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    role: 'therapist',
    specialization: 'Depression Treatment',
    phoneNumber: '+1 (555) 201-0007'
  },
  {
    id: 'USR-THERAPIST-008',
    email: 'therapist008@example.com',
    password: 'Test123!',
    name: 'Dr. Alexander Lee',
    firstName: 'Alexander',
    lastName: 'Lee',
    role: 'therapist',
    specialization: 'PTSD Specialist',
    phoneNumber: '+1 (555) 201-0008'
  },
  {
    id: 'USR-THERAPIST-009',
    email: 'therapist009@example.com',
    password: 'Test123!',
    name: 'Dr. Isabella White',
    firstName: 'Isabella',
    lastName: 'White',
    role: 'therapist',
    specialization: 'Behavioral Therapy',
    phoneNumber: '+1 (555) 201-0009'
  },
  {
    id: 'USR-THERAPIST-010',
    email: 'therapist010@example.com',
    password: 'Test123!',
    name: 'Dr. Daniel Harris',
    firstName: 'Daniel',
    lastName: 'Harris',
    role: 'therapist',
    specialization: 'Group Therapy',
    phoneNumber: '+1 (555) 201-0010'
  }
];

/**
 * Demo Clients/Clients
 * Use these credentials to login as a client/client
 */
export const DEMO_CLIENTS: DemoUser[] = [
  // Original demo clients
  {
    id: '4',
    email: 'susan.marie@email.com',
    password: 'client123',
    name: 'Susan Marie',
    firstName: 'Susan',
    lastName: 'Marie',
    role: 'client',
    phoneNumber: '+1 (555) 104-1004'
  },
  {
    id: '5',
    email: 'john.paul@email.com',
    password: 'client123',
    name: 'John Paul',
    firstName: 'John',
    lastName: 'Paul',
    role: 'client',
    phoneNumber: '+1 (555) 105-1005'
  },
  {
    id: 'USR-CLIENT-2025',
    email: 'client-test@example.com',
    password: 'Test123!',
    name: 'Test Client',
    firstName: 'Test',
    lastName: 'Client',
    role: 'client',
    phoneNumber: '+1 (555) 106-1006'
  },
  // 10 New Test Clients for Backend Testing
  {
    id: 'USR-CLIENT-001',
    email: 'client001@example.com',
    password: 'Test123!',
    name: 'Alice Thompson',
    firstName: 'Alice',
    lastName: 'Thompson',
    role: 'client',
    phoneNumber: '+1 (555) 301-0001'
  },
  {
    id: 'USR-CLIENT-002',
    email: 'client002@example.com',
    password: 'Test123!',
    name: 'Robert Anderson',
    firstName: 'Robert',
    lastName: 'Anderson',
    role: 'client',
    phoneNumber: '+1 (555) 301-0002'
  },
  {
    id: 'USR-CLIENT-003',
    email: 'client003@example.com',
    password: 'Test123!',
    name: 'Patricia Taylor',
    firstName: 'Patricia',
    lastName: 'Taylor',
    role: 'client',
    phoneNumber: '+1 (555) 301-0003'
  },
  {
    id: 'USR-CLIENT-004',
    email: 'client004@example.com',
    password: 'Test123!',
    name: 'Christopher Moore',
    firstName: 'Christopher',
    lastName: 'Moore',
    role: 'client',
    phoneNumber: '+1 (555) 301-0004'
  },
  {
    id: 'USR-CLIENT-005',
    email: 'client005@example.com',
    password: 'Test123!',
    name: 'Jennifer Jackson',
    firstName: 'Jennifer',
    lastName: 'Jackson',
    role: 'client',
    phoneNumber: '+1 (555) 301-0005'
  },
  {
    id: 'USR-CLIENT-006',
    email: 'client006@example.com',
    password: 'Test123!',
    name: 'Matthew Martin',
    firstName: 'Matthew',
    lastName: 'Martin',
    role: 'client',
    phoneNumber: '+1 (555) 301-0006'
  },
  {
    id: 'USR-CLIENT-007',
    email: 'client007@example.com',
    password: 'Test123!',
    name: 'Linda Thompson',
    firstName: 'Linda',
    lastName: 'Thompson',
    role: 'client',
    phoneNumber: '+1 (555) 301-0007'
  },
  {
    id: 'USR-CLIENT-008',
    email: 'client008@example.com',
    password: 'Test123!',
    name: 'James Garcia',
    firstName: 'James',
    lastName: 'Garcia',
    role: 'client',
    phoneNumber: '+1 (555) 301-0008'
  },
  {
    id: 'USR-CLIENT-009',
    email: 'client009@example.com',
    password: 'Test123!',
    name: 'Barbara Martinez',
    firstName: 'Barbara',
    lastName: 'Martinez',
    role: 'client',
    phoneNumber: '+1 (555) 301-0009'
  },
  {
    id: 'USR-CLIENT-010',
    email: 'client010@example.com',
    password: 'Test123!',
    name: 'Richard Robinson',
    firstName: 'Richard',
    lastName: 'Robinson',
    role: 'client',
    phoneNumber: '+1 (555) 301-0010'
  }
];

/**
 * All demo users combined
 */
export const ALL_DEMO_USERS: DemoUser[] = [
  ...DEMO_THERAPISTS,
  ...DEMO_CLIENTS
];

/**
 * Admin user (has access to all features)
 */
export const DEMO_ADMIN: DemoUser = {
  id: 'admin-1',
  email: 'admin3@bedrock.test',
  password: 'Admin123!',
  name: 'System Administrator',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'admin',
  specialization: 'System Administration'
};

/**
 * Super Admin user (platform owner with full access)
 */
export const DEMO_SUPER_ADMIN: DemoUser = {
  id: 'superadmin-1',
  email: 'superadmin@bedrock.test',
  password: 'SuperAdmin123!',
  name: 'Platform Owner',
  firstName: 'Platform',
  lastName: 'Owner',
  role: 'superadmin',
  specialization: 'Platform Management'
};

/**
 * Find a user by email
 */
export function findUserByEmail(email: string): DemoUser | undefined {
  const allUsers = [...ALL_DEMO_USERS, DEMO_ADMIN, DEMO_SUPER_ADMIN];
  return allUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string): DemoUser | null {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

/**
 * Get all therapists
 */
export function getAllTherapists(): DemoUser[] {
  return DEMO_THERAPISTS;
}

/**
 * Get all clients
 */
export function getAllClients(): DemoUser[] {
  return DEMO_CLIENTS;
}

// Backward compatibility
export const DEMO_PATIENTS = DEMO_CLIENTS;
export const getAllClients = getAllClients;

/**
 * Get login instructions for demo users
 */
export function getLoginInstructions(): string {
  return `
===========================================
DEMO USER LOGIN CREDENTIALS
===========================================

THERAPISTS:
-----------
1. Dr. Sarah Mitchell
   Email: therapist3@bedrock.test
   Password: Therapist123!

2. Dr. James Chen
   Email: therapist4@bedrock.test
   Password: Therapist123!

3. Test User (Backend Verified)
   Email: newtest@example.com
   Password: Test123!

4. User USR-THERAPIST-TEST (Firestore Verified)
   Email: therapist-test@example.com
   Password: Test123!

TEST THERAPISTS (Backend Ready):
--------------------------------
5-14. therapist001@example.com through therapist010@example.com
      Password: Test123! (for all)
      IDs: USR-THERAPIST-001 through USR-THERAPIST-010

PATIENTS/CLIENTS:
-----------------
1. Susan Marie
   Email: susan.marie@email.com
   Password: client123

2. John Paul
   Email: john.paul@email.com
   Password: client123

3. Test Client
   Email: client-test@example.com
   Password: Test123!
   ID: USR-CLIENT-2025

TEST CLIENTS (Backend Ready):
------------------------------
4-13. client001@example.com through client010@example.com
      Password: Test123! (for all)
      IDs: USR-CLIENT-001 through USR-CLIENT-010

ADMIN:
------
System Administrator
Email: admin3@bedrock.test
Password: Admin123!

SUPER ADMIN:
------------
Platform Owner
Email: superadmin@bedrock.test
Password: SuperAdmin123!

===========================================
HOW TO TEST:
===========================================

1. Use any of the above credentials to login
2. Explore the calendar, appointments, and messaging features
3. Test the therapist onboarding flow from the login page
4. Test video sessions between therapists and clients

===========================================
  `;
}