// Converte o GeoJSON Natural Earth 1:110m (domínio público) em caminhos SVG
// equirretangulares para 1920×1080. Uso: node scripts/build-world.mjs
import fs from "fs";

const W = 1920;
const H = 1080;
const LAT_TOP = 84;
const LAT_BOTTOM = -58;
const sx = W / 360;
const sy = (H - 120) / (LAT_TOP - LAT_BOTTOM);
const oy = 60;

const project = ([lon, lat]) => [
  +((lon + 180) * sx).toFixed(1),
  +((LAT_TOP - lat) * sy + oy).toFixed(1),
];

const ring = (coords) =>
  "M" + coords.map((c) => project(c).join(",")).join("L") + "Z";

const geo = JSON.parse(fs.readFileSync("production/ne_110m_countries.geojson", "utf8"));
const countries = geo.features
  .filter((f) => f.properties.ADMIN !== "Antarctica")
  .map((f) => {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    return {
      iso: f.properties.ISO_A3 === "-99" ? f.properties.ADM0_A3 : f.properties.ISO_A3,
      europe: f.properties.CONTINENT === "Europe",
      d: polys.map((p) => p.map(ring).join("")).join(""),
    };
  });

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(
  "src/data/world.json",
  JSON.stringify({ W, H, LAT_TOP, sx, sy, oy, countries }),
);
console.log(countries.length, "países");
