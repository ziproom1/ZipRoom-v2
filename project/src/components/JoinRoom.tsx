import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, Loader2, User } from 'lucide-react'
import { joinRoom } from '../lib/roomUtils'
import type { UserProfile } from '../lib/auth'

interface JoinRoomProps {
  currentUser?: UserProfile
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ currentUser }) => {
  const { roomId } = useParams<{ roomId: string }>()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Enhanced debug logging
  useEffect(() => {
    console.log('🚪 JoinRoom: Component mounted/updated:', {
      roomId,
      currentUser: currentUser ? {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name,
        email: currentUser.email
      } : null,
      hasCurrentUser: !!currentUser
    })
  }, [roomId, currentUser])

  const handleJoinRoom = async () => {
    console.log('🚪 JoinRoom: Join room clicked')
    
    // For logged-in users, use their display name; for anonymous users, require username input
    const usernameToUse = currentUser ? currentUser.display_name : username.trim()
    
    console.log('🚪 JoinRoom: Username to use:', usernameToUse)
    console.log('🚪 JoinRoom: Room ID:', roomId)
    
    if (!usernameToUse || !roomId) {
      console.error('❌ JoinRoom: Missing username or room ID')
      setError('Missing required information to join room')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🚪 JoinRoom: Calling joinRoom function...')
      const result = await joinRoom(roomId, usernameToUse)
      
      console.log('✅ JoinRoom: Successfully joined room:', result)
      console.log('🏠 JoinRoom: Room data:', result.room)
      console.log('👤 JoinRoom: User data:', result.user)
      
      // Navigate to chat room with user data
      console.log('🚪 JoinRoom: Navigating to chat room...')
      navigate(`/room/${roomId}`, { 
        state: { 
          room: result.room, 
          user: result.user 
        } 
      })
      
    } catch (error: any) {
      console.error('❌ JoinRoom: Error joining room:', error)
      setError(error.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="bg-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Room</h1>
          {roomId && (
            <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
              <span className="text-gray-400 text-sm">Room ID:</span>
              <div className="text-2xl font-mono font-bold text-purple-400">
                {roomId}
              </div>
            </div>
          )}
          <p className="text-gray-400">
            {currentUser ? 'Ready to join the conversation!' : 'Enter your username to start chatting'}
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
              {error}
            </div>
          )}

          {/* User Info Section */}
          {currentUser ? (
            <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentUser.is_owner
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                }`}>
                  {currentUser.is_owner ? '👑' : currentUser.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{currentUser.display_name}</div>
                  <div className="text-cyan-400 text-sm">Signed in • {currentUser.activity_score.toLocaleString()} pts</div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                  Auto-filled
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && username.trim() && handleJoinRoom()}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be your display name in the chat
              </p>
            </div>
          )}

          <button
            onClick={handleJoinRoom}
            disabled={(currentUser ? false : !username.trim()) || loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                <span>Join Room</span>
              </>
            )}
          </button>

          {/* Sign up prompt for anonymous users */}
          {!currentUser && (
            <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 text-center">
              <p className="text-purple-400 text-sm mb-2">
                Want to keep your identity across rooms?
              </p>
              <p className="text-purple-300 text-xs">
                Sign up for a free account to maintain your username, earn tokens, and track your activity!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}