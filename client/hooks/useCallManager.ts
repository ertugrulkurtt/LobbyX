import { useState, useEffect, useCallback } from 'react';
import { callService, CallData, CallCallbacks } from '../lib/callService';
import { useAuth } from '../contexts/AuthContext';

interface CallState {
  currentCall: CallData | null;
  isIncomingCall: boolean;
  isCallModalOpen: boolean;
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  callDuration: number;
  error: string | null;
}

interface CallActions {
  initiateCall: (
    receiverId: string,
    receiverName: string,
    receiverAvatar: string | undefined,
    conversationId: string,
    type?: 'voice' | 'video'
  ) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleDeafen: () => void;
  clearError: () => void;
}

export function useCallManager(): [CallState, CallActions] {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    currentCall: null,
    isIncomingCall: false,
    isCallModalOpen: false,
    isConnected: false,
    isMuted: false,
    isDeafened: false,
    callDuration: 0,
    error: null
  });

  // Timer for call duration
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  // Set up call service callbacks
  useEffect(() => {
    if (!user?.uid) {
      console.log('No user ID available for call service');
      return;
    }

    const callbacks: CallCallbacks = {
      onIncomingCall: (callData: CallData) => {
        console.log('📞 Incoming call from:', callData.callerName);
        setCallState(prev => ({
          ...prev,
          currentCall: callData,
          isIncomingCall: true,
          isCallModalOpen: true,
          isConnected: false,
          error: null
        }));
      },

      onCallAnswered: (callData: CallData) => {
        console.log('✅ Call answered:', callData.id);
        setCallState(prev => ({
          ...prev,
          isIncomingCall: false,
          isConnected: true,
          callDuration: 0
        }));

        // Start call timer
        const startTime = Date.now();
        const timer = setInterval(() => {
          setCallState(prev => ({
            ...prev,
            callDuration: Math.floor((Date.now() - startTime) / 1000)
          }));
        }, 1000);
        setCallTimer(timer);
      },

      onCallRejected: (callData: CallData) => {
        console.log('❌ Call rejected:', callData.id);
        setCallState(prev => ({
          ...prev,
          currentCall: null,
          isIncomingCall: false,
          isCallModalOpen: false,
          isConnected: false,
          callDuration: 0,
          error: null
        }));
        clearTimer();
      },

      onCallEnded: (callData: CallData) => {
        console.log('📞 Call ended:', callData.id);
        setCallState(prev => ({
          ...prev,
          currentCall: null,
          isIncomingCall: false,
          isCallModalOpen: false,
          isConnected: false,
          callDuration: 0,
          error: null
        }));
        clearTimer();
      },

      onCallMissed: (callData: CallData) => {
        console.log('📵 Call missed:', callData.id);
        setCallState(prev => ({
          ...prev,
          currentCall: null,
          isIncomingCall: false,
          isCallModalOpen: false,
          isConnected: false,
          callDuration: 0,
          error: null
        }));
        clearTimer();
      },

      onError: (error: string) => {
        console.error('📞 Call error:', error);
        setCallState(prev => ({
          ...prev,
          error,
          isConnected: false
        }));
      }
    };

    callService.setCallbacks(callbacks);
    callService.startListening(user.uid);

    return () => {
      try {
        callService.stopListening();
        clearTimer();
      } catch (error) {
        console.warn('Error cleaning up call service:', error);
      }
    };
  }, [user?.uid]);

  const clearTimer = useCallback(() => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  }, [callTimer]);

  // Actions
  const initiateCall = useCallback(async (
    receiverId: string,
    receiverName: string,
    receiverAvatar: string | undefined,
    conversationId: string,
    type: 'voice' | 'video' = 'voice'
  ) => {
    if (!user?.uid) {
      setCallState(prev => ({ ...prev, error: 'Kullanıcı girişi gerekli' }));
      return;
    }

    try {
      setCallState(prev => ({ ...prev, error: null }));
      
      // Check microphone permission
      const hasPermission = await callService.checkMicrophonePermission();
      if (!hasPermission) {
        setCallState(prev => ({ 
          ...prev, 
          error: 'Sesli arama için mikrofon iznine ihtiyaç var.' 
        }));
        return;
      }

      const callId = await callService.initiateCall(
        user.uid,
        user.displayName || user.username || 'Kullanıcı',
        user.photoURL,
        receiverId,
        receiverName,
        receiverAvatar,
        conversationId,
        type
      );

      const callData = callService.getCurrentCall();
      if (callData) {
        setCallState(prev => ({
          ...prev,
          currentCall: callData,
          isIncomingCall: false,
          isCallModalOpen: true,
          isConnected: false
        }));
      }
    } catch (error: any) {
      console.error('Error initiating call:', error);
      setCallState(prev => ({ 
        ...prev, 
        error: error.message || 'Arama başlatılamadı' 
      }));
    }
  }, [user]);

  const answerCall = useCallback(async () => {
    if (!callState.currentCall?.id) return;

    try {
      await callService.answerCall(callState.currentCall.id);
    } catch (error: any) {
      console.error('Error answering call:', error);
      setCallState(prev => ({ 
        ...prev, 
        error: error.message || 'Arama cevaplanamadı' 
      }));
    }
  }, [callState.currentCall]);

  const rejectCall = useCallback(async () => {
    console.log('📞 useCallManager rejectCall called', {
      hasCurrentCall: !!callState.currentCall,
      callId: callState.currentCall?.id
    });

    // Immediately close the modal for better UX
    setCallState(prev => ({
      ...prev,
      isCallModalOpen: false,
      isConnected: false
    }));

    if (!callState.currentCall?.id) {
      console.warn('📞 No current call to reject');
      // Force close modal
      setCallState(prev => ({
        ...prev,
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();
      return;
    }

    const currentCallId = callState.currentCall.id;

    try {
      console.log('📞 Calling callService.rejectCall with ID:', currentCallId);
      await callService.rejectCall(currentCallId);
      console.log('📞 callService.rejectCall completed');

      // Clean up state after successful reject
      setCallState(prev => ({
        ...prev,
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();

    } catch (error: any) {
      console.error('📞 Error rejecting call:', error);
      setCallState(prev => ({
        ...prev,
        error: error.message || 'Arama reddedilemedi',
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();
    }
  }, [callState.currentCall, clearTimer]);

  const endCall = useCallback(async () => {
    console.log('📞 useCallManager endCall called', {
      hasCurrentCall: !!callState.currentCall,
      callId: callState.currentCall?.id,
      isConnected: callState.isConnected
    });

    // Immediately close the modal for better UX
    setCallState(prev => ({
      ...prev,
      isCallModalOpen: false,
      isConnected: false
    }));

    if (!callState.currentCall?.id) {
      console.warn('📞 No current call to end');
      // Force close modal if it's open but no call exists
      setCallState(prev => ({
        ...prev,
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();
      return;
    }

    const currentCallId = callState.currentCall.id;

    try {
      console.log('📞 Calling callService.endCall with ID:', currentCallId);
      await callService.endCall(currentCallId);
      console.log('📞 callService.endCall completed');

      // Clean up state after successful end
      setCallState(prev => ({
        ...prev,
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();

    } catch (error: any) {
      console.error('📞 Error ending call:', error);
      setCallState(prev => ({
        ...prev,
        error: error.message || 'Arama sonlandırılamadı',
        currentCall: null,
        isIncomingCall: false,
        callDuration: 0
      }));
      clearTimer();
    }
  }, [callState.currentCall, clearTimer]);

  const toggleMute = useCallback(() => {
    setCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  }, []);

  const toggleDeafen = useCallback(() => {
    setCallState(prev => ({
      ...prev,
      isDeafened: !prev.isDeafened
    }));
  }, []);

  const clearError = useCallback(() => {
    setCallState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        callService.cleanup();
        clearTimer();
      } catch (error) {
        console.warn('Error during final cleanup:', error);
      }
    };
  }, [clearTimer]);

  return [
    callState,
    {
      initiateCall,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleDeafen,
      clearError
    }
  ];
}
