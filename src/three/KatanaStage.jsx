import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { DIM, TIP_X, buildSaya, buildSword, makeEnvironment, makeMaterials } from './katanaModel.js';
import { katanaStore, INTRO } from './store.js';
import { clamp, lerp, easeInOutCubic, easeOut } from '../lib/useMedia.js';
import { swish } from '../lib/sound.js';

/*
  THE SHARED ANIMATION CONTROLLER — one WebGL stage for the whole page.
  A real 3D katana (and its saya) is posed every frame from:
    • the hero unsheathing timeline (time-based, skippable),
    • the section boundaries (scroll-based: each seam gets one cut),
    • the contact stage (scroll-based final slash + sheathing),
    • otherwise a resting pose on the right-hand rail.
  Scroll position alone decides the cut poses, so fast scrolling can't stack animations.

  Screen mapping: a perspective camera is placed so that 1 world unit = 1 CSS pixel
  on the z = 0 plane. Anything rotated out of that plane gets real perspective.
*/

// x: viewport fraction, y: offset from the seam in viewport heights,
// a: blade angle on screen (deg, y-down), pitch: tip away(+)/toward(−) camera, roll: about the blade axis
const CUTS = {
  ink: { p0: [0.92, -0.6], a0: 150, p1: [0.45, -0.05], a1: 100, pi: [-40, 28], ro: [60, -30], z: [-160, 90] },
  matrix: { p0: [1.05, -0.03], a0: 188, p1: [0.34, 0.02], a1: 172, pi: [-55, 35], ro: [80, 10], z: [-220, 60] },
  path: { p0: [0.5, -0.95], a0: 89, p1: [0.5, -0.12], a1: 91, pi: [-60, 20], ro: [0, 90], z: [-260, 40] },
  strike: { p0: [1.02, -0.72], a0: 204, p1: [0.3, 0.02], a1: 116, pi: [-50, 35], ro: [70, -40], z: [-200, 110] },
  rise: { p0: [0.0, 0.45], a0: -28, p1: [0.6, -0.12], a1: -78, pi: [40, -30], ro: [-60, 30], z: [120, -140] },
  seal: { p0: [0.8, -0.48], a0: 158, p1: [0.5, -0.04], a1: 110, pi: [-35, 25], ro: [45, -20], z: [-120, 70] },
  scan: { p0: [-0.12, -0.02], a0: -4, p1: [0.56, 0.02], a1: 5, pi: [50, -40], ro: [-80, 20], z: [-200, 60] },
};

const FINAL = [
  // p,   x(W), y(H),  a,   pitch, roll, z
  [0.0, 0.86, -0.3, 100, 0, 70, -100],
  [0.32, 0.8, 0.1, 205, -50, 55, -180],
  [0.5, 0.26, 0.58, 125, 32, -30, 90],
  [0.66, 0.34, 0.64, 168, 6, 160, 0],
];

