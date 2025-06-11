import React from 'react'
import { Zap, Brain, ThumbsUp, ThumbsDown, Hand, Plus, Heart, Laugh, Frown, Angry, Sunrise as Surprise, Crop as Cry } from 'lucide-react'

interface EmojiReaction {
  id: string
  emoji: string | React.ReactNode
  name: string
  count: number
  userReacted: boolean
}

interface EmojiReactionsProps {
  messageId: string
  reactions: EmojiReaction[]
  onReact: (messageId: string, emojiId: string) => void
  onShowPicker: (messageId: string) => void
  showPicker: boolean
}

// Custom ZipRoom Lightning Bolt Logo
const ZipRoomLogo = () => (
  <div className="relative h-4 w-4">
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <defs>
        <linearGradient id="ziproom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d="M13 2L3 14h6l-2 8 10-12h-6l2-8z"
        fill="url(#ziproom-gradient)"
        filter="url(#glow)"
        className="animate-pulse"
      />
    </svg>
  </div>
)

// Animated Fire Component
const AnimatedFire = () => (
  <div className="relative h-4 w-4">
    <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 rounded-full animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-600 to-yellow-500 rounded-full animate-ping opacity-75" />
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-yellow-300 rounded-full animate-bounce" />
  </div>
)

// Brain with Lightning
const BrainLightning = () => (
  <div className="relative h-4 w-4">
    <Brain className="h-4 w-4 text-cyan-400" />
    <Zap className="h-2 w-2 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
  </div>
)

// Animated Wave
const AnimatedWave = () => (
  <Hand className="h-4 w-4 text-blue-400 animate-bounce" />
)

// Plus One
const PlusOne = () => (
  <div className="flex items-center space-x-0.5">
    <Plus className="h-3 w-3 text-emerald-400" />
    <span className="text-xs text-emerald-400 font-bold">1</span>
  </div>
)

