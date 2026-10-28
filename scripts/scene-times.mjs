// Imprime o meio de cada cena de uma parte (para quadros de conferência).
// Uso: node scripts/scene-times.mjs <n> <duração>
import fs from "fs";
const [, , n, total] = process.argv;
const words = JSON.parse(fs.readFileSync(`src/data/part${n}-words.json`, "utf8"));
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'%]/g, "").replace(/^'+|'+$/g, "");
const src = fs.readFileSync(`src/parts/part${n}.ts`, "utf8");
const cues = [...src.matchAll(/cue: "([^"]+)"/g)].map((m) => m[1]);
let from = 0;
const starts = cues.map((c, i) => {
  if (i === 0) return 0;
  const tk = c.split(/\s+/).map(norm).filter(Boolean);
  for (let j = from; j <= words.length - tk.length; j++) {
    if (tk.every((t, k) => norm(words[j + k].text) === t)) {
      from = j + 1;
      return words[j].start;
    }
  }
  throw new Error(`cue não encontrado: ${c}`);
});
const mids = starts.map((s, i) => (((s + (starts[i + 1] ?? Number(total))) / 2) + 0.15).toFixed(2));
console.log(mids.join(" "));
