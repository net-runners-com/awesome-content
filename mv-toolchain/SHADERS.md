# シェーダー / VFX 資料集

> **原神風の海** → `genshin-sea/`（全自作GLSL）。参照元: Uynet/Gensin-Sea（★200、LICENSE無し＝考え方だけ借りて書き直し）／GarrettGunnell/Water（sum of sines と FFT の両実装、ライセンス要確認）／gasgiant/FFT-Ocean（FFT波だけ欲しい時）／IronWarrior/ToonWaterShader（深度バッファからの岸フォーム）。実装した要素: 深度差→水層厚→エメラルド→群青の吸収、Gerstner×4、岸フォーム帯+波頭フォーム、段階化スペキュラ+きらめき、シーンカラー屈折、Worleyコースティクス。FFT波は未実装（池〜近海のスケールならsum of sinesで足りる。大海原のタイリング消しが要る時だけFFT）。

> **Toon / セルシェーディング** → `toon-lab/`。最短: three.js組み込み `MeshToonMaterial` + gradientMap（[解説+素材](https://sbcode.net/threejs/meshtoonmaterial/)、輪郭は付かない）。自前サンプル: [manbust/three-js-toon-shader](https://github.com/manbust/three-js-toon-shader)（深度+法線バッファのポストプロセス輪郭＝ジオメトリ複製なし、[フォーラム](https://discourse.threejs.org/t/custom-toon-shader-in-js/88273)）／[mayacoda/toon-shader](https://github.com/mayacoda/toon-shader)+[チュートリアル](https://www.maya-ndljk.com/blog/threejs-basic-toon-shader)（Roystan Unity版の翻訳、写経向き）／[EvanBacon CodePen](https://codepen.io/EvanBacon/pen/oBzVzo)（`ceil(i*steps)/steps` の最小構成）／[横山氏 CodePen](https://codepen.io/yoshimsa-yokoyama/pen/XKMayR)（インバーテッドハル）／[moonjump 原理解説](https://moonjump.com/game-dev-mechanics-toon-shading-cel-shading-how-it-works/)。リムライト `(1 - max(N·V,0))^e` はほぼ必須。

2026-08-25 収集。対象: 雨ガラス・ディゾルブ・ブルーム・ビネット・色収差などの「見た目を作るシェーダー」。
Unity/Godot の作例を参考にして three.js(GLSL) に移植する前提。自作デモは末尾。

## 0. 基礎（読む順）

| リソース | 内容 |
|---|---|
| [The Book of Shaders](https://thebookofshaders.com/?lan=jp) | フラグメントシェーダー入門の定番（日本語あり）。ノイズ・図形・パターン |
| [Inigo Quilez](https://iquilezles.org/) | SDF・ノイズ・レイマーチの原典。Shadertoy創設者 |
| [Shadertoy](https://www.shadertoy.com/) | 作例検索。GLSL ES、`iTime`/`iResolution`/`iMouse` 規約 |
| [Three.js and Shadertoy（公式マニュアル）](https://threejs.org/manual/en/shadertoy.html) | Shadertoyコードを three.js の ShaderMaterial に載せる手順 |
| [Open-Shaders（repalash）](https://github.com/repalash/Open-Shaders) | Unity/Unreal/Godot/three.js 等のOSSシェーダー横断コレクション |
| [lygia](https://lygia.xyz/) | GLSL/HLSL/WGSL 共通のシェーダー関数ライブラリ（ノイズ、ブラー、色空間） |

## 1. 雨ガラス / 雨粒（Rain on Glass）

作り方の骨子: UVをグリッドに分割 → セルごとにハッシュで滴の位置・サイズ・落下タイミング → 円SDFで滴 → 滴の法線でUVを歪ませて背景を屈折 → 軌跡（trail）は縦方向に細かいセルで。

- [Shadertoy: Heartfelt（BigWings）](https://www.shadertoy.com/view/ltffzl) — 雨ガラスの原典。ほぼ全ての実装の元
- [Shadertoy: Raindrops on Glass](https://www.shadertoy.com/view/DdKyR1)
- [Shadertoy - Rain drops 解説（greentec）](https://greentec.github.io/rain-drops-en/) — Heartfelt の逐行解説
- [rainDropletShader（pailhead）](https://github.com/pailhead/rainDropletShader) — three.js 版
- [Building a Realistic Raindrop-Covered Window Pane Material in Three.JS（Casey Primozic）](https://cprimozic.net/notes/posts/building-realistic-rainy-window-pane-in-threejs/) — MeshPhysicalMaterial の transmission で物理ベースに（[forum](https://discourse.threejs.org/t/realistic-raindrop-covered-window-pane-material-implementation/58076)）
- [Making a rain animation with WebGL shaders in Three.js（dev.to）](https://dev.to/nordicbeaver/making-rain-animation-with-webgl-shaders-in-threejs-4ic5) / [動画](https://www.youtube.com/watch?v=Rl3clbrsI40)
- [Rain & Water Effect Experiments（Codrops）](https://tympanus.net/codrops/2015/11/04/rain-water-effect-experiments/) — Canvas 2D 版（古典）

## 2. ディゾルブ（Dissolve）— Unity 由来の定番

骨子: ノイズテクスチャ（or 3Dノイズ関数）の値 < しきい値 なら `discard`。しきい値付近の帯を emission で光らせる（エッジグロー）。Unityの `Alpha Clip Threshold` = GLSLの `discard`。

- [Dissolve Effect in Shader Graph and URP（Daniel Ilett）](https://danielilett.com/2020-04-15-tut5-4-urp-dissolve/) / [リポジトリ](https://github.com/daniel-ilett/dissolve-urp) — Brackeys版を拡張。ワールドY方向の溶け方も
- [Unity Shader Graph Quick Tutorial - Dissolve（Game Developer）](https://www.gamedeveloper.com/design/unity-shader-graph-quick-tutorial---dissolve-shader)
- 動画: [Unity Dissolve Shader (URP)](https://www.youtube.com/watch?v=ge5JU1Jm0VU) / [Dissolve Effect in Shader Graph](https://www.youtube.com/watch?v=0NuesGD0msI) / [Dissolve effect](https://www.youtube.com/watch?v=iTlSwQ4b-uM)
- [Unity-Shaders-VFX-Collections（RohanChoudhary15）](https://github.com/RohanChoudhary15/Unity-Shaders-VFX-Collections) — グリッチ / **ディゾルブ→粒子化** / インタラクティブ粒子。粒子系との接続点
- [Unity URP Shader Graph Effects 完全チュートリアル 2026](https://generalistprogrammer.com/tutorials/unity-urp-shader-graph-effects-complete-vfx-tutorial)

## 3. ポストプロセス（Bloom / Vignette / 色収差 / グレイン）

three.js は2系統: 標準の `EffectComposer`（addons）と、より高速な `pmndrs/postprocessing`。

- [UnrealBloomPass（three.js docs）](https://threejs.org/docs/pages/UnrealBloomPass.html) / [公式デモ](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) — `strength` / `radius` / `threshold`
- [Unreal Bloom Selective（Wael Yasmina）](https://waelyasmina.net/articles/unreal-bloom-selective-threejs-post-processing/) — 特定オブジェクトだけ発光
- [Post-processing まとめ（Sangil Lee, 2025）](https://sangillee.com/2025-01-15-post-processing/)
- [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) — `BloomEffect` / `VignetteEffect` / `ChromaticAberrationEffect` / `NoiseEffect` を1パスに統合。[selective bloom の質問](https://discourse.threejs.org/t/pmndrs-post-processing-how-to-get-selective-bloom/58452)
- three.js addons 同梱シェーダー: `VignetteShader`, `RGBShiftShader`（色収差）, `FilmShader`（グレイン/走査線）, `AfterimagePass`（残像）, `GlitchPass`
- [threejs-postprocessing（Agent Skill）](https://agentskills.me/skill/threejs-postprocessing) — AI向けの手順書

## 4. VFX 全般の学習・作例

- [Unity 6 VFX Graph E-Book](https://unity.com/blog/unity-6-vfx-graph-ebook) — 公式。6方向ライティングの煙など
- [The Shader Survival Guide（Game Slave）](https://www.gameslave.dev/theshadersurvivalguide) — Unity Shader Graph の演習書
- [Godot Shaders Bible 2026](https://studylib.net/doc/28263045/esp%C3%ADndola-fabrizio---the-godot-shaders-bible---2026) / [godotshaders.com](https://godotshaders.com/) — Godot のシェーダー共有サイト（GLSL寄りで移植しやすい）
- [Unity Asset Store: VFX/Shaders](https://assetstore.unity.com/vfx/shaders) — 商用作例のトレンド観察用
- YouTube: Acerola（ポストプロセス解説）/ Ben Cloward（Shader Graph 週次）/ Freya Holmér（シェーダー数学）/ Catlike Coding（Unity レンダリング）/ Demofox（技術ブログ）

## 5. Unity → three.js 移植メモ

| Unity（HLSL/Shader Graph） | three.js（GLSL） |
|---|---|
| `_Time.y` | `uTime` uniform を毎フレーム更新 |
| `Alpha Clip Threshold` | `if (v < uThreshold) discard;` |
| `Emission` | `gl_FragColor.rgb += edge * color * intensity`（Bloomに拾わせるなら > 1.0 の値） |
| `Simple Noise` / `Gradient Noise` ノード | lygia の `snoise` / 自前 value noise |
| `Fresnel Effect` | `pow(1.0 - dot(N, V), power)` |
| `Screen Position` | `gl_FragCoord.xy / uResolution` |
| Post Processing Volume | `EffectComposer` + Pass 群 |

## 6. 自作デモ（このリポジトリ）

| デモ | 場所 | 内容 |
|---|---|---|
| Shader Lab | `shader-lab/` | ①雨ガラス（手続き的背景の屈折＋滴＋軌跡） ②ディゾルブ（3Dノイズ閾値＋エッジ発光、Unity流） ③ポストプロセス（UnrealBloom＋ビネット＋色収差＋グレイン、スライダー付き） |
| Particle Lab | `particle-lab/` | 粒子（PARTICLES.md 参照） |
