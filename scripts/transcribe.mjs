// Transcreve a narração com timestamps por token (whisper.cpp local).
// Uso: node scripts/transcribe.mjs <wav 16kHz> <saida.json>
import path from "path";
import fs from "fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const [, , input, output] = process.argv;
const to = path.join(process.cwd(), ".whisper");
const version = "1.5.5";
const model = process.env.WHISPER_MODEL ?? "small";

await installWhisperCpp({ to, version });
await downloadWhisperModel({ model, folder: to });

const whisperCppOutput = await transcribe({
  model,
  whisperPath: to,
  whisperCppVersion: version,
  inputPath: path.resolve(input),
  tokenLevelTimestamps: true,
  language: process.env.WHISPER_LANG ?? "auto",
});

const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(output, JSON.stringify(captions, null, 2));
console.log(captions.map((c) => c.text).join(""));
