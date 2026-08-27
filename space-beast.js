(function() {
  'use strict';
  const init = () => {
    const wrap = document.getElementById('space-beast');
    if (!wrap) return;

    const img = document.getElementById('sb-image');
    const sw1 = document.getElementById('sb-sw1');
    const sw2 = document.getElementById('sb-sw2');
    const bh = document.getElementById('sb-bh');
    const canvas = document.getElementById('sb-canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    
    const SIZE = 1200; // Massive canvas for explosion reach
    canvas.width = SIZE;
    canvas.height = SIZE;
    
    let particles = [];
    let isHovering = false;
    let animId = null;
    
    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 35 + 5;
        this.x = SIZE/2;
        this.y = SIZE/2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.size = Math.random() * 3.5 + 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        // Cosmic colors: Cyan, Deep Purple, Bright White
        this.color = Math.random() > 0.7 ? '#00f3ff' : (Math.random() > 0.4 ? '#7000ff' : '#ffffff');
      }
      update(implode) {
        if (!implode) {
          // EXPLODE OUT
          this.x += this.vx;
          this.y += this.vy;
          // Cosmic friction
          this.vx *= 0.93;
          this.vy *= 0.93;
          // Galaxy orbital spin force
          const dx = this.x - SIZE/2;
          const dy = this.y - SIZE/2;
          this.x += -dy * 0.06;
          this.y += dx * 0.06;
          
          this.life -= this.decay;
        } else {
          // REVERSE TIME / BLACK HOLE SUCK
          const dx = SIZE/2 - this.x;
          const dy = SIZE/2 - this.y;
          this.x += dx * 0.2;
          this.y += dy * 0.2;
          // Reverse spin
          this.x += dy * 0.15;
          this.y += -dx * 0.15;
          this.life += 0.08; // Gain life on return to look like a bright core forming
        }
      }
      draw(ctx) {
        if(this.life <= 0) return;
        ctx.globalAlpha = Math.min(1, Math.max(0, this.life));
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    function blast() {
      particles = [];
      for(let i = 0; i < 2000; i++) { // 2000 stars
        particles.push(new Particle());
      }
    }
    
    function shockwave(el) {
      el.style.transition = 'none';
      el.style.transform = 'translate(-50%, -50%) scale(0)';
      el.style.opacity = '1';
      el.style.borderWidth = '30px';
      
      setTimeout(() => {
        el.style.transition = 'transform 0.6s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.6s ease-out, border-width 0.6s ease-out';
        el.style.transform = 'translate(-50%, -50%) scale(40)'; // Massive expansion
        el.style.opacity = '0';
        el.style.borderWidth = '1px';
      }, 20);
    }
    
    function loop() {
      // Motion blur trail effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // lower alpha = longer trails
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = 'lighter';
      
      let active = false;
      particles.forEach(p => {
        p.update(!isHovering);
        p.draw(ctx);
        if (p.life > 0 && p.life < 1.5) active = true;
      });
      
      if (active || isHovering) {
        animId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animId);
        animId = null;
        ctx.clearRect(0,0,SIZE,SIZE);
      }
    }
    
    let hoverTimeout;
    
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      isHovering = true;
      
      // 1. Implode the clear image
      img.style.transform = 'scale(0) rotate(360deg)';
      img.style.filter = 'brightness(500%) contrast(300%) blur(10px)';
      img.style.opacity = '0';
      
      hoverTimeout = setTimeout(() => {
        if(!isHovering) return;
        
        // 2. The Big Bang
        shockwave(sw1);
        setTimeout(() => shockwave(sw2), 150);
        
        bh.style.transform = 'translate(-50%, -50%) scale(1)';
        bh.style.opacity = '1';
        
        blast();
        if(!animId) loop();
        
      }, 450); // Wait for image to collapse
    });
    
    wrap.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      isHovering = false;
      
      // 1. Collapse the black hole
      bh.style.transform = 'translate(-50%, -50%) scale(0)';
      bh.style.opacity = '0';
      
      // Note: Particles automatically start reversing due to !isHovering in loop
      
      setTimeout(() => {
        // 2. Rebirth Shockwave
        shockwave(sw1);
        
        // 3. Pop image back into reality
        img.style.transform = 'scale(1.3) rotate(-15deg)'; // Violent overshoot
        img.style.filter = 'brightness(400%) blur(5px)';
        img.style.opacity = '1';
        
        setTimeout(() => {
          // Settle back to perfectly clear image
          img.style.transform = 'scale(1) rotate(0deg)';
          img.style.filter = 'brightness(100%) contrast(100%) blur(0px)';
        }, 150);
        
      }, 600); // Give stars time to suck back into the center
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
