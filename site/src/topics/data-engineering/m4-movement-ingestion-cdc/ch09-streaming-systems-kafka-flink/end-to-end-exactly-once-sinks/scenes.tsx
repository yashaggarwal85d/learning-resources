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
    <Svg label="a transaction timeout shorter than the checkpoint interval, staged writes expiring unseen" h={200}>
      <Row y={70} label="timeout" value="too short" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="staged write" value="expires first" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a Kafka transaction stops at Kafka's own edge; a non-Kafka sink needs its own mechanism" h={200}>
      <Row y={70} label="Kafka transaction" value="covers Kafka" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="external sink" value="needs its own" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCrash({}: StepCtx) {
  return (
    <Svg label="a crash lands right after pre-commit, before the checkpoint is confirmed complete" h={200}>
      <Row y={70} label="write" value="pre-committed" />
      <Row y={130} label="crash" value="right here" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCrash({ t }: StepCtx) {
  return (
    <Svg label="the staged write survives the crash and commits once recovery confirms the checkpoint" h={200}>
      <Row y={70} label="recovery" value="finds the stage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="write" value="commits, once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUpsert({ t }: StepCtx) {
  return (
    <Svg label="a retried write lands on the same row instead of a new one, keyed by a deterministic id" h={200}>
      <Row y={70} label="first write" value="row written" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="retried write" value="same row" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOffsetAtomicity({ t }: StepCtx) {
  return (
    <Svg label="an offset stored separately from the output reopens a crash window at the sink boundary" h={200}>
      <Row y={70} label="offset, separate" value="a gap opens" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="offset, same unit" value="no gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBreaks({}: StepCtx) {
  return (
    <Svg label="three real ways this guarantee quietly stops being true" h={200}>
      <Row y={70} label="guarantee" value="holds, usually" />
      <Row y={130} label="three cases" value="it does not" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBreaks({ t }: StepCtx) {
  return (
    <Svg label="non-determinism, a side effect, and a short transaction timeout each break it a different way" h={260}>
      <Row y={50} label="non-determinism" value="retry differs" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="side effect" value="can't roll back" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="short timeout" value="silent loss" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="2PC sink" value="clean, no dupes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="upsert retry" value="one row" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="mismatched timeout" value="every write lost" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two-phase commit, idempotent upsert, atomic offsets, and three ways the guarantee breaks" h={260}>
      <Row y={50} label="two-phase commit" value="pre-commit, commit" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="idempotent upsert" value="same row" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="where it breaks" value="three named cases" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
