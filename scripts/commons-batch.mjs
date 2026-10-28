// Várias buscas no Commons em sequência, com pausa (a API limita rajadas).
// Uso: node scripts/commons-batch.mjs <arquivo-de-buscas> <saida.txt>
// Cada linha: <chave> | <termo> [| video]
import fs from "fs";

const [, , listFile, outFile] = process.argv;
const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "top5-europeus-video/1.0 (niovideoshelp-jpg@github)" };
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const getJson = async (url) => {
  for (let i = 0; i < 6; i++) {
    const t = await (await fetch(url, { headers: UA })).text();
    try {
      return JSON.parse(t);
    } catch {
      await sleep(10000 * (i + 1));
    }
  }
  return {};
};

const out = fs.createWriteStream(outFile, { flags: "a" });
for (const line of fs.readFileSync(listFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean)) {
  const [key, q, kind] = line.split("|").map((s) => s.trim());
  const p = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "8",
    gsrsearch: kind === "video" ? `${q} filemime:video` : `${q} filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "size|extmetadata",
  });
  const j = await getJson(`${API}?${p}`);
  out.write(`### ${key} — ${q}\n`);
  for (const page of Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index)) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    out.write(
      `${page.title} | ${ii.width}x${ii.height} | ${m.LicenseShortName?.value ?? "?"} | ${strip(m.ImageDescription?.value).slice(0, 90)}\n`,
    );
  }
  await sleep(3500);
}
out.end();
console.log("ok");
