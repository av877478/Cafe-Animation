// Little Talk Cafe - Voiceover & Narration Engine
// Delivers professional, friendly, confident English voiceover synced with Pixar-Disney 3D scenes

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

    // 6 Pixar-Disney Scene Scripts exactly matching user story
    this.scripts = [
      {
        sceneId: 0,
        startSec: 0.5,
        title: "Arrival in Rishikesh",
        text: "A cheerful morning in Ram Jhula, Rishikesh. Our friendly traveler walks into Little Talk Cafe, overlooking the holy Ganges river.",
        caption: "Little Talk Cafe • Ram Jhula, Rishikesh | Panoramic Ganges View & Table #4"
      },
      {
        sceneId: 1,
        startSec: 8.5,
        title: "Scan Table QR Code",
        text: "Aim your camera at Table four. Magical amber sparks leap from the wooden standee, instantly opening the glassmorphic web app with no download needed.",
        caption: "Table #4 - Scan to Order • Instant Glassmorphic Web App, No Download Needed"
      },
      {
        sceneId: 2,
        startSec: 16.5,
        title: "Customize & Order Now",
        text: "Scroll through mouthwatering 3D food cards. Add Oat Milk and Extra Caramel, then tap Order Now for an instant kitchen ticket with celebratory confetti.",
        caption: "Mouthwatering 3D Menu • Extra Caramel & Oat Milk • Order Sent to Kitchen! 🎉"
      },
      {
        sceneId: 3,
        startSec: 26.5,
        title: "Kitchen Match-Cut & Barista",
        text: "Match-cut into the kitchen! The Kitchen Display tablet chimes for Table four. Our jolly cartoon barista brews rich espresso with frothy latte art.",
        caption: "Kitchen Display Alert: Table #4 • Jolly Barista Crafting with Love & Silky Steam"
      },
      {
        sceneId: 4,
        startSec: 36.5,
        title: "Live Tracker & Delivery",
        text: "Back at Table four, live tracking glows from Brewing with Love to Order Ready! A smiling waiter delivers the fresh coffee and warm golden croissant.",
        caption: "Live Tracker: Brewing with Love ➔ Order Ready! Fresh Delivery to Table 4"
      },
      {
        sceneId: 5,
        startSec: 46.5,
        title: "Golden Hour Finale & Brand Reveal",
        text: "A cozy sip as the golden sunset kisses the Himalayas and river Ganges. Little Talk Cafe: Scan, Order, Enjoy.",
        caption: "Scan • Order • Enjoy | Little Talk Cafe, Ram Jhula, Rishikesh"
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
