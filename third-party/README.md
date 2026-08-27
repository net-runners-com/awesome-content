# third-party

リポジトリに**含めない**外部クローン・大容量アセットの復元手順と、その上に置いた自作ファイルの置き場。

```bash
./third-party/setup.sh   # clone + symlink + パッチ + HDRI ダウンロード（冪等）
```

| 除外パス | 元 | サイズ | 備考 |
|---|---|---|---|
| `opencut-classic/` | OpenCut-app/opencut-classic | 2.2G | `apps/web/.env.local` は各自作成（`.env.example` 参照） |
| `mv-toolchain/ACE-Step/` | ace-step/ACE-Step | 1.7G | `.venv` 込み。`gen-*.py` は `ace-step/` からリンク |
| `mv-toolchain/live2d-official/` | Live2D/CubismWebSamples | 206M | Ren モデル差し替え・`lappdefine.patch`・Core 6.0.1 |
| `mv-toolchain/davinci-resolve-mcp/` | samuelgursky/davinci-resolve-mcp | 87M | venv 込み |
| `mv-toolchain/reference/*` | 5 リポジトリ | 133M | 読むだけ |
| `mv-toolchain/assets-cc0/skies/*.jpg` | Poly Haven (CC0) | 178M | 12枚、URL は setup.sh |

Live2D の `Samples/Resources/Ren/` は `mv-toolchain/live2d-lab/model/` と同一内容（コピー）。
`artifact-tmp/hiyori1024/` は `sips -Z 1024` で Hiyori.2048 を縮小したもの（`build-artifact.mjs` が参照）。
