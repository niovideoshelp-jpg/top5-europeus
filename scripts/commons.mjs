// Busca e baixa mídia real do Wikimedia Commons, registrando autor e licença.
// Uso:
//   node scripts/commons.mjs search "<termo>" [max] [image|video]
//   node scripts/commons.mjs get "File:Nome.jpg" <destino-em-public> [largura]
import fs from "fs";
import path from "path";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = { "User-Agent": "top5-europeus-video/1.0 (niovideoshelp-jpg@github)" };
const [, , cmd, ...args] = process.argv;

const getJson = async (url) => {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: UA });
    const t = await r.text();
    try {
      return JSON.parse(t);
    } catch {
      await new Promise((ok) => setTimeout(ok, 8000 * (i + 1)));
    }
  }
  throw new Error('Commons API indisponível (limite de requisições)');
};

const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const info = async (titles, width) => {
  const p = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    titles,
  });
  if (width) p.set("iiurlwidth", String(width));
  const j = await getJson(`${API}?${p}`);
  return Object.values(j.query?.pages ?? {});
};

if (cmd === "search") {
  const [q, max = "10", kind = "image"] = args;
  const p = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: "6",
    srlimit: max,
    srsearch: kind === "video" ? `${q} filemime:video` : `${q} filetype:bitmap`,
  });
  const j = await getJson(`${API}?${p}`);
  const titles = (j.query?.search ?? []).map((s) => s.title);
  if (!titles.length) process.exit(0);
  for (const page of await info(titles.join("|"))) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    console.log(
      [
        page.title,
        `${ii.width}x${ii.height}`,
        m.LicenseShortName?.value,
        strip(m.DateTimeOriginal?.value).slice(0, 20),
        strip(m.ImageDescription?.value).slice(0, 110),
      ].join(" | "),
    );
  }
} else if (cmd === "get") {
  const [title, dest, width = "1920"] = args;
  let [page] = await info(title, Number(width));
  let ii = page?.imageinfo?.[0];
  // Original menor que a largura pedida: pede miniatura 1 px menor (servidor de miniaturas, menos limitado).
  if (ii && !ii.mime?.startsWith("video") && ii.width <= Number(width) && ii.width > 2) {
    [page] = await info(title, ii.width - 1);
    ii = page?.imageinfo?.[0];
  }
  if (!ii) throw new Error(`não encontrado: ${title}`);
  const isVideo = ii.mime?.startsWith("video");
  const url = isVideo ? ii.url : (ii.thumburl ?? ii.url);
  let res;
  for (let i = 0; i < 6; i++) {
    res = await fetch(url, { headers: UA });
    if (res.status !== 429) break;
    await new Promise((ok) => setTimeout(ok, 20000 * (i + 1)));
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const out = path.join("public", dest);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  const m = ii.extmetadata ?? {};
  fs.appendFileSync(
    path.join("production", "media-credits.tsv"),
    [
      dest,
      title,
      strip(m.Artist?.value),
      m.LicenseShortName?.value,
      ii.descriptionurl,
    ].join("\t") + "\n",
  );
  console.log(`ok ${out} (${m.LicenseShortName?.value}; ${strip(m.Artist?.value).slice(0, 60)})`);
} else {
  console.log("comandos: search | get");
}
