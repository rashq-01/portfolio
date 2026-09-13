import React from 'react';

export default function Work() {
  return (
    <section id="work">
      <div className="W">
        <div className="rv">
          <span className="ey">Selected Work</span>
          <h2 className="st">Projects</h2>
          <p className="ss">Systems I've built — defined problem, measurable result, intentional architecture.</p>
        </div>
        <div className="pj-grid">
          <article className="pj rv" data-d="1">
            <div className="pj-img">
              <img src="/NexusChat.jpeg" alt="NexusChat" loading="lazy" />
              <div className="pj-imgov"></div><span className="pj-ft">Featured</span>
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
              <div className="pj-foot"><a href="https://github.com/rashq-01/NexusChat.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a></div>
            </div>
          </article>
          <article className="pj rv" data-d="2">
            <div className="pj-img">
              <img src="/libraTech.png" alt="LibraTech" loading="lazy" />
              <div className="pj-imgov"></div>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">02</span><span className="pj-c">Full Stack</span></div>
              <h3 className="pj-name">LibraTech</h3>
              <p className="pj-sub">// role-based library management system</p>
              <p className="pj-desc">RBAC (admin/member), JWT auth, automated issue/return workflows, real-time availability dashboard. Clean separation between admin and member interfaces.</p>
              <div className="pj-stack">
                <span>HTML</span><span>CSS</span><span>JavaScript</span><span>Node.js</span><span>Express</span><span>MongoDB</span><span>JWT</span>
              </div>
              <div className="pj-foot"><a href="https://github.com/rashq-01/Library-Management-System.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a></div>
            </div>
          </article>
          <article className="pj rv" data-d="3">
            <div className="pj-img">
              <img src="/airBNB.webp" alt="Airbnb Clone" loading="lazy" />
              <div className="pj-imgov"></div>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">03</span><span className="pj-c">Full Stack</span></div>
              <h3 className="pj-name">Airbnb Clone</h3>
              <p className="pj-sub">// full-stack property rental platform</p>
              <p className="pj-desc">Secure auth, property listings, search filters, booking management, user dashboards. SSR with EJS for fast initial load and clean URL routing.</p>
              <div className="pj-stack">
                <span>Node.js</span><span>Express</span><span>EJS</span><span>MongoDB</span><span>CSS</span><span>REST API</span>
              </div>
              <div className="pj-foot"><a href="https://github.com/rashq-01/Air_BNB_Clone.git" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a></div>
            </div>
          </article>
          <article className="pj rv" data-d="4">
            <div className="pj-img">
              <img src="https://5.imimg.com/data5/SELLER/Default/2024/4/412012786/UZ/RT/CT/37169537/library-management-system-1000x1000.png" alt="Library CLI" loading="lazy" />
              <div className="pj-imgov"></div>
            </div>
            <div className="pj-body">
              <div className="pj-top"><span className="pj-n">04</span><span className="pj-c">Systems / C++</span></div>
              <h3 className="pj-name">Library CLI</h3>
              <p className="pj-sub">// systems-level C++ with file persistence</p>
              <p className="pj-desc">CLI library system: file persistence, OOP class hierarchies, full record management. Built to understand memory and data handling at the boundary level.</p>
              <div className="pj-stack"><span>C++</span><span>OOP</span><span>File I/O</span><span>CLI</span></div>
              <div className="pj-foot"><a href="https://github.com/rashq-01/currentProject/tree/80ffbad4bf76bef0c992a70555a10b2131bf1450/2_Library_Management" target="_blank" rel="noopener noreferrer" className="pj-lnk">view_source() <i className="bx bx-link-external"></i></a></div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

