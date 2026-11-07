import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a thread's own lane and its steps; latte = secondary labels; taupe = a stalled or
// suspended lane; caramel = the thing to look at (a linearization point, the winning CAS, the legal order); cinnamon
// (rare) = a second thread's change or a second object; cherryText = the bad outcome (a lost update, a failed CAS, a
// history with no legal order).
// Every printed number is examples.py's: the counter starts at 0 and lands on 1, not 2; 20 interleavings, 18 end at
// one and 2 at two; a suspended lock holder blocks the other thread for all 10,000 of its steps; A fails all 1,000 CAS
// attempts while B succeeds on its first; history 1 (enqueue x over [0,4], dequeue->x over [1,2], enqueue y over
// [5,6], dequeue->y over [7,8]) is linearizable; history 2 (enqueue x over [0,2], dequeue->empty over [3,5]) is not.
// Values swapped by compare-and-swap are drawn as coloured chips, not numbers.

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

function Lane({ y, label, x0 = 80, x1 = 560, c = C.crema, dash, o = 1 }: { y: number; label: string; x0?: number; x1?: number; c?: string; dash?: string; o?: number }) {
  return (
    <g opacity={o}>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={c === C.taupe ? C.taupe : C.mocha} strokeWidth={1.2} strokeDasharray={dash} />
      <T x={x0 - 10} y={y + 4} s={12} a="end" f={c}>{label}</T>
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

function Padlock({ x, y, c = C.caramel, o = 1 }: { x: number; y: number; c?: string; o?: number }) {
  return (
    <g opacity={o}>
      <path d={`M${x - 6} ${y} v-6 a6 6 0 0 1 12 0 v6`} fill="none" stroke={c} strokeWidth={1.8} />
      <rect x={x - 9} y={y} width={18} height={13} rx={2} fill={c} />
    </g>
  );
}

// 1 · A counter nobody waits behind? The counter holds 0. A reads 0, B reads 0; A writes 1, B writes 1: it lands on
// one, not two. Then a lock: A holds it and is suspended, and B's wait grows for as long as the suspension lasts.
export function Hook({ t }: StepCtx) {
  const CX = 300;
  const lanes = easeOut(seg(t, 0.1, 0.5));
  const aRead = easeInOut(seg(t, 0.4, 0.9));
  const bRead = easeInOut(seg(t, 0.7, 1.2));
  const aWrite = easeInOut(seg(t, 1.3, 1.8));
  const bWrite = easeInOut(seg(t, 1.8, 2.3));
  const val = t < 1.7 ? '0' : '1';
  const lost = easeOut(seg(t, 2.3, 2.7));
  const lock = easeOut(seg(t, 2.9, 3.3));
  const sus = easeOut(seg(t, 3.2, 3.5));
  const wait = clamp((t - 3.4) / 1.2, 0, 1);
  const q = easeOut(seg(t, 4.2, 4.7));
  const chip = (fx: number, fy: number, tx: number, ty: number, k: number, txt: string, c: string) =>
    k > 0 && k < 1 ? (
      <g>
        <rect x={lerp(fx, tx, k) - 11} y={lerp(fy, ty, k) - 11} width={22} height={22} rx={3} fill={C.roast} stroke={c} strokeWidth={1.4} />
        <T x={lerp(fx, tx, k)} y={lerp(fy, ty, k) + 5} s={13} a="middle" f={c}>{txt}</T>
      </g>
    ) : null;
  return (
    <Svg label="A counter at 0; thread A reads 0 and thread B reads 0, A writes 1, B writes 1, so it lands on one, not two. Then a lock: A holds it and is suspended, and B waits behind it as long as that lasts" h={300}>
      <Lane y={60} label="A" x0={60} x1={250} o={lanes} c={sus > 0.5 ? C.taupe : C.crema} dash={sus > 0.5 ? '4 4' : undefined} />
      <Lane y={170} label="B" x0={60} x1={250} o={lanes} />
      <g opacity={lanes}>
        <rect x={CX - 32} y={93} width={64} height={44} rx={5} fill={C.roast} stroke={lost > 0.5 ? C.cherryText : C.crema} strokeWidth={1.8} />
        <T x={CX} y={123} s={20} a="middle" f={lost > 0.5 ? C.cherryText : C.caramel}>{val}</T>
        <T x={CX} y={84} s={12} a="middle" f={C.latte}>counter</T>
      </g>
      {chip(CX, 115, 200, 60, aRead, '0', C.crema)}
      {aRead >= 1 && <T x={200} y={46} s={12} a="middle" f={C.crema} o={1 - aWrite}>read 0</T>}
      {chip(CX, 115, 200, 170, bRead, '0', C.crema)}
      {bRead >= 1 && <T x={200} y={194} s={12} a="middle" f={C.crema} o={1 - bWrite}>read 0</T>}
      {chip(200, 60, CX, 115, aWrite, '1', C.caramel)}
      {chip(200, 170, CX, 115, bWrite, '1', C.cherryText)}
      <T x={380} y={112} s={13} f={C.cherryText} o={lost}>one, not two</T>
      <Padlock x={CX + 44} y={124} o={lock} />
      <g opacity={sus}>
        <T x={154} y={46} s={12} a="middle" f={C.taupe}>holds lock · suspended</T>
      </g>
      <rect x={60} y={214} width={480 * wait} height={10} rx={2} fill={C.cherryText} opacity={0.8 * sus} />
      <T x={60} y={244} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>B waits behind it</T>
      <T x={300} y={282} s={14} a="middle" f={C.caramel} o={q}>a counter nobody waits behind?</T>
    </Svg>
  );
}

// 2 · Predict. All twenty interleavings of AAA and BBB as six-cell strips. After answering, each is replayed: eighteen
// go red (end at one), the two serial orders light up (end at two).
const ORDERS: string[] = (() => {
  const out: string[] = [];
  for (let m = 0; m < 64; m++) {
    const s = Array.from({ length: 6 }, (_, i) => ((m >> (5 - i)) & 1 ? 'B' : 'A')).join('');
    if (s.split('A').length - 1 === 3) out.push(s);
  }
  return out; // lexicographic, AAABBB first, BBBAAA last
})();
function counterEnds(o: string) {
  let c = 0;
  const reg: Record<string, number> = { A: 0, B: 0 };
  const k: Record<string, number> = { A: 0, B: 0 };
  for (const w of o) {
    const st = k[w]++;
    if (st === 0) reg[w] = c;
    else if (st === 1) reg[w] += 1;
    else c = reg[w];
  }
  return c;
}
function Strip({ x, y, o, cell = 15, state = 'none', ok }: { x: number; y: number; o: string; cell?: number; state?: 'none' | 'done'; ok?: boolean }) {
  return (
    <g>
      {o.split('').map((w, i) => (
        <rect key={i} x={x + i * cell} y={y} width={cell - 2} height={14} rx={2} fill={w === 'A' ? C.crema : C.mocha} opacity={w === 'A' ? 0.8 : 1} />
      ))}
      {state === 'done' && <rect x={x - 3} y={y - 3} width={6 * cell + 4} height={20} rx={3} fill="none" stroke={ok ? C.caramel : C.cherryText} strokeWidth={1.6} />}
    </g>
  );
}
export function InterleavingsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const replay = answered ? clamp((s - 0.2) / 0.06, 0, 20) : 0;
  return (
    <Svg label="All twenty interleavings of two three-step runs, A light and B dark; after answering, eighteen are outlined red because they end at one, and the two serial orders are outlined white because they end at two" h={290}>
      <T x={30} y={26} s={12} f={C.latte}>A: read, +1, write (light) · B: the same (dark)</T>
      {ORDERS.map((o, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 40 + col * 136;
        const y = 50 + row * 34;
        const a = easeOut(seg(t, 0.1 + i * 0.055, 0.4 + i * 0.055));
        const done = replay > i;
        return (
          <g key={o} opacity={a}>
            <Strip x={x} y={y} o={o} state={done ? 'done' : 'none'} ok={counterEnds(o) === 2} />
          </g>
        );
      })}
      {!answered && <T x={300} y={250} s={14} a="middle" f={C.caramel} o={pulse}>how many lose the update?</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.4, 1.8))}>18 of 20 end at one; 2 end at two</T>}
    </Svg>
  );
}

