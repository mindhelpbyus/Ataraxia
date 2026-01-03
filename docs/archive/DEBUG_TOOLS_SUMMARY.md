# 🐛 Dev Mode Debug Tools - Quick Summary

## 🎯 What You Get

In **development mode**, two debug panels are automatically enabled on **every page**:

### 🔴 Error Debug Panel (Red Button)
**Location:** Bottom-right corner  
**Tracks:** All console errors, warnings, exceptions, and promise rejections  
**Button:** Gray (no errors) or Red with pulsing animation (errors detected)

### 🟠 API Debug Panel (Orange Button)
**Location:** Bottom-right corner (below error panel)  
**Tracks:** All API requests with full request/response details  
**Button:** Orange with request count badge

---

## 🚀 Quick Access

```
Your App Screen
┌────────────────────────────────────┐
│                                    │
│         App Content Here           │
│                                    │
│                                    │
│                                    │
│                          [Errors 3]│ ← Click to see errors
│                      [API Debug 8]│ ← Click to see API calls
└────────────────────────────────────┘
```

---

## ✅ Features at a Glance

### Error Debug Panel:
- ✅ Captures **ALL** console.error() calls
- ✅ Captures **ALL** console.warn() calls
- ✅ Captures uncaught exceptions
- ✅ Captures unhandled promise rejections
- ✅ Shows stack traces
- ✅ Shows timestamps
- ✅ Copy all errors to clipboard
- ✅ Clear errors

### API Debug Panel:
- ✅ Tracks **ALL** API requests
- ✅ Shows request headers + body
- ✅ Shows response headers + body
- ✅ Shows status codes (200, 404, 500, etc.)
- ✅ Shows request duration (ms)
- ✅ Filter by success/error
- ✅ Copy individual sections
- ✅ Clear logs

---

## 🎨 Color Codes

### Error Panel:
- 🔴 **Red** = Error
- 🟡 **Yellow** = Warning  
- 🔵 **Blue** = API Error
- 🟣 **Purple** = React Error

### API Panel (Methods):
- 🔵 **Blue** = GET
- 🟢 **Green** = POST
- 🟠 **Orange** = PUT
- 🟣 **Purple** = PATCH
- 🔴 **Red** = DELETE

### API Panel (Status):
- 🟢 **Green** = 200-299 (Success)
- 🟡 **Yellow** = 400-499 (Client Error)
- 🔴 **Red** = 500+ (Server Error)

---

## 📍 Available On All Pages

- ✅ Login Page
- ✅ Dashboard
- ✅ Onboarding
- ✅ Watermark Demo
- ✅ Jitsi Test
- ✅ Video Test
- ✅ Create Session Test
- ✅ Real Backend Test
- ✅ Connection Diagnostic

---

## 🔧 Dev Mode Only

Debug panels **automatically hide** in production builds.

**Development Mode:**
```bash
npm run dev
```
✅ Debug panels visible

**Production Build:**
```bash
npm run build
npm run preview
```
🚫 Debug panels hidden

---

## 💡 Quick Tips

1. **Keep panels open** while developing to catch errors immediately
2. **Use API panel** to verify request/response data before debugging
3. **Copy errors** before clearing to save for bug reports
4. **Check stack traces** to find exact line numbers of errors
5. **Filter API logs** by success/error to focus on issues

---

## 🎯 Common Use Cases

### Debugging Failed Login:
1. Open **API Debug Panel** (orange button)
2. Perform login
3. Look for POST request to `/auth/login`
4. Check response body for error message
5. Verify request body has correct credentials

### Tracking Runtime Errors:
1. Open **Error Debug Panel** (red button)
2. Perform action that causes error
3. See error appear with timestamp
4. Click "Stack Trace" to see where it happened
5. Copy error details to share with team

### Monitoring Video Session Creation:
1. Open **API Debug Panel**
2. Click "Create Session"
3. Watch POST to `/appointments`
4. Verify status is 200 (green)
5. Check response has `sessionId`
6. Watch GET to `/auth/session-token`
7. Verify JWT token is returned

---

## 📖 Full Documentation

See `/DEV_MODE_DEBUG_GUIDE.md` for complete details including:
- How error tracking works
- How API tracking works
- Full feature list
- Code examples
- Troubleshooting guide

---

## 🚀 Try It Now

1. Run `npm run dev`
2. Look for buttons in bottom-right corner
3. Click **API Debug** (orange)
4. Login or make any API call
5. Watch request appear in panel!
6. Click **Errors** (red)
7. Open console and type: `console.error("Test")`
8. Watch error appear in panel!

---

**That's it! Debug tools are already enabled and working.** 🎉

No configuration needed. No imports required. Just run in dev mode and start debugging!
