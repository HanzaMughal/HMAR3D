# BurgerAR — WebAR Image-Target 3D Experience
### 🍔 Point camera at the marker → 3D burger appears!

---

## ⚡ Quick Start (5 steps)

### Step 1 — Compile the Marker Image → `.mind` file

> This is **required** before the AR can work. Do it once.

1. Go to 👉 **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
2. Click **"Upload"** and select `images (1).jpg` (your burger marker)
3. Click **"Start"** and wait ~10–30 seconds
4. Click **"Export"** → downloads `targets.mind`
5. Place `targets.mind` inside `assets/targets/targets.mind`

---

### Step 2 — Project Structure (already set up)

```
AR 3D/
├── index.html              ← Landing page
├── ar.html                 ← AR experience (camera)
├── qr.html                 ← QR code generator
├── css/
│   ├── style.css           ← Global design tokens
│   ├── landing.css         ← Landing page styles
│   └── ar.css              ← AR overlay styles
├── js/
│   ├── app.js              ← Landing page logic
│   ├── ar-controller.js    ← MindAR + Three.js engine
│   └── ui.js               ← Particles & visual effects
└── assets/
    ├── models/
    │   └── burger.glb      ← 3D model ✅
    ├── targets/
    │   └── targets.mind    ← ⚠️ COMPILE THIS (see Step 1)
    └── images/
        └── marker-preview.jpg ← Marker preview ✅
```

---

### Step 3 — Test Locally (optional)

> ⚠️ Camera requires HTTPS. Local testing works only with a dev server.

**Option A — Python (if installed):**
```bash
cd "c:\Users\hmdes\Desktop\AR 3D"
python -m http.server 8080
# Open: http://localhost:8080
```

**Option B — Node.js (if installed):**
```bash
npx serve .
# Open the URL shown in terminal
```

**Option C — VS Code Live Server extension:**
- Install "Live Server" extension → Right-click `index.html` → "Open with Live Server"

---

### Step 4 — Deploy to Hosting (REQUIRED for mobile camera)

**Vercel (Recommended — free):**
1. Go to https://vercel.com → Sign up / Log in
2. Click **"Add New Project"** → **"Upload"**
3. Drag & drop your entire `AR 3D` folder
4. Click **Deploy** — you'll get a live HTTPS URL like `https://burger-ar.vercel.app`

**Netlify (Alternative):**
1. Go to https://netlify.com
2. Drag & drop your `AR 3D` folder onto the dashboard
3. Instant deploy with HTTPS

---

### Step 5 — Generate QR Code

1. Open your live site URL in browser
2. Navigate to `/qr.html`
3. Paste your AR URL (e.g. `https://burger-ar.vercel.app/ar.html`)
4. Click **Generate** → **Download**
5. Print on menus, posters, flyers!

---

## 🎯 AR Configuration

Edit `js/ar-controller.js` to tweak the model appearance:

```javascript
const AR_CONFIG = {
  modelScale:      [0.12, 0.12, 0.12],  // ← Bigger number = larger model
  modelYOffset:    0,                    // ← Move model up/down above marker
  floatAmplitude:  0.015,               // ← How much it bobs up/down
  floatSpeed:      1.5,                 // ← Speed of floating animation
  rotateSpeed:     0.4,                 // ← Auto-rotation speed
};
```

---

## 📱 Device Compatibility

| Device              | Browser         | Status |
|---------------------|-----------------|--------|
| Android (modern)    | Chrome          | ✅ Full support |
| iPhone / iPad       | Safari          | ✅ Full support |
| iPhone / iPad       | Chrome          | ⚠️ Limited (use Safari) |
| Desktop             | Chrome          | ✅ Works (webcam) |
| Desktop             | Firefox         | ⚠️ May work |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| **"Target File Missing"** error | Compile `targets.mind` (Step 1) and place in `assets/targets/` |
| **Camera permission denied** | Allow camera in browser settings; ensure HTTPS |
| **Model too large / too small** | Adjust `modelScale` in `ar-controller.js` |
| **Model appears far away** | Adjust `modelYOffset` to a positive number |
| **Tracking is poor** | Use better lighting; use a high-contrast marker image |
| **iOS Safari won't open** | Ensure URL is HTTPS; check Settings → Safari → Camera |
| **QR doesn't scan** | Ensure good print resolution; test QR in multiple apps |

---

## 📚 Resources

- **MindAR.js Docs:** https://hiukim.github.io/mind-ar-js-doc/
- **MindAR Compiler:** https://hiukim.github.io/mind-ar-js-doc/tools/compile
- **Three.js Docs:** https://threejs.org/docs/
- **Vercel Deploy:** https://vercel.com
- **Netlify Deploy:** https://netlify.com

---

*Built with MindAR.js + Three.js · Designed by Hamza Mughal*
