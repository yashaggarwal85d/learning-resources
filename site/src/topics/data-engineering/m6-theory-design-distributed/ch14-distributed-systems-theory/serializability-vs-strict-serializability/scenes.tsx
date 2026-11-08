import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's history strip (CHAPTER.md), now for whole transactions: one lane per client, each transaction a bar
// from begin to commit, a legal serial order a row of numbered slots underneath, a thread from each bar down to its
// slot. A slot order that breaks a read, or runs against real time, turns red. Histories are examples.py's: place-order
// writes the orders list over [0, 1]; the refresh starts at 1 and reads the old, empty list; the unrelated write and the
// independent read run one after the other on different objects. The map is examples.py's two axes, single versus
// multi-object by ordering strength, with the three documented claims from SYSTEM_CLAIMS.

type Pt = readonly [number, number];

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

/** History time to canvas x. */
const X = (h: number) => 170 + h * 170;

function Lane({ y, name, k = 1, x0 = 160 }: { y: number; name: string; k?: number; x0?: number }) {
  return (
    <g opacity={k}>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={C.secondary}>
        {name}
      </T>
      <line x1={x0} y1={y} x2={580} y2={y} stroke={C.band} strokeWidth={1.2} />
    </g>
  );
}

/** A transaction bar from begin to commit; `grow` draws it left to right as it runs. The label sits above the bar. */
function Txn({ y, start, end, label, grow = 1, f = C.focus }: { y: number; start: number; end: number; label: string; grow?: number; f?: string }) {
  if (grow <= 0) return null;
  const x0 = X(start), x1 = lerp(X(start), X(end), grow);
  return (
    <g>
      <rect x={x0} y={y - 11} width={Math.max(2, x1 - x0)} height={22} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} />
      <line x1={x0} y1={y - 16} x2={x0} y2={y + 16} stroke={f} strokeWidth={1.4} />
      {grow >= 1 && <line x1={x1} y1={y - 16} x2={x1} y2={y + 16} stroke={f} strokeWidth={1.4} />}
      <T x={x0} y={y - 22} s={13} f={f} o={easeOut(seg(grow, 0.5, 1))}>
        {label}
      </T>
    </g>
  );
}

/** One slot of a serial order: a numbered box that a transaction's name drops into. */
function Slot({ at: [x, y], n, label, k = 1, f = C.focus, w = 150 }: { at: Pt; n: string; label?: string; k?: number; f?: string; w?: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - 16} width={w} height={32} rx={4} fill="none" stroke={C.line} strokeDasharray="4 4" />
      <T x={x - w / 2 - 8} y={y + 5} s={13} a="end" f={C.quiet}>
        {n}
      </T>
      {label && k > 0 && (
        <g opacity={k} transform={`translate(0 ${((1 - k) * -18).toFixed(1)})`}>
          <rect x={x - w / 2} y={y - 16} width={w} height={32} rx={4} fill={C.panel} stroke={f} strokeWidth={1.5} />
          <T x={x} y={y + 5} s={13} a="middle" f={f}>
            {label}
          </T>
        </g>
      )}
    </g>
  );
}

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

/** A wall clock; `struck` crosses it out (no real-time rule), `k` fades it in. */
function Clock({ at: [x, y], k = 1, struck = 0, f = C.secondary, spin = 0 }: { at: Pt; k?: number; struck?: number; f?: string; spin?: number }) {
  if (k <= 0) return null;
  const a = -Math.PI / 2 + spin * Math.PI * 2;
  return (
    <g opacity={k}>
      <circle cx={x} cy={y} r={13} fill="none" stroke={f} strokeWidth={1.6} />
      <line x1={x} y1={y} x2={x + 9 * Math.cos(a)} y2={y + 9 * Math.sin(a)} stroke={f} strokeWidth={1.6} />
      <line x1={x} y1={y} x2={x + 6} y2={y} stroke={f} strokeWidth={1.6} />
      {struck > 0 && <line x1={x - 17} y1={y + 17} x2={lerp(x - 17, x + 17, struck)} y2={lerp(y + 17, y - 17, struck)} stroke={C.badText} strokeWidth={2.2} />}
    </g>
  );
}

