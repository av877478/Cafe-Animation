// Little Talk Cafe - Master Cinematic Timeline Engine (60fps, 4K canvas renderer, 10 Scenes)

class CafeTimelineEngine {
  constructor() {
    this.totalDuration = 80.0; // 80 seconds master cinematic duration
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
    this.beanParticles = [];

    // Triggered SFX tracker to avoid re-triggering during single pass
    this.triggeredTriggers = new Set();

    // Scene Definitions
    this.scenes = [
      { id: 0, start: 0.0,  end: 7.0,  name: "Cafe Introduction", tag: "Atmosphere & Heritage" },
      { id: 1, start: 7.0,  end: 14.0, name: "Customer Arrives",   tag: "Smart Table Availability" },
      { id: 2, start: 14.0, end: 21.0, name: "Scan QR Code",       tag: "Scan. Browse. Order." },
      { id: 3, start: 21.0, end: 30.0, name: "Browse Menu",        tag: "Interactive Mobile Menu" },
      { id: 4, start: 30.0, end: 40.0, name: "Customize Order",    tag: "Your Order, Your Way" },
      { id: 5, start: 40.0, end: 49.0, name: "Google Checkout",    tag: "Simple. Secure. Convenient." },
      { id: 6, start: 49.0, end: 59.0, name: "Admin Dashboard",    tag: "Real-Time POS Notification" },
      { id: 7, start: 59.0, end: 68.0, name: "Kitchen Prep (KDS)", tag: "Live Kitchen Progression" },
      { id: 8, start: 68.0, end: 77.0, name: "Live Order Tracking",tag: "Ready for Pickup or Table Service" },
      { id: 9, start: 77.0, end: 80.0, name: "Grand Brand Reveal", tag: "Little Talk Cafe" }
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

    // Start render loop
    requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  preloadAssets() {
    const assetList = [
      { key: 'scene1_intro', src: '/assets/scene1_cafe_intro.jpg' },
      { key: 'scene2_table', src: '/assets/scene2_qr_table.jpg' },
      { key: 'scene3_qr_scan', src: '/assets/scene3_qr_scan.jpg' },
      { key: 'scene4_food', src: '/assets/scene4_cappuccino_sandwich.jpg' },
      { key: 'scene8_barista', src: '/assets/scene8_barista_pour.jpg' },
      { key: 'scene10_friends', src: '/assets/scene10_happy_friends.jpg' }
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
      img.src = item.src;
      this.images[item.key] = img;
    });
  }

  initParticles() {
    // Bokeh floating dust / warm light particles
    this.bokehParticles = [];
    for (let i = 0; i < 45; i++) {
      this.bokehParticles.push({
        x: Math.random() * this.renderWidth,
        y: Math.random() * this.renderHeight,
        radius: Math.random() * 8 + 3,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.4 ? 'rgba(235, 185, 120, ' : 'rgba(255, 240, 205, '
      });
    }

    // Steam particles for coffee
    this.steamParticles = [];
    for (let i = 0; i < 30; i++) {
      this.steamParticles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.5 - 1.0,
        size: Math.random() * 14 + 10,
        alpha: Math.random() * 0.4,
        life: Math.random()
      });
    }

