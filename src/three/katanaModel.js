import * as THREE from 'three';

/*
  Procedural katana + saya. Units are "design pixels" (scaled at runtime).
  Sword frame: tsuba centre at the origin, blade along +X, cutting edge toward -Y,
  flat faces toward ±Z. Saya frame: the mouth (koiguchi) at the origin, body along +X,
  built on the same curve so a sheathed blade sits exactly inside it.
*/
export const DIM = {
  handle: 150,
  tsubaR: 22,
  tsubaT: 7,
  habaki: 18,
  X0: 21.5, // blade start (after tsuba half + habaki)
  blade: 420,
  H0: 15,
  H1: 11,
  thick: 4.4,
  sori: 7,
  saya: 458,
  sheathOffset: -6, // sword guard position in saya frame when fully sheathed
};
export const TIP_X = DIM.X0 + DIM.blade;

const curve = (s) => DIM.sori * s * s;

/* Blade cross-section at s ∈ [0,1]: [y,z] for back-L, back-R, shinogi-R, edge, shinogi-L */
function section(s) {
  const h = THREE.MathUtils.lerp(DIM.H0, DIM.H1, s);
  const c = curve(s);
  let yb = c + h / 2;
  let ye = c - h / 2;
  let ys = yb - 0.32 * h;
  let zb = DIM.thick * 0.32 * (1 - 0.3 * s);
  let zs = (DIM.thick / 2) * (1 - 0.35 * s);
  if (s > 0.9) {
    // kissaki: the edge sweeps up to meet the back
    const k = (s - 0.9) / 0.1;
    const kk = Math.pow(k, 1.5);
    ye = ye + (yb - 0.8 - ye) * kk;
    ys = ys + (yb - 0.6 - ys) * k;
    yb = yb - 0.8 * k;
    zb *= 1 - 0.95 * k;
    zs *= 1 - 0.95 * k;
  }
  return [
    [yb, -zb],
    [yb, zb],
    [ys, zs],
    [ye, 0],
    [ys, -zs],
  ];
}

function bladeStrip(a, b, N = 90) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const x = DIM.X0 + s * DIM.blade;
    const sec = section(s);
    pos.push(x, sec[a][0], sec[a][1], x, sec[b][0], sec[b][1]);
    uv.push(s, 0, s, 1);
    if (i < N) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

// steel with a frosted hamon band toward the edge (v = 1 at the edge)
function hamonTexture() {
  return canvasTex(1024, 64, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#9a9aa2');
    grd.addColorStop(0.5, '#c9c9cf');
    grd.addColorStop(1, '#e9e9ee');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    // hamon — misty white, wavy boundary
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const y = h * (0.58 + 0.07 * Math.sin(x * 0.045) + 0.035 * Math.sin(x * 0.13 + 1.3));
      g.lineTo(x, y);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.filter = 'blur(2px)';
    g.fill();
    g.filter = 'none';
    // nioi line
    g.strokeStyle = 'rgba(255,255,255,0.9)';
    g.lineWidth = 1.2;
    g.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h * (0.58 + 0.07 * Math.sin(x * 0.045) + 0.035 * Math.sin(x * 0.13 + 1.3));
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    // fine forging grain
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,40,46'},${Math.random() * 0.12})`;
      g.fillRect(Math.random() * w, Math.random() * h * 0.6, 6 + Math.random() * 30, 0.8);
    }
  });
}

