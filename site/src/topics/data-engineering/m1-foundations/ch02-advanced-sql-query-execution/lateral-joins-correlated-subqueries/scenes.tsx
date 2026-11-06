import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the outer row under the spotlight and the rows it picks, cherryText = the blocked or
// empty case, crema = data, taupe = structure. Customers c1..c4 own 5, 2, 0 and 4 orders; the cap is 3.

const OWN = [5, 2, 0, 4];
const NAMES = ['c1', 'c2', 'c3', 'c4'];
const PICK = OWN.map((n) => Math.min(n, 3));

function Customers({ lit = -1, x = 25 }: { lit?: number; x?: number }) {
  return (
    <g>
      {NAMES.map((n, i) => (
        <g key={n}>
          <rect x={x} y={44 + i * 62} width={80} height={44} rx={8} fill={C.cocoa} stroke={lit === i ? C.caramel : C.mocha} strokeWidth={lit === i ? 3 : 1} />
          <T x={x + 40} y={72 + i * 62} s={14} f={C.crema} a="middle">
            {n}
          </T>
        </g>
      ))}
    </g>
  );
}
function OrderRow({ i, k, picked, o = 1 }: { i: number; k: number; picked: boolean; o?: number }) {
  return <rect x={200 + k * 44} y={52 + i * 62} width={36} height={28} rx={6} fill={picked ? C.caramel : C.cocoa} stroke={picked ? C.caramel : C.mocha} opacity={o} />;
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

// 1 · The question. The customers arrive, then each one's orders drop in beside it; then a dashed "newest 3" frame
// pulses on every row: whether an order qualifies depends on its own customer's other orders.
export function Question({ t }: StepCtx) {
  const frame = t > 2.0 ? 0.55 + 0.45 * Math.sin((t - 2.0) * 5) : 0;
  return (
    <Svg label="Four customers and their orders; the question is the newest 3 of each customer's own orders" h={320}>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <Customers />
      </g>
      {OWN.map((n, i) =>
        Array.from({ length: n }, (_, k) => {
          const d = easeOutBack(seg(t, 0.4 + i * 0.3 + k * 0.06, 0.7 + i * 0.3 + k * 0.06));
          return d > 0 ? (
            <g key={`${i}-${k}`} transform={`translate(0 ${(1 - clamp(d)) * -16})`}>
              <OrderRow i={i} k={k} picked={false} o={clamp(d)} />
            </g>
          ) : null;
        }),
      )}
      {frame > 0 &&
        OWN.map((n, i) =>
          n > 0 ? (
            <rect key={i} x={195} y={47 + i * 62} width={Math.min(n, 3) * 44 + 2} height={38} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={frame} />
          ) : null,
        )}
      <T x={300} y={308} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.4))}>
        newest 3 of each customer's own orders
      </T>
    </Svg>
  );
}

// 2 · The wall.
export function Wall({ t }: StepCtx) {
  const down = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="Without LATERAL a subquery cannot see the outer row; with it, the wall is gone" h={300}>
      <rect x={30} y={70} width={150} height={60} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={105} y={106} s={14} f={C.crema} a="middle">
        customers c
      </T>
      <rect x={380} y={70} width={190} height={60} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={475} y={106} s={14} f={C.crema} a="middle">
        (subquery) o
      </T>
      <rect x={265} y={50} width={14} height={100 * (1 - down) + 6} rx={4} fill={C.cherryText} opacity={0.4 + 0.6 * (1 - down)} />
      <T x={272} y={44} s={13} f={C.cherryText} a="middle" o={1 - down}>
        cannot see c.customer_id
      </T>
      <line x1={180} y1={100} x2={380} y2={100} stroke={C.caramel} strokeWidth={3} opacity={down} />
      <T x={280} y={194} s={16} f={C.caramel} a="middle" w={700} o={down}>
        LATERAL: may use c.customer_id
      </T>
    </Svg>
  );
}

// 3 · The spotlight sweeps.
export function Spotlight({ t }: StepCtx) {
  const p = clamp(t / 4.4) * 4;
  const lit = Math.min(3, Math.floor(p));
  return (
    <Svg label="For each customer the subquery reruns and keeps the newest 3 of that customer's orders" h={320}>
      <Customers lit={lit} />
      {OWN.map((n, i) =>
        Array.from({ length: n }, (_, k) => {
          const done = i < lit || (i === lit && p - lit > 0.4);
          return <OrderRow key={`${i}-${k}`} i={i} k={k} picked={done && k < 3} />;
        }),
      )}
      <T x={470} y={72 + lit * 62} s={14} f={C.caramel}>{`keeps ${PICK[lit]}`}</T>
    </Svg>
  );
}

