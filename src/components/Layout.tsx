import React from "react";
import { AbsoluteFill } from "remotion";
import { useGsap } from "../lib/gsap";

// Degradê para dar leitura ao texto branco sobre vídeo.
export const Shade: React.FC<{ from?: "bottom" | "top"; strength?: number }> = ({ from = "bottom", strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${from === "bottom" ? "0deg" : "180deg"}, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,0) 55%)`,
    }}
  />
);

// Elemento que entra com motion blur (de baixo, da direita…).
export const Enter: React.FC<{
  children: React.ReactNode;
  at?: number;
  from?: { x?: number; y?: number; scale?: number; rotate?: number };
  duration?: number;
  float?: number;
  style?: React.CSSProperties;
}> = ({ children, at: t = 0, from = { y: 300 }, duration = 0.4, float = 0, style }) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".enter"),
      { x: from.x ?? 0, y: from.y ?? 0, scale: from.scale ?? 1, rotate: from.rotate ?? 0, filter: "blur(14px)", opacity: 0 },
      { x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)", opacity: 1, duration, ease: "power3.out" },
      t,
    );
    if (float) {
      tl.to(q(".float"), { y: -float, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 9 }, t + duration);
    }
  });
  return (
    <AbsoluteFill ref={ref}>
      <div className="enter" style={{ position: "absolute", inset: 0, opacity: 0 }}>
        <div className="float" style={{ position: "absolute", inset: 0, ...style }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Push-in lento de uma cena inteira (papel, colagem).
export const Push: React.FC<{ children: React.ReactNode; to?: number; dur: number; origin?: string }> = ({
  children,
  to = 1.06,
  dur,
  origin = "50% 50%",
}) => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".push"), { scale: 1 }, { scale: to, duration: dur, ease: "sine.inOut" }, 0);
  });
  return (
    <AbsoluteFill ref={ref}>
      <AbsoluteFill className="push" style={{ transformOrigin: origin }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
