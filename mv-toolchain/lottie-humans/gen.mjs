// Lottie(bodymovin) JSON をコードで生成する — ポップなフラット人物アニメ4種
// 実行: node gen.mjs → anim/*.json + index.html（lottie-web を同梱）
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const FR = 30;
const W = 480, H = 480;

// ---------- ヘルパー ----------
const EASE = { i: { x: [0.33], y: [1] }, o: { x: [0.67], y: [0] } };          // easeInOut
const POP = { i: { x: [0.2], y: [1.6] }, o: { x: [0.6], y: [0] } };            // オーバーシュート
const kf = (pairs, ease = EASE) => ({
  a: 1,
  k: pairs.map(([t, v], i) => (i < pairs.length - 1 ? { t, s: Array.isArray(v) ? v : [v], ...ease } : { t, s: Array.isArray(v) ? v : [v] })),
});
const st = (v) => ({ a: 0, k: v });
const rgb = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, 1];

const fill = (hex) => ({ ty: "fl", c: st(rgb(hex)), o: st(100), r: 1 });
const stroke = (hex, w) => ({ ty: "st", c: st(rgb(hex)), o: st(100), w: st(w), lc: 2, lj: 2 });
const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) });
const ellipse = (w, h, hex, x = 0, y = 0) => ({ ty: "gr", it: [{ ty: "el", p: st([x, y]), s: st([w, h]) }, fill(hex), tr()] });
const rect = (w, h, r, hex, x = 0, y = 0) => ({ ty: "gr", it: [{ ty: "rc", p: st([x, y]), s: st([w, h]), r: st(r) }, fill(hex), tr()] });
const line = (pts, hex, w) => ({ ty: "gr", it: [{ ty: "sh", ks: st({ c: false, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) }, stroke(hex, w), tr()] });

let IND = 0;
function layer(nm, shapes, { p = [0, 0], a = [0, 0], r = st(0), s = st([100, 100, 100]), parent, op = 60, pos, o = st(100) } = {}) {
  return {
    ddd: 0, ind: ++IND, ty: 4, nm, sr: 1,
    ks: { o, r, p: pos ?? st([p[0], p[1], 0]), a: st([a[0], a[1], 0]), s },
    ao: 0, shapes, ip: 0, op, st: 0, bm: 0, ...(parent ? { parent } : {}),
  };
}
function anim(nm, layers, op, bg) {
  return { v: "5.7.4", fr: FR, ip: 0, op, w: W, h: H, nm, ddd: 0, assets: [], layers: bg ? [...layers, layer("bg", [rect(W, H, 40, bg)], { p: [W / 2, H / 2], op })] : layers };
}

const C = { skin: 0xffc9a3, skin2: 0xd9a37a, hair: 0x2b1d3a, shirt: 0xff4f9a, shirt2: 0x3ee0d8, pants: 0x2b3cff, shoe: 0x1a1633, yellow: 0xffd23f, cream: 0xfff8ee, grape: 0x7b2cff, shadow: 0x1a163333 };

// 共通: 胴体を親に、頭・腕・脚を子に。角度は肩/腰を支点に回す。
function person({ op, shirt = C.shirt, body, head, armL, armR, legL, legR, extra = [] }) {
  IND = 0;
  const bodyL = layer("body", [rect(96, 120, 36, shirt)], { p: [W / 2, 250], a: [0, 0], ...body, op });
  const B = bodyL.ind;
  const headL = layer("head", [ellipse(104, 104, C.skin), ellipse(118, 60, C.hair, 0, -36), ellipse(10, 10, C.hair, -18, 2), ellipse(10, 10, C.hair, 18, 2), line([[-14, 22], [0, 30], [14, 22]], C.hair, 5)], { p: [0, -90], a: [0, 0], parent: B, ...head, op });
  const armLL = layer("armL", [rect(28, 104, 14, C.skin, 0, 40), ellipse(30, 30, C.skin, 0, 92)], { p: [-48, -40], parent: B, ...armL, op });
  const armRL = layer("armR", [rect(28, 104, 14, C.skin, 0, 40), ellipse(30, 30, C.skin, 0, 92)], { p: [48, -40], parent: B, ...armR, op });
  const legLL = layer("legL", [rect(34, 110, 16, C.pants, 0, 44), rect(52, 26, 12, C.shoe, -6, 104)], { p: [-24, 52], parent: B, ...legL, op });
  const legRL = layer("legR", [rect(34, 110, 16, C.pants, 0, 44), rect(52, 26, 12, C.shoe, 6, 104)], { p: [24, 52], parent: B, ...legR, op });
  // 描画順: 後ろ→前（配列の先頭が最前面）
  return [headL, armRL, bodyL, armLL, legLL, legRL, ...extra];
}

// ---------- 1. WAVE（手を振る） ----------
function wave() {
  const op = 60;
  const layers = person({
    op,
    body: { pos: kf([[0, [W / 2, 250, 0]], [15, [W / 2, 242, 0]], [30, [W / 2, 250, 0]], [45, [W / 2, 242, 0]], [60, [W / 2, 250, 0]]]) },
    head: { r: kf([[0, -4], [30, 4], [60, -4]]) },
    armR: { r: kf([[0, -150], [10, -175], [20, -150], [30, -175], [40, -150], [50, -175], [60, -150]]) },
    armL: { r: kf([[0, 8], [30, 14], [60, 8]]) },
    legL: { r: st(-4) }, legR: { r: st(4) },
  });
  // 吹き出し "HI!"
  layers.unshift(layer("bubble", [rect(120, 64, 32, C.cream), { ty: "gr", it: [{ ty: "sh", ks: st({ c: true, v: [[-40, 28], [-24, 28], [-44, 52]], i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0]] }) }, fill(C.cream), tr()] }, ellipse(14, 14, C.grape, -26, 0), ellipse(14, 14, C.grape, 0, 0), ellipse(14, 14, C.grape, 26, 0)],
    { p: [352, 110], s: kf([[0, [0, 0, 100]], [8, [110, 110, 100]], [14, [100, 100, 100]], [48, [100, 100, 100]], [56, [0, 0, 100]], [60, [0, 0, 100]]], POP), op }));
  return anim("wave", layers, op, C.yellow);
}

