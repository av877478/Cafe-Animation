// Little Talk Cafe - Procedural Web Audio Engine (Pure, Clean, Crackle-Free)
// Warm Lo-Fi cafe jazz music & realistic sound effects with zero static or crackling noise

class CafeAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isInitialized = false;

    this.musicPlaying = false;
    this.musicInterval = null;
    this.currentChordIndex = 0;
  }

  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Sub-buses
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
      // Start pure melodic Lo-Fi Jazz (No static, no crackling noise)
      this.startLoFiJazz();
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  setMasterVolume(val) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
  }

  setMusicVolume(val) {
    if (!this.musicGain || !this.ctx) return;
    this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
  }

  setSfxVolume(val) {
    if (!this.sfxGain || !this.ctx) return;
    this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
  }

  // Pure, warm Lo-Fi Cafe Jazz Music Track (Smooth Rhodes & warm sine bass, NO crackle)
  startLoFiJazz() {
    if (this.musicPlaying || !this.ctx) return;
    this.musicPlaying = true;

    // Progression: Fmaj9 -> Dm9 -> Gm7 -> C13 (Warm relaxed cafe jazz)
    const chords = [
      { name: 'Fmaj9', notes: [174.61, 220.00, 261.63, 329.63, 392.00], bass: 87.31 },
      { name: 'Dm9',   notes: [146.83, 220.00, 261.63, 329.63, 349.23], bass: 73.42 },
      { name: 'Gm7',   notes: [196.00, 233.08, 293.66, 349.23, 440.00], bass: 98.00 },
      { name: 'C13',   notes: [130.81, 196.00, 233.08, 329.63, 440.00], bass: 65.41 }
    ];

    const playChordStep = () => {
      if (!this.musicPlaying || !this.ctx) return;
      const chord = chords[this.currentChordIndex];
      const now = this.ctx.currentTime;

      // Soft Rhodes electric piano chords
      chord.notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.015);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(260, now + 2.8);

        // Gentle envelope with zero pop
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.04, now + 0.05 + i * 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now + i * 0.015);
        osc.stop(now + 3.1);
      });

      // Warm acoustic upright bass
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(chord.bass, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(150, now);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.11, now + 0.08);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 1.9);

      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;
    };

    playChordStep();
    this.musicInterval = setInterval(playChordStep, 2400);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // --- Clean Sound Effects (SFX) ---

  // 1. Soft UI Tap / Click
  playTap() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 2. Camera QR Scan Laser & Confirmation Chime
  playQRBeep() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;

    [1567.98, 2093.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.18);
    });
  }

  // 3. Add to Cart pleasant ascending chime
  playAddToCart() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  // 4. Google Auth Checkmark
  playGoogleAuth() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.00];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  // 5. Admin Dashboard New Order Alert ("Ding-Dong" bell)
  playAdminNewOrderAlert() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const bellNotes = [987.77, 783.99];

    bellNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);

      gain.gain.setValueAtTime(0, now + idx * 0.22);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.22 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 0.85);
    });
  }

  // 6. Smooth Espresso Steam whoosh (Clean, zero crackle)
  playEspressoSteam() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(180, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  // 7. Kitchen Service Brass Bell
  playKitchenBell() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2637.02, now); // E7 clean tone

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // 8. Order Ready Success Triad
  playOrderReady() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.50, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.8);
    });
  }

  // 9. Pixar Magical Amber Sparkle (Pentatonic cascading shimmer)
  playMagicalSparkle() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const sparkleNotes = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02, 3135.96];

    sparkleNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.5);
    });
  }

  // 10. Colorful Confetti Celebration Chime
  playConfettiCheer() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const cheerNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

    cheerNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.04 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.65);
    });
  }
}

window.cafeAudio = new CafeAudioEngine();
