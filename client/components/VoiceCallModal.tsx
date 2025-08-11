import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, VolumeX, Volume2, User } from 'lucide-react';
import { VoiceCallState } from '../lib/voiceChatService';

interface VoiceCallModalProps {
  isOpen: boolean;
  callState: VoiceCallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onAnswer?: () => void;
  onReject?: () => void;
  isIncoming?: boolean;
}

export default function VoiceCallModal({
  isOpen,
  callState,
  onEndCall,
  onToggleMute,
  onToggleDeafen,
  onAnswer,
  onReject,
  isIncoming = false
}: VoiceCallModalProps) {
  const [callDuration, setCallDuration] = useState(0);

  // Update call duration every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState.isInCall && callState.callStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - callState.callStartTime!.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.isInCall, callState.callStartTime]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gaming-surface rounded-2xl shadow-2xl border border-gaming-border max-w-md w-full">
        {/* Header */}
        <div className="p-6 text-center">
          {/* User Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
            {callState.remoteUser?.avatar ? (
              <img
                src={callState.remoteUser.avatar}
                alt={callState.remoteUser.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>

          {/* User Name */}
          <h3 className="text-xl font-semibold text-gaming-text mb-2">
            {callState.remoteUser?.name || 'Bilinmeyen Kullanıcı'}
          </h3>

          {/* Call Status */}
          <div className="text-gaming-muted">
            {isIncoming ? (
              <p className="text-neon-green animate-pulse">Gelen Arama...</p>
            ) : callState.isConnecting ? (
              <p className="text-neon-cyan animate-pulse">Bağlanıyor...</p>
            ) : callState.isInCall ? (
              <p className="text-neon-green">{formatDuration(callDuration)}</p>
            ) : (
              <p>Arama</p>
            )}
          </div>

          {/* Error Display */}
          {callState.error && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{callState.error}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gaming-border">
          {isIncoming ? (
            /* Incoming Call Controls */
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={onReject}
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Reddet"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button
                onClick={onAnswer}
                className="w-16 h-16 bg-neon-green text-white rounded-full flex items-center justify-center hover:bg-neon-green/80 transition-colors animate-pulse"
                title="Cevapla"
              >
                <Phone className="w-8 h-8" />
              </button>
            </div>
          ) : (
            /* Active Call Controls */
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <button
                onClick={onToggleMute}
                disabled={!callState.isInCall}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                  callState.isMuted
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-gaming-surface text-gaming-muted hover:text-neon-green hover:bg-gaming-surface/80'
                }`}
                title={callState.isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
              >
                {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Deafen Button */}
              <button
                onClick={onToggleDeafen}
                disabled={!callState.isInCall}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                  callState.isDeafened
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-gaming-surface text-gaming-muted hover:text-neon-blue hover:bg-gaming-surface/80'
                }`}
                title={callState.isDeafened ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {callState.isDeafened ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Aramayı Sonlandır"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Call Quality Info */}
        {callState.isInCall && (
          <div className="px-6 pb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gaming-muted">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>Bağlantı Durumu: İyi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
