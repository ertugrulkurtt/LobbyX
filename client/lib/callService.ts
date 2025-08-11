import { 
  ref, 
  set, 
  remove, 
  onValue, 
  push, 
  serverTimestamp,
  off
} from 'firebase/database';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { rtdb, db } from './firebase';
import { RealUser } from './userService';

export interface CallData {
  id?: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  conversationId: string;
  status: 'initiating' | 'ringing' | 'answered' | 'rejected' | 'ended' | 'missed';
  type: 'voice' | 'video';
  startedAt: string;
  endedAt?: string;
  duration?: number; // in seconds
}

export interface CallNotification {
  id: string;
  callId: string;
  type: 'incoming_call' | 'call_ended' | 'call_missed';
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  conversationId: string;
  timestamp: string;
  isRead: boolean;
}

// Real-time call callbacks
export interface CallCallbacks {
  onIncomingCall?: (callData: CallData) => void;
  onCallAnswered?: (callData: CallData) => void;
  onCallRejected?: (callData: CallData) => void;
  onCallEnded?: (callData: CallData) => void;
  onCallMissed?: (callData: CallData) => void;
  onError?: (error: string) => void;
}

class CallService {
  private currentCall: CallData | null = null;
  private callbacks: CallCallbacks = {};
  private listeners: { [key: string]: any } = {};
  private callSound: HTMLAudioElement | null = null;
  private ringtoneSound: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudioFiles();
  }

  /**
   * Initialize audio files for call notifications
   */
  private initializeAudioFiles() {
    // Create call notification sound (Discord-like)
    this.callSound = new Audio();
    this.callSound.loop = true;
    this.callSound.volume = 0.7;

    // Create ringtone sound for incoming calls
    this.ringtoneSound = new Audio();
    this.ringtoneSound.loop = true;
    this.ringtoneSound.volume = 0.8;

    // Generate audio data URLs for Discord-like sounds
    this.generateCallSounds();
  }

  /**
   * Generate Discord-like call sounds using Web Audio API
   */
  private generateCallSounds() {
    try {
      // Outgoing call sound (lower pitched beep)
      const outgoingCallBlob = this.generateToneBlob(440, 0.3, 1.5); // A4 note, 0.3 volume, 1.5 seconds
      this.callSound!.src = URL.createObjectURL(outgoingCallBlob);

      // Incoming call sound (higher pitched with pattern)
      const incomingCallBlob = this.generateRingtoneBlob();
      this.ringtoneSound!.src = URL.createObjectURL(incomingCallBlob);
    } catch (error) {
      console.error('Error generating call sounds:', error);
      // Fallback to no sound if audio generation fails
    }
  }

  /**
   * Generate a simple tone blob
   */
  private generateToneBlob(frequency: number, volume: number, duration: number): Blob {
    const sampleRate = 44100;
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate tone data
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * volume * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Generate ringtone blob with pattern
   */
  private generateRingtoneBlob(): Blob {
    const sampleRate = 44100;
    const duration = 3; // 3 seconds pattern
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header (same as above)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate ringtone pattern: two tones alternating
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cycle = t % 1; // 1 second cycle
      let frequency = 0;
      let volume = 0;

      if (cycle < 0.4) {
        frequency = 523; // C5
        volume = 0.4;
      } else if (cycle < 0.5) {
        frequency = 659; // E5
        volume = 0.4;
      } else {
        volume = 0; // Silent pause
      }

      const sample = Math.sin(2 * Math.PI * frequency * t) * volume * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Set up callbacks for call events
   */
  setCallbacks(callbacks: CallCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Start listening for incoming calls for a user
   */
  startListening(userId: string) {
    this.stopListening(); // Clean up any existing listeners

    try {
      // Listen for incoming calls in real-time database
      const incomingCallsRef = ref(rtdb, `calls/incoming/${userId}`);

      const incomingCallsCallback = (snapshot: any) => {
        try {
          if (snapshot.exists()) {
            const callData = snapshot.val() as CallData;
            console.log('Incoming call detected:', callData);

            if (callData.status === 'ringing' && !this.currentCall) {
              this.currentCall = callData;
              this.playRingtone();
              this.callbacks.onIncomingCall?.(callData);
            }
          }
        } catch (error) {
          console.error('Error processing incoming call:', error);
        }
      };

      const incomingUnsubscribe = onValue(incomingCallsRef, incomingCallsCallback, (error) => {
        console.error('Error listening to incoming calls:', error);
      });

      this.listeners.incomingCalls = incomingUnsubscribe;

      // Listen for call status changes
      const callStatusRef = ref(rtdb, `calls/status/${userId}`);

      const callStatusCallback = (snapshot: any) => {
        try {
          if (snapshot.exists()) {
            const statusData = snapshot.val();
            console.log('Call status update:', statusData);

            if (this.currentCall && statusData.callId === this.currentCall.id) {
              switch (statusData.status) {
                case 'answered':
                  this.stopAllSounds();
                  this.callbacks.onCallAnswered?.(this.currentCall);
                  break;
                case 'rejected':
                  this.stopAllSounds();
                  this.callbacks.onCallRejected?.(this.currentCall);
                  this.currentCall = null;
                  break;
                case 'ended':
                  this.stopAllSounds();
                  this.callbacks.onCallEnded?.(this.currentCall);
                  this.currentCall = null;
                  break;
                case 'missed':
                  this.stopAllSounds();
                  this.callbacks.onCallMissed?.(this.currentCall);
                  this.currentCall = null;
                  break;
              }
            }
          }
        } catch (error) {
          console.error('Error processing call status update:', error);
        }
      };

      const statusUnsubscribe = onValue(callStatusRef, callStatusCallback, (error) => {
        console.error('Error listening to call status:', error);
      });

      this.listeners.callStatus = statusUnsubscribe;
    } catch (error) {
      console.error('Error setting up call listeners:', error);
      this.callbacks.onError?.('Arama dinleyicileri kurulamadı');
    }
  }

  /**
   * Stop listening for call events
   */
  stopListening() {
    Object.keys(this.listeners).forEach(key => {
      try {
        if (this.listeners[key] && typeof this.listeners[key] === 'function') {
          // Firebase onValue returns an unsubscribe function
          this.listeners[key]();
        }
      } catch (error) {
        console.warn('Error removing listener:', key, error);
      }
    });
    this.listeners = {};
    this.stopAllSounds();
  }

  /**
   * Initiate a call to another user
   */
  async initiateCall(
    callerId: string,
    callerName: string,
    callerAvatar: string | undefined,
    receiverId: string,
    receiverName: string,
    receiverAvatar: string | undefined,
    conversationId: string,
    type: 'voice' | 'video' = 'voice'
  ): Promise<string> {
    try {
      const callId = `call_${Date.now()}_${callerId}_${receiverId}`;
      const callData: CallData = {
        id: callId,
        callerId,
        callerName,
        callerAvatar,
        receiverId,
        receiverName,
        receiverAvatar,
        conversationId,
        status: 'initiating',
        type,
        startedAt: new Date().toISOString()
      };

      // Store call data in Firestore for persistence
      await addDoc(collection(db, 'calls'), callData);

      // Set call data in realtime database for immediate notification
      await set(ref(rtdb, `calls/incoming/${receiverId}`), {
        ...callData,
        status: 'ringing'
      });

      // Set outgoing call status for caller
      await set(ref(rtdb, `calls/outgoing/${callerId}`), {
        callId,
        status: 'ringing',
        startedAt: callData.startedAt
      });

      this.currentCall = callData;
      this.playCallSound();

      // Auto-timeout after 30 seconds
      setTimeout(() => {
        if (this.currentCall?.id === callId && this.currentCall?.status === 'initiating') {
          this.endCall(callId, 'missed');
        }
      }, 30000);

      return callId;
    } catch (error) {
      console.error('Error initiating call:', error);
      this.callbacks.onError?.('Arama başlatılamadı');
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callId: string): Promise<void> {
    if (!this.currentCall || this.currentCall.id !== callId) {
      throw new Error('Geçerli bir gelen arama bulunamadı');
    }

    try {
      // Update call status in realtime database
      await set(ref(rtdb, `calls/status/${this.currentCall.callerId}`), {
        callId,
        status: 'answered',
        answeredAt: new Date().toISOString()
      });

      await set(ref(rtdb, `calls/status/${this.currentCall.receiverId}`), {
        callId,
        status: 'answered',
        answeredAt: new Date().toISOString()
      });

      // Remove from incoming calls
      await remove(ref(rtdb, `calls/incoming/${this.currentCall.receiverId}`));

      this.currentCall.status = 'answered';
      this.stopAllSounds();
    } catch (error) {
      console.error('Error answering call:', error);
      this.callbacks.onError?.('Arama cevaplanamadı');
      throw error;
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<void> {
    if (!this.currentCall || this.currentCall.id !== callId) {
      throw new Error('Geçerli bir gelen arama bulunamadı');
    }

    try {
      await this.endCall(callId, 'rejected');
    } catch (error) {
      console.error('Error rejecting call:', error);
      this.callbacks.onError?.('Arama reddedilemedi');
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(callId: string, reason: 'ended' | 'rejected' | 'missed' = 'ended'): Promise<void> {
    if (!this.currentCall) {
      console.warn('No current call to end');
      return;
    }

    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(this.currentCall.startedAt).getTime()) / 1000);

      // Update call status for caller if available
      if (this.currentCall.callerId) {
        await set(ref(rtdb, `calls/status/${this.currentCall.callerId}`), {
          callId,
          status: reason,
          endedAt: endTime,
          duration
        });
      }

      // Update call status for receiver if available
      if (this.currentCall.receiverId) {
        await set(ref(rtdb, `calls/status/${this.currentCall.receiverId}`), {
          callId,
          status: reason,
          endedAt: endTime,
          duration
        });
      }

      // Clean up realtime database
      await remove(ref(rtdb, `calls/incoming/${this.currentCall.receiverId}`));
      await remove(ref(rtdb, `calls/outgoing/${this.currentCall.callerId}`));

      // Update Firestore record
      const callQuery = query(
        collection(db, 'calls'),
        where('id', '==', callId)
      );

      this.currentCall = null;
      this.stopAllSounds();
    } catch (error) {
      console.error('Error ending call:', error);
      this.callbacks.onError?.('Arama sonlandırılamadı');
    }
  }

  /**
   * Get current call data
   */
  getCurrentCall(): CallData | null {
    return this.currentCall;
  }

  /**
   * Play call sound (for outgoing calls)
   */
  private playCallSound() {
    if (this.callSound) {
      this.callSound.currentTime = 0;
      this.callSound.play().catch(error => {
        console.warn('Could not play call sound:', error);
      });
    }
  }

  /**
   * Play ringtone (for incoming calls)
   */
  private playRingtone() {
    if (this.ringtoneSound) {
      this.ringtoneSound.currentTime = 0;
      this.ringtoneSound.play().catch(error => {
        console.warn('Could not play ringtone:', error);
      });
    }
  }

  /**
   * Stop all sounds
   */
  private stopAllSounds() {
    if (this.callSound) {
      this.callSound.pause();
      this.callSound.currentTime = 0;
    }
    if (this.ringtoneSound) {
      this.ringtoneSound.pause();
      this.ringtoneSound.currentTime = 0;
    }
  }

  /**
   * Check if user has microphone permission
   */
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Cleanup on component unmount
   */
  cleanup() {
    this.stopListening();
    this.stopAllSounds();
    this.currentCall = null;
  }
}

// Create and export singleton instance
export const callService = new CallService();
export default callService;
