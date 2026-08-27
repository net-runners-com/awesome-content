#!/usr/bin/env python3
"""Gemini TTS でナレーションをフレーム単位に生成し assets/voice/NN.wav を差し替える。
voice-gen/gemini_tts.py の流用。漢字テキストを直接読めるためかな書き不要。

使い方:
    python3 scripts-local/gemini-narrate.py            # 全10行生成
    python3 scripts-local/gemini-narrate.py 01 04      # 指定行のみ
"""
import base64, json, os, sys, urllib.error, urllib.request, wave
from pathlib import Path

ROOT = Path(__file__).parent.parent
VOICE_GEN = Path("/Users/hirotodev0622i/.superset/projects/voice-gen")
OUT_DIR = ROOT / "assets/voice"
MODEL = "gemini-3.1-flash-tts-preview"
RATE = 24000
VOICE = "Charon"

STYLE = (
    "あなたはプロの技術解説動画のナレーターです。低めの落ち着いた声で、"
    "明瞭な滑舌ではっきりと読み上げてください。句読点でしっかり間を取り、"
    "重要なキーワードはわずかに強調し、聞き手に語りかけるように。"
    "感情過多にせず、自信のある淡々としたドキュメンタリー調で。標準よりややゆっくり。\n"
)

# 表示原文（STORYBOARD voiceover と同一）+ 行別の演出指示
LINES = {
    "01": ("一拍ずつ区切り、最後の『光だ』を力強く言い切る。",
           "ゲームの画面の印象を決めるのは、モデルでもテクスチャでもない。光だ。"),
    "02": ("3つの名前を等間隔のリズムで、指を折るように。",
           "リアルタイムレンダリングの光源は、実質この3つ。点光源、ディレクショナルライト、そして環境光。名前だけ、まず覚えてしまおう。"),
    "03": ("例示の3語はリズミカルに。最後の一文は落ち着いて。",
           "点光源は、一点から全方向に光を放つ。たいまつ、ランプ、マズルフラッシュ。特徴は、距離とともに急激に暗くなること。拾えるアイテムの光など、視線誘導にも使われる。"),
    "04": ("『2倍なら、4分の1』を強調。後半は淡々と。",
           "物理では逆二乗則。距離が2倍なら、明るさは4分の1。エンジンでは係数付きの減衰式でカーブを調整し、減衰半径の外は計算を打ち切る。"),
    "05": ("『位置は持たず、方向だけを持つ』の前後で一拍置く。",
           "ディレクショナルライトは、無限遠から降り注ぐ平行光線。太陽や月の抽象化だ。位置は持たず、方向だけを持つ。だから、減衰しない。屋外のシーンでは、これが主光源になる。"),
    "06": ("正午と夕暮れの対比を、色が切り替わるようなテンポで。",
           "方向と色温度を変えるだけで、時間帯が作れる。真上の白は正午、低いオレンジは夕暮れ。影はカスケードシャドウマップで、近くほど高解像度に。タイムオブデイの基本は、この2つのパラメータだ。"),
    "07": ("少し柔らかいトーンに落とす。",
           "環境光は、空全体からの回り込みを近似する光。特定の光源を持たない。一番単純な形は、空の色を一定量、全ピクセルに足すこと。この光が、影の中を真っ黒にしない。"),
    "08": ("『空の画像そのものを光源にする』を聞かせどころに。",
           "現代のゲームは、イメージベースドライティング。空の画像そのものを、光源にする。さらにアンビエントオクルージョンで、隙間や凹みを暗くして、立体感を出す。"),
    "09": ("3つの役割を宣言調で区切る。最後の一文はテーゼとして着地させる。",
           "役割分担はこうだ。ディレクショナルが主光源。点光源がアクセント。環境光がベース。3つのバランスが、画作りの出発点になる。"),
    "10": ("静かに、誘いかけるように締める。",
           "次にシーンを開いたら、まず光を3つに分けて見てみよう。それだけで、シーンの見方が変わるはずだ。"),
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
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:500]}")
    cand = res["candidates"][0]
    parts = cand.get("content", {}).get("parts")
    if not parts:
        raise RuntimeError(f"no audio (finishReason={cand.get('finishReason')})")
    return base64.b64decode(parts[0]["inlineData"]["data"])


def save(pcm: bytes, path: Path) -> float:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(pcm)
    return len(pcm) / 2 / RATE


def main() -> None:
    ids = sys.argv[1:] or sorted(LINES)
    for i in ids:
        delivery, text = LINES[i]
        prompt = STYLE + f"（この行の演出: {delivery}）\n\n読み上げる文:\n{text}"
        dur = save(synth(prompt), OUT_DIR / f"{i}.wav")
        print(f"{i}: {dur:.2f}s  {text[:24]}...", flush=True)


if __name__ == "__main__":
    main()
