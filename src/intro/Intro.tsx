import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SfxTrack } from "../components/Sfx";
import { Texture } from "../components/Texture";
import { sec } from "../lib/theme";
import { SCENES } from "./scenes";
import { SFX } from "./sfx";

export const INTRO_SECONDS = 87.9;
export const INTRO_FRAMES = sec(INTRO_SECONDS);

// Cortes secos entre as cenas, no início de cada frase/palavra da narração.
export const Intro: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#070707" }}>
    {SCENES.map(({ start, C: Scene }, i) => {
      const end = SCENES[i + 1]?.start ?? INTRO_SECONDS;
      const from = sec(start);
      return (
        <Sequence key={i} from={from} durationInFrames={sec(end) - from} premountFor={30} name={`S${String(i + 1).padStart(2, "0")}`}>
          <Scene />
        </Sequence>
      );
    })}
    <Texture />
    <Audio src={staticFile("audio/intro.mp3")} />
    <SfxTrack events={SFX} />
    <FadeToBlack frames={8} />
  </AbsoluteFill>
);

const FadeToBlack: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [INTRO_FRAMES - frames, INTRO_FRAMES - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity }} />;
};
