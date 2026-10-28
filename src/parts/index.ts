import type { TWord } from "./cues";
import { makePart, type Spec } from "./engine";
import words1 from "../data/part1-words.json";
import { PART1 } from "./part1";
import words2 from "../data/part2-words.json";
import { PART2 } from "./part2";
import words3 from "../data/part3-words.json";
import { PART3 } from "./part3";
import words4 from "../data/part4-words.json";
import { PART4 } from "./part4";
import words5 from "../data/part5-words.json";
import { PART5 } from "./part5";

// Duração exata de cada narração (ffprobe), em segundos.
const PARTS: { id: string; specs: Spec[]; words: TWord[]; seconds: number }[] = [
  { id: "Part1", specs: PART1, words: words1, seconds: 221.31 },
  { id: "Part2", specs: PART2, words: words2, seconds: 212.04 },
  { id: "Part3", specs: PART3, words: words3, seconds: 226.93 },
  { id: "Part4", specs: PART4, words: words4, seconds: 190.04 },
  { id: "Part5", specs: PART5, words: words5, seconds: 225.80 },
];

export const parts = PARTS.map((p, i) => ({
  id: p.id,
  ...makePart(p.specs, p.words, p.seconds, `audio/part${i + 1}.mp3`),
}));
