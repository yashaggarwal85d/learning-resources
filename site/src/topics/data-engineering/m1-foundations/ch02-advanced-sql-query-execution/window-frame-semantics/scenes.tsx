import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the frame / the current row, cherryText = the tie trap, crema = data, latte = labels.
// One customer's orders: amounts 100, 50, 25, 10; the 50 and 25 share a timestamp (they are peers).

const AMT = [100, 50, 25, 10];
const TS = ['t1', 't2', 't2', 't3'];
const X = (i: number) => 40 + i * 130;

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

// 1 · Filmstrip: the four orders first collapse into one aggregate and spring back; then the bracket walks down them and
// each keeps its own running total.
/** One order card at x; text fades with `to`; the peer outline is red. */
function Card({ i, x, y = 70, cur = false, peer = false, o = 1, to = 1, sub }: { i: number; x: number; y?: number; cur?: boolean; peer?: boolean; o?: number; to?: number; sub?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={100} height={64} rx={10} fill={C.cocoa} stroke={cur ? C.caramel : peer ? C.cherryText : C.mocha} strokeWidth={cur ? 3 : 1.5} />
      {to > 0 && (
        <>
          <T x={x + 50} y={y + 28} s={18} f={C.crema} a="middle" w={600} o={to}>
            {String(AMT[i])}
          </T>
          <T x={x + 50} y={y + 52} s={13} f={C.latte} a="middle" o={to}>
            {sub ?? TS[i]}
          </T>
        </>
      )}
    </g>
  );
}
/** The frame bracket from card a to card b; a and b may be fractional while it moves. */
function Frame({ a, b, y = 62, o = 1, col = C.caramel, dash }: { a: number; b: number; y?: number; o?: number; col?: string; dash?: string }) {
  return <rect x={X(a) - 6} y={y} width={X(b) - X(a) + 112} height={80} rx={14} fill="none" stroke={col} strokeWidth={3} strokeDasharray={dash} opacity={o} />;
}
/** A bracket end that walks one card per beat: 0 → n-1, each move eased. */
function walk(t: number, t0: number, gap: number, n = 4, mv = 0.3) {
  let p = 0;
  for (let j = 1; j < n; j++) p += easeInOut(seg(t, t0 + (j - 1) * gap, t0 + (j - 1) * gap + mv));
  return p;
}

export function Filmstrip({ t }: StepCtx) {
  const txt = 1 - seg(t, 0.4, 0.55) + seg(t, 1.9, 2.05);
  const squeeze = easeInOut(seg(t, 0.55, 1.0)) - easeInOut(seg(t, 1.45, 1.9));
  const one = seg(t, 1.0, 1.15) - seg(t, 1.3, 1.45);
  const fr = easeOut(seg(t, 2.0, 2.2));
  const pos = walk(t, 2.3, 0.35);
  const totals = [100, 150, 175, 185];
  return (
    <Svg label="An aggregate would collapse the four orders into one row; a window keeps every row and gives each its own running total" h={240}>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={lerp(X(i), X(1.5), squeeze)} cur={fr > 0 && Math.round(pos) === i} o={easeOut(seg(t, i * 0.06, i * 0.06 + 0.3))} to={clamp(txt)} />
      ))}
      {one > 0 && (
        <>
          <T x={285} y={98} s={18} f={C.crema} a="middle" w={600} o={one}>
            185
          </T>
          <T x={285} y={176} s={14} f={C.latte} a="middle" o={one}>
            an aggregate: one row
          </T>
        </>
      )}
      <Frame a={0} b={pos} o={fr} />
      {AMT.map((_, i) => (
        <T key={i} x={X(i) + 50} y={176} s={14} f={C.caramel} a="middle" o={fr > 0 && pos >= i - 0.05 ? 1 : 0}>
          {String(totals[i])}
        </T>
      ))}
      <T x={20} y={36} s={14} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        every order keeps its own row
      </T>
    </Svg>
  );
}