// 4 · Predict: count. A dashed cap line sits after the third order. After the answer each customer's picks light in
// turn and the running total climbs 3, 5, 5, 8; c3, with nothing to join, fades out of the result.
export function CountPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const step = (i: number) => (answered ? seg(s, 0.2 + i * 0.4, 0.5 + i * 0.4) : 0);
  const total = PICK.reduce((acc, n, i) => acc + (step(i) >= 1 ? n : 0), 0);
  const gone = step(2);
  return (
    <Svg label="CROSS JOIN LATERAL returns 3, 2, 0 and 3 rows per customer, 8 in all; the customer with no orders vanishes" h={300}>
      {NAMES.map((n, i) => (
        <g key={n} opacity={i === 2 ? 1 - 0.75 * gone : 1}>
          <rect x={25} y={44 + i * 62} width={80} height={44} rx={8} fill={C.cocoa} stroke={step(i) > 0 && i !== 2 ? C.caramel : C.mocha} strokeWidth={step(i) > 0 && i !== 2 ? 2 : 1} />
          <T x={65} y={72 + i * 62} s={14} f={C.crema} a="middle">
            {n}
          </T>
        </g>
      ))}
      {OWN.map((n, i) => Array.from({ length: n }, (_, k) => <OrderRow key={`${i}-${k}`} i={i} k={k} picked={k < 3 && step(i) > (k + 1) / 4} o={k < 3 ? 1 : 0.3} />))}
      <line x1={330} y1={40} x2={330} y2={286} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={338} y={34} s={13} f={C.latte}>
        cap 3
      </T>
      {!answered && (
        <T x={470} y={160} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      {answered && (
        <T x={470} y={160} s={24} f={C.caramel} a="middle" w={700}>
          {total} rows
        </T>
      )}
    </Svg>
  );
}

// 5 · LEFT JOIN LATERAL. The cross-join result shows with c3 missing; then c3 slides back in with a dashed NULL box
// beside it, and the count turns from 8 to 9.
export function LeftKeep({ t }: StepCtx) {
  const back = easeOutBack(seg(t, 1.0, 1.6));
  const nul = easeOut(seg(t, 1.6, 2.1));
  return (
    <Svg label="With LEFT JOIN LATERAL the customer with no orders still appears once, with NULLs: nine rows instead of eight" h={300}>
      {NAMES.map((n, i) => {
        const k = i === 2 ? back : 1;
        return k > 0 ? (
          <g key={n} opacity={clamp(k)} transform={`translate(${(1 - clamp(k)) * -40} 0)`}>
            <rect x={25} y={44 + i * 62} width={80} height={44} rx={8} fill={C.cocoa} stroke={i === 2 ? C.caramel : C.mocha} strokeWidth={i === 2 ? 2 : 1} />
            <T x={65} y={72 + i * 62} s={14} f={C.crema} a="middle">
              {n}
            </T>
          </g>
        ) : null;
      })}
      {PICK.map((n, i) => Array.from({ length: n }, (_, k) => <OrderRow key={`${i}-${k}`} i={i} k={k} picked />))}
      <rect x={200} y={52 + 2 * 62} width={80} height={28} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={nul} />
      <T x={290} y={72 + 2 * 62} s={13} f={C.latte} o={nul}>
        NULLs, but c3 is kept
      </T>
      <T x={470} y={160} s={22} f={C.caramel} a="middle" w={700}>
        {nul >= 1 ? 9 : 8} rows
      </T>
    </Svg>
  );
}

// 6 · Not just an anti-join. The four customers pass the anti-join's yes/no gate and only c3 comes out, with nothing
// attached. The LATERAL row keeps all four, and each one's best order slides in to attach (c3 gets a dashed NULL).
export function NotAntiJoin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.7));
  const out = easeInOut(seg(t, 0.7, 1.4));
  const b = easeOut(seg(t, 1.7, 2.1));
  return (
    <Svg label="An anti-join returns only the customer with no match; LATERAL returns everyone and the best match's own columns" h={300}>
      <T x={25} y={40} s={15} f={C.latte} o={a}>
        anti-join
      </T>
      {NAMES.map((n, i) => {
        const keep = i === 2;
        const x = lerp(25 + i * 60, keep ? 300 : 25 + i * 60, out);
        return (
          <g key={n} opacity={a * (keep ? 1 : 1 - 0.8 * out)}>
            <rect x={x} y={56} width={52} height={36} rx={8} fill={C.cocoa} stroke={keep && out > 0.5 ? C.caramel : C.mocha} />
            <T x={x + 26} y={79} s={14} f={C.crema} a="middle">
              {n}
            </T>
          </g>
        );
      })}
      <line x1={270} y1={50} x2={270} y2={98} stroke={C.latte} strokeWidth={2} strokeDasharray="4 3" opacity={a} />
      <T x={370} y={79} s={13} f={C.latte} o={out}>
        yes/no only
      </T>
      <T x={25} y={150} s={15} f={C.caramel} o={b}>
        LEFT JOIN LATERAL
      </T>
      {NAMES.map((n, i) => {
        const att = easeOutBack(seg(t, 2.1 + i * 0.2, 2.4 + i * 0.2));
        return (
          <g key={n} opacity={b}>
            <rect x={25 + i * 140} y={166} width={52} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} />
            <T x={51 + i * 140} y={189} s={14} f={C.crema} a="middle">
              {n}
            </T>
            {att > 0 && (
              <rect
                x={lerp(25 + i * 140 + 120, 25 + i * 140 + 58, clamp(att))}
                y={172}
                width={60}
                height={24}
                rx={6}
                fill={i === 2 ? 'none' : C.caramel}
                stroke={i === 2 ? C.latte : C.caramel}
                strokeDasharray={i === 2 ? '4 3' : undefined}
                opacity={clamp(att)}
              />
            )}
          </g>
        );
      })}
      <T x={25} y={240} s={13} f={C.latte} o={easeOut(seg(t, 2.9, 3.3))}>
        everyone, plus the best match's own columns
      </T>
    </Svg>
  );
}

