# 🐛 Dev Mode Debug Tools - Complete Guide

## 🎯 Overview

In **development mode**, the application automatically enables two powerful debugging tools that help you track all errors and API calls in real-time:

1. **Error Debug Panel** (Red button) - Captures ALL runtime errors, console errors, warnings, and exceptions
2. **API Debug Panel** (Orange button) - Tracks ALL API requests and responses with full details

---

## 🔧 What's Enabled in Dev Mode

### ✅ Automatic Features:
- **All Console Errors**: Every `console.error()` call is captured
- **All Console Warnings**: Every `console.warn()` call is captured  
- **Uncaught Errors**: Window error events
- **Promise Rejections**: Unhandled promise rejections
- **API Calls**: ALL fetch requests to the backend
- **Request/Response Details**: Full headers, bodies, status codes
- **React Errors**: Component errors (when using ErrorBoundary)

### 🚫 What's Disabled in Production:
- Debug panels won't show in production builds
- Error tracking still works (for your analytics)
- API tracking still works (for your monitoring)
- UI debug tools are hidden from end users

---

## 📍 How to Access Debug Panels

### Error Debug Panel (Red Button)
Located at: **Bottom-right corner of the screen**

**States:**
- **Gray Button**: No errors captured yet
- **Red Button (Pulsing)**: Errors detected! Click to view
- **Badge**: Shows number of errors (e.g., "5")

**Button Label:** `Errors`

### API Debug Panel (Orange Button)
Located at: **Bottom-right corner of the screen** (below Error panel if both are minimized)

**States:**
- **Orange Button**: Always visible with request count
- **Badge**: Shows number of API calls (e.g., "12")

**Button Label:** `API Debug`

---

## 🔴 Error Debug Panel Features

### What It Captures:

#### 1. Console Errors
```javascript
console.error("Something went wrong!");
// ✅ Captured automatically
```

#### 2. Console Warnings
```javascript
console.warn("This is deprecated");
// ✅ Captured automatically
```

#### 3. Uncaught Exceptions
```javascript
throw new Error("Oops!");
// ✅ Captured automatically
```

#### 4. Promise Rejections
```javascript
fetch('/api/data')
  .then(res => res.json())
  .catch(err => {
    // Even if you don't handle it, it's captured!
  });
// ✅ Captured automatically
```

### Panel Features:
- **Timestamp**: Precise millisecond timestamps
- **Error Type**: `ERROR`, `WARNING`, `API`, `REACT`
- **Message**: Full error message
- **Stack Trace**: Expandable stack trace (click "Stack Trace")
- **Component Stack**: React component hierarchy (if available)
- **Details**: Full error object in JSON
- **Copy All**: Copy all errors to clipboard
- **Clear**: Clear all captured errors

### Color Coding:
- 🔴 **Red** = Error
- 🟡 **Yellow** = Warning
- 🔵 **Blue** = API Error
- 🟣 **Purple** = React Error

---

## 🟠 API Debug Panel Features

### What It Captures:

#### 1. All Backend API Calls
```javascript
// Any call using the API client
await apiRequest('/appointments', { method: 'POST', body: data });
// ✅ Tracked automatically
```

#### 2. All Fetch Requests
```javascript
// Direct fetch calls
await fetch('https://api.example.com/data');
// ✅ Tracked automatically (if using our client)
```

### Panel Layout:

#### Minimized View:
- Method badge (GET, POST, etc.)
- Status code badge (200, 404, 500, etc.)
- Timestamp
- Duration (ms)
- URL (truncated)

#### Expanded View (Click to expand):
- **Request Headers**: Full headers with Bearer token, Content-Type, etc.
- **Request Body**: JSON formatted request payload
- **Response Headers**: Server response headers
- **Response Body**: JSON formatted response data
- **Error**: Error message (if request failed)
- **Full URL**: Complete URL with parameters

### Features:
- **Filter by Status**:
  - All (shows everything)
  - Success (200-399 status codes)
  - Errors (400+ status codes)
- **Copy Individual Sections**: Copy headers, body, etc.
- **Clear Logs**: Clear all captured requests
- **Auto-updates**: Real-time updates as requests happen
- **Last 100 Requests**: Automatically limits to prevent memory issues

### Color Coding:

#### Method Colors:
- 🔵 **Blue** = GET
- 🟢 **Green** = POST
- 🟠 **Orange** = PUT
- 🟣 **Purple** = PATCH
- 🔴 **Red** = DELETE