// 2 · Three parts: interleaved rows split into two partitions, sort inside each, then a frame bracket picks one row's slice.
export function ThreeParts({ t }: StepCtx) {
  const A = [40, 20, 55, 30];
  const B = [25, 45, 15, 35];
  const mixed = [0, 4, 1, 5, 2, 6, 3, 7];
  const part = easeInOut(seg(t, 0.4, 1.2));
  const sort = easeInOut(seg(t, 1.6, 2.4));
  const fr = easeOut(seg(t, 2.8, 3.4));
  const rank = (arr: number[], j: number) => [...arr].sort((p, q) => p - q).indexOf(arr[j]);
  const parts = [
    ['PARTITION BY', 'independent groups', 0.2],
    ['ORDER BY', 'order inside a group', 1.4],
    ['frame', 'the slice one row sees', 2.6],
  ] as const;
  return (
    <Svg label="Partition splits rows into independent groups, order sorts inside each, and the frame is the slice one row sees" h={280}>
      {parts.map((p, i) => (
        <g key={p[0]} opacity={easeOut(seg(t, p[2], p[2] + 0.4))}>
          <T x={25} y={70 + i * 76} s={16} f={C.caramel} w={700}>
            {p[0]}
          </T>
          <T x={25} y={94 + i * 76} s={13} f={C.latte}>
            {p[1]}
          </T>
        </g>
      ))}
      {mixed.map((id, slot) => {
        const isA = id < 4;
        const j = id % 4;
        const h = isA ? A[j] : B[j];
        const lane = isA ? 130 : 240;
        const packed = isA ? rank(A, j) : rank(B, j);
        const x0 = 300 + slot * 34;
        const x1 = 330 + j * 52;
        const x2 = 330 + packed * 52;
        const x = lerp(lerp(x0, x1, part), x2, sort);
        const base = lerp(185, lane, part);
        const hiA = isA && packed === 2 && fr > 0;
        return <rect key={id} x={x} y={base - h} width={26} height={h} rx={4} fill={isA ? C.crema : C.latte} opacity={hiA ? 1 : 0.75} stroke={hiA ? C.caramel : 'none'} strokeWidth={2} />;
      })}
      <line x1={310} y1={132} x2={lerp(310, 560, part)} y2={132} stroke={C.taupe} strokeWidth={1} opacity={part} />
      <line x1={310} y1={242} x2={lerp(310, 560, part)} y2={242} stroke={C.taupe} strokeWidth={1} opacity={part} />
      <rect x={322} y={58} width={lerp(42, 146, fr)} height={82} rx={10} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={fr} />
    </Svg>
  );
}

// 3 · ROWS stops at the current row; RANGE runs on to its peer. Two strips, two brackets, the second one jumps.
export function RowsVsRange({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const g1 = easeInOut(seg(t, 0.6, 1.2));
  const b = easeOut(seg(t, 1.6, 1.9));
  const g2 = easeInOut(seg(t, 2.0, 2.5)) + easeInOut(seg(t, 2.9, 3.5));
  const flash = seg(t, 2.5, 2.7) - seg(t, 3.5, 3.8);
  return (
    <Svg label="ROWS stops at the current row; RANGE extends to the last peer of the current row" h={330}>
      <T x={20} y={30} s={14} f={C.caramel} w={700} o={a}>
        ROWS: stops at the current row
      </T>
      <g transform="translate(0 -22)">
        {AMT.map((_, i) => (
          <Card key={i} i={i} x={X(i)} cur={i === 1} peer={TS[i] === 't2'} o={a} />
        ))}
        <Frame a={0} b={g1} o={g1 > 0 ? a : 0} />
      </g>
      <T x={20} y={176} s={14} f={C.cherryText} w={700} o={b}>
        RANGE: reaches the last peer
      </T>
      <g transform="translate(0 134)">
        {AMT.map((_, i) => (
          <Card key={i} i={i} x={X(i)} cur={i === 1} peer={TS[i] === 't2'} o={b} />
        ))}
        {flash > 0 && <rect x={X(2) - 2} y={66} width={104} height={72} rx={12} fill={C.cherryText} opacity={0.18 * flash} />}
        <Frame a={0} b={g2} o={g2 > 0 ? b : 0} />
      </g>
    </Svg>
  );
}

// 4 · Predict: the tied pair pulses. After the answer the totals land one by one and the two tied ones are joined.
export function TiePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const totals = [100, 175, 175, 185];
  const join = answered ? easeInOut(seg(s, 1.4, 2.0)) : 0;
  return (
    <Svg label="Running totals with no frame when two rows tie on the ordering key: both tied rows show 175" h={280}>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={X(i)} peer={TS[i] === 't2'} />
      ))}
      {!answered && <rect x={X(1) - 6} y={62} width={242} height={80} rx={14} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={pulse} strokeDasharray="5 5" />}
      {!answered ? (
        <T x={300} y={210} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          {AMT.map((_, i) => (
            <T key={i} x={X(i) + 50} y={190} s={20} f={TS[i] === 't2' ? C.cherryText : C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.2 + i * 0.3, 0.5 + i * 0.3))}>
              {String(totals[i])}
            </T>
          ))}
          <path
            d={`M${X(1) + 50} 204 C ${X(1) + 50} 240 ${X(2) + 50} 240 ${X(2) + 50} 204`}
            fill="none"
            stroke={C.cherryText}
            strokeWidth={2}
            strokeDasharray="160"
            strokeDashoffset={160 * (1 - join)}
          />
          <T x={300} y={268} s={13} f={C.cherryText} a="middle" o={join}>
            each peer includes the other
          </T>
        </>
      )}
    </Svg>
  );
}

