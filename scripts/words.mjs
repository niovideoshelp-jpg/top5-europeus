// Junta os tokens do Whisper em palavras com início/fim (s) para o motor de cenas.
// Uso: node scripts/words.mjs <captions.json> <saida.json>
import fs from "fs";

const [, , input, output] = process.argv;
const caps = JSON.parse(fs.readFileSync(input, "utf8"));
const words = [];
for (const c of caps) {
  const t = c.text;
  if (!t.trim()) continue;
  if (/^\s/.test(t) || !words.length) words.push({ text: t.trim(), start: c.startMs, end: c.endMs });
  else {
    words[words.length - 1].text += t;
    words[words.length - 1].end = c.endMs;
  }
}
const out = words
  .filter((w) => !/^\[.*\]$/.test(w.text))
  .map((w) => ({ text: w.text, start: +(w.start / 1000).toFixed(2), end: +(w.end / 1000).toFixed(2) }));
fs.writeFileSync(output, JSON.stringify(out));

let line = "";
let t0 = 0;
for (const w of out) {
  if (!line) t0 = w.start;
  line += w.text + " ";
  if (/[.!?]$/.test(w.text)) {
    console.log(`${t0.toFixed(2).padStart(7)} | ${line.trim()}`);
    line = "";
  }
}
if (line) console.log(`${t0.toFixed(2).padStart(7)} | ${line.trim()}`);
