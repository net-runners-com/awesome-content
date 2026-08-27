// Toon Lab — セルシェーディング3アプローチ（three.js）
// ① MeshToonMaterial + gradientMap（組み込み） ② 自前ShaderMaterial（量子化拡散/ハードスペキュラ/リム）
// ③ 輪郭: インバーテッドハル（BackSide + 法線押し出し） / 深度+法線バッファのポストプロセス・エッジ検出
import * as THREE from 'three';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1c1830');
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 100);
camera.position.set(0, 4.2, 13);
camera.lookAt(0, 1.2, 0);

// ---------- ライト ----------
const lightDir = new THREE.Vector3();
const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
scene.add(dirLight, new THREE.AmbientLight(0x8a80c0, 0.6));
function setLight(a) { lightDir.set(Math.cos(a), 0.9, Math.sin(a)).normalize(); dirLight.position.copy(lightDir).multiplyScalar(10); }

// ---------- ① gradientMap（3〜8階調をDataTextureで生成） ----------
function gradientMap(steps) {
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) { const v = Math.round((0.25 + 0.75 * i / (steps - 1)) * 255); data.set([v, v, v, 255], i * 4); }
  const t = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}

// ---------- ② 自前トゥーンシェーダー ----------
const toonUniforms = {
  uLightDir: { value: lightDir }, uSteps: { value: 3 }, uRimPow: { value: 3 }, uRimAmt: { value: 0.55 }, uSpecCut: { value: 0.9 },
  uShadowTint: { value: new THREE.Color('#5a4a9a') },
};
function toonMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { ...toonUniforms, uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uLightDir, uColor, uShadowTint; uniform float uSteps, uRimPow, uRimAmt, uSpecCut;
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 N = normalize(vN), V = normalize(vV);
        vec3 L = normalize((viewMatrix * vec4(uLightDir, 0.0)).xyz);
        float nl = max(dot(N, L), 0.0);
        // 量子化した拡散光: ceil(i * steps) / steps
        float band = ceil(nl * uSteps) / uSteps;
        band = mix(0.35, 1.0, band);
        vec3 base = uColor * band;
        // 影側は補色寄りに転がす（アニメの影色）
        base = mix(uColor * uShadowTint, base, smoothstep(0.0, 0.05, nl));
        // ハードなスペキュラ（カットオフ1本）
        vec3 H = normalize(L + V);
        float spec = step(uSpecCut, pow(max(dot(N, H), 0.0), 1.0));
        // リムライト: (1 - max(N·V,0))^e、光の当たる側だけ
        float rim = pow(1.0 - max(dot(N, V), 0.0), uRimPow) * smoothstep(0.0, 0.4, nl + 0.2);
        rim = step(0.5, rim) * uRimAmt;
        vec3 col = base + vec3(1.0, 0.97, 0.9) * spec * 0.9 + vec3(1.0, 0.95, 0.85) * rim;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

// ---------- ③a インバーテッドハル ----------
const hullUniforms = { uWidth: { value: 0.06 } };
const hullMat = new THREE.ShaderMaterial({
  uniforms: hullUniforms, side: THREE.BackSide,
  vertexShader: /* glsl */`uniform float uWidth; void main(){ vec3 p = position + normal * uWidth; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
  fragmentShader: /* glsl */`void main(){ gl_FragColor = vec4(0.08, 0.06, 0.12, 1.0); }`,
});

// ---------- シーン ----------
const PAL = ['#ff7a59', '#ffd23f', '#3ec1d3', '#f6f7d7', '#a0e7a0', '#c77dff'];
const items = [];
function add(geo, color, x, y, z) {
  const m = new THREE.Mesh(geo, toonMaterial(color)); m.position.set(x, y, z);
  const hull = new THREE.Mesh(geo, hullMat); m.add(hull);
  const builtin = new THREE.MeshToonMaterial({ color, gradientMap: gradientMap(3) });
  scene.add(m); items.push({ mesh: m, hull, custom: m.material, builtin, color });
  return m;
}
add(new THREE.TorusKnotGeometry(1.1, 0.38, 180, 24), PAL[0], -3.6, 1.7, 0);
add(new THREE.SphereGeometry(1.2, 48, 32), PAL[1], 0, 1.3, 0.4);
add(new THREE.IcosahedronGeometry(1.3, 0), PAL[2], 3.6, 1.5, 0);
// 簡易キャラ（カプセル + 頭）
const body = add(new THREE.CapsuleGeometry(0.6, 1.2, 8, 24), PAL[5], 0, 1.4, -3.2);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), toonMaterial(PAL[3])); head.position.set(0, 1.45, 0); head.add(new THREE.Mesh(head.geometry, hullMat)); body.add(head);
items.push({ mesh: head, hull: head.children[0], custom: head.material, builtin: new THREE.MeshToonMaterial({ color: PAL[3], gradientMap: gradientMap(3) }), color: PAL[3] });
add(new THREE.TorusGeometry(0.9, 0.3, 24, 64), PAL[4], -3.2, 1.0, -3.4).rotation.x = 1.2;
add(new THREE.ConeGeometry(0.9, 2.0, 5), PAL[2], 3.3, 1.0, -3.4);
// 床
const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), toonMaterial('#3a3560')); floor.rotation.x = -Math.PI / 2; scene.add(floor);
items.push({ mesh: floor, hull: null, custom: floor.material, builtin: new THREE.MeshToonMaterial({ color: '#3a3560', gradientMap: gradientMap(3) }), color: '#3a3560' });

// ---------- ③b ポストプロセス・エッジ検出（深度 + 法線） ----------
const rtColor = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType) });
const rtNormal = new THREE.WebGLRenderTarget(1, 1);
const normalMat = new THREE.MeshNormalMaterial();
const edgeUniforms = {
  tColor: { value: rtColor.texture }, tDepth: { value: rtColor.depthTexture }, tNormal: { value: rtNormal.texture },
  uRes: { value: new THREE.Vector2(1, 1) }, uNear: { value: camera.near }, uFar: { value: camera.far }, uWidth: { value: 1.2 },
  uDepthT: { value: 0.02 }, uNormalT: { value: 0.35 },
};
const edgeScene = new THREE.Scene();
const edgeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
edgeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: edgeUniforms,
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tColor, tDepth, tNormal; uniform vec2 uRes; uniform float uNear, uFar, uWidth, uDepthT, uNormalT;
    varying vec2 vUv;
    float linZ(vec2 uv) { float d = texture2D(tDepth, uv).r; return uNear * uFar / (uFar - d * (uFar - uNear)); }
    void main(){
      vec2 px = uWidth / uRes;
      // Roberts cross（対角2組）で深度と法線の差分を取る
      vec2 o[4]; o[0] = vec2(-1.0, -1.0); o[1] = vec2(1.0, 1.0); o[2] = vec2(-1.0, 1.0); o[3] = vec2(1.0, -1.0);
      float d0 = linZ(vUv + o[0] * px), d1 = linZ(vUv + o[1] * px), d2 = linZ(vUv + o[2] * px), d3 = linZ(vUv + o[3] * px);
      float dEdge = sqrt(pow(d1 - d0, 2.0) + pow(d3 - d2, 2.0));
      dEdge = step(uDepthT * linZ(vUv), dEdge);  // 距離に比例した閾値（遠くで太らない）
      vec3 n0 = texture2D(tNormal, vUv + o[0] * px).rgb, n1 = texture2D(tNormal, vUv + o[1] * px).rgb, n2 = texture2D(tNormal, vUv + o[2] * px).rgb, n3 = texture2D(tNormal, vUv + o[3] * px).rgb;
      float nEdge = step(uNormalT, length(n1 - n0) + length(n3 - n2));
      float edge = max(dEdge, nEdge);
      vec3 col = texture2D(tColor, vUv).rgb;
      col = mix(col, vec3(0.08, 0.06, 0.12), edge);
      gl_FragColor = vec4(col, 1.0);
    }`,
})));

