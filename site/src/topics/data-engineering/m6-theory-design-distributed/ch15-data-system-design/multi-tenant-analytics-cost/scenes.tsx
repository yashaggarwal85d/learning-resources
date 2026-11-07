import { useEffect, useState } from 'react';
import { C, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 19: the isolation spectrum as a ladder (shared table with row security, schema per tenant, account
// per tenant) priced at 100 and 100,000 tenants; a noisy-neighbour strip where one lane spikes tenfold and the
// neighbours' latency climbs red until a quota caps it; a metering strip splitting a bill into per-tenant slices plus
// a grey remainder whose policy comes from three cards. examples.py's numbers: 500 fixed plus 2, 8 or 40 a tenant
// (700 / 1,300 / 4,500 at 100; 200,500 / 800,500 / 4,000,500 at 100,000); neighbour latency 10, 20 unthrottled, 13
// under a quota of 30; capacity 100 against a request of 80 gives 50, 70 or 60; erasing 50,000 shared rows costs 500
// against a flat 5; sellers metered at 10 and 30 with a remainder of 20.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
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

const num = (v: number) => Math.round(v).toLocaleString('en-US');

// 1 · Eight sellers sit over one shared warehouse. One seller's report sweeps a scan beam across the whole fact table,
// and every other seller's latency bar drops down long and red. Then the month-end bill shows a question mark per seller.
export function Hook({ t }: StepCtx) {
  const scan = easeInOut(seg(t, 0.8, 1.8));
  const slow = easeOut(seg(t, 1.4, 2.2));
  const bill = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="one seller's query slows every other seller's dashboard" h={270}>
      {Array.from({ length: 8 }, (_, i) => {
        const noisy = i === 2;
        const x = 30 + i * 68;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.05, 0.3 + i * 0.05))}>
            <rect x={x} y={20} width={58} height={24} rx={3} fill={C.panel} stroke={noisy && scan > 0 ? C.focus : C.line} strokeWidth={noisy && scan > 0 ? 2 : 1} />
            {!noisy && <rect x={x + 22} y={108} width={14} height={Math.max(0, 8 + 44 * slow)} fill={slow > 0.5 ? C.bad : C.primary} stroke={slow > 0.5 ? C.badText : 'none'} />}
          </g>
        );
      })}
      <T x={30 + 2 * 68 + 29} y={37} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        report
      </T>
      <rect x={30} y={60} width={540} height={36} rx={4} fill={C.band} stroke={C.line} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={300} y={83} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        shared warehouse · fact table
      </T>
      {scan > 0 && scan < 1 && <rect x={30} y={60} width={Math.max(0, 540 * scan)} height={36} rx={4} fill={C.focus} opacity={0.25} />}
      <T x={30} y={186} s={13} f={C.badText} o={slow}>
        every other dashboard crawls
      </T>
      {bill > 0 && (
        <g opacity={bill}>
          <rect x={360} y={170} width={210} height={28} rx={4} fill={C.panel} stroke={C.badText} strokeDasharray="4 3" />
          <T x={465} y={189} s={13} f={C.badText} a="middle">
            cost per seller: ?
          </T>
        </g>
      )}
      <Line2 y={232} l="one seller's scan" r="everyone slows" rc={C.badText} o={easeOut(seg(t, 2.2, 2.6))} />
      <Line2 y={258} l="month end" r="no per-seller number" rc={C.badText} o={easeOut(seg(t, 3.3, 3.7))} />
    </Svg>
  );
}

const PROBS = ['one tenant takes it all', 'no per-tenant number'];
const FIXES = ['per-tenant query limit', 'metering per query'];

