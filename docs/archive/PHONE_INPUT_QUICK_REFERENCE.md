# 📞 PhoneInput Component - Quick Reference Card

## ⚡ Quick Start

```tsx
import { PhoneInput } from './components/PhoneInput';

const [phone, setPhone] = useState('');
const [countryCode, setCountryCode] = useState('+1');

<PhoneInput
  value={phone}
  countryCode={countryCode}
  onChange={(phone, code) => {
    setPhone(phone);
    setCountryCode(code);
  }}
  label="Phone Number"
  required
/>
```

---

## 🌍 Supported Countries (15+)

| Country | Code | Format | Example |
|---------|------|--------|---------|
| 🇺🇸 US | +1 | (###) ###-#### | (555) 123-4567 |
| 🇮🇳 India | +91 | #####-##### | 98765-43210 |
| 🇬🇧 UK | +44 | #### ### #### | 7123 456 7890 |
| 🇦🇺 Australia | +61 | #### ### ### | 0412 345 678 |
| 🇨🇳 China | +86 | ### #### #### | 138 0013 8000 |
| 🇯🇵 Japan | +81 | ##-####-#### | 90-1234-5678 |
| 🇩🇪 Germany | +49 | ### ######## | 151 12345678 |
| 🇫🇷 France | +33 | # ## ## ## ## | 6 12 34 56 78 |

---

## 💾 Data Storage

```typescript
// ✅ CORRECT - Store separately
interface FormData {
  phone: string;        // "5551234567" (digits only)
  countryCode: string;  // "+1"
}

// ❌ WRONG - Don't store formatted
interface FormData {
  phone: string;  // "(555) 123-4567" ← NO!
}
```

---

## ✅ Validation

```typescript
import { validatePhoneNumber } from './components/PhoneInput';

// Check if valid
if (validatePhoneNumber(phone, countryCode)) {
  // Valid! ✅
} else {
  // Invalid ❌
}
```

---

## 🎨 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | string | Yes | Phone number (digits only) |
| `countryCode` | string | Yes | Country code (e.g., "+1") |
| `onChange` | (phone, code) => void | Yes | Callback when value changes |
| `label` | string | No | Label text |
| `required` | boolean | No | Shows asterisk |
| `error` | string | No | Error message to display |
| `disabled` | boolean | No | Disables input |
| `id` | string | No | HTML id attribute |

---

## 🔄 Migration from Old Input

### Before
```tsx
<div>
  <Label>Phone *</Label>
  <Input
    type="tel"
    value={formData.phone}
    onChange={(e) => setFormData({...formData, phone: e.target.value})}
  />
</div>
```

### After
```tsx
<PhoneInput
  value={formData.phone}
  countryCode={formData.countryCode}
  onChange={(phone, code) => {
    setFormData({...formData, phone, countryCode: code});
  }}
  label="Phone"
  required
/>
```

**Don't forget to:**
1. Add `countryCode: '+1'` to initial state
2. Add `countryCode: string` to interface

---

## 🧪 Example Test Cases

```typescript
// US Phone
Input:  "5551234567"
Output: "(555) 123-4567"
Valid:  ✅ (10 digits)

// India Phone
Input:  "9876543210"
Output: "98765-43210"
Valid:  ✅ (10 digits)

// UK Phone
Input:  "71234567890"
Output: "7123 456 7890"
Valid:  ✅ (10 digits)

// Incomplete
Input:  "555"
Output: "555"
Valid:  ❌ (too short)
```

---

## 🚀 Full Example with Form

```tsx
import { PhoneInput, validatePhoneNumber } from './components/PhoneInput';

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
  });

  const handleSubmit = () => {
    // Validate
    if (!validatePhoneNumber(formData.phone, formData.countryCode)) {
      toast.error('Invalid phone number');
      return;
    }

    // Submit
    api.createClient({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      countryCode: formData.countryCode,
    });
  };

  return (
    <form>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <PhoneInput
        value={formData.phone}
        countryCode={formData.countryCode}
        onChange={(phone, code) => {
          setFormData({...formData, phone, countryCode: code});
        }}
        label="Phone"
        required
      />
      
      <Button onClick={handleSubmit}>Submit</Button>
    </form>
  );
}
```

---

## 💡 Tips & Best Practices

1. **Always store separately**: `phone` and `countryCode` as separate fields
2. **Default country**: Use `+1` (US) or detect from user location
3. **Validation**: Always validate before submission
4. **Display**: Use formatted value for display, clean value for storage
5. **International**: Construct full number: `${countryCode}-${phone}`

---

## 🐛 Troubleshooting

**Problem:** Phone input not showing up
- ✅ Check import: `import { PhoneInput } from './components/PhoneInput'`

**Problem:** Validation always fails
- ✅ Check if phone number is complete for that country
- ✅ Check correct country code is selected

**Problem:** Can't type in input
- ✅ Make sure `onChange` is implemented correctly
- ✅ Check state is updating

**Problem:** Format not applying
- ✅ Component auto-formats based on country
- ✅ Some countries may have different formats

---

## 📞 Common Use Cases

### Use Case 1: Client Registration
```tsx
<PhoneInput
  value={formData.phone}
  countryCode={formData.countryCode}
  onChange={(phone, code) => updateFormData({phone, countryCode: code})}
  label="Phone Number"
  required
/>
```

### Use Case 2: Emergency Contact
```tsx
<PhoneInput
  value={formData.emergencyPhone}
  countryCode={formData.emergencyCountryCode}
  onChange={(phone, code) => updateEmergency({phone, code})}
  label="Emergency Contact"
  required
/>
```

### Use Case 3: Organization Primary Contact
```tsx
<PhoneInput
  value={org.contactPhone}
  countryCode={org.contactCountryCode}
  onChange={(phone, code) => updateOrg({contactPhone: phone, contactCountryCode: code})}
  label="Primary Contact"
  required
/>
```

---

## 📊 Data Flow

```
User Types "5551234567"
         ↓
PhoneInput Component
         ↓
Auto-Format: "(555) 123-4567"
         ↓
onChange callback
         ↓
Your State: {phone: "5551234567", countryCode: "+1"}
         ↓
Database: {phone: "5551234567", countryCode: "+1"}
         ↓
Display: "+1-5551234567" or "(555) 123-4567"
```

---

## 🎯 Key Features

✅ **Auto-Formatting** - Type any format, auto-converts
✅ **15+ Countries** - US, India, UK, and more
✅ **Country Selector** - Easy dropdown with flags
✅ **Validation** - Built-in per-country validation
✅ **Accessible** - Full ARIA support
✅ **Mobile-Friendly** - Works on all devices
✅ **TypeScript** - Full type safety
✅ **Reusable** - One component, use everywhere

---

**Need More Help?**
- 📖 Full Guide: `/PHONE_INPUT_IMPLEMENTATION_GUIDE.md`
- 🎨 Demo: `/components/PhoneInputDemo.tsx`
- 📝 Summary: `/PHONE_INPUT_UPDATE_SUMMARY.md`
- 💻 Source: `/components/PhoneInput.tsx`
