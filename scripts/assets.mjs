// Gera ASSETS.md a partir dos registros de crédito em production/*.tsv.
import fs from "fs";

const tsv = (f) =>
  fs.existsSync(f)
    ? fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split("\t"))
    : [];
const esc = (s) => (s || "—").replace(/\|/g, "/").replace(/&amp;/g, "&");

const used = (p) => fs.existsSync(`public/${p.replace(/ \(.*\)$/, "")}`);
const media = [...new Map(tsv("production/media-credits.tsv").filter((m) => used(m[0])).map((m) => [m[0], m])).values()].sort((a, b) => a[0].localeCompare(b[0]));
const sfx = [...new Map(tsv("production/sfx-credits.tsv").map((m) => [m[0], m])).values()];

const VIDEO = {
  "trojan1080.webm": ["Trojan Footprint 2024 – Promotion Video", "https://commons.wikimedia.org/wiki/File:Trojan_Footprint_2024_-_Promotion_Video.webm", "U.S. Special Operations Command Europe"],
  "wolves1080.webm": ["North Macedonia’s Wolves", "https://commons.wikimedia.org/wiki/File:North_Macedonia%E2%80%99s_Wolves.webm", "NATO"],
  "swift.webm": ["Green Berets Conduct Raid With Nato Allies for Swift Response 2025", "https://commons.wikimedia.org/wiki/File:Green_Berets_Conduct_Raid_With_Nato_Allies_for_Swift_Response_2025_(964496).webm", "U.S. Army"],
  "kabul-c17.webm": ["C-17 Evacuation at Hamid Karzai International Airport", "https://commons.wikimedia.org/wiki/File:C-17_Evacuation_at_Hamid_Karzai_International_Airport.webm", "U.S. Air Force"],
  "kabul-332.webm": ["332 AEW support evacuation operations", "https://commons.wikimedia.org/wiki/File:332_AEW_support_evacuation_operations.webm", "U.S. Air Force"],
};
const cuts = tsv("production/video-cuts.tsv");

let md = "# Créditos e licenças das mídias\n\n";
md += "Tudo que aparece nos vídeos é real e de uso livre. As licenças CC BY / CC BY-SA / OGL / Licence Ouverte exigem crédito ao autor: copie a seção **Para a descrição do YouTube** no fim deste arquivo.\n\n";
md += "## Narração e material do canal\n\n- `public/audio/*.mp3`: narração fornecida pelo dono do projeto. Não licenciada para reuso por terceiros.\n- `public/images/nordic-thumb.jpg`: thumbnail do próprio canal.\n\n";
md += "## Vídeo de arquivo (domínio público)\n\n| Trechos | Fonte | Autor |\n|---|---|---|\n";
for (const [src, [title, url, author]] of Object.entries(VIDEO)) {
  const files = cuts.filter((c) => c[1] === src).map((c) => "`" + c[0].replace("video/", "") + "`");
  if (files.length) md += `| ${[...new Set(files)].join(", ")} | [${title}](${url}) | ${author} |\n`;
}
md += "\nTrechos curtos recortados (`production/video-cuts.tsv`), sem áudio; letreiros e logos do original evitados. A aparência de material do Departamento de Defesa dos EUA ou da OTAN não implica endosso.\n\n";
md += "## Recortes (fundo removido no Canva)\n\n`public/cutouts/*.png`: recortes feitos com o Canva (prancheta \"Prancheta para recortes de vídeo\") a partir das fotos listadas abaixo e de quadros dos vídeos de domínio público.\n\n";
md += "## Fotos, bandeiras e ilustrações (Wikimedia Commons)\n\n| Arquivo | Original | Autor | Licença |\n|---|---|---|---|\n";
for (const [dest, title, artist, lic, url] of media) md += `| \`${dest}\` | [${esc(title.replace("File:", ""))}](${url}) | ${esc(artist)} | ${esc(lic)} |\n`;
md += "\nMapa: [Natural Earth](https://www.naturalearthdata.com/) 1:110m, domínio público (`src/data/world.json`).\n\n";
md += "## Efeitos sonoros e trilha (Freesound, CC0)\n\n| Arquivo | Som | Autor |\n|---|---|---|\n";
for (const [name, id, user, url] of sfx) md += `| \`public/sfx/${name}.mp3\` | [${id}](${url}) | ${user} |\n`;
md += "\nPrévias HQ do Freesound, normalizadas para -2 dBFS.\n\n## Fontes\n\nBodoni Moda e Inter (Google Fonts, SIL Open Font License), carregadas por `@remotion/google-fonts`.\n\n";
const attrib = [...new Map(media.filter((m) => /CC BY|OGL|Licence Ouverte/.test(m[3] || "")).map((m) => [esc(m[2]) + m[3], `${esc(m[2])} (${m[3]})`])).values()];
md += "## Para a descrição do YouTube\n\n```\nImagens: Wikimedia Commons — " + attrib.join("; ") + ".\nVídeo de arquivo: U.S. SOCEUR, U.S. Army, U.S. Air Force e NATO (domínio público). Mapas: Natural Earth. Efeitos sonoros: Freesound (CC0).\n```\n";
fs.writeFileSync("ASSETS.md", md);
console.log(`ASSETS.md: ${media.length} imagens, ${sfx.length} sons, ${attrib.length} autores para creditar`);
