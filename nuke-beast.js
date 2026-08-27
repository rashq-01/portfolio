(function () {
  'use strict';
  const init = () => {
    const wrap = document.getElementById('nuke-beast');
    if (!wrap) return;
    const img = document.getElementById('nuke-image');
    const flash = document.getElementById('nuke-flash');
    const canvas = document.getElementById('nuke-canvas');
    const hud = document.getElementById('nuke-hud');
    const secret = document.getElementById('nuke-secret');
    const ctx = canvas.getContext('2d', { alpha: true });
    const W = 1400, H = 1400;
    canvas.width = W; canvas.height = H;

    let particles = [], animId = null, phase = 'idle';
    const CX = W / 2, CY = H / 2;
    
    // Mobile detection for the secret label
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (secret) {
      const label = secret.querySelector('.secret-label');
      if (label) label.textContent = isMobile ? '[ Tap to Reveal ]' : '[ Hover to Reveal ]';
    }

    // ── Particle classes ──
    class Fireball {
      constructor() {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 12 + 2;
        this.x = CX; this.y = CY;
        this.vx = Math.cos(a) * spd;
        this.vy = Math.sin(a) * spd;
        this.size = Math.random() * 60 + 20;
        this.life = 1;
        this.decay = Math.random() * 0.008 + 0.003;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.96; this.vy *= 0.96;
        this.vy -= 1.2; // rise
        this.life -= this.decay;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        const r = this.size * Math.max(0.3, this.life);
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
        if (this.life > 0.7) {
          g.addColorStop(0, `rgba(255,255,255,${this.life})`);
          g.addColorStop(0.4, `rgba(255,230,100,${this.life * 0.9})`);
          g.addColorStop(1, `rgba(255,80,0,0)`);
        } else if (this.life > 0.35) {
          g.addColorStop(0, `rgba(255,140,0,${this.life})`);
          g.addColorStop(0.5, `rgba(200,40,0,${this.life * 0.7})`);
          g.addColorStop(1, `rgba(80,0,0,0)`);
        } else {
          g.addColorStop(0, `rgba(80,30,0,${this.life})`);
          g.addColorStop(1, `rgba(30,10,0,0)`);
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class MushroomChunk {
      constructor() {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 6 + 1;
        this.x = CX + (Math.random() - 0.5) * 40;
        this.y = CY;
        this.vx = Math.cos(a) * spd * 0.4;
        this.vy = -(Math.random() * 8 + 6); // Strong upward
        this.size = Math.random() * 50 + 30;
        this.life = 1;
        this.decay = Math.random() * 0.004 + 0.002;
        this.spreadPhase = false;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        // Stem rises fast, then spreads at top (mushroom cap)
        if (this.y < CY - 250 && !this.spreadPhase) {
          this.spreadPhase = true;
          this.vx = (Math.random() - 0.5) * 12;
          this.vy *= 0.2;
        }
        this.vy *= 0.98;
        this.vx *= 0.99;
        this.life -= this.decay;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        const r = this.size * Math.max(0.5, this.life) * 1.5;
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
        g.addColorStop(0, `rgba(180,80,20,${this.life * 0.6})`);
        g.addColorStop(0.5, `rgba(100,40,10,${this.life * 0.4})`);
        g.addColorStop(1, `rgba(40,15,5,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Spark {
      constructor() {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 40 + 10;
        this.x = CX; this.y = CY;
        this.vx = Math.cos(a) * spd;
        this.vy = Math.sin(a) * spd;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.95; this.vy *= 0.95;
        this.vy -= 0.3;
        this.life -= this.decay;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.life > 0.6 ? '#fff' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Shockwave {
      constructor() {
        this.radius = 0;
        this.maxRadius = 650;
        this.speed = 25;
        this.life = 1;
      }
      update() {
        this.radius += this.speed;
        this.speed *= 0.97;
        this.life = 1 - (this.radius / this.maxRadius);
      }
      draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life * 0.6;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 8 * this.life;
        ctx.beginPath();
        ctx.arc(CX, CY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        // Second inner ring (thermal distortion)
        ctx.globalAlpha = this.life * 0.3;
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 30 * this.life;
        ctx.beginPath();
        ctx.arc(CX, CY, this.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    class Ember {
      constructor() {
        this.x = CX + (Math.random() - 0.5) * 300;
        this.y = CY + (Math.random() - 0.5) * 200;
        this.vy = -(Math.random() * 2 + 0.5);
        this.vx = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 2.5 + 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.005 + 0.003;
        this.flicker = Math.random() * 10;
      }
      update() {
        this.x += this.vx + Math.sin(this.flicker) * 0.3;
        this.y += this.vy;
        this.flicker += 0.1;
        this.life -= this.decay;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life * (0.5 + Math.sin(this.flicker) * 0.3);
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Detonation sequence ──
    function detonate() {
      phase = 'blast';
      particles = [];
      if (secret) secret.classList.add('gone');

      // Stage 1: Camera shake
      wrap.style.animation = 'nuke-shake 0.04s infinite';

      // Stage 2: Flash (300ms)
      setTimeout(() => {
        flash.style.transition = 'none';
        flash.style.opacity = '1';
        // Vaporize image
        img.style.transition = 'transform 0.15s, opacity 0.15s, filter 0.15s';
        img.style.transform = 'scale(4)';
        img.style.opacity = '0';
        img.style.filter = 'brightness(1000%) blur(30px)';
      }, 300);

      // Stage 3: Fireball (500ms)
      setTimeout(() => {
        for (let i = 0; i < 250; i++) particles.push(new Fireball());
        for (let i = 0; i < 600; i++) particles.push(new Spark());
        particles.push(new Shockwave());
        if (!animId) loop();
        // Fade flash to reveal fireball
        flash.style.transition = 'opacity 0.8s ease-out';
        flash.style.opacity = '0';
      }, 500);

      // Stage 4: Second shockwave
      setTimeout(() => {
        particles.push(new Shockwave());
      }, 700);

      // Stage 5: Mushroom cloud
      setTimeout(() => {
        for (let i = 0; i < 200; i++) particles.push(new MushroomChunk());
      }, 800);

      // Stage 6: Lingering embers
      setTimeout(() => {
        for (let i = 0; i < 300; i++) particles.push(new Ember());
      }, 1200);

      // Stage 7: Stop camera shake
      setTimeout(() => {
        wrap.style.animation = 'none';
      }, 1500);

      // Stage 8: Picture Reveal — The God-Tier Flexing Entrance
      setTimeout(() => {
        if (phase !== 'blast') return;
        phase = 'reveal';
        revealPicture();
      }, 2800);
    }

    function revealPicture() {
      // Step 1: Fade-in setup
      img.style.transition = 'none';
      img.style.transform = 'scale(0.9)';
      img.style.opacity = '0';
      img.style.filter = 'brightness(200%) blur(10px)';
      img.style.clipPath = 'none';

      // Step 2: Push forward into full brightness
      setTimeout(() => {
        img.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s, filter 1s';
        img.style.transform = 'scale(1)';
        img.style.opacity = '1';
        img.style.filter = 'brightness(100%) blur(0px)';
      }, 100);

      // Step 3: Activate the professional HUD frame
      setTimeout(() => {
        if (hud) hud.classList.add('active');
      }, 600);
    }

    function hideAll() {
      phase = 'idle';
      wrap.style.animation = 'none';
      flash.style.opacity = '0';
      if (hud) hud.classList.remove('active');
      if (secret) secret.classList.remove('gone');

      // Smooth image return
      img.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s, filter 0.4s';
      img.style.transform = 'scale(1)';
      img.style.opacity = '1';
      img.style.filter = 'none';
      img.style.clipPath = 'none';

      // Let particles die
      particles.forEach(p => { p.life = -1; });
    }

    // ── Render loop ──
    function loop() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';

      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        p.update();
        p.draw(ctx);
        alive = true;
      }

      if (alive) {
        animId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animId);
        animId = null;
        ctx.clearRect(0, 0, W, H);
      }
    }

    // ── Events ──
    // All devices (mobile and desktop): Tap/Click to reveal (once)
    wrap.addEventListener('click', () => {
      if (phase === 'idle') {
        detonate();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 150);
  }
})();
