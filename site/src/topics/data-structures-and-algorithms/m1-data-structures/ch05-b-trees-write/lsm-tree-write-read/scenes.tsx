import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the structure's own live state (a memtable, a run's real
// keys); latte = secondary labels; taupe = an empty/discarded slot; caramel = the thing to look
// at (a flush, the newest-first read path, a filter/fence check); cinnamon = the alternative
// being compared (in-place updates, an unfiltered read); cherry = the bad outcome or shadowed
// value (a stale copy a tombstone hides).

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}-e`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// A run/page: a wide rounded rectangle of `slots` keys, drawn as small ticks in a row.
function page(x: number, y: number, w: number, slots: number, colour = C.crema, opacity = 1, filledSlots?: number) {
  const filled = filledSlots ?? slots;
  const slotW = w / slots;
  const items = [] as React.ReactNode[];
  items.push(<rect key={`${x}-${y}-p`} x={x} y={y} width={w} height={16} rx={2} fill="none" stroke={colour} strokeWidth={1.3} opacity={opacity} />);
  for (let i = 0; i < slots; i++) {
    const sx = x + i * slotW + slotW / 2;
    const isFilled = i < filled;
    items.push(<circle key={`${x}-${y}-s${i}`} cx={sx} cy={y + 8} r={2.4} fill={isFilled ? colour : 'none'} stroke={isFilled ? 'none' : C.taupe} strokeWidth={1} opacity={opacity} />);
  }
  return items;
}

// A log: a thin horizontal strip of small marks, growing rightward.
function logStrip(x: number, y: number, w: number, marks: number, colour = C.crema, opacity = 1, filledMarks?: number) {
  const filled = filledMarks ?? marks;
  const markW = w / marks;
  const items = [] as React.ReactNode[];
  items.push(<rect key={`${x}-${y}-l`} x={x} y={y} width={w} height={10} rx={2} fill="none" stroke={colour} strokeWidth={1.1} opacity={opacity} />);
  for (let i = 0; i < filled; i++) {
    const mx = x + i * markW + markW / 2;
    items.push(<rect key={`${x}-${y}-m${i}`} x={mx - 1.2} y={y + 2} width={2.4} height={6} fill={colour} opacity={opacity} />);
  }
  return items;
}

// 1 · Opening: an in-place page struck through, replaced by an append-only log
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A page that updates in place, struck through, replaced by a single append-only log line growing rightward" h={280}>
      <T x={30} y={24} s={13} f={C.cinnamon}>every page so far: update in place, pay the cost now</T>
      {page(60, 50, 260, 8, C.cinnamon, 0.6, 7)}
      <line x1={60} y1={44} x2={320} y2={74} stroke={C.cherry} strokeWidth={1.8} opacity={0.7} />
      <T x={30} y={140} s={13} f={C.crema} o={a}>this structure: never update in place, write sequentially instead</T>
      {logStrip(60, 166, 320 * a, 12, C.crema, a, Math.round(9 * a))}
      <T x={30} y={220} s={13} f={C.latte} o={a}>the cost doesn't disappear — it's paid back later, on its own schedule</T>
    </Svg>
  );
}

// 2 · WAL: writes appended to a growing log, for crash recovery
export function WAL({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const pulse = 0.6 + 0.4 * Math.sin(t * 2.5);
  return (
    <Svg label="A write-ahead log, writes landing at its growing end" h={260}>
      <T x={30} y={30} s={13} f={C.crema}>every write lands here first, in order</T>
      {logStrip(60, 56, 340, 14, C.crema, 1, Math.round(10 * a))}
      <circle cx={60 + (340 / 14) * (10 * a - 0.5)} cy={61} r={5} fill={C.caramel} opacity={Math.max(0.4, pulse)} />
      <T x={30} y={140} s={13} f={C.latte} o={a}>a crash here is survived by replaying the log, in order, from the start</T>
      <T x={30} y={200} s={13} f={C.cinnamon} o={a}>nothing else this topic builds works without this log existing first</T>
    </Svg>
  );
}

// 3 · Memtable: in-memory sorted structure, consulted on every read
export function Memtable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A write-ahead log beside a small in-memory sorted structure, the memtable" h={280}>
      {logStrip(60, 30, 200, 10, C.latte, 0.6, 7)}
      <T x={280} y={38} s={12} f={C.latte} o={0.6}>the log</T>
      <path d="M 160 46 L 160 100" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(60, 120, 200, 6, C.crema, a, 5)}
      <T x={280} y={128} s={12} f={C.crema} o={a}>the memtable — sorted, in memory</T>
      <T x={30} y={190} s={13} f={C.crema} o={a}>every read checks here first, or stale data would come back silently</T>
    </Svg>
  );
}

// 4 · Predict: the memtable just filled up
export function FlushPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A memtable drawn completely full, pulsing" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>the memtable just reached its size limit</T>
      {page(100, 90, 300, 8, C.cherry, Math.max(0.5, pulse), 8)}
      <T x={100} y={130} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'flushed out whole, as one new, unchanging run' : 'full — what happens to it?'}
      </T>
    </Svg>
  );
}

// 5 · Flush reveal: memtable → immutable SSTable, fresh memtable takes over, old WAL discarded
export function FlushReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="A full memtable flushed into a new immutable run; a fresh memtable and a fresh log take its place" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>before: one full memtable</T>
      {page(100, 40, 300, 8, C.cherry, Math.max(0.3, 1 - a), 8)}
      <path d="M 150 56 L 150 150" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={190} s={13} f={C.crema} o={a}>after: an immutable run on disk, never touched again</T>
      {page(100, 160, 300, 8, C.crema, a, 8)}
      <T x={30} y={240} s={13} f={C.crema} o={b}>a brand-new memtable and log take over immediately</T>
      {logStrip(100, 266, 160, 10, C.crema, b, Math.round(2 * b))}
      <T x={300} y={260} s={12} f={C.taupe} o={b}>the old log is discarded — its data already lives on disk</T>
    </Svg>
  );
}

// 6 · Predict: the same key in three places
export function ReadPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The same key with three different values, in a memtable and two on-disk runs" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>the same key, three copies</T>
      {page(80, 60, 120, 1, C.crema, 1, 1)}
      <T x={80} y={100} s={11} f={C.latte}>memtable — newest write</T>
      {page(240, 60, 120, 1, C.crema, 0.75, 1)}
      <T x={240} y={100} s={11} f={C.latte}>older run</T>
      {page(400, 60, 120, 1, C.crema, 0.55, 1)}
      <T x={400} y={100} s={11} f={C.latte}>oldest run</T>
      <T x={30} y={160} s={13} f={answered ? C.crema : C.latte} o={1}>
        {answered ? 'the newest copy wins, always' : 'which one does a read actually return?'}
      </T>
    </Svg>
  );
}

// 7 · Read reveal: memtable, then newest-to-oldest runs, stop at first match
export function ReadReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.5, 1));
  const c = easeOut(seg(t, 1, 1.5));
  const runs = [
    { x: 240, label: 'newer run', hit: false },
    { x: 400, label: 'older run', hit: true },
  ];
  return (
    <Svg label="A read checking the memtable, then each on-disk run from newest to oldest, stopping at the first match" h={300}>
      {page(80, 60, 120, 1, C.crema, Math.max(0.4, 1 - a), 0)}
      <T x={80} y={100} s={11} f={C.cinnamon} o={a}>memtable — not found here</T>
      <path d="M 200 68 L 240 68" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {page(240, 60, 120, 1, C.crema, Math.max(0.4, 1 - b), 0)}
      <T x={240} y={100} s={11} f={C.cinnamon} o={b}>newer run — not found here</T>
      <path d="M 360 68 L 400 68" stroke={C.caramel} strokeWidth={1.6} opacity={b} markerEnd="url(#arrow)" />
      {page(400, 60, 120, 1, C.caramel, c, 1)}
      <T x={400} y={100} s={11} f={C.crema} o={c}>oldest run — found, stop here</T>
      <T x={30} y={180} s={13} f={C.crema} o={c}>newest-first isn't an optimization — it's the only way to know which copy is current</T>
    </Svg>
  );
}

// 8 · Skip work: Bloom filter (membership) + fence pointer (range), compounding
export function SkipWork({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.5, 1.2));
  const c = easeOut(seg(t, 1, 1.6));
  return (
    <Svg label="A Bloom filter ruling a run out from memory, and a fence pointer narrowing where inside a run to look" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>a Bloom filter: definitely-not-here, or maybe-here — checked in memory</T>
      {fill(60, 40, 40 * a, 20, C.cinnamon, 0.5)}
      <T x={110} y={55} s={11} f={C.cinnamon} o={a}>definitely not — run skipped, no disk read at all</T>
      <T x={30} y={120} s={13} f={C.crema} o={b}>a fence pointer: a stored key range, narrowing a maybe to one block</T>
      {page(60, 140, 300, 6, C.latte, b, 6)}
      {fill(60 + (300 / 6) * 2, 140, 300 / 6, 16, C.caramel, c)}
      <T x={60} y={190} s={12} f={C.crema} o={c}>only this one block is ever actually opened</T>
      <T x={30} y={250} s={13} f={C.latte} o={c}>neither one answers the question — they only decide what's worth checking</T>
    </Svg>
  );
}

// 9 · Tombstone: a delete marker shadows an older, unmodified run
export function Tombstone({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.7, 1.4));
  return (
    <Svg label="A tombstone marker in the memtable shadowing an older run's unmodified value" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>an older run still holds this key's value, byte for byte, unchanged</T>
      {page(80, 50, 120, 1, C.cherry, 0.7, 1)}
      <T x={80} y={90} s={11} f={C.cherryText}>shadowed — still physically there</T>
      <T x={30} y={150} s={13} f={C.crema} o={a}>a delete lands in the memtable as its own entry, not an edit to that run</T>
      {page(80, 176, 120, 1, C.caramel, a, 1)}
      <T x={80} y={216} s={11} f={C.crema} o={a}>tombstone — found first, every time</T>
      <T x={30} y={260} s={13} f={C.latte} o={b}>no compaction has run. the read already returns not-found</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Three measured bars: a Bloom filter's observed false-positive rate, runs touched with and without filters and fence pointers, and a tombstone shadowing a value with zero compactions" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>Bloom filter: observed false-positive rate against its bits-per-key setting</T>
      {fill(30, 36, 20 * a, 16, C.caramel, Math.max(0.3, a))}
      <T x={30} y={100} s={13} f={C.crema} o={b}>runs actually opened: unfiltered vs. with filters and fence pointers</T>
      {fill(30, 112, 220 * b, 16, C.cinnamon, Math.max(0.3, b) * 0.7)}
      {fill(30, 134, 40 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={200} s={13} f={C.crema} o={c}>a tombstone shadowing an older value, with zero compactions run</T>
      {fill(30, 212, 60 * c, 16, C.caramel, Math.max(0.3, c))}
      <T x={30} y={270} s={13} f={C.latte} o={c}>every bar here is a measurement from examples.py, not an assumption</T>
    </Svg>
  );
}
