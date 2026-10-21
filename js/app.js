// Little Talk Cafe - Application Controller & Universal Cross-Browser Engine

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Master Timeline
  if (window.cafeTimeline) {
    window.cafeTimeline.init();
  }

  // --- Universal 16:9 Viewport Scaler (Mobile, Tablet, Desktop) ---
  const cinemaContainer = document.getElementById('cinema-container');
  const scaler = document.getElementById('cinema-scaler');

  const updateStageScale = () => {
    if (!cinemaContainer || !scaler) return;
    const containerWidth = cinemaContainer.clientWidth;
    const scale = containerWidth / 1280;
    scaler.style.transform = `scale(${scale})`;
  };

  updateStageScale();
  window.addEventListener('resize', updateStageScale);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateStageScale, 150);
  });

  if (window.ResizeObserver && cinemaContainer) {
    const ro = new ResizeObserver(() => updateStageScale());
    ro.observe(cinemaContainer);
  }

  // --- Universal Cross-Browser Start Overlay ---
  const startOverlay = document.getElementById('cinema-start-overlay');

  const startExperience = () => {
    if (startOverlay) {
      startOverlay.classList.add('hidden');
    }
    // Resume / initialize Web Audio context on user gesture
    if (window.cafeAudio) {
      window.cafeAudio.init();
    }
    // Start timeline playback
    if (window.cafeTimeline && !window.cafeTimeline.isPlaying) {
      window.cafeTimeline.play();
    }
  };

  if (startOverlay) {
    startOverlay.addEventListener('click', startExperience);
    startOverlay.addEventListener('touchend', startExperience);
  }

  // --- Zoom In & Zoom Out Viewport Scaling ---
  let zoomLevel = 1.0;
  const zoomText = document.getElementById('zoom-level-text');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomReset = document.getElementById('btn-zoom-reset');

  const applyZoom = (newZoom) => {
    zoomLevel = Math.max(0.5, Math.min(1.5, Math.round(newZoom * 10) / 10));
    if (cinemaContainer) {
      cinemaContainer.style.transform = `scale(${zoomLevel})`;
    }
    if (zoomText) {
      zoomText.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  };

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      applyZoom(zoomLevel - 0.1);
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      applyZoom(zoomLevel + 0.1);
    });
  }

  if (btnZoomReset) {
    btnZoomReset.addEventListener('click', () => {
      applyZoom(1.0);
    });
  }

  // --- Scrubber & Timeline Interaction ---
  const scrubber = document.getElementById('timeline-scrubber');
  let isDraggingScrubber = false;

  const seekFromEvent = (e) => {
    if (!window.cafeTimeline) return;
    const rect = scrubber.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = (clickX / rect.width) * window.cafeTimeline.totalDuration;
    window.cafeTimeline.seek(targetTime);
  };

  if (scrubber) {
    scrubber.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      seekFromEvent(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingScrubber) seekFromEvent(e);
    });

    window.addEventListener('mouseup', () => {
      isDraggingScrubber = false;
    });

    // Touch support for mobile / touch screens
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

  // --- Play / Pause Controls ---
  const playBtn = document.getElementById('btn-play');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startExperience();
        return;
      }
      if (window.cafeTimeline) {
        window.cafeTimeline.togglePlay();
      }
    });
  }

  const prevBtn = document.getElementById('btn-prev-scene');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!window.cafeTimeline) return;
      const curIdx = window.cafeTimeline.currentSceneIndex;
      window.cafeTimeline.jumpToScene(Math.max(0, curIdx - 1));
    });
  }

  const nextBtn = document.getElementById('btn-next-scene');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!window.cafeTimeline) return;
      const curIdx = window.cafeTimeline.currentSceneIndex;
      window.cafeTimeline.jumpToScene(Math.min(window.cafeTimeline.scenes.length - 1, curIdx + 1));
    });
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startExperience();
      } else if (window.cafeTimeline) {
        window.cafeTimeline.togglePlay();
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime - 5);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime + 5);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      applyZoom(zoomLevel - 0.1);
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      applyZoom(zoomLevel + 0.1);
    } else if (e.key === '0') {
      e.preventDefault();
      applyZoom(1.0);
    }
  });

  // --- Playback Speed Switcher ---
  const speedSelect = document.getElementById('speed-select');
  if (speedSelect) {
    speedSelect.addEventListener('change', (e) => {
      const speed = parseFloat(e.target.value) || 1.0;
      if (window.cafeTimeline) window.cafeTimeline.playbackRate = speed;
      if (window.cafeVoiceover) window.cafeVoiceover.rate = speed;
    });
  }

  // --- Volume Sliders ---
  const volVoiceover = document.getElementById('vol-voiceover');
  if (volVoiceover) {
    volVoiceover.addEventListener('input', (e) => {
      if (window.cafeVoiceover) {
        window.cafeVoiceover.setVolume(parseFloat(e.target.value));
      }
    });
  }

  const volMusic = document.getElementById('vol-music');
  if (volMusic) {
    volMusic.addEventListener('input', (e) => {
      if (window.cafeAudio) {
        window.cafeAudio.setMusicVolume(parseFloat(e.target.value));
      }
    });
  }

  const volSfx = document.getElementById('vol-sfx');
  if (volSfx) {
    volSfx.addEventListener('input', (e) => {
      if (window.cafeAudio) {
        window.cafeAudio.setSfxVolume(parseFloat(e.target.value));
      }
    });
  }

  // Voiceover Toggle Button
  const voiceToggle = document.getElementById('voiceover-toggle-btn');
  if (voiceToggle) {
    voiceToggle.addEventListener('click', () => {
      if (window.cafeVoiceover) {
        const nextState = !window.cafeVoiceover.isEnabled;
        window.cafeVoiceover.setEnabled(nextState);
        voiceToggle.style.opacity = nextState ? '1' : '0.4';
      }
    });
  }

  // --- MP4 Video Recording ---
  const recordBtn = document.getElementById('btn-record');
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      if (window.cafeRecorder) {
        window.cafeRecorder.startRecording(cinemaContainer);
      }
    });
  }

  // --- Cross-Browser Fullscreen Toggle (Supports all vendor prefixes) ---
  const fsBtn = document.getElementById('btn-fullscreen');
  const toggleFullscreen = () => {
    const doc = document;
    const isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFull) {
      if (cinemaContainer.requestFullscreen) {
        cinemaContainer.requestFullscreen();
      } else if (cinemaContainer.webkitRequestFullscreen) {
        cinemaContainer.webkitRequestFullscreen();
      } else if (cinemaContainer.mozRequestFullScreen) {
        cinemaContainer.mozRequestFullScreen();
      } else if (cinemaContainer.msRequestFullscreen) {
        cinemaContainer.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  if (fsBtn) {
    fsBtn.addEventListener('click', toggleFullscreen);
  }

  // --- Interactive Scene Micro-Interactions ---
  const btnViewMenu = document.getElementById('btn-mock-view-menu');
  if (btnViewMenu) {
    btnViewMenu.addEventListener('click', () => {
      window.cafeAudio?.playTap();
      window.cafeTimeline?.jumpToScene(3);
    });
  }

  const cardCappuccino = document.getElementById('card-cappuccino');
  if (cardCappuccino) {
    cardCappuccino.addEventListener('click', () => {
      window.cafeAudio?.playTap();
      window.cafeTimeline?.jumpToScene(4);
    });
  }

  const btnAddCart = document.getElementById('btn-mock-add-cart');
  if (btnAddCart) {
    btnAddCart.addEventListener('click', () => {
      window.cafeAudio?.playAddToCart();
      setTimeout(() => window.cafeTimeline?.jumpToScene(5), 600);
    });
  }

  const btnAdminConfirm = document.getElementById('btn-admin-confirm');
  if (btnAdminConfirm) {
    btnAdminConfirm.addEventListener('click', () => {
      window.cafeAudio?.playKitchenBell();
      btnAdminConfirm.textContent = '✓ Order Confirmed (Preparing)';
      btnAdminConfirm.style.background = '#F59E0B';
      setTimeout(() => window.cafeTimeline?.jumpToScene(7), 800);
    });
  }
});
