// Little Talk Cafe - Procedural Web Audio Engine
// Generates warm Lo-Fi cafe jazz music, realistic sound effects, and ambient coffee shop atmosphere

class CafeAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;
    this.isMuted = false;
    this.isInitialized = false;

    this.musicPlaying = false;
    this.ambienceNode = null;
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
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      this.isInitialized = true;
      this.startAmbience();
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

  // --- Ambient Cafe Atmosphere (warm filtered room tone & soft cafe chatter illusion) ---
  startAmbience() {
    if (!this.ctx || this.ambienceNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-brown filter
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambienceGain);
    whiteNoise.start();
    this.ambienceNode = whiteNoise;
  }

  // --- Procedural Lo-Fi Cafe Jazz Music Track ---
  // Warm Rhodes chords + gentle walking bass + vinyl texture
  startLoFiJazz() {
    if (this.musicPlaying || !this.ctx) return;
    this.musicPlaying = true;

    // Progression: Fmaj9 -> Dm9 -> Gm7 -> C13 (Classic warm cafe jazz)
    const chords = [
      { name: 'Fmaj9', notes: [174.61, 220.00, 261.63, 329.63, 392.00], bass: 87.31 },
      { name: 'Dm9',   notes: [146.83, 220.00, 261.63, 329.63, 349.23], bass: 73.42 },
      { name: 'Gm7',   notes: [196.00, 233.08, 293.66, 349.23, 440.00], bass: 98.00 },
      { name: 'C13',   notes: [130.81, 196.00, 233.08, 329.63, 440.00], bass: 65.41 }
    ];

    let step = 0;

    const playChordStep = () => {
      if (!this.musicPlaying || !this.ctx) return;
      const chord = chords[this.currentChordIndex];
      const now = this.ctx.currentTime;

      // Play Rhodes keyboard chord
      chord.notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.015); // gentle strum

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now + i * 0.015);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 2.8);

        // Soft Rhodes envelope
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.045, now + 0.04 + i * 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now + i * 0.015);
        osc2.start(now + i * 0.015);
        osc.stop(now + 3.3);
        osc2.stop(now + 3.3);
      });

      // Play warm upright bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(chord.bass, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(180, now);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.12, now + 0.06);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 1.9);

      // Advance chord every 2 beats (about 2.4s)
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;
    };

    // Initial play and interval
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

  // --- Realistic Sound Effects (SFX) ---

  // 1. Soft UI Tap / Click
  playTap() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 2. Camera QR Scan Laser & Confirmation Beep
  playQRBeep() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;

    // High clear double-chime
    [1567.98, 2093.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.2);
    });
  }

  // 3. Add to Cart pleasant ascending chime
  playAddToCart() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // 4. Google Auth Checkmark / Success swoosh
  playGoogleAuth() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.00]; // D5, A5

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // 5. Admin Dashboard New Order Alert ("Ding-Dong" bell)
  playAdminNewOrderAlert() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const bellNotes = [987.77, 783.99]; // B5, G5

    bellNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const harm = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);

      harm.type = 'sine';
      harm.frequency.setValueAtTime(freq * 2.76, now + idx * 0.22); // Bell inharmonicity

      gain.gain.setValueAtTime(0, now + idx * 0.22);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.22 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.9);

      osc.connect(gain);
      harm.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.22);
      harm.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 1.0);
      harm.stop(now + idx * 0.22 + 1.0);
    });
  }

  // 6. Espresso Machine Steam Wand Hiss
  playEspressoSteam() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const duration = 2.2;

    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // 7. Kitchen Service Bell
  playKitchenBell() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2637.02, now); // E7
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3951.07, now); // B7 harmonic

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.3);
    osc2.stop(now + 1.3);
  }

  // 8. Order Ready Success Triad
  playOrderReady() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.50, 1318.51]; // E5, G5, C6, E6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  }
}

window.cafeAudio = new CafeAudioEngine();
