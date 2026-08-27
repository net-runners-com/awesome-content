// Live2D Lab — pixi-live2d-display で Cubism モデルを動かす
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
window.PIXI = PIXI; // pixi-live2d-display が Ticker を参照するため
Live2DModel.registerTicker(PIXI.Ticker);

const canvas = document.getElementById("c");
const app = new PIXI.Application({ view: canvas, resizeTo: window, backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
const status = (m) => (document.getElementById("status").textContent = m);

let model, core;
const MOUTH = "ParamMouthOpenY";
let mouthMode = "auto";   // auto | talk | audio
let audioLevel = 0;

function layout() {
  if (!model) return;
  const w = app.renderer.width / app.renderer.resolution, h = app.renderer.height / app.renderer.resolution;
  const s = Math.min(w / model.internalModel.width, h / model.internalModel.height) * 1.15;
  model.scale.set(s);
  model.x = w / 2; model.y = h * 0.62;
}

async function load() {
  status("モデル読込中…");
  const which = new URLSearchParams(location.search).get("model") || "hiyori";
  const src = which === "ren" ? "model/ren.model3.json" : "model-hiyori/Hiyori.model3.json";
  document.getElementById("which").textContent = which === "ren" ? "レン（Cubism 5.3 — Core 5.3+ が必要）" : "Hiyori（Cubism 4 公式サンプル）";
  model = await Live2DModel.from(src, { autoInteract: false });
  model.anchor.set(0.5, 0.5);
  app.stage.addChild(model);
  core = model.internalModel.coreModel;
  window.__lab = { app, model, PIXI };
  // PIXI v7 では内蔵インタラクションが使えないので自前で接続
  canvas.addEventListener("pointermove", (e) => model.focus(e.clientX, e.clientY));
  canvas.addEventListener("pointerdown", (e) => model.tap(e.clientX, e.clientY));
  layout();
  addEventListener("resize", layout);

  // クリック: 頭→表情ランダム、体→タップモーション
  model.on("hit", (areas) => {
    const groups = model.internalModel.motionManager.definitions;
    if (areas.includes("Head") && groups[""]) setExpression(1 + Math.floor(Math.random() * 5));
    else if (groups["TapBody"]) model.motion("TapBody", 0, 3);
    else if (groups[""]) model.motion("", Math.floor(Math.random() * 2), 3);
  });

  // 口: モーション更新後に上書き（フレームごと）
  model.internalModel.on("beforeModelUpdate", () => {
    const t = performance.now() / 1000;
    if (mouthMode === "talk") core.setParameterValueById(MOUTH, 0.35 + 0.35 * Math.abs(Math.sin(t * 9)) + 0.2 * Math.abs(Math.sin(t * 23)));
    else if (mouthMode === "audio") core.setParameterValueById(MOUTH, Math.min(1, audioLevel * 2.2));
  });

  const n = typeof core.getParameterCount === "function" ? core.getParameterCount() : (core._parameterIds || []).length;
  document.getElementById("params").textContent = `${n} params · ${model.internalModel.width.toFixed(0)}×${model.internalModel.height.toFixed(0)}`;
  status("準備OK — 画面をドラッグせずマウスを動かすと視線追従。頭クリックで表情、体クリックでモーション");
}

function setExpression(n) {
  if (!model.internalModel.settings.expressions) return;
  model.expression(`exp_0${n}`);
  document.querySelectorAll("[data-exp]").forEach((b) => b.classList.toggle("on", Number(b.dataset.exp) === n));
}
document.querySelectorAll("[data-exp]").forEach((b) => b.addEventListener("click", () => setExpression(Number(b.dataset.exp))));
document.querySelectorAll("[data-motion]").forEach((b) => b.addEventListener("click", () => {
  const [g, i] = b.dataset.motion.split(":");
  const defs = model.internalModel.motionManager.definitions;
  const grp = defs[g] ? g : (g === "" && defs["TapBody"] ? "TapBody" : "Idle");
  model.motion(grp, Math.min(Number(i), (defs[grp] || []).length - 1), 3);
}));
document.querySelectorAll("[data-mouth]").forEach((b) => b.addEventListener("click", () => {
  mouthMode = b.dataset.mouth;
  document.querySelectorAll("[data-mouth]").forEach((x) => x.classList.toggle("on", x === b));
  if (mouthMode === "audio") playSample();
}));

// 音声リップシンク: WebAudio の RMS を口の開きに
let actx, analyser, data, audioEl;
function playSample() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    audioEl = new Audio("voice/sample.wav");
    const src = actx.createMediaElementSource(audioEl);
    analyser = actx.createAnalyser(); analyser.fftSize = 512; data = new Uint8Array(analyser.fftSize);
    src.connect(analyser); analyser.connect(actx.destination);
    audioEl.addEventListener("ended", () => { mouthMode = "auto"; document.querySelectorAll("[data-mouth]").forEach((x) => x.classList.toggle("on", x.dataset.mouth === "auto")); });
  }
  actx.resume(); audioEl.currentTime = 0; audioEl.play();
}
app.ticker.add(() => {
  if (!analyser) return;
  analyser.getByteTimeDomainData(data);
  let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
  const rms = Math.sqrt(sum / data.length);
  audioLevel += (rms - audioLevel) * 0.35;
});

load().catch((e) => { status("読込失敗: " + e.message); console.error(e); });
