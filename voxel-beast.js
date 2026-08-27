(function() {
  'use strict';
  
  function init() {
    const container = document.getElementById('voxel-matrix');
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create 20x20 grid (400 DOM nodes for extreme detail)
    const COLS = 20;
    const ROWS = 20;
    const tiles = [];
    
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const tile = document.createElement('div');
        tile.className = 'v-tile';
        // Background position mapping to reform the image perfectly
        tile.style.backgroundPosition = `${(x / (COLS - 1)) * 100}% ${(y / (ROWS - 1)) * 100}%`;
        tile.dataset.x = x;
        tile.dataset.y = y;
        container.appendChild(tile);
        tiles.push({
          el: tile,
          x: x / (COLS - 1),
          y: y / (ROWS - 1)
        });
      }
    }

    let isHovering = false;

    // Parallax & Ripple
    container.addEventListener('mousemove', (e) => {
      isHovering = true;
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const nx = mx / rect.width;
      const ny = my / rect.height;
      
      // Global parallax tilt
      const tiltX = (ny - 0.5) * -40; // -20 to 20 deg
      const tiltY = (nx - 0.5) * 40;
      container.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      
      // Local magnetic ripple on tiles
      tiles.forEach(t => {
        const dx = nx - t.x;
        const dy = ny - t.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const radius = 0.35; // Size of the magnetic field
        if (dist < radius) {
          const force = Math.pow((radius - dist) / radius, 1.5); // easing
          
          const tz = force * 180; // Levitate towards user
          const rx = dy * force * 180; // Flip
          const ry = -dx * force * 180;
          
          t.el.style.transition = 'transform 0.1s linear, filter 0.1s linear, box-shadow 0.1s linear';
          t.el.style.transform = `translate3d(0, 0, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${1 - force*0.3})`;
          t.el.style.boxShadow = `0 10px ${force*40}px rgba(0, 255, 136, ${force})`;
          t.el.style.filter = `brightness(${1 + force*1.5}) contrast(${1 + force})`;
          t.el.style.border = `${force * 2}px solid rgba(0,255,136,${force})`;
          t.el.style.zIndex = Math.floor(force * 100);
        } else {
          // Reset tiles outside radius
          t.el.style.transition = 'transform 0.4s ease-out, filter 0.4s ease-out, box-shadow 0.4s ease-out';
          t.el.style.transform = `translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
          t.el.style.boxShadow = `none`;
          t.el.style.filter = `none`;
          t.el.style.border = `0px solid transparent`;
          t.el.style.zIndex = 1;
        }
      });
    });

    container.addEventListener('mouseleave', () => {
      isHovering = false;
      container.style.transform = `rotateX(0deg) rotateY(0deg)`;
      
      tiles.forEach(t => {
        t.el.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.6s, box-shadow 0.6s';
        t.el.style.transform = `translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
        t.el.style.boxShadow = `none`;
        t.el.style.filter = `none`;
        t.el.style.border = `0px solid transparent`;
        t.el.style.zIndex = 1;
      });
    });

    // Explosive Shockwave on Click
    container.addEventListener('mousedown', (e) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      
      tiles.forEach(t => {
        const dx = t.x - nx;
        const dy = t.y - ny;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Delay based on distance from click (creates radial wave)
        const delay = dist * 400; 
        
        setTimeout(() => {
          t.el.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s, filter 0.2s';
          // Violent explosion outward
          t.el.style.transform = `translate3d(${dx*400}px, ${dy*400}px, ${300 - dist*200}px) rotateX(${dy*1080}deg) rotateY(${dx*1080}deg) scale(0.1)`;
          t.el.style.opacity = '0.3';
          t.el.style.filter = 'hue-rotate(90deg) brightness(3)';
          
          // Snap back
          setTimeout(() => {
            if(!isHovering){
              t.el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s, filter 0.8s';
              t.el.style.transform = `translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
              t.el.style.opacity = '1';
              t.el.style.filter = 'none';
            }
          }, 300);
        }, delay);
      });
    });
  }

  // Load execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
