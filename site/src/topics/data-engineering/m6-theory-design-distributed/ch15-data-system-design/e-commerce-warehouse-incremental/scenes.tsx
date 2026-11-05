import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 13: a crossover chart (cost per run against table size, full refresh rising steeply, incremental
// rising shallowly from a fixed offset, the crossing counted up) and the incremental strip's silent failures drawn as
// red gaps, each closed by a guard. Every number is examples.py's: full cost = rows × 1, incremental = rows × 0.05 × 3
// + 10,000, crossing at 10,000 / 0.85 ≈ 11,765 rows; ord_1…ord_4 at the source, ord_3 cancelled, the extract
// carrying ord_2 and ord_4; ord_5 landing on cust_99 before the dimension knows it (inferred "unknown"); cust_1's
// phone corrected from 555-0100 to 555-0101 by key.

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

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

// 1 · The nightly rebuild bar crawls the whole width; it collapses to a short incremental bar. Weeks later, the source
// row of orders and the warehouse row are laid side by side: the warehouse has red holes where cancelled orders were.
export function Hook({ t }: StepCtx) {
  const crawl = easeInOut(seg(t, 0.2, 1.4));
  const shrink = easeInOut(seg(t, 1.6, 2.1));
  const rows = easeOut(seg(t, 2.4, 2.8));
  const holes = easeOut(seg(t, 3.2, 3.6));
  const w = shrink > 0 ? lerp(410, 70, shrink) : 410 * crawl;
  return (
    <Svg label="a nine-hour nightly rebuild goes incremental; weeks later the order count is short" h={270}>
      <T x={30} y={36} s={14} f={shrink > 0.5 ? C.focus : C.primary} o={easeOut(seg(t, 0, 0.3))}>
        {shrink > 0.5 ? 'incremental' : 'nightly rebuild'}
      </T>
      <rect x={150} y={22} width={410} height={20} fill={C.band} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={150} y={22} width={Math.max(0, w)} height={20} fill={shrink > 0.5 ? C.focus : C.primary} />
      <T x={560} y={64} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.2, 1.5)) * (1 - shrink)}>
        long, and finance asks why
      </T>
      {rows > 0 && (
        <g opacity={rows}>
          <T x={30} y={115} s={14} f={C.primary}>
            source
          </T>
          <T x={30} y={160} s={14} f={C.primary}>
            warehouse
          </T>
          {Array.from({ length: 10 }, (_, i) => {
            const hole = i === 3 || i === 7;
            return (
              <g key={i}>
                <rect x={150 + i * 40} y={100} width={32} height={22} rx={3} fill={C.primary} opacity={easeOut(seg(t, 2.4 + i * 0.04, 2.7 + i * 0.04))} />
                {hole && holes > 0 ? (
                  <rect x={150 + i * 40} y={145} width={32} height={22} rx={3} fill="none" stroke={C.badText} strokeDasharray="3 3" opacity={holes} />
                ) : (
                  <rect x={150 + i * 40} y={145} width={32} height={22} rx={3} fill={C.primary} opacity={hole ? 1 - holes : easeOut(seg(t, 2.5 + i * 0.04, 2.8 + i * 0.04))} />
                )}
              </g>
            );
          })}
        </g>
      )}
      <Line2 y={212} l="weeks later" r="count short" rc={C.badText} o={easeOut(seg(t, 3.5, 3.9))} />
      <Line2 y={240} l="the holes" r="cancelled orders" rc={C.badText} o={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

// 2 · Two candidate risks, each with a tiny chart of warehouse count against source. After the pick, the slow load's
// line lags and then catches up; the deleted row's line stays a fixed step below, and a red bracket says never closes.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a = on ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const b = on ? easeInOut(seg(s, 1.0, 2.0)) : 0;
  const PANELS = [
    { x: 30, label: 'slower load' },
    { x: 320, label: 'deleted row' },
  ];
  return (
    <Svg label="which risk of incrementalism did the design not name?" h={210}>
      {PANELS.map((p, i) => {
        const lit = i === 1 && b > 0.5;
        return (
          <g key={p.label} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))}>
            <Box x={p.x} y={14} w={250} label={p.label} lit={lit} o={1 - (i === 0 && b > 0.5 ? 0.5 : 0)} />
            <line x1={p.x} y1={140} x2={p.x + 250} y2={140} stroke={C.line} />
            <line x1={p.x} y1={70} x2={p.x + 250} y2={70} stroke={C.secondary} strokeDasharray="4 4" />
            <T x={p.x + 250} y={64} s={13} f={C.secondary} a="end">
              source
            </T>
          </g>
        );
      })}
      {a > 0 && (
        <polyline
          points={[
            [30, 70],
            [80, 70],
            [80 + 60 * a, 70 + 40 * Math.min(1, a * 2)],
            [140 + 80 * a, 70 + 40 * Math.max(0, 1 - (a - 0.5) * 2)],
            [140 + 140 * a, 70],
          ]
            .map((q) => q.join(','))
            .join(' ')}
          fill="none"
          stroke={C.focus}
          strokeWidth={2}
        />
      )}
      {a > 0.9 && (
        <T x={155} y={164} s={13} f={C.focus} a="middle">
          catches up
        </T>
      )}
      {b > 0 && (
        <g>
          <polyline points={`320,70 380,70 380,96 ${380 + 190 * b},96`} fill="none" stroke={C.focus} strokeWidth={2} />
          {b > 0.7 && (
            <g opacity={easeOut(seg(s, 1.7, 2.1))}>
              <path d="M556 72 L562 72 L562 94 L556 94" fill="none" stroke={C.badText} strokeWidth={1.6} />
              <T x={445} y={164} s={13} f={C.badText} a="middle">
                never closes
              </T>
            </g>
          )}
        </g>
      )}
      {!on && (
        <T x={300} y={196} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          stale for a while, or wrong for good?
        </T>
      )}
    </Svg>
  );
}

