# awesome-content

動画・モーション・シェーダー・Live2D などの制作物とツールチェーン置き場。

| ディレクトリ | 中身 |
|---|---|
| `videos/` | HyperFrames プロジェクト（`boardly-ad`, `game-lighting-explained`） |
| `hyperframe/` | HyperFrames 雛形 |
| `mv-toolchain/` | アニメMV制作ツールチェーン。Remotion / 各種 lab（shader, toon, particle, text, molecule, genshin-sea, layered-scene, live2d, lottie）と `README.md` / `ASSETS.md` / `SHADERS.md` / `PARTICLES.md` |
| `third-party/` | 外部クローンの復元スクリプトと、その上に置く自作ファイル |
| `boardly-ad-prompts.md` | Boardly 広告の画像生成プロンプト |

各 lab は `template.html` + `src/` → `node build.mjs` → 単一ファイル `index.html`（Artifact 用）。
`node_modules` は `mv-toolchain/remotion-mv` のものを symlink で共有している。

## セットアップ

```bash
./third-party/setup.sh                 # 外部クローン + HDRI（約 4.3GB）
cd mv-toolchain/remotion-mv && npm i   # lab 共通の node_modules
```
