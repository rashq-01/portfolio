import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="ft">
        <span className="ft-l">
          <span className="fa">&lt;</span><span className="fa">rajesh</span><span className="fa">/&gt;</span>
          <span style={{color: 'var(--tx3)'}}> &mdash; </span>
          <span className="fb">&#64;2025</span>
          <span style={{color: 'var(--tx3)'}}> &mdash; </span>
          <span className="fc">built with terminal energy</span>
        </span>
        <span className="ft-r" onClick={scrollToTop} style={{cursor: 'pointer'}}>
          cd ~/<i className="bx bx-up-arrow-alt"></i>
        </span>
      </div>
    </footer>
  );
}

