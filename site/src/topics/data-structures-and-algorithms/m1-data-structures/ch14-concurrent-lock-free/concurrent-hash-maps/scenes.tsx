import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a value, a node, a bin's contents; latte = secondary labels (a bin index, a
// count); taupe = a bin or thread nobody is touching, a stalled thread; caramel = the thing to look at (the CAS landing,
// the lock marker, the forwarding note); cinnamon (rare) = the alternative being compared (a stripe against the whole
// table, a tree against a chain); cherryText = the bad outcome (a bin grown too long, a thread blocked behind a slow
// operation).
// Every printed number is examples.py's or a quote from SOURCES.md: sixteen threads (the reel's own scenario); the
// resize trace (old table of 4 bins, new of 8; keys 2 and 6 in old bin 2 migrate to new bins 2 and 6; key 1 stays in old
// bin 1; a reader for 6 follows the forwarding node, a reader for 1 reads the old table; a second thread migrates bins 0
// and 3); the source's nine Poisson figures (0: 0.60653066 ... 8: 0.00000006), all nine matched by examples.py;
// TREEIFY_THRESHOLD = 8 and MIN_TREEIFY_CAPACITY = 64 (an 8-node chain treeifies in a 64-bin table and resizes instead
// in a 32-bin one); the split-ordered list of keys 0..15 with 4 buckets doubled to 8, new dummies 4, 5, 6, 7, no real
// key moved. The shard count is machine-dependent, so the shards are drawn, never counted.

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

function Padlock({ x, y, c = C.caramel, o = 1, s = 1 }: { x: number; y: number; c?: string; o?: number; s?: number }) {
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 0 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke={c} strokeWidth={1.8} />
      <rect x={-8} y={0} width={16} height={11} rx={2} fill={c} />
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

/** A row of bins: boxes with their index beneath (optional). */
function Bins({ x, y, n, w = 40, gap = 6, o = 1, idx = true, hi = -1, dash = false, c = C.crema }: { x: number; y: number; n: number; w?: number; gap?: number; o?: number; idx?: boolean; hi?: number; dash?: boolean; c?: string }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x + i * (w + gap)} y={y} width={w} height={26} rx={3} fill={i === hi ? C.cocoa : 'none'} stroke={i === hi ? C.caramel : c} strokeWidth={i === hi ? 2 : 1.3} strokeDasharray={dash ? '4 3' : undefined} />
          {idx && <T x={x + i * (w + gap) + w / 2} y={y - 6} s={12} a="middle" f={C.taupe}>{i}</T>}
        </g>
      ))}
    </g>
  );
}

function Node({ x, y, label, c = C.crema, o = 1, r = 12 }: { x: number; y: number; label?: string; c?: string; o?: number; r?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={C.roast} stroke={c} strokeWidth={1.6} />
      {label !== undefined && <T x={x} y={y + 4} s={12} a="middle" f={c}>{label}</T>}
    </g>
  );
}

// 1 · A map that sixteen threads update. Sixteen threads; one lock around the map lets one in at a time while the rest
// queue. Then the lock splits into four stripe locks and threads pour into different stripes at once. Then the bins row
// stretches toward a bigger table: it still has to grow.
export function Hook({ t }: StepCtx) {
  const BX = 210;
  const BW = 40;
  const one = easeOut(seg(t, 0.2, 0.6)) * (1 - easeOut(seg(t, 1.8, 2.1)));
  const stripes = easeOut(seg(t, 2.0, 2.4));
  const grow = easeInOut(seg(t, 3.4, 4.2));
  const threads = Array.from({ length: 16 }, (_, i) => [40 + (i % 4) * 26, 50 + Math.floor(i / 4) * 34] as Pt);
  const phase1 = t < 2.0;
  const pass = Math.floor(clamp((t - 0.6) / 0.3, 0, 99));
  return (
    <Svg label="Sixteen threads update one map. One lock lets them through one at a time; split into four stripe locks, threads on different stripes go at once. Then the table has to grow" h={300}>
      {threads.map(([x, y], i) => {
        const queued = phase1 && i >= pass;
        const lane = i % 4;
        const k = phase1 ? (i < pass ? 1 : 0) : ((t * 0.8 + i * 0.13) % 1);
        const tx = BX + lane * 2 * (BW + 6) + BW;
        const px = phase1 ? (queued ? x : BX + 40) : lerp(x, tx, k);
        const py = phase1 ? (queued ? y : 160) : lerp(y, 160, k);
        return <circle key={i} cx={px} cy={py} r={5} fill={queued && one > 0.5 ? C.cherryText : C.crema} opacity={easeOut(seg(t, 0.05 + i * 0.02, 0.3 + i * 0.02)) * (phase1 && i < pass ? 0 : 1)} />;
      })}
      <T x={40} y={30} s={12} f={C.latte}>16 threads</T>
      <Bins x={BX} y={176} n={8} w={BW} idx={false} />
      <rect x={BX - 10} y={140} width={8 * (BW + 6) + 14} height={72} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.8} opacity={one} />
      <Padlock x={BX + 4 * (BW + 6) - 3} y={128} c={C.cherryText} o={one} />
      {[0, 1, 2, 3].map((j) => (
        <g key={j} opacity={stripes}>
          <rect x={BX + j * 2 * (BW + 6) - 3} y={170} width={2 * BW + 12} height={38} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          <Padlock x={BX + j * 2 * (BW + 6) + BW + 3} y={216} s={0.8} />
        </g>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={120 + i * 24} y={252} width={20} height={16} rx={2} fill="none" stroke={i < 8 ? C.latte : C.caramel} strokeDasharray="3 3" opacity={i < 8 ? grow : clamp(grow * 9 - (i - 7), 0, 1)} />
      ))}
      {t < 2.0 && <T x={BX} y={110} s={12} f={C.cherryText} o={one}>one lock: one thread at a time</T>}
      {t >= 2.0 && t < 3.4 && <T x={BX} y={110} s={12} f={C.caramel} o={stripes}>a lock per stripe: in parallel</T>}
      {t >= 3.4 && <T x={BX} y={110} s={12} f={C.latte} o={grow}>until the table has to grow</T>}
    </Svg>
  );
}

