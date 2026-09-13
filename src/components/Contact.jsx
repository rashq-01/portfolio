import React, { useState } from 'react';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("rashq122@gmail.com")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        const el = document.createElement("textarea");
        el.value = "rashq122@gmail.com";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <section id="contact">
      <div className="W">
        <div className="ct-inner rv">
          <span className="ey">Contact</span>
          <h2 className="st">Let's Build Something</h2>
          <p className="ct-desc">Actively looking for backend engineering roles and internships. If you're building infra that needs to scale, I want to be in that room.</p>
          <div className="ct-email-row">
            <a href="mailto:rashq122@gmail.com?subject=Contact%20from%20Website&body=Hi%20Rajesh,%20I%20want%20to%20connect" className="ct-email">
              <i className="bx bx-envelope"></i><span>rashq122@gmail.com</span>
            </a>
            <button 
              className={`ct-btn ${copied ? 'copied' : ''}`} 
              id="copy-btn" 
              onClick={copyEmail}
              aria-label="Copy email"
            >
              <i className={copied ? "bx bx-check" : "bx bx-copy"} id="copy-icon"></i>
              <span id="copy-txt">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <div className="ct-meta">
            <span className="ct-mi"><i className="bx bx-phone"></i>+977 98XXXXXXXX</span>
            <span className="ct-mi"><i className="bx bx-map"></i>Birgunj, Nepal</span>
          </div>
          <div className="ct-soc">
            <a href="https://github.com/rashq-01" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bxl-github"></i>GitHub</a>
            <a href="https://linkedin.com/in/rashq" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bxl-linkedin"></i>LinkedIn</a>
            <a href="https://leetcode.com/u/rashq_01/" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bx-code"></i>LeetCode</a>
            <a href="https://x.com/rashq_01" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bxl-twitter"></i>Twitter/X</a>
            <a href="https://facebook.com/rashq0" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bxl-facebook"></i>Facebook</a>
            <a href="https://instagram.com/rashq_01" target="_blank" rel="noopener noreferrer" className="soc"><i className="bx bxl-instagram"></i>Instagram</a>
          </div>
        </div>
      </div>
    </section>
  );
}
