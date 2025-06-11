import React from 'react'
import { X, Users, Crown, Zap, MessageCircle } from 'lucide-react'
import { normalizeUsername } from '../lib/auth'
import type { RoomUser } from '../lib/supabase'

interface OnlineUsersModalProps {
  isOpen: boolean
  onClose: () => void
  users: RoomUser[]
  currentUserId: string
}

export const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  currentUserId 
}) => {
  if (!isOpen) return null

  const sortedUsers = [...users].sort((a, b) => {
    // Owner first, then admins, then by join time
    if (normalizeUsername(a.username) === 'anton') return -1
    if (normalizeUsername(b.username) === 'anton') return 1
    if (a.is_admin && !b.is_admin) return -1
    if (!a.is_admin && b.is_admin) return 1
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
  })

  const getUserDisplayName = (user: RoomUser): string => {
    if (normalizeUsername(user.username) === 'anton') return 'Anton 👑'
    return user.username
  }

  const getUserRole = (user: RoomUser): string => {
    if (normalizeUsername(user.username) === 'anton') return 'Owner'
    if (user.is_admin) return 'Admin'
    return 'Member'
  }

  const getUserRoleColor = (user: RoomUser): string => {
    if (normalizeUsername(user.username) === 'anton') return 'text-yellow-400'
    if (user.is_admin) return 'text-purple-400'
    return 'text-gray-400'
  }

  const getUserBorderColor = (user: RoomUser): string => {
    if (normalizeUsername(user.username) === 'anton') return 'border-yellow-500/30 bg-gradient-to-r from-yellow-600/10 to-orange-600/10'
    if (user.is_admin) return 'border-purple-500/30 bg-purple-600/10'
    return 'border-gray-600/30 bg-gray-700/10'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span>Online Users ({users.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {sortedUsers.map((user) => (
            <div
              key={user.id}
              className={`border rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] ${getUserBorderColor(user)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    normalizeUsername(user.username) === 'anton'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                      : user.is_admin
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                  }`}>
                    {normalizeUsername(user.username) === 'anton' ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        user.user_id === currentUserId ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {getUserDisplayName(user)}
                      </span>
                      {user.user_id === currentUserId && (
                        <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={getUserRoleColor(user)}>
                        {getUserRole(user)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        Joined {new Date(user.joined_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>

              {/* User Stats (if available) */}
              {normalizeUsername(user.username) === 'anton' && (
                <div className="mt-3 pt-3 border-t border-yellow-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Crown className="h-3 w-3" />
                      <span>Platform Owner</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Zap className="h-3 w-3" />
                      <span>5M ZRM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Real-time updates</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}