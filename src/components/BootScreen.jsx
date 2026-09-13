import React, { useEffect, useRef, useState } from 'react';

export default function BootScreen({ onComplete }) {
  const canvasRef = useRef(null);
  const percentRef = useRef(null);
  const statusRef = useRef(null);
  const diagRef = useRef(null);
  const massRef = useRef(null);
  const tempRef = useRef(null);
  const pullRef = useRef(null);
  const fluxRef = useRef(null);
  const fpsRef = useRef(null);
  
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, HT;
    const isMob = window.innerWidth < 768;

    function resize() {
      W = cv.width = window.innerWidth;
      HT = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const msgs = [
      "Initializing blast core...", "Injecting plasma...", "Superheating reactor...",
      "Magnetic containment unstable...", "Thermonuclear reaction rising...", "Overcharging capacitors...",
      "Core temperature critical...", "Containment field failing...", "Thermal runaway detected...",
      "Igniting main charge...", "Pressure exceeding limits...", "Approaching detonation...", "BLAST IMMINENT",
    ];

    let progress = 0;
    let phase = "loading";
    let bootAnimId;
    let msgIdx = 0;
    let msgTimer = 0;
    let coreRadius = 0;
    let blastIntensity = 0;
    let blastAngle = 0;
    let shakeAmount = 0;
    let explosionRadius = 0;
    let explosionAlpha = 0;
    let lastTime = performance.now();
    let frameCount = 0, fpsCounter = 0, lastFpsTime = performance.now();

    const STAR_COUNT = isMob ? 200 : 500;
    const stars = [];
    class Star {
      constructor() { this.reset(); }
      reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(W, HT) * 0.2;
        this.x = W / 2 + Math.cos(angle) * dist;
        this.y = HT / 2 + Math.sin(angle) * dist;
        this.size = Math.random() * 3 + 0.5;
        this.brightness = Math.random() * 0.7 + 0.3;
        this.speed = Math.random() * 1.5 + 0.5;
        this.angle = angle;
        const temp = Math.random();
        if (temp < 0.2) this.color = [255, 255, 255];
        else if (temp < 0.5) this.color = [220, 220, 220];
        else if (temp < 0.8) this.color = [180, 180, 180];
        else this.color = [120, 120, 120];
      }
    }
    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

    const DISK_COUNT = isMob ? 120 : 300;
    const diskParticles = [];
    class DiskParticle {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.dist = Math.random() * 60 + 20;
        this.speed = (Math.random() * 0.05 + 0.02) * (this.dist < 50 ? 1.5 : 1);
        this.size = Math.random() * 3.5 + 1.0;
        this.brightness = Math.random() * 0.8 + 0.2;
        const t = 1 - ((this.dist - 20) / 60);
        const val = Math.floor(100 + t * 155);
        this.r = val; this.g = val; this.b = val;
      }
    }
    for (let i = 0; i < DISK_COUNT; i++) diskParticles.push(new DiskParticle());

    const NEBULA_COUNT = isMob ? 6 : 12;
    const nebulae = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 150 + 50,
        size: Math.random() * 120 + 80,
        r: 255, g: 255, b: 255,
        alpha: Math.random() * 0.03 + 0.005,
        drift: Math.random() * 0.005 + 0.002,
      });
    }

    const BOOT_DURATION = 900;
    const bootStartTime = performance.now();

    function render(time) {
      const dt = time - lastTime;
      lastTime = time;

      frameCount++;
      if (time - lastFpsTime > 500) {
        fpsCounter = Math.round(frameCount / ((time - lastFpsTime) / 1000));
        frameCount = 0;
        lastFpsTime = time;
        if (fpsRef.current) fpsRef.current.textContent = fpsCounter + " FPS";
      }

      const CX = W / 2 + (shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0);
      const CY = HT / 2 + (shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0);

      if (phase === "loading") {
        const elapsed = time - bootStartTime;
        progress = Math.min(elapsed / BOOT_DURATION, 1);
        coreRadius = 10 + progress * 60;
        blastIntensity = progress;
        blastAngle += (0.02 + progress * 0.05) * (dt / 16);
        shakeAmount = progress * 15 + (progress > 0.85 ? (progress - 0.85) * 300 : 0);

        const pctVal = Math.round(progress * 100);
        if (percentRef.current) percentRef.current.innerHTML = pctVal + '<span class="bh-pct">%</span>';
        if (massRef.current) massRef.current.textContent = pctVal;
        if (tempRef.current) tempRef.current.textContent = Math.round(progress * 500000).toLocaleString();
        if (pullRef.current) pullRef.current.textContent = (progress * 15000).toFixed(0);
        if (fluxRef.current) fluxRef.current.textContent = progress > 0.8 ? "CRITICAL" : "STABLE";

        msgTimer += dt;
        if (msgTimer > 250 && msgIdx < msgs.length) {
          msgTimer = 0;
          if (diagRef.current) diagRef.current.textContent = msgs[msgIdx];
          if (statusRef.current) {
            statusRef.current.textContent = msgIdx < 4 ? "CHARGING SEQUENCE" :
                                    msgIdx < 9 ? "PLASMA INJECTION" : "DETONATION PROTOCOL";
          }
          msgIdx++;
        }

        if (progress >= 1) {
          phase = "supernova";
          explosionRadius = 0;
          explosionAlpha = 1;
          shakeAmount = 40;
          if (statusRef.current) statusRef.current.textContent = "BLAST TRIGGERED";
          if (diagRef.current) diagRef.current.textContent = "⚠ DETONATION ⚠";
        }
      }

      if (phase === "supernova") {
        explosionRadius += dt * 3.0;
        explosionAlpha = Math.max(0, 1 - explosionRadius / (Math.max(W, HT) * 1.5));
        shakeAmount *= 0.96;

        if (explosionRadius > Math.max(W, HT) * 1.2) {
          phase = "done";
          setTimeout(() => {
            setIsDone(true);
            document.body.classList.add("boot-complete");
            onComplete();
            cancelAnimationFrame(bootAnimId);
          }, 900);
        }
      }

      cx.fillStyle = "rgba(0,0,0,0.25)";
      cx.fillRect(0, 0, W, HT);

      for (const n of nebulae) {
        n.angle += n.drift;
        const nx = CX + Math.cos(n.angle) * n.dist * (1 + blastIntensity);
        const ny = CY + Math.sin(n.angle) * n.dist * (1 + blastIntensity);
        const g = cx.createRadialGradient(nx, ny, 0, nx, ny, n.size * (1 + progress));
        g.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.alpha * (0.8 + blastIntensity * 2)})`);
        g.addColorStop(1, "transparent");
        cx.fillStyle = g;
        cx.fillRect(nx - n.size * 2, ny - n.size * 2, n.size * 4, n.size * 4);
      }

      for (const s of stars) {
        const distFromCore = Math.sqrt(Math.pow(s.x - CX, 2) + Math.pow(s.y - CY, 2));
        const outwardForce = (blastIntensity * 100) / (distFromCore * 0.1 + 10);
        s.x += Math.cos(s.angle) * s.speed * outwardForce * (dt / 16);
        s.y += Math.sin(s.angle) * s.speed * outwardForce * (dt / 16);

        if (s.x < 0 || s.x > W || s.y < 0 || s.y > HT) {
          s.reset();
        }

        const [r, g, b] = s.color;
        cx.globalAlpha = s.brightness;
        cx.fillStyle = `rgb(${r},${g},${b})`;
        cx.beginPath();
        cx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        cx.fill();
        cx.globalAlpha = 1;
      }

      if (blastIntensity > 0) {
        cx.save();
        cx.translate(CX, CY);
        cx.scale(1, 0.7);
        cx.rotate(blastAngle);

        for (const dp of diskParticles) {
          dp.angle += dp.speed * (dt / 16);
          const px = Math.cos(dp.angle) * dp.dist * (1 + blastIntensity * 2);
          const py = Math.sin(dp.angle) * dp.dist * (1 + blastIntensity * 2);
          const a = dp.brightness * blastIntensity;

          cx.beginPath();
          cx.arc(px, py, dp.size, 0, Math.PI * 2);
          cx.fillStyle = `rgba(${dp.r},${dp.g},${dp.b},${a})`;
          cx.fill();
        }
        cx.globalAlpha = 1;
        cx.restore();

        const coreGlow = cx.createRadialGradient(CX, CY, coreRadius * 0.5, CX, CY, coreRadius + 150 * blastIntensity);
        coreGlow.addColorStop(0, `rgba(255,255,255,1)`);
        coreGlow.addColorStop(0.2, `rgba(255,255,255,0.7)`);
        coreGlow.addColorStop(0.5, `rgba(255,255,255,${0.3 * blastIntensity})`);
        coreGlow.addColorStop(1, "transparent");
        cx.fillStyle = coreGlow;
        cx.fillRect(0, 0, W, HT);
      }

      if (coreRadius > 0) {
        cx.fillStyle = "#fff";
        cx.beginPath();
        cx.arc(CX, CY, coreRadius * 0.4, 0, Math.PI * 2);
        cx.fill();

        cx.strokeStyle = `rgba(255,255,255,${0.8 + blastIntensity * 0.2})`;
        cx.lineWidth = 3 + blastIntensity * 4;
        cx.beginPath();
        cx.arc(CX, CY, coreRadius, 0, Math.PI * 2);
        cx.stroke();
      }

      if (phase === "supernova" || (phase === "done" && explosionAlpha > 0)) {
        const g1 = cx.createRadialGradient(CX, CY, 0, CX, CY, explosionRadius);
        g1.addColorStop(0, `rgba(255,255,255,${explosionAlpha})`);
        g1.addColorStop(0.1, `rgba(220,220,220,${explosionAlpha * 0.9})`);
        g1.addColorStop(0.3, `rgba(180,180,180,${explosionAlpha * 0.6})`);
        g1.addColorStop(0.5, `rgba(120,120,120,${explosionAlpha * 0.3})`);
        g1.addColorStop(1, "transparent");
        cx.fillStyle = g1;
        cx.fillRect(0, 0, W, HT);

        if (explosionRadius > 20) {
          cx.strokeStyle = `rgba(255,255,255,${explosionAlpha * 0.9})`;
          cx.lineWidth = 8;
          cx.beginPath();
          cx.arc(CX, CY, explosionRadius * 0.95, 0, Math.PI * 2);
          cx.stroke();
        }
      }

      if (phase !== "done" || explosionAlpha > 0) {
        bootAnimId = requestAnimationFrame(render);
      }
    }

    bootAnimId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(bootAnimId);
      window.removeEventListener("resize", resize);
    };
  }, [onComplete]);

  return (
    <div id="boot" className={isDone ? 'done' : ''}>
      <canvas id="boot-canvas" ref={canvasRef}></canvas>

      <div className="bh-hud">
        <div className="bh-hud-top">
          <span className="bh-tag">DETONATION CORE</span>
          <span className="bh-tag bh-tag-right" id="bh-fps" ref={fpsRef}>60 FPS</span>
        </div>

        <div className="bh-center-hud">
          <div className="bh-percent" id="bh-percent" ref={percentRef}>0<span className="bh-pct">%</span></div>
          <div className="bh-status" id="bh-status" ref={statusRef}>CHARGING SEQUENCE</div>
        </div>

        <div className="bh-diag" id="bh-diag" ref={diagRef}>Initiating blast sequence...</div>

        <div className="bh-hud-bottom">
          <span className="bh-metric"><span className="bh-ml">ENERGY</span> <span id="bh-mass" ref={massRef}>0</span>%</span>
          <span className="bh-metric"><span className="bh-ml">HEAT</span> <span id="bh-temp" ref={tempRef}>0</span>K</span>
          <span className="bh-metric"><span className="bh-ml">PRESSURE</span> <span id="bh-pull" ref={pullRef}>0.0</span> PSI</span>
          <span className="bh-metric"><span className="bh-ml">STATUS</span> <span id="bh-flux" ref={fluxRef}>--</span></span>
        </div>
      </div>

      <div className="bh-shatter" id="bh-shatter"></div>
    </div>
  );
}