// 3 · The lost update, counted. One interleaving on two lanes: A reads, B reads, A adds and writes, B adds and writes.
// A's read-to-write span brackets; B's read sits inside it, so B's write overwrites A's: one. Then all twenty sorted:
// 18 end at one, 2 end at two, and the rule that separates them.
export function LostUpdateCounted({ t }: StepCtx) {
  const ORDER = 'ABAABB';
  const X = (i: number) => 140 + i * 66;
  const k: Record<string, number> = { A: 0, B: 0 };
  const LAB = ['read', '+1', 'write'];
  const steps = ORDER.split('').map((w, i) => ({ w, i, st: k[w]++ }));
  const span = easeInOut(seg(t, 1.2, 1.7));
  const inside = easeOut(seg(t, 1.7, 2.1));
  const sortK = easeInOut(seg(t, 2.4, 3.3));
  const rule = easeOut(seg(t, 3.6, 4.1));
  const sorted = [...ORDERS].sort((a, b) => counterEnds(a) - counterEnds(b));
  return (
    <Svg label="One interleaving: A reads, B reads inside A's read-to-write span, so B's write overwrites A's and the counter lands on one. All twenty sorted: 18 end at one, 2 end at two" h={320}>
      <Lane y={56} label="A" x0={110} x1={540} />
      <Lane y={106} label="B" x0={110} x1={540} />
      {steps.map(({ w, i, st }) => {
        const a = easeOut(seg(t, 0.1 + i * 0.16, 0.35 + i * 0.16));
        const y = w === 'A' ? 56 : 106;
        const bad = w === 'B' && st === 0 && inside > 0.5;
        return (
          <g key={i} opacity={a}>
            <circle cx={X(i)} cy={y} r={5} fill={bad ? C.cherryText : C.crema} />
            <T x={X(i)} y={w === 'A' ? y - 12 : y + 24} s={12} a="middle" f={bad ? C.cherryText : C.crema}>{LAB[st]}</T>
          </g>
        );
      })}
      <path d={`M${X(0)} 70 L${X(0)} 78 L${lerp(X(0), X(3), span)} 78 L${lerp(X(0), X(3), span)} 70`} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={span > 0 ? 1 : 0} />
      <circle cx={X(1)} cy={106} r={11} fill="none" stroke={C.cherryText} strokeWidth={1.8} opacity={inside} />
      <T x={300} y={156} s={12} a="middle" f={C.cherryText} o={inside}>B read inside A's span: ends at 1</T>
      {sorted.map((o, i) => {
        const ok = counterEnds(o) === 2;
        const fromX = 70 + ORDERS.indexOf(o) * 23;
        const toX = 70 + i * 23 + (ok ? 12 : 0);
        return (
          <rect key={o} x={lerp(fromX, toX, sortK)} y={176} width={18} height={22} rx={2} fill={ok ? C.caramel : C.cherry} stroke={ok ? C.caramel : C.cherryText} strokeWidth={1} opacity={easeOut(seg(t, 2.1, 2.4))} />
        );
      })}
      <T x={70} y={222} s={12} f={C.cherryText} o={sortK}>18 end at one</T>
      <T x={540} y={222} s={12} a="end" f={C.caramel} o={sortK}>2 end at two</T>
      <T x={300} y={270} s={13} a="middle" f={C.crema} o={rule}>correct only when neither read</T>
      <T x={300} y={292} s={13} a="middle" f={C.crema} o={rule}>falls in the other's read-to-write span</T>
    </Svg>
  );
}

