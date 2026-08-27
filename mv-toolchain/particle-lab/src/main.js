// Particle Lab — three.js 粒子アニメーション
// 全粒子を1つの THREE.Points（1ドローコール）で描画。位置・色・揺らぎは
// 頂点シェーダーで時間から計算するので、CPUは毎フレーム何も更新しない。
import * as THREE from "three";

const COUNT = 42000;

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x0b1230, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 14);

// ---- 背景グラデーション（解析的・テクスチャ不要） ----
const bg = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.999, 1.0); }`,
    fragmentShader: `
      uniform float uTime;
      void main(){
        vec2 uv = gl_FragCoord.xy / vec2(${1}.0);
        float y = gl_FragCoord.y;
        vec3 top = vec3(0.09, 0.13, 0.36);
        vec3 bottom = vec3(0.03, 0.05, 0.14);
        // 画面高さは不明なので座標をゆるく正規化
        float t = clamp(y / 1200.0, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottom, top, t), 1.0);
      }`,
  }),
);
bg.frustumCulled = false;
scene.add(bg);

// ---- 粒子属性（決定論的シード） ----
const seed = new Float32Array(COUNT * 4); // angle, radiusOffset, height, random
let s = 1234567;
const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let i = 0; i < COUNT; i++) {
  const g1 = rnd(), g2 = rnd();
  // ガウス近似で帯の内側に密度を寄せる
  const gauss = Math.sqrt(-2 * Math.log(Math.max(1e-6, g1))) * Math.cos(6.2831853 * g2);
  seed[i * 4 + 0] = rnd() * Math.PI * 2;       // angle
  seed[i * 4 + 1] = gauss * 0.55;               // radial offset
  seed[i * 4 + 2] = (rnd() - 0.5) * 2;          // height / spread
  seed[i * 4 + 3] = rnd();                      // random
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3)); // ダミー
geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);

const uniforms = {
  uTime: { value: 0 },
  uShape: { value: 0 },      // 0 ring, 1 galaxy, 2 shell
  uShapeFrom: { value: 0 },
  uMix: { value: 1 },
  uBurst: { value: 0 },      // 0..1 バーストの強さ
  uPointScale: { value: 1 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uHue: { value: 0 },
};

const mat = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec4 aSeed;
    uniform float uTime, uShape, uShapeFrom, uMix, uBurst, uPointScale, uHue;
    uniform vec2 uMouse;
    varying vec3 vColor;
    varying float vFade;

    // 角度→グラデーション（黄 → 珊瑚 → マゼンタ → 紫 → 青 → 水色）
    vec3 palette(float t){
      t = fract(t);
      vec3 c0 = vec3(0.95, 0.85, 0.45);
      vec3 c1 = vec3(0.98, 0.45, 0.55);
      vec3 c2 = vec3(0.85, 0.22, 0.75);
      vec3 c3 = vec3(0.55, 0.30, 0.95);
      vec3 c4 = vec3(0.30, 0.55, 1.00);
      vec3 c5 = vec3(0.45, 0.90, 0.95);
      float k = t * 6.0;
      vec3 c = mix(c0, c1, clamp(k, 0.0, 1.0));
      c = mix(c, c2, clamp(k - 1.0, 0.0, 1.0));
      c = mix(c, c3, clamp(k - 2.0, 0.0, 1.0));
      c = mix(c, c4, clamp(k - 3.0, 0.0, 1.0));
      c = mix(c, c5, clamp(k - 4.0, 0.0, 1.0));
      c = mix(c, c0, clamp(k - 5.0, 0.0, 1.0));
      return c;
    }

    vec3 shapePos(float which, float ang, float ro, float h, float r4, float t){
      if (which < 0.5) {
        // RING: 傾いた帯。角度方向にゆっくり流れ、帯の厚みは h と ro
        float a = ang + t * 0.12;
        float radius = 5.2 + ro * 0.9 + sin(a * 3.0 + t) * 0.15;
        vec3 p = vec3(cos(a) * radius, sin(a) * radius, h * 0.6 + ro * 0.4);
        // 画面上で楕円に見えるよう傾ける
        float tilt = 0.55;
        p = vec3(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
        return p;
      } else if (which < 1.5) {
        // GALAXY: 3本腕の対数螺旋
        float arm = floor(r4 * 3.0);
        float base = ang * 0.35 + arm * 2.0944;
        float rr = 0.8 + fract(ang / 6.2831853) * 6.0;
        float a = base + log(rr) * 2.2 + t * (0.25 / (0.4 + rr * 0.15));
        vec3 p = vec3(cos(a) * rr, sin(a) * rr, h * 0.18 * (1.0 + ro));
        p.xy += vec2(ro, h) * 0.25;
        float tilt = 0.9;
        p = vec3(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
        return p;
      } else {
        // SHELL: 球殻（フィボナッチ的に均一）
        float y = h;
        float rad = sqrt(max(0.0, 1.0 - y * y));
        float a = ang + t * 0.18 + r4 * 0.3;
        float R = 4.6 + ro * 0.35;
        return vec3(cos(a) * rad, y, sin(a) * rad) * R;
      }
    }

    void main(){
      float ang = aSeed.x, ro = aSeed.y, h = aSeed.z, r4 = aSeed.w;
      float t = uTime;
      vec3 pA = shapePos(uShapeFrom, ang, ro, h, r4, t);
      vec3 pB = shapePos(uShape, ang, ro, h, r4, t);
      // イージング付き補間 + 粒子ごとの遅延
      float m = clamp((uMix - r4 * 0.25) / 0.75, 0.0, 1.0);
      m = m * m * (3.0 - 2.0 * m);
      vec3 p = mix(pA, pB, m);

      // 微細な揺らぎ（GPU側で完結）
      p += vec3(sin(t * 1.3 + r4 * 40.0), cos(t * 1.1 + ro * 30.0), sin(t * 0.9 + h * 20.0)) * 0.06;

      // バースト: 中心から外へ吹き飛び、戻る
      float b = uBurst;
      p += normalize(p + vec3(0.0001)) * b * (2.5 + r4 * 6.0);

      // マウスでわずかに視差
      p.xy += uMouse * 0.35 * (0.5 + r4);

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float size = (0.45 + r4 * 1.7) * uPointScale;
      gl_PointSize = size * (300.0 / -mv.z);
      vColor = palette(ang / 6.2831853 + uHue + t * 0.02);
      vFade = (0.18 + 0.5 * (1.0 - abs(ro) / 1.6)) * 0.55;
    }`,
  fragmentShader: `
    varying vec3 vColor;
    varying float vFade;
    void main(){
      vec2 d = gl_PointCoord - 0.5;
      float r2 = dot(d, d);
      if (r2 > 0.25) discard;
      float a = smoothstep(0.25, 0.0, r2) * vFade;
      gl_FragColor = vec4(vColor * a * 0.9, a);
    }`,
});
const points = new THREE.Points(geo, mat);
points.frustumCulled = false;
scene.add(points);