// 2 · Predict. Old table, 4 bins (key 1 in bin 1; keys 2 and 6 in bin 2); new table, 8 bins. Bin 2 migrates: 2 and 6
// slide down to new bins 2 and 6. A reader for key 6 lands on old bin 2. After answering: old bin 2's head is a
// forwarding note; the reader follows it down to new bin 6 and finds 6.
const OX = (i: number) => 150 + i * 80; // old bins, w 60
const NX = (i: number) => 60 + i * 62; // new bins, w 50
export function ReaderDuringResizePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.4));
  const mv = easeInOut(seg(t, 0.4, 1.0));
  const rd = easeOut(seg(t, 1.0, 1.4));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const note = answered ? easeOutBack(seg(s, 0.2, 0.6)) : 0;
  const follow = answered ? easeInOut(seg(s, 0.6, 1.3)) : 0;
  const found = answered ? easeOut(seg(s, 1.3, 1.6)) : 0;
  return (
    <Svg label="Old table of four bins, new table of eight. Bin 2's keys 2 and 6 move to new bins 2 and 6, and a reader for key 6 lands on old bin 2. After answering: the old bin's head is a forwarding note, and the reader follows it to new bin 6 and finds 6" h={300}>
      <T x={30} y={58} s={12} f={C.latte} o={a}>old</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={a}>
          <rect x={OX(i)} y={40} width={60} height={28} rx={3} fill={i === 2 && note > 0.5 ? C.cocoa : 'none'} stroke={i === 2 && note > 0.5 ? C.caramel : C.crema} strokeWidth={1.4} />
          <T x={OX(i) + 30} y={32} s={12} a="middle" f={C.taupe}>{i}</T>
        </g>
      ))}
      <Node x={OX(1) + 30} y={54} label="1" o={a} r={11} />
      <T x={30} y={190} s={12} f={C.latte} o={a}>new</T>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} opacity={a}>
          <rect x={NX(i)} y={172} width={50} height={28} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
          <T x={NX(i) + 25} y={218} s={12} a="middle" f={C.taupe}>{i}</T>
        </g>
      ))}
      <Node x={lerp(OX(2) + 18, NX(2) + 25, mv)} y={lerp(54, 186, mv)} label="2" o={a} r={11} />
      <Node x={lerp(OX(2) + 42, NX(6) + 25, mv)} y={lerp(54, 186, mv)} label="6" o={a} r={11} c={found > 0.5 ? C.caramel : C.crema} />
      {answered && <T x={OX(2) + 30} y={59} s={12} a="middle" f={C.caramel} o={clamp(note, 0, 1)}>fwd</T>}
      <g opacity={rd}>
        <circle cx={OX(2) + 30} cy={lerp(100, 82, rd)} r={6} fill={C.cinnamon} />
        <T x={OX(2) + 44} y={lerp(104, 86, rd)} s={12} f={C.cinnamon}>reader for 6</T>
      </g>
      {answered && <Draw pts={[[OX(2) + 30, 70], [OX(2) + 30, 130], [NX(6) + 25, 130], [NX(6) + 25, 168]]} t={s} from={0.6} to={1.3} stroke={C.caramel} w={1.8} />}
      {answered && <Tick x={NX(6) + 46} y={160} ok o={found} />}
      {!answered && <T x={300} y={262} s={14} a="middle" f={C.caramel} o={pulse * rd}>wait, look twice, or a note?</T>}
      {answered && <T x={300} y={262} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.4, 1.8))}>a note: follow it to the new table</T>}
    </Svg>
  );
}

