import { playBlastSound } from "../utils/audio";
import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import InteractiveTerminal from "./InteractiveTerminal";
import "../styles/cuboid.css";

export default function Hero() {
  const nukeWrapRef = useRef(null);
  const nukeImgRef = useRef(null);
  const nukeFlashRef = useRef(null);
  const nukeCanvasRef = useRef(null);
  const nukeHudRef = useRef(null);
  const nukeSecretRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const typedElRef = useRef(null);

  // Stats Counter state
  const [wscValue, setWscValue] = useState(0);

  useEffect(() => {
    // 2. Stats Counter Animation
    const wscEl = document.getElementById("wsc");
    let wscObserver = null;
    if (wscEl) {
      let done = false;
      wscObserver = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && !done) {
            done = true;
            const s = performance.now();
            const T = 14500;
            const DU = 1800;
            const t = (now) => {
              const p = Math.min((now - s) / DU, 1);
              setWscValue(Math.round(T * (1 - Math.pow(1 - p, 3))).toLocaleString());
              if (p < 1) requestAnimationFrame(t);
              else setWscValue(T.toLocaleString() + "+");
            };
            requestAnimationFrame(t);
          }
        },
        { threshold: 0.6 }
      );
      wscObserver.observe(wscEl);
    }

    return () => {
      if (wscObserver) wscObserver.disconnect();
    };
  }, []);

  // 3. Nuke Beast Animation Logic
  useEffect(() => {
    const wrap = nukeWrapRef.current;
    if (!wrap) return;
    const img = nukeImgRef.current;
    const flash = nukeFlashRef.current;
    const canvas = nukeCanvasRef.current;
    const hud = nukeHudRef.current;
    const secret = nukeSecretRef.current;
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    const W = 800, H = 800;
    canvas.width = W; canvas.height = H;

    let particles = [], animId = null, phase = 'idle';
    let fxAnimId = null, orbitalAnimId = null;
    const CX = W / 2, CY = H / 2;
    
    if (secret) {
      const label = secret.querySelector('.secret-label');
      if (label) label.textContent = '[ Tap to Reveal ]';
    }

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
        this.vy -= 1.2;
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
        this.vy = -(Math.random() * 8 + 6);
        this.size = Math.random() * 50 + 30;
        this.life = 1;
        this.decay = Math.random() * 0.004 + 0.002;
        this.spreadPhase = false;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
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

    function detonate() {
      phase = 'blast';
      playBlastSound();
      particles = [];
      if (secret) secret.classList.add('gone');

      wrap.style.animation = 'nuke-shake 0.04s infinite';

      setTimeout(() => {
        flash.style.transition = 'none';
        flash.style.opacity = '1';
        img.style.transition = 'transform 0.15s, opacity 0.15s, filter 0.15s';
        img.style.transform = 'scale(4)';
        img.style.opacity = '0';
        img.style.filter = 'brightness(1000%) blur(30px)';
      }, 300);

      setTimeout(() => {
        const isMob = window.innerWidth < 768;
        const fbCount = isMob ? 40 : 120;
        const spCount = isMob ? 100 : 300;
        for (let i = 0; i < fbCount; i++) particles.push(new Fireball());
        for (let i = 0; i < spCount; i++) particles.push(new Spark());
        particles.push(new Shockwave());
        if (!animId) loop();
        flash.style.transition = 'opacity 0.8s ease-out';
        flash.style.opacity = '0';
      }, 500);

      setTimeout(() => {
        particles.push(new Shockwave());
      }, 700);

      setTimeout(() => {
        const isMob = window.innerWidth < 768;
        const mcCount = isMob ? 30 : 100;
        for (let i = 0; i < mcCount; i++) particles.push(new MushroomChunk());
      }, 800);

      setTimeout(() => {
        const isMob = window.innerWidth < 768;
        const emCount = isMob ? 50 : 150;
        for (let i = 0; i < emCount; i++) particles.push(new Ember());
      }, 1200);

      setTimeout(() => {
        wrap.style.animation = 'none';
      }, 1500);

      setTimeout(() => {
        if (phase !== 'blast') return;
        phase = 'reveal';
        cinematicReveal();
      }, 2800);
    }

    function revealPicture() {
      img.style.transition = 'none';
      img.style.transform = 'perspective(1000px) translateZ(-50px) scale(0.9)';
      img.style.opacity = '0';
      img.style.clipPath = 'none';
      img.style.filter = 'none';
      setTimeout(() => {
        img.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s';
        img.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
        img.style.opacity = '1';
      }, 100);
      setTimeout(() => { if (hud) hud.classList.add('active'); }, 600);
    }

    function cinematicReveal() {
      // Just reveal the photo wrapper and trigger the cuboid visibility
      img.style.transition = 'opacity 1s ease-in, transform 1s cubic-bezier(0.25, 1, 0.5, 1)';
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.style.filter = 'none';
      img.style.clipPath = 'none';
      
      // Also show HUD
      if (hud) {
        hud.classList.add('active');
        hud.classList.add('sacred-mode');
      }
      wrap.classList.add('revealed');
    }


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

    const handleClick = () => {
      if (phase === 'idle') {
        detonate();
      }
    };
    
    wrap.addEventListener('click', handleClick);
    
    return () => {
      wrap.removeEventListener('click', handleClick);
      if (animId) cancelAnimationFrame(animId);
      if (fxAnimId) cancelAnimationFrame(fxAnimId);
      if (orbitalAnimId) cancelAnimationFrame(orbitalAnimId);
    };
  }, []);

  // 4. Real 3D Cuboid Rotation with Inertia
  useEffect(() => {
    const cube = document.getElementById("real-cuboid");
    if (!cube) return;

    let rX = -15, rY = -25;
    let drag = false;
    let startX, startY;
    let baseRX = rX, baseRY = rY;
    
    let vX = 0, vY = 0;
    let lastDragX, lastDragY, lastDragTime;
    let animId;
    let lastTime = performance.now();

    const CONSTANT_SPEED = 0.05; // Base rotation speed

    function render(time) {
      const dt = time - lastTime;
      lastTime = time;
      
      if (!drag) {
        if (Math.abs(vX) > 0.001 || Math.abs(vY) > 0.001) {
          // Inertia
          rY += vX * dt;
          rX += vY * dt;
          vX *= 0.95; // Friction
          vY *= 0.95;
        } else {
          // Constant rotation
          rY += CONSTANT_SPEED * dt;
        }
      }
      
      cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    const onDown = (e) => {
      drag = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      baseRX = rX;
      baseRY = rY;
      lastDragX = startX;
      lastDragY = startY;
      lastDragTime = performance.now();
      vX = 0;
      vY = 0;
      cube.style.cursor = 'grabbing';
    };
    
    const onMove = (e) => {
      if (!drag) return;
      const curX = e.clientX || (e.touches && e.touches[0].clientX);
      const curY = e.clientY || (e.touches && e.touches[0].clientY);
      if (curX === undefined || curY === undefined) return;
      
      const dx = curX - startX;
      const dy = curY - startY;
      
      rY = baseRY + dx * 0.5;
      rX = baseRX - dy * 0.5;
      
      const now = performance.now();
      const dt = Math.max(1, now - lastDragTime); // Prevent div by 0
      
      vX = (curX - lastDragX) * 0.5 / dt;
      vY = -(curY - lastDragY) * 0.5 / dt;
      
      lastDragX = curX;
      lastDragY = curY;
      lastDragTime = now;
    };
    
    const onUp = () => {
      drag = false;
      cube.style.cursor = 'grab';
      
      if (performance.now() - lastDragTime > 100) {
        vX = 0;
        vY = 0;
      }
    };

    cube.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    
    cube.addEventListener('touchstart', onDown, {passive: true});
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('touchend', onUp);
    
    const onTouchMove = (e) => {
      if (drag) e.preventDefault();
    };
    cube.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cube.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cube.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      cube.removeEventListener('touchmove', onTouchMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section id="home">
      <div className="hero-grid">
        <div className="hl">
          <div className="h-badge"><span className="bdot"></span>open to opportunities</div>
          <h1 className="h-name">Rajesh<br/><span className="h-name-g" data-text="Pandit">Pandit</span></h1>
          <div className="h-code">
            <span className="kw">const</span> <span className="ka"> role</span>
            <span className="ko"> = </span>
            <span className="ks">"Engineering Student"</span>
            <span className="ko"> // scale&#x221E;</span>
          </div>
          <InteractiveTerminal />
          <p className="h-desc"><strong>Backend engineer</strong> building distributed infrastructure, real-time platforms,
            and APIs engineered to handle massive concurrency. I think in systems — not just code.</p>
          <div className="h-actions">
            <a href="#work" className="btn btn-a"><i className="bx bx-code-block"></i>See My Work</a>
            <a href="#contact" className="btn btn-b">Get in Touch</a>
          </div>
          <div className="h-soc">
            <a href="https://github.com/rashq-01" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i
                className="bx bxl-github"></i></a>
            <a href="https://linkedin.com/in/rashq" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i
                className="bx bxl-linkedin"></i></a>
            <a href="https://leetcode.com/u/rashq_01/" target="_blank" rel="noopener noreferrer" aria-label="LeetCode"><i
                className="bx bx-code"></i></a>
            <a href="https://x.com/rashq_01" target="_blank" rel="noopener noreferrer" aria-label="X"><i
                className="bx bxl-twitter"></i></a>
            <a href="https://facebook.com/rashq0" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i
                className="bx bxl-facebook"></i></a>
            <a href="https://instagram.com/rashq_01" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i
                className="bx bxl-instagram"></i></a>
          </div>
          <div className="h-stats">
            <div className="stat"><span className="stat-v" id="wsc">{wscValue}</span><span className="stat-l">msg/sec peak</span></div>
            <div className="stat"><span className="stat-v">5x</span><span className="stat-l">Node cluster</span></div>
            <div className="stat"><span className="stat-v">4</span><span className="stat-l">Projects shipped</span></div>
            <div className="stat"><span className="stat-v">21</span><span className="stat-l">Years old</span></div>
          </div>
        </div>
        
        {/* Photo */}
        <div className="ph-col">
          <div className="ph-sc real-cuboid-scene">
              <div className="nuke-beast" id="nuke-beast" ref={nukeWrapRef}>
                <div className="nuke-secret" id="nuke-secret" ref={nukeSecretRef}>
                  <div className="secret-label">[ Tap to Reveal ]</div>
                </div>
                <div className="nuke-flash" id="nuke-flash" ref={nukeFlashRef}></div>
                <canvas className="nuke-canvas" id="nuke-canvas" ref={nukeCanvasRef}></canvas>
                <canvas className="fx-canvas" id="fx-canvas" ref={fxCanvasRef}></canvas>


                <div className="nuke-image-wrapper" id="nuke-image" ref={nukeImgRef} style={{opacity: 0}}>
                  <div className="real-cuboid" id="real-cuboid">
                    <div className="cube-face cube-front"><img src="/pic_1.jpg" alt="Rajesh Pandit" /></div>
                    <div className="cube-face cube-back"><img src="/pic_1.jpg" alt="Rajesh Pandit" /></div>
                    <div className="cube-face cube-left"><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="cube-face cube-right"><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="cube-face cube-top"><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="cube-face cube-bottom"><img src="/pic_1.jpg" alt="Rajesh Pandit" /></div>
                  </div>
                </div>
              </div>
            <div className="ph-bdg" style={{ position: 'absolute', bottom: '-40px', right: '20px', zIndex: 10 }}>
              <div className="ph-dot"></div>
              <span className="ph-txt">Open to opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
