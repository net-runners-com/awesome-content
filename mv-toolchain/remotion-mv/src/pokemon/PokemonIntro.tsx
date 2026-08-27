import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";
import durations from "../../public/pokemon/vo/durations.json";

const { fontFamily } = loadFont();

export const FPS = 30;
const GAP_S = 0.6;

// ---- palette (オリジナル配色。公式アセット不使用) ----
const C = {
  bg: "#0E1430",
  bg2: "#141C42",
  cream: "#F4F1E8",
  yellow: "#FFD84D",
  red: "#FF5A5A",
  blue: "#4DA6FF",
  green: "#58D68D",
  dim: "#8A90AC",
};

type Dur = Record<string, number>;
const D = durations as Dur;
const sceneLen = (id: string) => Math.ceil((D[id] + GAP_S) * FPS);

export const SCENES = ["01", "02", "03", "04", "05", "06"] as const;
export const sceneStarts = () => {
  let t = 0;
  const starts: Record<string, number> = {};
  for (const id of SCENES) {
    starts[id] = t;
    t += sceneLen(id);
  }
  return { starts, total: t + Math.ceil(1.2 * FPS) };
};
export const totalDuration = () => sceneStarts().total;

// ---- shared bits ----
const ease = (f: number, from: number, to: number, s: number, e: number) =>
  interpolate(f, [s, e], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const SlamWord: React.FC<{
  text: string;
  at: number;
  color?: string;
  fontSize?: number;
}> = ({ text, at, color = C.cream, fontSize = 86 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - at, fps, config: { damping: 200 } });
  const blur = ease(frame, 14, 0, at, at + 8);
  if (frame < at) return null;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize,
        fontWeight: 900,
        color,
        transform: `scale(${0.6 + 0.4 * sp})`,
        opacity: sp,
        filter: `blur(${blur}px)`,
        margin: "0 10px", whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
};

const Aurora: React.FC<{ seedShift?: number }> = ({ seedShift = 0 }) => {
  const frame = useCurrentFrame();
  const t = (frame + seedShift) / 90;
  const blob = (x: number, y: number, r: number, color: string, ph: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(t + ph) * 60,
        top: y + Math.cos(t * 0.8 + ph) * 40,
        width: r,
        height: r,
        borderRadius: "50%",
        background: color,
        opacity: 0.16,
        filter: "blur(120px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blob(180, 120, 700, C.blue, 0)}
      {blob(1150, 520, 640, C.red, 2.1)}
      {blob(650, 700, 560, C.yellow, 4.2)}
    </AbsoluteFill>
  );
};

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        `linear-gradient(rgba(244,241,232,0.05) 1px, transparent 1px),` +
        `linear-gradient(90deg, rgba(244,241,232,0.05) 1px, transparent 1px)`,
      backgroundSize: "96px 96px",
    }}
  />
);

