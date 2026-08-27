// Emerald Sea — 原神風の海シェーダー（three.js / GLSL、全て自作コード）
// 構成: 空ドーム + 島（トゥーン地形） → シーンRT(色+深度) → 水面（深度差/Gerstner/泡/スペキュラ/屈折）
import * as THREE from 'three';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, 1, 0.5, 1500);
const NEAR = camera.near, FAR = camera.far;

// ---------------- 共通GLSL ----------------
const GLSL_NOISE = /* glsl */`
  float hash21(vec2 p) { p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
  // Worley（コースティクス用）
  float worley(vec2 p) {
    vec2 i = floor(p), f = fract(p); float d = 1.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash21(i + g), hash21(i + g + 7.3));
      d = min(d, length(g + o - f));
    }
    return d;
  }
`;
const GLSL_SKY = /* glsl */`
  uniform vec3 uSunDir; uniform float uSun;
  vec3 skyColor(vec3 d) {
    float y = clamp(d.y, -0.2, 1.0);
    vec3 zenith = vec3(0.14, 0.42, 0.92), horizon = vec3(0.62, 0.84, 1.0), low = vec3(0.5, 0.75, 0.95);
    vec3 c = mix(horizon, zenith, pow(max(y, 0.0), 0.55));
    c = mix(low, c, smoothstep(-0.2, 0.05, y));
    float s = max(dot(d, uSunDir), 0.0);
    c += vec3(1.0, 0.95, 0.8) * (pow(s, 600.0) * 3.0 + pow(s, 12.0) * 0.18) * uSun;
    return c;
  }
`;

// ---------------- 空 ----------------
const sunDir = new THREE.Vector3(0.45, 0.62, -0.64).normalize();
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uSunDir: { value: sunDir }, uSun: { value: 0.9 }, uTime: { value: 0 } },
  vertexShader: /* glsl */`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
  fragmentShader: /* glsl */`
    ${GLSL_NOISE}${GLSL_SKY}
    uniform float uTime; varying vec3 vDir;
    void main(){
      vec3 d = normalize(vDir);
      vec3 c = skyColor(d);
      // トゥーン雲（2段階の帯）
      if (d.y > 0.02) {
        vec2 p = d.xz / (d.y + 0.15) * 2.2 + vec2(uTime * 0.01, 0.0);
        float n = fbm(p) * 0.75 + fbm(p * 3.1 + 5.0) * 0.25;
        float cov = smoothstep(0.02, 0.35, d.y);
        float cloud = smoothstep(0.56, 0.6, n) * cov;
        float shade = smoothstep(0.62, 0.7, n);
        c = mix(c, mix(vec3(0.86, 0.92, 1.0), vec3(1.0), shade), cloud);
      }
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 48, 32), skyMat));