    // Coffee beans for Scene 10 grand reveal
    this.beanParticles = [];
    for (let i = 0; i < 28; i++) {
      this.beanParticles.push({
        x: Math.random() * this.renderWidth,
        y: -100 - Math.random() * 400,
        targetY: this.renderHeight * 0.4 + Math.random() * 450,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 2 + 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        scale: Math.random() * 0.6 + 0.5,
        alpha: Math.random() * 0.6 + 0.3
      });
    }
  }

  setupAudioTriggers() {
    this.soundCues = [
      { time: 1.0,  action: () => window.cafeAudio?.playEspressoSteam() },
      { time: 7.8,  action: () => window.cafeAudio?.playTap() },
      { time: 10.5, action: () => window.cafeAudio?.playTap() },
      { time: 15.2, action: () => window.cafeAudio?.playQRBeep() },
      { time: 22.5, action: () => window.cafeAudio?.playTap() },
      { time: 26.0, action: () => window.cafeAudio?.playTap() },
      { time: 31.5, action: () => window.cafeAudio?.playTap() },
      { time: 34.0, action: () => window.cafeAudio?.playTap() },
      { time: 36.5, action: () => window.cafeAudio?.playAddToCart() },
      { time: 41.5, action: () => window.cafeAudio?.playTap() },
      { time: 44.0, action: () => window.cafeAudio?.playGoogleAuth() },
      { time: 49.5, action: () => window.cafeAudio?.playAdminNewOrderAlert() },
      { time: 54.0, action: () => window.cafeAudio?.playTap() },
      { time: 60.5, action: () => window.cafeAudio?.playEspressoSteam() },
      { time: 65.5, action: () => window.cafeAudio?.playKitchenBell() },
      { time: 69.5, action: () => window.cafeAudio?.playOrderReady() },
      { time: 74.0, action: () => window.cafeAudio?.playTap() },
      { time: 77.8, action: () => window.cafeAudio?.playOrderReady() }
    ];
  }

  play() {
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
      this.triggeredTriggers.clear();
    }
    this.isPlaying = true;
    this.lastFrameTimestamp = performance.now();

    // Start procedural audio
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
      // Trigger voiceover for scene
      if (this.isPlaying && window.cafeVoiceover) {
        window.cafeVoiceover.speak(activeIdx);
      }
    }

    // Toggle active DOM scene overlay
    for (let i = 0; i < 10; i++) {
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

      // Check audio cues
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

    // Draw frame to 4K canvas
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

    // Clear background with rich warm espresso dark tone
    ctx.fillStyle = '#100C09';
    ctx.fillRect(0, 0, w, h);

    // Render Scene-specific cinematic canvas graphics
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
      case 6:
        this.renderScene7(ctx, w, h, progress, sceneTime);
        break;
      case 7:
        this.renderScene8(ctx, w, h, progress, sceneTime);
        break;
      case 8:
        this.renderScene9(ctx, w, h, progress, sceneTime);
        break;
      case 9:
        this.renderScene10(ctx, w, h, progress, sceneTime);
        break;
    }

    // Render Floating Bokeh Particles (Atmospheric warmth)
    this.drawBokehParticles(ctx, w, h);

    // Warm Vignette & Cinematic Film Grain
    this.drawCinematicOverlays(ctx, w, h);
  }

  // --- Scene 1: Cafe Introduction (0-7s) ---
  renderScene1(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene1_intro'];
    if (img && img.complete) {
      // Slow camera dolly-in & pan
      const scale = 1.05 + progress * 0.08;
      const panX = -20 - progress * 30;
      const panY = -15 - progress * 15;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2 + panX, -h / 2 + panY, w, h);
      ctx.restore();
    }

    // Atmospheric warm golden sunlight gradient
    const sunGrad = ctx.createRadialGradient(w * 0.75, h * 0.25, 50, w * 0.75, h * 0.25, w * 0.85);
    sunGrad.addColorStop(0, 'rgba(255, 220, 160, 0.35)');
    sunGrad.addColorStop(0.5, 'rgba(215, 140, 70, 0.15)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Animated Coffee Cup Steam in foreground
    this.drawSteam(ctx, w * 0.35, h * 0.65, 1.2);
  }

  // --- Scene 2: Customer Arrives & Table Availability (7-14s) ---
  renderScene2(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene2_table'];
    if (img && img.complete) {
      const scale = 1.08 - progress * 0.05;
      const panX = 15 - progress * 25;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2 + panX, -h / 2, w, h);
      ctx.restore();
    }

    // Subtle dark gradient on left for Table Availability HUD overlay
    const overlayGrad = ctx.createLinearGradient(0, 0, w * 0.55, 0);
    overlayGrad.addColorStop(0, 'rgba(15, 10, 7, 0.82)');
    overlayGrad.addColorStop(0.7, 'rgba(20, 14, 9, 0.5)');
    overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // --- Scene 3: Scan QR Code (14-21s) ---
  renderScene3(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene3_qr_scan'];
    if (img && img.complete) {
      // Dynamic camera zoom into the QR code and phone screen
      const scale = 1.0 + progress * 0.12;
      const panX = -progress * 20;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2 + panX, -h / 2, w, h);
      ctx.restore();
    }

    // Laser QR Scan Line Effect (during 14.5s - 17.5s)
    if (sceneTime > 0.8 && sceneTime < 3.8) {
      const scanProgress = ((sceneTime - 0.8) % 1.5) / 1.5;
      const scanY = h * 0.32 + scanProgress * (h * 0.36);

      const laserGrad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
      laserGrad.addColorStop(0, 'rgba(0, 255, 170, 0)');
      laserGrad.addColorStop(0.5, 'rgba(0, 255, 170, 0.7)');
      laserGrad.addColorStop(1, 'rgba(0, 255, 170, 0)');

      ctx.fillStyle = laserGrad;
      ctx.fillRect(w * 0.38, scanY - 12, w * 0.24, 24);

      // Sharp central laser beam
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.38, scanY);
      ctx.lineTo(w * 0.62, scanY);
      ctx.stroke();
    }
  }

  // --- Scene 4: Browse Coffee and Food (21-30s) ---
  renderScene4(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene4_food'];
    if (img && img.complete) {
      // Warm blurred cafe backdrop behind phone
      ctx.save();
      ctx.filter = 'blur(10px) brightness(0.65)';
      ctx.drawImage(img, -40, -40, w + 80, h + 80);
      ctx.restore();
    }
  }

  // --- Scene 5: Customize the Order (30-40s) ---
  renderScene5(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene4_food'];
    if (img && img.complete) {
      ctx.save();
      ctx.filter = 'blur(14px) brightness(0.55)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    }
  }

  // --- Scene 6: Checkout and Google Login (40-49s) ---
  renderScene6(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene1_intro'];
    if (img && img.complete) {
      ctx.save();
      ctx.filter = 'blur(16px) brightness(0.45)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    }
  }

  // --- Scene 7: Admin Receives Order (49-59s) ---
  renderScene7(ctx, w, h, progress, sceneTime) {
    // Elegant modern cafe bar counter backdrop behind the 27" desktop monitor
    const img = this.images['scene1_intro'];
    if (img && img.complete) {
      ctx.save();
      ctx.filter = 'blur(8px) brightness(0.5)';
      ctx.drawImage(img, -20, -20, w + 40, h + 40);
      ctx.restore();
    }
  }

  // --- Scene 8: Kitchen Preparation (59-68s) ---
  renderScene8(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene8_barista'];
    if (img && img.complete) {
      // Dynamic camera push-in on the silky latte art pour
      const scale = 1.04 + progress * 0.09;
      ctx.save();
      ctx.translate(w * 0.65, h * 0.5);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w * 0.65, -h * 0.5, w, h);
      ctx.restore();
    }

    // Gentle realistic steam rising from the barista's cup
    this.drawSteam(ctx, w * 0.62, h * 0.55, 1.4);
  }

  // --- Scene 9: Live Order Tracking (68-77s) ---
  renderScene9(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene2_table'];
    if (img && img.complete) {
      ctx.save();
      ctx.filter = 'blur(12px) brightness(0.5)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    }
  }

  // --- Scene 10: Happy Ending & Brand Reveal (77-80s) ---
  renderScene10(ctx, w, h, progress, sceneTime) {
    const img = this.images['scene10_friends'];
    if (img && img.complete) {
      // Slow emotional zoom out with warm golden glow
      const scale = 1.12 - progress * 0.08;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Warm radial vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    vignette.addColorStop(0, 'rgba(20, 14, 10, 0.45)');
    vignette.addColorStop(0.7, 'rgba(15, 10, 6, 0.85)');
    vignette.addColorStop(1, 'rgba(10, 7, 4, 0.98)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Floating 3D Coffee Beans in foreground
    this.drawFallingCoffeeBeans(ctx, progress);
  }

  // Steam particle drawer
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

  // Floating golden bokeh particles
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

  // 3D Coffee Bean illustration & physics in Scene 10
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

      // Draw stylized coffee bean
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

      // Middle bean groove (characteristic wavy coffee bean center)
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

  // Cinematic film overlays (Lens flare, warm edge, vignette)
  drawCinematicOverlays(ctx, w, h) {
    // 16:9 Subdued vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(10, 6, 3, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}

window.cafeTimeline = new CafeTimelineEngine();