export const EMOJI_OPTIONS = [
  // Custom ZipRoom emojis
  {
    id: 'ziproom-lightning',
    emoji: <ZipRoomLogo />,
    name: 'ZipRoom',
    category: 'custom'
  },
  {
    id: 'brain-lightning',
    emoji: <BrainLightning />,
    name: 'Mind Blown',
    category: 'custom'
  },
  {
    id: 'fire',
    emoji: <AnimatedFire />,
    name: 'Fire',
    category: 'custom'
  },
  {
    id: 'wave',
    emoji: <AnimatedWave />,
    name: 'Wave',
    category: 'custom'
  },
  {
    id: 'plus-one',
    emoji: <PlusOne />,
    name: '+1',
    category: 'custom'
  },

  // Standard emoji faces (using Unicode)
  {
    id: 'grinning',
    emoji: '😀',
    name: 'Grinning',
    category: 'faces'
  },
  {
    id: 'joy',
    emoji: '😂',
    name: 'Joy',
    category: 'faces'
  },
  {
    id: 'rofl',
    emoji: '🤣',
    name: 'ROFL',
    category: 'faces'
  },
  {
    id: 'smile',
    emoji: '😊',
    name: 'Smile',
    category: 'faces'
  },
  {
    id: 'heart-eyes',
    emoji: '😍',
    name: 'Heart Eyes',
    category: 'faces'
  },
  {
    id: 'wink',
    emoji: '😉',
    name: 'Wink',
    category: 'faces'
  },
  {
    id: 'thinking',
    emoji: '🤔',
    name: 'Thinking',
    category: 'faces'
  },
  {
    id: 'neutral',
    emoji: '😐',
    name: 'Neutral',
    category: 'faces'
  },
  {
    id: 'confused',
    emoji: '😕',
    name: 'Confused',
    category: 'faces'
  },
  {
    id: 'worried',
    emoji: '😟',
    name: 'Worried',
    category: 'faces'
  },
  {
    id: 'sad',
    emoji: '😢',
    name: 'Sad',
    category: 'faces'
  },
  {
    id: 'angry',
    emoji: '😠',
    name: 'Angry',
    category: 'faces'
  },
  {
    id: 'rage',
    emoji: '😡',
    name: 'Rage',
    category: 'faces'
  },
  {
    id: 'cry',
    emoji: '😭',
    name: 'Crying',
    category: 'faces'
  },
  {
    id: 'shocked',
    emoji: '😱',
    name: 'Shocked',
    category: 'faces'
  },
  {
    id: 'tired',
    emoji: '😴',
    name: 'Tired',
    category: 'faces'
  },
  {
    id: 'sick',
    emoji: '🤒',
    name: 'Sick',
    category: 'faces'
  },
  {
    id: 'cool',
    emoji: '😎',
    name: 'Cool',
    category: 'faces'
  },
  {
    id: 'nerd',
    emoji: '🤓',
    name: 'Nerd',
    category: 'faces'
  },
  {
    id: 'crazy',
    emoji: '🤪',
    name: 'Crazy',
    category: 'faces'
  },

  // Gestures and hands
  {
    id: 'thumbs-up',
    emoji: '👍',
    name: 'Thumbs Up',
    category: 'gestures'
  },
  {
    id: 'thumbs-down',
    emoji: '👎',
    name: 'Thumbs Down',
    category: 'gestures'
  },
  {
    id: 'ok-hand',
    emoji: '👌',
    name: 'OK',
    category: 'gestures'
  },
  {
    id: 'peace',
    emoji: '✌️',
    name: 'Peace',
    category: 'gestures'
  },
  {
    id: 'crossed-fingers',
    emoji: '🤞',
    name: 'Crossed Fingers',
    category: 'gestures'
  },
  {
    id: 'rock-on',
    emoji: '🤘',
    name: 'Rock On',
    category: 'gestures'
  },
  {
    id: 'call-me',
    emoji: '🤙',
    name: 'Call Me',
    category: 'gestures'
  },
  {
    id: 'point-up',
    emoji: '☝️',
    name: 'Point Up',
    category: 'gestures'
  },
  {
    id: 'point-right',
    emoji: '👉',
    name: 'Point Right',
    category: 'gestures'
  },
  {
    id: 'point-down',
    emoji: '👇',
    name: 'Point Down',
    category: 'gestures'
  },
  {
    id: 'point-left',
    emoji: '👈',
    name: 'Point Left',
    category: 'gestures'
  },
  {
    id: 'raised-hand',
    emoji: '✋',
    name: 'Raised Hand',
    category: 'gestures'
  },
  {
    id: 'high-five',
    emoji: '🙏',
    name: 'High Five',
    category: 'gestures'
  },
  {
    id: 'clap',
    emoji: '👏',
    name: 'Clap',
    category: 'gestures'
  },
  {
    id: 'muscle',
    emoji: '💪',
    name: 'Muscle',
    category: 'gestures'
  },

  // Hearts and symbols
  {
    id: 'red-heart',
    emoji: '❤️',
    name: 'Red Heart',
    category: 'hearts'
  },
  {
    id: 'orange-heart',
    emoji: '🧡',
    name: 'Orange Heart',
    category: 'hearts'
  },
  {
    id: 'yellow-heart',
    emoji: '💛',
    name: 'Yellow Heart',
    category: 'hearts'
  },
  {
    id: 'green-heart',
    emoji: '💚',
    name: 'Green Heart',
    category: 'hearts'
  },
  {
    id: 'blue-heart',
    emoji: '💙',
    name: 'Blue Heart',
    category: 'hearts'
  },
  {
    id: 'purple-heart',
    emoji: '💜',
    name: 'Purple Heart',
    category: 'hearts'
  },
  {
    id: 'black-heart',
    emoji: '🖤',
    name: 'Black Heart',
    category: 'hearts'
  },
  {
    id: 'white-heart',
    emoji: '🤍',
    name: 'White Heart',
    category: 'hearts'
  },
  {
    id: 'broken-heart',
    emoji: '💔',
    name: 'Broken Heart',
    category: 'hearts'
  },
  {
    id: 'sparkling-heart',
    emoji: '💖',
    name: 'Sparkling Heart',
    category: 'hearts'
  },

  // Objects and symbols
  {
    id: 'star',
    emoji: '⭐',
    name: 'Star',
    category: 'objects'
  },
  {
    id: 'sparkles',
    emoji: '✨',
    name: 'Sparkles',
    category: 'objects'
  },
  {
    id: 'boom',
    emoji: '💥',
    name: 'Boom',
    category: 'objects'
  },
  {
    id: 'lightning-bolt',
    emoji: '⚡',
    name: 'Lightning',
    category: 'objects'
  },
  {
    id: 'party',
    emoji: '🎉',
    name: 'Party',
    category: 'objects'
  },
  {
    id: 'rocket',
    emoji: '🚀',
    name: 'Rocket',
    category: 'objects'
  },
  {
    id: 'trophy',
    emoji: '🏆',
    name: 'Trophy',
    category: 'objects'
  },
  {
    id: 'medal',
    emoji: '🏅',
    name: 'Medal',
    category: 'objects'
  },
  {
    id: 'crown',
    emoji: '👑',
    name: 'Crown',
    category: 'objects'
  },
  {
    id: 'gem',
    emoji: '💎',
    name: 'Gem',
    category: 'objects'
  },
  {
    id: 'money',
    emoji: '💰',
    name: 'Money',
    category: 'objects'
  },
  {
    id: 'check',
    emoji: '✅',
    name: 'Check',
    category: 'objects'
  },
  {
    id: 'x',
    emoji: '❌',
    name: 'X',
    category: 'objects'
  },
  {
    id: 'warning',
    emoji: '⚠️',
    name: 'Warning',
    category: 'objects'
  },
  {
    id: 'question',
    emoji: '❓',
    name: 'Question',
    category: 'objects'
  },
  {
    id: 'exclamation',
    emoji: '❗',
    name: 'Exclamation',
    category: 'objects'
  },
  {
    id: 'hundred',
    emoji: '💯',
    name: '100',
    category: 'objects'
  }
]

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  messageId,
  reactions,
  onReact,
  onShowPicker,
  showPicker
}) => {
  const categories = [
    { id: 'custom', name: 'ZipRoom', emojis: EMOJI_OPTIONS.filter(e => e.category === 'custom') },
    { id: 'faces', name: 'Faces', emojis: EMOJI_OPTIONS.filter(e => e.category === 'faces') },
    { id: 'gestures', name: 'Gestures', emojis: EMOJI_OPTIONS.filter(e => e.category === 'gestures') },
    { id: 'hearts', name: 'Hearts', emojis: EMOJI_OPTIONS.filter(e => e.category === 'hearts') },
    { id: 'objects', name: 'Objects', emojis: EMOJI_OPTIONS.filter(e => e.category === 'objects') }
  ]

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {reactions.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => onReact(messageId, reaction.id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 ${
                reaction.userReacted
                  ? 'bg-purple-600/50 border border-purple-400/50 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800/95 backdrop-blur-sm border border-purple-500/30 rounded-xl shadow-2xl z-50 max-w-xs">
          <div className="max-h-80 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="p-3 border-b border-gray-700/50 last:border-b-0">
                <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  {category.name}
                </h4>
                <div className="grid grid-cols-6 gap-1">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji.id}
                      onClick={() => {
                        onReact(messageId, emoji.id)
                        onShowPicker(messageId) // Close picker
                      }}
                      className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
                      title={emoji.name}
                    >
                      <span className="text-lg">{emoji.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick reactions at bottom */}
          <div className="p-2 bg-gray-900/50 rounded-b-xl border-t border-gray-700/50">
            <div className="text-xs text-gray-500 text-center mb-1">Quick Reactions</div>
            <div className="flex justify-center space-x-1">
              {['ziproom-lightning', 'thumbs-up', 'red-heart', 'joy', 'fire'].map((emojiId) => {
                const emoji = EMOJI_OPTIONS.find(e => e.id === emojiId)
                return emoji ? (
                  <button
                    key={emojiId}
                    onClick={() => {
                      onReact(messageId, emojiId)
                      onShowPicker(messageId)
                    }}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title={emoji.name}
                  >
                    <span className="text-lg">{emoji.emoji}</span>
                  </button>
                ) : null
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}