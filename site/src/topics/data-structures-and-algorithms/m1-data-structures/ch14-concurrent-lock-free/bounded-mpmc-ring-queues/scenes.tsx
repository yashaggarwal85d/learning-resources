import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an ordinary cell or thread; latte = secondary labels (a counter, a lap number);
// taupe = a stalled or claimed-but-unpublished cell/thread; caramel = the thing to look at (a comparison result, a legal
// order); cinnamon (rare) = a second design (the Disruptor) beside the first; cherryText = the bad outcome (an empty
// result, no legal order, the unpadded counters' own cost).
// Every printed number is examples.py's: the capacity-four ring, sequence numbers starting [0, 1, 2, 3], then
// enqueue(a) [1, 1, 2, 3] and enqueue(b) [1, 2, 2, 3]; 10,000 straight dequeue attempts on the claimed slot, every one
// empty; the history enqueue(x) [0,1] then dequeue->empty [2,3] (no legal order) against dequeue->empty [1,2] inside
// enqueue(x) [0,3] (legal). The Disruptor paper's "most common cache-line being 64 bytes" is quoted. The false-sharing
// and throughput curves are machine-dependent (post-notes.md) and are drawn as shape only.

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

type Pt = [number, number];

/** One ring cell: a box with optional data inside; claimed (taupe, dashed) when a producer holds it unpublished. */
function Cell({ x, y, data, state = 'free', seq, glow = false, o = 1, w = 64 }: { x: number; y: number; data?: string; state?: 'free' | 'full' | 'claimed'; seq?: string; glow?: boolean; o?: number; w?: number }) {
  const stroke = state === 'claimed' ? C.taupe : glow ? C.caramel : C.crema;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={44} rx={4} fill={state === 'full' ? C.cocoa : 'none'} stroke={stroke} strokeWidth={glow ? 2.2 : 1.6} strokeDasharray={state === 'claimed' ? '5 4' : undefined} />
      {data && <T x={x + w / 2} y={y + 28} s={15} a="middle" f={glow ? C.caramel : C.crema}>{data}</T>}
      {state === 'claimed' && <T x={x + w / 2} y={y + 27} s={12} a="middle" f={C.taupe}>claimed</T>}
      {seq !== undefined && <T x={x + w / 2} y={y + 64} s={13} a="middle" f={C.latte}>{seq}</T>}
    </g>
  );
}

function Pointer({ x, y, label, c = C.caramel, o = 1, up = false }: { x: number; y: number; label: string; c?: string; o?: number; up?: boolean }) {
  return (
    <g opacity={o}>
      <path d={up ? `M${x - 7} ${y + 12} L${x + 7} ${y + 12} L${x} ${y} Z` : `M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 12} Z`} fill={c} />
      <T x={x} y={up ? y + 28 : y - 6} s={12} a="middle" f={c}>{label}</T>
    </g>
  );
}

function Tick({ x, y, ok, o = 1 }: { x: number; y: number; ok: boolean; o?: number }) {
  return ok ? (
    <path d={`M${x - 6} ${y} l4 5 l9 -11`} fill="none" stroke={C.caramel} strokeWidth={2.2} strokeLinecap="round" opacity={o} />
  ) : (
    <path d={`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`} fill="none" stroke={C.cherryText} strokeWidth={2.2} strokeLinecap="round" opacity={o} />
  );
}

