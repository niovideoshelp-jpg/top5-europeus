import React from "react";
import { AbsoluteFill } from "remotion";
import { useGsap } from "../lib/gsap";
import { C, rgbSplit, sans, serif } from "../lib/theme";

export type Word = { text: string; start: number; end?: number };

type Face = "serif" | "sans";

const faceStyle = (face: Face, size: number, color: string): React.CSSProperties =>
  face === "serif"
    ? {
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: size,
        color,
        letterSpacing: "-0.01em",
        textShadow: rgbSplit(1.4),
      }
    : {
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        color,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        textShadow: rgbSplit(1.6),
      };

const Center: React.FC<{
  children: React.ReactNode;
  x?: number;
  y?: number;
  style?: React.CSSProperties;
}> = ({ children, x = 50, y = 50, style }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// Assinatura da referência: a letra nova nasce menor, abaixo da linha, e assenta.
export const LetterDrop: React.FC<{
  text: string;
  start?: number;
  duration?: number;
  face?: Face;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}> = ({ text, start = 0, duration, face = "serif", size = 84, color = C.ink, x, y }) => {
  const chars = [...text];
  const total = duration ?? Math.min(0.9, chars.length * 0.055);
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".ch"),
      { opacity: 0, yPercent: 55, scale: 0.5 },
      {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        duration: 0.14,
        ease: "power3.out",
        stagger: total / chars.length,
      },
      start,
    );
  });
  return (
    <Center x={x} y={y}>
      <div ref={ref} style={faceStyle(face, size, color)}>
        {chars.map((c, i) => (
          <span
            key={i}
            className="ch"
            style={{ display: "inline-block", transformOrigin: "50% 100%", whiteSpace: "pre" }}
          >
            {c}
          </span>
        ))}
      </div>
    </Center>
  );
};

// Máquina de escrever com cursor e, opcionalmente, seleção azul estilo celular.
export const Typewriter: React.FC<{
  text: string;
  start?: number;
  duration: number;
  select?: { word: string; at: number };
  size?: number;
  color?: string;
  y?: number;
}> = ({ text, start = 0, duration, select, size = 54, color = C.ink, y = 50 }) => {
  const chars = [...text];
  const selFrom = select ? text.indexOf(select.word) : -1;
  const selTo = selFrom >= 0 && select ? selFrom + select.word.length : -1;

  const ref = useGsap((tl, q) => {
    const step = duration / chars.length;
    q(".tw").forEach((el, i) => tl.set(el, { display: "inline" }, start + i * step));
    tl.fromTo(
      q(".cursor"),
      { opacity: 1 },
      { opacity: 0, duration: 0.01, repeat: 40, yoyo: true, repeatDelay: 0.25 },
      start + duration,
    );
    if (select) {
      tl.fromTo(
        q(".sel"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.35, ease: "power2.out" },
        select.at,
      );
      tl.fromTo(q(".handle"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, select.at);
    }
  });

  const pieces = chars.map((c, i) => (
    <span key={i} className="tw" style={{ display: "none", whiteSpace: "pre" }}>
      {c}
    </span>
  ));

  const body =
    selFrom >= 0 ? (
      <>
        {pieces.slice(0, selFrom)}
        <span style={{ position: "relative", display: "inline-block" }}>
          <span
            className="sel"
            style={{
              position: "absolute",
              inset: "-0.08em -0.04em",
              background: "rgba(58,143,214,0.38)",
              transformOrigin: "0% 50%",
            }}
          />
          {(["left", "right"] as const).map((side) => (
            <span
              key={side}
              className="handle"
              style={{
                position: "absolute",
                [side]: "-0.06em",
                top: side === "left" ? "-0.35em" : "-0.08em",
                height: "1.4em",
                width: 3,
                background: C.uiBlue,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  [side === "left" ? "top" : "bottom"]: -6,
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background: C.uiBlue,
                }}
              />
            </span>
          ))}
          <span style={{ position: "relative" }}>{pieces.slice(selFrom, selTo)}</span>
        </span>
        {pieces.slice(selTo)}
      </>
    ) : (
      pieces
    );

  return (
    <Center y={y}>
      <div ref={ref} style={faceStyle("sans", size, color)}>
        {body}
        <span
          className="cursor"
          style={{
            display: "inline-block",
            width: 3,
            height: "1em",
            marginLeft: 4,
            background: color,
            verticalAlign: "-0.12em",
          }}
        />
      </div>
    </Center>
  );
};

// Uma palavra por vez no centro, trocando no tempo exato da narração.
export const WordFlash: React.FC<{
  words: Word[];
  face?: Face;
  size?: number;
  color?: string;
  y?: number;
}> = ({ words, face = "serif", size = 96, color = C.ink, y = 50 }) => {
  const ref = useGsap((tl, q) => {
    const els = q(".w");
    words.forEach((w, i) => {
      tl.set(els[i], { autoAlpha: 1 }, w.start);
      tl.fromTo(
        els[i],
        { scale: 0.86, filter: "blur(6px)" },
        { scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power3.out" },
        w.start,
      );
      const next = words[i + 1]?.start ?? w.end;
      if (next !== undefined) tl.set(els[i], { autoAlpha: 0 }, next);
    });
  });
  return (
    <AbsoluteFill ref={ref}>
      {words.map((w, i) => (
        <Center key={i} y={y}>
          <div className="w" style={{ ...faceStyle(face, size, color), visibility: "hidden" }}>
            {w.text}
          </div>
        </Center>
      ))}
    </AbsoluteFill>
  );
};

// Frase em que cada palavra entra clara e escurece quando é falada.
export const WordDarken: React.FC<{
  lines: Word[][];
  face?: Face;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  lineHeight?: number;
}> = ({ lines, face = "serif", size = 64, color = C.ink, x, y, lineHeight = 1.05 }) => {
  const ref = useGsap((tl, q) => {
    const els = q(".dw");
    lines.flat().forEach((w, i) => {
      tl.fromTo(
        els[i],
        { opacity: 0, filter: "blur(5px)", y: 8 },
        { opacity: 0.28, filter: "blur(0px)", y: 0, duration: 0.12 },
        Math.max(0, w.start - 0.18),
      );
      tl.to(els[i], { opacity: 1, duration: 0.14, ease: "power2.out" }, w.start);
    });
  });
  let k = 0;
  return (
    <Center x={x} y={y}>
      <div ref={ref} style={{ ...faceStyle(face, size, color), lineHeight }}>
        {lines.map((line, li) => (
          <div key={li}>
            {line.map((w, wi) => (
              <span key={k++} className="dw" style={{ display: "inline-block", opacity: 0 }}>
                {w.text}
                {wi < line.length - 1 ? " " : ""}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Center>
  );
};

// Palavras espaçadas na horizontal, acendendo uma a uma.
export const SpreadWords: React.FC<{
  words: Word[];
  y?: number;
  size?: number;
  color?: string;
  gap?: number;
}> = ({ words, y = 30, size = 46, color = C.ink, gap = 120 }) => {
  const ref = useGsap((tl, q) => {
    q(".sw").forEach((el, i) => {
      tl.fromTo(
        el,
        { opacity: 0, y: 14, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.2, ease: "power2.out" },
        words[i].start,
      );
    });
  });
  return (
    <Center y={y}>
      <div ref={ref} style={{ ...faceStyle("serif", size, color), display: "flex", gap }}>
        {words.map((w, i) => (
          <span key={i} className="sw" style={{ opacity: 0 }}>
            {w.text}
          </span>
        ))}
      </div>
    </Center>
  );
};
