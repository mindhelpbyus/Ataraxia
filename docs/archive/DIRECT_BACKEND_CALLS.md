# Direct Backend API Calls - No Proxy

## Configuration Updated

The application now makes **direct HTTP calls** to the Firebase backend without any proxy configuration.

### What Changed

1. **Removed Vite Proxy** (`vite.config.ts`)
   - No more proxy configuration in the dev server
   - Cleaner, simpler setup

2. **Simplified API Client** (`api/client.ts`)
   - Removed environment detection
   - Always uses direct Firebase URL: `https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api`
   - No more localhost vs production URL switching

### How It Works Now

```
Frontend (localhost:5173 or production)
    ↓
    Direct HTTP call over internet
    ↓
Firebase Cloud Function
    https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api
```

### Benefits

✅ Simpler configuration
✅ No proxy complexity
✅ Same behavior in development and production
✅ Direct backend calls over the internet
✅ Easier to debug (see actual URLs in browser DevTools)

### CORS Handling

The Firebase backend must have CORS properly configured to accept requests from:
- `http://localhost:5173` (development)
- Your production domain (when deployed)

This is handled on the **backend side**, not the frontend.

### Testing

After this change, restart your dev server:

```bash
# Stop the current dev server (Ctrl+C)
# Start it again
npm run dev
```

All API calls will now go directly to Firebase.
