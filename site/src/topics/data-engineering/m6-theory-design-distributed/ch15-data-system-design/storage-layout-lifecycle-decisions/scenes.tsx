import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 4: the dataset as blocks laid out by time (x) and customer (y), the dominant query drawn as a
// vertical band. Partitioned by customer, the files are horizontal slivers and the band crosses every one (red);
// partitioned by date, the files are columns, the band covers one and the rest dim as pruned, the pruned fraction
// counted up. A second strip: hot, warm and cold shelves with a retention clock each; a customer's rows as a red
// thread through every date column. Numbers are examples.py's: two million customer files, a thousand days of
// twenty files each (the daily job touches twenty of twenty thousand, 99.9% pruned), one customer active on 180
// days, tiers of 30, 180 and 1,000 days.

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

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Partitioned by customer: one horizontal sliver per customer, each spanning every day. `hit` lights the slivers a
 *  vertical band at `band` (0..1 across the width) crosses — which is all of them. */
function ByCustomer({ x, y, w, h, rows = 14, grow = 1, hit = 0, band = 0.7, o = 1 }: { x: number; y: number; w: number; h: number; rows?: number; grow?: number; hit?: number; band?: number; o?: number }) {
  const rh = h / rows;
  return (
    <g opacity={o}>
      {Array.from({ length: rows }, (_, i) => {
        const lit = hit > i / rows;
        return <rect key={i} x={x} y={y + i * rh + 1} width={w * grow} height={rh - 2} fill={lit ? C.bad : C.band} stroke={lit ? C.badText : C.line} strokeWidth={0.8} />;
      })}
      {hit > 0 && <rect x={x + w * band - 8} y={y - 6} width={16} height={h + 12} fill="none" stroke={C.focus} strokeWidth={1.6} />}
    </g>
  );
}

/** Partitioned by date: one column per day. The band covers one column; `prune` dims every other one. */
function ByDate({ x, y, w, h, cols = 24, grow = 1, hitCol = -1, prune = 0, thread = -1, threadK = 0, threadCols, o = 1 }: { x: number; y: number; w: number; h: number; cols?: number; grow?: number; hitCol?: number; prune?: number; thread?: number; threadK?: number; threadCols?: number[]; o?: number }) {
  const cw = w / cols;
  const shown = Math.ceil(cols * grow);
  return (
    <g opacity={o}>
      {Array.from({ length: shown }, (_, i) => {
        const isHit = i === hitCol;
        const touched = threadCols?.includes(i) && threadK > (threadCols.indexOf(i) + 1) / threadCols.length;
        return (
          <rect
            key={i}
            x={x + i * cw + 1}
            y={y}
            width={cw - 2}
            height={h}
            fill={touched ? C.bad : isHit ? C.primary : C.band}
            stroke={touched ? C.badText : isHit ? C.focus : C.line}
            strokeWidth={0.8}
            opacity={isHit || touched ? 1 : 1 - 0.7 * prune}
          />
        );
      })}
      {thread >= 0 && threadK > 0 && (
        <line x1={x} y1={y + thread} x2={x + w * threadK} y2={y + thread} stroke={C.badText} strokeWidth={2} />
      )}
    </g>
  );
}

// a customer who shows up on most days: the columns they touch (a fixed, deterministic pattern)
const ACTIVE_COLS = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19, 21, 22, 23];

