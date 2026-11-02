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
    <Svg label="a cost bar collapsing once the tiered region replaces most of the local-disk region" h={200}>
      <Row y={70} label="broker disk" value="absurd bill" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="object storage" value="a fraction" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="the partition strip with a boundary: older segments remote, newer segments local" h={200}>
      <Row y={70} label="older segments" value="object storage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="newer segments" value="local disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCopyTiming({}: StepCtx) {
  return (
    <Svg label="a segment just rolled — does the copy wait for local retention, or start now?" h={200}>
      <Row y={70} label="segment rolls" value="copy now?" />
      <Row y={130} label="local retention" value="still ticking" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCopyTiming({ t }: StepCtx) {
  return (
    <Svg label="the copy starts the moment the segment rolls, not when local retention expires" h={200}>
      <Row y={70} label="segment rolls" value="copy starts" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="local retention" value="deletes later" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictColdRead({}: StepCtx) {
  return (
    <Svg label="a consumer asks for an old offset — can it tell local from remote by the API alone?" h={200}>
      <Row y={70} label="fetch request" value="same call" />
      <Row y={130} label="data's actual home" value="local or remote" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealColdRead({ t }: StepCtx) {
  return (
    <Svg label="the same fetch call either way — only the measured latency gives away which tier answered" h={200}>
      <Row y={70} label="local read" value="fast" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="remote read" value="far slower" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTwoRetentions({ t }: StepCtx) {
  return (
    <Svg label="local retention and total retention, two independent knobs where there used to be one" h={200}>
      <Row y={70} label="local retention" value="local disk only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="total retention" value="everywhere" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNoCompaction({ t }: StepCtx) {
  return (
    <Svg label="a compacted topic can't be tiered — compaction rewrites segments the remote copy assumes are fixed" h={200}>
      <Row y={70} label="tiered segment" value="assumed fixed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="compaction" value="rewrites it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="remote-only segments" value="two of six" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="local read cost" value="small" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="remote read cost" value="far larger" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="compacted plus tiered" value="rejected" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="closed segments tier automatically, two independent retention knobs, reads stay transparent but not free" h={260}>
      <Row y={50} label="closed segments" value="move automatically" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="local vs total" value="independent knobs" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="cold reads" value="slower, transparent" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
