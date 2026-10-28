import { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  Img,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { H, W } from "../lib/theme";

const GRAIN_TILES = 8;

// Poeira e riscos desenhados num <canvas>, sorteados por frame (seed fixa).
const Dust: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const n = Math.round(14 * amount);
    for (let i = 0; i < n; i++) {
      const s = `dust-${frame}-${i}`;
      const x = random(s + "x") * W;
      const y = random(s + "y") * H;
      const r = 0.6 + random(s + "r") * 2.2;
      const light = random(s + "l") > 0.45;
      ctx.fillStyle = light
        ? `rgba(235,235,230,${0.25 + random(s + "a") * 0.45})`
        : `rgba(10,10,10,${0.2 + random(s + "a") * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.4 + random(s + "e")), random(s + "o") * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Fiapos curtos (fios de cabelo do filme).
    if (random(`hair-${frame}`) < 0.18 * amount) {
      const x = random(`hx-${frame}`) * W;
      const y = random(`hy-${frame}`) * H;
      ctx.strokeStyle = "rgba(230,230,225,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 20, y + 10, x + 6, y + 40, x + 30, y + 60);
      ctx.stroke();
    }
    // Risco vertical que atravessa o quadro por alguns frames.
    const scratchSeed = Math.floor(frame / 7);
    if (random(`scr-${scratchSeed}`) < 0.35 * amount) {
      const x = random(`scx-${scratchSeed}`) * W + Math.sin(frame) * 2;
      ctx.strokeStyle = `rgba(225,225,220,${0.12 + random(`sca-${frame}`) * 0.18})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 3, H);
      ctx.stroke();
    }
  }, [frame, amount]);

  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};

// Camada global da referência: grão, scanlines, poeira/riscos, vinheta e flicker.
export const Texture: React.FC<{ dust?: number; grain?: number }> = ({
  dust = 1,
  grain = 0.16,
}) => {
  const frame = useCurrentFrame();
  const tile = frame % GRAIN_TILES;
  const ox = Math.floor(random(`gx-${frame}`) * 1024);
  const oy = Math.floor(random(`gy-${frame}`) * 1024);
  const flicker = 0.03 * (random(`fl-${frame}`) - 0.5);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: grain, overflow: "hidden" }}>
        {[0, 1, 2].flatMap((cx) =>
          [0, 1].map((cy) => (
            <Img
              key={`${cx}-${cy}`}
              src={staticFile(`texture/grain_${tile}.png`)}
              style={{
                position: "absolute",
                left: cx * 1024 - ox,
                top: cy * 1024 - oy,
                width: 1024,
                height: 1024,
              }}
            />
          )),
        )}
      </AbsoluteFill>
      <Dust amount={dust} />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, rgba(255,255,255,0.03) 2px, transparent 3px, transparent 4px)",
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: flicker > 0 ? "#fff" : "#000",
          opacity: Math.abs(flicker),
        }}
      />
    </AbsoluteFill>
  );
};

// Retícula de meio-tom para fotos e vídeos de arquivo.
export const Halftone: React.FC<{ opacity?: number; size?: number }> = ({
  opacity = 0.32,
  size = 6,
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.9) ${size * 0.18}px, rgba(0,0,0,0) ${size * 0.34}px)`,
      backgroundSize: `${size}px ${size}px`,
      mixBlendMode: "multiply",
      opacity,
      transform: "rotate(45deg) scale(1.5)",
    }}
  />
);
