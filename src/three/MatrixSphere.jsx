import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

/*
  The KK mark as a living data sphere:
   • a pixel shell (fibonacci lattice) swept by travelling impulse waves
   • hex-glyph streams raining down the meridians
   • a "KK" core made of particles that periodically scatter and re-forge
   • tilted orbit rings and a scanning latitude band
  Everything is additive points/lines — cheap, and paused when off-screen.
*/

const SHELL_N = 5600;
const STREAMS = 96;
const TRAIL = 14;

function glyphAtlas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.font = '600 46px "JetBrains Mono", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  '0123456789ABCDEF'.split('').forEach((ch, i) => g.fillText(ch, (i % 4) * 64 + 32, Math.floor(i / 4) * 64 + 34));
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  return t;
}

function kkPoints() {
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 220;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.font = '800 200px "Shippori Mincho B1", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('KK', 210, 118);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const pts = [];
  for (let y = 0; y < c.height; y += 3) {
    for (let x = 0; x < c.width; x += 3) {
      if (d[(y * c.width + x) * 4 + 3] > 140) pts.push([(x - 210) / 330, -(y - 110) / 330]);
    }
  }
  return pts;
}

const shellVS = /* glsl */ `
  uniform float uTime; uniform vec4 uPulse[4]; uniform float uPR;
  attribute float aSeed;
  varying float vB; varying float vFace;
  void main(){
    vec3 n = normalize(position);
    float A = 0.0;
    for (int i = 0; i < 4; i++) {
      float age = uTime - uPulse[i].w;
      if (age > 0.0 && age < 3.2) {
        float d = acos(clamp(dot(n, normalize(uPulse[i].xyz)), -1.0, 1.0));
        float front = age * 1.25;
        A += exp(-pow((d - front) * 9.0, 2.0)) * (1.0 - age / 3.2);
      }
    }
    float flick = step(0.985, fract(sin(aSeed * 91.7 + floor(uTime * 12.0) * 13.1) * 4375.5));
    vec3 p = position * (1.0 + 0.09 * A);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vFace = dot(normalize(normalMatrix * n), vec3(0.0, 0.0, 1.0));
    vB = 0.42 + A * 1.5 + flick * 1.0;
    gl_PointSize = (1.9 + 3.0 * A + flick * 1.6) * uPR * (4.6 / -mv.z) * 1.6;
    gl_Position = projectionMatrix * mv;
  }`;
const shellFS = /* glsl */ `
  varying float vB; varying float vFace;
  void main(){
    vec2 q = abs(gl_PointCoord - 0.5);
    if (max(q.x, q.y) > 0.42) discard;               // crisp square pixels
    float depth = mix(0.12, 1.0, smoothstep(-0.3, 0.5, vFace));
    vec3 wine = vec3(0.32, 0.06, 0.11);
    vec3 crim = vec3(0.86, 0.08, 0.24);
    vec3 flare = vec3(1.0, 0.19, 0.31);
    vec3 col = mix(wine, crim, clamp(vB, 0.0, 1.0));
    col = mix(col, flare, clamp(vB - 0.8, 0.0, 1.0));
    col = mix(col, vec3(1.0), clamp(vB - 1.4, 0.0, 1.0));
    float a = clamp(vB, 0.0, 1.0) * depth;
    gl_FragColor = vec4(col * a, a);
  }`;

const rainVS = /* glsl */ `
  uniform float uTime; uniform float uPR;
  attribute float aLon; attribute float aSlot; attribute float aSpeed; attribute float aPhase; attribute float aSeed;
  varying float vB; varying float vFace; varying float vGlyph;
  void main(){
    float head = 1.75 - fract(aPhase + uTime * aSpeed) * 3.6;   // latitude of the stream head (rad)
    float lat = head + aSlot * 0.075;
    float vis = step(-1.5, lat) * step(lat, 1.5);
    vec3 n = vec3(cos(lat) * cos(aLon), sin(lat), cos(lat) * sin(aLon));
    vec4 mv = modelViewMatrix * vec4(n * 1.035, 1.0);
    vFace = dot(normalize(normalMatrix * n), vec3(0.0, 0.0, 1.0));
    vB = vis * (aSlot < 0.5 ? 1.6 : pow(1.0 - aSlot / ${TRAIL.toFixed(1)}, 1.6));
    vGlyph = mod(floor(aSeed * 16.0 + uTime * (aSlot < 0.5 ? 14.0 : 3.0) * (0.5 + aSeed)), 16.0);
    gl_PointSize = 11.0 * uPR * (4.6 / -mv.z) * 1.4;
    gl_Position = projectionMatrix * mv;
  }`;
