# Frame packet: 04-point-math

## Project inputs

- Project: /Users/hirotodev0622i/.superset/projects/video-edit/videos/game-lighting-explained
- Design tokens: /Users/hirotodev0622i/.superset/projects/video-edit/videos/game-lighting-explained/frame.md
- RULES_DIR: /Users/hirotodev0622i/.claude/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 4 — 点光源: 減衰の数式

- scene: 逆二乗則 I = I₀/d² が組み上がり、d を動かすと減衰カーブが自分で描画される。係数付き減衰式と減衰半径のカットオフが重なる
- voiceover: "物理では逆二乗則。距離が2倍なら、明るさは4分の1。エンジンでは係数付きの減衰式でカーブを調整し、減衰半径の外は計算を打ち切る。"
- duration: 12.331s
- transition_in: blur-crossfade
- status: outline
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
Scene 1 (0.0–2.5s): VO「ぎゃくにじょうそく」で数式 I = I₀ / d² が項ごとに 項ごとのスタッガー（fromToの逐次reveal、power3）で組み上がる。Asymmetric 60/40 の左側。数式はHTML/CSS（Barlow + mono、分数はflex組版）。
Scene 2 (2.5–5.8s): VO「にばいなら…よんぶんのいち」で、d: 1→2 のマーカーがスライドし、明るさカウンターが 100% → 25% に **value-scaled counter**（`counting-dynamic-scale`）で変化。25%着地でfire-orangeの **keyword glow**（`asr-keyword-glow`）。
Scene 3 (5.8–9.5s): 右側に軸が **self-draw** し、減衰カーブ 1/d² が **SVG path draw**（`svg-path-draw`）で描かれる。VO「けいすうつきのげんすいしき」で att = 1/(Kc + Kl·d + Kq·d²) が下段に項ごとに入り、カーブが調整可能であることを示す第2カーブが薄く重なる。
Scene 4 (9.5–12.3s): VO「けいさんをうちきる」で減衰半径の縦破線が入り、半径より外の領域が **selective blur + dim**（`depth-of-field-blur`）で沈み、mono ラベル「SKIPPED」。ルートのわずかなscaleでカーブの膝へ軽く寄って、ホールド。

## Selected blueprint: dataviz-countup

# dataviz-countup — Data-Viz / Count-Up

**intent**: Make numbers and charts the hero — a count-up ring/number, a trend chart, a tilted stat/card grid — and traverse the data instruments with a camera that pushes THROUGH them (or scrolls across them) to land on one hero metric, so the data itself carries the argument.

**roles served**

- Problem (from `problem-dataviz-pushthrough`): quantifies the pain with real-looking instruments — a count-up ring → a trend chart → a stat grid — the camera pushing THROUGH each object into the next to dramatize a worsening / large-scale problem ("X% of people struggle with…").
- Product_Intro (from `product-intro-dataviz-scroll-reveal`): a confident "look at the result / the data" open — hard-cut from a hook word into a perspective-tilted grid of data-viz cards, then a hands-off camera scroll lands one glowing hero metric while a kinetic tagline assembles word-by-word.
- Hook (from `hook-counter-burst`): a cold-open hook on ONE dramatic statistic — the frame opens dark and empty, 3–5 thematic icons puncture in clustered at center, then the headline number EXPLODES upward in size as the icons fling outward to their marks (the count-up and the spread are one beat), closed by a slow camera lean-in. Kinetic from frame 1.
- Key_Feature (from dark-stat-scrub-montage): prove the feature with its own analytics — on a black canvas, kinetic headline beats alternate with self-drawing charts and a 3D-tilted dark dashboard that a cursor SCRUBS (tracking line + live tooltips), stitched by hard cuts and one zoom punch. The one variant where a cursor touches the data.
- Social_Proof (from `gauge-beat`): a single count-up instrument — radial gauge arc-draw + rapidly ticking metric + caption — embedded as ONE BEAT inside a kinetic-typography relay; entered and exited by element-level scale/blur push-throughs on a static frame. The instrument guest-stars; the relay itself belongs to kinetic-type-beats.

**duration**: ~4–12s (Hook ~4s · Product_Intro ~6s · dark-scrub-montage ~7.3–7.75s · Problem ~11–12s · gauge-beat ~2.5s inside a ~10.8s relay)

**shot structure** Data-viz field on `[bg color]` (dark or light, soft corner glows); `[gradient A→B]` brand stroke on charts/rings; clean sans-serif white/dark text; a continuous camera move runs underneath that traverses 2–3 data instruments and resolves on a hero metric. One instrument per beat; the camera carries the cut.

- Scene 1 (0.0–Xs): the first data instrument establishes centered — a `[stat]` reads as the hero. A bold center number COUNTS UP `[start]`→`[end]` while its transform scale grows to the static final type size, with `[stat label]` below; its paired graphic (a circular progress RING sweeping to `[pct]` with a `[gradient]` stroke, or a bar/fill) animates in on the SAME ease so number + graphic land as one beat. Supporting `[avatar/object]` elements pop in with spring overshoot into a scattered glowing orbit; a `[headline]` fades up. A very slow continuous camera zoom-in runs throughout.
- Scene 2 (Xs–Ys): the camera traverses to the next instrument and that instrument animates — a `[gradient]` trend line / area chart DRAWS left→right on grid lines (Problem), or off-center cards SCROLL away as the layout glides (Product_Intro). The arriving `[stat-2]` number counts up / the chart resolves.
- Scene 3 / Scene N (…–end): the camera lands the `[hero metric card]` (big number + label + delta + rising chart) in dead-center; a soft `[accent]` glow blooms behind it; the move reaches its peak then eases to a settled, slightly wider composition with the hero centered and supporting cards flanking it. HOLD on the final frame.