// 2 · Two red problems, two dashed slots. After the pick each slot fills with its control and the problem turns white.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="which two controls would have prevented the slowdown?" h={210}>
      {PROBS.map((p, i) => {
        const k = on ? easeOut(seg(s, 0.3 + i * 0.6, 0.7 + i * 0.6)) : 0;
        const y = 30 + i * 70;
        return (
          <g key={p}>
            <Box x={30} y={y} w={240} label={p} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} stroke={k > 0.5 ? C.focus : C.badText} f={k > 0.5 ? C.focus : C.badText} />
            {k < 1 && <Box x={330} y={y} w={240} label="?" dash="4 3" o={easeOut(seg(t, 0.6, 0.9)) * (1 - k)} />}
            {k > 0 && <Box x={330} y={y} w={240} label={FIXES[i]} lit o={k} />}
            {k > 0 && <line x1={330} y1={y + 16} x2={lerp(330, 270, k)} y2={y + 16} stroke={C.focus} strokeWidth={1.4} />}
          </g>
        );
      })}
      <T x={300} y={192} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        designed in from the start
      </T>
    </Svg>
  );
}

const RUNGS = [
  { name: 'shared table', per: 2, blast: 140, b: 'all tenants' },
  { name: 'schema each', per: 8, blast: 40, b: 'one tenant' },
  { name: 'account each', per: 40, blast: 22, b: 'one, sealed' },
];

// 3 · Three rungs step up left to right. Under each, the total at 100 tenants and at 100,000 counts up, and a blast
// radius bar shows how far one tenant's trouble spreads: all tenants on the shared rung, one on the others.
export function RevealIsolationLadder({ t }: StepCtx) {
  const c1 = easeOut(seg(t, 0.8, 1.6));
  const c2 = easeOut(seg(t, 1.8, 2.8));
  const bl = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="shared tables, schema per tenant, account per tenant — each priced" h={240}>
      <T x={30} y={98} s={13} f={C.secondary} o={easeOut(seg(t, 0.7, 1.0))}>
        100
      </T>
      <T x={30} y={128} s={13} f={C.secondary} o={easeOut(seg(t, 1.7, 2.0))}>
        100,000
      </T>
      <T x={30} y={164} s={13} f={C.secondary} o={easeOut(seg(t, 2.9, 3.2))}>
        blast
      </T>
      {RUNGS.map((r, i) => {
        const x = 140 + i * 150;
        return (
          <g key={r.name}>
            <Box x={x} y={44 - i * 12} w={140} label={r.name} lit={i === 2} o={easeOut(seg(t, i * 0.2, 0.3 + i * 0.2))} />
            <T x={x + 130} y={98} s={14} f={C.primary} a="end" o={c1 > 0 ? 1 : 0}>
              {num((500 + r.per * 100) * c1)}
            </T>
            <T x={x + 130} y={128} s={14} f={i === 2 ? C.focus : C.primary} a="end" o={c2 > 0 ? 1 : 0}>
              {num((500 + r.per * 100000) * c2)}
            </T>
            <rect x={x} y={152} width={Math.max(0, r.blast * bl)} height={14} fill={i === 0 ? C.focus : C.primary} />
            <T x={x} y={186} s={13} f={C.secondary} o={bl}>
              {r.b}
            </T>
          </g>
        );
      })}
      <T x={300} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        the gap widens with scale
      </T>
    </Svg>
  );
}

const BANDS = ['account each', 'schema each', 'shared table'];

// 4 · Every tenant starts on the shared band. The regulated tenant's dot lifts one band with its reason beside it; then
// the noisy tenant's dot does the same. The rest stay put.
export function RevealForcedUp({ t }: StepCtx) {
  const reg = easeInOut(seg(t, 1.0, 1.6));
  const noisy = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="a regulated or noisy tenant gets pushed up one rung" h={210}>
      {BANDS.map((b, i) => (
        <g key={b} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
          <T x={30} y={44 + i * 50} s={13} f={C.secondary}>
            {b}
          </T>
          <rect x={160} y={26 + i * 50} width={410} height={28} rx={4} fill={C.band} stroke={C.line} />
        </g>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const x = 180 + i * 32;
        const lift = i === 3 ? reg : i === 8 ? noisy : 0;
        return <circle key={i} cx={x} cy={lerp(140, 90, lift)} r={7} fill={lift > 0.5 ? C.focus : C.primary} opacity={easeOut(seg(t, 0.3 + i * 0.03, 0.6 + i * 0.03))} />;
      })}
      <T x={180 + 3 * 32} y={78} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        regulated
      </T>
      <T x={180 + 8 * 32} y={78} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>
        noisy
      </T>
      <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.2, 3.6))}>
        one named constraint per push
      </T>
    </Svg>
  );
}

