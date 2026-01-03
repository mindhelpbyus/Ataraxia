# PlaceAutocompleteElement Technical Guide

## Overview

Ataraxia's AddressAutocomplete component uses Google's modern **PlaceAutocompleteElement** web component instead of the legacy JavaScript API. This provides a better developer experience and improved user experience, especially on mobile devices.

## What is PlaceAutocompleteElement?

PlaceAutocompleteElement is a custom HTML element (`<gmp-place-autocomplete>`) provided by Google Maps Platform that encapsulates all the functionality needed for address autocomplete.

### Traditional Approach (Old)
```typescript
// Old way - Manual initialization
const autocomplete = new google.maps.places.Autocomplete(inputElement, {
  types: ['address'],
  fields: ['address_components', 'formatted_address'],
});

autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  // Handle place...
});
```

### Modern Approach (New) ✨
```tsx
// New way - Web Component
<gmp-place-autocomplete>
  <input type="text" placeholder="Enter address..." />
</gmp-place-autocomplete>

// Listen to event
element.addEventListener('gmp-placeselect', (event) => {
  const place = event.detail.place;
  // Handle place...
});
```

## Key Advantages

### 1. **Simpler Implementation**
- No manual initialization required
- Automatic lifecycle management
- Less boilerplate code

### 2. **Better Mobile Experience**
- Optimized touch interactions
- Improved dropdown positioning on mobile
- Better keyboard support

### 3. **Future-Proof**
- Google manages updates
- Automatic bug fixes
- New features added automatically

### 4. **Consistent Styling**
- CSS custom properties for styling
- Inherits parent styles
- Easy to customize

### 5. **Async Loading**
- Loads library asynchronously
- Non-blocking script loading
- Better performance

## Implementation in Ataraxia

### Component Structure

```tsx
// AddressAutocomplete.tsx
export function AddressAutocomplete({ value, onChange, ... }) {
  const autocompleteRef = useRef<HTMLElement>(null);
  
  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Listen for place selection
  useEffect(() => {
    const element = autocompleteRef.current;
    
    element.addEventListener('gmp-placeselect', async (event) => {
      const place = event.detail.place;
      
      // Fetch place details
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress'],
      });
      
      // Parse and update
      const components = parseAddressComponents(place);
      onChange(place.formattedAddress, components);
    });
  }, []);

  return (
    <gmp-place-autocomplete ref={autocompleteRef}>
      <input type="text" defaultValue={value} />
    </gmp-place-autocomplete>
  );
}
```

### Event Handling

The component uses the `gmp-placeselect` event:

```typescript
element.addEventListener('gmp-placeselect', async (event) => {
  // event.detail.place contains the selected place
  const place = event.detail.place;
  
  // Fetch additional fields
  await place.fetchFields({
    fields: ['addressComponents', 'formattedAddress', 'location'],
  });
  
  // Access data
  console.log(place.formattedAddress);
  console.log(place.addressComponents);
});
```

### Address Component Parsing

```typescript
const components: AddressComponents = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  fullAddress: place.formattedAddress || '',
};

place.addressComponents.forEach((component) => {
  const types = component.types;

  if (types.includes('street_number')) {
    components.street = component.longText + ' ';
  }
  if (types.includes('route')) {
    components.street += component.longText;
  }
  if (types.includes('locality')) {
    components.city = component.longText;
  }
  if (types.includes('administrative_area_level_1')) {
    components.state = component.shortText;
  }
  if (types.includes('postal_code')) {
    components.zip = component.longText;
  }
  if (types.includes('country')) {
    components.country = component.longText;
  }
});
```

## Styling

### CSS Custom Properties

The PlaceAutocompleteElement supports CSS custom properties for styling:

```css
gmp-place-autocomplete {
  --gmp-place-autocomplete-input-font-family: inherit;
  --gmp-place-autocomplete-input-font-size: inherit;
  --gmp-place-autocomplete-input-text-color: inherit;
  --gmp-place-autocomplete-input-placeholder-color: #9ca3af;
}
```

### Ataraxia Brand Styling

We override Google's default styling to match the Ataraxia design system:

