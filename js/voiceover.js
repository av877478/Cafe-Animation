// Little Talk Cafe - Voiceover & Narration Engine
// Delivers professional, friendly, confident English voiceover synced with scene captions

class CafeVoiceoverEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.isEnabled = true;
    this.volume = 0.9;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.currentUtterance = null;
    this.currentSceneId = -1;

    // 10 Scene Scripts exactly matching user requirements
    this.scripts = [
      {
        sceneId: 0,
        startSec: 0.5,
        title: "Cafe Introduction",
        text: "Welcome to Little Talk Cafe. Where good coffee, great conversations, and easy ordering come together.",
        caption: "Welcome to Little Talk Cafe — Good Coffee. Great Conversations. Easy Ordering."
      },
      {
        sceneId: 1,
        startSec: 7.5,
        title: "Customer Arrives",
        text: "Finding an open table is effortless with live table availability. Take a seat at your favorite spot.",
        caption: "Smart Table Availability: Green indicators show open seating in real time."
      },
      {
        sceneId: 2,
        startSec: 14.5,
        title: "Scan QR Code",
        text: "Simply scan the table QR code with your smartphone camera. No app download needed.",
        caption: "Scan. Browse. Order. Instant access right from your phone browser."
      },
      {
        sceneId: 3,
        startSec: 21.5,
        title: "Browse Coffee & Food",
        text: "Explore our rich digital menu featuring freshly brewed specialty coffee, artisan sandwiches, and gourmet desserts.",
        caption: "Browse handcrafted espresso drinks and fresh gourmet treats."
      },
      {
        sceneId: 4,
        startSec: 30.5,
        title: "Customize the Order",
        text: "Customize your drink your way. Select cup size, sweetness, and temperature with instant price updates.",
        caption: "Your Order, Your Way: Select size, sweetness, and custom barista notes."
      },
      {
        sceneId: 5,
        startSec: 40.5,
        title: "Checkout & Google Login",
        text: "Fast, frictionless checkout with Google One-Tap. Your cart is always securely preserved.",
        caption: "Simple. Secure. Convenient. 1-Tap Google Sign-in with flexible payment."
      },
      {
        sceneId: 6,
        startSec: 49.5,
        title: "Admin Receives Order",
        text: "The order instantly arrives on the cafe admin dashboard with table number, customizations, and live prep timer.",
        caption: "Real-Time Cafe Admin: Instant order notification and table tracking."
      },
      {
        sceneId: 7,
        startSec: 59.5,
        title: "Kitchen Preparation",
        text: "Baristas and chefs prepare your items in sync using the interactive Kitchen Display System.",
        caption: "Kitchen Display System (KDS): Live ticket progression from New to Ready."
      },
      {
        sceneId: 8,
        startSec: 68.5,
        title: "Live Order Tracking",
        text: "Follow your order status in real time. Pick it up fresh at the counter, or enjoy table service.",
        caption: "Live Order Tracking: Placed → Confirmed → Preparing → Ready!"
      },
      {
        sceneId: 9,
        startSec: 77.5,
        title: "Happy Ending & Brand Reveal",
        text: "Little Talk Cafe. Good Coffee. Great Conversations. Easy Ordering. Elevate your cafe today.",
        caption: "Little Talk Cafe — Smart QR Ordering & Seamless Cafe Management."
      }
    ];

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth.getVoices();
      // Prefer high-quality natural English voices
      const preferred = this.voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Guy')) &&
        v.lang.startsWith('en')
      );
      this.selectedVoice = preferred || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  speak(sceneId) {
    if (this.currentSceneId === sceneId) return;
    this.currentSceneId = sceneId;

    const script = this.scripts.find(s => s.sceneId === sceneId);
    if (!script) return;

    // Update UI subtitle immediately
    this.updateSubtitle(script.caption, script.text);

    if (!this.isEnabled || !this.synth) return;

    this.cancel();

    const utterance = new SpeechSynthesisUtterance(script.text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.highlightWord(event.charIndex, event.charLength, script.caption);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Voiceover utterance error:', e);
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  cancel() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  updateSubtitle(caption, fullText) {
    const subtitleEl = document.getElementById('teleprompter-caption');
    const titleEl = document.getElementById('teleprompter-title');
    if (subtitleEl) {
      subtitleEl.innerHTML = `<span class="caption-highlight">${caption}</span>`;
    }
    if (titleEl) {
      const script = this.scripts.find(s => s.caption === caption || s.text === fullText);
      titleEl.textContent = script ? `SCENE ${script.sceneId + 1}: ${script.title.toUpperCase()}` : '';
    }
  }

  highlightWord(charIndex, charLength, caption) {
    // Dynamic subtitle karaoke glow
    const subtitleEl = document.getElementById('teleprompter-caption');
    if (!subtitleEl) return;
    subtitleEl.classList.add('pulse-glow');
    setTimeout(() => subtitleEl.classList.remove('pulse-glow'), 180);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.volume;
    }
  }

  setEnabled(state) {
    this.isEnabled = state;
    if (!state) {
      this.cancel();
    }
  }
}

window.cafeVoiceover = new CafeVoiceoverEngine();
