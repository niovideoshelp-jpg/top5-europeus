import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Bubble, PhotoCard, Scribble, Stamp, VideoCard, WorldMap } from "../components/Extras";
import { RollingCounter, Rings, TornLabel, UiTags } from "../components/Graphics";
import { Enter, Push, Shade } from "../components/Layout";
import { Black, Cutout, Footage, Paper, Photo } from "../components/Media";
import type { SfxEvent, SfxName } from "../components/Sfx";
import { SfxTrack } from "../components/Sfx";
import { LetterDrop, SpreadWords, Typewriter, WordDarken, WordFlash, type Word } from "../components/Text";
import { Texture } from "../components/Texture";
import { useGsap } from "../lib/gsap";
import { C, rgbSplit, rgbSplitFilter, sec, serif } from "../lib/theme";
import { displayText, findPhrase, phraseWords, type TWord } from "./cues";

const WHITE = "#efede8";
type Look = "bw" | "faded" | "color";
type Face = "serif" | "sans";

export type TextSpec =
  | { k: "drop"; say: string; text?: string; face?: Face; x?: number; y?: number; size?: number }
  | { k: "darken"; say: string; face?: Face; x?: number; y?: number; size?: number }
  | { k: "flash"; say: string; face?: Face; y?: number; size?: number }
  | { k: "type"; say: string; text?: string; y?: number; size?: number }
  | { k: "spread"; say: string; y?: number; size?: number; gap?: number }
  | { k: "torn"; say: string; text?: string; x?: number; y?: number; size?: number; rotate?: number }
  | { k: "tags"; items: { text: string; say?: string }[]; x?: number; y?: number; size?: number }
  | { k: "counter"; say: string; values: string[]; dur?: number; y?: number; size?: number }
  | { k: "stamp"; say: string; text: string; x?: number; y?: number; size?: number; rotate?: number }
  | { k: "strike"; say: string; y?: number }
  | { k: "cross"; say: string };

export type CutoutSpec = {
  src: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  from?: "bottom" | "right" | "left" | "top";
  delay?: number;
  float?: number;
  look?: Look;
  black?: boolean;
};

export type Spec = {
  cue: string;
  bg?: "paper" | "beige" | "black" | "teal";
  footage?: string;
  photo?: string;
  look?: Look;
  punch?: boolean;
  origin?: string;
  zoom?: [number, number];
  fit?: "cover" | "contain";
  cutouts?: CutoutSpec[];
  cards?: string[];
  flags?: string[];
  map?: { sites: [number, number][]; arcs?: boolean; origin?: [number, number]; zoom?: [number, number] };
  rank?: { n: number; name: string; country: string; flag: string; photo?: string };
  silhouettes?: string[];
  earth?: boolean;
  rings?: boolean;
  doc?: string;
  video?: { src: string; title: string };
  bubbles?: string[];
  text?: TextSpec[];
  noShade?: boolean;
  sfx?: SfxName | "none";
};

export type Resolved = Spec & { t: number; end: number; words: TWord[] };

// Resolve o início de cada cena pela frase-gatilho, em ordem.
export const resolve = (specs: Spec[], words: TWord[], total: number): Resolved[] => {
  let from = 0;
  const starts = specs.map((s, i) => {
    if (i === 0) return 0;
    const idx = findPhrase(words, s.cue, from);
    from = idx + 1;
    return words[idx].start;
  });
  return specs.map((s, i) => ({ ...s, t: starts[i], end: starts[i + 1] ?? total, words }));
};

const isDark = (s: Spec) =>
  !!(s.footage || s.photo || s.bg === "black" || s.bg === "teal" || s.rank || s.earth || s.video);

/* ───────────── textos ───────────── */

