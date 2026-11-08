import { useEffect, useState } from 'react';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Embedding pipelines at scale, drawn from examples.py and the cited benchmark: 400 tickets where content hashing
// re-embeds 1 and skips 399, the benchmark's method (sequence 512, batch 32, $2.49/hr) without its machine's number, a
// 50M-token backlog bound by a 1,000,000 TPM tier (3,000 s), a delete that needs a tombstone (ticket-5 → ticket-6),
// old and new vectors that cannot share an index (cosine −0.122), and a dual-index backfill serving 50 queries.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A box with a centred label. */
const Card = ({ x, y, w, h = 30, l, c = C.primary, o = 1, dash, s = 13 }: { x: number; y: number; w: number; h?: number; l: string; c?: string; o?: number; dash?: boolean; s?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.panel} stroke={c === C.primary ? C.line : c} strokeWidth={1.3} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={s} f={c} a="middle">
        {l}
      </T>
    </g>
  );

/** examples.py's 400 tickets as a 20 × 20 grid at (x, y); `lit(i)` picks each cell's colour. */
const Tickets = ({ x, y, cell = 9, lit }: { x: number; y: number; cell?: number; lit: (i: number) => string }) => (
  <g>
    {Array.from({ length: 400 }, (_, i) => (
      <rect key={i} x={x + (i % 20) * cell} y={y + Math.floor(i / 20) * cell} width={cell - 2} height={cell - 2} rx={1} fill={lit(i)} />
    ))}
  </g>
);

// examples.py: 400 one-chunk tickets, one edited (ticket index 137 here is just where the edit is drawn); the paper's
// method — sequence length 512, batch 32, $2.49/hr H100 spot; a 50M-token backlog against a 1,000,000 TPM API tier
// (50,000,000 ÷ 1,000,000 × 60 = 3,000 s); ticket-5 deleted, its nearest neighbour becomes ticket-6; old and new
// models' vectors for one chunk at cosine −0.122; 50 queries served by the old index during the backfill. This
// machine's own measured throughput is machine-dependent and is not shown.
const EDIT = 137;

// 0 · Three nights. Each night a sweep runs across all 400 tickets, lighting every one as it's re-embedded, closed
// ones included; beside the grid a bill bar grows a step taller each night.
export function Hook({ t }: StepCtx) {
  const night = Math.min(2, Math.floor(seg(t, 0.2, 2.6) * 3));
  const p = (seg(t, 0.2, 2.6) * 3) % 1;
  const sweep = Math.floor(Math.min(1, p * 1.3) * 400);
  return (
    <Svg label="every night, the whole ticket corpus gets re-embedded again, closed tickets included." h={220}>
      <Tickets x={25} y={20} lit={(i) => (i < sweep && t < 2.6 ? C.second : C.line)} />
      <T x={25} y={210} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        400 tickets, mostly closed
      </T>
      {[0, 1, 2].map((n) => {
        const k = n < night ? 1 : n === night ? Math.min(1, p * 1.3) : 0;
        return (
          <g key={n} opacity={k > 0 ? 1 : 0}>
            <rect x={300 + n * 90} y={190 - (50 + n * 30) * k} width={60} height={(50 + n * 30) * k} rx={3} fill={C.badText} opacity={0.75} />
            <T x={330 + n * 90} y={210} s={12} f={C.secondary} a="middle">
              {`night ${n + 1}`}
            </T>
          </g>
        );
      })}
      <T x={575} y={24} s={13} f={C.badText} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        the bill climbs
      </T>
    </Svg>
  );
}

// 1 · The 400-ticket grid, all lit as tonight's work, and two levers: "smaller model" and "hash chunks", each "?".
// After the answer the smaller-model lever is struck, and the grid goes dark except one cell — the edited ticket —
// 399 skipped, ✓.
export function PredictBillCut({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="what single change cuts the bill the most, without touching correctness?" h={220}>
      <Tickets x={25} y={20} lit={(i) => (i === EDIT ? C.focus : r > 0.5 ? C.band : C.second)} />
      {['smaller model', 'hash chunks'].map((l, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.3, 1.0 + i * 0.3));
        const lit = i === 1 && r > 0.5;
        return (
          <g key={l} opacity={k}>
            <Card x={300} y={40 + i * 60} w={200} l={l} c={lit ? C.focus : i === 0 && r > 0.5 ? C.quiet : C.primary} />
            {on ? (
              i === 0 ? (
                <Cross x={525} y={55} k={r} />
              ) : (
                <Tick x={520} y={115} k={r} />
              )
            ) : (
              <T x={520} y={60 + i * 60} s={14} f={C.focus}>
                ?
              </T>
            )}
          </g>
        );
      })}
      <T x={575} y={210} s={13} f={C.focus} a="end" w={600} o={on ? easeOut(seg(s, 0.8, 1.2)) : 0}>
        1 re-embedded, 399 skipped
      </T>
    </Svg>
  );
}

