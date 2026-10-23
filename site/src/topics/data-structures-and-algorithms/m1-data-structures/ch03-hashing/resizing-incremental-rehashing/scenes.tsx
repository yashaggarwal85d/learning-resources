import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the resize itself, the bounded
// step); cinnamon = the compared alternative (the other strategy, the new table); cherry = the
// one failure/cost frame (the long pause, the sustained memory cost). At most two accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: three fixed-size tables, one more key that doesn't fit
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="Three tables built so far, each a fixed-size array, with one more key arriving that doesn't fit" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>three tables, all fixed size</T>
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 50 + row * 32, 28, 22, C.crema, 0.6))}
        </g>
      ))}
      <T x={30} y={230} s={13} f={C.cherry} o={a}>one more key &mdash; none of them have said what happens next</T>
    </Svg>
  );
}

// 2 · Doubling: one insert rehashes everything at once
export function DoublingCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A table at capacity doubling in size, every existing entry rehashed into the new array in one single sweep" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>table full &mdash; double capacity, rehash everyone, now</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 50, 28, 22, C.crema, 0.5))}
      {Array.from({ length: 12 }, (_, i) => fill(30 + i * 18, 110, 14, 18, C.caramel, a))}
      <T x={30} y={230} s={13} f={C.cherry} o={a}>every entry moves, in this one insert</T>
    </Svg>
  );
}

// 3 · Predict: how does the rehashing insert's cost compare?
export function LatencyPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A row of ordinary inserts with one highlighted insert where the doubling rehash happens, asking how its cost compares" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a row of inserts &mdash; one triggers the rehash</T>
      {Array.from({ length: 8 }, (_, i) => cell(30 + i * 28, 50, 22, 22, i === 4 ? C.cherry : C.crema, i === 4 ? 1 : 0.6))}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.cherry}>proportional to the table's size</T>
          <T x={30} y={162} s={13} f={C.latte}>far slower than its neighbors</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Incremental idea: two tables live at once, migration pointer
export function IncrementalIdea({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Two tables, old and new, both live at once, with a migration-pointer marker sitting at the start of the old table" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>old table, still live</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 44, 28, 22, C.crema, 0.7))}
      <T x={30} y={110} s={13} f={C.cinnamon} o={a}>new table, growing</T>
      {Array.from({ length: 12 }, (_, i) => cell(30 + i * 18, 130, 14, 18, C.cinnamon, 0.4))}
      <T x={30} y={190} s={13} f={C.caramel} o={a}>a migration pointer, waiting at slot zero</T>
    </Svg>
  );
}

// 5 · Predict: who moves the keys?
export function MigrationPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The migration pointer sitting idle between two tables, asking what actually makes it move forward" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>what makes the pointer move?</T>
      {cell(30, 50, 28, 22, C.caramel, 1)}
      <T x={70} y={66} s={13} f={C.latte}>&rarr;</T>
      {cell(120, 50, 28, 22, C.crema, 0.5)}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>piggybacked on real lookups and inserts</T>
          <T x={30} y={162} s={13} f={C.latte}>no thread, no idle-time trigger</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Bounded step: the pointer creeps forward a few slots per operation
export function BoundedStep({ t }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.2, 1.6) * 4) + 1);
  return (
    <Svg label="The migration pointer creeping a few slots further through the old table on each of several operations" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>each operation moves a bounded number of buckets</T>
      {Array.from({ length: 8 }, (_, i) => cell(30 + i * 30, 50, 24, 22, i < n ? C.caramel : C.crema, i < n ? 1 : 0.5))}
      <T x={30} y={220} s={13} f={C.caramel}>bounded, every single time</T>
      <T x={30} y={242} s={13} f={C.latte}>no matter how large the table grows</T>
    </Svg>
  );
}

// 7 · Memory trade-off: both tables live for many operations
export function MemoryTradeoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Both tables' memory footprints stacked, held for many operations during incremental migration, versus doubling's single-insert window" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>doubling: both tables live for 1 operation</T>
      {fill(30, 36, 60, 16, C.cinnamon, a)}
      <T x={30} y={110} s={13} f={C.cherry} o={b}>incremental: both tables live for many operations</T>
      {fill(30, 122, 220 * b, 16, C.cherry, Math.max(0.3, b))}
      <T x={30} y={190} s={13} f={C.latte} o={b}>a real, sustained memory cost</T>
    </Svg>
  );
}

// 8 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Both strategies' per-operation cost plotted across the same insert sequence, doubling's one tall spike versus incremental's flat bounded line" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>doubling: one tall spike</T>
      {fill(30, 36, 20, 16 * a, C.cherry, Math.max(0.3, a))}
      <T x={30} y={120} s={13} f={C.crema}>incremental: many small, bounded steps</T>
      {Array.from({ length: 10 }, (_, i) => fill(30 + i * 22, 132, 16, 10 * b, C.caramel, Math.max(0.3, b)))}
      <T x={30} y={220} s={13} f={C.latte}>same final table, same total work</T>
      <T x={30} y={242} s={13} f={C.latte}>a different schedule for who pays, and when</T>
    </Svg>
  );
}
