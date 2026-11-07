import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = head/tail markers, the mechanism in focus; cinnamon = the
// compared alternative; cherryText = the one overrun/failure; taupe/latte = axes, quiet labels.
// Every printed number is asserted in examples.py; the timings are drawn as shape only (machine-dependent).

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
const N = 16;

/** Position of (possibly fractional) slot p on a ring, slot 0 at the top, clockwise. */
const onRing = (cx: number, cy: number, r: number, p: number, n = N): Pt => {
  const a = ((p % n) / n) * Math.PI * 2 - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** A ring of n slots; `full(i)` fills a slot; head (caramel) and tail (cinnamon) markers ride at fractional positions. */
function Ring({ cx, cy, r, n = N, sr = 10, full, head, tail, o = 1, idx = [] }: { cx: number; cy: number; r: number; n?: number; sr?: number; full: (i: number) => boolean; head?: number; tail?: number; o?: number; idx?: number[] }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = onRing(cx, cy, r, i, n);
        return <circle key={i} cx={x} cy={y} r={sr} fill={full(i) ? C.mocha : C.cocoa} stroke={full(i) ? C.crema : C.taupe} strokeWidth={1.4} />;
      })}
      {idx.map((i) => {
        const [x, y] = onRing(cx, cy, r + sr + 14, i, n);
        return <T key={i} x={x} y={y + 5} s={13} f={C.taupe} a="middle">{i}</T>;
      })}
      {head !== undefined && (() => {
        const [x, y] = onRing(cx, cy, r, head, n);
        return <circle cx={x} cy={y} r={sr + 5} fill="none" stroke={C.caramel} strokeWidth={2} />;
      })()}
      {tail !== undefined && (() => {
        const [x, y] = onRing(cx, cy, r, tail, n);
        return <circle cx={x} cy={y} r={sr + 9} fill="none" stroke={C.cinnamon} strokeWidth={2} />;
      })()}
    </g>
  );
}

/** A small value cell. */
function Cell({ x, y, v, f = C.crema, o = 1, w = 40 }: { x: number; y: number; v: string; f?: string; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={32} rx={3} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 21} s={14} f={f} a="middle">{v}</T>
    </g>
  );
}

// 1 · Opening. A line of slots runs out of room at its far end (red pulse); then the same slots bend into a
// closed loop, and the far end disappears.
export function Opening({ t }: StepCtx) {
  const bend = easeInOut(seg(t, 1.1, 2.3));
  const room = easeOut(seg(t, 0.5, 0.9)) * (1 - bend);
  return (
    <Svg label="A line of slots that runs out of room at its far end bends into a closed loop with no far end" h={300}>
      {Array.from({ length: N }, (_, i) => {
        const line: Pt = [60 + i * 32, 140];
        const ring = onRing(300, 140, 100, i);
        const k = easeOut(seg(t, i * 0.03, 0.25 + i * 0.03));
        return <circle key={i} cx={lerp(line[0], ring[0], bend)} cy={lerp(line[1], ring[1], bend)} r={10} fill={C.cocoa} stroke={C.crema} strokeWidth={1.4} opacity={k} />;
      })}
      <g opacity={room}>
        <line x1={556} y1={120} x2={556} y2={160} stroke={C.cherryText} strokeWidth={2} />
        <T x={556} y={190} s={13} f={C.cherryText} a="middle">end</T>
      </g>
      <T x={300} y={52} s={13} f={C.taupe} a="middle" o={room}>out of room?</T>
      <circle cx={300} cy={140} r={100} fill="none" stroke={C.caramel} strokeWidth={1.2} strokeDasharray="4 6" opacity={easeOut(seg(t, 2.2, 2.6))} />
      <Decode text="no far end to reach" t={t} at={2.5} dur={0.6} x={300} y={284} s={15} f={C.caramel} a="middle" />
    </Svg>
  );
}

