import React, { useEffect, useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  User,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallData } from '../lib/callService';

interface CallNotificationModalProps {
  isOpen: boolean;
  callData: CallData | null;
  isIncoming: boolean;
  isConnected?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  onAnswer?: () => void;
  onReject?: () => void;
  onEndCall?: () => void;
  onToggleMute?: () => void;
  onToggleDeafen?: () => void;
  callDuration?: number;
}

export default function CallNotificationModal({
  isOpen,
  callData,
  isIncoming,
  isConnected = false,
  isMuted = false,
  isDeafened = false,
  onAnswer,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleDeafen,
  callDuration = 0
}: CallNotificationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen || !callData) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayName = (): string => {
    if (isIncoming) {
      return callData.callerName;
    }
    return callData.receiverName;
  };

  const getAvatar = (): string | undefined => {
    if (isIncoming) {
      return callData.callerAvatar;
    }
    return callData.receiverAvatar;
  };

  const getCallStatusText = (): string => {
    if (isConnected) {
      return 'Aramada';
    } else if (isIncoming) {
      return 'Gelen Arama';
    } else {
      return callData.status === 'ringing' ? 'Aranıyor...' : 'Bağlanıyor...';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Call Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-gaming-surface/95 backdrop-blur-xl border border-gaming-border rounded-3xl p-8 shadow-glass max-w-md w-full mx-4"
        >
          {/* Call Type Icon */}
          <div className="absolute top-4 right-4">
            {callData.type === 'video' ? (
              <Video className="w-6 h-6 text-neon-blue" />
            ) : (
              <Phone className="w-6 h-6 text-neon-green" />
            )}
          </div>

          {/* User Avatar and Info */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4">
              {/* Animated Ring for Incoming Calls */}
              {isIncoming && !isConnected && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-neon-green rounded-full"
                  style={{ width: '120px', height: '120px', top: '-10px', left: '-10px' }}
                />
              )}
              
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
                  {getAvatar() ? (
                    <img
                      src={getAvatar()!}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                
                {/* Online Status */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-neon-green rounded-full border-4 border-gaming-surface"></div>
              </div>
            </div>

            {/* User Name */}
            <h2 className="text-2xl font-bold text-gaming-text mb-2">
              {getDisplayName()}
            </h2>

            {/* Call Status */}
            <p className="text-gaming-muted mb-2">{getCallStatusText()}</p>

            {/* Call Duration */}
            {isConnected && callDuration > 0 && (
              <div className="flex items-center justify-center space-x-2 text-neon-green">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-6">
            {isIncoming && !isConnected ? (
              /* Incoming Call Controls */
              <>
                {/* Reject Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReject}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-glow"
                >
                  <PhoneOff className="w-8 h-8 text-white" />
                </motion.button>

                {/* Answer Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAnswer}
                  className="w-16 h-16 bg-neon-green rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-glow animate-pulse-glow"
                >
                  <Phone className="w-8 h-8 text-white" />
                </motion.button>
              </>
            ) : (
              /* Active Call Controls */
              <>
                {/* Mute Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted 
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-500' 
                      : 'bg-gaming-surface border border-gaming-border text-gaming-text hover:bg-gaming-border'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </motion.button>

                {/* Speaker/Deafen Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleDeafen}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isDeafened 
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-500' 
                      : 'bg-gaming-surface border border-gaming-border text-gaming-text hover:bg-gaming-border'
                  }`}
                >
                  {isDeafened ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </motion.button>

                {/* End Call Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('📞 End call button clicked in modal', { onEndCall: !!onEndCall });
                    if (onEndCall) {
                      onEndCall();
                    } else {
                      console.error('📞 No onEndCall handler provided');
                    }
                  }}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-glow"
                >
                  <PhoneOff className="w-8 h-8 text-white" />
                </motion.button>
              </>
            )}
          </div>

          {/* Additional Info for Active Calls */}
          {isConnected && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gaming-muted">
                {callData.type === 'video' ? 'Görüntülü arama' : 'Sesli arama'} aktif
              </p>
              {isMuted && (
                <p className="text-sm text-red-400 mt-1">Mikrofonunuz kapalı</p>
              )}
              {isDeafened && (
                <p className="text-sm text-red-400 mt-1">Sesiniz kapalı</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
