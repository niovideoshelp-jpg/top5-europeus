import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import world from "../data/world.json";
import { useGsap } from "../lib/gsap";
import { C, rgbSplit, rgbSplitFilter, sans, serif } from "../lib/theme";
import { Halftone } from "./Texture";

const project = (lon: number, lat: number) => [
  (lon + 180) * world.sx,
  (world.LAT_TOP - lat) * world.sy + world.oy,
];

export type Site = { lon: number; lat: number; at: number };

// Mapa-múndi em papel: pulsos vermelhos nos locais e arcos opcionais saindo da Europa.
export const WorldMap: React.FC<{
  sites: Site[];
  arcs?: boolean;
  zoomFrom?: number;
  zoomTo?: number;
  duration?: number;
  origin?: [number, number];
}> = ({ sites, arcs, zoomFrom = 1.05, zoomTo = 1.25, duration = 2, origin = [5, 50] }) => {
  const [ox, oy] = project(...origin);
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".map"),
      { scale: zoomFrom },
      { scale: zoomTo, duration, ease: "sine.inOut", transformOrigin: `${(ox / 1920) * 100}% ${(oy / 1080) * 100}%` },
      0,
    );
    sites.forEach((s, i) => {
      tl.fromTo(q(`.dot-${i}`), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.18, ease: "back.out(3)" }, s.at);
      tl.fromTo(
        q(`.pulse-${i}`),
        { scale: 0.2, opacity: 0.9, transformOrigin: "50% 50%" },
        { scale: 3.2, opacity: 0, duration: 0.9, ease: "power1.out", repeat: 3 },
        s.at,
      );
      if (arcs) {
        tl.fromTo(
          q(`.arc-${i}`),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" },
          s.at - 0.35,
        );
      }
    });
  });
  return (
    <AbsoluteFill ref={ref}>
      <svg className="map" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {world.countries.map((c) => (
          <path
            key={c.iso + c.d.length}
            d={c.d}
            fill={c.europe ? "#a9a69f" : "#b7b4ad"}
            stroke="#3a3936"
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
        ))}
        {arcs && <circle cx={ox} cy={oy} r={7} fill={C.ink} />}
        {sites.map((s, i) => {
          const [x, y] = project(s.lon, s.lat);
          const mx = (ox + x) / 2;
          const my = Math.min(oy, y) - Math.abs(x - ox) * 0.35 - 40;
          return (
            <g key={i}>
              {arcs && (
                <path
                  className={`arc-${i}`}
                  d={`M${ox},${oy} Q${mx},${my} ${x},${y}`}
                  fill="none"
                  stroke={C.red}
                  strokeWidth={3}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1}
                />
              )}
              <circle
                className={`pulse-${i}`}
                cx={x}
                cy={y}
                r={12}
                fill="none"
                stroke={C.red}
                strokeWidth={2.5}
                opacity={0}
              />
              <circle
                className={`dot-${i}`}
                cx={x}
                cy={y}
                r={11}
                fill={C.red}
                stroke="#2a0a08"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Traço desenhado à mão (risco, X, seta, círculo) que se desenha no tempo dado.
export const Scribble: React.FC<{
  paths: string[];
  at: number;
  duration?: number;
  color?: string;
  width?: number;
  viewBox?: string;
  style?: React.CSSProperties;
}> = ({ paths, at, duration = 0.3, color = C.red, width = 10, viewBox = "0 0 1920 1080", style }) => {
  const ref = useGsap((tl, q) => {
    q(".stroke").forEach((el, i) => {
      tl.fromTo(
        el,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration, ease: "power2.out" },
        at + i * duration * 0.8,
      );
    });
  });
  return (
    <AbsoluteFill ref={ref} style={style}>
      <svg viewBox={viewBox} width="100%" height="100%" style={{ filter: rgbSplitFilter(1.5) }}>
        {paths.map((d, i) => (
          <path
            key={i}
            className="stroke"
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Mão do cursor que desliza por pontos e clica.
export const Cursor: React.FC<{
  path: { x: number; y: number; at: number }[];
  clicks?: number[];
  size?: number;
}> = ({ path, clicks = [], size = 64 }) => {
  const ref = useGsap((tl, q) => {
    const el = q(".cur")[0];
    tl.set(el, { x: path[0].x, y: path[0].y, autoAlpha: 0 }, 0);
    tl.to(el, { autoAlpha: 1, duration: 0.1 }, path[0].at);
    path.slice(1).forEach((p, i) => {
      tl.to(el, { x: p.x, y: p.y, duration: p.at - path[i].at, ease: "power2.inOut" }, path[i].at);
    });
    clicks.forEach((c) => {
      tl.to(q(".hand"), { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1 }, c);
      tl.fromTo(q(".ripple"), { scale: 0.2, opacity: 0.8 }, { scale: 1.6, opacity: 0, duration: 0.4 }, c);
    });
  });
  return (
    <AbsoluteFill ref={ref}>
      <div className="cur" style={{ position: "absolute", left: 0, top: 0, width: size, height: size }}>
        <div
          className="ripple"
          style={{
            position: "absolute",
            left: -size * 0.3,
            top: -size * 0.3,
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.85)",
            opacity: 0,
          }}
        />
        <svg className="hand" viewBox="0 0 24 24" width={size} height={size} style={{ filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.5)) ${rgbSplitFilter(1)}` }}>
          <path
            d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10h.5V8.5a1.5 1.5 0 0 1 3 0V10h.5v-.5a1.5 1.5 0 0 1 3 0V15c0 3.3-2.7 6-6 6h-1.2c-1.7 0-3.3-.8-4.3-2.2L4 14.6a1.5 1.5 0 0 1 2.3-1.9L8 14.5V11z"
            fill="#fff"
            stroke="#111"
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// Card de vídeo estilo YouTube (thumb + título + barra de progresso).
export const VideoCard: React.FC<{
  src: string;
  title: string;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  progress?: number;
  look?: "bw" | "color";
}> = ({ src, title, width = 520, className, style, progress = 0.35, look = "bw" }) => (
  <div
    className={className}
    style={{
      position: "absolute",
      width,
      background: "#151515",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
      border: "1px solid rgba(255,255,255,0.08)",
      ...style,
    }}
  >
    <div style={{ position: "relative", width, height: width * 0.5625, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: look === "bw" ? "grayscale(1) contrast(1.05) blur(0.4px)" : "saturate(0.95) blur(0.3px)",
        }}
      />
      <Halftone opacity={0.22} />
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: "100%", background: "rgba(255,255,255,0.25)" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#e3261d" }} />
      </div>
    </div>
    <div style={{ display: "flex", gap: 14, padding: "16px 18px 20px" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#3a3a3a", flex: "none" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: width * 0.042, color: "#f1f1f1", lineHeight: 1.2, textShadow: rgbSplit(1) }}>
          {title}
        </div>
        <div style={{ marginTop: 10, height: 12, width: "55%", borderRadius: 6, background: "#3a3a3a" }} />
      </div>
    </div>
  </div>
);

// Balão de comentário com avatar.
export const Bubble: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, className, style }) => (
  <div
    className={className}
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 24px 16px 16px",
      background: "#f3f1ec",
      borderRadius: 18,
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      ...style,
    }}
  >
    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#7d7a74", flex: "none" }} />
    <div>
      <div style={{ height: 10, width: 110, borderRadius: 5, background: "#c9c6bf", marginBottom: 10 }} />
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, color: C.ink, whiteSpace: "nowrap", textShadow: rgbSplit(0.8) }}>
        {text}
      </div>
    </div>
  </div>
);

// Foto de arquivo como papel solto (borda branca, sombra, leve rotação).
export const PhotoCard: React.FC<{
  src: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  look?: "bw" | "faded";
  label?: string;
}> = ({ src, width, height, className, style, look = "bw", label }) => (
  <div
    className={className}
    style={{
      position: "absolute",
      width,
      padding: 14,
      paddingBottom: label ? 56 : 14,
      background: "#ece9e2",
      boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    <div style={{ position: "relative", width: width - 28, height, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: look === "bw" ? "grayscale(1) contrast(1.08) blur(0.5px)" : "saturate(0.55) sepia(0.15) blur(0.5px)",
        }}
      />
      <Halftone opacity={0.3} />
    </div>
    {label && (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 12,
          textAlign: "center",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 30,
          color: C.ink,
          textShadow: rgbSplit(0.8),
        }}
      >
        {label}
      </div>
    )}
  </div>
);

// Carimbo vermelho que bate no papel.
export const Stamp: React.FC<{ text: string; at: number; x?: number; y?: number; rotate?: number; size?: number }> = ({
  text,
  at,
  x = 50,
  y = 50,
  rotate = -12,
  size = 120,
}) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".stamp"),
      { scale: 2.4, opacity: 0, rotate: rotate - 8 },
      { scale: 1, opacity: 0.92, rotate, duration: 0.14, ease: "power4.in" },
      at,
    );
  });
  return (
    <AbsoluteFill ref={ref}>
      <div
        className="stamp"
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          translate: "-50% -50%",
          padding: `${size * 0.12}px ${size * 0.35}px`,
          border: `${size * 0.07}px solid ${C.red}`,
          borderRadius: 10,
          color: C.red,
          fontFamily: sans,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          mixBlendMode: "multiply",
          opacity: 0,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