// 1 · Place order runs and commits: "confirmed" pops at its end. The same client's refresh starts right after; the
// order list it shows comes back without the new row, which drops away red. A documentation badge stays ticked.
export function Hook({ t }: StepCtx) {
  const y = 110;
  const row = easeOut(seg(t, 0.9, 1.2));
  const gone = easeInOut(seg(t, 2.4, 2.9));
  return (
    <Svg label='a customer sees "confirmed" then refreshes and the new order is missing, on a store documented as serializable with no bug' h={300}>
      <Lane y={y} name="customer" k={easeOut(seg(t, 0, 0.4))} />
      <Txn y={y} start={0} end={1} label="place order" grow={easeOut(seg(t, 0.2, 0.9))} />
      <g opacity={easeOutBack(seg(t, 0.9, 1.2))}>
        <rect x={X(1) - 46} y={y + 24} width={92} height={26} rx={13} fill={C.focus} />
        <T x={X(1)} y={y + 42} s={13} a="middle" f={C.void} w={600}>
          confirmed
        </T>
      </g>
      <Txn y={y} start={1.15} end={2} label="refresh" grow={easeOut(seg(t, 1.6, 2.3))} />
      <rect x={340} y={180} width={230} height={96} rx={6} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={356} y={202} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
        my orders
      </T>
      <rect x={356} y={214} width={198} height={22} rx={3} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={366} y={230} s={13} f={C.quiet} o={easeOut(seg(t, 0.8, 1.1))}>
        last week
      </T>
      <g opacity={row * (1 - gone * 0.75)} transform={`translate(${(gone * 24).toFixed(1)} 0)`}>
        <rect x={356} y={244} width={198} height={22} rx={3} fill="none" stroke={gone > 0.3 ? C.badText : C.focus} strokeDasharray={gone > 0.3 ? '4 4' : undefined} />
        <T x={366} y={260} s={13} f={gone > 0.3 ? C.badText : C.focus}>
          {gone > 0.3 ? 'gone' : 'new order'}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <rect x={30} y={190} width={240} height={60} rx={6} fill="none" stroke={C.line} />
        <T x={46} y={214} s={13} f={C.secondary}>
          docs: serializable
        </T>
        <T x={46} y={238} s={13} f={C.secondary}>
          bug tracker: empty
        </T>
      </g>
      <Check at={[246, 210]} t={t} from={3.6} />
      <Check at={[246, 234]} t={t} from={3.8} />
      <Reticle x={455} y={255} w={210} h={30} t={t} at={2.9} color={C.badText} />
    </Svg>
  );
}

// 2 · The hook's history, frozen, and the question. After the pick, the refresh's bar lifts out of real time and drops
// into slot one of a serial order, place order into slot two: legal, and no replica anywhere in the picture.
export function PredictForbidden({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const y = 80;
  return (
    <Svg label="does the serializable definition forbid the missing-order refresh, allow it outright, or allow it only through a lagging replica?" h={300}>
      <Lane y={y} name="customer" />
      <Txn y={y} start={0} end={1} label="place order" grow={easeOut(seg(t, 0, 0.5))} />
      <Txn y={y} start={1.15} end={2} label="refresh: empty" grow={easeOut(seg(t, 0.3, 0.8))} f={C.badText} />
      {!on && (
        <T x={300} y={170} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 0.9, 1.4))}>
          forbidden by serializable?
        </T>
      )}
      {on && (
        <g>
          <Slot at={[230, 170]} n="first" label="refresh" k={easeOutBack(seg(s, 0.6, 1.0))} />
          <Slot at={[430, 170]} n="then" label="place order" k={easeOutBack(seg(s, 0.9, 1.3))} />
          <Draw pts={[[X(1.5), y + 16], [230, 154]]} t={s} from={0.3} to={0.7} stroke={C.secondary} w={1.5} pen={false} />
          <Draw pts={[[X(0.5), y + 16], [430, 154]]} t={s} from={0.6} to={1.0} stroke={C.secondary} w={1.5} pen={false} />
          <Check at={[540, 170]} t={s} from={1.4} />
          <Decode text="allowed outright" t={s} at={1.7} x={300} y={240} s={16} a="middle" f={C.focus} w={600} />
          <T x={300} y={270} s={13} a="middle" f={C.quiet} o={easeOut(seg(s, 2.2, 2.6))}>
            no replica involved
          </T>
          <Reticle x={300} y={234} w={200} h={34} t={s} at={2.4} />
        </g>
      )}
    </Svg>
  );
}

