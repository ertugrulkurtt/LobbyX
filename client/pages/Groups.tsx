import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Settings,
  Crown,
  UserPlus,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Star,
  Eye,
  Lock,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  UserMinus,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GroupMember {
  id: string;
  username: string;
  displayName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
  maxMembers: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  lastActivity: string;
  tags: string[];
  location?: string;
  nextEvent?: {
    title: string;
    date: string;
    time: string;
  };
  isJoined: boolean;
  isPending?: boolean;
  members?: GroupMember[];
}

export default function Groups() {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'my'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock groups data
  const groups: Group[] = [
    {
      id: 'valorant-team-alpha',
      name: 'Valorant Team Alpha',
      description: 'Profesyonel Valorant takımı. Yalnızca deneyimli oyuncular için.',
      isPrivate: false,
      memberCount: 8,
      maxMembers: 10,
      ownerId: 'user123',
      ownerName: 'ProGamer',
      createdAt: '2024-01-15',
      lastActivity: '5 dk',
      tags: ['Valorant', 'Rekabetçi', 'Takım'],
      nextEvent: {
        title: 'Ranked Maçları',
        date: 'Bugün',
        time: '20:00'
      },
      isJoined: true,
      members: [
        { id: 'user123', username: 'ProGamer', displayName: 'Pro Gamer', role: 'owner', joinedAt: '2024-01-15', isOnline: true },
        { id: 'user456', username: 'ValorantKing', displayName: 'Valorant King', role: 'admin', joinedAt: '2024-01-16', isOnline: true },
        { id: 'user789', username: 'SniperAce', displayName: 'Sniper Ace', role: 'member', joinedAt: '2024-01-18', isOnline: false, lastSeen: '2 saat önce' }
      ]
    },
    {
      id: 'cs2-istanbul',
      name: 'CS2 İstanbul',
      description: 'İstanbul\'dan Counter-Strike 2 oyuncuları. Günlük turnuvalar ve eğlenceli maçlar.',
      isPrivate: false,
      memberCount: 45,
      maxMembers: 100,
      ownerId: 'user456',
      ownerName: 'CS2Master',
      createdAt: '2024-02-01',
      lastActivity: '2 dk',
      tags: ['CS2', 'İstanbul', 'Turnuva'],
      location: 'İstanbul, Türkiye',
      nextEvent: {
        title: 'Haftalık Turnuva',
        date: 'Cumartesi',
        time: '19:00'
      },
      isJoined: false
    },
    {
      id: 'indie-discovery',
      name: 'İndie Oyun Kaşifleri',
      description: 'Yeni çıkan indie oyunları birlikte keşfediyoruz. Her hafta yeni bir oyun!',
      isPrivate: false,
      memberCount: 23,
      maxMembers: 50,
      ownerId: 'user789',
      ownerName: 'IndieExplorer',
      createdAt: '2024-02-10',
      lastActivity: '1 saat',
      tags: ['Indie', 'Keşif', 'Koop'],
      nextEvent: {
        title: 'Hollow Knight Speedrun',
        date: 'Pazar',
        time: '15:00'
      },
      isJoined: true
    },
    {
      id: 'mmo-guild',
      name: 'Ejder Klanı',
      description: 'MMO oyunları için özel lonca. Sadece davetli üyeler.',
      isPrivate: true,
      memberCount: 15,
      maxMembers: 25,
      ownerId: 'user999',
      ownerName: 'DragonLord',
      createdAt: '2024-01-20',
      lastActivity: '30 dk',
      tags: ['MMO', 'Lonca', 'Özel'],
      isJoined: false,
      isPending: true
    },
    {
      id: 'casual-gamers',
      name: 'Rahat Oyuncular',
      description: 'Gündelik oyuncular için sosyal grup. Stressiz, eğlenceli oyun deneyimi.',
      isPrivate: false,
      memberCount: 67,
      maxMembers: 150,
      ownerId: user?.uid || '',
      ownerName: user?.displayName || user?.username || 'Sen',
      createdAt: '2024-02-05',
      lastActivity: '10 dk',
      tags: ['Rahat', 'Sosyal', 'Eğlence'],
      nextEvent: {
        title: 'Grup Oyunu Gecesi',
        date: 'Cuma',
        time: '21:00'
      },
      isJoined: true
    }
  ];

  const selectedGroupData = groups.find(group => group.id === selectedGroup);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'joined') return matchesSearch && group.isJoined;
    if (activeTab === 'my') return matchesSearch && group.ownerId === user?.uid;
    return matchesSearch;
  });

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    // In real app, this would send request to Firebase
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log('Leaving group:', groupId);
    // In real app, this would update Firebase
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gaming-bg rounded-2xl overflow-hidden">
      {/* Groups List Sidebar */}
      <div className="w-96 bg-gaming-surface/50 backdrop-blur-xl border-r border-gaming-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gaming-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gaming-text">Gruplar</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-neon-purple/20 hover:bg-neon-purple/30 transition-colors"
            >
              <Plus className="w-4 h-4 text-neon-purple" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'joined', label: 'Katıldığım' },
              { id: 'my', label: 'Benim' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-purple text-white'
                    : 'text-gaming-muted hover:text-gaming-text hover:bg-gaming-surface/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-muted" />
            <input
              type="text"
              placeholder="Grup ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gaming-surface rounded-lg border border-gaming-border focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
            />
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-4 border-b border-gaming-border/50 cursor-pointer transition-all duration-200 ${
                selectedGroup === group.id 
                  ? 'bg-neon-purple/10 border-l-4 border-l-neon-purple' 
                  : 'hover:bg-gaming-surface/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    group.ownerId === user?.uid
                      ? 'bg-gradient-to-br from-neon-orange to-neon-pink'
                      : group.isJoined
                      ? 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                      : 'bg-gradient-to-br from-gaming-surface to-gaming-border'
                  }`}>
                    <Users className={`w-6 h-6 ${
                      group.ownerId === user?.uid || group.isJoined ? 'text-white' : 'text-gaming-muted'
                    }`} />
                  </div>
                  {group.isPrivate && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gaming-surface rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-gaming-muted" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate text-gaming-text">
                        {group.name}
                      </h3>
                      {group.ownerId === user?.uid && (
                        <Crown className="w-4 h-4 text-neon-orange" />
                      )}
                    </div>
                    <span className="text-xs text-gaming-muted">{group.lastActivity}</span>
                  </div>
                  
                  <p className="text-sm text-gaming-muted truncate mb-2">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gaming-muted" />
                      <span className="text-xs text-gaming-muted">
                        {group.memberCount}/{group.maxMembers}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {group.isJoined && (
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                      )}
                      {group.isPending && (
                        <Clock className="w-3 h-3 text-neon-orange" />
                      )}
                      {group.isPrivate ? (
                        <Lock className="w-3 h-3 text-gaming-muted" />
                      ) : (
                        <Globe className="w-3 h-3 text-gaming-muted" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {group.nextEvent && (
                    <div className="mt-2 p-2 bg-neon-purple/10 rounded border border-neon-purple/20">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-neon-purple" />
                        <span className="text-xs font-medium text-neon-purple">
                          {group.nextEvent.title}
                        </span>
                      </div>
                      <p className="text-xs text-gaming-muted">
                        {group.nextEvent.date} - {group.nextEvent.time}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Details */}
      <div className="flex-1 flex flex-col">
        {selectedGroupData ? (
          <>
            {/* Group Header */}
            <div className="p-6 bg-gaming-surface/30 backdrop-blur-xl border-b border-gaming-border">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    selectedGroupData.ownerId === user?.uid
                      ? 'bg-gradient-to-br from-neon-orange to-neon-pink'
                      : selectedGroupData.isJoined
                      ? 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                      : 'bg-gradient-to-br from-gaming-surface to-gaming-border'
                  }`}>
                    <Users className={`w-8 h-8 ${
                      selectedGroupData.ownerId === user?.uid || selectedGroupData.isJoined ? 'text-white' : 'text-gaming-muted'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold text-gaming-text">
                        {selectedGroupData.name}
                      </h2>
                      {selectedGroupData.ownerId === user?.uid && (
                        <Crown className="w-5 h-5 text-neon-orange" />
                      )}
                      {selectedGroupData.isPrivate ? (
                        <Lock className="w-5 h-5 text-gaming-muted" />
                      ) : (
                        <Globe className="w-5 h-5 text-gaming-muted" />
                      )}
                    </div>
                    
                    <p className="text-gaming-muted mb-3">
                      {selectedGroupData.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gaming-muted">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedGroupData.memberCount}/{selectedGroupData.maxMembers} üye</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Crown className="w-4 h-4" />
                        <span>{selectedGroupData.ownerName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Oluşturuldu: {new Date(selectedGroupData.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {selectedGroupData.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedGroupData.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedGroupData.isJoined ? (
                    <>
                      <button className="px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 rounded-lg text-neon-purple transition-colors">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Sohbet
                      </button>
                      {selectedGroupData.ownerId === user?.uid ? (
                        <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                          <Settings className="w-5 h-5 text-gaming-muted" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeaveGroup(selectedGroupData.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
                        >
                          Ayrıl
                        </button>
                      )}
                    </>
                  ) : selectedGroupData.isPending ? (
                    <button disabled className="px-4 py-2 bg-neon-orange/20 border border-neon-orange/30 rounded-lg text-neon-orange cursor-not-allowed">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Beklemede
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(selectedGroupData.id)}
                      className="px-4 py-2 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg text-neon-green transition-colors"
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Katıl
                    </button>
                  )}
                  <button className="p-2 rounded-lg hover:bg-gaming-surface transition-colors">
                    <MoreVertical className="w-5 h-5 text-gaming-muted" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedGroupData.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-gaming-surface rounded-full text-sm text-gaming-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Next Event */}
              {selectedGroupData.nextEvent && (
                <div className="mt-4 p-4 bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-neon-purple/20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-neon-purple" />
                    <h3 className="font-semibold text-gaming-text">Yaklaşan Etkinlik</h3>
                  </div>
                  <p className="text-lg font-medium text-neon-purple mt-1">
                    {selectedGroupData.nextEvent.title}
                  </p>
                  <p className="text-gaming-muted">
                    {selectedGroupData.nextEvent.date} - {selectedGroupData.nextEvent.time}
                  </p>
                </div>
              )}
            </div>

            {/* Members Section */}
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold text-gaming-text mb-4">
                Üyeler ({selectedGroupData.memberCount})
              </h3>
              
              {selectedGroupData.members && (
                <div className="space-y-3">
                  {selectedGroupData.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gaming-surface/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          {member.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-gaming-surface"></div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gaming-text">
                              {member.displayName}
                            </span>
                            {member.role === 'owner' && (
                              <Crown className="w-4 h-4 text-neon-orange" />
                            )}
                            {member.role === 'admin' && (
                              <Shield className="w-4 h-4 text-neon-cyan" />
                            )}
                          </div>
                          <p className="text-sm text-gaming-muted">
                            @{member.username} • {member.isOnline ? 'Çevrimiçi' : member.lastSeen}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-muted capitalize">
                          {member.role === 'owner' ? 'Sahip' : member.role === 'admin' ? 'Yönetici' : 'Üye'}
                        </span>
                        {selectedGroupData.ownerId === user?.uid && member.id !== user?.uid && (
                          <button className="p-1 rounded hover:bg-gaming-surface transition-colors">
                            <MoreVertical className="w-4 h-4 text-gaming-muted" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gaming-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gaming-text mb-2">Grup Seç</h3>
              <p className="text-gaming-muted">Detayları görmek için bir grup seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
