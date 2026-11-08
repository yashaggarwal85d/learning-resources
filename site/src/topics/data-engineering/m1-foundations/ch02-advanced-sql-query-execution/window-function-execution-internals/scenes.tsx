import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

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

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

// 1 · Two jobs: the top row is one frame, defined; the bottom row has that frame delivered for every row as the bracket slides.
/** A caramel bracket around cells lo..hi of a Row at y; lo and hi may be fractional while it slides. */
function Bracket({ lo, hi, y, o = 1, col = C.caramel }: { lo: number; hi: number; y: number; o?: number; col?: string }) {
  return <rect x={25 + lo * 23 - 3} y={y - 4} width={(hi - lo) * 23 + 25} height={34} rx={6} fill="none" stroke={col} strokeWidth={2} opacity={o} />;
}

export function TwoJobs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 1.0, 1.4));
  const pos = lerp(2, 21, easeInOut(seg(t, 1.4, 3.1)));
  const done = Math.floor(pos);
  return (
    <Svg label="Defining a frame is one job; computing it for every row, cheaply, is another" h={260}>
      <T x={25} y={44} s={15} f={C.latte} o={a}>
        define: which rows does a row see?
      </T>
      <Row y={58} hi={8} w={2} o={a} />
      <T x={25} y={148} s={15} f={C.caramel} o={b}>
        deliver: do it for every row, cheaply
      </T>
      <Row y={162} hi={done} w={2} o={b} />
      <Bracket lo={pos - 2} hi={pos + 2} y={162} o={b} />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={34.5 + i * 23} cy={206} r={3} fill={C.caramel} opacity={b > 0 && i <= done ? 1 : 0} />
      ))}
    </Svg>
  );
}

// 2 · Rescan: for each output row a red scanner sweeps the whole table from the left before the frame lights, and it starts over every row.
export function Rescan({ t }: StepCtx) {
  return (
    <Svg label="Each correlated subquery scans the whole table again to find its neighbours, starting from scratch every row" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>
        for each output row…
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.55, 0.35 + i * 0.55));
        const sc = seg(t, 0.3 + i * 0.55, 0.75 + i * 0.55);
        const y = 48 + i * 36;
        return (
          <g key={i} opacity={k}>
            <Row y={y} hi={sc >= 1 ? 4 + i * 3 : -1} w={2} />
            {sc > 0 && sc < 1 && <rect x={25} y={y - 2} width={sc * 548} height={30} rx={4} fill={C.cherryText} opacity={0.22} />}
            {sc > 0 && sc < 1 && <rect x={25 + sc * 548 - 2} y={y - 4} width={3} height={34} fill={C.cherryText} />}
          </g>
        );
      })}
      <T x={25} y={284} s={14} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        …a full scan from scratch, every time
      </T>
    </Svg>
  );
}

// 3 · Predict: a thousand by a thousand grid. After the answer it fills row block by row block and the count runs to a million.
export function RescanPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const fill = answered ? easeInOut(seg(s, 0.2, 1.6)) : 0;
  const n = Math.round(1_000_000 * fill);
  return (
    <Svg label="1,000 rows each compared with 1,000 rows: 1,000,000 comparisons" h={260}>
      <rect x={160} y={60} width={160} height={160} rx={8} fill={C.cocoa} stroke={C.mocha} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} stroke={C.mocha} strokeWidth={0.6} opacity={0.6}>
          <line x1={160 + (i + 1) * 16} y1={60} x2={160 + (i + 1) * 16} y2={220} />
          <line x1={160} y1={60 + (i + 1) * 16} x2={320} y2={60 + (i + 1) * 16} />
        </g>
      ))}
      {fill > 0 && <rect x={160} y={60} width={160} height={160 * fill} rx={8} fill={C.cherry} opacity={0.75} />}
      <T x={240} y={50} s={13} f={C.latte} a="middle">
        1,000 columns
      </T>
      <T x={150} y={144} s={13} f={C.latte} a="end">
        1,000 rows
      </T>
      {!answered ? (
        <T x={450} y={150} s={52} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={450} y={150} s={22} f={C.cherryText} a="middle" w={700}>
          {n.toLocaleString('en-US')}
        </T>
      )}
    </Svg>
  );
}

