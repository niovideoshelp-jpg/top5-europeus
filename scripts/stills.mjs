// Renderiza quadros de conferência reaproveitando um único bundle.
// Uso: node scripts/stills.mjs <saida> <seg1> <seg2> ...   (escala 0.5)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";

const [, , outDir, ...times] = process.argv;
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "Intro" });

for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(t) * composition.fps));
  await renderStill({
    serveUrl,
    composition,
    frame,
    scale: 0.5,
    imageFormat: "jpeg",
    jpegQuality: 80,
    output: path.join(outDir, `f_${String(t).padStart(6, "0")}.jpg`),
  });
  process.stdout.write(`${t} `);
}
console.log("ok");
