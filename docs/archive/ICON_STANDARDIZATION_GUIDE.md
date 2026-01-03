# 🎨 Icon Standardization Guide - Ataraxia

## Overview
We use **both Lucide-React and Phosphor Icons** in our codebase. This guide standardizes which library to use for which icons to avoid duplication and maintain consistency.

---

## 📊 Duplicate Icons Found

### Current Issues
Many components import the **same icon from both libraries**:

```typescript
// ❌ DUPLICATE USAGE (AppointmentPanel.tsx)
import { 
  User,           // Phosphor
  Phone,          // Phosphor  
  EnvelopeSimple, // Phosphor
  Clock,          // Phosphor
  MapPin,         // Phosphor
  FileText,       // Phosphor
  Trash,          // Phosphor
  X as XIcon      // Phosphor
} from '@phosphor-icons/react';

import { 
  Mail,      // Lucide (same as EnvelopeSimple)
  Edit,      // Lucide (same as PencilSimple)
  Trash2,    // Lucide (same as Trash)
  Video,     // Lucide
  PhoneCall  // Lucide (similar to Phone)
} from 'lucide-react';
```

---

## ✅ Standardization Rules

### 1️⃣ **Navigation & System UI** → **LUCIDE-REACT**

Use for all navigation, dashboards, admin interfaces, settings:

| Icon Purpose | Use This | Library |
|-------------|----------|---------|
| Dashboard | `LayoutDashboard` | Lucide |
| Calendar | `Calendar` | Lucide |
| Users/Clients | `Users` | Lucide |
| Single User | `User` | Lucide |
| Messages | `MessageSquare` | Lucide |
| Settings | `Settings` | Lucide |
| Tasks | `CheckSquare` | Lucide |
| Notes | `FileText` | Lucide |
| Analytics | `BarChart3` | Lucide |
| Search | `Search` | Lucide |
| Email | `Mail` | Lucide |
| Phone | `Phone` | Lucide |
| Location | `MapPin` | Lucide |
| Delete | `Trash2` | Lucide |
| Close | `X` | Lucide |
| Edit | `Edit` | Lucide |

**Components that should use Lucide:**
- ✅ DashboardLayout
- ✅ SettingsSidebar
- ✅ EnhancedClientsTable
- ✅ EnhancedTherapistsTable
- ✅ AdminDashboardView
- ✅ SuperAdminDashboardView
- ✅ All Settings views

---

### 2️⃣ **Calendar Navigation** → **PHOSPHOR ICONS**

Use for calendar-specific navigation (carets are more appropriate):

| Icon Purpose | Use This | Library |
|-------------|----------|---------|
| Previous (date nav) | `CaretLeft` | Phosphor |
| Next (date nav) | `CaretRight` | Phosphor |
| Dropdown | `CaretDown` | Phosphor |
| Empty calendar | `CalendarBlank` | Phosphor |
| Add button | `Plus` | Phosphor |

**Components that should use Phosphor:**
- ✅ CalendarContainer (date navigation)
- ✅ MiniCalendar (date picker)
- ✅ AgendaView (if using carets)

---

### 3️⃣ **Healthcare/Medical Context** → **PHOSPHOR ICONS**

Use Phosphor for healthcare-specific icons:

| Icon Purpose | Use This | Library |
|-------------|----------|---------|
| Medical kit | `FirstAidKit` | Phosphor |
| Heart/health | `Heart` | Phosphor |
| Warning | `Warning` | Phosphor |
| Pills | `Pill` | Phosphor |

**Components that should use Phosphor:**
- ✅ ClientIntakeForm
- ✅ ClientDetailsSidebar
- ✅ Medical-related forms

---

### 4️⃣ **Creative/Special UI** → **PHOSPHOR ICONS**

Use Phosphor for unique creative elements:

| Icon Purpose | Use This | Library |
|-------------|----------|---------|
| Pin | `PushPin` | Phosphor |
| Save (floppy) | `FloppyDisk` | Phosphor |
| Color palette | `Palette` | Phosphor |
| List checks | `ListChecks` | Phosphor |

