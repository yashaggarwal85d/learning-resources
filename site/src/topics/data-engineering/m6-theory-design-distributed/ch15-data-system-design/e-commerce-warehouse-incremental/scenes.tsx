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
    <Svg label="a nine-hour nightly rebuild goes incremental; weeks later the order count is short" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        finance asked about the rebuild
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        the switch to incremental looked clean
      </T>
      <Row y={150} label="rebuild time" value="cut sharply" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="weeks later" value="order count short" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="cancelled orders" value="never reappeared" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which risk of incrementalism did the design not name?" h={210}>
      <Row y={75} label="slower loads" value="shows as lag" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="deleted rows" value="simply invisible" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGrainFirst({ t }: StepCtx) {
  return (
    <Svg label="an order-line fact, a snapshot fact, conformed dimensions; three model cards" h={240}>
      <Row y={55} label="wide table" value="one card" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="data vault" value="one card" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="dimensional model" value="chosen, lifts" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealDeletedRow({ t }: StepCtx) {
  return (
    <Svg label="a cancelled order vanishes at the source; the extract never asks what's missing" h={210}>
      <Row y={75} label="source row" value="cancelled, gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="warehouse row" value="stays forever" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLateDimension({ t }: StepCtx) {
  return (
    <Svg label="a fact lands before its dimension; an inferred placeholder key lands instead" h={210}>
      <Row y={75} label="the fact" value="lands now" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the dimension" value="inferred, backfilled later" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSCDMerge({ t }: StepCtx) {
  return (
    <Svg label="an address change kept as history; a phone fix overwritten, both merged by key" h={210}>
      <Row y={75} label="address change" value="kept as history" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="phone fix" value="overwritten in place" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMartsSemantic({ t }: StepCtx) {
  return (
    <Svg label="a few marts earn their keep; revenue is defined once, not recomputed per mart" h={210}>
      <Row y={75} label="marts" value="a few, chosen" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="revenue" value="defined once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCrossover({ t }: StepCtx) {
  return (
    <Svg label="a crossover chart: full refresh rising steeply, incremental rising shallowly, their lines crossing" h={240}>
      <Row y={55} label="full refresh" value="rises steeply" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="incremental" value="a flatter rise" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the crossover" value="a computed point" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="grain first, the deleted-row and late-dimension guards, scd and merge, marts, the crossover" h={290}>
      <Row y={45} label="model" value="grain, then chosen" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="hazards" value="named, guarded" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="scd, merge" value="kept or overwritten" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="crossover" value="computed, not felt" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second table, past its own crossover for a long time, costing more than full refresh" h={250}>
      <Row y={65} label="this table" value="past its crossover" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the fix" value="compute, don't guess" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the answer" value="today's numbers decide" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