// 3 · One lock, then many stripes. One lock: threads enter one at a time. It splits into four stripes: threads on
// different stripes enter together. Then a resize needs every stripe's lock: it takes them one by one, and every other
// thread stalls.
export function LockStripingStripes({ t }: StepCtx) {
  const BX = 100;
  const BW = 44;
  const one = easeOut(seg(t, 0.1, 0.4)) * (1 - easeOut(seg(t, 1.4, 1.7)));
  const split = easeOut(seg(t, 1.5, 2.0));
  const take = clamp((t - 3.0) / 1.0, 0, 1) * 4;
  const stall = easeOut(seg(t, 3.9, 4.3));
  const SX = (j: number) => BX + j * 2 * (BW + 6);
  const dotY = (k: number) => lerp(60, 140, k);
  return (
    <Svg label="One lock lets threads into the table one at a time; split into four stripes, threads on different stripes go in together; a resize then takes every stripe's lock in turn and all other threads stall" h={300}>
      <Bins x={BX} y={150} n={8} w={BW} idx={false} />
      <rect x={BX - 8} y={140} width={8 * (BW + 6) + 10} height={46} rx={5} fill="none" stroke={C.cherryText} strokeWidth={1.8} opacity={one} />
      <Padlock x={BX + 4 * (BW + 6) - 3} y={118} c={C.cherryText} o={one} />
      {t < 1.5 && [0, 1, 2].map((i) => {
        const k = clamp((t - 0.4 - i * 0.35) / 0.35, 0, 1);
        return <circle key={i} cx={BX + 4 * (BW + 6) - 3} cy={dotY(k) - (k === 0 ? i * 16 : 0)} r={5} fill={k > 0 && k < 1 ? C.crema : C.cherryText} opacity={k >= 1 ? 0 : 1} />;
      })}
      {[0, 1, 2, 3].map((j) => {
        const mine = clamp(take - j, 0, 1);
        const k = t > 2.0 && t < 3.0 ? (t - 2.0) % 1 : 0;
        return (
          <g key={j} opacity={split}>
            <rect x={SX(j) - 4} y={142} width={2 * BW + 14} height={42} rx={4} fill="none" stroke={mine > 0.5 ? C.cherryText : C.caramel} strokeWidth={1.4} />
            <Padlock x={SX(j) + BW + 3} y={196} s={0.8} c={mine > 0.5 ? C.cherryText : C.caramel} />
            {k > 0 && <circle cx={SX(j) + BW + 3} cy={dotY(k)} r={5} fill={C.crema} />}
          </g>
        );
      })}
      {take > 0 && <Draw pts={[[60, 228], ...[0, 1, 2, 3].map((j) => [SX(j) + BW + 3, 228] as Pt)]} t={t} from={3.0} to={4.0} stroke={C.cherryText} w={1.6} />}
      <g opacity={stall}>
        {[0, 1, 2, 3].map((j) => (
          <circle key={j} cx={SX(j) + BW + 3} cy={74} r={5} fill={C.taupe} />
        ))}
      </g>
      {t < 1.5 && <T x={300} y={268} s={13} a="middle" f={C.cherryText} o={one}>one lock: everyone in turn</T>}
      {t >= 1.5 && t < 3.0 && <T x={300} y={268} s={13} a="middle" f={C.caramel} o={split}>different stripes never meet</T>}
      {t >= 3.0 && <T x={300} y={268} s={13} a="middle" f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>a resize needs every lock</T>}
    </Svg>
  );
}

// 4 · One compare and swap, no lock. Bin 3 is empty; a thread's node drops in with one CAS: landed. A second thread's
// CAS on the same, now-filled bin fails: someone got there first. Then empty bins elsewhere each take a node the same
// way: the common case.
export function CasEmptyBin({ t }: StepCtx) {
  const BX = 80;
  const BW = 50;
  const X = (i: number) => BX + i * (BW + 8) + BW / 2;
  const drop = easeInOut(seg(t, 0.5, 1.2));
  const land = easeOut(seg(t, 1.2, 1.5));
  const late = easeInOut(seg(t, 1.8, 2.4));
  const fail = easeOut(seg(t, 2.4, 2.7));
  const many = [0, 5, 7];
  return (
    <Svg label="Bin 3 is empty; one compare-and-swap lands a thread's node there with no lock. A second thread's swap on the same bin fails because someone got there first. Other empty bins each take a node the same way" h={300}>
      <Bins x={BX} y={130} n={8} w={BW} gap={8} hi={land > 0.5 ? 3 : -1} />
      <Node x={X(3)} y={lerp(60, 143, drop)} label="a" c={land > 0.5 ? C.caramel : C.crema} />
      <T x={X(3) + 18} y={64} s={12} f={C.caramel} o={easeOut(seg(t, 0.3, 0.6)) * (1 - land)}>CAS</T>
      <T x={X(3)} y={186} s={12} a="middle" f={C.caramel} o={land}>landed</T>
      {t > 1.7 && <Node x={lerp(X(5), X(3) + 22, late)} y={lerp(60, 108, late)} label="b" c={fail > 0.5 ? C.cherryText : C.cinnamon} o={1 - easeOut(seg(t, 3.0, 3.3))} />}
      {t > 1.7 && <Tick x={X(3) + 40} y={96} ok={false} o={fail * (1 - easeOut(seg(t, 3.0, 3.3)))} />}
      {t > 2.4 && t < 3.3 && <T x={X(3) + 54} y={100} s={12} f={C.cherryText} o={fail}>taken first</T>}
      {many.map((b, i) => {
        const k = easeInOut(seg(t, 3.2 + i * 0.2, 3.6 + i * 0.2));
        return <Node key={b} x={X(b)} y={lerp(60, 143, k)} c={k >= 1 ? C.caramel : C.crema} o={k > 0 ? 1 : 0} r={10} />;
      })}
      <T x={300} y={250} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>no lock object, most common case</T>
    </Svg>
  );
}

