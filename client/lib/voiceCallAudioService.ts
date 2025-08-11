// Voice Call Audio Effects Service
// Provides Discord-like audio feedback for voice calls

class VoiceCallAudioService {
  private audioContext: AudioContext | null = null;
  private backgroundAudio: HTMLAudioElement | null = null;
  private ringtoneAudio: HTMLAudioElement | null = null;
  private sfxEnabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio context and sounds
   */
  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createAudioElements();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  /**
   * Create audio elements for different sounds
   */
  private createAudioElements() {
    // Create ringtone audio (will be generated)
    this.ringtoneAudio = new Audio();
    this.ringtoneAudio.loop = true;
    this.ringtoneAudio.volume = this.volume;

    // Create background ambient audio (will be generated)
    this.backgroundAudio = new Audio();
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = this.volume * 0.3; // Quieter background
  }

  /**
   * Generate ringtone using Web Audio API
   */
  private generateRingtone(): string {
    if (!this.audioContext) return '';

    try {
      const sampleRate = this.audioContext.sampleRate;
      const duration = 2; // 2 seconds
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a pleasant ringtone pattern
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq1 = 523.25; // C5
        const freq2 = 659.25; // E5
        
        // Create a pattern that alternates between two notes
        const noteSwitch = Math.floor(t * 2) % 2;
        const frequency = noteSwitch === 0 ? freq1 : freq2;
        
        // Add some envelope to make it sound more natural
        const envelope = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
        const fadeIn = Math.min(t * 4, 1);
        const fadeOut = Math.min((duration - t) * 4, 1);
        
        data[i] = Math.sin(t * frequency * 2 * Math.PI) * envelope * fadeIn * fadeOut * 0.3;
      }

      // Convert buffer to blob URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = length;
      canvas.height = 1;
      
      // Create a data URL (simplified approach)
      return this.createToneDataURL(523.25, 659.25, 2);
    } catch (error) {
      console.warn('Could not generate ringtone:', error);
      return '';
    }
  }

  /**
   * Create a simple tone data URL
   */
  private createToneDataURL(frequency1: number, frequency2: number, duration: number): string {
    if (!this.audioContext) return '';

    const sampleRate = 44100;
    const length = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
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
    view.setUint32(40, length * 2, true);

    // Generate tone data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noteSwitch = Math.floor(t * 2) % 2;
      const frequency = noteSwitch === 0 ? frequency1 : frequency2;
      const sample = Math.sin(t * frequency * 2 * Math.PI) * 0.3 * 32767;
      view.setInt16(offset, sample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  /**
   * Generate background ambient sound
   */
  private generateBackgroundAmbient(): string {
    // Create a subtle ambient sound for when in call
    return this.createToneDataURL(220, 440, 10); // Lower frequencies, longer duration
  }

  /**
   * Play incoming call ringtone
   */
  startIncomingCallRingtone() {
    if (!this.sfxEnabled || !this.ringtoneAudio) return;

    try {
      const ringtoneDataURL = this.generateRingtone();
      if (ringtoneDataURL) {
        this.ringtoneAudio.src = ringtoneDataURL;
        this.ringtoneAudio.play().catch(console.warn);
      }
    } catch (error) {
      console.warn('Could not play ringtone:', error);
    }
  }

  /**
   * Stop incoming call ringtone
   */
  stopIncomingCallRingtone() {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause();
      this.ringtoneAudio.currentTime = 0;
    }
  }

  /**
   * Start background ambient sound during call
   */
  startCallAmbient() {
    if (!this.sfxEnabled || !this.backgroundAudio) return;

    try {
      const ambientDataURL = this.generateBackgroundAmbient();
      if (ambientDataURL) {
        this.backgroundAudio.src = ambientDataURL;
        this.backgroundAudio.play().catch(console.warn);
      }
    } catch (error) {
      console.warn('Could not play ambient sound:', error);
    }
  }

  /**
   * Stop background ambient sound
   */
  stopCallAmbient() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
  }

  /**
   * Play call connected sound
   */
  playCallConnectedSound() {
    this.playTone(800, 0.1); // High pitched beep
  }

  /**
   * Play call ended sound
   */
  playCallEndedSound() {
    this.playTone(400, 0.2); // Lower pitched beep
  }

  /**
   * Play mute/unmute sound
   */
  playMuteToggleSound(isMuted: boolean) {
    const frequency = isMuted ? 300 : 500; // Lower for mute, higher for unmute
    this.playTone(frequency, 0.1);
  }

  /**
   * Play a simple tone
   */
  private playTone(frequency: number, duration: number) {
    if (!this.sfxEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Could not play tone:', error);
    }
  }

  /**
   * Set volume for all audio
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.ringtoneAudio) {
      this.ringtoneAudio.volume = this.volume;
    }
    
    if (this.backgroundAudio) {
      this.backgroundAudio.volume = this.volume * 0.3;
    }
  }

  /**
   * Enable/disable sound effects
   */
  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    
    if (!enabled) {
      this.stopIncomingCallRingtone();
      this.stopCallAmbient();
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      sfxEnabled: this.sfxEnabled,
      volume: this.volume
    };
  }

  /**
   * Clean up audio resources
   */
  dispose() {
    this.stopIncomingCallRingtone();
    this.stopCallAmbient();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const voiceCallAudioService = new VoiceCallAudioService();

export default voiceCallAudioService;
