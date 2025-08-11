import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Save,
  Trash2,
  Clock,
  Calendar,
  Users,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  FileAudio,
  Headphones
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface VoiceRecording {
  id: string;
  title: string;
  duration: number; // in seconds
  createdAt: string;
  participants: string[];
  channelId: string;
  channelName: string;
  createdBy: string;
  fileSize: number; // in bytes
  format: 'mp3' | 'wav' | 'ogg';
  isPrivate: boolean;
  transcription?: string;
  tags: string[];
  plays: number;
  likes: number;
  status: 'processing' | 'ready' | 'error';
}

// Mock recordings data
const mockRecordings: VoiceRecording[] = [
  {
    id: '1',
    title: 'Valorant Takım Stratejisi',
    duration: 1847, // 30:47
    createdAt: '2024-10-25T20:30:00Z',
    participants: ['user1', 'user2', 'user3', 'user4', 'user5'],
    channelId: 'valorant-voice',
    channelName: 'Valorant Sesli',
    createdBy: 'user1',
    fileSize: 15728640, // ~15MB
    format: 'mp3',
    isPrivate: false,
    transcription: 'Takım strateji toplantısı, site alımları ve default pozisyonlar hakkında...',
    tags: ['strateji', 'valorant', 'takım'],
    plays: 24,
    likes: 8,
    status: 'ready'
  },
  {
    id: '2',
    title: 'CS2 Antrenman Seansı',
    duration: 2543, // 42:23
    createdAt: '2024-10-24T19:15:00Z',
    participants: ['user2', 'user6', 'user7'],
    channelId: 'cs2-practice',
    channelName: 'CS2 Antrenman',
    createdBy: 'user2',
    fileSize: 21667840, // ~21MB
    format: 'mp3',
    isPrivate: false,
    tags: ['antrenman', 'cs2', 'aim'],
    plays: 15,
    likes: 5,
    status: 'ready'
  },
  {
    id: '3',
    title: 'Topluluk Toplantısı',
    duration: 3600, // 60:00
    createdAt: '2024-10-23T21:00:00Z',
    participants: ['admin', 'mod1', 'mod2', 'user1', 'user2'],
    channelId: 'meeting-room',
    channelName: 'Toplantı Odası',
    createdBy: 'admin',
    fileSize: 30720000, // ~30MB
    format: 'mp3',
    isPrivate: true,
    transcription: 'Sunucu kuralları ve etkinlik planlaması hakkında toplantı...',
    tags: ['toplantı', 'admin', 'kurallar'],
    plays: 8,
    likes: 3,
    status: 'ready'
  },
  {
    id: '4',
    title: 'Turnuva Analizi',
    duration: 0,
    createdAt: '2024-10-25T22:00:00Z',
    participants: ['user1', 'user3'],
    channelId: 'analysis',
    channelName: 'Analiz Odası',
    createdBy: 'user1',
    fileSize: 0,
    format: 'mp3',
    isPrivate: false,
    tags: ['turnuva', 'analiz'],
    plays: 0,
    likes: 0,
    status: 'processing'
  }
];

interface VoiceChatRecordingProps {
  channelId: string;
  isRecordingEnabled?: boolean;
  canManageRecordings?: boolean;
}

