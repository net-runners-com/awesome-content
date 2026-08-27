# 素材・完成品リンク集

`~/Downloads/video-toolchain-research.md` に載っていた素材・完成品・配布サイトの抜き出し。
方針: **ゼロから作らせず、完成物をテキストとして編集する**。ライセンスは末尾参照。

## 1. Lottie（在庫最大・JSON直編集）

| サイト | 内容 |
|---|---|
| [LottieFiles](https://lottiefiles.com/) | 80万点超の無料・有料アニメーション |
| [Lottie JSONプレイグラウンド](https://lottiefiles.github.io/lottie-docs/playground/json_editor/) | 仕様＋その場で編集 |
| [IconKing](https://iconking.net/preview) | 500点、アカウント不要 |
| [Lottielab プレビュー](https://www.lottielab.com/lottie/preview-lottie) | プレビュー用 |

用途: 実写/絵の上に乗せるモーショングラフィックス・アイコンの**素材レイヤー**。色・テキスト・タイミングはJSONの数値編集。

## 2. CSS / Web アニメーション完成品（コピペ前提）

| サイト | 内容 |
|---|---|
| [Uiverse.io](https://uiverse.io/) / [animationタグ](https://uiverse.io/tags/animation) | CSS/Tailwind製パーツ。ローダーだけで1200点超、全部無料コピペ |
| [Animista](https://animista.net/) | 既製CSSアニメを試して使う分だけDL |
| [Animate.css](https://animate.style/) | 定番CSSアニメ集 |
| [CSS Loaders](https://css-loaders.com/) | 単一div・600種超 |
| [Codrops](https://tympanus.net/codrops/) | デモ付きエフェクト集20年分 |
| [Hover.css](https://ianlunn.github.io/Hover/) | ホバーエフェクト集 |
| [CSSAWWWARDS](https://cssawwwards.com/) | CSSツール・スニペットのキュレーションディレクトリ（37+ツール、スニペット集、@property等の解説記事）。[CSS Animation Snippets 2026](https://cssawwwards.com/blog/css-animation-snippets-2026) はフェード/ライズ、スピナー2種、ドットパルス、スライドイン、アコーディオン、バッジ波紋、ハートビート、シマースケルトン、スタガーリスト、カードリフト、下線スライドの14種 + reduce-motion対応パターン |

## 3. Reactコンポーネント集（エフェクトのネタ元）

| サイト | 内容 |
|---|---|
| [React Bits](https://reactbits.dev/) | 110点以上。テキストエフェクト・背景アニメ。CSS版/Tailwind版両対応 |
| [Aceternity UI](https://ui.aceternity.com/components) | 262点。オーロラ背景、スパークル、3Dカード、SVGモーフ。**MCPでClaude Codeに引き込める** |
| [Magic UI](https://magicui.design/) | 150点以上。shadcn/ui互換 |
| [21st.dev](https://21st.dev/) | 横断レジストリ |

使い方: **見た目のカタログ＋DOM設計図**として使い、モーション部分だけRemotionの`interpolate`/`spring`にAIで移植（HyperFramesならGSAPのまま持ち込み可）。

## 4. AviUtl 完成品（PF / exo配布）

**まとまって置いてある**
- [BOOTH「AviUtl」検索](https://booth.pm/ja/search/AviUtl) / [「プロジェクトファイル」検索](https://booth.pm/ja/search/%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB)
- キーマの動画倉庫: [モーショングラフィックス15種](https://booth.pm/ja/items/2689317) / [ローワーサード8種](https://booth.pm/ja/items/2227221) / [トランジション3種](https://booth.pm/ja/items/2284608)
- [神音の社（自作素材100種）](https://shion-no-yahiro.com/self-made01/)

**ガチ作例（MV・音MAD系）**
- [ニコニコ「AviUtlプロジェクトファイル配布動画」タグ](https://www.nicovideo.jp/tag/AviUtl%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E9%85%8D%E5%B8%83%E5%8B%95%E7%94%BB)（BowlRoll+パスワード=動画番号の運用が多い）
- [YTPMV.info（音MAD系EXO）](https://ytpmv.info/105/)
- [なっと氏のPF配布](https://note.com/nut_kun/n/na4872fe6de4d)
- [独楽こまり氏（自作スクリプト＋作例）](https://note.com/komarin2680/m/mcbcc31c45818)

**依存スクリプト解決用**
- [AviUtl Wiki スクリプト一覧](https://aviutl.memo.wiki/d/%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8%B0%EC%CD%F7)
- [おすすめ10選（神音の社）](https://shion-no-yahiro.com/recommended-script/) / [まとめ（AKETAMA）](https://aketama.work/aviutl_recommend_script)
- [音MAD向け](https://note.com/poison_fox/n/n756070c4e2d2) / [実況向け](https://aviutl.info/jikkyou-matome/) / [導入方法](https://aketama.work/aviutl-add-script)

注意: 依存スクリプト（さつき氏イージング等）が無いと再現されない。Readme先読み必須。

## 5. サウンド素材（日本語圏が強い）

| サイト | 規模 | 条件 |
|---|---|---|
| [DOVA-SYNDROME](https://dova-s.jp/)（[SEのみ](https://dova-s.jp/se)） | BGM 19,137曲 / SE 1,296音 | 商用可・連絡不要。雰囲気タグ検索がMV向き |
| [効果音ラボ](https://soundeffect-lab.info/) | 日本最大級 | クレジット・報告一切不要 |
| [OtoLogic](https://otologic.jp/) | 5000点超 | CC BY 4.0（クレジット必須） |
| [魔王魂](https://maou.audio/) | レトロゲーム風豊富 | クレジット推奨 |
| [Freesound](https://freesound.org/) | 71万点以上 | CC各種（素材ごと確認） |
| [Zapsplat](https://www.zapsplat.com/) | 16万点以上 | 要確認 |

AI生成: [ElevenLabs](https://elevenlabs.io/)（SE生成・無料枠）/ Adobe Firefly / MyEdit / [AudioCraft](https://github.com/facebookresearch/audiocraft)（ローカル、reference/に取得済み）

**ボイス（ナレーション・セリフ）は `~/.superset/projects/voice-gen` を使う（決定事項）**
- `gemini_tts.py` — Gemini TTS。長文一発生成でトーンのブレなし、スタイル指示・声名指定可（低音系: Charon/Algenib/Alnilam/Gacrux/Schedar/Rasalgethi）
- `narrate.py` — VoxCPM2ローカルクローン音声で長文朗読（参照wav固定・チャンク間音量補正済みの実証済みスクリプト）
- 動画パイプラインからの利用例: `videos/game-lighting-explained/scripts-local/gemini-narrate.py`（行別スタイル指示→フレーム単位wav差し替え）

MVでの定石: SEは入れすぎない。カット頭のスウッシュ＋ここぞの1発。低域カットして薄く。演出音（スウッシュ/ヒット）はTone.jsでコード合成するとフレーム完全同期。

## 6. 歌詞・字幕まわり

- [TextAlive App API](https://developer.textalive.jp/)（[始め方](https://developer.textalive.jp/app/)） — 歌詞タイミング・サビ位置・ビートがAPIで取れる。**[マジカルミライ プロコン過去6年分](https://developer.textalive.jp/events/)の入選作コードが読める**
- [Aegisub Karaoke Templater 公式doc](https://aegisub.org/docs/latest/automation/karaoke_templater/)
- [GitHub karaokeトピック(Lua)](https://github.com/topics/karaoke?l=lua)（Japanese-Anime-OPED-ASS-Template等）
- [Aegisub&PyonFX エフェクト集](https://github.com/kakashi1987/aegisub-lua-pyonfx-karaoke-fx-collection)
- [テンプレータ比較（stock/KaraOK/The0x's）](https://github.com/TypesettingTools/arch1t3cht-Aegisub-Scripts/blob/main/doc/templaters.md)

## 7. Remotion / HyperFrames の完成品

- [remotion-templates 81種](https://github.com/reactvideoeditor/remotion-templates)（reference/取得済み）
- [Remotionギャラリー](https://www.reactvideoeditor.com/remotion-templates) / MCP: `https://www.reactvideoeditor.com/api/mcp`（登録済み）
- [hyperframes-launches](https://github.com/heygen-com/hyperframes-launches)（reference/取得済み。STORYBOARD/SCRIPT/HANDOFF付きの実制作ソース）
- [音反応の実装例（ポップコーンビジュアライザ）](https://remotiontemplates.dev/articles/remotion-popcorn-sound-visualizer)

## 8. その他の完成品エコシステム

- [Nukepedia](https://www.nukepedia.com/) — 数千gizmo（.nk/.gizmoはテキスト）
- DaVinci Fusion: Reactor（steakunderwater.comのReactorスレッド）/ [無料プリセットまとめ](https://www.miracamp.com/learn/davinci-resolve/free-presets)
- [GSAP](https://gsap.com/) — **2025年4月に全プラグイン無料化**。MV主砲はSplitText（文字分解）とMorphSVG
- [AviSynth外部フィルタ一覧](http://avisynth.nl/index.php/External_filters)

## 9. 定点観測（更新順で見る）

**awesomeリスト**（最終コミット日を先に見る）
- [awesome-audio-generation](https://github.com/backblaze-labs/awesome-audio-generation) / [awesome-video-generation](https://github.com/backblaze-labs/awesome-video-generation)
- [awesome-ai-media](https://github.com/JuneYaooo/awesome-ai-media)（週次更新・比較表）
- [awesome-video](https://github.com/sitkevij/awesome-video) / [awesome-web-animation](https://github.com/sergey-pimenov/awesome-web-animation)
- [awesome-ai-music-generation](https://github.com/Curated-Awesome-Lists/awesome-ai-music-generation) / [awesome-realtime-video-generation](https://github.com/yepicaiaaron/awesome-realtime-video-generation)

**GitHub Topics**（`?o=desc&s=updated` を付けて生きてるリポジトリだけ見る）

```
https://github.com/topics/video-generation
https://github.com/topics/audio-generation
https://github.com/topics/motion-graphics?o=desc&s=updated
https://github.com/topics/motion-design
https://github.com/topics/web-animation
https://github.com/topics/animation-library
https://github.com/topics/ai-video-generation?o=desc&s=updated
https://github.com/topics/aviutl-exo
https://github.com/topics/jianying-draft
https://github.com/topics/karaoke?l=lua
```

## 10. ライセンス早見

| 対象 | 条件 |
|---|---|
| AviUtl配布物 | 使用OK / データ本体・改変物の販売・再配布は禁止が最多。**クライアント納品は要確認** |
| Remotion | 企業規模で有償。完全MITが必要なら Revideo / Motion Canvas |
| GSAP | 全プラグイン無料・商用可（Permitted/Prohibited区分あり） |
| OtoLogic | CC BY 4.0 クレジット必須（有償で不要化可） |
| DOVA-SYNDROME / 効果音ラボ | 商用可・クレジット不要（素材ごとの個別条件は確認） |
| Lottie | 無料/有料混在。マーケット素材は元ライセンス確認 |

## 11. ダウンロード済みCC0素材（このリポジトリ内）

- `assets-cc0/skies/` — **Poly Haven の空HDRI（トーンマップ済JPG・16K）12枚、CC0**。belfast_sunset / kloofendal_48d_partly_cloudy / industrial_sunset / evening_road_01 / kloppenheim_06 / qwantani_dusk_2 / wasteland_clouds / sunflowers / table_mountain_1（以上puresky）+ kiara_9_dusk / venice_sunset / umhlanga_sunrise。取得元: `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/<id>.jpg`（APIは `api.polyhaven.com/assets?t=hdris`、空だけなら `&c=skies`、計298枚）
- `layered-scene/img/` — 上記から太陽周辺を1920x843に切り出した背景用クロップ5枚（新海風シーン `shinkai.html` が使用）
- クレジット不要（CC0）だが、表記するなら「HDRIs: Poly Haven (polyhaven.com), CC0」

## 12. AI生成パーツ（ChatGPT画像生成 via `~/.superset/projects/opengpt`）

`layered-scene/img-gen/` — 言の葉の庭風シーン `kotonoha-ai.html` 用。ChatGPTのfreeプランで生成（1枚あたり2〜4分、1日の枚数上限あり）。

| ファイル | 内容 | 後処理 |
|---|---|---|
| `branch1.png` (1536x1024) | 逆光の楓の枝葉クラスター（ボケ背景付き） | `branch1-cut.png`: 高周波（葉）とボケ（背景）の**エッジ密度**でアルファを自動生成して切り抜き（PIL）。u2net(`hyperframes remove-background`)は全面葉なので失敗 |
| `water1.png` (1792x896) | 緑の池の水面・映り込み・波紋 | `water1-web.jpg` 1600w |
| `leaves-sheet.png` | 白背景に楓の葉6枚 | `leaf1..6.png`: 白→アルファ変換＋マット除去で個別スプライト化 |

**生成→取得の手順**（`send`は画像完成まで待つが、フラグは末尾に置く: `--json`等は直後の引数を値として飲むため）
```bash
cd ~/.superset/projects/opengpt
node cli.mjs send --account google "画像を生成してください。…" --timeout 300000
node cli.mjs convos --account google --limit 1            # 会話id
node cli.mjs get --account google <id> --raw | grep -o '"asset_pointer":"[^"]*"'   # sediment://file_xxx
node fetch-file.mjs google file_xxx out.png               # bearer+cookie付きでDL（署名URL単体は "File stream access denied"）
```
透過背景を頼んでも実際は不透明で返る。単体オブジェクトは白背景で頼んで後処理で抜くのが確実。
