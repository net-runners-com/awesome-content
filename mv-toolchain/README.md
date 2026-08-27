# MV Toolchain

`~/Downloads/video-toolchain-research.md`（2026-08-25調査）の推奨構成を実体化したもの。
最終ゴール: アニメMV制作（イラストアニメーション系）。

## 構成

```
mv-toolchain/
├── remotion-mv/           Remotion本体（hello-worldベース）
│   └── 追加済み: @remotion/three, three, @react-three/fiber,
│       @remotion/media-utils, tone, textalive-app-api
├── ACE-Step/              OSS音楽生成の最前線。.venv済み(torch 2.13, MPS対応)
│   └── 初回生成時にモデル(数GB)がDLされる
├── davinci-resolve-mcp/   Resolve MCPサーバー（Claude Code登録済み）
└── reference/             読むための完成品
    ├── hyperframes-launches/   HeyGen自社動画のコンポジション（リミックス可）
    ├── remotion-templates/     Remotion無料テンプレ81種
    ├── audiocraft/             MusicGen/AudioGenソース（参照用）
    ├── motionity/              Web製OSSモーションエディタ
    └── vsrepo/                 VapourSynthパッケージマネージャ
```

## Python venv

| venv | 中身 | 用途 |
|---|---|---|
| `~/.mv-tools-venv` | exolib(git版) / pyJianYingDraft / OpenTimelineIO / PySceneDetect | 編集データ(exo/CapCut草稿/OTIO)の読み書き、カット検出 |
| `~/.hyperframes-tts-venv` | kokoro-onnx / MusicGen(transformers) / fontTools | HyperFrames音声パイプライン（既存） |
| `ACE-Step/.venv` | ACE-Step一式 | 楽曲生成 |

## クイックコマンド

```bash
# Remotion
cd remotion-mv && npx remotion studio        # プレビューUI
npx remotion render HelloWorld out/video.mp4

# ACE-Step（初回はモデルDL）
cd ACE-Step && .venv/bin/python -m acestep.gui   # または acestep --help

# exo生成（AviUtl資産）
~/.mv-tools-venv/bin/python -c "from exolib import EXO; ..."   # cp932必須

# カット検出 → exo/OTIOに流す
~/.mv-tools-venv/bin/scenedetect -i input.mp4 detect-content list-scenes

# VapourSynth
vspipe --version
```

## アプリ / MCP

- **Aegisub** (`/Applications/Aegisub.app`) — カラオケ字幕 Karaoke Templater
- **VapourSynth** (brew) — 映像加工・復元スクリプト。vsrepoは reference/vsrepo
- **DaVinci Resolve MCP** — Claude Code登録済み。Resolve起動 + Preferences>General>External scripting=Local が前提
- **remotion-templates MCP** — `https://www.reactvideoeditor.com/api/mcp`（video-editプロジェクトのlocal configに登録済み）
- **HyperFrames** — 既存 `videos/` 側（faceless-explainer等のワークフロー導入済み）

## 使い分け（研究ドキュメント§11.5の結論）

- エフェクト濃い短尺カット（GSAP/Lottie/Three.js流用）→ HyperFrames
- 長尺の骨格・歌詞レイヤー・音同期 → Remotion（TextAlive + visualizeAudio + Tone.js）
- **ボイス生成 → `~/.superset/projects/voice-gen`**（Gemini TTS: `gemini_tts.py` / VoxCPMクローン: `narrate.py`。利用例は `videos/game-lighting-explained/scripts-local/gemini-narrate.py`）
- 両者のMP4を ffmpeg concat で結合（fps/解像度/ピクセルフォーマットを揃える。音声は最後に一括ミックス）

素材・完成品のリンク集は **[ASSETS.md](ASSETS.md)** を参照。粒子系は **[PARTICLES.md](PARTICLES.md)**、シェーダー/VFXは **[SHADERS.md](SHADERS.md)**。

## 単体アニメーション・ラボ（2026-08-25〜）

