/* ============================================
   AR-CONTROLLER.JS — MindAR + Three.js Engine
   BurgerAR WebAR Experience
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

/* ── Config ── */
const AR_CONFIG = {
  modelPath:  './assets/models/burger.glb',
  targetPath: './assets/targets/targets.mind',
  modelScale: [0.12, 0.12, 0.12],   // Adjust if model appears too big/small
  modelYOffset: 0,                    // Vertical offset above marker (0 = flush)
  floatAmplitude: 0.015,              // Float animation height
  floatSpeed: 1.5,                    // Float animation speed (cycles per second)
  rotateSpeed: 0.4,                   // Auto-rotate speed (radians per second)
};

/* ── DOM refs ── */
const loadingScreen    = document.getElementById('loading-screen');
const errorScreen      = document.getElementById('error-screen');
const errorMsg         = document.getElementById('error-msg');
const instructOverlay  = document.getElementById('instructions-overlay');
const targetIndicator  = document.getElementById('target-indicator');
const loadingText      = document.getElementById('loading-text');

/* ── Helpers ── */
function showError(title, message) {
  if (errorScreen) {
    document.querySelector('.error-title').textContent = title;
    if (errorMsg) errorMsg.textContent = message;
    errorScreen.classList.add('visible');
  }
  if (loadingScreen) loadingScreen.classList.add('hidden');
  console.error('[BurgerAR]', title, message);
}

function updateLoadingText(text) {
  if (loadingText) loadingText.textContent = text;
}

function hideLoading() {
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

function showInstructions() {
  if (instructOverlay) instructOverlay.classList.remove('hidden');
}

function hideInstructions() {
  if (instructOverlay) {
    instructOverlay.classList.add('hidden');
  }
}

function showTargetFound() {
  if (targetIndicator) targetIndicator.classList.add('visible');
  hideInstructions();
}

function showTargetLost() {
  if (targetIndicator) targetIndicator.classList.remove('visible');
  showInstructions();
}

/* ── Check for .mind file existence ── */
async function checkTargetFile() {
  try {
    const res = await fetch(AR_CONFIG.targetPath, { method: 'HEAD' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch {
    return false;
  }
}

/* ── Main AR Init ── */
async function initAR() {
  // 1. Check browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError(
      '📵 Browser Not Supported',
      'Your browser does not support camera access. Please use Chrome on Android or Safari on iOS.'
    );
    return;
  }

  // 2. Check targets.mind exists
  updateLoadingText('Checking AR target file…');
  const targetExists = await checkTargetFile();
  if (!targetExists) {
    showError(
      '🎯 Target File Missing',
      'The targets.mind file was not found. You must compile your marker image first.'
    );
    if (window.__showMindFileSteps) window.__showMindFileSteps();
    return;
  }

  // 3. Initialize MindAR
  updateLoadingText('Starting camera…');
  let mindarThree;
  try {
    mindarThree = new MindARThree({
      container:        document.querySelector('#ar-container'),
      imageTargetSrc:   AR_CONFIG.targetPath,
      uiLoading:        'no',   // We use our own loading UI
      uiScanning:       'no',   // We use our own scan UI
      uiError:          'no',
    });
  } catch (err) {
    showError('⚙️ AR Init Failed', err.message || 'Could not initialize AR engine.');
    return;
  }

  const { renderer, scene, camera } = mindarThree;

  // 4. Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
  directionalLight.position.set(1, 2, 2);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xff9f1c, 0.6);
  fillLight.position.set(-2, -1, -1);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xffd700, 0.8, 5);
  rimLight.position.set(0, 2, -1);
  scene.add(rimLight);

  // 5. Load 3D Model
  updateLoadingText('Loading 3D burger model…');
  const loader = new GLTFLoader();

  let model      = null;
  let mixer      = null;
  let isVisible  = false;

  loader.load(
    AR_CONFIG.modelPath,

    /* onLoad */
    (gltf) => {
      model = gltf.scene;

      // Scale & position
      model.scale.set(...AR_CONFIG.modelScale);
      model.position.y = AR_CONFIG.modelYOffset;

      // Enable shadows & traverse materials
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 1.0;
          }
        }
      });

      // Anchor to image target #0
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(model);

      // Play built-in animations if any
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
        });
      }

      // ── Target Found ──
      anchor.onTargetFound = () => {
        isVisible = true;
        showTargetFound();
        // Pop-in effect
        model.scale.set(0, 0, 0);
        const targetScale = AR_CONFIG.modelScale;
        const popIn = () => {
          const t = Math.min((performance.now() - popStart) / 400, 1);
          const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
          model.scale.set(
            targetScale[0] * ease,
            targetScale[1] * ease,
            targetScale[2] * ease
          );
          if (t < 1) requestAnimationFrame(popIn);
        };
        const popStart = performance.now();
        popIn();
      };

      // ── Target Lost ──
      anchor.onTargetLost = () => {
        isVisible = false;
        showTargetLost();
      };

      updateLoadingText('Ready!');
    },

    /* onProgress */
    (xhr) => {
      if (xhr.total > 0) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        updateLoadingText(`Loading model… ${pct}%`);
      }
    },

    /* onError */
    (err) => {
      showError(
        '🍔 Model Load Failed',
        'Could not load the 3D burger model. Make sure burger.glb is in assets/models/.'
      );
      console.error('[BurgerAR] GLTFLoader error:', err);
    }
  );

  // 6. Start MindAR (opens camera)
  updateLoadingText('Requesting camera access…');
  try {
    await mindarThree.start();
  } catch (err) {
    if (err && (err.name === 'NotAllowedError' || (err.message && err.message.includes('Permission')))) {
      showError(
        '📷 Camera Permission Denied',
        'Please allow camera access when prompted, then reload the page. On iOS: Settings → Safari → Camera → Allow.'
      );
    } else {
      const errName = (err && err.name) ? `[${err.name}] ` : '';
      const errMsg  = (err && err.message) ? err.message : 'Make sure you are using a secure connection (HTTPS) and have a working camera.';
      showError('📷 Camera Error', errName + errMsg);
    }
    return;
  }

  // 7. Hide loading, show AR UI
  hideLoading();
  showInstructions();

  // 8. Animation loop
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime();
    const delta   = clock.getDelta();

    // Animate model: float + rotate
    if (model && isVisible) {
      model.position.y =
        AR_CONFIG.modelYOffset +
        Math.sin(elapsed * AR_CONFIG.floatSpeed * Math.PI * 2) * AR_CONFIG.floatAmplitude;

      model.rotation.y += AR_CONFIG.rotateSpeed * 0.016; // ~60fps
    }

    // Update animation mixer
    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);
  });

  // 9. Handle page unload — stop AR cleanly
  window.addEventListener('beforeunload', () => {
    try { mindarThree.stop(); } catch (_) {}
    renderer.setAnimationLoop(null);
  });
}

// Wait for user gesture to start AR (Fixes mobile browser permission blocks)
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-ar-btn');

if (startBtn && startOverlay) {
  startBtn.addEventListener('click', () => {
    // Hide overlay
    startOverlay.style.display = 'none';
    
    // Start AR Engine
    initAR().catch(err => {
      showError('⚠️ Initialization Error', (err && err.message) ? err.message : 'An unknown error occurred.');
      console.error('[BurgerAR] Init Error:', err);
    });
  });
} else {
  // Fallback if overlay is missing
  initAR().catch(err => {
    console.error('[BurgerAR] Init Error:', err);
  });
}
