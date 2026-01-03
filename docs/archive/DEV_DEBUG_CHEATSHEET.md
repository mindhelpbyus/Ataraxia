# 🐛 Dev Mode Debug Tools - Cheatsheet

## 📍 Location
**Bottom-right corner of screen**

## 🔴 Error Debug Panel (Red Button)
**What:** Tracks ALL runtime errors  
**When to use:** Debug console errors, exceptions, warnings  
**Button state:**  
- Gray = No errors  
- Red (pulsing) = Errors detected  

**Features:**
```
✅ console.error()     → Captured
✅ console.warn()      → Captured
✅ throw new Error()   → Captured
✅ Promise rejections  → Captured
✅ Stack traces        → Shown
✅ Timestamps          → Milliseconds
✅ Copy all            → To clipboard
✅ Clear               → Reset list
```

## 🟠 API Debug Panel (Orange Button)
**What:** Tracks ALL API requests/responses  
**When to use:** Debug backend calls, verify data  
**Button state:**  
- Orange with badge showing request count  

**Features:**
```
✅ Request headers     → Full details
✅ Request body        → JSON formatted
✅ Response headers    → Full details
✅ Response body       → JSON formatted
✅ Status codes        → Color coded
✅ Duration            → Milliseconds
✅ Copy sections       → Individual copy
✅ Filter              → All/Success/Error
✅ Clear               → Reset list
```

## 🎨 Quick Color Guide

**Errors:**
- 🔴 Error  
- 🟡 Warning  
- 🔵 API Error  
- 🟣 React Error  

**API Methods:**
- 🔵 GET  
- 🟢 POST  
- 🟠 PUT  
- 🟣 PATCH  
- 🔴 DELETE  

**API Status:**
- 🟢 200-299 Success  
- 🟡 400-499 Client Error  
- 🔴 500+ Server Error  

## ⚡ Quick Actions

### Debug Failed API Call:
1. Click **orange button** (API Debug)
2. Find **red status badge** (error)
3. Click to expand
4. Check **Response Body** for error
5. Copy to share

### Track Console Error:
1. Click **red button** (Errors)
2. See **latest error** at top
3. Click **Stack Trace** to expand
4. Find line number
5. Fix issue

### Monitor Real-Time:
1. Open **both panels**
2. Perform action in app
3. Watch **live updates**
4. Verify data is correct

## 🚀 Fast Debug Workflow

```
Issue detected
    ↓
Open relevant panel (Red or Orange)
    ↓
Find the error/request
    ↓
Expand for details
    ↓
Copy if needed
    ↓
Fix the issue
    ↓
Clear panel
    ↓
Test again
```

## 💡 Pro Tips

1. **Keep both open** during development
2. **Filter API panel** to "Errors" to focus
3. **Copy before clearing** to save logs
4. **Check timestamps** to correlate events
5. **Look for patterns** in repeated errors

## 🔧 Dev Mode Check

```bash
# Start dev server
npm run dev

# Check console
console.log(import.meta.env.DEV)
# Should be: true

# Look for buttons
# Bottom-right corner
```

## 📦 Files

- `/components/DevModeDebugTools.tsx` - Main wrapper
- `/components/DebugErrorDisplay.tsx` - Error panel
- `/components/ApiDebugPanel.tsx` - API panel
- `/api/client.ts` - API tracking

## 📖 Full Docs

- `/DEV_MODE_DEBUG_GUIDE.md` - Complete guide
- `/DEBUG_TOOLS_SUMMARY.md` - Quick summary

## ✅ Enabled On
- ✅ All pages
- ✅ All routes
- ✅ All components
- ✅ Dev mode only
- 🚫 Hidden in production

---

**Print this and keep it next to your monitor! 📄**
