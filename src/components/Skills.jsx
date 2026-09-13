import React, { useEffect, useRef } from 'react';

export default function Skills() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let DPR = Math.min(window.devicePixelRatio, 2);
    let LW = 0, LH = 0;

    function resize() {
      const rect = cv.getBoundingClientRect();
      LW = rect.width; LH = rect.height;
      DPR = Math.min(window.devicePixelRatio, 2);
      cv.width  = LW * DPR;
      cv.height = LH * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();

    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    const CATS = {
      backend:  { c: '#4a90d9', l: 'Backend'       },
      infra:    { c: '#5fcde4', l: 'Infrastructure' },
      data:     { c: '#00e676', l: 'Data'           },
      lang:     { c: '#ffab40', l: 'Languages'      },
      security: { c: '#ef5350', l: 'Security'       },
      frontend: { c: '#d4b84a', l: 'Frontend'       },
      cs:       { c: '#ab47bc', l: 'CS Core'        },
      tools:    { c: '#26c6da', l: 'Tools'          },
    };

    const NODES = [
      { id:'nodejs',   l:'Node.js',    cat:'backend',  r:28 },
      { id:'express',  l:'Express',    cat:'backend',  r:20 },
      { id:'socketio', l:'Socket.IO',  cat:'backend',  r:22 },
      { id:'rest',     l:'REST APIs',  cat:'backend',  r:19 },
      { id:'nginx',    l:'Nginx',      cat:'infra',    r:22 },
      { id:'lb',       l:'Load Bal.',  cat:'infra',    r:20 },
      { id:'pubsub',   l:'Pub/Sub',    cat:'infra',    r:21 },
      { id:'scale',    l:'H-Scale',    cat:'infra',    r:19 },
      { id:'docker',   l:'Docker',     cat:'infra',    r:22 },
      { id:'mongo',    l:'MongoDB',    cat:'data',     r:24 },
      { id:'redis',    l:'Redis',      cat:'data',     r:24 },
      { id:'mysql',    l:'MySQL',      cat:'data',     r:18 },
      { id:'js',       l:'JavaScript', cat:'lang',     r:26 },
      { id:'cpp',      l:'C++',        cat:'lang',     r:22 },
      { id:'python',   l:'Python',     cat:'lang',     r:19 },
      { id:'c',        l:'C',          cat:'lang',     r:16 },
      { id:'jwt',      l:'JWT',        cat:'security', r:20 },
      { id:'bcrypt',   l:'bcrypt',     cat:'security', r:16 },
      { id:'react',    l:'React.js',   cat:'frontend', r:20 },
      { id:'html',     l:'HTML5',      cat:'frontend', r:16 },
      { id:'css3',     l:'CSS3',       cat:'frontend', r:16 },
      { id:'dsa',      l:'DSA',        cat:'cs',       r:26 },
      { id:'oop',      l:'OOP',        cat:'cs',       r:20 },
      { id:'sysdes',   l:'Sys Design', cat:'cs',       r:26 },
      { id:'git',      l:'Git',        cat:'tools',    r:19 },
      { id:'linux',    l:'Linux',      cat:'tools',    r:20 },
      { id:'postman',  l:'Postman',    cat:'tools',    r:16 },
    ];

    const EDGES = [
      ['nodejs','express'],['nodejs','socketio'],['nodejs','rest'],['nodejs','js'],
      ['socketio','pubsub'],['socketio','redis'],['nginx','lb'],['nginx','scale'],
      ['lb','nodejs'],['redis','pubsub'],['redis','mongo'],['docker','nginx'],
      ['docker','nodejs'],['mongo','mysql'],['jwt','nodejs'],['jwt','bcrypt'],
      ['dsa','sysdes'],['sysdes','lb'],['sysdes','scale'],['oop','cpp'],['oop','js'],
      ['cpp','c'],['git','linux'],['react','js'],['express','mongo'],['express','jwt'],
      ['python','dsa'],['lb','scale'],['redis','docker'],
    ];

    let vpX = 0, vpY = 0, vpZ = 1;
    function toWorld(sx, sy) { return { x: (sx - vpX) / vpZ, y: (sy - vpY) / vpZ }; }

    function initPos() {
      const cx = LW / 2, cy = LH / 2;
      const R  = Math.min(LW, LH) * 0.38;
      NODES.forEach((n, i) => {
        const a  = (i / NODES.length) * Math.PI * 2;
        const rr = R * (0.4 + Math.random() * 0.6);
        n.x  = cx + Math.cos(a) * rr;
        n.y  = cy + Math.sin(a) * rr;
        n.vx = 0; n.vy = 0;
      });
      vpX = 0; vpY = 0; vpZ = 1;
    }
    initPos();

    let hovered  = null;
    let dragging = null;
    let panning  = false;
    let pinned   = new Set();
    let time     = 0;
    let lastPanX = 0, lastPanY = 0;
    let dragOffX = 0, dragOffY = 0;
    let animId = null;

    function simulate() {
      const cx = LW / 2, cy = LH / 2;
      for (let i = 0; i < NODES.length; i++) {
        if (NODES[i] === dragging) continue;
        for (let j = i + 1; j < NODES.length; j++) {
          if (NODES[j] === dragging) continue;
          const dx = NODES[i].x - NODES[j].x;
          const dy = NODES[i].y - NODES[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy) || 1;
          const f  = 780 / (d * d);
          NODES[i].vx += f*dx/d; NODES[i].vy += f*dy/d;
          NODES[j].vx -= f*dx/d; NODES[j].vy -= f*dy/d;
        }
      }
      EDGES.forEach(([a, b]) => {
        const na = NODES.find(n => n.id === a);
        const nb = NODES.find(n => n.id === b);
        if (!na || !nb) return;
        const dx = nb.x - na.x, dy = nb.y - na.y;
        const d  = Math.sqrt(dx*dx + dy*dy) || 1;
        const ideal = (na.r + nb.r) * 2.6;
        const f  = (d - ideal) * 0.018;
        if (na !== dragging && !pinned.has(na.id)) { na.vx += f*dx/d; na.vy += f*dy/d; }
        if (nb !== dragging && !pinned.has(nb.id)) { nb.vx -= f*dx/d; nb.vy -= f*dy/d; }
      });
      NODES.forEach(n => {
        if (n === dragging || pinned.has(n.id)) return;
        n.vx += (cx - n.x) * 0.002;
        n.vy += (cy - n.y) * 0.002;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x  += n.vx;  n.y  += n.vy;
      });
    }

    function connectedIds(id) {
      const s = new Set();
      EDGES.forEach(([a,b]) => { if (a===id) s.add(b); if (b===id) s.add(a); });
      return s;
    }

    function draw() {
      ctx.clearRect(0, 0, LW, LH);
      const dark = isDark();
      const connected = hovered ? connectedIds(hovered.id) : null;

      ctx.save();
      ctx.translate(vpX, vpY);
      ctx.scale(vpZ, vpZ);

      ctx.fillStyle = dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
      const gStep = 36;
      const startX = Math.floor(-vpX / vpZ / gStep) * gStep;
      const startY = Math.floor(-vpY / vpZ / gStep) * gStep;
      const endX   = startX + LW / vpZ + gStep;
      const endY   = startY + LH / vpZ + gStep;
      for (let gx = startX; gx < endX; gx += gStep) {
        for (let gy = startY; gy < endY; gy += gStep) {
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI*2); ctx.fill();
        }
      }

      EDGES.forEach(([a, b]) => {
        const na = NODES.find(n => n.id === a);
        const nb = NODES.find(n => n.id === b);
        if (!na || !nb) return;
        const isHov = hovered && (hovered.id === a || hovered.id === b);
        const dimEdge = hovered && !isHov;

        if (dimEdge) {
          ctx.lineWidth = 0.4;
          ctx.strokeStyle = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
          ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
        } else if (isHov) {
          const tc = dark ? '#ffffff' : '#000000';
          const g = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
          g.addColorStop(0, tc + 'ee');
          g.addColorStop(1, tc + 'ee');
          ctx.save();
          ctx.lineWidth   = 2.5;
          ctx.strokeStyle = g;
          ctx.shadowColor = tc;
          ctx.shadowBlur  = 10;
          ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
          ctx.restore();
        } else {
          const tc = dark ? '#ffffff' : '#000000';
          const g2 = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
          g2.addColorStop(0, tc + '50');
          g2.addColorStop(1, tc + '50');
          ctx.lineWidth   = 1;
          ctx.strokeStyle = g2;
          ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
        }
      });

      const drawOrder = hovered
        ? [...NODES].sort((a, b) => {
            const aActive = a === hovered || (connected && connected.has(a.id));
            const bActive = b === hovered || (connected && connected.has(b.id));
            return aActive - bActive;
          })
        : NODES;

      drawOrder.forEach(n => {
        const isHov  = hovered === n;
        const isDrag = dragging === n;
        const isPinned = pinned.has(n.id);
        const isConn = connected && connected.has(n.id);
        const dimmed = hovered && !isHov && !isConn;
        const active = isHov || isDrag || isConn;
        const r      = (isHov || isDrag) ? n.r + 5 : n.r;
        const col    = dark ? '#ffffff' : '#000000';

        if (isHov || isDrag) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 4);
          const gR    = r + 12 + pulse * 5;
          const grd   = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, gR);
          grd.addColorStop(0,   col + '44');
          grd.addColorStop(0.6, col + '18');
          grd.addColorStop(1,  'transparent');
          ctx.beginPath(); ctx.arc(n.x, n.y, gR, 0, Math.PI*2);
          ctx.fillStyle = grd; ctx.fill();
        } else if (isConn) {
          const grd2 = ctx.createRadialGradient(n.x, n.y, r*0.5, n.x, n.y, r+9);
          grd2.addColorStop(0, col+'2a'); grd2.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(n.x, n.y, r+9, 0, Math.PI*2);
          ctx.fillStyle = grd2; ctx.fill();
        }

        const bg = ctx.createRadialGradient(n.x - r*0.3, n.y - r*0.35, 0, n.x, n.y, r);
        if (dark) {
          bg.addColorStop(0, active ? '#1c2438' : '#161c2a');
          bg.addColorStop(1, active ? '#0e1117' : '#0a0d14');
        } else {
          bg.addColorStop(0, active ? '#ffffff' : '#f0f4ff');
          bg.addColorStop(1, active ? '#e8eeff' : '#dde4f5');
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
        ctx.fillStyle = bg; ctx.fill();

        ctx.lineWidth   = isHov||isDrag ? 2.5 : (isConn ? 2 : 1.5);
        ctx.strokeStyle = dimmed ? col+'22' : (active ? col : col+'75');
        ctx.stroke();

        if (!dimmed) {
          ctx.save();
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
          ctx.clip();
          const shine = ctx.createLinearGradient(n.x - r, n.y - r, n.x + r*0.2, n.y + r*0.2);
          shine.addColorStop(0, 'rgba(255,255,255,0.12)');
          shine.addColorStop(1, 'transparent');
          ctx.fillStyle = shine; ctx.fillRect(n.x-r, n.y-r, r*2, r*2);
          ctx.restore();
        }

        if (isPinned && !isHov && !isDrag) {
          ctx.beginPath(); ctx.arc(n.x + r*0.66, n.y - r*0.66, 4, 0, Math.PI*2);
          ctx.fillStyle = col; ctx.fill();
        }

        const maxFontW  = r * 1.55;
        let   fontSize  = isHov ? 12 : 11;
        ctx.font        = `600 ${fontSize}px "JetBrains Mono",monospace`;
        let   tw = ctx.measureText(n.l).width;
        if (tw > maxFontW) {
          fontSize = Math.max(8, fontSize * maxFontW / tw);
          ctx.font = `600 ${fontSize}px "JetBrains Mono",monospace`;
          tw       = ctx.measureText(n.l).width;
        }
        const th = fontSize;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';

        const pillPadX = 5, pillPadY = 3;
        const pillW = tw + pillPadX * 2;
        const pillH = th + pillPadY * 2;
        ctx.save();
        ctx.beginPath(); ctx.arc(n.x, n.y, r - 1, 0, Math.PI*2); ctx.clip();

        ctx.fillStyle = dark
          ? (dimmed ? 'rgba(10,13,20,0.7)' : 'rgba(10,13,20,0.88)')
          : (dimmed ? 'rgba(240,244,255,0.65)' : 'rgba(240,244,255,0.92)');
        ctx.beginPath();
        ctx.roundRect(n.x - pillW/2, n.y - pillH/2, pillW, pillH, 3);
        ctx.fill();

        if (dimmed) {
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
        } else if (isHov || isDrag) {
          ctx.fillStyle = col;
        } else if (isConn) {
          ctx.fillStyle = dark ? '#d8e0ec' : '#0d1626';
        } else {
          ctx.fillStyle = dark ? 'rgba(216,224,236,0.9)' : 'rgba(13,22,38,0.9)';
        }
        ctx.fillText(n.l, n.x, n.y);
        ctx.restore();
      });

      ctx.restore();

      if (Math.abs(vpZ - 1) > 0.08) {
        const pct = Math.round(vpZ * 100);
        ctx.font      = '400 10px "JetBrains Mono",monospace';
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${pct}%`, LW - 10, LH - 8);
      }
    }

    function loop() { 
      time += 0.016; 
      simulate(); 
      draw(); 
      animId = requestAnimationFrame(loop); 
    }
    loop();

    let tipEl = null;
    function showTip(n, clientX, clientY) {
      if (!tipEl) {
        tipEl = document.createElement('div');
        tipEl.style.cssText = 'position:fixed;z-index:200;pointer-events:none;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.04em;border-radius:7px;padding:8px 14px;white-space:nowrap;border:1px solid;backdrop-filter:blur(12px);transition:opacity .15s,transform .15s;line-height:1.7;box-shadow:0 4px 20px rgba(0,0,0,0.25)';
        document.body.appendChild(tipEl);
      }
      const dark = isDark();
      const cat  = CATS[n.cat];
      const conns = connectedIds(n.id).size;
      tipEl.style.background  = dark ? 'rgba(12,16,24,0.97)' : 'rgba(255,255,255,0.97)';
      tipEl.style.borderColor = cat.c + '70';
      tipEl.style.color       = dark ? '#d8e0ec' : '#0d1626';
      tipEl.innerHTML =
        `<span style="color:${cat.c};font-weight:700;letter-spacing:.02em">${n.l}</span>` +
        `<span style="color:rgba(128,140,160,0.6);margin:0 6px">//</span>` +
        `<span style="opacity:.65">${cat.l}</span>` +
        `<span style="display:block;margin-top:3px;font-size:9px;opacity:.45;letter-spacing:.08em">${conns} connection${conns!==1?'s':''} · drag to move · dbl-click to unpin</span>`;
      tipEl.style.opacity = '1';
      
      const tw = tipEl.offsetWidth  || 200;
      const th = tipEl.offsetHeight || 48;
      let   tx = clientX + 18;
      let   ty = clientY - th / 2;
      if (tx + tw + 8 > window.innerWidth)  tx = clientX - tw - 18;
      if (ty < 8) ty = 8;
      if (ty + th + 8 > window.innerHeight) ty = window.innerHeight - th - 8;
      tipEl.style.left = tx + 'px';
      tipEl.style.top  = ty + 'px';
    }
    function hideTip() { if (tipEl) tipEl.style.opacity = '0'; }

    function getNode(sx, sy) {
      const w = toWorld(sx, sy);
      for (const n of NODES) {
        const dx = n.x - w.x, dy = n.y - w.y;
        if (dx*dx + dy*dy < (n.r + 6)*(n.r + 6)) return n;
      }
      return null;
    }

    const handleMouseMove = e => {
      const rect = cv.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;

      if (dragging) {
        const w   = toWorld(sx, sy);
        dragging.x = w.x + dragOffX;
        dragging.y = w.y + dragOffY;
        dragging.vx = 0; dragging.vy = 0;
        cv.style.cursor = 'grabbing';
        showTip(dragging, e.clientX, e.clientY);
        return;
      }
      if (panning) {
        vpX += e.clientX - lastPanX;
        vpY += e.clientY - lastPanY;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        cv.style.cursor = 'grabbing';
        return;
      }
      const hit = getNode(sx, sy);
      hovered = hit;
      cv.style.cursor = hit ? 'grab' : 'crosshair';
      if (hit) showTip(hit, e.clientX, e.clientY);
      else hideTip();
    };

    const handleMouseDown = e => {
      const rect = cv.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;
      const hit  = getNode(sx, sy);
      if (hit) {
        dragging = hit;
        const w  = toWorld(sx, sy);
        dragOffX = hit.x - w.x;
        dragOffY = hit.y - w.y;
        hit.vx   = 0; hit.vy = 0;
        cv.style.cursor = 'grabbing';
      } else {
        panning  = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        cv.style.cursor = 'grabbing';
      }
      e.preventDefault();
    };

    const handleMouseUp = () => {
      if (dragging) { pinned.add(dragging.id); dragging = null; }
      panning = false;
      cv.style.cursor = hovered ? 'grab' : 'crosshair';
    };

    const handleDblClick = e => {
      const rect = cv.getBoundingClientRect();
      const hit  = getNode(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) { pinned.delete(hit.id); hit.vx = 0; hit.vy = 0; }
      else { vpX = 0; vpY = 0; vpZ = 1; }
    };

    const handleWheel = e => {
      e.preventDefault();
      const rect   = cv.getBoundingClientRect();
      const sx     = e.clientX - rect.left;
      const sy     = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      const newZ   = Math.max(0.35, Math.min(3, vpZ * factor));
      vpX = sx - (sx - vpX) * (newZ / vpZ);
      vpY = sy - (sy - vpY) * (newZ / vpZ);
      vpZ = newZ;
    };

    cv.addEventListener('mousemove', handleMouseMove);
    cv.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    cv.addEventListener('dblclick', handleDblClick);
    cv.addEventListener('wheel', handleWheel, { passive: false });
    cv.addEventListener('mouseleave', () => { hovered = null; dragging = null; panning = false; hideTip(); cv.style.cursor = 'crosshair'; });
    
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      if (tipEl) tipEl.remove();
      cv.removeEventListener('mousemove', handleMouseMove);
      cv.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cv.removeEventListener('dblclick', handleDblClick);
      cv.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!("ontouchstart" in window)) {
      const cards = document.querySelectorAll(".sk");
      const strength = 10;
      
      const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left - r.width / 2) / r.width) * strength;
        const y = ((e.clientY - r.top - r.height / 2) / r.height) * strength;
        card.style.transform = `translate(${x}px,${y}px) translateY(${card.style.transform.includes("translateY(-5px)") ? "-5px" : "0px"})`;
      };
      
      const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = "";
      };

      cards.forEach((card) => {
        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);
      });

      return () => {
        cards.forEach((card) => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    }
  }, []);

  return (
    <section id="skills">
      <div className="W">
        <div className="rv">
          <span className="ey">Expertise</span>
          <h2 className="st">Technical Skills</h2>
          <p className="ss">Every skill here has been shipped in real code. Organized by system layer.</p>
        </div>
        <div className="sk-grid">
          <div className="sk rv" data-d="1">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-server"></i></div><span className="sk-nm">Backend &amp; Runtime</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bxl-nodejs sk-ii"></i><span className="sk-in">Node.js</span></div>
              <div className="sk-it"><i className="bx bx-extension sk-ii"></i><span className="sk-in">Express.js</span></div>
              <div className="sk-it"><i className="bx bx-plug sk-ii"></i><span className="sk-in">Socket.IO</span></div>
              <div className="sk-it"><i className="bx bx-wifi sk-ii"></i><span className="sk-in">WebSockets</span></div>
              <div className="sk-it"><i className="bx bx-transfer sk-ii"></i><span className="sk-in">REST APIs</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="2">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-network-chart"></i></div><span className="sk-nm">Infrastructure &amp; Scale</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bx-shield-quarter sk-ii"></i><span className="sk-in">Nginx</span></div>
              <div className="sk-it"><i className="bx bx-sitemap sk-ii"></i><span className="sk-in">Load Balancing</span></div>
              <div className="sk-it"><i className="bx bx-expand sk-ii"></i><span className="sk-in">Horizontal Scaling</span></div>
              <div className="sk-it"><i className="bx bx-mail-send sk-ii"></i><span className="sk-in">Pub/Sub</span></div>
              <div className="sk-it"><i className="bx bx-chip sk-ii"></i><span className="sk-in">Caching</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="3">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-data"></i></div><span className="sk-nm">Data &amp; Storage</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bxl-mongodb sk-ii"></i><span className="sk-in">MongoDB</span></div>
              <div className="sk-it"><i className="bx bx-memory-card sk-ii"></i><span className="sk-in">Redis</span></div>
              <div className="sk-it"><i className="bx bx-table sk-ii"></i><span className="sk-in">MySQL</span></div>
              <div className="sk-it"><i className="bx bx-bar-chart-alt-2 sk-ii"></i><span className="sk-in">Indexing</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="4">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-code-alt"></i></div><span className="sk-nm">Languages</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bxl-javascript sk-ii"></i><span className="sk-in">JavaScript</span></div>
              <div className="sk-it"><i className="bx bxl-c-plus-plus sk-ii"></i><span className="sk-in">C++</span></div>
              <div className="sk-it"><i className="bx bx-code-curly sk-ii"></i><span className="sk-in">C</span></div>
              <div className="sk-it"><i className="bx bxl-python sk-ii"></i><span className="sk-in">Python</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="1">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-shield"></i></div><span className="sk-nm">Security &amp; Auth</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bx-lock-alt sk-ii"></i><span className="sk-in">JWT</span></div>
              <div className="sk-it"><i className="bx bx-key sk-ii"></i><span className="sk-in">bcrypt</span></div>
              <div className="sk-it"><i className="bx bx-envelope sk-ii"></i><span className="sk-in">Nodemailer</span></div>
              <div className="sk-it"><i className="bx bx-pencil sk-ii"></i><span className="sk-in">API Design</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="2">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-paint"></i></div><span className="sk-nm">Frontend</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bxl-react sk-ii"></i><span className="sk-in">React.js</span></div>
              <div className="sk-it"><i className="bx bxl-html5 sk-ii"></i><span className="sk-in">HTML5</span></div>
              <div className="sk-it"><i className="bx bxl-css3 sk-ii"></i><span className="sk-in">CSS3</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="3">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-brain"></i></div><span className="sk-nm">CS Foundations</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bx-layer sk-ii"></i><span className="sk-in">DSA</span></div>
              <div className="sk-it"><i className="bx bx-cube sk-ii"></i><span className="sk-in">OOP</span></div>
              <div className="sk-it"><i className="bx bx-git-branch sk-ii"></i><span className="sk-in">System Design</span></div>
              <div className="sk-it"><i className="bx bx-git-merge sk-ii"></i><span className="sk-in">Event-Driven</span></div>
            </div>
          </div>
          <div className="sk rv" data-d="4">
            <div className="sk-hd">
              <div className="sk-ico"><i className="bx bx-wrench"></i></div><span className="sk-nm">Tools &amp; Env</span>
            </div>
            <div className="sk-items">
              <div className="sk-it"><i className="bx bxl-git sk-ii"></i><span className="sk-in">Git</span></div>
              <div className="sk-it"><i className="bx bxl-github sk-ii"></i><span className="sk-in">GitHub</span></div>
              <div className="sk-it"><i className="bx bx-code-block sk-ii"></i><span className="sk-in">Postman</span></div>
              <div className="sk-it"><i className="bx bxl-tux sk-ii"></i><span className="sk-in">Linux</span></div>
              <div className="sk-it"><i className="bx bx-terminal sk-ii"></i><span className="sk-in">VS Code</span></div>
              <div className="sk-it"><i className="bx bxl-docker sk-ii"></i><span className="sk-in">Docker</span></div>
            </div>
          </div>
        </div>

        <div className="sk-graph-wrap rv">
          <div className="sk-graph-label">Skill Network — tap to explore connections</div>
          <canvas id="sk-graph-cv" ref={canvasRef}></canvas>
          <p className="sk-graph-hint">tap a node to highlight its connections · size = proficiency</p>
        </div>
      </div>
    </section>
  );
}