// 5 · The first node is the lock. Bin 2 holds a chain of three; a frame closes around its first node: that node is the
// lock. A writer appends a fourth node while holding it. Meanwhile bins 0 and 5 take their own updates, untouched.
export function LockFirstNode({ t }: StepCtx) {
  const BX = 80;
  const BW = 50;
  const X = (i: number) => BX + i * (BW + 8) + BW / 2;
  const chain = easeOut(seg(t, 0.1, 0.5));
  const frame = easeOutBack(seg(t, 0.6, 1.1));
  const app = easeInOut(seg(t, 1.5, 2.4));
  const others = easeInOut(seg(t, 2.6, 3.4));
  const free = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="Bin 2's chain of three; its first node is framed as the bin's lock while a writer appends a fourth node. Other bins take their own updates at the same time, untouched" h={320}>
      <Bins x={BX} y={40} n={8} w={BW} gap={8} />
      {[0, 1, 2].map((j) => (
        <g key={j} opacity={chain}>
          {j > 0 && <line x1={X(2)} y1={92 + (j - 1) * 40 + 12} x2={X(2)} y2={92 + j * 40 - 12} stroke={C.latte} strokeWidth={1.2} />}
          <Node x={X(2)} y={92 + j * 40} />
        </g>
      ))}
      <line x1={X(2)} y1={66} x2={X(2)} y2={80} stroke={C.latte} strokeWidth={1.2} opacity={chain} />
      <rect x={X(2) - 20} y={72} width={40} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={clamp(frame, 0, 1)} />
      <Padlock x={X(2) + 30} y={86} o={clamp(frame, 0, 1)} />
      <T x={X(2) + 44} y={96} s={12} f={C.caramel} o={clamp(frame, 0, 1)}>first node = lock</T>
      <line x1={X(2)} y1={184} x2={X(2)} y2={lerp(184, 200, app)} stroke={C.latte} strokeWidth={1.2} />
      <Node x={lerp(X(2) + 60, X(2), app)} y={lerp(250, 212, app)} c={C.caramel} o={app > 0 ? 1 : 0} />
      {[0, 7].map((b) => (
        <g key={b}>
          <line x1={X(b)} y1={66} x2={X(b)} y2={80} stroke={C.latte} strokeWidth={1.2} opacity={others} />
          <Node x={X(b)} y={lerp(30, 92, others)} c={C.cinnamon} o={others > 0 ? 1 : 0} />
        </g>
      ))}
      <T x={560} y={132} s={12} a="end" f={C.cinnamon} o={others}>own bin, own lock</T>
      <T x={300} y={296} s={13} a="middle" f={C.crema} o={free}>empty bins: nothing to guard</T>
    </Svg>
  );
}

// 6 · A reader never takes it. The same locked bin, a writer inserting at its tail; a reader walks straight down the
// chain past the lock, never stopping, and finds its node while the write is still going.
export function ReaderNeverLocks({ t }: StepCtx) {
  const X = 220;
  const Y = (j: number) => 70 + j * 46;
  const write = easeInOut(seg(t, 0.4, 3.2));
  const walk = clamp((t - 0.6) / 2.0, 0, 1) * 3;
  const found = easeOut(seg(t, 2.6, 3.0));
  const ry = walk < 3 ? lerp(Y(Math.floor(walk)), Y(Math.min(3, Math.floor(walk) + 1)), walk % 1) : Y(3);
  return (
    <Svg label="A bin locked on its first node while a writer inserts at its tail; a reader walks straight down the chain past the lock without stopping and finds its node while the write is still in progress" h={320}>
      <rect x={X - 26} y={22} width={52} height={26} rx={3} fill="none" stroke={C.crema} strokeWidth={1.3} />
      {[0, 1, 2, 3].map((j) => (
        <g key={j}>
          <line x1={X} y1={j === 0 ? 48 : Y(j - 1) + 12} x2={X} y2={Y(j) - 12} stroke={C.latte} strokeWidth={1.2} />
          <Node x={X} y={Y(j)} c={j === 3 && found > 0.5 ? C.caramel : C.crema} />
        </g>
      ))}
      <rect x={X - 20} y={Y(0) - 20} width={40} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <Padlock x={X - 36} y={Y(0) - 4} />
      <line x1={X} y1={Y(3) + 12} x2={X} y2={Y(3) + 34} stroke={C.latte} strokeWidth={1.2} opacity={write > 0.95 ? 1 : 0} />
      <Node x={lerp(X + 200, X, write)} y={Y(3) + 46} c={C.caramel} r={10} />
      <T x={X + 28} y={Y(3) + 70} s={12} f={C.caramel}>writer, holding the lock</T>
      <circle cx={X + 24} cy={ry} r={6} fill={C.cinnamon} />
      <T x={X + 40} y={ry + 4} s={12} f={C.cinnamon}>reader</T>
      <T x={X + 40} y={Y(3) - 22} s={12} f={C.caramel} o={found}>found, no lock taken</T>
      <T x={300} y={306} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.2, 3.7))}>both at once, in the same bin</T>
    </Svg>
  );
}

