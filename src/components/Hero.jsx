import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';

export default function Hero() {
  const nukeWrapRef = useRef(null);
  const nukeImgRef = useRef(null);
  const nukeFlashRef = useRef(null);
  const nukeCanvasRef = useRef(null);
  const nukeHudRef = useRef(null);
  const nukeSecretRef = useRef(null);
  const typedElRef = useRef(null);

  // Stats Counter state
  const [wscValue, setWscValue] = useState(0);

  useEffect(() => {
    // 1. Typed.js
    const typed = new Typed(typedElRef.current, {
      strings: [
        "sudo su",
        "git add .",
        "redis-cli",
        "npm run dev"
      ],
      typeSpeed: 48,
      backSpeed: 24,
      backDelay: 1400,
      loop: true,
      showCursor: false,
    });

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
      typed.destroy();
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
        revealPicture();
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

      setTimeout(() => {
        if (hud) hud.classList.add('active');
      }, 600);
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
    };
  }, []);

  // 4. Cuboid 3D Rotation
  useEffect(() => {
    const cube = document.getElementById("cuboid");
    if (!cube) return;

    let rX = -10, rY = -20;
    let drag = false;
    let startX, startY;
    let baseRX = rX, baseRY = rY;
    let autoRotate = true;
    let lastTime = performance.now();
    let speed = 0.02;
    
    let vX = 0, vY = 0;
    let lastDragX, lastDragY, lastDragTime;
    let animId;

    function updateFaces() {
      cube.style.setProperty('--w', `${cube.offsetWidth}px`);
      cube.style.setProperty('--h', `${cube.offsetHeight}px`);
    }
    
    window.addEventListener('resize', updateFaces, { passive: true });
    updateFaces();

    function render(time) {
      const dt = time - lastTime;
      lastTime = time;
      
      if (!drag) {
        if (Math.abs(vX) > 0.001 || Math.abs(vY) > 0.001) {
          rY += vX * dt;
          rX += vY * dt;
          vX *= 0.95;
          vY *= 0.95;
        } else if (autoRotate) {
          rY += speed * dt;
        }
      }
      
      cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    const onDown = (e) => {
      drag = true;
      autoRotate = false;
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
      const dt = now - lastDragTime;
      if (dt > 0) {
        vX = (curX - lastDragX) * 0.5 / dt;
        vY = -(curY - lastDragY) * 0.5 / dt;
      }
      
      lastDragX = curX;
      lastDragY = curY;
      lastDragTime = now;
    };
    
    const onUp = () => {
      drag = false;
      autoRotate = true;
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
      window.removeEventListener('resize', updateFaces);
      cube.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cube.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      cube.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animId);
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
          <div className="h-term">
            <div className="t-bar">
              <div className="td td1"></div>
              <div className="td td2"></div>
              <div className="td td3"></div>
              <span className="t-ttl">bash &mdash; rajesh@dev:~</span>
            </div>
            <div className="t-body">
              <span className="t-ps"><span className="t-us">rajesh</span><span className="t-at">@</span><span
                  className="t-ht">kali</span><span className="t-at">:~$&nbsp;</span></span>
              <span className="t-tx" id="typed-el" ref={typedElRef}></span><span className="t-cr"></span>
            </div>
          </div>
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
          <div className="ph-sc cuboid-scene">
              <div className="nuke-beast" id="nuke-beast" ref={nukeWrapRef}>
                <div className="nuke-secret" id="nuke-secret" ref={nukeSecretRef}>
                  <div className="secret-label">[ Tap to Reveal ]</div>
                </div>
                <div className="nuke-flash" id="nuke-flash" ref={nukeFlashRef}></div>
                <canvas className="nuke-canvas" id="nuke-canvas" ref={nukeCanvasRef}></canvas>

                <div className="nuke-image-wrapper" id="nuke-image" ref={nukeImgRef} style={{opacity: 0}}>
                  <div className="cuboid" id="cuboid">
                    <div className="holo-slice" style={{"--i": -7}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -6}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -5}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -4}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -3}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -2}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": -1}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 0}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 1}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 2}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 3}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 4}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 5}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice" style={{"--i": 6}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
                    <div className="holo-slice front" style={{"--i": 7}}><img src="/pic.png" alt="Rajesh Pandit" /></div>
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