// 5 · Peer frame: the bracket reaches the tie and cannot stop at the 50, so it jumps over both; the total steps once per timestamp.
export function PeerFrame({ t }: StepCtx) {
  const b = easeInOut(seg(t, 1.0, 1.8)) * 2 + easeInOut(seg(t, 2.8, 3.3));
  const cur = t < 1.0 ? 0 : t < 2.2 ? 1 : t < 2.8 ? 2 : 3;
  const totals = [100, 175, 175, 185];
  const shown = [0.3, 1.8, 2.3, 3.3];
  return (
    <Svg label="The default frame reaches the last peer, so the total steps once per distinct timestamp: 100, 175, 175, 185" h={260}>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={X(i)} cur={i === cur} peer={TS[i] === 't2'} />
      ))}
      <Frame a={0} b={b} />
      {AMT.map((_, i) => (
        <T key={i} x={X(i) + 50} y={180} s={18} f={C.cherryText} a="middle" o={easeOut(seg(t, shown[i], shown[i] + 0.25))}>
          {String(totals[i])}
        </T>
      ))}
      <T x={300} y={236} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        one step per distinct timestamp
      </T>
    </Svg>
  );
}

// 6 · ROWS and a tie-break: order ids split the peers, the red outlines go, and the bracket moves one row at a time.
export function RowsFix({ t }: StepCtx) {
  const brk = easeOut(seg(t, 0.4, 0.9));
  const pos = walk(t, 1.2, 0.7, 4, 0.4);
  const ids = ['#3', '#7', '#8', '#9'];
  const totals = [100, 150, 175, 185];
  return (
    <Svg label="With a unique order and ROWS, each row advances the total by itself: 100, 150, 175, 185" h={260}>
      <T x={300} y={36} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        ORDER BY event_time, order_id · ROWS
      </T>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={X(i)} cur={Math.round(pos) === i && t > 1.0} peer={TS[i] === 't2' && brk < 1} sub={brk > 0.5 ? `${TS[i]} ${ids[i]}` : TS[i]} />
      ))}
      <Frame a={0} b={pos} o={easeOut(seg(t, 0.9, 1.1))} />
      {AMT.map((_, i) => (
        <T key={i} x={X(i) + 50} y={190} s={18} f={C.caramel} a="middle" o={t > 0.9 && pos >= i - 0.05 ? 1 : 0}>
          {String(totals[i])}
        </T>
      ))}
    </Svg>
  );
}

// 7 · GROUPS: three dashed group outlines draw over four orders, then from the last group the frame reaches one whole group back.
export function Groups({ t }: StepCtx) {
  const groups = [
    [0, 0],
    [1, 2],
    [3, 3],
  ];
  const back = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="The four orders form three peer groups; GROUPS 1 PRECEDING reaches one whole group back" h={260}>
      <T x={20} y={36} s={14} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        4 orders, 3 groups
      </T>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={X(i)} cur={i === 3 && t > 1.9} />
      ))}
      {groups.map(([g0, g1], k) => {
        const w = X(g1) - X(g0) + 112;
        const per = 2 * (w + 84);
        const d = easeInOut(seg(t, 0.3 + k * 0.4, 0.9 + k * 0.4));
        return (
          <g key={k}>
            <rect x={X(g0) - 6} y={60} width={w} height={84} rx={12} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray={`${per * d} ${per}`} />
            <T x={X(g0) - 6 + w / 2} y={166} s={13} f={C.caramel} a="middle" o={d}>
              {`group ${k + 1}`}
            </T>
          </g>
        );
      })}
      <rect x={lerp(X(3), X(1), back) - 10} y={56} width={X(3) - lerp(X(3), X(1), back) + 120} height={92} rx={16} fill="none" stroke={C.caramel} strokeWidth={3} opacity={back > 0 ? 1 : 0} />
      <T x={300} y={222} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        1 PRECEDING = one whole group back
      </T>
    </Svg>
  );
}