- Variant — Problem (push-THROUGH, count-up → trend → grid): Scene 1 is a centered circular progress ring + count-up center number with scattered glowing `[avatar/object]` orbit. Scene 2 is a fast camera PUSH-IN straight through the center of the ring (ring, number, orbiting elements scale up and fly out of frame) into a rounded `[card]` holding `[stat-2 header]` over a `[gradient]` line chart with grid lines + translucent area fill that draws left→right; camera pushes through then settles. Scene 3: camera PANS to a second `[card]` whose number counts up, holding a grid of the `[avatar/object]` elements — a subset dim/blur while the rest receive `[accent]` circular checkmark badges that SPRING-POP; camera settles to the end. The traversal is z-depth push-through between instruments.
- Variant — Product_Intro (scroll-to-hero + word-by-word tagline): a brief opener — Scene 0 (~0.0–0.85s): a full-frame `[hero-color orb]` with a bold white `[hook phrase]` over it; static shimmer, then HARD CUT. Scene 1 cuts to a slightly perspective-TILTED grid of `[data-viz / product cards]` (charts, heatmaps, stat cards with deltas + source footers) with `[tagline word 1]` centered; the grid begins SCROLLING (e.g. toward upper-left) with its tilt held. Scene 2: the grid keeps scrolling so the `[hero metric card]` glides into dead-center as off-center cards slide away; `[tagline word 1]` translates out and `[word 2]` rises in from a frame edge. Scene 3: hero card settles centered, `[accent]` glow blooms behind it, camera PUSHES IN slightly; `[word 2]` holds near it. Scene 4: `[word 2]` slides out, the final `[tagline word]` drops in from the opposite edge above the still-glowing hero, push-in peaks. Scene 5: overlay type clears, camera eases BACK OUT to a settled wider tilted composition — hero centered with glow, supporting cards flanking. The traversal is a hands-off camera SCROLL across a tilted card plane (no cursor, no clicks) + a one-word-at-a-time kinetic headline + push-in-then-out bookend.
- Variant — Key_Feature (dark-scrub-montage: kinetic beats × instruments, cut-stitched): on black, `[kinetic word]` beats ALTERNATE with data instruments; hard cuts stitch the beats and the camera is locked per beat — the traversal is a montage, not a continuous move. Beat A: a bold `[heading]` holds while a thick `[trend line]` DRAWS itself left→right inside a dark chart band, rising to break above the band's edge; at the peak a `[accent]` dot pops and a pill tooltip springs in, its label building to `[value + delta]`. Beat B: ONE fast zoom PUNCH lands a close-up, slightly 3D-tilted dark `[analytics dashboard]` (metric cards with deltas, translucent oversized numerals floating behind); a white cursor SCRUBS a chart — a vertical tracking line follows it and `[date: value]` tooltips read out live, then a second chart ACTIVATES with a color flip and its own scrubbing tooltip — while the tilted plane drifts gently sideways; quick pull-away/fade to black. Beat C: a `[glowing wave / typed line / impact word]` beat lands the closing stat LOCKUP — `[title]` + big `[stat]` counting up + `[green delta arrow + context line]` — and holds static to the end. Kinetic words between instruments scale up violently past the frame as element-level push-through transitions (no camera).
- Variant — Social_Proof (gauge-beat inside a relay): a static-camera kinetic-type relay hosts ONE instrument beat — thin concentric `[accent]` arcs radiate from center, a thick `[accent]` progress arc draws clockwise over them, a large `[metric]` rapidly ticks up to `[big value]` with a `[caption]` below; the group slowly scales up (element-level drift), then hard-cuts out to the next text beat. Entry/exit for every beat is scale-up-from-blur in / scale-up-and-blur-past-frame out — a fake push-through with no camera anywhere. Use when social proof is one number and the surrounding beats are typography.

**motion vocabulary** count-up number with transform-scale growth on the value; circular progress-ring sweep; growth bar / progress fill; gradient trend-line + area-fill left→right draw; spring-overshoot pop-in of scattered glowing avatar/object elements; perspective-tilted card grid; directional grid scroll (cards glide in/out of center); hero-card centering; soft accent glow bloom behind the hero; slow continuous zoom-in; fast camera push-IN / push-THROUGH the center of an instrument; lateral/vertical camera pan between cards; gentle push-in that peaks then eases back out to a wider settle; selective dim/blur of a subset + spring-pop checkmark badges; full-frame hook orb → hard cut; kinetic tagline assembled word-by-word (each word drops/rises from a frame edge, prior word slides out). Dark-scrub-montage additions: self-drawing chart line that breaks above its band; peak dot + pill tooltip spring-pop; cursor chart scrub with vertical tracking line + live date/value tooltip readouts; chart activation color flip; 3D-tilted dark dashboard plane with slow lateral drift; translucent oversized numerals floating behind cards; fast zoom punch-in; pull-away/fade-to-black beat exit; hard-cut beat stitching; kinetic word push-through (element scales up past the frame); typed line with blinking cursor; impact slam word + particle-dissolve punctuation; glowing wave draw; green delta arrow pop; stat lockup hold. Gauge-beat additions: concentric static arcs + thick clockwise progress-arc draw; rapid count-up tick; scale-up-from-blur entrance / scale-up-and-blur-past-frame exit (element-level fake push-through).

