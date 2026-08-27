# Boardly 10秒広告 — 再生成用プロンプト集

元動画: `AQMy393...KoQE.mp4` / 1280x720 / 24fps / 10.11秒 / 240フレーム / 音声あり(AAC 48kHz stereo, mean -17.4dB)

---

## 1. カット表（実測）

| # | 時間 | 画面 | コピー |
|---|---|---|---|
| A | 0.0–2.0s | クリーム地。付箋・画像カード・URLバー・チェックリスト・ブラウザ窓が点線で繋がって散乱。右上に紫ブロブ、左下にピンクブロブ | 情報、**?**<br>**散らかって**<br>ませんか？ |
| B | 2.0–3.5s | ピンクの円ワイプで転換。マゼンタ地。ノートPCに向かう男性、周囲に「画像」「メモ」「URL」の吹き出しとカードが浮遊 | **探すのが大変…**（下線） |
| C | 3.5–4.0s | 濃紫地に転換。カードが降ってきてブラウザ窓に吸い込まれる | Boardlyなら |
| D | 4.0–5.5s | Boardly UI（サイドバー＋カードボード）がせり上がる。カード間を矢印が結ぶ | 集めて |
| E | 5.5–7.5s | クリームのカード面。①保存 ②整理 ③共有 の3ステップ、右から女性が登場して指差し。カードをドラッグする演出 | **集めて、整理して、**<br>**すぐに使える**（下線） |
| F | 7.5–8.5s | 濃紫地。保存→整理→活用 の3枚フロー、矢印で連結、最後にチェックマーク | **必要な情報が**<br>**すぐ見つかる** |
| G | 8.5–10.1s | クリーム地。左にデバイス3種のモックアップ、右に「Boardly」ロゴがタイプオン。下にCTAボタン | 散らかった情報を、**ひとつの場所**に。<br>[ 無料で使ってみる → ] |

## 2. パレット（実測サンプリング）

| 用途 | HEX |
|---|---|
| 背景クリーム | `#E6E3D4` |
| 線・濃色地・本文 | `#3E2E52` |
| ブランドピンク | `#D24E6C` |
| ラベンダー（イラスト面） | `#8B7BA8` |
| 淡ライラック（グレー代わり） | `#C4B8CC` |

---

## 3. 共通スタイルブロック（各シーンプロンプトの先頭に必ず付ける）

```
Flat 2D vector illustration for a Japanese SaaS commercial. Editorial motion-graphics
look: uniform 3px dark-plum outlines (#3E2E52), flat fills, no gradients, no drop
shadows, no 3D, no photorealism. Palette strictly: cream #E6E3D4, deep plum #3E2E52,
raspberry pink #D24E6C, muted lavender #8B7BA8, soft lilac #C4B8CC. Large organic
blob shapes in pink and lavender bleeding off the edges. Rounded corners everywhere.
Decorative accents: small four-point sparkles, short radial impact lines, dashed
connector curves. Japanese text set in a heavy rounded gothic (Zen Maru Gothic Bold /
Rounded M+ style), perfectly legible, correct kanji. Aspect ratio 16:9, 1280x720.
```

## 4. シーン別プロンプト（Nano Banana / Gemini 2.5 Flash Image）

### A — 問題提起
```
[共通スタイルブロック]

Scene: scattered digital clutter on a cream background. Floating cards tilted at
random angles: a paper sticky note with a paperclip and two pink underlined lines of
handwriting, a photo card showing a purple mountain-and-sun thumbnail, a raspberry
folder tab, a lavender URL bar reading "https://link.com/tat", a checklist clipboard
with two pink checkmarks and two empty boxes, and two browser windows with placeholder
text bars. Thin dashed curves loop between them. A cursor arrow sits near the photo
card. Large lavender blob upper-right, raspberry blob lower-left.
Text block on the right half, three lines, right-heavy composition:
line 1 "情報、" in deep plum with a large raspberry "？" beside it,
line 2 "散らかって" in raspberry,
line 3 "ませんか？" in deep plum.
```

### B — 共感
```
[共通スタイルブロック]

Scene: raspberry-to-plum background. A young Japanese man in a lavender sweater with
a raspberry inner shirt sits at a cream laptop, seen from the front, mouth slightly
open in a troubled expression. Around his head float speech bubbles labeled "画像",
"メモ", "URL" plus scattered photo cards, an envelope icon, and checklist cards, all
crowding him. Bottom-left large text "探すのが大変…" in cream with a raspberry
underline sweeping under the first three characters.
```

### C — 転換
```
[共通スタイルブロック]

Scene: deep plum background with a lavender wave shape sweeping across. Cards, photo
thumbnails, envelopes and note cards tumble downward toward a cream browser window
opening at the center, as if being vacuumed in. A small cream memo in the upper left
reads "メモモバイ" style scribble lines. Small text upper-left in cream: "Boardlyなら".
Sparkles scattered.
```