const LANES = ['noisy', 'neighbour', 'neighbour', 'neighbour'];

// 5 · Four lanes of load. The noisy lane spikes from 10 to 100 and the neighbours' latency reads climb from 10 to 20 in
// red. Then a quota line drops at 30; the spike is clipped and the neighbours settle at 13.
export function RevealNoisySimulated({ t }: StepCtx) {
  const spike = easeOut(seg(t, 0.6, 1.4));
  const quota = easeOut(seg(t, 2.4, 2.9));
  const load = 10 + 90 * spike;
  const eff = quota > 0 ? lerp(load, Math.min(load, 30), quota) : load;
  const lat = 10 * (1 + eff / 100);
  const bad = lat > 14;
  return (
    <Svg label="one lane spikes; neighbours climb without a control, flat with one" h={210}>
      {LANES.map((l, i) => {
        const y = 30 + i * 34;
        const v = i === 0 ? eff : 10;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
            <T x={30} y={y + 14} s={13} f={i === 0 ? C.focus : C.secondary}>
              {l}
            </T>
            <rect x={130} y={y} width={Math.max(0, v * 3)} height={18} fill={i === 0 ? C.focus : C.primary} />
            {i > 0 && (
              <T x={575} y={y + 14} s={14} f={bad ? C.badText : C.focus} a="end">
                {`${lat.toFixed(0)}`}
              </T>
            )}
          </g>
        );
      })}
      <T x={575} y={20} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.3, 0.6))}>
        neighbour latency
      </T>
      {quota > 0 && (
        <g opacity={quota}>
          <line x1={220} y1={24} x2={220} y2={160} stroke={C.second} strokeWidth={2} strokeDasharray="5 3" />
          <T x={226} y={174} s={13} f={C.second}>
            quota · 30
          </T>
        </g>
      )}
      <Line2 y={200} l={quota > 0.5 ? 'with a quota' : 'no control'} r={quota > 0.5 ? 'neighbours flat' : 'neighbours climb'} rc={quota > 0.5 ? C.focus : C.badText} o={easeOut(seg(t, 1.4, 1.8))} />
    </Svg>
  );
}

const RULES: [string, number][] = [
  ['equal share', 50],
  ['weighted share', 70],
  ['burst with credit', 60],
];

// 6 · One tenant asks for 80 of a capacity of 100. Three rules split it: a dashed ghost of the request sits behind
// each bar, and the bars fill to 50, 70 and 60.
export function RevealFairnessRules({ t }: StepCtx) {
  const S = 3;
  return (
    <Svg label="three fairness rules split the same spike differently" h={240}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        request 80 of capacity 100
      </T>
      {RULES.map(([r, v], i) => {
        const y = 48 + i * 56;
        const g = easeOut(seg(t, 0.8 + i * 0.7, 1.4 + i * 0.7));
        return (
          <g key={r} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}>
            <T x={30} y={y + 16} s={14} f={C.primary}>
              {r}
            </T>
            <rect x={240} y={y} width={100 * S} height={22} fill={C.band} />
            <rect x={240} y={y} width={80 * S} height={22} fill="none" stroke={C.secondary} strokeDasharray="4 3" />
            <rect x={240} y={y} width={Math.max(0, v * S * g)} height={22} fill={i === 1 ? C.second : C.focus} />
            <T x={545} y={y + 16} s={14} f={C.focus} a="end">
              {num(v * g)}
            </T>
          </g>
        );
      })}
      <T x={300} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        the rule decides who gets starved
      </T>
    </Svg>
  );
}

