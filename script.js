(function () {
            "use strict";

            /* 1 ─── THEME ──────────────────────────────────────── */
            const H = document.documentElement, TG = document.getElementById("theme-toggle");
            const stored = localStorage.getItem("rp-theme");
            const sysDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
            H.setAttribute("data-theme", stored || (sysDark ? "dark" : "light"));
            TG.addEventListener("click", () => {
                const n = H.getAttribute("data-theme") === "dark" ? "light" : "dark";
                H.setAttribute("data-theme", n);
                localStorage.setItem("rp-theme", n);
            });
            window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", e => {
                if (!localStorage.getItem("rp-theme")) H.setAttribute("data-theme", e.matches ? "dark" : "light");
            });

            /* 2 ─── CANVAS (code particles, all sections) ──────── */
            const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
            let W, H2, particles = [];
            const WORDS = [
                "function", "const", "let", "var", "return", "async", "await", "class", "import", "export",
                "null", "undefined", "true", "false", "for", "while", "if", "else", "switch", "try", "catch",
                "throw", "new", "delete", "typeof", "instanceof", "void", "break", "continue", "default",
                "{}", "[]", "()", "=>", "...", "??", "?.", "!==", "===", ">=", "<=", "&&", "||", "++", "--",
                "0x1F", "0xFF", "01", "10", "11", "100", "404", "500", "200", "3000", "8080",
                "redis", "nginx", "node", "socket", "jwt", "docker", "linux", "bash", "curl", "grep",
                "dist", "pub", "sub", "api", "cdn", "tcp", "http", "ssh", "git", "push", "pull", "fetch",
                "cluster", "worker", "thread", "mutex", "queue", "stack", "heap", "buffer", "stream",
                "require()", "module", "process", "console", "Promise", "callback", "event", "emit",
                "SELECT", "INSERT", "UPDATE", "DELETE", "WHERE", "JOIN", "INDEX", "mongo", "schema",
                "ping", "pong", "ACK", "SYN", "GET", "POST", "PUT", "PATCH", "DELETE", "ws://", "http://",
                "npm", "yarn", "node_modules", ".env", "config", "deploy", "build", "test", "lint",
                "#include", "<vector>", "std::", "int main()", "printf", "malloc", "free", "ptr",
                "O(n)", "O(1)", "O(log n)", "O(n²)", "hash", "sort", "BFS", "DFS", "DP", "graph",
            ];
            function resize() { W = cv.width = window.innerWidth; H2 = cv.height = window.innerHeight; initP() }
            function isDark() { return H.getAttribute("data-theme") === "dark" }
            function initP() {
                particles = [];
                const n = Math.max(80, Math.floor(W * H2 / 7000));
                for (let i = 0; i < n; i++) particles.push(mkP(true));
            }
            function mkP(rand) {
                return {
                    x: Math.random() * W,
                    y: rand ? Math.random() * H2 : H2 + 20,
                    vx: (Math.random() - .5) * .25,
                    vy: -(Math.random() * 1.2 + .6),
                    word: WORDS[Math.floor(Math.random() * WORDS.length)],
                    size: Math.random() * 4 + 9,
                    alpha: Math.random() * .35 + .06,
                    life: rand ? Math.random() : 0
                };
            }
            function drawCanvas() {
                ctx.clearRect(0, 0, W, H2);
                const dark = isDark();
                // Two particle colours: blue (primary) + green (secondary, fewer)
                particles.forEach((p, i) => {
                    p.x += p.vx; p.y += p.vy; p.life += .0008;
                    if (p.y < -30 || p.life > 1) { const np = mkP(false); Object.assign(p, np) }
                    const fade = p.life < 0.7 ? p.life / 0.7 : 1 - (p.life - 0.7) / 0.3;
                    const a = p.alpha * Math.max(0, fade);
                    if (a <= 0) return;
                    const isGreen = i % 5 === 0;
                    let col;
                    if (dark) col = isGreen ? `rgba(0,255,65,${a})` : `rgba(54,123,240,${a})`;
                    else col = isGreen ? `rgba(0,180,40,${a})` : `rgba(30,90,200,${a})`;
                    ctx.save();
                    ctx.font = `${p.size}px "JetBrains Mono",monospace`;
                    ctx.fillStyle = col;
                    ctx.fillText(p.word, p.x, p.y);
                    ctx.restore();
                });
                requestAnimationFrame(drawCanvas);
            }
            window.addEventListener("resize", resize, { passive: true });
            resize(); drawCanvas();

            /* 3 ─── NAV ─────────────────────────────────────────── */
            const nav = document.getElementById("nav");
            function updateNav() { nav.classList.toggle("solid", scrollY > 30) }
            window.addEventListener("scroll", updateNav, { passive: true });
            updateNav();

            /* 4 ─── ACTIVE NAV LINK ─────────────────────────────── */
            const secs = [...document.querySelectorAll("section[id]")];
            const links = [...document.querySelectorAll(".nav-links a")];
            new IntersectionObserver(es => {
                es.forEach(e => {
                    if (e.isIntersecting) {
                        links.forEach(a => a.classList.remove("active"));
                        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
                        if (a) a.classList.add("active");
                    }
                });
            }, { threshold: .45 }).observe(secs[0] || document.body);
            secs.forEach(s => {
                new IntersectionObserver(([e]) => {
                    if (e.isIntersecting) {
                        links.forEach(a => a.classList.remove("active"));
                        const a = document.querySelector(`.nav-links a[href="#${s.id}"]`);
                        if (a) a.classList.add("active");
                    }
                }, { threshold: .45 }).observe(s);
            });

            /* 5 ─── BURGER / MOBILE MENU ──────────────────────── */
            const burger = document.getElementById("burger");
            const drawer = document.getElementById("mob-drawer");
            const scrim = document.getElementById("mob-scrim");

            function openMenu() {
                burger.classList.add("open");
                burger.setAttribute("aria-expanded", "true");
                drawer.classList.add("open");
                drawer.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";
            }
            function closeMenu() {
                burger.classList.remove("open");
                burger.setAttribute("aria-expanded", "false");
                drawer.classList.remove("open");
                drawer.setAttribute("aria-hidden", "true");
                document.body.style.overflow = "";
            }
            burger.addEventListener("click", () => {
              console.log("burger clicked, drawer open:", drawer.classList.contains("open"));
                drawer.classList.contains("open") ? closeMenu() : openMenu();
            });
            scrim.addEventListener("click", closeMenu);
            document.querySelectorAll(".mob-panel a").forEach(a => a.addEventListener("click", closeMenu));
            window.addEventListener("resize", () => { if (innerWidth > 768) closeMenu() });

            /* 6 ─── REVEAL ON SCROLL ────────────────────────────── */
            new IntersectionObserver((es, obs) => {
                es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("up"); obs.unobserve(e.target) } });
            }, { threshold: .08, rootMargin: "0px 0px -16px 0px" }).observe(document.body);
            // Re-observe all .r elements
            const revEls = document.querySelectorAll(".r");
            const revIO = new IntersectionObserver((es, obs) => {
                es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("up"); obs.unobserve(e.target) } });
            }, { threshold: .08, rootMargin: "0px 0px -16px 0px" });
            revEls.forEach(el => revIO.observe(el));

            /* 7 ─── TYPED.JS ─────────────────────────────────────── */
            if (document.getElementById("typed-el")) {
                new Typed("#typed-el", {
                    strings: ["./run nexus-chat --workers 5", "git pull origin --rebase", "npm start --env production", "redis-cli SUBSCRIBE events", "./benchmark --rps 14500", "ssh rajesh@backend-01"],
                    typeSpeed: 50, backSpeed: 25, backDelay: 1500, loop: true, showCursor: false
                });
            }

            /* 8 ─── COUNTER ──────────────────────────────────────── */
            const wsEl = document.getElementById("ws-counter");
            if (wsEl) {
                let done = false;
                new IntersectionObserver(([e]) => {
                    if (e.isIntersecting && !done) {
                        done = true;
                        const s = performance.now(), T = 14500, D = 1800;
                        (function t(now) {
                            const p = Math.min((now - s) / D, 1);
                            wsEl.textContent = Math.round(T * (1 - Math.pow(1 - p, 3))).toLocaleString();
                            if (p < 1) requestAnimationFrame(t); else wsEl.textContent = T.toLocaleString();
                        })(s);
                    }
                }, { threshold: .6 }).observe(wsEl);
            }

            /* 9 ─── 3D TILT — PHOTO ONLY ────────────────────────── */
            const pc = document.getElementById("photo-card");
            const ps = document.getElementById("photo-sheen");
            if (pc && !("ontouchstart" in window)) {
                pc.parentElement.style.perspective = "1000px";
                let tRx = 0, tRy = 0, cRx = 0, cRy = 0, raf = null, on = false;
                function lerp(a, b, t) { return a + (b - a) * t }
                function loop() {
                    cRx = lerp(cRx, tRx, on ? .12 : .07);
                    cRy = lerp(cRy, tRy, on ? .12 : .07);
                    const sc = on ? 1.04 : 1;
                    pc.style.transform = `rotateX(${cRx}deg) rotateY(${cRy}deg) scale3d(${sc},${sc},${sc})`;
                    if (Math.abs(cRx - tRx) > .008 || Math.abs(cRy - tRy) > .008 || on) raf = requestAnimationFrame(loop);
                    else { pc.style.transform = ""; raf = null }
                }
                function go() { if (!raf) raf = requestAnimationFrame(loop) }
                pc.addEventListener("mouseenter", () => { on = true; pc.classList.add("ton"); pc.classList.remove("toff"); if (ps) ps.style.setProperty("--sop", "1"); go() });
                pc.addEventListener("mousemove", e => {
                    const r = pc.getBoundingClientRect();
                    tRy = (e.clientX - r.left - r.width / 2) / (r.width / 2) * 13;
                    tRx = -(e.clientY - r.top - r.height / 2) / (r.height / 2) * 13;
                    if (ps) { ps.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); ps.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%") }
                });
                pc.addEventListener("mouseleave", () => { on = false; tRx = 0; tRy = 0; pc.classList.remove("ton"); pc.classList.add("toff"); if (ps) ps.style.setProperty("--sop", "0"); go(); setTimeout(() => pc.classList.remove("toff"), 650) });
            }

        })();