| ディレクトリ | 内容 | 技術 | ビルド |
|---|---|---|---|
| `css-transitions/` | ページ遷移3種（渦・泡・コミック斜線） | CSSのみ | なし（index.html直） |
| `particle-lab/` | 粒子リング/銀河/球殻/バースト、42,000粒 | three.js Points + GPU頂点シェーダー | `node build.mjs` |
| `shader-lab/` | 雨ガラス・ディゾルブ・Bloom/ビネット/色収差 | three.js GLSL + EffectComposer | `node build.mjs` |
| `lottie-humans/` | ポップな人物アニメ4種（Lottie JSON生成） | lottie-web、`gen.mjs` でJSON生成 | `node gen.mjs` |
| `text-lab/` | テキストアニメ8種（Pop/Wave/Typewriter/Glitch/Mask/Focus/Swap/Karaoke） | GSAP 3.15 + SplitText | `node build.mjs` |
| `layered-scene/` | z-index積層シーン4種: `index.html`=ベクター夕焼け(13層) / `shinkai.html`=新海風（CC0空写真×16層、空プリセット5種、`node build.mjs`でArtifact版） / `kotonoha.html`=言の葉の庭風（緑の池×12層、楓900枚・波紋・雨） / **`kotonoha-ai.html`=同シーンのAI画像パーツ版**（`~/.superset/projects/opengpt`でChatGPT画像生成した水面・枝葉・浮き葉6種を `img-gen/` に保存し、エッジ密度マスクで切り抜いてCSS 12層に合成。`node build-kotonoha-ai.mjs`でArtifact版） | CSS/SVG (+Poly Haven CC0写真 / ChatGPT生成画像) | shinkai: `node build.mjs` / kotonoha-ai: `node build-kotonoha-ai.mjs` |
| `genshin-sea/` | 原神風の海シェーダー（全自作GLSL）。シーンRTの深度差→水層の厚さ→エメラルド→群青の吸収、Gerstner波×4、深度からの岸フォーム（トゥーン帯）+波頭フォーム、段階化スペキュラ+きらめき、シーンカラー屈折で砂地が透ける、Worleyコースティクス、トゥーン島+空ドーム。スライダー: 波/泡距離/透明度/太陽、深度デバッグ | three.js ShaderMaterial + DepthTexture | `node build.mjs` |
| `toon-lab/` | セルシェーディング3アプローチ: ①MeshToonMaterial+gradientMap(DataTexture生成) ②自前ShaderMaterial（ceil(i·steps)/steps量子化拡散・step()ハードスペキュラ・(1−N·V)^eリム・影色ティント） ③輪郭=インバーテッドハル（BackSide+法線押し出し）／深度+法線バッファのRoberts crossエッジ検出（ポストプロセス）。参照: manbust/three-js-toon-shader, mayacoda/toon-shader, EvanBacon/横山氏CodePen, moonjump解説 | three.js | `node build.mjs` |
| `live2d-lab/` | Live2Dビューア（軽量版）。視線追従・表情・モーション・口パク。**Cubism 4モデル(Hiyori)まで**。Cubism 5.3モデルはpixi-live2d-displayの旧Frameworkが非対応 | pixi.js 7 + pixi-live2d-display | `node build.mjs`、`?model=hiyori` |
| `live2d-official/` | **Live2D公式 Cubism SDK for Web**（CubismWebSamples + Framework 5.3 + Core 6.0.1）。ユーザーの `ren_ja`(Cubism 5.3 PRO) が動く本命。ドラッグで視線、タップでモーション、歯車でモデル切替 | 公式TS Framework + vite | `cd Samples/TypeScript/Demo && node copy_resources.js && npx vite build --mode development`（tscは.d.ts不足で飛ばす）→ `python3 -m http.server 8774 --directory dist`。**Artifact版**: `node build-artifact.mjs` → `ren-viewer.artifact.html`（Core+バンドル+Ren/Hiyori一式を仮想FSに埋め、fetch/Image.srcをフックして解決。Hiyoriテクスチャは1024に縮小、Renは2048版。8.4MB） |
| `boardly-ad-web/` | Boardly広告のスタンドアロンHTML版（再生/一時停止/リプレイ、BGM同期） | GSAP + 自前クリップ表示制御 | `index.artifact.html` はBGM埋め込み版（Artifact公開用） |
| `../videos/boardly-ad/` | Boardly 10秒広告のコード再現（7カット、SVG/CSS+GSAP、HyperFramesでMP4化） | HyperFrames | `npx hyperframes render` |
| `molecule-3d/` | 分子ビューア（保留） | InstancedMesh | `esbuild` 手動 |

three.js は `remotion-mv/node_modules` を symlink で共有（各ラボの `node_modules` → `../remotion-mv/node_modules`）。Artifact公開用に esbuild で単一HTMLにインライン化する。

## 未導入（理由付き）

- AviUtl本体 / AviUtl2 — Windows専用。exoデータの読み書きはexolibでmacからも可能
- nexrender — After Effects未インストールのため
- Nuke/Nukepedia — 有償（非商用版は手動DL）
- 剪映6+の草稿 — 暗号化のためpyJianYingDraftは5.9以下対応
- ACE-Stepのモデル重み — 初回実行時に自動DL（事前DLは省略）
