import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

gsap.ticker.lagSmoothing(0);

export type Build = (
  tl: gsap.core.Timeline,
  q: (selector: string) => Element[],
) => void;

// Timeline GSAP pausada, avançada pelo frame do Remotion (seek determinístico).
export const useGsap = <T extends HTMLElement = HTMLDivElement>(build: Build) => {
  const ref = useRef<T>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      build(tl, gsap.utils.selector(ref.current));
      tlRef.current = tl;
    }, ref);
    return () => {
      ctx.revert();
      tlRef.current = null;
    };
    // A timeline é montada uma vez por cena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    tlRef.current?.seek(frame / fps, false);
  }, [frame, fps]);

  return ref;
};

export { gsap };
