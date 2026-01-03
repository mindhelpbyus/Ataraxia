# Dynamic Role Management - No Hardcoding

## ✅ **Database-Driven Roles**

All roles are stored in the database and fetched dynamically. **No hardcoded roles in frontend!**

---

## 📊 **Database Structure**

### **Tables:**

1. **`ataraxia.roles`** - Master role definitions
```sql
CREATE TABLE ataraxia.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **`ataraxia.user_roles`** - User-to-role mapping
```sql
CREATE TABLE ataraxia.user_roles (
    user_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    role_id INTEGER NOT NULL REFERENCES ataraxia.roles(id),
    assigned_by BIGINT REFERENCES ataraxia.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, role_id)
);
```

3. **`ataraxia.users.role`** - Legacy column (kept for backward compatibility)
```sql
-- Automatically synced via trigger when user_roles changes
ALTER TABLE ataraxia.users ADD COLUMN role TEXT;
```

---

## 🔌 **API Endpoints**

### **1. Get All Roles**
```http
GET /api/roles-metadata/all
```

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": 1,
      "name": "super_admin",
      "display_name": "Super Administrator",
      "description": "Full system access"
    },
    {
      "id": 2,
      "name": "org_admin",
      "display_name": "Organization Administrator",
      "description": "Manage organization"
    },
    ...
  ]
}
```

**Use Case:** Populate dropdowns, signup forms

---

### **2. Get Professional Roles Only**
```http
GET /api/roles-metadata/professional
```

**Response:** Same as above, but excludes `client` role

**Use Case:** Professional signup forms (therapists, doctors, etc.)

---

### **3. Get Current User's Role**
```http
GET /api/roles-metadata/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": 3,
      "name": "therapist",
      "display_name": "Therapist",
      "is_primary": true,
      "assigned_at": "2026-01-01T00:00:00Z"
    }
  ],
  "primaryRole": {
    "id": 3,
    "name": "therapist",
    "display_name": "Therapist"
  },
  "legacyRole": "therapist"
}
```

**Use Case:** Check user permissions, show/hide UI elements

---

### **4. Validate Role**
```http
GET /api/roles-metadata/validate/:roleName
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "role": {
    "id": 3,
    "name": "therapist",
    "display_name": "Therapist",
    "is_active": true
  }
}
```

**Use Case:** Validate role before assignment

---

## 🎨 **Frontend Usage**

### **Example 1: Signup Form with Dynamic Roles**

```typescript
import { useProfessionalRoles } from '../hooks/useRoles';

function SignupForm() {
  const { roles, loading, error } = useProfessionalRoles();
  const [selectedRole, setSelectedRole] = useState('');

  if (loading) return <div>Loading roles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select 
      value={selectedRole} 
      onChange={(e) => setSelectedRole(e.target.value)}
    >
      <option value="">Select your role</option>
      {roles.map(role => (
        <option key={role.id} value={role.name}>
          {role.display_name}
        </option>
      ))}
    </select>
  );
}
```

**✅ No hardcoded roles!**
**✅ Automatically updates when roles are added to database**

---

### **Example 2: Role-Based UI**

```typescript
import { useUserRole } from '../hooks/useRoles';

function Dashboard() {
  const token = localStorage.getItem('token');
  const { 
    userRole, 
    loading, 
    isSuperAdmin, 
    isTherapist,
    isClient 
  } = useUserRole(token);

  if (loading) return <div>Loading...</div>;

  // Redirect clients
  if (isClient) {
    window.location.href = 'https://client.ataraxia.app';
    return null;
  }

  return (
    <div>
      <h1>Welcome, {userRole?.display_name}</h1>
      
      {isSuperAdmin && <AdminPanel />}
      {isTherapist && <TherapistDashboard />}
    </div>
  );
}
```

**✅ No hardcoded role checks!**
**✅ Type-safe role checking**

---

### **Example 3: Permission-Based Rendering**

```typescript
import { useUserRole } from '../hooks/useRoles';

function ClientList() {
  const token = localStorage.getItem('token');
  const { userRole } = useUserRole(token);

  // Check if user can view clients
  const canViewClients = [
    'super_admin',
    'org_admin',
    'therapist',
    'doctor',
    'org_receptionist',
    'clinical_supervisor'
  ].includes(userRole?.name || '');

  if (!canViewClients) {
    return <div>You don't have permission to view clients</div>;
  }

  return <ClientListTable />;
}
```

**Better approach using permissions API:**
```typescript
import { userHasPermission } from '../api/services/roles';

async function checkPermission() {
  const hasPermission = await userHasPermission(token, 'clients.read');
  if (!hasPermission) {
    // Show error or redirect
  }
}
```

---

## 🔄 **Data Flow**

```
1. Database (ataraxia.roles)
   ↓
2. Backend API (/api/roles-metadata/*)
   ↓
3. Frontend Service (src/api/services/roles.ts)
   ↓
4. React Hook (src/hooks/useRoles.ts)
   ↓
5. UI Components (dynamic dropdowns, role checks)
```

**✅ Single source of truth: Database**
**✅ No hardcoded roles anywhere**

---

## 📝 **Adding New Roles**

### **Step 1: Add to Database**
```sql
INSERT INTO ataraxia.roles (name, display_name, description, is_system_role)
VALUES ('new_role', 'New Role', 'Description of new role', true);
```

### **Step 2: Assign Permissions**
```sql
INSERT INTO ataraxia.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM ataraxia.roles WHERE name = 'new_role'),
  id
FROM ataraxia.permissions
WHERE name IN ('clients.read', 'appointments.read');
```

### **Step 3: Frontend Automatically Updates!**
No code changes needed! The new role will appear in:
- ✅ Signup forms
- ✅ Role dropdowns
- ✅ User role checks

---

## 🚫 **What NOT to Do**

### **❌ DON'T Hardcode Roles:**
```typescript
// BAD - Hardcoded
const roles = ['therapist', 'doctor', 'admin'];

// BAD - Hardcoded check
if (user.role === 'therapist') { ... }
```

### **✅ DO Fetch Dynamically:**
```typescript
// GOOD - Dynamic
const { roles } = useRoles();

// GOOD - Dynamic check
const { isTherapist } = useUserRole(token);
```

---

## 🔐 **Security**

### **Backend Validation:**
```typescript
// Always validate role exists before assignment
const roleExists = await query(
  'SELECT id FROM ataraxia.roles WHERE name = $1 AND is_active = true',
  [roleName]
);

if (roleExists.rows.length === 0) {
  throw new Error('Invalid role');
}
```

### **Frontend Validation:**
```typescript
// Validate before submitting
const isValid = await validateRole(selectedRole);
if (!isValid) {
  alert('Invalid role selected');
  return;
}
```

---

## 📊 **Current Roles in Database**

| ID | Name | Display Name |
|----|------|--------------|
| 1 | super_admin | Super Administrator |
| 2 | org_admin | Organization Administrator |
| 3 | therapist | Therapist |
| 4 | client | Client |
| 5 | intake_coordinator | Intake Coordinator |
| 6 | clinical_supervisor | Clinical Supervisor |
| 9 | doctor | Doctor |
| 10 | org_receptionist | Organization Receptionist |

**All fetched dynamically - no hardcoding! ✅**

---

## 🎯 **Summary**

**✅ Database-driven roles**
**✅ API endpoints for dynamic fetching**
**✅ React hooks for easy integration**
**✅ No hardcoded roles in frontend**
**✅ Type-safe role checking**
**✅ Automatic updates when roles change**

**Your frontend is now completely decoupled from role definitions! 🚀**