export default function VoiceChatRecording({ 
  channelId, 
  isRecordingEnabled = false, 
  canManageRecordings = false 
}: VoiceChatRecordingProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const [recordings, setRecordings] = useState(mockRecordings);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscription, setShowTranscription] = useState<string | null>(null);
  
  // Recording settings
  const [recordingSettings, setRecordingSettings] = useState({
    quality: 'high' as 'low' | 'medium' | 'high',
    format: 'mp3' as 'mp3' | 'wav' | 'ogg',
    autoSave: true,
    transcription: true,
    isPrivate: false
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTimer, setRecordingTimer] = useState(0);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: recordingSettings.quality === 'high' ? 48000 : 
                      recordingSettings.quality === 'medium' ? 44100 : 22050
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: `audio/${recordingSettings.format}`
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTimer(0);
      
      mediaRecorder.start();
      console.log('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Kayıt başlatılamadı. Mikrofon izni gerekli.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Create new recording entry
      const newRecording: VoiceRecording = {
        id: Date.now().toString(),
        title: `Kayıt ${new Date().toLocaleDateString('tr-TR')}`,
        duration: recordingTimer,
        createdAt: new Date().toISOString(),
        participants: [user?.uid || 'current'],
        channelId: channelId,
        channelName: 'Mevcut Kanal',
        createdBy: user?.uid || 'current',
        fileSize: recordingTimer * 1000 * 64, // Estimate
        format: recordingSettings.format,
        isPrivate: recordingSettings.isPrivate,
        tags: [],
        plays: 0,
        likes: 0,
        status: recordingSettings.transcription ? 'processing' : 'ready'
      };
      
      setRecordings(prev => [newRecording, ...prev]);
      setCurrentRecording(newRecording);
      console.log('Recording stopped');
    }
  };

  const playRecording = (recordingId: string) => {
    if (isPlaying === recordingId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(null);
    } else {
      setIsPlaying(recordingId);
      // In real implementation, set audio source and play
      console.log('Playing recording:', recordingId);
    }
  };

  const downloadRecording = (recording: VoiceRecording) => {
    // In real implementation, create download link
    console.log('Downloading recording:', recording.id);
    alert(`${recording.title} indiriliyor...`);
  };

  const deleteRecording = (recordingId: string) => {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      if (isPlaying === recordingId) {
        setIsPlaying(null);
      }
    }
  };

  const likeRecording = (recordingId: string) => {
    setRecordings(prev => prev.map(r => 
      r.id === recordingId ? { ...r, likes: r.likes + 1 } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Headphones className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-2xl font-bold text-gaming-text">Sesli Sohbet Kayıtları</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {isRecordingEnabled && (
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      {isRecordingEnabled && (
        <div className="card-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-neon-purple hover:bg-neon-purple/80'
                }`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div>
                <h3 className="text-lg font-semibold text-gaming-text">
                  {isRecording ? 'Kayıt Yapılıyor...' : 'Kayıt Başlat'}
                </h3>
                {isRecording && (
                  <div className="flex items-center space-x-2 text-sm text-gaming-muted">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>{formatDuration(recordingTimer)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gaming-muted">
              <Shield className="w-4 h-4" />
              <span>Kalite: {recordingSettings.quality.toUpperCase()}</span>
              <span>•</span>
              <span>Format: {recordingSettings.format.toUpperCase()}</span>
            </div>
          </div>
          
          {isRecording && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Kayıt devam ediyor. Tüm katılımcılar kaydediliyor.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Recording Info */}
      {currentRecording && (
        <div className="card-glass border border-neon-green/30">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-neon-green" />
            <h3 className="text-lg font-semibold text-gaming-text">Son Kayıt</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gaming-text font-medium">{currentRecording.title}</span>
              <span className="text-sm text-gaming-muted">{formatDuration(currentRecording.duration)}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gaming-muted">
              <span>{formatFileSize(currentRecording.fileSize)}</span>
              <span>{currentRecording.format.toUpperCase()}</span>
              <span>{currentRecording.isPrivate ? 'Özel' : 'Herkese Açık'}</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => playRecording(currentRecording.id)}
                className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors text-sm"
              >
                Dinle
              </button>
              <button
                onClick={() => downloadRecording(currentRecording)}
                className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-sm"
              >
                İndir
              </button>
              {currentRecording.transcription && (
                <button
                  onClick={() => setShowTranscription(currentRecording.id)}
                  className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors text-sm"
                >
                  Transkript
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recordings List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gaming-text">Kayıt Geçmişi</h3>
        
        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <FileAudio className="w-12 h-12 text-gaming-muted mx-auto mb-3" />
            <p className="text-gaming-muted">Henüz kayıt bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="card-glass">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                    {recording.status === 'processing' ? (
                      <div className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
                    ) : recording.status === 'error' ? (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    ) : (
                      <FileAudio className="w-6 h-6 text-neon-cyan" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gaming-text truncate">
                          {recording.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gaming-muted mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(recording.createdAt).toLocaleDateString('tr-TR')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(recording.duration)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{recording.participants.length} kişi</span>
                          </span>
                          <span>{formatFileSize(recording.fileSize)}</span>
                        </div>
                        
                        {recording.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recording.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gaming-surface text-gaming-text rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1 ml-4">
                        <div className="flex items-center space-x-2 text-xs text-gaming-muted">
                          <span>{recording.plays} dinlenme</span>
                          <span>•</span>
                          <span>{recording.likes} beğeni</span>
                        </div>
                        {recording.isPrivate && (
                          <span className="px-2 py-0.5 bg-neon-orange/20 text-neon-orange rounded text-xs">
                            Özel
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {recording.status === 'ready' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => playRecording(recording.id)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                            isPlaying === recording.id
                              ? 'bg-neon-orange/20 text-neon-orange'
                              : 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                          }`}
                        >
                          {isPlaying === recording.id ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Duraklat</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Dinle</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => downloadRecording(recording)}
                          className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>İndir</span>
                        </button>
                        
                        {recording.transcription && (
                          <button
                            onClick={() => setShowTranscription(recording.id)}
                            className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors text-sm"
                          >
                            Transkript
                          </button>
                        )}
                        
                        <button
                          onClick={() => likeRecording(recording.id)}
                          className="px-3 py-1 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors text-sm"
                        >
                          👍 {recording.likes}
                        </button>
                        
                        {canManageRecordings && (
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {recording.status === 'processing' && (
                      <div className="mt-3 p-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                        <div className="flex items-center space-x-2 text-neon-cyan text-sm">
                          <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
                          <span>İşleniyor... Transkript oluşturuluyor.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recording Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-gaming-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gaming-text">Kayıt Ayarları</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Ses Kalitesi
                </label>
                <select
                  value={recordingSettings.quality}
                  onChange={(e) => setRecordingSettings({
                    ...recordingSettings,
                    quality: e.target.value as 'low' | 'medium' | 'high'
                  })}
                  className="w-full px-3 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                >
                  <option value="low">Düşük (22kHz)</option>
                  <option value="medium">Orta (44kHz)</option>
                  <option value="high">Yüksek (48kHz)</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gaming-text mb-2">
                  Dosya Formatı
                </label>
                <select
                  value={recordingSettings.format}
                  onChange={(e) => setRecordingSettings({
                    ...recordingSettings,
                    format: e.target.value as 'mp3' | 'wav' | 'ogg'
                  })}
                  className="w-full px-3 py-2 bg-gaming-surface border border-gaming-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-gaming-text"
                >
                  <option value="mp3">MP3 (Sıkıştırılmış)</option>
                  <option value="wav">WAV (Kayıpsız)</option>
                  <option value="ogg">OGG (Açık Kaynak)</option>
                </select>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gaming-text">Otomatik Kaydet</h5>
                  <p className="text-xs text-gaming-muted">Kayıt bitince otomatik olarak kaydet</p>
                </div>
                <button
                  onClick={() => setRecordingSettings({
                    ...recordingSettings,
                    autoSave: !recordingSettings.autoSave
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    recordingSettings.autoSave ? 'bg-neon-purple' : 'bg-gaming-border'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    recordingSettings.autoSave ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Transcription */}
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gaming-text">Transkript Oluştur</h5>
                  <p className="text-xs text-gaming-muted">Konuşmaları yazıya çevir</p>
                </div>
                <button
                  onClick={() => setRecordingSettings({
                    ...recordingSettings,
                    transcription: !recordingSettings.transcription
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    recordingSettings.transcription ? 'bg-neon-purple' : 'bg-gaming-border'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    recordingSettings.transcription ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Private */}
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gaming-text">Özel Kayıt</h5>
                  <p className="text-xs text-gaming-muted">Sadece sen görürsün</p>
                </div>
                <button
                  onClick={() => setRecordingSettings({
                    ...recordingSettings,
                    isPrivate: !recordingSettings.isPrivate
                  })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    recordingSettings.isPrivate ? 'bg-neon-purple' : 'bg-gaming-border'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    recordingSettings.isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Modal */}
      {showTranscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-surface/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gaming-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gaming-text">Transkript</h3>
              <button
                onClick={() => setShowTranscription(null)}
                className="w-8 h-8 rounded-lg bg-gaming-surface hover:bg-gaming-surface/80 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gaming-surface rounded-lg">
                <p className="text-gaming-text leading-relaxed">
                  {recordings.find(r => r.id === showTranscription)?.transcription ||
                   'Transkript henüz hazır değil. Lütfen daha sonra tekrar deneyin.'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gaming-surface text-gaming-text rounded-lg hover:bg-gaming-surface/80 transition-colors">
                  Kopyala
                </button>
                <button className="px-4 py-2 bg-neon-cyan text-white rounded-lg hover:bg-neon-cyan/80 transition-colors">
                  İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
