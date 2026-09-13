import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import BootScreen from './components/BootScreen.jsx';
import BackgroundCanvas from './components/BackgroundCanvas.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Work from './components/Work.jsx';
import Skills from './components/Skills.jsx';
import Telemetry from './components/Telemetry.jsx';
import Journey from './components/Journey.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

function ScrollManager() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollLen = winHeightPx > 0 ? scrollPx / winHeightPx : 0;
      setScrollProgress(scrollLen * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div id="progress" style={{ width: `${scrollProgress}%` }}></div>
      <button 
        id="btt" 
        aria-label="Back to top" 
        onClick={() => window.scrollTo({top:0, behavior:'smooth'})} 
        className={scrollProgress > 10 ? 'show' : ''}
      >
        <i className="bx bx-up-arrow-alt"></i>
      </button>
    </>
  );
}

export default function App() {
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const spl = document.getElementById("spotlight");
    if (spl) {
      const handleMouseMove = (e) => {
        spl.style.setProperty("--sx", e.clientX + "px");
        spl.style.setProperty("--sy", e.clientY + "px");
      };
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const rvIO = new IntersectionObserver(
      (es, o) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            o.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -16px 0px" }
    );
    
    // Give components a moment to mount before observing
    const timer = setTimeout(() => {
      const els = document.querySelectorAll(".rv");
      els.forEach((el) => rvIO.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      rvIO.disconnect();
    };
  }, []);

  return (
    <>
      <BackgroundCanvas />
      
      {/* Spotlight */}
      <div id="spotlight"></div>
      
      {/* Scroll Progress & Back to Top */}
      <ScrollManager />

      {/* Boot Screen stays mounted (but can be styled out), or we can conditionally render. Let's keep it conditionally rendered for better performance after load, but give it a moment to finish its CSS transition */}
      <BootScreen onComplete={() => setTimeout(() => setBootComplete(true), 100)} />

      <Navbar />

      <div id="dashboard">
        <main>
          <Hero />
          <div className="div"></div>
          <About />
          <div className="div"></div>
          <Work />
          <div className="div"></div>
          <Skills />
          <div className="div"></div>
          <Telemetry />
          <div className="div"></div>
          <Journey />
          <div className="div"></div>
          <Contact />
        </main>

        <Footer />
      </div>

      <div id="flash-overlay"></div>
    </>
  );
}
