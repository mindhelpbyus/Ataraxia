# Firebase Security Rules Deployment Guide

## 🔥 Fix Chat Permissions Errors

You're seeing these errors because Firebase security rules need to be deployed:
```
⚠️ Firebase permissions not configured for chat rooms. Using demo mode.
⚠️ Firebase permissions not configured for messages. Using demo mode.
```

## 📋 Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**
   ```bash
   firebase login
   ```

3. **Firebase project initialized**
   ```bash
   firebase init
   ```

## 🚀 Quick Fix - Deploy Rules

### Option 1: Deploy via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ataraxia-c150f`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the contents of `/firestore.rules` file
5. Click **Publish**

### Option 2: Deploy via CLI (Recommended)

1. **Initialize Firebase (if not done)**
   ```bash
   firebase init firestore
   ```
   - Select your project: `ataraxia-c150f`
   - Use default file: `firestore.rules`

2. **Deploy the rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Verify deployment**
   ```bash
   firebase firestore:rules get
   ```

## 🔍 What the Rules Fix

### Chat Rooms Collection
```javascript
// Allows users to:
// ✅ Read chat rooms they're a participant in
// ✅ Create chat rooms with themselves as participant
// ✅ Update their own chat rooms
```

### Messages Collection
```javascript
// Allows users to:
// ✅ Read messages where they're sender or recipient
// ✅ Create messages as sender
// ✅ Update messages they sent or received (mark as read)
// ✅ Delete only their own messages
```

## 📊 Required Firestore Indexes

After deploying rules, you may need to create composite indexes for queries:

### 1. Messages Index for Chat Room Queries
```
Collection: messages
Fields:
  - chatRoomId (Ascending)
  - timestamp (Ascending)
```

### 2. Messages Index for Unread Count
```
Collection: messages
Fields:
  - recipientId (Ascending)
  - read (Ascending)
```

### 3. Chat Rooms Index for User Queries
```
Collection: chatRooms
Fields:
  - participants (Array)
  - updatedAt (Descending)
```

### Create Indexes via Console

1. Go to **Firestore Database** → **Indexes** tab
2. Click **Create Index**
3. Add the fields as specified above
4. Click **Create**

### Or Create Indexes via CLI

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chatRoomId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "recipientId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "chatRooms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

## 🧪 Testing After Deployment

1. **Clear browser cache** (important!)
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

2. **Test in console**
   ```javascript
   // Check if Firebase is initialized
   console.log('Firebase initialized:', !!firebase.app());
   
   // Check if user is authenticated
   firebase.auth().onAuthStateChanged(user => {
     console.log('User:', user?.email);
   });
   ```

3. **Verify in Firebase Console**
   - Go to **Firestore Database** → **Data**
   - Check `chatRooms` collection exists
   - Check `messages` collection exists

## 🔧 Troubleshooting

### Error: "Missing or insufficient permissions"
- **Cause**: Rules not deployed yet or user not authenticated
- **Fix**: Deploy rules and ensure user is logged in

### Error: "PERMISSION_DENIED: Missing index"
- **Cause**: Composite index not created
- **Fix**: Click the link in the error message or create indexes manually

### Error: "Cannot read property 'participants' of undefined"
- **Cause**: Chat room doesn't exist yet
- **Fix**: Rules now handle this - room will be created on first message

### Chat loads but messages don't appear
- **Cause**: Messages query needs index
- **Fix**: Create the messages composite index

## 📝 Security Rules Explanation

### Authentication Check
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```
All operations require user to be logged in.

### Chat Room Access
```javascript
allow read: if isAuthenticated() && 
               request.auth.uid in resource.data.participants;
```
Users can only see chat rooms they're part of.

### Message Access
```javascript
allow read: if isAuthenticated() && (
               request.auth.uid == resource.data.senderId ||
               request.auth.uid == resource.data.recipientId
            );
```
Users can only see messages they sent or received.

## 🎯 Next Steps After Deployment

1. ✅ Deploy Firestore rules
2. ✅ Create required indexes
3. ✅ Clear browser cache
4. ✅ Test chat functionality
5. ✅ Monitor Firebase Console for errors

## 📞 Support

If errors persist after deployment:
1. Check Firebase Console → Firestore → Rules for syntax errors
2. Check Firebase Console → Firestore → Indexes for missing indexes
3. Check browser console for detailed error messages
4. Verify user is authenticated before accessing chat

## 🔐 Security Best Practices

✅ **Do:**
- Keep rules restrictive (users can only access their own data)
- Use authentication for all sensitive operations
- Validate data on both client and server
- Monitor Firestore usage in Firebase Console

❌ **Don't:**
- Use `allow read, write: if true;` in production
- Store sensitive data in Firestore without encryption
- Share Firebase config publicly (use environment variables)
- Skip index creation (causes slow queries and errors)

---

**Updated:** November 23, 2025  
**Project:** Bedrock Health Wellness Calendar  
**Firebase Project:** ataraxia-c150f
