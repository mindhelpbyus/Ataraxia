# Google Places API Setup Guide

## Overview
Ataraxia uses Google Places API with the modern **PlaceAutocompleteElement** web component for address autocomplete functionality across all forms in the application. This provides a seamless, mobile-optimized user experience for entering addresses for clients, therapists, organizations, and service locations.

### Why PlaceAutocompleteElement?
- ✅ **Modern Web Component** - Uses custom HTML elements (`<gmp-place-autocomplete>`)
- ✅ **Better Mobile Experience** - Optimized for touch devices
- ✅ **Easier Implementation** - Less code, simpler setup
- ✅ **Automatic Updates** - Google manages the component
- ✅ **Built-in Styling** - Consistent with Google Maps design

## 📍 Where Address Autocomplete is Used

### Client Forms
- **ClientIntakeForm** - Client address & emergency contact address
- **ClientSelfRegistrationForm** - Client registration address
- **ComprehensiveClientRegistrationForm** - Home address & billing address

### Therapist Forms
- **TherapistOnboarding** (Step 3) - Therapist street address

### Organization Forms
- **OrganizationSetupForm** - HQ address, billing address, and service locations

## 🚀 Setup Instructions

### Step 1: Enable Google Maps Platform

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable these APIs:
   - ✅ **Places API**
   - ✅ **Maps JavaScript API** (required for Places API)

### Step 2: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API key**
3. Copy your new API key
4. Click **RESTRICT KEY** (highly recommended for security)

### Step 3: Configure API Key Restrictions (Recommended)

#### Application Restrictions
- Select **HTTP referrers (web sites)**
- Add your domain(s):
  ```
  https://your-domain.com/*
  https://*.your-domain.com/*
  http://localhost:5173/*  (for local development)
  ```

#### API Restrictions
- Select **Restrict key**
- Select these APIs only:
  - ✅ Places API
  - ✅ Maps JavaScript API

### Step 4: Add API Key to Your Application

#### Option 1: Environment Variable (Recommended for Production)
Create a `.env` file in your project root:
```bash
VITE_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

#### Option 2: Direct Configuration (Development Only)
Edit `/config/googleMaps.ts`:
```typescript
export const GOOGLE_MAPS_CONFIG = {
  apiKey: 'your_actual_api_key_here',
  // ... rest of config
};
```

⚠️ **Security Note:** Never commit your API key to version control!

### Step 5: Enable Billing

Google Maps Platform requires a billing account:
1. Go to **Billing** in Google Cloud Console
2. Link a billing account to your project
3. Set up budget alerts (recommended)

## 💰 Pricing

### Places API - Autocomplete
- **Cost:** $2.83 per 1,000 requests (session-based)
- **Free Tier:** $200/month credit (≈70,000 requests)
- **SKU:** Place Autocomplete - Per Session

### Typical Usage Estimates
- **Small Practice (10 therapists):** ~1,000 requests/month → **FREE**
- **Medium Practice (50 therapists):** ~5,000 requests/month → **FREE**
- **Large Organization (200+ therapists):** ~20,000 requests/month → **FREE**

Most healthcare organizations will stay within the free tier.

[View full pricing details](https://mapsplatform.google.com/pricing/)

## 🎯 Features

### Address Autocomplete Component (`AddressAutocomplete`)

**Technology:** Google Maps PlaceAutocompleteElement (Modern Web Component)

#### Auto-Fill Capability
When a user selects an address from the dropdown, the component automatically fills:
- ✅ Street Address
- ✅ City
- ✅ State/Province
- ✅ ZIP/Postal Code
- ✅ Country

#### Design System Compliance
- Matches Ataraxia brand colors (Orange #F97316)
- Consistent spacing and typography
- Inter font family
- Error, success, and disabled states
- Accessible (ARIA labels, keyboard navigation)

#### International Support
- Supports addresses worldwide
- Includes India and all international customers
- Handles various address formats

#### PlaceAutocompleteElement Benefits
- **Web Component Standard** - Uses `<gmp-place-autocomplete>` custom element
- **Async Loading** - Loads Google Maps library asynchronously
- **Event-Driven** - Uses `gmp-placeselect` event for place selection
- **Mobile Optimized** - Better touch interaction on mobile devices
- **Self-Contained** - Google manages the component lifecycle
- **Future-Proof** - Automatic updates from Google

## 🧪 Testing

### Test Without API Key
The component will:
- Show a friendly warning message
- Fall back to regular text input
- Still allow manual address entry
- Not break your application

### Test With API Key
1. Add your API key following Step 4
2. Open any form with an address field
3. Start typing an address (e.g., "123 Main")
4. Select from dropdown suggestions
5. Verify city, state, and zip auto-fill

## 🔧 Troubleshooting

### Issue: "Google Maps API key not configured"
**Solution:** Add your API key to `/config/googleMaps.ts` or `.env` file

### Issue: "This API project is not authorized to use this API"
**Solution:** Enable Places API and Maps JavaScript API in Google Cloud Console

### Issue: "RefererNotAllowedMapError"
**Solution:** Add your domain to HTTP referrer restrictions in API key settings

### Issue: Autocomplete not showing suggestions
**Solutions:**
1. Check browser console for errors
2. Verify API key is correct
3. Check billing is enabled
4. Ensure APIs are enabled
5. Check domain restrictions allow your current domain

### Issue: "API key is invalid or billing not enabled"
**Solution:** 
1. Verify API key is copied correctly
2. Enable billing in Google Cloud Console
3. Wait a few minutes for changes to propagate

## 📱 Component Usage

### Basic Usage
```tsx
import { AddressAutocomplete } from './components/AddressAutocomplete';