// 8 · EXCLUDE: three mini strips, the frame over all four orders, and each option crossing out its own cards.
export function Exclude({ t }: StepCtx) {
  const rows = [
    ['EXCLUDE CURRENT ROW', 'drops the row itself', [1]],
    ['EXCLUDE GROUP', 'drops the row and its peers', [1, 2]],
    ['EXCLUDE TIES', 'drops the peers, keeps the row', [2]],
  ] as const;
  return (
    <Svg label="EXCLUDE CURRENT ROW drops the row, EXCLUDE GROUP drops the row and its peers, EXCLUDE TIES drops the peers but keeps the row" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.6 + i * 1.1));
        const x = easeOut(seg(t, 0.7 + i * 1.1, 1.1 + i * 1.1));
        const y = 20 + i * 84;
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={y + 22} s={15} f={C.caramel} w={700}>
              {r[0]}
            </T>
            <T x={25} y={y + 68} s={13} f={C.latte}>
              {r[1]}
            </T>
            <rect x={334} y={y} width={240} height={56} rx={10} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="5 4" />
            {AMT.map((a, j) => {
              const out = (r[2] as readonly number[]).includes(j);
              return (
                <g key={j} opacity={out ? 1 - 0.65 * x : 1}>
                  <rect x={342 + j * 58} y={y + 10} width={50} height={36} rx={6} fill={C.cocoa} stroke={j === 1 ? C.caramel : TS[j] === 't2' ? C.cherryText : C.mocha} strokeWidth={j === 1 ? 2 : 1} />
                  <T x={367 + j * 58} y={y + 33} s={13} f={C.crema} a="middle">
                    {String(a)}
                  </T>
                  {out && <line x1={346 + j * 58} y1={y + 42} x2={346 + j * 58 + 42 * x} y2={y + 42 - 28 * x} stroke={C.cherryText} strokeWidth={2.5} />}
                </g>
              );
            })}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Named windows: the definition types out once; two calls appear and each draws a line back to it.
export function Named({ t }: StepCtx) {
  const def = 'WINDOW w AS (PARTITION BY … ROWS …)';
  const n = Math.round(def.length * seg(t, 0.2, 1.2));
  const b1 = easeOut(seg(t, 1.4, 1.7));
  const b2 = easeOut(seg(t, 1.8, 2.1));
  const l1 = easeInOut(seg(t, 1.7, 2.2));
  const l2 = easeInOut(seg(t, 2.1, 2.6));
  return (
    <Svg label="A named window is defined once and every call refers to it by name" h={260}>
      <T x={25} y={44} s={15} f={C.caramel} w={700}>
        {def.slice(0, n)}
      </T>
      <T x={25} y={110} s={15} f={C.crema} o={b1}>
        SUM(amount) OVER w
      </T>
      <T x={25} y={150} s={15} f={C.crema} o={b2}>
        COUNT(*) OVER w
      </T>
      <path d="M250 104 C 300 104 300 56 100 56" fill="none" stroke={C.caramel} strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - l1} />
      <path d="M230 144 C 340 144 340 56 100 56" fill="none" stroke={C.caramel} strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - l2} />
      <T x={25} y={214} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>
        extending w: refused if w has a frame
      </T>
    </Svg>
  );
}

