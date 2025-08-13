import React, { useState } from 'react';
import {
  Vote,
  Plus,
  X,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Calendar,
  Settings,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // user IDs who voted for this option
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  serverId: string;
  channelId?: string;
  totalVotes: number;
  maxVotesPerUser?: number;
}

// Mock poll data
const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'Hangi oyunu turnuvada oynayalım?',
    description: 'Bu hafta sonu yapacağımız turnuva için oyun seçimi',
    options: [
      { id: '1', text: 'Valorant', votes: 45, voters: ['user1', 'user2', 'user3'] },
      { id: '2', text: 'CS2', votes: 32, voters: ['user4', 'user5'] },
      { id: '3', text: 'League of Legends', votes: 28, voters: ['user6'] },
      { id: '4', text: 'Rocket League', votes: 15, voters: [] }
    ],
    createdBy: 'admin',
    createdAt: '2024-10-25T10:00:00Z',
    expiresAt: '2024-10-27T23:59:59Z',
    isActive: true,
    allowMultipleVotes: false,
    isAnonymous: false,
    serverId: 'server1',
    channelId: 'general',
    totalVotes: 120,
    maxVotesPerUser: 1
  },
  {
    id: '2',
    title: 'Sunucu kuralları güncellemesi',
    description: 'Hangi kuralların güncellenmesini istiyorsunuz? (Birden fazla seçenek işaretleyebilirsiniz)',
    options: [
      { id: '1', text: 'Spam koruması', votes: 67, voters: ['user1', 'user3'] },
      { id: '2', text: 'Sesli sohbet kuralları', votes: 54, voters: ['user2', 'user4'] },
      { id: '3', text: 'Bot komutları', votes: 43, voters: ['user5'] },
      { id: '4', text: 'Moderasyon sistemi', votes: 38, voters: [] }
    ],
    createdBy: 'moderator1',
    createdAt: '2024-10-24T15:30:00Z',
    expiresAt: '2024-10-26T15:30:00Z',
    isActive: true,
    allowMultipleVotes: true,
    isAnonymous: true,
    serverId: 'server1',
    totalVotes: 89,
    maxVotesPerUser: 3
  },
  {
    id: '3',
    title: 'En sevdiğiniz oyun türü?',
    options: [
      { id: '1', text: 'FPS', votes: 78, voters: ['user1'] },
      { id: '2', text: 'MOBA', votes: 65, voters: [] },
      { id: '3', text: 'RPG', votes: 52, voters: [] },
      { id: '4', text: 'Battle Royale', votes: 44, voters: [] },
      { id: '5', text: 'Strateji', votes: 23, voters: [] }
    ],
    createdBy: 'user1',
    createdAt: '2024-10-23T09:15:00Z',
    isActive: false,
    allowMultipleVotes: false,
    isAnonymous: false,
    serverId: 'server1',
    totalVotes: 262
  }
];

interface ServerPollingProps {
  serverId: string;
  canCreatePolls?: boolean;
}

