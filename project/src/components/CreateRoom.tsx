import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Shield, QrCode, Copy, Check, AlertCircle, LogIn } from 'lucide-react'
import { createRoom } from '../lib/roomUtils'
import { updateUserActivity } from '../lib/auth'
import { generateRoomQR } from '../lib/qrGenerator'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/auth'

interface CreateRoomProps {
  currentUser?: UserProfile
  onShowAuth?: () => void
}

export const CreateRoom: React.FC<CreateRoomProps> = ({ currentUser, onShowAuth }) => {
  const [roomName, setRoomName] = useState('')
  const [expiryHours, setExpiryHours] = useState(24)
  const [tokenRequirement, setTokenRequirement] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Enhanced debug logging with useEffect to track prop changes
  useEffect(() => {
    console.log('🏠 CreateRoom: Props updated:', {
      currentUser: currentUser ? {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name,
        email: currentUser.email,
        is_owner: currentUser.is_owner
      } : null,
      onShowAuth: typeof onShowAuth,
      hasOnShowAuth: !!onShowAuth
    })
  }, [currentUser, onShowAuth])

  const isSupabaseConnected = () => {
    return import.meta.env.VITE_SUPABASE_URL && 
           import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return

    console.log('🚀 CreateRoom: Create room clicked')
    console.log('👤 CreateRoom: Current user check:', currentUser)

    // Require login for room creation
    if (!currentUser) {
      console.log('❌ CreateRoom: No current user, showing auth modal')
      setError('Please sign in to create a room.')
      if (onShowAuth) {
        console.log('🔐 CreateRoom: Calling onShowAuth function')
        onShowAuth()
      } else {
        console.log('❌ CreateRoom: onShowAuth function not available, trying window event')
        // Fallback: try to trigger auth modal through window event
        window.dispatchEvent(new CustomEvent('show-auth-modal'))
      }
      return
    }

    if (!isSupabaseConnected()) {
      setError('Please connect to Supabase first by clicking the "Connect to Supabase" button in the top right.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🏗️ CreateRoom: Creating room with user:', currentUser.user_id)
      const room = await createRoom(roomName, expiryHours, tokenRequirement, currentUser.user_id)
      setCreatedRoom(room)
      
      // Update user activity
      await updateUserActivity(currentUser.user_id, 'room_created', 10, {
        room_id: room.room_id,
        room_name: roomName,
        expiry_hours: expiryHours
      })
      
      // Generate QR code
      const qrUrl = await generateRoomQR(room.room_id)
      setQrCodeUrl(qrUrl)
    } catch (error: any) {
      console.error('❌ CreateRoom: Error creating room:', error)
      setError(error.message || 'Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/join/${createdRoom.room_id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const enterRoom = async () => {
    console.log('🚪 CreateRoom: Enter room clicked')
    console.log('🏠 CreateRoom: Created room data:', createdRoom)
    console.log('👤 CreateRoom: Current user:', currentUser)
    
    if (!createdRoom || !createdRoom.room_id) {
      console.error('❌ CreateRoom: No room data available for navigation')
      setError('Room data not available. Please try creating the room again.')
      return
    }

    if (!currentUser) {
      console.error('❌ CreateRoom: No current user for room joining')
      setError('Please sign in to join the room.')
      return
    }

    try {
      console.log('🚪 CreateRoom: Starting room entry process...')
      
      // Use a consistent user ID format that matches what JoinRoom uses
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('🆔 CreateRoom: Generated consistent user ID:', userId)
      
      // First, verify the room exists in the database
      console.log('🔍 CreateRoom: Verifying room exists in database...')
      const { data: roomCheck, error: roomCheckError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_id', createdRoom.room_id)
        .single()

      if (roomCheckError || !roomCheck) {
        console.error('❌ CreateRoom: Room not found in database:', roomCheckError)
        throw new Error('Room not found in database. Please try creating the room again.')
      }

      console.log('✅ CreateRoom: Room verified in database:', roomCheck)
      
      // Add the creator to the room_users table using the same method as JoinRoom
      console.log('👤 CreateRoom: Adding creator to room_users table...')
      const { data: userData, error: userError } = await supabase
        .from('room_users')
        .upsert({
          room_id: createdRoom.room_id,
          user_id: userId,
          username: currentUser.display_name,
          is_admin: true // Creator is admin
        }, {
          onConflict: 'room_id,user_id'
        })
        .select()
        .single()

      if (userError) {
        console.error('❌ CreateRoom: Error adding creator to room_users:', userError)
        throw new Error('Failed to join room: ' + userError.message)
      }

      if (!userData) {
        console.error('❌ CreateRoom: No user data returned from upsert')
        throw new Error('Failed to create user session')
      }

      console.log('✅ CreateRoom: Creator added to room successfully:', userData)
      
      // Double-check that the user was actually added
      console.log('🔍 CreateRoom: Verifying user was added to room...')
      const { data: userCheck, error: userCheckError } = await supabase
        .from('room_users')
        .select('*')
        .eq('room_id', createdRoom.room_id)
        .eq('user_id', userId)
        .single()

      if (userCheckError || !userCheck) {
        console.error('❌ CreateRoom: User verification failed:', userCheckError)
        throw new Error('Failed to verify user was added to room')
      }

      console.log('✅ CreateRoom: User verified in room_users table:', userCheck)
      
      // Wait a moment to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Navigate to the chat room with the proper state
      console.log('🚪 CreateRoom: Navigating to chat room with state:', {
        room: createdRoom,
        user: userData
      })
      
      navigate(`/room/${createdRoom.room_id}`, { 
        state: { 
          room: createdRoom, 
          user: userData 
        } 
      })
      
    } catch (error: any) {
      console.error('❌ CreateRoom: Error entering room:', error)
      setError('Failed to enter room. Please try again.')
    }
  }

  // Show login required message if user is not logged in
  if (!currentUser) {
    console.log('🚫 CreateRoom: Showing login required screen')
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center">
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
            <p className="text-gray-400 mb-8">
              You need to be signed in to create rooms. This helps us track your activity and reward you with ZRM tokens!
            </p>
            
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Benefits of Creating an Account</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-purple-300">
                  <Check className="h-4 w-4" />
                  <span>Track your rooms and activity</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-300">
                  <Check className="h-4 w-4" />
                  <span>Earn ZRM tokens for activity</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-300">
                  <Check className="h-4 w-4" />
                  <span>Build your reputation score</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-300">
                  <Check className="h-4 w-4" />
                  <span>Access exclusive features</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                console.log('🔐 CreateRoom: Sign in button clicked, calling onShowAuth')
                if (onShowAuth) {
                  onShowAuth()
                } else {
                  console.log('❌ CreateRoom: onShowAuth not available, trying window event')
                  window.dispatchEvent(new CustomEvent('show-auth-modal'))
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In to Create Room</span>
            </button>

            <p className="text-gray-500 text-sm mt-6">
              Don't have an account? The sign-in modal also allows you to create a new account!
            </p>
          </div>
        </div>
      </div>
    )
  }

  console.log('✅ CreateRoom: User is logged in, showing create room form')

  if (createdRoom) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Room Created!</h1>
            <p className="text-gray-400">Your disposable chatroom is ready</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Room ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-mono font-bold text-purple-400">
                    {createdRoom.room_id}
                  </span>
                  <button
                    onClick={copyRoomLink}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Created by</span>
                <span className="text-cyan-400 font-semibold">
                  {currentUser.display_name}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Expires in</span>
                <span className="text-cyan-400 font-semibold">{expiryHours} hours</span>
              </div>
            </div>

            {qrCodeUrl && (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Share QR Code</h3>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <img src={qrCodeUrl} alt="Room QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={enterRoom}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Enter Room
              </button>
              
              <button
                onClick={copyRoomLink}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Copy className="h-5 w-5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Room</h1>
          <p className="text-gray-400">Set up your disposable chatroom</p>
        </div>

        {!isSupabaseConnected() && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-orange-400 font-medium">Database Not Connected</p>
              <p className="text-orange-300 text-sm mt-1">
                Click "Connect to Supabase" in the top right to enable room creation.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Creator Info - Show logged in user profile */}
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentUser.is_owner
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              }`}>
                {currentUser.is_owner ? '👑' : currentUser.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{currentUser.display_name}</div>
                <div className="text-purple-400 text-sm">Signed in • {currentUser.activity_score.toLocaleString()} pts</div>
              </div>
              <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                Creator
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name (emojis allowed!)..."
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use emojis in your room name! 🎉✨🚀
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Auto-Expiry
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours (default)</option>
              <option value={72}>3 days</option>
              <option value={168}>1 week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Shield className="inline h-4 w-4 mr-1" />
              Token Requirement (Optional)
            </label>
            <input
              type="number"
              value={tokenRequirement || ''}
              onChange={(e) => setTokenRequirement(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Minimum ZRM tokens required to join"
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for open access</p>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!roomName.trim() || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Room...' : 'Create Room'}
          </button>

          {/* Benefits reminder */}
          <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-xl p-4 text-center">
            <p className="text-cyan-400 text-sm mb-2">
              🎉 You'll earn 10 ZRM tokens for creating this room!
            </p>
            <p className="text-cyan-300 text-xs">
              Plus additional tokens for each message and user interaction in your room.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}