import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Send, Clock, Users, LogOut, MessageCircle, Reply, X, Smile } from 'lucide-react'
import { supabase, Message, Room, RoomUser, MessageReaction } from '../lib/supabase'
import { sendMessage, getRoomMessages, addReaction, removeReaction, getMessageReactions } from '../lib/roomUtils'
import { updateUserActivity, normalizeUsername } from '../lib/auth'
import { EmojiReactions, EMOJI_OPTIONS } from './EmojiReactions'
import { OnlineUsersModal } from './OnlineUsersModal'
import type { UserProfile } from '../lib/auth'

interface MessageWithReactions extends Message {
  reactions: Array<{
    id: string
    emoji: string | React.ReactNode
    name: string
    count: number
    userReacted: boolean
  }>
}

interface TypingUser {
  user_id: string
  username: string
  timestamp: number
}

interface ChatRoomProps {
  currentUser?: UserProfile
}

// Animated typing indicator component
const TypingIndicator: React.FC<{ typingUsers: TypingUser[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing`
    }
  }

  return (
    <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">{getTypingText()}...</span>
    </div>
  )
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser }) => {
  const { roomId } = useParams<{ roomId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [messages, setMessages] = useState<MessageWithReactions[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([])
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [reactions, setReactions] = useState<MessageReaction[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  // Get room and user data from navigation state
  const { room, user }: { room: Room; user: RoomUser } = location.state || {}

  // Enhanced debug logging for ChatRoom component
  useEffect(() => {
    console.log('💬 ChatRoom: Component mounted/updated with:', {
      roomId,
      room: room ? {
        id: room.id,
        room_id: room.room_id,
        name: room.name,
        creator_id: room.creator_id
      } : null,
      user: user ? {
        id: user.id,
        room_id: user.room_id,
        user_id: user.user_id,
        username: user.username,
        is_admin: user.is_admin
      } : null,
      currentUser: currentUser ? {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name
      } : null,
      hasLocationState: !!location.state,
      connectionStatus,
      onlineUsersCount: onlineUsers.length
    })
  }, [roomId, room, user, currentUser, location.state, connectionStatus, onlineUsers.length])

  // Check if user is at bottom of chat
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true
    
    const container = messagesContainerRef.current
    const threshold = 100 // pixels from bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    
    setIsAtBottom(isNearBottom)
    setShouldAutoScroll(isNearBottom)
    
    return isNearBottom
  }

  // Smart scroll to bottom - only if user is already at bottom
  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Get message styling based on user type
  const getMessageStyling = (messageUserId: string, messageUsername: string) => {
    if (messageUserId === user?.user_id) {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
    }
    
    // Special styling for Anton (owner)
    if (normalizeUsername(messageUsername) === 'anton') {
      return 'bg-gradient-to-r from-yellow-600/80 to-orange-600/80 text-white border border-yellow-500/30 shadow-lg shadow-yellow-500/20'
    }
    
    return 'bg-gray-800/50 text-gray-100'
  }

  // Get username styling
  const getUsernameStyling = (messageUserId: string, messageUsername: string) => {
    if (messageUserId === user?.user_id) {
      return 'text-purple-200'
    }
    
    // Special styling for Anton (owner)
    if (normalizeUsername(messageUsername) === 'anton') {
      return 'text-yellow-300 font-bold'
    }
    
    return 'text-gray-400'
  }

  // Get display name with special formatting
  const getDisplayName = (messageUserId: string, messageUsername: string) => {
    if (messageUserId === user?.user_id) {
      return 'You'
    }
    
    if (normalizeUsername(messageUsername) === 'anton') {
      return 'Anton 👑'
    }
    
    return messageUsername
  }

  // Simplified user verification - just ensure user exists in room_users
  const ensureUserInRoom = async (): Promise<boolean> => {
    if (!room || !user) {
      console.error('❌ ensureUserInRoom: Missing required data:', { 
        hasRoom: !!room, 
        hasUser: !!user
      })
      return false
    }
    
    try {
      console.log('🔄 ensureUserInRoom: Ensuring user is in room_users table...')
      
      // Simply upsert the user to ensure they exist - use room.room_id not roomId
      const { error: upsertError } = await supabase
        .from('room_users')
        .upsert({
          room_id: room.room_id, // Fixed: use room.room_id instead of roomId
          user_id: user.user_id,
          username: user.username,
          is_admin: user.is_admin || false
        }, {
          onConflict: 'room_id,user_id'
        })

      if (upsertError) {
        console.error('❌ ensureUserInRoom: Error upserting user:', upsertError)
        return false
      }

      console.log('✅ ensureUserInRoom: User ensured in room_users table')
      return true
      
    } catch (error) {
      console.error('💥 ensureUserInRoom: Unexpected error:', error)
      return false
    }
  }

  // Load online users
  const loadOnlineUsers = async () => {
    if (!room?.room_id) {
      console.log('❌ loadOnlineUsers: No room ID provided')
      return
    }
    
    try {
      console.log('👥 loadOnlineUsers: Loading users for room:', room.room_id)
      
      const { data, error } = await supabase
        .from('room_users')
        .select('*')
        .eq('room_id', room.room_id) // Fixed: use room.room_id
        .order('joined_at', { ascending: true })

      if (error) {
        console.error('❌ loadOnlineUsers: Error loading users:', error)
        throw error
      }
      
      const users = data || []
      console.log('👥 loadOnlineUsers: Loaded users:', users.length)
      
      setOnlineUsers(users)
      
    } catch (error) {
      console.error('❌ loadOnlineUsers: Error loading users:', error)
    }
  }

  // Main initialization effect
  useEffect(() => {
    if (!room || !user) {
      console.log('❌ ChatRoom: Missing room or user data, redirecting to home')
      navigate('/')
      return
    }

    console.log('🚀 ChatRoom: Starting initialization...')

    const initializeRoom = async () => {
      try {
        setConnectionStatus('connecting')
        
        // Step 1: Ensure user is in room
        console.log('🔄 ChatRoom: Step 1 - Ensuring user is in room...')
        const userEnsured = await ensureUserInRoom()
        
        if (!userEnsured) {
          console.error('❌ ChatRoom: Failed to ensure user in room')
          setConnectionStatus('error')
          return
        }
        
        // Step 2: Load initial data
        console.log('🔄 ChatRoom: Step 2 - Loading initial data...')
        await Promise.all([
          loadMessages(),
          loadOnlineUsers()
        ])
        
        // Step 3: Set connected status
        setConnectionStatus('connected')
        console.log('🎉 ChatRoom: Initialization completed successfully!')
        
      } catch (error) {
        console.error('💥 ChatRoom: Initialization failed:', error)
        setConnectionStatus('error')
      }
    }

    initializeRoom()

    // Subscribe to new messages - use room.room_id
    const messagesChannel = supabase
      .channel(`room-messages-${room.room_id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${room.room_id}`
        },
        (payload) => {
          console.log('💬 ChatRoom: New message received:', payload.new)
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.find(msg => msg.id === newMsg.id)) {
              return prev
            }
            const messageWithReactions: MessageWithReactions = {
              ...newMsg,
              reactions: []
            }
            return [...prev, messageWithReactions]
          })
        }
      )
      .subscribe((status) => {
        console.log('💬 ChatRoom: Messages subscription status:', status)
      })

    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel(`room-reactions-${room.room_id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'message_reactions'
        },
        () => {
          console.log('😀 ChatRoom: Reaction change detected, reloading reactions...')
          loadReactions()
        }
      )
      .subscribe((status) => {
        console.log('💬 ChatRoom: Reactions subscription status:', status)
      })

    // Subscribe to room users - use room.room_id
    const usersChannel = supabase
      .channel(`room-users-${room.room_id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'room_users',
          filter: `room_id=eq.${room.room_id}`
        },
        (payload) => {
          console.log('👥 ChatRoom: Room users change detected:', payload)
          setTimeout(() => loadOnlineUsers(), 500)
        }
      )
      .subscribe((status) => {
        console.log('💬 ChatRoom: Users subscription status:', status)
      })

    // Subscribe to typing indicators - use room.room_id
    const typingChannel = supabase
      .channel(`room-typing-${room.room_id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, is_typing } = payload.payload
        
        if (user_id === user.user_id) return

        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== user_id)
          
          if (is_typing) {
            return [...filtered, { user_id, username, timestamp: Date.now() }]
          } else {
            return filtered
          }
        })
      })
      .subscribe((status) => {
        console.log('💬 ChatRoom: Typing subscription status:', status)
      })

    // Set up countdown timer
    const timer = setInterval(updateTimeLeft, 1000)
    updateTimeLeft()

    // Clean up old typing indicators
    const typingCleanup = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => Date.now() - user.timestamp < 5000)
      )
    }, 1000)

    return () => {
      console.log('💬 ChatRoom: Cleaning up subscriptions')
      messagesChannel.unsubscribe()
      reactionsChannel.unsubscribe()
      usersChannel.unsubscribe()
      typingChannel.unsubscribe()
      clearInterval(timer)
      clearInterval(typingCleanup)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [room, user, navigate])

  // Only auto-scroll when messages change if user is at bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-scroll when typing users change only if at bottom
  useEffect(() => {
    if (typingUsers.length > 0 && shouldAutoScroll) {
      scrollToBottom()
    }
  }, [typingUsers, shouldAutoScroll])

  useEffect(() => {
    if (messages.length > 0) {
      loadReactions()
    }
  }, [messages.length])

  const loadMessages = async () => {
    if (!room?.room_id) return
    try {
      console.log('💬 loadMessages: Loading messages for room:', room.room_id)
      const data = await getRoomMessages(room.room_id) // Fixed: use room.room_id
      console.log('💬 loadMessages: Loaded messages:', data.length)
      const messagesWithReactions: MessageWithReactions[] = data.map(msg => ({
        ...msg,
        reactions: []
      }))
      setMessages(messagesWithReactions)
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('❌ loadMessages: Error loading messages:', error)
    }
  }

  const loadReactions = async () => {
    if (messages.length === 0) return
    
    try {
      console.log('😀 loadReactions: Loading reactions for', messages.length, 'messages')
      const messageIds = messages.map(msg => msg.id)
      const reactionsData = await getMessageReactions(messageIds)
      console.log('😀 loadReactions: Loaded', reactionsData.length, 'reactions')
      setReactions(reactionsData)
      
      setMessages(prev => prev.map(message => {
        const messageReactions = reactionsData.filter(r => r.message_id === message.id)
        const reactionCounts: { [key: string]: { count: number; userReacted: boolean } } = {}
        
        messageReactions.forEach(reaction => {
          if (!reactionCounts[reaction.emoji_id]) {
            reactionCounts[reaction.emoji_id] = { count: 0, userReacted: false }
          }
          reactionCounts[reaction.emoji_id].count++
          if (reaction.user_id === user?.user_id) {
            reactionCounts[reaction.emoji_id].userReacted = true
          }
        })
        
        const reactions = Object.entries(reactionCounts).map(([emojiId, data]) => {
          const emojiOption = EMOJI_OPTIONS.find(e => e.id === emojiId)
          return {
            id: emojiId,
            emoji: emojiOption?.emoji || emojiId,
            name: emojiOption?.name || emojiId,
            count: data.count,
            userReacted: data.userReacted
          }
        })
        
        return {
          ...message,
          reactions
        }
      }))
    } catch (error) {
      console.error('❌ loadReactions: Error loading reactions:', error)
    }
  }

  const broadcastTyping = (isTyping: boolean) => {
    if (!room?.room_id || !user) return
    
    supabase
      .channel(`room-typing-${room.room_id}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.user_id,
          username: user.username,
          is_typing: isTyping
        }
      })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      broadcastTyping(true)
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      broadcastTyping(false)
    }, 1000)
    
    if (!e.target.value.trim() && isTyping) {
      setIsTyping(false)
      broadcastTyping(false)
    }
  }

  const handleSendMessage = async () => {
    console.log('💬 handleSendMessage: Send message clicked')
    
    if (!newMessage.trim()) {
      console.log('❌ handleSendMessage: Empty message, not sending')
      return
    }
    
    if (!room?.room_id || !user) {
      console.log('❌ handleSendMessage: Missing room ID or user data')
      alert('Error: Missing room or user data')
      return
    }
    
    if (loading) {
      console.log('❌ handleSendMessage: Already loading, not sending')
      return
    }

    if (connectionStatus !== 'connected') {
      console.log('⚠️ handleSendMessage: Not connected')
      alert('Please wait for connection to complete before sending messages.')
      return
    }

    if (isTyping) {
      setIsTyping(false)
      broadcastTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    setLoading(true)
    try {
      console.log('💬 handleSendMessage: Sending message...')
      
      const sentMessage = await sendMessage(
        room.room_id, // Fixed: use room.room_id
        user.user_id, 
        user.username, 
        newMessage.trim(),
        replyingTo?.id,
        replyingTo?.username,
        replyingTo?.content
      )
      console.log('✅ handleSendMessage: Message sent successfully:', sentMessage)
      
      if (currentUser) {
        await updateUserActivity(currentUser.user_id, 'message', 1, {
          room_id: room.room_id,
          message_length: newMessage.trim().length
        })
      }
      
      setMessages(prev => {
        if (prev.find(msg => msg.id === sentMessage.id)) {
          return prev
        }
        const messageWithReactions: MessageWithReactions = {
          ...sentMessage,
          reactions: []
        }
        return [...prev, messageWithReactions]
      })
      
      setNewMessage('')
      setReplyingTo(null)
      
      setShouldAutoScroll(true)
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('❌ handleSendMessage: Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const handleReaction = async (messageId: string, emojiId: string) => {
    if (!user) return
    
    try {
      console.log('😀 handleReaction: Processing reaction:', { messageId, emojiId, userId: user.user_id })
      
      const existingReaction = reactions.find(
        r => r.message_id === messageId && r.user_id === user.user_id && r.emoji_id === emojiId
      )

      if (existingReaction) {
        console.log('😞 handleReaction: Removing existing reaction')
        await removeReaction(messageId, user.user_id, emojiId)
      } else {
        console.log('😀 handleReaction: Adding new reaction')
        await addReaction(messageId, user.user_id, emojiId)
      }
      
      // Immediately reload reactions to update the UI
      setTimeout(() => loadReactions(), 100)
    } catch (error) {
      console.error('❌ handleReaction: Error handling reaction:', error)
    }
  }

  const handleShowEmojiPicker = (messageId: string) => {
    setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId)
  }

  const updateTimeLeft = () => {
    if (!room) return
    
    const now = new Date().getTime()
    const expiry = new Date(room.expires_at).getTime()
    const difference = expiry - now

    if (difference <= 0) {
      setTimeLeft('Expired')
      navigate('/')
      return
    }

    const hours = Math.floor(difference / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
  }

  const leaveRoom = () => {
    if (isTyping) {
      broadcastTyping(false)
    }
    navigate('/')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleScroll = () => {
    checkIfAtBottom()
  }

  if (!room || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Loading room...</p>
          <p className="text-gray-400">If this persists, please return to the home page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Room Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <button
                onClick={() => setShowUsersModal(true)}
                className="flex items-center space-x-1 hover:text-purple-400 transition-colors cursor-pointer"
              >
                <Users className="h-4 w-4" />
                <span>{onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online</span>
              </button>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}</span>
              </span>
              {connectionStatus === 'connecting' && (
                <span className="text-yellow-400 text-xs flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>Connecting...</span>
                </span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-red-400 text-xs flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span>Connection Error</span>
                </span>
              )}
              {connectionStatus === 'connected' && (
                <span className="text-green-400 text-xs flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Connected</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUsersModal(true)}
              className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full px-3 py-1 hover:from-purple-600/30 hover:to-cyan-600/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-purple-300 font-medium">{onlineUsers.length}</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
            </button>
            
            <button
              onClick={leaveRoom}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={messagesContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4"
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-xs lg:max-w-md ${
                  message.user_id === user.user_id ? 'ml-auto' : ''
                }`}
              >
                <div
                  className={`rounded-2xl p-3 relative group ${getMessageStyling(message.user_id, message.username)}`}
                >
                  <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                    <button
                      onClick={() => handleReply(message)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-full"
                      title="Reply"
                    >
                      <Reply className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleShowEmojiPicker(message.id)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-full"
                      title="React"
                    >
                      <Smile className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-xs mb-1">
                    <span className={`font-medium ${getUsernameStyling(message.user_id, message.username)}`}>
                      {getDisplayName(message.user_id, message.username)}
                    </span>
                  </div>

                  {message.reply_to_id && (
                    <div className={`text-xs p-2 rounded-lg mb-2 border-l-2 ${
                      message.user_id === user.user_id
                        ? 'bg-purple-700/30 border-purple-300'
                        : normalizeUsername(message.username) === 'anton'
                        ? 'bg-yellow-700/30 border-yellow-300'
                        : 'bg-gray-700/50 border-gray-400'
                    }`}>
                      <div className="font-medium opacity-80">
                        Replying to {normalizeUsername(message.reply_to_username || '') === 'anton' ? 'Anton 👑' : message.reply_to_username}
                      </div>
                      <div className="opacity-70 truncate">
                        {message.reply_to_content}
                      </div>
                    </div>
                  )}

                  <div className="break-words">{message.content}</div>
                  
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Reactions Display - Fixed to show properly */}
                <EmojiReactions
                  messageId={message.id}
                  reactions={message.reactions}
                  onReact={handleReaction}
                  onShowPicker={handleShowEmojiPicker}
                  showPicker={showEmojiPicker === message.id}
                />
              </div>
            ))
          )}
          
          <TypingIndicator typingUsers={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isAtBottom && (
        <div className="absolute bottom-24 right-6 z-10">
          <button
            onClick={() => {
              setShouldAutoScroll(true)
              scrollToBottom(true)
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            title="Scroll to bottom"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {replyingTo && (
        <div className="bg-gray-800/70 backdrop-blur-sm border-t border-purple-500/20 p-3">
          <div className="container mx-auto">
            <div className="flex items-start justify-between bg-gray-700/50 rounded-lg p-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Reply className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">
                    Replying to {normalizeUsername(replyingTo.username) === 'anton' ? 'Anton 👑' : replyingTo.username}
                  </span>
                </div>
                <div className="text-sm text-gray-300 truncate">
                  {replyingTo.content}
                </div>
              </div>
              <button
                onClick={cancelReply}
                className="text-gray-400 hover:text-white transition-colors ml-3"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-purple-500/20 p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder={
                connectionStatus === 'connected'
                  ? (replyingTo ? `Reply to ${normalizeUsername(replyingTo.username) === 'anton' ? 'Anton 👑' : replyingTo.username}...` : "Type a message...")
                  : "Connecting to room..."
              }
              className="flex-1 bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              onKeyPress={handleKeyPress}
              disabled={loading || connectionStatus !== 'connected'}
              maxLength={1000}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading || connectionStatus !== 'connected'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <div>
              {connectionStatus === 'connecting' && (
                <span className="text-yellow-400">Connecting to room...</span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-red-400">Connection error - please refresh</span>
              )}
              {connectionStatus === 'connected' && (
                <span className="text-green-400">Connected • {onlineUsers.length} online</span>
              )}
            </div>
            <div>
              {newMessage.length}/1000
            </div>
          </div>
        </div>
      </div>

      <OnlineUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        users={onlineUsers}
        currentUserId={user.user_id}
      />
    </div>
  )
}