import { Composition } from "remotion";
import { Intro, INTRO_FRAMES } from "./intro/Intro";
import { FPS, H, W } from "./lib/theme";
import { parts } from "./parts";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={INTRO_FRAMES} fps={FPS} width={W} height={H} />
    {parts.map((p) => (
      <Composition key={p.id} id={p.id} component={p.Part} durationInFrames={p.frames} fps={FPS} width={W} height={H} />
    ))}
  </>
);
