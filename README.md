# Little Talk Cafe — Smart QR Ordering & Cafe Management System
## Premium Cinematic Promotional Animation Video (4K, 16:9, 80 Seconds)

A cinematic, interactive promotional video engine showcasing the complete customer and cafe staff journey for **Little Talk Cafe — Smart QR Ordering & Cafe Management System**.

---

### 🎬 Video Specifications
* **Duration:** 80 Seconds (Timings calibrated across 10 scenes)
* **Aspect Ratio:** 16:9 Widescreen (Responsive 4K Canvas rendering)
* **Visual Style:** Modern 3D animation mixed with realistic product UI animation, warm volumetric lighting, depth of field, and procedural particles (coffee cup steam, warm cafe bokeh, falling coffee beans).
* **Color Palette:** Warm brown (`#2C1810`), roasted coffee (`#4A2E1B`), rich amber (`#D58D49`), foam cream (`#EAD8C0`), soft off-white (`#FAF6F0`), and emerald green (`#10B981`).
* **Audio Landscape:**
  - **Ambient Music:** Procedural warm Lo-Fi cafe jazz (Rhodes 7th/9th chords + upright bass line + vinyl room tone) synthesized via Web Audio API.
  - **Dynamic SFX:** Espresso steam wand hiss, camera shutter, laser QR scan confirmation beep, UI clicks, Admin incoming order alert chime ("Ding-Dong!"), kitchen brass bell, and order ready fanfare.
  - **Voiceover:** Professional English narration with friendly, confident tone (via Web Speech API with automatic natural voice selection) synchronized with real-time subtitle teleprompter.
* **Export Features:**
  - Built-in **60fps Video Recorder** (`Record Video` button) exporting high-bitrate WebM/MP4 video with audio directly to your downloads.
  - **4K Snapshot Capture** (`4K Snapshot` button) for promotional posters and social media marketing.

---

### ⏱️ Scene Breakdown & Script Timetable

| Scene | Timestamp | Title | Key Visuals & Interactions | Voiceover Narration |
|:-----:|:---------:|:------|:---------------------------|:--------------------|
| **1** | `00:00 - 00:07` | **Cafe Introduction** | Warm modern cafe interior, morning sunlight, espresso machine in background, floating brand emblem card. | *"Welcome to Little Talk Cafe. Where good coffee, great conversations, and easy ordering come together."* |
| **2** | `00:07 - 00:14` | **Customer Arrives** | Subtle animated cafe floor plan HUD (green available / red busy tables). Customer selects Table 4; acrylic QR code stand highlighted. | *"Finding an open table is effortless with live table availability. Take a seat at your favorite spot."* |
| **3** | `00:14 - 00:21` | **Scan QR Code** | Customer POV smartphone camera viewfinder focusing on Table 4 QR stand, laser scan sweep, seamless dissolve into mobile site. | *"Simply scan the table QR code with your smartphone camera. No app download needed."* |
| **4** | `00:21 - 00:30` | **Browse Menu** | Mobile menu with category tabs (Coffee, Tea, Cold Drinks, Food, Desserts). Taps Coffee, reveals artisan Cappuccino, Latte, Espresso with photos and prices. | *"Explore our rich digital menu featuring freshly brewed specialty coffee, artisan sandwiches, and gourmet desserts."* |
| **5** | `00:30 - 00:40` | **Customize Order** | Detailed product sheet: 2 cups, Medium size (+$0.50), Less Sugar (50%), "Extra hot" note. Dynamic price counter ($9.50) + cart drawer ($17.50 total). | *"Customize your drink your way. Select cup size, sweetness, and temperature with instant price updates."* |
| **6** | `00:40 - 00:49` | **Google Checkout** | Order summary (Alex Morgan, Table 4, Cafe Service). Customer taps Submit Order -> 1-Tap Google Sign-In modal appears, authenticates seamlessly with cart preserved. | *"Fast, frictionless checkout with Google One-Tap. Your cart is always securely preserved."* |
| **7** | `00:49 - 00:59` | **Admin Dashboard** | Camera pans to 27" desktop monitor. "Ding-Dong!" alert chime. New order #1042 popover with items and notes. Admin selects 10m prep time and confirms. | *"The order instantly arrives on the cafe admin dashboard with table number, customizations, and live prep timer."* |
| **8** | `00:59 - 01:08` | **Kitchen Prep (KDS)** | Kitchen Display System Kanban (New → Preparing → Ready) with 10:00 countdown timer, intercut with barista pouring silky latte art. Order marked Ready with kitchen bell. | *"Baristas and chefs prepare your items in sync using the interactive Kitchen Display System."* |
| **9** | `01:08 - 01:17` | **Live Order Tracking** | Customer phone order timeline (Placed → Confirmed → Preparing → Ready). "Your order is ready!" push alert; waiter delivers order to Table 4. | *"Follow your order status in real time. Pick it up fresh at the counter, or enjoy table service."* |
| **10** | `01:17 - 01:20` | **Grand Brand Reveal** | Joyful friends enjoying coffee together, 3D floating coffee beans, warm golden ambient glow, logo crescendo with supporting text. | *"Little Talk Cafe. Good Coffee. Great Conversations. Easy Ordering. Elevate your cafe today."* |

---

### 🚀 Running the Promotional Video Engine

The application is completely self-contained with **zero external npm dependencies**.

1. **Start the local server (if not already running):**
   ```bash
   node server.js
   ```
2. **Open in your browser:**
   ```text
   http://localhost:3000/
   ```

### 🎮 Keyboard Shortcuts & Director Controls
* `Spacebar`: Play / Pause playback
* `Left / Right Arrow`: Jump backward / forward 5 seconds
* `F`: Toggle Fullscreen Cinema mode
* `Chapter Pills (1-10)`: Instantly seek to any scene
* `Speed Selector`: Adjust playback speed (0.75x, 1.0x, 1.25x, 1.5x)
* `Audio Dials`: Individually adjust Voiceover narration, Lo-Fi Jazz music, and Sound FX volumes
* `Record Video`: Exports a 60fps WebM/MP4 video file directly to disk
* `4K Snapshot`: Captures a high-resolution PNG image of the current frame