// 1 · One decision node, "partition by customer id, for fast lookups"; a year-later arrow; two symptom cards branch
// off it, a crawling job bar and a rewrite flipping file after file; both trace back to the node.
export function Hook({ t }: StepCtx) {
  const crawl = easeOut(seg(t, 1.4, 4.6)) * 0.22;
  const flips = Math.floor(easeInOut(seg(t, 1.8, 3.6)) * 20);
  const back = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="the shop partitions events by customer id for fast lookups — a year later the nightly revenue job crawls, and a deletion request rewrites everything" h={290}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={160} y={14} width={280} height={56} rx={5} fill={C.panel} stroke={back > 0.5 ? C.focus : C.line} strokeWidth={back > 0.5 ? 1.8 : 1} />
        <T x={300} y={38} s={14} f={C.primary} a="middle" w={600}>
          partition by customer id
        </T>
        <T x={300} y={58} s={13} f={C.secondary} a="middle" serif italic>
          "for fast lookups"
        </T>
      </g>
      <Draw pts={[[300, 70], [300, 100]]} t={t} from={0.5} to={0.8} stroke={C.line} w={1.4} pen={false} />
      <T x={312} y={92} s={13} f={C.quiet} o={easeOut(seg(t, 0.6, 0.9))}>
        a year later
      </T>
      <Draw pts={[[300, 100], [150, 120]]} t={t} from={0.8} to={1.1} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[300, 100], [450, 120]]} t={t} from={0.9} to={1.2} stroke={C.line} w={1.4} pen={false} />
      {/* symptom 1: the nightly job crawling */}
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <rect x={30} y={120} width={250} height={92} rx={4} fill={C.panel} stroke={C.line} />
        <T x={44} y={144} s={13} f={C.primary}>
          nightly revenue job
        </T>
        <rect x={44} y={160} width={222} height={12} fill="none" stroke={C.line} />
        <rect x={44} y={160} width={222 * crawl} height={12} fill={C.bad} />
        <T x={44} y={198} s={14} f={C.badText} o={easeOut(seg(t, 2.0, 2.3))}>
          crawling
        </T>
      </g>
      {/* symptom 2: the deletion rewriting file after file */}
      <g opacity={easeOut(seg(t, 1.2, 1.5))}>
        <rect x={320} y={120} width={250} height={92} rx={4} fill={C.panel} stroke={C.line} />
        <T x={334} y={144} s={13} f={C.primary}>
          a deletion request
        </T>
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={334 + i * 11} y={158} width={8} height={16} fill={i < flips ? C.bad : C.band} stroke={i < flips ? C.badText : C.line} strokeWidth={0.8} />
        ))}
        <T x={334} y={198} s={14} f={C.badText} o={easeOut(seg(t, 2.6, 2.9))}>
          an expensive rewrite
        </T>
      </g>
      {/* both trace back */}
      <Draw pts={[[155, 212], [155, 240], [300, 240], [300, 74]]} t={t} from={3.3} to={3.9} stroke={C.focus} w={1.4} pen={false} dash="4 3" />
      <Draw pts={[[445, 212], [445, 240], [300, 240]]} t={t} from={3.3} to={3.7} stroke={C.focus} w={1.4} pen={false} dash="4 3" />
      <T x={300} y={270} s={15} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 3.8, 4.2))}>
        one layout caused both
      </T>
    </Svg>
  );
}

// 2 · The customer-sliced layout with the nightly band crossing every sliver, and a rack growing beside it. After
// the pick, the rack dims — the band still crosses everything — and the key flips to date: one column lit.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const flip = on ? easeInOut(seg(s, 0.8, 1.4)) : 0;
  return (
    <Svg label="which single design-time decision would have prevented both symptoms?" h={260}>
      <ByCustomer x={40} y={20} w={300} h={150} grow={easeOut(seg(t, 0, 0.5))} hit={easeOut(seg(t, 0.4, 1.2))} o={1 - flip} />
      {flip > 0 && <ByDate x={40} y={20} w={300} h={150} hitCol={16} prune={flip} o={flip} />}
      {/* the bigger cluster */}
      <g opacity={on ? 1 - 0.6 * easeOut(seg(s, 0, 0.5)) : 1}>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = easeOutBack(seg(t, 0.6 + i * 0.12, 0.9 + i * 0.12));
          if (k <= 0) return null;
          return <rect key={i} x={420} y={150 - i * 22} width={110} height={16} rx={2} fill={C.band} stroke={C.primary} strokeWidth={1.2} opacity={Math.min(1, k)} />;
        })}
        <T x={475} y={192} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
          bigger cluster
        </T>
      </g>
      {!on && (
        <T x={300} y={236} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          more machine, or one decision?
        </T>
      )}
      {on && (
        <>
          <T x={475} y={212} s={13} f={C.badText} a="middle" o={easeOut(seg(s, 0.3, 0.6))}>
            doesn't fix it
          </T>
          <T x={40} y={200} s={14} f={C.focus} o={easeOut(seg(s, 1.3, 1.7))}>
            the partition key
          </T>
          <T x={40} y={236} s={14} f={C.focus} o={easeOut(seg(s, 1.6, 2.0))}>
            from the real path
          </T>
        </>
      )}
    </Svg>
  );
}

