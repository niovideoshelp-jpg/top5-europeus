import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const bodoni = loadBodoni("italic", {
  weights: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
});
const inter = loadInter("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Paleta medida na referência 21.mp4 (ver estilo-ref-21.md).
export const C = {
  paper: "#c3c2c1",
  paperBeige: "#bdb4a2",
  black: "#070707",
  tealBlack: "#081213",
  ink: "#141414",
  sky: "#498cbe",
  red: "#b3201c",
  green: "#1f9e3a",
  uiBlue: "#3a8fd6",
};

export const serif = bodoni.fontFamily;
export const sans = inter.fontFamily;

// Franja vermelho/ciano do RGB split, aplicada ao texto.
export const rgbSplit = (px = 1.6) =>
  `${px}px 0 rgba(255,40,40,0.55), ${-px}px 0 rgba(0,220,255,0.5)`;

export const rgbSplitFilter = (px = 2) =>
  `drop-shadow(${px}px 0 0 rgba(255,40,40,0.45)) drop-shadow(${-px}px 0 0 rgba(0,220,255,0.4))`;

export const sec = (s: number) => Math.round(s * FPS);