// 1 · A ring, many producers, many consumers. Items stream from three producers through a ring of eight cells to three
// consumers. A lock closes over the ring and everyone queues behind it. The lock lifts: one compare-and-swap per
// operation, and the streams run again.
export function Hook({ t }: StepCtx) {
  const CX = 300;
  const CY = 140;
  const R = 54;
  const ring = easeOut(seg(t, 0.1, 0.6));
  const lock = easeOut(seg(t, 1.7, 2.1)) * (1 - easeOut(seg(t, 3.1, 3.5)));
  const cas = easeOut(seg(t, 3.3, 3.8));
  const flowing = t < 1.8 || t > 3.4;
  const waitN = clamp((t - 2.0) / 0.9, 0, 1) * 6;
  const cells = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * 2 * Math.PI - Math.PI / 2;
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)] as Pt;
  });
  const P: Pt[] = [[80, 80], [80, 140], [80, 200]];
  const Q: Pt[] = [[520, 80], [520, 140], [520, 200]];
  const dot = (from: Pt, to: Pt, ph: number, c: string, key: string) => {
    const k = ((t * 0.9 + ph) % 1 + 1) % 1;
    return <circle key={key} cx={lerp(from[0], to[0], k)} cy={lerp(from[1], to[1], k)} r={4} fill={c} opacity={Math.sin(k * Math.PI)} />;
  };
  return (
    <Svg label="Three producers feed a ring of eight cells and three consumers drain it. A lock closes over the ring and every thread waits behind it; then the lock lifts and one compare-and-swap per operation lets them all run" h={300}>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x - 13} y={y - 13} width={26} height={26} rx={3} fill="none" stroke={lock > 0.5 ? C.taupe : C.crema} strokeWidth={1.4} opacity={ring} />
      ))}
      {P.map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.7 + i * 0.1))}>
          <circle cx={x} cy={y} r={11} fill="none" stroke={C.crema} strokeWidth={1.5} />
          <T x={x - 20} y={y + 4} s={12} a="end" f={C.latte}>P{i + 1}</T>
          {flowing && dot([x + 12, y], [CX - R - 14, CY], i * 0.33, C.crema, `p${i}`)}
        </g>
      ))}
      {Q.map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.9 + i * 0.1))}>
          <circle cx={x} cy={y} r={11} fill="none" stroke={C.crema} strokeWidth={1.5} />
          <T x={x + 20} y={y + 4} s={12} f={C.latte}>C{i + 1}</T>
          {flowing && dot([CX + R + 14, CY], [x - 12, y], i * 0.33 + 0.15, C.crema, `c${i}`)}
        </g>
      ))}
      <g opacity={lock}>
        <circle cx={CX} cy={CY} r={R + 22} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <path d={`M${CX - 8} ${CY - 2} v-8 a8 8 0 0 1 16 0 v8`} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <rect x={CX - 12} y={CY - 2} width={24} height={17} rx={3} fill={C.cherryText} />
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={(i < 3 ? 190 - (i % 3) * 16 : 410 + (i % 3) * 16)} cy={CY + 54 + (i < 3 ? 0 : 0)} r={5} fill={C.cherryText} opacity={clamp(waitN - i, 0, 1)} />
        ))}
      </g>
      {t >= 1.7 && t < 3.3 && <T x={300} y={262} s={13} a="middle" f={C.cherryText} o={lock}>one lock: everyone waits on it</T>}
      {t >= 3.3 && <T x={300} y={262} s={13} a="middle" f={C.caramel} o={cas}>one compare-and-swap per operation</T>}
      {t < 1.7 && <T x={300} y={262} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>many producers, many consumers</T>}
    </Svg>
  );
}

// 2 · Predict. Producer A claims cell 0 and stalls (dashed, grey); producer B claims cell 1 and publishes x there; the
// consumer's pointer sits on cell 0. After answering: it looks at cell 0 only, and gets empty, though x waits next door.
export function StalledHandoffPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X = (i: number) => 120 + i * 96;
  const a = easeOut(seg(t, 0.1, 0.4));
  const aClaim = easeOut(seg(t, 0.4, 0.8));
  const bClaim = easeOut(seg(t, 0.8, 1.2));
  const cons = easeOut(seg(t, 1.2, 1.6));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const look = answered ? easeInOut(seg(s, 0.2, 0.7)) : 0;
  const empty = answered ? easeOut(seg(s, 0.7, 1.0)) : 0;
  return (
    <Svg label="Producer A claims cell 0 and stalls before writing; producer B claims cell 1 and publishes x; the consumer points at cell 0. After answering: it reads cell 0 and gets empty, though x is waiting in cell 1" h={300}>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={X(i)} y={110} o={a} state={i === 0 && aClaim > 0.5 ? 'claimed' : i === 1 && bClaim > 0.5 ? 'full' : 'free'} data={i === 1 && bClaim > 0.5 ? 'x' : undefined} glow={i === 1 && empty > 0.5} />
      ))}
      <g opacity={aClaim}>
        <T x={X(0) + 32} y={62} s={12} a="middle" f={C.taupe}>A: claimed, stalled</T>
        <line x1={X(0) + 32} y1={68} x2={X(0) + 32} y2={104} stroke={C.taupe} strokeWidth={1.4} strokeDasharray="3 3" />
      </g>
      <g opacity={bClaim}>
        <T x={X(1) + 50} y={86} s={12} a="middle" f={C.crema}>B: published x</T>
        <line x1={X(1) + 32} y1={92} x2={X(1) + 32} y2={104} stroke={C.crema} strokeWidth={1.4} />
      </g>
      <Pointer x={X(0) + 32} y={164} label="consumer" up o={cons} />
      {answered && (
        <path d={`M${X(0) + 32} 156 Q${X(0) + 60} 186 ${X(0) + 32} 158`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={look} />
      )}
      {answered && <T x={X(0) + 32} y={230} s={13} a="middle" f={C.cherryText} o={empty}>empty</T>}
      {!answered && <T x={300} y={268} s={14} a="middle" f={C.caramel} o={pulse * cons}>what does the consumer get?</T>}
      {answered && <T x={300} y={268} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.1, 1.5))}>empty, though x waits next door</T>}
    </Svg>
  );
}

