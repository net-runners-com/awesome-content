#!/usr/bin/env python
"""ポケモン紹介ナレーションを VoxCPM（voice-gen流用・ローカルクローン）で行別生成。
narrate.py の実証済み設定を踏襲: 参照wav固定 / cfg 2.0 / timesteps 10 / seed 42 /
80字チャンク / チャンク間±3dB補正。
実行: voice-gen/VoxCPM/.venv/bin/python scripts/pokemon-vo-voxcpm.py
"""
import json, re, subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from voxcpm import VoxCPM

VG = Path("/Users/hirotodev0622i/.superset/projects/voice-gen")
REF_WAV = VG / "work/ref/reference.wav"
REF_TXT = VG / "work/ref/reference.txt"
OUT_DIR = Path(__file__).parent.parent / "public/pokemon/vo"

MAX_CHARS = 80
GAIN_LIMIT_DB = 3.0
PAUSE_SENT = 0.22
SEED = 42

LINES = {
    "01": "捕まえて、育てて、戦って、交換する。世界で一番売れたRPGシリーズ、ポケットモンスター。",
    "02": "1996年、ゲームボーイから始まったこのシリーズは、いまや累計4億本を超える世界的タイトルだ。",
    "03": "遊びの核はシンプル。野生のポケモンを捕まえ、育てて、トレーナーとして戦い、仲間と交換する。この循環が、終わらない冒険を作る。",
    "04": "戦いの奥行きは、18のタイプ相性。水は炎に強く、炎は草に強く、草は水に強い。じゃんけんのような読み合いが、戦略を生む。",
    "05": "そして、図鑑の完成というもうひとつのゴール。1000種類を超えるポケモンが、コレクター魂を刺激し続ける。",
    "06": "相棒と歩く、きみだけの冒険。ポケットモンスターは、その入口だ。",
}


def split_chunks(text: str) -> list[str]:
    if len(text) <= MAX_CHARS:
        return [text]
    parts = [p for p in re.split(r"(?<=。)", text) if p.strip()]
    chunks: list[str] = []
    for part in parts:
        if chunks and len(chunks[-1]) + len(part) <= MAX_CHARS:
            chunks[-1] += part
        else:
            chunks.append(part)
    return chunks


def rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(x)))) or 1e-9


def trim(path: Path) -> float:
    tmp = path.with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-af",
                    "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-45dB:"
                    "stop_periods=-1:stop_duration=0.6:stop_threshold=-45dB",
                    str(tmp)], check=True)
    tmp.replace(path)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(out.stdout.strip())


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    model = VoxCPM.from_pretrained(str(VG / "VoxCPM/pretrained_models/VoxCPM2"), load_denoiser=False)
    rate = model.tts_model.sample_rate
    prompt_text = REF_TXT.read_text(encoding="utf-8").strip()

    target_rms = None
    durations = {}
    for i, text in sorted(LINES.items()):
        pieces = []
        for ci, chunk in enumerate(split_chunks(text)):
            if ci:
                pieces.append(np.zeros(int(rate * PAUSE_SENT), dtype=np.float32))
            audio = np.asarray(model.generate(
                text=chunk,
                reference_wav_path=str(REF_WAV),
                prompt_wav_path=str(REF_WAV),
                prompt_text=prompt_text,
                cfg_value=2.0,
                inference_timesteps=10,
                seed=SEED,
            ), dtype=np.float32)
            if target_rms is None:
                target_rms = rms(audio)
            else:
                gain = np.clip(target_rms / rms(audio),
                               10 ** (-GAIN_LIMIT_DB / 20), 10 ** (GAIN_LIMIT_DB / 20))
                audio = audio * gain
            pieces.append(audio)
        wav = np.concatenate(pieces)
        peak = float(np.max(np.abs(wav)))
        if peak > 0.99:
            wav = wav / peak * 0.99
        p = OUT_DIR / f"{i}.wav"
        sf.write(str(p), wav, rate)
        durations[i] = round(trim(p), 3)
        print(f"{i}: {durations[i]}s", flush=True)

    (OUT_DIR / "durations.json").write_text(json.dumps(durations, indent=2))
    print("total:", round(sum(durations.values()), 1), "s")


if __name__ == "__main__":
    main()