// 4 · The lock, and its new failure. A takes the lock and runs, then is suspended (its lane goes grey); B reaches the
// lock and stops; its blocked steps pile up for the whole suspension: all 10,000 of them, in examples.py's schedule.
export function LockBlocks({ t }: StepCtx) {
  const take = easeOut(seg(t, 0.2, 0.6));
  const run = clamp((t - 0.5) / 0.6, 0, 1);
  const sus = easeOut(seg(t, 1.1, 1.4));
  const bArrive = easeInOut(seg(t, 0.9, 1.6));
  const pile = clamp((t - 1.7) / 2.2, 0, 1);
  const N = 40;
  return (
    <Svg label="Thread A takes the lock, runs, then is suspended; thread B reaches the lock and stops, its blocked steps piling up for the whole suspension: all 10,000 of them" h={300}>
      <Padlock x={210} y={110} o={take} c={sus > 0.5 ? C.taupe : C.caramel} />
      <line x1={210} y1={40} x2={210} y2={200} stroke={C.mocha} strokeWidth={1} strokeDasharray="3 4" opacity={take} />
      <Lane y={70} label="A" x0={60} x1={560} c={sus > 0.5 ? C.taupe : C.crema} dash={sus > 0.5 ? '4 4' : undefined} />
      <Lane y={170} label="B" x0={60} x1={560} />
      <rect x={210} y={62} width={110 * run} height={16} rx={3} fill={C.crema} opacity={sus > 0.5 ? 0.3 : 0.85} />
      <T x={232} y={104} s={12} f={C.taupe} o={sus}>suspended, holding the lock</T>
      <circle cx={lerp(70, 196, bArrive)} cy={170} r={6} fill={C.crema} />
      {Array.from({ length: N }, (_, i) => (
        <line key={i} x1={226 + i * 8} y1={162} x2={226 + i * 8} y2={178} stroke={C.cherryText} strokeWidth={2} opacity={pile * N > i ? 0.9 : 0} />
      ))}
      <T x={226} y={204} s={12} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>B's steps, every one blocked</T>
      <T x={300} y={258} s={14} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.1))}>all 10,000 of B's steps wait</T>
    </Svg>
  );
}

