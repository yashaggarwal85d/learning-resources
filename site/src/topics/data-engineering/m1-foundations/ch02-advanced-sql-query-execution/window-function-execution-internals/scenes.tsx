import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the work the good algorithm does, cherryText = redundant work, crema = data, latte = labels.

function Row({ n = 24, y, hi = -1, w = 0, o = 1 }: { n?: number; y: number; hi?: number; w?: number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const inFrame = hi >= 0 && i >= hi - w && i <= hi + w;
        return <rect key={i} x={25 + i * 23} y={y} width={19} height={26} rx={4} fill={inFrame ? C.caramel : C.cocoa} stroke={i === hi ? C.crema : C.mocha} />;
      })}
    </g>
  );
}

// 1 · Two jobs.
export function TwoJobs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="Defining a frame is one job; computing it for every row is another" h={260}>
      <T x={25} y={44} s={15} f={C.latte} o={a}>define: which rows does a row see?</T>
      <Row y={58} hi={8} w={2} o={a} />
      <T x={25} y={148} s={15} f={C.caramel} o={b}>deliver: do it for every row, cheaply</T>
      <Row y={162} hi={8} w={2} o={b} />
      <Row y={196} hi={9} w={2} o={b} />
    </Svg>
  );
}

// 2 · Rescan.
export function Rescan({ t }: StepCtx) {
  const k = Math.min(5, Math.floor(t / 0.7));
  return (
    <Svg label="Each correlated subquery scans the whole table to find its neighbours" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>for each output row…</T>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} opacity={i <= k ? 1 : 0.2}>
          <Row y={48 + i * 36} hi={4 + i * 3} w={2} />
        </g>
      ))}
      <T x={25} y={284} s={14} f={C.cherryText}>…a full scan, starting from scratch each time</T>
    </Svg>
  );
}

// 3 · Predict.
export function RescanPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="1,000 rows each scanning 1,000 rows" h={260}>
      <rect x={110} y={60} width={160} height={160} rx={8} fill={answered ? C.cherry : C.cocoa} stroke={C.mocha} opacity={0.7} />
      <T x={190} y={52} s={13} f={C.latte} a="middle">1,000 columns</T>
      <T x={90} y={144} s={13} f={C.latte} a="end">1,000 rows</T>
      {!answered ? <T x={410} y={150} s={52} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={420} y={150} s={22} f={C.cherryText} a="middle" w={700}>1,000,000</T>}
    </Svg>
  );
}

// 4 · Sort once.
export function SortOnce({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  const cur = Math.min(21, Math.floor(seg(t, 1.8, 3.6) * 22));
  return (
    <Svg label="Sort once, then walk the rows in order; neighbouring frames overlap almost completely" h={260}>
      <T x={25} y={36} s={14} f={C.latte}>partition and sort once</T>
      <Row y={52} o={a} />
      <T x={25} y={130} s={14} f={C.caramel}>then slide</T>
      <Row y={146} hi={cur} w={2} />
      <T x={25} y={216} s={13} f={C.latte}>row k and row k+1 share almost the same frame</T>
    </Svg>
  );
}

// 5 · Four ways.
export function FourWays({ t }: StepCtx) {
  const rows = [['naive', 'recompute the frame each time'], ['cumulative', 'add the new rows'], ['removable cumulative', 'add new, subtract old'], ['segment tree', 'any frame in O(log n)']];
  return (
    <Svg label="Four strategies from naive to segment tree" h={300}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={54 + i * 64} s={17} f={i === 0 ? C.cherryText : C.caramel} w={700}>{r[0]}</T>
          <T x={25} y={78 + i * 64} s={13} f={C.latte}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 6 · Cumulative.
export function Cumulative({ t }: StepCtx) {
  const cur = Math.min(21, Math.floor(seg(t, 0.4, 3.2) * 22));
  return (
    <Svg label="A growing frame needs only one addition per row" h={260}>
      <g>
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={25 + i * 23} y={70} width={19} height={26} rx={4} fill={i <= cur ? C.caramel : C.cocoa} stroke={C.mocha} />)}
      </g>
      <T x={25} y={44} s={14} f={C.latte}>total so far</T>
      <T x={25} y={140} s={16} f={C.caramel}>+ one new row each step</T>
      <T x={25} y={184} s={14} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.8))}>if the frame must also shrink: start over</T>
    </Svg>
  );
}

