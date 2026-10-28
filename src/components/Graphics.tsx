import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { useGsap } from "../lib/gsap";
import { C, rgbSplit, sans, serif } from "../lib/theme";

// Contorno serrilhado determinístico para tiras de papel rasgado.
const tornPath = (w: number, h: number, seed: string) => {
  const pts: string[] = [];
  const step = 14;
  for (let x = 0; x <= w; x += step) pts.push(`${x},${4 + random(`${seed}t${x}`) * 9}`);
  for (let y = 0; y <= h; y += step) pts.push(`${w - random(`${seed}r${y}`) * 8},${y}`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x},${h - 4 - random(`${seed}b${x}`) * 9}`);
  for (let y = h; y >= 0; y -= step) pts.push(`${random(`${seed}l${y}`) * 8},${y}`);
  return pts.join(" ");
};

// Tira de papel rasgado com texto que se revela embaralhado.
export const TornLabel: React.FC<{
  text: string;
  start: number;
  x?: number;
  y?: number;
  size?: number;
  rotate?: number;
  seed?: string;
}> = ({ text, start, x = 50, y = 50, size = 60, rotate = -2, seed = "torn" }) => {
  const w = Math.round(text.length * size * 0.5 + size * 1.2);
  const h = Math.round(size * 1.55);
  const points = useMemo(() => tornPath(w, h, seed), [w, h, seed]);
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".strip"),
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.25, ease: "power3.out" },
      start,
    );
    tl.fromTo(
      q(".tl"),
      { opacity: 0, filter: "blur(8px)", y: (i: number) => (random(`${seed}y${i}`) - 0.5) * 10 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.18,
        stagger: { each: 0.025, from: "random" },
      },
      start + 0.08,
    );
  });
  return (
    <AbsoluteFill>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: w,
          height: h,
          transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        }}
      >
        <svg
          className="strip"
          width={w}
          height={h}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "0% 50%",
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.3))",
          }}
        >
          <polygon points={points} fill="#e9e6df" />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: size,
            color: C.ink,
            textShadow: rgbSplit(1.3),
            whiteSpace: "pre",
          }}
        >
          {[...text].map((c, i) => (
            <span key={i} className="tl" style={{ display: "inline-block" }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Contador rolante estilo caça-níquel (anos, números).
export const RollingCounter: React.FC<{
  values: string[];
  start: number;
  duration: number;
  size?: number;
  color?: string;
  y?: number;
}> = ({ values, start, duration, size = 110, color = C.ink, y = 50 }) => {
  const lineH = size * 1.15;
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".reel"),
      { y: 0 },
      { y: -(values.length - 1) * lineH, duration, ease: "power2.inOut" },
      start,
    );
    tl.fromTo(
      q(".reel"),
      { filter: "blur(0px)" },
      { filter: "blur(3px)", duration: duration * 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" },
      start,
    );
  });
  return (
    <AbsoluteFill>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: "50%",
          top: `${y}%`,
          height: lineH,
          transform: "translate(-50%, -50%)",
          overflow: "hidden",
          maskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)",
        }}
      >
        <div className="reel">
          {values.map((v) => (
            <div
              key={v}
              style={{
                height: lineH,
                lineHeight: `${lineH}px`,
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: size,
                color,
                textAlign: "center",
                textShadow: rgbSplit(1.4),
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Etiquetas azuis de interface que entram deslizando e empilham em escada.
export const UiTags: React.FC<{
  tags: { text: string; at: number }[];
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}> = ({ tags, x = 50, y = 50, size = 40, color = C.uiBlue }) => {
  const ref = useGsap((tl, q) => {
    q(".tag").forEach((el, i) => {
      tl.fromTo(
        el,
        { x: 260, opacity: 0, filter: "blur(10px)" },
        { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "power3.out" },
        tags[i].at,
      );
    });
  });
  return (
    <AbsoluteFill>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          gap: size * 0.35,
        }}
      >
        {tags.map((t, i) => (
          <div
            key={t.text}
            className="tag"
            style={{
              marginLeft: i * size * 0.9,
              padding: `${size * 0.18}px ${size * 0.6}px`,
              background: color,
              border: "2px solid rgba(255,255,255,0.75)",
              boxShadow: "inset 0 0 12px rgba(255,255,255,0.35), 0 6px 14px rgba(0,0,0,0.4)",
              fontFamily: sans,
              fontWeight: 600,
              fontSize: size,
              color: "#fff",
              textShadow: rgbSplit(1.2),
              whiteSpace: "nowrap",
              opacity: 0,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Anéis concêntricos (radar / sonar) que se expandem.
export const Rings: React.FC<{
  start: number;
  count?: number;
  color?: string;
  x?: number;
  y?: number;
  max?: number;
  period?: number;
  stroke?: number;
}> = ({ start, count = 6, color = "rgba(255,255,255,0.55)", x = 50, y = 50, max = 1500, period = 2.4, stroke = 2 }) => {
  const ref = useGsap((tl, q) => {
    q(".ring").forEach((el, i) => {
      tl.fromTo(
        el,
        { scale: 0.02, opacity: 0.9 },
        { scale: 1, opacity: 0, duration: period, ease: "none", repeat: 6 },
        start + (i * period) / count,
      );
    });
  });
  return (
    <AbsoluteFill ref={ref}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="ring"
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: max,
            height: max,
            marginLeft: -max / 2,
            marginTop: -max / 2,
            borderRadius: "50%",
            border: `${stroke}px solid ${color}`,
            opacity: 0,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
