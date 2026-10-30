// Little Talk Cafe - 3D Pixar-Disney Cinematic Animation Timeline Engine (60fps, 4K Canvas, 6 Scenes)

class CafeTimelineEngine {
  constructor() {
    this.totalDuration = 55.0; // 55 seconds master cinematic duration
    this.currentTime = 0.0;
    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.lastFrameTimestamp = 0;
    this.currentSceneIndex = 0;

    // Canvas & context
    this.canvas = null;
    this.ctx = null;
    this.renderWidth = 1920;
    this.renderHeight = 1080;

    // Loaded Assets
    this.images = {};
    this.imagesLoaded = false;

    // Particles
    this.steamParticles = [];
    this.bokehParticles = [];
    this.sparkleParticles = [];
    this.confettiParticles = [];
    this.beanParticles = [];

    // Triggered SFX tracker
    this.triggeredTriggers = new Set();

    // 6 Pixar-Disney Scene Definitions matching user prompt exactly
    this.scenes = [
      { id: 0, start: 0.0,  end: 8.0,  name: "Arrival in Rishikesh", tag: "Ram Jhula, Rishikesh • Table #4" },
      { id: 1, start: 8.0,  end: 16.0, name: "Magical QR Scan",      tag: "Table #4 - Scan to Order • Instant Web App" },
      { id: 2, start: 16.0, end: 26.0, name: "Browse & Order Sent",  tag: "3D Food Cards • Confetti • Order Sent!" },
      { id: 3, start: 26.0, end: 36.0, name: "Kitchen Match-Cut",    tag: "Kitchen Display Alert • Jolly Barista Craft" },
      { id: 4, start: 36.0, end: 46.0, name: "Waiter Delivery",      tag: "Brewing with Love ➔ Order Ready!" },
      { id: 5, start: 46.0, end: 55.0, name: "Golden Hour Finale",   tag: "Scan • Order • Enjoy | Little Talk Cafe" }
    ];

    this.initParticles();
  }

