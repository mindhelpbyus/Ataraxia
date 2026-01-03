# Ataraxia Design System - Form Input Components

## Overview

This document provides comprehensive guidance on using the centralized form input components throughout the Ataraxia application. All components follow the design system specifications and ensure consistent styling, behavior, and accessibility.

## Components

### 1. InputField
Standard single-line text input with full state support.

**Location:** `/components/ui/input-field.tsx`

**Features:**
- ✅ All states: base, hover, focus, error, success, disabled, filled
- ✅ Left and right icon support
- ✅ Character counter
- ✅ Helper text with state-based coloring
- ✅ Full accessibility (ARIA attributes)
- ✅ Required field indicator

**Usage:**
```tsx
import { InputField } from './components/ui/form-inputs';
import { Mail } from '@phosphor-icons/react';

<InputField
  label="Email Address"
  type="email"
  placeholder="john.doe@example.com"
  leftIcon={<Mail className="w-5 h-5" />}
  required
  showCharCount
  maxLength={100}
  helperText="Enter your work email address"
  error="Invalid email format"
  success={isValidEmail}
  disabled={false}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Props:**
- `label?: string` - Input label text
- `helperText?: string` - Helper text below input (changes color based on state)
- `error?: string` - Error message (shows red state)
- `success?: boolean` - Success state (shows green)
- `required?: boolean` - Shows asterisk, required validation
- `showCharCount?: boolean` - Display character count
- `maxLength?: number` - Maximum character limit
- `leftIcon?: ReactNode` - Icon on the left side
- `rightIcon?: ReactNode` - Icon on the right side
- `disabled?: boolean` - Disabled state
- All standard HTML input props (type, placeholder, value, onChange, etc.)

---

### 2. SearchBar
Search input with magnifying glass icon and keyboard shortcuts.

**Location:** `/components/ui/search-bar.tsx`

**Features:**
- ✅ Search icon automatically included
- ✅ Keyboard shortcut badges (⌘/Ctrl + F)
- ✅ Auto-detects OS for correct keyboard symbol
- ✅ All states: base, hover, focus, filled, disabled
- ✅ Optimized for search interactions

**Usage:**
```tsx
import { SearchBar } from './components/ui/form-inputs';

<SearchBar
  placeholder="Search clients..."
  showKeyboardShortcut={true}
  shortcutKey="F"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onSearch={(value) => performSearch(value)}
  disabled={false}
/>
```

**Props:**
- `showKeyboardShortcut?: boolean` - Show/hide keyboard shortcut badges (default: true)
- `shortcutKey?: string` - Key letter to display (default: 'F')
- `onSearch?: (value: string) => void` - Callback for search value changes
- `disabled?: boolean` - Disabled state
- All standard HTML input props (placeholder, value, onChange, etc.)

---

### 3. TextareaField
Multi-line text input for longer content.

**Location:** `/components/ui/textarea-field.tsx`

**Features:**
- ✅ All states: base, hover, focus, error, success, disabled, filled
- ✅ Character counter (positioned bottom-right)
- ✅ Helper text with state-based coloring
- ✅ Resizable or fixed height
- ✅ Full accessibility

**Usage:**
```tsx
import { TextareaField } from './components/ui/form-inputs';

<TextareaField
  label="Session Notes"
  placeholder="Document what happened during the session..."
  required
  showCharCount
  maxLength={2000}
  rows={6}
  helperText="Add detailed notes about this therapy session"
  error="Notes are required"
  success={isSaved}
  disabled={false}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

**Props:**
- `label?: string` - Textarea label text
- `helperText?: string` - Helper text below textarea
- `error?: string` - Error message
- `success?: boolean` - Success state
- `required?: boolean` - Required field
- `showCharCount?: boolean` - Display character count
- `maxLength?: number` - Maximum character limit
- `rows?: number` - Number of visible rows (default: 4)
- `disabled?: boolean` - Disabled state
- All standard HTML textarea props (placeholder, value, onChange, etc.)

---

### 4. PhoneInput
International phone number input with country codes.

**Location:** `/components/PhoneInput.tsx`

**Features:**
- ✅ Country code selector with flags (15+ countries)
- ✅ Auto-formatting based on country
- ✅ All states: base, hover, focus, error, success, disabled
- ✅ Character counter showing digits entered vs max
- ✅ Magnifying glass icon
- ✅ Vertical separator between country code and input
- ✅ Support for India, US, Canada, UK, UAE, and more