**Components that should use Phosphor:**
- ✅ QuickNotesView (sticky notes)
- ✅ TasksView (if using ListChecks)

---

## 🔄 Duplicate Icon Mappings

When you see these duplicates, **always prefer the library in the "Use" column**:

| Purpose | ❌ Don't Use | ✅ Use Instead | Context |
|---------|-------------|----------------|---------|
| Email | `EnvelopeSimple` (Phosphor) | `Mail` (Lucide) | System UI |
| Edit | `PencilSimple` (Phosphor) | `Edit` (Lucide) | System UI |
| Delete | `Trash` (Phosphor) | `Trash2` (Lucide) | System UI |
| User | `User` (Phosphor) | `User` (Lucide) | System UI |
| Phone | `Phone` (Phosphor) | `Phone` (Lucide) | System UI |
| Location | `MapPin` (Phosphor) | `MapPin` (Lucide) | System UI |
| Close | `X` (Phosphor) | `X` (Lucide) | System UI |
| Calendar | `CalendarBlank` (Phosphor) | `Calendar` (Lucide) | System UI |
| Clock/Time | `Clock` (Phosphor) | `Clock` (Lucide) | System UI |
| Search | `MagnifyingGlass` (Phosphor) | `Search` (Lucide) | System UI |
| More menu | `DotsThree` (Phosphor) | `MoreVertical` (Lucide) | System UI |
| Plus/Add | `Plus` (Phosphor) | `Plus` (Lucide) | System UI |
| File/Note | `FileText` (Phosphor) | `FileText` (Lucide) | System UI |
| Check/Success | `CheckCircle` (Phosphor) | `CheckCircle2` (Lucide) | System UI |
| Warning | `WarningCircle` (Phosphor) | `AlertCircle` (Lucide) | System UI |

**EXCEPTION:** Use Phosphor versions in:
- Calendar date navigation (carets are more appropriate)
- Healthcare/medical contexts
- Sticky notes and creative UI

---

## 📝 Component-Specific Fixes Needed

### 🔴 **AppointmentPanel.tsx** - NEEDS CLEANUP
**Current:** Uses both libraries with duplicates  
**Fix:** Use Lucide for all standard UI icons

```typescript
// ❌ BEFORE - Mixed usage
import { 
  CalendarBlank, Clock, User, Phone, EnvelopeSimple, FileText, 
  PencilSimple, Trash, WarningCircle, CheckCircle, MapPin, X 
} from '@phosphor-icons/react';
import { AlertCircle, Mail, Edit, Trash2, Save, XCircle, Video, PhoneCall } from 'lucide-react';

// ✅ AFTER - Standardized
import { 
  Calendar, Clock, User, Phone, Mail, FileText, 
  Edit, Trash2, AlertCircle, CheckCircle2, MapPin, X,
  Video, PhoneCall, Save, XCircle
} from 'lucide-react';
```

---

### 🔴 **CalendarContainer.tsx** - KEEP AS IS (Correct)
**Current:** Uses Phosphor for calendar navigation  
**Status:** ✅ Correct - Carets are appropriate for date navigation

```typescript
// ✅ CORRECT - Keep this
import { CaretLeft, CaretRight, Plus, CalendarBlank } from '@phosphor-icons/react';
```

---

### 🔴 **ClientsView.tsx** - NEEDS CLEANUP
**Current:** Uses Phosphor for standard UI  
**Fix:** Use Lucide for standard icons, keep Phosphor for medical context

```typescript
// ❌ BEFORE - Phosphor for standard UI
import { 
  MagnifyingGlass, Funnel, Plus, DotsThree, Phone, 
  EnvelopeSimple, CalendarBlank, User, X, MapPin 
} from '@phosphor-icons/react';

// ✅ AFTER - Lucide for UI, Phosphor for medical
import { 
  Search, Filter, Plus, MoreVertical, Phone, 
  Mail, Calendar, User, X, MapPin 
} from 'lucide-react';
import { FirstAidKit, Heart } from '@phosphor-icons/react'; // Keep medical icons
```

---