// 4 · Sort once: shuffled cells slide into sorted order, then the bracket walks the sorted row and barely changes per step.
export function SortOnce({ t }: StepCtx) {
  const perm = [7, 19, 2, 13, 22, 5, 16, 0, 10, 21, 3, 14, 8, 23, 1, 17, 11, 6, 20, 4, 15, 9, 18, 12];
  const sort = easeInOut(seg(t, 0.4, 1.4));
  const pos = lerp(2, 21, easeInOut(seg(t, 1.8, 3.6)));
  return (
    <Svg label="Partition and sort once, then walk the rows in order; neighbouring frames overlap almost completely" h={260}>
      <T x={25} y={36} s={14} f={C.latte}>
        partition and sort once
      </T>
      {perm.map((v, i) => (
        <rect key={v} x={lerp(25 + i * 23, 25 + v * 23, sort)} y={52} width={19} height={26} rx={4} fill={C.crema} opacity={0.15 + (0.7 * v) / 23} />
      ))}
      <T x={25} y={130} s={14} f={C.caramel} o={easeOut(seg(t, 1.5, 1.8))}>
        then slide
      </T>
      <Row y={146} hi={Math.round(pos)} w={2} o={easeOut(seg(t, 1.5, 1.8))} />
      <Bracket lo={pos - 2} hi={pos + 2} y={146} o={easeOut(seg(t, 1.5, 1.8))} />
      <T x={25} y={216} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        row k and row k+1 share almost the same frame
      </T>
    </Svg>
  );
}

// 5 · Four ways: each strategy appears with a bar for its work per row, from the long naive bar down to the short ones.
export function FourWays({ t }: StepCtx) {
  const rows = [
    ['naive', 'recompute the frame each time', 190],
    ['cumulative', 'add the new rows', 14],
    ['removable cumulative', 'add new, subtract old', 24],
    ['segment tree', 'any frame in O(log n)', 50],
  ] as const;
  return (
    <Svg label="Four strategies from naive to segment tree, and the work each does per row" h={300}>
      <T x={380} y={30} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        work per row
      </T>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.7 + i * 0.9));
        const bar = easeOut(seg(t, 0.5 + i * 0.9, 1.1 + i * 0.9));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={58 + i * 64} s={17} f={i === 0 ? C.cherryText : C.caramel} w={700}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 64} s={13} f={C.latte}>
              {r[1]}
            </T>
            <rect x={380} y={44 + i * 64} width={Math.max(2, r[2] * bar)} height={16} rx={4} fill={i === 0 ? C.cherry : C.caramel} />
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Cumulative: the total grows one cell at a time with a plus over each new cell; the two costs, then the red line.
export function Cumulative({ t }: StepCtx) {
  const p = seg(t, 0.3, 2.2);
  const cur = Math.min(21, Math.floor(p * 22));
  return (
    <Svg label="A growing frame needs only one addition per row: 1,000 additions for 1,000 rows instead of about 500,500" h={260}>
      <T x={25} y={30} s={14} f={C.latte}>
        total so far
      </T>
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={25 + i * 23} y={70} width={19} height={26} rx={4} fill={i <= cur ? C.caramel : C.cocoa} stroke={C.mocha} />
      ))}
      {p > 0 && p < 1 && (
        <T x={34.5 + cur * 23} y={62} s={14} f={C.caramel} a="middle" w={700}>
          +
        </T>
      )}
      <T x={25} y={140} s={15} f={C.caramel} w={700} o={easeOut(seg(t, 2.2, 2.6))}>
        1,000 rows: 1,000 additions
      </T>
      <T x={25} y={170} s={14} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        recompute each time: 500,500
      </T>
      <T x={25} y={214} s={14} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.8))}>
        if the frame must also shrink: start over
      </T>
    </Svg>
  );
}

// 7 · Removable: the bracket slides, the leaving cell is marked out and the entering one in; then the two families of aggregate.
export function Removable({ t }: StepCtx) {
  const cur = Math.min(19, Math.floor(lerp(2, 19.99, seg(t, 0.3, 2.2))));
  const a = easeOut(seg(t, 2.3, 2.7));
  const b = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="A sliding frame adds the entering row and subtracts the leaving row; min and max need an ordered structure" h={280}>
      <Row n={22} y={60} hi={cur} w={2} />
      <rect x={25 + (cur - 3) * 23} y={60} width={19} height={26} rx={4} fill={C.cherry} opacity={cur > 2 ? 0.8 : 0} />
      <T x={25 + (cur - 3) * 23} y={52} s={13} f={C.cherryText} o={cur > 2 ? 1 : 0}>
        − out
      </T>
      <T x={25 + (cur + 2) * 23} y={52} s={13} f={C.caramel}>
        + in
      </T>
      <T x={25} y={140} s={15} f={C.caramel} o={a}>
        sum, count: subtract what left
      </T>
      <T x={25} y={176} s={15} f={C.cherryText} o={b}>
        min, max: ordered structure
      </T>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={470 + k * 18} y={180 - (k + 1) * 10} width={14} height={(k + 1) * 10} rx={2} fill={C.cherryText} opacity={b * easeOut(seg(t, 3.2 + k * 0.15, 3.5 + k * 0.15))} />
      ))}
    </Svg>
  );
}

