import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'your_supabase_project_url' &&
                      supabaseAnonKey !== 'your_supabase_anon_key' &&
                      supabaseUrl.includes('supabase.co')

if (!hasValidConfig) {
  console.warn('Supabase environment variables not found or invalid. Please connect to Supabase to enable full functionality.')
}

// Create Supabase client with simpler configuration
export const supabase = createClient(
  hasValidConfig ? supabaseUrl : 'https://placeholder.supabase.co', 
  hasValidConfig ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasValidConfig

// Helper function to safely execute Supabase operations
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  if (!hasValidConfig) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error('Supabase not configured. Please check your environment variables.')
  }
  
  try {
    return await operation()
  } catch (error) {
    console.error('Supabase operation failed:', error)
    throw error
  }
}

export type Room = {
  id: string
  room_id: string
  name: string
  creator_id: string
  expires_at: string
  token_requirement?: number
  created_at: string
  is_active: boolean
}

export type Message = {
  id: string
  room_id: string
  user_id: string
  username: string
  content: string
  created_at: string
  reply_to_id?: string
  reply_to_username?: string
  reply_to_content?: string
}

export type RoomUser = {
  id: string
  room_id: string
  user_id: string
  username: string
  is_admin: boolean
  joined_at: string
}

export type MessageReaction = {
  id: string
  message_id: string
  user_id: string
  emoji_id: string
  created_at: string
}