// 2 · The mechanism. Writes advance the tail (filling slots), reads advance the head (emptying them); when the
// tail passes slot 15 its next step is slot 0, and a flash marks the wrap.
export function Mechanism({ t }: StepCtx) {
  const tail = 11 + seg(t, 0.3, 2.8) * 7;
  const head = 7 + seg(t, 0.6, 2.8) * 5;
  const wrapped = tail >= 16;
  const flash = wrapped ? 1 - easeOut(clamp((tail - 16) / 1.5)) : 0;
  const filled = (i: number) => {
    const h = Math.ceil(head - 1e-9), tl = Math.floor(tail + 1e-9);
    for (let k = h; k < tl; k++) if (k % N === i) return true;
    return false;
  };
  const [zx, zy] = onRing(300, 150, 95, 0);
  return (
    <Svg label="Head and tail markers walking around the fixed ring; the tail steps from the last slot straight back to the first" h={300}>
      <T x={30} y={28} s={13} f={C.caramel}>head: next read</T>
      <T x={570} y={28} s={13} f={C.cinnamon} a="end">tail: next write</T>
      <Ring cx={300} cy={150} r={95} full={filled} head={head} tail={tail} idx={[0, 15]} />
      <circle cx={zx} cy={zy} r={26} fill="none" stroke={C.cinnamon} strokeWidth={2} opacity={flash} />
      <T x={300} y={162} s={14} f={C.cinnamon} a="middle" o={wrapped ? easeOut(clamp((tail - 16) * 3)) : 0}>15 &rarr; 0</T>
      <T x={300} y={288} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.3, 2.8))}>the edge simply isn&apos;t there</T>
    </Svg>
  );
}

// 3 · The real cost of wrap-around. The remainder's division bar fills tick by tick (dozens of cycles) while the
// bitwise bar is one tick; then an index's bits lose everything above the low bits under the mask.
export function RealCost({ t }: StepCtx) {
  const divTicks = Math.floor(seg(t, 1.0, 2.4) * 24 + 1e-9);
  const andTick = easeOut(seg(t, 1.0, 1.15));
  const bits = [1, 0, 1, 1, 0, 1, 1, 1];
  const chop = easeInOut(seg(t, 3.0, 3.6));
  const maskOn = easeOut(seg(t, 2.6, 2.95));
  return (
    <Svg label="A division bar filling tick by tick against a single bitwise tick; then the high bits of an index chopped away by a power-of-two mask" h={300}>
      <Decode text="index % capacity" t={t} at={0.1} dur={0.5} x={30} y={30} s={15} f={C.cinnamon} />
      <T x={30} y={66} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.0))}>division</T>
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={140 + i * 16} y={54} width={12} height={16} rx={2} fill={i < divTicks ? C.cinnamon : C.cocoa} opacity={easeOut(seg(t, 0.8, 1.0))} />)}
      <T x={30} y={98} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.0))}>bitwise</T>
      <rect x={140} y={86} width={12} height={16} rx={2} fill={C.caramel} opacity={andTick} />
      <T x={162} y={98} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.5))}>one tick</T>
      <T x={30} y={156} s={15} f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>capacity a power of two:</T>
      <T x={30} y={180} s={15} f={C.caramel} o={easeOut(seg(t, 2.5, 2.8))}>index &amp; (capacity &minus; 1)</T>
      {bits.map((b, i) => {
        const high = i < 4;
        return (
          <rect key={i} x={160 + i * 34} y={208 - (high ? 30 * chop : 0)} width={28} height={28} rx={3} fill={b ? C.crema : C.cocoa} stroke={high ? C.taupe : C.caramel} strokeWidth={high ? 1.2 : 2 * maskOn + 1.2 * (1 - maskOn)} opacity={easeOut(seg(t, 2.4 + i * 0.03, 2.6 + i * 0.03)) * (high ? 1 - chop : 1)} />
        );
      })}
      <path d={`M ${160 + 4 * 34 - 3} 248 v 8 h ${4 * 34 - 3} v -8`} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={maskOn} />
      <T x={160 + 6 * 34 - 3} y={276} s={13} f={C.caramel} a="middle" o={maskOn}>low bits kept</T>
      <T x={160 + 2 * 34 - 3} y={276} s={13} f={C.taupe} a="middle" o={chop}>chopped</T>
    </Svg>
  );
}