const TextLayer: React.FC<{ spec: TextSpec; s: Resolved }> = ({ spec, s }) => {
  const l = (abs: number) => +(abs - s.t).toFixed(3);
  const dark = isDark(s);
  const color = dark ? WHITE : C.ink;
  const onMedia = !!(s.footage || s.photo);
  const get = (say: string) => phraseWords(s.words, say, s.t - 0.05);

  switch (spec.k) {
    case "drop": {
      const ws = get(spec.say);
      const dur = Math.min(0.9, Math.max(0.25, ws[ws.length - 1].end - ws[0].start));
      return (
        <LetterDrop
          text={spec.text ?? displayText(spec.say, ws)}
          face={spec.face ?? "serif"}
          size={spec.size ?? (spec.face === "sans" ? 60 : 112)}
          color={color}
          x={spec.x}
          y={spec.y ?? (onMedia ? 80 : 50)}
          start={l(ws[0].start)}
          duration={dur}
        />
      );
    }
    case "darken": {
      const lines = spec.say.split("|").map((p) => p.trim());
      let cursor = s.t - 0.05;
      const ls: Word[][] = lines.map((p) => {
        const ws = phraseWords(s.words, p, cursor);
        cursor = ws[ws.length - 1].start;
        const shown = p.split(/\s+/);
        return ws.map((w, i) => ({ text: shown[i] + (i === ws.length - 1 ? displayText("", [w]) : ""), start: l(w.start) }));
      });
      return (
        <WordDarken
          lines={ls}
          face={spec.face ?? "serif"}
          size={spec.size ?? (lines.length > 1 ? 70 : 88)}
          color={color}
          x={spec.x}
          y={spec.y ?? (onMedia ? 82 : 50)}
        />
      );
    }
    case "flash": {
      const groups = spec.say.split("/").map((p) => p.trim());
      let cursor = s.t - 0.05;
      const ws: Word[] = groups.map((g) => {
        const w = phraseWords(s.words, g, cursor);
        cursor = w[w.length - 1].start;
        return { text: displayText(g, w), start: l(w[0].start) };
      });
      return <WordFlash words={ws} face={spec.face ?? "serif"} size={spec.size ?? 112} color={color} y={spec.y ?? (onMedia ? 80 : 50)} />;
    }
    case "type": {
      const ws = get(spec.say);
      const text = spec.text ?? displayText(spec.say, ws);
      const dur = Math.max(0.4, ws[ws.length - 1].end - ws[0].start);
      return <Typewriter text={text} start={l(ws[0].start)} duration={dur} size={spec.size ?? 52} color={color} y={spec.y ?? (onMedia ? 14 : 50)} />;
    }
    case "spread": {
      const ws = get(spec.say);
      return (
        <SpreadWords
          words={ws.map((w, i) => ({ text: spec.say.split(/\s+/)[i], start: l(w.start) }))}
          y={spec.y ?? 16}
          size={spec.size ?? 68}
          gap={spec.gap ?? 100}
          color={color}
        />
      );
    }
    case "torn": {
      const ws = get(spec.say);
      return (
        <TornLabel
          text={spec.text ?? spec.say}
          start={l(ws[0].start)}
          x={spec.x}
          y={spec.y ?? 76}
          size={spec.size ?? 76}
          rotate={spec.rotate ?? (random(spec.say) - 0.5) * 6}
          seed={spec.say}
        />
      );
    }
    case "tags": {
      let cursor = s.t - 0.05;
      const tags = spec.items.map((it, i) => {
        if (it.say) {
          const w = phraseWords(s.words, it.say, cursor);
          cursor = w[0].start;
          return { text: it.text, at: l(w[0].start) };
        }
        return { text: it.text, at: 0.25 + i * 0.25 };
      });
      return <UiTags tags={tags} x={spec.x ?? 76} y={spec.y ?? 54} size={spec.size ?? 40} />;
    }
    case "counter": {
      const ws = get(spec.say);
      return <RollingCounter values={spec.values} start={l(ws[0].start)} duration={spec.dur ?? 1} size={spec.size ?? 170} y={spec.y ?? 55} color={color} />;
    }
    case "stamp": {
      const ws = get(spec.say);
      return <Stamp text={spec.text} at={l(ws[0].start)} x={spec.x} y={spec.y} size={spec.size ?? 118} rotate={spec.rotate} />;
    }
    case "strike": {
      const ws = get(spec.say);
      const y = ((spec.y ?? 55) / 100) * 1080;
      return <Scribble at={l(ws[ws.length - 1].end)} duration={0.2} width={14} paths={[`M480,${y + 8} C760,${y - 14} 1120,${y + 18} 1450,${y - 8}`]} />;
    }
    case "cross": {
      const ws = get(spec.say);
      return (
        <Scribble
          at={l(ws[ws.length - 1].start)}
          duration={0.16}
          width={26}
          paths={["M600,250 C800,420 1100,640 1330,820", "M1330,250 C1120,430 820,650 590,830"]}
        />
      );
    }
  }
};

