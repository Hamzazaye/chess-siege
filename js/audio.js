/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT
 * Procedural Web Audio API Synthesizer & Adaptive Dark-Royal Soundtrack Engine
 * Zero external asset dependencies — 100% crisp, synthesized AAA tactical audio.
 */

class RoyalAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicEnabled = true;
    this.sfxVolume = 0.65;
    this.musicVolume = 0.24;
    this.musicTimer = null;
    this.musicStep = 0;
    this.isIntenseWave = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    } else if (this.musicEnabled) {
      this.startMusic();
    }
    return this.muted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (!this.muted) {
      this.startMusic();
    }
    return this.musicEnabled;
  }

  setIntenseMode(intense) {
    this.isIntenseWave = Boolean(intense);
  }

  // Helper for synthesized tone with envelope
  playTone({
    freq = 440,
    endFreq = null,
    type = 'triangle',
    duration = 0.18,
    gain = 0.25,
    delay = 0,
    attack = 0.01,
    detune = 0
  }) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (detune) osc.detune.setValueAtTime(detune, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    const peak = Math.min(1, gain * this.sfxVolume);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(g);
    g.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // Helper for filtered noise bursts (impacts, stone slides, explosions)
  playNoise({ duration = 0.15, filterFreq = 900, filterType = 'bandpass', gain = 0.25, delay = 0 }) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain * this.sfxVolume, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  // Heavy Marble Chess Piece Placement Clack + Sanctified Resonance
  playPlacePiece(pieceType = 'pawn') {
    this.playNoise({ duration: 0.08, filterFreq: 1400, filterType: 'bandpass', gain: 0.35 });
    const pitchMap = {
      chalice: [523.25, 659.25, 783.99],
      pawn: [329.63, 440.0],
      rook: [196.0, 293.66],
      knight: [392.0, 587.33],
      bishop: [440.0, 554.37, 659.25],
      king: [261.63, 329.63, 392.0, 523.25],
      queen: [329.63, 493.88, 659.25, 987.77]
    };
    const notes = pitchMap[pieceType] || [330, 440];
    notes.forEach((f, idx) => {
      this.playTone({
        freq: f,
        type: 'triangle',
        duration: 0.22,
        gain: 0.2,
        delay: idx * 0.045
      });
    });
  }

  // Tactical Chess Move Slide / Leap
  playChessMove(isKnight = false) {
    if (isKnight) {
      // Thunderous Knight L-Leap
      this.playTone({ freq: 220, endFreq: 660, type: 'sawtooth', duration: 0.14, gain: 0.22 });
      this.playTone({ freq: 587.33, endFreq: 196, type: 'triangle', duration: 0.24, gain: 0.28, delay: 0.1 });
      this.playNoise({ duration: 0.22, filterFreq: 650, filterType: 'lowpass', gain: 0.38, delay: 0.1 });
    } else {
      // Marble slide across board
      this.playNoise({ duration: 0.14, filterFreq: 1100, filterType: 'bandpass', gain: 0.25 });
      this.playTone({ freq: 293.66, endFreq: 440, type: 'sine', duration: 0.16, gain: 0.2, delay: 0.03 });
    }
  }

  // Collect Sovereign Mana (Sun)
  playManaCollect() {
    this.playTone({ freq: 587.33, type: 'sine', duration: 0.14, gain: 0.22, delay: 0 });
    this.playTone({ freq: 880.0, type: 'triangle', duration: 0.22, gain: 0.24, delay: 0.05 });
    this.playTone({ freq: 1174.66, type: 'sine', duration: 0.28, gain: 0.18, delay: 0.1 });
  }

  // Attack SFX per Chess Piece
  playAttack(pieceType) {
    switch (pieceType) {
      case 'pawn':
        this.playTone({ freq: 520, endFreq: 210, type: 'triangle', duration: 0.09, gain: 0.14 });
        break;
      case 'rook':
        this.playNoise({ duration: 0.14, filterFreq: 420, filterType: 'lowpass', gain: 0.26 });
        this.playTone({ freq: 165, endFreq: 75, type: 'sawtooth', duration: 0.18, gain: 0.2 });
        break;
      case 'knight':
        this.playTone({ freq: 920, endFreq: 280, type: 'sawtooth', duration: 0.12, gain: 0.16 });
        this.playNoise({ duration: 0.09, filterFreq: 2400, filterType: 'highpass', gain: 0.15 });
        break;
      case 'bishop':
        this.playTone({ freq: 659.25, endFreq: 987.77, type: 'sine', duration: 0.16, gain: 0.15 });
        this.playTone({ freq: 1318.5, endFreq: 880, type: 'triangle', duration: 0.16, gain: 0.1, delay: 0.03 });
        break;
      case 'queen':
        this.playTone({ freq: 440, endFreq: 880, type: 'sawtooth', duration: 0.16, gain: 0.16 });
        this.playTone({ freq: 659.25, endFreq: 1318.5, type: 'triangle', duration: 0.2, gain: 0.16, delay: 0.03 });
        break;
      case 'king':
        this.playTone({ freq: 261.63, endFreq: 523.25, type: 'triangle', duration: 0.2, gain: 0.18 });
        break;
      default:
        this.playTone({ freq: 440, endFreq: 220, type: 'sine', duration: 0.08, gain: 0.12 });
    }
  }

  // Hit & Shield Clank
  playHit(armored = false) {
    if (armored) {
      this.playTone({ freq: 880, endFreq: 420, type: 'square', duration: 0.07, gain: 0.14 });
    } else {
      this.playNoise({ duration: 0.06, filterFreq: 700, filterType: 'bandpass', gain: 0.14 });
    }
  }

  // Pawn Promotion Coronation Fanfare!
  playPromotion() {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      this.playTone({
        freq,
        type: 'triangle',
        duration: 0.42,
        gain: 0.28,
        delay: i * 0.07
      });
      this.playTone({
        freq: freq * 1.5,
        type: 'sine',
        duration: 0.35,
        gain: 0.14,
        delay: i * 0.07 + 0.03
      });
    });
  }

  // Castling Bastion Horn
  playCastling() {
    const notes = [196.0, 293.66, 392.0, 587.33];
    notes.forEach((freq, i) => {
      this.playTone({
        freq,
        type: 'sawtooth',
        duration: 0.35,
        gain: 0.22,
        delay: i * 0.06
      });
    });
    this.playNoise({ duration: 0.25, filterFreq: 500, filterType: 'lowpass', gain: 0.3 });
  }

  // Checkmate Overload Ultimate
  playUltimate() {
    this.playNoise({ duration: 0.45, filterFreq: 380, filterType: 'lowpass', gain: 0.45 });
    const fanfare = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, idx) => {
      this.playTone({
        freq,
        type: 'sawtooth',
        duration: 0.45,
        gain: 0.22,
        delay: idx * 0.045
      });
    });
  }

  // Royal Chariot (Lawnmower) Activation
  playChariotCharge() {
    this.playNoise({ duration: 0.4, filterFreq: 480, filterType: 'lowpass', gain: 0.4 });
    this.playTone({ freq: 146.83, endFreq: 440, type: 'sawtooth', duration: 0.45, gain: 0.28 });
  }

  // Huge Wave Warhorn
  playWaveHorn() {
    this.playTone({ freq: 146.83, endFreq: 138.59, type: 'sawtooth', duration: 0.85, gain: 0.32, attack: 0.08 });
    this.playTone({ freq: 220.0, endFreq: 207.65, type: 'triangle', duration: 0.85, gain: 0.26, delay: 0.05, attack: 0.08 });
  }

  // Victory / Defeat stingers
  playVictory() {
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66];
    notes.forEach((f, i) => {
      this.playTone({ freq: f, type: 'triangle', duration: 0.45, gain: 0.26, delay: i * 0.08 });
    });
  }

  playDefeat() {
    const notes = [329.63, 311.13, 293.66, 261.63, 196.0];
    notes.forEach((f, i) => {
      this.playTone({ freq: f, type: 'sawtooth', duration: 0.42, gain: 0.24, delay: i * 0.12 });
    });
  }

  // Procedural Dark-Royal Harpsichord & Bass Ostinato Loop
  startMusic() {
    if (this.muted || !this.musicEnabled) return;
    this.init();
    if (!this.ctx || this.musicTimer) return;

    // D minor royal baroque tactical progression
    const bassLine = [146.83, 146.83, 130.81, 130.81, 116.54, 116.54, 110.0, 138.59];
    const arpCalm = [293.66, 349.23, 440.0, 587.33, 440.0, 349.23, 329.63, 440.0];
    const arpIntense = [440.0, 587.33, 698.46, 880.0, 659.25, 587.33, 554.37, 659.25];

    this.musicTimer = setInterval(() => {
      if (this.muted || !this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;

      const step = this.musicStep % 8;
      const bassFreq = bassLine[step];
      const melodyFreq = this.isIntenseWave ? arpIntense[step] : arpCalm[step];

      // Deep Cello Bass Pulse on even steps
      if (step % 2 === 0) {
        this.playMusicNote(bassFreq, 'triangle', 0.42, this.musicVolume * 0.9);
      }

      // Harpsichord pluck
      this.playMusicNote(melodyFreq, 'sine', 0.24, this.musicVolume * 0.65);
      if (this.isIntenseWave && step % 2 === 1) {
        this.playMusicNote(melodyFreq * 0.5, 'sawtooth', 0.18, this.musicVolume * 0.4);
      }

      this.musicStep++;
    }, 320);
  }

  playMusicNote(freq, type, duration, gainVal) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

window.RoyalAudio = new RoyalAudioEngine();