// 7 · Predict. Bins fill with chains of the lengths an honest hash gives (shape); one bin's chain keeps growing to
// eight. Plausible, or rare? After answering: every node past the second fades redder and redder: vanishingly rare.
const LENS = [0, 1, 0, 2, 1, 0, 0, 1, 3, 0];
export function ChainLengthPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const BX = 50;
  const BW = 40;
  const X = (i: number) => BX + i * (BW + 12) + BW / 2;
  const a = easeOut(seg(t, 0.1, 0.4));
  const grow = clamp((t - 0.5) / 0.9, 0, 1) * 8;
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const fade = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const LONG = 6;
  return (
    <Svg label="Ten bins with short chains of zero to three nodes, and one bin whose chain grows to eight; after answering, each node past the second turns redder: a chain that long is vanishingly rare by chance" h={300}>
      <Bins x={BX} y={30} n={10} w={BW} gap={12} idx={false} o={a} />
      {LENS.map((len, i) =>
        i === LONG ? null : Array.from({ length: len }, (_, j) => <Node key={`${i}-${j}`} x={X(i)} y={76 + j * 24} r={8} o={a} />),
      )}
      {Array.from({ length: 8 }, (_, j) => {
        const on = clamp(grow - j, 0, 1);
        const red = j >= 2 ? fade * Math.min(1, (j - 1) / 6) : 0;
        return <Node key={j} x={X(LONG)} y={76 + j * 24} r={8} o={on * (1 - red * 0.6)} c={red > 0.1 ? C.cherryText : C.crema} />;
      })}
      <T x={X(LONG) + 16} y={252} s={12} f={C.crema} o={clamp(grow - 7, 0, 1)}>8 in one bin</T>
      {!answered && <T x={300} y={288} s={14} a="middle" f={C.caramel} o={pulse * a}>plausible, or astronomically rare?</T>}
      {answered && <T x={300} y={288} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.0, 1.4))}>falls off sharply: vanishingly rare</T>}
    </Svg>
  );
}

// 8 · Nine probabilities, computed. The source's nine Poisson figures, one bar per bin length on a log scale, each
// growing in turn with its printed value; a tick when examples.py's own computation matches all nine. Length eight
// lights: about six in a hundred million.
const POISSON: [number, string][] = [
  [0.60653066, '0.60653066'],
  [0.30326533, '0.30326533'],
  [0.07581633, '0.07581633'],
  [0.01263606, '0.01263606'],
  [0.00157952, '0.00157952'],
  [0.00015795, '0.00015795'],
  [0.00001316, '0.00001316'],
  [0.00000094, '0.00000094'],
  [0.00000006, '0.00000006'],
];
export function PoissonBars({ t }: StepCtx) {
  const BX = 210;
  const W = (p: number) => (Math.log10(p) + 7.5) * 44;
  const match = easeOut(seg(t, 3.4, 3.8));
  const last = easeOut(seg(t, 4.0, 4.4));
  return (
    <Svg label="The source's nine Poisson probabilities for bin lengths 0 to 8 on a log scale, from 0.60653066 down to 0.00000006; examples.py computes all nine and matches every one" h={340}>
      <T x={30} y={20} s={12} f={C.latte}>nodes in a bin: chance (source, log scale)</T>
      {POISSON.map(([p, lab], i) => {
        const y = 40 + i * 28;
        const g = easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3));
        const hl = i === 8 && last > 0.5;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.3, 0.3 + i * 0.3))}>
            <T x={30} y={y + 13} s={12} f={hl ? C.caramel : C.crema}>{i}: {lab}</T>
            <rect x={BX} y={y + 2} width={W(p) * g} height={14} rx={2} fill={hl ? C.caramel : i >= 2 ? C.cherryText : C.crema} opacity={hl ? 1 : 0.75} />
          </g>
        );
      })}
      <Tick x={420} y={236} ok o={match} />
      <T x={436} y={240} s={12} f={C.caramel} o={match}>all 9 match</T>
      <T x={300} y={312} s={13} a="middle" f={C.caramel} o={last}>eight in one bin: a one-in-millions event</T>
    </Svg>
  );
}

