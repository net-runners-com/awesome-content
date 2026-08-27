// Text Lab — GSAP + SplitText によるテキストアニメーション8種（MV/タイトル向け）
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const stage = document.getElementById("stage");
const jp = document.getElementById("jp");
const en = document.getElementById("en");
const codeEl = document.getElementById("code");
let current = null;   // { tl, splits }
let speed = 1;

const kill = () => {
  if (current) { current.tl.kill(); current.splits.forEach((s) => s.revert()); }
  gsap.set([jp, en], { clearProps: "all" });
  stage.className = "stage";
  current = null;
};
const split = (el, type) => new SplitText(el, { type, charsClass: "ch", wordsClass: "wd", linesClass: "ln" });

// 各エフェクト: 分割 → timeline を返す。SplitText の revert で毎回クリーンに戻る。
const FX = {
  pop: {
    name: "Pop In", desc: "文字ごとに back.out で弾む。ランダム回転で手描き感。",
    run() {
      const a = split(jp, "chars"), b = split(en, "chars");
      const tl = gsap.timeline();
      tl.from(a.chars, { scale: 0, rotation: () => gsap.utils.random(-25, 25), y: 40, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.05 })
        .from(b.chars, { scale: 0, y: 20, opacity: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.03 }, "-=0.3");
      return { tl, splits: [a, b] };
    },
    code: `const s = new SplitText(el, { type: "chars" });
gsap.from(s.chars, { scale: 0, y: 40, opacity: 0, rotation: () => gsap.utils.random(-25, 25),
  duration: 0.7, ease: "back.out(2)", stagger: 0.05 });`,
  },
  wave: {
    name: "Wave Loop", desc: "文字が波打つループ。歌詞の待機表示に。",
    run() {
      const a = split(jp, "chars"), b = split(en, "chars");
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(a.chars, { y: -22, duration: 0.45, ease: "sine.inOut", stagger: { each: 0.06, yoyo: true, repeat: 1 } })
        .to(b.chars, { y: -10, color: "#FFD23F", duration: 0.35, ease: "sine.inOut", stagger: { each: 0.03, yoyo: true, repeat: 1 } }, 0.2);
      return { tl, splits: [a, b] };
    },
    code: `gsap.to(s.chars, { y: -22, duration: 0.45, ease: "sine.inOut",
  stagger: { each: 0.06, yoyo: true, repeat: 1 } });`,
  },
  type: {
    name: "Typewriter", desc: "1文字ずつ即時表示 + 点滅カーソル。",
    run() {
      const a = split(jp, "chars"), b = split(en, "chars");
      stage.classList.add("caret");
      const tl = gsap.timeline();
      tl.set([a.chars, b.chars], { opacity: 0 })
        .to(a.chars, { opacity: 1, duration: 0.01, stagger: 0.09 })
        .to(b.chars, { opacity: 1, duration: 0.01, stagger: 0.045 }, "+=0.3");
      return { tl, splits: [a, b] };
    },
    code: `gsap.set(s.chars, { opacity: 0 });
gsap.to(s.chars, { opacity: 1, duration: 0.01, stagger: 0.09 }); // 補間なし=タイプ感`,
  },
  glitch: {
    name: "Glitch", desc: "RGBずれ + clip-path スライスを短時間だけ。決定論的な乱数で毎回同じ。",
    run() {
      const a = split(jp, "chars");
      stage.classList.add("glitch");
      const tl = gsap.timeline();
      tl.from(a.chars, { opacity: 0, x: () => gsap.utils.random(-30, 30), duration: 0.05, stagger: { each: 0.02, from: "random" } });
      for (let i = 0; i < 8; i++) {
        tl.set(jp, { "--gx": `${(i % 2 ? 1 : -1) * (3 + i)}px`, "--clip": `${10 + i * 9}% 0 ${70 - i * 8}% 0` }, "+=" + (0.04 + i * 0.01));
      }
      tl.set(jp, { "--gx": "0px", "--clip": "0 0 0 0" }).from(en, { opacity: 0, x: -8, duration: 0.25 });
      return { tl, splits: [a] };
    },
    code: `/* CSS: .glitch #jp::before/::after が text-shadow(RGB) と clip-path(inset(var(--clip))) を持つ */
for (let i = 0; i < 8; i++) tl.set(el, { "--gx": ..., "--clip": ... }, "+=0.05");`,
  },
  mask: {
    name: "Mask Reveal", desc: "行ごとにマスクの下からスライドアップ。映像のタイトルの定番。",
    run() {
      const a = split(jp, "lines"), b = split(en, "lines");
      stage.classList.add("mask");
      const tl = gsap.timeline();
      tl.from([...a.lines, ...b.lines], { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.12 });
      return { tl, splits: [a, b] };
    },
    code: `const s = new SplitText(el, { type: "lines", linesClass: "ln" }); // .ln { overflow: hidden }
gsap.from(s.lines, { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.12 });`,
  },
  blur: {
    name: "Focus In", desc: "ブラー + 字間の収縮でピントが合う。静かな導入に。",
    run() {
      const tl = gsap.timeline();
      tl.from(jp, { filter: "blur(18px)", letterSpacing: "0.35em", opacity: 0, duration: 1.3, ease: "power3.out" })
        .from(en, { filter: "blur(10px)", opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.7");
      return { tl, splits: [] };
    },
    code: `gsap.from(el, { filter: "blur(18px)", letterSpacing: "0.35em", opacity: 0,
  duration: 1.3, ease: "power3.out" });`,
  },
  swap: {
    name: "Word Swap", desc: "1語だけ入れ替わるキネティック。動詞の連打に。",
    run() {
      const words = ["捕まえて", "育てて", "戦って", "つないで"];
      jp.innerHTML = `<span id="fix">世界を、</span><span id="slot">${words[0]}</span>`;
      const slot = jp.querySelector("#slot");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });
      words.forEach((w, i) => {
        tl.call(() => { slot.textContent = w; slot.style.color = ["#FF4F9A", "#3EE0D8", "#FFD23F", "#7B2CFF"][i]; })
          .from(slot, { yPercent: 80, opacity: 0, duration: 0.4, ease: "power3.out" })
          .to(slot, { yPercent: -80, opacity: 0, duration: 0.3, ease: "power3.in" }, "+=0.7");
      });
      tl.from(en, { opacity: 0, duration: 0.6 }, 0);
      return { tl, splits: [] };
    },
    code: `words.forEach(w => tl.call(() => slot.textContent = w)
  .from(slot, { yPercent: 80, opacity: 0, duration: 0.4 })
  .to(slot, { yPercent: -80, opacity: 0, duration: 0.3 }, "+=0.7"));`,
  },
  karaoke: {
    name: "Karaoke", desc: "文字を時間に沿って塗る。TextAlive の歌詞タイミングにそのまま繋げられる。",
    run() {
      const a = split(jp, "chars"), b = split(en, "words");
      stage.classList.add("karaoke");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
      tl.set([a.chars, b.words], { color: "rgba(255,248,238,.28)" })
        .to(a.chars, { color: "#FFF8EE", textShadow: "0 0 18px rgba(255,210,63,.9)", duration: 0.18, stagger: 0.16, ease: "none" })
        .to(b.words, { color: "#FFD23F", duration: 0.2, stagger: 0.32, ease: "none" }, "-=0.2");
      return { tl, splits: [a, b] };
    },
    code: `// 実運用では stagger の代わりに TextAlive の各文字の startTime を position に使う
tl.to(s.chars, { color: "#FFF8EE", duration: 0.18, stagger: 0.16, ease: "none" });`,
  },
};

