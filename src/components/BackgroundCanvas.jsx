import React, { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, Ht, pts = [];

    const C = {
      kw: "#569cd6", fn: "#dcdcaa", st: "#ce9178", nm: "#b5cea8",
      cm: "#6a9955", tp: "#4ec9b0", vr: "#9cdcfe", op: "#d4d4d4",
      pm: "#c586c0", gr: "#00ff88", cy: "#00e5ff"
    };

    const SNIPS = [
      [[" const ", " kw"], ["db", " vr"], [" = ", " op"], ["await ", " kw"], ["connect()", " fn"]],
      [[" function ", " kw"], ["handler", " fn"], ["(req, res)", " pm"], [" {", " op"]],
      [[" if ", " kw"], ["(err)", " vr"], [" return ", " kw"], ["null", " nm"]],
      [[" const ", " kw"], ["port", " vr"], [" = ", " op"], ["process", " tp"], [".env.PORT", " vr"]],
      [[" redis", " tp"], [".pub", " vr"], ["(", " op"], ["channel", " vr"], [")", " op"]],
      [[" async ", " kw"], ["function ", " kw"], ["scale", " fn"], ["() {", " op"]],
      [[" nginx", " st"], ["upstream ", " kw"], ["cluster", " tp"], [" {", " op"]],
      [[" O(log n)", " gr"], [" // binary search", " cm"]],
      [[" <T>", " tp"], ["extends ", " kw"], ["Base", " tp"], [" {", " op"]],
      [[" socket", " vr"], [".emit", " fn"], ["(", " op"], ["'msg'", " st"], [", data)", " vr"]],
      [[" import ", " kw"], ["{", " op"], ["Redis", " tp"], ["}", " op"], [" from ", " kw"], ["'ioredis'", " st"]],
      [[" return ", " kw"], ["res", " vr"], [".status", " fn"], ["(200)", " nm"], [".json", " fn"], ["()", " op"]],
      [[" const ", " kw"], ["token", " vr"], [" = ", " op"], ["jwt", " tp"], [".sign", " fn"], ["()", " op"]],
      [[" while ", " kw"], ["(queue", " vr"], [".length)", " vr"], [" {", " op"]],
      [[" bcrypt", " tp"], [".hash", " fn"], ["(pass,", " pm"], ["12)", " nm"]],
      [[" class ", " kw"], ["Server", " tp"], [" extends ", " kw"], ["EventEmitter", " tp"]],
      [[" #include", " kw"], ["<iostream>", " st"]],
      [[" malloc", " fn"], ["(sizeof", " kw"], ["(Node)", " tp"], [")", " op"]],
      [[" nginx", " vr"], [".conf", " st"], ["  worker_processes", " kw"], ["  4", " nm"]],
      [[" pub", " vr"], [".subscribe", " fn"], ["(", " op"], ["'events'", " st"], [")", " op"]],
      [[" SELECT", " kw"], ["*", " op"], [" FROM", " kw"], ["users", " vr"], [" WHERE", " kw"], ["active", " vr"]],
      [[" 0xFF", " nm"], ["  &&  ", " op"], ["0b1010", " nm"]],
      [[" try ", " kw"], ["{", " op"], ["  await", " kw"], ["db", " vr"], [".save()", " fn"]],
      [[" catch", " kw"], ["(err)", " pm"], [" {", " op"], ["  throw", " kw"], ["new", " kw"], ["Error", " tp"]],
      [[" @Controller", " pm"], ["(", " op"], ["'/api'", " st"], [")", " op"]],
      [[" let ", " kw"], ["i", " vr"], [" = ", " op"], ["0", " nm"], ["; i < ", " op"], ["n", " vr"], ["; i++", " op"]],
    ];

    function mkSnip() {
      const snip = SNIPS[Math.floor(Math.random() * SNIPS.length)];
      return {
        x: Math.random() * W,
        y: Ht + 20,
        vy: -(Math.random() * 0.4 + 0.12),
        vx: (Math.random() - 0.5) * 0.08,
        snip: snip,
        sz: Math.random() * 3 + 12,
        al: Math.random() * 0.28 + 0.14,
        born: null,
      };
    }

    function res() {
      W = cv.width = window.innerWidth;
      Ht = cv.height = window.innerHeight;
      pts = [];
      const n = Math.max(40, Math.floor((W * Ht) / 8000));
      for (let i = 0; i < n; i++) {
        const p = mkSnip();
        p.y = Math.random() * (Ht + 200) - 100;
        pts.push(p);
      }
    }

    let animId;
    function drw() {
      cx.clearRect(0, 0, W, Ht);
      const dk = document.documentElement.getAttribute("data-theme") !== "light";
      const alpha_scale = dk ? 1 : 0.45;

      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -60) {
          Object.assign(p, mkSnip());
          p.x = Math.random() * W;
          return;
        }

        const fadeIn  = Math.min(1, (Ht - p.y) / 120);
        const fadeOut = Math.min(1, (p.y + 60) / 120);
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
      animId = requestAnimationFrame(drw);
    }

    window.addEventListener("resize", res, { passive: true });
    res();
    drw();

    return () => {
      window.removeEventListener("resize", res);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas id="cv" ref={canvasRef}></canvas>;
}

