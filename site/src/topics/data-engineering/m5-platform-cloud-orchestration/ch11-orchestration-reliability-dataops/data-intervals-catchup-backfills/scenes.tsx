import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a five year backfill. the same source, five years over." h={200}>
      <Row y={70} label="backfill" value="five years" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="source" value="timing out" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLogicalDate({ t }: StepCtx) {
  return (
    <Svg label="logical date is the interval start, not the run time." h={200}>
      <Row y={70} label="logical date" value="jan first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="actually runs" value="jan second" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatchup({ t }: StepCtx) {
  return (
    <Svg label="catchup on: first missed day. catchup off: latest day." h={200}>
      <Row y={70} label="catchup on" value="first missed day" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="catchup off" value="latest day only" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictBudget({ t }: StepCtx) {
  return (
    <Svg label="same requests, five years of them. whose budget?" h={200}>
      <Row y={70} label="requests" value="same as today" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="budget" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBoundedConcurrency({ t }: StepCtx) {
  return (
    <Svg label="ten days backfilled. never more than two running." h={200}>
      <Row y={70} label="max active" value="two runs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="observed" value="never exceeded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealKillAndResume({ t }: StepCtx) {
  return (
    <Svg label="six done, killed, restarted. the six stay done." h={200}>
      <Row y={70} label="before kill" value="six done" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="after restart" value="four more run" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealDagsterShape({ t }: StepCtx) {
  return (
    <Svg label="one run per partition, or one run for the range." h={200}>
      <Row y={70} label="default" value="one run each" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="single run" value="whole range" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="interval start. bounded. resumable. same budget." h={260}>
      <Row y={40} label="logical date" value="interval start" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="catchup" value="scheduling choice" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="backfill" value="bounded, resumable" o={easeOut(seg(t, 0.3, 0.55))} />
      <Row y={175} label="source budget" value="still the same" valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="already succeeded. backfilled again. redone?" h={200}>
      <Row y={70} label="that day" value="already succeeded" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="re-backfilled" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