const DIMS = [
  { label: 'customer', x: 30 },
  { label: 'date', x: 240 },
  { label: 'product', x: 450 },
];
const MODELS = ['wide table', 'data vault', 'dimensional'];

// 3 · Dimensions appear along the top, two facts below them, and their joins draw in. Then three model cards land;
// the dimensional card lifts and takes the check.
export function RevealGrainFirst({ t }: StepCtx) {
  const pick = easeOutBack(seg(t, 3.2, 3.7));
  return (
    <Svg label="an order-line fact, a snapshot fact, conformed dimensions; three model cards" h={240}>
      <Draw pts={[[150, 92], [90, 46]]} t={t} from={1.1} to={1.4} stroke={C.secondary} w={1.3} pen={false} />
      <Draw pts={[[230, 92], [290, 46]]} t={t} from={1.2} to={1.5} stroke={C.secondary} w={1.3} pen={false} />
      <Draw pts={[[250, 92], [480, 46]]} t={t} from={1.3} to={1.6} stroke={C.secondary} w={1.3} pen={false} />
      <Draw pts={[[360, 92], [310, 46]]} t={t} from={1.5} to={1.8} stroke={C.second} w={1.3} pen={false} />
      <Draw pts={[[470, 92], [510, 46]]} t={t} from={1.6} to={1.9} stroke={C.second} w={1.3} pen={false} />
      {DIMS.map((d, i) => (
        <Box key={d.label} x={d.x} y={14} w={120} label={d.label} o={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} />
      ))}
      <Box x={110} y={92} w={160} label="order line" lit o={easeOut(seg(t, 0, 0.4))} />
      <Box x={320} y={92} w={190} label="inventory snapshot" o={easeOut(seg(t, 0.3, 0.7))} />
      <T x={190} y={146} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        grain: one order line
      </T>
      {MODELS.map((m, i) => {
        const k = easeOutBack(seg(t, 2.2 + i * 0.25, 2.6 + i * 0.25));
        if (k <= 0) return null;
        const chosen = i === 2;
        const lift = chosen ? 10 * Math.min(1, pick) : 0;
        return (
          <g key={m} opacity={Math.min(1, k) * (!chosen && pick > 0.5 ? 0.45 : 1)}>
            <Box x={30 + i * 190} y={170 - lift + (1 - Math.min(1, k)) * 12} w={160} label={m} lit={chosen && pick > 0.5} />
          </g>
        );
      })}
      <Tick x={555} y={176} k={easeOut(seg(t, 3.6, 3.9))} />
      <T x={300} y={232} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        each priced for this workload
      </T>
    </Svg>
  );
}

const ORDS = ['ord_1', 'ord_2', 'ord_3', 'ord_4'];