// 4 · Predict: capacity 16, tail at 11, five more writes. Before the answer the tail pulses at 11; after it,
// the tail steps 12, 13, 14, 15 and lands on 0, and the mask arithmetic decodes.
export function IndexPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const steps = answered ? Math.min(5, Math.floor(seg(s, 0.2, 1.6) * 5 + 1e-9)) : 0;
  const tail = 11 + steps + (answered && steps < 5 ? easeInOut(clamp(seg(s, 0.2, 1.6) * 5 - steps)) : 0);
  const full = (i: number) => i >= 8 && i < 11 + steps;
  return (
    <Svg label="A sixteen-slot ring with the write marker at eleven; five more writes take it around to zero" h={300}>
      <T x={30} y={28} s={13} f={C.taupe}>capacity 16</T>
      <Ring cx={300} cy={150} r={95} full={full} tail={answered ? tail : 11} idx={[0, 11]} />
      {!answered && <circle cx={onRing(300, 150, 95, 11)[0]} cy={onRing(300, 150, 95, 11)[1]} r={24 + 3 * Math.sin(t * 5)} fill="none" stroke={C.cinnamon} strokeWidth={1} opacity={0.6} />}
      {!answered && <T x={300} y={290} s={16} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>five more writes: new index?</T>}
      {answered && (
        <>
          <T x={300} y={158} s={20} f={C.cinnamon} a="middle">+{steps}</T>
          <Decode text="16 & 15 = 0" t={s} at={1.8} dur={0.5} x={300} y={290} s={16} f={C.caramel} a="middle" />
          <Reticle x={onRing(300, 150, 95, 0)[0]} y={onRing(300, 150, 95, 0)[1]} w={50} h={50} t={s} at={1.7} />
        </>
      )}
    </Svg>
  );
}

// 5 · The ambiguity. Left: an empty ring, head and tail on slot 0. Right: the tail laps the whole ring, filling
// every slot, and lands back on the head. Then ghost copies of both marker pairs slide to the middle and overlap.
export function Ambiguity({ t }: StepCtx) {
  const lap = seg(t, 0.3, 1.8) * N;
  const ghost = easeInOut(seg(t, 2.4, 3.2));
  const [lx, ly] = onRing(150, 140, 70, 0);
  const [rx, ry] = onRing(450, 140, 70, 0);
  return (
    <Svg label="An empty ring and a full ring both show the head and tail on the same slot, so the marker positions alone cannot tell them apart" h={300}>
      <Ring cx={150} cy={140} r={70} sr={8} full={() => false} head={0} tail={0} />
      <Ring cx={450} cy={140} r={70} sr={8} full={(i) => i < lap} head={0} tail={lap} />
      <T x={150} y={248} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 1.9, 2.2))}>empty?</T>
      <T x={450} y={248} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 1.9, 2.2))}>full?</T>
      {ghost > 0 && (
        <g opacity={ghost}>
          <circle cx={lerp(lx, 300, ghost)} cy={lerp(ly, 60, ghost)} r={13} fill="none" stroke={C.caramel} strokeWidth={2} />
          <circle cx={lerp(lx, 300, ghost)} cy={lerp(ly, 60, ghost)} r={17} fill="none" stroke={C.cinnamon} strokeWidth={2} />
          <circle cx={lerp(rx, 300, ghost)} cy={lerp(ry, 60, ghost)} r={13} fill="none" stroke={C.caramel} strokeWidth={2} />
          <circle cx={lerp(rx, 300, ghost)} cy={lerp(ry, 60, ghost)} r={17} fill="none" stroke={C.cinnamon} strokeWidth={2} />
        </g>
      )}
      <Decode text="head == tail: same picture" t={t} at={3.0} dur={0.5} x={300} y={286} s={14} f={C.caramel} a="middle" />
    </Svg>
  );
}

