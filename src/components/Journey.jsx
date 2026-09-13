import React from 'react';

export default function Journey() {
  return (
    <section id="journey">
      <div className="W">
        <div className="rv">
          <span className="ey">Journey</span>
          <h2 className="st">The Road So Far</h2>
          <p className="ss">From SEE in Nepal to B.Tech in India — every real milestone, every shipped system, and the road is still going.</p>
        </div>

        <div className="journey-wrap">
          <div className="journey-road"></div>

          <div className="jn-item rv">
            <div className="jn-card">
              <div className="jn-year">2022</div>
              <div className="jn-title">10th Grade — SEE Completed</div>
              <div className="jn-sub">// T.M.P.R.R.S. School · Birgunj, Parsa, Nepal 🇳🇵</div>
              <p className="jn-desc">Completed the Secondary Education Examination (SEE) at Trijuddha Mahavir Prasad Raghuvir Ram Secondary School, Birgunj, securing a GPA of <strong>3.10 / 4.00</strong>. This was the turning point — where curiosity for computers became a real direction.</p>
              <div className="jn-tags">
                <span className="jn-tag">SEE</span>
                <span className="jn-tag">GPA 3.10 / 4.00</span>
                <span className="jn-tag">Birgunj, Nepal</span>
              </div>
            </div>
            <div className="jn-dot"></div>
            <div className="jn-spacer"></div>
          </div>

          <div className="jn-item rv">
            <div className="jn-spacer"></div>
            <div className="jn-dot"></div>
            <div className="jn-card">
              <div className="jn-year">2022 — 2024</div>
              <div className="jn-title">+2 Science — NEB</div>
              <div className="jn-sub">// National Infotech College (NI College) · Birgunj, Parsa, Nepal 🇳🇵</div>
              <p className="jn-desc">Completed +2 Science under the National Examination Board at NI College, Birgunj, with a GPA of <strong>3.06 / 4.00</strong>. Studied Physics, Math, and Computer Science — wrote first programs in C and built a solid analytical foundation.</p>
              <div className="jn-tags">
                <span className="jn-tag">NEB</span>
                <span className="jn-tag">GPA 3.06 / 4.00</span>
                <span className="jn-tag">NI College</span>
                <span className="jn-tag">C Programming</span>
                <span className="jn-tag">Physics</span>
              </div>
            </div>
          </div>

          <div className="jn-item rv">
            <div className="jn-card">
              <div className="jn-year">2024 — Present</div>
              <div className="jn-title">B.Tech in CSE — SVCET</div>
              <div className="jn-sub">// Sri Venkateswara College of Engineering Technology · India 🇮🇳</div>
              <p className="jn-desc">Enrolled in B.Tech Computer Science & Engineering at SVCET, Chittoor, Andhra Pradesh. Deep-diving into DSA, OOP, system design, and building real production systems alongside coursework. This is where everything accelerated.</p>
              <div className="jn-tags">
                <span className="jn-tag">B.Tech CSE</span>
                <span className="jn-tag">SVCET</span>
                <span className="jn-tag">Chittoor, AP</span>
                <span className="jn-tag">1st Year</span>
                <span className="jn-tag">DSA</span>
                <span className="jn-tag">OOP</span>
              </div>
            </div>
            <div className="jn-dot"></div>
            <div className="jn-spacer"></div>
          </div>

          <div className="jn-item rv">
            <div className="jn-spacer"></div>
            <div className="jn-dot"></div>
            <div className="jn-card">
              <div className="jn-year">2025</div>
              <div className="jn-title">LibraTech — First Real Project</div>
              <div className="jn-sub">// Full-stack RBAC library management system</div>
              <p className="jn-desc">Built and shipped LibraTech — a production-grade library management system with role-based access control, JWT authentication, automated issue/return workflows, and a real-time availability dashboard. The first system built from scratch end-to-end.</p>
              <div className="jn-tags">
                <span className="jn-tag">Node.js</span>
                <span className="jn-tag">MongoDB</span>
                <span className="jn-tag">JWT</span>
                <span className="jn-tag">Express</span>
                <span className="jn-tag">RBAC</span>
              </div>
            </div>
          </div>

          <div className="jn-item rv">
            <div className="jn-card">
              <div className="jn-year">Jan 2026</div>
              <div className="jn-title">NexusChat — Distributed Messaging Platform</div>
              <div className="jn-sub">// 2nd Year · 14,500+ msg/sec · 5-node cluster · Redis Pub/Sub</div>
              <p className="jn-desc">Built NexusChat — a production-grade real-time distributed messaging platform handling <strong>14,500+ WebSocket messages per second</strong> via Nginx load balancing across 5 Node.js instances and Redis Pub/Sub cross-node sync. The hardest and most complex system so far.</p>
              <div className="jn-tags">
                <span className="jn-tag">Node.js</span>
                <span className="jn-tag">Socket.IO</span>
                <span className="jn-tag">Redis</span>
                <span className="jn-tag">Nginx</span>
                <span className="jn-tag">MongoDB</span>
                <span className="jn-tag">2nd Year</span>
              </div>
            </div>
            <div className="jn-spacer"></div>
          </div>

          <div className="journey-end">
            <div className="je-dot"></div>
            <div className="je-label">road continues...</div>
          </div>
        </div>
      </div>
    </section>
  );
}

