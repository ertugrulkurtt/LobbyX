// WebRTC Voice Chat Service for basic peer-to-peer voice communication
import { createVoiceCallNotification, createCallEndedNotification } from './voiceCallNotificationService';
import voiceCallAudioService from './voiceCallAudioService';

export interface VoiceCallState {
  isInCall: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isConnecting: boolean;
  remoteUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  callStartTime?: Date;
  error?: string;
}

export interface VoiceCallEvents {
  onCallStarted: (userId: string) => void;
  onCallEnded: () => void;
  onCallReceived: (from: { id: string; name: string; avatar?: string }) => void;
  onCallAccepted: () => void;
  onCallRejected: () => void;
  onError: (error: string) => void;
  onRemoteStreamReceived: (stream: MediaStream) => void;
}

class VoiceChatService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private events: Partial<VoiceCallEvents> = {};
  private state: VoiceCallState = {
    isInCall: false,
    isMuted: false,
    isDeafened: false,
    isConnecting: false
  };

  // STUN server configuration for NAT traversal
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  /**
   * Initialize voice chat service with event listeners
   */
  initialize(events: Partial<VoiceCallEvents>) {
    this.events = events;
  }

  /**
   * Get current microphone permission status
   */
  async getMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Start a voice call
   */
  async startCall(targetUser: { id: string; name: string; avatar?: string }): Promise<void> {
    try {
      this.state.isConnecting = true;
      this.state.remoteUser = targetUser;
      
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create peer connection
      this.createPeerConnection();

      // Add local stream
      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // In a real implementation, you would send this offer to the target user
      // For demo purposes, we'll simulate a successful connection
      setTimeout(() => {
        this.simulateCallAccepted();
      }, 2000);

      this.events.onCallStarted?.(targetUser.id);
    } catch (error: any) {
      this.handleError(`Arama başlatılamadı: ${error.message}`);
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(): Promise<void> {
    try {
      this.state.isConnecting = true;

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create peer connection
      this.createPeerConnection();

      // Add local stream
      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Simulate answering the call
      setTimeout(() => {
        this.simulateCallAccepted();
      }, 1000);

    } catch (error: any) {
      this.handleError(`Arama cevaplanamadı: ${error.message}`);
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    try {
      // Stop audio effects
      voiceCallAudioService.stopIncomingCallRingtone();
      voiceCallAudioService.stopCallAmbient();
      voiceCallAudioService.playCallEndedSound();

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Stop remote stream
      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach(track => track.stop());
        this.remoteStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Reset state
      this.state = {
        isInCall: false,
        isMuted: false,
        isDeafened: false,
        isConnecting: false
      };

      this.events.onCallEnded?.();
    } catch (error: any) {
      console.error('Error ending call:', error);
    }
  }

  /**
   * Toggle microphone mute
   */
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.state.isMuted = !audioTrack.enabled;
      }
    }
    return this.state.isMuted;
  }

  /**
   * Toggle audio output (deafen)
   */
  toggleDeafen(): boolean {
    this.state.isDeafened = !this.state.isDeafened;
    
    // In a real implementation, you would mute the remote audio
    if (this.remoteStream) {
      const audioTracks = this.remoteStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !this.state.isDeafened;
      });
    }
    
    // If deafened, also mute microphone
    if (this.state.isDeafened && !this.state.isMuted) {
      this.toggleMute();
    }
    
    return this.state.isDeafened;
  }

  /**
   * Get current call state
   */
  getState(): VoiceCallState {
    return { ...this.state };
  }

  /**
   * Simulate receiving a call (for demo purposes)
   */
  simulateIncomingCall(from: { id: string; name: string; avatar?: string }): void {
    this.state.remoteUser = from;

    // Start ringtone
    voiceCallAudioService.startIncomingCallRingtone();

    this.events.onCallReceived?.(from);
  }

  /**
   * Create WebRTC peer connection
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.events.onRemoteStreamReceived?.(this.remoteStream);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.state.isConnecting = false;
        this.state.isInCall = true;
        this.state.callStartTime = new Date();
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };

    // Handle ICE candidates (in real implementation, these would be exchanged via signaling server)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to remote peer
        console.log('ICE candidate:', event.candidate);
      }
    };
  }

  /**
   * Simulate call being accepted (for demo purposes)
   */
  private simulateCallAccepted(): void {
    this.state.isConnecting = false;
    this.state.isInCall = true;
    this.state.callStartTime = new Date();
    
    // Create fake remote stream for demo
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.1; // Low volume
    oscillator.frequency.value = 0; // Silence
    
    this.events.onCallAccepted?.();
  }

  /**
   * Handle errors
   */
  private handleError(error: string): void {
    this.state.error = error;
    this.state.isConnecting = false;
    this.events.onError?.(error);
    console.error('Voice chat error:', error);
  }
}

// Export singleton instance
export const voiceChatService = new VoiceChatService();

export default voiceChatService;