<AddressAutocomplete
  label="Street Address"
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
  placeholder="Start typing an address..."
  required
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | 'address-input' | Input element ID |
| `label` | string | undefined | Label text |
| `value` | string | required | Current address value |
| `onChange` | function | required | Callback: `(value, components?) => void` |
| `placeholder` | string | 'Start typing...' | Placeholder text |
| `required` | boolean | false | Show required indicator |
| `disabled` | boolean | false | Disable input |
| `error` | string | undefined | Error message |
| `helperText` | string | undefined | Helper text |
| `success` | boolean | false | Show success state |
| `showIcon` | boolean | true | Show MapPin icon |

### Address Components Object
```typescript
{
  street: string;      // "123 Main Street"
  city: string;        // "New York"
  state: string;       // "NY"
  zip: string;         // "10001"
  country: string;     // "United States"
  fullAddress: string; // Complete formatted address
}
```

## 🔐 Security Best Practices

1. ✅ **Use environment variables** for production
2. ✅ **Restrict API key** to specific domains
3. ✅ **Limit to necessary APIs** only
4. ✅ **Set up budget alerts** in Google Cloud
5. ✅ **Monitor usage** regularly
6. ✅ **Rotate keys** periodically
7. ❌ **Never commit** API keys to git
8. ❌ **Don't expose** keys in client-side code

## 📊 Monitoring Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Dashboard**
3. View metrics for:
   - Daily requests
   - Errors
   - Latency
   - Costs

Set up budget alerts to avoid unexpected charges.

## 🆘 Support

### Google Maps Platform Support
- [Documentation](https://developers.google.com/maps/documentation)
- [Support Portal](https://cloud.google.com/support)
- [Community Forums](https://stackoverflow.com/questions/tagged/google-maps)

### Ataraxia Internal Support
- Check `/components/AddressAutocomplete.tsx` for implementation
- Review `/config/googleMaps.ts` for configuration
- Contact your development team

## ✅ Verification Checklist

Before deploying to production:

- [ ] Google Cloud project created
- [ ] Places API enabled
- [ ] Maps JavaScript API enabled
- [ ] API key created
- [ ] API key restrictions configured
- [ ] Billing enabled
- [ ] Budget alerts set up
- [ ] API key added to environment variables
- [ ] `.env` file in `.gitignore`
- [ ] Tested on localhost
- [ ] Tested on staging
- [ ] Domain restrictions match production domain
- [ ] Address autocomplete working on all forms
- [ ] Monitoring dashboard configured

## 🎉 Ready to Go!

Once setup is complete, your users will enjoy:
- ⚡ Fast address entry
- ✨ Fewer typos
- 🌍 International support
- 📱 Mobile-friendly experience
- ♿ Accessible interface

---

**Last Updated:** November 2024  
**Ataraxia Version:** 1.0.0  
**Component:** AddressAutocomplete v1.0