// 3 · Transactions as whole units: each drops into the serial-order slots. The checker tries place order first and the
// refresh's read of an empty list breaks it (red); it swaps them, the read matches, and the order holds. The clock
// stays crossed out: no rule ties slots to real time.
export function RevealSerializable({ t }: StepCtx) {
  const y = 60;
  const swap = easeInOut(seg(t, 2.2, 2.8));
  const bad = easeOut(seg(t, 1.5, 1.8)) * (1 - easeOut(seg(t, 2.0, 2.2)));
  const xa = lerp(190, 420, swap), xb = lerp(420, 190, swap);
  return (
    <Svg label="serializability places every transaction, not operation, in one legal total order with no real-time rule; the hook's history has a legal order with the refresh placed before the order" h={300}>
      <Lane y={y} name="customer" />
      <Txn y={y} start={0} end={1} label="place order" />
      <Txn y={y} start={1.15} end={2} label="refresh: empty" f={C.secondary} />
      <T x={20} y={130} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.6))}>
        one order, whole transactions
      </T>
      <Slot at={[190, 170]} n="first" w={170} />
      <Slot at={[420, 170]} n="then" w={170} />
      <g opacity={easeOutBack(seg(t, 0.5, 0.9))}>
        <rect x={xa - 85} y={154} width={170} height={32} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.5} />
        <T x={xa} y={175} s={13} a="middle" f={C.focus}>
          place order
        </T>
      </g>
      <g opacity={easeOutBack(seg(t, 0.8, 1.2))}>
        <rect x={xb - 85} y={154} width={170} height={32} rx={4} fill={C.panel} stroke={bad > 0.2 ? C.badText : C.focus} strokeWidth={1.5} />
        <T x={xb} y={175} s={13} a="middle" f={bad > 0.2 ? C.badText : C.focus}>
          refresh: empty
        </T>
      </g>
      {bad > 0 && (
        <T x={420} y={214} s={13} a="middle" f={C.badText} o={bad}>
          but the list had it
        </T>
      )}
      <Cross at={[540, 170]} o={bad} />
      <Check at={[540, 170]} t={t} from={2.9} />
      <Clock at={[560, 130]} k={easeOut(seg(t, 3.0, 3.3))} struck={easeOut(seg(t, 3.3, 3.6))} />
      <T x={540} y={135} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 3.3, 3.6))}>
        no clock rule
      </T>
      <Decode text="legal: refresh first" t={t} at={3.2} x={300} y={262} s={16} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={256} w={240} h={34} t={t} at={4.0} />
    </Svg>
  );
}

