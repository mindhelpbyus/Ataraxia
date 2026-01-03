# 🔧 Environment Setup Guide for Ataraxia

## Quick Start

### 1. Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Then edit .env with your actual values
```

### 2. Configure Google Maps API (Optional but Recommended)

#### Why do I need this?
The Google Maps API enables **address autocomplete** in forms across Ataraxia, making it faster and more accurate for therapists and admins to enter addresses.

#### Getting Your API Key

**Step 1: Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/

**Step 2: Create or Select a Project**
- Create a new project called "Ataraxia" or select an existing one

**Step 3: Enable Required APIs**
- Navigate to "APIs & Services" > "Library"
- Search and enable:
  - ✅ **Places API (New)**
  - ✅ **Maps JavaScript API**

**Step 4: Create API Key**
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Copy the generated API key

**Step 5: Secure Your API Key (Recommended)**
- Click "Restrict Key" on your new API key
- Under "Application restrictions":
  - Select "HTTP referrers"
  - Add: `localhost:5173/*` (for development)
  - Add: `yourdomain.com/*` (for production)
- Under "API restrictions":
  - Select "Restrict key"
  - Choose: Places API, Maps JavaScript API
- Click "Save"

**Step 6: Add to Your Project**

Option A: Using .env file (Recommended)
```bash
# In your .env file
VITE_GOOGLE_PLACES_API_KEY=AIzaSyC-your-actual-api-key-here
```

Option B: Direct configuration
```typescript
// In /config/googleMaps.ts (line 52)
apiKey: 'AIzaSyC-your-actual-api-key-here',
```

#### Pricing & Billing
- Google requires a billing account, but offers:
  - 💰 **$200 free credit per month**
  - 📍 Places Autocomplete: $2.83 per 1,000 requests
  - Most small to medium practices stay within the free tier
- More info: https://mapsplatform.google.com/pricing/

#### Development Without API Key
You can develop without the API key:
- Address fields will work as regular text inputs
- No autocomplete suggestions
- Manual entry required
- A small blue info badge will appear in development mode

---

## 3. Firebase Configuration

Add your Firebase project credentials to `.env`:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these from: Firebase Console > Project Settings > General

---

## 4. Backend API Configuration

Set your backend API URL:

```bash
VITE_API_BASE_URL=https://your-backend-api.com
# Or for local development:
VITE_API_BASE_URL=http://localhost:3000
```

---

## 5. Jitsi Video Configuration

Configure your self-hosted Jitsi server:

```bash
VITE_JITSI_DOMAIN=meet.your-domain.com
VITE_JITSI_JWT_SECRET=your_jitsi_jwt_secret
```

---

## Verification

### Check Google Maps Configuration

Run the application and navigate to any form with address fields:
- ✅ **Configured correctly**: You'll see autocomplete dropdown when typing
- ⚠️ **Not configured**: Blue badge appears, manual entry works fine

### Test Address Forms

These forms use address autocomplete:
1. Client Self-Registration Form
2. Organization Setup Form
3. Therapist Onboarding (Step 3 - Personal Details)
4. All 19+ address fields across the system

---

## Troubleshooting

### "Google Maps API key not configured"
- **Solution**: Add your API key to `.env` or `/config/googleMaps.ts`
- **Workaround**: Continue with manual address entry

### "This API project is not authorized to use this API"
- **Solution**: Enable Places API and Maps JavaScript API in Google Cloud Console

### "RefererNotAllowedMapError"
- **Solution**: Add your domain to HTTP referrers in API key restrictions

### API Key not loading from .env
- **Solution**: Restart your development server after changing .env
- **Command**: Stop server (Ctrl+C) and run `npm run dev` again

### Still see warnings in console
- **Solution**: This is normal. Forms work fine without API key (manual entry mode)
- **To remove**: Add valid API key and restart dev server

---

## Security Best Practices

### ✅ DO:
- Use environment variables for all API keys
- Add HTTP referrer restrictions to your Google API key
- Enable only required APIs (Places, Maps JavaScript)
- Monitor API usage in Google Cloud Console
- Add `.env` to `.gitignore` (already done)

### ❌ DON'T:
- Commit API keys to git
- Share API keys publicly
- Use production keys in development
- Skip API restrictions (unless testing)

---

## Need Help?

Refer to:
- 📖 [Google Places Setup Guide](./GOOGLE_PLACES_SETUP.md)
- 📖 [Address Autocomplete Integration](./ADDRESS_AUTOCOMPLETE_INTEGRATION.md)
- 📖 [Place Autocomplete Element Guide](./PLACE_AUTOCOMPLETE_ELEMENT_GUIDE.md)

---

**Questions?** Check the main documentation index: `/DOCUMENTATION_INDEX.md`