// 3 · Empty, not the message, not a wait. The consumer asks again and again; every look lands on cell 0 and returns
// empty, a red mark each time. A look-ahead to cell 1 is drawn and struck out: it never looks there. 10,000 attempts.
export function EmptyNotMessage({ t }: StepCtx) {
  const X = (i: number) => 120 + i * 96;
  const n = clamp((t - 0.3) / 2.6, 0, 1) * 24;
  const ahead = easeInOut(seg(t, 1.2, 1.7));
  const strike = easeOut(seg(t, 1.8, 2.1));
  const num = easeOut(seg(t, 3.1, 3.6));
  return (
    <Svg label="The consumer reads cell 0 again and again and gets empty every time, while x sits in cell 1; it never looks ahead. Measured: 10,000 straight attempts, every one empty" h={300}>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={X(i)} y={60} state={i === 0 ? 'claimed' : i === 1 ? 'full' : 'free'} data={i === 1 ? 'x' : undefined} />
      ))}
      <Pointer x={X(0) + 32} y={112} label="consumer" up />
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1={60 + i * 20} y1={190} x2={60 + i * 20} y2={206} stroke={C.cherryText} strokeWidth={2} opacity={clamp(n - i, 0, 1)} />
      ))}
      <T x={60} y={226} s={12} f={C.cherryText} o={clamp(n / 3, 0, 1)}>empty, empty, empty…</T>
      <Draw pts={[[X(0) + 50, 128], [X(1) + 32, 128], [X(1) + 32, 110]]} t={t} from={1.2} to={1.7} stroke={C.latte} w={1.4} dash="4 3" />
      <g opacity={strike * ahead}>
        <Tick x={X(1) - 6} y={128} ok={false} />
        <T x={X(1) + 50} y={150} s={12} f={C.latte}>never looks ahead</T>
      </g>
      <T x={300} y={268} s={14} a="middle" f={C.caramel} o={num}>10,000 attempts, every one empty</T>
    </Svg>
  );
}

// 4 · The ring, two counters, and a lap number. Four cells; each gets its own number, equal to its position: 0, 1, 2, 3.
// Two counters appear (next to enqueue, next to dequeue). Then enqueue(a): a lands in cell 0 and its number becomes 1
// ([1, 1, 2, 3]); enqueue(b): cell 1 becomes 2 ([1, 2, 2, 3]).
export function RingAndCounters({ t }: StepCtx) {
  const X = (i: number) => 120 + i * 96;
  const cells = easeOut(seg(t, 0.1, 0.5));
  const ctr = easeOut(seg(t, 1.3, 1.8));
  const ea = easeInOut(seg(t, 2.2, 2.8));
  const eb = easeInOut(seg(t, 3.1, 3.7));
  const seqs = [ea > 0.5 ? '1' : '0', eb > 0.5 ? '2' : '1', '2', '3'];
  const enqAt = ea < 0.5 ? 0 : eb < 0.5 ? 1 : 2;
  const enqX = lerp(X(enqAt === 0 ? 0 : enqAt - 1), X(enqAt), enqAt === 0 ? 1 : enqAt === 1 ? ea : eb) + 32;
  return (
    <Svg label="Four cells, each numbered with its own position: 0, 1, 2, 3; two counters for the next enqueue and dequeue. enqueue(a) puts a in cell 0 and its number becomes 1; enqueue(b) puts b in cell 1 and its number becomes 2" h={300}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Cell x={X(i)} y={80} o={cells} state={(i === 0 && ea > 0.5) || (i === 1 && eb > 0.5) ? 'full' : 'free'} data={i === 0 && ea > 0.5 ? 'a' : i === 1 && eb > 0.5 ? 'b' : undefined} />
          <T x={X(i) + 32} y={146} s={14} a="middle" f={(i === 0 && ea > 0.3 && ea < 1) || (i === 1 && eb > 0.3 && eb < 1) ? C.caramel : C.crema} o={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))}>{seqs[i]}</T>
          <T x={X(i) + 32} y={74} s={12} a="middle" f={C.taupe} o={cells}>cell {i}</T>
        </g>
      ))}
      <T x={30} y={146} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>number</T>
      <Pointer x={enqX} y={168} label="next enqueue" up o={ctr} />
      <Pointer x={X(0) + 32} y={36} label="next dequeue" c={C.latte} o={ctr} />
      {ea > 0 && ea < 1 && <T x={lerp(40, X(0) + 32, ea)} y={110} s={15} a="middle" f={C.caramel}>a</T>}
      {eb > 0 && eb < 1 && <T x={lerp(40, X(1) + 32, eb)} y={110} s={15} a="middle" f={C.caramel}>b</T>}
      <T x={300} y={248} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 0.9, 1.3)) * (1 - easeOut(seg(t, 2.0, 2.2)))}>{t < 2.1 ? 'each number starts at its own position' : ''}</T>
      {t >= 2.1 && <T x={300} y={248} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.7, 4.1))}>[1, 2, 2, 3]: whose turn, per cell</T>}
    </Svg>
  );
}