// 2 · A row of chunks, each with its stored hash tag ✓. A night's pass compares fresh hashes: every tag matches, ✓,
// skipped — until the edited one: its tag relights red, ≠, and only that chunk goes to the embedder. Then the count: 1 of
// 400 re-embedded, 400× fewer tokens.
export function RevealContentHashing({ t }: StepCtx) {
  const pass = seg(t, 0.8, 2.6);
  const n = 6;
  const ed = 3;
  const send = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="hash each chunk; compare to the hash stored at last embedding." h={220}>
      {Array.from({ length: n }, (_, i) => {
        const x = 25 + i * 92;
        const k = easeOut(seg(t, i * 0.08, 0.3 + i * 0.08));
        const checked = pass * n > i + 0.5;
        const bad = i === ed && checked;
        return (
          <g key={i} opacity={k}>
            <rect x={x} y={30} width={82} height={44} rx={4} fill={C.panel} stroke={bad ? C.badText : C.line} strokeWidth={1.3} />
            {[0, 1, 2].map((l) => (
              <rect key={l} x={x + 10} y={40 + l * 10} width={[60, 48, 54][l]} height={5} rx={1} fill={bad && l === 1 ? C.badText : C.secondary} opacity={0.6} />
            ))}
            <rect x={x + 16} y={84} width={50} height={20} rx={3} fill="none" stroke={bad ? C.badText : checked ? C.focus : C.line} strokeWidth={1.2} />
            <T x={x + 41} y={99} s={12} f={bad ? C.badText : C.secondary} a="middle">
              hash
            </T>
            {checked && !bad && <Tick x={x + 41} y={122} k={1} />}
            {bad && (
              <T x={x + 41} y={128} s={14} f={C.badText} a="middle">
                ≠
              </T>
            )}
          </g>
        );
      })}
      {send > 0 && <line x1={25 + ed * 92 + 41} y1={134} x2={25 + ed * 92 + 41} y2={lerp(134, 166, send)} stroke={C.badText} strokeWidth={2} />}
      <Card x={240} y={166} w={190} l="embed this one" c={C.badText} o={easeOut(seg(t, 3.0, 3.3))} />
      <T x={25} y={210} s={12} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        1 of 400 re-embedded
      </T>
      <T x={575} y={210} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        400× fewer tokens
      </T>
    </Svg>
  );
}

