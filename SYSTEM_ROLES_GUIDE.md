# Ataraxia System - User Roles & Access

## 🎯 **Product Scope**

**Ataraxia is a practice management system for:**
- ✅ Therapists
- ✅ Doctors
- ✅ Organization Admins
- ✅ Super Admins
- ✅ Organization Receptionists

**NOT for:**
- ❌ Clients/Patients (they will have a separate client portal later)

---

## 👥 **System Roles**

### **1. Super Admin**
**Role:** `super_admin`

**Access:**
- ✅ Full system access
- ✅ Manage all organizations
- ✅ Manage all users
- ✅ System settings
- ✅ Analytics & reports
- ✅ Billing management

**Use Case:** Platform administrators, system owners

---

### **2. Organization Admin**
**Role:** `org_admin`

**Access:**
- ✅ Manage their organization
- ✅ Manage organization users (therapists, receptionists)
- ✅ Organization settings
- ✅ Billing for their org
- ✅ Reports for their org
- ❌ Cannot access other organizations
- ❌ Cannot access system settings

**Use Case:** Practice owners, clinic managers

---

### **3. Therapist**
**Role:** `therapist`

**Access:**
- ✅ View/manage their clients
- ✅ View/manage their appointments
- ✅ Clinical notes
- ✅ Treatment plans
- ✅ Video sessions
- ✅ Messaging with clients
- ✅ Their own schedule
- ❌ Cannot manage organization
- ❌ Cannot see other therapists' clients (unless shared)

**Use Case:** Licensed therapists, counselors, psychologists

---

### **4. Doctor**
**Role:** `doctor`

**Access:**
- ✅ Same as therapist
- ✅ Prescriptions (if applicable)
- ✅ Medical records
- ✅ Lab orders (if applicable)

**Use Case:** Psychiatrists, medical doctors

---

### **5. Organization Receptionist**
**Role:** `org_receptionist`

**Access:**
- ✅ Schedule appointments for all therapists
- ✅ View client contact info
- ✅ Manage intake forms
- ✅ Check-in/check-out clients
- ✅ Basic billing (payments, invoices)
- ❌ Cannot view clinical notes
- ❌ Cannot view treatment plans
- ❌ Cannot access sensitive medical info

**Use Case:** Front desk staff, schedulers

---

### **6. Clinical Supervisor**
**Role:** `clinical_supervisor`

**Access:**
- ✅ View all therapists in their org
- ✅ Review clinical notes (supervision)
- ✅ Review treatment plans
- ✅ Reports on therapist performance
- ✅ Quality assurance
- ❌ Cannot manage organization settings
- ❌ Cannot manage billing

**Use Case:** Senior therapists, clinical directors

---

### **7. Intake Coordinator**
**Role:** `intake_coordinator`

**Access:**
- ✅ Manage new client intake
- ✅ Initial assessments
- ✅ Assign clients to therapists
- ✅ Insurance verification
- ❌ Cannot view ongoing treatment
- ❌ Cannot access clinical notes

**Use Case:** Intake specialists

---

### **8. Client** ❌ (Redirected to Client Portal)
**Role:** `client`

**Access:**
- ❌ **NOT allowed in this system**
- 🔄 **Redirected to:** `https://client.ataraxia.app` (future client portal)

**Use Case:** Patients - will have separate portal

---

## 🔐 **Permission Matrix**

| Feature | Super Admin | Org Admin | Therapist | Doctor | Receptionist | Clinical Supervisor | Intake Coordinator |
|---------|-------------|-----------|-----------|--------|--------------|---------------------|-------------------|
| **Manage Organizations** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Org Users** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View All Clients** | ✅ | ✅ | Own Only | Own Only | ✅ | ✅ | ✅ |
| **Clinical Notes** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Read) | ❌ |
| **Treatment Plans** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Read) | ❌ |
| **Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Read) | ✅ |
| **Billing** | ✅ | ✅ | ❌ | ❌ | ✅ (Basic) | ❌ | ❌ |
| **Reports** | ✅ | ✅ | Own Only | Own Only | ❌ | ✅ | ❌ |
| **Prescriptions** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Intake Forms** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 **Implementation**

