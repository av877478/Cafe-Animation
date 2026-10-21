// Little Talk Cafe - Application Controller & User Interaction Glue

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Master Timeline
  if (window.cafeTimeline) {
    window.cafeTimeline.init();
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
  }

  // --- Chapter Selection Buttons ---
  document.querySelectorAll('.chapter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const sceneIdx = parseInt(pill.getAttribute('data-scene'), 10);
      if (!isNaN(sceneIdx) && window.cafeTimeline) {
        window.cafeTimeline.jumpToScene(sceneIdx);
      }
    });
  });

  // --- Play / Pause Controls ---
  const playBtn = document.getElementById('btn-play');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
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
      if (window.cafeTimeline) window.cafeTimeline.togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime - 5);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (window.cafeTimeline) window.cafeTimeline.seek(window.cafeTimeline.currentTime + 5);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
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

  // --- 4K Snapshot Capture ---
  const snapshotBtn = document.getElementById('btn-snapshot');
  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', () => {
      if (window.cafeRecorder) {
        window.cafeRecorder.take4KSnapshot();
      }
    });
  }

  // --- Video Recording (WebM 60fps) ---
  const recordBtn = document.getElementById('btn-record');
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      if (window.cafeRecorder) {
        const cinema = document.getElementById('cinema-container');
        window.cafeRecorder.startRecording(cinema);
      }
    });
  }

  // --- Fullscreen Cinema Toggle ---
  const fsBtn = document.getElementById('btn-fullscreen');
  const toggleFullscreen = () => {
    const container = document.getElementById('cinema-container');
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (fsBtn) {
    fsBtn.addEventListener('click', toggleFullscreen);
  }

  // --- Interactive Scene Micro-Interactions (Clickable elements) ---
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
