// Little Talk Cafe - MP4 Video Recorder & Exporter
// Records 60fps video with synchronized audio and downloads strictly with .mp4 extension

class CafeRecorderEngine {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.selectedMimeType = 'video/mp4';
  }

  // Detect optimal MP4 or H264 supported codec
  getOptimalMimeType() {
    const types = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];

    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/mp4';
  }

  async startRecording(cinemaContainer) {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    try {
      const canvas = document.getElementById('cinema-canvas');
      if (!canvas || !canvas.captureStream) {
        alert('Canvas stream not available in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      // Stream 60fps from canvas
      const stream = canvas.captureStream(60);

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
          console.warn('Audio stream mix info:', err);
        }
      }

      this.selectedMimeType = this.getOptimalMimeType();
      this.recordedChunks = [];

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.selectedMimeType,
        videoBitsPerSecond: 20000000 // 20 Mbps crisp bitrate
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveMp4Recording();
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
      this.updateUI(true);

      // If at start or paused, auto-play for seamless capture
      if (window.cafeTimeline && !window.cafeTimeline.isPlaying) {
        window.cafeTimeline.play();
      }

    } catch (e) {
      console.error('Recording initialization error:', e);
      alert('Recording error on this browser: ' + e.message);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.updateUI(false);
    }
  }

  // Save strictly with .mp4 extension for universal media player playback
  saveMp4Recording() {
    if (this.recordedChunks.length === 0) return;

    // Use video/mp4 blob container
    const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Little_Talk_Cafe_Promo_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 2000);

    const statusBadge = document.getElementById('record-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'MP4 Downloaded!';
      setTimeout(() => statusBadge.textContent = '', 4500);
    }
  }

  updateUI(recording) {
    const btn = document.getElementById('btn-record');
    const badge = document.getElementById('record-status-badge');
    if (btn) {
      if (recording) {
        btn.classList.add('recording-active');
        btn.innerHTML = `<span class="rec-dot pulsing"></span> Stop & Save MP4`;
        if (badge) badge.textContent = 'RECORDING MP4 (60fps)';
      } else {
        btn.classList.remove('recording-active');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg> Record MP4 Video`;
        if (badge) badge.textContent = '';
      }
    }
  }
}

window.cafeRecorder = new CafeRecorderEngine();