// 5 · Equal, less, greater. A thread's position sits fixed on a line; the cell's number slides in three times. Equal:
// free now, take it. Less: still holding the last lap (full for a writer, taken for a reader). Greater: someone already
// claimed this turn, check again. Each case lights its own row.
export function ThreeComparisons({ t }: StepCtx) {
  const AX = 200;
  const U = 70;
  const cases: { off: number; name: string; why: string; c: string; t0: number }[] = [
    { off: 0, name: 'equal', why: 'free now: take it', c: C.caramel, t0: 0.4 },
    { off: -1, name: 'less', why: 'last lap still here', c: C.cherryText, t0: 1.7 },
    { off: 1, name: 'greater', why: 'turn already taken', c: C.cinnamon, t0: 3.0 },
  ];
  const now = t < 1.6 ? 0 : t < 2.9 ? 1 : 2;
  const cur = cases[now];
  const slide = easeInOut(seg(t, cur.t0, cur.t0 + 0.5));
  return (
    <Svg label="A thread's position fixed on a line and a cell's number sliding in three times: equal means free now, less means the last lap is still there, greater means another thread already took this turn" h={320}>
      <line x1={60} y1={90} x2={540} y2={90} stroke={C.mocha} strokeWidth={1.2} />
      <Pointer x={AX + U} y={98} label="position" up c={C.crema} />
      <circle cx={lerp(560, AX + U + cur.off * U, slide)} cy={90} r={8} fill={cur.c} />
      <T x={lerp(560, AX + U + cur.off * U, slide)} y={72} s={12} a="middle" f={cur.c} o={slide}>number</T>
      {cases.map((k, i) => {
        const on = easeOut(seg(t, k.t0 + 0.4, k.t0 + 0.8));
        const y = 180 + i * 42;
        return (
          <g key={k.name} opacity={on}>
            <rect x={60} y={y - 20} width={480} height={32} rx={4} fill="none" stroke={now === i ? k.c : C.mocha} strokeWidth={now === i ? 1.8 : 1} />
            <T x={76} y={y + 1} s={13} f={k.c}>{k.name}</T>
            <T x={200} y={y + 1} s={13} f={C.crema}>{k.why}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Predict. Cell 0 claimed and stalled; a clock spins; the consumer waits on it. After answering: the clock keeps
// spinning, nothing in the ring changes, the cell stays claimed: no recovery from inside.
export function RecoversOnItsOwnPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X = (i: number) => 120 + i * 96;
  const a = easeOut(seg(t, 0.1, 0.5));
  const spin = (answered ? 1.8 + s : t) * 2.4;
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const lock = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="Cell 0 stays claimed by a stalled producer while a clock spins and the consumer waits on it; after answering, time keeps passing and nothing changes: the ring cannot recover by itself" h={300}>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={X(i)} y={90} o={a} state={i === 0 ? 'claimed' : i === 1 ? 'full' : 'free'} data={i === 1 ? 'x' : undefined} />
      ))}
      <Pointer x={X(0) + 32} y={142} label="consumer" up o={a} />
      <g opacity={a}>
        <circle cx={480} cy={46} r={18} fill="none" stroke={C.latte} strokeWidth={1.4} />
        <line x1={480} y1={46} x2={480 + 13 * Math.sin(spin)} y2={46 - 13 * Math.cos(spin)} stroke={C.caramel} strokeWidth={2} />
        <line x1={480} y1={46} x2={480 + 8 * Math.sin(spin / 12)} y2={46 - 8 * Math.cos(spin / 12)} stroke={C.latte} strokeWidth={2} />
      </g>
      <T x={X(0) + 32} y={70} s={12} a="middle" f={C.taupe} o={a}>stalled for good</T>
      {answered && (
        <g opacity={lock}>
          <rect x={X(0) - 6} y={84} width={76} height={56} rx={5} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
          <T x={X(0) + 32} y={214} s={12} a="middle" f={C.cherryText}>still waiting</T>
        </g>
      )}
      {!answered && <T x={300} y={262} s={14} a="middle" f={C.caramel} o={pulse * a}>does it ever recover by itself?</T>}
      {answered && <T x={300} y={262} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.0, 1.4))}>no: nothing inside can notice</T>}
    </Svg>
  );
}

