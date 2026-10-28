import { Composition } from "remotion";
import { Intro, INTRO_FRAMES } from "./intro/Intro";
import { FPS, H, W } from "./lib/theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Intro"
    component={Intro}
    durationInFrames={INTRO_FRAMES}
    fps={FPS}
    width={W}
    height={H}
  />
);
