// Mock data utilities for messaging - will be replaced with API calls

export type UserRole = 'client' | 'therapist' | 'receptionist' | 'admin' | 'super_admin';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  lastMessage: Message;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
}

const STORAGE_KEYS = {
  CONVERSATIONS: 'messaging_conversations_v2',
  MESSAGES: 'messaging_messages_v2',
};

// Initialize mock data
export const initializeMockData = (currentUserId: string, currentUserName: string, userRole: UserRole) => {
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'client-1', name: 'John Smith', role: 'client' }
      ],
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'client-1',
        senderName: 'John Smith',
        senderRole: 'client',
        content: 'Thank you for the session today. I wanted to follow up on the homework assignment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false
      },
      unreadCount: 0,
      isStarred: true,
      isArchived: false
    },
    {
      id: 'conv-2',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'client-2', name: 'Emily Davis', role: 'client' }
      ],
      lastMessage: {
        id: 'msg-2',
        conversationId: 'conv-2',
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: userRole,
        content: 'I\'ve updated your treatment plan. Let me know if you have any questions.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false
      },
      unreadCount: 0,
      isStarred: false,
      isArchived: false
    },
    {
      id: 'conv-3',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'recep-1', name: 'Lisa Anderson', role: 'receptionist' }
      ],
      lastMessage: {
        id: 'msg-3',
        conversationId: 'conv-3',
        senderId: 'recep-1',
        senderName: 'Lisa Anderson',
        senderRole: 'receptionist',
        content: 'Your 2pm appointment has been rescheduled to 3pm.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: false
      },
      unreadCount: 0,
      isStarred: false,
      isArchived: false
    },
    {
      id: 'conv-4',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'client-3', name: 'Michael Brown', role: 'client' }
      ],
      lastMessage: {
        id: 'msg-4',
        conversationId: 'conv-4',
        senderId: 'client-3',
        senderName: 'Michael Brown',
        senderRole: 'client',
        content: 'I\'m experiencing a crisis situation and need immediate assistance.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: false
      },
      unreadCount: 1,
      isStarred: true,
      isArchived: false
    },
    {
      id: 'conv-5',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'admin-1', name: 'System Admin', role: 'admin' }
      ],
      lastMessage: {
        id: 'msg-5',
        conversationId: 'conv-5',
        senderId: 'admin-1',
        senderName: 'System Admin',
        senderRole: 'admin',
        content: 'Please review the updated privacy policy document.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        read: false
      },
      unreadCount: 0,
      isStarred: false,
      isArchived: false
    },
    {
      id: 'conv-6',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'super-1', name: 'Dr. Sarah Supreme', role: 'super_admin' }
      ],
      lastMessage: {
        id: 'msg-6',
        conversationId: 'conv-6',
        senderId: 'super-1',
        senderName: 'Dr. Sarah Supreme',
        senderRole: 'super_admin',
        content: 'Welcome to the new platform! Let me know if you need anything.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        read: false
      },
      unreadCount: 0,
      isStarred: true,
      isArchived: false
    },
    {
      id: 'conv-7',
      participants: [
        { id: currentUserId, name: currentUserName, role: userRole },
        { id: 'therapist-2', name: 'Dr. Emily Chen', role: 'therapist' }
      ],
      lastMessage: {
        id: 'msg-7',
        conversationId: 'conv-7',
        senderId: 'therapist-2',
        senderName: 'Dr. Emily Chen',
        senderRole: 'therapist',
        content: 'Could you cover my shift next Tuesday?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: false
      },
      unreadCount: 1,
      isStarred: false,
      isArchived: false
    }
  ];

  const mockMessages: { [key: string]: Message[] } = {
    'conv-1': [
      {
        id: 'msg-1-1',
        conversationId: 'conv-1',
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: userRole,
        content: 'Hello John, how are you feeling today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false
      },
      {
        id: 'msg-1-2',
        conversationId: 'conv-1',
        senderId: 'client-1',
        senderName: 'John Smith',
        senderRole: 'client',
        content: 'Hi Dr. Johnson, I\'m doing better. The breathing exercises you taught me have been really helpful.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      },
      {
        id: 'msg-1-3',
        conversationId: 'conv-1',
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: userRole,
        content: 'That\'s wonderful to hear! Remember to practice them daily, especially during stressful moments.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: true
      },
      {
        id: 'msg-1-4',
        conversationId: 'conv-1',
        senderId: 'client-1',
        senderName: 'John Smith',
        senderRole: 'client',
        content: 'Thank you for the session today. I wanted to follow up on the homework assignment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false
      }
    ]
  };

  return { mockConversations, mockMessages };
};

// LocalStorage helpers with date serialization
export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

export const loadConversations = (): Conversation[] | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  if (!data) return null;

  const conversations = JSON.parse(data);
  // Convert timestamp strings back to Date objects
  return conversations.map((conv: any) => ({
    ...conv,
    lastMessage: {
      ...conv.lastMessage,
      timestamp: new Date(conv.lastMessage.timestamp)
    }
  }));
};

export const saveMessages = (messages: { [key: string]: Message[] }) => {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

export const loadMessages = (): { [key: string]: Message[] } | null => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return null;

  const messagesMap = JSON.parse(data);
  // Convert timestamp strings back to Date objects
  const result: { [key: string]: Message[] } = {};

  for (const [key, messages] of Object.entries(messagesMap)) {
    result[key] = (messages as any[]).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }

  return result;
};

export const clearMockData = () => {
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
};
