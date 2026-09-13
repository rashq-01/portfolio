import React, { useEffect, useState } from 'react';

export default function About() {
  const [ageStr, setAgeStr] = useState("21 yrs, 0 mos, 0 days, 00:00:00");

  useEffect(() => {
    const updateLiveAge = () => {
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
      
      setAgeStr(`${years} yrs, ${months} mos, ${days} days, ${hStr}:${mStr}:${sStr}`);
    };

    const interval = setInterval(updateLiveAge, 1000);
    updateLiveAge();
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about">
      <div className="W">
        <div className="rv from-left">
          <span className="ey">About</span>
          <h2 className="st">Who I Am</h2>
        </div>
        <div className="ab-grid">
          <div className="ab-txt rv from-left" data-d="1">
            <p>I'm a computer science student who spends most of my time thinking about <strong>how systems fail at scale</strong> — and engineering them so they don't. My focus is backend infrastructure: distributed messaging, real-time WebSocket systems, load balancing, and APIs built to survive concurrency.</p>
            <p>Rather than collecting frameworks, I go deep. I built a production-grade chat platform sustaining <strong>14,500+ messages per second</strong> using Nginx load balancing, Redis Pub/Sub, and a 5-instance Node.js cluster. I write C++ to understand things at the boundary level.</p>
            <p>Goal: a software engineering role on infrastructure that millions depend on. Sharpening DSA and system design every day.</p>
            <a href="https://drive.google.com/drive/folders/13wYCy4dZ3_jTerUbkt_yKY6EyJcbz17C?usp=sharing"
              target="_blank" rel="noopener noreferrer" className="btn btn-b" style={{alignSelf:'flex-start', marginTop:'8px'}}>
              <i className="bx bx-download"></i>Download R&eacute;sum&eacute;
            </a>
          </div>
          <div className="rv from-right" data-d="2">
            <div className="cp">
              <div className="cp-bar">
                <div className="cp-ds"><span className="cpd1"></span><span className="cpd2"></span><span className="cpd3"></span></div>
                <span className="cp-fn">rajesh.config.json</span>
              </div>
              <div className="cp-body">
                <div className="cp-ln"><span className="ln-n">1</span><span className="lp">{'{'}</span></div>
                <div className="cp-ln"><span className="ln-n">2</span>&nbsp;&nbsp;<span className="ls">"name"</span><span className="lp">: </span><span className="la">"Rajesh Pandit"</span><span className="lp">,</span></div>
                <div className="cp-ln"><span className="ln-n">3</span>&nbsp;&nbsp;<span className="ls">"age"</span><span className="lp">: </span><span style={{flex: 1}}><span className="la">"</span><span className="la" id="live-age">{ageStr}</span><span className="la">"</span><span className="lp">,</span></span></div>
                <div className="cp-ln"><span className="ln-n">4</span>&nbsp;&nbsp;<span className="ls">"location"</span><span className="lp">: </span><span className="la">"Birgunj, Nepal"</span><span className="lp">,</span></div>
                <div className="cp-ln"><span className="ln-n">5</span>&nbsp;&nbsp;<span className="ls">"email"</span><span className="lp">: </span><span className="lv"><a href="mailto:rashq122@gmail.com?subject=Contact%20from%20Website&body=Hi%20Rajesh,%20I%20want%20to%20connect">"rashq122@gmail.com"</a></span><span className="lp">,</span></div>
                <div className="cp-ln"><span className="ln-n">6</span>&nbsp;&nbsp;<span className="ls">"focus"</span><span className="lp">: </span><span className="lv">["backend", "systems", "DSA"]</span><span className="lp">,</span></div>
                <div className="cp-ln"><span className="ln-n">7</span>&nbsp;&nbsp;<span className="ls">"status"</span><span className="lp">: </span><span className="lg">"open_to_roles"</span><span className="lp">: </span><span className="la">true</span></div>
                <div className="cp-ln"><span className="ln-n">8</span><span className="lp">{'}'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

