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
    <Svg label="sorted runs pile up forever unless something merges them back down. What does that cost?" h={200}>
      <Row y={70} label="sorted runs" value="pile up forever" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="compaction" value="merges them back down" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCompactionStyles({ t }: StepCtx) {
  return (
    <Svg label="the identical shuffled write pattern, measured against two real compaction styles." h={200}>
      <Row y={70} label="leveled compaction" value="settles to 3 files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="universal (tiered)" value="settles to 4 files" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFifoDrops({ t }: StepCtx) {
  return (
    <Svg label="a real FIFO-style store, written well past a 100-kilobyte cap." h={200}>
      <Row y={70} label="the oldest round's key" value="gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the newest round's key" value="still there" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRumTradeoff({ t }: StepCtx) {
  return (
    <Svg label="leveled costs more to write. Tiered costs more to read later. Is there a style with neither cost?" h={200}>
      <Row y={70} label="leveled" value="pays in writes" />
      <Row y={130} label="a style with no cost" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRumConjecture({ t }: StepCtx) {
  return (
    <Svg label="read overhead, update overhead, memory overhead: each a ratio, minimum 1.0." h={260}>
      <Row y={50} label="read overhead" value="read amplification" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="update overhead" value="write amplification" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="memory overhead" value="space amplification" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="optimize any two" value="the third gets worse" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function RevealWriteStall({ t }: StepCtx) {
  return (
    <Svg label="level0_slowdown_writes_trigger set to 2; the real L0 file count, measured." h={200}>
      <Row y={70} label="the configured trigger" value="2 L0 files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real count" value="6 — past the trigger" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCompactionDebt({ t }: StepCtx) {
  return (
    <Svg label="a tombstone and a write stall are the same debt, at two different scales." h={200}>
      <Row y={70} label="a tombstone" value="uncollected work, one key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a write stall" value="the same debt, system-wide" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRumLab({ t }: StepCtx) {
  return (
    <Svg label="the chapter's own lab: the identical workload, against a real Postgres cluster and a real RocksDB instance." h={260}>
      <Row y={50} label="Postgres" value="2.61x write, 1.89x space" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="RocksDB" value="1.85x write, 1.11x space" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="RocksDB's own read" value="faster, every run" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={185} label="but that read" value="not a clean comparison" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.9))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three compaction styles, one triangle, one conjecture, two real engines measured." h={260}>
      <Row y={50} label="three styles" value="one triangle" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the RUM conjecture" value="names what none escape" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the lab" value="two engines, measured" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="almost all writes, rarely read, disk space is cheap. Which engine actually fits?" h={200}>
      <Row y={70} label="this workload" value="almost all writes, cheap space" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the engine that fits" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