// 3 · The paper's method assembles as a recipe: sequence length 512, batch 32, $2.49/hr. Then the formula: cost per
// million tokens = rate ÷ (tokens/s × 3,600) × 1,000,000, with tokens/s marked "measured here, smaller machine". A
// stamp lands: read for the method, not the number. Each setting slides in with its value decoding.
export function RevealThroughputAndCost({ t }: StepCtx) {
  const R: [string, string][] = [
    ['sequence length', '512'],
    ['batch size', '32'],
    ['hardware rate', '$2.49/hr'],
  ];
  const stamp = easeOutBack(seg(t, 3.3, 3.7));
  return (
    <Svg label="a published benchmark's own method, reproduced small: fixed sequence length, fixed batch size, a stated hardware rate." h={220}>
      {/* the study's recipe, one fixed setting per line, each value decoding as its line slides in */}
      {R.map(([l, v], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4));
        return (
          <g key={l}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <T x={25} y={30 + i * 28} s={13} f={C.secondary}>
                {l}
              </T>
            </g>
            <Draw pts={[[200, 26 + i * 28], [290, 26 + i * 28]]} t={t} from={0.35 + i * 0.4} to={0.6 + i * 0.4} stroke={C.line} w={1} pen={false} />
            <Decode text={v} t={t} at={0.5 + i * 0.4} x={300} y={30 + i * 28} s={13} f={C.focus} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.8, 2.3))} transform={`translate(0 ${((1 - easeOut(seg(t, 1.8, 2.3))) * 14).toFixed(1)})`}>
        <T x={25} y={124} s={13} f={C.primary}>
          $ per M tokens =
        </T>
        <T x={25} y={146} s={13} f={C.primary}>
          rate ÷ (
          <tspan fill={C.second} textDecoration="underline">
            tokens/s
          </tspan>{' '}
          × 3,600) × 10⁶
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.5, 2.9))} transform={`translate(${((1 - easeOut(seg(t, 2.5, 2.9))) * -20).toFixed(1)} 0)`}>
        <T x={25} y={172} s={13} f={C.second}>
          tokens/s: measured here, smaller
        </T>
      </g>
      {stamp > 0 && (
        <g transform={`translate(175 200) scale(${lerp(1.6, 1, clamp(stamp, 0, 1.1)).toFixed(3)}) translate(-175 -200)`} opacity={clamp(stamp * 1.5)}>
          <rect x={25} y={186} width={300} height={28} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} />
          <T x={175} y={205} s={13} f={C.focus} a="middle">
            the method, not the number
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · One 50M-token backlog feeding two lanes. GPU: a wide pipe, the drain set by the hardware itself. API: a valve
// capped at 1,000,000 tokens a minute, the backlog draining at exactly that rate however much compute sits idle:
// 50,000,000 ÷ 1,000,000 = 50 min = 3,000 s.
export function RevealApiBoundCase({ t }: StepCtx) {
  const d1 = easeInOut(seg(t, 0.8, 1.8));
  const d2 = seg(t, 0.8, 3.6);
  const Lane = ({ y, label, w, dr, cap }: { y: number; label: string; w: number; dr: number; cap: string }) => (
    <g>
      <T x={25} y={y - 22} s={13} f={C.secondary}>
        {label}
      </T>
      <rect x={25} y={y - 10} width={160} height={30} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
      <rect x={25} y={y - 10} width={160 * (1 - dr)} height={30} rx={3} fill={C.second} opacity={0.6} />
      <rect x={185} y={y + 5 - w / 2} width={140} height={w} fill={C.band} stroke={C.line} strokeWidth={1} />
      {dr > 0 && dr < 1 && [0, 1, 2].map((j) => <circle key={j} cx={190 + ((dr * 600 + j * 66) % 135)} cy={y + 5} r={Math.min(4, w / 3)} fill={C.second} />)}
      <T x={575} y={y + 10} s={13} f={C.focus} a="end">
        {cap}
      </T>
    </g>
  );
  return (
    <Svg label="the identical backlog: compute-bound on a GPU, rate-limit-bound through an API tier." h={220}>
      <T x={25} y={20} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        the same 50M-token backlog
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <Lane y={70} label="own GPU" w={24} dr={d1} cap="set by the hardware" />
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <Lane y={160} label="API tier" w={6} dr={d2} cap="1,000,000 /min" />
      </g>
      <T x={575} y={210} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.4, 3.8))}>
        3,000 s, rate-limit-bound
      </T>
    </Svg>
  );
}

