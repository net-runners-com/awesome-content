---
format: 1920x1080
duration: 120s
message: "光源は3種の道具 — ディレクショナルが主光源、点光源がアクセント、環境光がベース"
arc: concept-explainer with process
audience: ゲーム開発・ゲームグラフィックスの学習者
mode: autonomous
music: dark minimal electronic tech underscore, steady pulse
---

## Video direction

- **palette system** (frame.md / broadside): 全フレーム **darkレジスター** — ground `ink-black`, text `cream`, accent `fire-orange`。この動画では **fire-orange = 「光」そのもの**: すべての光源・光線・グロー・減衰の可視化はfire-orange系で統一する。パネル/カード面は `ink-black-alt`、区切りは `border-dark` 1pxヘアライン、図のラベルとeyebrowは label（IBM Plex Mono, uppercase）。見出しはBarlow lowercaseのdisplayランプ。数式はstat-value/mono系で組む（画像・外部数式ライブラリ不使用）。
- **motion grammar + reveal model**: `power3` の長い減速で滑らかに settle（バウンス禁止）。各フレームはVOが名指した瞬間に1ピースずつ現れる **VO同期リビール**（後半50%に分散、前積み禁止）。光の点灯は `ambient-glow-bloom`、図・カーブ・リングは `svg-path-draw` の自己描画、見出しは per-word staggered reveal、数値は `counting-dynamic-scale`。ホールド中の生気は低振幅の subtle jitter（`sine-wave-loop` 低振幅）か光グローの残光のみ。
- **rhythm / held frames**: Frame 10 が意図的なブリーザー（titlecard、ほぼ静止）。Frame 1・9 がエネルギーのピーク。各フレーム末尾は必ず読みのためのホールドで終わる。
- **negative list**: bouncy/overshoot既定禁止・呼吸ループ禁止・後半のあてのないパン/プッシュ禁止・無限ループ/randomness禁止・紫青AIグラデ/ボケ玉禁止・ブラウザchrome/カーソル禁止・前積みフリーズ(スライドショー化)禁止・全要素同時入場禁止。下部17%はキャプション帯としてキープアウト（主要コンテンツは上部83%、中央ヒーローは y≈454 にアンカー）。

## Frame 1 — フック

- scene: 暗転した画面に大型タイポが拍で打ち込まれ、最後の「光」の一文字だけがグローを放って点灯する
- voiceover: "ゲームの画面の印象を決めるのは、モデルでもテクスチャでもない。光だ。"
- duration: 6.954s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Counterintuitive claim
- beat: surprise + intrigue
- blueprint: compose
- focal: 「光」の一文字（display級・グロー点灯）
- roles: ビート打ちの句フレーズ = foreground subject · 微細ヘアライングリッド = background(dim 40%) · 打ち消し線・パーティクル = supporting
- sfx: whoosh-short, impact-bass-1

narrativeRole: 「画作り=光」という反直感の主張で認知ギャップを開く。「光」の点灯がこの動画全体のモチーフになる。
keyMessage: シーンの見た目を支配しているのは光である。

Scene 1 (0.0–2.5s): ink-black地に低コントラストのヘアライングリッド。VO「がめんのいんしょうをきめるのは」に合わせ、句が **kinetic beat-slam**（`kinetic-beat-slam`）で1拍ずつ中央に打ち込まれる。Centered、上部83%内。
Scene 2 (2.5–4.7s): VO「モデルでも」「テクスチャでもない」で、`モデル` `テクスチャ` の2語が **hard-cut word-swap**（`discrete-text-sequence`）で現れ、直後にfire-orangeの打ち消しストロークが **SVG self-draw**（`svg-path-draw`）で走り消される。
Scene 3 (4.7–7.0s): VO「ひかりだ」で全要素が退き、「光」一文字がdisplayスケールで **slam入場**、背後に **ambient glow bloom**（`ambient-glow-bloom`）+ 小さな **particle burst**（`particle-burst`、少数・決定論的）。以降ホールド、グローの残光と **subtle jitter** のみ。

