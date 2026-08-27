#!/usr/bin/env python
"""ACE-Step でゲーム紹介動画用BGMを生成する（インスト、MPS/float32）。"""
import sys
from acestep.pipeline_ace_step import ACEStepPipeline

OUT = sys.argv[1] if len(sys.argv) > 1 else "outputs/pokemon-bgm.wav"
DURATION = float(sys.argv[2]) if len(sys.argv) > 2 else 80.0

pipe = ACEStepPipeline(
    checkpoint_dir="",          # 空なら自動ダウンロード
    dtype="float32",            # MPSはbf16非推奨
    torch_compile=False,
    cpu_offload=True,
    overlapped_decode=True,
)

pipe(
    audio_duration=DURATION,
    prompt=("uplifting adventurous game trailer music, bright orchestral pop with "
            "chiptune accents, steady driving beat, hopeful, energetic, instrumental, no vocals"),
    lyrics="[inst]",
    infer_step=27,
    guidance_scale=15.0,
    scheduler_type="euler",
    cfg_type="apg",
    omega_scale=10.0,
    manual_seeds="42",
    guidance_interval=0.5,
    guidance_interval_decay=0.0,
    min_guidance_scale=3.0,
    use_erg_tag=True,
    use_erg_lyric=True,
    use_erg_diffusion=True,
    oss_steps="",
    guidance_scale_text=0.0,
    guidance_scale_lyric=0.0,
    save_path=OUT,
)
print("saved:", OUT)
