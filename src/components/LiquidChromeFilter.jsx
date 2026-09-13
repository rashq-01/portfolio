export const LiquidChromeFilter = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <filter id="chrome-goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
    </filter>
  </svg>
);