const D2R = Math.PI / 180;
const smooth = (v, a, b) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function KatanaStage() {
  const reduce = useReducedMotion();
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return undefined; // no WebGL — the page still works, just without the blade
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = makeEnvironment(renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-0.4, 0.8, 1);
    const rim = new THREE.DirectionalLight(0xdc143c, 2.2);
    rim.position.set(1, -0.3, -0.6);
    scene.add(key, rim);

    const M = makeMaterials();
    const sword = buildSword(M);
    const saya = buildSaya(M);
    sword.visible = saya.visible = false;
    scene.add(sword, saya);
    const probe = new THREE.Object3D();

    /* ---------- slash ribbon: a swept, glowing 3D surface between mid-blade and tip ---------- */
    const RN = 64;
    const rPos = new Float32Array((RN + 1) * 2 * 3);
    const rAlong = new Float32Array((RN + 1) * 2);
    const rAcross = new Float32Array((RN + 1) * 2);
    const rIdx = [];
    for (let i = 0; i <= RN; i++) {
      rAlong[i * 2] = rAlong[i * 2 + 1] = i / RN;
      rAcross[i * 2] = 0;
      rAcross[i * 2 + 1] = 1;
      if (i < RN) {
        const k = i * 2;
        rIdx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3).setUsage(THREE.DynamicDrawUsage));
    rGeo.setAttribute('aAlong', new THREE.BufferAttribute(rAlong, 1));
    rGeo.setAttribute('aAcross', new THREE.BufferAttribute(rAcross, 1));
    rGeo.setIndex(rIdx);
    const rMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aAlong; attribute float aAcross;
        varying float vAlong; varying float vAcross;
        void main(){ vAlong=aAlong; vAcross=aAcross; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity; varying float vAlong; varying float vAcross;
        void main(){
          float age = smoothstep(0.0, 0.55, vAlong);
          float glow = pow(vAcross, 4.0);
          float core = pow(vAcross, 26.0);
          vec3 wine = vec3(0.30,0.04,0.09);
          vec3 crim = vec3(0.86,0.06,0.22);
          vec3 flare = vec3(1.0,0.2,0.32);
          vec3 col = mix(wine, crim, smoothstep(0.0,0.7,vAcross));
          col = mix(col, flare, smoothstep(0.7,0.97,vAcross));
          col += vec3(1.0,0.9,0.92) * core * age * 1.4;
          float lead = 1.0 - smoothstep(0.985, 1.0, vAlong) * 0.5;
          float a = (0.015 + 0.985*glow) * age * lead * uOpacity;
          gl_FragColor = vec4(col * a, a);
        }`,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const ribbon = new THREE.Mesh(rGeo, rMat);
    ribbon.frustumCulled = false;
    ribbon.renderOrder = 5;
    scene.add(ribbon);

    /* ---------- sparks + energy motes ---------- */
    const SN = 70;
    const MN = 40;
    const PN = SN + MN;
    const pPos = new Float32Array(PN * 3);
    const pA = new Float32Array(PN);
    const pSize = new Float32Array(PN);
    const sparkDir = [];
    for (let i = 0; i < SN; i++) {
      const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      sparkDir.push({ v, sp: 90 + Math.random() * 260, s: 1.5 + Math.random() * 3 });
    }
    const moteSeed = Array.from({ length: MN }, () => ({ at: Math.random(), off: Math.random() * 2 - 1, f: Math.random() * 10, s: 1.5 + Math.random() * 2.5 }));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aA', new THREE.BufferAttribute(pA, 1).setUsage(THREE.DynamicDrawUsage));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
    const pMat = new THREE.ShaderMaterial({
      uniforms: { uPR: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aA; attribute float aSize; uniform float uPR; varying float vA;
        void main(){ vA=aA; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_PointSize=aSize*uPR*(0.6+aA); }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); float a=smoothstep(0.5,0.0,d)*vA;
          vec3 col=mix(vec3(1.0,0.19,0.31), vec3(1.0,0.95,0.95), smoothstep(0.25,0.0,d));
          gl_FragColor=vec4(col*a,a); }`,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const points = new THREE.Points(pGeo, pMat);
    points.frustumCulled = false;
    points.renderOrder = 6;
    scene.add(points);

    /* ---------- geometry of the page ---------- */
    let vw = 1;
    let vh = 1;
    let S = 1;
    let bounds = [];
    let stageEl = null;
    let contactTop = Infinity;
    let docH = 1;
    const lastPhase = {};

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const sy = window.scrollY;
      const dpr = Math.min(window.devicePixelRatio || 1, vw < 768 ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(vw, vh);
      pMat.uniforms.uPR.value = dpr;
      camera.aspect = vw / vh;
      const D = vh / (2 * Math.tan((camera.fov * D2R) / 2));
      camera.position.set(0, 0, D);
      camera.near = D * 0.1;
      camera.far = D * 4;
      camera.updateProjectionMatrix();
      S = vw < 768 ? vw / 860 : Math.min(1.05, vw / 1450);
      bounds = [...document.querySelectorAll('[data-slash]')]
        .map((n) => ({ top: n.getBoundingClientRect().top + sy, cut: n.dataset.slash }))
        .filter((b) => CUTS[b.cut]);
      const c = document.getElementById('contact');
      contactTop = c ? c.getBoundingClientRect().top + sy : Infinity;
      stageEl = document.querySelector('.final-stage');
      docH = document.documentElement.scrollHeight;
    };

    /* ---------- transforms ---------- */
    const euler = new THREE.Euler(0, 0, 0, 'ZYX');
    const T = () => ({ pos: new THREE.Vector3(), quat: new THREE.Quaternion(), s: 1 });
    // free pose (screen-space) → transform
    const free = (p, out = T()) => {
      out.pos.set(p.x - vw / 2, -(p.y - vh / 2), p.z || 0);
      euler.set((p.roll || 0) * D2R, (p.pitch || 0) * D2R, -p.a * D2R, 'ZYX');
      out.quat.setFromEuler(euler);
      out.s = p.sc * S;
      return out;
    };
    const vTmp = new THREE.Vector3();
    // sword seated in the saya at offset `off` along the saya axis
    const seated = (sayaT, off, out = T()) => {
      vTmp.set(off, 0, 0).multiplyScalar(sayaT.s).applyQuaternion(sayaT.quat);
      out.pos.copy(sayaT.pos).add(vTmp);
      out.quat.copy(sayaT.quat);
      out.s = sayaT.s;
      return out;
    };
    const mix = (A, B, k, out = T()) => {
      out.pos.lerpVectors(A.pos, B.pos, k);
      out.quat.slerpQuaternions(A.quat, B.quat, k);
      out.s = lerp(A.s, B.s, k);
      return out;
    };
    const apply = (obj, t) => {
      obj.position.copy(t.pos);
      obj.quaternion.copy(t.quat);
      obj.scale.setScalar(t.s);
    };
    const lerpPose = (A, B, k) => ({
      x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: lerp(A.z || 0, B.z || 0, k),
      a: lerp(A.a, B.a, k), pitch: lerp(A.pitch || 0, B.pitch || 0, k), roll: lerp(A.roll || 0, B.roll || 0, k), sc: lerp(A.sc, B.sc, k),
    });

    const EDGE_IN = new THREE.Vector3(DIM.X0 + DIM.blade * 0.66, DIM.sori * 0.44 - 6, 0);
    const EDGE_TIP = new THREE.Vector3(TIP_X + 4, DIM.sori - 1.5, 0);
    const a1 = new THREE.Vector3();
    const a2 = new THREE.Vector3();
    const tipSamples = [];
    for (let i = 0; i <= RN; i++) tipSamples.push(new THREE.Vector3());

    // build the ribbon from a transform sampler over [e0, e1]
    const drawRibbon = (sampler, e0, e1, opacity) => {
      if (opacity <= 0.001 || e1 - e0 < 0.002) {
        rMat.uniforms.uOpacity.value = 0;
        ribbon.visible = false;
        return;
      }
      ribbon.visible = true;
      const tt = T();
      for (let i = 0; i <= RN; i++) {
        const e = lerp(e0, e1, i / RN);
        apply(probe, sampler(e, tt));
        probe.updateMatrix();
        a1.copy(EDGE_IN).applyMatrix4(probe.matrix);
        a2.copy(EDGE_TIP).applyMatrix4(probe.matrix);
        rPos.set([a1.x, a1.y, a1.z, a2.x, a2.y, a2.z], i * 6);
        tipSamples[i].copy(a2);
      }
      rGeo.attributes.position.needsUpdate = true;
      rMat.uniforms.uOpacity.value = opacity;
    };

    const impact = new THREE.Vector3();
    const drawParticles = (k, moteO, time) => {
      // sparks burst from `impact`, k = 0..1 life
      for (let i = 0; i < SN; i++) {
        const d = sparkDir[i];
        const life = clamp(k);
        const e = easeOut(life);
        pPos[i * 3] = impact.x + d.v.x * d.sp * e;
        pPos[i * 3 + 1] = impact.y + d.v.y * d.sp * e - 160 * life * life;
        pPos[i * 3 + 2] = impact.z + d.v.z * d.sp * e;
        pA[i] = k > 0 && k < 1 ? (1 - life) * (i % 4 === 0 ? 1 : 0.75) : 0;
        pSize[i] = d.s * 2.2;
      }
      for (let j = 0; j < MN; j++) {
        const m = moteSeed[j];
        const idx = Math.min(RN, Math.floor(m.at * RN));
        const p = tipSamples[idx];
        const n = SN + j;
        pPos[n * 3] = p.x + m.off * 14 + Math.sin(time * 3 + m.f) * 4;
        pPos[n * 3 + 1] = p.y + Math.cos(time * 2.4 + m.f) * 10 + m.off * 6;
        pPos[n * 3 + 2] = p.z;
        pA[n] = moteO * m.at * (0.5 + 0.5 * Math.sin(time * 9 + m.f));
        pSize[n] = m.s * 2;
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.aA.needsUpdate = true;
      pGeo.attributes.aSize.needsUpdate = true;
    };

    /* ---------- per-frame choreography ---------- */
    let raf = 0;
    let wasEmpty = false;
    const t0 = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const time = (now - t0) / 1000;
      const sy = window.scrollY;
      const mobile = vw < 768;
      const railOK = vw >= 1100 && !reduce;
      sword.visible = false;
      saya.visible = false;
      let ribbonDrawn = false;
      let sparkK = -1;
      let moteO = 0;
      scene.environmentIntensity = 1;
      key.intensity = 1.6;
      rim.intensity = 2.2;

      /* 1 — hero unsheathing (time-based) */
      const intro = katanaStore.introStart != null && !reduce ? (now - katanaStore.introStart) / 1000 : -1;
      if (intro >= 0 && intro < INTRO.end) {
        const Si = Math.min(1.05, (vw * 0.52) / 640);
        const sc = Si / S;
        const appear = smooth(intro, ...INTRO.appear);
        scene.environmentIntensity = appear;
        key.intensity = 1.6 * appear;
        rim.intensity = 2.2 * appear;
        const mouthX = vw / 2 - 140 * Si;
        const exit = smooth(intro, INTRO.raise[0] - 0.05, INTRO.raise[0] + 0.22);
        const sayaT = free({
          x: mouthX - exit * vw * 0.9, y: vh / 2 + exit * 90, z: lerp(-420, 0, easeOut(appear)) - exit * 200,
          a: 0, pitch: lerp(30, 12, clamp(intro / INTRO.draw[1])), roll: -22, sc,
        });
        const drawK = easeInOutCubic(smooth(intro, ...INTRO.draw));
        const off = lerp(DIM.sheathOffset, -(TIP_X + 14), drawK);
        const drawn = seated(sayaT, off);
        const slashStart = { x: vw * 0.28, y: vh * 0.4, z: -160, a: -48, pitch: -30, roll: 60, sc };
        const slashEnd = { x: vw * 0.5, y: vh * 0.82, z: -20, a: 62, pitch: 22, roll: -30, sc };
        const slashAt = (e, out) => free(lerpPose(slashStart, slashEnd, easeInOutCubic(e)), out);

        if (intro < INTRO.raise[0] + 0.22) {
          apply(saya, sayaT);
          saya.visible = exit < 1;
        }
        if (intro < INTRO.raise[0]) {
          apply(sword, drawn);
          sword.visible = true;
        } else if (intro < INTRO.slash[0]) {
          const k = easeInOutCubic(smooth(intro, ...INTRO.raise));
          const drawnEnd = seated(free({ x: mouthX, y: vh / 2, z: 0, a: 0, pitch: 12, roll: -22, sc }), -(TIP_X + 14));
          apply(sword, mix(drawnEnd, slashAt(0), k));
          sword.visible = true;
        } else {
          const u = clamp((intro - INTRO.slash[0]) / (INTRO.slash[1] - INTRO.slash[0]));
          apply(sword, slashAt(u));
          sword.visible = u < 1;
          const fade = 1 - smooth(intro, INTRO.slash[1], INTRO.end - 0.2);
          drawRibbon(slashAt, Math.max(0, u - 0.55), u, fade);
          ribbonDrawn = true;
          apply(probe, slashAt(0.5));
          probe.updateMatrix();
          impact.copy(EDGE_TIP).applyMatrix4(probe.matrix);
          sparkK = (intro - INTRO.slash[0] - 0.1) / 0.7;
          moteO = fade;
        }
      } else {
        /* 2 — contact stage: final slash + sheathing */
        let finalP = -1;
        let st = null;
        if (stageEl) {
          st = stageEl.getBoundingClientRect();
          finalP = reduce ? (st.top < vh ? 1 : -1) : (vh * 0.85 - st.top) / (st.height + vh * 0.1);
        }
        if (st && finalP > 0 && st.bottom > -50) {
          const p = clamp(finalP);
          const W = st.width;
          const H = st.height;
          const sF = W < 700 ? W / 860 : Math.min(1, W / 1300);
          const sc = sF / S;
          const rise = smooth(p, 0.5, 0.68);
          const sayaT = free({
            x: st.left + W / 2 + 150 * sF, y: st.top + lerp(H * 1.2, H * 0.86, rise), z: 0,
            a: 180, pitch: -16, roll: 162, sc,
          });
          apply(saya, sayaT);
          saya.visible = rise > 0;
          const freeAt = (q) => {
            let i = 0;
            while (i < FINAL.length - 2 && q > FINAL[i + 1][0]) i++;
            const A = FINAL[i];
            const B = FINAL[i + 1];
            const k = easeInOutCubic(clamp((q - A[0]) / (B[0] - A[0])));
            return {
              x: st.left + lerp(A[1], B[1], k) * W, y: st.top + lerp(A[2], B[2], k) * H, z: lerp(A[6], B[6], k),
              a: lerp(A[3], B[3], k), pitch: lerp(A[4], B[4], k), roll: lerp(A[5], B[5], k), sc,
            };
          };
          let swordT;
          if (p <= 0.66) {
            swordT = free(freeAt(p));
          } else if (p <= 0.8) {
            const k = easeInOutCubic(smooth(p, 0.66, 0.8));
            swordT = mix(free(freeAt(0.66)), seated(sayaT, TIP_X + 46), k);
          } else {
            const k = easeInOutCubic(smooth(p, 0.8, 0.97));
            swordT = seated(sayaT, lerp(TIP_X + 46, DIM.sheathOffset, k));
          }
          apply(sword, swordT);
          sword.visible = true;
          if (!reduce && p > 0.3 && p < 0.66) {
            const sampler = (e, out) => free(freeAt(e), out);
            const fade = 1 - smooth(p, 0.5, 0.64);
            drawRibbon(sampler, Math.max(0.32, Math.min(p, 0.5) - 0.15), Math.min(p, 0.5), fade);
            ribbonDrawn = true;
            apply(probe, free(freeAt(0.41)));
            probe.updateMatrix();
            impact.copy(EDGE_TIP).applyMatrix4(probe.matrix);
            sparkK = (p - 0.4) / 0.14;
            moteO = fade;
          }
          const ph = p > 0.36 && p < 0.5 ? 1 : 0;
          if (ph && lastPhase.final !== 1) swish(1);
          lastPhase.final = ph;
        } else if (!reduce) {
          /* 3 — section seams, 4 — resting rail */
          const prog = clamp(sy / Math.max(1, docH - vh));
          const restSc = 0.5;
          const yMin = 100 + DIM.handle * S * restSc;
          const yMax = vh - TIP_X * S * restSc - 24;
          const restO = railOK ? clamp((sy - vh * 0.45) / (vh * 0.35)) * clamp((contactTop - sy - vh * 0.25) / (vh * 0.45)) : 0;
          const rest = {
            x: vw - 34 + (1 - restO) * 90, y: lerp(yMin, Math.max(yMin, yMax), prog), z: 0,
            a: 90, pitch: 0, roll: 55 + Math.sin(time * 0.8) * 22, sc: restSc,
          };

          let active = null;
          let t = 0;
          for (let i = 0; i < bounds.length; i++) {
            const d = (bounds[i].top - sy) / vh;
            const tt = (0.95 - d) / 0.6;
            if (tt > 0 && tt < 1) {
              active = bounds[i];
              t = tt;
              break;
            }
          }

          if (!active) {
            if (restO > 0) {
              apply(sword, free(rest));
              sword.visible = true;
            }
          } else {
            const c = CUTS[active.cut];
            const sc = mobile ? 0.9 : 1;
            const seam = active.top - sy;
            const start = { x: c.p0[0] * vw, y: seam + c.p0[1] * vh, z: c.z[0], a: c.a0, pitch: c.pi[0], roll: c.ro[0], sc };
            const end = { x: c.p1[0] * vw, y: seam + c.p1[1] * vh, z: c.z[1], a: c.a1, pitch: c.pi[1], roll: c.ro[1], sc };
            const at = (e) => lerpPose(start, end, easeInOutCubic(e));
            const before = railOK ? rest : lerpPose(start, end, -0.9);
            const after = railOK ? rest : lerpPose(start, end, 1.9);
            let pose;
            let u = 0;
            if (t < 0.3) pose = lerpPose(before, start, easeOut(t / 0.3));
            else if (t <= 0.7) {
              u = (t - 0.3) / 0.4;
              pose = at(u);
            } else {
              u = 1;
              pose = lerpPose(end, after, easeInOutCubic((t - 0.7) / 0.3));
            }
            apply(sword, free(pose));
            sword.visible = true;

            if (t >= 0.3) {
              let e0 = Math.max(0, u - 0.5);
              let o = 1;
              if (t > 0.7) {
                const k = (t - 0.7) / 0.3;
                e0 = lerp(0.25, 1, easeOut(k));
                o = 1 - k;
              }
              drawRibbon((e, out) => free(at(e), out), e0, u, o);
              ribbonDrawn = true;
              apply(probe, free(at(0.5)));
              probe.updateMatrix();
              impact.copy(EDGE_TIP).applyMatrix4(probe.matrix);
              sparkK = (u - 0.42) / 0.5;
              if (t > 0.7) sparkK = Math.max(sparkK, 1);
              moteO = o;
            }
            const ph = t >= 0.3 && t <= 0.7 ? 1 : 0;
            if (ph && lastPhase[active.top] !== 1) swish(mobile ? 0.6 : 1);
            lastPhase[active.top] = ph;
          }
        }
      }

      if (!ribbonDrawn) {
        ribbon.visible = false;
        rMat.uniforms.uOpacity.value = 0;
      }
      points.visible = sparkK > 0 || moteO > 0;
      if (points.visible) drawParticles(sparkK, moteO, time);

      const empty = !sword.visible && !saya.visible && !ribbon.visible && !points.visible;
      if (empty && wasEmpty) return; // nothing on stage — skip the draw
      wasEmpty = empty;
      renderer.render(scene, camera);
    };

    measure();
    const onResize = () => measure();
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      Object.values(M).forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      el.removeChild(renderer.domElement);
    };
  }, [reduce]);

  return <div ref={host} className="katana-stage" aria-hidden="true" />;
}