// 7 · One compare-and-swap, still blocking. The 10,000 attempts fill a strip, every one empty. The four-rung ladder
// appears; a "no lock" badge marks this queue, which drops onto the bottom rung: blocking.
export function StillBlocking({ t }: StepCtx) {
  const fill = clamp((t - 0.2) / 1.3, 0, 1);
  const RUNGS = ['blocking', 'obstruction-free', 'lock-free', 'wait-free'];
  const drop = easeOutBack(seg(t, 3.0, 3.6));
  const end = easeOut(seg(t, 4.0, 4.5));
  return (
    <Svg label="10,000 straight dequeue attempts fill a strip, every one empty. On the four-rung progress ladder, this queue, with no lock anywhere, lands on the bottom rung: blocking" h={330}>
      <rect x={60} y={24} width={360} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      <rect x={60} y={24} width={360 * fill} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
      <T x={430} y={36} s={12} f={C.cherryText} o={fill >= 1 ? 1 : 0}>10,000 empty</T>
      {RUNGS.map((r, i) => {
        const y = 270 - i * 44;
        return (
          <g key={r} opacity={easeOut(seg(t, 1.6 + i * 0.2, 1.9 + i * 0.2))}>
            <rect x={60} y={y - 18} width={260} height={30} rx={4} fill={i === 0 && drop > 0.9 ? C.cocoa : 'none'} stroke={i === 0 && drop > 0.9 ? C.cherryText : C.crema} strokeWidth={1.3} />
            <T x={74} y={y + 2} s={13} f={i === 0 && drop > 0.9 ? C.cherryText : C.crema}>{r}</T>
          </g>
        );
      })}
      <g transform={`translate(0 ${lerp(-150, 0, clamp(drop, 0, 1.1))})`} opacity={easeOut(seg(t, 2.6, 3.0))}>
        <rect x={350} y={252} width={200} height={30} rx={15} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={450} y={272} s={12} a="middle" f={C.caramel}>this queue: no lock</T>
      </g>
      <T x={300} y={318} s={13} a="middle" f={C.cherryText} o={end}>no lock, still blocking</T>
    </Svg>
  );
}