## Frame 2 — 3種の光源

- scene: 3枚のカード（点光源・ディレクショナル・環境光）がアイコン付きでスタッガー入場し、横一列に整列する
- voiceover: "リアルタイムレンダリングの光源は、実質この3つ。点光源、ディレクショナルライト、そして環境光。名前だけ、まず覚えてしまおう。"
- duration: 11.555s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/02-three-lights.html
- type: product_intro
- persuasion: Frame-then-fill（先に3枠を見せ、以降の本編で埋める）
- beat: orientation
- blueprint: grid-card-assemble (Adapt)
- focal: 3枚の光源カード（トリプティク）
- roles: 3カード = foreground subject · mono eyebrow「REALTIME LIGHTING」+ H2 = supporting · ヘアライングリッド地 = background
- sfx: click-soft, whoosh-short

narrativeRole: 動画の地図を渡す。3枚のカードは以降の3セクションの視覚的インデックスであり、Frame 9で再登場する。
keyMessage: 覚える光源は3つだけ。

Adapt: グリッドを3枚トリプティクに縮約。スタッガード・カスケード集合（signature）は保持。
Scene 1 (0.0–3.2s): eyebrowラベルが **type-on with caret**（`discrete-text-sequence`、caretはCSSで簡潔に）で入り、H2「こうげんは、じっしつこの3つ」が **per-word staggered reveal**（`dynamic-content-sequencing`）。上部1/3。
Scene 2 (3.2–9.5s): VOが名を呼ぶたびに1枚ずつ、カードが **spring-pop entrance（smooth settle）**（`spring-pop-entrance`）でカスケード入場。各カード内でアイコンが **SVG self-draw**（`svg-path-draw`）: 点光源=中心点+放射線 / ディレクショナル=平行矢印束 / 環境光=ドーム弧。Triptych、canvasの~55%。
Scene 3 (9.5–11.6s): fire-orangeのmono数字 01/02/03 が各カードに **tick** で入り、整列してホールド。

## Frame 3 — 点光源: 性質

- scene: 中央の光源から放射状の光線が伸びる俯瞰図。等距離リングと周囲のオブジェクトが、距離に応じて暗くなっていく
- voiceover: "点光源は、一点から全方向に光を放つ。たいまつ、ランプ、マズルフラッシュ。特徴は、距離とともに急激に暗くなること。拾えるアイテムの光など、視線誘導にも使われる。"
- duration: 16.658s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-point-nature.html
- type: feature_showcase
- persuasion: Concretization（たいまつ・ランプ・マズルフラッシュ）+ Demonstration
- beat: comprehension
- blueprint: compose
- focal: 中央の点光源とその放射図（俯瞰ダイアグラム）
- roles: 放射図 = foreground subject(~55%) · セクション見出し+例示チップ = supporting · ヘアライングリッド = background(dim)
- sfx: sparkle, whoosh-short

narrativeRole: 点光源の定義と減衰の直感を、放射図とリングの明度で体感させる。数式の前に現象を見せる。
keyMessage: 点光源は全方向放射で、距離とともに急激に減衰する。

Scene 1 (0.0–4.2s): 左上にmono eyebrow「01 — POINT LIGHT」+ h3「てんこうげん」がper-word reveal。VO「いってんからぜんほうこうに」で中央にfire-orangeの点が **点灯**（`ambient-glow-bloom`）し、放射光線が全方向へ **SVG self-draw**（`svg-path-draw`、スタッガー）。Centered、layered-depth 3層。
Scene 2 (4.2–8.3s): VOの例示3語に同期して、たいまつ/ランプ/マズルフラッシュ のチップが **hard-cut word-swap**（`discrete-text-sequence`）で図の下辺に1つずつ入る（キャプション帯の上）。
Scene 3 (8.3–14.2s): VO「きょりとともに」から等距離リング d=1,2,3 が順に **self-draw** し、各リング上の小オブジェクトが内側から順に点灯 — 明度は外へ行くほど落ちる（**stat fill**、`stat-bars-and-fills` の応用）。減衰の暗転がこのシーンの主役。
Scene 4 (14.2–16.7s): ホールド。中心グローの残光 + subtle jitter のみ。

