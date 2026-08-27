#!/usr/bin/env bash
# 3rd-party クローンを復元する（リポジトリには含めない）。冪等。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
clone() { [ -d "$2/.git" ] || git clone --depth 1 "$1" "$2"; }

clone https://github.com/OpenCut-app/opencut-classic.git            "$ROOT/opencut-classic"
clone https://github.com/ace-step/ACE-Step.git                       "$ROOT/mv-toolchain/ACE-Step"
clone https://github.com/samuelgursky/davinci-resolve-mcp.git        "$ROOT/mv-toolchain/davinci-resolve-mcp"
clone https://github.com/Live2D/CubismWebSamples.git                 "$ROOT/mv-toolchain/live2d-official"
clone https://github.com/reactvideoeditor/remotion-templates.git     "$ROOT/mv-toolchain/reference/remotion-templates"
clone https://github.com/facebookresearch/audiocraft.git             "$ROOT/mv-toolchain/reference/audiocraft"
clone https://github.com/alyssaxuu/motionity.git                     "$ROOT/mv-toolchain/reference/motionity"
clone https://github.com/vapoursynth/vsrepo.git                      "$ROOT/mv-toolchain/reference/vsrepo"
clone https://github.com/heygen-com/hyperframes-launches.git         "$ROOT/mv-toolchain/reference/hyperframes-launches"

# 自作スクリプトをクローン内へシンボリックリンク
ln -sfn ../../third-party/ace-step/gen-bgm.py     "$ROOT/mv-toolchain/ACE-Step/gen-bgm.py"
ln -sfn ../../third-party/ace-step/gen-pikaro.py  "$ROOT/mv-toolchain/ACE-Step/gen-pikaro.py"
ln -sfn ../../third-party/live2d-official/build-artifact.mjs "$ROOT/mv-toolchain/live2d-official/build-artifact.mjs"
ln -sfn ../third-party/opencut-classic/docker-compose.override.yml "$ROOT/opencut-classic/docker-compose.override.yml"

# live2d-official: Ren モデルを live2d-lab/model で上書き + ModelDir パッチ + Core 6.0.1
L2D="$ROOT/mv-toolchain/live2d-official"
cp -R "$ROOT/mv-toolchain/live2d-lab/model/." "$L2D/Samples/Resources/Ren/"
git -C "$L2D" apply --check "$ROOT/third-party/live2d-official/lappdefine.patch" 2>/dev/null \
  && git -C "$L2D" apply "$ROOT/third-party/live2d-official/lappdefine.patch" || true
mkdir -p "$L2D/Core"; cp "$ROOT/mv-toolchain/live2d-lab/vendor/live2dcubismcore.min.js" "$L2D/Core/"
# Framework サブモジュール
git -C "$L2D" submodule update --init --depth 1 || true

# Poly Haven 空HDRI (CC0, トーンマップ済JPG)
SKIES="$ROOT/mv-toolchain/assets-cc0/skies"; mkdir -p "$SKIES"
for id in belfast_sunset_puresky kloofendal_48d_partly_cloudy_puresky industrial_sunset_puresky \
          evening_road_01_puresky kloppenheim_06_puresky qwantani_dusk_2_puresky wasteland_clouds_puresky \
          sunflowers_puresky table_mountain_1_puresky kiara_9_dusk venice_sunset umhlanga_sunrise; do
  [ -f "$SKIES/$id.jpg" ] || curl -fsSL -o "$SKIES/$id.jpg" "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/$id.jpg"
done

echo "done. 次: cd mv-toolchain/remotion-mv && npm i / cd mv-toolchain/ACE-Step && python -m venv .venv && .venv/bin/pip install -e ."