```tsx
<style dangerouslySetInnerHTML={{
  __html: `
    gmp-place-autocomplete input {
      background: transparent !important;
      border: none !important;
      outline: none !important;
      padding: 0 !important;
      font-family: Inter, sans-serif !important;
      font-size: 0.875rem !important;
      color: var(--content-dark-primary, #111827) !important;
    }
    gmp-place-autocomplete input:focus {
      outline: none !important;
      box-shadow: none !important;
    }
  `
}} />
```

## TypeScript Integration

### JSX Declaration

To use the custom element in TypeScript/React:

```typescript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}
```

### Type Safety

```typescript
interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, components?: AddressComponents) => void;
  placeholder?: string;
  disabled?: boolean;
  // ... other props
}
```

## Script Loading

### Async Loading Strategy

```typescript
useEffect(() => {
  if (window.google?.maps?.places?.PlaceAutocompleteElement) {
    setIsScriptLoaded(true);
    return; // Already loaded
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => setIsScriptLoaded(true);
  script.onerror = () => console.error('Failed to load Google Places API');
  
  document.head.appendChild(script);
}, []);
```

### Key Parameters

- `key=${API_KEY}` - Your Google Maps API key
- `libraries=places` - Load Places library
- `loading=async` - Enable async loading for PlaceAutocompleteElement

## Fallback Strategy

Ataraxia includes a graceful fallback for when the API is not configured:

```tsx
// If API configured and loaded
if (isScriptLoaded && isGoogleMapsConfigured()) {
  return (
    <gmp-place-autocomplete>
      <input type="text" />
    </gmp-place-autocomplete>
  );
}

// Fallback to regular input
return (
  <input 
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);
```

## Available Place Fields

When fetching place details, you can request these fields:

### Address Fields
- `addressComponents` - Structured address data
- `formattedAddress` - Human-readable full address
- `adrFormatAddress` - Microdata-formatted address

### Location Fields
- `location` - Lat/lng coordinates
- `viewport` - Recommended viewport for map
- `plusCode` - Plus Code location

### Additional Fields
- `name` - Place name
- `types` - Place types (e.g., 'street_address')
- `placeId` - Unique place identifier

### Example

```typescript
await place.fetchFields({
  fields: [
    'addressComponents',
    'formattedAddress',
    'location',
    'placeId'
  ],
});

console.log(place.formattedAddress);
console.log(place.location.lat(), place.location.lng());
```

## Performance Optimization

### 1. Lazy Loading
- Script loads only when needed
- Async loading prevents blocking
- Checks for existing script before loading

### 2. Event Delegation
- Single event listener per component
- Cleanup on unmount
- No memory leaks

### 3. Minimal Re-renders
- Uses `useRef` for DOM references
- `useEffect` dependencies optimized
- Value syncing only when changed

## Browser Compatibility

PlaceAutocompleteElement supports:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### Polyfills

Modern browsers support custom elements natively. For older browsers:

```html
<!-- Optional polyfill for older browsers -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2/webcomponents-loader.js"></script>
```

## Troubleshooting

### Issue: Element not rendering
**Solution:** Ensure Google Maps script is fully loaded before rendering

```typescript
if (!isScriptLoaded) {
  return <div>Loading...</div>;
}
```

### Issue: Styles not applying
**Solution:** Use `!important` to override Google's default styles

```css
gmp-place-autocomplete input {
  color: red !important;
}
```

### Issue: Event not firing
**Solution:** Ensure event listener is attached after script loads

```typescript
useEffect(() => {
  if (!isScriptLoaded) return;
  
  element.addEventListener('gmp-placeselect', handler);
  return () => element.removeEventListener('gmp-placeselect', handler);
}, [isScriptLoaded]);
```

### Issue: TypeScript errors
**Solution:** Add JSX type declarations (see TypeScript Integration section)

## Migration from Legacy API

If you're migrating from the old `google.maps.places.Autocomplete` API:

### Before (Legacy)
```typescript
const autocomplete = new google.maps.places.Autocomplete(input, options);
autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
});
```

### After (PlaceAutocompleteElement)
```typescript
<gmp-place-autocomplete>
  <input />
</gmp-place-autocomplete>

element.addEventListener('gmp-placeselect', async (event) => {
  const place = event.detail.place;
  await place.fetchFields({ fields: [...] });
});
```

### Key Differences

| Feature | Legacy API | PlaceAutocompleteElement |
|---------|-----------|--------------------------|
| Initialization | Manual | Automatic |
| Event | `place_changed` | `gmp-placeselect` |
| Data Access | Immediate | Async with `fetchFields()` |
| Styling | Limited | CSS custom properties |
| Mobile | Good | Excellent |
| Future Updates | Manual | Automatic |

## Best Practices

### 1. Always Fetch Required Fields
```typescript
await place.fetchFields({
  fields: ['addressComponents', 'formattedAddress'], // Only what you need
});
```

### 2. Handle Errors Gracefully
```typescript
try {
  await place.fetchFields({ fields: [...] });
} catch (error) {
  console.error('Error fetching place details:', error);
  // Fallback behavior
}
```

### 3. Cleanup Event Listeners
```typescript
useEffect(() => {
  const handler = (event) => { /* ... */ };
  element.addEventListener('gmp-placeselect', handler);
  
  return () => {
    element.removeEventListener('gmp-placeselect', handler);
  };
}, []);
```

### 4. Use Environment Variables
```typescript
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
```

### 5. Provide Fallback UI
```typescript
if (!isGoogleMapsConfigured()) {
  return <RegularInput />; // Fallback to standard input
}
```

## Resources

### Official Documentation
- [PlaceAutocompleteElement Guide](https://developers.google.com/maps/documentation/javascript/place-autocomplete-element)
- [Place Details](https://developers.google.com/maps/documentation/javascript/place-details)
- [Address Components](https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes)

### Code Examples
- [Official Samples](https://developers.google.com/maps/documentation/javascript/examples)
- [Ataraxia Demo](/components/AddressAutocompleteDemo.tsx)

### Support
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

---

**Last Updated:** November 2024  
**Component Version:** 2.0.0 (PlaceAutocompleteElement)  
**API Version:** Google Maps JavaScript API v3
