// Molecule Lab — three.js 分子ビューア
// modelup の最適化方針を踏襲: InstancedMesh で原子・結合を各1ドローコール、
// 頂点/インスタンスカラー（テクスチャ不使用）、影なし、解析的ライティング。
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PHI = (1 + Math.sqrt(5)) / 2;
const CPK = { H: 0xf4f1e8, C: 0x3a3a44, O: 0xff4f5e, N: 0x3e8bff };
const RADIUS = { H: 0.32, C: 0.5, O: 0.48, N: 0.48 };

// ---------- 分子定義（座標は Å 相当のスケール） ----------
function water() {
  const a = (104.5 / 2) * (Math.PI / 180), r = 0.96;
  return { name: "水 H₂O", atoms: [
    ["O", 0, 0, 0], ["H", r * Math.sin(a), -r * Math.cos(a), 0], ["H", -r * Math.sin(a), -r * Math.cos(a), 0],
  ], bondLen: 1.2 };
}
function methane() {
  const d = 1.09 / Math.sqrt(3);
  return { name: "メタン CH₄", atoms: [
    ["C", 0, 0, 0], ["H", d, d, d], ["H", -d, -d, d], ["H", -d, d, -d], ["H", d, -d, -d],
  ], bondLen: 1.3 };
}
function benzene() {
  const atoms = [];
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2;
    atoms.push(["C", 1.39 * Math.cos(t), 1.39 * Math.sin(t), 0]);
    atoms.push(["H", 2.47 * Math.cos(t), 2.47 * Math.sin(t), 0]);
  }
  return { name: "ベンゼン C₆H₆", atoms, bondLen: 1.5 };
}
function caffeineLike() {
  // 二環（プリン骨格風）+ 置換基: 実分子の厳密座標ではなく教材用の模式形状
  const atoms = [];
  const ring = (cx, n, r, start, kinds) => {
    for (let i = 0; i < n; i++) {
      const t = start + (i / n) * Math.PI * 2;
      atoms.push([kinds[i % kinds.length], cx + r * Math.cos(t), r * Math.sin(t), 0]);
    }
  };
  ring(-1.1, 6, 1.38, Math.PI / 6, ["C", "N", "C", "N", "C", "C"]);
  ring(1.35, 5, 1.15, Math.PI, ["N", "C", "N", "C", "C"]);
  atoms.push(["O", -2.9, 2.0, 0.1], ["O", -2.2, -2.4, -0.1]);
  atoms.push(["C", 0.2, 2.9, 0.4], ["C", -3.4, -0.3, -0.3], ["C", 3.1, 1.2, 0.3]);
  for (const [k, x, y, z] of [...atoms]) {
    if (k === "C" && Math.abs(y) > 2.6 || (k === "C" && Math.abs(x) > 2.9)) {
      atoms.push(["H", x + 0.6, y + 0.7, z + 0.6], ["H", x - 0.7, y + 0.5, z - 0.5], ["H", x + 0.2, y - 0.9, z + 0.4]);
    }
  }
  return { name: "カフェイン様 C₈H₁₀N₄O₂（模式）", atoms, bondLen: 1.75 };
}
function fullerene() {
  // C60: 切頂二十面体の頂点（60個）
  const pts = [];
  const push = (x, y, z) => pts.push([x, y, z]);
  const perm3 = (a, b, c, f) => { f(a, b, c); f(b, c, a); f(c, a, b); };
  const signs = (a, b, c, f) => {
    for (const sa of [1, -1]) for (const sb of [1, -1]) for (const sc of [1, -1]) f(a * sa, b * sb, c * sc);
  };
  const seen = new Set();
  const add = (x, y, z) => { const k = [x, y, z].map((v) => v.toFixed(4)).join(","); if (!seen.has(k)) { seen.add(k); push(x, y, z); } };
  perm3(0, 1, 3 * PHI, (a, b, c) => signs(a, b, c, add));
  perm3(1, 2 + PHI, 2 * PHI, (a, b, c) => signs(a, b, c, add));
  perm3(PHI, 2, 2 * PHI + 1, (a, b, c) => signs(a, b, c, add));
  const s = 1.42 / 2; // 辺長2 → C–C 1.42Å
  return { name: "フラーレン C₆₀", atoms: pts.map(([x, y, z]) => ["C", x * s, y * s, z * s]), bondLen: 1.6 };
}

const MOLECULES = [water(), methane(), benzene(), caffeineLike(), fullerene()];