// 7 · Dialects. Each LATERAL form arrives, then its APPLY twin slides in beneath and an equals sign draws between them.
export function Dialects({ t }: StepCtx) {
  const rows = [
    ['JOIN LATERAL', 'CROSS APPLY'],
    ['LEFT JOIN LATERAL … ON true', 'OUTER APPLY'],
  ];
  return (
    <Svg label="PostgreSQL LATERAL forms and the SQL Server APPLY forms that match them one to one" h={260}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 1.0, 0.6 + i * 1.0));
        const b = easeOut(seg(t, 0.7 + i * 1.0, 1.2 + i * 1.0));
        const y = 60 + i * 90;
        return (
          <g key={r[0]}>
            <T x={25} y={y} s={15} f={C.caramel} w={700} o={a}>
              {r[0]}
            </T>
            <g opacity={b} transform={`translate(${(1 - b) * 80} 0)`}>
              <T x={60} y={y + 30} s={14} f={C.cinnamon}>
                {r[1]}
              </T>
            </g>
            <T x={25} y={y + 30} s={14} f={C.latte} o={easeOut(seg(t, 1.1 + i * 1.0, 1.4 + i * 1.0))}>
              =
            </T>
          </g>
        );
      })}
      <T x={25} y={242} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        one to one: translating is mechanical
      </T>
    </Svg>
  );
}

// 8 · Pull-up. The subquery box lifts out of "foo, LATERAL (…)" and merges with foo into one join box; then foo and
// bar swap places inside it, because a plain join can be reordered.
export function PullUp({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 0.5, 1.4));
  const swap = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="A simple equality subquery is pulled up into an ordinary join, which can then be reordered like any join" h={280}>
      <g opacity={lift < 0.5 ? 1 - 2 * lift : 0}>
        <rect x={30} y={70} width={200} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
        <T x={130} y={101} s={13} f={C.crema} a="middle">
          foo, LATERAL (…)
        </T>
      </g>
      <g opacity={lift >= 0.5 ? 2 * lift - 1 : 0}>
        <rect x={lerp(30, 330, lift)} y={70} width={240} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={lerp(30, 330, lift) + 120} y={101} s={14} f={C.latte} a="middle">
          JOIN
        </T>
        <T x={lerp(30, 330, lift) + lerp(45, 195, swap)} y={101 - 22 * Math.sin(Math.PI * swap)} s={14} f={C.crema} a="middle">
          foo
        </T>
        <T x={lerp(30, 330, lift) + lerp(195, 45, swap)} y={101 + 22 * Math.sin(Math.PI * swap)} s={14} f={C.crema} a="middle">
          bar
        </T>
      </g>
      <T x={300} y={190} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>
        same result, reorderable like any join
      </T>
    </Svg>
  );
}