// ---------- モード管理 ----------
let mode = 'custom', outline = 'post', spin = true;
function applyMode() {
  for (const it of items) {
    it.mesh.material = mode === 'builtin' ? it.builtin : it.custom;
    if (it.hull) it.hull.visible = outline === 'hull';
  }
  document.getElementById('note').textContent = mode === 'builtin'
    ? 'MeshToonMaterial: gradientMap(NearestFilter)で階調化。輪郭は付かないので下で追加。'
    : 'ceil(i·steps)/steps の量子化拡散 + step() のハードスペキュラ + (1−N·V)^e のリム。';
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b)); mode = b.dataset.mode; applyMode();
}));
for (const k of ['none', 'hull', 'post']) document.getElementById('ol-' + k).addEventListener('click', () => {
  outline = k; for (const j of ['none', 'hull', 'post']) document.getElementById('ol-' + j).classList.toggle('on', j === k); applyMode();
});
const $ = (id) => document.getElementById(id);
$('steps').addEventListener('input', (e) => { const s = +e.target.value; toonUniforms.uSteps.value = s; for (const it of items) { it.builtin.gradientMap = gradientMap(s); it.builtin.needsUpdate = true; } });
$('rimPow').addEventListener('input', (e) => (toonUniforms.uRimPow.value = +e.target.value));
$('rimAmt').addEventListener('input', (e) => (toonUniforms.uRimAmt.value = +e.target.value));
$('specCut').addEventListener('input', (e) => (toonUniforms.uSpecCut.value = +e.target.value));
$('edgeW').addEventListener('input', (e) => { const w = +e.target.value; edgeUniforms.uWidth.value = w; hullUniforms.uWidth.value = w * 0.05; });
$('light').addEventListener('input', (e) => setLight(+e.target.value));
$('spin').addEventListener('click', (e) => { spin = !spin; e.target.classList.toggle('on', spin); });
setLight(0.8); applyMode();

// ---------- リサイズ / ループ ----------
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, pr = renderer.getPixelRatio();
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  rtColor.setSize(w * pr, h * pr); rtNormal.setSize(w * pr, h * pr); edgeUniforms.uRes.value.set(w * pr, h * pr);
}
addEventListener('resize', resize); resize();
const timer = new THREE.Timer();
renderer.setAnimationLoop(() => {
  timer.update(); const dt = timer.getDelta();
  if (spin) for (const it of items) if (it.mesh !== floor && it.mesh !== head) it.mesh.rotation.y += dt * 0.4;
  if (outline === 'post') {
    const hullVis = items.map((it) => it.hull && it.hull.visible); items.forEach((it) => it.hull && (it.hull.visible = false));
    renderer.setRenderTarget(rtColor); renderer.render(scene, camera);
    scene.overrideMaterial = normalMat; renderer.setRenderTarget(rtNormal); renderer.render(scene, camera); scene.overrideMaterial = null;
    items.forEach((it, i) => it.hull && (it.hull.visible = hullVis[i]));
    renderer.setRenderTarget(null); renderer.render(edgeScene, edgeCam);
  } else {
    renderer.setRenderTarget(null); renderer.render(scene, camera);
  }
});