**rule mapping** (motion verb → `rules/<id>.md`)

- count-up number whose transform scale grows with the value → `counting-dynamic-scale` (primary text rule)
- circular progress-ring sweep (the ring fill) → `stat-bars-and-fills` (ring form) — its draw mechanics delegate to → `svg-path-draw`
- growth bars / progress fill paired beside a number → `stat-bars-and-fills` (primary data rule)
- gradient trend-line / area-chart left→right draw → `svg-path-draw` (a path/line draws itself)
- spring-overshoot pop-in of the avatar/object elements → `spring-pop-entrance` (elastic overshoot); the scattered-ring layout of glowing avatars/objects → `avatar-cloud-network`; if they keep drifting/orbiting → `orbit-3d-entry`
- spring-pop `[accent]` checkmark badges → `spring-pop-entrance`
- perspective-tilted card grid (tilt held static while content moves) → `3d-page-scroll`
- directional scroll across the tilted card plane (cards glide in/out of center) → `3d-page-scroll` (scroll) + `viewport-change` (lateral/vertical pan form)
- hero metric card centering (scroll/pan lands the target dead-center) → `coordinate-target-zoom` (target lands at viewport center) / `viewport-change`
- hard-cut from the hook orb into the grid → `scale-swap-transition`
- kinetic tagline assembled word-by-word → `kinetic-beat-slam` (one onset grid, distinct per-word entrances)
- slow continuous zoom-in + push-THROUGH the instruments + lateral/vertical pan between cards + push-in-then-out bookend → `multi-phase-camera` (see camera modifier)
- soft accent glow BLOOM behind the hero card → `ambient-glow-bloom` (un-triggered soft glow/bloom behind the static hero element — distinct from `press-release-spring`'s press-triggered glow and `asr-keyword-glow`'s word-timed envelope)
- selective dim/blur of a SUBSET of grid items (focus-falloff on the non-highlighted cards) → `depth-of-field-blur` (selective per-element blur/dim to spotlight the highlighted cards — the same focus-falloff rule used in `constellation-hub`)
- cursor chart scrub (cursor-tied vertical tracking line + live data readout in a tooltip) → `chart-scrub-readout` (the tracking line, tooltip pop, and seek-safe live value readout driven by cursor x)
- chart activation color flip (second chart lights up under the scrub) → `gsap-effects` (color/opacity chord at the scrub handoff — basic tween, no dedicated rule needed)
- 3D-tilted dashboard plane + slow lateral drift → `3d-page-scroll` (the tilt framing) + `sine-wave-loop` (the drift; keep amplitude tiny so the scrub stays legible)
- fast zoom punch-in to the dashboard → `multi-phase-camera` (one short aggressive push phase) aimed via `coordinate-target-zoom`; add `motion-blur-streak` at peak velocity
- kinetic word push-through / scale-up-and-blur-past-frame exit / scale-up-from-blur entrance → `kinetic-beat-slam` (the beat grammar) + `motion-blur-streak` (blur peaks at max speed, resolves at the settle — its entrance form runs the blur-in, its exit form the blow-past)
- typed line with blinking cursor → `discrete-text-sequence` + `context-sensitive-cursor` (square-wave blink)
- impact slam word → `kinetic-beat-slam`; its particle-dissolve punctuation → `particle-burst` (glyph→particles dissolve, deterministic)
- glowing wave draw → `svg-path-draw` (the draw) + `ambient-glow-bloom` (the glow envelope)
- green delta arrow pop / peak dot + pill tooltip → `spring-pop-entrance`
- concentric static arcs + clockwise progress-arc draw (gauge beat) → `stat-bars-and-fills` (ring form) → draw mechanics `svg-path-draw` (both already mapped above — the gauge is the existing ring with static concentric chrome behind it)

**camera modifier**: The camera is the through-line that traverses the data instruments — one camera wrapper sequenced by `multi-phase-camera`, with each stop targeted via `coordinate-target-zoom` onto the focal instrument/card.

- Problem — push-THROUGH: a slow continuous zoom-in (drift overlay) plus a fast PUSH-IN straight through the center of one instrument into the next (`multi-phase-camera`, Steady-push pattern), then a lateral/vertical PAN to the final card. Z-depth push-through is the signature (distinguishes it from a flat pan-tour).
- Product_Intro — scroll-to-hero + bookend push: a hands-off directional SCROLL across the tilted card plane (`3d-page-scroll` scroll / `viewport-change` pan) that lands the hero card center, then a gentle push-in that PEAKS and eases BACK OUT to a wider settle (`multi-phase-camera`, Bookend-pull pattern). No cursor, no clicks — the camera does the navigating.
- Key_Feature — montage-cut: the camera is NOT the through-line — hard cuts stitch the instrument beats, the frame is locked inside each beat, and exactly ONE fast zoom punch (`multi-phase-camera` single push phase + `coordinate-target-zoom`) lands the dashboard close-up; exits are pull-away/fade-to-black. Between instruments, ELEMENTS fake the push: kinetic words scale up past the frame (`kinetic-beat-slam` + `motion-blur-streak`). Gauge-beat form drops even the punch — fully static, all push-through element-level. Reach for this mode when the dialect is a dark rapid montage; the Problem/Product_Intro modes remain the default for a single continuous argument.