**Usage:**
```tsx
import { PhoneInput } from './components/ui/form-inputs';

<PhoneInput
  label="Phone Number"
  value={phone}
  countryCode={countryCode}
  onChange={(phone, code) => {
    setPhone(phone);
    setCountryCode(code);
  }}
  onPhoneChange={(phone) => setPhone(phone)}
  onCountryCodeChange={(code) => setCountryCode(code)}
  required
  helperText="We will notify you via SMS"
  error="Invalid phone number"
  success={isVerified}
  disabled={false}
  placeholder="(555) 123-4567"
/>
```

**Props:**
- `label?: string` - Input label
- `value?: string` - Phone number (digits only, no formatting)
- `countryCode?: string` - Country code (e.g., '+1', '+91')
- `onChange?: (phone: string, countryCode: string) => void` - Combined callback
- `onPhoneChange?: (phone: string) => void` - Phone only callback
- `onCountryCodeChange?: (countryCode: string) => void` - Country code only callback
- `helperText?: string` - Helper text
- `error?: string` - Error message
- `success?: boolean` - Success state
- `required?: boolean` - Required field
- `disabled?: boolean` - Disabled state
- `placeholder?: string` - Placeholder text

**Utility Functions:**
```tsx
import { validatePhoneNumber, formatPhoneForDisplay, COUNTRY_CODES } from './components/ui/form-inputs';

// Validate phone number
const isValid = validatePhoneNumber('5551234567', '+1'); // true/false

// Format for display
const formatted = formatPhoneForDisplay('5551234567', '+1'); // "(555) 123-4567"

// Access all country codes
COUNTRY_CODES.forEach(country => {
  console.log(country.code, country.name, country.flag);
});
```

---

## Design Tokens

All components use CSS custom properties from the Ataraxia Design System:

### Colors
```css
/* Content Colors */
--content-dark-primary: #111827      /* Filled text */
--content-dark-secondary: #4b5563    /* Labels, badges */
--content-dark-tertiary: #6b7280     /* Placeholders, icons */
--content-dark-disable: #d1d5db      /* Disabled text */

/* Interaction Colors */
--interaction-secondary-base: #ffffff           /* Input background */
--interaction-secondary-disabled: #f9fafb       /* Disabled background */
--interaction-outline-base: #d1d5db             /* Base outline */
--interaction-outline-hover: #9ca3af            /* Hover outline */
--interaction-outline-active: #F97316           /* Focus outline (orange) */
--interaction-primary-active: #F97316           /* Active state */
--interaction-red-base: #ef4444                 /* Error state */
--interaction-green-base: #10b981               /* Success state */

/* Border & Background */
--border-primary: #e5e7eb            /* Separators */
--background-tertiary: #f3f4f6       /* Keyboard shortcut badges */
```

---

## State Behavior

### Priority Order
States are applied in this priority order (highest to lowest):
1. **Disabled** - Gray background, disabled cursor
2. **Error** - Red outline, red helper text
3. **Success** - Green outline, green helper text
4. **Focus** - Orange outline (2px width)
5. **Hover** - Darker gray outline
6. **Base** - Gray outline

