# AddressAutocomplete Quick Reference

> **TL;DR:** Modern address autocomplete using Google's PlaceAutocompleteElement web component

---

## 🚀 Quick Start

### 1. Add API Key
```bash
# .env
VITE_GOOGLE_PLACES_API_KEY=your_key_here
```

### 2. Use Component
```tsx
import { AddressAutocomplete } from './components/AddressAutocomplete';

<AddressAutocomplete
  label="Address"
  value={address}
  onChange={(value, components) => {
    setAddress(value);
    setCity(components?.city);
    setState(components?.state);
    setZip(components?.zip);
  }}
  required
/>
```

### 3. Done! ✅

---

## 📋 Props Reference

```typescript
interface AddressAutocompleteProps {
  // Required
  value: string;
  onChange: (value: string, components?: AddressComponents) => void;
  
  // Optional
  id?: string;              // Default: 'address-input'
  label?: string;           // Label text
  placeholder?: string;     // Default: 'Start typing...'
  required?: boolean;       // Show * indicator
  disabled?: boolean;       // Disable input
  error?: string;           // Error message
  helperText?: string;      // Helper text
  success?: boolean;        // Success state
  className?: string;       // Additional classes
  showIcon?: boolean;       // Show MapPin icon (default: true)
}
```

---

## 🎯 onChange Callback

```typescript
onChange: (value: string, components?: AddressComponents) => void

// value: Full formatted address
"123 Main Street, New York, NY 10001, USA"

// components: Parsed address parts
{
  street: "123 Main Street",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "United States",
  fullAddress: "123 Main Street, New York, NY 10001, USA"
}
```

---

## 💡 Common Patterns

### Basic Usage
```tsx
<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
/>
```

### With Auto-Fill
```tsx
<AddressAutocomplete
  value={formData.address}
  onChange={(value, components) => {
    setFormData({
      ...formData,
      address: value,
      city: components?.city || '',
      state: components?.state || '',
      zip: components?.zip || ''
    });
  }}
/>
```

### With Validation
```tsx
<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
  error={errors.address}
  required
/>
```

### With Helper Text
```tsx
<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
  helperText="We'll use this for billing"
/>
```

### Disabled State
```tsx
<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
  disabled={isSubmitting}
/>
```

### Without Icon
```tsx
<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
  showIcon={false}
/>
```

---

## 🎨 Styling States

### Focus State
- Border: Orange #F97316
- Outline: 2px

### Error State  
- Border: Red #ef4444
- Text: Red #ef4444

### Success State
- Border: Green #10b981
- Text: Green #10b981

### Disabled State
- Border: Gray #d1d5db
- Text: Gray #9ca3af
- Cursor: not-allowed

---

## 🌍 International Support

### US Address
```
Input: "1600 Pennsylvania"
Result: "1600 Pennsylvania Avenue NW, Washington, DC 20500, USA"
```

### India Address
```
Input: "Taj Mahal"
Result: "Taj Mahal, Agra, Uttar Pradesh 282001, India"
```

### UK Address
```
Input: "10 Downing"
Result: "10 Downing Street, London SW1A 2AA, UK"
```

---

## ⚙️ Configuration

### Environment Variable (Production)
```bash
# .env
VITE_GOOGLE_PLACES_API_KEY=AIzaSy...
```

### Direct Config (Development)
```typescript
// /config/googleMaps.ts
export const GOOGLE_MAPS_CONFIG = {
  apiKey: 'AIzaSy...',
  libraries: ['places'],
};
```

---

## 🔧 Troubleshooting

### No Suggestions Appearing?
1. ✅ Check API key is set
2. ✅ Verify Places API is enabled
3. ✅ Check browser console for errors
4. ✅ Ensure billing is enabled in Google Cloud

### Styles Not Applying?
1. ✅ Check parent container doesn't override styles
2. ✅ Use `className` prop for custom styles
3. ✅ Inspect element to verify CSS custom properties

### TypeScript Errors?
1. ✅ Component exports `AddressComponents` interface
2. ✅ Import type: `import { AddressComponents } from './AddressAutocomplete'`