// 10 · No nesting: the inner SUM() OVER rises into RANK()'s slot and is thrown back; then the staged version, a CTE feeding a column up.
export function NoNesting({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const rise = easeInOut(seg(t, 0.5, 1.0)) - easeOut(seg(t, 1.3, 1.7));
  const hit = seg(t, 1.0, 1.1) - seg(t, 1.9, 2.1);
  const shake = hit > 0 && t < 1.3 ? Math.sin(t * 70) * 4 : 0;
  const b = easeOut(seg(t, 2.0, 2.4));
  const up = seg(t, 2.6, 3.4);
  const c = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="A window call inside another window call is refused; staging the inner one in a CTE and ranking its column works" h={300}>
      <g transform={`translate(${shake} 0)`} opacity={a}>
        <rect x={25} y={40} width={250} height={80} rx={8} fill={C.cocoa} stroke={hit > 0 ? C.cherryText : C.mocha} strokeWidth={2} />
        <T x={150} y={64} s={13} f={C.crema} a="middle">
          RANK() OVER ( … )
        </T>
        <rect x={90} y={80} width={120} height={30} rx={6} fill="none" stroke={C.taupe} strokeDasharray="4 4" />
      </g>
      <g opacity={a}>
        <rect x={90} y={lerp(170, 80, rise)} width={120} height={30} rx={6} fill={C.roast} stroke={C.cherryText} strokeWidth={1.5} />
        <T x={150} y={lerp(190, 100, rise)} s={13} f={C.crema} a="middle">
          SUM() OVER
        </T>
      </g>
      <T x={150} y={250} s={13} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 1.2, 1.5))}>
        cannot be nested
      </T>
      <g opacity={b}>
        <rect x={320} y={40} width={250} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={445} y={70} s={13} f={C.crema} a="middle">
          outer: RANK()
        </T>
        <line x1={445} y1={150} x2={445} y2={90} stroke={C.caramel} strokeWidth={2} />
        {up > 0 && up < 1 && <circle cx={445} cy={lerp(150, 92, up)} r={6} fill={C.caramel} />}
        <rect x={320} y={150} width={250} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={445} y={180} s={13} f={C.crema} a="middle">
          CTE: SUM() OVER …
        </T>
      </g>
      <T x={445} y={250} s={13} f={C.caramel} a="middle" o={c}>
        reads it as a column
      </T>
    </Svg>
  );
}

// 11 · Predict: two window boxes with a gap. After the answer a CTE boundary drops between them and the value crosses it.
export function StagePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const wall = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const go = answered ? seg(s, 0.9, 1.7) : 0;
  const tick = answered ? easeOut(seg(s, 1.7, 2.1)) : 0;
  return (
    <Svg label="Rank a running total by staging it: compute it in a CTE, then rank that column in the outer query" h={260}>
      <rect x={30} y={60} width={220} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={140} y={90} s={13} f={C.crema} a="middle">
        running total (window)
      </T>
      <rect x={330} y={60} width={220} height={50} rx={8} fill={C.cocoa} stroke={tick > 0 ? C.caramel : C.mocha} strokeWidth={tick > 0 ? 2 : 1} />
      <T x={440} y={90} s={13} f={C.crema} a="middle">
        RANK() (window)
      </T>
      {!answered ? (
        <T x={290} y={96} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <line x1={290} y1={lerp(40, 60, wall)} x2={290} y2={lerp(40, 150, wall)} stroke={C.caramel} strokeWidth={3} opacity={wall} />
          <T x={290} y={180} s={13} f={C.caramel} a="middle" o={wall}>
            CTE boundary
          </T>
          {go > 0 && go < 1 && <circle cx={lerp(250, 330, go)} cy={85} r={6} fill={C.crema} />}
          <path d="M520 214 l8 8 l16 -18" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
        </>
      )}
    </Svg>
  );
}

// 12 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['ties possible', 'unique ORDER BY + ROWS'],
    ['shared definition', 'WINDOW w AS (…)'],
    ['window of a window', 'stage with a CTE'],
  ];
  return (
    <Svg label="Three habits for window frames: a unique order and ROWS when ties are possible, a named window for shared definitions, a CTE for a window of a window" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
        const bar = easeInOut(seg(t, i * 1.0 + 0.3, i * 1.0 + 0.9));
        const tick = easeOut(seg(t, i * 1.0 + 0.8, i * 1.0 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={20} f={C.caramel} w={700}>
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

export function ProveRows({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const tick = answered ? easeOut(seg(s, 0.5, 0.9)) : 0;
  return (
    <Svg label="ROWS is the frame mode that ignores ties" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        ignores ties →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(160, 140, k)} s={28} f={C.caramel} w={700} o={k}>
            ROWS
          </T>
          <rect x={40} y={152} width={110 * tick} height={3} fill={C.caramel} />
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
export function ProveDefault({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const grow = answered ? easeInOut(seg(s, 0.2, 0.8)) + easeInOut(seg(s, 1.0, 1.5)) : 0;
  return (
    <Svg label="With an ordering and no frame clause, the frame runs from the partition start to the last peer of the current row" h={240}>
      {AMT.map((_, i) => (
        <Card key={i} i={i} x={X(i)} cur={i === 1} peer={TS[i] === 't2'} />
      ))}
      {answered ? (
        <>
          <Frame a={0} b={grow} />
          <T x={300} y={196} s={14} f={C.caramel} a="middle" o={easeOut(seg(s, 1.5, 1.9))}>
            start → last peer
          </T>
        </>
      ) : (
        <T x={300} y={200} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
