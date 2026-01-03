# API Debug Panel Guide

## Overview

The API Debug Panel is a powerful real-time debugging tool that captures and displays all HTTP requests and responses made to the backend API. This helps you understand exactly what's being sent to and received from the Firebase backend.

## How to Access

The debug panel is available throughout the application:

1. **Look for the orange floating button** in the bottom-right corner of the screen
2. It will show "API Debug" with a badge indicating the number of captured requests
3. **Click the button** to open the debug panel

## Features

### Real-Time Monitoring
- ✅ Captures all API requests automatically
- ✅ Shows requests as they happen in real-time
- ✅ Keeps the last 100 requests

### Detailed Information
For each API call, you can see:

- **Request Details**
  - HTTP Method (GET, POST, PUT, DELETE, PATCH)
  - Full URL
  - Request Headers (including Authorization tokens)
  - Request Body (JSON formatted)

- **Response Details**
  - Response Status Code (200, 401, 404, 500, etc.)
  - Response Headers
  - Response Body (JSON formatted)
  - Error Messages (if failed)

- **Performance**
  - Request Duration (in milliseconds)
  - Timestamp of when the request was made

### Filtering Options

- **All** - Shows all requests
- **Success** (green badge) - Shows only successful requests (2xx status codes)
- **Errors** (red badge) - Shows only failed requests (4xx, 5xx status codes)

### Actions

- **Expand/Collapse** - Click on any request to see full details
- **Copy to Clipboard** - Click the copy icon on any section to copy JSON data
- **Clear** - Remove all captured requests
- **Close** - Minimize the panel (button returns to bottom-right)

## Using the Debug Panel

### 1. Debugging Login Issues

When you try to login:

1. Open the API Debug Panel
2. Click the login button
3. Look for the POST request to `/auth/login`
4. Check:
   - ✅ Request body has correct `userId`, `email`, `role` (no password!)
   - ✅ Response status is 200
   - ✅ Response body contains `accessToken` and `refreshToken`
   - ❌ If status is 401, check the error message
   - ❌ If status is 500, there's a backend issue

### 2. Debugging Appointment Creation

When creating an appointment:

1. Filter to "All" requests
2. Create a new appointment
3. Look for the POST request to `/appointments`
4. Check:
   - ✅ Request headers include `Authorization: Bearer <token>`
   - ✅ Request body has all required fields
   - ✅ Response status is 201 or 200
   - ❌ If 401, your token may be expired
   - ❌ If 400, check the request body format

### 3. Debugging Video Call Issues

When starting a video call:

1. Watch the sequence of API calls:
   - POST `/auth/login` → Get Bearer token
   - POST `/appointments` → Create appointment
   - POST `/sessions` → Get sessionId
   - POST `/jitsi/jwt` → Get JWT token for video
2. Verify each step succeeds before the next
3. Check JWT token is returned in the final step

### 4. Inspecting Headers

Expand any request to see:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

This helps verify:
- ✅ Bearer token is being sent
- ✅ Token format is correct
- ✅ Content-Type is set properly

### 5. Understanding Error Responses

When you see a red border (error):

1. Expand the request
2. Look at "Response Status" - tells you the error type:
   - **401 Unauthorized** - Authentication failed or token expired
   - **403 Forbidden** - You don't have permission
   - **404 Not Found** - Endpoint doesn't exist or resource not found
   - **422 Unprocessable Entity** - Invalid data format
   - **500 Internal Server Error** - Backend error

3. Read the "Response Body" for specific error message
4. Read the "Error" section for summary

## Color Coding

### Method Colors
- 🔵 **Blue** - GET requests
- 🟢 **Green** - POST requests  
- 🟠 **Orange** - PUT requests
- 🟣 **Purple** - PATCH requests
- 🔴 **Red** - DELETE requests

### Status Colors
- 🟢 **Green** - Success (200-299)
- 🟡 **Yellow** - Client Error (400-499)
- 🔴 **Red** - Server Error (500-599)
- ⚫ **Gray** - No response yet

## Common Debugging Scenarios

### "Failed to fetch" Error

If you see this in the Error section:
1. Backend is not reachable
2. Check your internet connection
3. Verify Firebase backend URL is correct
4. Check if CORS is configured on backend

### "Authentication required" (401)

If you see this status:
1. You're not logged in
2. Your Bearer token expired
3. Token wasn't included in request headers
4. Check the Authorization header value

### Empty Response Body

If Response Body is empty:
1. Backend returned no data (might be OK for DELETE)
2. Response wasn't JSON formatted
3. Backend error prevented response

## Tips

### Debugging Flow
1. **Clear** the log before testing
2. Perform your action (login, create appointment, etc.)
3. **Filter** to "Errors" if something failed
4. **Expand** the failed request
5. **Copy** the request/response to share with team

### Sharing Debug Information

To share with your team:
1. Click **Copy** icon on the request body
2. Click **Copy** icon on the response body
3. Paste into your bug report or chat
4. Include the status code and error message

### Performance Monitoring

Watch the **duration** field:
- < 100ms - Very fast ⚡
- 100-500ms - Normal 👍
- 500-1000ms - Slow 🐌
- > 1000ms - Very slow 🐢

## Keyboard Shortcuts

- Click request card = Expand/Collapse
- Click outside panel = Keep panel open
- Click X button = Close panel

## Privacy Note

⚠️ **Important**: The debug panel shows sensitive data including:
- Bearer tokens
- User credentials (in request bodies)
- Personal information

**DO NOT** share screenshots with sensitive data publicly!

## Technical Details

- Captures all requests made through `/api/client.ts`
- Stores last 100 requests in memory
- Data is cleared when you refresh the page
- Does not persist to localStorage (for security)
- Updates in real-time as requests happen

---

## Need Help?

If the debug panel isn't showing requests:
1. Ensure you're using the API client functions (get, post, put, delete)
2. Check browser console for errors
3. Try refreshing the page

Happy debugging! 🐛🔍
