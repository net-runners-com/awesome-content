#!/usr/bin/env python3
"""ポケモン紹介動画のナレーション生成（voice-gen流用 / Gemini TTS）。
出力: public/pokemon/vo/NN.wav + public/pokemon/vo/durations.json
"""
import base64, json, os, subprocess, sys, urllib.error, urllib.request, wave
from pathlib import Path

ROOT = Path(__file__).parent.parent
VOICE_GEN = Path("/Users/hirotodev0622i/.superset/projects/voice-gen")
OUT_DIR = ROOT / "public/pokemon/vo"
MODEL = "gemini-3.1-flash-tts-preview"
RATE = 24000
VOICE = "Charon"

STYLE = (
    "あなたはゲーム紹介動画のプロのナレーターです。低めの落ち着いた声に、"
    "ワクワク感を一滴混ぜて。明瞭な滑舌、句読点でしっかり間を取り、"
    "キーワードをわずかに立てる。ドキュメンタリー調だが、冒険への誘いとして温かく。\n"
)

LINES = {
    "01": ("リズムよく畳みかけ、シリーズ名で落ち着いて着地。",
           "捕まえて、育てて、戦って、交換する。世界で一番売れたRPGシリーズ、ポケットモンスター。"),
    "02": ("数字を立てて読む。",
           "1996年、ゲームボーイから始まったこのシリーズは、いまや累計4億本を超える世界的タイトルだ。"),
    "03": ("4つの動詞を等間隔で。最後の一文はテーゼとして。",
           "遊びの核はシンプル。野生のポケモンを捕まえ、育てて、トレーナーとして戦い、仲間と交換する。この循環が、終わらない冒険を作る。"),
    "04": ("三すくみをリズミカルに。",
           "戦いの奥行きは、18のタイプ相性。水は炎に強く、炎は草に強く、草は水に強い。じゃんけんのような読み合いが、戦略を生む。"),
    "05": ("収集欲をくすぐるトーンで。",
           "そして、図鑑の完成というもうひとつのゴール。1000種類を超えるポケモンが、コレクター魂を刺激し続ける。"),
    "06": ("静かに、誘いかけるように締める。",
           "相棒と歩く、きみだけの冒険。ポケットモンスターは、その入口だ。"),
}


def api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        key = (VOICE_GEN / ".env").read_text().split("=", 1)[1].strip()
    return key


def synth(text: str) -> bytes:
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{MODEL}:generateContent?key={api_key()}")
    body = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "languageCode": "ja-JP",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}},
            },
        },
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        res = json.load(urllib.request.urlopen(req, timeout=600))
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")
    parts = res["candidates"][0].get("content", {}).get("parts")
    if not parts:
        raise RuntimeError("no audio returned")
    return base64.b64decode(parts[0]["inlineData"]["data"])


def save(pcm: bytes, path: Path) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(pcm)


def trim(path: Path) -> float:
    """先頭/末尾と長い間を圧縮して実尺を返す"""
    tmp = path.with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-af",
                    "silenceremove=start_periods=1:start_duration=0.12:start_threshold=-45dB:"
                    "stop_periods=-1:stop_duration=0.6:stop_threshold=-45dB",
                    str(tmp)], check=True)
    tmp.replace(path)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(out.stdout.strip())


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    durations = {}
    for i, (delivery, text) in sorted(LINES.items()):
        prompt = STYLE + f"（この行の演出: {delivery}）\n\n読み上げる文:\n{text}"
        p = OUT_DIR / f"{i}.wav"
        save(synth(prompt), p)
        durations[i] = round(trim(p), 3)
        print(f"{i}: {durations[i]}s", flush=True)
    (OUT_DIR / "durations.json").write_text(json.dumps(durations, indent=2))
    print("total:", round(sum(durations.values()), 1), "s")


if __name__ == "__main__":
    main()