### 🔴 **SessionNotesView.tsx** - NEEDS CLEANUP
**Current:** Uses Phosphor for standard UI  
**Fix:** Use Lucide for standard UI icons

```typescript
// ❌ BEFORE
import { 
  NotePencil, MagnifyingGlass, Funnel, Plus, 
  CalendarBlank, User, Clock, FileText 
} from '@phosphor-icons/react';

// ✅ AFTER
import { 
  Edit, Search, Filter, Plus, 
  Calendar, User, Clock, FileText 
} from 'lucide-react';
```

---

### 🔴 **TasksView.tsx** - KEEP MOSTLY AS IS
**Current:** Uses Phosphor  
**Status:** ✅ Can keep `ListChecks` from Phosphor (unique icon)  
**Fix:** Change standard icons to Lucide

```typescript
// ❌ BEFORE
import { 
  ListChecks, Plus, Funnel, CheckCircle, 
  Clock, Warning 
} from '@phosphor-icons/react';

// ✅ AFTER
import { ListChecks } from '@phosphor-icons/react'; // Unique icon
import { 
  Plus, Filter, CheckCircle2, 
  Clock, AlertTriangle 
} from 'lucide-react';
```

---

### 🟢 **QuickNotesView.tsx** - KEEP AS IS
**Current:** Uses Phosphor for creative UI (sticky notes)  
**Status:** ✅ Correct - Phosphor's style fits sticky notes

```typescript
// ✅ CORRECT - Keep this
import { Plus, Trash, PushPin, Palette, X, FloppyDisk } from '@phosphor-icons/react';
```

---

### 🟢 **ClientIntakeForm.tsx** - KEEP AS IS
**Current:** Uses Phosphor for medical context  
**Status:** ✅ Correct - Medical/healthcare icons

```typescript
// ✅ CORRECT - Keep healthcare/medical icons in Phosphor
import { 
  FirstAidKit, Heart, Warning, IdentificationCard,
  CalendarBlank, User, Phone, EnvelopeSimple, MapPin 
} from '@phosphor-icons/react';
```

---

## 🎯 Implementation Priority

### **Phase 1: Critical Fixes** (High Priority)
1. ✅ **AppointmentPanel.tsx** - Remove all Phosphor duplicates
2. ✅ **ClientsView.tsx** - Standardize to Lucide
3. ✅ **SessionNotesView.tsx** - Standardize to Lucide

### **Phase 2: Optimization** (Medium Priority)
4. ✅ **TasksView.tsx** - Keep ListChecks, change others to Lucide
5. ✅ **EnhancedClientsTable.tsx** - Verify using Lucide
6. ✅ **EnhancedTherapistsTable.tsx** - Verify using Lucide

### **Phase 3: Keep As Is** (No Action Needed)
- ✅ CalendarContainer.tsx
- ✅ MiniCalendar.tsx
- ✅ QuickNotesView.tsx
- ✅ ClientIntakeForm.tsx
- ✅ ClientDetailsSidebar.tsx
- ✅ AgendaView.tsx

---

## 📦 Bundle Size Impact

After standardization:
- **Remove:** ~10-15 duplicate icon imports
- **Bundle size reduction:** ~5-8KB (minor but cleaner)
- **Main benefit:** Code consistency and maintainability

---

## 🛠️ Quick Reference

### When adding new icons:

```typescript
// 1. Is it navigation/system UI?
import { IconName } from 'lucide-react'; // ✅ YES

// 2. Is it calendar date navigation?
import { CaretLeft, CaretRight } from '@phosphor-icons/react'; // ✅ YES

// 3. Is it healthcare/medical?
import { FirstAidKit, Heart } from '@phosphor-icons/react'; // ✅ YES

// 4. Is it creative UI (notes, pins)?
import { PushPin, FloppyDisk } from '@phosphor-icons/react'; // ✅ YES

// 5. Not sure?
// Default to Lucide unless it's one of the special cases above
```

---

## 📚 Resources

- **Lucide Icons:** https://lucide.dev/icons/
- **Phosphor Icons:** https://phosphoricons.com/

---

**Last Updated:** November 24, 2024  
**Status:** ✅ Guidelines Established - Ready for Implementation