// 8 · Checked against the definition. Top: enqueue(x) over [0,1], then dequeue->empty over [2,3]: the checker tries both
// orders; neither is legal: rejected. Bottom: dequeue->empty over [1,2] inside enqueue(x) over [0,3]: dequeue first is
// legal and respects real time: accepted.
export function CheckedHistory({ t }: StepCtx) {
  const X = (tm: number) => 110 + tm * 80;
  const h1 = easeOut(seg(t, 0.1, 0.6));
  const try1 = easeOut(seg(t, 0.8, 1.2));
  const try2 = easeOut(seg(t, 1.3, 1.7));
  const rej = easeOut(seg(t, 1.9, 2.3));
  const h2 = easeOut(seg(t, 2.6, 3.1));
  const pts = easeOutBack(seg(t, 3.2, 3.7));
  const acc = easeOut(seg(t, 3.9, 4.3));
  const iv = (s0: number, e: number, y: number, lab: string, c: string) => (
    <g>
      <rect x={X(s0)} y={y - 9} width={X(e) - X(s0)} height={18} rx={3} fill="none" stroke={c} strokeWidth={1.4} />
      <T x={(X(s0) + X(e)) / 2} y={y - 14} s={12} a="middle" f={c}>{lab}</T>
    </g>
  );
  return (
    <Svg label="Checked: enqueue x finishing before a dequeue that returns empty has no legal order and is rejected; the same dequeue overlapping the enqueue has a legal order, dequeue first, and is accepted" h={330}>
      <g opacity={h1}>
        <T x={30} y={26} s={12} f={C.latte}>enqueue done, then empty</T>
        <line x1={70} y1={64} x2={380} y2={64} stroke={C.mocha} />
        <line x1={70} y1={104} x2={380} y2={104} stroke={C.mocha} />
        {iv(0, 1, 64, 'enq x', C.crema)}
        {iv(2, 3, 104, 'deq→empty', rej > 0.5 ? C.cherryText : C.crema)}
      </g>
      <g opacity={try1}>
        <Tick x={400} y={60} ok={false} />
        <T x={412} y={64} s={12} f={C.latte}>enq first: gets x</T>
      </g>
      <g opacity={try2}>
        <Tick x={400} y={100} ok={false} />
        <T x={412} y={104} s={12} f={C.latte}>deq first: illegal</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.cherryText} o={rej}>no legal order: rejected</T>
      <line x1={30} y1={162} x2={570} y2={162} stroke={C.mocha} opacity={h2} />
      <g opacity={h2}>
        <T x={30} y={188} s={12} f={C.latte}>empty while the enqueue runs</T>
        <line x1={70} y1={226} x2={380} y2={226} stroke={C.mocha} />
        <line x1={70} y1={266} x2={380} y2={266} stroke={C.mocha} />
        {iv(0, 3, 226, 'enq x', C.crema)}
        {iv(1, 2, 266, 'deq→empty', C.crema)}
      </g>
      <circle cx={X(1.5)} cy={266} r={5} fill={C.caramel} opacity={clamp(pts, 0, 1)} />
      <circle cx={X(2.5)} cy={226} r={5} fill={C.caramel} opacity={clamp(pts, 0, 1)} />
      <g opacity={acc}>
        <Tick x={400} y={244} ok />
        <T x={412} y={248} s={12} f={C.caramel}>deq, then enq</T>
      </g>
      <T x={300} y={312} s={13} a="middle" f={C.caramel} o={acc}>legal order found: accepted</T>
    </Svg>
  );
}

// 9 · Predict. The Disruptor's split: Sequence (where a producer is), Sequencer (coordinates producers), Sequence Barrier
// (what's safe for a consumer). A producer claims a slot; the publish arrow is still missing. After answering: it never
// comes, and the consumers behind the barrier stall: "unable to recover without a restart".
export function ClaimThenPublishPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const claim = easeInOut(seg(t, 0.6, 1.1));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const stall = answered ? easeOut(seg(s, 0.4, 0.9)) : 0;
  const boxes: [string, number][] = [
    ['Sequence', 40],
    ['Sequencer', 220],
    ['Sequence Barrier', 400],
  ];
  return (
    <Svg label="The Disruptor splits the job: Sequence, Sequencer and Sequence Barrier; a producer claims a slot, then must publish it. After answering: the publish never comes and every dependent consumer behind the barrier stalls, unable to recover without a restart" h={300}>
      {boxes.map(([name, x]) => (
        <g key={name} opacity={a}>
          <rect x={x} y={30} width={168} height={32} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.5} />
          <T x={x + 84} y={51} s={12} a="middle" f={C.cinnamon}>{name}</T>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={140 + i * 66} y={110} width={56} height={36} rx={4} fill={i < 2 ? C.cocoa : 'none'} stroke={i === 2 && claim > 0.5 ? C.taupe : C.crema} strokeWidth={1.4} strokeDasharray={i === 2 && claim > 0.5 ? '5 4' : undefined} opacity={a} />
      ))}
      <Draw pts={[[60, 96], [140 + 2 * 66 + 28, 96], [140 + 2 * 66 + 28, 106]]} t={t} from={0.6} to={1.1} stroke={C.crema} w={1.6} />
      <T x={60} y={88} s={12} f={C.crema} o={claim}>1 claim</T>
      <path d={`M${140 + 2 * 66 + 28} 150 L${140 + 2 * 66 + 28} 176`} stroke={answered ? C.cherryText : C.latte} strokeWidth={1.6} strokeDasharray="3 3" opacity={claim} />
      <T x={140 + 2 * 66 + 28} y={194} s={12} a="middle" f={answered ? C.cherryText : C.latte} o={claim}>2 publish {answered ? 'never comes' : '?'}</T>
      {answered && (
        <g opacity={stall}>
          {[0, 1].map((i) => (
            <g key={i}>
              <circle cx={500 + i * 30} cy={128} r={9} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
            </g>
          ))}
          <T x={515} y={160} s={12} a="middle" f={C.cherryText}>stalled</T>
        </g>
      )}
      {!answered && <T x={300} y={258} s={14} a="middle" f={C.caramel} o={pulse * a}>fixed, or just moved?</T>}
      {answered && <T x={300} y={258} s={12} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.0, 1.4))}>"unable to recover without a restart"</T>}
    </Svg>
  );
}