// 4 · The same history, the same slots, one more rule: an arrow from place order's commit to the refresh's begin says
// "finished before began". Refresh-first now runs against that arrow (red); place-order-first still breaks the read
// (red). No order survives both.
export function RevealStrict({ t }: StepCtx) {
  const y = 60;
  const rule = easeOut(seg(t, 0.4, 0.9));
  const o1 = easeOut(seg(t, 1.4, 1.8));
  const o2 = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="strict serializability adds one rule, if a transaction finished before another began the serial order must agree; run on the identical hook history, no order satisfies both rules" h={300}>
      <Lane y={y} name="customer" />
      <Txn y={y} start={0} end={1} label="place order" />
      <Txn y={y} start={1.15} end={2} label="refresh: empty" f={C.secondary} />
      <Clock at={[560, 22]} k={rule} spin={easeInOut(seg(t, 0.4, 1.2))} f={C.focus} />
      <path d={`M${X(1)} ${y + 22} Q ${X(1.07)} ${y + 40} ${X(1.15)} ${y + 22}`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={rule} />
      <T x={X(1.07)} y={y + 58} s={13} a="middle" f={C.focus} o={rule}>
        ends before begins
      </T>
      <g opacity={o1}>
        <T x={20} y={160} s={13} f={C.secondary}>
          refresh first
        </T>
        <rect x={160} y={144} width={300} height={28} rx={4} fill="none" stroke={o1 > 0.9 && t > 1.9 ? C.badText : C.line} strokeWidth={1.4} />
        <T x={310} y={163} s={13} a="middle" f={t > 1.9 ? C.badText : C.primary}>
          {t > 1.9 ? 'runs against the clock' : 'refresh, place order'}
        </T>
      </g>
      <Cross at={[490, 158]} o={easeOut(seg(t, 1.9, 2.1))} />
      <g opacity={o2}>
        <T x={20} y={212} s={13} f={C.secondary}>
          order first
        </T>
        <rect x={160} y={196} width={300} height={28} rx={4} fill="none" stroke={t > 2.9 ? C.badText : C.line} strokeWidth={1.4} />
        <T x={310} y={215} s={13} a="middle" f={t > 2.9 ? C.badText : C.primary}>
          {t > 2.9 ? 'breaks the read' : 'place order, refresh'}
        </T>
      </g>
      <Cross at={[490, 210]} o={easeOut(seg(t, 2.9, 3.1))} />
      <Decode text="no order exists" t={t} at={3.4} x={300} y={274} s={16} a="middle" f={C.badText} w={600} />
      <Reticle x={300} y={268} w={200} h={34} t={t} at={4.1} color={C.badText} />
    </Svg>
  );
}

// 5 · Two real psql sessions, twice. Top: session one commits, then session two begins and reads: it sees the row
// (tick). Bottom: session two is already open and has read once; session one commits mid-flight; session two's next
// read, well after the commit, still comes back without it (red). A snapshot marker shows where each read looks.
export function RevealMeasured({ t }: StepCtx) {
  const Xm = (h: number) => 160 + h * 130;
  const seen = easeOut(seg(t, 1.2, 1.5));
  const missed = easeOut(seg(t, 3.0, 3.3));
  const bar = (y: number, a: number, b: number, g: number, f: string = C.focus) =>
    g > 0 ? <rect x={Xm(a)} y={y - 10} width={Math.max(2, (Xm(b) - Xm(a)) * g)} height={20} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} /> : null;
  const snap = (x: number, y: number, k: number) => (k > 0 ? <rect x={x - 2} y={y - 15} width={4} height={30} rx={1} fill={C.second} opacity={k} /> : null);
  return (
    <Svg label="measured on a real PostgreSQL server: a non-overlapping transaction saw a sibling commit; an already-open transaction did not see a sibling that committed mid-flight, even on a later read" h={300}>
      <T x={20} y={24} s={13} f={C.secondary}>
        opened after the commit
      </T>
      <Lane y={52} name="psql one" x0={150} />
      <Lane y={92} name="psql two" x0={150} />
      {bar(52, 0, 1, easeOut(seg(t, 0.1, 0.5)))}
      <T x={Xm(1) + 8} y={57} s={13} f={C.focus} o={easeOut(seg(t, 0.5, 0.7))}>
        commit
      </T>
      {bar(92, 1.3, 2.4, easeOut(seg(t, 0.7, 1.1)))}
      {snap(Xm(1.4), 92, easeOut(seg(t, 0.8, 1.0)))}
      <T x={Xm(2.4) + 10} y={97} s={13} f={C.focus} o={seen}>
        saw it
      </T>
      <Check at={[560, 90]} t={t} from={1.4} />
      <line x1={20} y1={124} x2={580} y2={124} stroke={C.band} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <g opacity={easeOut(seg(t, 1.7, 2.0))}>
        <T x={20} y={152} s={13} f={C.secondary}>
          open across the commit
        </T>
        <Lane y={186} name="psql one" x0={150} />
        <Lane y={232} name="psql two" x0={150} />
      </g>
      {bar(232, 0, 2.6, easeOut(seg(t, 1.9, 2.8)), missed > 0.5 ? C.badText : C.focus)}
      {snap(Xm(0.25), 232, easeOut(seg(t, 2.0, 2.2)))}
      {bar(186, 0.6, 1.3, easeOut(seg(t, 2.2, 2.6)))}
      <T x={Xm(1.3) + 8} y={191} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 2.8))}>
        commit
      </T>
      {snap(Xm(2.1), 232, missed)}
      <Draw pts={[[Xm(2.1), 232], [Xm(0.25), 232]]} t={t} from={2.7} to={3.0} stroke={C.second} w={1.6} dash="4 4" />
      <T x={Xm(2.1)} y={270} s={13} a="middle" f={C.badText} o={missed}>
        next read: missed it
      </T>
      <T x={Xm(0.25)} y={270} s={13} a="middle" f={C.second} o={easeOut(seg(t, 2.2, 2.5))}>
        snapshot
      </T>
      <Reticle x={Xm(2.1)} y={262} w={170} h={30} t={t} at={3.6} color={C.badText} />
    </Svg>
  );
}