// ---------- 2. JUMP（ジャンプ・スクワッシュ&ストレッチ） ----------
function jump() {
  const op = 48;
  const layers = person({
    op, shirt: C.shirt2,
    body: {
      pos: kf([[0, [W / 2, 250, 0]], [8, [W / 2, 268, 0]], [14, [W / 2, 176, 0]], [24, [W / 2, 150, 0]], [34, [W / 2, 250, 0]], [38, [W / 2, 270, 0]], [48, [W / 2, 250, 0]]]),
      s: kf([[0, [100, 100, 100]], [8, [122, 80, 100]], [14, [86, 120, 100]], [24, [100, 100, 100]], [34, [120, 82, 100]], [42, [98, 104, 100]], [48, [100, 100, 100]]]),
    },
    head: { pos: kf([[0, [0, -90, 0]], [8, [0, -84, 0]], [14, [0, -100, 0]], [24, [0, -94, 0]], [34, [0, -82, 0]], [48, [0, -90, 0]]]) },
    armL: { r: kf([[0, 10], [8, 40], [14, -160], [24, -150], [34, 40], [48, 10]]) },
    armR: { r: kf([[0, -10], [8, -40], [14, 160], [24, 150], [34, -40], [48, -10]]) },
    legL: { r: kf([[0, -4], [8, -14], [14, 42], [24, 30], [34, -14], [48, -4]]) },
    legR: { r: kf([[0, 4], [8, 14], [14, -42], [24, -30], [34, 14], [48, 4]]) },
    extra: [layer("shadow", [ellipse(150, 30, 0x1a1633)], { p: [W / 2, 418], o: st(25), s: kf([[0, [100, 100, 100]], [8, [115, 100, 100]], [24, [55, 100, 100]], [34, [115, 100, 100]], [48, [100, 100, 100]]]), op })],
  });
  // 着地の星パーティクル
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    layers.unshift(layer(`star${i}`, [ellipse(16, 16, i % 2 ? C.yellow : C.shirt)], {
      pos: kf([[34, [W / 2, 400, 0]], [46, [W / 2 + Math.cos(a) * 150, 400 - Math.abs(Math.sin(a)) * 90 - 20, 0]]]),
      s: kf([[34, [0, 0, 100]], [38, [120, 120, 100]], [46, [0, 0, 100]]]),
      op,
    }));
  }
  return anim("jump", layers, op, C.grape);
}

