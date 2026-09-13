(function () {
  "use strict";
  const D = document,
    H = D.documentElement;

  /* ══ 1. BLACK HOLE SINGULARITY BOOT ═════════════════════════ */
  const bootEl = D.getElementById("boot");

  (function blackHoleBoot() {
    const cv = D.getElementById("boot-canvas");
    if (!cv) return;
    const cx = cv.getContext("2d");
    let W, HT;
    const isMob = window.innerWidth < 768;

    function resize() {
      W = cv.width = window.innerWidth;
      HT = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── DOM refs ──
    const percentEl = D.getElementById("bh-percent");
    const statusEl  = D.getElementById("bh-status");
    const diagEl    = D.getElementById("bh-diag");
    const massEl    = D.getElementById("bh-mass");
    const tempEl    = D.getElementById("bh-temp");
    const pullEl    = D.getElementById("bh-pull");
    const fluxEl    = D.getElementById("bh-flux");
    const fpsEl     = D.getElementById("bh-fps");
    const shatterEl = D.getElementById("bh-shatter");

    // ── Diagnostic messages ──
    const msgs = [
      "Initializing blast core...",
      "Injecting plasma...",
      "Superheating reactor...",
      "Magnetic containment unstable...",
      "Thermonuclear reaction rising...",
      "Overcharging capacitors...",
      "Core temperature critical...",
      "Containment field failing...",
      "Thermal runaway detected...",
      "Igniting main charge...",
      "Pressure exceeding limits...",
      "Approaching detonation...",
      "BLAST IMMINENT",
    ];

    // ── State ──
    let progress = 0;           // 0..1
    let phase = "loading";      // "loading" | "supernova" | "done"
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

    // ── Debris / Embers ──
    const STAR_COUNT = isMob ? 200 : 500;
    const stars = [];
    class Star {
      constructor() { this.reset(); }
      reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(W, HT) * 0.2; // Start closer to core
        this.x = W / 2 + Math.cos(angle) * dist;
        this.y = HT / 2 + Math.sin(angle) * dist;
        this.ox = this.x; this.oy = this.y;
        this.size = Math.random() * 3 + 0.5;
        this.brightness = Math.random() * 0.7 + 0.3;
        this.speed = Math.random() * 1.5 + 0.5;
        this.angle = angle;
        // Strict Monochrome colors
        const temp = Math.random();
        if (temp < 0.2) this.color = [255, 255, 255];       // Pure White
        else if (temp < 0.5) this.color = [220, 220, 220];  // Light Grey
        else if (temp < 0.8) this.color = [180, 180, 180];  // Grey
        else this.color = [120, 120, 120];                  // Dark Grey
      }
    }
    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

    // ── Blast energy particles ──
    const DISK_COUNT = isMob ? 120 : 300;
    const diskParticles = [];
    class DiskParticle {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.dist = Math.random() * 60 + 20;
        this.speed = (Math.random() * 0.05 + 0.02) * (this.dist < 50 ? 1.5 : 1);
        this.size = Math.random() * 3.5 + 1.0;
        this.brightness = Math.random() * 0.8 + 0.2;
        this.trail = Math.random() * 0.5 + 0.2;
        // Monochrome gradient
        const t = 1 - ((this.dist - 20) / 60);
        const val = Math.floor(100 + t * 155);
        this.r = val;
        this.g = val;
        this.b = val;
      }
    }
    for (let i = 0; i < DISK_COUNT; i++) diskParticles.push(new DiskParticle());

    // ── Smoke/Energy clouds ──
    const NEBULA_COUNT = isMob ? 6 : 12;
    const nebulae = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 150 + 50,
        size: Math.random() * 120 + 80,
        r: 255,
        g: 255,
        b: 255,
        alpha: Math.random() * 0.03 + 0.005,
        drift: Math.random() * 0.005 + 0.002,
      });
    }

    // ── Boot progress driver ──
    const BOOT_DURATION = 900; // ms total (extremely fast now)
    const bootStartTime = performance.now();

    // ── Main render loop ──
    function render(time) {
      const dt = time - lastTime;
      lastTime = time;

      // FPS counter
      frameCount++;
      if (time - lastFpsTime > 500) {
        fpsCounter = Math.round(frameCount / ((time - lastFpsTime) / 1000));
        frameCount = 0;
        lastFpsTime = time;
        if (fpsEl) fpsEl.textContent = fpsCounter + " FPS";
      }

      const CX = W / 2 + (shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0);
      const CY = HT / 2 + (shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0);

      // ── Phase: Loading ──
      if (phase === "loading") {
        const elapsed = time - bootStartTime;
        progress = Math.min(elapsed / BOOT_DURATION, 1);
        coreRadius = 10 + progress * 60;
        blastIntensity = progress;
        blastAngle += (0.02 + progress * 0.05) * (dt / 16);
        shakeAmount = progress * 15 + (progress > 0.85 ? (progress - 0.85) * 300 : 0);

        // Update HUD
        const pctVal = Math.round(progress * 100);
        if (percentEl) percentEl.innerHTML = pctVal + '<span class="bh-pct">%</span>';
        if (massEl) massEl.textContent = pctVal;
        if (tempEl) tempEl.textContent = Math.round(progress * 500000).toLocaleString();
        if (pullEl) pullEl.textContent = (progress * 15000).toFixed(0);
        if (fluxEl) fluxEl.textContent = progress > 0.8 ? "CRITICAL" : "STABLE";

        // Messages
        msgTimer += dt;
        if (msgTimer > 250 && msgIdx < msgs.length) {
          msgTimer = 0;
          if (diagEl) diagEl.textContent = msgs[msgIdx];
          if (statusEl) {
            statusEl.textContent = msgIdx < 4 ? "CHARGING SEQUENCE" :
                                    msgIdx < 9 ? "PLASMA INJECTION" : "DETONATION PROTOCOL";
          }
          msgIdx++;
        }

        // Trigger explosion
        if (progress >= 1) {
          phase = "supernova";
          explosionRadius = 0;
          explosionAlpha = 1;
          shakeAmount = 40;
          if (statusEl) statusEl.textContent = "BLAST TRIGGERED";
          if (diagEl) diagEl.textContent = "⚠ DETONATION ⚠";
        }
      }

      // ── Phase: Supernova ──
      if (phase === "supernova") {
        explosionRadius += dt * 3.0; // Faster blast wave
        explosionAlpha = Math.max(0, 1 - explosionRadius / (Math.max(W, HT) * 1.5));
        shakeAmount *= 0.96;

        if (explosionRadius > Math.max(W, HT) * 1.2) {
          phase = "done";
          // Removed reality cracks as per user request

          // Final transition
          setTimeout(() => {
            bootEl.classList.add("done");
            D.body.classList.add("boot-complete");
            cancelAnimationFrame(bootAnimId);
          }, 900);
        }
      }

      // ── Clear ──
      cx.fillStyle = "rgba(0,0,0,0.25)";
      cx.fillRect(0, 0, W, HT);

      // ── Draw smoke/fire clouds ──
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

      // ── Draw debris (exploding outward) ──
      for (const s of stars) {
        const distFromCore = Math.sqrt(Math.pow(s.x - CX, 2) + Math.pow(s.y - CY, 2));
        
        // Push outward
        const outwardForce = (blastIntensity * 100) / (distFromCore * 0.1 + 10);
        s.x += Math.cos(s.angle) * s.speed * outwardForce * (dt / 16);
        s.y += Math.sin(s.angle) * s.speed * outwardForce * (dt / 16);

        // Reset if off screen
        if (s.x < 0 || s.x > W || s.y < 0 || s.y > HT) {
          s.reset();
        }

        const [r, g, b] = s.color;

        cx.globalAlpha = s.brightness;
        cx.fillStyle = `rgb(${r},${g},${b})`;
        cx.beginPath();
        // Removed ellipse stretch so they remain circles and not lines
        cx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        cx.fill();
        cx.globalAlpha = 1;
      }

      // ── Blast energy ring ──
      if (blastIntensity > 0) {
        cx.save();
        cx.translate(CX, CY);
        // Tilt the ring slightly
        cx.scale(1, 0.7);
        cx.rotate(blastAngle);

        for (const dp of diskParticles) {
          dp.angle += dp.speed * (dt / 16);
          // Ring expands as blast intensifies
          const px = Math.cos(dp.angle) * dp.dist * (1 + blastIntensity * 2);
          const py = Math.sin(dp.angle) * dp.dist * (1 + blastIntensity * 2);
          const a = dp.brightness * blastIntensity;

          // Core dot
          cx.beginPath();
          cx.arc(px, py, dp.size, 0, Math.PI * 2);
          cx.fillStyle = `rgba(${dp.r},${dp.g},${dp.b},${a})`;
          cx.fill();
        }
        cx.globalAlpha = 1;
        cx.restore();

        // Blast core glow
        const coreGlow = cx.createRadialGradient(CX, CY, coreRadius * 0.5, CX, CY, coreRadius + 150 * blastIntensity);
        coreGlow.addColorStop(0, `rgba(255,255,255,1)`);
        coreGlow.addColorStop(0.2, `rgba(255,255,255,0.7)`);
        coreGlow.addColorStop(0.5, `rgba(255,255,255,${0.3 * blastIntensity})`);
        coreGlow.addColorStop(1, "transparent");
        cx.fillStyle = coreGlow;
        cx.fillRect(0, 0, W, HT);
      }

      // ── The Blast Core ──
      if (coreRadius > 0) {
        // Bright central core
        cx.fillStyle = "#fff";
        cx.beginPath();
        cx.arc(CX, CY, coreRadius * 0.4, 0, Math.PI * 2);
        cx.fill();

        // Intense photon ring
        cx.strokeStyle = `rgba(255,255,255,${0.8 + blastIntensity * 0.2})`;
        cx.lineWidth = 3 + blastIntensity * 4;
        cx.beginPath();
        cx.arc(CX, CY, coreRadius, 0, Math.PI * 2);
        cx.stroke();
      }

      // ── Detonation explosion ──
      if (phase === "supernova" || (phase === "done" && explosionAlpha > 0)) {
        // Massive expanding shockwave
        const g1 = cx.createRadialGradient(CX, CY, 0, CX, CY, explosionRadius);
        g1.addColorStop(0, `rgba(255,255,255,${explosionAlpha})`);
        g1.addColorStop(0.1, `rgba(220,220,220,${explosionAlpha * 0.9})`);
        g1.addColorStop(0.3, `rgba(180,180,180,${explosionAlpha * 0.6})`);
        g1.addColorStop(0.5, `rgba(120,120,120,${explosionAlpha * 0.3})`);
        g1.addColorStop(1, "transparent");
        cx.fillStyle = g1;
        cx.fillRect(0, 0, W, HT);

        // Shockwave ring edge
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
  })();

  /* ══ 2. THEME ══════════════════════════════════════════════════ */
  const stored = localStorage.getItem("rp");
  const sysDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
  H.setAttribute("data-theme", stored || (sysDark ? "dark" : "light"));
  D.getElementById("tgl").addEventListener("click", () => {
    const n = H.getAttribute("data-theme") === "dark" ? "light" : "dark";
    H.setAttribute("data-theme", n);
    localStorage.setItem("rp", n);
  });

  /* ══ 3. CANVAS — VS Code syntax snippets ══════════════════════ */
  const cv = D.getElementById("cv"),
    cx = cv.getContext("2d");
  let W,
    Ht,
    pts = [];

  /* VS Code Dark+ colour palette */
  const C = {
    kw: "#569cd6" /* keyword     — blue   */,
    fn: "#dcdcaa" /* function    — yellow */,
    st: "#ce9178" /* string      — orange */,
    nm: "#b5cea8" /* number      — green  */,
    cm: "#6a9955" /* comment     — green  */,
    tp: "#4ec9b0" /* type/class  — teal   */,
    vr: "#9cdcfe" /* variable    — cyan   */,
    op: "#d4d4d4" /* operator    — white  */,
    pm: "#c586c0" /* param       — violet */,
    gr: "#00ff88" /* accent      — matrix */,
    cy: "#00e5ff" /* cyan        — accent */,
  };

  /* Real multi-token code snippets.
   Each snippet is an array of [text, colorKey] pairs */
  const SNIPS = [
    [
      [" const ", " kw"],
      ["db", " vr"],
      [" = ", " op"],
      ["await ", " kw"],
      ["connect()", " fn"],
    ],
    [
      [" function ", " kw"],
      ["handler", " fn"],
      ["(req, res)", " pm"],
      [" {", " op"],
    ],
    [
      [" if ", " kw"],
      ["(err)", " vr"],
      [" return ", " kw"],
      ["null", " nm"],
    ],
    [
      [" const ", " kw"],
      ["port", " vr"],
      [" = ", " op"],
      ["process", " tp"],
      [".env.PORT", " vr"],
    ],
    [
      [" redis", " tp"],
      [".pub", " vr"],
      ["(", " op"],
      ["channel", " vr"],
      [")", " op"],
    ],
    [
      [" async ", " kw"],
      ["function ", " kw"],
      ["scale", " fn"],
      ["() {", " op"],
    ],
    [
      [" nginx", " st"],
      ["upstream ", " kw"],
      ["cluster", " tp"],
      [" {", " op"],
    ],
    [
      [" O(log n)", " gr"],
      [" // binary search", " cm"],
    ],
    [
      [" <T>", " tp"],
      ["extends ", " kw"],
      ["Base", " tp"],
      [" {", " op"],
    ],
    [
      [" socket", " vr"],
      [".emit", " fn"],
      ["(", " op"],
      ["'msg'", " st"],
      [", data)", " vr"],
    ],
    [
      [" import ", " kw"],
      ["{", " op"],
      ["Redis", " tp"],
      ["}", " op"],
      [" from ", " kw"],
      ["'ioredis'", " st"],
    ],
    [
      [" return ", " kw"],
      ["res", " vr"],
      [".status", " fn"],
      ["(200)", " nm"],
      [".json", " fn"],
      ["()", " op"],
    ],
    [
      [" const ", " kw"],
      ["token", " vr"],
      [" = ", " op"],
      ["jwt", " tp"],
      [".sign", " fn"],
      ["()", " op"],
    ],
    [
      [" while ", " kw"],
      ["(queue", " vr"],
      [".length)", " vr"],
      [" {", " op"],
    ],
    [
      [" bcrypt", " tp"],
      [".hash", " fn"],
      ["(pass,", " pm"],
      ["12)", " nm"],
    ],
    [
      [" class ", " kw"],
      ["Server", " tp"],
      [" extends ", " kw"],
      ["EventEmitter", " tp"],
    ],
    [
      [" #include", " kw"],
      ["<iostream>", " st"],
    ],
    [
      [" malloc", " fn"],
      ["(sizeof", " kw"],
      ["(Node)", " tp"],
      [")", " op"],
    ],
    [
      [" nginx", " vr"],
      [".conf", " st"],
      ["  worker_processes", " kw"],
      ["  4", " nm"],
    ],
    [
      [" pub", " vr"],
      [".subscribe", " fn"],
      ["(", " op"],
      ["'events'", " st"],
      [")", " op"],
    ],
    [
      [" SELECT", " kw"],
      ["*", " op"],
      [" FROM", " kw"],
      ["users", " vr"],
      [" WHERE", " kw"],
      ["active", " vr"],
    ],
    [
      [" 0xFF", " nm"],
      ["  &&  ", " op"],
      ["0b1010", " nm"],
    ],
    [
      [" try ", " kw"],
      ["{", " op"],
      ["  await", " kw"],
      ["db", " vr"],
      [".save()", " fn"],
    ],
    [
      [" catch", " kw"],
      ["(err)", " pm"],
      [" {", " op"],
      ["  throw", " kw"],
      ["new", " kw"],
      ["Error", " tp"],
    ],
    [
      [" @Controller", " pm"],
      ["(", " op"],
      ["'/api'", " st"],
      [")", " op"],
    ],
    [
      [" let ", " kw"],
      ["i", " vr"],
      [" = ", " op"],
      ["0", " nm"],
      ["; i < ", " op"],
      ["n", " vr"],
      ["; i++", " op"],
    ],
  ];

  function mkSnip() {
    const snip = SNIPS[Math.floor(Math.random() * SNIPS.length)];
    return {
      x: Math.random() * W,
      y: Ht + 20,                        /* always start below the screen */
      vy: -(Math.random() * 0.4 + 0.12), /* upward speed */
      vx: (Math.random() - 0.5) * 0.08,
      snip: snip,
      sz: Math.random() * 3 + 12,
      al: Math.random() * 0.28 + 0.14,  /* base alpha */
      /* track raw Y position for fade, not a lifecycle counter */
      born: null,                         /* set on first draw */
    };
  }
  function res() {
    W = cv.width = innerWidth;
    Ht = cv.height = innerHeight;
    pts = [];
    const n = Math.max(40, Math.floor((W * Ht) / 8000));
    for (let i = 0; i < n; i++) {
      const p = mkSnip();
      /* spread initial positions across the whole screen height */
      p.y = Math.random() * (Ht + 200) - 100;
      pts.push(p);
    }
  }
  function drw() {
    cx.clearRect(0, 0, W, Ht);
    const dk = H.getAttribute("data-theme") === "dark";
    const alpha_scale = dk ? 1 : 0.45;

    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      /* respawn at bottom when it exits the top */
      if (p.y < -60) {
        Object.assign(p, mkSnip());
        p.x = Math.random() * W;
        return;
      }

      /* fade in near bottom edge, fade out near top edge — full middle is fully visible */
      const fadeIn  = Math.min(1, (Ht - p.y) / 120);   /* fade in as it enters from bottom */
      const fadeOut = Math.min(1, (p.y + 60) / 120);    /* fade out as it exits at top */
      const fade = Math.min(fadeIn, fadeOut);
      const baseA = p.al * fade * alpha_scale;
      if (baseA <= 0.01) return;

      cx.save();
      cx.font = `${p.sz}px "JetBrains Mono",monospace`;
      cx.textBaseline = "alphabetic";

      let curX = p.x;
      p.snip.forEach(([txt, ckey]) => {
        let hex = C[ckey.trim()] || C.op;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        cx.fillStyle = `rgba(${r},${g},${b},${baseA})`;
        cx.fillText(txt, curX, p.y);
        curX += cx.measureText(txt).width;
      });
      cx.restore();
    });
    requestAnimationFrame(drw);
  }
  addEventListener("resize", res, { passive: true });
  res();
  drw();

  /* ══ SPOTLIGHT — cursor radial glow ══════════════════════════ */
  const spl = D.getElementById("spotlight");
  if (spl) {
    addEventListener(
      "mousemove",
      (e) => {
        spl.style.setProperty("--sx", e.clientX + "px");
        spl.style.setProperty("--sy", e.clientY + "px");
      },
      { passive: true },
    );
  }

  /* ══ 4. SCROLL PROGRESS + BACK TO TOP ═════════════════════════ */
  const prog = D.getElementById("progress"),
    btt = D.getElementById("btt");
  const nav = D.getElementById("nav");
  function onScroll() {
    const scrolled = (scrollY / (D.body.scrollHeight - innerHeight)) * 100;
    prog.style.width = scrolled + "%";
    btt.classList.toggle("show", scrollY > 400);
    nav.classList.toggle("sticky", scrollY > 28);
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ══ 5. ACTIVE NAV ═════════════════════════════════════════════ */
  const secs = [...D.querySelectorAll("section[id]")];
  const lks = [...D.querySelectorAll(".nav-links a")];
  secs.forEach((s) => {
    new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          lks.forEach((a) => a.classList.remove("act"));
          const a = D.querySelector(`.nav-links a[href="#${s.id}"]`);
          if (a) a.classList.add("act");
        }
      },
      { threshold: 0.45 },
    ).observe(s);
  });

  /* ══ 6. BURGER ═════════════════════════════════════════════════ */
  const burg = D.getElementById("burg"),
    mdrw = D.getElementById("mdrw"),
    mscrim = D.getElementById("mscrim");
  function openM() {
    burg.classList.add("open");
    burg.setAttribute("aria-expanded", "true");
    mdrw.classList.add("open");
    mdrw.setAttribute("aria-hidden", "false");
    D.body.style.overflow = "hidden";
  }
  function closeM() {
    burg.classList.remove("open");
    burg.setAttribute("aria-expanded", "false");
    mdrw.classList.remove("open");
    mdrw.setAttribute("aria-hidden", "true");
    D.body.style.overflow = "";
  }
  burg.addEventListener("click", () =>
    mdrw.classList.contains("open") ? closeM() : openM(),
  );
  mscrim.addEventListener("click", closeM);
  D.querySelectorAll(".mpnl a").forEach((a) =>
    a.addEventListener("click", closeM),
  );
  addEventListener("resize", () => {
    if (innerWidth > 768) closeM();
  });

  /* ══ 7. REVEAL — bidirectional ═════════════════════════════════ */
  const rvIO = new IntersectionObserver(
    (es, o) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          o.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -16px 0px" },
  );
  D.querySelectorAll(".rv").forEach((el) => rvIO.observe(el));

  /* ══ 8. TYPED.JS ═══════════════════════════════════════════════ */
  if (D.getElementById("typed-el")) {
    new Typed("#typed-el", {
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
  }

  /* ══ 9. COUNTER ════════════════════════════════════════════════ */
  const wsc = D.getElementById("wsc");
  if (wsc) {
    let done = false;
    new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done) {
          done = true;
          const s = performance.now(),
            T = 14500,
            DU = 1800;
          (function t(now) {
            const p = Math.min((now - s) / DU, 1);
            wsc.textContent = Math.round(
              T * (1 - Math.pow(1 - p, 3)),
            ).toLocaleString();
            if (p < 1) requestAnimationFrame(t);
            else wsc.textContent = T.toLocaleString();
          })(s);
        }
      },
      { threshold: 0.6 },
    ).observe(wsc);
  }

  /* ══ 10. CUBOID 3D ROTATION ════════════════════════════════════════ */
  const cube = D.getElementById("cuboid");
  if (cube) {
    let rX = -10, rY = -20;
    let drag = false;
    let startX, startY;
    let baseRX = rX, baseRY = rY;
    let autoRotate = true;
    let lastTime = performance.now();
    let speed = 0.02;
    
    let vX = 0, vY = 0;
    let lastDragX, lastDragY, lastDragTime;

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
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

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
    
    cube.addEventListener('touchmove', (e) => {
      if (drag) e.preventDefault();
    }, { passive: false });
  }

  /* ══ 11. MAGNETIC SKILL CARDS ═════════════════════════════════ */
  if (!("ontouchstart" in window)) {
    D.querySelectorAll(".sk").forEach((card) => {
      const strength = 10;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left - r.width / 2) / r.width) * strength;
        const y = ((e.clientY - r.top - r.height / 2) / r.height) * strength;
        card.style.transform = `translate(${x}px,${y}px) translateY(${card.style.transform.includes("translateY(-5px)") ? "-5px" : "0px"})`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ══ 12. COPY EMAIL ════════════════════════════════════════════ */
  function copyEmail() {
    navigator.clipboard
      .writeText("rashq122@gmail.com")
      .then(() => {
        const btn = D.getElementById("copy-btn");
        const ico = D.getElementById("copy-icon");
        const txt = D.getElementById("copy-txt");
        btn.classList.add("copied");
        ico.className = "bx bx-check";
        txt.textContent = "Copied!";
        setTimeout(() => {
          btn.classList.remove("copied");
          ico.className = "bx bx-copy";
          txt.textContent = "Copy";
        }, 2500);
      })
      .catch(() => {
        // fallback
        const el = D.createElement("textarea");
        el.value = "rashq122@gmail.com";
        D.body.appendChild(el);
        el.select();
        D.execCommand("copy");
        D.body.removeChild(el);
        const btn = D.getElementById("copy-btn");
        const ico = D.getElementById("copy-icon");
        const txt = D.getElementById("copy-txt");
        btn.classList.add("copied");
        ico.className = "bx bx-check";
        txt.textContent = "Copied!";
        setTimeout(() => {
          btn.classList.remove("copied");
          ico.className = "bx bx-copy";
          txt.textContent = "Copy";
        }, 2500);
      });
  }
  window.copyEmail = copyEmail;
})();

