import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, User, LogOut } from 'lucide-react'
import { AuthModal } from './AuthModal'
import { UserProfile } from './UserProfile'
import { LandingPage } from './LandingPage'
import { CreateRoom } from './CreateRoom'
import { JoinRoom } from './JoinRoom'
import { ChatRoom } from './ChatRoom'
import { validateSession, logoutUser } from '../lib/auth'
import type { UserProfile as UserProfileType } from '../lib/auth'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfileType | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      console.log('🔍 Layout: Starting session check...')
      const token = localStorage.getItem('ziproom_session')
      
      if (token) {
        console.log('🎫 Layout: Found session token, validating...', token.substring(0, 20) + '...')
        try {
          const profile = await validateSession(token)
          if (profile) {
            console.log('✅ Layout: Valid session found, setting user:', profile.display_name)
            setCurrentUser(profile)
            setSessionToken(token)
            console.log('✅ Layout: User state updated successfully')
          } else {
            console.log('❌ Layout: Invalid session, removing token')
            localStorage.removeItem('ziproom_session')
            setCurrentUser(null)
            setSessionToken(null)
          }
        } catch (error) {
          console.error('💥 Layout: Session validation error:', error)
          localStorage.removeItem('ziproom_session')
          setCurrentUser(null)
          setSessionToken(null)
        }
      } else {
        console.log('🚫 Layout: No session token found in localStorage')
        setCurrentUser(null)
        setSessionToken(null)
      }
      
      setLoading(false)
      setSessionChecked(true)
      console.log('✅ Layout: Session check completed')
    }

    checkSession()
  }, [])

  // Listen for custom auth modal events
  useEffect(() => {
    const handleShowAuthModal = () => {
      console.log('📢 Layout: Custom auth modal event received')
      setShowAuthModal(true)
    }

    window.addEventListener('show-auth-modal', handleShowAuthModal)
    return () => window.removeEventListener('show-auth-modal', handleShowAuthModal)
  }, [])

  const handleLogin = (profile: UserProfileType, token: string) => {
    console.log('🎉 Layout: User logged in successfully:', profile.display_name)
    console.log('🎉 Layout: Setting user state and storing session')
    setCurrentUser(profile)
    setSessionToken(token)
    localStorage.setItem('ziproom_session', token)
    console.log('✅ Layout: Login state updated, user should now be authenticated')
    
    // Close the auth modal immediately after successful login
    setShowAuthModal(false)
    
    // Force a re-render by updating the state
    setTimeout(() => {
      console.log('🔄 Layout: Forcing state refresh after login')
      setCurrentUser(profile) // Set again to ensure state is updated
    }, 100)
  }

  const handleLogout = async () => {
    console.log('👋 Layout: Starting logout process')
    if (sessionToken) {
      await logoutUser(sessionToken)
      localStorage.removeItem('ziproom_session')
    }
    setCurrentUser(null)
    setSessionToken(null)
    console.log('✅ Layout: Logout completed, user state cleared')
  }

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    console.log('📝 Layout: Profile updated:', updatedProfile.display_name)
    setCurrentUser(updatedProfile)
  }

  const handleShowAuth = () => {
    console.log('🔐 Layout: Opening auth modal')
    setShowAuthModal(true)
  }

  // Enhanced debug logging for current state
  useEffect(() => {
    console.log('🏗️ Layout: Current authentication state:', {
      currentUser: currentUser ? {
        user_id: currentUser.user_id,
        display_name: currentUser.display_name,
        is_owner: currentUser.is_owner,
        email: currentUser.email
      } : null,
      sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : null,
      loading,
      sessionChecked,
      hasSessionInStorage: !!localStorage.getItem('ziproom_session')
    })
  }, [currentUser, sessionToken, loading, sessionChecked])

  // Show loading state while checking session
  if (loading || !sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Function to render the correct component based on route
  const renderPageContent = () => {
    const path = location.pathname

    if (path === '/') {
      return <LandingPage currentUser={currentUser} onShowAuth={handleShowAuth} />
    } else if (path === '/create') {
      return <CreateRoom currentUser={currentUser} onShowAuth={handleShowAuth} />
    } else if (path.startsWith('/join/')) {
      return <JoinRoom currentUser={currentUser} />
    } else if (path.startsWith('/room/')) {
      return <ChatRoom currentUser={currentUser} />
    }

    // Fallback to children if no specific route matches
    return React.cloneElement(children as React.ReactElement, { 
      currentUser,
      onShowAuth: handleShowAuth
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(139,92,246,0.1)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(6,182,212,0.1)_0%,_transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Clickable Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <Zap className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <div className="absolute inset-0 animate-pulse bg-purple-400/20 rounded-full blur-md group-hover:bg-purple-300/30 transition-colors" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-cyan-300 transition-all">
                  ZipRoom
                </h1>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Disposable Chat</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile Button */}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      currentUser.is_owner
                        ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-300'
                        : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentUser.is_owner
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    }`}>
                      {currentUser.is_owner ? '👑' : currentUser.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium">{currentUser.display_name}</div>
                      <div className="text-xs opacity-75">{currentUser.activity_score.toLocaleString()} pts</div>
                    </div>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors p-2"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleShowAuth}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
              
              <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {renderPageContent()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 bg-gray-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Powered by ZRM Token • Secure • Disposable • Anonymous
            </p>
            <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-500">
              <span>Privacy First</span>
              <span>•</span>
              <span>No Data Stored</span>
              <span>•</span>
              <span>Auto-Expiry</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {currentUser && (
        <UserProfile
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={currentUser}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}