// Little Talk Cafe - Pure Cinema Controller (Zero Frame, Full-Bleed Video & Sound)

document.addEventListener('DOMContentLoaded', () => {
  if (window.cafeTimeline) {
    window.cafeTimeline.init();
  }

  const cinemaContainer = document.getElementById('cinema-container');
  const scaler = document.getElementById('cinema-scaler');
  const startOverlay = document.getElementById('cinema-start-overlay');
  const controls = document.getElementById('pure-controls');
  const playBtn = document.getElementById('btn-play');
  const recordBtn = document.getElementById('btn-record');
  const fsBtn = document.getElementById('btn-fullscreen');
  const scrubber = document.getElementById('timeline-scrubber');
  const volMaster = document.getElementById('vol-master');
  const btnMute = document.getElementById('btn-mute');

  // --- 1. Responsive 16:9 Viewport Scaler (Centered, Full-Bleed, Zero Frame) ---
  const updateStageScale = () => {
    if (!cinemaContainer || !scaler) return;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const scale = Math.min(cw / 1280, ch / 720);
    scaler.style.transform = `scale(${scale})`;
    scaler.style.left = `${(cw - 1280 * scale) / 2}px`;
    scaler.style.top = `${(ch - 720 * scale) / 2}px`;
  };

  updateStageScale();
  window.addEventListener('resize', updateStageScale);
  window.addEventListener('orientationchange', () => setTimeout(updateStageScale, 150));

  // --- 2. Auto-Hiding Controls Engine (Disappears completely during playback) ---
  let hideControlsTimer = null;

  const showControls = () => {
    if (controls) controls.classList.add('active');
    document.body.classList.remove('pure-cinema-playing');
  };

  const scheduleHideControls = () => {
    if (hideControlsTimer) clearTimeout(hideControlsTimer);
    if (window.cafeTimeline && window.cafeTimeline.isPlaying) {
      hideControlsTimer = setTimeout(() => {
        if (controls) controls.classList.remove('active');
        document.body.classList.add('pure-cinema-playing');
      }, 1800);
    }
  };

  window.addEventListener('mousemove', () => {
    showControls();
    scheduleHideControls();
  });

  window.addEventListener('touchstart', () => {
    showControls();
    scheduleHideControls();
  }, { passive: true });

  // --- 3. Seamless Start / Playback Trigger ---
  const startAndPlay = () => {
    if (startOverlay) {
      startOverlay.classList.add('hidden');
    }
    if (window.cafeAudio) {
      window.cafeAudio.init();
    }
    if (window.cafeTimeline) {
      if (!window.cafeTimeline.isPlaying) {
        window.cafeTimeline.play();
      }
    }
    scheduleHideControls();
  };

  if (startOverlay) {
    startOverlay.addEventListener('click', startAndPlay);
    startOverlay.addEventListener('touchend', startAndPlay);
  }

  // Clicking on the video canvas toggles play / pause
  if (cinemaContainer) {
    cinemaContainer.addEventListener('click', (e) => {
      // Ignore if clicking on overlay or controls
      if (e.target.closest('#pure-controls')) return;
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startAndPlay();
        return;
      }
      if (window.cafeTimeline) {
        window.cafeTimeline.togglePlay();
        if (window.cafeTimeline.isPlaying) {
          scheduleHideControls();
        } else {
          showControls();
        }
      }
    });
  }

  // --- 4. Controls Buttons (Play, Pause, Scrubber) ---
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startAndPlay();
        return;
      }
      if (window.cafeTimeline) {
        window.cafeTimeline.togglePlay();
        if (window.cafeTimeline.isPlaying) {
          scheduleHideControls();
        } else {
          showControls();
        }
      }
    });
  }

  // Timeline scrubber drag & seek
  let isDraggingScrubber = false;
  const seekFromEvent = (e) => {
    if (!window.cafeTimeline || !scrubber) return;
    const rect = scrubber.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (clickX / rect.width) * window.cafeTimeline.totalDuration;
    window.cafeTimeline.seek(targetTime);
  };

  if (scrubber) {
    scrubber.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDraggingScrubber = true;
      seekFromEvent(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingScrubber) seekFromEvent(e);
    });

    window.addEventListener('mouseup', () => {
      isDraggingScrubber = false;
    });

    scrubber.addEventListener('touchstart', (e) => {
      isDraggingScrubber = true;
      if (e.touches && e.touches[0]) seekFromEvent(e.touches[0]);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingScrubber && e.touches && e.touches[0]) seekFromEvent(e.touches[0]);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingScrubber = false;
    });
  }

  // --- 5. Audio / Volume Controls ---
  let isMuted = false;
  let previousVolume = 0.9;

  if (volMaster) {
    volMaster.addEventListener('input', (e) => {
      e.stopPropagation();
      const val = parseFloat(e.target.value);
      if (window.cafeAudio) {
        window.cafeAudio.setMasterVolume(val);
      }
      if (val === 0) {
        isMuted = true;
        if (btnMute) btnMute.style.opacity = '0.4';
      } else {
        isMuted = false;
        previousVolume = val;
        if (btnMute) btnMute.style.opacity = '1';
      }
    });
  }

  if (btnMute) {
    btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      if (isMuted) {
        if (window.cafeAudio) window.cafeAudio.setMasterVolume(0);
        if (volMaster) volMaster.value = 0;
        btnMute.style.opacity = '0.4';
      } else {
        if (window.cafeAudio) window.cafeAudio.setMasterVolume(previousVolume || 0.9);
        if (volMaster) volMaster.value = previousVolume || 0.9;
        btnMute.style.opacity = '1';
      }
    });
  }

  // --- 6. MP4 Video Recorder ---
  if (recordBtn) {
    recordBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.cafeRecorder) {
        window.cafeRecorder.startRecording(cinemaContainer);
      }
    });
  }

  // --- 7. Fullscreen Toggle ---
  const toggleFullscreen = () => {
    const doc = document;
    const elem = document.documentElement;
    const isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFull) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  };

  if (fsBtn) {
    fsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  // --- 8. Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startAndPlay();
      } else if (window.cafeTimeline) {
        window.cafeTimeline.togglePlay();
        if (window.cafeTimeline.isPlaying) scheduleHideControls();
        else showControls();
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime - 5);
      showControls();
      scheduleHideControls();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime + 5);
      showControls();
      scheduleHideControls();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      btnMute?.click();
    }
  });
});