// 4 · Source and warehouse both hold ord_1…ord_4. ord_3 vanishes at the source. The extract carries only ord_2 and
// ord_4 across; the warehouse's ord_3 turns red, never asked about. Then the guard clause appears and removes it.
export function RevealDeletedRow({ t }: StepCtx) {
  const gone = easeOut(seg(t, 0.6, 1.0));
  const carry = easeInOut(seg(t, 1.2, 2.0));
  const red = easeOut(seg(t, 2.2, 2.5));
  const guard = easeOutBack(seg(t, 3.0, 3.4));
  const fix = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="a cancelled order vanishes at the source; the extract never asks what's missing" h={210}>
      <T x={85} y={22} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        source
      </T>
      <T x={485} y={22} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        warehouse
      </T>
      {ORDS.map((o, i) => {
        const y = 32 + i * 30;
        const isGone = i === 2;
        const wRed = isGone && red > 0.5 && fix < 0.5;
        return (
          <g key={o}>
            {(!isGone || gone < 1) && <Box x={40} y={y} w={90} h={24} label={o} o={easeOut(seg(t, 0.1, 0.4)) * (isGone ? 1 - gone : 1)} />}
            {(!isGone || fix < 1) && (
              <Box x={440} y={y} w={90} h={24} label={o} o={easeOut(seg(t, 0.1, 0.4)) * (isGone ? 1 - fix : 1)} fill={wRed ? C.bad : undefined} stroke={wRed ? C.badText : undefined} f={wRed ? C.focus : undefined} />
            )}
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <line x1={140} y1={92} x2={430} y2={92} stroke={C.line} />
        <T x={285} y={74} s={13} f={C.secondary} a="middle">
          extract: changed or new
        </T>
      </g>
      {carry > 0 &&
        carry < 1 &&
        [1, 3].map((i) => (
          <rect key={i} x={Math.max(140, lerp(140, 380, carry) - (i === 1 ? 0 : 56))} y={83} width={44} height={18} rx={3} fill={C.focus} />
        ))}
      {red > 0 && fix < 1 && (
        <T x={485} y={176} s={13} f={C.badText} a="middle" o={red * (1 - fix)}>
          never asked about
        </T>
      )}
      {guard > 0 && (
        <g opacity={Math.min(1, guard)}>
          <Box x={155} y={124} w={260} h={30} label="when not matched by source" lit />
        </g>
      )}
      {fix > 0 && (
        <T x={485} y={176} s={13} f={C.focus} a="middle" o={fix}>
          guard removes it
        </T>
      )}
      <T x={30} y={202} s={14} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        the extract never asks what's missing
      </T>
    </Svg>
  );
}

// 5 · ord_5 arrives carrying cust_99, a key the customer dimension doesn't have. "drop it" and "block the load" get
// struck; the key becomes an inferred "unknown" in pale blue. Then cust_99 lands in the dimension and the placeholder
// backfills.
export function RevealLateDimension({ t }: StepCtx) {
  const arrive = easeOut(seg(t, 0.2, 0.7));
  const miss = easeOut(seg(t, 0.9, 1.2));
  const strike = easeOut(seg(t, 1.4, 1.9));
  const infer = easeOut(seg(t, 2.0, 2.4));
  const dimLand = easeOutBack(seg(t, 2.9, 3.3));
  const back = easeOut(seg(t, 3.5, 3.9));
  const key = back > 0.5 ? 'cust_99' : infer > 0.5 ? 'unknown' : 'cust_99';
  const kc = back > 0.5 ? C.focus : infer > 0.5 ? C.second : C.primary;
  return (
    <Svg label="a fact lands before its dimension; an inferred placeholder key lands instead" h={210}>
      <g opacity={arrive} transform={`translate(${(1 - arrive) * -30} 0)`}>
        <rect x={30} y={30} width={250} height={34} rx={4} fill={C.panel} stroke={infer > 0.5 && back < 0.5 ? C.second : C.focus} strokeDasharray={infer > 0.5 && back < 0.5 ? '4 3' : undefined} />
        <T x={45} y={52} s={14} f={C.primary}>
          ord_5
        </T>
        <T x={265} y={52} s={14} f={kc} a="end">
          {key}
        </T>
      </g>
      <T x={30} y={22} s={13} f={C.secondary} o={arrive}>
        fact
      </T>
      <T x={400} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        customer dimension
      </T>
      {['cust_1', 'cust_2'].map((c, i) => (
        <Box key={c} x={400} y={30 + i * 32} w={170} h={26} label={c} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {dimLand > 0 && <Box x={400} y={94 + (1 - Math.min(1, dimLand)) * 14} w={170} h={26} label="cust_99" lit o={Math.min(1, dimLand)} />}
      {miss > 0 && back < 0.5 && (
        <g opacity={miss * (1 - back * 2)}>
          <line x1={285} y1={47} x2={380} y2={47} stroke={C.badText} strokeDasharray="3 3" />
          <T x={333} y={40} s={13} f={C.badText} a="middle">
            no match
          </T>
        </g>
      )}
      {back > 0 && <Draw pts={[[285, 47], [340, 47], [340, 107], [398, 107]]} t={t} from={3.5} to={3.9} stroke={C.focus} w={1.5} pen={false} />}
      {['drop it', 'block the load'].map((c, i) => {
        const k = easeOut(seg(t, 1.1 + i * 0.15, 1.4 + i * 0.15));
        return (
          <g key={c} opacity={k * (1 - 0.5 * strike)}>
            <T x={30 + i * 120} y={110} s={14} f={C.primary}>
              {c}
            </T>
            <line x1={28 + i * 120} y1={105} x2={lerp(28 + i * 120, 28 + i * 120 + (i === 0 ? 70 : 125), strike)} y2={105} stroke={C.badText} strokeWidth={1.6} opacity={strike > 0 ? 1 : 0} />
          </g>
        );
      })}
      <T x={30} y={150} s={14} f={C.second} o={infer}>
        inferred key instead
      </T>
      <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        backfilled when the real row arrives
      </T>
    </Svg>
  );
}

// 6 · Left: an address change appends a new row and the old one is marked ended (history kept). Right: cust_1's phone
// rolls from 555-0100 to 555-0101 in place (no history). A key chip "id" lights under both. Then the same load without
// the key: a red duplicate row slides in on the right.
export function RevealSCDMerge({ t }: StepCtx) {
  const add = easeOutBack(seg(t, 0.6, 1.1));
  const roll = easeInOut(seg(t, 1.5, 2.0));
  const key = easeOut(seg(t, 2.3, 2.7));
  const dup = easeOutBack(seg(t, 3.1, 3.6));
  return (
    <Svg label="an address change kept as history; a phone fix overwritten, both merged by key" h={210}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        address · keep history
      </T>
      <Box x={30} y={32} w={250} h={26} label={add > 0.5 ? 'old address · ended' : 'old address'} o={easeOut(seg(t, 0.1, 0.4)) * (add > 0.5 ? 0.55 : 1)} />
      {add > 0 && <Box x={30} y={64 + (1 - Math.min(1, add)) * -10} w={250} h={26} label="new address · current" lit o={Math.min(1, add)} />}
      <T x={320} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0.1, 0.4))}>
        phone · overwrite
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <rect x={320} y={32} width={250} height={26} rx={4} fill={C.panel} stroke={roll > 0.5 ? C.focus : C.line} />
        <T x={335} y={50} s={13} f={C.primary}>
          cust_1
        </T>
        {roll < 0.5 ? (
          <T x={555} y={50} s={13} f={C.secondary} a="end" o={1 - roll * 2}>
            555-0100
          </T>
        ) : (
          <T x={555} y={50} s={13} f={C.focus} a="end" o={(roll - 0.5) * 2}>
            555-0101
          </T>
        )}
      </g>
      {dup > 0 && (
        <g opacity={Math.min(1, dup)} transform={`translate(${(1 - Math.min(1, dup)) * 30} 0)`}>
          <rect x={320} y={64} width={250} height={26} rx={4} fill={C.bad} stroke={C.badText} />
          <T x={335} y={82} s={13} f={C.focus}>
            cust_1
          </T>
          <T x={555} y={82} s={13} f={C.focus} a="end">
            555-0101
          </T>
        </g>
      )}
      {key > 0 && (
        <g opacity={key * (dup > 0.5 ? 0.4 : 1)}>
          <Draw pts={[[155, 92], [155, 120], [445, 120], [445, 60]]} t={t} from={2.3} to={2.7} stroke={C.focus} w={1.3} pen={false} />
          <Box x={250} y={106} w={100} h={28} label="key: id" lit />
        </g>
      )}
      <Line2 y={170} l="merge by key" r="replaced, one row" o={easeOut(seg(t, 2.6, 3.0))} />
      <Line2 y={196} l="no key" r="silent duplicates" rc={C.badText} o={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

// 7 · Six requested marts drop in; three are built solid and three fade back to dashed outlines. Each kept mart starts
// with its own slightly different "revenue" bar; the semantic layer appears and the three snap to one length.
export function RevealMartsSemantic({ t }: StepCtx) {
  const cull = easeOut(seg(t, 1.2, 1.6));
  const layer = easeOutBack(seg(t, 2.2, 2.7));
  const snap = easeInOut(seg(t, 2.8, 3.3));
  const KEEP = [0, 2, 4];
  const VAR = [60, 48, 70];
  return (
    <Svg label="a few marts earn their keep; revenue is defined once, not recomputed per mart" h={210}>
      {Array.from({ length: 6 }, (_, i) => {
        const kept = KEEP.includes(i);
        const k = easeOutBack(seg(t, 0.1 + i * 0.12, 0.5 + i * 0.12));
        if (k <= 0) return null;
        const x = 30 + i * 92;
        return (
          <g key={i} opacity={Math.min(1, k) * (!kept ? 1 - 0.65 * cull : 1)}>
            <rect x={x} y={24 + (1 - Math.min(1, k)) * -10} width={80} height={60} rx={4} fill={C.panel} stroke={kept && cull > 0.5 ? C.focus : C.line} strokeDasharray={!kept && cull > 0.5 ? '4 3' : undefined} />
            <T x={x + 40} y={44} s={13} f={kept && cull > 0.5 ? C.focus : C.secondary} a="middle">
              mart
            </T>
            {kept && cull > 0.5 && <rect x={x + 10} y={60} width={Math.max(0, lerp(VAR[KEEP.indexOf(i)], 60, snap))} height={8} fill={snap > 0.95 ? C.focus : C.primary} />}
          </g>
        );
      })}
      {layer > 0 && (
        <g opacity={Math.min(1, layer)}>
          <rect x={30} y={130} width={540} height={32} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
          <T x={300} y={151} s={13} f={C.focus} a="middle">
            semantic layer · revenue defined once
          </T>
          {KEEP.map((i) => (
            <line key={i} x1={70 + i * 92} y1={130} x2={70 + i * 92} y2={86} stroke={C.focus} strokeDasharray="3 3" />
          ))}
        </g>
      )}
      <T x={30} y={110} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.8)) * (1 - layer)}>
        three revenues, three answers
      </T>
      <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.3, 3.7))}>
        not every requested mart earns its keep
      </T>
    </Svg>
  );
}

