import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  X,
  Clock,
  Users,
  MapPin,
  Trophy,
  Gamepad2,
  Bell,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Target,
  Award,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface GameEvent {
  id: string;
  title: string;
  description?: string;
  type: 'tournament' | 'practice' | 'community' | 'announcement' | 'meeting';
  game?: string;
  startDate: string;
  endDate?: string;
  location?: string; // Can be virtual (Discord channel) or physical
  maxParticipants?: number;
  currentParticipants: number;
  participants: string[]; // user IDs
  organizer: string;
  serverId: string;
  channelId?: string;
  prizes?: string[];
  requirements?: string[];
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline?: string;
  isRegistrationOpen: boolean;
  tags: string[];
}

// Mock events data
const mockEvents: GameEvent[] = [
  {
    id: '1',
    title: 'Valorant Haftalık Turnuvası',
    description: 'Haftalık Valorant turnuvası. Ödüller: 1. 500₺, 2. 300₺, 3. 200₺',
    type: 'tournament',
    game: 'Valorant',
    startDate: '2024-10-27T20:00:00Z',
    endDate: '2024-10-27T23:00:00Z',
    location: 'Valorant Kanalı',
    maxParticipants: 32,
    currentParticipants: 28,
    participants: ['user1', 'user2', 'user3'],
    organizer: 'admin',
    serverId: 'server1',
    channelId: 'valorant',
    prizes: ['500₺ Steam Para', '300₺ Steam Para', '200₺ Steam Para'],
    requirements: ['Rank: Gold+', 'Discord\'da mikrofon'],
    isRecurring: true,
    recurringPattern: 'weekly',
    status: 'upcoming',
    registrationDeadline: '2024-10-27T18:00:00Z',
    isRegistrationOpen: true,
    tags: ['tournament', 'fps', 'competitive']
  },
  {
    id: '2',
    title: 'CS2 Takım Antrenmanı',
    description: 'Takım stratejileri ve aim antrenmanı',
    type: 'practice',
    game: 'Counter-Strike 2',
    startDate: '2024-10-26T19:00:00Z',
    endDate: '2024-10-26T21:00:00Z',
    location: 'CS2 Antrenman Kanalı',
    maxParticipants: 10,
    currentParticipants: 8,
    participants: ['user4', 'user5'],
    organizer: 'coach1',
    serverId: 'server1',
    channelId: 'cs2',
    isRecurring: true,
    recurringPattern: 'weekly',
    status: 'upcoming',
    isRegistrationOpen: true,
    tags: ['practice', 'fps', 'team']
  },
  {
    id: '3',
    title: 'Sunucu Kuralları Toplantısı',
    description: 'Yeni kurallar ve güncellemeler hakkında toplantı',
    type: 'meeting',
    startDate: '2024-10-28T21:00:00Z',
    endDate: '2024-10-28T22:00:00Z',
    location: 'Genel Kanal',
    participants: [],
    organizer: 'admin',
    serverId: 'server1',
    channelId: 'general',
    isRecurring: false,
    status: 'upcoming',
    isRegistrationOpen: false,
    currentParticipants: 0,
    tags: ['meeting', 'announcement']
  },
  {
    id: '4',
    title: 'League of Legends Ranked 5v5',
    description: 'Ranked takım maçları için katılım',
    type: 'tournament',
    game: 'League of Legends',
    startDate: '2024-10-25T18:00:00Z',
    endDate: '2024-10-25T22:00:00Z',
    maxParticipants: 20,
    currentParticipants: 15,
    participants: ['user6', 'user7'],
    organizer: 'captain1',
    serverId: 'server1',
    channelId: 'lol',
    isRecurring: false,
    status: 'completed',
    isRegistrationOpen: false,
    tags: ['tournament', 'moba', 'ranked']
  }
];

interface EventCalendarProps {
  serverId: string;
  canCreateEvents?: boolean;
}