// 5 · Compare-and-swap. A reads the cell's chip, computes a new one; B swaps the cell first (blue). A's swap compares
// what it saw with what's there: changed, so no overwrite, retry. A reads again, computes, compares: unchanged, swap.
export function CompareAndSwap({ t }: StepCtx) {
  const STEPS = ['read', 'compute', 'swap if unchanged'];
  const BX = [60, 180, 320];
  const BW = [100, 120, 220];
  const a = easeOut(seg(t, 0.1, 0.5));
  // attempt 1: 0.5 read, 0.9 compute, 1.3 B swaps, 1.7 compare fails; retry arrow 2.0-2.5; attempt 2: 2.6 read, 3.0
  // compute, 3.4 compare succeeds.
  const active = t < 0.5 ? -1 : t < 0.9 ? 0 : t < 1.6 ? 1 : t < 2.0 ? 2 : t < 2.6 ? -1 : t < 3.0 ? 0 : t < 3.4 ? 1 : 2;
  const fail = t >= 1.7 && t < 2.6;
  const ok = t >= 3.5;
  const bSwap = easeOut(seg(t, 1.2, 1.6));
  const cellC = ok ? C.caramel : bSwap > 0.5 ? C.cinnamon : C.crema;
  const seen = t < 2.6 ? C.crema : C.cinnamon;
  const readK = t < 2.6 ? easeInOut(seg(t, 0.5, 0.9)) : easeInOut(seg(t, 2.6, 3.0));
  const newK = t < 2.6 ? easeOut(seg(t, 0.9, 1.2)) : easeOut(seg(t, 3.0, 3.3));
  const swapK = easeInOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="Compare-and-swap: A reads the cell and computes a new value; B changes the cell first, so A's swap sees a change and retries; A reads again, computes, and this time the cell is unchanged, so the swap lands" h={320}>
      {STEPS.map((st, i) => (
        <g key={st} opacity={a}>
          <rect x={BX[i]} y={36} width={BW[i]} height={30} rx={4} fill={active === i ? C.cocoa : 'none'} stroke={active === i ? C.caramel : C.crema} strokeWidth={active === i ? 2 : 1.2} />
          <T x={BX[i] + BW[i] / 2} y={56} s={12} a="middle" f={active === i ? C.caramel : C.crema}>{st}</T>
          {i < 2 && <path d={`M${BX[i] + BW[i] + 4} 51 L${BX[i + 1] - 4} 51`} stroke={C.latte} strokeWidth={1.2} />}
        </g>
      ))}
      <Draw pts={[[430, 70], [430, 92], [110, 92], [110, 70]]} t={t} from={2.0} to={2.5} stroke={C.cherryText} w={1.6} />
      {fail && <T x={270} y={110} s={12} a="middle" f={C.cherryText}>changed: don't overwrite, retry</T>}
      {/* the shared cell */}
      <g opacity={a}>
        <T x={300} y={156} s={12} a="middle" f={C.latte}>shared cell</T>
        <rect x={276} y={166} width={48} height={40} rx={5} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <rect x={286} y={176} width={28} height={20} rx={3} fill={cellC} />
      </g>
      {/* B's sneaky swap */}
      <g opacity={bSwap * (t < 2.6 ? 1 : 0.4)}>
        <T x={470} y={192} s={12} a="middle" f={C.cinnamon}>B swaps first</T>
        <rect x={lerp(450, 286, bSwap)} y={176} width={28} height={20} rx={3} fill={C.cinnamon} opacity={bSwap < 1 ? 1 : 0} />
      </g>
      {/* thread A's own registers */}
      <Lane y={262} label="A" x0={80} x1={560} o={a} />
      <T x={150} y={240} s={12} a="middle" f={C.latte} o={a}>saw</T>
      <rect x={lerp(286, 136, readK)} y={lerp(176, 252, readK)} width={28} height={20} rx={3} fill={seen} opacity={readK > 0 ? 1 : 0} />
      <T x={250} y={240} s={12} a="middle" f={C.latte} o={a}>new</T>
      <rect x={236} y={252} width={28} height={20} rx={3} fill={C.caramel} opacity={newK * (t < 2.0 || t >= 3.0 ? 1 : 0.3) * (1 - swapK)} />
      {t >= 1.7 && t < 2.6 && <Tick x={330} y={262} ok={false} />}
      {ok && <Tick x={340} y={186} ok o={easeOut(seg(t, 3.6, 3.9))} />}
      <T x={300} y={308} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.9, 4.3))}>no lock, ever</T>
    </Svg>
  );
}