// 6 · The fix. Two uncapped counters climb a number line (lap ticks every 16); arrows trim each down to a slot
// only at access. The gap between them is the count: 16 when full, 0 when empty, even though both cases land
// on the same slot. Then the two other fixes: a sacrificed slot, or a separate count.
export function TheFix({ t }: StepCtx) {
  const X0 = 40, U = 9; // number line: 0..56 counter values
  const inV = lerp(0, 21, easeInOut(seg(t, 0.3, 1.5)));
  const outV = lerp(0, 5, easeInOut(seg(t, 0.5, 1.5))) + lerp(0, 16, easeInOut(seg(t, 2.1, 2.8)));
  const gap = inV - outV;
  const xp = (v: number) => X0 + v * U * 1.0;
  const strip = (v: number) => 140 + ((Math.round(v) % N) + N) % N * 20;
  const access = easeOut(seg(t, 1.0, 1.4));
  const alt = easeOut(seg(t, 3.3, 3.8));
  const verdict = gap > 15.5 ? 'full' : gap < 0.5 ? 'empty' : '';
  return (
    <Svg label="Two counters climb without wrapping; each is masked only when it touches a slot, and the gap between them is the count that tells empty from full" h={330}>
      <T x={30} y={24} s={13} f={C.latte}>in, out: never wrapped, only climb</T>
      <line x1={X0} y1={70} x2={xp(56)} y2={70} stroke={C.mocha} strokeWidth={1.4} />
      {[0, 16, 32, 48].map((v) => (
        <g key={v}>
          <line x1={xp(v)} y1={64} x2={xp(v)} y2={76} stroke={C.taupe} strokeWidth={1.2} />
        </g>
      ))}
      <T x={xp(16)} y={92} s={13} f={C.taupe} a="middle">lap</T>
      <circle cx={xp(inV)} cy={70} r={7} fill={C.cinnamon} />
      <T x={xp(inV)} y={52} s={13} f={C.cinnamon} a="middle">in</T>
      <circle cx={xp(outV)} cy={70} r={7} fill={C.caramel} />
      <T x={xp(outV)} y={52} s={13} f={C.caramel} a="middle" o={Math.abs(inV - outV) > 2 ? 1 : 0}>out</T>
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <path d={`M ${xp(outV)} 104 v 8 H ${xp(inV)} v -8`} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={(xp(outV) + xp(inV)) / 2} y={132} s={13} f={verdict ? C.caramel : C.crema} a="middle">{verdict ? `in − out = ${Math.round(gap)}: ${verdict}` : 'in − out = count'}</T>
      </g>
      {Array.from({ length: N }, (_, i) => <rect key={i} x={140 + i * 20} y={176} width={16} height={16} rx={2} fill={C.cocoa} stroke={C.taupe} strokeWidth={1} opacity={access} />)}
      <T x={30} y={190} s={13} f={C.latte} o={access}>&amp; mask</T>
      <Draw pts={[[xp(inV), 78], [strip(inV) + 8, 172]]} t={t} from={1.0} to={1.3} stroke={C.cinnamon} w={1.2} pen={false} />
      <Draw pts={[[xp(outV), 78], [strip(outV) + 8, 172]]} t={t} from={1.0} to={1.3} stroke={C.caramel} w={1.2} pen={false} />
      <g opacity={alt}>
        <T x={30} y={244} s={13} f={C.latte}>other fixes:</T>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={160 + i * 18} y={232} width={14} height={14} rx={2} fill={i === 7 ? 'none' : C.mocha} stroke={i === 7 ? C.cherryText : 'none'} strokeDasharray="2 2" />)}
        <T x={312} y={244} s={13} f={C.latte}>give up a slot</T>
        <rect x={160} y={270} width={44} height={22} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.2} />
        <T x={182} y={286} s={13} f={C.crema} a="middle">n</T>
        <T x={220} y={286} s={13} f={C.latte}>count every operation</T>
      </g>
    </Svg>
  );
}

// 7 · Full: a policy choice. A full four-slot ring takes one more write. Top: overwrite, the oldest is bumped
// out. Bottom: block, the write waits outside.
export function FullPolicy({ t }: StepCtx) {
  const arrive = easeOut(seg(t, 0.3, 0.8));
  const bump = easeInOut(seg(t, 1.0, 1.6));
  const wait = 0.5 + 0.5 * Math.sin(t * 6);
  const vals = ['0', '1', '2', '3'];
  return (
    <Svg label="A full four-slot ring receives one more write: one policy bumps out the oldest, the other makes the write wait" h={300}>
      <T x={30} y={30} s={14} f={C.caramel} serif o={easeOut(seg(t, 0.8, 1.1))}>overwrite</T>
      {vals.map((v, i) => <Cell key={i} x={180 + i * 48} y={14} v={i === 0 && bump > 0.5 ? '4' : v} f={i === 0 && bump > 0.5 ? C.caramel : C.crema} />)}
      <g opacity={1 - bump}>
        <Cell x={lerp(90, 180, bump)} y={14 - 40 * (1 - arrive)} v="4" f={C.caramel} o={arrive} />
      </g>
      {bump > 0 && <Cell x={180 - 70 * bump} y={14 + 40 * bump} v="0" f={C.cherryText} o={1 - bump} />}
      <T x={180} y={80} s={13} f={C.latte} o={easeOut(seg(t, 1.5, 1.9))}>oldest bumped out</T>
      <T x={30} y={146} s={14} f={C.cinnamon} serif o={easeOut(seg(t, 1.6, 1.9))}>block</T>
      {vals.map((v, i) => <Cell key={i} x={180 + i * 48} y={130} v={v} o={easeOut(seg(t, 1.6, 1.9))} />)}
      <Cell x={100} y={130} v="4" f={C.cinnamon} o={easeOut(seg(t, 1.8, 2.1)) * (0.55 + 0.45 * wait)} w={40} />
      <T x={180} y={196} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>the write waits</T>
      <Decode text="a choice, not arithmetic" t={t} at={2.3} dur={0.5} x={30} y={262} s={14} f={C.caramel} />
    </Svg>
  );
}

