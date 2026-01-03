# Demo User Credentials - Quick Reference

## 🎯 Quick Start

All demo credentials use simple, easy-to-remember passwords!

## 👨‍⚕️ THERAPISTS

### 1. Andrew Joseph
```
Email:    andrew.joseph@yodha.com
Password: therapist123
UID:      cometchat-uid-1
Role:     Clinical Psychology
```

### 2. George Alan
```
Email:    george.alan@yodha.com
Password: therapist123
UID:      cometchat-uid-2
Role:     Cognitive Behavioral Therapy
```

### 3. Nancy Grace
```
Email:    nancy.grace@yodha.com
Password: therapist123
UID:      cometchat-uid-3
Role:     Family Therapy
```

## 👤 PATIENTS

### 4. Susan Marie
```
Email:    susan.marie@email.com
Password: client123
UID:      cometchat-uid-4
```

### 5. John Paul
```
Email:    john.paul@email.com
Password: client123
UID:      cometchat-uid-5
```

## 🔐 ADMIN

### System Administrator
```
Email:    admin@yodha.com
Password: admin123
UID:      cometchat-uid-admin
```

## 🧪 How to Test

### Test Messaging Between Users:

**Step 1:** Open two browser windows (or one normal + one incognito)

**Window 1 - Login as Therapist:**
```
Email: andrew.joseph@yodha.com
Password: therapist123
```

**Window 2 - Login as Client:**
```
Email: susan.marie@email.com
Password: client123
```

**Step 3:** Go to "Messages" tab in both windows

**Step 4:** Start a conversation!

### Test Video/Audio Calling:

**Same setup as above**, then:

1. In Window 1 (therapist), click the phone or video icon
2. Grant camera/microphone permissions if prompted
3. In Window 2 (client), accept the incoming call
4. Test the call functionality!

## 💡 Pro Tips

### Multiple User Testing:
- Use **incognito windows** for testing multiple users
- Each incognito window = separate user session
- Regular window + incognito = 2 users simultaneously

### Keyboard Shortcuts:
- **Chrome:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac) for incognito
- **Firefox:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac) for private window

### Browser Setup:
```
Window 1 (Regular):      Login as Therapist
Window 2 (Incognito):    Login as Client
Window 3 (Incognito):    Login as another Therapist
```

### Role-Based Testing:
- **Therapist → Client:** Most common scenario
- **Therapist → Therapist:** Team collaboration
- **Admin:** Full system access

## 🔄 Quick Fill Feature

The login page has a "Show Demo Credentials" button that lets you:
1. Click to see all available users
2. Click any user to auto-fill email and password
3. Just click "Sign In"!

No need to type credentials manually!

## 📝 Notes

- All passwords are intentionally simple for testing
- Users are stored in localStorage (browser-specific)
- Data resets when you clear browser data
- Perfect for development and demos
- **Not for production** - use real authentication

## 🎨 What Each User Can Do

### Therapists (Andrew, George, Nancy):
- ✅ View their own calendar
- ✅ Manage their appointments
- ✅ Message clients
- ✅ Video/audio call clients
- ✅ View client lists
- ✅ Add session notes

### Clients (Susan, John):
- ✅ View their appointments
- ✅ Message their therapist
- ✅ Video/audio call therapist
- ✅ Book new appointments
- ✅ View upcoming sessions

### Admin:
- ✅ Everything therapists can do
- ✅ View all therapists' calendars
- ✅ Manage system settings
- ✅ View all users
- ✅ System administration

## 🚀 Getting Started

1. Open the app
2. Click "Sign In" on landing page
3. Click "Show Demo Credentials"
4. Click any user to auto-fill
5. Click "Sign In"
6. Start testing!

## ❓ Common Questions

### Q: I forgot the password!
**A:** All therapists use `therapist123`, all clients use `client123`, admin uses `admin123`

### Q: How do I test with 2 users?
**A:** Open two browser windows (one incognito), login as different users in each

### Q: Can I add more users?
**A:** Yes! Edit `/data/demoUsers.ts` and add new users

### Q: Do I need to create an account?
**A:** No! Just use the demo credentials provided

### Q: Will my data be saved?
**A:** Only in your browser's localStorage. Clears when you clear browser data.

## 🔗 Related Documentation

- **[WHY_MOCK_USERS.md](./WHY_MOCK_USERS.md)** - Detailed explanation of mock users
- **[QUICK_TESTING_GUIDE.md](./QUICK_TESTING_GUIDE.md)** - Quick testing guide
- **[COMPLETE_TESTING_GUIDE.md](./COMPLETE_TESTING_GUIDE.md)** - Comprehensive testing

## 📧 Credential Summary Table

| Name | Email | Password | UID | Role |
|------|-------|----------|-----|------|
| Andrew Joseph | andrew.joseph@yodha.com | therapist123 | cometchat-uid-1 | Therapist |
| George Alan | george.alan@yodha.com | therapist123 | cometchat-uid-2 | Therapist |
| Nancy Grace | nancy.grace@yodha.com | therapist123 | cometchat-uid-3 | Therapist |
| Susan Marie | susan.marie@email.com | client123 | cometchat-uid-4 | Client |
| John Paul | john.paul@email.com | client123 | cometchat-uid-5 | Client |
| Admin | admin@yodha.com | admin123 | cometchat-uid-admin | Admin |

---

**Happy Testing!** 🎉

For more information, check the [documentation index](./INDEX.md).
