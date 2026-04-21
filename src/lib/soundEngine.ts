/**
 * Web Audio API alapú hang- és zene motor
 * Külső hangfájlok nélkül, procedurálisan generált hangok
 */

// Am -> F -> C -> Em chord progression frequencies
const CHORDS: number[][] = [
  [110.0, 130.81, 164.81, 220.0],  // Am
  [87.31, 110.0,  130.81, 174.61], // F
  [65.41, 82.41,  98.0,   130.81], // C
  [82.41, 98.0,   123.47, 164.81], // Em
];

// A minor pentatonic melody notes
const MELODY: number[] = [220, 246.94, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

const BEAT_MS = 2400; // ~25 BPM per chord, slow & ominous

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private chordIndex = 0;
  private beatCount = 0;
  private _musicEnabled = true;
  private _sfxEnabled = true;
  private initialized = false;

  /** Must be called inside a user gesture */
  async init() {
    if (this.initialized) { await this.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.55;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.3;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  async resume() {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  get musicEnabled() { return this._musicEnabled; }
  get sfxEnabled() { return this._sfxEnabled; }

  toggleMusic() {
    this._musicEnabled = !this._musicEnabled;
    if (!this._musicEnabled) this.stopMusic();
    else this.startMusic();
    return this._musicEnabled;
  }

  toggleSfx() {
    this._sfxEnabled = !this._sfxEnabled;
    return this._sfxEnabled;
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private osc(freq: number, type: OscillatorType, gainVal: number, dur: number, t0?: number) {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gainVal;
    o.connect(g); g.connect(out);
    const t = t0 ?? ctx.currentTime;
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, filterHz: number, gainVal: number) {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = filterHz; flt.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = gainVal;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(flt); flt.connect(g); g.connect(out);
    src.start();
  }

  // ─── SOUND EFFECTS ─────────────────────────────────────────────────────────

  playButtonClick() {
    this.osc(900, 'sine', 0.12, 0.07);
    this.osc(1400, 'sine', 0.05, 0.04);
  }

  playCardAttack() {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(380, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.22);
    g.gain.setValueAtTime(0.28, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.28);
    this.noise(0.1, 2200, 0.18);
  }

  playCardSkill() {
    this.osc(320, 'triangle', 0.18, 0.28);
    this.osc(480, 'triangle', 0.09, 0.2);
    this.noise(0.12, 900, 0.1);
  }

  playCardPower() {
    [55, 82, 110].forEach((f, i) => this.osc(f, 'sine', 0.28 - i * 0.07, 0.55 + i * 0.1, (this.ctx?.currentTime ?? 0) + i * 0.06));
  }

  playCardHex() {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.9);
    f.type = 'lowpass'; f.frequency.value = 500;
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    o.connect(f); f.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.95);
  }

  playDamage(amount = 10) {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const intensity = Math.min(amount / 30, 1);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(160 + intensity * 60, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.1 + intensity * 0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.25);
    this.noise(0.08, 350 + intensity * 200, 0.14);
  }

  playBlock() {
    [440, 880, 1760].forEach((f, i) => this.osc(f, 'triangle', 0.18 - i * 0.05, 0.18, (this.ctx?.currentTime ?? 0) + i * 0.015));
    this.noise(0.04, 5000, 0.25);
  }

  playHeal() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.osc(f, 'sine', 0.18, 0.4, (this.ctx?.currentTime ?? 0) + i * 0.09));
  }

  playGold() {
    [1500, 1900, 2400].forEach((f, i) => this.osc(f, 'triangle', 0.13, 0.28, (this.ctx?.currentTime ?? 0) + i * 0.055));
  }

  playEnemyDeath() {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.55);
    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    o.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.6);
    this.noise(0.3, 180, 0.28);
  }

  playEndTurn() {
    const ctx = this.ctx; const out = this.sfxGain;
    if (!ctx || !out || !this._sfxEnabled) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.14);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.13, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.38);
  }

  playVictory() {
    [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => {
      const t = (this.ctx?.currentTime ?? 0) + i * 0.13;
      this.osc(f, 'triangle', 0.28, 0.5, t);
      this.osc(f * 2, 'sine', 0.09, 0.4, t);
    });
  }

  playGameOver() {
    [220, 174.61, 164.81, 130.81].forEach((f, i) => {
      const t = (this.ctx?.currentTime ?? 0) + i * 0.32;
      this.osc(f, 'sawtooth', 0.22, 1.8, t);
      this.osc(f / 2, 'sine', 0.13, 2.2, t);
    });
  }

  playMapMove() {
    this.osc(440, 'sine', 0.09, 0.14);
    this.osc(330, 'sine', 0.06, 0.18, (this.ctx?.currentTime ?? 0) + 0.06);
  }

  playRest() {
    [261.63, 329.63, 392].forEach((f, i) => this.osc(f, 'sine', 0.12, 0.6, (this.ctx?.currentTime ?? 0) + i * 0.12));
  }

  // ─── MUSIC ─────────────────────────────────────────────────────────────────

  private musicPad(freqs: number[], dur: number, g = 0.035) {
    const ctx = this.ctx; const out = this.musicGain;
    if (!ctx || !out || !this._musicEnabled) return;
    freqs.forEach(freq => {
      [1, 1.004].forEach(detune => {
        const o = ctx.createOscillator();
        const flt = ctx.createBiquadFilter();
        const gn = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = freq * detune;
        flt.type = 'lowpass'; flt.frequency.value = 900; flt.Q.value = 1;
        gn.gain.setValueAtTime(0, ctx.currentTime);
        gn.gain.linearRampToValueAtTime(g, ctx.currentTime + 0.6);
        gn.gain.setValueAtTime(g, ctx.currentTime + dur - 0.7);
        gn.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
        o.connect(flt); flt.connect(gn); gn.connect(out);
        o.start(); o.stop(ctx.currentTime + dur + 0.1);
      });
    });
  }

  private musicBass(freq: number, dur: number) {
    const ctx = this.ctx; const out = this.musicGain;
    if (!ctx || !out || !this._musicEnabled) return;
    const o = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq / 2;
    flt.type = 'lowpass'; flt.frequency.value = 180;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.18, ctx.currentTime + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    o.connect(flt); flt.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + dur + 0.1);
  }

  private musicMelody(freq: number, dur: number, delay = 0) {
    const ctx = this.ctx; const out = this.musicGain;
    if (!ctx || !out || !this._musicEnabled) return;
    const o = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    flt.type = 'lowpass'; flt.frequency.value = 2200; flt.Q.value = 2;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(flt); flt.connect(g); g.connect(out);
    o.start(t); o.stop(t + dur + 0.05);
  }

  private scheduleBeat() {
    const chord = CHORDS[this.chordIndex];
    const dur = BEAT_MS / 1000;

    // Pad
    this.musicPad(chord, dur);
    // Bass root
    this.musicBass(chord[0], dur * 0.9);

    // Melody every 2 beats, randomly
    if (this.beatCount % 2 === 0 && Math.random() > 0.35) {
      const note = MELODY[Math.floor(Math.random() * MELODY.length)];
      const noteDelay = Math.random() * (dur * 0.5);
      this.musicMelody(note * 2, 0.6 + Math.random() * 0.6, noteDelay);
    }

    // Second melody hit
    if (this.beatCount % 4 === 3 && Math.random() > 0.5) {
      const note2 = MELODY[Math.floor(Math.random() * MELODY.length)];
      this.musicMelody(note2 * 2, 0.4, dur * 0.6);
    }

    this.beatCount++;
    if (this.beatCount % 4 === 0) {
      this.chordIndex = (this.chordIndex + 1) % CHORDS.length;
    }
  }

  startMusic() {
    if (this.musicTimer || !this.initialized) return;
    this.scheduleBeat();
    this.musicTimer = setInterval(() => this.scheduleBeat(), BEAT_MS);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }

  setMusicVolume(v: number) { if (this.musicGain) this.musicGain.gain.value = Math.max(0, Math.min(1, v)); }
  setMasterVolume(v: number) { if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v)); }
}

export const soundEngine = new SoundEngine();
