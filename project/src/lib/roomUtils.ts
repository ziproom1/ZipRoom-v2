import { supabase } from './supabase'

export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const createRoom = async (
  name: string, 
  expiryHours: number = 24, 
  tokenRequirement?: number,
  creatorId: string = 'anonymous'
) => {
  const roomId = generateRoomId()
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
  
  console.log('🏗️ createRoom: Creating room with data:', {
    room_id: roomId,
    name,
    creator_id: creatorId,
    expires_at: expiresAt,
    token_requirement: tokenRequirement,
    is_active: true
  })
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_id: roomId,
      name,
      creator_id: creatorId,
      expires_at: expiresAt,
      token_requirement: tokenRequirement,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('❌ createRoom: Error creating room:', error)
    throw error
  }
  
  console.log('✅ createRoom: Room created successfully:', data)
  return data
}

export const joinRoom = async (roomId: string, username: string) => {
  try {
    console.log('🚪 joinRoom: Starting join process for room:', roomId, 'username:', username)
    
    if (!roomId) {
      console.error('❌ joinRoom: No room ID provided')
      throw new Error('Room ID is required')
    }
    
    if (!username) {
      console.error('❌ joinRoom: No username provided')
      throw new Error('Username is required')
    }
    
    // Check if room exists and is active
    console.log('🔍 joinRoom: Querying room from database...')
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .single()

    console.log('🔍 joinRoom: Room query result:', { room, error: roomError })

    if (roomError) {
      console.error('❌ joinRoom: Room query error:', roomError)
      if (roomError.code === 'PGRST116') {
        throw new Error('Room not found or expired')
      }
      throw new Error('Failed to find room: ' + roomError.message)
    }

    if (!room) {
      console.error('❌ joinRoom: Room not found in database')
      throw new Error('Room not found or expired')
    }

    console.log('✅ joinRoom: Room found:', {
      id: room.id,
      room_id: room.room_id,
      name: room.name,
      creator_id: room.creator_id,
      expires_at: room.expires_at,
      is_active: room.is_active
    })

    // Check if room has expired
    const now = new Date()
    const expiryDate = new Date(room.expires_at)
    console.log('⏰ joinRoom: Checking expiry - Now:', now.toISOString(), 'Expires:', expiryDate.toISOString())
    
    if (expiryDate < now) {
      console.error('❌ joinRoom: Room has expired')
      throw new Error('Room has expired')
    }

    // Generate a unique user ID for this room session
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('🆔 joinRoom: Generated user ID:', userId)

    // CRITICAL FIX: Use INSERT instead of UPSERT to ensure fresh user entry
    console.log('👤 joinRoom: Adding user to room with INSERT...')
    
    // First, remove any existing entries for this user in this room (cleanup)
    await supabase
      .from('room_users')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId)

    // Now insert the user
    const { data: userData, error: userError } = await supabase
      .from('room_users')
      .insert({
        room_id: roomId,
        user_id: userId,
        username,
        is_admin: false
      })
      .select()
      .single()

    console.log('👤 joinRoom: User insert result:', { userData, error: userError })

    if (userError) {
      console.error('❌ joinRoom: Error adding user to room:', userError)
      throw new Error('Failed to join room: ' + userError.message)
    }

    if (!userData) {
      console.error('❌ joinRoom: No user data returned from insert')
      throw new Error('Failed to create user session')
    }

    console.log('✅ joinRoom: User added to room successfully:', {
      id: userData.id,
      room_id: userData.room_id,
      user_id: userData.user_id,
      username: userData.username,
      is_admin: userData.is_admin,
      joined_at: userData.joined_at
    })
    
    // CRITICAL: Wait for database consistency
    console.log('⏳ joinRoom: Waiting for database consistency...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verify the user was actually added
    console.log('🔍 joinRoom: Verifying user was added...')
    const { data: verifyUser, error: verifyError } = await supabase
      .from('room_users')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (verifyError || !verifyUser) {
      console.error('❌ joinRoom: User verification failed:', verifyError)
      throw new Error('Failed to verify user was added to room')
    }

    console.log('✅ joinRoom: User verified in database:', verifyUser)
    
    console.log('🎉 joinRoom: Join process completed successfully')
    console.log('🎉 joinRoom: Returning data:', {
      room: {
        id: room.id,
        room_id: room.room_id,
        name: room.name
      },
      user: {
        id: userData.id,
        user_id: userData.user_id,
        username: userData.username
      }
    })
    
    return { room, user: userData }
  } catch (error) {
    console.error('❌ joinRoom: Join room error:', error)
    throw error
  }
}