const SINGLE = ['linearizable', 'sequential', 'causal', 'eventual'];
const MULTI = ['strict serializable', 'serializable', 'snapshot isolation', 'read committed'];
const GX = [40, 250], GY = 68, GH = 50, CW = 190;
const rowY = (r: number) => GY + r * GH + 21;

function Cell({ col, row, label, k, lit = false }: { col: number; row: number; label: string; k: number; lit?: boolean }) {
  const x = GX[col], y = GY + row * GH;
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={CW} height={42} rx={4} fill={lit ? C.panel : 'none'} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.6 : 1} />
      <T x={x + CW / 2} y={y + 26} s={13} a="middle" f={lit ? C.focus : C.secondary}>
        {label}
      </T>
    </g>
  );
}

/** A system's claim, flying in from the right margin to its place beside a cell, with a connector to the cell. */
function Claim({ y, label, k }: { y: number; label: string; k: number }) {
  if (k <= 0) return null;
  const e = easeInOut(k);
  const cy = lerp(y - 40, y, e);
  return (
    <g opacity={Math.min(1, k * 2)}>
      {e > 0.9 && <line x1={GX[1] + CW} y1={y} x2={473} y2={y} stroke={C.focus} strokeWidth={1.4} />}
      <rect x={473} y={cy - 11} width={104} height={22} rx={11} fill={C.focus} />
      <T x={525} y={cy + 5} s={13} a="middle" f={C.void} w={600}>
        {label}
      </T>
    </g>
  );
}

// 6 · The two-axis map builds: a one-object column and a many-object column, ordering strength rising to the top.
// Three claim chips arrive from their own documents: etcd beside strict serializable, Spanner beside the same cell
// (its own name for it decodes underneath), Postgres one rung down beside serializable.
export function RevealMap({ t }: StepCtx) {
  const cellK = (r: number, c: number) => easeOut(seg(t, 0.2 + r * 0.15 + c * 0.1, 0.5 + r * 0.15 + c * 0.1));
  return (
    <Svg label="the two-axis map: single/multi-object by ordering strength, with etcd's strict-serializable claim, Spanner's external-consistency claim, and Postgres's own serializable-not-strict wording, each quoted from its own documentation" h={320}>
      <T x={20} y={26} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        stronger
      </T>
      <Draw pts={[[24, GY + 4 * GH - 8], [24, 38]]} t={t} from={0} to={0.6} stroke={C.quiet} w={1.2} pen={false} />
      <T x={GX[0] + CW / 2} y={GY - 12} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        one object
      </T>
      <T x={GX[1] + CW / 2} y={GY - 12} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.1, 0.4))}>
        many objects
      </T>
      {SINGLE.map((m, i) => (
        <Cell key={m} col={0} row={i} label={m} k={cellK(i, 0)} />
      ))}
      {MULTI.map((m, i) => (
        <Cell key={m} col={1} row={i} label={m} k={cellK(i, 1)} lit={(i === 0 && t > 1.6) || (i === 1 && t > 3.4)} />
      ))}
      <Claim y={rowY(0) - 12} label="etcd" k={seg(t, 1.2, 1.7)} />
      <Claim y={rowY(0) + 14} label="Spanner" k={seg(t, 2.1, 2.6)} />
      <Claim y={rowY(1)} label="Postgres" k={seg(t, 3.0, 3.5)} />
      <Decode text="Spanner's name: external consistency" t={t} at={2.6} x={300} y={300} s={14} a="middle" f={C.secondary} w={500} />
      <Reticle x={GX[1] + CW / 2} y={rowY(1)} w={CW + 12} h={54} t={t} at={4.0} />
    </Svg>
  );
}

