import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { FPS } from "../lib/theme";

export type SfxName =
  | "whoosh-whip"
  | "whoosh-little"
  | "whoosh-short"
  | "type-key"
  | "type-key-2"
  | "paper-crumple"
  | "shutter"
  | "impact"
  | "boom"
  | "pop"
  | "click"
  | "glitch"
  | "projector"
  | "static"
  | "riser"
  | "sub-kick"
  | "drone-bed"
  | "stamp"
  | "scribble";

export type SfxEvent = {
  at: number;
  name: SfxName;
  gain?: number;
  trim?: number;
  length?: number;
};

// Cada evento vira um <Audio> posicionado no tempo absoluto do vídeo (segundos).
export const SfxTrack: React.FC<{ events: SfxEvent[] }> = ({ events }) => (
  <>
    {events.map((e, i) => (
      <Sequence
        key={i}
        from={Math.round(e.at * FPS)}
        durationInFrames={e.length ? Math.round(e.length * FPS) : undefined}
        layout="none"
      >
        <Audio
          src={staticFile(`sfx/${e.name}.mp3`)}
          volume={e.gain ?? 0.5}
          trimBefore={e.trim ? Math.round(e.trim * FPS) : undefined}
        />
      </Sequence>
    ))}
  </>
);
