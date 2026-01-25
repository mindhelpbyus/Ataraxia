import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Video, 
  Phone, 
  Search,
  Smile,
  X,
  Download,
  Image as ImageIcon,
  File as FileIcon,
  Check,
  CheckCheck
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { VideoCallRoom } from './VideoCallRoom';
import {
  ChatMessage,
  ChatRoom,
  getOrCreateChatRoom,
  sendMessage,
  sendFileMessage,
  subscribeToMessages,
  subscribeToChatRooms,
  markMessagesAsRead,
  updateTypingStatus,
  subscribeToTyping,
  addReaction,
  removeReaction,
  getUnreadCount
} from '../services/chatService';
import {
  createCallInvitation,
  subscribeToCallInvitations,
  updateCallInvitationStatus,
  CallInvitation
} from '../services/callService';
import { generateDirectChatRoom } from '../services/jitsiService';

interface MessagesViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  online?: boolean;
}

// TODO: Replace with actual user list from backend service
const INITIAL_CONTACTS: Contact[] = [];

export function MessagesView({ currentUserId, currentUserName, currentUserEmail }: MessagesViewProps) {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallRoom, setVideoCallRoom] = useState<string | null>(null);
  const [callInvitations, setCallInvitations] = useState<CallInvitation[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to chat rooms
  useEffect(() => {
    const unsubscribe = subscribeToChatRooms(currentUserId, (rooms) => {
      setChatRooms(rooms);
      
      // Update contacts with room data
      setContacts(prev => prev.map(contact => {
        const room = rooms.find(r => 
          r.user1Id === contact.id || r.user2Id === contact.id
        );
        if (room) {
          return {
            ...contact,
            lastMessage: room.lastMessage,
            lastMessageTime: room.lastMessageTime,
            unreadCount: room.unreadCount || 0
          };
        }
        return contact;
      }));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Subscribe to call invitations
  useEffect(() => {
    const unsubscribe = subscribeToCallInvitations(currentUserId, (invitations) => {
      setCallInvitations(invitations);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Subscribe to messages when chat room changes
  useEffect(() => {
    if (!currentChatRoomId) return;

    const unsubscribe = subscribeToMessages(currentChatRoomId, (msgs) => {
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Mark messages as read
      markMessagesAsRead(currentChatRoomId, currentUserId);
    });

    return () => unsubscribe();
  }, [currentChatRoomId, currentUserId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentChatRoomId) return;

    const unsubscribe = subscribeToTyping(currentChatRoomId, currentUserId, (typing) => {
      setTypingUsers(typing.map(t => t.userName));
    });

    return () => unsubscribe();
  }, [currentChatRoomId, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    
    // Get or create chat room
    const roomId = await getOrCreateChatRoom(
      currentUserId,
      currentUserName,
      currentUserEmail,
      contact.id,
      contact.name,
      contact.email
    );
    
    setCurrentChatRoomId(roomId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChatRoomId || !selectedContact) return;

    try {
      await sendMessage(
        currentChatRoomId,
        currentUserId,
        currentUserName,
        currentUserEmail,
        selectedContact.id,
        selectedContact.name,
        messageText.trim()
      );
      
      setMessageText('');
      setIsTyping(false);
      updateTypingStatus(currentChatRoomId, currentUserId, currentUserName, false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatRoomId || !selectedContact) return;

    try {
      await sendFileMessage(
        currentChatRoomId,
        currentUserId,
        currentUserName,
        currentUserEmail,
        selectedContact.id,
        selectedContact.name,
        file
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (!currentChatRoomId) return;

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      updateTypingStatus(currentChatRoomId, currentUserId, currentUserName, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(currentChatRoomId, currentUserId, currentUserName, false);
    }, 1000);
  };

  const handleStartCall = async (callType: 'video' | 'audio') => {
    if (!selectedContact) return;

    const roomName = generateDirectChatRoom(currentUserId, selectedContact.id);
    
    // Create call invitation
    await createCallInvitation(
      callType,
      roomName,
      currentUserId,
      currentUserName,
      selectedContact.id,
      selectedContact.name
    );

    // Start call
    setVideoCallRoom(roomName);
    setShowVideoCall(true);
  };

  const handleAcceptCall = async (invitation: CallInvitation) => {
    await updateCallInvitationStatus(invitation.id, 'accepted');
    setVideoCallRoom(invitation.roomName);
    setShowVideoCall(true);
  };

  const handleRejectCall = async (invitation: CallInvitation) => {
    await updateCallInvitationStatus(invitation.id, 'rejected');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.id !== currentUserId && (
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👏', '✨'];

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Call Invitations */}
      {callInvitations.map(invitation => (
        <div key={invitation.id} className="fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-50 border-2 border-blue-500 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {invitation.callType === 'video' ? (
                <Video className="w-6 h-6 text-blue-600" />
              ) : (
                <Phone className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{invitation.initiatorName}</p>
              <p className="text-sm text-gray-500">
                Incoming {invitation.callType} call...
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectCall(invitation)}
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleAcceptCall(invitation)}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Video Call Modal */}
      {showVideoCall && videoCallRoom && selectedContact && (
        <VideoCallRoom
          roomName={videoCallRoom}
          userName={currentUserName}
          userEmail={currentUserEmail}
          userId={currentUserId}
          participantIds={[selectedContact.id]}
          participantNames={{ [selectedContact.id]: selectedContact.name }}
          onClose={() => {
            setShowVideoCall(false);
            setVideoCallRoom(null);
          }}
        />
      )}

      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                  selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.lastMessage || contact.email}
                    </p>
                  </div>
                  
                  {contact.unreadCount > 0 && (
                    <Badge variant="blue" size="sm">{contact.unreadCount}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedContact.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedContact.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartCall('audio')}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartCall('video')}
              >
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                const showDate = index === 0 || 
                  new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(msg.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p>{msg.message}</p>

                          {/* Reactions */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full"
                                  onClick={() => {
                                    if (users.includes(currentUserId)) {
                                      removeReaction(msg.id, currentUserId, emoji);
                                    } else {
                                      addReaction(msg.id, currentUserId, emoji);
                                    }
                                  }}
                                >
                                  {emoji} {users.length}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 px-2">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            <span className="text-xs text-gray-500">
                              {msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <div className="flex-1">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="resize-none"
                />
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-2 flex gap-1 border border-gray-200">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageText(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl hover:bg-gray-100 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a contact to start chatting</p>
            <p className="text-sm">Choose from the list to begin a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}