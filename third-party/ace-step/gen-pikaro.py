#!/usr/bin/env python
"""PIKARO(告知ランプ式パチスロ)のボーナス中BGMを作る。
昭和〜平成のパチスロらしい、明るくて短いループを狙う。"""
import sys
from acestep.pipeline_ace_step import ACEStepPipeline

NAME = sys.argv[1]
OUT = sys.argv[2]
DURATION = float(sys.argv[3])
PROMPT = sys.argv[4]
SEED = sys.argv[5] if len(sys.argv) > 5 else "7"

pipe = ACEStepPipeline(
    checkpoint_dir="", dtype="float32", torch_compile=False,
    cpu_offload=True, overlapped_decode=True,
)
pipe(
    audio_duration=DURATION,
    prompt=PROMPT,
    lyrics="[inst]",
    infer_step=27,
    guidance_scale=15.0,
    scheduler_type="euler",
    cfg_type="apg",
    omega_scale=10.0,
    manual_seeds=SEED,
    guidance_interval=0.5,
    guidance_interval_decay=0.0,
    min_guidance_scale=3.0,
    use_erg_tag=True, use_erg_lyric=True, use_erg_diffusion=True,
    oss_steps="", guidance_scale_text=0.0, guidance_scale_lyric=0.0,
    save_path=OUT,
)
print("saved:", NAME, OUT)
