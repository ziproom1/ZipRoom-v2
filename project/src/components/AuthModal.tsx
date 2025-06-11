import React, { useState } from 'react'
import { X, User, Mail, Sparkles, Crown, AlertCircle, Check, Loader2, Lock } from 'lucide-react'
import { registerUser, loginUser, checkUsernameAvailability, generateUsernameSuggestions, normalizeUsername, checkUserExists } from '../lib/auth'
import type { UserProfile } from '../lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (profile: UserProfile, sessionToken: string) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [checkingUsername, setCheckingUsername] = useState(false)

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      setUsernameSuggestions([])
      return
    }

    setCheckingUsername(true)
    try {
      const available = await checkUsernameAvailability(username)
      setUsernameAvailable(available)
      
      if (!available) {
        const suggestions = await generateUsernameSuggestions(username)
        setUsernameSuggestions(suggestions)
      } else {
        setUsernameSuggestions([])
      }
    } catch (error) {
      console.error('Error checking username:', error)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (username: string) => {
    // Normalize username input (remove spaces and convert to lowercase)
    const normalizedUsername = normalizeUsername(username)
    
    setFormData(prev => ({ ...prev, username: normalizedUsername }))
    
    // Auto-fill display name if empty
    if (!formData.displayName && normalizedUsername) {
      setFormData(prev => ({ ...prev, displayName: normalizedUsername }))
    }
    
    // Check availability after a short delay (only for register mode)
    if (mode === 'register') {
      setTimeout(() => checkUsername(normalizedUsername), 500)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    console.log('🔐 AuthModal: Starting authentication process')
    console.log('🔐 AuthModal: Mode:', mode)
    console.log('🔐 AuthModal: Username:', formData.username)

    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        console.log('📝 AuthModal: Starting registration process')
        
        // Validation for registration
        if (!usernameAvailable) {
          throw new Error('Please choose an available username')
        }
        
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        
        console.log('📝 AuthModal: Calling registerUser...')
        const profile = await registerUser(
          formData.username,
          formData.displayName || formData.username,
          formData.email,
          formData.password,
          formData.bio
        )
        
        console.log('✅ AuthModal: Registration successful, auto-logging in...')
        // Auto-login after registration
        const { session } = await loginUser(formData.username, formData.password)
        console.log('✅ AuthModal: Auto-login successful, calling onLogin callback')
        
        // Call onLogin with profile and session token
        onLogin(profile, session.session_token)
        
        // The modal will be closed by the parent component
        
      } else {
        console.log('🔐 AuthModal: Starting login process')
        
        // Login mode - first check if user exists
        const userExists = await checkUserExists(formData.username)
        if (!userExists) {
          throw new Error('User not found. Please check your username or create an account.')
        }
        
        console.log('🔐 AuthModal: User exists, attempting login...')
        const { profile, session } = await loginUser(formData.username, formData.password)
        console.log('✅ AuthModal: Login successful, calling onLogin callback')
        
        // Call onLogin with profile and session token
        onLogin(profile, session.session_token)
        
        // The modal will be closed by the parent component
      }
      
      console.log('✅ AuthModal: Authentication completed successfully')
      
    } catch (error: any) {
      console.error('❌ AuthModal: Authentication error:', error)
      
      // Provide more helpful error messages
      let errorMessage = error.message || 'Authentication failed'
      
      if (errorMessage.includes('User not found')) {
        errorMessage = `Username "${formData.username}" not found. Please check your username or create an account.`
      } else if (errorMessage.includes('Incorrect password') || errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Incorrect password or unconfirmed email. Please check your credentials or confirm your email address.'
      } else if (errorMessage.includes('Supabase not configured')) {
        errorMessage = 'Database connection not available. Please try again later.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    handleUsernameChange(suggestion)
  }

  const switchToRegister = () => {
    setMode('register')
    setError('')
    setUsernameAvailable(null)
    setUsernameSuggestions([])
    // Keep the username if it was entered in login mode
    const currentUsername = formData.username
    setFormData({
      username: currentUsername,
      displayName: currentUsername,
      email: '',
      password: '',
      confirmPassword: '',
      bio: ''
    })
    // Check username availability for register mode
    if (currentUsername) {
      setTimeout(() => checkUsername(currentUsername), 500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span>{mode === 'login' ? 'Welcome Back' : 'Join ZipRoom'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
              {mode === 'login' && error.includes('not found') && (
                <button
                  onClick={switchToRegister}
                  className="text-purple-400 hover:text-purple-300 text-sm underline mt-2"
                >
                  Create an account instead
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Choose your username..."
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent pr-10"
                required
                minLength={3}
                maxLength={20}
              />
              
              {/* Username validation indicator */}
              {mode === 'register' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : usernameAvailable === true ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : usernameAvailable === false ? (
                    <X className="h-4 w-4 text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Username suggestions */}
            {mode === 'register' && usernameSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {usernameSuggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-2 py-1 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters, lowercase letters and numbers only
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password..."
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              required
              minLength={6}
            />
            {mode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password..."
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Display Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Sparkles className="inline h-4 w-4 mr-1" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your display name (can include emojis)..."
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                This is how others will see your name (emojis allowed!)
              </p>
            </div>
          )}

          {/* Email (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Bio (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="w-full bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/200 characters
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (mode === 'register' && !usernameAvailable)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                {mode === 'login' ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Crown className="h-5 w-5" />
                )}
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
              setUsernameAvailable(null)
              setUsernameSuggestions([])
              setFormData({
                username: '',
                displayName: '',
                email: '',
                password: '',
                confirmPassword: '',
                bio: ''
              })
            }}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors mt-1"
          >
            {mode === 'login' ? 'Create one here' : 'Sign in instead'}
          </button>
        </div>

        {/* Special note for anton username */}
        {mode === 'register' && (
          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-xl">
            <h4 className="text-yellow-400 font-medium mb-2">Special Username</h4>
            <div className="text-sm text-yellow-300">
              <div>If you register with username <strong>"anton"</strong>, you'll automatically become the platform owner with special privileges and 10M ZRM tokens!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}