// ---------------- 地形（島） ----------------
function fbmJS(x, z) {
  const h = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  let a = 0.5, sum = 0, fx = x, fz = z;
  for (let o = 0; o < 5; o++) {
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const n = (h(i, j) * (1 - su) + h(i + 1, j) * su) * (1 - sv) + (h(i, j + 1) * (1 - su) + h(i + 1, j + 1) * su) * sv;
    sum += a * n; fx = fx * 2.05 + 13.1; fz = fz * 2.05 + 7.7; a *= 0.5;
  }
  return sum;
}
function islandHeight(x, z) {
  const d1 = Math.hypot(x - 10, z + 8) / 48, d2 = Math.hypot(x + 62, z - 40) / 22, d3 = Math.hypot(x - 70, z - 55) / 14;
  const m = Math.max(1 - Math.pow(Math.min(d1, 1), 1.6), (1 - Math.pow(Math.min(d2, 1), 1.4)) * 0.6, (1 - Math.pow(Math.min(d3, 1), 1.4)) * 0.35);
  const n = fbmJS(x * 0.035, z * 0.035);
  const off = Math.min(d1, d2 * 1.3, d3 * 1.6);  // 島からの距離 → 沖は深く落ちる
  const shelf = -5 - 30 * Math.min(1, Math.max(0, (off - 1.05) / 1.4)) ** 1.5;
  return m * 16 + n * 7 + shelf;  // 海面 y=0、岸は遠浅、沖は -35 まで
}
const terrainGeo = new THREE.PlaneGeometry(320, 320, 200, 200);
terrainGeo.rotateX(-Math.PI / 2);
{
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, islandHeight(pos.getX(i), pos.getZ(i)));
  terrainGeo.computeVertexNormals();
}
const terrainMat = new THREE.ShaderMaterial({
  uniforms: { uSunDir: { value: sunDir }, uSun: { value: 0.9 } },
  vertexShader: /* glsl */`varying vec3 vN; varying vec3 vP; void main(){ vN = normal; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    ${GLSL_NOISE}
    uniform vec3 uSunDir; uniform float uSun; varying vec3 vN; varying vec3 vP;
    void main(){
      vec3 n = normalize(vN);
      float h = vP.y;
      vec3 sandDeep = vec3(0.62, 0.72, 0.62), sand = vec3(0.93, 0.86, 0.66), wet = vec3(0.72, 0.64, 0.46), grass = vec3(0.36, 0.68, 0.30), grassDk = vec3(0.22, 0.48, 0.24), rock = vec3(0.45, 0.45, 0.42);
      vec3 c = mix(sandDeep, sand, smoothstep(-8.0, -0.5, h));
      c = mix(wet, c, smoothstep(0.0, 1.2, h));
      float g = smoothstep(1.8, 3.2, h + vnoise(vP.xz * 0.3) * 1.2);
      vec3 gr = mix(grassDk, grass, smoothstep(0.35, 0.65, vnoise(vP.xz * 0.12)));
      c = mix(c, gr, g);
      c = mix(c, rock, smoothstep(0.55, 0.8, 1.0 - n.y) * step(1.5, h));
      float nl = dot(n, uSunDir);
      float toon = 0.55 + 0.25 * smoothstep(0.15, 0.2, nl) + 0.2 * smoothstep(0.55, 0.6, nl);
      c *= toon * (0.6 + 0.4 * uSun);
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});
const terrain = new THREE.Mesh(terrainGeo, terrainMat);
scene.add(terrain);

// ---------------- シーンRT（色 + 深度） ----------------
const sceneRT = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType) });
sceneRT.depthTexture.format = THREE.DepthFormat;

// ---------------- 水面 ----------------
const waterGeo = new THREE.PlaneGeometry(600, 600, 300, 300);
waterGeo.rotateX(-Math.PI / 2);
const waterUniforms = {
  uTime: { value: 0 }, uSunDir: { value: sunDir }, uSun: { value: 0.9 },
  tScene: { value: sceneRT.texture }, tDepth: { value: sceneRT.depthTexture },
  uRes: { value: new THREE.Vector2(1, 1) }, uNear: { value: NEAR }, uFar: { value: FAR },
  uWave: { value: 1.0 }, uFoamDist: { value: 3.5 }, uClarity: { value: 0.22 }, uCaustics: { value: 1.0 }, uDebug: { value: 0.0 },
  uCamPos: { value: camera.position },
};
const waterMat = new THREE.ShaderMaterial({
  uniforms: waterUniforms, transparent: true, depthWrite: false,
  vertexShader: /* glsl */`
    uniform float uTime; uniform float uWave;
    varying vec3 vWorld; varying vec3 vNormal; varying float vCrest; varying vec4 vClip;
    // Gerstner 波: 方向・急峻さ・波長 → 変位と接線の和
    vec3 gerstner(vec2 dir, float steep, float wl, vec3 p, inout vec3 T, inout vec3 B) {
      float k = 6.28318 / wl; float c = sqrt(9.8 / k); vec2 d = normalize(dir);
      float f = k * (dot(d, p.xz) - c * uTime); float a = steep / k;
      float s = sin(f), co = cos(f);
      T += vec3(-d.x * d.x * steep * s, d.x * steep * co, -d.x * d.y * steep * s);
      B += vec3(-d.x * d.y * steep * s, d.y * steep * co, -d.y * d.y * steep * s);
      return vec3(d.x * a * co, a * s, d.y * a * co);
    }
    void main(){
      vec3 p = position; vec3 T = vec3(1, 0, 0), B = vec3(0, 0, 1);
      float w = uWave;
      vec3 disp = vec3(0.0);
      disp += gerstner(vec2(1.0, 0.6), 0.16 * w, 26.0, p, T, B);
      disp += gerstner(vec2(-0.7, 1.0), 0.14 * w, 17.0, p, T, B);
      disp += gerstner(vec2(0.3, -1.0), 0.12 * w, 9.5, p, T, B);
      disp += gerstner(vec2(1.0, 0.1), 0.10 * w, 5.0, p, T, B);
      p += disp;
      vNormal = normalize(cross(B, T));
      // 山（変位が正で接線が縮む所）を泡の候補に
      vCrest = clamp(disp.y / (1.3 * max(w, 0.05)), 0.0, 1.0);
      vWorld = p;
      vClip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      gl_Position = vClip;
    }`,
  fragmentShader: /* glsl */`
    ${GLSL_NOISE}${GLSL_SKY}
    uniform float uTime; uniform sampler2D tScene; uniform sampler2D tDepth; uniform vec2 uRes;
    uniform float uNear, uFar, uFoamDist, uClarity, uCaustics, uDebug, uWave; uniform vec3 uCamPos;
    varying vec3 vWorld; varying vec3 vNormal; varying float vCrest; varying vec4 vClip;
    float linearZ(float d) { return uNear * uFar / (uFar - d * (uFar - uNear)); }
    void main(){
      vec2 suv = vClip.xy / vClip.w * 0.5 + 0.5;
      vec3 V = normalize(uCamPos - vWorld);
      // --- 細波の法線（手続きノイズの勾配） ---
      vec2 q1 = vWorld.xz * 0.35 + vec2(uTime * 0.25, uTime * 0.12);
      vec2 q2 = vWorld.xz * 0.9 - vec2(uTime * 0.18, -uTime * 0.3);
      float e = 0.08;
      float nx = (vnoise(q1 + vec2(e, 0)) - vnoise(q1 - vec2(e, 0))) + 0.5 * (vnoise(q2 + vec2(e, 0)) - vnoise(q2 - vec2(e, 0)));
      float nz = (vnoise(q1 + vec2(0, e)) - vnoise(q1 - vec2(0, e))) + 0.5 * (vnoise(q2 + vec2(0, e)) - vnoise(q2 - vec2(0, e)));
      vec3 N = normalize(vNormal + vec3(nx, 0.0, nz) * 0.9);
      // --- 深度差 → 水層の厚さ ---
      float waterZ = vClip.w;  // 透視: w = 視点空間の奥行き
      float sceneZ = linearZ(texture2D(tDepth, suv).r);
      float thick = max(sceneZ - waterZ, 0.0);
      // --- 屈折（厚いほど強く歪ませ、水上の物は歪ませない） ---
      vec2 ruv = suv + N.xz * 0.045 * clamp(thick * 0.5, 0.0, 1.0);
      float sceneZ2 = linearZ(texture2D(tDepth, ruv).r);
      if (sceneZ2 < waterZ) { ruv = suv; sceneZ2 = sceneZ; }
      float thick2 = max(sceneZ2 - waterZ, 0.0);
      vec3 sceneCol = texture2D(tScene, ruv).rgb;
      // --- 吸収: エメラルド → 群青 ---
      vec3 shallow = vec3(0.20, 0.86, 0.78), mid = vec3(0.05, 0.55, 0.72), deep = vec3(0.02, 0.24, 0.62);
      float a1 = 1.0 - exp(-thick2 * uClarity), a2 = 1.0 - exp(-thick2 * uClarity * 0.28);
      vec3 waterCol = mix(mix(shallow, mid, a1), deep, a2);
      vec3 body = mix(sceneCol * vec3(0.85, 1.0, 0.95), waterCol, clamp(a1 * 1.15, 0.0, 1.0));
      // --- コースティクス（浅瀬の砂地にゆらめく光の網） ---
      vec2 cp = vWorld.xz * 0.28;
      float c1 = worley(cp + vec2(uTime * 0.12, uTime * 0.07)), c2 = worley(cp * 1.7 - vec2(uTime * 0.09, uTime * 0.11));
      float caus = pow(1.0 - min(c1, c2), 3.0) * 0.4 + pow(1.0 - c1, 6.0) * 0.4;
      body += vec3(0.75, 1.0, 0.95) * caus * (1.0 - a1) * smoothstep(0.15, 1.5, thick2) * uCaustics;
      // --- 泡: 岸（深度から）+ 波頭 ---
      float fn = fbm(vWorld.xz * 0.55 + vec2(uTime * 0.35, -uTime * 0.2));
      float shore = 1.0 - smoothstep(0.0, uFoamDist, thick);
      float band = sin(thick * 5.5 - uTime * 2.2 + fn * 3.0) * 0.5 + 0.5;  // 岸へ押し寄せる帯
      float foamShore = shore * step(0.66 - shore * 0.3, mix(band, fn, 0.5));
      foamShore = max(foamShore, step(0.0, 0.35 - thick) * step(0.35, fn));  // 水際は密に
      float foamCrest = smoothstep(0.78, 0.9, vCrest) * step(0.5, fn) * smoothstep(0.3, 1.2, uWave);
      float foam = clamp(foamShore + foamCrest, 0.0, 1.0);
      // --- ライティング ---
      vec3 H = normalize(uSunDir + V);
      float spec = pow(max(dot(N, H), 0.0), 260.0);
      float glint = smoothstep(0.25, 0.32, spec) + smoothstep(0.02, 0.05, spec) * 0.18;
      float sparkle = step(0.86, vnoise(vWorld.xz * 6.0 + uTime * 1.5)) * smoothstep(0.03, 0.08, pow(max(dot(N, H), 0.0), 40.0));
      float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
      vec3 refl = skyColor(reflect(-V, N));
      vec3 col = mix(body, refl, clamp(fres * 0.7 + 0.06, 0.0, 1.0));
      col += vec3(1.0, 0.98, 0.9) * (glint * 0.9 + sparkle * 0.8) * uSun;
      // 逆光の透過（波頭が明るく透ける）
      col += shallow * 0.25 * vCrest * max(dot(-uSunDir, V), 0.0) * (1.0 - a2);
      col = mix(col, vec3(0.97, 1.0, 1.0), foam);
      // 水際のエイリアス消し
      float alpha = smoothstep(0.0, 0.08, thick) * 0.98 + foam * 0.02;
      if (uDebug > 0.5) col = vec3(fract(thick * 0.25), smoothstep(0.0, uFoamDist, thick), foam);
      gl_FragColor = vec4(col, alpha);
      #include <colorspace_fragment>
    }`,
});
const water = new THREE.Mesh(waterGeo, waterMat);
scene.add(water);

// ---------------- カメラ操作 ----------------
let theta = 0.9, phi = 1.18, dist = 95, auto = true, dragging = false, lx = 0, ly = 0;
const target = new THREE.Vector3(8, 0, 0);
canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
addEventListener('pointerup', () => (dragging = false));
addEventListener('pointermove', (e) => {
  if (!dragging) return;
  theta -= (e.clientX - lx) * 0.005; phi = Math.min(1.5, Math.max(0.35, phi + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY;
});
canvas.addEventListener('wheel', (e) => { dist = Math.min(220, Math.max(60, dist * (1 + e.deltaY * 0.001))); }, { passive: true });

// ---------------- UI ----------------
const $ = (id) => document.getElementById(id);
$('wave').addEventListener('input', (e) => (waterUniforms.uWave.value = +e.target.value));
$('foam').addEventListener('input', (e) => (waterUniforms.uFoamDist.value = +e.target.value));
$('clarity').addEventListener('input', (e) => (waterUniforms.uClarity.value = +e.target.value));
$('sun').addEventListener('input', (e) => { const v = +e.target.value; waterUniforms.uSun.value = v; skyMat.uniforms.uSun.value = v; terrainMat.uniforms.uSun.value = v; });
$('orbit').addEventListener('click', (e) => { auto = !auto; e.target.classList.toggle('on', auto); });
$('caustics').addEventListener('click', (e) => { const on = waterUniforms.uCaustics.value < 0.5; waterUniforms.uCaustics.value = on ? 1 : 0; e.target.classList.toggle('on', on); });
$('debug').addEventListener('click', (e) => { const on = waterUniforms.uDebug.value < 0.5; waterUniforms.uDebug.value = on ? 1 : 0; e.target.classList.toggle('on', on); });

// ---------------- リサイズ / ループ ----------------
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const pr = renderer.getPixelRatio();
  sceneRT.setSize(Math.floor(w * pr), Math.floor(h * pr));
  waterUniforms.uRes.value.set(w * pr, h * pr);
}
addEventListener('resize', resize); resize();

const timer = new THREE.Timer();
let t = 0;
renderer.setAnimationLoop(() => {
  timer.update(); const dt = Math.min(timer.getDelta(), 0.05); t += dt;
  if (auto && !dragging) theta += dt * 0.06;
  camera.position.set(target.x + dist * Math.sin(phi) * Math.cos(theta), target.y + dist * Math.cos(phi), target.z + dist * Math.sin(phi) * Math.sin(theta));
  camera.lookAt(target);
  waterUniforms.uTime.value = t; skyMat.uniforms.uTime.value = t;
  // 1) 水面を隠してシーンRTへ（色 + 深度）
  water.visible = false;
  renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
  // 2) 本描画
  water.visible = true;
  renderer.setRenderTarget(null); renderer.render(scene, camera);
});