/* ───────────── visuais ───────────── */

const mediaArgs = (v: string) => {
  const [file, rest] = v.split("@");
  const [trim, rate] = (rest ?? "").split("*");
  return { file, trim: trim ? Number(trim) : 0, rate: rate ? Number(rate) : 1 };
};

const Flags: React.FC<{ flags: string[]; dur: number }> = ({ flags, dur }) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".flag"),
      { scale: 0, rotate: (i: number) => (random(`fr${i}`) - 0.5) * 70, opacity: 0 },
      { scale: 1, rotate: (i: number) => (random(`fs${i}`) - 0.5) * 16, opacity: 1, duration: 0.22, ease: "back.out(2.2)", stagger: Math.min(0.12, (dur * 0.5) / flags.length) },
      0.02,
    );
  });
  const n = flags.length;
  return (
    <AbsoluteFill ref={ref}>
      {flags.map((f, i) => {
        const big = n <= 6;
        const w = big ? 260 : 170;
        const h = w * 0.66;
        const pos =
          n <= 6
            ? { left: 960 - (n * (w + 30)) / 2 + i * (w + 30) + 15, top: 300 }
            : { left: 960 + Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * 700 - w / 2, top: 540 + Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * 360 - h / 2 };
        return (
          <div key={f + i} className="flag" style={{ position: "absolute", ...pos, width: w, height: h, padding: 7, background: "#ece9e2", boxShadow: "0 8px 14px rgba(0,0,0,0.3)", opacity: 0 }}>
            <Img src={staticFile(`flags/${f}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) contrast(0.95) blur(0.4px)" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Cards: React.FC<{ cards: string[] }> = ({ cards }) => {
  const slots = [
    { x: 300, y: 110, r: -7 },
    { x: 780, y: 80, r: 5 },
    { x: 1220, y: 140, r: -4 },
    { x: 500, y: 360, r: 6 },
    { x: 990, y: 380, r: -6 },
    { x: 120, y: 400, r: 3 },
  ];
  const ref = useGsap((tl, q) => {
    q(".card").forEach((el, i) => {
      tl.fromTo(
        el,
        { x: i % 2 ? 1400 : -1400, y: -200, rotate: slots[i].r * 4, filter: "blur(10px)" },
        { x: 0, y: 0, rotate: slots[i].r, filter: "blur(0px)", duration: 0.32, ease: "power3.out" },
        0.05 + i * 0.22,
      );
    });
  });
  return (
    <AbsoluteFill ref={ref}>
      {cards.slice(0, 6).map((src, i) => (
        <PhotoCard key={i} className="card" src={src} width={460} height={300} style={{ left: slots[i].x, top: slots[i].y }} />
      ))}
    </AbsoluteFill>
  );
};

const Silhouettes: React.FC<{ srcs: string[] }> = ({ srcs }) => {
  const n = srcs.length;
  const w = Math.min(340, (1800 - (n - 1) * 24) / n);
  const left0 = (1920 - (n * w + (n - 1) * 24)) / 2;
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".panel"), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power3.out", stagger: 0.1 }, 0);
  });
  return (
    <AbsoluteFill ref={ref}>
      {srcs.map((src, i) => (
        <div key={i} className="panel" style={{ position: "absolute", left: left0 + i * (w + 24), top: 250, width: w, height: 480, overflow: "hidden", opacity: 0 }}>
          <Img src={staticFile(src)} style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%", filter: `brightness(0) ${rgbSplitFilter(2)}` }} />
        </div>
      ))}
      {srcs.slice(1).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: left0 + (i + 1) * (w + 24) - 16, top: 220, width: 8, height: 530, background: C.red }} />
      ))}
    </AbsoluteFill>
  );
};

// Cartela de posição do ranking: número grande, nome da unidade, país e bandeira.
const RankCard: React.FC<{ rank: NonNullable<Spec["rank"]>; dur: number }> = ({ rank, dur }) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".num"), { scale: 1.6, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power4.out" }, 0);
    tl.fromTo(q(".bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.out" }, 0.35);
    tl.fromTo(q(".ctry"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3 }, 0.9);
    tl.fromTo(q(".fl"), { scale: 0, rotate: 20 }, { scale: 1, rotate: -4, duration: 0.3, ease: "back.out(2)" }, 1.0);
    tl.fromTo(q(".photo"), { opacity: 0, scale: 1.12 }, { opacity: 0.55, scale: 1, duration: Math.max(1, dur), ease: "sine.out" }, 0);
  });
  return (
    <AbsoluteFill ref={ref} style={{ backgroundColor: C.black }}>
      {rank.photo && (
        <AbsoluteFill className="photo" style={{ opacity: 0 }}>
          <Img src={staticFile(rank.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1) brightness(0.5) blur(1.5px)" }} />
          <Shade strength={0.8} />
        </AbsoluteFill>
      )}
      <div className="num" style={{ position: "absolute", left: 150, top: 120, fontFamily: serif, fontStyle: "italic", fontWeight: 500, fontSize: 640, lineHeight: 1, color: C.red, textShadow: rgbSplit(3), opacity: 0 }}>
        {rank.n}
      </div>
      <div className="bar" style={{ position: "absolute", left: 640, top: 590, width: 1100, height: 8, background: C.red, transformOrigin: "0% 50%" }} />
      <LetterDrop text={rank.name} face="sans" size={rank.name.length > 14 ? 88 : 120} color={WHITE} x={62} y={45} start={0.25} duration={0.6} />
      <div className="ctry" style={{ position: "absolute", left: 660, top: 640, fontFamily: serif, fontStyle: "italic", fontSize: 72, color: WHITE, textShadow: rgbSplit(1.4), opacity: 0 }}>
        {rank.country}
      </div>
      <div className="fl" style={{ position: "absolute", left: 1520, top: 640, width: 210, height: 140, padding: 7, background: "#ece9e2", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile(`flags/${rank.flag}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8)" }} />
      </div>
    </AbsoluteFill>
  );
};

const Doc: React.FC<{ src: string; dur: number }> = ({ src, dur }) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".doc"), { y: 700, rotate: 8 }, { y: 0, rotate: -3, duration: 0.45, ease: "power3.out" }, 0);
    tl.fromTo(q(".doc"), { scale: 1 }, { scale: 1.1, duration: Math.max(0.5, dur - 0.45), ease: "sine.inOut" }, 0.45);
    q(".bar").forEach((el, i) => tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.14 }, 0.6 + i * 0.16));
  });
  return (
    <AbsoluteFill ref={ref}>
      <div className="doc" style={{ position: "absolute", left: 960 - 290, top: 540 - 372, width: 580, height: 744, boxShadow: "0 24px 50px rgba(0,0,0,0.35)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1) blur(0.4px)" }} />
        {[150, 260, 380, 500, 610].map((t, i) => (
          <div key={i} className="bar" style={{ position: "absolute", top: t, left: 50 + (i % 2) * 40, width: 300 + random(`db${i}`) * 120, height: 34, background: "#0b0b0b", transformOrigin: "0% 50%", transform: "scaleX(0)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Earth: React.FC<{ dur: number }> = ({ dur }) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".earth"), { scale: 0.86, rotate: -4 }, { scale: 1.04, rotate: 6, duration: Math.max(1, dur), ease: "sine.inOut" }, 0);
  });
  return (
    <AbsoluteFill ref={ref}>
      <div className="earth" style={{ position: "absolute", left: 960 - 290, top: 455 - 290, width: 580, height: 580, borderRadius: "50%", overflow: "hidden" }}>
        <Img src={staticFile("images/earth.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.12)", filter: "saturate(0.6) contrast(1.05) blur(0.5px)" }} />
      </div>
    </AbsoluteFill>
  );
};

const Bubbles: React.FC<{ texts: string[] }> = ({ texts }) => {
  const pos = [
    { x: 140, y: 150 },
    { x: 1300, y: 120 },
    { x: 220, y: 720 },
    { x: 1240, y: 760 },
    { x: 760, y: 870 },
    { x: 780, y: 90 },
  ];
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".bub"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2.5)", stagger: 0.24 }, 0.08);
  });
  return (
    <AbsoluteFill ref={ref}>
      {texts.slice(0, 6).map((t, i) => (
        <Bubble key={i} className="bub" text={t} style={{ left: pos[i].x, top: pos[i].y, transform: `rotate(${(random(`b${i}${t}`) - 0.5) * 8}deg)`, opacity: 0 }} />
      ))}
    </AbsoluteFill>
  );
};