// 6 · Predict. A's CAS loses every attempt (red crosses pile up along its lane); B is the thread that wins every tie.
// After answering: B's increments land one after another, the counter keeps climbing: the system moves.
export function CasStarvationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.4));
  const fails = clamp((t - 0.3) / 1.3, 0, 1) * 12;
  const wins = answered ? clamp((s - 0.2) / 1.4, 0, 1) * 12 : 0;
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Svg label="Thread A's compare-and-swap fails attempt after attempt; after answering, thread B's attempts all succeed, one after another, and the system as a whole keeps moving" h={280}>
      <Lane y={70} label="A" x0={80} x1={560} o={a} c={C.crema} />
      <Lane y={150} label="B" x0={80} x1={560} o={a} />
      {Array.from({ length: 12 }, (_, i) => (
        <Tick key={i} x={110 + i * 38} y={70} ok={false} o={clamp(fails - i, 0, 1)} />
      ))}
      <T x={110} y={46} s={12} f={C.cherryText} o={clamp(fails / 3, 0, 1)}>A: CAS fails, again and again</T>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={clamp(wins - i, 0, 1)}>
          <Tick x={110 + i * 38} y={150} ok />
        </g>
      ))}
      {answered && <rect x={100} y={174} width={444 * (wins / 12)} height={8} rx={2} fill={C.caramel} />}
      {answered && <T x={110} y={204} s={12} f={C.caramel} o={easeOut(seg(s, 0.4, 0.8))}>B: every CAS lands, the counter climbs</T>}
      {!answered && <T x={300} y={250} s={14} a="middle" f={C.caramel} o={pulse * a}>does the whole system still move?</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.6, 2.0))}>yes: someone always finishes</T>}
    </Svg>
  );
}

// 7 · Lock-free, not wait-free. Measured: A's 1,000 attempts fill a strip, every one failed; B succeeds on its first.
// Then the four-rung ladder lights bottom-up: blocking (the lock), obstruction-free, lock-free (the CAS loop), wait-free
// (an atomic add, one step). Lock-free brackets "the system moves", wait-free "every thread moves".
const RUNGS: [string, string][] = [
  ['blocking', 'a lock'],
  ['obstruction-free', 'if run alone'],
  ['lock-free', 'the CAS loop'],
  ['wait-free', 'atomic add'],
];
export function ProgressLadder({ t }: StepCtx) {
  const fill = clamp((t - 0.2) / 1.1, 0, 1);
  const bWin = easeOut(seg(t, 0.3, 0.6));
  const sysK = easeOut(seg(t, 3.8, 4.2));
  const allK = easeOut(seg(t, 4.3, 4.7));
  return (
    <Svg label="Measured: thread A fails all 1,000 compare-and-swap attempts while B succeeds on its first. The progress ladder lights bottom-up: blocking, obstruction-free, lock-free, wait-free; lock-free means the system moves, wait-free means every thread does" h={340}>
      <T x={30} y={30} s={12} f={C.crema}>A</T>
      <rect x={50} y={20} width={400} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      <rect x={50} y={20} width={400 * fill} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
      <T x={458} y={32} s={12} f={C.cherryText} o={fill >= 1 ? 1 : 0}>1,000 fail</T>
      <T x={30} y={60} s={12} f={C.crema}>B</T>
      <Tick x={60} y={54} ok o={bWin} />
      <T x={78} y={60} s={12} f={C.caramel} o={bWin}>first attempt lands</T>
      {RUNGS.map(([name, why], i) => {
        const y = 290 - i * 52;
        const on = easeOutBack(seg(t, 1.4 + i * 0.55, 1.9 + i * 0.55));
        return (
          <g key={name} opacity={clamp(on, 0, 1)} transform={`translate(${lerp(-20, 0, clamp(on, 0, 1))} 0)`}>
            <rect x={60} y={y - 20} width={316} height={34} rx={4} fill={i === 3 ? C.cocoa : 'none'} stroke={i >= 2 ? C.caramel : C.crema} strokeWidth={i >= 2 ? 1.8 : 1.2} />
            <T x={74} y={y + 2} s={13} f={i >= 2 ? C.caramel : C.crema}>{name}</T>
            <T x={364} y={y + 2} s={12} a="end" f={C.latte}>{why}</T>
          </g>
        );
      })}
      <path d={`M386 ${290 - 2 * 52 - 20} l10 0 l0 ${34 + 52} l-10 0`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={sysK} />
      <T x={404} y={290 - 52 * 1.5 + 4} s={12} f={C.caramel} o={sysK}>system moves</T>
      <T x={404} y={290 - 3 * 52 + 2} s={12} f={C.caramel} o={allK}>every thread</T>
    </Svg>
  );
}

// 8 · What does "correct" mean, overlapping? Thread A's operation draws as an interval from call to return; then B's,
// overlapping it. The overlap shades; two candidate orders flash in turn (A first? B first?); the clock can't decide.
export function HistoryIntervals({ t }: StepCtx) {
  const aK = easeInOut(seg(t, 0.2, 1.1));
  const bK = easeInOut(seg(t, 1.2, 2.1));
  const ov = easeOut(seg(t, 2.2, 2.7));
  const flip = t >= 3.0 ? Math.floor((t - 3.0) / 0.5) % 2 : -1;
  const A0 = 120;
  const A1 = 380;
  const B0 = 280;
  const B1 = 520;
  return (
    <Svg label="Thread A's operation as an interval from call to return, then thread B's overlapping it; the overlap is concurrent, and real time alone cannot say which happened first" h={300}>
      <Lane y={80} label="A" x0={80} x1={560} />
      <Lane y={160} label="B" x0={80} x1={560} />
      <rect x={B0} y={50} width={(A1 - B0) * ov} height={140} fill={C.cocoa} />
      <rect x={A0} y={70} width={(A1 - A0) * aK} height={20} rx={3} fill="none" stroke={flip === 0 ? C.caramel : C.crema} strokeWidth={flip === 0 ? 2.2 : 1.6} />
      <T x={A0} y={60} s={12} a="middle" f={C.latte} o={aK > 0 ? 1 : 0}>call</T>
      <T x={A1} y={60} s={12} a="middle" f={C.latte} o={aK >= 1 ? 1 : 0}>return</T>
      <rect x={B0} y={150} width={(B1 - B0) * bK} height={20} rx={3} fill="none" stroke={flip === 1 ? C.caramel : C.cinnamon} strokeWidth={flip === 1 ? 2.2 : 1.6} />
      <T x={B0} y={190} s={12} a="middle" f={C.latte} o={bK > 0 ? 1 : 0}>call</T>
      <T x={B1} y={190} s={12} a="middle" f={C.latte} o={bK >= 1 ? 1 : 0}>return</T>
      <T x={(B0 + A1) / 2} y={124} s={12} a="middle" f={C.crema} o={ov}>concurrent</T>
      {flip === 0 && <T x={300} y={236} s={13} a="middle" f={C.caramel}>A first?</T>}
      {flip === 1 && <T x={300} y={236} s={13} a="middle" f={C.caramel}>B first?</T>}
      <T x={300} y={270} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 3.4, 3.9))}>the clock alone can't say</T>
    </Svg>
  );
}

