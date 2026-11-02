import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="'we want real-time dashboards for the plants' — two faithful readings, two pipelines" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the plant lead's own sentence
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        "real-time dashboards for the plants"
      </T>
      <Row y={150} label="engineer one" value="sub-second display" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="engineer two" value="minutes-refresh aggregate" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="both" value="read it faithfully" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which question, asked in the first meeting, would have picked one design?" h={210}>
      <Row y={75} label="define 'real-time'" value="not their language" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="what do you do then" value="the sharp question" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealListConsumers({ t }: StepCtx) {
  return (
    <Svg label="the lead's own box flips to reveal three more consumers of the same data" h={210}>
      <Row y={75} label="plant lead" value="asked first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="quality, upkeep, filing" value="also read this" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSeveralStores({ t }: StepCtx) {
  return (
    <Svg label="four consumers, four different freshness needs, four different serving stores" h={240}>
      <Row y={55} label="dashboard" value="warehouse aggregate" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="quality report" value="warehouse aggregate" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="upkeep model" value="point-in-time store" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={205} label="filing" value="immutable report" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealSharpQuestion({ t }: StepCtx) {
  return (
    <Svg label="'what do you do the moment you see it?' turns a vague demand into a concrete bound" h={210}>
      <Row y={75} label="real-time" value="not checkable" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="walks the floor" value="a concrete bound" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBetVsFact({ t }: StepCtx) {
  return (
    <Svg label="five answer cards, four stated directly, one a guess about next year" h={210}>
      <Row y={75} label="four cards" value="stated, green" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one card" value="a bet, amber" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGrainConcurrency({ t }: StepCtx) {
  return (
    <Svg label="grain asked before modeling; concurrency at the Monday run; retention for the filing" h={240}>
      <Row y={55} label="grain" value="asked up front" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="concurrency" value="the Monday spike" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="retention" value="how far back" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealExportPaths({ t }: StepCtx) {
  return (
    <Svg label="a csv download and a bi extract both flip red — each bypasses the engine's own policy" h={210}>
      <Row y={75} label="csv download" value="bypasses policy" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="bi extract" value="bypasses policy" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four consumers landing on four stores, the sharp question, the bet flagged, two export paths flagged" h={290}>
      <Row y={45} label="consumers" value="listed, not assumed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="freshness" value="tied to the moment" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="bets" value="marked, not hidden" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="exports" value="flagged as policy gaps" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="'a single view of the customer' — just as vague, needing the same five questions" h={250}>
      <Row y={65} label="the prompt" value="names a noun only" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the interview" value="runs before building" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="five answers" value="fork the design" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