const cutoutFrom = (c: CutoutSpec) =>
  c.from === "right" ? { x: 900 } : c.from === "left" ? { x: -900 } : c.from === "top" ? { y: -500 } : { y: 480 };

export const SpecScene: React.FC<{ s: Resolved }> = ({ s }) => {
  const dur = s.end - s.t;
  const zoom = s.zoom ?? [1.02, 1.12];
  let base: React.ReactNode;
  if (s.footage) {
    const m = mediaArgs(s.footage);
    base = (
      <>
        <Footage src={`video/${m.file}`} trimBefore={m.trim} playbackRate={m.rate} look={s.look ?? "bw"} punch={s.punch} from={zoom[0]} to={zoom[1]} origin={s.origin} />
        {!s.noShade && s.text?.length ? <Shade /> : null}
      </>
    );
  } else if (s.photo) {
    base = (
      <>
        <Photo src={s.photo} look={s.look ?? "faded"} punch={s.punch} from={zoom[0]} to={zoom[1]} origin={s.origin} fit={s.fit} />
        {!s.noShade && s.text?.length ? <Shade /> : null}
      </>
    );
  } else if (s.rank) {
    base = <RankCard rank={s.rank} dur={dur} />;
  } else if (s.bg === "black" || s.bg === "teal" || s.earth || s.video) {
    base = <Black teal={s.bg === "teal"} />;
  } else {
    base = <Paper beige={s.bg === "beige"} />;
  }

  const layers = (
    <>
      {s.map && <WorldMap sites={s.map.sites.map(([lon, lat], i) => ({ lon, lat, at: 0.15 + i * Math.min(0.2, (dur * 0.6) / s.map!.sites.length) }))} arcs={s.map.arcs} origin={s.map.origin} zoomFrom={s.map.zoom?.[0] ?? 1} zoomTo={s.map.zoom?.[1] ?? 1.1} duration={dur} />}
      {s.flags && <Flags flags={s.flags} dur={dur} />}
      {s.cards && <Cards cards={s.cards} />}
      {s.silhouettes && <Silhouettes srcs={s.silhouettes} />}
      {s.rings && <Rings start={0.1} color="rgba(200,40,30,0.45)" y={42} max={1400} period={2.6} />}
      {s.earth && <Earth dur={dur} />}
      {s.doc && <Doc src={s.doc} dur={dur} />}
      {s.video && (
        <Enter at={0.05} from={{ y: 500 }} duration={0.42}>
          <VideoCard src={s.video.src} title={s.video.title} width={880} progress={0.5} look="bw" style={{ left: 520, top: 180 }} />
        </Enter>
      )}
      {s.bubbles && <Bubbles texts={s.bubbles} />}
      {s.cutouts?.map((c, i) => (
        <Enter key={i} at={c.delay ?? 0} from={cutoutFrom(c)} duration={0.4} float={c.float}>
          <Cutout
            src={`cutouts/${c.src}`}
            look={c.look ?? "faded"}
            style={{ left: c.x, top: c.y, width: c.w, height: c.h, ...(c.black ? { filter: `brightness(0) ${rgbSplitFilter(2)}` } : {}) }}
          />
        </Enter>
      ))}
      {s.text?.map((t, i) => <TextLayer key={i} spec={t} s={s} />)}
    </>
  );

  const pushed = !s.footage && !s.photo && !s.rank && !s.map;
  return (
    <AbsoluteFill>
      {base}
      {pushed ? (
        <Push dur={dur} to={1.05}>
          {layers}
        </Push>
      ) : (
        layers
      )}
    </AbsoluteFill>
  );
};