// ---------- 結合の自動検出 ----------
function bondsOf(m) {
  const out = [];
  for (let i = 0; i < m.atoms.length; i++) for (let j = i + 1; j < m.atoms.length; j++) {
    const a = m.atoms[i], b = m.atoms[j];
    const d = Math.hypot(a[1] - b[1], a[2] - b[2], a[3] - b[3]);
    if (d < m.bondLen && !(a[0] === "H" && b[0] === "H")) out.push([i, j]);
  }
  return out;
}
const MAX_ATOMS = Math.max(...MOLECULES.map((m) => m.atoms.length));
const MAX_BONDS = Math.max(...MOLECULES.map((m) => bondsOf(m).length));

// ---------- シーン ----------
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0e1430, 0.045);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 2.2, 11);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.06; controls.enablePan = false;
controls.minDistance = 4; controls.maxDistance = 22;

scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x1a1633, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0x3ee0d8, 1.4); rim.position.set(-6, -2, -4); scene.add(rim);

// 背景: 解析的グラデーション球（テクスチャ不要）
const bgGeo = new THREE.SphereGeometry(60, 24, 16);
const bgMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { top: { value: new THREE.Color(0x1e2a6a) }, bottom: { value: new THREE.Color(0x0a0d22) } },
  vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 top,bottom; varying vec3 vP; void main(){ float t = smoothstep(-60.0, 60.0, vP.y); gl_FragColor = vec4(mix(bottom, top, t), 1.0); }`,
});
scene.add(new THREE.Mesh(bgGeo, bgMat));

// 原子: 1つの InstancedMesh
const atomGeo = new THREE.IcosahedronGeometry(1, 3);
const atomMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 });
const atoms = new THREE.InstancedMesh(atomGeo, atomMat, MAX_ATOMS);
atoms.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(atoms);

// 結合: 1つの InstancedMesh（Y軸方向の円柱を lookAt で向ける）
const bondGeo = new THREE.CylinderGeometry(0.11, 0.11, 1, 10, 1, true);
const bondMat = new THREE.MeshStandardMaterial({ color: 0xbfc4d8, roughness: 0.5, metalness: 0.2 });
const bonds = new THREE.InstancedMesh(bondGeo, bondMat, MAX_BONDS);
bonds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(bonds);

// 電子雲っぽいハロ: 加算合成の点群（原子数分）
const haloGeo = new THREE.BufferGeometry();
haloGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_ATOMS * 3), 3));
const haloMat = new THREE.PointsMaterial({ color: 0x3ee0d8, size: 0.9, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
const halo = new THREE.Points(haloGeo, haloMat);
scene.add(halo);

// ---------- 状態: 現在の分子 → 次の分子へモーフ ----------
const cur = { pos: new Float32Array(MAX_ATOMS * 3), rad: new Float32Array(MAX_ATOMS), col: [], bonds: [] };
const nxt = { pos: new Float32Array(MAX_ATOMS * 3), rad: new Float32Array(MAX_ATOMS), col: [], bonds: [] };
let morphT = 1, morphFrom = null;

function fill(state, m) {
  const c = m.atoms.map((a) => new THREE.Color(CPK[a[0]]));
  const center = new THREE.Vector3();
  for (const a of m.atoms) center.add(new THREE.Vector3(a[1], a[2], a[3]));
  center.divideScalar(m.atoms.length);
  for (let i = 0; i < MAX_ATOMS; i++) {
    const a = m.atoms[i];
    if (a) { state.pos.set([a[1] - center.x, a[2] - center.y, a[3] - center.z], i * 3); state.rad[i] = RADIUS[a[0]]; state.col[i] = c[i]; }
    else { // 余剰インスタンスは中心に縮退（ランダム散布から集まる演出用に方向だけ持つ）
      const t = i * 2.399; state.pos.set([Math.cos(t) * 6, Math.sin(t * 1.3) * 4, Math.sin(t) * 6], i * 3); state.rad[i] = 0; state.col[i] = new THREE.Color(0x3ee0d8);
    }
  }
  state.bonds = bondsOf(m);
}

const tmpM = new THREE.Matrix4(), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();
const A = new THREE.Vector3(), B = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), DIR = new THREE.Vector3();
const easeOutBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function apply(t) {
  const e = easeOutBack(Math.min(1, t));
  const from = morphFrom ?? nxt;
  const haloPos = haloGeo.attributes.position.array;
  for (let i = 0; i < MAX_ATOMS; i++) {
    const x = from.pos[i * 3] + (nxt.pos[i * 3] - from.pos[i * 3]) * e;
    const y = from.pos[i * 3 + 1] + (nxt.pos[i * 3 + 1] - from.pos[i * 3 + 1]) * e;
    const z = from.pos[i * 3 + 2] + (nxt.pos[i * 3 + 2] - from.pos[i * 3 + 2]) * e;
    const r = from.rad[i] + (nxt.rad[i] - from.rad[i]) * Math.min(1, t * 1.2);
    tmpM.compose(tmpP.set(x, y, z), tmpQ.identity(), tmpS.setScalar(Math.max(r, 0.0001)));
    atoms.setMatrixAt(i, tmpM);
    const c = from.col[i].clone().lerp(nxt.col[i], e);
    atoms.setColorAt(i, c);
    haloPos[i * 3] = x; haloPos[i * 3 + 1] = y; haloPos[i * 3 + 2] = z;
  }
  atoms.instanceMatrix.needsUpdate = true; atoms.instanceColor.needsUpdate = true;
  haloGeo.attributes.position.needsUpdate = true;
  haloGeo.setDrawRange(0, nxt.rad.filter((r) => r > 0).length);

  // 結合は「次の分子」の結合を、位置は補間後の原子位置で
  const bl = nxt.bonds;
  for (let k = 0; k < MAX_BONDS; k++) {
    const b = bl[k];
    if (!b || t < 0.35) { tmpM.makeScale(0.0001, 0.0001, 0.0001); bonds.setMatrixAt(k, tmpM); continue; }
    A.fromArray(atoms.instanceMatrix.array, b[0] * 16 + 12);
    B.fromArray(atoms.instanceMatrix.array, b[1] * 16 + 12);
    DIR.subVectors(B, A); const len = DIR.length() * Math.min(1, (t - 0.35) / 0.4);
    tmpQ.setFromUnitVectors(UP, DIR.normalize());
    tmpM.compose(tmpP.copy(A).addScaledVector(DIR, len / 2), tmpQ, tmpS.set(1, len, 1));
    bonds.setMatrixAt(k, tmpM);
  }
  bonds.instanceMatrix.needsUpdate = true;
}

function goTo(index) {
  morphFrom = { pos: cur.pos.slice(), rad: cur.rad.slice(), col: cur.col.map((c) => c.clone()), bonds: cur.bonds };
  fill(nxt, MOLECULES[index]);
  morphT = 0;
  document.getElementById("name").textContent = MOLECULES[index].name;
  document.getElementById("stats").textContent = `${MOLECULES[index].atoms.length} atoms · ${bondsOf(MOLECULES[index]).length} bonds · draw calls: 4`;
  document.querySelectorAll("[data-mol]").forEach((b) => b.classList.toggle("on", Number(b.dataset.mol) === index));
}

// 初期状態: 散らばった状態から水へ集まる
fill(cur, { name: "", atoms: [], bondLen: 0 });
for (let i = 0; i < MAX_ATOMS; i++) cur.col[i] = new THREE.Color(0x3ee0d8);
fill(nxt, MOLECULES[0]);
morphFrom = { pos: cur.pos.slice(), rad: cur.rad.slice(), col: cur.col.map((c) => c.clone()), bonds: [] };
document.getElementById("name").textContent = MOLECULES[0].name;
document.getElementById("stats").textContent = `${MOLECULES[0].atoms.length} atoms · ${bondsOf(MOLECULES[0]).length} bonds · draw calls: 4`;
document.querySelector('[data-mol="0"]').classList.add("on");

document.querySelectorAll("[data-mol]").forEach((b) => b.addEventListener("click", () => goTo(Number(b.dataset.mol))));

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  resize();
  if (morphT < 1) { morphT = Math.min(1, morphT + dt / 1.4); apply(morphT); if (morphT >= 1) { cur.pos.set(nxt.pos); cur.rad.set(nxt.rad); cur.col = nxt.col.map((c) => c.clone()); cur.bonds = nxt.bonds; morphFrom = null; } }
  atoms.rotation.y += dt * 0.25; bonds.rotation.y = atoms.rotation.y; halo.rotation.y = atoms.rotation.y;
  haloMat.size = 0.8 + Math.sin(now / 600) * 0.15;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
apply(0);
requestAnimationFrame(frame);
