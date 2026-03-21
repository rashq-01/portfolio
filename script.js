(function () {
  "use strict";
  const D = document,
    H = D.documentElement;

  /* ══ 1. BOOT SCREEN ═══════════════════════════════════════════ */
  const bootEl = D.getElementById("boot"),
    bbar = D.getElementById("bbar"),
    btxt = D.getElementById("btxt");
  const bootMsgs = [
    "Initializing runtime...",
    "Loading Node.js cluster...",
    "Connecting Redis Pub/Sub...",
    "Binding Nginx upstream...",
    "Compiling personality.cpp...",
    "Portfolio ready.",
  ];
  let bi = 0,
    bp = 0;
  function bootStep() {
    if (bi >= bootMsgs.length) {
      setTimeout(() => {
        bootEl.classList.add("done");
      }, 400);
      return;
    }
    btxt.textContent = bootMsgs[bi++];
    bp = Math.min(bp + Math.floor(100 / bootMsgs.length) + 1, 100);
    bbar.style.width = bp + "%";
    setTimeout(bootStep, bi === bootMsgs.length ? 600 : 320);
  }
  setTimeout(bootStep, 200);

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
      y: Math.random() * Ht,
      vy: -(Math.random() * 0.55 + 0.18),
      vx: (Math.random() - 0.5) * 0.12,
      snip: snip,
      sz: Math.random() * 3 + 13 /* font size 13-16px — bigger & clearer */,
      al: Math.random() * 0.35 + 0.18 /* base alpha 0.18–0.53 — more visible */,
      lf: Math.random(),
    };
  }
  function res() {
    W = cv.width = innerWidth;
    Ht = cv.height = innerHeight;
    pts = [];
    const n = Math.max(35, Math.floor((W * Ht) / 9000));
    for (let i = 0; i < n; i++) pts.push(mkSnip());
  }
  function drw() {
    cx.clearRect(0, 0, W, Ht);
    const dk = H.getAttribute("data-theme") === "dark";
    const alpha_scale = dk ? 1 : 0.55;

    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.lf += 0.002;
      if (p.y < -40 || p.lf > 1) {
        const fresh = mkSnip();
        fresh.y = Ht + 20;
        fresh.lf = 0;
        Object.assign(p, fresh);
      }
      /* gentler fade — stays visible longer through the lifecycle */
      const fade = Math.max(0, 1 - Math.pow(Math.abs(p.lf - 0.5) * 2, 2.5));
      const baseA = p.al * fade * alpha_scale;
      if (baseA <= 0.015) return;

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
        "./run nexus-chat --workers=5",
        "git commit -m 'feat: 14k rps'",
        "redis-cli SUBSCRIBE events",
        "npm start --env=production",
        "ssh -i key.pem rajesh@backend",
        "./benchmark --ws --rps=15000",
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

  /* ══ 10. PHOTO 3D TILT ════════════════════════════════════════ */
  const pc = D.getElementById("pcard"),
    ps = D.getElementById("psh");
  if (pc && !("ontouchstart" in window)) {
    pc.parentElement.style.perspective = "1100px";
    let tX = 0,
      tY = 0,
      cX = 0,
      cY = 0,
      raf = null,
      on = false;
    const lr = (a, b, t) => a + (b - a) * t;
    function loop() {
      cX = lr(cX, tX, on ? 0.13 : 0.07);
      cY = lr(cY, tY, on ? 0.13 : 0.07);
      const sc = on ? 1.04 : 1;
      pc.style.transform = `rotateX(${cX}deg) rotateY(${cY}deg) scale3d(${sc},${sc},${sc})`;
      if (Math.abs(cX - tX) > 0.007 || Math.abs(cY - tY) > 0.007 || on)
        raf = requestAnimationFrame(loop);
      else {
        pc.style.transform = "";
        raf = null;
      }
    }
    function go() {
      if (!raf) raf = requestAnimationFrame(loop);
    }
    pc.addEventListener("mouseenter", () => {
      on = true;
      pc.classList.add("ton");
      pc.classList.remove("toff");
      if (ps) ps.style.setProperty("--sop", "1");
      go();
    });
    pc.addEventListener("mousemove", (e) => {
      const r = pc.getBoundingClientRect();
      tY = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 13;
      tX = (-(e.clientY - r.top - r.height / 2) / (r.height / 2)) * 13;
      if (ps) {
        ps.style.setProperty(
          "--mx",
          (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
        );
        ps.style.setProperty(
          "--my",
          (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
        );
      }
    });
    pc.addEventListener("mouseleave", () => {
      on = false;
      tX = 0;
      tY = 0;
      pc.classList.remove("ton");
      pc.classList.add("toff");
      if (ps) ps.style.setProperty("--sop", "0");
      go();
      setTimeout(() => pc.classList.remove("toff"), 700);
    });
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
