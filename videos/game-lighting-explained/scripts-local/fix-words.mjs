// fix-words.mjs — kokoro+whisperの文字化けした語タイムスタンプを、
// STORYBOARD の正しい表示用テキスト(漢字)から句読点区切りで再構築する。
// タイミングは各行の実測 duration 内に文字数比で線形配分（フレーズ単位カラオケ）。
import { readFileSync, writeFileSync } from "node:fs";

const DISPLAY = {
  "01": "ゲームの画面の印象を決めるのは、モデルでもテクスチャでもない。光だ。",
  "02": "リアルタイムレンダリングの光源は、実質この3つ。点光源、ディレクショナルライト、そして環境光。名前だけ、まず覚えてしまおう。",
  "03": "点光源は、一点から全方向に光を放つ。たいまつ、ランプ、マズルフラッシュ。特徴は、距離とともに急激に暗くなること。拾えるアイテムの光など、視線誘導にも使われる。",
  "04": "物理では逆二乗則。距離が2倍なら、明るさは4分の1。エンジンでは係数付きの減衰式でカーブを調整し、減衰半径の外は計算を打ち切る。",
  "05": "ディレクショナルライトは、無限遠から降り注ぐ平行光線。太陽や月の抽象化だ。位置は持たず、方向だけを持つ。だから減衰しない。屋外のシーンでは、これが主光源になる。",
  "06": "方向と色温度を変えるだけで、時間帯が作れる。真上の白は正午、低いオレンジは夕暮れ。影はカスケードシャドウマップで、近くほど高解像度に。タイムオブデイの基本は、この2つのパラメータだ。",
  "07": "環境光は、空全体からの回り込みを近似する光。特定の光源を持たない。一番単純な形は、空の色を一定量、全ピクセルに足すこと。この光が、影の中を真っ黒にしない。",
  "08": "現代のゲームはイメージベースドライティング。空の画像そのものを光源にする。さらにアンビエントオクルージョンで、隙間や凹みを暗くして立体感を出す。",
  "09": "役割分担はこうだ。ディレクショナルが主光源。点光源がアクセント。環境光がベース。3つのバランスが、画作りの出発点になる。",
  "10": "次にシーンを開いたら、まず光を3つに分けて見てみよう。それだけで、シーンの見方が変わるはずだ。",
};

// 句読点で切り、区切り記号は前の句に残す
function phrases(text) {
  return text
    .split(/(?<=[、。])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const metaPath = "audio_engine_meta.json";
const meta = JSON.parse(readFileSync(metaPath, "utf8"));

for (const v of meta.voices ?? []) {
  const disp = DISPLAY[v.id];
  if (!disp) continue;
  const ph = phrases(disp);
  const total = ph.reduce((a, p) => a + p.length, 0);
  const t0 = 0.05;
  const t1 = Math.max(t0 + 0.2, v.duration_s - 0.1);
  const span = t1 - t0;
  let acc = 0;
  v.words = ph.map((p, i) => {
    const start = t0 + (acc / total) * span;
    acc += p.length;
    const end = t0 + (acc / total) * span;
    return { id: `w${i}`, text: p, start: +start.toFixed(3), end: +end.toFixed(3) };
  });
}
writeFileSync(metaPath, JSON.stringify(meta, null, 2));

// engine neutral meta → product-launch meta (faceless-explainer の toProductLaunchMeta と同形)
const voices = (meta.voices ?? []).map((v) => ({
  frame: Number(v.id),
  path: v.path,
  duration_s: v.duration_s,
  words: (v.words ?? []).map((w) => ({ id: w.id, text: w.text, start: w.start, end: w.end })),
}));
const bgm = meta.bgm
  ? { path: meta.bgm.path, volume: meta.bgm.volume, query: meta.bgm.query ?? null, duration_s: meta.bgm.duration_s ?? null }
  : null;
const out = { bgm, bgm_pending: !!meta.bgm_pending, voices, sfx: (meta.sfx ?? []).map((s) => ({ frame: Number(s.id), file: s.file, offset_s: s.offset_s ?? 0, duration_s: s.duration_s ?? 1, volume: s.volume ?? 0.35 })) };
writeFileSync("audio_meta.json", JSON.stringify(out, null, 2));
console.log(`✓ rebuilt words for ${voices.length} voices → audio_meta.json (bgm_pending: ${out.bgm_pending})`);
