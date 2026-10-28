// Busca SFX CC0 no Freesound e baixa a prévia HQ.
// Uso:
//   node scripts/freesound.mjs search "<termo>" [max]
//   node scripts/freesound.mjs get <id> <usuario> <user-id> <nome-arquivo>
import fs from "fs";
import path from "path";

const [, , cmd, ...args] = process.argv;
const UA = { "User-Agent": "Mozilla/5.0" };

const attr = (block, name) => {
  const m = block.match(new RegExp(`data-${name}="([^"]*)"`));
  return m ? m[1] : null;
};

if (cmd === "search") {
  const [q, max = "12"] = args;
  const url = `https://freesound.org/search/?q=${encodeURIComponent(q)}&f=license%3A%22Creative+Commons+0%22&s=Downloads+desc`;
  const html = await (await fetch(url, { headers: UA })).text();
  const blocks = html.split('class="bw-player"').slice(1, Number(max) + 1);
  for (const b of blocks) {
    console.log(
      [
        attr(b, "sound-id"),
        attr(b, "username"),
        attr(b, "user-id"),
        `${Number(attr(b, "duration")).toFixed(2)}s`,
        `${attr(b, "num-downloads")}dl`,
        attr(b, "title"),
      ].join(" | "),
    );
  }
} else if (cmd === "get") {
  const [id, user, userId, name] = args;
  const folder = String(Math.floor(Number(id) / 1000));
  const url = `https://cdn.freesound.org/previews/${folder}/${id}_${userId}-hq.mp3`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const out = path.join("public", "sfx", `${name}.mp3`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  const credits = path.join("production", "sfx-credits.tsv");
  fs.appendFileSync(
    credits,
    `${name}\t${id}\t${user}\thttps://freesound.org/people/${user}/sounds/${id}/\tCC0\n`,
  );
  console.log(`ok ${out}`);
} else {
  console.log("comandos: search | get");
}
