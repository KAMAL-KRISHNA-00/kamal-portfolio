// Tiny shared state between DOM components and the WebGL katana stage.
export const katanaStore = {
  introStart: null, // performance.now() when the unsheathing began, null when not running
  startIntro() {
    this.introStart = performance.now();
  },
  endIntro() {
    this.introStart = null;
  },
};

// shared timeline for the hero cinematic (seconds)
export const INTRO = {
  appear: [0.2, 0.75],
  draw: [0.75, 1.4],
  raise: [1.4, 1.6],
  slash: [1.6, 1.86],
  reveal: 1.86,
  end: 2.8,
};

if (import.meta.env.DEV && typeof window !== 'undefined') window.__katana = katanaStore;