/** A database cylinder. */
const Cyl = ({ x, y, w, h, stroke, dash, o = 1 }: { x: number; y: number; w: number; h: number; stroke: string; dash?: string; o?: number }) => (
  <g opacity={o} fill={C.panel} stroke={stroke} strokeWidth={1.6} strokeDasharray={dash}>
    <path d={`M${x} ${y + 10} L${x} ${y + h - 10} A ${w / 2} 10 0 0 0 ${x + w} ${y + h - 10} L${x + w} ${y + 10}`} />
    <ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} />
  </g>
);

// 3 · The orders table as a solid cylinder with a backup shield; an arrow computes the dashed revenue rollup, which
// is then thrown away and rebuilt from the orders table.
export function RevealSystemOfRecord({ t }: StepCtx) {
  const gone = easeInOut(seg(t, 2.2, 2.7));
  const rebuilt = easeInOut(seg(t, 2.9, 3.6));
  const rollupO = t < 2.7 ? easeOut(seg(t, 1.1, 1.5)) * (1 - gone) : rebuilt;
  return (
    <Svg label="every dataset is either the one authoritative copy, or derived from it and rebuildable" h={250}>
      <Cyl x={70} y={40} w={120} h={110} stroke={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <T x={130} y={176} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        orders table
      </T>
      <T x={130} y={198} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 0.4, 0.7))}>
        source of truth
      </T>
      {/* backup shield */}
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <path d="M130 64 l20 8 v18 c0 14 -10 22 -20 26 c-10 -4 -20 -12 -20 -26 v-18 z" fill="none" stroke={C.focus} strokeWidth={1.6} />
      </g>
      <T x={130} y={232} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        back it up
      </T>
      <Draw pts={[[200, 95], [380, 95]]} t={t} from={0.9} to={1.3} stroke={C.primary} w={1.6} pen={false} />
      <T x={290} y={84} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        computed from
      </T>
      {/* the rebuild arrow, second pass */}
      <Draw pts={[[200, 115], [380, 115]]} t={t} from={2.9} to={3.4} stroke={C.focus} w={1.6} pen={false} dash="5 4" />
      <T x={290} y={136} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        rebuilt
      </T>
      <Cyl x={400} y={40} w={120} h={110} stroke={C.secondary} dash="5 4" o={rollupO} />
      {gone > 0.05 && gone < 0.95 && (
        <T x={460} y={102} s={13} f={C.quiet} a="middle">
          dropped
        </T>
      )}
      <T x={460} y={176} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        daily revenue rollup
      </T>
      <T x={460} y={198} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        derived, rebuildable
      </T>
    </Svg>
  );
}