// 9 · Eight nodes, a tree instead of a chain. A chain grows to TREEIFY_THRESHOLD = 8. In a 64-bin table it folds into a
// balanced tree; beside it, the same chain in a 32-bin table: the table doubles instead.
const TREE: Pt[] = [[0, 0], [-60, 40], [60, 40], [-90, 80], [-30, 80], [30, 80], [90, 80], [-110, 120]];
export function TreeifiedBin({ t }: StepCtx) {
  const grow = clamp((t - 0.2) / 1.2, 0, 1) * 8;
  const fold = easeInOut(seg(t, 1.8, 2.8));
  const right = easeOut(seg(t, 3.0, 3.4));
  const dbl = easeInOut(seg(t, 3.5, 4.4));
  const CX = 160;
  return (
    <Svg label="A chain grows to the treeify threshold of 8. In a table of 64 bins it folds into a balanced tree; in a table of 32 bins the table resizes instead" h={320}>
      <T x={CX} y={24} s={12} a="middle" f={C.latte}>64-bin table</T>
      {Array.from({ length: 8 }, (_, j) => {
        const cx = lerp(CX, CX + TREE[j][0], fold);
        const cy = lerp(50 + j * 30, 60 + TREE[j][1] * 1.2, fold);
        const parent = j === 0 ? -1 : fold > 0.5 ? Math.floor((j - 1) / 2) : j - 1;
        const px = parent < 0 ? cx : fold > 0.5 ? CX + TREE[parent][0] : CX;
        const py = parent < 0 ? cy : fold > 0.5 ? 60 + TREE[parent][1] * 1.2 : 50 + parent * 30;
        return (
          <g key={j} opacity={clamp(grow - j, 0, 1)}>
            {parent >= 0 && (fold < 0.05 || fold > 0.95) && <line x1={px} y1={py} x2={cx} y2={cy} stroke={fold > 0.5 ? C.cinnamon : C.latte} strokeWidth={1.2} />}
            <Node x={cx} y={cy} r={10} c={fold > 0.5 ? C.cinnamon : j === 7 ? C.cherryText : C.crema} />
          </g>
        );
      })}
      <T x={CX + 40} y={284} s={12} f={C.cherryText} o={clamp(grow - 7, 0, 1) * (1 - fold)}>8: the threshold</T>
      <T x={CX} y={260} s={13} a="middle" f={C.cinnamon} o={easeOut(seg(t, 2.6, 3.0))}>treeify</T>
      <line x1={330} y1={30} x2={330} y2={290} stroke={C.mocha} strokeWidth={1} opacity={right} />
      <g opacity={right}>
        <T x={455} y={24} s={12} a="middle" f={C.latte}>32-bin table</T>
        {Array.from({ length: 8 }, (_, j) => (
          <circle key={j} cx={370} cy={50 + j * 24} r={7} fill={C.roast} stroke={C.crema} strokeWidth={1.4} />
        ))}
        {[0, 1].map((k) => (
          <rect key={k} x={410 + k * lerp(0, 74, dbl)} y={120} width={70} height={26} rx={3} fill="none" stroke={k === 1 ? C.caramel : C.crema} strokeWidth={1.4} opacity={k === 1 ? dbl : 1} />
        ))}
        <T x={480} y={176} s={13} a="middle" f={C.caramel} o={dbl}>resize instead</T>
      </g>
    </Svg>
  );
}

// 10 · A note at the old bin's head. Thread A migrates old bin 2 (2 and 6 move to new bins 2 and 6) and leaves a
// forwarding note. The reader for 6 follows it; the reader for 1 reads old bin 1 directly. Thread B takes bins 0 and 3.
export function ForwardingNode({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const mv = easeInOut(seg(t, 0.4, 1.2));
  const note = easeOutBack(seg(t, 1.2, 1.5));
  const r6 = easeInOut(seg(t, 1.8, 2.7));
  const r1 = easeOut(seg(t, 2.3, 2.8));
  const bTake = easeOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="Thread A moves old bin 2's keys 2 and 6 to new bins 2 and 6 and leaves a forwarding note; a reader for 6 follows the note to the new table, a reader for 1 reads old bin 1 directly, and thread B migrates bins 0 and 3 at the same time" h={300}>
      {[0, 1, 2, 3].map((i) => {
        const fwd = (i === 2 && note > 0.5) || ((i === 0 || i === 3) && bTake > 0.5);
        return (
          <g key={i} opacity={a}>
            <rect x={OX(i)} y={40} width={60} height={28} rx={3} fill={fwd ? C.cocoa : 'none'} stroke={fwd ? C.caramel : C.crema} strokeWidth={1.4} />
            <T x={OX(i) + 30} y={32} s={12} a="middle" f={C.taupe}>{i}</T>
            {fwd && <T x={OX(i) + 30} y={59} s={12} a="middle" f={C.caramel}>fwd</T>}
          </g>
        );
      })}
      <Node x={OX(1) + 30} y={54} label="1" o={a} r={11} c={r1 > 0.5 ? C.caramel : C.crema} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} opacity={a}>
          <rect x={NX(i)} y={172} width={50} height={28} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
          <T x={NX(i) + 25} y={218} s={12} a="middle" f={C.taupe}>{i}</T>
        </g>
      ))}
      <Node x={lerp(OX(2) + 18, NX(2) + 25, mv)} y={lerp(54, 186, mv)} label="2" o={mv > 0 ? 1 : 0} r={11} />
      <Node x={lerp(OX(2) + 42, NX(6) + 25, mv)} y={lerp(54, 186, mv)} label="6" o={mv > 0 ? 1 : 0} r={11} c={r6 >= 1 ? C.caramel : C.crema} />
      <T x={OX(2) + 30} y={96} s={12} a="middle" f={C.crema} o={easeOut(seg(t, 0.4, 0.7)) * (1 - easeOut(seg(t, 1.6, 1.8)))}>A migrates bin 2</T>
      <Draw pts={[[OX(2) + 30, 70], [OX(2) + 30, 130], [NX(6) + 25, 130], [NX(6) + 25, 168]]} t={t} from={1.8} to={2.7} stroke={C.cinnamon} w={1.8} />
      <T x={OX(3) + 64} y={126} s={12} f={C.cinnamon} o={r6}>reader for 6</T>
      <Draw pts={[[OX(1) + 30, 100], [OX(1) + 30, 70]]} t={t} from={2.3} to={2.8} stroke={C.cinnamon} w={1.8} />
      <T x={OX(1) - 70} y={112} s={12} f={C.cinnamon} o={r1}>reader for 1: old</T>
      <T x={300} y={258} s={13} a="middle" f={C.crema} o={bTake}>B takes bins 0 and 3 meanwhile</T>
      <T x={300} y={282} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>nobody waits for the whole move</T>
    </Svg>
  );
}