const rainFS = /* glsl */ `
  uniform sampler2D uAtlas;
  varying float vB; varying float vFace; varying float vGlyph;
  void main(){
    if (vB <= 0.001) discard;
    vec2 cell = vec2(mod(vGlyph, 4.0), floor(vGlyph / 4.0));
    vec2 uv = vec2((cell.x + gl_PointCoord.x) / 4.0, 1.0 - (cell.y + gl_PointCoord.y) / 4.0);
    float g = texture2D(uAtlas, uv).a;
    float depth = mix(0.08, 1.0, smoothstep(-0.2, 0.7, vFace));
    vec3 col = mix(vec3(0.86, 0.08, 0.24), vec3(1.0, 0.85, 0.88), clamp(vB - 1.0, 0.0, 1.0));
    float a = g * clamp(vB, 0.0, 1.0) * depth;
    gl_FragColor = vec4(col * a, a);
  }`;

const kkVS = /* glsl */ `
  uniform float uTime; uniform float uPR; uniform float uScatter;
  attribute vec3 aDir; attribute float aSeed;
  varying float vB;
  void main(){
    float shimmer = sin(uTime * 2.0 + aSeed * 40.0) * 0.006;
    vec3 p = position + vec3(shimmer, -shimmer, 0.0) + aDir * uScatter * (0.4 + aSeed * 0.9);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.6 + 0.4 * sin(uTime * 6.0 + aSeed * 90.0);
    vB = tw * (1.0 - uScatter * 0.6);
    gl_PointSize = (2.2 + aSeed * 1.4) * uPR * (4.6 / -mv.z) * 1.4;
    gl_Position = projectionMatrix * mv;
  }`;
const kkFS = /* glsl */ `
  varying float vB;
  void main(){
    vec2 q = abs(gl_PointCoord - 0.5);
    if (max(q.x, q.y) > 0.4) discard;
    vec3 col = mix(vec3(0.86, 0.08, 0.24), vec3(1.0, 0.96, 0.97), vB);
    gl_FragColor = vec4(col * vB, vB);
  }`;

const additive = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };

export default function MatrixSphere({ active = true }) {
  const host = useRef(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFailed(true);
      return undefined;
    }
    renderer.setClearColor(0x000000, 0);
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);
    const world = new THREE.Group(); // tilts with the pointer
    const globe = new THREE.Group(); // spins
    world.add(globe);
    scene.add(world);
    const mats = [];

    // glow core behind everything
    const gc = document.createElement('canvas');
    gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const grd = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(220,20,60,0.32)');
    grd.addColorStop(0.45, 'rgba(139,0,0,0.14)');
    grd.addColorStop(1, 'rgba(82,16,29,0)');
    gg.fillStyle = grd;
    gg.fillRect(0, 0, 128, 128);
    const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), ...additive });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(3.0, 3.0, 1);
    scene.add(glow);
    mats.push(glowMat);

    // 1 — pixel shell
    const sp = new Float32Array(SHELL_N * 3);
    const ss = new Float32Array(SHELL_N);
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < SHELL_N; i++) {
      const y = 1 - (i / (SHELL_N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      sp.set([Math.cos(ga * i) * r, y, Math.sin(ga * i) * r], i * 3);
      ss[i] = Math.random();
    }
    const shellGeo = new THREE.BufferGeometry();
    shellGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    shellGeo.setAttribute('aSeed', new THREE.BufferAttribute(ss, 1));
    const pulses = Array.from({ length: 4 }, () => new THREE.Vector4(0, 1, 0, -99));
    const shellMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPulse: { value: pulses }, uPR: { value: pr } }, vertexShader: shellVS, fragmentShader: shellFS, ...additive });
    globe.add(new THREE.Points(shellGeo, shellMat));
    mats.push(shellMat);

    // 2 — glyph rain along meridians
    const RN = STREAMS * TRAIL;
    const rp = new Float32Array(RN * 3);
    const attr = { aLon: new Float32Array(RN), aSlot: new Float32Array(RN), aSpeed: new Float32Array(RN), aPhase: new Float32Array(RN), aSeed: new Float32Array(RN) };
    for (let s = 0; s < STREAMS; s++) {
      const lon = (s / STREAMS) * Math.PI * 2 + Math.random() * 0.05;
      const speed = 0.06 + Math.random() * 0.12;
      const phase = Math.random();
      for (let k = 0; k < TRAIL; k++) {
        const i = s * TRAIL + k;
        attr.aLon[i] = lon;
        attr.aSlot[i] = k;
        attr.aSpeed[i] = speed;
        attr.aPhase[i] = phase;
        attr.aSeed[i] = Math.random();
      }
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    Object.entries(attr).forEach(([k, v]) => rainGeo.setAttribute(k, new THREE.BufferAttribute(v, 1)));
    const atlas = glyphAtlas();
    const rainMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPR: { value: pr }, uAtlas: { value: atlas } }, vertexShader: rainVS, fragmentShader: rainFS, ...additive });
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.frustumCulled = false;
    globe.add(rain);
    mats.push(rainMat);

    // 3 — rings + scanning band
    const ringMat = new THREE.LineBasicMaterial({ color: 0xdc143c, transparent: true, opacity: 0.35, ...{ depthWrite: false, blending: THREE.AdditiveBlending } });
    const circle = (r, seg = 160) => {
      const pts = [];
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    };
    const rings = [
      [1.32, 1.15, 0.2],
      [1.48, -0.5, 0.9],
      [1.62, 0.3, -1.1],
    ].map(([r, rx, rz]) => {
      const l = new THREE.LineLoop(circle(r), ringMat);
      l.rotation.set(rx, 0, rz);
      world.add(l);
      return l;
    });
    // tick marks on the outer ring
    const tickPts = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r0 = 1.62;
      const r1 = i % 6 === 0 ? 1.7 : 1.66;
      tickPts.push(new THREE.Vector3(Math.cos(a) * r0, 0, Math.sin(a) * r0), new THREE.Vector3(Math.cos(a) * r1, 0, Math.sin(a) * r1));
    }
    const ticks = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), ringMat);
    ticks.rotation.copy(rings[2].rotation);
    world.add(ticks);
    const scanMat = new THREE.LineBasicMaterial({ color: 0xff304f, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const scan = new THREE.LineLoop(circle(1, 120), scanMat);
    globe.add(scan);
    mats.push(ringMat, scanMat);

    // 4 — KK particle core (faces the camera, sits inside the globe)
    let kkMat = null;
    const buildKK = () => {
      const pts = kkPoints();
      const n = pts.length;
      const p = new Float32Array(n * 3);
      const dir = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      pts.forEach(([x, y], i) => {
        p.set([x, y, (Math.random() - 0.5) * 0.06], i * 3);
        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        dir.set([v.x, v.y, v.z], i * 3);
        seed[i] = Math.random();
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
      geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      kkMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPR: { value: pr }, uScatter: { value: 0 } }, vertexShader: kkVS, fragmentShader: kkFS, ...additive });
      mats.push(kkMat);
      const kk = new THREE.Points(geo, kkMat);
      kk.renderOrder = 3;
      world.add(kk);
    };
    (document.fonts ? document.fonts.load('800 200px "Shippori Mincho B1"').catch(() => {}) : Promise.resolve()).then(buildKK);

    // sizing
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // pointer parallax
    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // only animate while visible
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    let raf = 0;
    let pulseIdx = 0;
    let nextPulse = 0.3;
    const t0 = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!visible || !activeRef.current) return;
      const t = reduce ? 2.4 : (now - t0) / 1000;
      if (!reduce && t > nextPulse) {
        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        pulses[pulseIdx % 4].set(v.x, v.y, v.z, t);
        pulseIdx++;
        nextPulse = t + 0.8 + Math.random() * 0.9;
      }
      shellMat.uniforms.uTime.value = t;
      rainMat.uniforms.uTime.value = t;
      if (kkMat) {
        kkMat.uniforms.uTime.value = t;
        // every 7s the KK scatters into the sphere and re-forges
        const c = (t % 7) / 7;
        const burst = c > 0.82 ? Math.sin(((c - 0.82) / 0.18) * Math.PI) : 0;
        kkMat.uniforms.uScatter.value = burst * burst * 0.9;
      }
      globe.rotation.y = t * 0.18;
      globe.rotation.x = 0.35;
      rings[0].rotation.y = t * 0.25;
      rings[1].rotation.y = -t * 0.18;
      rings[2].rotation.y = t * 0.1;
      ticks.rotation.y = t * 0.1;
      const sy = Math.sin(t * 0.7) * 0.95;
      scan.position.y = sy;
      scan.scale.setScalar(Math.sqrt(1 - sy * sy) * 1.01);
      world.rotation.y += (target.x - world.rotation.y) * 0.05;
      world.rotation.x += (target.y - world.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      mats.forEach((m) => m.dispose());
      atlas.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [reduce]);

  if (failed) {
    return (
      <div className="sphere-fallback">
        <div className="mark-sun" />
        <div className="mark-kk">KK</div>
      </div>
    );
  }
  return <div ref={host} className="matrix-sphere" />;
}