// 9 · Predict. A's enqueue(x) draws as an interval and returns; x goes into the queue. Only then B's dequeue begins,
// and returns empty. After answering: the real-time line at the enqueue's return, and x already sitting in the queue.
export function EmptyAfterEnqueuePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X = (tm: number) => 120 + tm * 64; // history 2: enqueue x over [0,2], dequeue->empty over [3,5]
  const enq = easeInOut(seg(t, 0.1, 0.7));
  const deq = easeInOut(seg(t, 0.8, 1.3));
  const empty = easeOut(seg(t, 1.3, 1.6));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const line = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const glow = answered ? easeOut(seg(s, 0.8, 1.3)) : 0;
  return (
    <Svg label="Thread A's enqueue of x is called and returns; only afterwards does B's dequeue begin, and it returns empty. After answering: at the enqueue's return, x is already in the queue, so no sequential queue could answer empty" h={300}>
      <Lane y={70} label="A" x0={80} x1={420} />
      <Lane y={150} label="B" x0={80} x1={420} />
      <rect x={X(0)} y={60} width={(X(2) - X(0)) * enq} height={20} rx={3} fill="none" stroke={C.crema} strokeWidth={1.6} />
      <T x={X(1)} y={50} s={12} a="middle" f={C.crema} o={enq}>enqueue x</T>
      <rect x={X(3)} y={140} width={(X(5) - X(3)) * deq} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
      <T x={X(4)} y={130} s={12} a="middle" f={C.crema} o={deq}>dequeue</T>
      <T x={X(4)} y={180} s={12} a="middle" f={C.cherryText} o={empty}>returns empty</T>
      {/* the queue */}
      <g opacity={enq}>
        <rect x={440} y={50} width={110} height={36} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={495} y={42} s={12} a="middle" f={C.latte}>queue</T>
        <rect x={lerp(X(1) - 10, 454, enq)} y={58} width={22} height={20} rx={3} fill={glow > 0.5 ? C.caramel : C.crema} />
        <T x={lerp(X(1) + 1, 465, enq)} y={73} s={12} a="middle" f={C.espresso}>x</T>
      </g>
      {answered && (
        <g opacity={line}>
          <line x1={X(2)} y1={40} x2={X(2)} y2={lerp(40, 196, line)} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 3" />
          <T x={X(2) + 6} y={204} s={12} f={C.caramel}>enqueue already returned</T>
        </g>
      )}
      {!answered && <T x={300} y={258} s={14} a="middle" f={C.caramel} o={pulse * enq}>could a sequential queue do this?</T>}
      {answered && <T x={300} y={258} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.3, 1.7))}>no: x is already in the queue</T>}
    </Svg>
  );
}