// 11 · One list, in bit-reversed order. Keys 0..15 in one list sorted by their 8-bit reversal, four dummy markers
// (buckets 0..3) at bucket starts, laid out with gaps where the next level's dummies will go. Doubling to 8 buckets drops
// dummies 4, 5, 6, 7 into those gaps; no real key moves.
function revBits(x: number, width: number) {
  let r = 0;
  for (let i = 0; i < width; i++) if (x & (1 << i)) r |= 1 << (width - 1 - i);
  return r;
}
const SPLIT: { kind: 'd' | 'r'; v: number }[] = (() => {
  const items: { kind: 'd' | 'r'; v: number; key: number; ord: number }[] = [];
  for (let b = 0; b < 8; b++) items.push({ kind: 'd', v: b, key: revBits(b, 3) << 5, ord: 0 });
  for (let x = 0; x < 16; x++) items.push({ kind: 'r', v: x, key: revBits(x, 8), ord: 1 });
  items.sort((p, q) => p.key - q.key || p.ord - q.ord);
  return items.map(({ kind, v }) => ({ kind, v }));
})();
export function SplitOrderedList({ t }: StepCtx) {
  const PER = 12;
  const SX = (i: number) => 46 + (i % PER) * 44;
  const SY = (i: number) => 70 + Math.floor(i / PER) * 90;
  const show = clamp((t - 0.2) / 1.8, 0, 1) * 20;
  const dbl = easeOutBack(seg(t, 3.0, 3.6));
  const bits = easeOut(seg(t, 2.0, 2.4)) * (1 - easeOut(seg(t, 2.8, 3.0)));
  let n = 0;
  return (
    <Svg label="Keys 0 to 15 in one list ordered by their bit-reversed value, with dummy markers where buckets 0 to 3 begin; doubling to 8 buckets threads in dummies 4, 5, 6 and 7 and moves no real key" h={300}>
      {SPLIT.map((it, i) => {
        const isNew = it.kind === 'd' && it.v >= 4;
        const k = isNew ? 0 : n++;
        const on = isNew ? clamp(dbl, 0, 1.2) : clamp(show - k, 0, 1);
        const x = SX(i);
        const y = SY(i);
        const dy = isNew ? lerp(-40, 0, clamp(dbl, 0, 1)) : 0;
        return (
          <g key={`${it.kind}${it.v}`} opacity={clamp(on, 0, 1)} transform={`translate(0 ${dy})`}>
            {i % PER !== 0 && <line x1={x - 30} y1={y} x2={x - 14} y2={y} stroke={C.mocha} strokeWidth={1.2} />}
            {it.kind === 'd' ? (
              <g>
                <path d={`M${x} ${y - 13} L${x + 13} ${y} L${x} ${y + 13} L${x - 13} ${y} Z`} fill={isNew ? C.cocoa : 'none'} stroke={C.caramel} strokeWidth={1.6} />
                <T x={x} y={y + 30} s={12} a="middle" f={C.caramel}>b{it.v}</T>
              </g>
            ) : (
              <Node x={x} y={y} label={String(it.v)} r={13} />
            )}
          </g>
        );
      })}
      <g opacity={bits}>
        <T x={300} y={262} s={13} a="middle" f={C.latte}>key 1: 00000001 → 10000000</T>
      </g>
      <T x={300} y={262} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>{t >= 2.9 ? 'doubled: 4 new dummies, no key moved' : ''}</T>
    </Svg>
  );
}

