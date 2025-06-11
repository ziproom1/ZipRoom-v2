import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  email: string
  avatar_url?: string
  bio?: string
  is_owner: boolean
  activity_score: number
  total_messages: number
  rooms_created: number
  tokens_earned: number
  wallet_balance: number
  created_at: string
  last_active: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

// Generate a random session token
const generateSessionToken = (): string => {
  return uuidv4() + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
}

// Normalize username (lowercase, no spaces)
export const normalizeUsername = (username: string): string => {
  return username.toLowerCase().replace(/\s+/g, '').trim()
}

// Format ZRM balance for display
export const formatZRMBalance = (balanceWei: number): string => {
  // Special case for Anton - check for the safe bigint threshold
  if (balanceWei >= 1000000000000000000) {
    return '10,000,000'
  }
  
  // For other users, convert from wei (18 decimals) to ZRM tokens
  const balance = balanceWei / Math.pow(10, 18)
  
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`
  } else {
    return balance.toLocaleString()
  }
}

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const normalizedUsername = normalizeUsername(username)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', normalizedUsername)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows returned, username is available
      return true
    }

    if (error) {
      console.error('Error checking username availability:', error)
      throw new Error('Failed to check username availability')
    }

    // Username exists
    return false
  } catch (error) {
    console.error('Error in checkUsernameAvailability:', error)
    throw error
  }
}

// Generate username suggestions
export const generateUsernameSuggestions = async (baseUsername: string): Promise<string[]> => {
  const normalizedBase = normalizeUsername(baseUsername)
  const suggestions: string[] = []
  
  // Generate variations
  const variations = [
    `${normalizedBase}${Math.floor(Math.random() * 100)}`,
    `${normalizedBase}${Math.floor(Math.random() * 1000)}`,
    `${normalizedBase}_${Math.floor(Math.random() * 100)}`,
    `the_${normalizedBase}`,
    `${normalizedBase}_pro`,
    `${normalizedBase}_${new Date().getFullYear()}`,
    `${normalizedBase}x`,
    `${normalizedBase}_official`
  ]
  
  // Check which ones are available
  for (const variation of variations) {
    try {
      const available = await checkUsernameAvailability(variation)
      if (available) {
        suggestions.push(variation)
      }
    } catch (error) {
      console.error('Error checking suggestion:', variation, error)
    }
  }
  
  return suggestions.slice(0, 5) // Return up to 5 suggestions
}

// Check if user exists by username
export const checkUserExists = async (username: string): Promise<boolean> => {
  try {
    const normalizedUsername = normalizeUsername(username)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', normalizedUsername)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows returned, user doesn't exist
      return false
    }

    if (error) {
      console.error('Error checking if user exists:', error)
      throw new Error('Failed to check if user exists')
    }

    // User exists
    return true
  } catch (error) {
    console.error('Error in checkUserExists:', error)
    throw error
  }
}

// Hash password using the same method as the database
const hashPassword = async (password: string): Promise<string> => {
  // Use the same hashing method as the database function
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'ziproom_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Verify password using the same method as the database
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

// Register a new user using custom authentication
export const registerUser = async (
  username: string,
  displayName: string,
  email: string,
  password: string,
  bio: string = ''
): Promise<UserProfile> => {
  try {
    console.log('🔐 Starting user registration for:', username)
    const normalizedUsername = normalizeUsername(username)
    
    // Check if username is available
    const available = await checkUsernameAvailability(normalizedUsername)
    if (!available) {
      throw new Error('Username is already taken')
    }
    
    // Special handling for "anton" username
    const isOwner = normalizedUsername === 'anton'
    const initialTokens = isOwner ? 10000000 : 0 // 10M tokens for anton
    const walletBalance = isOwner ? 1000000000000000000 : 0 // Safe bigint value for anton
    
    // Hash password using the same method as the database
    const passwordHash = await hashPassword(password)
    
    console.log('🏗️ Creating user profile with data:', {
      user_id: normalizedUsername,
      display_name: displayName,
      email: email.toLowerCase(),
      is_owner: isOwner,
      tokens_earned: initialTokens,
      wallet_balance: walletBalance
    })
    
    // Create user profile directly
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: normalizedUsername,
        display_name: displayName,
        email: email.toLowerCase(),
        bio: bio,
        is_owner: isOwner,
        tokens_earned: initialTokens,
        wallet_balance: walletBalance,
        password_hash: passwordHash
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError)
      throw new Error('Failed to create user profile: ' + profileError.message)
    }

    console.log('✅ User profile created successfully:', profile)

    // Log registration activity
    if (profile) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: normalizedUsername,
          activity_type: 'user_registered',
          points_earned: isOwner ? 1000 : 100,
          metadata: {
            display_name: displayName,
            is_owner: isOwner
          }
        })
    }

    return profile
  } catch (error) {
    console.error('❌ Error in registerUser:', error)
    throw error
  }
}

// Login user using custom authentication
export const loginUser = async (username: string, password: string): Promise<{
  profile: UserProfile
  session: UserSession
}> => {
  try {
    console.log('🔐 Starting login for username:', username)
    const normalizedUsername = normalizeUsername(username)
    
    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', normalizedUsername)
      .single()

    if (profileError || !profile) {
      console.error('❌ User not found:', profileError)
      throw new Error('User not found. Please check your username or create an account.')
    }

    console.log('👤 Found user profile:', profile.display_name)

    // Verify password
    const passwordValid = await verifyPassword(password, profile.password_hash)
    if (!passwordValid) {
      console.error('❌ Password verification failed')
      throw new Error('Incorrect password. Please try again.')
    }

    console.log('✅ Password verified successfully')

    // Create custom session record
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    console.log('🎫 Creating session with token:', sessionToken.substring(0, 20) + '...')

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: normalizedUsername,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      console.error('❌ Error creating session:', sessionError)
      throw new Error('Failed to create session: ' + sessionError.message)
    }

    console.log('✅ Session created successfully')

    // Update last active
    await supabase
      .from('user_profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', normalizedUsername)

    // Log login activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: normalizedUsername,
        activity_type: 'user_login',
        points_earned: 5,
        metadata: {
          login_time: new Date().toISOString()
        }
      })

    console.log('🎉 Login completed successfully for:', profile.display_name)
    return { profile, session }
  } catch (error) {
    console.error('❌ Error in loginUser:', error)
    throw error
  }
}

// Validate session token
export const validateSession = async (sessionToken: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 Validating session token:', sessionToken.substring(0, 20) + '...')
    
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError) {
      console.log('❌ Session validation error:', sessionError.message)
      return null
    }

    if (!session) {
      console.log('❌ No valid session found')
      return null
    }

    console.log('✅ Valid session found for user:', session.user_id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user_id)
      .single()

    if (profileError || !profile) {
      console.log('❌ Profile not found for session user:', session.user_id)
      return null
    }

    console.log('✅ Profile found:', profile.display_name)
    return profile
  } catch (error) {
    console.error('❌ Error validating session:', error)
    return null
  }
}

// Logout user (invalidate session)
export const logoutUser = async (sessionToken: string): Promise<void> => {
  try {
    console.log('👋 Logging out user with session:', sessionToken.substring(0, 20) + '...')
    // Remove custom session
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken)
    console.log('✅ Session invalidated successfully')
  } catch (error) {
    console.error('❌ Error logging out user:', error)
    throw error
  }
}

// Get user profile by user_id
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return null
    }

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<UserProfile, 'display_name' | 'bio' | 'avatar_url'>>
): Promise<UserProfile | null> => {
  try {
    console.log('📝 Updating profile for user:', userId)
    console.log('📝 Update data:', updates)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('❌ Error updating user profile:', error)
      throw new Error('Failed to update profile')
    }

    if (!data || data.length === 0) {
      console.error('❌ No profile found for user:', userId)
      return null
    }

    console.log('✅ Profile updated successfully:', data[0])
    return data[0]
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    throw error
  }
}

// Update user activity
export const updateUserActivity = async (
  userId: string,
  activityType: string,
  points: number = 1,
  metadata: any = {}
): Promise<void> => {
  try {
    // Insert activity log
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_type: activityType,
        points_earned: points,
        metadata: metadata
      })

    // Get current user profile to calculate new values
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('activity_score, total_messages, rooms_created')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError)
      return
    }

    // Calculate new values
    const updates: any = {
      activity_score: currentProfile.activity_score + points,
      last_active: new Date().toISOString()
    }

    if (activityType === 'message') {
      updates.total_messages = currentProfile.total_messages + 1
    } else if (activityType === 'room_created') {
      updates.rooms_created = currentProfile.rooms_created + 1
    }

    // Update user profile stats
    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)

  } catch (error) {
    console.error('Error updating user activity:', error)
  }
}