### **Client Redirect Logic**

```typescript
// In your login handler or route guard
if (user.role === 'client') {
  // Redirect to future client portal
  window.location.href = 'https://client.ataraxia.app';
  // Or show a message:
  // "Client portal coming soon. Please contact your therapist."
  return;
}

// Allow all other roles to access the system
const allowedRoles = [
  'super_admin',
  'org_admin', 
  'therapist',
  'doctor',
  'org_receptionist',
  'clinical_supervisor',
  'intake_coordinator'
];

if (!allowedRoles.includes(user.role)) {
  // Unauthorized
  return redirect('/unauthorized');
}
```

### **Database Roles**

Already created in RBAC migration:
```sql
SELECT name, display_name FROM ataraxia.roles;

-- Results:
super_admin          | Super Administrator
org_admin            | Organization Administrator
therapist            | Therapist
client               | Client (redirected)
intake_coordinator   | Intake Coordinator
clinical_supervisor  | Clinical Supervisor
```

**Need to add:**
```sql
INSERT INTO ataraxia.roles (name, display_name, description, is_system_role)
VALUES 
  ('doctor', 'Doctor', 'Medical doctor or psychiatrist', true),
  ('org_receptionist', 'Organization Receptionist', 'Front desk staff', true);
```

---

## 📋 **Role Assignment**

### **Default Role on Signup:**
- Email/Password signup: `therapist` (default)
- Phone signup: `client` → redirected
- Google/Apple: `therapist` (default)

### **Changing Roles:**
Only `super_admin` and `org_admin` can assign roles:

```typescript
// Assign role
POST /api/roles/assign
{
  "userId": "1000001",
  "roleName": "org_receptionist",
  "isPrimary": true
}
```

---

## 🎨 **UI/UX Per Role**

### **Super Admin:**
- Full sidebar with all features
- System settings tab
- Organization management
- User management across all orgs

### **Org Admin:**
- Organization dashboard
- User management (their org only)
- Billing & settings
- Reports

### **Therapist/Doctor:**
- Client list
- Appointments
- Clinical notes
- Treatment plans
- Video sessions
- Messaging

### **Receptionist:**
- Appointment calendar (all therapists)
- Client check-in/out
- Basic billing
- Contact management
- NO access to clinical notes

### **Clinical Supervisor:**
- Therapist oversight
- Note review
- Quality assurance
- Reports

### **Intake Coordinator:**
- New client intake
- Initial assessments
- Client assignment
- Insurance verification

---

## 🔄 **Migration Path**

### **Existing Users:**
All existing users with `role = 'client'` in the database:

**Option 1: Keep in DB, redirect on login**
```typescript
if (user.role === 'client') {
  return redirect('https://client.ataraxia.app');
}
```

**Option 2: Mark as inactive**
```sql
UPDATE ataraxia.users 
SET is_active = false,
    notes = 'Client - moved to client portal'
WHERE role = 'client';
```

**Option 3: Delete (not recommended)**
```sql
-- Only if you're sure
DELETE FROM ataraxia.users WHERE role = 'client';
```

---

## ✅ **Summary**

**Ataraxia Practice Management System is for:**
1. ✅ Super Admins
2. ✅ Organization Admins
3. ✅ Therapists
4. ✅ Doctors
5. ✅ Receptionists
6. ✅ Clinical Supervisors
7. ✅ Intake Coordinators

**Clients:**
- ❌ Not allowed in this system
- 🔄 Redirected to future client portal
- 📱 Will have separate mobile/web app

**This keeps the system focused on practice management, not patient-facing features.**

---

**Ready to implement! 🚀**
