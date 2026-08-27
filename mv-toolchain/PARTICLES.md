# 粒子系アニメーション 資料集

2026-08-25 収集。参照画像（グラデーション粒子のリング）系の表現を、CSS / JS / three.js(WebGL) / WebGPU の4段階で押さえる。
自作デモは末尾。

## 0. まず読む（参照画像の元ネタと基礎）

| 記事 | 内容 |
|---|---|
| [CSSではじめるクリエイティブコーディング・パーティクルアニメーション（LIG）](https://liginc.co.jp/516560) | **参照画像の元記事**。CSSだけで粒子リングを作る手順 |
| [センスだけに頼らない！CSSとJSで作るパーティクル表現のテクニック（ICS MEDIA）](https://ics.media/entry/220420/) | Web Animations API / GSAPでの実装。日本語で一番体系的 |
| [ボタンを押すと爆発！粒子・星・ハートが広がるパーティクル（satokotadesign）](https://satokotadesign.com/blog/particle-animation/) | クリック起点の破裂系 |
| [美しく動かしたくなる粒子アニメーションスニペット10選（seleqt）](https://seleqt.net/programming/particle-animation-code-snippets/) | CodePen厳選 |
| [CSSで描くパーティクルアニメーション（Qiita）](https://qiita.com/kuri-chan/items/6c41322693c00eadc200) / [作ってみた（Qiita）](https://qiita.com/hisamikurita/items/6c41322693c00eadc200) | 小規模実装の写経向け |

## 1. CSSだけ（DOMノードを増やさない box-shadow 方式）

擬似要素1つに `box-shadow` を大量に積み、`@keyframes` で動かす。コンポジタースレッドで完結し軽い。

- [10+ CSS Particle Backgrounds（FreeFrontend）](https://freefrontend.com/css-particle-backgrounds/) — コード付き一覧
- giana の box-shadow 粒子シリーズ: [particles v6（最大2000粒・彩度/明度/尺を調整可）](https://codepen.io/giana/pen/WrvPEj) / [box-shadow animation](https://codepen.io/giana/pen/rxVNKx) / [CSS only 2022](https://codepen.io/giana/pen/GRyZLWJ)
- [Particle trail using box shadow](https://codepen.io/mathias-madsen-stav/pen/GqRPJB) — スタッガーで軌跡
- [CSS Rising Particles](https://codepen.io/404ryannotfound/pen/bGdYEwG) — 上昇する粒子（背景向け）
- [css particles animation（SCSSループ生成）](https://codepen.io/noeldevelops/pen/VwLWOEM)
- [Animated box-shadow without crippling performance](https://codepen.io/jgunnison/pen/VvJwYR) — 重くならない書き方

限界: 数千粒まで。粒子ごとの物理・マウス反応は不向き → JS/WebGLへ。

## 2. JSライブラリ（Canvas 2D、数千粒・設定JSONで済ませたい時）

| ライブラリ | 特徴 |
|---|---|
| [tsParticles](https://github.com/tsparticles/tsparticles)（[サンプル集](https://particles.js.org/samples/index.html)） | particles.jsの後継。紙吹雪・花火・ネットワーク線。React/Vue/Svelte等コンポーネント有 |
| [particles.js](https://vincentgarreau.com/particles.js/) | 元祖。軽量、ネットワーク線の定番 |
| [Particle Network Animations in JS（portalZINE）](https://portalzine.de/particle-network-animations-in-javascript/) | ネットワーク線系の比較記事 |
| [10 Best Particles Animation JS Libraries 2026（CSS Script）](https://www.cssscript.com/best-particles-animation/) | 最新比較 |
| [GitHub topic: particles (TypeScript)](https://github.com/topics/particles?l=typescript) | 更新順で探す |

## 3. three.js / WebGL（数万〜数十万粒・GPU駆動）

**自作デモ `particle-lab` の方式**: `THREE.Points` 1つ + 頂点シェーダーで位置/色/揺らぎを時間から計算 → CPU更新ゼロ・1ドローコール。形状切替はシェーダー内の2形状を `uMix` で補間。

- [three.js 公式: webgpu_compute_particles（50万粒）](https://threejs.org/examples/webgpu_compute_particles.html) / [attractors particles](https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html)
- [GPGPU Flow Field Particles Shaders（Three.js Journey）](https://threejs-journey.com/lessons/gpgpu-flow-field-particles-shaders) — フローフィールドの決定版レッスン
- [Particle-Curl-Noise（juniorxsound）](https://github.com/juniorxsound/Particle-Curl-Noise) — FBO + カールノイズ
- [threejs-exp-particles（szymonkaliski）](https://github.com/szymonkaliski/threejs-exp-particles) — 3Dフローフィールド
- [PhysicsRenderer（cabbibo）](https://github.com/cabbibo/PhysicsRenderer) — GPGPUユーティリティ、群れ・カールノイズ例
- [study-three.js: gpgpu-particles-with-curl-noise（aadebdeb）](https://github.com/aadebdeb/study-three.js/blob/master/gpgpu-particles-with-curl-noise.html) — 単一HTMLで読める
- [3D Curl Noise（al-ro）](https://al-ro.github.io/projects/embers/) — Bridsonのカールノイズ可視化
- [GitHub topic: curl-noise](https://github.com/topics/curl-noise)
- [1M animated GPGPU particles for a video（three.js forum）](https://discourse.threejs.org/t/1m-animated-gpgpu-particles-animations-for-a-video/67667) — 動画制作用途の実例（FBOで文字を粒子化）

## 4. WebGPU / TSL（2025〜の主戦場、数百万粒）

- [Field Guide to TSL and WebGPU（Maxime Heckel）](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/) — 最良の入門
- [GPGPU particles with TSL & WebGPU（Wawa Sensei）](https://wawasensei.dev/courses/react-three-fiber/lessons/tsl-gpgpu) — R3F向け
- [GPGPU Particles 3D: TSL minimal walkthrough（three-fluid-fx）](https://three-fluid-fx.artcreativecode.com/tutorials/tsl/minimal/particles-3d/)
- [three-particles（NewKrok）](https://github.com/NewKrok/three-particles) — WebGPU compute対応パーティクルシステム（重力/力場/ノイズ、5万〜35万粒）
- [Getting AI to Write TSL That Works（Three.js Roadmap）](https://threejsroadmap.com/blog/getting-ai-to-write-tsl-that-works) — TSLをAIに書かせるコツ
- [100 Three.js Tips That Actually Improve Performance（2026）](https://www.utsubo.com/blog/threejs-best-practices-100-tips)

## 5. Codrops（作例の宝庫）

- [tag: particles](https://tympanus.net/codrops/tag/particles/) / [Creative Hub: WebGL](https://tympanus.net/codrops/hub/tag/webgl/)（1000本超のデモ）
- [Simulating Life in the Browser: UntilLabs の生きた粒子システム（2025-12）](https://tympanus.net/codrops/2025/12/10/simulating-life-in-the-browser-creating-a-living-particle-system-for-the-untillabs-website/) — 写真→物理駆動の粒子
- [Particles, Progress, and Perseverance: WebGPU Fluids（2025-01）](https://tympanus.net/codrops/2025/01/29/particles-progress-and-perseverance-a-journey-into-webgpu-fluids/)
- [2025 Year in Review](https://tympanus.net/codrops/2025/12/29/2025-a-very-special-year-in-review/) — 年間ハイライト
- [github.com/codrops](https://github.com/codrops) — 全デモのソース

## 6. 使い分けの目安

| 規模 | 手段 | 向いている表現 |
|---|---|---|
| 〜2,000粒 | CSS box-shadow | 背景の漂い、装飾リング |
| 〜10,000粒 | Canvas 2D（tsParticles） | ネットワーク線、紙吹雪、クリック破裂 |
| 〜100,000粒 | three.js Points + 頂点シェーダー | リング/銀河/球殻/モーフ、動画素材 |
| 100万粒〜 | WebGPU compute（TSL） | 流体、群れ、写真の粒子化、文字の粒子化 |

## 7. 自作デモ（このリポジトリ）

| デモ | 場所 | 方式 |
|---|---|---|
| Particle Lab（リング/銀河/シェル/バースト） | `particle-lab/`（`node build.mjs` で index.html 生成） | three.js Points × GPU頂点シェーダー、42,000粒・1ドローコール |
| Pop Page Transitions（渦/泡/斜線） | `css-transitions/index.html` | CSSのみ（@keyframes） |
| Molecule Lab（保留） | `molecule-3d/` | InstancedMesh。ハロ表現に難あり、粒子系に方針転換したため未整備 |

次のフェーズ: **テキストアニメーション**（SplitText系 / 文字の粒子化 = 上記 forum の1M particles 方式が橋渡し）。