// 10 · Linearizable, and not. History 1 (enqueue x [0,4], dequeue->x [1,2], enqueue y [5,6], dequeue->y [7,8]): a point
// drops inside each interval and they fall into a legal order: linearizable. History 2 (enqueue x [0,2],
// dequeue->empty [3,5]): the only real-time order puts enqueue first, and then dequeue can't say empty: rejected.
export function Linearizability({ t }: StepCtx) {
  const X = (tm: number) => 90 + tm * 56;
  const H1: { lane: 0 | 1; s: number; e: number; lab: string; p: number }[] = [
    { lane: 0, s: 0, e: 4, lab: 'enq x', p: 0.6 },
    { lane: 1, s: 1, e: 2, lab: 'deq→x', p: 1.5 },
    { lane: 0, s: 5, e: 6, lab: 'enq y', p: 5.5 },
    { lane: 1, s: 7, e: 8, lab: 'deq→y', p: 7.5 },
  ];
  const draw1 = easeOut(seg(t, 0.1, 0.6));
  const pass = easeOut(seg(t, 2.2, 2.6));
  const draw2 = easeOut(seg(t, 2.6, 3.0));
  const try1 = easeOut(seg(t, 3.1, 3.6));
  const try2 = easeOut(seg(t, 3.7, 4.2));
  const rej = easeOut(seg(t, 4.3, 4.7));
  return (
    <Svg label="History 1: a point inside each interval falls into the legal order enqueue x, dequeue x, enqueue y, dequeue y, so it is linearizable. History 2: enqueue x returns before a dequeue that says empty; no order respecting real time is legal, so it is rejected" h={340}>
      <T x={30} y={24} s={12} f={C.latte}>history 1</T>
      <Lane y={54} label="A" x0={80} x1={560} o={draw1} />
      <Lane y={94} label="B" x0={80} x1={560} o={draw1} />
      {H1.map((op, i) => {
        const y = op.lane === 0 ? 54 : 94;
        const pt = easeOutBack(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25));
        const drop = easeInOut(seg(t, 1.6 + i * 0.12, 2.0 + i * 0.12));
        return (
          <g key={op.lab} opacity={draw1}>
            <rect x={X(op.s)} y={y - 9} width={X(op.e) - X(op.s)} height={18} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
            <T x={(X(op.s) + X(op.e)) / 2} y={y - 14} s={12} a="middle" f={C.crema}>{op.lab}</T>
            <circle cx={X(op.p)} cy={lerp(y, 124, drop)} r={5} fill={C.caramel} opacity={clamp(pt, 0, 1)} />
          </g>
        );
      })}
      <line x1={X(0)} y1={124} x2={X(8)} y2={124} stroke={C.caramel} strokeWidth={1.2} opacity={easeOut(seg(t, 1.0, 1.4))} />
      <Tick x={X(8) + 20} y={120} ok o={pass} />
      <T x={X(8) + 14} y={146} s={12} a="end" f={C.caramel} o={pass}>legal order found</T>
      <line x1={30} y1={168} x2={570} y2={168} stroke={C.mocha} strokeWidth={1} opacity={draw2} />
      <T x={30} y={192} s={12} f={C.latte} o={draw2}>history 2</T>
      <Lane y={222} label="A" x0={80} x1={380} o={draw2} />
      <Lane y={262} label="B" x0={80} x1={380} o={draw2} />
      <g opacity={draw2}>
        <rect x={X(0)} y={213} width={X(2) - X(0)} height={18} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={X(1)} y={208} s={12} a="middle" f={C.crema}>enq x</T>
        <rect x={X(3)} y={253} width={X(5) - X(3)} height={18} rx={3} fill="none" stroke={rej > 0.5 ? C.cherryText : C.crema} strokeWidth={1.4} />
        <T x={X(4)} y={248} s={12} a="middle" f={C.crema}>deq→empty</T>
      </g>
      <g opacity={try1 * (1 - try2 * 0.6)}>
        <Tick x={396} y={222} ok={false} />
        <T x={410} y={226} s={12} f={C.latte}>enq first: gets x</T>
      </g>
      <g opacity={try2}>
        <Tick x={396} y={262} ok={false} />
        <T x={410} y={266} s={12} f={C.latte}>deq first: illegal</T>
      </g>
      <T x={300} y={318} s={13} a="middle" f={C.cherryText} o={rej}>no legal order: rejected</T>
    </Svg>
  );
}