// オリジナルの「捕獲オーブ」モチーフ（公式ボール意匠は使わない）
const Orb: React.FC<{ size: number; color?: string; progress?: number }> = ({
  size,
  color = C.yellow,
  progress = 1,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `${Math.max(3, size * 0.06)}px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: progress,
      transform: `scale(${0.7 + 0.3 * progress})`,
      boxShadow: `0 0 ${size * 0.5}px ${color}44`,
    }}
  >
    <div
      style={{
        width: size * 0.22,
        height: size * 0.22,
        borderRadius: "50%",
        background: color,
      }}
    />
  </div>
);

const VoiceAndSe: React.FC<{ id: string; se?: "whoosh" | "hit" }> = ({ id, se }) => (
  <>
    <Audio src={staticFile(`pokemon/vo/${id}.wav`)} />
    {se ? <Audio src={staticFile(`pokemon/se/${se}.wav`)} volume={0.35} /> : null}
  </>
);

// ---- Scene 1: フック ----
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const verbs = ["捕まえて", "育てて", "戦って", "交換する"];
  const beat = 0.62 * fps;
  const titleAt = Math.ceil(4.6 * fps);
  const titleSp = spring({ frame: frame - titleAt, fps, config: { damping: 200 } });
  const bgmData = useAudioData(staticFile("pokemon/bgm.wav"));
  let pulse = 0;
  if (bgmData) {
    const v = visualizeAudio({ fps, frame, audioData: bgmData, numberOfSamples: 4 });
    pulse = v[0];
  }
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Aurora />
      <Grid />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
      >
        <div
          style={{
            position: "absolute",
            width: 760 + pulse * 260,
            height: 760 + pulse * 260,
            borderRadius: "50%",
            border: `2px solid ${C.yellow}22`,
          }}
        />
        <div style={{ height: 150, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
          {frame < titleAt
            ? verbs.map((v, i) => (
                <SlamWord key={v} text={v + (i < 3 ? "、" : "。")} at={Math.ceil(i * beat + 6)} />
              ))
            : null}
        </div>
        {frame >= titleAt ? (
          <div style={{ textAlign: "center", transform: `scale(${0.85 + 0.15 * titleSp})`, opacity: titleSp }}>
            <div style={{ fontSize: 44, letterSpacing: "0.5em", color: C.yellow, fontWeight: 700 }}>
              GAME INTRODUCTION
            </div>
            <div style={{ fontSize: 150, fontWeight: 900, color: C.cream, lineHeight: 1.15 }}>
              ポケットモンスター
            </div>
            <div style={{ fontSize: 30, color: C.dim, marginTop: 18 }}>
              世界で一番売れたRPGシリーズ — 非公式ファンメイド紹介
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <VoiceAndSe id="01" se="hit" />
    </AbsoluteFill>
  );
};

// ---- Scene 2: 1996 → 4億本 ----
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSp = spring({ frame, fps, config: { damping: 200 } });
  const countStart = Math.ceil(3.4 * fps);
  const countEnd = Math.ceil(6.4 * fps);
  const n = Math.round(ease(frame, 0, 400_000_000, countStart, countEnd));
  const scale = 1 + ease(frame, 0, 0.12, countStart, countEnd);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 40, opacity: inSp }}>
          <span style={{ fontSize: 120, fontWeight: 900, color: C.yellow }}>1996</span>
          <span style={{ fontSize: 40, color: C.dim }}>ゲームボーイから、すべてが始まった</span>
        </div>
        {frame >= countStart ? (
          <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
            <div
              style={{
                fontSize: 170,
                fontWeight: 900,
                color: C.cream,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {n.toLocaleString()}
            </div>
            <div style={{ fontSize: 46, color: C.yellow, fontWeight: 700, marginTop: 6 }}>
              本以上 — シリーズ累計販売
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <VoiceAndSe id="02" se="whoosh" />
    </AbsoluteFill>
  );
};

// ---- Scene 3: コアループ ----
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = [
    { label: "捕まえる", color: C.red, ang: -90 },
    { label: "育てる", color: C.green, ang: 0 },
    { label: "戦う", color: C.blue, ang: 90 },
    { label: "交換する", color: C.yellow, ang: 180 },
  ];
  const R = 300;
  const cx = 960;
  const cy = 620;
  const nodeAt = (i: number) => Math.ceil((1.6 + i * 1.9) * fps);
  const arcProg = (i: number) =>
    ease(frame, 0, 1, nodeAt(i) + 12, nodeAt(i) + Math.ceil(1.4 * fps));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      <div style={{ position: "absolute", top: 64, width: "100%", textAlign: "center" }}>
        <span style={{ fontSize: 54, fontWeight: 900, color: C.cream }}>終わらない冒険の、4つの循環</span>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {nodes.map((nd, i) => {
          const p = arcProg(i);
          if (p <= 0) return null;
          const start = nd.ang + 14;
          const sweep = 62 * p;
          const a0 = ((start - 90) * Math.PI) / 180;
          const a1 = ((start + sweep - 90) * Math.PI) / 180;
          const large = sweep > 180 ? 1 : 0;
          const x0 = cx + R * Math.cos(a0);
          const y0 = cy + R * Math.sin(a0);
          const x1 = cx + R * Math.cos(a1);
          const y1 = cy + R * Math.sin(a1);
          return (
            <g key={nd.label}>
              <path
                d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`}
                stroke={nd.color}
                strokeWidth={7}
                fill="none"
                strokeLinecap="round"
              />
              {p > 0.95 ? (
                <polygon
                  points={`${x1},${y1} ${x1 - 18},${y1 - 7} ${x1 - 7},${y1 + 14}`}
                  fill={nd.color}
                  transform={`rotate(${start + sweep} ${x1} ${y1})`}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {nodes.map((nd, i) => {
        const sp = spring({ frame: frame - nodeAt(i), fps, config: { damping: 200 } });
        if (frame < nodeAt(i)) return null;
        const x = cx + R * Math.cos(((nd.ang - 90) * Math.PI) / 180);
        const y = cy + R * Math.sin(((nd.ang - 90) * Math.PI) / 180);
        return (
          <div
            key={nd.label}
            style={{
              position: "absolute",
              left: x - 110,
              top: y - 64,
              width: 220,
              height: 128,
              borderRadius: 20,
              background: C.bg2,
              border: `3px solid ${nd.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: `scale(${0.7 + 0.3 * sp})`,
              opacity: sp,
              boxShadow: `0 0 40px ${nd.color}33`,
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: nd.color }} />
            <span style={{ fontSize: 38, fontWeight: 900, color: C.cream }}>{nd.label}</span>
          </div>
        );
      })}
      <VoiceAndSe id="03" se="whoosh" />
    </AbsoluteFill>
  );
};

// ---- Scene 4: タイプ相性 ----
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tri = [
    { label: "みず", color: C.blue, x: 960, y: 300 },
    { label: "ほのお", color: C.red, x: 630, y: 800 },
    { label: "くさ", color: C.green, x: 1290, y: 800 },
  ];
  // VO順: 水→炎, 炎→草, 草→水
  const edges = [
    { from: 0, to: 1, at: 3.0 },
    { from: 1, to: 2, at: 4.6 },
    { from: 2, to: 0, at: 6.2 },
  ];
  const badgeSp = spring({ frame: frame - Math.ceil(1.1 * fps), fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 46,
            fontWeight: 900,
            color: C.bg,
            background: C.yellow,
            padding: "10px 38px",
            borderRadius: 999,
            transform: `scale(${badgeSp})`,
          }}
        >
          18タイプの相性が戦略を生む
        </span>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {edges.map((e) => {
          const p = ease(frame, 0, 1, Math.ceil(e.at * fps), Math.ceil((e.at + 0.9) * fps));
          if (p <= 0) return null;
          const a = tri[e.from];
          const b = tri[e.to];
          const shrink = 120;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const x0 = a.x + ux * shrink;
          const y0 = a.y + uy * shrink;
          const x1 = x0 + ux * (len - shrink * 2) * p;
          const y1 = y0 + uy * (len - shrink * 2) * p;
          return (
            <g key={e.at}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={tri[e.from].color} strokeWidth={9} strokeLinecap="round" />
              {p > 0.97 ? (
                <polygon
                  points={`${x1 + ux * 26},${y1 + uy * 26} ${x1 - uy * 13},${y1 + ux * 13} ${x1 + uy * 13},${y1 - ux * 13}`}
                  fill={tri[e.from].color}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {tri.map((t, i) => {
        const sp = spring({ frame: frame - Math.ceil((1.6 + i * 0.35) * fps), fps, config: { damping: 200 } });
        return (
          <div
            key={t.label}
            style={{
              position: "absolute",
              left: t.x - 105,
              top: t.y - 105,
              width: 210,
              height: 210,
              borderRadius: "50%",
              background: C.bg2,
              border: `5px solid ${t.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${sp})`,
              boxShadow: `0 0 60px ${t.color}44`,
            }}
          >
            <span style={{ fontSize: 52, fontWeight: 900, color: t.color }}>{t.label}</span>
          </div>
        );
      })}
      <VoiceAndSe id="04" se="hit" />
    </AbsoluteFill>
  );
};

// ---- Scene 5: 図鑑・収集 ----
const blobPath = (seed: number) => {
  // indexシードの決定論的ブロブ（実在キャラの形は使わない）
  const pts: string[] = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const r = 34 + (((seed * 37 + i * 53) % 17) - 8);
    pts.push(`${50 + Math.cos(ang) * r},${50 + Math.sin(ang) * r}`);
  }
  return pts.join(" ");
};

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = 6;
  const rows = 3;
  const shinyIdx = 9;
  const countEnd = Math.ceil(5.2 * fps);
  const n = Math.round(ease(frame, 0, 1000, Math.ceil(2.6 * fps), countEnd));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Grid />
      <div style={{ position: "absolute", top: 92, width: "100%", textAlign: "center" }}>
        <span style={{ fontSize: 58, fontWeight: 900, color: C.cream }}>
          もうひとつのゴール — 図鑑の完成
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 260,
          width: 1400,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 26,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          const at = Math.ceil((0.8 + i * 0.22) * fps);
          const sp = spring({ frame: frame - at, fps, config: { damping: 200 } });
          if (frame < at) return <div key={i} style={{ height: 170 }} />;
          const shiny = i === shinyIdx;
          const cc = shiny ? C.yellow : [C.blue, C.red, C.green][i % 3];
          return (
            <div
              key={i}
              style={{
                height: 170,
                borderRadius: 16,
                background: C.bg2,
                border: `2px solid ${shiny ? C.yellow : "#2A3358"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${0.7 + 0.3 * sp}) rotateY(${(1 - sp) * 70}deg)`,
                opacity: sp,
                boxShadow: shiny ? `0 0 46px ${C.yellow}66` : "none",
              }}
            >
              <svg width={100} height={100} viewBox="0 0 100 100">
                <polygon points={blobPath(i)} fill={`${cc}55`} stroke={cc} strokeWidth={3} />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 120, width: "100%", textAlign: "center" }}>
        <span
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: C.yellow,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n.toLocaleString()}+
        </span>
        <span style={{ fontSize: 44, color: C.dim, fontWeight: 700, marginLeft: 20 }}>種類</span>
      </div>
      <VoiceAndSe id="05" se="whoosh" />
    </AbsoluteFill>
  );
};

// ---- Scene 6: 締め ----
const S6: React.FC<{ sceneFrames: number }> = ({ sceneFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSp = spring({ frame: frame - Math.ceil(0.4 * fps), fps, config: { damping: 200 } });
  const orbP = ease(frame, 0, 1, Math.ceil(2.2 * fps), Math.ceil(3.4 * fps));
  const fadeOut = ease(frame, 1, 0, sceneFrames - Math.ceil(0.9 * fps), sceneFrames - 6);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Aurora seedShift={300} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 46,
          opacity: fadeOut,
        }}
      >
        <div style={{ opacity: orbP }}>
          <Orb size={130} progress={orbP} />
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            color: C.cream,
            opacity: inSp,
            transform: `translateY(${(1 - inSp) * 40}px)`,
          }}
        >
          きみだけの冒険が、ここから。
        </div>
        <div style={{ fontSize: 30, color: C.dim, opacity: orbP }}>
          非公式ファンメイド紹介動画 / 素材・音声はすべてオリジナル生成
        </div>
      </AbsoluteFill>
      <VoiceAndSe id="06" />
    </AbsoluteFill>
  );
};

// ---- Root composition ----
export const PokemonIntro: React.FC = () => {
  const { starts, total } = sceneStarts();
  const bgmVolume = (f: number) =>
    interpolate(f, [0, 45, total - 60, total - 8], [0, 0.14, 0.14, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return (
    <AbsoluteFill style={{ fontFamily, background: C.bg }}>
      <Audio src={staticFile("pokemon/bgm.wav")} volume={bgmVolume} />
      <Sequence from={starts["01"]} durationInFrames={sceneLen("01")}>
        <S1 />
      </Sequence>
      <Sequence from={starts["02"]} durationInFrames={sceneLen("02")}>
        <S2 />
      </Sequence>
      <Sequence from={starts["03"]} durationInFrames={sceneLen("03")}>
        <S3 />
      </Sequence>
      <Sequence from={starts["04"]} durationInFrames={sceneLen("04")}>
        <S4 />
      </Sequence>
      <Sequence from={starts["05"]} durationInFrames={sceneLen("05")}>
        <S5 />
      </Sequence>
      <Sequence from={starts["06"]} durationInFrames={total - starts["06"]}>
        <S6 sceneFrames={total - starts["06"]} />
      </Sequence>
    </AbsoluteFill>
  );
};