  init() {
    this.canvas = document.getElementById('cinema-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = this.renderWidth;
      this.canvas.height = this.renderHeight;
    }

    this.preloadAssets();
    this.setupAudioTriggers();
    this.updateTimelineUI();

    requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  preloadAssets() {
    const assetList = [
      { key: 'pixar_scene1', src: 'assets/pixar_scene1_arrival.jpg', fallback: 'public/assets/pixar_scene1_arrival.jpg' },
      { key: 'pixar_scene2', src: 'assets/pixar_scene2_qr_scan.jpg', fallback: 'public/assets/pixar_scene2_qr_scan.jpg' },
      { key: 'pixar_scene3', src: 'assets/pixar_scene3_order_screen.jpg', fallback: 'public/assets/pixar_scene3_order_screen.jpg' },
      { key: 'pixar_scene4', src: 'assets/pixar_scene4_barista.jpg', fallback: 'public/assets/pixar_scene4_barista.jpg' },
      { key: 'pixar_scene5', src: 'assets/pixar_scene5_waiter.jpg', fallback: 'public/assets/pixar_scene5_waiter.jpg' },
      { key: 'pixar_scene6', src: 'assets/pixar_scene6_ganges_sip.jpg', fallback: 'public/assets/pixar_scene6_ganges_sip.jpg' }
    ];

    let loadedCount = 0;
    assetList.forEach(item => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loadedCount++;
        if (loadedCount === assetList.length) {
          this.imagesLoaded = true;
        }
      };
      img.onerror = () => {
        if (!img.dataset.triedFallback) {
          img.dataset.triedFallback = "true";
          img.src = item.fallback;
        }
      };
      img.src = item.src;
      this.images[item.key] = img;
    });
  }

  initParticles() {
    // 1. Warm Golden Bokeh Particles
    this.bokehParticles = [];
    for (let i = 0; i < 40; i++) {
      this.bokehParticles.push({
        x: Math.random() * this.renderWidth,
        y: Math.random() * this.renderHeight,
        radius: Math.random() * 8 + 3,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.4 ? 'rgba(245, 185, 100, ' : 'rgba(255, 230, 180, '
      });
    }

    // 2. Steaming Coffee Micro-Particles
    this.steamParticles = [];
    for (let i = 0; i < 30; i++) {
      this.steamParticles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -Math.random() * 1.5 - 1.0,
        size: Math.random() * 14 + 10,
        alpha: Math.random() * 0.4,
        life: Math.random()
      });
    }

    // 3. Magical Amber Light Sparkles (Scene 2)
    this.sparkleParticles = [];
    for (let i = 0; i < 50; i++) {
      this.sparkleParticles.push({
        x: this.renderWidth * 0.55 + (Math.random() - 0.5) * 80,
        y: this.renderHeight * 0.6 + (Math.random() - 0.5) * 80,
        targetX: this.renderWidth * 0.45 + (Math.random() - 0.5) * 100,
        targetY: this.renderHeight * 0.4 + (Math.random() - 0.5) * 100,
        progress: Math.random(),
        speed: Math.random() * 0.02 + 0.01,
        radius: Math.random() * 4 + 2,
        color: Math.random() > 0.3 ? '#F59E0B' : '#FDE68A'
      });
    }

    // 4. Confetti Burst Particles (Scene 3)
    const confettiColors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'];
    this.confettiParticles = [];
    for (let i = 0; i < 60; i++) {
      this.confettiParticles.push({
        x: this.renderWidth * 0.5,
        y: this.renderHeight * 0.48,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        alpha: 1.0
      });
    }

    // 5. Golden Floating Coffee Beans (Scene 6)
    this.beanParticles = [];
    for (let i = 0; i < 24; i++) {
      this.beanParticles.push({
        x: Math.random() * this.renderWidth,
        y: -100 - Math.random() * 300,
        targetY: this.renderHeight * 0.35 + Math.random() * 480,
        vx: (Math.random() - 0.5) * 1.0,
        vy: Math.random() * 1.8 + 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        scale: Math.random() * 0.6 + 0.5,
        alpha: Math.random() * 0.6 + 0.3
      });
    }
  }

  setupAudioTriggers() {
    this.soundCues = [
      { time: 0.8,  action: () => window.cafeAudio?.playEspressoSteam() },
      { time: 5.5,  action: () => window.cafeAudio?.playTap() },
      { time: 8.5,  action: () => { window.cafeAudio?.playMagicalSparkle?.(); window.cafeAudio?.playQRBeep(); } },
      { time: 13.0, action: () => window.cafeAudio?.playTap() },
      { time: 17.0, action: () => window.cafeAudio?.playTap() },
      { time: 19.5, action: () => window.cafeAudio?.playAddToCart() },
      { time: 22.0, action: () => { window.cafeAudio?.playConfettiCheer?.(); window.cafeAudio?.playGoogleAuth(); } },
      { time: 27.0, action: () => window.cafeAudio?.playAdminNewOrderAlert() },
      { time: 31.0, action: () => window.cafeAudio?.playEspressoSteam() },
      { time: 34.0, action: () => window.cafeAudio?.playKitchenBell() },
      { time: 37.0, action: () => window.cafeAudio?.playOrderReady() },
      { time: 42.0, action: () => window.cafeAudio?.playTap() },
      { time: 47.0, action: () => window.cafeAudio?.playOrderReady() }
    ];
  }

  play() {
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
      this.triggeredTriggers.clear();
    }
    this.isPlaying = true;
    this.lastFrameTimestamp = performance.now();

    if (window.cafeAudio) {
      window.cafeAudio.init();
    }

    const playBtn = document.getElementById('btn-play');
    if (playBtn) {
      playBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    }
  }

  pause() {
    this.isPlaying = false;
    if (window.cafeVoiceover) {
      window.cafeVoiceover.cancel();
    }
    const playBtn = document.getElementById('btn-play');
    if (playBtn) {
      playBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, seconds));
    this.triggeredTriggers = new Set(
      this.soundCues.filter(c => c.time < this.currentTime).map(c => c.time)
    );
    this.updateActiveScene();
    this.updateTimelineUI();
  }

  jumpToScene(sceneIndex) {
    if (sceneIndex >= 0 && sceneIndex < this.scenes.length) {
      this.seek(this.scenes[sceneIndex].start);
      if (!this.isPlaying) {
        this.play();
      }
    }
  }

  updateActiveScene() {
    let activeIdx = this.scenes.findIndex(s => this.currentTime >= s.start && this.currentTime < s.end);
    if (activeIdx === -1 && this.currentTime >= this.scenes[this.scenes.length - 1].end) {
      activeIdx = this.scenes.length - 1;
    }

    if (activeIdx !== this.currentSceneIndex) {
      this.currentSceneIndex = activeIdx;
      if (this.isPlaying && window.cafeVoiceover) {
        window.cafeVoiceover.speak(activeIdx);
      }
    }

    // Toggle active DOM scene overlay
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(`scene-overlay-${i}`);
      if (el) {
        if (i === activeIdx) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    }
  }

  renderLoop(timestamp) {
    if (this.isPlaying) {
      const delta = (timestamp - this.lastFrameTimestamp) / 1000;
      this.lastFrameTimestamp = timestamp;

      this.currentTime += delta * this.playbackRate;

      if (this.currentTime >= this.totalDuration) {
        this.currentTime = this.totalDuration;
        this.pause();
      }

      this.soundCues.forEach(cue => {
        if (this.currentTime >= cue.time && !this.triggeredTriggers.has(cue.time)) {
          this.triggeredTriggers.add(cue.time);
          try { cue.action(); } catch (e) { console.warn(e); }
        }
      });

      this.updateActiveScene();
      this.updateTimelineUI();
    } else {
      this.lastFrameTimestamp = timestamp;
    }

    this.drawFrame();
    requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  updateTimelineUI() {
    const timeDisplay = document.getElementById('time-display');
    const progressBar = document.getElementById('timeline-progress');
    const scrubberHandle = document.getElementById('scrubber-handle');

    if (timeDisplay) {
      const curM = Math.floor(this.currentTime / 60);
      const curS = Math.floor(this.currentTime % 60);
      const totM = Math.floor(this.totalDuration / 60);
      const totS = Math.floor(this.totalDuration % 60);
      timeDisplay.textContent = `${curM}:${curS.toString().padStart(2, '0')} / ${totM}:${totS.toString().padStart(2, '0')}`;
    }

    const progressPct = (this.currentTime / this.totalDuration) * 100;
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    if (scrubberHandle) scrubberHandle.style.left = `${progressPct}%`;
  }

  drawFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.renderWidth;
    const h = this.renderHeight;
    const t = this.currentTime;
    const scene = this.scenes[this.currentSceneIndex] || this.scenes[0];
    const sceneTime = t - scene.start;
    const sceneDuration = scene.end - scene.start;
    const progress = Math.max(0, Math.min(1, sceneTime / sceneDuration));

    // Clear background
    ctx.fillStyle = '#140E0A';
    ctx.fillRect(0, 0, w, h);

    // Render Scene-specific visuals
    switch (this.currentSceneIndex) {
      case 0:
        this.renderScene1(ctx, w, h, progress, sceneTime);
        break;
      case 1:
        this.renderScene2(ctx, w, h, progress, sceneTime);
        break;
      case 2:
        this.renderScene3(ctx, w, h, progress, sceneTime);
        break;
      case 3:
        this.renderScene4(ctx, w, h, progress, sceneTime);
        break;
      case 4:
        this.renderScene5(ctx, w, h, progress, sceneTime);
        break;
      case 5:
        this.renderScene6(ctx, w, h, progress, sceneTime);
        break;
    }

    // Floating Bokeh Particles
    this.drawBokehParticles(ctx, w, h);

    // Warm Vignette
    this.drawCinematicOverlays(ctx, w, h);
  }

  // --- Scene 1: Arrival & Seating in Rishikesh (0 - 8s) ---
  renderScene1(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene1'];
    if (img && img.complete) {
      // Cinematic slow dolly-in
      const scale = 1.03 + progress * 0.07;
      const panX = -15 - progress * 20;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2 + panX, -h / 2, w, h);
      ctx.restore();
    }

    // Warm morning volumetric sunbeams through arched windows
    const sunGrad = ctx.createRadialGradient(w * 0.25, h * 0.35, 60, w * 0.25, h * 0.35, w * 0.85);
    sunGrad.addColorStop(0, 'rgba(255, 220, 160, 0.28)');
    sunGrad.addColorStop(0.5, 'rgba(215, 140, 70, 0.12)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Steam rising from table
    this.drawSteam(ctx, w * 0.48, h * 0.68, 1.0);
  }

  // --- Scene 2: Scan QR Code with Sparkling Particles (8 - 16s) ---
  renderScene2(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene2'];
    if (img && img.complete) {
      // Camera zooms smoothly in a close-up tracking shot
      const scale = 1.02 + progress * 0.09;
      const panY = -progress * 15;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2 + panY, w, h);
      ctx.restore();
    }

    // Draw magical golden amber light particle effect sparkling from QR into phone
    this.drawAmberSparkles(ctx, progress);
  }

  // --- Scene 3: Browse Food & Order Sent to Kitchen (16 - 26s) ---
  renderScene3(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene3'];
    if (img && img.complete) {
      const scale = 1.04 - progress * 0.04;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Confetti celebration burst after 5.5s of scene (around 21.5s total time)
    if (sceneTime > 5.5) {
      this.drawConfetti(ctx, sceneTime - 5.5);
    }
  }

  // --- Scene 4: Kitchen Match-Cut & Jolly Barista (26 - 36s) ---
  renderScene4(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene4'];
    if (img && img.complete) {
      // Fast playful zoom into barista's warm smile and latte art
      const scale = 1.02 + progress * 0.08;
      ctx.save();
      ctx.translate(w * 0.55, h * 0.5);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w * 0.55, -h * 0.5, w, h);
      ctx.restore();
    }

    // Swirling espresso steam
    this.drawSteam(ctx, w * 0.68, h * 0.65, 1.4);
  }

  // --- Scene 5: Table Cut Back & Waiter Delivery (36 - 46s) ---
  renderScene5(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene5'];
    if (img && img.complete) {
      const scale = 1.05 - progress * 0.05;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Steaming coffee on the delivered tray
    this.drawSteam(ctx, w * 0.52, h * 0.62, 1.2);
  }

  // --- Scene 6: Golden-Hour Wide Shot & Brand Finale (46 - 55s) ---
  renderScene6(ctx, w, h, progress, sceneTime) {
    const img = this.images['pixar_scene6'];
    if (img && img.complete) {
      // Slow wide cinematic pan showing Ganges river sunset
      const scale = 1.08 - progress * 0.06;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Golden hour warm radial vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
    vignette.addColorStop(0, 'rgba(25, 16, 10, 0.35)');
    vignette.addColorStop(0.7, 'rgba(18, 11, 7, 0.75)');
    vignette.addColorStop(1, 'rgba(10, 6, 4, 0.95)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Floating 3D Coffee Beans
    this.drawFallingCoffeeBeans(ctx, progress);
  }

  // --- Particle Drawer Helpers ---

  drawAmberSparkles(ctx, progress) {
    ctx.save();
    this.sparkleParticles.forEach((p, idx) => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      // Arc curve from QR to phone screen
      const curX = p.x + (p.targetX - p.x) * p.progress + Math.sin(p.progress * Math.PI) * 45;
      const curY = p.y + (p.targetY - p.y) * p.progress - Math.sin(p.progress * Math.PI) * 75;

      const alpha = Math.sin(p.progress * Math.PI);
      const rad = p.radius * (1 + Math.sin(p.progress * Math.PI * 2) * 0.3);

      const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, rad * 2.5);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, p.color);
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(curX, curY, rad * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawConfetti(ctx, animTime) {
    ctx.save();
    const progress = Math.min(1.0, animTime / 3.0);
    this.confettiParticles.forEach((c) => {
      const curX = c.x + c.vx * animTime * 40;
      const curY = c.y + c.vy * animTime * 35 + 0.5 * 250 * (animTime * animTime);
      c.rot += c.rotSpeed;

      ctx.save();
      ctx.translate(curX, curY);
      ctx.rotate((c.rot * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });
    ctx.restore();
  }

  drawSteam(ctx, x, y, intensity = 1.0) {
    ctx.save();
    this.steamParticles.forEach(p => {
      p.y += p.vy * intensity;
      p.x += p.vx * intensity;
      p.size += 0.25;
      p.alpha -= 0.005;

      if (p.alpha <= 0 || p.size > 55) {
        p.x = x + (Math.random() - 0.5) * 35;
        p.y = y;
        p.size = Math.random() * 12 + 8;
        p.alpha = Math.random() * 0.35 + 0.1;
      }

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawBokehParticles(ctx, w, h) {
    ctx.save();
    this.bokehParticles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -30) {
        p.y = h + 20;
        p.x = Math.random() * w;
      }
      if (p.x < -30) p.x = w + 20;
      if (p.x > w + 30) p.x = -20;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `${p.color}${p.opacity})`);
      grad.addColorStop(1, `${p.color}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawFallingCoffeeBeans(ctx, progress) {
    ctx.save();
    this.beanParticles.forEach((b, i) => {
      const curY = b.y + (b.targetY - b.y) * Math.min(1, progress * 1.5 + i * 0.02);
      b.rotation += b.rotSpeed;

      ctx.save();
      ctx.translate(b.x, curY);
      ctx.rotate(b.rotation);
      ctx.scale(b.scale, b.scale);
      ctx.globalAlpha = Math.min(0.9, progress * 1.8) * b.alpha;

      // Stylized Pixar-style coffee bean
      ctx.fillStyle = '#2B170B';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden bean highlight
      ctx.strokeStyle = '#D58D49';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, -0.4, 0.4);
      ctx.stroke();

      // Middle bean groove
      ctx.strokeStyle = '#120A05';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.bezierCurveTo(-6, -8, 6, 8, 0, 24);
      ctx.stroke();

      ctx.restore();
    });
    ctx.restore();
  }

  drawCinematicOverlays(ctx, w, h) {
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(10, 6, 3, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}

window.cafeTimeline = new CafeTimelineEngine();