## Selected motion rule: asr-keyword-glow

---
name: asr-keyword-glow
description: Keywords glow + scale up when "spoken" — attack/sustain/release envelope synced to per-word timestamps. Even without real audio, hardcoded timings create a "narrator emphasis" effect.
metadata:
  tags: asr, audio-sync, highlight, glow, keyword, text, speech, emphasis
---

# ASR Keyword Glow

Words in a phrase visually activate (glow blur + scale) when "spoken", following an attack-sustain-release envelope over per-word `{ start, end }` timestamps. In a real ASR pipeline the timings come from a word-level transcript (`hyperframes transcribe` — same shape); for promo video, hand-author them to control emphasis pacing. The envelope never falls to zero after a word — it decays to a rest level, leaving a breadcrumb of recent emphasis.

## How It Works

A single linear driver tween (`ease: "none"` — any other ease distorts the per-word envelope; do not change) sweeps scene time; its `onUpdate` loops over ALL words computing each one's envelope: 0 before `start`, linear attack to 1 over `ATTACK_DUR`, sustain at 1 until `end`, decay to `REST_LEVEL` over `RELEASE`, then hold at rest. The envelope drives `text-shadow` blur and `scale` — one driver for the whole phrase, never one tween per word (60+ words would bloat the timeline).

## Recipe

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="phrase">
  <span class="word" data-word="{w1Key}">{w1}</span>
  <span class="word" data-word="{w2Key}">{w2}</span>
  <!-- … the final word may be the brand, with the .brand modifier -->
  <span class="word brand" data-word="{brandKey}">{brandWord}</span>
</div>
```

```css
.phrase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  color: {restColor};
}
.word {
  display: inline-block; /* required for transform on <span> */
  transform-origin: 50% 50%;
  text-shadow: 0 0 0 {glowColorTransparent};
}
.word.brand {
  color: {brandAccentColor};
}
```

```js
// Per-word spoken windows — one entry per span; brand word 1.5-2× a normal word's window.
const TIMINGS = {
  // {w1Key}: { start: …, end: … },  — seconds, local to the scene
};

function envelope(time, start, end) {
  if (time < start) return 0;
  if (time < end) return Math.min((time - start) / ATTACK_DUR, 1);
  const releaseEnd = end + RELEASE;
  if (time < releaseEnd) return 1 - ((time - end) / RELEASE) * (1 - REST_LEVEL);
  return REST_LEVEL;
}