### D — プロダクト
```
[共通スタイルブロック]

Scene: deep plum and raspberry blob background. Centered, a large cream browser window
UI mockup of a bookmarking app: left sidebar with icon rows, a top search bar with the
"Boardly" wordmark and a "B" logo tile, and a board area with a 3x2 grid of content
cards — photo cards with purple mountain thumbnails, text cards with grey line
placeholders — connected by thin raspberry arrows. Three small pill-shaped category
tags above the cards. A cursor arrow hovers over one card. Sparkles at the corners.
Small cream text upper-left: "集めて".
```

### E — 3ステップ
```
[共通スタイルブロック]

Scene: a large cream rounded card fills the frame over a raspberry-and-plum blob
background. Small "B Boardly" logo lockup top-left. Headline centered at top, two
lines: "集めて、整理して、" in deep plum and "すぐに使える" in deep plum with a
raspberry brush underline under the first three characters. Below, three plum panels
in a row, each numbered with a raspberry circle badge 1, 2, 3, and each capped with a
raspberry pill label: panel 1 an inbox tray with a plus badge, label "保存"; panel 2 a
grid of thumbnails with one highlighted in raspberry, label "整理"; panel 3 a share
node icon, label "共有". A "+" sign between panels 1-2 and 2-3. On the right, a
Japanese woman with shoulder-length dark hair in a lavender top gestures toward panel
3, smiling. A small floating window with a 3x3 thumbnail grid overlaps panel 2, being
dragged by a cursor. Short raspberry impact lines at the corners.
```

### F — ベネフィット
```
[共通スタイルブロック]

Scene: deep plum background with raspberry and lavender blobs. Headline top-center,
two lines: "必要な情報が" in cream, "すぐ見つかる" in raspberry. Below, three cream
cards in a row connected by raspberry arrows: card 1 an inbox tray with a plus badge
labeled "保存" on a dashed outline, card 2 a browser window with a grid of thumbnails
and small arrows labeled "整理", card 3 a document list with a large raspberry
checkmark labeled "活用". A cursor arrow near the third card. Sparkles.
```

### G — ロゴ＋CTA
```
[共通スタイルブロック]

Scene: plain cream background, generous whitespace. Left half: a device mockup cluster
— a large browser window showing the Boardly board UI (sidebar, search bar, grid of
photo and text cards linked by raspberry arrows), overlapped by a small laptop
mockup at lower-left and a tablet mockup at lower-right. Right half: the wordmark
"Boardly" in deep plum, heavy geometric sans, where the counter of the letter "o" is
filled raspberry; three short raspberry impact lines at its upper right. Below both,
centered, one line of Japanese: "散らかった情報を、" in deep plum then "ひとつの場所"
in deep plum with a raspberry underline then "に。". Beneath it a deep plum pill button
with cream text "無料で使ってみる" and a raspberry arrow "→", with a raspberry sparkle
at its right edge.
```

---

## 5. Veo（動画を直接生成する場合）

Veo 3.1 は日本語テキストの描画が不安定なので、**テキストなしで動きだけ作り、文字は後乗せ**が現実的。

```
A 10-second flat 2D vector motion graphics commercial, Japanese SaaS style.
Palette: cream #E6E3D4, deep plum #3E2E52, raspberry pink #D24E6C, lavender #8B7BA8.
Uniform thick plum outlines, no gradients, no 3D, no photorealism.

0-2s: scattered note cards, photo cards, URL bars and browser windows drift and rotate
gently over a cream background, connected by dashed curves. Camera holds static.
2s: a raspberry circle wipes from the left edge across the frame.
2-3.5s: a man at a laptop, surrounded by floating labeled bubbles that orbit him.
3.5-4s: cut to plum background, cards tumble downward and get sucked into a browser
window that opens at center.
4-5.5s: the browser window scales up; cards populate a grid one by one; thin arrows
draw themselves between cards.
5.5-7.5s: cut to a cream card layout, three numbered panels slide in from the left one
after another, a woman slides in from the right and gestures at the third panel.
7.5-8.5s: cut to plum background, three cards connect with arrows drawing left to
right, a checkmark pops on the last one.
8.5-10s: cut to cream background, device mockups slide in from the left, a wordmark
types on from the right, a pill button pops in below with a sparkle.

Snappy easing, small overshoot on every element entrance. Upbeat light corporate BGM.
No on-screen text.
```

## 6. 運用メモ

- **推奨**: Nano Banana で A〜G の7枚を1280x720で生成 → OpenCut/AEで各カット1.0〜2.0秒に配置 → 入りをスケール+フェード、要素はレイヤー分けして個別にオフセット。元動画は全カットが「要素が順に飛び込む」構造なので、静止画1枚から作るならレイヤー分解が必須。
- **文字**: 画像モデルの日本語は崩れることがある。崩れたら該当箇所を空けて生成し、エディタ側でテキストレイヤーとして乗せる（Zen Maru Gothic Bold 推奨）。
- **一貫性**: A で生成した1枚を参照画像として B〜G の生成に添付すると、線の太さとパレットが揃いやすい。
- **音**: 元は BGM のみと推定（未検証：ナレーション有無は波形からは判別していない）。Veo 3.1 は音声も生成するので、BGM を別で用意するなら「no audio」指定を足す。
