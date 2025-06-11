import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Clock, Shield, Zap, MessageCircle, QrCode, Trophy, Crown } from 'lucide-react'
import type { UserProfile } from '../lib/auth'

interface LandingPageProps {
  currentUser?: UserProfile
  onShowAuth?: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ currentUser, onShowAuth }) => {
  const [joinRoomId, setJoinRoomId] = useState('')
  const navigate = useNavigate()

  const handleCreateRoom = () => {
    if (!currentUser && onShowAuth) {
      // Show login modal if user is not logged in
      onShowAuth()
      return
    }
    navigate('/create')
  }

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/join/${joinRoomId.toUpperCase()}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative inline-block mb-6">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            ZipRoom
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 blur-xl rounded-full animate-pulse" />
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Disposable chatrooms for <span className="text-purple-400 font-semibold">real-life moments</span>
        </p>
        
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">
          Create instant, temporary chatrooms that vanish after 24 hours. Perfect for events, meetups, and spontaneous conversations.
        </p>

        {/* User Welcome */}
        {currentUser && (
          <div className={`mb-8 p-4 rounded-xl border ${
            currentUser.is_owner
              ? 'bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-yellow-500/30'
              : 'bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/30'
          }`}>
            <div className="flex items-center justify-center space-x-3">
              {currentUser.is_owner && <Crown className="h-6 w-6 text-yellow-400" />}
              <span className="text-white font-medium">
                Welcome back, {currentUser.display_name}!
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span>{currentUser.activity_score.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4 text-cyan-400" />
                  <span>{currentUser.total_messages.toLocaleString()} messages</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
          <button
            onClick={handleCreateRoom}
            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 w-full md:w-auto"
          >
            <div className="flex items-center justify-center space-x-3">
              <Plus className="h-6 w-6" />
              <span>Create Room</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </button>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              className="bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm flex-1"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={!joinRoomId.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <Users className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Login prompt for anonymous users */}
        {!currentUser && (
          <div className="mt-8 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-3">Ready to create your first room?</h3>
            <p className="text-gray-300 mb-4">
              Sign in to create rooms, earn ZRM tokens, and track your activity across the platform.
            </p>
            <button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Sign In to Get Started
            </button>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
          <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Auto-Expiry</h3>
          <p className="text-gray-400">Rooms automatically delete after 24 hours. No permanent data storage.</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300">
          <div className="bg-cyan-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <QrCode className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">QR Code Sharing</h3>
          <p className="text-gray-400">Share rooms instantly with generated QR codes. Perfect for events.</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all duration-300">
          <div className="bg-pink-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Token Gating</h3>
          <p className="text-gray-400">Optional ZRM token requirements for exclusive access control.</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300">
          <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Instant Access</h3>
          <p className="text-gray-400">Sign in once and join any room instantly. Build your reputation.</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300">
          <div className="bg-orange-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle className="h-6 w-6 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Real-time Chat</h3>
          <p className="text-gray-400">Lightning-fast messaging with reactions, replies, and emoji support.</p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
          <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Earn & Rank</h3>
          <p className="text-gray-400">Build your profile, earn ZRM tokens, and climb the leaderboards.</p>
        </div>
      </div>

      {/* Token Info Section */}
      <div className="bg-gradient-to-r from-purple-800/20 to-cyan-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">ZipRoom Token (ZRM)</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            The native token powering exclusive access, room creation rewards, and governance in the ZipRoom ecosystem.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-2">50M</div>
              <div className="text-gray-400">Total Supply</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 mb-2">Self-Custody</div>
              <div className="text-gray-400">Wallet Integration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-400 mb-2">Activity</div>
              <div className="text-gray-400">Based Rewards</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sign Up</h3>
            <p className="text-gray-400">Create your unique profile with custom username and bio</p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create</h3>
            <p className="text-gray-400">Generate rooms with custom expiry and share via QR codes</p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chat</h3>
            <p className="text-gray-400">Join conversations with reactions, replies, and real-time updates</p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              4
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Earn</h3>
            <p className="text-gray-400">Build reputation and earn ZRM tokens through activity</p>
          </div>
        </div>
      </div>
    </div>
  )
}