// 5 · A vector space of tickets; a query point with a line to its nearest neighbour, ticket-5. The source document is
// deleted; without a tombstone its vector would still answer. The vector is tombstoned — ✕ — and the query's line
// swings to the next nearest, ticket-6.
export function RevealDeleteTombstone({ t }: StepCtx) {
  const P: [number, number][] = [
    [120, 60],
    [190, 150],
    [260, 80],
    [340, 170],
    [420, 60],
    [300, 120],
    [365, 105],
    [480, 140],
  ];
  const q: [number, number] = [330, 92];
  const tomb = easeOut(seg(t, 2.0, 2.4));
  const swing = easeInOut(seg(t, 2.6, 3.2));
  const target: [number, number] = [lerp(P[5][0], P[6][0], swing), lerp(P[5][1], P[6][1], swing)];
  return (
    <Svg label="deleting the document must tombstone its vector, or the deleted record stays findable." h={220}>
      {P.map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, i * 0.06, 0.3 + i * 0.06))}>
          <circle cx={x} cy={y} r={5} fill={i === 5 ? (tomb > 0 ? C.badText : C.focus) : i === 6 ? C.primary : C.secondary} opacity={i === 5 ? 1 - 0.5 * tomb : 1} />
          {i === 5 && (
            <T x={x - 10} y={y + 22} s={12} f={tomb > 0 ? C.badText : C.focus} a="end">
              ticket-5
            </T>
          )}
          {i === 6 && (
            <T x={x + 12} y={y - 10} s={12} f={C.primary}>
              ticket-6
            </T>
          )}
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <rect x={q[0] - 6} y={q[1] - 6} width={12} height={12} fill="none" stroke={C.second} strokeWidth={1.8} />
        <T x={q[0]} y={q[1] - 14} s={12} f={C.second} a="middle">
          query
        </T>
        <line x1={q[0]} y1={q[1]} x2={target[0]} y2={target[1]} stroke={C.second} strokeWidth={1.6} />
      </g>
      <Cross x={P[5][0]} y={P[5][1]} k={tomb} />
      <T x={25} y={210} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.6))}>
        nearest: ticket-5
      </T>
      <T x={575} y={210} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        after delete: ticket-6
      </T>
    </Svg>
  );
}

// 6 · One chunk, sent to two models. Each returns an arrow; drawn in one frame they open to 97°, cosine −0.122 —
// pointing almost at right angles, in spaces that never lined up. Between them, struck: "compare".
export function RevealWhyNotInPlaceSwap({ t }: StepCtx) {
  const c = [300, 150];
  const L = 100;
  const a1 = -Math.PI / 2 + 0.85;
  const a2 = a1 - Math.acos(-0.122);
  const k1 = easeOut(seg(t, 0.8, 1.4));
  const k2 = easeOut(seg(t, 1.4, 2.0));
  const arc = easeOut(seg(t, 2.2, 2.8));
  const end = (a: number, k: number) => [c[0] + L * k * Math.cos(a), c[1] + L * k * Math.sin(a)];
  const [x1, y1] = end(a1, k1);
  const [x2, y2] = end(a2, k2);
  return (
    <Svg label="two different models' vectors for the identical chunk are not comparable." h={230}>
      <Card x={240} y={186} w={120} l="one chunk" o={easeOut(seg(t, 0, 0.4))} />
      <line x1={c[0]} y1={c[1]} x2={x1} y2={y1} stroke={C.focus} strokeWidth={2.2} />
      <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={C.second} strokeWidth={2.2} />
      <T x={c[0] + (L + 16) * Math.cos(a1)} y={c[1] + (L + 16) * Math.sin(a1)} s={12} f={C.focus} o={k1}>
        old model
      </T>
      <T x={c[0] + (L + 16) * Math.cos(a2)} y={c[1] + (L + 16) * Math.sin(a2) + 4} s={12} f={C.second} a="end" o={k2}>
        new model
      </T>
      {arc > 0 && (
        <path
          d={`M${c[0] + 40 * Math.cos(a2)} ${c[1] + 40 * Math.sin(a2)} A 40 40 0 0 1 ${c[0] + 40 * Math.cos(a2 + (a1 - a2) * arc)} ${c[1] + 40 * Math.sin(a2 + (a1 - a2) * arc)}`}
          fill="none"
          stroke={C.badText}
          strokeWidth={1.6}
        />
      )}
      <T x={575} y={30} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        cosine −0.122
      </T>
      <T x={575} y={56} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        not comparable
      </T>
    </Svg>
  );
}