// 8 · Predict: overwrite or block? A full ring of recent readings with 4 arriving. After the answer the
// overwrite ring keeps going (4 replaces 0, then 5 replaces 1, leaving 2, 3, 4, 5); the block ring holds 4 at
// the door until a read frees a slot.
export function PolicyPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const p4 = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const p5 = answered ? easeInOut(seg(s, 0.9, 1.5)) : 0;
  const swap = (p: number, v: string, nv: string) => (p >= 1 ? nv : p > 0 ? '' : v);
  const ov = ['0', '1', '2', '3'].map((v, i) => (i === 0 ? swap(p4, v, '4') : i === 1 ? swap(p5, v, '5') : v));
  const blk = answered ? easeOut(seg(s, 1.7, 2.0)) : 0;
  const read = answered ? easeInOut(seg(s, 2.4, 3.0)) : 0;
  return (
    <Svg label="A full ring of the latest readings: the overwrite ring replaces the oldest; a ring that never loses data makes the write wait instead" h={300}>
      <T x={30} y={34} s={13} f={C.taupe}>latest readings</T>
      {ov.map((v, i) => <Cell key={i} x={260 + i * 48} y={14} v={v} f={(i === 0 && p4 >= 1) || (i === 1 && p5 >= 1) ? C.caramel : C.crema} />)}
      {!answered && <Cell x={190} y={14 + 4 * Math.sin(t * 4)} v="4" f={C.caramel} />}
      {answered && p4 < 1 && <Cell x={lerp(190, 260, p4)} y={14} v="4" f={C.caramel} o={1 - p4 * 0.6} />}
      {answered && p4 > 0 && p4 < 1 && <Cell x={260 - 60 * p4} y={14 + 40 * p4} v="0" f={C.cherryText} o={1 - p4} />}
      {answered && p5 > 0 && p5 < 1 && <Cell x={lerp(190, 308, p5)} y={14} v="5" f={C.caramel} o={1 - p5 * 0.6} />}
      {answered && p5 > 0 && p5 < 1 && <Cell x={308 - 60 * p5} y={14 + 40 * p5} v="1" f={C.cherryText} o={1 - p5} />}
      {!answered && <T x={300} y={140} s={16} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>one more reading: what happens?</T>}
      {answered && (
        <>
          <Decode text="left: 2, 3, 4, 5" t={s} at={1.5} dur={0.5} x={260} y={80} s={13} f={C.caramel} />
          <g opacity={blk}>
            <T x={30} y={166} s={13} f={C.cinnamon}>never-lose ring</T>
            {['0', '1', '2', '3'].map((v, i) => <Cell key={i} x={260 + i * 48} y={146} v={i === 0 ? swap(read, v, '4') : v} f={i === 0 && read >= 1 ? C.cinnamon : C.crema} />)}
            {read < 1 && <Cell x={lerp(190, 260, read)} y={146} v="4" f={C.cinnamon} o={read > 0 ? 1 : 0.5 + 0.4 * Math.sin(s * 8)} />}
            <T x={260} y={214} s={13} f={C.cinnamon} o={easeOut(seg(s, 1.9, 2.2)) * (1 - read)}>waits for a read</T>
            <T x={260} y={214} s={13} f={C.cinnamon} o={read}>a read freed a slot</T>
          </g>
          <Decode text="same write, two promises" t={s} at={3.0} dur={0.5} x={300} y={270} s={15} f={C.caramel} a="middle" />
        </>
      )}
    </Svg>
  );
}

