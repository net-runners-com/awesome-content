// Unity風のインスタンスド・グラス（three.js）— 逆光の透過光・湾曲した刃・距離フォグ・地面・ブルーベルの鐘花。
// 透明キャンバスに描き、下の2Dシーン（背景森）に重ねる。夜明けの逆光を意識。
import * as THREE from 'three';

export function initGrass(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 1.5, 7.2);
  camera.lookAt(0, 0.02, -3.5);

  const time = { value: 0 };
  const uCam = { value: camera.position };
  // 太陽は背景の左上・奥（逆光）。surface→sun 方向。
  const uSunDir = { value: new THREE.Vector3(-0.55, 0.42, -1.0).normalize() };
  const uFog = { value: new THREE.Color(0.86, 0.83, 0.74) };   // 朝もやの暖色
  const FOG_NEAR = 6.0, FOG_FAR = 26.0;

  const COMMON = `
    float hash(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
    vec3 windBend(vec3 pos, float h, vec3 wpos, float phase){
      float t = uTime;
      float w = sin(t*1.3 + phase + wpos.x*0.5 + wpos.z*0.3);
      w += 0.4*sin(t*3.0 + phase*1.7 + wpos.x*1.3);
      float gust = 0.55 + 0.45*sin(t*0.32 + wpos.x*0.12);
      float bend = (w*0.12 + 0.03) * pow(h,1.7) * gust;
      pos.x += bend; pos.z += bend*0.35;
      return pos;
    }`;

  // ================= 草の刃（先細り・前方に湾曲・7分割） =================
  const SEG = 7;
  const bp = [], bY = [], idx = [];
  for (let i = 0; i <= SEG; i++) {
    const y = i / SEG;
    const w = 0.020 * (1 - y * 0.92);
    bp.push(-w, y, 0, w, y, 0); bY.push(y, y);
  }
  for (let i = 0; i < SEG; i++) { const a = i*2, b = i*2+1, c = i*2+2, d = i*2+3; idx.push(a,b,c, c,b,d); }
  const blade = new THREE.InstancedBufferGeometry();
  blade.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
  blade.setAttribute('aY', new THREE.Float32BufferAttribute(bY, 1));
  blade.setIndex(idx);

  const N = 22000;
  const off = new Float32Array(N*3), rot = new Float32Array(N), phase = new Float32Array(N), hgt = new Float32Array(N), tint = new Float32Array(N), curv = new Float32Array(N);
  let seed = 1337; const rnd = () => (seed = (seed*1664525+1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < N; i++) {
    const z = 4.6 - Math.pow(rnd(), 0.6) * 22.0;
    off[i*3] = (rnd()-0.5)*34.0; off[i*3+1] = 0; off[i*3+2] = z;
    rot[i] = rnd()*Math.PI;
    phase[i] = rnd()*6.28;
    hgt[i] = 0.32 + rnd()*0.5 + Math.max(0,z)*0.03;
    tint[i] = rnd();
    curv[i] = (rnd()*0.5 + 0.15) * (rnd() < 0.5 ? 1 : -1);  // 前方への湾曲量
  }
  for (const [n, a, s] of [['aOff', off, 3], ['aRot', rot, 1], ['aPhase', phase, 1], ['aHgt', hgt, 1], ['aTint', tint, 1], ['aCurv', curv, 1]])
    blade.setAttribute(n, new THREE.InstancedBufferAttribute(a, s));

  const grassMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uTime: time, uCam, uSunDir, uFog: uFog, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR } },
    vertexShader: `
      attribute vec3 aOff; attribute float aRot, aPhase, aHgt, aTint, aY, aCurv;
      uniform float uTime, uFogNear, uFogFar; varying float vY, vTint, vFog; varying vec3 vN, vW;
      ${COMMON}
      void main(){
        vec3 p = position; p.y *= aHgt;
        p.z += aCurv * pow(aY, 2.0) * aHgt;                 // 前方へ湾曲
        float c = cos(aRot), s = sin(aRot);
        p = vec3(c*p.x - s*p.z, p.y, s*p.x + c*p.z);        // 向きランダム
        p = windBend(p, aY, aOff, aPhase);
        vec3 world = p + aOff;
        // 刃の法線（向きに直交、湾曲で少し上向き）
        vN = normalize(vec3(s, 0.35, -c));
        vY = aY; vTint = aTint; vW = world;
        vec4 mv = modelViewMatrix * vec4(world, 1.0);
        vFog = clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      precision highp float;
      uniform vec3 uCam, uSunDir, uFog; varying float vY, vTint, vFog; varying vec3 vN, vW;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(uCam - vW);
        // 色：根元の紫絨毯 → 深緑 → 黄緑の先端
        vec3 root = vec3(0.22,0.17,0.36), dk = vec3(0.10,0.30,0.11), lt = vec3(0.52,0.78,0.32), tipY = vec3(0.72,0.86,0.42);
        vec3 col = mix(dk, lt, smoothstep(0.1,0.75,vY));
        col = mix(col, tipY, smoothstep(0.7,1.0,vY)*0.7);
        col = mix(col, vec3(0.60,0.82,0.40), vTint*0.30);
        col = mix(root, col, smoothstep(0.0,0.26,vY));
        // 空光の拡散 + 根元AO
        float sky = 0.5 + 0.5*N.y;
        col *= mix(0.5, 1.05, vY) * (0.7 + 0.3*sky);
        // 逆光の透過光（葉を透ける夜明けの輝き）
        float back = pow(max(dot(V, -uSunDir), 0.0), 3.0);   // 太陽を見通す向き
        float edge = 0.35 + 0.65*vY;                          // 先端ほど透ける
        vec3 glow = vec3(1.0, 0.92, 0.6) * back * edge * 1.5;
        col += glow;
        // ハイライトの縁（薄い）
        float rim = pow(1.0 - abs(dot(N, V)), 3.0) * vY;
        col += vec3(1.0,0.95,0.7) * rim * 0.25 * back;
        // 距離フォグで霧に溶ける
        col = mix(col, uFog, vFog*vFog);
        float alpha = 1.0 - smoothstep(0.75, 1.0, vFog);      // 遠景は消える
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const grass = new THREE.Mesh(blade, grassMat);
  grass.frustumCulled = false; grass.renderOrder = 2;
  scene.add(grass);

  // ================= 地面（紫緑のまだら・フォグ） =================
  const groundMat = new THREE.ShaderMaterial({
    uniforms: { uCam, uFog, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR } },
    vertexShader: `uniform float uFogNear, uFogFar; varying vec3 vW; varying float vFog; void main(){ vW=position; vec4 mv=modelViewMatrix*vec4(position,1.0); vFog=clamp((-mv.z-uFogNear)/(uFogFar-uFogNear),0.,1.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `precision highp float; uniform vec3 uFog; varying vec3 vW; varying float vFog;
      float h(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){ float m=n(vW.xz*1.5)*0.6+n(vW.xz*5.0)*0.4;
        vec3 soil=vec3(0.14,0.12,0.10), moss=vec3(0.16,0.26,0.13), blu=vec3(0.30,0.24,0.55);
        vec3 col=mix(soil,moss,m); col=mix(col,blu,smoothstep(0.55,0.9,n(vW.xz*2.2)));
        col=mix(col,uFog,vFog*vFog); gl_FragColor=vec4(col,1.0); }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.02; ground.renderOrder = 0;
  scene.add(ground);

  // ================= ブルーベルの鐘花（高精細テクスチャのビルボード） =================
  const bellTex = makeBellTexture();
  const quad = new THREE.InstancedBufferGeometry();
  quad.setAttribute('position', new THREE.Float32BufferAttribute([-0.5,0,0, 0.5,0,0, -0.5,1,0, 0.5,1,0], 3));
  quad.setAttribute('uv', new THREE.Float32BufferAttribute([0,0, 1,0, 0,1, 1,1], 2));
  quad.setIndex([0,1,2, 2,1,3]);
  const M = 5000;
  const boff = new Float32Array(M*3), bph = new Float32Array(M), bsz = new Float32Array(M), bfl = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const z = 4.4 - Math.pow(rnd(), 0.6) * 20.0;
    boff[i*3] = (rnd()-0.5)*32.0; boff[i*3+1] = 0; boff[i*3+2] = z;
    bph[i] = rnd()*6.28; bsz[i] = 0.32 + rnd()*0.30 + Math.max(0,z)*0.02; bfl[i] = rnd()<0.5?-1:1;
  }
  for (const [n, a, s] of [['aOff', boff, 3], ['aPhase', bph, 1], ['aSize', bsz, 1], ['aFlip', bfl, 1]])
    quad.setAttribute(n, new THREE.InstancedBufferAttribute(a, s));
  const bellMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: true, side: THREE.DoubleSide,
    uniforms: { uTime: time, uTex: { value: bellTex }, uCam, uSunDir, uFog, uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR } },
    vertexShader: `
      attribute vec3 aOff; attribute float aPhase, aSize, aFlip; uniform float uTime, uFogNear, uFogFar;
      varying vec2 vUv; varying float vFog; varying vec3 vW;
      ${COMMON}
      void main(){
        vec3 sway = windBend(vec3(0.0, position.y, 0.0), position.y, aOff, aPhase) - vec3(0.0, position.y, 0.0);
        vec4 mv = modelViewMatrix * vec4(aOff, 1.0);
        mv.xyz += vec3(position.x*aFlip*0.62*aSize, position.y*1.15*aSize, 0.0);
        mv.x += sway.x*1.8;
        vUv = vec2(position.x*aFlip+0.5, position.y);
        vFog = clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
        vW = aOff;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      precision highp float; varying vec2 vUv; varying float vFog; varying vec3 vW;
      uniform sampler2D uTex; uniform vec3 uCam, uSunDir, uFog;
      void main(){
        vec4 t = texture2D(uTex, vUv); if(t.a < 0.35) discard;
        vec3 col = t.rgb;
        // 逆光でわずかに縁が光る
        float back = pow(max(dot(normalize(uCam - vW), -uSunDir), 0.0), 3.0);
        col += vec3(0.9,0.85,1.0) * back * vUv.y * 0.4;
        col = mix(col, uFog, vFog*vFog);
        gl_FragColor = vec4(col, t.a * (1.0 - smoothstep(0.8, 1.0, vFog)));
      }`,
  });
  const bells = new THREE.Mesh(quad, bellMat);
  bells.frustumCulled = false; bells.renderOrder = 3;
  scene.add(bells);

  // 片側に垂れる鐘花の房を高精細に描く
  function makeBellTexture() {
    const S = 256, c = document.createElement('canvas'); c.width = S; c.height = S; const g = c.getContext('2d');
    g.clearRect(0, 0, S, S);
    // アーチする茎（下から上へ、上端で右に曲がる）
    g.strokeStyle = '#4a7233'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(118, 250); g.bezierCurveTo(110, 150, 120, 70, 168, 46); g.stroke();
    g.strokeStyle = '#6b9a48'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(118, 250); g.bezierCurveTo(110, 150, 120, 70, 168, 46); g.stroke();
    // 茎に沿って鐘花を片側に吊るす
    const stops = [[168,52],[150,66],[160,84],[138,96],[150,116],[128,128],[140,150],[120,164]];
    for (let i = 0; i < stops.length; i++) {
      const [x, y] = stops[i]; const s = 1.0 - i * 0.03;
      drawBell(g, x, y, 22 * s, 30 * s);
    }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex;
  }
  function drawBell(g, x, y, w, h) {
    const grd = g.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, '#a091f0'); grd.addColorStop(0.45, '#6f56dc'); grd.addColorStop(1, '#4326b0');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(x - w * 0.4, y);
    g.bezierCurveTo(x - w * 0.55, y + h * 0.7, x - w * 0.45, y + h, x, y + h);
    g.bezierCurveTo(x + w * 0.45, y + h, x + w * 0.55, y + h * 0.7, x + w * 0.4, y);
    g.quadraticCurveTo(x, y - h * 0.14, x - w * 0.4, y); g.closePath(); g.fill();
    // 反り返る花弁
    g.strokeStyle = 'rgba(214,206,255,.85)'; g.lineWidth = 2.4;
    for (const dx of [-0.34, 0, 0.34]) {
      g.beginPath(); g.moveTo(x + dx * w, y + h * 0.92);
      g.quadraticCurveTo(x + dx * w * 1.5, y + h * 1.12, x + dx * w * 0.7, y + h * 1.14); g.stroke();
    }
    // ハイライト
    g.fillStyle = 'rgba(255,255,255,.28)';
    g.beginPath(); g.ellipse(x - w * 0.16, y + h * 0.35, w * 0.14, h * 0.28, -0.2, 0, 6.28); g.fill();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); setTimeout(resize, 0);

  const t0 = performance.now();
  renderer.setAnimationLoop(() => { time.value = (performance.now() - t0) / 1000; renderer.render(scene, camera); });
  return { resize };
}