function wrapTexture() {
  return canvasTex(
    256,
    256,
    (g, w, h) => {
      // samegawa (ray skin) — deep wine, speckled
      g.fillStyle = '#3d0c16';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(245,220,225,${Math.random() * 0.25})`;
        g.beginPath();
        g.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, Math.PI * 2);
        g.fill();
      }
      // ito wrap — black silk crossing bands leaving diamond windows
      g.fillStyle = '#0b0b0c';
      const band = (flip) => {
        g.beginPath();
        if (!flip) {
          g.moveTo(0, 0); g.lineTo(w * 0.62, 0); g.lineTo(w, h * 0.38); g.lineTo(w, h); g.lineTo(w * 0.38, h); g.lineTo(0, h * 0.62);
        } else {
          g.moveTo(w, 0); g.lineTo(w * 0.38, 0); g.lineTo(0, h * 0.38); g.lineTo(0, h); g.lineTo(w * 0.62, h); g.lineTo(w, h * 0.62);
        }
        g.closePath();
        g.fill();
      };
      band(false);
      band(true);
      // silk sheen
      g.strokeStyle = 'rgba(160,160,170,0.18)';
      for (let i = -h; i < h * 2; i += 6) {
        g.beginPath();
        g.moveTo(0, i);
        g.lineTo(w, i + w * 0.6);
        g.stroke();
      }
    },
    [3, 9]
  );
}

export function makeMaterials() {
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xd4d4da, metalness: 1, roughness: 0.16, side: THREE.DoubleSide, envMapIntensity: 1.4 });
  const hamon = hamonTexture();
  const hira = new THREE.MeshPhysicalMaterial({ map: hamon, color: 0xffffff, metalness: 1, roughness: 0.2, side: THREE.DoubleSide, envMapIntensity: 1.5 });
  const mune = new THREE.MeshPhysicalMaterial({ color: 0x9a9aa2, metalness: 1, roughness: 0.3, side: THREE.DoubleSide });
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xe6e6ea, metalness: 1, roughness: 0.22 });
  const iron = new THREE.MeshPhysicalMaterial({ color: 0x1b1b1e, metalness: 0.85, roughness: 0.48 });
  const wrapT = wrapTexture();
  const wrap = new THREE.MeshStandardMaterial({ map: wrapT, bumpMap: wrapT, bumpScale: 1.2, roughness: 0.55, metalness: 0.1, envMapIntensity: 1.6 });
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.15, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const cord = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6, metalness: 0 });
  const crimson = new THREE.MeshPhysicalMaterial({ color: 0xdc143c, metalness: 0.4, roughness: 0.3, emissive: 0x52101d, emissiveIntensity: 0.6 });
  return { steel, hira, mune, silver, iron, wrap, lacquer, cord, crimson };
}

const alongX = (geo) => geo.rotateZ(-Math.PI / 2); // cylinder Y axis → +X

export function buildSword(M) {
  const g = new THREE.Group();
  // blade facets
  const faces = [
    [0, 1, M.mune],
    [1, 2, M.steel],
    [2, 3, M.hira],
    [4, 3, M.hira],
    [4, 0, M.steel],
  ];
  faces.forEach(([a, b, m]) => g.add(new THREE.Mesh(bladeStrip(a, b), m)));

  // habaki
  const hab = new THREE.Mesh(new THREE.BoxGeometry(DIM.habaki, DIM.H0 + 3.5, DIM.thick + 4), M.silver);
  hab.position.set(DIM.tsubaT / 2 + DIM.habaki / 2 + 0.5, 0, 0);
  g.add(hab);
  // seppa
  [-1, 1].forEach((sgn) => {
    const sp = new THREE.Mesh(alongX(new THREE.CylinderGeometry(17, 17, 1.6, 40)), M.silver);
    sp.scale.set(1, 1, 0.8);
    sp.position.x = sgn * (DIM.tsubaT / 2 + 0.8);
    g.add(sp);
  });
  // tsuba
  const tsuba = new THREE.Mesh(alongX(new THREE.CylinderGeometry(DIM.tsubaR, DIM.tsubaR, DIM.tsubaT, 64)), M.iron);
  tsuba.scale.set(1, 1, 0.82);
  g.add(tsuba);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(DIM.tsubaR, 1.3, 10, 64).rotateY(Math.PI / 2), M.silver);
  rim.scale.set(1, 1, 0.82);
  g.add(rim);
  [1, -1].forEach((s) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 12), M.crimson);
    dot.position.set(-DIM.tsubaT / 2 - 0.4, s * 15, 0);
    g.add(dot);
  });
  // fuchi
  const fuchi = new THREE.Mesh(alongX(new THREE.CylinderGeometry(10.8, 10.8, 7, 32)), M.iron);
  fuchi.scale.set(1, 1, 0.8);
  fuchi.position.x = -DIM.tsubaT / 2 - 1.6 - 3.5;
  g.add(fuchi);
  // tsuka (handle), slightly waisted
  const tsuka = new THREE.Mesh(alongX(new THREE.CylinderGeometry(9.6, 10.2, DIM.handle - 14, 32, 8)), M.wrap);
  tsuka.scale.set(1, 1, 0.78);
  tsuka.position.x = -DIM.tsubaT / 2 - 1.6 - 7 - (DIM.handle - 14) / 2;
  g.add(tsuka);
  // menuki
  const men = new THREE.Mesh(new THREE.TorusGeometry(3, 0.9, 6, 16, Math.PI), M.silver);
  men.position.set(tsuka.position.x + 10, 0, 8);
  g.add(men);
  // kashira
  const kx = tsuka.position.x - (DIM.handle - 14) / 2 - 3.5;
  const kash = new THREE.Mesh(alongX(new THREE.CylinderGeometry(10.4, 10.2, 7, 32)), M.iron);
  kash.scale.set(1, 1, 0.8);
  kash.position.x = kx;
  g.add(kash);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(10.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(Math.PI / 2), M.iron);
  cap.scale.set(0.45, 1, 0.8);
  cap.position.x = kx - 3.5;
  g.add(cap);
  return g;
}

function sweepTube(x0, x1, rx, ry, cOf, N = 80, R = 20) {
  const pos = [];
  const idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = THREE.MathUtils.lerp(x0, x1, t);
    const [a, b, cy] = [rx(t), ry(t), cOf(x)];
    for (let j = 0; j <= R; j++) {
      const th = (j / R) * Math.PI * 2;
      pos.push(x, cy + Math.cos(th) * a, Math.sin(th) * b);
    }
    if (i < N) {
      for (let j = 0; j < R; j++) {
        const k = i * (R + 1) + j;
        idx.push(k, k + R + 1, k + 1, k + 1, k + R + 1, k + R + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function buildSaya(M) {
  const g = new THREE.Group();
  // the blade starts at (X0 + sheathOffset) in saya space — follow its curve exactly
  const bStart = DIM.X0 + DIM.sheathOffset;
  const cOf = (x) => curve(THREE.MathUtils.clamp((x - bStart) / DIM.blade, 0, 1)) + (x > bStart + DIM.blade ? 0 : 0);
  const body = new THREE.Mesh(
    sweepTube(0, DIM.saya, (t) => THREE.MathUtils.lerp(13.5, 11, t), (t) => THREE.MathUtils.lerp(7.6, 6.4, t), cOf),
    M.lacquer
  );
  g.add(body);
  // koiguchi (mouth ring)
  const koi = new THREE.Mesh(sweepTube(-1, 6, () => 14.6, () => 8.6, cOf, 4, 28), M.iron);
  g.add(koi);
  const koiRim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.085, 8, 48).rotateY(Math.PI / 2), M.silver);
  koiRim.scale.set(1, 14.8, 8.8);
  koiRim.position.set(-1, cOf(0), 0);
  g.add(koiRim);
  // kojiri (end cap)
  const endY = cOf(DIM.saya);
  const koj = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-Math.PI / 2), M.iron);
  koj.scale.set(14, 11.6, 7);
  koj.position.set(DIM.saya, endY, 0);
  g.add(koj);
  const kojRing = new THREE.Mesh(sweepTube(DIM.saya - 10, DIM.saya, () => 11.6, () => 6.9, cOf, 2, 24), M.iron);
  g.add(kojRing);
  // kurikata + sageo cord wraps
  const kuri = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 5), M.iron);
  kuri.position.set(52, cOf(52) - 15, 0);
  g.add(kuri);
  [64, 72].forEach((x) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.17, 8, 32).rotateY(Math.PI / 2), M.cord);
    w.scale.set(1, 13.9, 8);
    w.position.set(x, cOf(x), 0);
    g.add(w);
  });
  const sageo = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(52, cOf(52) - 17, 0),
        new THREE.Vector3(56, cOf(56) - 30, 4),
        new THREE.Vector3(80, cOf(80) - 26, 6),
        new THREE.Vector3(110, cOf(110) - 18, 5),
      ]),
      40,
      1.4,
      8
    ),
    M.cord
  );
  g.add(sageo);
  return g;
}

// dark studio with soft white boxes and crimson bounce — gives the steel its reflections
export function makeEnvironment(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.BackSide }));
  scene.add(room);
  const panel = (w, h, color, k, pos, look) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(...pos);
    p.lookAt(...look);
    scene.add(p);
  };
  panel(40, 6, 0xffffff, 6, [0, 30, 6], [0, 0, 0]); // overhead strip
  panel(8, 30, 0xffffff, 2.2, [-34, 4, 18], [0, 0, 0]); // key strip
  panel(12, 30, 0xdc143c, 3.2, [34, 0, 10], [0, 0, 0]); // crimson bounce
  panel(30, 8, 0x8b0000, 1.6, [0, -30, 10], [0, 0, 0]);
  panel(60, 10, 0xffffff, 3.2, [0, 16, 40], [0, 0, 0]); // front softbox (upper) — flats + shinogi-ji
  panel(60, 5, 0xffffff, 1.4, [0, -10, 42], [0, 0, 0]); // front lower strip — hira / hamon
  panel(10, 40, 0xdc143c, 1.8, [-30, 0, 34], [0, 0, 0]); // crimson kicker
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(scene, 0.03).texture;
  pm.dispose();
  return tex;
}