// 8 · Predict: three frames whose bounds jump around. After the answer, a small segment tree draws in.
export function TreePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const j = Math.max(0, Math.min(2, Math.floor(t / 0.6))) || 0;
  const frames = [
    [
      [5, 1],
      [15, 6],
      [9, 0],
    ],
    [
      [17, 3],
      [6, 2],
      [12, 5],
    ],
    [
      [5, 1],
      [15, 6],
      [9, 0],
    ],
  ][j];
  const tree = answered ? easeOut(seg(s, 0.4, 1.2)) : 0;
  return (
    <Svg label="Frames whose bounds come from columns of the row and jump from row to row; a segment tree keeps the cost down" h={260}>
      {frames.map(([hi, w], i) => (
        <Row key={i} y={60 + i * 40} hi={hi} w={w} />
      ))}
      {!answered ? (
        <T x={300} y={220} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <T x={25} y={218} s={20} f={C.caramel} w={700}>
            segment tree
          </T>
          {[
            [500, 186, 1],
            [470, 212, 2],
            [530, 212, 2],
          ].map(([x, y, l], k) => (
            <g key={k} opacity={clamp(tree * 3 - k)}>
              {l === 2 && <line x1={500} y1={198} x2={x} y2={y} stroke={C.taupe} />}
              <rect x={x - 18} y={y - 12} width={36} height={22} rx={4} fill={C.cocoa} stroke={C.caramel} />
            </g>
          ))}
        </>
      )}
    </Svg>
  );
}

// 9 · Segment tree: built leaves-up, the frame draws under the leaves, then a probe hops from the root to each covering node.
export function SegmentTree({ t }: StepCtx) {
  const levels = [1, 2, 4, 8];
  const used: Record<string, number> = { '3-1': 0, '2-1': 1, '2-2': 2, '3-6': 3 };
  const lw = 540 / 8;
  const centre = (l: number, i: number): [number, number] => {
    const w = 540 / levels[l];
    return [30 + i * w + (w - 6) / 2, 44 + l * 50];
  };
  // The probe starts at the root and hops to each covering node in turn; each one lights as it lands.
  const stops: [number, number][] = [centre(0, 0), centre(3, 1), centre(2, 1), centre(2, 2), centre(3, 6)];
  const hop = clamp((t - 2.0) / 0.3, 0, 4);
  const h = Math.min(3, Math.floor(hop));
  const k = easeInOut(hop - h);
  const probe: [number, number] = [lerp(stops[h][0], stops[h + 1][0], k), lerp(stops[h][1], stops[h + 1][1], k)];
  const note = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="A segment tree stores the totals of blocks; a frame is covered by a few nodes, about 10 visits for 1,000 rows" h={300}>
      {/* built leaves-up: each level rises into place, the leaves first */}
      {levels.map((n, l) =>
        Array.from({ length: n }, (_, i) => {
          const w = 540 / n;
          const r = easeOut(seg(t, 0.2 + (3 - l) * 0.3, 0.6 + (3 - l) * 0.3));
          const u = used[`${l}-${i}`];
          const lit = u !== undefined && t >= 2.0 + (u + 1) * 0.3;
          return <rect key={`${l}-${i}`} x={30 + i * w} y={24 + l * 50 + (1 - r) * 22} width={w - 6} height={40} rx={6} fill={lit ? C.caramel : C.cocoa} stroke={C.mocha} opacity={r} />;
        }),
      )}
      {/* the frame, drawn under the leaves it spans */}
      <Draw pts={[[30 + lw, 225], [30 + 7 * lw - 6, 225]]} t={t} from={1.5} to={1.95} w={6} />
      <T x={30 + lw} y={248} s={13} f={C.caramel} o={easeOut(seg(t, 1.7, 2.0))}>
        one frame
      </T>
      {t >= 2.0 && t < 3.3 && <circle cx={probe[0]} cy={probe[1]} r={7} fill={C.focus} stroke={C.ink} strokeWidth={2} />}
      <g opacity={note} transform={`translate(0 ${((1 - note) * 8).toFixed(1)})`}>
        <T x={25} y={282} s={14} f={C.crema}>
          about 10 node visits for 1,000 rows
        </T>
      </g>
      <Reticle x={210} y={277} w={385} h={28} t={t} at={3.6} />
    </Svg>
  );
}

