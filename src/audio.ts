// Pure Web Audio API Cyber Synthesizer
let audioCtx: AudioContext | null = null;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export class CyberAudioEngine {
  private static sfxVolume = 0.6;
  private static ambientVolume = 0.25;
  private static isMuted = false;
  private static isAmbientPlaying = false;

  static setVolumes(sfx: number, ambient: number, muted: boolean) {
    this.sfxVolume = sfx;
    this.ambientVolume = ambient;
    this.isMuted = muted;

    if (ambientGain && audioCtx) {
      const targetGain = this.isMuted ? 0 : this.ambientVolume * 0.15;
      ambientGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);
    }
  }

  // Click & Servo Rotate Sound
  static playRotate() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-tech crisp click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);

      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  static playClick() {
    this.playRotate();
  }

  // Energy Connection Hum
  static playPowerConnect() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // Level Win Cyber Fanfare / Power Surge
  static playLevelWin() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Futuristic ascending chord: C5, E5, G5, B5, C6 (Major 7th synth)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const startTime = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, startTime);
        filter.Q.value = 3;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.45, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });

      // Sub-bass thump
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      subGain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.65);
    } catch (e) {}
  }

  // Streak Multiplier SFX
  static playStreak() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  // Toggle or start Cyber Ambient Drone
  static toggleAmbient(enabled: boolean) {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!enabled || this.isMuted) {
      if (ambientGain) {
        ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      this.isAmbientPlaying = false;
      return;
    }

    if (this.isAmbientPlaying && ambientGain) {
      ambientGain.gain.setTargetAtTime(this.ambientVolume * 0.12, ctx.currentTime, 0.2);
      return;
    }

    try {
      const now = ctx.currentTime;
      ambientOsc1 = ctx.createOscillator();
      ambientOsc2 = ctx.createOscillator();
      ambientGain = ctx.createGain();

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      ambientOsc1.type = 'sawtooth';
      ambientOsc1.frequency.setValueAtTime(55, now); // A1 note 55Hz

      ambientOsc2.type = 'sine';
      ambientOsc2.frequency.setValueAtTime(55.6, now); // slight detune for cyber chorusing

      ambientGain.gain.setValueAtTime(0.001, now);
      ambientGain.gain.exponentialRampToValueAtTime(this.ambientVolume * 0.12, now + 2);

      ambientOsc1.connect(filter);
      ambientOsc2.connect(filter);
      filter.connect(ambientGain);
      ambientGain.connect(ctx.destination);

      ambientOsc1.start();
      ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {}
  }
}
