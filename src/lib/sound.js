// Synthesised sword sounds (Web Audio). Nothing loads or plays until the visitor opts in.
let ctx = null;
let enabled = false;
let noiseBuf = null;
let lastSwish = 0;

function getNoise() {
  if (noiseBuf) return noiseBuf;
  const len = ctx.sampleRate * 0.8;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

export function setSoundEnabled(on) {
  enabled = on;
  if (on) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch {
      enabled = false;
    }
  }
  return enabled;
}

export const isSoundEnabled = () => enabled;

export function swish(strength = 1) {
  if (!enabled || !ctx) return;
  const now = performance.now();
  if (now - lastSwish < 380) return;
  lastSwish = now;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoise();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.6;
  bp.frequency.setValueAtTime(500, t);
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.12);
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.32);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22 * strength, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.36);
}

export function unsheath() {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  // scrape
  const src = ctx.createBufferSource();
  src.buffer = getNoise();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.6);
  // ring
  [2200, 3310, 5120].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.45);
    og.gain.exponentialRampToValueAtTime(0.05 / (i + 1), t + 0.48);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(og).connect(ctx.destination);
    o.start(t + 0.45);
    o.stop(t + 1.7);
  });
}

// glass/obsidian breaking: a bright crack, a noisy burst, then scattered high tinkles
let lastShatter = 0;
export function shatter(strength = 1) {
  if (!enabled || !ctx) return;
  const now = performance.now();
  if (now - lastShatter < 300) return;
  lastShatter = now;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoise();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28 * strength, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.5);
  for (let i = 0; i < 9; i++) {
    const at = t + 0.02 + Math.random() * 0.5;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 2600 + Math.random() * 4200;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime((0.05 * strength) / (1 + i * 0.3), at + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.12 + Math.random() * 0.15);
    o.connect(og).connect(ctx.destination);
    o.start(at);
    o.stop(at + 0.3);
  }
}
