import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { Message } from '../lib/messageService';

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
}

interface SearchResult {
  message: Message;
  index: number;
  highlightText: string;
}

export default function MessageSearch({ isOpen, onClose, messages, onMessageSelect }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Search through messages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(query)) {
        // Create highlighted text
        const contentLower = message.content.toLowerCase();
        const queryIndex = contentLower.indexOf(query);
        const beforeMatch = message.content.substring(0, queryIndex);
        const match = message.content.substring(queryIndex, queryIndex + searchQuery.length);
        const afterMatch = message.content.substring(queryIndex + searchQuery.length);
        
        const highlightText = `${beforeMatch}<mark class="bg-neon-purple/30 text-neon-purple rounded px-1">${match}</mark>${afterMatch}`;

        results.push({
          message,
          index,
          highlightText
        });
      }
    });

    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        onMessageSelect(searchResults[currentResultIndex].message.id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResult('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResult('down');
    }
  };

  const navigateResult = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;

    if (direction === 'up') {
      setCurrentResultIndex(prev => prev > 0 ? prev - 1 : searchResults.length - 1);
    } else {
      setCurrentResultIndex(prev => prev < searchResults.length - 1 ? prev + 1 : 0);
    }
  };

  const handleResultClick = (messageId: string) => {
    onMessageSelect(messageId);
  };

  const formatTime = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gaming-surface/95 backdrop-blur-sm border-b border-gaming-border z-40">
      <div className="p-4">
        {/* Search Input */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Mesajlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 bg-gaming-bg border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
            />
          </div>

          {/* Navigation Controls */}
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gaming-muted">
                {currentResultIndex + 1} / {searchResults.length}
              </span>
              <button
                onClick={() => navigateResult('up')}
                className="p-1 rounded hover:bg-gaming-surface transition-colors"
                title="Önceki Sonuç"
              >
                <ChevronUp className="w-4 h-4 text-gaming-muted" />
              </button>
              <button
                onClick={() => navigateResult('down')}
                className="p-1 rounded hover:bg-gaming-surface transition-colors"
                title="Sonraki Sonuç"
              >
                <ChevronDown className="w-4 h-4 text-gaming-muted" />
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
            title="Aramayı Kapat"
          >
            <X className="w-4 h-4 text-gaming-muted" />
          </button>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.slice(0, 10).map((result, index) => (
                  <div
                    key={result.message.id}
                    onClick={() => handleResultClick(result.message.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      index === currentResultIndex
                        ? 'bg-neon-purple/10 border-neon-purple/30'
                        : 'bg-gaming-surface/50 border-gaming-border hover:bg-gaming-surface'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center flex-shrink-0">
                        {result.message.sender.photoURL ? (
                          <img
                            src={result.message.sender.photoURL}
                            alt={result.message.sender.displayName || result.message.sender.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-white">
                            {(result.message.sender.displayName || result.message.sender.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gaming-text">
                            {result.message.sender.displayName || result.message.sender.username}
                          </span>
                          <span className="text-xs text-gaming-muted">
                            {formatTime(result.message.timestamp)}
                          </span>
                        </div>
                        <div 
                          className="text-sm text-gaming-muted"
                          dangerouslySetInnerHTML={{ __html: result.highlightText }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {searchResults.length > 10 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gaming-muted">
                      {searchResults.length - 10} daha fazla sonuç...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gaming-muted mx-auto mb-2" />
                <p className="text-sm text-gaming-muted">
                  "{searchQuery}" için sonuç bulunamadı
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
