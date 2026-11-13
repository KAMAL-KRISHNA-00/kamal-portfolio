import * as THREE from 'three';

/*
  The barrier between two sections: a thin pane of dark glass, pre-fractured into
  jittered triangular shards. Everything is animated in the vertex shader from a few
  uniforms, so the whole pane is one draw call:
    uOpacity  — pane fades in as the blade approaches
    uCrack    — glowing crack lines spread outward from the impact point
    uProg     — shatter: shards burst away from the cut, spin, fall and fade
  Driven by scroll, so scrolling back up reassembles it.
*/

const COLS = 26;
const ROWS = 3;
const THICK = 5; // px

export function buildBarrier() {
  // jittered lattice in unit space
  const P = [];
  for (let j = 0; j <= ROWS; j++) {
    for (let i = 0; i <= COLS; i++) {
      let x = i / COLS;
      let y = j / ROWS;
      if (i > 0 && i < COLS) x += ((Math.random() - 0.5) * 0.7) / COLS;
      if (j > 0 && j < ROWS) y += ((Math.random() - 0.5) * 0.55) / ROWS;
      P.push([x, y]);
    }
  }
  const at = (i, j) => P[j * (COLS + 1) + i];
  const tris = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const a = at(i, j);
      const b = at(i + 1, j);
      const c = at(i + 1, j + 1);
      const d = at(i, j + 1);
      if (Math.random() < 0.5) tris.push([a, b, c], [a, c, d]);
      else tris.push([a, b, d], [b, c, d]);
    }
  }

  const pos = [];
  const nor = [];
  const bary = [];
  const center = [];
  const rand = [];
  const ASPECT = 1400 / 110; // approximate px aspect for side normals
  const h = THICK / 2;

  tris.forEach(([a, b, c]) => {
    // keep a consistent (counter-clockwise) winding
    const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (cross < 0) [b, c] = [c, b];
    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    const r = [Math.random(), Math.random(), Math.random(), Math.random()];
    const push = (v, z, n, br) => {
      pos.push(v[0], v[1], z);
      nor.push(...n);
      bary.push(...br);
      center.push(cx, cy, 0);
      rand.push(...r);
    };
    // front + back faces
    push(a, h, [0, 0, 1], [1, 0, 0]);
    push(b, h, [0, 0, 1], [0, 1, 0]);
    push(c, h, [0, 0, 1], [0, 0, 1]);
    push(a, -h, [0, 0, -1], [1, 0, 0]);
    push(c, -h, [0, 0, -1], [0, 0, 1]);
    push(b, -h, [0, 0, -1], [0, 1, 0]);
    // three side walls — these are the glowing broken edges
    [[a, b], [b, c], [c, a]].forEach(([p, q]) => {
      const dx = (q[0] - p[0]) * ASPECT;
      const dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      const n = [dy / len, -dx / len, 0];
      const e = [0, 0, 0];
      push(p, h, n, e);
      push(p, -h, n, e);
      push(q, h, n, e);
      push(q, h, n, e);
      push(p, -h, n, e);
      push(q, -h, n, e);
    });
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('aBary', new THREE.Float32BufferAttribute(bary, 3));
  geo.setAttribute('aCenter', new THREE.Float32BufferAttribute(center, 3));
  geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rand, 4));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: new THREE.Vector2(1400, 110) },
      uSeam: { value: 0 },
      uScale: { value: 1 },
      uImpact: { value: 0.5 },
      uOpacity: { value: 0 },
      uCrack: { value: 0 },
      uProg: { value: 0 },
      uFlip: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform vec2 uSize; uniform float uSeam; uniform float uScale; uniform float uImpact;
      uniform float uOpacity; uniform float uCrack; uniform float uProg; uniform float uFlip;
      attribute vec3 aCenter; attribute vec4 aRand; attribute vec3 aBary;
      varying vec3 vN; varying vec3 vBary; varying float vA; varying float vCrack; varying float vHeat;

      mat3 rotAxis(vec3 ax, float a){
        float s = sin(a), c = cos(a), oc = 1.0 - c;
        return mat3(oc*ax.x*ax.x + c,      oc*ax.x*ax.y + ax.z*s, oc*ax.z*ax.x - ax.y*s,
                    oc*ax.x*ax.y - ax.z*s, oc*ax.y*ax.y + c,      oc*ax.y*ax.z + ax.x*s,
                    oc*ax.z*ax.x + ax.y*s, oc*ax.y*ax.z - ax.x*s, oc*ax.z*ax.z + c);
      }

      void main(){
        vec3 c = vec3((aCenter.x - 0.5) * uSize.x, (aCenter.y - 0.5) * uSize.y + uSeam, 0.0);
        vec3 off = vec3((position.x - aCenter.x) * uSize.x, (position.y - aCenter.y) * uSize.y, position.z * uScale);

        float d = abs(aCenter.x - uImpact);
        float p = clamp((uProg * 1.6 - d * 0.55) / 0.8, 0.0, 1.0);   // shatter wave from the impact
        float e = 1.0 - pow(1.0 - p, 3.0);
        vCrack = clamp((uCrack * 1.15 - d * 1.3) * 3.0, 0.0, 1.0) * (1.0 - smoothstep(0.0, 0.35, d) * 0.5);

        float side = aCenter.y < 0.5 ? -1.0 : 1.0;
        vec3 dir = normalize(vec3((aCenter.x - uImpact) * 2.2 * uFlip + (aRand.x - 0.5) * 1.4,
                                  side * (0.5 + aRand.y * 1.2),
                                  0.3 + aRand.z * 1.6));
        float dist = (140.0 + aRand.w * 420.0) * uScale;
        vec3 disp = dir * dist * e + vec3(0.0, -520.0 * p * p * uScale, 0.0);

        vec3 axis = normalize(aRand.zxy - 0.5 + 0.001);
        mat3 R = rotAxis(axis, p * (2.5 + aRand.y * 7.0));
        vec3 pos = c + disp + R * off * (1.0 - 0.3 * p);

        vN = normalize(normalMatrix * (R * normal));
        vBary = aBary;
        vHeat = 1.0 - smoothstep(0.0, 0.5, p);                       // edges cool as they fly
        vA = uOpacity * (1.0 - smoothstep(0.5, 1.0, p));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vN; varying vec3 vBary; varying float vA; varying float vCrack; varying float vHeat;
      void main(){
        if (vA <= 0.002) discard;
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        vec3 V = vec3(0.0, 0.0, 1.0);
        float fres = pow(1.0 - abs(n.z), 2.0);
        vec3 L = normalize(vec3(-0.45, 0.7, 0.6));
        float spec = pow(max(dot(reflect(-L, n), V), 0.0), 10.0);
        float spec2 = pow(max(dot(reflect(-normalize(vec3(0.6, -0.3, 0.7)), n), V), 0.0), 8.0);
        float mb = min(min(vBary.x, vBary.y), vBary.z);
        float edge = 1.0 - smoothstep(0.0, 0.022, mb);
        float side = step(mb, 0.0001) * step(max(max(vBary.x, vBary.y), vBary.z), 0.0001);

        vec3 crim = vec3(0.86, 0.08, 0.24);
        // obsidian glass: near-black body, steel sheen as faces turn to the light, crimson at grazing angles
        vec3 col = vec3(0.025, 0.022, 0.026) + vec3(0.09, 0.085, 0.095) * (0.5 + 0.5 * n.y);
        col += crim * fres * 0.7;
        col += vec3(0.95, 0.95, 1.0) * spec * 0.55 + crim * spec2 * 0.45;
        float crack = edge * vCrack * (1.0 - side * (1.0 - vHeat));
        col += mix(crim, vec3(1.0, 0.75, 0.8), crack * vHeat * 0.6) * crack * (0.35 + 0.9 * vHeat);

        float a = vA * clamp(0.5 + 0.45 * fres + spec * 0.6 + crack * 0.5, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  mesh.visible = false;
  return mesh;
}