## Frame 4 — 点光源: 減衰の数式

- scene: 逆二乗則 I = I₀/d² が組み上がり、d を動かすと減衰カーブが自分で描画される。係数付き減衰式と減衰半径のカットオフが重なる
- voiceover: "物理では逆二乗則。距離が2倍なら、明るさは4分の1。エンジンでは係数付きの減衰式でカーブを調整し、減衰半径の外は計算を打ち切る。"
- duration: 14.14s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/04-point-math.html
- type: social_proof
- persuasion: Worked example with real numbers（2倍→1/4）+ Causal chain
- beat: aha
- blueprint: dataviz-countup (Adapt)
- focal: 自己描画する減衰カーブ（グラフ）
- roles: 減衰グラフ = foreground subject(~50%) · 数式2段（逆二乗則・係数式）= supporting-hero · 明るさカウンター = supporting · グリッド = background
- sfx: click-soft, ping

narrativeRole: 直感を数式とグラフで裏付ける。物理式→エンジンの実用式→最適化（半径カットオフ）の3層を順に開示する。
keyMessage: 減衰は逆二乗が基本、実際のエンジンは調整可能な式と半径で制御する。

Adapt: チャートの自己描画+ヒーロー数値へのプッシュ（signature）を保持。カウントアップリングは「明るさ%カウンター」に置換。
Scene 1 (0.0–2.9s): VO「ぎゃくにじょうそく」で数式 I = I₀ / d² が項ごとに 項ごとのスタッガー（fromToの逐次reveal、power3）で組み上がる。Asymmetric 60/40 の左側。数式はHTML/CSS（Barlow + mono、分数はflex組版）。
Scene 2 (2.9–6.7s): VO「にばいなら…よんぶんのいち」で、d: 1→2 のマーカーがスライドし、明るさカウンターが 100% → 25% に **value-scaled counter**（`counting-dynamic-scale`）で変化。25%着地でfire-orangeの **keyword glow**（`asr-keyword-glow`）。
Scene 3 (6.7–10.9s): 右側に軸が **self-draw** し、減衰カーブ 1/d² が **SVG path draw**（`svg-path-draw`）で描かれる。VO「けいすうつきのげんすいしき」で att = 1/(Kc + Kl·d + Kq·d²) が下段に項ごとに入り、カーブが調整可能であることを示す第2カーブが薄く重なる。
Scene 4 (10.9–14.1s): VO「けいさんをうちきる」で減衰半径の縦破線が入り、半径より外の領域が **selective blur + dim**（`depth-of-field-blur`）で沈み、mono ラベル「SKIPPED」。ルートのわずかなscaleでカーブの膝へ軽く寄って、ホールド。

## Frame 5 — ディレクショナルライト: 性質

- scene: 画面全体に完全に平行な光線が斜めに降り注ぐ。太陽アイコンは無限遠の外側に置かれ、方向ベクトルの矢印だけが強調される
- voiceover: "ディレクショナルライトは、無限遠から降り注ぐ平行光線。太陽や月の抽象化だ。位置は持たず、方向だけを持つ。だから減衰しない。屋外のシーンでは、これが主光源になる。"
- duration: 15.147s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-directional-nature.html
- type: feature_showcase
- persuasion: Contrast（点光源との対比: 位置なし・減衰なし）
- beat: comprehension + momentum
- blueprint: compose
- focal: 画面を斜めに貫く平行光線の束
- roles: 平行光線束 = foreground subject(全幅) · 方向ベクトルLの矢印 = supporting-hero · 等明度の3キューブ = supporting · グリッド地平 = background
- sfx: whoosh-cinematic