const words = document.querySelectorAll(".word");
const driver = { t: 0 };
tl.to(
  driver,
  {
    t: SCENE_DURATION,
    duration: SCENE_DURATION,
    ease: "none", // linear — t maps 1:1 to scene time
    onUpdate: () => {
      words.forEach((el) => {
        const timing = TIMINGS[el.dataset.word];
        if (!timing) return;
        const env = envelope(driver.t, timing.start, timing.end);
        el.style.textShadow = `0 0 ${MAX_BLUR * env}px ${glowColorRgba(env)}`;
        el.style.transform = `scale(${1 + MAX_SCALE_BOOST * env})`;
      });
    },
  },
  0,
);
```

`glowColorRgba(env)` returns the glow color with `env`-modulated alpha.

## Variations

- **Karaoke style (RECOMMENDED for video narration)** — the default amplitudes read too subtle in video: inactive words still dominate. Render inactive words DIM and lerp the active word toward bright + larger; at any moment 1–2 words are bright (spoken + lingering rest) and the rest is dim. Use for short phrases (5–10 words) where one word at a time should POP; keep the subtle default for long dense text. Pushes MAX_BLUR, MAX_SCALE_BOOST, and REST↔ACTIVE contrast; everything else identical:

```js
function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function colorAt(env, isBrand) {
  const target = isBrand ? BRAND_RGB : ACTIVE_RGB;
  return `rgb(${lerpChannel(REST_RGB.r, target.r, env)}, ${lerpChannel(REST_RGB.g, target.g, env)}, ${lerpChannel(REST_RGB.b, target.b, env)})`;
}
// in onUpdate: el.style.color = colorAt(env, el.classList.contains("brand"));
```

- **Multi-octave glow** — multiply the sustain by `1 + sin(driver.t × PULSE_HZ) × PULSE_AMPLITUDE` so high-emphasis words breathe at peak.
- **Color shift on the peak** — same channel-lerp from `restColor` → `peakColor` as `env` rises (non-karaoke form).
- **3D pop-out** — add `translateZ(env × MAX_POP_Z)` so the spoken word leans toward camera; requires `perspective` on the parent.
- **From real ASR transcripts** — convert `{ word, start_ms, end_ms }` entries to seconds and feed in identically.

## Values

| token           | default style        | karaoke style | notes                                                      |
| --------------- | -------------------- | ------------- | ---------------------------------------------------------- |
| ATTACK_DUR      | 0.1–0.25s            | same          | must be < the shortest word's window or it never reaches 1 |
| RELEASE         | 0.2–0.5s             | same          | decay to rest                                              |
| REST_LEVEL      | 0.15–0.4             | 0.05–0.2      | > 0 (breadcrumb), < 1                                      |
| MAX_BLUR        | 15–25px              | 30–45px       | bigger = "shouting"                                        |
| MAX_SCALE_BOOST | 0.03–0.10            | 0.15–0.25     | additive at peak (0.08 ⇒ scale 1.08)                       |
| PULSE_HZ / AMP  | 4–10 rad/s / 0.1–0.3 | —             | multi-octave variation                                     |
| MAX_POP_Z       | 20–60px              | —             | 3D variation                                               |
| SCENE_DURATION  | = `data-duration`    | same          | driver must end in sync with the scene's seek window       |

## Critical Constraints

- **Timings monotonic, non-overlapping** — every entry's `end` < the next entry's `start`; overlapping windows make the envelope ambiguous.
- **Brand word window 1.5–2× a normal word** — the brand is the headline; let it sustain.
- **Driver ease stays `"none"`** — any other ease warps every word's envelope timing.
- **`text-shadow`, not `box-shadow`** — the glow must hug the GLYPH (speaking emphasis), not the inline-block rectangle.
- **One driver looping all words** — never one tween per word.
- **Commit to a style** — values between the default and karaoke columns yield awkward "half-loud" emphasis.
- **Climax dwell ≥1s** after the final word's emphasis — the last word IS the headline beat.

## See also

`3d-text-depth-layers` (depth on the active word at peak) · `sine-wave-loop` (idle breathe between emphasis moments) · `context-sensitive-cursor` (typewriter matching the ASR cadence) · `/media-use` for `hyperframes transcribe` and caption rendering.

## Selected motion rule: counting-dynamic-scale

---
name: counting-dynamic-scale
description: Counter animation where the value counts up while transform scale grows to its final size, creating escalating visual weight without per-frame text reflow.
metadata:
  tags: counter, counting, scale, transform, number, dynamic, emphasis
---

# Counting with Dynamic Scale

A number counts from A → B while its transform scale grows to the final size — escalating visual weight ("this is impressive") without tweening `font-size` or forcing text layout on every frame. The final font size is static CSS; only the transform changes.

## How It Works

Two synchronized tweens at the SAME timeline position with the SAME ease: (1) a proxy value rendered as text via `onUpdate` (`Math.round(...).toLocaleString()`), (2) the counter's transform `scale: START_SCALE → 1`, where `START_SCALE = START_SIZE / END_SIZE`. A suffix (`%`, `×`, `+`) slides in AFTER the count lands — the number gets its own beat — and a label fades in early.

## Recipe

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="counter-wrap">
  <span class="counter" id="counter">0</span><span class="counter-suffix">{suffix}</span>
</div>
<div class="counter-label">{label}</div>
```

```css
.counter-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  width: {counterContainerWidth}; /* fixed width — no layout shift as digit count changes */
}
.counter {
  font-variant-numeric: tabular-nums; /* MANDATORY — digits keep equal width */
  display: inline-block;
  font-size: {endSize}; /* final size is static; GSAP animates scale, not font-size */
  transform-origin: center center;
}
.counter-suffix {
  opacity: 0;
  transform: translateY(20px);
}
```

```js
const counter = document.getElementById("counter");
const state = { value: 0 };
const START_SCALE = START_SIZE / END_SIZE;

// Count value — onUpdate changes text only
tl.to(
  state,
  {
    value: TARGET_VALUE,
    duration: COUNT_DUR,
    ease: COUNT_EASE,
    onUpdate: () => {
      counter.textContent = Math.round(state.value).toLocaleString();
    },
  },
  0,
);

// Visual growth — compositor transform sharing the count's timing + ease
tl.fromTo(counter, { scale: START_SCALE }, { scale: 1, duration: COUNT_DUR, ease: COUNT_EASE }, 0);

// Suffix slides in AFTER the count completes
tl.to(
  ".counter-suffix",
  { opacity: 1, y: 0, duration: SUFFIX_DUR, ease: `back.out(${SUFFIX_BOUNCE_FACTOR})` },
  COUNT_DUR,
);

// Label fades in early
tl.from(".counter-label", { opacity: 0, y: 12, duration: LABEL_DUR, ease: "power2.out" }, LABEL_AT);
```

## Variations

- **Direct `innerText` tween (no proxy)** — GSAP can tween `innerText` directly for a number-only counter; keep the proxy form when you need locale formatting or suffix logic. The scale tween stays separate either way:

```js
tl.to(
  counter,
  { innerText: TARGET_VALUE, duration: COUNT_DUR, ease: COUNT_EASE, snap: { innerText: 1 } },
  0,
);
```

- **3D depth entry** — add a `tl.from(".counter", { z: -300, ... }, 0)` push-in; requires `perspective` on `.counter-wrap` and `transform-style: preserve-3d` on the counter.
- **Multi-stat coordinated reveal** — 3 stats counting in parallel share the SAME ease, duration, and start position so they finish together (a chord, not an arpeggio). Each stat usually also needs a paired graphic (bar / ring / stars) — don't stop at the number; see [stat-bars-and-fills.md](stat-bars-and-fills.md).

