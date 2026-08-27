---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "光源は3種の道具 — 点光源・ディレクショナル・環境光を使い分ければシーンは設計できる"
destination: youtube
aspect: 1920x1080
language: ja
length: 120s
angle: concept
---

## Intent

ゲーム開発者・ゲームグラフィックス学習者向けに、リアルタイムレンダリングの3大光源
（点光源 Point Light / ディレクショナルライト Directional Light / 環境光・自然光
Ambient & Sky Light）の性質と使い分けを図解で教える解説動画。トーンは技術解説だが
硬すぎず、モーショングラフィックスで魅せる。図とアニメーションをふんだんに使う。

## Customizations

- 数式表現を入れる: 距離減衰 (inverse-square / attenuation)、Lambert (N·L) など。
  KaTeX等の描画は使わずHTML/CSSタイポグラフィで数式を組む（レンダリング決定性のため）。
- シェーダートランジション/凝ったフレーム間トランジションを積極的に使う。
- Tween(GSAP)ベースのアニメーション・エフェクトを最大限盛る（パーティクル、グロー、
  光線の可視化、減衰カーブのアニメーション描画など）。
- 図解多め: 光源と法線ベクトルの図、減衰グラフ、シーン俯瞰図など invented diagram 中心。

## Notes

- ユーザーは「モリモリで」「エフェクト最大限」と明示。落ち着いた説明よりリッチな動きを優先。
- 日本語ナレーション・日本語テロップ。
- 3種の光源それぞれに1セクション + フック + まとめの構成が自然。