// 7 · Left: a tenant's own schema box is dropped in one move, cost 5. Right: the same tenant's rows sit striped through
// a shared table; a scan line sweeps every row, rewriting, and the cost counts up to 500 for 50,000 rows.
export function RevealErasureCoupled({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.8, 1.2));
  const sweep = easeInOut(seg(t, 1.6, 3.4));
  return (
    <Svg label="a tenant's own key or schema erases cheap; shared needs a rewrite" h={210}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        own schema
      </T>
      {drop < 1 && (
        <g opacity={1 - drop} transform={`translate(0 ${drop * 20})`}>
          <rect x={30} y={36} width={200} height={90} rx={4} fill={C.panel} stroke={C.focus} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={42} y={48 + i * 24} width={176} height={16} fill={C.primary} />
          ))}
        </g>
      )}
      <T x={130} y={150} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
        one drop · 5
      </T>
      <T x={300} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        shared table
      </T>
      <rect x={300} y={36} width={270} height={90} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 8 }, (_, i) => {
        const mine = i % 3 === 1;
        const y = 42 + i * 10;
        const passed = sweep * 8 > i;
        return <rect key={i} x={310} y={y} width={250} height={7} fill={mine ? (passed ? C.band : C.second) : C.primary} opacity={easeOut(seg(t, 0.1, 0.4))} />;
      })}
      {sweep > 0 && sweep < 1 && <line x1={306} y1={40 + sweep * 82} x2={564} y2={40 + sweep * 82} stroke={C.focus} strokeWidth={2} />}
      <T x={435} y={150} s={14} f={sweep > 0.95 ? C.focus : C.primary} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        {`scan and rewrite · ${num(500 * sweep)}`}
      </T>
      <T x={30} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 3.5, 3.9))}>
        the cost was set at the isolation choice
      </T>
    </Svg>
  );
}

const POL: { name: string; a: number; b: number }[] = [
  { name: 'proportional', a: 15, b: 45 },
  { name: 'flat', a: 20, b: 40 },
  { name: 'absorbed', a: 10, b: 30 },
];