### Text Color Logic
- **Empty/Placeholder:** Tertiary gray (#6b7280)
- **Filled/Typing:** Primary dark (#111827)
- **Disabled:** Disabled gray (#d1d5db)

---

## Migration Guide

### Replacing Existing Inputs

#### Before (Old shadcn Input):
```tsx
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input
    id="email"
    type="email"
    placeholder="email@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {error && <p className="text-red-500 text-xs">{error}</p>}
</div>
```

#### After (New InputField):
```tsx
import { InputField } from './components/ui/form-inputs';

<InputField
  label="Email"
  type="email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  error={error}
  helperText={error || "Enter your email address"}
/>
```

### Benefits of Migration:
✅ Consistent design system styling  
✅ Built-in state management (error, success, disabled)  
✅ Automatic helper text coloring  
✅ Character counting built-in  
✅ Better accessibility (ARIA attributes)  
✅ Less code (combines label, input, error in one component)  

---

## Examples

### Login Form
```tsx
import { InputField } from './components/ui/form-inputs';
import { Mail, Lock, Eye } from '@phosphor-icons/react';

<form className="space-y-6">
  <InputField
    label="Email"
    type="email"
    placeholder="username@gmail.com"
    leftIcon={<Mail className="w-5 h-5" />}
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  
  <InputField
    label="Password"
    type={showPassword ? 'text' : 'password'}
    placeholder="••••••••"
    leftIcon={<Lock className="w-5 h-5" />}
    rightIcon={<Eye className="w-5 h-5 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</form>
```

### Client Intake Form
```tsx
import { InputField, PhoneInput, TextareaField } from './components/ui/form-inputs';
import { User, Mail } from '@phosphor-icons/react';

<form className="space-y-6">
  <InputField
    label="Full Name"
    placeholder="John Doe"
    leftIcon={<User className="w-5 h-5" />}
    required
    showCharCount
    maxLength={100}
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <InputField
    label="Email Address"
    type="email"
    placeholder="john.doe@example.com"
    leftIcon={<Mail className="w-5 h-5" />}
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <PhoneInput
    label="Phone Number"
    value={phone}
    countryCode={countryCode}
    onChange={(phone, code) => {
      setPhone(phone);
      setCountryCode(code);
    }}
    required
    helperText="For appointment reminders"
  />

  <TextareaField
    label="Reason for Visit"
    placeholder="Please describe why you're seeking therapy..."
    required
    showCharCount
    maxLength={1000}
    rows={5}
    value={reason}
    onChange={(e) => setReason(e.target.value)}
  />
</form>
```

### Search with Filters
```tsx
import { SearchBar, InputField } from './components/ui/form-inputs';

<div className="space-y-4">
  <SearchBar
    placeholder="Search clients..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onSearch={(value) => performSearch(value)}
  />
  
  <div className="flex gap-4">
    <InputField
      label="Filter by Age"
      type="number"
      placeholder="Min age"
    />
    <InputField
      label="Location"
      placeholder="City, State"
    />
  </div>
</div>
```

---

## Accessibility

All components include proper accessibility features:

- ✅ **ARIA Labels:** `aria-label`, `aria-labelledby`, `aria-describedby`
- ✅ **ARIA States:** `aria-invalid`, `aria-required`, `aria-disabled`
- ✅ **Keyboard Navigation:** Full keyboard support, tab order
- ✅ **Screen Reader Support:** Proper announcements for errors, helper text
- ✅ **Focus Management:** Visible focus indicators (orange outline)
- ✅ **Semantic HTML:** Proper label-input associations

---

## Testing

### Visual Testing
View all components and states:
```tsx
import FormInputsShowcase from './components/FormInputsShowcase';

// In your App or test page:
<FormInputsShowcase />
```

### Unit Testing Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from './components/ui/form-inputs';

test('InputField shows error state', () => {
  render(
    <InputField
      label="Email"
      error="Invalid email"
      helperText="Invalid email"
    />
  );
  
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
});
```

---

## FAQ

### Q: Should I use InputField or the old Input component?
**A:** Always use `InputField` for new code. Migrate existing code when touching those files.

### Q: How do I add custom icons?
**A:** Use Phosphor Icons and pass them via `leftIcon` or `rightIcon` props:
```tsx
import { Mail } from '@phosphor-icons/react';
<InputField leftIcon={<Mail className="w-5 h-5" />} />
```

### Q: Can I override the styling?
**A:** The components use CSS custom properties. To customize globally, update the tokens in `/styles/globals.css`. For local overrides, use the `className` prop.

### Q: What about date/time inputs?
**A:** Use InputField with `type="date"` or `type="time"`:
```tsx
<InputField label="Date" type="date" />
<InputField label="Time" type="time" />
```

### Q: How do I handle validation?
**A:** Set the `error` prop when validation fails:
```tsx
const [error, setError] = useState('');

const handleValidation = (value) => {
  if (!value) {
    setError('This field is required');
  } else {
    setError('');
  }
};

<InputField
  error={error}
  helperText={error || 'Enter your email'}
  onChange={(e) => {
    setValue(e.target.value);
    handleValidation(e.target.value);
  }}
/>
```

---

## Support

For questions or issues with these components:
1. Check this README
2. View the showcase: `<FormInputsShowcase />`
3. Review the design spec in Figma
4. Contact the design system team

---

**Last Updated:** November 2024  
**Version:** 1.0  
**Maintainers:** Ataraxia Development Team