// ---------- 3. DANCE（ダンス・腰振り） ----------
function dance() {
  const op = 48;
  const layers = person({
    op, shirt: C.yellow,
    body: {
      pos: kf([[0, [W / 2 - 14, 250, 0]], [12, [W / 2, 240, 0]], [24, [W / 2 + 14, 250, 0]], [36, [W / 2, 240, 0]], [48, [W / 2 - 14, 250, 0]]]),
      r: kf([[0, -8], [24, 8], [48, -8]]),
    },
    head: { r: kf([[0, 10], [24, -10], [48, 10]]), pos: kf([[0, [-6, -90, 0]], [24, [6, -90, 0]], [48, [-6, -90, 0]]]) },
    armL: { r: kf([[0, 30], [12, -150], [24, 30], [36, -150], [48, 30]]) },
    armR: { r: kf([[0, 150], [12, -30], [24, 150], [36, -30], [48, 150]]) },
    legL: { r: kf([[0, -18], [24, 12], [48, -18]]) },
    legR: { r: kf([[0, -12], [24, 18], [48, -12]]) },
  });
  // 音符
  const notes = [[110, 120, 0], [370, 100, 16], [90, 300, 32]];
  notes.forEach(([x, y, d], i) => {
    layers.unshift(layer(`note${i}`, [ellipse(26, 20, C.cream, -6, 8), rect(6, 44, 3, C.cream, 6, -12), rect(24, 8, 4, C.cream, 18, -30)], {
      pos: kf([[d, [x, y + 40, 0]], [d + 24, [x, y - 40, 0]]]),
      o: kf([[d, 0], [d + 6, 100], [d + 18, 100], [d + 24, 0]]),
      r: kf([[d, -15], [d + 24, 15]]), op,
    }));
  });
  return anim("dance", layers, op, C.shirt);
}

// ---------- 4. WALK（歩行サイクル・ループ） ----------
function walk() {
  const op = 40;
  const layers = person({
    op, shirt: C.grape,
    body: { pos: kf([[0, [W / 2, 250, 0]], [10, [W / 2, 242, 0]], [20, [W / 2, 250, 0]], [30, [W / 2, 242, 0]], [40, [W / 2, 250, 0]]]), r: st(4) },
    head: { r: kf([[0, 2], [20, -2], [40, 2]]) },
    armL: { r: kf([[0, -35], [20, 35], [40, -35]]) },
    armR: { r: kf([[0, 35], [20, -35], [40, 35]]) },
    legL: { r: kf([[0, 32], [20, -32], [40, 32]]) },
    legR: { r: kf([[0, -32], [20, 32], [40, -32]]) },
  });
  // 流れる地面ライン（歩いている感）
  for (let i = 0; i < 4; i++) {
    layers.push(layer(`ground${i}`, [rect(70, 10, 5, C.cream)], { pos: kf([[0, [W + 60 - i * 150, 420, 0]], [40, [W + 60 - i * 150 - 150, 420, 0]]], { i: { x: [0], y: [0] }, o: { x: [1], y: [1] } }), o: st(60), op }));
  }
  return anim("walk", layers, op, C.shirt2);
}

// ---------- 出力 ----------
mkdirSync("anim", { recursive: true });
const anims = { wave: wave(), jump: jump(), dance: dance(), walk: walk() };
for (const [k, v] of Object.entries(anims)) writeFileSync(`anim/${k}.json`, JSON.stringify(v));

const player = readFileSync("../remotion-mv/node_modules/lottie-web/build/player/lottie.min.js", "utf8");
const tpl = readFileSync("template.html", "utf8");
writeFileSync("index.html", tpl.replace("/*__PLAYER__*/", () => player).replace("/*__ANIMS__*/", () => `window.__ANIMS = ${JSON.stringify(anims)};`));
console.log("anim/*.json + index.html written", Object.keys(anims).join(","));