// 4 · A stream of query ticks, most of them the nightly by-date scan; a cost bar per shape fills; the key follows the
// heavy bar.
export function RevealAccessPath({ t }: StepCtx) {
  const dateK = easeInOut(seg(t, 0.6, 2.2));
  const custK = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="the dominant access path picks the partition key — the nightly job scans by date, so partition by date" h={250}>
      <T x={40} y={28} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        share of query cost
      </T>
      <T x={40} y={62} s={14} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        scan one day
      </T>
      <rect x={240} y={50} width={335} height={16} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={240} y={50} width={305 * dateK} height={16} fill={C.focus} />
      <T x={40} y={100} s={14} f={C.primary} o={easeOut(seg(t, 0.3, 0.6))}>
        look up a customer
      </T>
      <rect x={240} y={88} width={335} height={16} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={240} y={88} width={28 * custK} height={16} fill={C.secondary} />
      <Reticle x={395} y={58} w={326} h={30} t={t} at={2.3} />
      <line x1={25} y1={128} x2={575} y2={128} stroke={C.line} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={40} y={170} s={14} f={C.secondary} o={easeOut(seg(t, 2.6, 2.9))}>
        partition by customer
      </T>
      <T x={575} y={170} s={14} f={C.quiet} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        not the real path
      </T>
      <T x={40} y={212} s={14} f={C.focus} w={600} o={easeOut(seg(t, 3.1, 3.4))}>
        partition by date
      </T>
      <T x={575} y={212} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        matches the real path
      </T>
    </Svg>
  );
}