// 10 · Sort reuse: three windows appear, arrows run from each into one Sort, and data flows along them.
export function SortReuse({ t }: StepCtx) {
  const rows = [
    ['w1: PARTITION a ORDER b', 'frame ROWS 5'],
    ['w2: PARTITION a ORDER b', 'frame RANGE …'],
    ['w3: PARTITION a', 'prefix of the above'],
  ];
  const box = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="Windows with the same partition and order share one sort; a prefix reuses the stronger sort" h={300}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
        const ar = easeInOut(seg(t, 2.3 + i * 0.3, 2.8 + i * 0.3));
        const dot = seg(t, 2.8 + i * 0.3, 3.5 + i * 0.3);
        const y = 63 + i * 64;
        return (
          <g key={r[0]}>
            <g opacity={k}>
              <rect x={25} y={40 + i * 64} width={330} height={46} rx={8} fill={C.cocoa} stroke={C.mocha} />
              <T x={40} y={60 + i * 64} s={13} f={C.crema}>
                {r[0]}
              </T>
              <T x={40} y={78 + i * 64} s={13} f={C.latte}>
                {r[1]}
              </T>
            </g>
            <line x1={355} y1={y} x2={lerp(355, 410, ar)} y2={lerp(y, 127, ar)} stroke={C.caramel} strokeWidth={2} strokeDasharray={i === 2 ? '5 4' : undefined} opacity={ar > 0 ? 1 : 0} />
            {dot > 0 && dot < 1 && <circle cx={lerp(410, 355, dot)} cy={lerp(127, y, dot)} r={5} fill={C.crema} />}
          </g>
        );
      })}
      <rect x={410} y={77} width={150} height={100} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} opacity={box} />
      <T x={485} y={133} s={16} f={C.caramel} a="middle" w={700} o={box}>
        one Sort
      </T>
      <T x={25} y={274} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        write shared windows identically
      </T>
    </Svg>
  );
}

// 11 · Skew: all four workers run at the same speed; three finish at 100 and go idle while the 700 keeps going.
export function Skew({ t }: StepCtx) {
  const sizes = [100, 100, 100, 700];
  const prog = 700 * seg(t, 0.3, 3.4);
  return (
    <Svg label="Four workers with partitions of 100, 100, 100 and 700 rows; the 700 sets the finish time while the others sit idle" h={280}>
      {sizes.map((s, i) => {
        const w = (Math.min(s, prog) / 700) * 440;
        const idle = prog >= s && s < 700;
        return (
          <g key={i}>
            <T x={25} y={60 + i * 44} s={13} f={C.latte}>
              worker {i + 1}
            </T>
            <rect x={110} y={44 + i * 44} width={Math.max(4, w)} height={26} rx={6} fill={s === 700 ? C.cherry : C.caramel} />
            <T x={200} y={63 + i * 44} s={13} f={C.latte} o={idle ? easeOut(seg(prog, s, s + 60)) : 0}>
              idle
            </T>
            <T x={575} y={63 + i * 44} s={13} f={C.crema} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
              {s}
            </T>
          </g>
        );
      })}
      <T x={300} y={250} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.5, 4.0))}>
        the 700 sets the finish time
      </T>
    </Svg>
  );
}

// 12 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['neighbours', 'a window, not a subquery'],
    ['shared windows', 'identical PARTITION, ORDER'],
    ['one huge partition', 'will dominate'],
  ];
  return (
    <Svg label="Three habits for window queries: a window beats a correlated subquery, spell shared windows identically, one huge partition will dominate" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
        const bar = easeInOut(seg(t, i * 1.0 + 0.3, i * 1.0 + 0.9));
        const tick = easeOut(seg(t, i * 1.0 + 0.8, i * 1.0 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={19} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={400 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveCumulative({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const tick = answered ? easeOut(seg(s, 0.5, 0.9)) : 0;
  return (
    <Svg label="The default frame, start to current row, suits the cumulative strategy" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        start → current row →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(160, 140, k)} s={24} f={C.caramel} w={700} o={k}>
            cumulative
          </T>
          <rect x={40} y={152} width={150 * tick} height={3} fill={C.caramel} />
          <path d="M540 120 l8 8 l16 -18" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveSorts({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const tick = answered ? easeOut(seg(s, 0.5, 0.9)) : 0;
  return (
    <Svg label="Two windows with the same partition and order need one sort" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        same partition and order →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(160, 140, k)} s={24} f={C.caramel} w={700} o={k}>
            1 sort
          </T>
          <rect x={40} y={152} width={90 * tick} height={3} fill={C.caramel} />
          <path d="M540 120 l8 8 l16 -18" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
