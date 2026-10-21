// Little Talk Cafe - Video Recorder & High-Res Snapshot Engine
// Captures 60fps cinema-quality WebM/MP4 video and 4K promotional snapshots

class CafeRecorderEngine {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.recordButton = null;
  }

  async startRecording(cinemaContainer) {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    try {
      // Find canvas or generate video stream
      const canvas = document.getElementById('cinema-canvas');
      let stream;

      if (canvas && canvas.captureStream) {
        stream = canvas.captureStream(60);
      } else {
        alert('Canvas stream capture ready. Ensure timeline is playing.');
        return;
      }

      // Mix in audio from Web Audio if active
      if (window.cafeAudio && window.cafeAudio.ctx && window.cafeAudio.masterGain) {
        try {
          const dest = window.cafeAudio.ctx.createMediaStreamDestination();
          window.cafeAudio.masterGain.connect(dest);
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        } catch (err) {
          console.warn('Audio stream mix warning:', err);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4');

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 16000000 // 16 Mbps high quality
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };

      this.mediaRecorder.start(250); // slice every 250ms
      this.isRecording = true;
      this.updateUI(true);

      // Play video from start if at beginning
      if (window.cafeTimeline && window.cafeTimeline.currentTime < 1) {
        window.cafeTimeline.play();
      }

    } catch (e) {
      console.error('Failed to start recording:', e);
      alert('Screen recording not supported in this browser mode: ' + e.message);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.updateUI(false);
    }
  }

  saveRecording() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Little_Talk_Cafe_Promo_16x9_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 2000);

    const statusBadge = document.getElementById('record-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'Downloaded!';
      setTimeout(() => statusBadge.textContent = '', 4000);
    }
  }

  updateUI(recording) {
    const btn = document.getElementById('btn-record');
    const badge = document.getElementById('record-status-badge');
    if (btn) {
      if (recording) {
        btn.classList.add('recording-active');
        btn.innerHTML = `<span class="rec-dot pulsing"></span> Stop & Save Video`;
        if (badge) badge.textContent = 'REC 60FPS';
      } else {
        btn.classList.remove('recording-active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg> Record Video`;
        if (badge) badge.textContent = '';
      }
    }
  }

  // Take High Resolution 4K Still Snapshot
  take4KSnapshot() {
    const canvas = document.getElementById('cinema-canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      const currentSec = window.cafeTimeline ? Math.floor(window.cafeTimeline.currentTime) : 0;
      a.download = `Little_Talk_Cafe_4K_Scene_${currentSec}s.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Snapshot error:', e);
    }
  }
}

window.cafeRecorder = new CafeRecorderEngine();