// 5 · Three format cards holding the same rows; two meters each (interoperability, catalog); one card lifts, and a
// file layout drops in beneath it.
export function RevealTableFormat({ t }: StepCtx) {
  const pick = easeOutBack(seg(t, 2.4, 2.9));
  const METERS: [number, number][] = [
    [0.85, 0.7],
    [0.55, 0.4],
    [0.35, 0.85],
  ];
  return (
    <Svg label="a table format is picked from the access pattern, with interoperability and catalog consequences as the deciding cost — not reinvented per dataset" h={280}>
      {METERS.map(([interop, catalog], i) => {
        const x = 40 + i * 180;
        const chosen = i === 0;
        const k = easeOut(seg(t, i * 0.2, i * 0.2 + 0.4));
        return (
          <g key={i} opacity={k * (chosen ? 1 : 1 - 0.55 * easeOut(seg(t, 2.4, 2.8)))} transform={`translate(0 ${chosen ? -pick * 10 : 0})`}>
            <rect x={x} y={20} width={160} height={150} rx={5} fill={C.panel} stroke={chosen && pick > 0.5 ? C.focus : C.line} strokeWidth={chosen && pick > 0.5 ? 1.8 : 1} />
            <T x={x + 80} y={42} s={13} f={C.primary} a="middle" w={600}>
              format {'ABC'[i]}
            </T>
            {[0, 1, 2].map((r) => (
              <rect key={r} x={x + 18} y={54 + r * 12} width={124} height={7} fill={C.line} />
            ))}
            <T x={x + 18} y={112} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
              interop
            </T>
            <rect x={x + 18} y={118} width={124 * interop * easeInOut(seg(t, 1.0, 1.7))} height={6} fill={C.primary} />
            <T x={x + 18} y={146} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
              catalog fit
            </T>
            <rect x={x + 18} y={152} width={124 * catalog * easeInOut(seg(t, 1.4, 2.1))} height={6} fill={C.primary} />
          </g>
        );
      })}
      <T x={40} y={196} s={14} f={C.primary} o={easeOut(seg(t, 1.8, 2.1))}>
        which format
      </T>
      <T x={575} y={196} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.9, 2.2))}>
        one decisive cost each
      </T>
      {/* the layout follows */}
      <g opacity={easeOut(seg(t, 3.0, 3.4))} transform={`translate(0 ${(1 - easeOut(seg(t, 3.0, 3.4))) * -12})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={40 + i * 16} y={214} width={12} height={20} fill={C.band} stroke={C.focus} strokeWidth={0.9} />
        ))}
      </g>
      <T x={220} y={230} s={14} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        file layout
      </T>
      <T x={575} y={262} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        follows the chosen format
      </T>
    </Svg>
  );
}

// 6 · The centrepiece: the same one-day band dropped across both layouts. Customer slivers all turn red; date
// columns dim except one, and the pruned fraction counts up to 99.9%.
export function RevealBandAcrossLayouts({ t }: StepCtx) {
  const hit = easeInOut(seg(t, 0.6, 1.6));
  const prune = easeInOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="the same day's query drawn as a band across two layouts — one touches nearly every file, the other prunes almost all of them" h={330}>
      <T x={40} y={22} s={14} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        by customer id
      </T>
      <T x={575} y={22} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.2, 1.5))}>
        touches every file
      </T>
      <ByCustomer x={40} y={34} w={535} h={100} rows={12} grow={easeOut(seg(t, 0, 0.5))} hit={hit} band={0.68} />
      <T x={40} y={156} s={13} f={C.badText} o={easeOut(seg(t, 1.4, 1.7))}>
        {fmt(2_000_000 * hit)} of 2,000,000 files
      </T>
      <T x={40} y={194} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        by date
      </T>
      <T x={575} y={194} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.8, 3.1))}>
        almost all pruned
      </T>
      <ByDate x={40} y={206} w={535} h={80} cols={40} grow={easeOut(seg(t, 1.6, 2.0))} hitCol={prune > 0 ? 27 : -1} prune={prune} />
      <T x={40} y={312} s={13} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        20 of 20,000 files · {(99.9 * prune).toFixed(1)}% pruned
      </T>
    </Svg>
  );
}

/** A retention clock: a ring whose hand sweeps once over `k`. */
const Clock = ({ cx, cy, k, o = 1 }: { cx: number; cy: number; k: number; o?: number }) => (
  <g opacity={o}>
    <circle cx={cx} cy={cy} r={16} fill="none" stroke={C.primary} strokeWidth={1.4} />
    {k > 0 && (
      <path
        d={`M${cx} ${cy} L${cx} ${cy - 16} A16 16 0 ${k > 0.5 ? 1 : 0} 1 ${cx + 16 * Math.sin(k * 2 * Math.PI)} ${cy - 16 * Math.cos(k * 2 * Math.PI)} Z`}
        fill={C.primary}
        opacity={0.4}
      />
    )}
    <line x1={cx} y1={cy} x2={cx + 12 * Math.sin(k * 2 * Math.PI)} y2={cy - 12 * Math.cos(k * 2 * Math.PI)} stroke={C.focus} strokeWidth={1.6} />
  </g>
);

const TIERS: [string, string, string][] = [
  ['hot', 'fast, short retention', '30 days'],
  ['warm', 'cheaper, longer', '180 days'],
  ['cold', 'archival, longest', '1,000 days'],
];

// 7 · Three shelves, each with a clock; blocks age from hot to warm to cold, and the oldest block leaves cold at the
// end of its clock.
export function RevealTiers({ t }: StepCtx) {
  const shelfY = (i: number) => 58 + i * 80;
  // a few blocks travelling through the shelves as time passes
  const block = (i: number) => {
    const age = Math.max(0, t - 0.6 - i * 0.45) / 3.2; // 0..1 over its life
    if (t < 0.6 + i * 0.45) return null;
    const tier = age < 0.33 ? 0 : age < 0.66 ? 1 : age < 1 ? 2 : 3;
    if (tier === 3) return null;
    const within = (age - tier * 0.33) / 0.33;
    return <rect key={i} x={260 + within * 220 - 10} y={shelfY(tier) - 18} width={20} height={16} fill={tier === 0 ? C.focus : C.primary} opacity={tier === 2 ? 0.6 : 0.9} />;
  };
  return (
    <Svg label="three shelves, hot, warm and cold, each with its own retention clock" h={280}>
      {TIERS.map(([name, value, days], i) => (
        <g key={name} opacity={easeOut(seg(t, i * 0.2, i * 0.2 + 0.4))}>
          <T x={25} y={shelfY(i) - 4} s={15} f={i === 0 ? C.focus : C.primary} w={600}>
            {name}
          </T>
          <T x={25} y={shelfY(i) + 18} s={13} f={C.secondary}>
            {value}
          </T>
          <line x1={250} y1={shelfY(i)} x2={500} y2={shelfY(i)} stroke={C.primary} strokeWidth={2} />
          <Clock cx={540} cy={shelfY(i) - 10} k={easeInOut(seg(t, 0.8 + i * 0.4, 2.6 + i * 0.6))} />
          <T x={540} y={shelfY(i) + 26} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0 + i * 0.4, 1.3 + i * 0.4))}>
            {days}
          </T>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map(block)}
    </Svg>
  );
}

// 8 · The three clocks again, and the law's own words written under them; a line connects each clock to the clause.
export function RevealStorageLimitation({ t }: StepCtx) {
  return (
    <Svg label="the law names the clock on every shelf — kept no longer than the purpose requires, not an engineering nicety" h={270}>
      {TIERS.map(([name], i) => (
        <g key={name} opacity={easeOut(seg(t, i * 0.15, i * 0.15 + 0.4))}>
          <Clock cx={150 + i * 150} cy={40} k={0.3 + i * 0.25} />
          <T x={150 + i * 150} y={80} s={13} f={C.secondary} a="middle">
            {name}
          </T>
          <Draw pts={[[150 + i * 150, 90], [300, 120]]} t={t} from={1.6 + i * 0.1} to={2.0 + i * 0.1} stroke={C.focus} w={1.2} pen={false} />
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.6, 1.2))}>
        <rect x={40} y={120} width={520} height={62} rx={4} fill={C.panel} stroke={C.line} />
        <T x={300} y={146} s={15} f={C.primary} a="middle" serif italic>
          "for no longer than is necessary for
        </T>
        <T x={300} y={168} s={15} f={C.primary} a="middle" serif italic>
          the purposes" · GDPR Art. 5(1)(e)
        </T>
      </g>
      <T x={40} y={218} s={14} f={C.primary} o={easeOut(seg(t, 2.2, 2.5))}>
        storage limitation
      </T>
      <T x={575} y={218} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        a legal requirement
      </T>
      <T x={40} y={250} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        the retention clock
      </T>
      <T x={575} y={250} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        from the law
      </T>
    </Svg>
  );
}

// 9 · The date-partitioned layout; one customer to erase. After the pick, a red thread runs across it and every date
// column the customer touched turns red: 180 partitions, against one file in the customer layout.
export function Predict2({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const thread = on ? easeInOut(seg(s, 0.2, 1.6)) : 0;
  return (
    <Svg label="a customer asks to be deleted — on the date-partitioned layout, do their rows sit in one place?" h={250}>
      <T x={40} y={22} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        by date · one customer to erase
      </T>
      <ByDate x={40} y={34} w={535} h={110} cols={24} grow={easeOut(seg(t, 0, 0.5))} thread={56} threadK={thread} threadCols={ACTIVE_COLS} />
      {!on && (
        <T x={300} y={200} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
          together, or scattered?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={178} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            still together
          </T>
          <T x={575} y={178} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            tempting, but wrong
          </T>
          <T x={40} y={210} s={14} f={C.badText} o={easeOut(seg(s, 1.2, 1.5))}>
            scattered by date
          </T>
          <T x={575} y={210} s={14} f={C.badText} a="end" o={easeOut(seg(s, 1.3, 1.6))}>
            every day touched
          </T>
          <T x={40} y={240} s={13} f={C.secondary} o={easeOut(seg(s, 1.7, 2.0))}>
            180 date partitions, not one file
          </T>
        </>
      )}
    </Svg>
  );
}

// 10 · Four small figures back in order — cylinder, pruned columns, shelves with clocks, the red thread — each with
// its caption.
export function Recap({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['system of record', 'one source of truth', C.primary],
    ['layout', 'from the access path', C.primary],
    ['tiers', 'each with a clock', C.focus],
    ['erasure', 'designed in, or rewritten', C.primary],
  ];
  return (
    <Svg label="source of truth, the access-path layout and its pruned files, three tiers with their clocks, and erasure running through all of it" h={290}>
      {rows.map(([label, value, f], i) => {
        const y = 40 + i * 66;
        const at = 0.2 + i * 0.6;
        const k = easeOut(seg(t, at, at + 0.35));
        return (
          <g key={label} opacity={k}>
            <T x={110} y={y + 6} s={15} f={C.primary}>
              {label}
            </T>
            <T x={575} y={y + 6} s={15} f={f} a="end" w={600}>
              {value}
            </T>
          </g>
        );
      })}
      <Cyl x={30} y={20} w={50} h={44} stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <ByDate x={28} y={92} w={60} h={34} cols={8} hitCol={5} prune={easeOut(seg(t, 0.9, 1.3))} o={easeOut(seg(t, 0.8, 1.1))} />
      <g opacity={easeOut(seg(t, 1.4, 1.7))}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={28} y1={162 + i * 12} x2={70} y2={162 + i * 12} stroke={C.primary} strokeWidth={2} />
        ))}
      </g>
      <Clock cx={84} cy={170} k={easeInOut(seg(t, 1.5, 2.6))} o={easeOut(seg(t, 1.4, 1.7)) * 0.9} />
      <ByDate x={28} y={224} w={60} h={34} cols={8} thread={17} threadK={easeInOut(seg(t, 2.1, 2.8))} threadCols={[0, 2, 3, 5, 7]} o={easeOut(seg(t, 2.0, 2.3))} />
    </Svg>
  );
}

// 11 · A table of session blocks with a point lookup arrow. After the pick, the key turns to session id and the arrow
// hits exactly one block — then one person's sessions light up, scattered across many blocks: the erasure risk stays.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const hit = on ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const scatter = on ? easeInOut(seg(s, 1.6, 2.6)) : 0;
  const PERSON = [2, 7, 9, 14, 19, 22, 27, 31];
  return (
    <Svg label="a session-logs table's dominant access path is a point lookup by session id, not a date range — what changes?" h={280}>
      <T x={40} y={22} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        session logs
      </T>
      {Array.from({ length: 32 }, (_, i) => {
        const x = 40 + (i % 16) * 33;
        const y = 34 + Math.floor(i / 16) * 42;
        const isHit = i === 28 && hit > 0.5;
        const mine = PERSON.indexOf(i);
        const lit = mine >= 0 && scatter > (mine + 1) / PERSON.length;
        return <rect key={i} x={x} y={y} width={28} height={34} rx={2} fill={lit ? C.bad : isHit ? C.focus : C.band} stroke={lit ? C.badText : C.line} opacity={easeOut(seg(t, i * 0.01, i * 0.01 + 0.3))} />;
      })}
      {/* the point lookup */}
      <Draw pts={[[300, 140], [40 + 12 * 33 + 14, 112]]} t={t} from={0.5} to={0.9} stroke={C.focus} w={1.6} pen={false} />
      <T x={300} y={160} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        find one session by id
      </T>
      {!on && (
        <T x={300} y={220} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          what changes?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={196} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            point lookup
          </T>
          <T x={575} y={196} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            a different path
          </T>
          <T x={40} y={226} s={14} f={C.focus} o={easeOut(seg(s, 0.9, 1.2))}>
            partition key
          </T>
          <T x={575} y={226} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.0, 1.3))}>
            session id
          </T>
          <T x={40} y={256} s={14} f={C.badText} o={easeOut(seg(s, 2.2, 2.5))}>
            erasure risk
          </T>
          <T x={575} y={256} s={14} f={C.badText} a="end" o={easeOut(seg(s, 2.3, 2.6))}>
            still there, if scattered
          </T>
        </>
      )}
    </Svg>
  );
}
