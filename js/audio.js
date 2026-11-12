/**
 * CROWN & BLIGHT: THE ROYAL SIEGE (AAA Spatial & Citadel Hall Web Audio Engine)
 * Zero external audio assets required:
 * - DynamicsCompressor + Procedural Citadel Hall Convolver Reverb
 * - Separate Master / SFX / Music Gain Buses with live sliders
 * - Column-based Stereo Panning across the 10x5 Chessboard
 * - 16-Step Dynamic Baroque Harpsichord, Cello & Timpani Soundtrack
 */

class RoyalAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.reverbNode = null;
    this.reverbSend = null;
    this.compressor = null;

    this.muted = localStorage.getItem('royal_gambit_muted') === '1';
    this.musicEnabled = true;
    this.sfxVolume = Number(localStorage.getItem('royal_gambit_sfx_vol') ?? 0.72);
    this.musicVolume = Number(localStorage.getItem('royal_gambit_music_vol') ?? 0.30);

    this.musicTimer = null;
    this.musicStep = 0;
    this.isIntenseWave = false;
    this.actToneShift = 0; // Semitone transposition per Act for musical variety
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -16;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 6;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.2;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.92;

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVolume;

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVolume;

        // Synthesize warm 1.35s Citadel Hall impulse response
        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.buildCitadelImpulse(1.35, 2.4);
        this.reverbSend = this.ctx.createGain();
        this.reverbSend.gain.value = 0.26;

        this.sfxGain.connect(this.compressor);
        this.sfxGain.connect(this.reverbSend);
        this.musicGain.connect(this.compressor);
        this.musicGain.connect(this.reverbSend);

        this.reverbSend.connect(this.reverbNode);
        this.reverbNode.connect(this.compressor);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  buildCitadelImpulse(duration = 1.35, decay = 2.4) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(val)));
    localStorage.setItem('royal_gambit_sfx_vol', String(this.sfxVolume));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.03);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, Number(val)));
    localStorage.setItem('royal_gambit_music_vol', String(this.musicVolume));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.03);
    }
  }

  setActMood(actIdx) {
    const shifts = [0, -2, 2, -5, 3];
    this.actToneShift = shifts[actIdx % shifts.length] || 0;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('royal_gambit_muted', this.muted ? '1' : '0');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.92, this.ctx.currentTime, 0.04);
    }
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

  routeToBus(node, pan = 0, bus = 'sfx') {
    const targetBus = bus === 'music' ? this.musicGain : this.sfxGain;
    if (!targetBus) return;
    if (typeof this.ctx.createStereoPanner === 'function' && Math.abs(pan) > 0.02) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = Math.max(-0.85, Math.min(0.85, pan));
      node.connect(panner);
      panner.connect(targetBus);
    } else {
      node.connect(targetBus);
    }
  }

  playTone({
    freq = 440,
    endFreq = null,
    type = 'triangle',
    duration = 0.18,
    gain = 0.25,
    delay = 0,
    attack = 0.01,
    detune = 0,
    pan = 0
  }) {
    if (this.muted || this.sfxVolume <= 0.01) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (detune) osc.detune.setValueAtTime(detune, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    const peak = Math.min(0.95, gain);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(g);
    this.routeToBus(g, pan, 'sfx');

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  playNoise({
    duration = 0.15,
    filterFreq = 900,
    filterType = 'bandpass',
    gain = 0.25,
    delay = 0,
    pan = 0
  }) {
    if (this.muted || this.sfxVolume <= 0.01) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.42));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(g);
    this.routeToBus(g, pan, 'sfx');

    noise.start(now);
    noise.stop(now + duration + 0.03);
  }

  panFromCol(col = 5) {
    return ((col - 4.5) / 5) * 0.68;
  }

  playUiClick() {
    this.playTone({ freq: 540, endFreq: 720, type: 'sine', duration: 0.06, gain: 0.12 });
  }

  playMarbleSlam(weight = 1.0, pan = 0) {
    if (this.muted || this.sfxVolume <= 0.01) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    // Sharp ivory-on-slate contact click + deep stone table body resonance
    const clickFreq = Math.max(680, 1480 - weight * 360);
    const bodyFreq = Math.max(62, 165 - weight * 48);
    this.playNoise({ duration: 0.045, filterFreq: clickFreq, filterType: 'bandpass', gain: 0.36, pan });
    this.playNoise({ duration: 0.12 + weight * 0.05, filterFreq: 240, filterType: 'lowpass', gain: 0.28 * weight, delay: 0.008, pan });
    this.playTone({ freq: bodyFreq * 1.45, endFreq: bodyFreq, type: 'sine', duration: 0.14 + weight * 0.04, gain: 0.26, attack: 0.004, pan });
  }

  playPlacePiece(pieceType = 'pawn', col = 4) {
    const pan = this.panFromCol(col);
    const weightMap = { chalice: 0.75, pawn: 0.85, bishop: 1.0, knight: 1.15, queen: 1.3, king: 1.45, rook: 1.65 };
    this.playMarbleSlam(weightMap[pieceType] || 1.0, pan);

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
        duration: 0.2,
        gain: 0.15,
        delay: 0.02 + idx * 0.04,
        pan
      });
    });
  }

  playChessMove(isKnight = false, col = 4) {
    const pan = this.panFromCol(col);
    if (isKnight) {
      this.playTone({ freq: 220, endFreq: 660, type: 'sawtooth', duration: 0.13, gain: 0.18, pan });
      this.playMarbleSlam(1.45, pan);
      this.playTone({ freq: 587.33, endFreq: 196, type: 'triangle', duration: 0.24, gain: 0.24, delay: 0.09, pan });
    } else {
      // Stone scrape + crisp snap onto target tile
      this.playNoise({ duration: 0.09, filterFreq: 920, filterType: 'bandpass', gain: 0.22, pan });
      this.playMarbleSlam(1.05, pan);
      this.playTone({ freq: 293.66, endFreq: 440, type: 'sine', duration: 0.14, gain: 0.15, delay: 0.04, pan });
    }
  }

  playManaCollect() {
    this.playTone({ freq: 587.33, type: 'sine', duration: 0.13, gain: 0.2, delay: 0 });
    this.playTone({ freq: 880.0, type: 'triangle', duration: 0.2, gain: 0.22, delay: 0.05 });
    this.playTone({ freq: 1174.66, type: 'sine', duration: 0.26, gain: 0.16, delay: 0.09 });
  }

  playAttack(pieceType, col = 4) {
    const pan = this.panFromCol(col);
    switch (pieceType) {
      case 'pawn':
        this.playNoise({ duration: 0.08, filterFreq: 520, filterType: 'lowpass', gain: 0.2, pan });
        this.playTone({ freq: 380, endFreq: 165, type: 'triangle', duration: 0.1, gain: 0.16, pan });
        break;
      case 'rook':
        this.playNoise({ duration: 0.15, filterFreq: 420, filterType: 'lowpass', gain: 0.26, pan });
        this.playTone({ freq: 165, endFreq: 75, type: 'sawtooth', duration: 0.19, gain: 0.21, pan });
        break;
      case 'knight':
        this.playTone({ freq: 920, endFreq: 280, type: 'sawtooth', duration: 0.13, gain: 0.16, pan });
        this.playNoise({ duration: 0.09, filterFreq: 2400, filterType: 'highpass', gain: 0.15, pan });
        break;
      case 'bishop':
        this.playTone({ freq: 659.25, endFreq: 987.77, type: 'sine', duration: 0.16, gain: 0.15, pan });
        this.playTone({ freq: 1318.5, endFreq: 880, type: 'triangle', duration: 0.16, gain: 0.1, delay: 0.03, pan });
        break;
      case 'queen':
        this.playTone({ freq: 440, endFreq: 880, type: 'sawtooth', duration: 0.16, gain: 0.15, pan });
        this.playTone({ freq: 659.25, endFreq: 1318.5, type: 'triangle', duration: 0.22, gain: 0.17, delay: 0.025, pan });
        break;
      case 'king':
        this.playTone({ freq: 261.63, endFreq: 523.25, type: 'triangle', duration: 0.2, gain: 0.18, pan });
        break;
      default:
        this.playTone({ freq: 440, endFreq: 220, type: 'sine', duration: 0.08, gain: 0.12, pan });
    }
  }

  playHit(armored = false, col = 6) {
    const pan = this.panFromCol(col);
    if (armored) {
      this.playTone({ freq: 860, endFreq: 390, type: 'square', duration: 0.06, gain: 0.11, pan });
    } else {
      this.playNoise({ duration: 0.055, filterFreq: 720, filterType: 'bandpass', gain: 0.12, pan });
    }
  }

  playShieldBreak(col = 6) {
    const pan = this.panFromCol(col);
    this.playNoise({ duration: 0.14, filterFreq: 2200, filterType: 'highpass', gain: 0.28, pan });
    this.playTone({ freq: 1240, endFreq: 320, type: 'triangle', duration: 0.18, gain: 0.2, pan });
  }

  playEnemyShatter(isBoss = false, col = 6) {
    const pan = this.panFromCol(col);
    this.playNoise({
      duration: isBoss ? 0.45 : 0.16,
      filterFreq: isBoss ? 450 : 1450,
      filterType: isBoss ? 'lowpass' : 'bandpass',
      gain: isBoss ? 0.42 : 0.24,
      pan
    });
    // Crystalline obsidian stone-piece clatter partials
    const shards = isBoss ? [740, 580, 410, 260] : [920, 640];
    shards.forEach((f, i) => {
      this.playTone({
        freq: f,
        endFreq: f * 0.55,
        type: 'triangle',
        duration: 0.07,
        gain: 0.12,
        delay: i * 0.035,
        pan
      });
    });
    if (isBoss) {
      this.playTone({ freq: 130.81, endFreq: 48, type: 'sawtooth', duration: 0.55, gain: 0.34, pan });
    }
  }

  playAchievement() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      this.playTone({ freq, type: 'triangle', duration: 0.36, gain: 0.2, delay: i * 0.06 });
    });
  }

  playDecreePick() {
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((freq, i) => {
      this.playTone({ freq, type: 'triangle', duration: 0.34, gain: 0.22, delay: i * 0.055 });
    });
  }

  playPromotion() {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      this.playTone({ freq, type: 'triangle', duration: 0.42, gain: 0.26, delay: i * 0.07 });
      this.playTone({ freq: freq * 1.5, type: 'sine', duration: 0.35, gain: 0.14, delay: i * 0.07 + 0.03 });
    });
  }

  playCastling() {
    const notes = [196.0, 293.66, 392.0, 587.33];
    notes.forEach((freq, i) => {
      this.playTone({ freq, type: 'sawtooth', duration: 0.35, gain: 0.2, delay: i * 0.06 });
    });
    this.playNoise({ duration: 0.25, filterFreq: 500, filterType: 'lowpass', gain: 0.28 });
  }

  playUltimate() {
    this.playNoise({ duration: 0.45, filterFreq: 380, filterType: 'lowpass', gain: 0.44 });
    const fanfare = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, idx) => {
      this.playTone({ freq, type: 'sawtooth', duration: 0.45, gain: 0.21, delay: idx * 0.045 });
    });
  }

  playChariotCharge() {
    this.playNoise({ duration: 0.4, filterFreq: 480, filterType: 'lowpass', gain: 0.38 });
    this.playTone({ freq: 146.83, endFreq: 440, type: 'sawtooth', duration: 0.45, gain: 0.27 });
  }

  playWaveHorn() {
    this.playTone({ freq: 146.83, endFreq: 138.59, type: 'sawtooth', duration: 0.85, gain: 0.3, attack: 0.08 });
    this.playTone({ freq: 220.0, endFreq: 207.65, type: 'triangle', duration: 0.85, gain: 0.24, delay: 0.05, attack: 0.08 });
  }

  playVictory() {
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66];
    notes.forEach((f, i) => {
      this.playTone({ freq: f, type: 'triangle', duration: 0.45, gain: 0.25, delay: i * 0.08 });
    });
  }

  playDefeat() {
    const notes = [329.63, 311.13, 293.66, 261.63, 196.0];
    notes.forEach((f, i) => {
      this.playTone({ freq: f, type: 'sawtooth', duration: 0.42, gain: 0.22, delay: i * 0.12 });
    });
  }

  // 64-Step Symphonic Baroque-to-Siege Score with Web Audio currentTime Lookahead Scheduling
  startMusic() {
    if (this.muted || !this.musicEnabled) return;
    this.init();
    if (!this.ctx || this.musicTimer) return;

    // 4-Bar (64-step) Baroque & Royal Citadel Progression (~18.6s cycle, zero loop fatigue)
    const bass64 = [
      // Movement A: D minor Royal Prelude
      146.83, 146.83, 220.0, 146.83, 116.54, 116.54, 174.61, 116.54,
      130.81, 130.81, 196.0, 130.81, 110.0, 138.59, 164.81, 110.0,
      // Movement B: Descending Lament (Gm -> Dm -> A7 -> Dm)
      196.0, 196.0, 146.83, 196.0, 146.83, 146.83, 220.0, 146.83,
      110.0, 110.0, 164.81, 138.59, 146.83, 220.0, 146.83, 146.83,
      // Movement C: Royal Ascent (F -> C -> Bb -> A7)
      174.61, 174.61, 261.63, 174.61, 130.81, 130.81, 196.0, 130.81,
      116.54, 146.83, 174.61, 116.54, 110.0, 138.59, 164.81, 220.0,
      // Movement D: Grandmaster Cadence
      146.83, 220.0, 293.66, 220.0, 155.56, 196.0, 233.08, 196.0,
      110.0, 164.81, 220.0, 138.59, 146.83, 110.0, 73.42, 146.83
    ];

    const melodyCalm64 = [
      293.66, 349.23, 440.0, 587.33, 466.16, 440.0, 349.23, 293.66,
      392.0, 440.0, 523.25, 392.0, 329.63, 349.23, 440.0, 329.63,
      392.0, 466.16, 587.33, 523.25, 440.0, 349.23, 440.0, 587.33,
      554.37, 440.0, 329.63, 440.0, 293.66, 349.23, 440.0, 293.66,
      523.25, 587.33, 698.46, 523.25, 392.0, 523.25, 659.25, 523.25,
      466.16, 587.33, 523.25, 440.0, 329.63, 440.0, 554.37, 659.25,
      587.33, 523.25, 466.16, 440.0, 392.0, 466.16, 392.0, 349.23,
      329.63, 440.0, 554.37, 440.0, 293.66, 0, 220.0, 293.66
    ];

    const melodyIntense64 = [
      587.33, 698.46, 880.0, 587.33, 466.16, 698.46, 880.0, 698.46,
      523.25, 659.25, 783.99, 523.25, 554.37, 659.25, 880.0, 554.37,
      783.99, 698.46, 587.33, 783.99, 587.33, 698.46, 880.0, 1174.66,
      830.61, 659.25, 554.37, 880.0, 587.33, 440.0, 587.33, 880.0,
      698.46, 880.0, 1046.5, 880.0, 659.25, 783.99, 1046.5, 783.99,
      587.33, 698.46, 932.33, 698.46, 554.37, 659.25, 880.0, 1108.73,
      1174.66, 880.0, 698.46, 587.33, 622.25, 698.46, 932.33, 698.46,
      659.25, 880.0, 1108.73, 880.0, 587.33, 440.0, 293.66, 587.33
    ];

    const stepDur = 0.29;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.musicTimer = setInterval(() => {
      if (this.muted || !this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      if (this.musicVolume <= 0.01) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        return;
      }

      if (this.nextNoteTime < this.ctx.currentTime - 0.3) {
        this.nextNoteTime = this.ctx.currentTime + 0.02;
      }

      while (this.nextNoteTime < this.ctx.currentTime + 0.15) {
        const step = this.musicStep % 64;
        const mult = Math.pow(2, this.actToneShift / 12);
        const bassFreq = bass64[step] * mult;
        const rawMel = this.isIntenseWave ? melodyIntense64[step] : melodyCalm64[step];
        const melodyFreq = rawMel * mult;
        const t = this.nextNoteTime;

        if (step % 2 === 0) {
          this.scheduleMusicNote(t, bassFreq, 'triangle', 0.46, 0.44, step % 4 === 0 ? -0.18 : 0.18);
        }
        if (step % 4 === 0 || (this.isIntenseWave && step % 2 === 0)) {
          this.scheduleTimpani(t, bassFreq * 0.5, this.isIntenseWave ? 0.32 : 0.16);
        }
        if (melodyFreq > 20) {
          this.scheduleMusicNote(t, melodyFreq, 'sine', 0.24, 0.34, ((step % 4) - 1.5) * 0.24);
          // Warm Harpsichord Harmonic Overtone
          this.scheduleMusicNote(t, melodyFreq * 2, 'triangle', 0.09, 0.08, ((step % 4) - 1.5) * -0.2);
        }
        // Orchestral Brass / Pad Fifth on Bar Downbeats during Intense/Boss Waves
        if (this.isIntenseWave && step % 8 === 0) {
          this.scheduleMusicNote(t, bassFreq * 1.5, 'sawtooth', 1.6, 0.12, -0.35);
          this.scheduleMusicNote(t, bassFreq * 2.0, 'triangle', 1.6, 0.14, 0.35);
        }

        this.nextNoteTime += stepDur;
        this.musicStep++;
      }
    }, 65);
  }

  scheduleTimpani(when, freq, gainVal) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.max(45, freq * 1.4), when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(36, freq), when + 0.18);

    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gainVal, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.24);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(when);
    osc.stop(when + 0.26);
  }

  scheduleMusicNote(when, freq, type, duration, gainVal, pan = 0) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gainVal, when + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(g);
    this.routeToBus(g, pan, 'music');
    osc.start(when);
    osc.stop(when + duration + 0.03);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

window.RoyalAudio = new RoyalAudioEngine();
