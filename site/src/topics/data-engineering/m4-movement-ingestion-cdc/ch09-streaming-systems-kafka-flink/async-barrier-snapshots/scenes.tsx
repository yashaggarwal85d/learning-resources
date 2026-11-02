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
    <Svg label="same backlog, two checkpoint modes, two very different completion times" h={200}>
      <Row y={70} label="aligned, under load" value="takes forever" valueColor={C.bad} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="unaligned, same load" value="barely slower" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="the runtime keeps running, but a worker can still fail" h={200}>
      <Row y={70} label="a taskmanager" value="can still fail" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="recovery needs" value="a consistent snapshot" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBarrier({ t }: StepCtx) {
  return (
    <Svg label="a barrier rides the stream itself, the way Chandy and Lamport's snapshot does" h={200}>
      <Row y={70} label="the barrier" value="rides the stream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="seen everywhere" value="snapshot, now" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBackpressureStall({}: StepCtx) {
  return (
    <Svg label="one input channel is backed way up — what happens to the checkpoint?" h={200}>
      <Row y={70} label="one channel" value="badly backed up" />
      <Row y={130} label="the barrier" value="waits, or skips?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAligned({ t }: StepCtx) {
  return (
    <Svg label="aligned checkpoints wait for the barrier on every input before snapshotting" h={200}>
      <Row y={70} label="aligned mode" value="waits for all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one backed-up channel" value="stalls everything" valueColor={C.bad} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUnaligned({ t }: StepCtx) {
  return (
    <Svg label="unaligned checkpoints snapshot on first sight, absorbing the backlog instead" h={200}>
      <Row y={70} label="unaligned mode" value="snapshots immediately" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the backlog" value="folded in instead" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIncremental({ t }: StepCtx) {
  return (
    <Svg label="an incremental checkpoint only ever pays for what changed since last time" h={200}>
      <Row y={70} label="full checkpoint" value="keeps growing" valueColor={C.bad} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="incremental checkpoint" value="bounded by delta" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStricterDefault({}: StepCtx) {
  return (
    <Svg label="is the strictest checkpointing mode always the right default?" h={200}>
      <Row y={70} label="exactly-once" value="stricter, costs more" />
      <Row y={130} label="always the default?" value="or sometimes not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealModes({ t }: StepCtx) {
  return (
    <Svg label="exactly-once is the default; at-least-once trades a little risk for less overhead" h={200}>
      <Row y={70} label="exactly-once" value="the default choice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="at-least-once" value="rare, low-latency only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckpointVsSavepoint({ t }: StepCtx) {
  return (
    <Svg label="a checkpoint is Flink's own; a savepoint is deliberate, portable, yours" h={200}>
      <Row y={70} label="checkpoint" value="automatic, flink-owned" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="savepoint" value="deliberate, user-owned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="aligned, backlog" value="a real stall" valueColor={C.bad} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="unaligned, same backlog" value="barely moves" valueColor={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="incremental over time" value="flat, not growing" o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a barrier, a stall or none, a bounded delta, the right mode, the right snapshot" h={260}>
      <Row y={50} label="barrier" value="a traveling wave" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="aligned, unaligned" value="wait, or absorb" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="checkpoint, savepoint" value="automatic vs yours" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