// 7 · An unrelated write on one lane, an independent read on another that starts after it ends and touches a different
// object. A pale-blue gap marks "no link". Both slot orders tick, and the two slot boxes swap places freely.
export function RevealReverse({ t }: StepCtx) {
  const swap = easeInOut(seg(t, 2.4, 3.0));
  const xa = lerp(190, 420, swap), xb = lerp(420, 190, swap);
  return (
    <Svg label="a transaction starting after an unrelated write finishes, and never reading that object, can legally be placed before it in the serial order — no causal link forces either order" h={300}>
      <Lane y={56} name="client one" />
      <Lane y={124} name="client two" />
      <Txn y={56} start={0} end={0.9} label="write x" grow={easeOut(seg(t, 0.1, 0.6))} />
      <Txn y={124} start={1.1} end={2} label="read y" grow={easeOut(seg(t, 0.5, 1.0))} />
      <line x1={X(1)} y1={74} x2={X(1)} y2={106} stroke={C.second} strokeWidth={1.6} strokeDasharray="3 4" opacity={easeOut(seg(t, 1.1, 1.4))} />
      <T x={X(1) - 12} y={95} s={13} a="end" f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        nothing links them
      </T>
      <Slot at={[190, 196]} n="first" w={170} />
      <Slot at={[420, 196]} n="then" w={170} />
      <g opacity={easeOutBack(seg(t, 1.5, 1.9))}>
        <rect x={xa - 85} y={180} width={170} height={32} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.5} />
        <T x={xa} y={201} s={13} a="middle" f={C.focus}>
          write x
        </T>
      </g>
      <g opacity={easeOutBack(seg(t, 1.7, 2.1))}>
        <rect x={xb - 85} y={180} width={170} height={32} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.5} />
        <T x={xb} y={201} s={13} a="middle" f={C.focus}>
          read y
        </T>
      </g>
      <Check at={[532, 196]} t={t} from={2.1} />
      <Check at={[560, 196]} t={t} from={3.1} />
      <Decode text="free to reverse" t={t} at={3.3} x={300} y={266} s={16} a="middle" f={C.focus} w={600} />
      <Reticle x={305} y={196} w={440} h={46} t={t} at={4.0} color={C.second} />
    </Svg>
  );
}

