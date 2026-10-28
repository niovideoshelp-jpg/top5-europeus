import type { TWord } from "./cues";
import { makePart, type Spec } from "./engine";
import words1 from "../data/part1-words.json";
import { PART1 } from "./part1";
import words2 from "../data/part2-words.json";
import { PART2 } from "./part2";
import words3 from "../data/part3-words.json";
import { PART3 } from "./part3";

// Duração exata de cada narração (ffprobe), em segundos.
const PARTS: { id: string; specs: Spec[]; words: TWord[]; seconds: number }[] = [
  { id: "Part1", specs: PART1, words: words1, seconds: 221.31 },
  { id: "Part2", specs: PART2, words: words2, seconds: 212.04 },
  { id: "Part3", specs: PART3, words: words3, seconds: 226.93 },
];

export const parts = PARTS.map((p, i) => ({
  id: p.id,
  ...makePart(p.specs, p.words, p.seconds, `audio/part${i + 1}.mp3`),
}));
