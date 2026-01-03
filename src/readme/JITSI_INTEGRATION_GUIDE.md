# Jitsi Video/Audio Call Integration Guide

## Overview

The Ataraxia wellness management system now includes comprehensive video and audio calling powered by Jitsi Meet, integrated with Firebase for chat messaging and call logging.

## Features Implemented

### 🎥 Video & Audio Calling
- **Jitsi Meet Integration**: Free, open-source video conferencing
- **Custom Branding**: Ataraxia logo and colors
- **Call Types**: Both video and audio calls supported
- **Call from Appointments**: Start calls directly from appointment panels
- **Call from Messages**: Initiate calls from the messages view

### 💬 Real-time Chat
- **Firebase Firestore**: Real-time message synchronization
- **Text Messages**: Send and receive text messages instantly
- **File Sharing**: Upload and share files and images
- **Typing Indicators**: See when others are typing
- **Read Receipts**: Know when messages are read
- **Message Reactions**: React to messages with emojis

### 📞 Call Management
- **Call Logging**: Automatic logging of all calls to Firebase
- **Call Duration**: Track call duration automatically
- **Call Invitations**: Send and receive call invitations
- **Call History**: View complete call history
- **Call Notes**: Add notes after calls

### 🎨 Customization
- **Ataraxia Branding**: Custom logo and colors in Jitsi interface
- **Full Toolbar**: Access to all Jitsi features
- **Screen Sharing**: Share screen during calls
- **Recording**: Record sessions (if enabled)
- **Background Blur**: Virtual backgrounds support

## Firebase Collections

### Chat Messages
Collection: `messages`
```typescript
{
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: Record<string, string[]>;
}
```

### Chat Rooms
Collection: `chatRooms`
```typescript
{
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantEmails: Record<string, string>;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Call Logs
Collection: `callLogs`
```typescript
{
  id: string;
  callType: 'video' | 'audio';
  roomName: string;
  initiatorId: string;
  initiatorName: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'initiated' | 'ongoing' | 'completed' | 'missed' | 'cancelled';
  appointmentId?: string;
  recordingUrl?: string;
  notes?: string;
}
```

### Call Invitations
Collection: `callInvitations`
```typescript
{
  id: string;
  callType: 'video' | 'audio';
  roomName: string;
  initiatorId: string;
  initiatorName: string;
  recipientId: string;
  recipientName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  appointmentId?: string;
}
```

### Typing Indicators
Collection: `typing`
```typescript
{
  chatRoomId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}
```

## Firestore Security Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Chat Rooms
    match /chatRooms/{roomId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.senderId || 
                      request.auth.uid == resource.data.recipientId);
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.senderId || 
                        request.auth.uid == resource.data.recipientId);
    }
    
    // Call Logs
    match /callLogs/{logId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participantIds;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.initiatorId;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.participantIds;
    }
    
    // Call Invitations
    match /callInvitations/{invitationId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.initiatorId || 
                      request.auth.uid == resource.data.recipientId);
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.initiatorId;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.initiatorId || 
                        request.auth.uid == resource.data.recipientId);
    }
    
    // Typing Indicators
    match /typing/{typingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firebase Storage Rules

For file sharing in chat:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat-files/{chatRoomId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

## Usage

### Starting a Video Call from Appointment

1. Open an appointment in the calendar
2. Click the appointment to open the details panel
3. Click "Start Video Call" or "Start Audio Call" button
4. The Jitsi interface will open full-screen
5. Click "End Call" when finished

### Using the Messages View

1. Navigate to the "Messages" tab
2. Select a contact from the list
3. Type and send messages
4. Click the video or phone icon to start a call
5. Upload files using the paperclip icon
6. React to messages by clicking on them

### Call Invitations

- When someone calls you, a notification appears in the top-right
- Click "Accept" to join the call
- Click "Decline" to reject the call
- Invitations expire after 1 minute

## Customization

### Change Jitsi Domain

Edit `/services/jitsiService.ts`:

```typescript
export function getJitsiDomain(): string {
  return 'your-jitsi-domain.com'; // Default: meet.jit.si
}
```

### Customize Branding

Update the config in `/services/jitsiService.ts`:

```typescript
configOverwrite: {
  defaultLogoUrl: '/your-logo.png',
  // ... other settings
}
```

### Add Custom Features

Modify the toolbar buttons in `interfaceConfigOverwrite`:

```typescript
TOOLBAR_BUTTONS: [
  'microphone',
  'camera',
  // Add or remove buttons as needed
]
```

## Testing

### Test Chat
1. Open app in two browser windows
2. Login as different users
3. Navigate to Messages tab
4. Send messages back and forth

### Test Video Calls
1. Open app in two browser windows
2. Login as different users
3. Start a video call from one window
4. Accept the call in the other window

### Test Appointment Calls
1. Create an appointment
2. Click on the appointment
3. Click "Start Video Call"
4. Share the appointment link with others

## Troubleshooting

### Messages not appearing
- Check Firebase console for security rule errors
- Verify user is authenticated
- Check browser console for errors

### Video call not starting
- Ensure Jitsi script is loaded (check network tab)
- Check for camera/microphone permissions
- Verify internet connection

### Files not uploading
- Check Firebase Storage rules
- Verify file size is under 10MB
- Check Firebase Storage quota

## Production Deployment

### Self-Hosted Jitsi (Optional)

For complete control and privacy:

1. Deploy your own Jitsi server
2. Update `getJitsiDomain()` to point to your server
3. Configure your server with SSL certificates
4. Update Firestore rules for your domain

### Firebase Configuration

1. Enable Firestore in Firebase Console
2. Enable Firebase Storage
3. Deploy security rules
4. Set up Firebase indexes for queries
5. Configure CORS for storage if needed

## Cost Considerations

- **Jitsi Meet (meet.jit.si)**: Free for unlimited users
- **Firebase Firestore**: Free tier includes 50K reads/day, 20K writes/day
- **Firebase Storage**: Free tier includes 1GB storage, 10GB/month transfer
- **Self-hosted Jitsi**: Server costs vary by provider

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate user permissions** before allowing calls
3. **Sanitize file uploads** before storing
4. **Set file size limits** to prevent abuse
5. **Monitor Firebase usage** to prevent quota overages
6. **Use Firebase App Check** for additional security
7. **Enable reCAPTCHA** for call invitations

## Future Enhancements

- [ ] End-to-end encryption for messages
- [ ] Voice messages
- [ ] Message search
- [ ] Group video calls
- [ ] Call scheduling
- [ ] Call recording with consent
- [ ] Screen annotation during calls
- [ ] Whiteboard integration
- [ ] Automatic call transcription

## Support

For issues or questions:
- Check Firebase Console for errors
- Review browser console logs
- Verify Firestore security rules
- Test with different browsers
- Check Jitsi service status

## License

This integration uses:
- **Jitsi Meet**: Apache License 2.0
- **Firebase**: Google Terms of Service
- See `/Attributions.md` for full details