narrativeRole: 点光源の直後に置くことで「位置と減衰の有無」という対比で性質を際立たせる。
keyMessage: ディレクショナルは方向だけを持ち、シーン全体を均一に照らす。

Scene 1 (0.0–4.3s): mono eyebrow「02 — DIRECTIONAL LIGHT」+ h3。VO「むげんえんからふりそそぐ」で、fire-orangeの平行光線束が右上から **motion-blur streak**（`motion-blur-streak`）を伴い斜めに走り込み、full-width stripで画面を覆う。フレーム外を指す「∞」mono ラベル+矢印。
Scene 2 (4.3–8.7s): VO「たいようやつきの」でチップ2枚（太陽/月）がhard-cutで入る。VO「いちはもたず」で位置グリフ(×印)が打ち消され、方向ベクトルLの大矢印だけが **keyword glow** で強調される。
Scene 3 (8.7–13.0s): VO「げんすいしない」で地平の3つのキューブ（近・中・遠）が同時に照らされ、それぞれの明度カウンターが **全て100%** で並ぶ（`counting-dynamic-scale`）— Frame 3の減衰との対比。
Scene 4 (13.0–15.1s): ホールド。光線束は静止、subtle jitterのみ。

## Frame 6 — ディレクショナルライト: 時間帯と影

- scene: 同一シーンの2連画面。左は真上からの白い光の正午、右は低角度のオレンジの夕暮れ。下部にCSMのカスケード分割図が並ぶ
- voiceover: "方向と色温度を変えるだけで、時間帯が作れる。真上の白は正午、低いオレンジは夕暮れ。影はカスケードシャドウマップで、近くほど高解像度に。タイムオブデイの基本は、この2つのパラメータだ。"
- duration: 15.648s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/06-directional-tod.html
- type: feature_showcase
- persuasion: Before/after（正午 vs 夕暮れ）
- beat: fascination
- blueprint: comparison-split (Reproduce)
- focal: 正午/夕暮れの2パネル比較
- roles: 2パネル = foreground subject(~55%) · 太陽弧と方向矢印 = supporting-hero · CSMカスケード帯 = supporting · 見出し = supporting
- sfx: click-soft, whoosh-short

narrativeRole: 「方向+色温度=時間帯」という実践的なパラメータ操作と、影の実装（CSM）まで一段深掘りする。
keyMessage: 太陽の表現は方向ベクトルと色温度の2パラメータで決まる。

Scene 1 (0.0–4.7s): VO「ほうこうといろおんどをかえるだけで」に合わせ、2枚のシーンパネルが左右のウィングから **mirrored book-open tilt**（`split-tilt-cards`、signature）で入場し並ぶ。Split-screen。左=白色光が真上から / 右=オレンジ光が低角度から、各パネル内に太陽位置ドットと方向矢印。
Scene 2 (4.7–8.9s): VO「まうえのしろはしょうご」で左パネルが **keyword glow** + 太陽ドットが弧の頂点へ移動。VO「ひくいオレンジはゆうぐれ」で右パネルが同様に強調、太陽ドットが低角度へ、パネル全体の色温度が沈む。
Scene 3 (8.9–13.6s): VO「カスケードシャドウマップ」で下部帯にカメラ錐台のくさび図が **self-draw** し、3分割カスケードが順に着色 — 近=細かいグリッド、遠=粗いグリッド（`svg-path-draw` + stagger）。mono ラベル「NEAR / MID / FAR」。
Scene 4 (13.6–15.6s): ホールド。

## Frame 7 — 環境光: 性質

- scene: 空のドームがシーン全体を包み、あらゆる方向から柔らかい光が回り込む断面図。ambient = ka × skyColor が下部に組み上がる
- voiceover: "環境光は、空全体からの回り込みを近似する光。特定の光源を持たない。一番単純な形は、空の色を一定量、全ピクセルに足すこと。この光が、影の中を真っ黒にしない。"
- duration: 16.299s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/07-ambient-nature.html
- type: feature_showcase
- persuasion: Progressive disclosure（最も単純な形から入る）
- beat: comprehension
- blueprint: compose
- focal: 空ドームの断面図（シーンを包む弧）
- roles: ドーム弧+回り込み光 = foreground subject(~55%) · ambient式 = supporting-hero · テスト球 = supporting · グリッド = background
- sfx: riser