// 7 · Queries stream into the old index and keep getting answered. Beside it a new index fills, partition by
// partition, for the whole corpus. Only when it's full does the routing arrow swing over: cut-over. 50 served
// throughout the build, none dropped.
export function RevealDualIndexBackfill({ t }: StepCtx) {
  const build = seg(t, 0.6, 3.0);
  const cut = easeInOut(seg(t, 3.2, 3.7));
  const qp = (t * 1.6) % 1;
  return (
    <Svg label="the old index keeps serving while the new index is built in full; then a cut-over." h={220}>
      <Card x={25} y={86} w={110} l="queries" o={easeOut(seg(t, 0, 0.3))} />
      <Card x={250} y={30} w={140} l="old index" c={cut > 0.5 ? C.quiet : C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <rect x={250} y={130} width={140} height={44} rx={5} fill={C.panel} stroke={cut > 0.5 ? C.focus : C.second} strokeWidth={1.3} strokeDasharray={build < 1 ? '4 3' : undefined} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={258 + i * 12.6} y={156} width={10} height={10} rx={1} fill={build * 10 > i ? C.second : C.band} />
        ))}
        <T x={320} y={150} s={12} f={C.second} a="middle">
          new index
        </T>
      </g>
      <path d={`M135 101 C 190 101, 200 ${lerp(45, 152, cut)}, 248 ${lerp(45, 152, cut)}`} fill="none" stroke={C.focus} strokeWidth={1.8} />
      {t < 3.2 && <circle cx={lerp(140, 245, qp)} cy={lerp(101, 46, qp)} r={4} fill={C.focus} />}
      <T x={575} y={50} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        50 served
      </T>
      <T x={575} y={157} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        full, then cut over
      </T>
    </Svg>
  );
}

// 8 · Four lanes draw in turn: a recipe card (method, not number); a hash tag ✓ beside a skipped chunk; a tombstoned
// vector ✕; two index boxes with an arrow that swings only after the second fills.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const ROWS = ['method, not number', 'hash to skip', 'tombstone deletes', 'build, then cut over'];
  return (
    <Svg label="hash to skip unchanged chunks. Tombstone what's deleted. Never swap models in place." h={270}>
      {ROWS.map((r, i) => {
        const y = 40 + i * 64;
        return (
          <g key={r} opacity={k(i)}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {r}
            </T>
            {i === 0 && <Card x={330} y={y - 14} w={150} h={28} l="512 · 32 · $/hr" s={12} />}
            {i === 1 && (
              <g>
                <rect x={330} y={y - 12} width={60} height={24} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} />
                <T x={360} y={y + 5} s={12} f={C.focus} a="middle">
                  hash
                </T>
                <Tick x={410} y={y} k={easeOut(seg(t, 1.3, 1.7))} />
              </g>
            )}
            {i === 2 && (
              <g>
                <circle cx={350} cy={y} r={6} fill={C.badText} opacity={0.5} />
                <Cross x={350} y={y} k={easeOut(seg(t, 2.3, 2.7))} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={330} y={y - 12} width={70} height={24} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
                <rect x={430} y={y - 12} width={70 * easeOut(seg(t, 3.1, 3.7))} height={24} rx={3} fill={C.second} opacity={0.5} />
                <rect x={430} y={y - 12} width={70} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.2} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Four chips: hashing, tombstones, dual index, and the rate-limit ceiling. A team's arrow moves from "API" to "own
// GPU". Before the answer each chip carries "?". After it the ceiling chip is struck — the only thing the move removes —
// and the other three keep a ✓: unchanged.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const CH = ['hashing', 'tombstones', 'dual index', 'rate limit'];
  return (
    <Svg label="a team moves from an API embedding service to a local GPU." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Card x={25} y={20} w={120} l="API" />
        <Card x={455} y={20} w={120} l="own GPU" c={C.focus} />
        <line x1={150} y1={35} x2={lerp(150, 450, easeInOut(seg(t, 0.4, 1.2)))} y2={35} stroke={C.focus} strokeWidth={1.6} />
      </g>
      {CH.map((c, i) => {
        const x = 25 + i * 140;
        const k = easeOut(seg(t, 1.0 + i * 0.2, 1.4 + i * 0.2));
        const gone = i === 3 && r > 0.5;
        return (
          <g key={c} opacity={k}>
            <Card x={x} y={100} w={130} l={c} c={gone ? C.badText : C.primary} dash={gone} />
            {on ? (
              i === 3 ? (
                <Cross x={x + 65} y={160} k={r} />
              ) : (
                <Tick x={x + 65} y={160} k={r} />
              )
            ) : (
              <T x={x + 65} y={166} s={14} f={C.focus} a="middle">
                ?
              </T>
            )}
          </g>
        );
      })}
      <T x={25} y={208} s={13} f={C.focus} w={600} o={on ? easeOut(seg(s, 0.8, 1.2)) : 0}>
        only the ceiling goes
      </T>
    </Svg>
  );
}