#### Status Colors:
- 🟢 **Green** = 200-299 (Success)
- 🔵 **Blue** = 300-399 (Redirect)
- 🟡 **Yellow** = 400-499 (Client Error)
- 🔴 **Red** = 500+ (Server Error)

---

## 🎨 Visual Layout

### Both Panels Minimized:
```
┌─────────────────────────────┐
│                             │
│      Your App Content       │
│                             │
│                             │
│                             │
│                             │
│                    [Errors 5]│← Red button (if errors)
│                [API Debug 12]│← Orange button
└─────────────────────────────┘
```

### Error Panel Expanded:
```
┌─────────────────────────────────────────────┐
│ ⚠️  Debug Error Console (Dev Mode)    [×]   │
│ ┌─────────────────────────────────────────┐ │
│ │ All app errors: runtime, console, API   │ │
│ │                    [Copy All] [Clear]   │ │
│ ├─────────────────────────────────────────┤ │
│ │ ERROR  12:34:56.789                     │ │
│ │ Failed to fetch data from /api/users    │ │
│ │ ▸ Stack Trace                           │ │
│ │ ▸ Details                               │ │
│ ├─────────────────────────────────────────┤ │
│ │ WARNING  12:34:55.123                   │ │
│ │ Deprecated API usage detected           │ │
│ └─────────────────────────────────────────┘ │
│ Dev Mode: Capturing all errors...          │
└─────────────────────────────────────────────┘
```

### API Panel Expanded:
```
┌─────────────────────────────────────────────┐
│ API Debug Panel (Dev Mode)            [×]   │
│ ┌─────────────────────────────────────────┐ │
│ │ [All 12] [Success 10] [Errors 2] [Clear]│ │
│ ├─────────────────────────────────────────┤ │
│ │ ▸ POST 201 12:34:56.789 234ms           │ │
│ │   /api/appointments                     │ │
│ ├─────────────────────────────────────────┤ │
│ │ ▼ POST 400 12:34:55.123 567ms           │ │
│ │   /api/sessions                         │ │
│ │   Request Headers:  [Copy]              │ │
│ │   { "Authorization": "Bearer ...",      │ │
│ │     "Content-Type": "application/json" }│ │
│ │   Request Body:  [Copy]                 │ │
│ │   { "therapistId": "...", ... }         │ │
│ │   Response Body:  [Copy]                │ │
│ │   { "error": "Invalid request" }        │ │
│ └─────────────────────────────────────────┘ │
│ Dev Mode: Last 100 requests...             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Usage Examples

### Example 1: Debugging Failed API Call

1. **Click Orange "API Debug" button**
2. **Look for red error badges** (400+ status codes)
3. **Click to expand the failed request**
4. **Check Response Body** to see error message
5. **Check Request Body** to see what you sent
6. **Copy Request/Response** to share with team

### Example 2: Tracking Console Errors

1. **Click Red "Errors" button** (if pulsing)
2. **See list of all errors** with timestamps
3. **Click "Stack Trace"** to see where error occurred
4. **Click "Details"** to see full error object
5. **Click "Copy All"** to copy all errors
6. **Paste into bug report** or share with team

### Example 3: Monitoring Real-Time API Calls

1. **Open API Debug Panel** (Orange button)
2. **Perform action in app** (e.g., create appointment)
3. **Watch requests appear in real-time**
4. **Check status codes** (green = success)
5. **Verify request/response data** is correct

---

## 📝 Code Examples

### How It Works Under the Hood:

#### Error Tracking:
```typescript
// Automatically captures console.error
console.error = function(...args) {
  // Capture error
  const errorEntry = {
    timestamp: Date.now(),
    type: 'error',
    message: args.join(' '),
    stack: ...,
  };
  
  // Add to error list
  setErrors(prev => [errorEntry, ...prev]);
  
  // Still call original console.error
  originalError.apply(console, args);
};
```

#### API Tracking:
```typescript
// Automatically tracks all API requests
export async function apiRequest(endpoint, options) {
  const logEntry = {
    id: generateId(),
    timestamp: Date.now(),
    method: options.method,
    url: endpoint,
    requestHeaders: headers,
    requestBody: body,
  };
  
  // Emit debug event
  emitDebugEvent(logEntry);
  
  // Make actual request
  const response = await fetch(url, options);
  
  // Update with response
  logEntry.responseStatus = response.status;
  logEntry.responseBody = await response.json();
  
  return response;
}
```

---

## 🔧 Dev Mode Detection

The debug tools only show when:

```typescript
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
```

### Development Mode:
- Running `npm run dev` or `vite dev`
- `import.meta.env.DEV` = `true`
- Debug panels are **visible**

### Production Mode:
- Running `npm run build` + `npm run preview`
- Built with `vite build`
- `import.meta.env.DEV` = `false`
- Debug panels are **hidden**

---

## 📦 Files Involved

### Core Components:
- `/components/DevModeDebugTools.tsx` - Wrapper that checks dev mode
- `/components/DebugErrorDisplay.tsx` - Error tracking panel
- `/components/ApiDebugPanel.tsx` - API tracking panel

### Integration:
- `/App.tsx` - Includes `<DevModeDebugTools />` on every page

### API Client:
- `/api/client.ts` - Emits debug events for all API calls

---

## 🎯 Pages with Debug Tools

### ✅ All Pages Have Debug Tools:
- ✅ Login Page
- ✅ Dashboard (Calendar)
- ✅ Onboarding Flow
- ✅ Watermark Demo
- ✅ Jitsi Test
- ✅ Video Test
- ✅ Create Session Test
- ✅ Real Backend Test
- ✅ Connection Diagnostic

Every page in the app has both debug panels available!

---

## 💡 Pro Tips

### 1. Keep Panels Open While Developing
- Open both panels side-by-side
- Watch errors and API calls in real-time
- Catch issues immediately

### 2. Use Filters in API Panel
- Filter to "Errors" to see only failed requests
- Filter to "Success" to verify working endpoints

### 3. Copy Before Clearing
- Always copy errors/logs before clearing
- Paste into bug tracking system or docs

### 4. Check Stack Traces
- Stack traces show exact line numbers
- Use them to find the source of errors quickly

### 5. Monitor Request Duration
- Slow requests show high ms values
- Use to identify performance bottlenecks

---

## 🐛 Troubleshooting

### Debug Panels Not Showing?

**Check 1: Are you in dev mode?**
```bash
# Run dev server (not build)
npm run dev
```

**Check 2: Console check**
```javascript
console.log('Dev mode:', import.meta.env.DEV);
// Should print: Dev mode: true
```

### No Errors Captured?

**Check 1: Open the panel**
- Click the red "Errors" button
- Check if errors list is empty

**Check 2: Trigger a test error**
```javascript
console.error("Test error");
// Should appear in panel immediately
```

### No API Calls Captured?

**Check 1: Make sure you're using the API client**
```typescript
// ✅ This is tracked
import { apiRequest } from './api/client';
await apiRequest('/appointments');

