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
    <Svg label="a page sitting on disk is only useful if an engine doesn't have to read it from disk every time. What sits between a query and the disk?" h={200}>
      <Row y={70} label="every page, so far" value="assumed, just there" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the cache in front" value="not yet opened" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealClockSweep({ t }: StepCtx) {
  return (
    <Svg label="a buffer's own usage counter, read directly off this sandbox's cluster — what actually decides which buffer gets reused?" h={200}>
      <Row y={70} label="a clock hand" value="sweeps the buffers" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a usage counter" value="raised on every pin" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUsageCountCap({ t }: StepCtx) {
  return (
    <Svg label="the same small table, scanned six more times for real — does its usage count keep climbing, or does it stop?" h={200}>
      <Row y={70} label="scanned once" value="usage count 4" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="scanned six more times" value="usage count 5, capped" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRingBounded({ t }: StepCtx) {
  return (
    <Svg label="a sequential scan bigger than the whole buffer pool touches thousands of pages, once each — does the ordinary clock sweep evict most of the pool to make room?" h={200}>
      <Row y={70} label="a huge scan" value="evicts the pool?" />
      <Row y={130} label="every page touched" value="its own buffer?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRingFootprint({ t }: StepCtx) {
  return (
    <Svg label="a table built and scanned for real, far bigger than the whole buffer pool — how much of it actually ends up resident?" h={200}>
      <Row y={70} label="the table" value="26,688 pages" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="resident after a scan" value="2,144 buffers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDirtyCheckpoint({ t }: StepCtx) {
  return (
    <Svg label="a page just updated for real — is it marked dirty, and does a real checkpoint actually clean it?" h={200}>
      <Row y={70} label="just updated" value="isdirty: true" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after a checkpoint" value="isdirty: false" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDoubleCaching({ t }: StepCtx) {
  return (
    <Svg label="the same page, cached twice — once by the OS, once by the engine — what does one Linux flag trade away to stop that?" h={200}>
      <Row y={70} label="shared_buffers" value="needs the OS cache too" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="O_DIRECT" value="skips the OS cache" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPg18Aio({ t }: StepCtx) {
  return (
    <Svg label="this sandbox's own second cluster, PostgreSQL 18 — is its io_method setting just a name in the docs, or does it show up as real, measured I/O?" h={200}>
      <Row y={70} label="io_method" value="worker, by default" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a real scan, measured" value="real reads, bulkread" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a buffer's own clock sweep, a ring-bounded footprint, a dirty page cleaned by a checkpoint, and a real async I/O subsystem measured on a second cluster" h={260}>
      <Row y={50} label="a buffer's usage count" value="capped at 5" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a huge scan" value="ring-bounded, measured" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a dirty page" value="cleaned by a checkpoint" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="io_method on PG18" value="real, measured I/O" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard query's scan runs right after a reporting job's own big scan evicted the pool — does the dashboard query get slowed down by it?" h={220}>
      <Row y={55} label="a reporting job's scan" value="ring-bounded, bounded" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the rest of the pool" value="left untouched" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the dashboard's scan" value="not slowed down" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