// 8 · Four panels build in turn: two slots and a crossed clock (serializable); the same slots with the clock restored
// (strict); a psql lane with its commit and a missed read (measured); the map with one lit cell (placed).
export function Recap({ t }: StepCtx) {
  const P = [[20, 20], [310, 20], [20, 160], [310, 160]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={124} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 112} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  const slots = (i: number) => (
    <g opacity={k(i)}>
      {[0, 1].map((j) => (
        <rect key={j} x={P[i][0] + 24 + j * 84} y={P[i][1] + 30} width={72} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
      ))}
    </g>
  );
  return (
    <Svg label="serializability is one legal total order with no real-time rule; strict serializability adds real time back; measured directly on Postgres; placed on the two-axis map from documented claims" h={300}>
      {box(0, 'serializable: no clock')}
      {slots(0)}
      <Clock at={[P[0][0] + 228, P[0][1] + 43]} k={k(0)} struck={easeOut(seg(t, 0.6, 0.9))} />
      {box(1, 'strict: clock back')}
      {slots(1)}
      <Clock at={[P[1][0] + 228, P[1][1] + 43]} k={k(1)} f={C.focus} spin={easeInOut(seg(t, 1.2, 1.8))} />
      {box(2, 'measured on Postgres')}
      <g opacity={k(2)}>
        <line x1={P[2][0] + 20} y1={P[2][1] + 30} x2={P[2][0] + 250} y2={P[2][1] + 30} stroke={C.band} />
        <line x1={P[2][0] + 20} y1={P[2][1] + 66} x2={P[2][0] + 250} y2={P[2][1] + 66} stroke={C.band} />
        <rect x={P[2][0] + 70} y={P[2][1] + 21} width={60} height={18} rx={3} fill={C.panel} stroke={C.focus} />
        <rect x={P[2][0] + 30} y={P[2][1] + 57} width={200} height={18} rx={3} fill={C.panel} stroke={easeOut(seg(t, 2.0, 2.2)) > 0.5 ? C.badText : C.focus} />
      </g>
      {box(3, 'placed from the docs')}
      <g opacity={k(3)}>
        {[0, 1, 2, 3].map((r) =>
          [0, 1].map((c) => <rect key={`${r}${c}`} x={P[3][0] + 70 + c * 70} y={P[3][1] + 14 + r * 20} width={62} height={15} rx={2} fill={r === 0 && c === 1 && t > 2.9 ? C.focus : 'none'} stroke={C.line} />),
        )}
      </g>
      <Reticle x={P[1][0] + 135} y={P[1][1] + 62} w={276} h={130} t={t} at={3.6} />
    </Svg>
  );
}

// 9 · One lane with three transactions back to back, no overlap. After the pick, each bar's thread runs straight down
// to its slot; none cross, the clock ticks, and "only one order" lands.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const y = 84;
  const B = [[0, 0.8], [0.9, 1.6], [1.7, 2.3]] as const;
  return (
    <Svg label="a database runs every transaction to completion, one at a time, before the next starts — is that database strictly serializable?" h={300}>
      <Lane y={y} name="the database" />
      {B.map(([a, b], i) => (
        <Txn key={i} y={y} start={a} end={b} label={['first', 'second', 'third'][i]} grow={easeOut(seg(t, 0.1 + i * 0.4, 0.5 + i * 0.4))} />
      ))}
      {!on && (
        <T x={300} y={180} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.4, 1.9))}>
          strictly serializable?
        </T>
      )}
      {on && (
        <g>
          {B.map(([a, b], i) => {
            const mx = (X(a) + X(b)) / 2;
            return (
              <g key={i}>
                <Draw pts={[[mx, y + 16], [mx, 164]]} t={s} from={0.3 + i * 0.25} to={0.6 + i * 0.25} stroke={C.focus} w={1.8} />
                <rect x={mx - 40} y={164} width={80} height={28} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} opacity={easeOutBack(seg(s, 0.6 + i * 0.25, 0.9 + i * 0.25))} />
                <T x={mx} y={183} s={13} a="middle" f={C.focus} o={easeOut(seg(s, 0.6 + i * 0.25, 0.9 + i * 0.25))}>
                  {['one', 'two', 'three'][i]}
                </T>
              </g>
            );
          })}
          <Clock at={[560, 40]} k={easeOut(seg(s, 1.3, 1.6))} f={C.focus} spin={easeInOut(seg(s, 1.4, 2.0))} />
          <Decode text="only one order, already in time" t={s} at={1.8} x={300} y={256} s={16} a="middle" f={C.focus} w={600} />
          <Reticle x={300} y={250} w={330} h={34} t={s} at={2.5} />
        </g>
      )}
    </Svg>
  );
}
