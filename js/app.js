/* ============================================
   APP.JS — Landing Page App Logic
   BurgerAR WebAR Experience
   ============================================ */

'use strict';

/* ── Device & Browser Detection ── */
const DeviceInfo = {
  isIOS:       /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid:   /Android/.test(navigator.userAgent),
  isMobile:    /Mobi|Android|iPhone|iPad/.test(navigator.userAgent),
  isSafari:    /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isChrome:    /Chrome/.test(navigator.userAgent),
  supportsAR:  () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
};

/* ── Start AR Button Handler ── */
(function initCTA() {
  const btn = document.getElementById('start-ar-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    // Ripple effect
    const rect   = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      top:${e.clientY - rect.top  - size / 2}px;
      left:${e.clientX - rect.left - size / 2}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);animation:rippleEffect 0.5s ease forwards;
      pointer-events:none;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    // Browser check — warn if not HTTPS in production
    if (location.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(location.hostname)) {
      const warn = confirm(
        '⚠️ Camera access requires HTTPS.\n\n' +
        'You are currently on HTTP. The AR camera may not work.\n\n' +
        'Continue anyway?'
      );
      if (!warn) { e.preventDefault(); return; }
    }

    // On iOS, show permission tip
    if (DeviceInfo.isIOS && DeviceInfo.isSafari) {
      sessionStorage.setItem('ar_show_ios_tip', '1');
    }
  });

  // Add ripple keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleEffect {
      to { transform: scale(2.5); opacity: 0; }
    }`;
  document.head.appendChild(style);
})();

/* ── QR Code redirect helper ── */
(function checkQRParam() {
  const params = new URLSearchParams(location.search);
  if (params.get('ar') === '1') {
    // If opened via QR directly pointing to index?ar=1, redirect to AR
    window.location.replace('./ar.html');
  }
})();

/* ── Animate CTA button entrance ── */
(function animateCTA() {
  const btn = document.getElementById('start-ar-btn');
  if (!btn) return;
  btn.style.opacity = '0';
  btn.style.transform = 'translateY(20px)';
  setTimeout(() => {
    btn.style.transition = 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease';
    btn.style.opacity = '1';
    btn.style.transform = 'translateY(0)';
  }, 600);
})();
