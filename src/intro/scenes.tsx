import React from "react";
import { AbsoluteFill, Img, random, Sequence, staticFile } from "remotion";
import { Bubble, Cursor, PhotoCard, Scribble, Stamp, VideoCard, WorldMap } from "../components/Extras";
import { RollingCounter, Rings, TornLabel, UiTags } from "../components/Graphics";
import { Black, Cutout, Footage, Paper, Photo } from "../components/Media";
import { LetterDrop, SpreadWords, Typewriter, WordDarken, WordFlash } from "../components/Text";
import { useGsap } from "../lib/gsap";
import { C, rgbSplitFilter, sans, sec, serif } from "../lib/theme";

const WHITE = "#efede8";

// Converte o tempo absoluto da narração (s) em tempo local da cena.
const at = (t0: number) => (abs: number) => +(abs - t0).toFixed(3);

// Degradê para dar leitura ao texto branco sobre vídeo.
const Shade: React.FC<{ from?: "bottom" | "top"; strength?: number }> = ({ from = "bottom", strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${from === "bottom" ? "0deg" : "180deg"}, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,0) 55%)`,
    }}
  />
);

// Elemento que entra com motion blur (de baixo, da direita…).
const Enter: React.FC<{
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
      tl.to(q(".float"), { y: -float, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 5 }, t + duration);
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
const Push: React.FC<{ children: React.ReactNode; to?: number; dur: number; origin?: string }> = ({
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

/* 1 ─ 0,00 "Over the years," */
export const S01 = () => (
  <Black>
    <LetterDrop text="Over the years," face="sans" size={66} color={WHITE} start={0.06} duration={0.8} />
  </Black>
);

/* 2 ─ 1,09 "European countries" */
const FLAGS = ["uk", "fr", "de", "pl", "it", "es", "nl", "no", "dk", "se", "fi", "gr", "pt", "be", "ro", "cz"];
export const S02 = () => {
  const l = at(1.09);
  const ref = useGsap((tl, q) => {
    tl.fromTo(
      q(".flag"),
      { scale: 0, rotate: (i: number) => (random(`fr${i}`) - 0.5) * 70, opacity: 0 },
      { scale: 1, rotate: (i: number) => (random(`fs${i}`) - 0.5) * 16, opacity: 1, duration: 0.22, ease: "back.out(2.2)", stagger: 0.055 },
      0.02,
    );
  });
  return (
    <Paper>
      <Push dur={1.31} to={1.07}>
        <AbsoluteFill ref={ref}>
          {FLAGS.map((f, i) => {
            const a = (i / FLAGS.length) * Math.PI * 2 - Math.PI / 2;
            const x = 960 + Math.cos(a) * 700 - 85;
            const y = 540 + Math.sin(a) * 360 - 57;
            return (
              <div
                key={f}
                className="flag"
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 170,
                  height: 114,
                  padding: 7,
                  background: "#ece9e2",
                  boxShadow: "0 8px 14px rgba(0,0,0,0.3)",
                  opacity: 0,
                }}
              >
                <Img
                  src={staticFile(`flags/${f}.png`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) contrast(0.95) blur(0.4px)" }}
                />
              </div>
            );
          })}
        </AbsoluteFill>
        <WordDarken
          lines={[[{ text: "European", start: l(1.09) }, { text: "countries", start: l(1.48) }]]}
          size={104}
        />
      </Push>
    </Paper>
  );
};

/* 3 ─ 2,40 "have gotten involved in conflicts" */
export const S03 = () => {
  const l = at(2.4);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-cqb.mp4" trimBefore={0.2} look="bw" punch />
      <Shade />
      <LetterDrop text="conflicts" color={WHITE} size={110} y={80} start={l(2.9)} duration={0.4} />
    </AbsoluteFill>
  );
};

/* 4 ─ 3,65 "all over the world." */
const OPS = [
  { lon: 66, lat: 34 },
  { lon: 44, lat: 33 },
  { lon: -2, lat: 17 },
  { lon: 17, lat: 27 },
  { lon: 21, lat: 42.6 },
  { lon: 46, lat: 5 },
  { lon: 38, lat: 35 },
  { lon: -12, lat: 8.5 },
];
export const S04 = () => {
  const l = at(3.65);
  return (
    <Paper>
      <WorldMap sites={OPS.map((s, i) => ({ ...s, at: 0.05 + i * 0.08 }))} zoomFrom={1.0} zoomTo={1.1} duration={1} />
      <WordDarken
        lines={[
          [
            { text: "all", start: l(3.65) },
            { text: "over", start: l(3.88) },
            { text: "the", start: l(4.08) },
            { text: "world.", start: l(4.2) },
          ],
        ]}
        size={76}
        y={89}
      />
    </Paper>
  );
};

/* 5 ─ 4,64 "But that hasn't always meant sending in an entire army." */
export const S05 = () => {
  const l = at(4.64);
  return (
    <AbsoluteFill>
      <Photo src="images/army-mass.jpg" look="faded" from={1.0} to={1.14} halftone={0.28} />
      <Shade strength={0.7} />
      <Shade from="top" strength={0.5} />
      <Typewriter text="But that hasn't always meant" start={0} duration={1.4} size={44} color={WHITE} y={13} />
      <WordDarken
        lines={[
          [
            { text: "sending", start: l(6.29) },
            { text: "in", start: l(6.77) },
            { text: "an", start: l(6.91) },
            { text: "entire", start: l(7.05) },
            { text: "army.", start: l(7.46) },
          ],
        ]}
        size={100}
        color={WHITE}
        y={82}
      />
      <Scribble
        at={l(7.55)}
        duration={0.16}
        width={26}
        paths={["M600,250 C800,420 1100,640 1330,820", "M1330,250 C1120,430 820,650 590,830"]}
      />
    </AbsoluteFill>
  );
};

/* 6 ─ 8,00 "A lot of the time," */
export const S06 = () => {
  const l = at(8.0);
  return (
    <Paper>
      <WordFlash
        words={[
          { text: "A lot", start: l(8.0) },
          { text: "of the time,", start: l(8.57) },
        ]}
        size={120}
      />
    </Paper>
  );
};

/* 7 ─ 9,63 "the ones who actually went into action" */
export const S07 = () => {
  const l = at(9.63);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-room-entry.mp4" trimBefore={1.5} look="bw" punch />
      <Shade />
      <LetterDrop text="into action" color={WHITE} size={110} y={80} start={l(10.56)} duration={0.4} />
    </AbsoluteFill>
  );
};

/* 8 ─ 11,38 "were small elite groups made up of" */
export const S08 = () => {
  const l = at(11.38);
  return (
    <Paper>
      <Push dur={1.66} to={1.05} origin="50% 70%">
        <Enter at={0} from={{ y: 420 }}>
          <Cutout src="cutouts/team-kneel.png" look="faded" style={{ left: 690, top: 250, width: 1270 }} />
        </Enter>
        <SpreadWords
          words={[
            { text: "small", start: l(11.44) },
            { text: "elite", start: l(11.98) },
            { text: "groups", start: l(12.38) },
          ]}
          y={15}
          size={70}
          gap={110}
        />
        <Scribble
          at={l(12.55)}
          duration={0.22}
          width={6}
          color={C.ink}
          paths={["M1290,205 C1390,240 1420,300 1360,372", "M1318,348 L1360,374 L1384,330"]}
        />
      </Push>
    </Paper>
  );
};

/* 9 ─ 13,04 "extremely well-trained," */
export const S09 = () => {
  const l = at(13.04);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-tires-fire.mp4" trimBefore={2.0} look="faded" punch />
      <TornLabel text="well-trained" start={l(13.67)} y={74} size={78} seed="trained" />
    </AbsoluteFill>
  );
};

/* 10 ─ 14,45 "well-equipped soldiers." */
export const S10 = () => (
  <Black teal>
    <Enter at={0} from={{ y: 520 }} duration={0.38}>
      <Cutout src="cutouts/op-forest.png" look="faded" style={{ left: 260, top: 140, height: 960 }} />
    </Enter>
    <LetterDrop text="well-equipped" face="sans" size={60} color={WHITE} y={12} start={0} duration={0.55} />
    <UiTags
      x={73}
      y={56}
      tags={[
        { text: "Night vision", at: 0.3 },
        { text: "Body armor", at: 0.55 },
        { text: "Comms", at: 0.8 },
        { text: "Rifle optics", at: 1.05 },
      ]}
    />
  </Black>
);

/* 11 ─ 15,92 "And today, I want to talk about" */
export const S11 = () => {
  const l = at(15.92);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-nvg-helmets.mp4" trimBefore={0.3} look="bw" from={1.04} to={1.16} />
      <Shade strength={0.45} />
      <LetterDrop text="today," color={WHITE} size={120} y={78} start={l(16.43)} duration={0.35} />
    </AbsoluteFill>
  );
};

/* 12 ─ 18,04 "five European military units" */
const SILHOUETTES: { src: string; pos?: string }[] = [
  { src: "cutouts/op-nvg.png" },
  { src: "cutouts/op-forest.png" },
  { src: "cutouts/op-portrait.png" },
  { src: "cutouts/op-range.png", pos: "35% 100%" },
  { src: "cutouts/team-snow.png", pos: "88% 100%" },
];
export const S12 = () => {
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".panel"), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power3.out", stagger: 0.1 }, 0);
    tl.fromTo(q(".qm"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(3)", stagger: 0.08 }, 0.9);
  });
  return (
    <Paper>
      <Push dur={1.72} to={1.04}>
        <AbsoluteFill ref={ref}>
          {SILHOUETTES.map((s, i) => (
            <div
              key={i}
              className="panel"
              style={{ position: "absolute", left: 62 + i * 364, top: 250, width: 340, height: 480, overflow: "hidden", opacity: 0 }}
            >
              <Img
                src={staticFile(s.src)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: s.pos ?? "50% 100%",
                  filter: `brightness(0) ${rgbSplitFilter(2)}`,
                }}
              />
              <div
                className="qm"
                style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontSize: 120, color: "#e9e6df", fontWeight: 700, fontFamily: serif, opacity: 0 }}
              >
                ?
              </div>
            </div>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 62 + 340 + 8 + i * 364, top: 220, width: 8, height: 530, background: C.red }} />
          ))}
        </AbsoluteFill>
        <LetterDrop text="5 European military units" face="sans" size={58} y={86} start={0} duration={1.2} />
      </Push>
    </Paper>
  );
};

/* 13 ─ 19,76 "that, in my opinion, are among the most feared on the planet." */
export const S13 = () => {
  const l = at(19.76);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".earth"), { scale: 0.86, rotate: -4 }, { scale: 1.04, rotate: 6, duration: 3.44, ease: "sine.inOut" }, 0);
  });
  return (
    <Black>
      <Rings start={0.2} color="rgba(200,40,30,0.45)" y={42} max={1400} period={2.6} />
      <AbsoluteFill ref={ref}>
        <div
          className="earth"
          style={{ position: "absolute", left: 960 - 290, top: 455 - 290, width: 580, height: 580, borderRadius: "50%", overflow: "hidden" }}
        >
          <Img
            src={staticFile("images/earth.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.12)", filter: "saturate(0.6) contrast(1.05) blur(0.5px)" }}
          />
        </div>
      </AbsoluteFill>
      <Typewriter text="in my opinion" start={l(20.14)} duration={0.6} size={34} color={WHITE} y={9} />
      <WordDarken
        lines={[
          [
            { text: "among", start: l(21.2) },
            { text: "the", start: l(21.4) },
            { text: "most", start: l(21.59) },
            { text: "feared", start: l(21.84) },
          ],
          [
            { text: "on", start: l(22.24) },
            { text: "the", start: l(22.37) },
            { text: "planet.", start: l(22.56) },
          ],
        ]}
        size={66}
        color={WHITE}
        y={86}
      />
    </Black>
  );
};

/* 14 ─ 23,20 "To put together this list of Europe's five deadliest special forces units," */
export const S14 = () => {
  const l = at(23.2);
  return (
    <Paper beige>
      <Img
        src={staticFile("images/declassified.jpg")}
        style={{ position: "absolute", left: 560, top: -200, width: 800, opacity: 0.1, transform: "rotate(-4deg)", mixBlendMode: "multiply", filter: "blur(1px)" }}
      />
      <Push dur={4.3} to={1.08} origin="50% 52%">
        <WordDarken
          lines={[
            [
              { text: "To", start: l(23.2) },
              { text: "put", start: l(23.53) },
              { text: "together", start: l(23.68) },
              { text: "this", start: l(24.06) },
              { text: "list", start: l(24.32) },
              { text: "of", start: l(24.58) },
            ],
          ]}
          size={58}
          y={34}
        />
        <Typewriter
          text="EUROPE'S 5 DEADLIEST SPECIAL FORCES UNITS"
          start={l(24.71)}
          duration={2.1}
          size={58}
          y={53}
          select={{ word: "DEADLIEST", at: l(26.0) }}
        />
      </Push>
    </Paper>
  );
};

/* 15 ─ 27,50 "I looked at each unit's track record," */
export const S15 = () => {
  const l = at(27.5);
  return (
    <AbsoluteFill>
      <Photo src="images/sas-1943.jpg" look="bw" from={1.0} to={1.12} origin="50% 40%" />
      <TornLabel text="track record" start={l(28.58)} y={78} size={72} seed="track" rotate={2} />
    </AbsoluteFill>
  );
};

/* 16 ─ 29,41 "its role in major operations around the world," */
export const S16 = () => {
  const l = at(29.41);
  return (
    <Paper>
      <WorldMap arcs sites={OPS.map((s, i) => ({ ...s, at: 0.45 + i * 0.16 }))} zoomFrom={1.0} zoomTo={1.12} duration={2.1} />
      <WordDarken
        lines={[
          [
            { text: "major", start: l(29.9) },
            { text: "operations", start: l(30.2) },
          ],
        ]}
        size={72}
        y={90}
      />
    </Paper>
  );
};

/* 17 ─ 31,52 "the money invested in it," */
export const S17 = () => {
  const l = at(31.52);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".redact"), { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: "power3.out" }, l(32.75));
  });
  return (
    <Paper>
      <WordDarken
        lines={[
          [
            { text: "the", start: l(31.52) },
            { text: "money", start: l(31.91) },
            { text: "invested", start: l(32.11) },
          ],
        ]}
        size={78}
        y={30}
      />
      <RollingCounter
        values={["€ 000 000 000", "€ 184 220 511", "€ 482 913 006", "€ 731 604 182", "€ 960 375 449"]}
        start={0.25}
        duration={1.0}
        size={120}
        y={58}
      />
      <AbsoluteFill ref={ref}>
        <div
          className="redact"
          style={{ position: "absolute", left: 960 - 470, top: 626 - 80, width: 940, height: 150, background: "#0c0c0c", transformOrigin: "0% 50%", transform: "scaleX(0)" }}
        />
      </AbsoluteFill>
    </Paper>
  );
};

/* 18 ─ 33,32 "and all the infrastructure that supports the operator's work." */
export const S18 = () => {
  const l = at(33.32);
  return (
    <Black teal>
      <Enter at={0} from={{ x: 900 }} duration={0.45} float={14}>
        <Cutout src="cutouts/ksk-h145m.png" look="faded" style={{ left: 90, top: 230, width: 1180 }} />
      </Enter>
      <LetterDrop text="infrastructure" face="sans" size={58} color={WHITE} y={12} start={l(33.66)} duration={0.6} />
      <UiTags
        x={79}
        y={54}
        tags={[
          { text: "Helicopters", at: l(33.66) },
          { text: "Aircraft", at: l(34.1) },
          { text: "Intelligence", at: l(34.66) },
          { text: "Logistics", at: l(35.18) },
        ]}
      />
    </Black>
  );
};

/* 19 ─ 36,08 "I wanted to understand how these units" */
export const S19 = () => <Footage src="video/tf-ruins-run.mp4" trimBefore={0.6} look="bw" from={1.02} to={1.12} />;

/* 20 ─ 37,82 "actually work in practice." */
export const S20 = () => {
  const l = at(37.82);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-boats.mp4" look="faded" from={1.04} to={1.14} />
      <Shade />
      <LetterDrop text="in practice." color={WHITE} size={110} y={80} start={l(38.92)} duration={0.45} />
    </AbsoluteFill>
  );
};

/* 21 ─ 39,80 "What kind of experience have they built up?" */
export const S21 = () => {
  const l = at(39.8);
  return (
    <Paper>
      <WordDarken lines={[[{ text: "experience", start: l(40.35) }]]} size={80} y={27} />
      <RollingCounter
        values={["1941", "1952", "1967", "1980", "1991", "2003", "2014", "2026"]}
        start={l(40.5)}
        duration={1.05}
        size={190}
        y={55}
      />
      <WordDarken
        lines={[
          [
            { text: "built", start: l(41.34) },
            { text: "up?", start: l(41.61) },
          ],
        ]}
        size={60}
        y={81}
      />
    </Paper>
  );
};

/* 22 ─ 41,92 "What gear do they have at their disposal?" */
export const S22 = () => {
  const l = at(41.92);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-scope.mp4" trimBefore={1.5} playbackRate={0.95} look="faded" punch />
      <TornLabel text="gear" start={l(42.33)} y={72} size={96} seed="gear" rotate={-3} />
    </AbsoluteFill>
  );
};

/* 23 ─ 43,96 "And what kind of backup can they count on" */
export const S23 = () => {
  const l = at(43.96);
  return (
    <AbsoluteFill>
      <Footage src="video/tf-helo-air.mp4" trimBefore={0.2} look="bw" from={1.02} to={1.14} />
      <Shade />
      <LetterDrop text="backup" color={WHITE} size={120} y={80} start={l(44.68)} duration={0.35} />
    </AbsoluteFill>
  );
};

/* 24 ─ 45,69 "when a mission starts to go sideways?" */
export const S24 = () => {
  const l = at(45.69);
  const ref = useGsap((tl, q) => {
    tl.to(q(".tilt"), { rotate: -10, scale: 1.18, duration: 0.22, ease: "back.out(3)" }, l(47.02));
    tl.fromTo(q(".tilt"), { x: -14 }, { x: 14, duration: 0.04, repeat: 7, yoyo: true, ease: "none" }, l(47.02));
    tl.fromTo(q(".tilt"), { filter: "blur(0px)" }, { filter: "blur(3px)", duration: 0.08, yoyo: true, repeat: 3 }, l(47.02));
  });
  return (
    <AbsoluteFill ref={ref} style={{ backgroundColor: C.black }}>
      <AbsoluteFill className="tilt">
        <Footage src="video/w-helo-exit.mp4" look="faded" from={1.04} to={1.1} />
      </AbsoluteFill>
      <Shade />
      <LetterDrop text="sideways?" color={WHITE} size={110} y={80} start={l(47.02)} duration={0.4} />
    </AbsoluteFill>
  );
};

/* 25 ─ 47,72 "Some of these picks were harder to make than I expected." */
const DOSSIER = [
  { src: "images/gign.jpg", x: 330, y: 120, r: -8 },
  { src: "images/ksk.jpg", x: 800, y: 90, r: 5 },
  { src: "images/comsubin.jpg", x: 1220, y: 150, r: -4 },
  { src: "images/fsk.jpg", x: 520, y: 330, r: 7 },
  { src: "images/sbs.jpg", x: 1000, y: 360, r: -6 },
  { src: "images/grom-b.jpg", x: 120, y: 380, r: 3 },
];
export const S25 = () => {
  const l = at(47.72);
  const ref = useGsap((tl, q) => {
    q(".card").forEach((el, i) => {
      tl.fromTo(
        el,
        { x: i % 2 ? 1400 : -1400, y: -200, rotate: DOSSIER[i].r * 4, filter: "blur(10px)" },
        { x: 0, y: 0, rotate: DOSSIER[i].r, filter: "blur(0px)", duration: 0.32, ease: "power3.out" },
        0.05 + i * 0.2,
      );
    });
    tl.to(q(".card")[3], { x: 420, y: -60, rotate: -10, duration: 0.3, ease: "power2.inOut" }, 1.6);
    tl.to(q(".card")[1], { x: -300, y: 120, rotate: 12, duration: 0.3, ease: "power2.inOut" }, 1.75);
  });
  return (
    <Paper>
      <AbsoluteFill ref={ref}>
        {DOSSIER.map((d, i) => (
          <PhotoCard key={i} className="card" src={d.src} width={460} height={300} style={{ left: d.x, top: d.y }} />
        ))}
      </AbsoluteFill>
      <WordDarken
        lines={[
          [
            { text: "harder", start: l(48.86) },
            { text: "to", start: l(49.22) },
            { text: "make", start: l(49.33) },
            { text: "than", start: l(49.56) },
            { text: "I", start: l(49.79) },
            { text: "expected.", start: l(49.84) },
          ],
        ]}
        size={66}
        y={89}
      />
    </Paper>
  );
};

/* 26 ─ 50,56 "A few units kept landing on the list and getting cut again while I was doing my research" */
export const S26 = () => {
  const l = at(50.56);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".sheet"), { y: 900, rotate: 6 }, { y: 0, rotate: -2, duration: 0.4, ease: "power3.out" }, 0);
    q(".row").forEach((el, i) => tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.3 + i * 0.12));
    tl.fromTo(q(".cardA"), { y: -900, rotate: -25, scale: 1.2 }, { y: 0, rotate: -6, scale: 1, duration: 0.3, ease: "power3.in" }, l(51.3));
    tl.to(q(".cardA"), { scale: 0.22, rotate: 160, borderRadius: "45%", filter: "blur(1.5px) contrast(1.4)", duration: 0.22, ease: "power2.in" }, l(53.33));
    tl.to(q(".cardA"), { y: 1100, x: 140, rotate: 320, duration: 0.45, ease: "power2.in" }, l(53.6));
    tl.fromTo(q(".strike"), { scaleX: 0 }, { scaleX: 1, duration: 0.15 }, l(53.4));
    tl.fromTo(q(".cardB"), { y: -900, rotate: 20 }, { y: 0, rotate: 4, duration: 0.3, ease: "power3.in" }, l(54.05));
  });
  return (
    <Paper>
      <AbsoluteFill ref={ref}>
        <div
          className="sheet"
          style={{ position: "absolute", left: 150, top: 90, width: 760, height: 900, background: "#efece5", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", padding: "60px 64px" }}
        >
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, letterSpacing: "0.12em", color: C.ink, marginBottom: 36 }}>
            SHORTLIST
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="row" style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, height: 96, borderBottom: "2px solid rgba(0,0,0,0.15)", opacity: 0 }}>
              <div style={{ width: 34, height: 34, border: `3px solid ${C.ink}` }} />
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 34, color: C.ink }}>UNIT</div>
              <div style={{ height: 34, width: 200 + random(`row${i}`) * 220, background: "#121212" }} />
              {i === 2 && (
                <div className="strike" style={{ position: "absolute", left: -10, right: -10, top: 44, height: 8, background: C.red, transformOrigin: "0% 50%", transform: "scaleX(0)" }} />
              )}
            </div>
          ))}
        </div>
        <PhotoCard className="cardA" src="images/comsubin.jpg" width={380} height={250} style={{ left: 640, top: 330 }} />
        <PhotoCard className="cardB" src="images/fsk.jpg" width={380} height={250} style={{ left: 600, top: 560 }} />
      </AbsoluteFill>
      <WordDarken
        x={75}
        y={45}
        size={70}
        lines={[
          [
            { text: "kept", start: l(51.24) },
            { text: "landing", start: l(51.55) },
          ],
          [
            { text: "on", start: l(52.07) },
            { text: "the", start: l(52.22) },
            { text: "list", start: l(52.45) },
          ],
          [
            { text: "and", start: l(52.82) },
            { text: "getting", start: l(52.95) },
            { text: "cut", start: l(53.33) },
          ],
          [{ text: "again.", start: l(53.48) }],
        ]}
      />
    </Paper>
  );
};

/* 27 ─ 55,25 "because every one of them has capabilities and experience that deserve attention." */
const MONTAGE = [
  { src: "images/gign.jpg", start: 55.25, origin: "50% 35%" },
  { src: "images/ksk.jpg", start: 55.87, origin: "40% 60%" },
  { src: "images/comsubin.jpg", start: 56.52, origin: "50% 40%" },
  { src: "images/fsk.jpg", start: 57.35, origin: "50% 50%" },
  { src: "images/grom-b.jpg", start: 58.13, origin: "35% 50%" },
  { src: "images/sbs.jpg", start: 58.52, origin: "50% 45%" },
];
export const S27 = () => {
  const l = at(55.25);
  return (
    <AbsoluteFill>
      {MONTAGE.map((m, i) => {
        const end = MONTAGE[i + 1]?.start ?? 59.24;
        return (
          <Sequence key={m.src} from={sec(l(m.start))} durationInFrames={sec(end - m.start)} layout="none">
            <Photo src={m.src} look="faded" from={1.06} to={1.16} origin={m.origin} punch />
          </Sequence>
        );
      })}
      <Shade />
      <WordFlash
        color={WHITE}
        y={80}
        size={104}
        words={[
          { text: "capabilities", start: l(56.52) },
          { text: "experience", start: l(57.35) },
          { text: "deserve attention.", start: l(58.13), end: l(59.24) },
        ]}
      />
    </AbsoluteFill>
  );
};

/* 28 ─ 59,24 "Some of the ones that didn't make it are going to get their own videos here on the channel…" */
export const S28 = () => {
  const l = at(59.24);
  const ref = useGsap((tl, q) => {
    q(".vc").forEach((el, i) => {
      tl.fromTo(el, { x: 1400, filter: "blur(12px)" }, { x: 0, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, l(59.8) + i * 0.3);
    });
    tl.to(q(".vc")[1], { scale: 1.42, duration: 0.5, ease: "power3.inOut" }, l(63.68));
    tl.to([q(".vc")[0], q(".vc")[2]], { opacity: 0.25, filter: "blur(6px)", duration: 0.5 }, l(63.68));
  });
  return (
    <Black>
      <AbsoluteFill ref={ref}>
        {[
          { src: "images/gign.jpg", x: 150 },
          { src: "images/comsubin.jpg", x: 710 },
          { src: "images/fsk.jpg", x: 1270 },
        ].map((c, i) => (
          <VideoCard key={i} className="vc" src={c.src} title="UNIT FILE: ████████" width={500} progress={0} style={{ left: c.x, top: 330 }} />
        ))}
      </AbsoluteFill>
      <LetterDrop text="their own videos" face="sans" size={58} color={WHITE} y={14} start={l(61.64)} duration={0.6} />
      <Cursor
        path={[
          { x: 1720, y: 1000, at: l(62.36) },
          { x: 990, y: 520, at: l(62.95) },
        ]}
        clicks={[l(63.1)]}
      />
    </Black>
  );
};

/* 29 ─ 65,00 "Now, obviously, and I can't stress this enough," */
export const S29 = () => {
  const l = at(65.0);
  return (
    <Black>
      <LetterDrop text="obviously," color={WHITE} size={120} y={45} start={l(65.53)} duration={0.5} />
      <Typewriter text="and I can't stress this enough" start={l(66.89)} duration={0.95} size={38} color={WHITE} y={62} />
    </Black>
  );
};

/* 30 ─ 68,76 "this video is in no way the absolute truth." */
export const S30 = () => {
  const l = at(68.76);
  return (
    <Paper>
      <Push dur={2.72} to={1.06}>
        <Typewriter text="THIS VIDEO IS IN NO WAY" start={0} duration={1.1} size={54} y={35} />
        <WordDarken
          lines={[
            [
              { text: "the", start: l(70.24) },
              { text: "absolute", start: l(70.52) },
              { text: "truth.", start: l(70.95) },
            ],
          ]}
          size={130}
          y={55}
        />
        <Scribble at={l(71.1)} duration={0.2} width={14} paths={["M500,610 C760,585 1120,620 1430,588"]} />
      </Push>
    </Paper>
  );
};

/* 31 ─ 71,48 "Everyone's going to have their own take on it." */
const TAKES = [
  { text: "SAS should be #1", x: 140, y: 150 },
  { text: "No GROM??", x: 1300, y: 120 },
  { text: "GIGN all day", x: 220, y: 720 },
  { text: "KSK > everyone", x: 1240, y: 760 },
  { text: "Where is FSK?", x: 760, y: 870 },
  { text: "Respectful list", x: 780, y: 90 },
];
export const S31 = () => {
  const l = at(71.48);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".bub"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2.5)", stagger: 0.24 }, 0.08);
  });
  return (
    <Paper>
      <AbsoluteFill ref={ref}>
        {TAKES.map((t, i) => (
          <Bubble key={i} className="bub" text={t.text} style={{ left: t.x, top: t.y, transform: `rotate(${(random(`b${i}`) - 0.5) * 8}deg)`, opacity: 0 }} />
        ))}
      </AbsoluteFill>
      <WordDarken
        lines={[
          [
            { text: "their", start: l(72.57) },
            { text: "own", start: l(72.83) },
            { text: "take", start: l(72.98) },
          ],
        ]}
        size={110}
      />
    </Paper>
  );
};

/* 32 ─ 73,60 "And on top of that, a lot of the files on these units are still top secret." */
export const S32 = () => {
  const l = at(73.6);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".doc"), { y: 700, rotate: 8 }, { y: 0, rotate: -3, duration: 0.45, ease: "power3.out" }, 0);
    tl.fromTo(q(".doc"), { scale: 1 }, { scale: 1.12, duration: 3.8, ease: "sine.inOut" }, 0.45);
    q(".bar").forEach((el, i) => tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: "power2.out" }, l(74.84) + i * 0.16));
    tl.fromTo(q(".shake"), { x: -12, y: 8 }, { x: 12, y: -8, duration: 0.03, repeat: 7, yoyo: true, ease: "none" }, l(76.64) + 0.12);
  });
  const bars = [
    { t: 150, l: 60, w: 330 },
    { t: 260, l: 90, w: 400 },
    { t: 380, l: 40, w: 300 },
    { t: 500, l: 120, w: 360 },
    { t: 610, l: 60, w: 280 },
  ];
  return (
    <Paper>
      <AbsoluteFill ref={ref}>
        <AbsoluteFill className="shake">
          <div className="doc" style={{ position: "absolute", left: 960 - 290, top: 540 - 372, width: 580, height: 744, boxShadow: "0 24px 50px rgba(0,0,0,0.35)" }}>
            <Img src={staticFile("images/declassified.jpg")} style={{ width: "100%", height: "100%", filter: "grayscale(1) contrast(1.1) blur(0.4px)" }} />
            {bars.map((b, i) => (
              <div key={i} className="bar" style={{ position: "absolute", top: b.t, left: b.l, width: b.w, height: 34, background: "#0b0b0b", transformOrigin: "0% 50%", transform: "scaleX(0)" }} />
            ))}
          </div>
          <Stamp text="TOP SECRET" at={l(76.64)} x={51} y={47} size={118} />
        </AbsoluteFill>
      </AbsoluteFill>
    </Paper>
  );
};

/* 33 ─ 77,44 "Oh, and I also made a video" */
export const S33 = () => {
  const l = at(77.44);
  return (
    <Black>
      <LetterDrop text="Oh," color={WHITE} size={130} y={42} start={0} duration={0.2} />
      <Typewriter text="I also made a video" start={l(77.96)} duration={0.9} size={44} color={WHITE} y={62} />
    </Black>
  );
};

/* 34 ─ 79,22 "on the five deadliest Nordic elite forces using the same criteria as this one." */
const NORDIC = ["no", "se", "dk", "fi", "is"];
export const S34 = () => {
  const l = at(79.22);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".nf"), { y: -60, opacity: 0, scale: 0.6 }, { y: 0, opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", stagger: 0.1 }, l(80.41));
  });
  return (
    <Black>
      <Enter at={0.05} from={{ y: 500 }} duration={0.42}>
        <VideoCard src="images/nordic-thumb.jpg" title="The 5 Deadliest Nordic Elite Forces" width={880} progress={0.62} look="color" style={{ left: 140, top: 150 }} />
      </Enter>
      <AbsoluteFill ref={ref}>
        {NORDIC.map((f, i) => (
          <div key={f} className="nf" style={{ position: "absolute", left: 1150 + i * 140, top: 150, width: 118, height: 80, padding: 5, background: "#ece9e2", opacity: 0 }}>
            <Img src={staticFile(`flags/${f}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8)" }} />
          </div>
        ))}
      </AbsoluteFill>
      <LetterDrop text="same criteria" face="sans" size={46} color={WHITE} x={75} y={36} start={l(82.21)} duration={0.5} />
      <UiTags
        x={78}
        y={64}
        size={36}
        tags={[
          { text: "Track record", at: l(81.85) },
          { text: "Operations", at: l(82.1) },
          { text: "Investment", at: l(82.35) },
          { text: "Infrastructure", at: l(82.6) },
        ]}
      />
    </Black>
  );
};