narrativeRole: 「光源のない光」という概念をドーム断面図で具象化し、最小の式で導入する。
keyMessage: 環境光は空全体の回り込みの近似で、シーンのベースの明るさを決める。

Scene 1 (0.0–4.6s): mono eyebrow「03 — AMBIENT / SKY LIGHT」+ h3。VO「そらぜんたいからの」で巨大なドーム弧が **SVG self-draw** で頭上に描かれ、弧上の多点から内向きの柔光矢印が **スタッガー reveal**（`center-outward-expansion` の逆向き応用）。Centered、layered-depth。
Scene 2 (4.6–8.7s): VO「とくていのこうげんをもたない」で、中央に仮置きされた光源グリフ「?」が **粒子ディゾルブ**（`particle-burst` の dissolve 形）で消える — 源はどこにもない。ステージ全体の明度がわずかに持ち上がる。
Scene 3 (8.7–13.9s): VO「そらのいろをいっていりょう…たすこと」で下段に ambient = ka × skyColor が項ごとに組み上がり（per-word reveal）、隣のテスト球の明度が ka のtickに合わせ均一に持ち上がる（`counting-dynamic-scale` 小）。
Scene 4 (13.9–16.3s): ホールド。

## Frame 8 — 環境光: IBLとAO

- scene: HDRIパノラマが球に畳み込まれてイラディアンスマップになる工程図。隣で、AOにより隙間と凹みが暗く沈み立体感が生まれる
- voiceover: "現代のゲームはイメージベースドライティング。空の画像そのものを光源にする。さらにアンビエントオクルージョンで、隙間や凹みを暗くして立体感を出す。"
- duration: 12.715s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/08-ambient-ibl.html
- type: feature_showcase
- persuasion: Build-up（一定値の環境光 → IBL への一般化）+ Demonstration
- beat: fascination + mastery
- blueprint: compose
- focal: パノラマ帯→球への畳み込み工程図
- roles: 工程図（帯→鋭い球→ぼけた球）= foreground subject(~50%) · AOデモ（凹みのある形状）= second subject · 工程ラベル = supporting · グリッド = background
- sfx: riser, click-soft

narrativeRole: 単純なambient項から現代のIBL+AOへ橋を架け、「環境光=手抜きの定数」という誤解を解く。
keyMessage: 現代の環境光は空の画像そのものを光源化し、AOが立体感を足す。

Scene 1 (0.0–3.4s): VO「イメージベースドライティング」で、抽象化した空のグラデーション・パノラマ帯が **full-width strip** で上段にスライドイン（smooth settle）。mono ラベル「HDRI / SKYBOX」。
Scene 2 (3.4–7.2s): VO「そらのがぞうそのものをこうげんにする」で、帯が中段の球へ **scale-swap handoff**(`scale-swap-transition`)で畳み込まれ（鋭い環境球）、その右に拡散用の **ぼけた球**（irradiance）が現れる。工程矢印が **self-draw**、ラベル「ENV MAP → IRRADIANCE」。
Scene 3 (7.2–11.0s): VO「アンビエントオクルージョンで…」で右側に凹みのある形状（重なった立方体群の断面）が入り、隙間・凹みが内側から順に **暗く沈む**（`stat-bars-and-fills` の fill を影として使用）。「AO」mono ラベル + 立体感の対比（AOなし/ありの2状態を hard-cut で見せる）。
Scene 4 (11.0–12.7s): ホールド。

## Frame 9 — 役割分担