const X = (rows: number) => 60 + (rows / 30000) * 500;
const Y = (cost: number) => 190 - (cost / 30000) * 160;
const CROSS = 10000 / 0.85;

// 8 · Axes, then the full-refresh line rises steeply from zero; the incremental line starts higher (its fixed
// overhead) and rises shallowly. A dot runs along the x axis and the counter ticks up to where they meet: 11,765 rows.
export function RevealCrossover({ t }: StepCtx) {
  const run = easeInOut(seg(t, 2.4, 3.4));
  const at = CROSS * run;
  return (
    <Svg label="a crossover chart: full refresh rising steeply, incremental rising shallowly, their lines crossing" h={240}>
      <g opacity={easeOut(seg(t, 0, 0.3))} stroke={C.line}>
        <line x1={60} y1={190} x2={560} y2={190} />
        <line x1={60} y1={30} x2={60} y2={190} />
      </g>
      <T x={66} y={26} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        cost per run
      </T>
      <Draw pts={[[X(0), Y(0)], [X(30000), Y(30000)]]} t={t} from={0.4} to={1.3} stroke={C.focus} w={2} />
      <Draw pts={[[X(0), Y(10000)], [X(30000), Y(14500)]]} t={t} from={1.0} to={1.9} stroke={C.second} w={2} />
      <T x={430} y={52} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        full refresh
      </T>
      <T x={555} y={102} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        incremental
      </T>
      <T x={70} y={124} s={13} f={C.second} o={easeOut(seg(t, 1.9, 2.2))}>
        fixed overhead
      </T>
      {run > 0 && (
        <g>
          <line x1={X(at)} y1={190} x2={X(at)} y2={Y(Math.min(at, 10000 + 0.15 * at))} stroke={C.secondary} strokeDasharray="3 3" />
          <circle cx={X(at)} cy={190} r={4} fill={C.focus} />
          <T x={X(CROSS)} y={210} s={14} f={run > 0.98 ? C.focus : C.primary} a="middle">
            {`${Math.round(at).toLocaleString('en-US')} rows`}
          </T>
        </g>
      )}
      <Reticle x={X(CROSS)} y={Y(CROSS)} w={18} h={18} t={t} at={3.4} />
      <T x={560} y={210} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        table size
      </T>
      <T x={300} y={234} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        computed from the shop's own numbers
      </T>
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['grain first', 'then the model'],
    ['deleted row', 'a named guard', C.badText],
    ['late dimension', 'an inferred key', C.second],
    ['merge', 'by a unique key'],
    ['crossover', 'computed, not guessed'],
  ];
  return (
    <Svg label="grain first, the deleted-row and late-dimension guards, scd and merge, marts, the crossover" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={56} y={y - 14} width={24} height={14} fill={C.focus} />
                {[30, 92].map((x) => (
                  <rect key={x} x={x} y={y - 12} width={14} height={10} fill={C.primary} />
                ))}
              </g>
            )}
            {i === 1 && (
              <g>
                {[0, 1, 3].map((j) => (
                  <rect key={j} x={30 + j * 20} y={y - 12} width={16} height={12} fill={C.primary} />
                ))}
                <rect x={70} y={y - 12} width={16} height={12} fill="none" stroke={C.badText} strokeDasharray="2 2" />
              </g>
            )}
            {i === 2 && <rect x={30} y={y - 14} width={78} height={16} rx={3} fill="none" stroke={C.second} strokeDasharray="4 3" />}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 14} width={78} height={7} fill={C.primary} />
                <rect x={30} y={y - 5} width={78} height={7} fill={C.line} />
              </g>
            )}
            {i === 4 && (
              <g strokeWidth={1.6}>
                <line x1={30} y1={y + 2} x2={108} y2={y - 16} stroke={C.focus} />
                <line x1={30} y1={y - 8} x2={108} y2={y - 4} stroke={C.second} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · A second table's dot sits on a faint chart with a dashed "switch to full now?" chip. After the pick, the chip
// dims, the two cost lines redraw from today's numbers, and a vertical drop from the dot meets both lines: read the
// side off the chart.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const dim = on ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const lines = on ? easeInOut(seg(s, 0.5, 1.5)) : 0;
  const drop = on ? easeInOut(seg(s, 1.6, 2.2)) : 0;
  const DX = 200;
  const fy = 150 - 100 * ((DX - 60) / 500);
  const iy = 105 - 20 * ((DX - 60) / 500);
  return (
    <Svg label="a second table, past its own crossover for a long time, costing more than full refresh" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.3))} stroke={C.line}>
        <line x1={60} y1={150} x2={560} y2={150} />
        <line x1={60} y1={30} x2={60} y2={150} />
      </g>
      {lines > 0 && (
        <g fill="none" strokeWidth={2}>
          <line x1={60} y1={150} x2={lerp(60, 560, lines)} y2={lerp(150, 50, lines)} stroke={C.focus} />
          <line x1={60} y1={105} x2={lerp(60, 560, lines)} y2={lerp(105, 85, lines)} stroke={C.second} />
        </g>
      )}
      <circle cx={DX} cy={150} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={DX} y={172} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 0.5, 0.9))}>
        this table today
      </T>
      {drop > 0 && (
        <g>
          <line x1={DX} y1={150} x2={DX} y2={lerp(150, iy, drop)} stroke={C.secondary} strokeDasharray="3 3" />
          {drop > 0.5 && <circle cx={DX} cy={fy} r={4} fill={C.focus} />}
          {drop > 0.95 && <circle cx={DX} cy={iy} r={4} fill={C.second} />}
          {drop > 0.95 && (
            <T x={DX + 14} y={iy - 18} s={13} f={C.focus} o={easeOut(seg(s, 2.2, 2.6))}>
              compare, then decide
            </T>
          )}
        </g>
      )}
      <Box x={30} y={192} w={250} label="switch to full now?" dash="4 3" o={easeOut(seg(t, 0.8, 1.2)) * (1 - 0.6 * dim)} />
      <Box x={320} y={192} w={250} label="today's crossover first" lit o={on ? easeOut(seg(s, 0.4, 0.8)) : 0} />
    </Svg>
  );
}