/* 35 ─ 83,84 "If you wanna check it out, it's linked in the description." */
export const S35 = () => {
  const l = at(83.84);
  const ref = useGsap((tl, q) => {
    tl.fromTo(q(".panel"), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, 0);
    tl.fromTo(q(".hl"), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, l(85.3));
  });
  return (
    <Black>
      <AbsoluteFill ref={ref}>
        <div className="panel" style={{ position: "absolute", left: 360, top: 290, width: 1200, padding: "44px 56px", background: "#1a1a1a", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", opacity: 0 }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 34, color: "#f1f1f1", marginBottom: 26 }}>Description</div>
          {[640, 520].map((w, i) => (
            <div key={i} style={{ height: 18, width: w, borderRadius: 9, background: "#383838", marginBottom: 20 }} />
          ))}
          <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
            <div className="hl" style={{ position: "absolute", inset: "-8px -12px", background: "rgba(62,166,255,0.22)", borderRadius: 8, transformOrigin: "0% 50%", transform: "scaleX(0)" }} />
            <div style={{ position: "relative", fontFamily: sans, fontWeight: 600, fontSize: 40, color: "#3ea6ff", textDecoration: "underline" }}>
              ▶ The 5 Deadliest Nordic Elite Forces
            </div>
          </div>
          <div style={{ height: 18, width: 420, borderRadius: 9, background: "#383838", marginTop: 34 }} />
        </div>
      </AbsoluteFill>
      <LetterDrop text="link in the description" face="sans" size={54} color={WHITE} y={14} start={l(84.96)} duration={0.6} />
      <Cursor
        path={[
          { x: 1560, y: 980, at: 0.3 },
          { x: 900, y: 590, at: l(85.1) },
        ]}
        clicks={[l(85.27)]}
      />
    </Black>
  );
};

/* 36 ─ 86,26 "All right, let's get into it." */
export const S36 = () => {
  const l = at(86.26);
  return (
    <Black>
      <LetterDrop text="let's get into it." color={WHITE} size={130} start={l(86.96)} duration={0.6} />
    </Black>
  );
};

export const SCENES: { start: number; C: React.FC }[] = [
  { start: 0, C: S01 },
  { start: 1.09, C: S02 },
  { start: 2.4, C: S03 },
  { start: 3.65, C: S04 },
  { start: 4.64, C: S05 },
  { start: 8.0, C: S06 },
  { start: 9.63, C: S07 },
  { start: 11.38, C: S08 },
  { start: 13.04, C: S09 },
  { start: 14.45, C: S10 },
  { start: 15.92, C: S11 },
  { start: 18.04, C: S12 },
  { start: 19.76, C: S13 },
  { start: 23.2, C: S14 },
  { start: 27.5, C: S15 },
  { start: 29.41, C: S16 },
  { start: 31.52, C: S17 },
  { start: 33.32, C: S18 },
  { start: 36.08, C: S19 },
  { start: 37.82, C: S20 },
  { start: 39.8, C: S21 },
  { start: 41.92, C: S22 },
  { start: 43.96, C: S23 },
  { start: 45.69, C: S24 },
  { start: 47.72, C: S25 },
  { start: 50.56, C: S26 },
  { start: 55.25, C: S27 },
  { start: 59.24, C: S28 },
  { start: 65.0, C: S29 },
  { start: 68.76, C: S30 },
  { start: 71.48, C: S31 },
  { start: 73.6, C: S32 },
  { start: 77.44, C: S33 },
  { start: 79.22, C: S34 },
  { start: 83.84, C: S35 },
  { start: 86.26, C: S36 },
];