// 9 · Boundedness as backpressure. Top: a fast producer fills a bounded ring; once full, it is held (wait) and
// emits only as fast as the slow consumer drains. Bottom: an unbounded array keeps growing toward the edge,
// never pausing the producer, until it hits the wall.
export function Backpressure({ t }: StepCtx) {
  const cap = 8;
  // bounded: produced fast (rate 6/s) but capped by consumption (rate 2/s) once the ring is full
  const consumed = Math.max(0, (t - 0.6) * 2);
  const wantFill = t * 6;
  const filled = Math.min(cap, wantFill - consumed);
  const held = wantFill - consumed > cap;
  const grow = clamp(seg(t, 0.4, 3.6));
  const len = 4 + grow * 29.5;
  const wall = len >= 33.4;
  return (
    <Svg label="A bounded ring makes a fast producer wait for a slow consumer; an unbounded array keeps growing until it runs out of room" h={300}>
      <T x={30} y={30} s={14} f={C.caramel} serif>bounded, block policy</T>
      <T x={30} y={70} s={13} f={C.latte}>producer</T>
      {Array.from({ length: cap }, (_, i) => <rect key={i} x={140 + i * 26} y={56} width={22} height={22} rx={2} fill={i < filled ? C.mocha : C.cocoa} stroke={C.crema} strokeWidth={1.2} />)}
      <T x={360} y={70} s={13} f={C.latte}>consumer</T>
      <T x={140} y={104} s={13} f={C.caramel} o={held ? 0.6 + 0.4 * Math.sin(t * 8) : 0}>full: producer waits</T>
      <T x={30} y={156} s={14} f={C.cinnamon} serif o={easeOut(seg(t, 0.4, 0.8))}>unbounded array</T>
      {Array.from({ length: Math.floor(len) }, (_, i) => <rect key={i} x={30 + i * 16} y={176} width={12} height={22} rx={2} fill={C.mocha} stroke={C.cinnamon} strokeWidth={1} />)}
      <line x1={572} y1={166} x2={572} y2={208} stroke={wall ? C.cherryText : C.mocha} strokeWidth={2} />
      <T x={570} y={230} s={13} f={C.cherryText} a="end" o={wall ? 1 : 0}>out of room, under peak load</T>
      <T x={30} y={230} s={13} f={C.latte} o={wall ? 0 : easeOut(seg(t, 1.0, 1.4))}>never pauses the producer</T>
      <T x={30} y={280} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.9))}>the wait is the backpressure</T>
    </Svg>
  );
}

// 10 · Prove it. A compiled benchmark takes the capacity as an argument; for 16, 256 and 4096 the modulo bar
// grows past the mask bar each time (shape only: the timings depend on the machine).
export function ProveIt({ t }: StepCtx) {
  const caps = ['16', '256', '4096'];
  return (
    <Svg label="Masking against modulo at capacities sixteen, two hundred fifty-six and four thousand ninety-six: modulo's bar is longer every time" h={300}>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <rect x={30} y={14} width={300} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} />
        <T x={42} y={33} s={13} f={C.crema}>compiled, capacity as argv</T>
      </g>
      <T x={30} y={64} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>compiler can&apos;t pre-trim it</T>
      {caps.map((c, r) => {
        const y = 86 + r * 60;
        const k = easeInOut(seg(t, 1.0 + r * 0.5, 1.8 + r * 0.5));
        return (
          <g key={c} opacity={easeOut(seg(t, 1.0 + r * 0.5, 1.2 + r * 0.5))}>
            <T x={30} y={y + 22} s={14} f={C.crema}>{c}</T>
            <rect x={110} y={y + 4} width={110 * k} height={14} rx={2} fill={C.caramel} />
            <rect x={110} y={y + 24} width={270 * k} height={14} rx={2} fill={C.cinnamon} />
            <Draw pts={[[400, y + 12], [406, y + 18], [418, y + 4]]} t={t} from={1.8 + r * 0.5} to={2.0 + r * 0.5} stroke={C.caramel} w={2.2} pen={false} />
          </g>
        );
      })}
      <T x={430} y={110} s={13} f={C.caramel} o={easeOut(seg(t, 2.0, 2.3))}>mask</T>
      <T x={430} y={128} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.0, 2.3))}>modulo</T>
      <T x={30} y={284} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>mask wins at every capacity tried</T>
    </Svg>
  );
}