// ---- 操作 ----
const state = { shape: 0, burstAt: -10 };
const label = { 0: "リング", 1: "ギャラクシー", 2: "シェル" };
function setShape(i) {
  if (i === state.shape) return;
  uniforms.uShapeFrom.value = state.shape;
  uniforms.uShape.value = i;
  uniforms.uMix.value = 0;
  state.shape = i;
  document.querySelectorAll("[data-shape]").forEach((b) => b.classList.toggle("on", Number(b.dataset.shape) === i));
  document.getElementById("shape-name").textContent = label[i];
}
document.querySelectorAll("[data-shape]").forEach((b) => b.addEventListener("click", () => setShape(Number(b.dataset.shape))));
document.getElementById("burst").addEventListener("click", () => { state.burstAt = clock.getElapsed(); });
document.getElementById("hue").addEventListener("input", (e) => { uniforms.uHue.value = Number(e.target.value); });
document.getElementById("size").addEventListener("input", (e) => { uniforms.uPointScale.value = Number(e.target.value); });
document.getElementById("count").textContent = COUNT.toLocaleString();

const mouseTarget = new THREE.Vector2();
addEventListener("pointermove", (e) => {
  mouseTarget.set((e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2);
});

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, pr = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(h * pr)) {
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
}

const clock = new THREE.Timer();
function frame() {
  clock.update(); const t = clock.getElapsed();
  resize();
  uniforms.uTime.value = t;
  uniforms.uMix.value = Math.min(1, uniforms.uMix.value + 0.012);
  uniforms.uMouse.value.lerp(mouseTarget, 0.05);
  // バースト: 0.9秒で膨張 → 1.6秒かけて戻る
  const dt = t - state.burstAt;
  let b = 0;
  if (dt >= 0 && dt < 2.5) {
    b = dt < 0.9 ? Math.sin((dt / 0.9) * Math.PI * 0.5) : Math.max(0, 1 - (dt - 0.9) / 1.6);
    b = dt < 0.9 ? b : b * b;
  }
  uniforms.uBurst.value = b;
  camera.position.x = Math.sin(t * 0.1) * 0.4;
  camera.position.y = Math.cos(t * 0.13) * 0.3;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
