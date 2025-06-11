import React, { useState } from 'react'
import { X, User, Crown, Zap, MessageCircle, Trophy, Coins, Wallet, Edit3, Save, Copy, Check, TrendingUp, Shield, Star, Sparkles, Lock, ArrowUp, CheckCircle } from 'lucide-react'
import { formatZRMBalance, updateUserProfile } from '../lib/auth'
import type { UserProfile as UserProfileType } from '../lib/auth'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfileType
  onProfileUpdate: (updatedProfile: UserProfileType) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onProfileUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    display_name: profile.display_name,
    bio: profile.bio
  })
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Updating profile for user:', profile.user_id)
      console.log('Update data:', editData)
      
      const updatedProfile = await updateUserProfile(profile.user_id, editData)
      if (updatedProfile) {
        console.log('Profile updated successfully:', updatedProfile)
        onProfileUpdate(updatedProfile)
        setIsEditing(false)
        
        // Show success confirmation
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError('Profile not found. Please try logging in again.')
        console.error('Profile update returned null - user not found:', profile.user_id)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(profile.user_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate user rank (Anton is always #1)
  const userRank = profile.user_id === 'anton' ? 1 : Math.max(2, Math.floor(Math.random() * 100) + 2)

  // Calculate USD value ($0.25 per ZRM token)
  const zrmBalance = parseFloat(formatZRMBalance(profile.wallet_balance).replace(/,/g, ''))
  const usdValue = zrmBalance * 0.25

  // Get suggested bio for Anton
  const getSuggestedBio = () => {
    if (profile.user_id === 'anton') {
      return "🚀 Founder & CEO of ZipRoom | Building the future of ephemeral communication 💬 | Crypto innovator passionate about privacy-first solutions 🔐 | Leading the revolution in disposable chat technology ⚡ | 10M+ ZRM holder & platform architect 👑"
    }
    return profile.bio
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <User className="h-6 w-6 text-purple-400" />
            <span>Profile</span>
          </h2>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true)
                  setError(null)
                  setShowSuccess(false)
                  // Auto-fill suggested bio for Anton
                  if (profile.user_id === 'anton' && !profile.bio) {
                    setEditData(prev => ({ ...prev, bio: getSuggestedBio() }))
                  }
                }}
                className="text-gray-400 hover:text-purple-400 transition-colors"
                title="Edit Profile"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium">Profile Updated Successfully!</p>
              <p className="text-green-300 text-sm">Your changes have been saved.</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold relative ${
              profile.is_owner 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/25' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            }`}>
              {profile.is_owner ? (
                <Crown className="h-8 w-8" />
              ) : (
                profile.display_name.charAt(0).toUpperCase()
              )}
              {profile.is_owner && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <Star className="h-4 w-4 text-yellow-900" />
                </div>
              )}
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={editData.display_name}
                onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                className="text-xl font-bold text-white bg-gray-900/50 border border-purple-500/30 rounded-lg px-3 py-1 text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                maxLength={50}
              />
            ) : (
              <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                <span>{profile.display_name}</span>
                {profile.is_owner && <Crown className="h-5 w-5 text-yellow-400" />}
              </h3>
            )}
            
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="text-gray-400 font-mono text-sm">@{profile.user_id}</span>
              <button
                onClick={copyUserId}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy User ID"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Rank Badge */}
            <div className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 font-bold">
                #{userRank} {userRank === 1 ? 'TOP RANK' : 'RANKED'}
              </span>
              {userRank === 1 && <Crown className="h-4 w-4 text-yellow-400" />}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={200}
                  placeholder="Tell us about yourself..."
                />
                {profile.user_id === 'anton' && !editData.bio && (
                  <button
                    onClick={() => setEditData(prev => ({ ...prev, bio: getSuggestedBio() }))}
                    className="text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 px-3 py-1 rounded-lg transition-colors"
                  >
                    Use suggested bio for founder
                  </button>
                )}
                <div className="text-xs text-gray-500 text-right">
                  {editData.bio.length}/200 characters
                </div>
              </div>
            ) : (
              <p className="text-gray-300 bg-gray-900/30 rounded-xl p-4 min-h-[80px] leading-relaxed">
                {profile.bio || 'No bio yet...'}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">#{userRank}</div>
              <div className="text-xs text-gray-400">Global Rank</div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{profile.activity_score.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Activity Score</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{profile.total_messages.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Messages</div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{profile.rooms_created.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Rooms Created</div>
            </div>
          </div>

          {/* Enhanced ZRM Wallet Section */}
          <div className="relative overflow-hidden">
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-cyan-600/10 rounded-2xl" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-t-2xl animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-purple-800/30 via-gray-800/50 to-cyan-800/30 border border-purple-500/40 rounded-2xl p-6 backdrop-blur-sm">
              {/* Header with animated elements */}
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white flex items-center space-x-3">
                  <div className="relative">
                    <Wallet className="h-6 w-6 text-purple-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    ZRM Wallet
                  </span>
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                    <Shield className="h-3 w-3" />
                    <span>Secured</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                    <Lock className="h-3 w-3" />
                    <span>Self-Custody</span>
                  </div>
                </div>
              </div>
              
              {/* Main balance display */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                    {formatZRMBalance(profile.wallet_balance)}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-xl rounded-full animate-pulse" />
                </div>
                <div className="text-lg font-semibold text-gray-300 mb-4">ZRM Tokens</div>
                
                {/* USD Value with trend */}
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl font-bold text-green-400">
                      ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      <ArrowUp className="h-3 w-3" />
                      <span>+24.5%</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">USD Value (24h)</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{profile.tokens_earned.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">$0.25</div>
                  <div className="text-xs text-gray-400">Price</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">+15.2%</div>
                  <div className="text-xs text-gray-400">7d Change</div>
                </div>
              </div>

              {/* Owner privileges section */}
              {profile.is_owner && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-300 font-semibold">Owner Privileges</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <Zap className="h-3 w-3" />
                      <span>Unlimited Tokens</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <Shield className="h-3 w-3" />
                      <span>Admin Access</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <Star className="h-3 w-3" />
                      <span>Priority Support</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <TrendingUp className="h-3 w-3" />
                      <span>Analytics Access</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Coins className="h-4 w-4" />
                  <span>Stake</span>
                </button>
                <button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trade</span>
                </button>
              </div>

              {/* Security footer */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Live Prices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                  setShowSuccess(false)
                  setEditData({
                    display_name: profile.display_name,
                    bio: profile.bio
                  })
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}