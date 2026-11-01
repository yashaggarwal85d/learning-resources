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
    <Svg label="a chunk's own row is read at the same instant a transaction deletes that order; without any marker in the log, the snapshot brings the deleted order back." h={220}>
      <Row y={60} label="a chunk row" value="read mid-chunk" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the same order" value="deleted, right then" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="without a marker" value="the order returns" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="does the deleted order come back in this chunk's own output, or does it stay gone?" h={200}>
      <Row y={70} label="the deleted order" value="back, or gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which one" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWatermarkWindow({ t }: StepCtx) {
  return (
    <Svg label="a chunk opens with one marker, reads its rows, and closes with a second marker; anything touched between the two markers outranks the chunk's own copy." h={200}>
      <Row y={70} label="open, read, close" value="one chunk's window" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="touched in between" value="outranks the chunk" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealSupersedeMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: an update inside the window replaces the chunk's own stale copy; a delete inside the window removes the row outright, with no resurrection." h={220}>
      <Row y={60} label="updated mid-window" value="the update wins" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="deleted mid-window" value="stays deleted" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealNoLockInterleaved({ t }: StepCtx) {
  return (
    <Svg label="the only writes this algorithm makes are the two marker updates; the log keeps flowing the entire time, chunk after chunk, with no table lock anywhere." h={200}>
      <Row y={70} label="this algorithm writes" value="two markers only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the log" value="never stops flowing" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealFullRunMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a whole table copied chunk by chunk, with real updates, deletes and inserts fired between every single chunk, diffed against the source at the end." h={220}>
      <Row y={60} label="chunk after chunk" value="under constant writes" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="target versus source" value="an exact match" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealPauseResume({ t }: StepCtx) {
  return (
    <Svg label="only the last finished chunk's own position is ever stored; stopping partway through and picking up from that position costs nothing extra." h={200}>
      <Row y={70} label="the last chunk" value="the only marker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stopping, then resuming" value="costs nothing extra" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealPauseResumeMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one run finishes its chunks without stopping; a second run is stopped after its second chunk and later resumes from that exact point; both finish identical." h={220}>
      <Row y={60} label="run straight through" value="one final state" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="stopped, then resumed" value="the same state" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a window of two markers lets any chunk be superseded by the log, needs no lock, and can pause and resume at any chunk boundary." h={260}>
      <Row y={50} label="two markers" value="bracket every chunk" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the stream" value="never waits" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a pause" value="loses nothing" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a new table" value="joins the queue" o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a table gets added to a running connector after the fact, and nobody wants to stop the stream to pick it up. What actually triggers that one table's own snapshot?" h={200}>
      <Row y={70} label="a late table" value="needs a trigger" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what triggers it" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