/* ══ SKILL NETWORK GRAPH ════════════════════════════════ */
(function initSkillGraph() {
  const cv = document.getElementById('sk-graph-cv');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let DPR = Math.min(devicePixelRatio, 2);
  let LW = 0, LH = 0;

  function resize() {
    const rect = cv.getBoundingClientRect();
    LW = rect.width; LH = rect.height;
    DPR = Math.min(devicePixelRatio, 2);
    cv.width  = LW * DPR;
    cv.height = LH * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  /* ── CATEGORIES ── */
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

  /* ── NODES — bigger base radii so labels always fit ── */
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

  /* ── VIEWPORT (pan + zoom) ── */
  let vpX = 0, vpY = 0, vpZ = 1;   /* pan offset, zoom */

  /* convert screen → world coords */
  function toWorld(sx, sy) {
    return { x: (sx - vpX) / vpZ, y: (sy - vpY) / vpZ };
  }

  /* ── INIT POSITIONS in world space ── */
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

  /* ── STATE ── */
  let hovered  = null;
  let dragging = null;   /* node being dragged */
  let panning  = false;  /* dragging empty space */
  let pinned   = new Set();
  let time     = 0;
  let lastPanX = 0, lastPanY = 0;
  let dragOffX = 0, dragOffY = 0;

  /* ── PHYSICS ── */
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

  /* ── DRAW ── */
  function draw() {
    ctx.clearRect(0, 0, LW, LH);
    const dark = isDark();
    const connected = hovered ? connectedIds(hovered.id) : null;

    /* === apply pan+zoom transform === */
    ctx.save();
    ctx.translate(vpX, vpY);
    ctx.scale(vpZ, vpZ);

    /* ── grid dots ── */
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
    const gStep = 36;
    /* only draw visible grid cells */
    const startX = Math.floor(-vpX / vpZ / gStep) * gStep;
    const startY = Math.floor(-vpY / vpZ / gStep) * gStep;
    const endX   = startX + LW / vpZ + gStep;
    const endY   = startY + LH / vpZ + gStep;
    for (let gx = startX; gx < endX; gx += gStep) {
      for (let gy = startY; gy < endY; gy += gStep) {
        ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI*2); ctx.fill();
      }
    }

    /* ── edges ── */
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
        /* glowing animated edge */
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

    /* ── draw dimmed nodes first, active nodes on top ── */
    const drawOrder = hovered
      ? [...NODES].sort((a, b) => {
          const aActive = a === hovered || (connected && connected.has(a.id));
          const bActive = b === hovered || (connected && connected.has(b.id));
          return aActive - bActive;
        })
      : NODES;

    drawOrder.forEach(n => {
      const cat    = CATS[n.cat];
      const isHov  = hovered === n;
      const isDrag = dragging === n;
      const isPinned = pinned.has(n.id);
      const isConn = connected && connected.has(n.id);
      const dimmed = hovered && !isHov && !isConn;
      const active = isHov || isDrag || isConn;
      const r      = (isHov || isDrag) ? n.r + 5 : n.r;
      const col    = dark ? '#ffffff' : '#000000';

      /* ── animated glow ring on hover ── */
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

      /* ── node body — radial gradient ── */
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

      /* ── border ── */
      ctx.lineWidth   = isHov||isDrag ? 2.5 : (isConn ? 2 : 1.5);
      ctx.strokeStyle = dimmed ? col+'22' : (active ? col : col+'75');
      ctx.stroke();

      /* ── inner highlight arc (makes it look 3D) ── */
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

      /* ── pin dot ── */
      if (isPinned && !isHov && !isDrag) {
        ctx.beginPath(); ctx.arc(n.x + r*0.66, n.y - r*0.66, 4, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
      }

      /* ── LABEL — always crisp, always readable ── */
      /* choose font size to always fit inside the circle */
      const maxFontW  = r * 1.55;               /* max label width = diameter * 0.78 */
      let   fontSize  = isHov ? 12 : 11;
      ctx.font        = `600 ${fontSize}px "JetBrains Mono",monospace`;
      /* scale down if text overflows */
      let   tw = ctx.measureText(n.l).width;
      if (tw > maxFontW) {
        fontSize = Math.max(8, fontSize * maxFontW / tw);
        ctx.font = `600 ${fontSize}px "JetBrains Mono",monospace`;
        tw       = ctx.measureText(n.l).width;
      }
      const th = fontSize;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      /* solid pill inside the circle */
      const pillPadX = 5, pillPadY = 3;
      const pillW = tw + pillPadX * 2;
      const pillH = th + pillPadY * 2;
      /* clamp pill to circle */
      ctx.save();
      ctx.beginPath(); ctx.arc(n.x, n.y, r - 1, 0, Math.PI*2); ctx.clip();

      /* pill background */
      ctx.fillStyle = dark
        ? (dimmed ? 'rgba(10,13,20,0.7)' : 'rgba(10,13,20,0.88)')
        : (dimmed ? 'rgba(240,244,255,0.65)' : 'rgba(240,244,255,0.92)');
      ctx.beginPath();
      ctx.roundRect(n.x - pillW/2, n.y - pillH/2, pillW, pillH, 3);
      ctx.fill();

      /* label text — always full contrast for active nodes */
      if (dimmed) {
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
      } else if (isHov || isDrag) {
        ctx.fillStyle = col;                         /* category color on hover */
      } else if (isConn) {
        ctx.fillStyle = dark ? '#d8e0ec' : '#0d1626'; /* full contrast on connected */
      } else {
        ctx.fillStyle = dark ? 'rgba(216,224,236,0.9)' : 'rgba(13,22,38,0.9)';
      }
      ctx.fillText(n.l, n.x, n.y);
      ctx.restore();
    });

    /* === restore transform === */
    ctx.restore();

    /* ── zoom indicator ── */
    if (Math.abs(vpZ - 1) > 0.08) {
      const pct = Math.round(vpZ * 100);
      ctx.font      = '400 10px "JetBrains Mono",monospace';
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${pct}%`, LW - 10, LH - 8);
    }
  }

  function loop() { time += 0.016; simulate(); draw(); requestAnimationFrame(loop); }
  loop();

  /* ── HTML TOOLTIP ── */
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
    /* position — offset from mouse, clamp to viewport */
    const tw = tipEl.offsetWidth  || 200;
    const th = tipEl.offsetHeight || 48;
    let   tx = clientX + 18;
    let   ty = clientY - th / 2;
    if (tx + tw + 8 > innerWidth)  tx = clientX - tw - 18;
    if (ty < 8)                     ty = 8;
    if (ty + th + 8 > innerHeight)  ty = innerHeight - th - 8;
    tipEl.style.left = tx + 'px';
    tipEl.style.top  = ty + 'px';
  }
  function hideTip() { if (tipEl) tipEl.style.opacity = '0'; }

  /* ── POINTER EVENTS ── */
  function getNode(sx, sy) {
    /* sx/sy = screen coords → convert to world */
    const w = toWorld(sx, sy);
    for (const n of NODES) {
      const dx = n.x - w.x, dy = n.y - w.y;
      if (dx*dx + dy*dy < (n.r + 6)*(n.r + 6)) return n;
    }
    return null;
  }

  cv.addEventListener('mousemove', e => {
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
  });

  cv.addEventListener('mousedown', e => {
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
  });

  cv.addEventListener('mouseup', () => {
    if (dragging) { pinned.add(dragging.id); dragging = null; }
    panning = false;
    cv.style.cursor = hovered ? 'grab' : 'crosshair';
  });

  /* double-click to unpin */
  cv.addEventListener('dblclick', e => {
    const rect = cv.getBoundingClientRect();
    const hit  = getNode(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) { pinned.delete(hit.id); hit.vx = 0; hit.vy = 0; }
  });

  /* scroll to zoom */
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    const rect   = cv.getBoundingClientRect();
    const sx     = e.clientX - rect.left;
    const sy     = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    const newZ   = Math.max(0.35, Math.min(3, vpZ * factor));
    /* zoom toward cursor */
    vpX = sx - (sx - vpX) * (newZ / vpZ);
    vpY = sy - (sy - vpY) * (newZ / vpZ);
    vpZ = newZ;
  }, { passive: false });

  /* touch: 1-finger drag node or page scroll, 2-finger pinch-zoom */
  let touch1 = null, touch2 = null, initPinchDist = 0, initVpZ = 1;
  cv.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touch1 = e.touches[0];
      const rect = cv.getBoundingClientRect();
      const sx   = touch1.clientX - rect.left;
      const sy   = touch1.clientY - rect.top;
      const hit  = getNode(sx, sy);
      if (hit) {
        /* touching a node — start node drag */
        e.preventDefault();
        dragging = hit;
        const w  = toWorld(sx, sy);
        dragOffX = hit.x - w.x;
        dragOffY = hit.y - w.y;
        hit.vx = 0; hit.vy = 0;
        hovered = hit;
        showTip(hit, touch1.clientX, touch1.clientY);
      } else {
        /* touching empty space — let the browser scroll */
        dragging = null;
        hovered = null;
        hideTip();
      }
    } else if (e.touches.length === 2) {
      e.preventDefault();
      dragging = null;
      touch1 = e.touches[0]; touch2 = e.touches[1];
      initPinchDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initVpZ = vpZ;
    }
  }, { passive: false });

  cv.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
      if (dragging) {
        e.preventDefault(); /* prevent scroll while dragging a node */
        const t    = e.touches[0];
        const rect = cv.getBoundingClientRect();
        const sx   = t.clientX - rect.left;
        const sy   = t.clientY - rect.top;
        const w    = toWorld(sx, sy);
        dragging.x = w.x + dragOffX;
        dragging.y = w.y + dragOffY;
        dragging.vx = 0; dragging.vy = 0;
        showTip(dragging, t.clientX, t.clientY);
      }
      /* If not dragging, we do nothing and let the browser scroll the page */
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      vpZ = Math.max(0.35, Math.min(3, initVpZ * d / initPinchDist));
    }
  }, { passive: false });

  cv.addEventListener('touchend', e => {
    if (dragging) { pinned.add(dragging.id); dragging = null; }
    hovered = null; hideTip();
    touch1 = null; touch2 = null;
  });

  /* double-tap to reset view or unpin */
  let lastTap = 0;
  cv.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const rect = cv.getBoundingClientRect();
        const hit = getNode(t.clientX - rect.left, t.clientY - rect.top);
        if (hit) {
          pinned.delete(hit.id); hit.vx = 0; hit.vy = 0;
        } else {
          vpX = 0; vpY = 0; vpZ = 1;
        }
      }
    }
    lastTap = now;
  });

  cv.addEventListener('mouseleave', () => { hovered = null; dragging = null; panning = false; hideTip(); cv.style.cursor = 'crosshair'; });

  /* reset view button — double-click on empty space */
  let dblClickTimer = 0;
  cv.addEventListener('dblclick', e => {
    const rect = cv.getBoundingClientRect();
    const hit  = getNode(e.clientX - rect.left, e.clientY - rect.top);
    if (!hit) { vpX = 0; vpY = 0; vpZ = 1; }          /* reset pan/zoom on empty dblclick */
  });

  addEventListener('resize', () => { resize(); initPos(); pinned.clear(); }, { passive: true });
  const tglBtn = document.getElementById('tgl');
  if (tglBtn) tglBtn.addEventListener('click', () => setTimeout(draw, 60));
})();

// ═══ TELEMETRY (REALTIME METRICS) ═══
async function fetchTelemetry() {
  const cfRating = document.getElementById('cf-rating'),
        cfMaxRating = document.getElementById('cf-max-rating'),
        cfRank = document.getElementById('cf-rank-badge'),
        cfContests = document.getElementById('cf-contests'),
        cfContrib = document.getElementById('cf-contrib'),
        ghRepos = document.getElementById('gh-repos'),
        lcSolved = document.getElementById('lc-solved');

  // Animation helper
  const animateValue = (obj, start, end, duration, isFloat=false) => {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      let current = ease * (end - start) + start;
      obj.innerHTML = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  try {
    // LeetCode Base (Rating / Top % / Contests)
    // Helper for LC Contest
    const applyLCContest = (data) => {
      if(!data) return;
      let peakRating = data.contestRating || 1742;
      if (data.contestParticipation && Array.isArray(data.contestParticipation)) {
        const ratings = data.contestParticipation.map(c => c.rating).filter(r => typeof r === 'number');
        if (ratings.length > 0) {
          peakRating = Math.max(...ratings);
        }
      }
      const rat = document.getElementById('lc-rating');
      const con = document.getElementById('lc-contests');
      const top = document.getElementById('lc-top-badge');
      if(rat) animateValue(rat, 0, peakRating, 2000, true);
      if(con) animateValue(con, 0, data.contestAttend || 45, 1500);
      if(top) top.innerText = `Top ${data.contestTopPercentage || 12.5}%`;
    };

    // LeetCode Base (Rating / Top % / Contests)
    fetch('https://alfa-leetcode-api.onrender.com/rashq_01/contest')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if(data && (data.contestRating || data.contestParticipation)) {
          applyLCContest(data);
        } else {
          applyLCContest({ contestRating: 1742, contestAttend: 26, contestTopPercentage: 11.15 });
        }
      }).catch(e => {
        applyLCContest({ contestRating: 1742, contestAttend: 26, contestTopPercentage: 11.15 });
      });

    // Helper for LC Solved
    const applyLCSolved = (data) => {
      if(!data) return;
      const total = data.solvedProblem || 593;
      const ez = data.easySolved || 213, md = data.mediumSolved || 308, hd = data.hardSolved || 72;
      
      if(document.getElementById('lc-easy')) animateValue(document.getElementById('lc-easy'), 0, ez, 1500);
      if(document.getElementById('lc-med')) animateValue(document.getElementById('lc-med'), 0, md, 1500);
      if(document.getElementById('lc-hard')) animateValue(document.getElementById('lc-hard'), 0, hd, 1500);
      if(lcSolved) animateValue(lcSolved, 0, total, 1500);
      
      // Circular Progress (Donut) Update
      const lcCircle = document.getElementById('lc-circle');
      if(lcCircle && total > 0) {
        // LeetCode Distribution (approx as of recent)
        const tEz = 830, tMd = 2120, tHd = 1083;
        const tLc = tEz + tMd + tHd;
        
        // We use 260 degrees of the circle, leaving a 100 degree gap at the bottom
        // Circle starts at bottom-left (approx 230 degrees)
        const TOTAL_DEG = 260;
        const ezZoneDeg = (tEz / tLc) * TOTAL_DEG;
        const mdZoneDeg = (tMd / tLc) * TOTAL_DEG;
        const hdZoneDeg = (tHd / tLc) * TOTAL_DEG;
        
        // Small gap between zones (in degrees)
        const GAP = 3;
        
        let startTimestamp = null;
        const duration = 1500;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          // Calculate filled amount for each zone (animating)
          const curEzDeg = (ez / tEz) * ezZoneDeg * ease;
          const curMdDeg = (md / tMd) * mdZoneDeg * ease;
          const curHdDeg = (hd / tHd) * hdZoneDeg * ease;
          
          // Build the conic-gradient string
          // Note: conic-gradient starts at 12 o'clock (0deg), we want to rotate it
          let grad = `conic-gradient(from 230deg, `;
          
          // EASY ZONE
          grad += `var(--lc-ez) 0deg ${curEzDeg}deg, `;
          grad += `rgba(0,184,163,0.15) ${curEzDeg}deg ${ezZoneDeg - GAP}deg, `;
          grad += `transparent ${ezZoneDeg - GAP}deg ${ezZoneDeg}deg, `;
          
          // MEDIUM ZONE
          grad += `var(--lc-md) ${ezZoneDeg}deg ${ezZoneDeg + curMdDeg}deg, `;
          grad += `rgba(255,192,30,0.15) ${ezZoneDeg + curMdDeg}deg ${ezZoneDeg + mdZoneDeg - GAP}deg, `;
          grad += `transparent ${ezZoneDeg + mdZoneDeg - GAP}deg ${ezZoneDeg + mdZoneDeg}deg, `;
          
          // HARD ZONE
          grad += `var(--lc-hd) ${ezZoneDeg + mdZoneDeg}deg ${ezZoneDeg + mdZoneDeg + curHdDeg}deg, `;
          grad += `rgba(255,55,95,0.15) ${ezZoneDeg + mdZoneDeg + curHdDeg}deg ${TOTAL_DEG}deg, `;
          
          // BOTTOM GAP (100 degrees transparent)
          grad += `transparent ${TOTAL_DEG}deg 360deg)`;
          
          lcCircle.style.background = grad;
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }
    };

    // LeetCode Solved (Easy/Med/Hard/Total)
    fetch('https://alfa-leetcode-api.onrender.com/rashq_01/solved')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if(data && data.solvedProblem) {
          applyLCSolved(data);
        } else {
          applyLCSolved({});
        }
      }).catch(e => {
        applyLCSolved({});
      });

    // Codeforces Base Info
    fetch('https://codeforces.com/api/user.info?handles=rashq_01')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "OK") {
          const user = data.result[0];
          if(user.rating) animateValue(cfRating, 0, user.rating, 2000);
          if(user.maxRating) animateValue(cfMaxRating, 0, user.maxRating, 2000);
          if(user.rank) cfRank.innerText = String(user.rank).toUpperCase();
          if(user.contribution !== undefined) animateValue(cfContrib, 0, user.contribution, 1500);
        }
      }).catch(e => console.error("CF Error", e));
      
    // Codeforces Contests
    fetch('https://codeforces.com/api/user.rating?handle=rashq_01')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "OK") {
          animateValue(cfContests, 0, data.result.length, 1500);
        }
      }).catch(e => console.error("CF Contests Error", e));

    // CodeChef (Using a generic proxy or hardcoded fallback if API fails)
    fetch('https://codechef-api.vercel.app/handle/rashq_01')
      .then(res => res.json())
      .then(data => {
        if (!data || data.success === false) return;
        if(data.currentRating) animateValue(document.getElementById('cc-rating'), 0, data.currentRating, 2000);
        if(data.highestRating) animateValue(document.getElementById('cc-max-rating'), 0, data.highestRating, 2000);
        if(data.globalRank) animateValue(document.getElementById('cc-global-rank'), 0, data.globalRank, 2000);
        if(data.countryRank) animateValue(document.getElementById('cc-country-rank'), 0, data.countryRank, 2000);
        if(data.stars) document.getElementById('cc-stars-badge').innerText = data.stars;
      }).catch(e => {
        console.warn("CodeChef API failed. Falling back to cached stats.", e);
        animateValue(document.getElementById('cc-rating'), 0, 1519, 2000);
        animateValue(document.getElementById('cc-max-rating'), 0, 1570, 2000);
        document.getElementById('cc-global-rank').innerText = "23711";
        document.getElementById('cc-country-rank').innerText = "12";
        document.getElementById('cc-stars-badge').innerText = "2★";
      });

    // GitHub
    fetch('https://api.github.com/users/rashq-01')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if(data.public_repos !== undefined) animateValue(ghRepos, 0, data.public_repos, 1500);
        }
      }).catch(e => console.error("GH Error", e));

    // LeetCode Calendar (Heatmap)
    fetch('https://alfa-leetcode-api.onrender.com/rashq_01/calendar')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.submissionCalendar) {
          const cal = JSON.parse(data.submissionCalendar);
          const heatmapEl = document.getElementById('lc-heatmap');
          if (!heatmapEl) return;
          heatmapEl.innerHTML = '';
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          let html = `<div style="display: flex; gap: 16px;">`;
          
          const now = new Date();
          const todayUTC = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
          
          for(let mOffset = 11; mOffset >= 0; mOffset--) {
            let targetMonth = now.getUTCMonth() - mOffset;
            let targetYear = now.getUTCFullYear();
            if (targetMonth < 0) {
              targetMonth += 12;
              targetYear -= 1;
            }
            
            html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
            html += `<span style="font-size: 10px; color: var(--tx3); font-family: var(--m);">${monthNames[targetMonth]}</span>`;
            html += `<div class="heatmap-grid" style="display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr); gap: 4px;">`;
            
            const daysInMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
            const firstDay = new Date(Date.UTC(targetYear, targetMonth, 1)).getUTCDay(); // 0 = Sunday
            
            for(let i = 0; i < firstDay; i++) {
              html += `<div style="width: 12px; height: 12px; pointer-events: none;"></div>`;
            }
            
            for(let d = 1; d <= daysInMonth; d++) {
              const ts = Math.floor(Date.UTC(targetYear, targetMonth, d) / 1000);
              
              if (ts > todayUTC) {
                html += `<div style="width: 12px; height: 12px; pointer-events: none;"></div>`;
                continue;
              }
              
              const count = cal[ts] || 0;
              let level = 0;
              if(count > 0) {
                if(count <= 2) level = 1;
                else if(count <= 5) level = 2;
                else if(count <= 10) level = 3;
                else level = 4;
              }
              
              html += `<div class="hm-cell" data-level="${level}" title="${count} submissions on ${targetMonth+1}/${d}/${targetYear}"></div>`;
            }
            html += `</div></div>`;
          }
          
          html += `</div>`;
          heatmapEl.innerHTML = html;
        }
      }).catch(e => console.error("LC Calendar Error", e));

  } catch(e) {
    console.error("Telemetry failed:", e);
  }
}

// Fetch telemetry immediately
setTimeout(fetchTelemetry, 100);
// ── LIVE AGE TICKER ──
function updateLiveAge() {
  const ageEl = document.getElementById("live-age");
  if (!ageEl) return;
  // DOB: 16/09/2004 06:30:00 PM (using 2004 instead of 2024 to match the 21+ age)
  const dob = new Date("2004-09-16T18:30:00");
  const now = new Date();
  
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  let diff = now - dob;
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  
  ageEl.textContent = `${years} yrs, ${months} mos, ${days} days, ${hStr}:${mStr}:${sStr}`;
}
setInterval(updateLiveAge, 1000);
updateLiveAge();
