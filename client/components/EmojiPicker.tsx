import React, { useState, useRef, useEffect } from 'react';
import { Search, Smile, Heart, Zap, Star, Gamepad2, Coffee, Fire, Sparkles } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position?: 'top' | 'bottom';
}

// Emoji kategorileri
const emojiCategories = {
  smileys: {
    name: 'Yüzler & Emojiler',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋',
      '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
      '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔',
      '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
      '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
      '😩', '😫', '🥱', '😤', '😡', '🤬', '😠', '🤯', '😈', '👿',
      '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'
    ]
  },
  activities: {
    name: 'Aktiviteler',
    icon: Gamepad2,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀',
      '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🏹', '🎣',
      '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️',
      '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇',
      '🧘', '🏃', '🚶', '🧎', '🧍', '🎮', '🕹️', '👾', '🎯', '🎲',
      '🃏', '🀄', '🎴', '🎭', '🎨', '🧩', '🎪', '🎨', '🎬', '🎤',
      '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎪'
    ]
  },
  food: {
    name: 'Yiyecek & İçecek',
    icon: Coffee,
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🥬', '��', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
      '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
      '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟',
      '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝',
      '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚',
      '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧',
      '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪',
      '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤',
      '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉'
    ]
  },
  objects: {
    name: 'Objeler',
    icon: Star,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
      '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
      '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
      '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴',
      '💶', '��', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️',
      '🛠️', '⛏️', '🪓', '🪚', '🔩', '⚙️', '🧲', '🔫', '💣', '🧨',
      '🪃', '🏹', '🛡️', '🪚', '🔪', '⚔️', '🚬', '⚰️', '🪦', '⚱️',
      '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹',
      '🩺', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺'
    ]
  },
  symbols: {
    name: 'Semboller',
    icon: Sparkles,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
      '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
      '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
      '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
      '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
      '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
      '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️'
    ]
  },
  gaming: {
    name: 'Gaming',
    icon: Zap,
    emojis: [
      '🎮', '🕹️', '👾', '🎯', '🎲', '🃏', '🎰', '🎪', '🎭', '🎨',
      '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕',
      '🎻', '🎪', '🚀', '🛸', '🛰️', '🌌', '⭐', '🌟', '✨', '⚡',
      '🔥', '💥', '💫', '🎆', '🎇', '🌈', '🔮', '🎊', '🎉', '🎈',
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎀', '🎁'
    ]
  }
};

// Sık kullanılan emojiler
const recentEmojis = ['😀', '😍', '🤣', '😊', '😎', '🔥', '❤️', '👍', '🎮', '✨'];

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect, position = 'bottom' }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter emojis based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEmojis([]);
      return;
    }

    const allEmojis = Object.values(emojiCategories).flatMap(category => category.emojis);
    setFilteredEmojis(allEmojis);
  }, [searchQuery]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  const positionClasses = position === 'top' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-2';

  return (
    <div 
      ref={pickerRef}
      className={`absolute right-0 ${positionClasses} w-80 h-96 bg-gaming-surface border border-gaming-border rounded-xl shadow-2xl z-50 overflow-hidden`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gaming-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
          <input
            type="text"
            placeholder="Emoji ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gaming-bg border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {searchQuery ? (
          /* Search Results */
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-8 gap-2">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gaming-surface transition-colors text-xl"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Recent Emojis */}
            <div className="p-3 border-b border-gaming-border">
              <h4 className="text-xs font-medium text-gaming-muted mb-2">Son Kullanılan</h4>
              <div className="grid grid-cols-8 gap-2">
                {recentEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gaming-surface transition-colors text-xl"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gaming-border bg-gaming-bg/50">
              {Object.entries(emojiCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex-1 p-2 flex items-center justify-center transition-colors ${
                      activeCategory === key
                        ? 'text-neon-purple border-b-2 border-neon-purple'
                        : 'text-gaming-muted hover:text-gaming-text'
                    }`}
                    title={category.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories[activeCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gaming-surface transition-colors text-xl hover:scale-110"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
