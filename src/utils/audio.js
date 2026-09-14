let tickAudio = null;
let blastAudio = null;

// Initialize audio objects
export const initAudio = () => {
  if (typeof window === 'undefined') return;
  
  if (!tickAudio) {
    tickAudio = new Audio('/tick.wav');
    tickAudio.volume = 0.5;
  }
  
  if (!blastAudio) {
    blastAudio = new Audio('/blast.wav');
    blastAudio.volume = 1.0;
  }
};

export const playTickSound = () => {
  if (!tickAudio) initAudio();
  if (tickAudio) {
    // Clone node to allow rapid overlapping clicks
    const clone = tickAudio.cloneNode();
    clone.volume = 0.5;
    clone.play().catch(e => console.warn('Audio blocked:', e));
  }
};

export const playBlastSound = () => {
  if (!blastAudio) initAudio();
  if (blastAudio) {
    // Clone node to allow overlapping blasts
    const clone = blastAudio.cloneNode();
    clone.volume = 1.0;
    clone.play().catch(e => console.warn('Audio blocked:', e));
  }
};
