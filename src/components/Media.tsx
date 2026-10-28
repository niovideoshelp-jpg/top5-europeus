import { Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, rgbSplitFilter } from "../lib/theme";
import { Halftone } from "./Texture";

export const Paper: React.FC<{ beige?: boolean; children?: React.ReactNode }> = ({
  beige,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: beige ? C.paperBeige : C.paper }}>
    <Img
      src={staticFile(beige ? "texture/paper-beige.jpg" : "texture/paper.jpg")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    {children}
  </AbsoluteFill>
);

export const Black: React.FC<{ teal?: boolean; children?: React.ReactNode }> = ({
  teal,
  children,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: C.black,
      background: teal
        ? `radial-gradient(ellipse 70% 55% at 50% 78%, ${C.tealBlack} 0%, ${C.tealBlack} 55%, ${C.black} 100%)`
        : C.black,
    }}
  >
    {children}
  </AbsoluteFill>
);

type Look = "bw" | "faded" | "color";

const lookFilter = (look: Look) =>
  look === "bw"
    ? "grayscale(1) contrast(1.08) brightness(0.95) blur(0.6px)"
    : look === "faded"
      ? "saturate(0.55) sepia(0.12) contrast(0.95) brightness(0.96) blur(0.6px)"
      : "saturate(0.9) contrast(0.98) blur(0.5px)";

// Push-in constante (nada fica parado) + entrada opcional em zoom punch com blur.
const usePush = (from: number, to: number, punch: boolean) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [from, to], {
    easing: Easing.inOut(Easing.quad),
  });
  const punchScale = punch
    ? interpolate(frame, [0, 7], [1.22, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;
  const punchBlur = punch
    ? interpolate(frame, [0, 7], [10, 0], { extrapolateRight: "clamp" })
    : 0;
  return { scale: push * punchScale, blur: punchBlur };
};

export const Photo: React.FC<{
  src: string;
  look?: Look;
  from?: number;
  to?: number;
  punch?: boolean;
  origin?: string;
  halftone?: number;
  fit?: "cover" | "contain";
}> = ({ src, look = "faded", from = 1.02, to = 1.12, punch, origin = "50% 50%", halftone = 0.3, fit = "cover" }) => {
  const { scale, blur } = usePush(from, to, !!punch);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: origin,
          filter: `${lookFilter(look)}${blur ? ` blur(${blur}px)` : ""}`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: fit }}
        />
        {halftone > 0 && <Halftone opacity={halftone} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Footage: React.FC<{
  src: string;
  trimBefore?: number;
  look?: Look;
  from?: number;
  to?: number;
  punch?: boolean;
  origin?: string;
  halftone?: number;
  playbackRate?: number;
}> = ({
  src,
  trimBefore = 0,
  look = "faded",
  from = 1.02,
  to = 1.1,
  punch,
  origin = "50% 50%",
  halftone = 0.25,
  playbackRate = 1,
}) => {
  const { fps } = useVideoConfig();
  const { scale, blur } = usePush(from, to, !!punch);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: origin,
          filter: `${lookFilter(look)}${blur ? ` blur(${blur}px)` : ""}`,
        }}
      >
        <Video
          src={staticFile(src)}
          trimBefore={Math.round(trimBefore * fps)}
          playbackRate={playbackRate}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        {halftone > 0 && <Halftone opacity={halftone} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Recorte PNG (fundo removido no Canva) com sombra e franja RGB.
export const Cutout: React.FC<{
  src: string;
  className?: string;
  style?: React.CSSProperties;
  look?: Look;
  shadow?: boolean;
}> = ({ src, className, style, look = "bw", shadow = true }) => (
  <Img
    src={staticFile(src)}
    className={className}
    style={{
      position: "absolute",
      filter: `${lookFilter(look)} ${rgbSplitFilter(2)}${shadow ? " drop-shadow(0 18px 22px rgba(0,0,0,0.35))" : ""}`,
      ...style,
    }}
  />
);
