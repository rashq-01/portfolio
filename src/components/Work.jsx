import React, { useState, useEffect } from 'react';

const ARCH_DATA = {
  nexus: {
    title: "NexusChat — Distributed Systems Architecture",
    badge: "14,500+ msg/sec · 5-Node Cluster",
    overview: "NexusChat was engineered to eliminate single-point-of-failure bottlenecks by introducing horizontal scaling across 5 worker instances with Redis Pub/Sub event broadcasting.",
    flow: [
      { step: "01. Client Ingress", desc: "Concurrent WebSockets connect over secure WSS to port 443." },
      { step: "02. Nginx Load Balancer", desc: "Nginx acts as reverse proxy using Least-Connections & IP-Hash for sticky handshake upgrades." },
      { step: "03. 5-Instance Node.js Cluster", desc: "Traffic is distributed evenly across 5 isolated Node.js worker processes running Socket.IO." },
      { step: "04. Redis Pub/Sub Backplane", desc: "When User A on Node 1 messages User B on Node 4, Redis Pub/Sub synchronizes all workers in <1ms." },
      { step: "05. MongoDB Persistence", desc: "Chat logs, room ACLs, and delivery receipts are asynchronously committed to MongoDB Atlas." }
    ],
    ascii: `[ Web Clients (14,500+ msg/sec) ]
              │
              ▼
  [ Nginx Load Balancer (Proxy) ]
   ├── worker 1 (Node.js) ──┐
   ├── worker 2 (Node.js) ──┤
   ├── worker 3 (Node.js) ──┼──► [ Redis Pub/Sub Bus (Sync) ]
   ├── worker 4 (Node.js) ──┤              │
   └── worker 5 (Node.js) ──┘              ▼
                                  [ MongoDB Atlas (Storage) ]`
  },
  libra: {
    title: "LibraTech — RBAC & State Machine Architecture",
    badge: "RBAC Access Control · JWT Auth",
    overview: "Production-grade library management system with strict role separation and an automated inventory transaction state machine.",
    flow: [
      { step: "01. Dual-Tier Authentication", desc: "JWT tokens signed with distinct role claims (Admin vs Member) stored in secure HTTP-only cookies." },
      { step: "02. RBAC Middleware Guard", desc: "Strict route guards prevent unauthorized inventory mutations and audit all librarian actions." },
      { step: "03. Inventory State Machine", desc: "Atomic database transactions guarantee books cannot be double-checked-out during concurrent requests." },
      { step: "04. Real-Time Availability", desc: "Dynamic indexing updates shelf count and calculates overdue fine schedules on-the-fly." }
    ],
    ascii: `[ Client Request ] ──► [ JWT Role Guard ]
                             ├── Role: Member ──► [ Browse / Borrow / Return ]
                             └── Role: Admin  ──► [ Inventory / Audit / Overdue ]
                                                         │
                                                         ▼
                                             [ MongoDB Atomic Tx ]`
  },
  airbnb: {
    title: "Airbnb Clone — Full-Stack SSR MVC Architecture",
    badge: "EJS SSR · Geospatial Search",
    overview: "Full-stack rental platform architected using the Model-View-Controller pattern with server-side rendering for optimal First Contentful Paint.",
    flow: [
      { step: "01. Fast Initial SSR", desc: "EJS templates render semantic HTML on the server, drastically reducing client JS execution time." },
      { step: "02. Geospatial Filtering", desc: "MongoDB 2dsphere indexes enable instant radius-based property filtering." },
      { step: "03. Secure Booking Flow", desc: "Date collision detection algorithms prevent duplicate reservations for identical dates." }
    ],
    ascii: `[ Browser ] ──► [ Express Router ] ──► [ Controller ] ──► [ MongoDB Geo ]
                           ▲                         │
                           └──── [ EJS View HTML ] ──┘`
  },
  cli: {
    title: "Library CLI — Systems-Level C++ Architecture",
    badge: "C++20 · Zero Memory Leaks · Binary I/O",
    overview: "Built close to the metal in modern C++20 to explore raw pointer lifecycles, memory safety, and binary record serialization without runtime overhead.",
    flow: [
      { step: "01. Binary File Serialization", desc: "Records are persisted as fixed-width binary blocks using fstream for O(1) disk writes." },
      { step: "02. In-Memory Indexing", desc: "Custom B-Tree / hash index loaded into RAM on startup for sub-millisecond lookups." },
      { step: "03. Valgrind Audited", desc: "Zero memory leaks verified using Valgrind memcheck with RAII container management." }
    ],
    ascii: `[ CLI User IO ] ──► [ In-Memory Index (RAM) ] ──► [ Binary Engine ] ──► [/var/data.bin]`
  }
};