// 7 · Removable.
export function Removable({ t }: StepCtx) {
  const cur = Math.min(17, Math.floor(seg(t, 0.4, 3.2) * 18)) + 2;
  return (
    <Svg label="A sliding frame adds the entering row and subtracts the leaving row" h={280}>
      <Row n={22} y={60} hi={cur} w={2} />
      <T x={25 + (cur - 2) * 23} y={52} s={13} f={C.cherryText}>− out</T>
      <T x={25 + (cur + 2) * 23} y={52} s={13} f={C.caramel}>+ in</T>
      <T x={25} y={130} s={15} f={C.caramel}>sum, count: subtract the row that left</T>
      <T x={25} y={160} s={15} f={C.cherryText}>min, max: need an ordered structure</T>
    </Svg>
  );
}

// 8 · Predict.
export function TreePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Frames whose bounds jump from row to row" h={260}>
      <Row y={60} hi={5} w={1} />
      <Row y={100} hi={15} w={6} />
      <Row y={140} hi={9} w={0} />
      {!answered ? <T x={300} y={220} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={218} s={20} f={C.caramel} a="middle" w={700}>segment tree</T>}
    </Svg>
  );
}

// 9 · Segment tree.
export function SegmentTree({ t }: StepCtx) {
  const levels = [1, 2, 4, 8];
  const a = easeOut(seg(t, 0.4, 2.0));
  return (
    <Svg label="A segment tree stores aggregates of blocks; a frame is covered by a few nodes" h={300}>
      {levels.map((n, l) => Array.from({ length: n }, (_, i) => {
        const w = 540 / n;
        const used = (l === 1 && i === 1) || (l === 2 && i === 1) || (l === 3 && i === 4);
        return (
          <g key={`${l}-${i}`} opacity={clamp(a * 4 - l)}>
            <rect x={30 + i * w} y={30 + l * 58} width={w - 6} height={40} rx={6} fill={used ? C.caramel : C.cocoa} stroke={C.mocha} />
          </g>
        );
      }))}
      <T x={300} y={282} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>a frame = a few nodes, about 10 visits for 1,000 rows</T>
    </Svg>
  );
}

// 10 · Sort reuse.
export function SortReuse({ t }: StepCtx) {
  const rows = [['w1: PARTITION a ORDER b', 'frame ROWS 5'], ['w2: PARTITION a ORDER b', 'frame RANGE …'], ['w3: PARTITION a', 'prefix of the above']];
  return (
    <Svg label="Windows with the same partition and order share one sort; a prefix reuses the stronger sort" h={300}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <rect x={25} y={40 + i * 64} width={330} height={46} rx={8} fill={C.cocoa} stroke={C.mocha} />
          <T x={40} y={60 + i * 64} s={13} f={C.crema}>{r[0]}</T>
          <T x={40} y={78 + i * 64} s={13} f={C.latte}>{r[1]}</T>
        </g>
      ))}
      <rect x={400} y={60} width={150} height={120} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} opacity={easeOut(seg(t, 2.4, 3.2))} />
      <T x={475} y={126} s={16} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 2.4, 3.2))}>one Sort</T>
    </Svg>
  );
}

// 11 · Skew.
export function Skew({ t }: StepCtx) {
  const sizes = [100, 100, 100, 700];
  const a = easeOut(seg(t, 0.4, 2.4));
  return (
    <Svg label="Four workers with partitions of 100, 100, 100 and 700 rows; the 700 sets the finish time" h={280}>
      {sizes.map((s, i) => (
        <g key={i}>
          <T x={25} y={60 + i * 44} s={13} f={C.latte}>worker {i + 1}</T>
          <rect x={110} y={44 + i * 44} width={Math.max(4, (s / 700) * 440 * a)} height={26} rx={6} fill={s === 700 ? C.cherry : C.caramel} />
          <T x={115 + (s / 700) * 440 * a} y={63 + i * 44} s={13} f={C.crema}>{s}</T>
        </g>
      ))}
      <T x={300} y={250} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>the 700 sets the finish time; the others sit idle</T>
    </Svg>
  );
}

// 12 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['neighbours', 'window beats correlated subquery'], ['shared windows', 'same PARTITION and ORDER text'], ['one huge partition', 'will dominate']];
  return (
    <Svg label="Three habits for window queries" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={19} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveCumulative({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The default frame" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>start → current row →</T>
      {answered ? <T x={330} y={104} s={22} f={C.caramel} w={700}>cumulative</T> : <T x={350} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveSorts({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two windows, one sort" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>same partition and order →</T>
      {answered ? <T x={400} y={104} s={22} f={C.caramel} w={700}>1 sort</T> : <T x={410} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