// 8 · The bill splits into seller_a's 10, seller_b's 30 and a grey remainder of 20. Three policy cards drop in, each
// showing what the two sellers pay once the remainder is handled its way.
export function RevealRemainderPolicy({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.3, 1.2));
  const PX = 9;
  return (
    <Svg label="per-tenant slices, plus a grey remainder with its own policy" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={34} width={10 * PX - 2 * split} height={26} fill={C.focus} />
        <rect x={30 + 10 * PX + 2 * split} y={34} width={30 * PX - 4 * split} height={26} fill={C.primary} />
        <rect x={30 + 40 * PX + 2 * split} y={34} width={20 * PX - 2 * split} height={26} fill={C.band} stroke={C.line} strokeDasharray="4 3" />
      </g>
      <g opacity={split}>
        <T x={30} y={26} s={13} f={C.focus}>
          seller_a 10
        </T>
        <T x={30 + 10 * PX + 12} y={80} s={13} f={C.primary}>
          seller_b 30
        </T>
        <T x={570} y={26} s={13} f={C.secondary} a="end">
          idle and shared 20
        </T>
      </g>
      {POL.map((p, i) => {
        const k = easeOutBack(seg(t, 1.6 + i * 0.5, 2.0 + i * 0.5));
        if (k <= 0) return null;
        const x = 30 + i * 185;
        return (
          <g key={p.name} opacity={Math.min(1, k)} transform={`translate(0 ${(1 - Math.min(1, k)) * -10})`}>
            <rect x={x} y={100} width={170} height={74} rx={4} fill={C.panel} stroke={C.focus} />
            <T x={x + 12} y={120} s={13} f={C.focus}>
              {p.name}
            </T>
            <rect x={x + 12} y={132} width={p.a * 2} height={10} fill={C.focus} />
            <rect x={x + 12 + p.a * 2 + 2} y={132} width={p.b * 2} height={10} fill={C.primary} />
            <T x={x + 12} y={164} s={13} f={C.secondary}>
              {`a ${p.a} · b ${p.b}`}
            </T>
          </g>
        );
      })}
      <T x={30} y={200} s={13} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        the remainder needs a stated policy
      </T>
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['isolation', 'a priced ladder'],
    ['quota', 'neighbours stay flat'],
    ['fairness', 'decides who starves', C.second],
    ['erasure', 'paid at isolation'],
    ['the bill', 'honest remainder'],
  ];
  return (
    <Svg label="a priced ladder, a fairness rule, coupled erasure, a metered bill" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && [0, 1, 2].map((j) => <rect key={j} x={30 + j * 27} y={y - 8 - j * 5} width={24} height={10} rx={2} fill={j === 2 ? C.focus : C.primary} />)}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 16} width={40} height={7} fill={C.focus} />
                <line x1={70} y1={y - 20} x2={70} y2={y + 4} stroke={C.second} strokeDasharray="3 2" />
                <rect x={30} y={y - 5} width={20} height={7} fill={C.primary} />
              </g>
            )}
            {i === 2 && [50, 70, 60].map((v, j) => <rect key={j} x={30} y={y - 16 + j * 7} width={v} height={5} fill={j === 1 ? C.second : C.focus} />)}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 16} width={30} height={18} rx={2} fill="none" stroke={C.focus} strokeDasharray="3 2" />
                <rect x={70} y={y - 16} width={38} height={18} rx={2} fill={C.primary} />
              </g>
            )}
            {i === 4 && (
              <g>
                <rect x={30} y={y - 12} width={18} height={12} fill={C.focus} />
                <rect x={50} y={y - 12} width={36} height={12} fill={C.primary} />
                <rect x={88} y={y - 12} width={20} height={12} fill={C.band} stroke={C.line} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · A tenant counter ticks to ten times. The per-tenant cost bar barely moves; underneath, the bill grows a new
// "metering overhead" line. Before the pick a dashed "move everyone up a rung?" chip waits; after, it dims, the
// overhead line keeps growing under a reticle, and the "watch the metering" chip lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const grow = easeInOut(seg(t, 0.3, 1.6));
  const over = on ? easeInOut(seg(s, 0.4, 1.6)) : 0;
  return (
    <Svg label="ten times the tenants; what's the next bottleneck?" h={250}>
      <T x={30} y={30} s={14} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        tenants
      </T>
      <T x={575} y={30} s={16} f={C.focus} a="end" o={easeOut(seg(t, 0, 0.3))}>
        {`× ${Math.max(1, Math.round(1 + 9 * grow))}`}
      </T>
      <T x={30} y={66} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        per tenant
      </T>
      <rect x={180} y={54} width={Math.max(0, 120 + 6 * grow)} height={14} fill={C.primary} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={30} y={102} s={13} f={on ? C.focus : C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        metering
      </T>
      <rect x={180} y={90} width={Math.max(0, 14 + 46 * grow + 200 * over)} height={14} fill={on ? C.focus : C.line} opacity={easeOut(seg(t, 0.6, 0.9))} />
      {on && <Reticle x={180 + (60 + 200 * over) / 2} y={97} w={60 + 200 * over + 12} h={26} t={s} at={1.6} />}
      <Box x={30} y={150} w={250} label="move everyone up a rung?" dash="4 3" o={easeOut(seg(t, 1.0, 1.4)) * (on ? 0.4 : 1)} />
      <Box x={320} y={150} w={250} label="watch the metering" lit o={on ? easeOut(seg(s, 1.0, 1.4)) : 0} />
      <T x={300} y={226} s={13} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 1.8, 2.2)) : 0}>
        widen its granularity in time
      </T>
    </Svg>
  );
}