- scene: 暗いシーンに3つの光が順に重なって画が完成する。ディレクショナル（主光源）→点光源（アクセント）→環境光（ベース）。Frame 2の3枚カードが小さく再集合する
- voiceover: "役割分担はこうだ。ディレクショナルが主光源。点光源がアクセント。環境光がベース。3つのバランスが、画作りの出発点になる。"
- duration: 11.601s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/09-roles.html
- type: branding
- persuasion: Rule of three + Distillation + Callback（Frame 2のカード再登場）
- beat: now-I-get-it
- blueprint: grid-card-assemble (Adapt)
- focal: 3種の光がレイヤー合成されていくミニシーン
- roles: 合成ミニシーン（地平+3形状）= foreground subject(~55%) · 3枚のミニ役割カード = supporting-hero（F2のコールバック） · 合成式 = supporting
- sfx: riser, impact-bass-2

narrativeRole: 3種を1シーン上に積層して見せることで、個別知識を「ライティングデザイン」という1つの原則に統合する。動画のテーゼの着地点。
keyMessage: ディレクショナル=主光源、点光源=アクセント、環境光=ベース。

Adapt: カードのスタッガー集合（signature）を「光レイヤーの積層」に重ね、ミニカードのラリーとして保持。
Scene 1 (0.0–1.7s): ほぼ暗闇のミニシーン（地平線+3つの幾何形状のシルエット）が中央に置かれる。Centered ~55%。
Scene 2 (1.7–7.4s): VOの宣言ごとに光が1層ずつ積層: 「ディレクショナルが、しゅこうげん」→ 斜めの平行光ウォッシュがシーンを走り、形状に明暗が生まれる。「てんこうげんが、アクセント」→ 1点にfire-orangeの局所グローが **bloom**（`ambient-glow-bloom`）。「かんきょうこうが、ベース」→ 影側が持ち上がり黒潰れが消える。各層の点灯と同時に、対応するミニカードが **spring-pop（smooth）** で右レールにカスケード集合（F2のコールバック）。
Scene 3 (7.4–9.9s): VO「みっつのバランスが…」で右レールの3カードが「+」「=」で結ばれ、合成されたミニシーンが完成形として **keyword glow**。
Scene 4 (9.9–11.6s): 完成した画のホールド。グロー残光+subtle jitterのみ。

## Frame 10 — ランディング

- scene: 静かなタイトルカード。「まず、光を3つに分けて見る」。最後に「光」の一文字がFrame 1と同じグローで点灯して締まる
- voiceover: "次にシーンを開いたら、まず光を3つに分けて見てみよう。それだけで、シーンの見方が変わるはずだ。"
- duration: 11.71s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/10-landing.html
- type: cta
- persuasion: Callback（フックの「光」点灯を回収）+ Distillation
- beat: resolve + satisfaction
- blueprint: titlecard-reveal (Reproduce)
- focal: タイトル行「まず、光を3つに分けて見る」
- roles: タイトル行 = foreground subject · 「光」のグロー点灯 = supporting-hero（F1コールバック） · 3光源の小さなmonoインデックス = supporting
- sfx: chime

narrativeRole: 視聴者に持ち帰りの行動（シーンを3光源に分解して観察する）を渡し、フックのモチーフを回収して閉じる。
keyMessage: 今日からシーンの光を3つに分解して見る。

Reproduce: 抑制されたワンムーブ（slide-up crossfade、signature）→静止ホールド。
Scene 1 (0.0–3.9s): VO開始と同時にタイトル「まず、光を3つに分けて見る」が **slide-up crossfade** のワンムーブで入る（quote-text級、Centered、y≈454）。他は何も動かない。
Scene 2 (3.9–7.8s): VO「みっつにわけて」で下部に mono の小さな3インデックス「POINT / DIRECTIONAL / AMBIENT」が1回のスタッガーで静かに入る。タイトル中の「光」一文字だけが **ambient glow bloom** でF1と同じ点灯（コールバック）。
Scene 3 (7.8–11.7s): 完全な静止ホールド。最終フレームのみ許される実エグジットとして、末尾0.5sでグローがゆるやかに減衰して暗転へ。
