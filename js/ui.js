/* ============================================
   UI.JS — Particle System & Visual Effects
   BurgerAR WebAR Experience
   ============================================ */

/* ── Particle System ── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = -Math.random() * 0.6 - 0.2;
      this.alpha = Math.random() * 0.5 + 0.1;
      // Alternate between orange and gold
      this.color = Math.random() > 0.5 ? '255,107,53' : '255,215,0';
    }
    update() {
      this.x     += this.vx;
      this.y     += this.vy;
      this.alpha -= 0.0008;
      if (this.alpha <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = `rgb(${this.color})`;
      ctx.shadowColor = `rgb(${this.color})`;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnParticles(count) {
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  resize();
  spawnParticles(80);
  animate();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    animate();
  });
})();

/* ── Scroll-triggered fade-ins ── */
(function initScrollAnimations() {
  const items = document.querySelectorAll('.feature-item');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animation =
          `fadeInUp 0.6s ${i * 0.1}s ease both`;
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(el => {
    el.style.opacity = '0';
    io.observe(el);
  });
})();

/* ── Tilt effect on marker card ── */
(function initTilt() {
  const card = document.querySelector('.marker-card');
  if (!card) return;
  const wrapper = card.parentElement;

  wrapper.addEventListener('mousemove', (e) => {
    const rect   = wrapper.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const rotX   = -dy * 8;
    const rotY   =  dx * 8;
    card.style.transform =
      `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
  });
  wrapper.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s linear';
  });
})();

/* ── Marker image fallback ── */
(function markerFallback() {
  const img = document.getElementById('marker-preview');
  if (!img) return;
  img.addEventListener('error', () => {
    // Show a placeholder with instructions
    const container = img.closest('.marker-image-container');
    if (!container) return;
    img.style.display = 'none';
    const ph = document.createElement('div');
    ph.style.cssText = `
      width:100%;height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:12px;
      background:rgba(255,107,53,0.05);color:rgba(255,255,255,0.4);
      font-size:0.8rem;text-align:center;padding:20px;
    `;
    ph.innerHTML = '<span style="font-size:3rem">🖼️</span><span>Marker image not found.<br>Place <strong>images (1).jpg</strong> in assets/images/</span>';
    container.appendChild(ph);
  });
})();