// 9 · Predict: limit blocks pull-up. Before the answer an arrow keeps reaching toward a plain join. After it the arrow
// breaks with a cross, and a loop arrow circles the box: it stays a per-row loop.
export function LimitPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const reach = answered ? 1 : 0.5 + 0.5 * Math.sin(t * 3);
  const loop = answered ? easeOut(seg(s, 0.6, 1.2)) : 0;
  return (
    <Svg label="Adding ORDER BY and LIMIT to the subquery blocks the pull-up: it stays a per-row nested loop" h={280}>
      <rect x={25} y={70} width={285} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={167} y={101} s={13} f={C.crema} a="middle">
        LATERAL (… ORDER BY … LIMIT 1)
      </T>
      <line x1={310} y1={95} x2={310 + 90 * reach} y2={95} stroke={answered ? C.cherryText : C.latte} strokeWidth={3} strokeDasharray="6 5" />
      {answered ? (
        <>
          <T x={355} y={84} s={20} f={C.cherryText} a="middle" w={700} o={easeOut(seg(s, 0.1, 0.4))}>
            ✕
          </T>
          <rect x={400} y={70} width={170} height={50} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" />
          <T x={485} y={101} s={13} f={C.cherryText} a="middle">
            no plain join
          </T>
          <path d={`M 127 128 A 40 22 0 1 0 207 128`} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray={`${150 * loop} 200`} />
          <T x={300} y={210} s={15} f={C.crema} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
            stays a per-row nested loop
          </T>
        </>
      ) : (
        <T x={485} y={110} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}

// 10 · The index decides the price.
export function IndexPrice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Per-row index scan versus one big sort" h={300}>
      <T x={25} y={44} s={15} f={C.caramel} w={700}>
        LATERAL + index (customer, time)
      </T>
      <rect x={25} y={58} width={300 * a} height={20} rx={6} fill={C.caramel} />
      <T x={25} y={104} s={13} f={C.latte} o={a}>
        each run stops after the cap
      </T>
      <T x={25} y={170} s={15} f={C.cherryText} w={700}>
        window function
      </T>
      <rect x={25} y={184} width={460 * b} height={20} rx={6} fill={C.cherry} />
      <T x={25} y={230} s={13} f={C.latte} o={b}>
        sorts the whole joined set once
      </T>
      <T x={300} y={278} s={13} f={C.taupe} a="middle">
        which is cheaper depends on data and index
      </T>
    </Svg>
  );
}

// 11 · Verdict with underlines and ticks; then the two prove-it checks.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['per-row sort or cap', 'LATERAL', 110],
    ['keep every outer row', 'LEFT JOIN LATERAL … ON true', 380],
    ['top-N per group', 'index the correlated columns', 390],
  ] as const;
  return (
    <Svg label="Three rules for LATERAL" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 30} s={18} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={y + 40} width={r[2] * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 545 ${y + 20} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

/** Prove it 1: after the answer the matching LATERAL form types out under OUTER APPLY. */
export function ProveApply({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const txt = 'LEFT JOIN LATERAL … ON true';
  const n = answered ? Math.floor(seg(s, 0.1, 0.9) * txt.length) : 0;
  return (
    <Svg label="OUTER APPLY corresponds to LEFT JOIN LATERAL ON true" h={240}>
      <T x={40} y={84} s={20} f={C.latte}>
        OUTER APPLY =
      </T>
      {answered ? (
        <>
          <T x={40} y={140} s={22} f={C.caramel} w={700}>
            {txt.slice(0, n)}
          </T>
          <T x={40} y={190} s={14} f={C.latte} o={easeOut(seg(s, 1.0, 1.4))}>
            both keep the empty outer row
          </T>
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
/** Prove it 2: the two orders slide under the cap into the result; the third slot stays empty. */
export function ProveCap({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const m = answered ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  return (
    <Svg label="A customer with 2 orders under a cap of 3 contributes 2 rows" h={240}>
      {[0, 1].map((k) => (
        <rect key={k} x={lerp(60 + k * 60, 330 + k * 56, m)} y={lerp(80, 140, m)} width={46} height={34} rx={6} fill={C.caramel} />
      ))}
      <rect x={lerp(180, 442, m)} y={lerp(80, 140, m)} width={46} height={34} rx={6} fill="none" stroke={C.latte} strokeDasharray="4 3" />
      <T x={300} y={60} s={20} f={C.latte}>
        cap 3 →
      </T>
      {answered ? (
        <T x={330} y={210} s={22} f={C.caramel} w={700} o={easeOut(seg(s, 0.8, 1.1))}>
          2 rows
        </T>
      ) : (
        <T x={430} y={112} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