const buttons = document.getElementById("buttons");
Object.entries(FX).forEach(([key, fx], i) => {
  const b = document.createElement("button");
  b.className = "btn" + (i === 0 ? " on" : ""); b.textContent = fx.name; b.dataset.fx = key;
  b.addEventListener("click", () => play(key));
  buttons.appendChild(b);
});
function play(key) {
  kill();
  jp.textContent = "音に乗って、光になる。";
  en.textContent = "MOVE WITH THE BEAT";
  document.querySelectorAll("[data-fx]").forEach((x) => x.classList.toggle("on", x.dataset.fx === key));
  document.getElementById("fx-name").textContent = FX[key].name;
  document.getElementById("fx-desc").textContent = FX[key].desc;
  codeEl.textContent = FX[key].code;
  current = FX[key].run();
  current.tl.timeScale(speed);
}
document.getElementById("replay").addEventListener("click", () => play(document.querySelector("[data-fx].on").dataset.fx));
document.getElementById("speed").addEventListener("input", (e) => { speed = Number(e.target.value); if (current) current.tl.timeScale(speed); document.getElementById("speed-v").textContent = speed.toFixed(2) + "x"; });
document.getElementById("copy").addEventListener("click", async () => { try { await navigator.clipboard.writeText(codeEl.textContent); } catch {} });
document.fonts.ready.then(() => play("pop"));
