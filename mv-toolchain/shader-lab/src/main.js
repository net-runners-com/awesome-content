// Shader Lab — 雨ガラス / ディゾルブ / ポストプロセス（three.js）
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const NOISE = `
  vec3 hash3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
  float noise3(vec3 p){
    vec3 i = floor(p), f = fract(p); vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)), dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                   mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)), dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)), dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                   mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)), dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);
  }
  float fbm3(vec3 p){ float a = 0.5, s = 0.0; for(int i=0;i<5;i++){ s += a*noise3(p); p = p*2.02 + 17.3; a *= 0.5; } return s; }
`;

// =====================================================================
// 1. RAIN GLASS — フルスクリーン・フラグメントシェーダー
// =====================================================================
const rainScene = new THREE.Scene();
const rainCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const rainU = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uRain: { value: 1 }, uBlur: { value: 1 } };
rainScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: rainU,
  vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    precision highp float;
    uniform float uTime, uRain, uBlur; uniform vec2 uRes;
    vec3 N13(float p){ vec3 p3 = fract(vec3(p)*vec3(.1031,.11369,.13787)); p3 += dot(p3, p3.yzx + 19.19); return fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x)); }
    float N(float t){ return fract(sin(t*12345.564)*7658.76); }
    float Saw(float b, float t){ return smoothstep(0.0, b, t)*smoothstep(1.0, b, t); }

    // 背景: 夜の街の玉ボケ（手続き）
    vec3 background(vec2 uv, float blur){
      vec3 col = mix(vec3(0.03,0.04,0.10), vec3(0.10,0.06,0.16), uv.y);
      for (int i = 0; i < 24; i++) {
        float fi = float(i);
        vec3 h = N13(fi * 7.31);
        vec2 c = vec2(h.x * 1.6 - 0.3, h.y * 1.2 - 0.1);
        float r = 0.04 + h.z * 0.09;
        vec3 lightCol = mix(vec3(1.0, 0.75, 0.35), vec3(0.35, 0.8, 1.0), step(0.5, fract(h.x * 5.0)));
        if (fract(h.z * 3.0) > 0.66) lightCol = vec3(1.0, 0.35, 0.6);
        float d = length((uv - c) * vec2(uRes.x / uRes.y, 1.0));
        float k = 1.0 - smoothstep(r - 0.02, r + 0.06 * max(blur, 0.0) + 0.002, d);
        col += lightCol * k * (0.35 + 0.65 * h.y) * 0.9;
      }
      return col;
    }

    // 滴レイヤー（Heartfelt方式を独自実装）: 縦長セルに1滴、落下+揺れ+軌跡
    vec2 dropLayer(vec2 uv, float t){
      vec2 UV = uv;
      uv.y += t * 0.75;
      vec2 a = vec2(6.0, 1.0);
      vec2 grid = a * 2.0;
      vec2 id = floor(uv * grid);
      float colShift = N(id.x);
      uv.y += colShift;
      id = floor(uv * grid);
      vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
      vec2 st = fract(uv * grid) - vec2(0.5, 0.0);
      float x = n.x - 0.5;
      float y = UV.y * 20.0;
      float wiggle = sin(y + sin(y));
      x += wiggle * (0.5 - abs(x)) * (n.z - 0.5);
      x *= 0.7;
      float ti = fract(t + n.z);
      y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;
      vec2 p = vec2(x, y);
      float d = length((st - p) * a.yx);
      float mainDrop = smoothstep(0.28, 0.0, d);
      float r = sqrt(smoothstep(1.0, y, st.y));
      float cd = abs(st.x - x);
      float trail = smoothstep(0.23 * r, 0.15 * r * r, cd);
      float trailFront = smoothstep(-0.02, 0.02, st.y - y);
      trail *= trailFront * r * r;
      y = UV.y;
      float trail2 = smoothstep(0.2 * r, 0.0, cd);
      float droplets = max(0.0, (sin(y * (1.0 - y) * 120.0) - st.y)) * trail2 * trailFront * n.z * 0.6;
      y = fract(y * 10.0) + (st.y - 0.5);
      float dd = length(st - vec2(x, y));
      droplets = smoothstep(0.3, 0.0, dd);
      float m = mainDrop + droplets * r * trailFront;
      return vec2(m, trail);
    }
    float staticDrops(vec2 uv, float t){
      uv *= 40.0;
      vec2 id = floor(uv);
      uv = fract(uv) - 0.5;
      vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
      vec2 p = (n.xy - 0.5) * 0.7;
      float d = length(uv - p);
      float fade = Saw(0.025, fract(t + n.z));
      float c = smoothstep(0.3, 0.0, d) * fract(n.z * 10.0) * fade;
      return c;
    }
    vec2 drops(vec2 uv, float t, float l0, float l1, float l2){
      float s = staticDrops(uv, t) * l0;
      vec2 m1 = dropLayer(uv, t) * l1;
      vec2 m2 = dropLayer(uv * 1.85, t) * l2;
      float c = s + m1.x + m2.x;
      c = smoothstep(0.3, 1.0, c);
      return vec2(c, clamp(max(m1.y * l0, m2.y * l1), 0.0, 1.0));
    }
    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 UV = gl_FragCoord.xy / uRes;
      float t = uTime * 0.2;
      float rainAmount = uRain;
      float staticL = smoothstep(-0.5, 1.0, rainAmount) * 2.0;
      float l1 = smoothstep(0.25, 0.75, rainAmount);
      float l2 = smoothstep(0.0, 0.5, rainAmount);
      vec2 c = drops(uv, t, staticL, l1, l2);
      // 滴の法線 → 屈折
      vec2 e = vec2(0.001, 0.0);
      float cx = drops(uv + e, t, staticL, l1, l2).x;
      float cy = drops(uv + e.yx, t, staticL, l1, l2).x;
      vec2 n = vec2(cx - c.x, cy - c.y);
      float focus = max(0.0, mix(uBlur * 1.6, 0.0, clamp(c.y, 0.0, 1.0)));
      vec3 col = background(UV + n * 1.2, focus);
      // 滴の中は鮮明に、滴の外は曇り
      col = mix(col, background(UV, 0.0), c.x * 0.6);
      col += clamp(n.x * 1.4, -0.15, 0.35) + c.x * 0.06;
      col *= 1.0 - dot(uv, uv) * 0.9; // ビネット
      gl_FragColor = vec4(col, 1.0);
    }`,
})));

// =====================================================================
// 2. DISSOLVE — ノイズ閾値 + エッジ発光（Unity のディゾルブを GLSL で）
// =====================================================================
const disScene = new THREE.Scene();
const disCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
disCam.position.set(0, 0.6, 6);
disScene.add(new THREE.HemisphereLight(0xbfd8ff, 0x1a1633, 0.6));
const disU = { uTime: { value: 0 }, uDissolve: { value: 0.3 }, uEdge: { value: 0.08 }, uEdgeColor: { value: new THREE.Color(0xff6a1a) }, uScale: { value: 1.6 } };
const disMat = new THREE.ShaderMaterial({
  uniforms: disU, side: THREE.DoubleSide,
  vertexShader: `
    varying vec3 vN, vP, vW;
    void main(){ vN = normalize(normalMatrix * normal); vP = position; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `
    precision highp float;
    uniform float uTime, uDissolve, uEdge, uScale; uniform vec3 uEdgeColor;
    varying vec3 vN, vP, vW;
    ${NOISE}
    void main(){
      float n = fbm3(vP * uScale + vec3(0.0, uTime * 0.05, 0.0)) * 0.5 + 0.5;
      // Unity: Alpha Clip Threshold
      if (n < uDissolve) discard;
      float edge = 1.0 - smoothstep(uDissolve, uDissolve + uEdge, n);
      vec3 N = normalize(vN);
      if (!gl_FrontFacing) N = -N;
      vec3 L = normalize(vec3(0.6, 1.0, 0.8));
      float diff = max(0.0, dot(N, L)) * 0.9 + 0.25;
      vec3 V = normalize(cameraPosition - vW);
      float fres = pow(1.0 - max(0.0, dot(N, V)), 3.0);
      vec3 base = mix(vec3(0.18, 0.22, 0.34), vec3(0.62, 0.68, 0.82), diff) + fres * vec3(0.3, 0.5, 0.9) * 0.5;
      // Emission（Bloomに拾わせたいので >1.0）
      vec3 emis = uEdgeColor * edge * 4.0 + uEdgeColor * pow(edge, 4.0) * 6.0;
      gl_FragColor = vec4(base * (1.0 - edge) + emis, 1.0);
    }`,
});
const disMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.36, 220, 32), disMat);
disScene.add(disMesh);
const disBg = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
  vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec3 vP; void main(){ float t = smoothstep(-30.0, 30.0, vP.y); gl_FragColor = vec4(mix(vec3(0.03,0.04,0.09), vec3(0.10,0.12,0.24), t), 1.0); }` }));
disScene.add(disBg);

// =====================================================================
// 3. POST — Bloom + Vignette + Chromatic Aberration + Grain
// =====================================================================
const postScene = new THREE.Scene();
const postCam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
postCam.position.set(0, 1.2, 7);
postScene.add(disBg.clone());
postScene.add(new THREE.HemisphereLight(0x8fb0ff, 0x1a1633, 0.5));
const orbs = new THREE.Group();
const orbColors = [0xff4f9a, 0xffd23f, 0x3ee0d8, 0x7b2cff, 0x2b3cff, 0x58d68d];
for (let i = 0; i < 6; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 4), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: orbColors[i], emissiveIntensity: 2.4, roughness: 0.4 }));
  m.userData.i = i; orbs.add(m);
}
postScene.add(orbs);
const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.06, 16, 120), new THREE.MeshStandardMaterial({ color: 0x222233, emissive: 0x3ee0d8, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.6 }));
ringMesh.rotation.x = Math.PI / 2.4; postScene.add(ringMesh);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0f1430, roughness: 0.25, metalness: 0.7 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -1.4; postScene.add(floor);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(postScene, postCam);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0.6, 0.35);
const gradeU = { tDiffuse: { value: null }, uVignette: { value: 0.55 }, uCA: { value: 0.004 }, uGrain: { value: 0.06 }, uTime: { value: 0 } };
const grade = new ShaderPass({
  uniforms: gradeU,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uVignette, uCA, uGrain, uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      // 色収差: 画面端ほど RGB をずらす
      vec2 off = d * uCA * r2 * 40.0;
      float R = texture2D(tDiffuse, vUv + off).r;
      float G = texture2D(tDiffuse, vUv).g;
      float B = texture2D(tDiffuse, vUv - off).b;
      vec3 col = vec3(R, G, B);
      // ビネット
      col *= 1.0 - smoothstep(0.15, 0.9, r2 * 2.2) * uVignette;
      // グレイン
      col += (hash(vUv * 900.0 + uTime) - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(grade); composer.addPass(new OutputPass());

// =====================================================================
// 切替 / UI
// =====================================================================
let mode = "rain";
const panels = { rain: document.getElementById("p-rain"), dissolve: document.getElementById("p-dissolve"), post: document.getElementById("p-post") };
document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
  mode = b.dataset.mode;
  document.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("on", x === b));
  Object.entries(panels).forEach(([k, el]) => el.hidden = k !== mode);
}));
const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("input", (e) => fn(Number(e.target.value))); };
bind("rain-amount", (v) => (rainU.uRain.value = v));
bind("rain-blur", (v) => (rainU.uBlur.value = v));
let autoDissolve = true;
bind("dis-amount", (v) => { autoDissolve = false; disU.uDissolve.value = v; });
bind("dis-edge", (v) => (disU.uEdge.value = v));
document.getElementById("dis-auto").addEventListener("click", () => (autoDissolve = true));
bind("bloom-strength", (v) => (bloom.strength = v));
bind("bloom-threshold", (v) => (bloom.threshold = v));
bind("vignette", (v) => (gradeU.uVignette.value = v));
bind("ca", (v) => (gradeU.uCA.value = v));
bind("grain", (v) => (gradeU.uGrain.value = v));

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, pr = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(w * pr) || canvas.height !== Math.floor(h * pr)) {
    renderer.setSize(w, h, false); composer.setSize(w, h);
    rainU.uRes.value.set(w * pr, h * pr);
    for (const c of [disCam, postCam]) { c.aspect = w / h; c.updateProjectionMatrix(); }
  }
}

const timer = new THREE.Timer();
function frame() {
  timer.update(); const t = timer.getElapsed();
  resize();
  if (mode === "rain") {
    rainU.uTime.value = t;
    renderer.render(rainScene, rainCam);
  } else if (mode === "dissolve") {
    disU.uTime.value = t;
    if (autoDissolve) { const v = (Math.sin(t * 0.5) * 0.5 + 0.5) * 0.9; disU.uDissolve.value = v; document.getElementById("dis-amount").value = v.toFixed(2); }
    disMesh.rotation.y = t * 0.3; disMesh.rotation.x = Math.sin(t * 0.2) * 0.3;
    renderer.render(disScene, disCam);
  } else {
    gradeU.uTime.value = t;
    orbs.children.forEach((m) => { const i = m.userData.i, a = t * 0.5 + (i / 6) * Math.PI * 2; m.position.set(Math.cos(a) * 2.4, Math.sin(t * 1.3 + i) * 0.5, Math.sin(a) * 2.4); });
    ringMesh.rotation.z = t * 0.15;
    postCam.position.x = Math.sin(t * 0.2) * 1.5; postCam.lookAt(0, 0, 0);
    composer.render();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