export default function ServerPolling({ serverId, canCreatePolls = false }: ServerPollingProps) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({});
  
  // Create poll form state
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    expiresAt: '',
    allowMultipleVotes: false,
    isAnonymous: false,
    maxVotesPerUser: 1
  });

  const polls = mockPolls.filter(poll => poll.serverId === serverId);

  const handleVote = (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !user) return;

    const currentVotes = userVotes[pollId] || [];
    let newVotes: string[];

    if (poll.allowMultipleVotes) {
      if (currentVotes.includes(optionId)) {
        newVotes = currentVotes.filter(id => id !== optionId);
      } else {
        if (poll.maxVotesPerUser && currentVotes.length >= poll.maxVotesPerUser) {
          return; // Max votes reached
        }
        newVotes = [...currentVotes, optionId];
      }
    } else {
      newVotes = currentVotes.includes(optionId) ? [] : [optionId];
    }

    setUserVotes({ ...userVotes, [pollId]: newVotes });
  };

  const addOption = () => {
    if (newPoll.options.length < 10) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const options = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options });
    }
  };

  const updateOption = (index: number, value: string) => {
    const options = [...newPoll.options];
    options[index] = value;
    setNewPoll({ ...newPoll, options });
  };

  const handleCreatePoll = () => {
    if (!newPoll.title.trim() || newPoll.options.some(opt => !opt.trim())) {
      alert('Lütfen başlık ve tüm seçenekleri doldurun.');
      return;
    }

    console.log('Creating poll:', newPoll);
    setShowCreateModal(false);
    setNewPoll({
      title: '',
      description: '',
      options: ['', ''],
      expiresAt: '',
      allowMultipleVotes: false,
      isAnonymous: false,
      maxVotesPerUser: 1
    });
    alert('Anket başarıyla oluşturuldu!');
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Süresi doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Vote className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-2xl font-bold text-gaming-text">Sunucu Anketleri</h2>
        </div>
        {canCreatePolls && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Anket Oluştur</span>
          </button>
        )}
      </div>

      {/* Active Polls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gaming-text flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-neon-green" />
          <span>Aktif Anketler</span>
        </h3>
        
        {polls.filter(poll => poll.isActive).map((poll) => (
          <div key={poll.id} className="card-glass">
            <div className="space-y-4">
              {/* Poll Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gaming-text mb-2">{poll.title}</h4>
                  {poll.description && (
                    <p className="text-gaming-muted text-sm mb-3">{poll.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gaming-muted">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{poll.totalVotes} oy</span>
                    </span>
                    {poll.expiresAt && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining(poll.expiresAt)}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      {poll.allowMultipleVotes ? (
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                      ) : (
                        <XCircle className="w-3 h-3 text-neon-orange" />
                      )}
                      <span>{poll.allowMultipleVotes ? 'Çoklu seçim' : 'Tek seçim'}</span>
                    </span>
                    {poll.isAnonymous && (
                      <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-xs">
                        Anonim
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPoll(selectedPoll?.id === poll.id ? null : poll)}
                  className="text-gaming-muted hover:text-gaming-text transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>

              {/* Poll Options */}
              <div className="space-y-2">
                {poll.options.map((option) => {
                  const hasVoted = userVotes[poll.id]?.includes(option.id);
                  const percentage = getVotePercentage(option.votes, poll.totalVotes);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(poll.id, option.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        hasVoted 
                          ? 'border-neon-purple bg-neon-purple/20' 
                          : 'border-gaming-border hover:border-gaming-border/60 bg-gaming-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gaming-text font-medium">{option.text}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gaming-muted">{option.votes}</span>
                          {hasVoted && <CheckCircle className="w-4 h-4 text-neon-purple" />}
                        </div>
                      </div>
                      <div className="w-full bg-gaming-border rounded-full h-2">
                        <div 
                          className="bg-neon-purple h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gaming-muted">{percentage}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Voting Info */}
              {poll.allowMultipleVotes && poll.maxVotesPerUser && (
                <p className="text-xs text-gaming-muted">
                  En fazla {poll.maxVotesPerUser} seçenek işaretleyebilirsiniz.
                  {userVotes[poll.id]?.length && ` (${userVotes[poll.id].length}/${poll.maxVotesPerUser})`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completed Polls */}
      {polls.filter(poll => !poll.isActive).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-gaming-muted" />
            <span>Tamamlanmış Anketler</span>
          </h3>
          
          {polls.filter(poll => !poll.isActive).map((poll) => (
            <div key={poll.id} className="card-glass opacity-75">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gaming-text mb-2">{poll.title}</h4>
                    <div className="flex items-center space-x-4 text-xs text-gaming-muted">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{poll.totalVotes} oy</span>
                      </span>
                      <span>Tamamlandı</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const percentage = getVotePercentage(option.votes, poll.totalVotes);
                    const isWinner = option.votes === Math.max(...poll.options.map(o => o.votes));
                    
                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          isWinner ? 'border-neon-green bg-neon-green/20' : 'border-gaming-border bg-gaming-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gaming-text font-medium">{option.text}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gaming-muted">{option.votes}</span>
                            {isWinner && <Crown className="w-4 h-4 text-neon-green" />}
                          </div>
                        </div>
                        <div className="w-full bg-gaming-border rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isWinner ? 'bg-neon-green' : 'bg-gaming-muted'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gaming-muted">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gaming-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gaming-text flex items-center space-x-2">
                <Vote className="w-6 h-6" />
                <span>Yeni Anket Oluştur</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gaming-text" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Anket Başlığı *
                </label>
                <input
                  type="text"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  placeholder="Anket başlığını girin..."
                  className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  placeholder="Anket hakkında ek bilgi..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text resize-none"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Seçenekler *
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Seçenek ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {newPoll.options.length < 10 && (
                    <button
                      onClick={addOption}
                      className="w-full px-4 py-2 border-2 border-dashed border-gaming-border rounded-lg text-gaming-muted hover:border-neon-purple hover:text-neon-purple transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Seçenek Ekle</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gaming-text">Anket Ayarları</h4>
                
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Son Tarih (Opsiyonel)
                  </label>
                  <input
                    type="datetime-local"
                    value={newPoll.expiresAt}
                    onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>

                {/* Multiple Votes */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gaming-text">Çoklu Seçim</h5>
                    <p className="text-xs text-gaming-muted">Kullanıcılar birden fazla seçenek işaretleyebilir</p>
                  </div>
                  <button
                    onClick={() => setNewPoll({ ...newPoll, allowMultipleVotes: !newPoll.allowMultipleVotes })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      newPoll.allowMultipleVotes ? 'bg-neon-purple' : 'bg-gaming-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      newPoll.allowMultipleVotes ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Max Votes */}
                {newPoll.allowMultipleVotes && (
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-2">
                      Maksimum Seçim Sayısı
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={newPoll.options.length}
                      value={newPoll.maxVotesPerUser}
                      onChange={(e) => setNewPoll({ ...newPoll, maxVotesPerUser: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                    />
                  </div>
                )}

                {/* Anonymous */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gaming-text">Anonim Oylama</h5>
                    <p className="text-xs text-gaming-muted">Oy verenler gizli kalır</p>
                  </div>
                  <button
                    onClick={() => setNewPoll({ ...newPoll, isAnonymous: !newPoll.isAnonymous })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      newPoll.isAnonymous ? 'bg-neon-purple' : 'bg-gaming-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      newPoll.isAnonymous ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Create Button */}
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
                >
                  Anket Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