// 10 · Same lap counter, different place. Left: Vyukov's number lives inside each cell. Right: the Disruptor's
// Sequence sits beside the ring. Both counters get padding either side (a 64-byte cache line, the paper's "most common").
// Then the same stall in both: a claimed, unpublished slot, and the consumer is the one who waits.
export function SameLapCounter({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.1, 0.7));
  const r = easeOut(seg(t, 0.8, 1.4));
  const pad = easeInOut(seg(t, 2.0, 2.8));
  const stall = easeOut(seg(t, 3.4, 3.9));
  const who = easeOut(seg(t, 4.2, 4.6));
  return (
    <Svg label="Vyukov's turn number lives inside each cell; the Disruptor's Sequence sits beside its ring. Both pad their counters onto their own 64-byte cache lines. Both stall the same way: a claimed, unpublished slot makes the consumer wait" h={320}>
      <g opacity={l}>
        <T x={150} y={28} s={13} a="middle" f={C.crema}>number in the cell</T>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={50 + i * 52} y={50} width={46} height={40} rx={4} fill="none" stroke={i === 1 && stall > 0.5 ? C.taupe : C.crema} strokeWidth={1.4} strokeDasharray={i === 1 && stall > 0.5 ? '4 3' : undefined} />
            <rect x={58 + i * 52} y={76} width={30} height={9} rx={2} fill={C.latte} />
          </g>
        ))}
      </g>
      <g opacity={r}>
        <T x={450} y={28} s={13} a="middle" f={C.cinnamon}>Sequence beside it</T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={350 + i * 52} y={50} width={46} height={40} rx={4} fill="none" stroke={i === 1 && stall > 0.5 ? C.taupe : C.crema} strokeWidth={1.4} strokeDasharray={i === 1 && stall > 0.5 ? '4 3' : undefined} />
        ))}
        <rect x={420} y={110} width={60} height={22} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
      </g>
      {/* padding either side of each shared counter */}
      <g opacity={pad}>
        {[[90, 110], [420, 110]].map(([x, y], j) => (
          <g key={j}>
            <rect x={x - lerp(0, 60, pad)} y={y} width={lerp(0, 56, pad)} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeDasharray="3 3" />
            <rect x={x + 64} y={y} width={lerp(0, 56, pad)} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeDasharray="3 3" />
          </g>
        ))}
        <rect x={90} y={110} width={60} height={22} rx={3} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={300} y={162} s={12} a="middle" f={C.latte}>counters padded: "most common… 64 bytes"</T>
      </g>
      <g opacity={stall}>
        {[150, 450].map((x) => (
          <g key={x}>
            <circle cx={x} cy={214} r={10} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
            <T x={x} y={244} s={12} a="middle" f={C.cherryText}>consumer waits</T>
          </g>
        ))}
      </g>
      <T x={300} y={296} s={13} a="middle" f={C.caramel} o={who}>same stall: only who waits is decided</T>
    </Svg>
  );
}

