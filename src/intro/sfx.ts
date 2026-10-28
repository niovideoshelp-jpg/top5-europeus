import { random } from "remotion";
import type { SfxEvent, SfxName } from "../components/Sfx";

// Deslocamento até o pico de cada som (medido nos arquivos), já considerando o trim.
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

// Som cujo pico cai exatamente em `t`.
const hit = (name: SfxName, t: number, gain = 0.5, length?: number): SfxEvent => {
  const h = HIT[name] ?? { peak: 0 };
  return { name, at: Math.max(0, t - h.peak), trim: h.trim, gain, length };
};

const keys = (start: number, duration: number, every = 0.085, gain = 0.22): SfxEvent[] => {
  const out: SfxEvent[] = [];
  for (let t = start, i = 0; t < start + duration; t += every * (0.8 + random(`k${start}${i}`) * 0.4), i++) {
    out.push({ name: i % 2 ? "type-key-2" : "type-key", at: t, gain: gain * (0.7 + random(`kg${start}${i}`) * 0.5) });
  }
  return out;
};

const pops = (start: number, n: number, every: number, gain = 0.22) =>
  Array.from({ length: n }, (_, i) => hit("pop", start + i * every, gain * (0.8 + random(`p${start}${i}`) * 0.4)));

export const SFX: SfxEvent[] = [
  { name: "drone-bed", at: 0, gain: 0.1, length: 88 },
  { name: "projector", at: 0, gain: 0.035, trim: 2, length: 88 },

  ...keys(0.06, 0.8),
  hit("whoosh-short", 1.09, 0.45),
  ...pops(1.12, 16, 0.055, 0.16),
  hit("whoosh-whip", 2.4, 0.4),
  hit("sub-kick", 3.65, 0.6),
  ...pops(3.72, 8, 0.08, 0.12),
  hit("shutter", 4.64, 0.45),
  ...keys(4.64, 1.4, 0.09, 0.16),
  hit("impact", 7.55, 0.55),
  hit("scribble", 7.58, 0.5),
  hit("scribble", 7.75, 0.5),
  hit("whoosh-short", 8.0, 0.4),
  hit("pop", 8.57, 0.2),
  hit("whoosh-whip", 9.63, 0.42),
  hit("whoosh-little", 11.38, 0.45),
  ...[11.44, 11.98, 12.38].map((t) => hit("pop", t, 0.22)),
  hit("scribble", 12.6, 0.45),
  hit("glitch", 13.04, 0.35),
  hit("whoosh-short", 13.67, 0.4),
  hit("whoosh-little", 14.6, 0.45),
  ...[14.75, 15.0, 15.25, 15.5].map((t) => hit("click", t, 0.35)),
  hit("whoosh-whip", 15.92, 0.4),
  ...pops(18.04, 5, 0.1, 0.25),
  ...keys(18.04, 1.1, 0.09, 0.14),
  hit("riser", 21.84, 0.42),
  hit("sub-kick", 21.84, 0.7),
  hit("boom", 22.56, 0.22),
  hit("shutter", 23.2, 0.4),
  ...keys(24.71, 2.1, 0.07, 0.18),
  hit("click", 26.0, 0.4),
  hit("shutter", 27.5, 0.5),
  hit("whoosh-short", 28.58, 0.4),
  hit("whoosh-little", 29.41, 0.4),
  ...pops(29.86, 8, 0.16, 0.14),
  hit("glitch", 31.6, 0.3),
  ...keys(31.8, 0.9, 0.05, 0.12),
  hit("stamp", 32.75, 0.55),
  hit("whoosh-whip", 33.5, 0.45),
  ...[33.66, 34.1, 34.66, 35.18].map((t) => hit("click", t, 0.35)),
  hit("whoosh-short", 36.08, 0.4),
  hit("whoosh-short", 37.82, 0.4),
  hit("shutter", 39.8, 0.35),
  ...keys(40.5, 1.05, 0.06, 0.14),
  hit("shutter", 41.92, 0.45),
  hit("whoosh-short", 42.33, 0.35),
  hit("whoosh-whip", 43.96, 0.42),
  hit("whoosh-short", 45.69, 0.35),
  hit("glitch", 47.02, 0.55),
  { name: "static", at: 47.02, trim: 3.2, length: 0.6, gain: 0.35 },
  hit("boom", 47.02, 0.25),
  ...pops(47.82, 6, 0.2, 0.25),
  hit("whoosh-short", 49.4, 0.3),
  hit("whoosh-little", 50.56, 0.4),
  hit("pop", 51.6, 0.3),
  hit("paper-crumple", 53.4, 0.7),
  hit("whoosh-short", 53.75, 0.35),
  hit("pop", 54.35, 0.3),
  ...[55.25, 55.87, 56.52, 57.35, 58.13, 58.52].map((t) => hit("shutter", t, 0.42)),
  hit("whoosh-little", 59.4, 0.35),
  ...[59.95, 60.25, 60.55].map((t) => hit("whoosh-short", t, 0.3)),
  hit("click", 63.1, 0.45),
  hit("whoosh-short", 63.7, 0.3),
  hit("sub-kick", 65.0, 0.6),
  ...keys(66.89, 0.95, 0.08, 0.16),
  hit("shutter", 68.76, 0.4),
  ...keys(68.76, 1.1, 0.08, 0.18),
  hit("scribble", 71.12, 0.6),
  hit("scribble", 71.25, 0.5),
  ...pops(71.56, 6, 0.24, 0.25),
  hit("whoosh-little", 73.6, 0.4),
  ...[74.84, 75.0, 75.16, 75.32, 75.48].map((t) => hit("scribble", t, 0.25)),
  hit("stamp", 76.78, 0.9),
  hit("impact", 76.78, 0.45),
  hit("sub-kick", 77.44, 0.5),
  ...keys(77.96, 0.9, 0.08, 0.16),
  hit("whoosh-whip", 79.4, 0.42),
  ...pops(80.41, 5, 0.1, 0.22),
  ...[81.85, 82.1, 82.35, 82.6].map((t) => hit("click", t, 0.32)),
  hit("whoosh-short", 83.9, 0.35),
  hit("click", 85.27, 0.5),
  hit("riser", 87.57, 0.4),
  ...keys(86.96, 0.6, 0.07, 0.18),
  hit("boom", 87.57, 0.45),
];
