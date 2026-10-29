/**
 * Dyslexia Screening Game Battery - Audio Engine
 * Pure Web Audio API Synthesizer (Zero external audio files needed)
 * Provides tones, woodblock, clap, percussion, and musical cues.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Pleasant pentatonic frequencies (C4 to C6)
    this.frequencies = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
      987.77, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00
    ];

    // Note map for auditory memory
    this.noteMap = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00, 'C6': 1046.50
    };
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playTone(frequency, duration = 0.35, type = 'sine', volume = 0.25, startTime = null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = startTime !== null ? startTime : this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Marimba / Bell tone with gentle harmonic overtones
  playMarimbaNote(freq, duration = 0.4, volume = 0.28, startTime = null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = startTime !== null ? startTime : this.ctx.currentTime;
      // Fundamental
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(volume, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + duration);

      // Overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, now);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + duration * 0.6);
    } catch (e) {
      console.warn('Marimba sound error:', e);
    }
  }

  // Synthesized Woodblock / Tap for rhythm
  playWoodblock(freq = 780, duration = 0.1, volume = 0.3, startTime = null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = startTime !== null ? startTime : this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Woodblock error:', e);
    }
  }

  // Synthesized Clap / Snare noise for rhythm
  playClap(duration = 0.18, volume = 0.28, startTime = null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = startTime !== null ? startTime : this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn('Clap error:', e);
    }
  }

  // High Ding / Triangle bell
  playBell(freq = 1200, duration = 0.35, volume = 0.25, startTime = null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = startTime !== null ? startTime : this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Bell error:', e);
    }
  }

  // Play rhythm beat by type ('TAP', 'CLAP', 'BELL', 'BEAT')
  playRhythmBeat(beatType, startTime = null) {
    switch (beatType) {
      case 'TAP':
        this.playWoodblock(680, 0.11, 0.35, startTime);
        break;
      case 'CLAP':
        this.playClap(0.18, 0.32, startTime);
        break;
      case 'BELL':
        this.playBell(1350, 0.3, 0.25, startTime);
        break;
      case 'BEAT':
      default:
        this.playWoodblock(440, 0.14, 0.4, startTime);
        break;
    }
  }

  // Play a sequence of rhythm beats: [{ type: 'TAP', timeOffsetMs: 0 }, ...]
  playRhythmSequence(beats, onStep = null, onComplete = null) {
    if (this.isMuted) {
      const last = beats.length > 0 ? beats[beats.length - 1].timeOffsetMs : 0;
      if (onComplete) setTimeout(onComplete, last + 400);
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    beats.forEach((b, idx) => {
      setTimeout(() => {
        this.playRhythmBeat(b.type);
        if (onStep) onStep(idx, b);
      }, b.timeOffsetMs);
    });

    const lastOffset = beats.length > 0 ? beats[beats.length - 1].timeOffsetMs : 0;
    if (onComplete) {
      setTimeout(onComplete, lastOffset + 450);
    }
  }

  // Play auditory melody sequence: ['C4', 'E4', 'G4'] with gap between notes
  playMelodySequence(noteNames, noteDurationMs = 380, gapMs = 120, onStep = null, onComplete = null) {
    this.initContext();
    let currentOffset = 0;

    noteNames.forEach((note, idx) => {
      const freq = typeof note === 'number' ? note : (this.noteMap[note] || 440);
      setTimeout(() => {
        this.playMarimbaNote(freq, noteDurationMs / 1000, 0.32);
        if (onStep) onStep(idx, note);
      }, currentOffset);
      currentOffset += (noteDurationMs + gapMs);
    });

    if (onComplete) {
      setTimeout(onComplete, currentOffset + 150);
    }
  }

  // UI Sound Effects
  playTileHighlight(tileIndex) {
    const freq = this.frequencies[tileIndex % this.frequencies.length] || 440;
    this.playTone(freq, 0.45, 'triangle', 0.28);
  }

  playTileClick(tileIndex = 0) {
    const freq = this.frequencies[tileIndex % this.frequencies.length] || 440;
    this.playTone(freq, 0.22, 'sine', 0.3);
  }

  playSuccessChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.32, 'triangle', 0.25);
      }, idx * 95);
    });
  }

  playRetryCue() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playTone(349.23, 0.22, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(261.63, 0.32, 'sine', 0.2);
    }, 160);
  }

  playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 880.00, 1046.50];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.42, 'triangle', 0.28);
      }, idx * 130);
    });
  }
}

if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundEngine;
}