// 11 · Why it composes. A queue's history and a map's history each check alone (a tick each). Then one box draws around
// both, the whole system, and it inherits the tick without any new check. Below: serializability, not local that way.
export function Locality({ t }: StepCtx) {
  const q = easeOut(seg(t, 0.2, 0.7));
  const qOk = easeOut(seg(t, 0.8, 1.1));
  const m = easeOut(seg(t, 1.0, 1.5));
  const mOk = easeOut(seg(t, 1.6, 1.9));
  const box = easeInOut(seg(t, 2.1, 2.8));
  const sysOk = easeOut(seg(t, 2.8, 3.1));
  const ser = easeOut(seg(t, 3.4, 3.9));
  const hist = (x: number, c: string) => (
    <g>
      <line x1={x} y1={110} x2={x + 150} y2={110} stroke={C.mocha} strokeWidth={1} />
      <line x1={x} y1={136} x2={x + 150} y2={136} stroke={C.mocha} strokeWidth={1} />
      <rect x={x + 10} y={103} width={60} height={14} rx={2} fill="none" stroke={c} strokeWidth={1.3} />
      <rect x={x + 50} y={129} width={50} height={14} rx={2} fill="none" stroke={c} strokeWidth={1.3} />
      <rect x={x + 90} y={103} width={50} height={14} rx={2} fill="none" stroke={c} strokeWidth={1.3} />
    </g>
  );
  return (
    <Svg label="A queue's history and a map's history are each checked alone and each pass; drawn together as one system, it passes too, with no new check. Serializability, the transaction world's condition, is not local in that way" h={300}>
      <g opacity={q}>
        <T x={140} y={80} s={13} a="middle" f={C.crema}>queue</T>
        {hist(65, C.crema)}
      </g>
      <Tick x={140} y={168} ok o={qOk} />
      <g opacity={m}>
        <T x={430} y={80} s={13} a="middle" f={C.cinnamon}>map</T>
        {hist(355, C.cinnamon)}
      </g>
      <Tick x={430} y={168} ok o={mOk} />
      <Draw pts={[[45, 56], [555, 56], [555, 186], [45, 186], [45, 56]]} t={t} from={2.1} to={2.8} stroke={C.caramel} w={1.4} pen={false} />
      <T x={300} y={50} s={12} a="middle" f={C.caramel} o={box}>whole system</T>
      <Tick x={290} y={210} ok o={sysOk} />
      <T x={308} y={216} s={12} f={C.caramel} o={sysOk}>no new check</T>
      <T x={300} y={262} s={13} a="middle" f={C.cherryText} o={ser}>serializability: not local this way</T>
    </Svg>
  );
}

// 12 · Recap. Correctness: an interval with its linearization point dropping in. Progress: the four rungs light.
// Below, a ring's outline draws itself, dashed: nothing built yet; the next topic builds it.
export function Recap({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.2, 0.7));
  const pt = easeOutBack(seg(t, 0.8, 1.2));
  const ringK = easeInOut(seg(t, 2.6, 3.6));
  const R = 34;
  const ring: [number, number][] = Array.from({ length: 41 }, (_, i) => [300 + R * Math.cos((i / 40) * 2 * Math.PI - Math.PI / 2), 222 + R * Math.sin((i / 40) * 2 * Math.PI - Math.PI / 2)]);
  return (
    <Svg label="Correctness is linearizability: an interval with its point. Progress is the four-rung ladder. Below, an empty ring outline: nothing built yet, the next topic builds a ring queue" h={300}>
      <g opacity={c}>
        <T x={150} y={36} s={13} a="middle" f={C.caramel}>correctness</T>
        <T x={150} y={56} s={12} a="middle" f={C.latte}>linearizable</T>
        <rect x={80} y={84} width={140} height={20} rx={3} fill="none" stroke={C.crema} strokeWidth={1.5} />
      </g>
      <circle cx={160} cy={lerp(64, 94, clamp(pt, 0, 1))} r={6} fill={C.caramel} opacity={clamp(pt, 0, 1)} />
      <g opacity={easeOut(seg(t, 1.2, 1.6))}>
        <T x={450} y={36} s={13} a="middle" f={C.caramel}>progress</T>
        <T x={450} y={56} s={12} a="middle" f={C.latte}>the four-rung ladder</T>
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={400} y={140 - i * 18} width={100} height={12} rx={2} fill={i >= 2 ? C.caramel : C.crema} opacity={easeOut(seg(t, 1.4 + i * 0.25, 1.7 + i * 0.25)) * (i >= 2 ? 1 : 0.6)} />
      ))}
      <Draw pts={ring} t={t} from={2.6} to={3.6} stroke={C.latte} w={1.6} dash="5 4" pen={false} />
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * 2 * Math.PI - Math.PI / 2;
        return <line key={i} x1={300 + (R - 8) * Math.cos(ang)} y1={222 + (R - 8) * Math.sin(ang)} x2={300 + (R + 8) * Math.cos(ang)} y2={222 + (R + 8) * Math.sin(ang)} stroke={C.mocha} strokeWidth={1} opacity={ringK} />;
      })}
      <T x={300} y={288} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.4, 3.9))}>nothing built yet: a ring queue, next</T>
    </Svg>
  );
}