export default function EventCalendar({ serverId, canCreateEvents = false }: EventCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<GameEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  
  // Create event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'tournament' as GameEvent['type'],
    game: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    registrationDeadline: '',
    prizes: [''],
    requirements: [''],
    isRecurring: false,
    recurringPattern: 'weekly' as GameEvent['recurringPattern'],
    tags: ''
  });

  const events = mockEvents.filter(event => event.serverId === serverId);

  const eventTypes = [
    { id: 'tournament', name: 'Turnuva', icon: Trophy, color: 'text-neon-orange' },
    { id: 'practice', name: 'Antrenman', icon: Target, color: 'text-neon-cyan' },
    { id: 'community', name: 'Topluluk', icon: Users, color: 'text-neon-green' },
    { id: 'announcement', name: 'Duyuru', icon: Bell, color: 'text-neon-pink' },
    { id: 'meeting', name: 'Toplantı', icon: CalendarDays, color: 'text-neon-purple' }
  ];

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.id === type) || eventTypes[0];
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) > now && event.status === 'upcoming')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const handleJoinEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user) return;

    if (event.participants.includes(user.uid)) {
      console.log('Leaving event:', eventId);
      alert('Etkinlikten ayrıldınız!');
    } else {
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        alert('Etkinlik dolu!');
        return;
      }
      console.log('Joining event:', eventId);
      alert('Etkinliğe katıldınız!');
    }
  };

  const addPrize = () => {
    setNewEvent({ ...newEvent, prizes: [...newEvent.prizes, ''] });
  };

  const addRequirement = () => {
    setNewEvent({ ...newEvent, requirements: [...newEvent.requirements, ''] });
  };

  const updatePrize = (index: number, value: string) => {
    const prizes = [...newEvent.prizes];
    prizes[index] = value;
    setNewEvent({ ...newEvent, prizes });
  };

  const updateRequirement = (index: number, value: string) => {
    const requirements = [...newEvent.requirements];
    requirements[index] = value;
    setNewEvent({ ...newEvent, requirements });
  };

  const removePrize = (index: number) => {
    if (newEvent.prizes.length > 1) {
      const prizes = newEvent.prizes.filter((_, i) => i !== index);
      setNewEvent({ ...newEvent, prizes });
    }
  };

  const removeRequirement = (index: number) => {
    if (newEvent.requirements.length > 1) {
      const requirements = newEvent.requirements.filter((_, i) => i !== index);
      setNewEvent({ ...newEvent, requirements });
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.startDate || !newEvent.startTime) {
      alert('Lütfen gerekli alanları doldurun.');
      return;
    }

    console.log('Creating event:', newEvent);
    setShowCreateModal(false);
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      type: 'tournament',
      game: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      maxParticipants: '',
      registrationDeadline: '',
      prizes: [''],
      requirements: [''],
      isRecurring: false,
      recurringPattern: 'weekly',
      tags: ''
    });
    alert('Etkinlik başarıyla oluşturuldu!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-neon-cyan" />
            <h2 className="text-2xl font-bold text-gaming-text">Etkinlik Takvimi</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gaming-surface rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className="px-3 py-1 rounded text-sm transition-colors text-gaming-text hover:bg-gaming-border"
              >
                Ay
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 py-1 rounded text-sm transition-colors bg-neon-purple text-white"
              >
                Liste
              </button>
            </div>
            {canCreateEvents && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Etkinlik Oluştur</span>
              </button>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">Yaklaşan Etkinlikler</h3>
          {getUpcomingEvents().map((event) => {
            const typeInfo = getEventTypeInfo(event.type);
            const Icon = typeInfo.icon;
            const isParticipant = user && event.participants.includes(user.uid);
            
            return (
              <div key={event.id} className="card-glass">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${typeInfo.color.replace('text-', 'bg-')}/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${typeInfo.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gaming-text mb-1">{event.title}</h4>
                        <p className="text-gaming-muted text-sm mb-2">{event.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gaming-muted">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(event.startDate)} - {formatTime(event.startDate)}</span>
                          </span>
                          {event.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {event.isRegistrationOpen && (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              isParticipant
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                            }`}
                          >
                            {isParticipant ? 'Ayrıl' : 'Katıl'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowEventDetails(event)}
                          className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm"
                        >
                          Detaylar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-2xl font-bold text-gaming-text">Etkinlik Takvimi</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gaming-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className="px-3 py-1 rounded text-sm transition-colors bg-neon-purple text-white"
            >
              Ay
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1 rounded text-sm transition-colors text-gaming-text hover:bg-gaming-border"
            >
              Liste
            </button>
          </div>
          {canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Etkinlik Oluştur</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="w-10 h-10 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gaming-text" />
        </button>
        <h3 className="text-xl font-semibold text-gaming-text">
          {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="w-10 h-10 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gaming-text" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gaming-muted">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {getDaysInMonth(currentDate).map((date, index) => {
          if (!date) {
            return <div key={index} className="h-24"></div>;
          }
          
          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`h-24 p-1 rounded-lg border transition-all ${
                isSelected 
                  ? 'border-neon-purple bg-neon-purple/20' 
                  : isToday 
                    ? 'border-neon-cyan bg-neon-cyan/10' 
                    : 'border-gaming-border hover:border-gaming-border/60'
              }`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-neon-cyan' : isSelected ? 'text-neon-purple' : 'text-gaming-text'
                }`}>
                  {date.getDate()}
                </span>
                <div className="flex-1 flex flex-col space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded ${typeInfo.color.replace('text-', 'bg-')}/20 ${typeInfo.color} truncate`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gaming-muted">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gaming-text">
            {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} - Etkinlikler
          </h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gaming-muted text-center py-8">Bu tarihte etkinlik bulunmuyor.</p>
          ) : (
            <div className="grid gap-4">
              {getEventsForDate(selectedDate).map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                const Icon = typeInfo.icon;
                const isParticipant = user && event.participants.includes(user.uid);
                
                return (
                  <div key={event.id} className="card-glass">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${typeInfo.color.replace('text-', 'bg-')}/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${typeInfo.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gaming-text mb-1">{event.title}</h4>
                            <p className="text-gaming-muted text-sm mb-2">{event.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gaming-muted">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(event.startDate)}</span>
                              </span>
                              {event.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location}</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            {event.isRegistrationOpen && (
                              <button
                                onClick={() => handleJoinEvent(event.id)}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                  isParticipant
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                                }`}
                              >
                                {isParticipant ? 'Ayrıl' : 'Katıl'}
                              </button>
                            )}
                            <button
                              onClick={() => setShowEventDetails(event)}
                              className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm"
                            >
                              Detaylar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gaming-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gaming-text flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>Yeni Etkinlik Oluştur</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gaming-text" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Etkinlik Başlığı *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Etkinlik başlığını girin..."
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Etkinlik Türü *
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as GameEvent['type'] })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Etkinlik hakkında detaylar..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text resize-none"
                />
              </div>

              {/* Game and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Oyun
                  </label>
                  <input
                    type="text"
                    value={newEvent.game}
                    onChange={(e) => setNewEvent({ ...newEvent, game: e.target.value })}
                    placeholder="Valorant, CS2, League of Legends..."
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Konum
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Discord kanalı, fiziksel konum..."
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Başlangıç Saati *
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
              </div>

              {/* Max Participants and Registration Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Maksimum Katılımcı
                  </label>
                  <input
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                    placeholder="Sınırsız için boş bırakın"
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Kayıt Son Tarihi
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.registrationDeadline}
                    onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  />
                </div>
              </div>

              {/* Prizes */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Ödüller
                </label>
                <div className="space-y-2">
                  {newEvent.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={prize}
                        onChange={(e) => updatePrize(index, e.target.value)}
                        placeholder={`${index + 1}. ödül`}
                        className="flex-1 px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                      />
                      {newEvent.prizes.length > 1 && (
                        <button
                          onClick={() => removePrize(index)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addPrize}
                    className="w-full px-4 py-2 border-2 border-dashed border-gaming-border rounded-lg text-gaming-muted hover:border-neon-purple hover:text-neon-purple transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ödül Ekle</span>
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Gereksinimler
                </label>
                <div className="space-y-2">
                  {newEvent.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="Gereksinim"
                        className="flex-1 px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                      />
                      {newEvent.requirements.length > 1 && (
                        <button
                          onClick={() => removeRequirement(index)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRequirement}
                    className="w-full px-4 py-2 border-2 border-dashed border-gaming-border rounded-lg text-gaming-muted hover:border-neon-purple hover:text-neon-purple transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Gereksinim Ekle</span>
                  </button>
                </div>
              </div>

              {/* Recurring Event */}
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gaming-text">Tekrarlanan Etkinlik</h5>
                  <p className="text-xs text-gaming-muted">Bu etkinlik düzenli olarak tekrarlanır</p>
                </div>
                <button
                  onClick={() => setNewEvent({ ...newEvent, isRecurring: !newEvent.isRecurring })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    newEvent.isRecurring ? 'bg-neon-purple' : 'bg-gaming-border'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    newEvent.isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {newEvent.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    Tekrarlama Sıklığı
                  </label>
                  <select
                    value={newEvent.recurringPattern}
                    onChange={(e) => setNewEvent({ ...newEvent, recurringPattern: e.target.value as GameEvent['recurringPattern'] })}
                    className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Etiketler
                </label>
                <input
                  type="text"
                  value={newEvent.tags}
                  onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                  placeholder="tournament, fps, competitive (virgülle ayırın)"
                  className="w-full px-4 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                />
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
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
                >
                  Etkinlik Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gaming-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gaming-text">{showEventDetails.title}</h3>
              <button
                onClick={() => setShowEventDetails(null)}
                className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gaming-text" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Info */}
              <div className="space-y-4">
                <p className="text-gaming-muted">{showEventDetails.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-neon-cyan" />
                      <span className="text-gaming-muted">Başlangıç:</span>
                      <span className="text-gaming-text">{formatDate(showEventDetails.startDate)} {formatTime(showEventDetails.startDate)}</span>
                    </div>
                    {showEventDetails.endDate && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-neon-cyan" />
                        <span className="text-gaming-muted">Bitiş:</span>
                        <span className="text-gaming-text">{formatDate(showEventDetails.endDate)} {formatTime(showEventDetails.endDate)}</span>
                      </div>
                    )}
                    {showEventDetails.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-neon-green" />
                        <span className="text-gaming-muted">Konum:</span>
                        <span className="text-gaming-text">{showEventDetails.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-neon-pink" />
                      <span className="text-gaming-muted">Katılımcı:</span>
                      <span className="text-gaming-text">
                        {showEventDetails.currentParticipants}
                        {showEventDetails.maxParticipants ? `/${showEventDetails.maxParticipants}` : ''}
                      </span>
                    </div>
                    {showEventDetails.game && (
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-neon-orange" />
                        <span className="text-gaming-muted">Oyun:</span>
                        <span className="text-gaming-text">{showEventDetails.game}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prizes */}
              {showEventDetails.prizes && showEventDetails.prizes.length > 0 && showEventDetails.prizes[0] && (
                <div>
                  <h4 className="text-lg font-semibold text-gaming-text mb-3 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-neon-orange" />
                    <span>Ödüller</span>
                  </h4>
                  <div className="space-y-2">
                    {showEventDetails.prizes.map((prize, index) => prize && (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-neon-orange font-medium">{index + 1}.</span>
                        <span className="text-gaming-text">{prize}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {showEventDetails.requirements && showEventDetails.requirements.length > 0 && showEventDetails.requirements[0] && (
                <div>
                  <h4 className="text-lg font-semibold text-gaming-text mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <span>Gereksinimler</span>
                  </h4>
                  <div className="space-y-2">
                    {showEventDetails.requirements.map((requirement, index) => requirement && (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-neon-green">•</span>
                        <span className="text-gaming-text">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {showEventDetails.tags && showEventDetails.tags.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gaming-text mb-3">Etiketler</h4>
                  <div className="flex flex-wrap gap-2">
                    {showEventDetails.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Join Button */}
              {showEventDetails.isRegistrationOpen && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleJoinEvent(showEventDetails.id)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      user && showEventDetails.participants.includes(user.uid)
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                    }`}
                  >
                    {user && showEventDetails.participants.includes(user.uid) ? 'Etkinlikten Ayrıl' : 'Etkinliğe Katıl'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
