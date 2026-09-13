import React, { useEffect, useState, useRef } from 'react';

export default function Telemetry() {
  const [lcStats, setLcStats] = useState({
    rating: '--', maxRating: '--', globalRank: '--', contests: '--', badges: '--', topBadge: 'Top --%', total: '--', easy: '--', med: '--', hard: '--'
  });
  const [ccStats, setCcStats] = useState({
    rating: '--', maxRating: '--', globalRank: '--', countryRank: '--', stars: '--'
  });
  const [cfStats, setCfStats] = useState({
    rating: '--', maxRating: '--', rankBadge: '--', contests: '--', contrib: '--'
  });
  const [ghRepos, setGhRepos] = useState('--');
  
  const lcCircleRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    const animateValue = (setFn, start, end, duration, isFloat = false) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        let current = ease * (end - start) + start;
        setFn(isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString());
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const applyLCContest = (data) => {
      let peakRating = 1804;
      if (data.contestParticipation && Array.isArray(data.contestParticipation)) {
        const ratings = data.contestParticipation.map(c => c.rating).filter(r => typeof r === 'number');
        if (ratings.length > 0) {
          peakRating = Math.max(...ratings);
        }
      }

      setLcStats(prev => ({ ...prev, topBadge: `Top ${data.contestTopPercentage || 9.25}%` }));
      animateValue(val => setLcStats(prev => ({ ...prev, rating: val })), 0, data.contestRating || 1778, 2000, false);
      animateValue(val => setLcStats(prev => ({ ...prev, maxRating: val })), 0, peakRating, 2000, false);
      animateValue(val => setLcStats(prev => ({ ...prev, globalRank: val })), 0, data.contestGlobalRanking || 79915, 2000);
      animateValue(val => setLcStats(prev => ({ ...prev, contests: val })), 0, data.contestAttend || 29, 1500);
      animateValue(val => setLcStats(prev => ({ ...prev, badges: val })), 0, data.badges || 12, 1000);
    };

    const applyLCSolved = (data) => {
      const total = data.solvedProblem || 628;
      const ez = data.easySolved || 226, md = data.mediumSolved || 324, hd = data.hardSolved || 78;

      animateValue(val => setLcStats(prev => ({ ...prev, easy: val })), 0, ez, 1500);
      animateValue(val => setLcStats(prev => ({ ...prev, med: val })), 0, md, 1500);
      animateValue(val => setLcStats(prev => ({ ...prev, hard: val })), 0, hd, 1500);
      animateValue(val => setLcStats(prev => ({ ...prev, total: val })), 0, total, 1500);

      const lcCircle = lcCircleRef.current;
      if (lcCircle && total > 0) {
        const tEz = 830, tMd = 2120, tHd = 1083;
        const tLc = tEz + tMd + tHd;
        
        const TOTAL_DEG = 260;
        const ezZoneDeg = (tEz / tLc) * TOTAL_DEG;
        const mdZoneDeg = (tMd / tLc) * TOTAL_DEG;
        const hdZoneDeg = (tHd / tLc) * TOTAL_DEG;
        
        const GAP = 3;
        
        let startTimestamp = null;
        const duration = 1500;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          const curEzDeg = (ez / tEz) * ezZoneDeg * ease;
          const curMdDeg = (md / tMd) * mdZoneDeg * ease;
          const curHdDeg = (hd / tHd) * hdZoneDeg * ease;
          
          let grad = `conic-gradient(from 230deg, `;
          
          grad += `var(--lc-ez) 0deg ${curEzDeg}deg, `;
          grad += `rgba(0,184,163,0.15) ${curEzDeg}deg ${ezZoneDeg - GAP}deg, `;
          grad += `transparent ${ezZoneDeg - GAP}deg ${ezZoneDeg}deg, `;
          
          grad += `var(--lc-md) ${ezZoneDeg}deg ${ezZoneDeg + curMdDeg}deg, `;
          grad += `rgba(255,192,30,0.15) ${ezZoneDeg + curMdDeg}deg ${ezZoneDeg + mdZoneDeg - GAP}deg, `;
          grad += `transparent ${ezZoneDeg + mdZoneDeg - GAP}deg ${ezZoneDeg + mdZoneDeg}deg, `;
          
          grad += `var(--lc-hd) ${ezZoneDeg + mdZoneDeg}deg ${ezZoneDeg + mdZoneDeg + curHdDeg}deg, `;
          grad += `rgba(255,55,95,0.15) ${ezZoneDeg + mdZoneDeg + curHdDeg}deg ${TOTAL_DEG}deg, `;
          
          grad += `transparent ${TOTAL_DEG}deg 360deg)`;
          
          lcCircle.style.background = grad;
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }
    };

    fetch('https://alfa-leetcode-api.onrender.com/rashq_01/contest')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if(data && (data.contestRating || data.contestParticipation)) {
          applyLCContest(data);
        } else {
          applyLCContest({ contestRating: 1778, contestAttend: 29, contestTopPercentage: 9.25 });
        }
      }).catch(e => {
        applyLCContest({ contestRating: 1778, contestAttend: 29, contestTopPercentage: 9.25 });
      });

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

    fetch('https://codeforces.com/api/user.info?handles=rashq_01')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "OK") {
          const user = data.result[0];
          if(user.rating) animateValue(val => setCfStats(prev => ({ ...prev, rating: val })), 0, user.rating, 2000);
          if(user.maxRating) animateValue(val => setCfStats(prev => ({ ...prev, maxRating: val })), 0, user.maxRating, 2000);
          if(user.rank) setCfStats(prev => ({ ...prev, rankBadge: String(user.rank).toUpperCase() }));
          if(user.contribution !== undefined) animateValue(val => setCfStats(prev => ({ ...prev, contrib: val })), 0, user.contribution, 1500);
        } else {
          throw new Error("CF API failed");
        }
      }).catch(e => {
        animateValue(val => setCfStats(prev => ({ ...prev, rating: val })), 0, 1104, 2000);
        animateValue(val => setCfStats(prev => ({ ...prev, maxRating: val })), 0, 1104, 2000);
        setCfStats(prev => ({ ...prev, rankBadge: 'NEWBIE' }));
      });

    fetch('https://codeforces.com/api/user.rating?handle=rashq_01')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "OK") {
          animateValue(val => setCfStats(prev => ({ ...prev, contests: val })), 0, data.result.length, 1500);
        } else {
          throw new Error("CF Contests API failed");
        }
      }).catch(e => {
        animateValue(val => setCfStats(prev => ({ ...prev, contests: val })), 0, 5, 1500);
      });

    fetch('https://codechef-api.vercel.app/handle/rashq_01')
      .then(res => res.json())
      .then(data => {
        if (!data || data.success === false) throw new Error("CC API failed");
        if(data.currentRating) animateValue(val => setCcStats(prev => ({ ...prev, rating: val })), 0, data.currentRating, 2000);
        if(data.highestRating) animateValue(val => setCcStats(prev => ({ ...prev, maxRating: val })), 0, data.highestRating, 2000);
        if(data.globalRank) animateValue(val => setCcStats(prev => ({ ...prev, globalRank: val })), 0, data.globalRank, 2000);
        if(data.countryRank) animateValue(val => setCcStats(prev => ({ ...prev, countryRank: val })), 0, data.countryRank, 2000);
        if(data.stars) setCcStats(prev => ({ ...prev, stars: data.stars }));
      }).catch(e => {
        console.warn("CodeChef API failed. Falling back to cached stats.", e);
        animateValue(val => setCcStats(prev => ({ ...prev, rating: val })), 0, 1519, 2000);
        animateValue(val => setCcStats(prev => ({ ...prev, maxRating: val })), 0, 1570, 2000);
        setCcStats(prev => ({ ...prev, globalRank: "23711", countryRank: "12", stars: "2★" }));
      });

    fetch('https://api.github.com/users/rashq-01')
      .then(res => res.json())
      .then(data => {
        if (data && data.public_repos !== undefined) {
          animateValue(setGhRepos, 0, data.public_repos, 1500);
        } else {
          animateValue(setGhRepos, 0, 42, 1500);
        }
      }).catch(e => {
        animateValue(setGhRepos, 0, 42, 1500);
      });

    fetch('https://alfa-leetcode-api.onrender.com/rashq_01/calendar')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.submissionCalendar) {
          const cal = JSON.parse(data.submissionCalendar);
          const heatmapEl = heatmapRef.current;
          if (!heatmapEl) return;
          heatmapEl.innerHTML = '';
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          let html = `<div style="display: flex; gap: 16px; width: max-content;">`;
          
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
            const firstDay = new Date(Date.UTC(targetYear, targetMonth, 1)).getUTCDay();
            
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
  }, []);

  return (
    <section id="telemetry">
      <div className="W">
        <div className="rv">
          <span className="ey">Telemetry</span>
          <h2 className="sn">Competitive Engineering.</h2>
        </div>
        <div className="tel-grid">
          
          <div className="tel-card flex-card rv">
            <div className="fc-head">
              <div className="fc-title">
                <img src="https://cdn.simpleicons.org/leetcode/FFA116" alt="LeetCode" style={{width: '24px', height: '24px'}} />
                LeetCode
              </div>
              <div className="fc-badge" id="lc-top-badge">{lcStats.topBadge}</div>
            </div>
            
            <div className="fc-stats split" style={{gap: '16px'}}>
              <div className="fc-stat">
                <span className="fc-label">Rating</span>
                <span className="fc-val" id="lc-rating">{lcStats.rating}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Max Rating</span>
                <span className="fc-val" id="lc-max-rating">{lcStats.maxRating}</span>
              </div>
            </div>

            <div className="fc-stats split" style={{gap: '16px', marginTop: '16px'}}>
              <div className="fc-stat">
                <span className="fc-label">Global Rank</span>
                <span className="fc-val" id="lc-global-rank">{lcStats.globalRank}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Contests</span>
                <span className="fc-val" id="lc-contests">{lcStats.contests}</span>
              </div>
            </div>

            <div className="lc-circle-wrap">
              <div className="lc-circle-container" style={{position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <div className="lc-circle" id="lc-circle" ref={lcCircleRef} style={{width: '100%', height: '100%', borderRadius: '50%', position: 'absolute', WebkitMask: 'radial-gradient(circle, transparent 48px, black 49px)', mask: 'radial-gradient(circle, transparent 48px, black 49px)'}}></div>
                <div className="lc-circle-inner" style={{position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                  <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center'}}>
                    <span id="lc-solved" style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--tx)'}}>{lcStats.total}</span>
                    <span style={{fontSize: '0.75rem', color: 'var(--tx3)'}}>/4033</span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#00b8a3', display: 'flex', alignItems: 'center', gap: '2px'}}>
                    <i className='bx bx-check'></i> Solved
                  </div>
                  <div style={{position: 'absolute', bottom: '-8px', fontSize: '0.7rem', color: 'var(--tx3)', background: 'var(--bg1)', padding: '0 4px'}}>
                    <strong style={{color: 'var(--tx)'}}>16</strong> Attempting
                  </div>
                </div>
              </div>
              <div className="lc-circle-stats">
                 <div className="lc-stat-row easy">
                   <span>Easy</span> 
                   <span className="lc-stat-nums"><strong id="lc-easy">{lcStats.easy}</strong></span>
                 </div>
                 <div className="lc-stat-row med">
                   <span>Medium</span> 
                   <span className="lc-stat-nums"><strong id="lc-med">{lcStats.med}</strong></span>
                 </div>
                 <div className="lc-stat-row hard">
                   <span>Hard</span> 
                   <span className="lc-stat-nums"><strong id="lc-hard">{lcStats.hard}</strong></span>
                 </div>
              </div>
            </div>
            <div className="tel-bg-icon">
               <img src="https://cdn.simpleicons.org/leetcode/222222" style={{width: '120px', opacity: 0.1}} alt=""/>
            </div>
          </div>

          <div className="tel-card flex-card rv" style={{transitionDelay: '0.05s'}}>
            <div className="fc-head">
              <div className="fc-title">
                <img src="https://cdn.simpleicons.org/codechef" alt="CodeChef" style={{width: '24px', height: '24px', filter: 'invert(1)'}} />
                CodeChef
              </div>
              <div className="fc-badge cf" id="cc-stars-badge">{ccStats.stars}</div>
            </div>
            
            <div className="fc-stats split">
              <div className="fc-stat">
                <span className="fc-label">Rating</span>
                <span className="fc-val" id="cc-rating">{ccStats.rating}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Highest Rating</span>
                <span className="fc-val" id="cc-max-rating">{ccStats.maxRating}</span>
              </div>
            </div>

            <div className="fc-stats split" style={{marginTop: '16px'}}>
              <div className="fc-stat">
                <span className="fc-label">Global Rank</span>
                <span className="fc-val" id="cc-global-rank">{ccStats.globalRank}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Country Rank</span>
                <span className="fc-val" id="cc-country-rank">{ccStats.countryRank}</span>
              </div>
            </div>
            <div className="tel-bg-icon">
               <img src="https://cdn.simpleicons.org/codechef" style={{width: '120px', opacity: 0.1, filter: 'invert(1)'}} alt=""/>
            </div>
          </div>

          <div className="tel-card flex-card rv" style={{transitionDelay: '0.1s'}}>
            <div className="fc-head">
              <div className="fc-title">
                <img src="https://cdn.simpleicons.org/codeforces" alt="Codeforces" style={{width: '24px', height: '24px'}} />
                Codeforces
              </div>
              <div className="fc-badge cf" id="cf-rank-badge">{cfStats.rankBadge}</div>
            </div>
            
            <div className="fc-stats split">
              <div className="fc-stat">
                <span className="fc-label">Rating</span>
                <span className="fc-val" id="cf-rating">{cfStats.rating}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Max Rating</span>
                <span className="fc-val" id="cf-max-rating">{cfStats.maxRating}</span>
              </div>
            </div>

            <div className="fc-stats split" style={{marginTop: '16px'}}>
              <div className="fc-stat">
                <span className="fc-label">Contests Attended</span>
                <span className="fc-val" id="cf-contests">{cfStats.contests}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Contribution</span>
                <span className="fc-val" id="cf-contrib">{cfStats.contrib}</span>
              </div>
            </div>
            <div className="tel-bg-icon">
              <img src="https://cdn.simpleicons.org/codeforces/222222" style={{width: '120px', opacity: 0.1}} alt=""/>
            </div>
          </div>

          <div className="tel-card flex-card rv" style={{transitionDelay: '0.2s'}}>
            <div className="fc-head">
              <div className="fc-title">
                <img src="https://cdn.simpleicons.org/github/FFFFFF" alt="GitHub" style={{width: '24px', height: '24px'}} />
                GitHub
              </div>
              <div className="fc-badge gh">PRO / Arctic Vault</div>
            </div>
            
            <div className="fc-stats split">
              <div className="fc-stat">
                <span className="fc-label">Total Repositories</span>
                <span className="fc-val" id="gh-repos">{ghRepos}</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Longest Streak</span>
                <span className="fc-val">42 Days</span>
              </div>
            </div>

            <div className="fc-stats split" style={{marginTop: '16px'}}>
              <div className="fc-stat">
                <span className="fc-label">Total Contributions</span>
                <span className="fc-val" id="gh-contribs">1,402+</span>
              </div>
              <div className="fc-stat">
                <span className="fc-label">Total Commits</span>
                <span className="fc-val">314+</span>
              </div>
            </div>
            <div className="tel-bg-icon"><i className='bx bxl-github'></i></div>
          </div>

        </div>

        <div className="tel-calendar-wrap rv" style={{marginTop: '40px'}}>
          <div className="tel-head" style={{marginBottom: '16px'}}>
            <i className='bx bx-git-commit tel-icon' style={{color: 'var(--tx)'}}></i>
            <span className="tel-title">Continuous Integration Matrix</span>
          </div>
          <div className="tel-calendar" style={{background: 'var(--bg1)', border: '1px solid var(--bdr)', borderRadius: '14px', padding: '24px', overflowX: 'auto', backdropFilter: 'blur(24px) saturate(150%)'}}>
            <div id="lc-heatmap" ref={heatmapRef} style={{position: 'relative', paddingTop: '20px'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