/* ───────────── efeitos automáticos ───────────── */

const HIT: Partial<Record<SfxName, { trim?: number; peak: number }>> = {
  "whoosh-whip": { trim: 1.3, peak: 0.45 },
  "whoosh-short": { peak: 0.15 },
  "whoosh-little": { trim: 0.6, peak: 0.45 },
  impact: { trim: 0.5, peak: 1.15 },
  riser: { peak: 2.25 },
  shutter: { trim: 0.6, peak: 0.15 },
  click: { trim: 0.3, peak: 0.15 },
  pop: { peak: 0.12 },
  "paper-crumple": { peak: 0.15 },
  scribble: { peak: 0.1 },
};
const hit = (name: SfxName, t: number, gain = 0.5, length?: number): SfxEvent => {
  const h = HIT[name] ?? { peak: 0 };
  return { name, at: Math.max(0, t - h.peak), trim: h.trim, gain, length };
};
const keys = (start: number, duration: number, every = 0.08, gain = 0.18): SfxEvent[] => {
  const out: SfxEvent[] = [];
  for (let t = start, i = 0; t < start + duration; t += every * (0.8 + random(`k${start}${i}`) * 0.4), i++) {
    out.push({ name: i % 2 ? "type-key-2" : "type-key", at: t, gain: gain * (0.7 + random(`kg${start}${i}`) * 0.5) });
  }
  return out;
};