// 12 · Eight shards, two locks. A key's hash bits pick one of the shards, each with its own read-write lock. Two
// threads on different shards go together; two on the same shard take turns.
export function Shards({ t }: StepCtx) {
  const SX = (i: number) => 60 + i * 62;
  const W = 50;
  const a = easeOut(seg(t, 0.1, 0.5));
  const pick = easeInOut(seg(t, 0.6, 1.4));
  const par = easeInOut(seg(t, 1.6, 2.4));
  const q1 = easeInOut(seg(t, 2.8, 3.4));
  const q2 = easeInOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="An array of shards, each its own table with its own read-write lock; a key's hash bits pick the shard. Two threads on different shards run in parallel; two on the same shard take turns" h={300}>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} opacity={a}>
          <rect x={SX(i)} y={130} width={W} height={44} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <Padlock x={SX(i) + W / 2} y={184} s={0.7} c={C.latte} />
        </g>
      ))}
      <g opacity={a}>
        <T x={60} y={40} s={12} f={C.latte}>hash</T>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={110 + i * 18} y={28} width={14} height={16} rx={2} fill={i >= 5 ? C.caramel : C.mocha} />
        ))}
      </g>
      <Draw pts={[[227, 46], [227, 90], [SX(2) + W / 2, 90], [SX(2) + W / 2, 126]]} t={t} from={0.6} to={1.4} stroke={C.caramel} w={1.6} />
      <T x={SX(2) + W / 2 + 8} y={112} s={12} f={C.caramel} o={pick * (1 - par)}>shard from its bits</T>
      {t > 1.5 && (
        <g>
          <circle cx={lerp(30, SX(1) + W / 2, par)} cy={lerp(240, 152, par)} r={6} fill={C.crema} />
          <circle cx={lerp(570, SX(6) + W / 2, par)} cy={lerp(240, 152, par)} r={6} fill={C.cinnamon} />
        </g>
      )}
      <T x={300} y={226} s={12} a="middle" f={C.caramel} o={par * (1 - easeOut(seg(t, 2.6, 2.8)))}>different shards: together</T>
      {t > 2.7 && (
        <g>
          <circle cx={SX(4) + W / 2} cy={lerp(240, 152, q1)} r={6} fill={C.crema} opacity={1 - q2} />
          <circle cx={SX(4) + W / 2 + 16} cy={q2 > 0 ? lerp(220, 152, q2) : 220} r={6} fill={q1 >= 1 && q2 === 0 ? C.cherryText : C.cinnamon} />
          <Padlock x={SX(4) + W / 2} y={184} s={0.7} c={q1 >= 1 && q2 < 1 ? C.caramel : C.latte} />
        </g>
      )}
      {t > 2.7 && <T x={300} y={268} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>same shard: they take turns</T>}
    </Svg>
  );
}

// 13 · Recap: three structures, three rungs. The ladder (blocking, lock-free); striped locks drop to blocking (a resize
// waits on every lock); CAS bins straddle (lock-free path, blocking where it locks); the split-ordered list sits on
// lock-free all the way, a short bucket walk its price.
export function Recap({ t }: StepCtx) {
  const rungs = easeOut(seg(t, 0.1, 0.6));
  const ITEMS: { name: string; x: number; y0: number; y1: number; c: string; t0: number; note: string }[] = [
    { name: 'striped locks', x: 120, y0: 220, y1: 220, c: C.cherryText, t0: 0.8, note: 'resize waits' },
    { name: 'CAS on bins', x: 300, y0: 100, y1: 220, c: C.caramel, t0: 2.0, note: 'locks only when it must' },
    { name: 'split-ordered', x: 480, y0: 100, y1: 100, c: C.cinnamon, t0: 3.2, note: 'a walk per bucket' },
  ];
  return (
    <Svg label="Striped locks sit on the blocking rung because a resize waits on every lock; CAS on bins spans lock-free on its fast path and blocking where it locks; the split-ordered list is lock-free throughout, at the cost of a walk inside each bucket" h={300}>
      <g opacity={rungs}>
        <line x1={30} y1={100} x2={570} y2={100} stroke={C.mocha} strokeWidth={1.2} />
        <line x1={30} y1={220} x2={570} y2={220} stroke={C.mocha} strokeWidth={1.2} />
        <T x={30} y={90} s={12} f={C.latte}>lock-free</T>
        <T x={30} y={210} s={12} f={C.latte}>blocking</T>
      </g>
      {ITEMS.map((it) => {
        const k = easeOutBack(seg(t, it.t0, it.t0 + 0.6));
        const on = clamp(k, 0, 1);
        return (
          <g key={it.name} opacity={on}>
            {it.y0 !== it.y1 && <line x1={it.x} y1={it.y0} x2={it.x} y2={lerp(it.y0, it.y1, on)} stroke={it.c} strokeWidth={4} strokeLinecap="round" />}
            <circle cx={it.x} cy={lerp(it.y0 - 40, it.y0, on)} r={8} fill={it.c} />
            {it.y0 !== it.y1 && <circle cx={it.x} cy={it.y1} r={8} fill="none" stroke={it.c} strokeWidth={2} opacity={on} />}
            <T x={it.x} y={it.y0 === 100 ? 74 : 252} s={12} a="middle" f={it.c}>{it.name}</T>
            <T x={it.x} y={it.y1 === 220 ? 274 : 130} s={12} a="middle" f={C.latte} o={easeOut(seg(t, it.t0 + 0.5, it.t0 + 0.9))}>{it.note}</T>
          </g>
        );
      })}
    </Svg>
  );
}