// 11 · False sharing, measured. Two counters in one cache line, each bumped by its own core: every write invalidates the
// other core's copy (red flashes back and forth). Padded onto separate lines, the flashes stop. Time-to-finish bars as
// shape: unpadded long, padded short (the machine's own numbers live in post-notes.md).
export function FalseSharingMeasured({ t }: StepCtx) {
  const top = easeOut(seg(t, 0.1, 0.5));
  const ping = t > 0.6 && t < 2.2 ? Math.floor((t - 0.6) / 0.2) % 2 : -1;
  const bot = easeOut(seg(t, 2.1, 2.6));
  const bars = easeOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="Two counters on one cache line, each written by its own core, invalidate each other's copy on every write; padded onto separate lines, the invalidations stop. Unpadded finishes far behind padded" h={320}>
      <g opacity={top}>
        <T x={30} y={30} s={12} f={C.latte}>one cache line</T>
        <rect x={180} y={40} width={240} height={34} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <rect x={190} y={47} width={50} height={20} rx={2} fill={ping === 0 ? C.cherryText : C.crema} />
        <rect x={250} y={47} width={50} height={20} rx={2} fill={ping === 1 ? C.cherryText : C.cinnamon} />
        <T x={120} y={62} s={12} a="middle" f={C.crema}>core 1</T>
        <T x={480} y={62} s={12} a="middle" f={C.cinnamon}>core 2</T>
        {ping >= 0 && <path d={ping === 0 ? 'M420 57 L452 57' : 'M180 57 L148 57'} stroke={C.cherryText} strokeWidth={2} />}
      </g>
      <T x={300} y={96} s={12} a="middle" f={C.cherryText} o={top * (t < 2.4 ? 1 : 0.5)}>each write throws out the other's copy</T>
      <g opacity={bot}>
        <T x={30} y={130} s={12} f={C.latte}>padded apart</T>
        <rect x={120} y={140} width={150} height={34} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <rect x={330} y={140} width={150} height={34} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <rect x={130} y={147} width={50} height={20} rx={2} fill={C.crema} />
        <rect x={340} y={147} width={50} height={20} rx={2} fill={C.cinnamon} />
      </g>
      <g opacity={bars}>
        <T x={30} y={226} s={12} f={C.cherryText}>unpadded</T>
        <rect x={130} y={214} width={400 * bars} height={16} rx={2} fill={C.cherryText} opacity={0.8} />
        <T x={30} y={258} s={12} f={C.caramel}>padded</T>
        <rect x={130} y={246} width={90 * easeOut(seg(t, 3.4, 3.9))} height={16} rx={2} fill={C.caramel} />
        <T x={300} y={296} s={12} a="middle" f={C.latte}>time to finish, this machine (shape)</T>
      </g>
    </Svg>
  );
}

// 12 · Recap. A ring cell row with its turn numbers and one CAS; the ladder marker on blocking; a throughput sketch
// (shape, per post-notes: the queue starts ahead at one thread and falls, the mutex rises before falling) where the
// lines cross; then a table of buckets doubling: next topic.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const curve = easeOut(seg(t, 1.2, 1.4));
  const grow = easeInOut(seg(t, 3.0, 3.8));
  const Q: Pt[] = [[340, 60], [390, 76], [440, 100], [490, 122]];
  const M: Pt[] = [[340, 118], [390, 98], [440, 82], [490, 104]];
  return (
    <Svg label="One compare-and-swap ring, blocking rather than lock-free; a throughput sketch where the queue starts ahead at one thread and falls while the mutex rises then falls; next, a table that grows while in use" h={300}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 50} y={50} width={42} height={34} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
        ))}
        <T x={140} y={110} s={12} a="middle" f={C.latte}>one CAS, a turn per cell</T>
        <T x={140} y={132} s={12} a="middle" f={C.cherryText}>blocking, not lock-free</T>
      </g>
      <g opacity={curve}>
        <line x1={330} y1={136} x2={510} y2={136} stroke={C.mocha} />
        <line x1={330} y1={40} x2={330} y2={136} stroke={C.mocha} />
        <T x={420} y={154} s={12} a="middle" f={C.latte}>threads →</T>
      </g>
      <Draw pts={Q} t={t} from={1.2} to={2.2} stroke={C.caramel} w={2} />
      <Draw pts={M} t={t} from={1.4} to={2.4} stroke={C.cinnamon} w={2} />
      <T x={500} y={130} s={12} f={C.caramel} o={easeOut(seg(t, 2.2, 2.5))}>ring</T>
      <T x={500} y={100} s={12} f={C.cinnamon} o={easeOut(seg(t, 2.4, 2.7))}>mutex</T>
      <g opacity={easeOut(seg(t, 2.8, 3.1))}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={160 + i * lerp(70, 35, grow)} y={198} width={lerp(60, 30, grow)} height={26} rx={3} fill="none" stroke={i < 4 ? C.crema : C.cinnamon} strokeWidth={1.3} opacity={i < 4 ? 1 : clamp((grow - 0.5) * 2, 0, 1)} />
        ))}
      </g>
      <T x={300} y={268} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.6, 4.1))}>next: a table that grows in use</T>
    </Svg>
  );
}