export const buildSfx = (scenes: Resolved[], total: number): SfxEvent[] => {
  const ev: SfxEvent[] = [
    { name: "drone-bed", at: 0, gain: 0.1, length: Math.min(total, 117) },
    { name: "projector", at: 0, gain: 0.035, trim: 2, length: Math.min(total, 97) },
  ];
  if (total > 117) ev.push({ name: "drone-bed", at: 117, gain: 0.1, trim: 2, length: total - 117 });
  if (total > 97) ev.push({ name: "projector", at: 97, gain: 0.035, trim: 2, length: total - 97 });
  const whooshes: SfxName[] = ["whoosh-short", "whoosh-little", "whoosh-whip"];
  scenes.forEach((s, i) => {
    if (s.sfx !== "none") {
      const cut: SfxName = s.sfx ?? (s.rank ? "impact" : s.photo ? "shutter" : whooshes[i % 3]);
      if (s.rank) {
        ev.push(hit("riser", s.t, 0.4), hit("impact", s.t + 0.05, 0.55), hit("boom", s.t, 0.3));
      } else if (i > 0) {
        ev.push(hit(cut, s.t, cut === "whoosh-whip" ? 0.38 : 0.4));
      }
    }
    if (s.flags) s.flags.forEach((_, k) => ev.push(hit("pop", s.t + 0.05 + k * Math.min(0.12, ((s.end - s.t) * 0.5) / s.flags!.length), 0.16)));
    if (s.cards) s.cards.slice(0, 6).forEach((_, k) => ev.push(hit("pop", s.t + 0.1 + k * 0.22, 0.22)));
    if (s.silhouettes) s.silhouettes.forEach((_, k) => ev.push(hit("pop", s.t + k * 0.1, 0.22)));
    if (s.map) s.map.sites.forEach((_, k) => ev.push(hit("pop", s.t + 0.15 + k * Math.min(0.2, ((s.end - s.t) * 0.6) / s.map!.sites.length), 0.12)));
    if (s.bubbles) s.bubbles.slice(0, 6).forEach((_, k) => ev.push(hit("pop", s.t + 0.08 + k * 0.24, 0.24)));
    if (s.doc) [0, 1, 2, 3, 4].forEach((k) => ev.push(hit("scribble", s.t + 0.6 + k * 0.16, 0.22)));
    s.cutouts?.forEach((c) => ev.push(hit("whoosh-whip", s.t + (c.delay ?? 0) + 0.2, 0.3)));
    s.text?.forEach((tx) => {
      const get = (say: string) => phraseWords(s.words, say, s.t - 0.05);
      try {
        if (tx.k === "drop" || tx.k === "type") {
          const ws = get(tx.say);
          ev.push(...keys(ws[0].start, Math.min(1, Math.max(0.3, ws[ws.length - 1].end - ws[0].start)), tx.k === "type" ? 0.07 : 0.09, 0.16));
        } else if (tx.k === "spread") get(tx.say).forEach((w) => ev.push(hit("pop", w.start, 0.2)));
        else if (tx.k === "flash") {
          let cur = s.t - 0.05;
          tx.say.split("/").forEach((g) => {
            const w = phraseWords(s.words, g.trim(), cur);
            cur = w[w.length - 1].start;
            ev.push(hit("pop", w[0].start, 0.18));
          });
        } else if (tx.k === "torn") ev.push(hit("whoosh-short", get(tx.say)[0].start, 0.35));
        else if (tx.k === "tags") {
          let cur = s.t - 0.05;
          tx.items.forEach((it, k) => {
            if (it.say) {
              const w = phraseWords(s.words, it.say, cur);
              cur = w[0].start;
              ev.push(hit("click", w[0].start, 0.32));
            } else ev.push(hit("click", s.t + 0.25 + k * 0.25, 0.32));
          });
        } else if (tx.k === "counter") ev.push(...keys(get(tx.say)[0].start, tx.dur ?? 1, 0.05, 0.12));
        else if (tx.k === "stamp") {
          const w = get(tx.say)[0].start + 0.14;
          ev.push(hit("stamp", w, 0.9), hit("impact", w, 0.4));
        } else if (tx.k === "strike") ev.push(hit("scribble", get(tx.say).slice(-1)[0].end, 0.6));
        else if (tx.k === "cross") {
          const w = get(tx.say).slice(-1)[0].start;
          ev.push(hit("scribble", w, 0.5), hit("scribble", w + 0.14, 0.5), hit("impact", w, 0.45));
        }
      } catch {
        // frase ausente já é acusada pelo TextLayer
      }
    });
  });
  return ev;
};

/* ───────────── composição ───────────── */

export const makePart = (specs: Spec[], words: TWord[], total: number, audio: string) => {
  const scenes = resolve(specs, words, total);
  const sfx = buildSfx(scenes, total);
  const frames = sec(total);
  const Part: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      {scenes.map((s, i) => {
        const from = sec(s.t);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, sec(s.end) - from)} premountFor={30} name={`${String(i + 1).padStart(3, "0")} ${s.cue}`}>
            <SpecScene s={s} />
          </Sequence>
        );
      })}
      <Texture />
      <Audio src={staticFile(audio)} />
      <SfxTrack events={sfx} />
      <FadeToBlack frames={8} total={frames} />
    </AbsoluteFill>
  );
  return { Part, frames, scenes };
};

const FadeToBlack: React.FC<{ frames: number; total: number }> = ({ frames, total }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [total - frames, total - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity }} />;
};