## Values

| token                 | range                                       | notes                                                                         |
| --------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| TARGET_VALUE          | 2–3 digits ideal                            | 4+ digits needs a wider container; must fit at END_SIZE without clipping      |
| START_SIZE / END_SIZE | START ≈ 40–60% of END                       | design inputs used once for START_SCALE; never tween either                   |
| COUNT_DUR             | 1.2–2.5s                                    | below ~0.8s reads as a flash — the eye must read the digits scrolling past    |
| COUNT_EASE            | `power2.out` / `power3.out` ⭐ / `expo.out` | shared by value + scale; more `.out` = more dramatic deceleration at the peak |
| SUFFIX_DUR            | 0.3–0.6s                                    | fires at `COUNT_DUR`, never during the count                                  |
| SUFFIX_BOUNCE_FACTOR  | 1.4–2.0                                     | overshoot is fine on the suffix (it's punctuation, not data)                  |
| LABEL_AT / LABEL_DUR  | AT < COUNT_DUR/2; 0.4–0.7s                  | label arrives before the count peaks                                          |

## Critical Constraints

- **`tabular-nums` mandatory** + fixed-width container as belt-and-suspenders — without them digit-count transitions (9 → 10 → 100) jitter as glyph widths change.
- **Never set `fontSize` in `onUpdate`** — final type size is static CSS; only the transform changes per frame. Keep `onUpdate` O(1): set text only, no style writes or DOM creation.
- **`Math.round`, not `Math.floor`** — halfway through the final integer should already display the final value.
- **Avoid `back.out` / `elastic.out` on the counter itself** — overshoot makes the number look unstable (it's data, not decoration). Grow in place, don't bounce.
- **Label is BIG TEXT, not a page-style caption** — a tiny paragraph under a hero-size number reads as visual noise in video. Display-size, uppercase, tracked: the label is part of the headline.

## See also

`stat-bars-and-fills` (the paired graphic — give it the same ease/duration so number and fill land as one beat) · `svg-path-draw` (icons drawing in around the number) · `center-outward-expansion` (icons bursting outward at the count peak).

## Selected motion rule: depth-of-field-blur

---
name: depth-of-field-blur
description: Selective-focus rack-focus — pull the eye to a focal element by GSAP-tweening filter blur (+ a small opacity dim) on the off-focus layers while the focal one stays sharp. Drive blur via a `--dof` CSS var; finite tweens, no CSS transition, deterministic. Covers single focal pull, rack-focus between two depth planes, and blur-the-cluster-while-pushing-in.
metadata:
  tags: blur, focus, depth-of-field, dof, rack-focus, filter, dim, spotlight, cinematic, push-in
---

# Depth-of-Field Blur (Selective Focus / Rack Focus)

Pulls the eye to one focal element by **blurring** (and slightly **dimming**) everything around it while the focal layer stays sharp — the camera's depth-of-field falling off the background, or a rack-focus shifting which plane is in focus. `filter` and `opacity` are paint-only, so both tween seek-safe. This is the backing rule for the focus-falloff beat the blueprints reach for: outer nodes blurring during a push-in (`constellation-hub`), rack-focus across a parallax card stack (`cursor-ui-demo`), non-highlighted cards dimming to spotlight a hero metric (`dataviz-countup`).

## How It Works

Every layer carries a `--dof` custom property (px of blur), read by `filter: blur(var(--dof))`, plus its own `opacity`. A GSAP tween advances each layer's `--dof` from `0` to its target blur and its opacity from `1` to a dim level over the focus-shift window. The focal layer's `--dof` stays `0`. Per-layer targets derive from `data-depth` / index, so the falloff is identical on every seek.

Three mechanics, same primitive:

1. **Focal pull** — one window: off-focus layers go sharp(0) → blurred while the focal layer holds at 0. The eye is pulled to the only thing still crisp.
2. **Rack focus** — two adjacent windows on the same property: plane A's blur ramps 0 → max at the same position plane B's ramps max → 0. State continuity matters exactly as in `press-release-spring`: A's resting blur after the rack must equal what B held before it — author both as tweens on the same `--dof` at the same position so the hand-off is seamless.
3. **Blur-the-cluster-while-pushing-in** — the DoF tween runs at the SAME timeline position as a camera push-in (`multi-phase-camera` / `coordinate-target-zoom`): "the world recedes" and "we push in" read as one move.

## Recipe

```html
<div class="world" id="world">
  <!-- Focal layer — stays sharp -->
  <div class="layer focal" id="focal">{FocalLabel}</div>
  <!-- Off-focus layers — blur + dim; data-depth orders near→far -->
  <div class="layer ctx" data-depth="1">{Context A}</div>
  <div class="layer ctx" data-depth="2">{Context B}</div>
  <div class="layer ctx" data-depth="3">{Context C}</div>
</div>
```

```css
.world {
  /* single wrapper so a concurrent camera push-in transforms everything
     together; DoF is independent of the camera */
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
}
.layer {
  --dof: 0px; /* px of blur; filter reads it — starts sharp */
  filter: blur(var(--dof));
  will-change: filter; /* promotes the layer so per-frame re-rasterization is cheap */
}
.focal {
  z-index: 2; /* sharp layer must sit ABOVE the blurred ones, or its crisp
     edges read as bleeding into the haze */
}
.ctx {
  z-index: 1;
}
```

```js
// Mechanic 1 — FOCAL PULL. Blur scales with data-depth so far planes blur
// more than near ones; the focal layer (--dof: 0, opacity: 1) is untouched.
gsap.utils.toArray(".ctx").forEach((el) => {
  const depth = Number(el.dataset.depth) || 1;
  tl.to(
    el,
    {
      "--dof": `${BLUR_PER_DEPTH * depth}px`,
      opacity: DIM_LEVEL, // dim, not gone
      duration: FOCUS_DUR,
      ease: "power2.inOut",
    },
    FOCUS_START,
  );
});
```

## Variations

- **Rack focus between two depth planes** — `gsap.set` plane B pre-blurred BEFORE the rack (no pop), then two tweens sharing `RACK_START` + `RACK_DUR`: A → `MAX_BLUR` + `DIM_LEVEL`, B → `0px` + `1`. Shared window makes them cross at the midpoint.
- **Blur the cluster while pushing in** — run the focal-pull tweens at the same position + duration as a camera tween on `#world` (`scale/x/y`, `power2.inOut`). Camera transforms the world; DoF tweens the layers — independent property channels, no conflict.
- **Spotlight a hero metric in a card grid** — `gsap.utils.toArray(".card:not(.hero)")` all defocus (`GRID_BLUR` + `DIM_LEVEL`) on one shared window; heroes are skipped.
- **Refocus / settle** — if the beat resolves back to "everything visible" (or hands off to a crossfade needing a clean outgoing frame), ramp all `--dof` back to `0px` / opacity 1 over the tail (`REFOCUS_START + REFOCUS_DUR ≤ DURATION`).
- **Bounded focus-breathing on the focal layer (optional)** — a finite `ease:"none"` driver writes `Math.max(0, Math.sin(p)) * FOCAL_BREATH_PX` into the focal `--dof` during a hold. Keep it ≤ ~0.6px or it reads as "still focusing"; default to omitting it.

## Values

| token                 | range                                  | notes                                                                                                    |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| BLUR_PER_DEPTH        | 3–6 px per depth step                  | a 3-plane stack tops out ~9–18 px; low = gentle DoF, high = tilt-shift falloff                           |
| MAX_BLUR              | 8 soft → 16 default → 24 heavy px      | terminal blur for a fully-defocused plane; above ~24 px on a big surface, shrink/group the layer instead |
| GRID_BLUR             | 6–12 px                                | pushes cards back without losing the grid's shape                                                        |
| DIM_LEVEL             | 0.4 strong → 0.55 default → 0.7 subtle | rarely below 0.35 — fully dark reads as "removed," not "defocused"                                       |
| FOCUS_DUR             | 0.5–1.2 s                              | a rack/pull is a deliberate move, not a snap; shorter = snap focus, longer = languid                     |
| RACK_START / RACK_DUR | shared by both planes                  | `gsap.set` the pre-blurred plane BEFORE `RACK_START`                                                     |
| FOCAL_BREATH_PX       | ≤ 0.6 px, period 2–3 s                 | barely-there nicety                                                                                      |
| FOCAL vs CTX sizing   | context smaller / grouped              | small context layers let a modest radius still read as "out of focus" — and blur cheaply                 |

Tokens: dark `{bgGradient}` so the sharp focal layer reads as lit and forward; heavy display `{font}` weight — blurred copy needs it to stay shape-legible.

## Critical Constraints

- **Tween the `--dof` variable on the timeline** — reading `filter: blur(var(--dof))` keeps the blur on the HF seek clock.
- **Blur the SMALL / GROUPED layers, not the giant one.** Filter cost scales with radius × pixel area; a 20 px blur on a full-frame background is the worst case. Keep per-layer radius ≤ ~24 px on large surfaces and lean on the `opacity` **dim** to do the push-back work — dim + modest blur reads more like real DoF than blur cranked to the max.
- **`will-change: filter`** on every layer whose blur animates (drop it after settle if the layer also does heavy transform work).
- **Focal layer stays genuinely sharp** — `--dof: 0`, untouched (or breathing ≤ 0.6 px). Any visible blur on the focal element kills the "this is the thing" read.
- **State continuity on a rack** — the outgoing plane starts at the blur the incoming plane was holding, and vice-versa; adjacent tweens on the same `--dof` at the same position.
- **DoF is independent of the camera** — blur the layers, transform `.world` for the push-in; don't fake DoF with the camera transform or vice-versa.
- **Settle sharp before a hand-off** — refocus to `--dof: 0` in the tail if the next beat is a crossfade/push; handing off mid-defocus reads as "the render glitched."
- **Sharp focal layer above blurred layers** (`z-index`).

## See also

[multi-phase-camera.md](multi-phase-camera.md) (the push-in this rule's falloff accompanies) · [coordinate-target-zoom.md](coordinate-target-zoom.md) (zoom onto the focal core — the `constellation-hub` hook) · [viewport-change.md](viewport-change.md) (pan + rack across a tilted card plane) · [counting-dynamic-scale.md](counting-dynamic-scale.md) (hero metric counts up sharp — the `dataviz-countup` spotlight) · [3d-page-scroll.md](3d-page-scroll.md) (the parallax stack to rack between) · [sine-wave-loop.md](sine-wave-loop.md) (post-rack idle; keep both amplitudes tiny).

## Selected motion rule: svg-path-draw

---
name: svg-path-draw
description: Animate SVG paths drawing progressively using stroke-dasharray and stroke-dashoffset.
metadata:
  tags: svg, stroke, draw, path, reveal, icon, vector
---

# SVG Path Draw

Reveals an SVG shape by animating its stroke as if a pen were tracing it. Two stroke properties together: **`stroke-dasharray = <pathLength>`** makes the entire path one dash; **`stroke-dashoffset`** starts at the path length (dash shifted fully out of view → invisible) and tweens to `0` (fully drawn). The length comes from the DOM API `path.getTotalLength()` — measured, never guessed.

Works on anything with a stroke: `<path>`, `<circle>`, `<rect>`, `<line>`, `<polyline>`, `<polygon>`, `<ellipse>`.

## Recipe

```html
<!-- inside a standard scene clip -->
<svg class="logo-mark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path id="bar-left" d="M 60 40 L 60 160" />
  <path id="bar-right" d="M 140 40 L 140 160" />
  <path id="bar-mid" d="M 60 100 L 140 100" />
</svg>
```

```css
.logo-mark path {
  fill: none; /* outline-only draw — a fill would appear immediately and ruin the reveal */
  stroke: {accentColor};
  stroke-width: 12;
  stroke-linecap: round; /* softer endpoints */
  stroke-linejoin: round;
}
```

```js
// Setup: measure each path and set its dash pattern. Real measured geometry, not a magic number.
document.querySelectorAll(".logo-mark path").forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len}`;
  p.style.strokeDashoffset = `${len}`;
});

// Stagger draws so the eye reads continuous motion — each segment starts at
// ~70-80% of the previous segment's duration, before it finishes.
tl.to(
  "#bar-left",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#bar-right",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_2_START,
);
tl.to(
  "#bar-mid",
  { strokeDashoffset: 0, duration: FINAL_SEGMENT_DUR, ease: "power2.out" },
  SEG_3_START,
);

// Companion wordmark fades in only after the last stroke settles.
tl.to(
  ".brand-line",
  { opacity: 1, duration: BRAND_FADE_DUR, ease: "power1.out" },
  BRAND_FADE_START,
);
```

## Variations

- **Ring starting at 12 o'clock** — `<circle>` / `<rect>` strokes start at 3 o'clock by default; rotate the element `-90deg` so a progress ring draws from the top:

```html
<circle
  cx="100"
  cy="100"
  r="60"
  id="ring"
  style="transform-origin: 100px 100px; transform: rotate(-90deg)"
/>
```

- **Linear (constant-speed) draw** — `ease: "none"` for a steady-rate "real pen" trace.
- **Draw then fill** — for filled shapes, tween `fillOpacity: 0 → 1` AFTER the stroke completes (requires `fill-opacity: 0` initially and a real `fill` in CSS):

```js
tl.to(
  "#path",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#path",
  { fillOpacity: 1, duration: FILL_FADE_DUR, ease: "power1.out" },
  SEG_1_START + SEGMENT_DRAW_DUR,
);
```

## Values

| token             | range                                   | notes                                                                                              |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| SEGMENT_DRAW_DUR  | 0.3–0.8s                                | fast snap vs deliberate pen trace; >~1s feels sluggish for a logo reveal                           |
| FINAL_SEGMENT_DUR | 60–80% of SEGMENT_DRAW_DUR              | proportional to segment length — a short connector at full duration reads slower than its siblings |
| SEG_N_START       | previous start + 70–80% of its duration | reads as continuous motion, not N isolated animations                                              |
| SEG_1_START       | 0–0.4s                                  | a small ~0.2s lead-in lets the viewer settle before motion                                         |
| BRAND_FADE_START  | ≥ last stroke end (+ ~0.2s beat)        | earlier and the wordmark competes with the draw                                                    |
| BRAND_FADE_DUR    | 0.3–0.8s                                | snap (urgent) vs glide (premium)                                                                   |

Ease families are discrete choices: **stroke draws** use `power2.out` (a hand lifting at end of stroke) or `none` for constant speed — never `back.out` / `elastic.out` (pens don't bounce). **Fades** use `power1.out`.

## Critical Constraints

- **`fill: none`** for outline-only draws — otherwise the fill appears immediately.
- **Dasharray/dashoffset = the measured `getTotalLength()`**, set at setup; requires the SVG in the DOM (inline SVG is fine; a loaded `<image>` SVG is not).
- **Complex paths**: if `getTotalLength()` looks wrong, overestimate slightly (`len * 1.05`) — too large is invisible at animation start; too small clips the end.
- **Stagger multi-path draws at ~70–80%** of the previous segment's duration.
- **A drawn line must land on something.** When the path is a connector (rail, beam, underline, callout) rather than a shape, both endpoints must sit on real elements and the draw must do a job — reveal, route, validate, or emphasize. A stroke that only decorates empty space reads as filler; attach it or cut it.

## See also

`svg-icon-enrichment` (internal parts animate after the outline draws) · `counting-dynamic-scale` (stroke draws an icon while a number counts up) · `hacker-flip-3d` (logo draws, wordmark decodes beneath).