export default function Work() {
  const [activeArch, setActiveArch] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveArch(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentArch = activeArch ? ARCH_DATA[activeArch] : null;

  return (
    <section id="work">
      <div className="W">
        <div className="rv">
          <span className="ey">Selected Work</span>
          <h2 className="st">Projects</h2>
          <p className="ss">Systems I've built — defined problem, measurable result, intentional architecture.</p>
        </div>
        <div className="pj-grid">
          {/* Project 01: NexusChat */}
          <article className="pj rv" data-d="1">
            <div className="pj-img">
              <img src="/NexusChat.jpeg" alt="NexusChat" loading="lazy" />
              <div className="pj-imgov"></div>
              <span className="pj-ft">Featured</span>
              <span className="pj-badge live-badge"><span className="live-dot"></span>Live Cluster</span>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">01</span><span className="pj-c">Distributed Systems</span></div>
              <h3 className="pj-name">NexusChat</h3>
              <p className="pj-sub">// distributed real-time messaging platform</p>
              <div className="pj-metric"><span className="pm-v">14,500+</span><span className="pm-l">WebSocket msg/sec sustained</span></div>
              <p className="pj-desc">Nginx load balancing across 5 Node.js instances. Redis Pub/Sub syncs all nodes — horizontal scaling without message loss. JWT auth, real-time presence, room management.</p>
              <div className="pj-stack">
                <span>Node.js</span><span>Express</span><span>Socket.IO</span><span>MongoDB</span><span>Redis</span><span>Nginx</span><span>JWT</span>
              </div>
              <div className="pj-foot">
                <button 
                  type="button"
                  onClick={() => setActiveArch('nexus')} 
                  className="pj-arch-btn"
                  title="View Distributed Architecture"
                >
                  <i className="bx bx-git-repo-forked"></i>architecture_flow()
                </button>
                <a href="https://github.com/rashq-01/NexusChat.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a>
              </div>
            </div>
          </article>

          {/* Project 02: LibraTech */}
          <article className="pj rv" data-d="2">
            <div className="pj-img">
              <img src="/libraTech.png" alt="LibraTech" loading="lazy" />
              <div className="pj-imgov"></div>
              <span className="pj-badge demo-badge"><i className="bx bx-shield-quarter"></i>RBAC System</span>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">02</span><span className="pj-c">Full Stack</span></div>
              <h3 className="pj-name">LibraTech</h3>
              <p className="pj-sub">// role-based library management system</p>
              <p className="pj-desc">RBAC (admin/member), JWT auth, automated issue/return workflows, real-time availability dashboard. Clean separation between admin and member interfaces.</p>
              <div className="pj-stack">
                <span>HTML</span><span>CSS</span><span>JavaScript</span><span>Node.js</span><span>Express</span><span>MongoDB</span><span>JWT</span>
              </div>
              <div className="pj-foot">
                <button 
                  type="button"
                  onClick={() => setActiveArch('libra')} 
                  className="pj-arch-btn"
                  title="View RBAC Architecture"
                >
                  <i className="bx bx-git-repo-forked"></i>architecture_flow()
                </button>
                <a href="https://github.com/rashq-01/Library-Management-System.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a>
              </div>
            </div>
          </article>

          {/* Project 03: Airbnb Clone */}
          <article className="pj rv" data-d="3">
            <div className="pj-img">
              <img src="/airBNB.webp" alt="Airbnb Clone" loading="lazy" />
              <div className="pj-imgov"></div>
              <span className="pj-badge demo-badge"><i className="bx bx-layer"></i>Full Stack MVC</span>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">03</span><span className="pj-c">Full Stack</span></div>
              <h3 className="pj-name">Airbnb Clone</h3>
              <p className="pj-sub">// full-stack property rental platform</p>
              <p className="pj-desc">Secure auth, property listings, search filters, booking management, user dashboards. SSR with EJS for fast initial load and clean URL routing.</p>
              <div className="pj-stack">
                <span>Node.js</span><span>Express</span><span>EJS</span><span>MongoDB</span><span>CSS</span><span>REST API</span>
              </div>
              <div className="pj-foot">
                <button 
                  type="button"
                  onClick={() => setActiveArch('airbnb')} 
                  className="pj-arch-btn"
                  title="View MVC Architecture"
                >
                  <i className="bx bx-git-repo-forked"></i>architecture_flow()
                </button>
                <a href="https://github.com/rashq-01/Air_BNB_Clone.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a>
              </div>
            </div>
          </article>

          {/* Project 04: Library CLI */}
          <article className="pj rv" data-d="4">
            <div className="pj-img">
              <img src="/library-cli.svg" alt="Library CLI" loading="lazy" />
              <div className="pj-imgov"></div>
              <span className="pj-badge cli-badge"><i className="bx bx-terminal"></i>C++20 Engine</span>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">04</span><span className="pj-c">Systems / C++</span></div>
              <h3 className="pj-name">Library CLI</h3>
              <p className="pj-sub">// systems-level C++ with file persistence</p>
              <p className="pj-desc">CLI library system: binary file persistence, OOP class hierarchies, full record management. Built to understand memory and data handling at the boundary level.</p>
              <div className="pj-stack"><span>C++</span><span>OOP</span><span>File I/O</span><span>CLI</span></div>
              <div className="pj-foot">
                <button 
                  type="button"
                  onClick={() => setActiveArch('cli')} 
                  className="pj-arch-btn"
                  title="View Systems Architecture"
                >
                  <i className="bx bx-git-repo-forked"></i>architecture_flow()
                </button>
                <a href="https://github.com/rashq-01/currentProject/tree/80ffbad4bf76bef0c992a70555a10b2131bf1450/2_Library_Management" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Architecture Walkthrough Modal */}
      {currentArch && (
        <div className="arch-modal-overlay" onClick={() => setActiveArch(null)}>
          <div className="arch-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="arch-modal-header">
              <div className="arch-modal-title-box">
                <span className="arch-modal-badge">{currentArch.badge}</span>
                <h3 className="arch-modal-title">{currentArch.title}</h3>
              </div>
              <button 
                type="button"
                className="arch-modal-close" 
                onClick={() => setActiveArch(null)}
                aria-label="Close modal"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            <div className="arch-modal-body">
              <p className="arch-modal-overview">{currentArch.overview}</p>

              <div className="arch-diagram-card">
                <div className="arch-diagram-label">// Architectural Request Flow</div>
                <pre className="arch-ascii-canvas">{currentArch.ascii}</pre>
              </div>

              <div className="arch-flow-steps">
                <h4 className="arch-steps-heading">Engineering Breakdown:</h4>
                <div className="arch-steps-grid">
                  {currentArch.flow.map((item, idx) => (
                    <div key={idx} className="arch-step-item">
                      <span className="arch-step-title">{item.step}</span>
                      <p className="arch-step-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="arch-modal-footer">
              <button 
                type="button" 
                className="btn btn-b" 
                onClick={() => setActiveArch(null)}
              >
                Close Walkthrough
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