// ❌ This is NOT tracked
await fetch('https://api.example.com/data');
```

**Check 2: Check if listener is attached**
- Open console
- Check for "🔵 API Request:" logs

---

## 🎉 Summary

### In Dev Mode You Get:
- ✅ **Error Debug Panel** (Red) - All runtime errors
- ✅ **API Debug Panel** (Orange) - All API requests
- ✅ **Real-time Tracking** - Auto-updates as events occur
- ✅ **Full Details** - Headers, bodies, stack traces, etc.
- ✅ **Copy/Export** - Easy sharing of debug info
- ✅ **Zero Configuration** - Works automatically

### Key Benefits:
1. **Instant Error Detection** - See errors as they happen
2. **API Request Visibility** - No more blind network calls
3. **Better Debugging** - Stack traces and details
4. **Team Collaboration** - Easy to share error logs
5. **No Production Impact** - Automatically disabled in prod

---

## 🚀 Quick Start Checklist

- [ ] Run app in dev mode (`npm run dev`)
- [ ] Look for orange "API Debug" button (bottom-right)
- [ ] Look for red "Errors" button (bottom-right, above API button)
- [ ] Click buttons to open panels
- [ ] Make an API call (login, create appointment, etc.)
- [ ] Watch request appear in API panel
- [ ] Trigger an error (`console.error("test")`)
- [ ] Watch error appear in Error panel
- [ ] Try expanding entries to see details
- [ ] Try copying data to clipboard

---

**Happy Debugging! 🐛🔍**

For questions or issues with debug tools, check:
- `/components/DevModeDebugTools.tsx`
- `/components/DebugErrorDisplay.tsx`
- `/components/ApiDebugPanel.tsx`