### Not Auto-Filling?
1. ✅ Check `onChange` receives `components` parameter
2. ✅ Verify you're using `components?.city`, etc.
3. ✅ Select from dropdown (don't just type)

---

## 📦 File Locations

```
/components/AddressAutocomplete.tsx       # Main component
/components/AddressAutocompleteDemo.tsx   # Demo page
/config/googleMaps.ts                     # Configuration
/docs/GOOGLE_PLACES_SETUP.md              # Setup guide
/docs/PLACE_AUTOCOMPLETE_ELEMENT_GUIDE.md # Technical guide
/.env.example                             # Environment template
```

---

## 🧪 Testing

### Manual Test
```bash
# Start dev server
npm run dev

# Navigate to demo page
# Or test any form with address field

# Try typing:
- "123 Main" (US)
- "Taj Mahal" (India)
- "Big Ben" (UK)
```

### Test Checklist
- [ ] Suggestions appear while typing
- [ ] Selecting fills all fields
- [ ] City, state, zip auto-populate
- [ ] Works on mobile
- [ ] Error state displays correctly
- [ ] Disabled state works
- [ ] International addresses work

---

## 🎓 Learning Path

### Beginner
1. Read `/docs/GOOGLE_PLACES_SETUP.md`
2. Try the demo page
3. Use in a simple form

### Intermediate
4. Read `/docs/ADDRESS_AUTOCOMPLETE_INTEGRATION.md`
5. Implement in complex forms
6. Customize styling

### Advanced
7. Read `/docs/PLACE_AUTOCOMPLETE_ELEMENT_GUIDE.md`
8. Understand web component architecture
9. Extend functionality

---

## 📊 Coverage

| Form | Address Fields | Status |
|------|----------------|--------|
| ClientIntakeForm | 2 | ✅ |
| ClientSelfRegistrationForm | 1 | ✅ |
| ComprehensiveClientRegistrationForm | 2 | ✅ |
| TherapistOnboarding (Step 3) | 1 | ✅ |
| OrganizationSetupForm | 7 | ✅ |
| **Total** | **13** | **✅** |

---

## 🆘 Get Help

### Documentation
- [Setup Guide](/docs/GOOGLE_PLACES_SETUP.md)
- [Technical Guide](/docs/PLACE_AUTOCOMPLETE_ELEMENT_GUIDE.md)
- [Integration Summary](/docs/ADDRESS_AUTOCOMPLETE_INTEGRATION.md)

### External Resources
- [Google Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete-element)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-maps)

### Check Code
- Component: `/components/AddressAutocomplete.tsx`
- Config: `/config/googleMaps.ts`
- Demo: `/components/AddressAutocompleteDemo.tsx`

---

## ✨ Tips & Tricks

### Tip 1: Always Handle Components
```tsx
// ✅ Good
onChange={(value, components) => {
  if (components) {
    setCity(components.city);
  }
}}

// ❌ Bad (will error if undefined)
onChange={(value, components) => {
  setCity(components.city);
}}
```

### Tip 2: Use Optional Chaining
```tsx
// ✅ Good
setCity(components?.city || '');

// ❌ Verbose
setCity(components ? components.city : '');
```

### Tip 3: Destructure for Cleaner Code
```tsx
onChange={(value, components) => {
  if (!components) return;
  
  const { city, state, zip } = components;
  setFormData({ ...formData, city, state, zip });
}}
```

### Tip 4: Batch Updates
```tsx
// ✅ Good - Single state update
onChange={(value, components) => {
  setFormData({
    ...formData,
    address: value,
    city: components?.city || '',
    state: components?.state || '',
    zip: components?.zip || ''
  });
}}

// ❌ Bad - Multiple updates (more re-renders)
onChange((value, components) => {
  setAddress(value);
  setCity(components?.city);
  setState(components?.state);
  setZip(components?.zip);
}}
```

---

**Version:** 2.0.0 (PlaceAutocompleteElement)  
**Last Updated:** November 2024  
**Quick Reference:** Always at `/docs/QUICK_REFERENCE.md`