export const sendMessage = async (
  roomId: string, 
  userId: string, 
  username: string, 
  content: string,
  replyToId?: string,
  replyToUsername?: string,
  replyToContent?: string
) => {
  try {
    console.log('💬 sendMessage: Starting message send process')
    console.log('💬 sendMessage: Parameters:', {
      roomId,
      userId,
      username,
      content: content.substring(0, 50) + '...',
      hasReply: !!replyToId
    })
    
    // Validate required parameters
    if (!roomId) {
      console.error('❌ sendMessage: No room ID provided')
      throw new Error('Room ID is required')
    }
    
    if (!userId) {
      console.error('❌ sendMessage: No user ID provided')
      throw new Error('User ID is required')
    }
    
    if (!username) {
      console.error('❌ sendMessage: No username provided')
      throw new Error('Username is required')
    }
    
    if (!content || !content.trim()) {
      console.error('❌ sendMessage: No message content provided')
      throw new Error('Message content is required')
    }
    
    const messageData: any = {
      room_id: roomId,
      user_id: userId,
      username,
      content: content.trim()
    }

    // Add reply fields if this is a reply
    if (replyToId && replyToUsername && replyToContent) {
      messageData.reply_to_id = replyToId
      messageData.reply_to_username = replyToUsername
      messageData.reply_to_content = replyToContent.length > 50 
        ? replyToContent.substring(0, 50) + '...' 
        : replyToContent
      console.log('💬 sendMessage: Adding reply data to message')
    }

    console.log('💬 sendMessage: Inserting message into database with data:', messageData)
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      console.error('❌ sendMessage: Database error:', error)
      throw new Error('Failed to send message: ' + error.message)
    }

    if (!data) {
      console.error('❌ sendMessage: No data returned from insert')
      throw new Error('Failed to send message: No data returned')
    }

    console.log('✅ sendMessage: Message sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ sendMessage: Send message error:', error)
    throw error
  }
}

export const getRoomMessages = async (roomId: string) => {
  try {
    console.log('📨 getRoomMessages: Fetching messages for room:', roomId)
    
    if (!roomId) {
      console.error('❌ getRoomMessages: No room ID provided')
      throw new Error('Room ID is required')
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ getRoomMessages: Error fetching messages:', error)
      throw new Error('Failed to fetch messages: ' + error.message)
    }

    console.log('✅ getRoomMessages: Messages fetched successfully:', data?.length || 0, 'messages')
    return data || []
  } catch (error) {
    console.error('❌ getRoomMessages: Get messages error:', error)
    throw error
  }
}

// Reaction functions
export const addReaction = async (messageId: string, userId: string, emojiId: string) => {
  try {
    console.log('😀 addReaction: Adding reaction:', { messageId, userId, emojiId })
    
    const { data, error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        emoji_id: emojiId
      }, {
        onConflict: 'message_id,user_id,emoji_id'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ addReaction: Error adding reaction:', error)
      throw new Error('Failed to add reaction: ' + error.message)
    }

    console.log('✅ addReaction: Reaction added successfully:', data)
    return data
  } catch (error) {
    console.error('❌ addReaction: Add reaction error:', error)
    throw error
  }
}

export const removeReaction = async (messageId: string, userId: string, emojiId: string) => {
  try {
    console.log('😞 removeReaction: Removing reaction:', { messageId, userId, emojiId })
    
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji_id', emojiId)

    if (error) {
      console.error('❌ removeReaction: Error removing reaction:', error)
      throw new Error('Failed to remove reaction: ' + error.message)
    }

    console.log('✅ removeReaction: Reaction removed successfully')
  } catch (error) {
    console.error('❌ removeReaction: Remove reaction error:', error)
    throw error
  }
}

export const getMessageReactions = async (messageIds: string[]) => {
  try {
    console.log('😊 getMessageReactions: Fetching reactions for messages:', messageIds.length)
    
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds)

    if (error) {
      console.error('❌ getMessageReactions: Error fetching reactions:', error)
      throw new Error('Failed to fetch reactions: ' + error.message)
    }

    console.log('✅ getMessageReactions: Reactions fetched successfully:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ getMessageReactions: Get reactions error:', error)
    throw error
  }
}