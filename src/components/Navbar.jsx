import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("section[id]"));
    const observers = sections.map((s) => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setActiveSection(s.id);
          }
        },
        { threshold: 0.45 }
      );
      obs.observe(s);
      return obs;
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("rp", next);
  };

  const navLinks = [
    { id: 'home', num: '01', label: 'home' },
    { id: 'about', num: '02', label: 'about' },
    { id: 'work', num: '03', label: 'work' },
    { id: 'skills', num: '04', label: 'skills' },
    { id: 'telemetry', num: '05', label: 'coding' },
    { id: 'journey', num: '06', label: 'journey' },
    { id: 'contact', num: '07', label: 'contact' }
  ];

  return (
    <>
      <nav className={`nav ${isSticky ? 'sticky' : ''}`} id="nav">
        <div className="nav-inner">
          <a href="#home" className="logo">
            <span className="logo-ps">~/</span><span className="logo-nm">rajesh</span><span className="logo-sb"></span>
          </a>
          <div className="nav-links" id="nl">
            {navLinks.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.id}`} 
                className={activeSection === link.id ? 'act' : ''}
              >
                <span className="nn">{link.num}.</span>{link.label}
              </a>
            ))}
          </div>
          <div className="nav-r">
            <button className="ibtn" id="tgl" aria-label="Toggle theme" onClick={toggleTheme}>
              <i className="bx bx-sun i-sun"></i><i className="bx bx-moon i-moon"></i>
            </button>
            <button 
              className={`ibtn brgr ${isOpen ? 'open' : ''}`} 
              id="burg" 
              aria-label="Menu" 
              aria-expanded={isOpen ? 'true' : 'false'}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mdrw ${isOpen ? 'open' : ''}`} id="mdrw" aria-hidden={!isOpen ? 'true' : 'false'}>
        <div className="mscrim" id="mscrim" onClick={() => setIsOpen(false)}></div>
        <nav className={`mpnl ${isOpen ? 'open' : ''}`} id="mpnl">
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={() => setIsOpen(false)}>
              <span className="nn">{link.num}.</span>{link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

