import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 8: the cost waterfall — five bars for compute, storage, egress, requests and licence, the
// dominating bar towering over the rest and counted up to its share; a lever lands on it and the bar shrinks by a
// measured ratio, while a thin second-order bar grows in red; a final strip re-runs the waterfall on a new price
// sheet and the leader changes. Figures are examples.py's: a month of 900 compute, 400 storage, 300 egress, 6,100
// requests and 200 licence (7,900 in all; requests 77%), a million orders a month (so 7.90 per thousand orders);
// the pruning lever cuts requests by 90% (6,100 → 610, saving 5,490), and pre-aggregating adds 150 of write cost
// (net 5,340). The cross-AZ and idle-compute designs and the new price sheet are drawn without figures.

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

type Cls = { name: string; v: number };
const BILL: Cls[] = [
  { name: 'compute', v: 900 },
  { name: 'storage', v: 400 },
  { name: 'egress', v: 300 },
  { name: 'requests', v: 6100 },
  { name: 'licence', v: 200 },
];
const TOTAL = 7900;

/** A row of vertical bars on a baseline; `order` maps each bar to its slot (so bars can re-sort); `h` is px per unit. */
function Bars({
  bars,
  x,
  base,
  slot = 100,
  w = 56,
  h,
  order,
  grow = 1,
  lit = -1,
  dim = 0,
  labels = true,
  o = 1,
}: {
  bars: Cls[];
  x: number;
  base: number;
  slot?: number;
  w?: number;
  h: number;
  order?: number[];
  grow?: number;
  lit?: number;
  dim?: number;
  labels?: boolean;
  o?: number;
}) {
  return (
    <g opacity={o}>
      <line x1={x - 10} y1={base} x2={x + slot * bars.length - 30} y2={base} stroke={C.line} />
      {bars.map((b, i) => {
        const pos = order ? order[i] : i;
        const bx = x + pos * slot;
        const bh = b.v * h * grow;
        const isLit = i === lit;
        return (
          <g key={b.name} opacity={isLit ? 1 : 1 - 0.55 * dim}>
            <rect x={bx} y={base - bh} width={w} height={bh} fill={isLit ? C.focus : C.primary} opacity={isLit ? 1 : 0.75} />
            {labels && (
              <T x={bx + w / 2} y={base + 20} s={13} f={isLit ? C.focus : C.secondary} a="middle">
                {b.name}
              </T>
            )}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Two lines over a quarter: the bill doubles, orders rise a fifth. A tuning knob turns for a month and nudges the
// bill a hair. Then one query's scanner sweeps the whole events table again and again for a dashboard last opened
// at launch.
export function Hook({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.2, 1.2));
  const X0 = 60, X1 = 260, B = 140;
  const sweep = t > 2.4 ? ((t - 2.4) * 1.6) % 1 : 0;
  return (
    <Svg label="the bill doubles while orders grow a fifth — a month of tuning saves little, one unwatched query dominates" h={290}>
      <line x1={X0} y1={B} x2={X1} y2={B} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={[[X0, B - 40], [lerp(X0, X1, g), B - 40 - 40 * g]]} t={t} from={0.2} to={1.2} stroke={C.focus} w={2.2} pen={false} />
      <Draw pts={[[X0, B - 40], [lerp(X0, X1, g), B - 40 - 8 * g]]} t={t} from={0.2} to={1.2} stroke={C.secondary} w={2} pen={false} />
      <T x={X1 + 8} y={B - 76} s={13} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        bill ×2
      </T>
      <T x={X1 + 8} y={B - 44} s={13} f={C.secondary} o={easeOut(seg(t, 1.1, 1.4))}>
        orders +⅕
      </T>
      <T x={X0} y={B + 20} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        one quarter
      </T>
      {/* the tuning knob */}
      <g opacity={easeOut(seg(t, 1.3, 1.6))}>
        <circle cx={420} cy={70} r={22} fill="none" stroke={C.primary} strokeWidth={1.6} />
        <line x1={420} y1={70} x2={420 + 16 * Math.cos(-1.8 + Math.sin(t * 3) * 1.2)} y2={70 + 16 * Math.sin(-1.8 + Math.sin(t * 3) * 1.2)} stroke={C.focus} strokeWidth={2} />
        <T x={420} y={112} s={13} f={C.secondary} a="middle">
          cluster size
        </T>
      </g>
      {/* the one query sweeping the whole table */}
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <rect x={340} y={130} width={220} height={40} rx={3} fill={C.band} stroke={C.line} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={340 + i * 22} y1={130} x2={340 + i * 22} y2={170} stroke={C.line} />
        ))}
        {t > 2.4 && <rect x={340} y={130} width={220 * sweep} height={40} fill={C.focus} opacity={0.35} />}
        <T x={450} y={190} s={13} f={C.secondary} a="middle">
          events table, scanned whole
        </T>
      </g>
      <T x={40} y={226} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        tuning effort
      </T>
      <T x={575} y={226} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        a month, small saving
      </T>
      <T x={40} y={252} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        one dashboard query
      </T>
      <T x={575} y={252} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        most of the bill
      </T>
      <T x={40} y={278} s={14} f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        orders
      </T>
      <T x={575} y={278} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        up only a fifth
      </T>
    </Svg>
  );
}

// 2 · Five bar outlines, heights unknown; the compute bar carries the month of effort. After the pick, the bars fill
// to their real heights and requests shoots up to 6,100 of 7,900.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fill = on ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const H = 0.022;
  return (
    <Svg label="which cost class does the waterfall actually show dominating?" h={280}>
      {BILL.map((b, i) => {
        const bx = 50 + i * 104;
        return (
          <g key={b.name} opacity={easeOut(seg(t, i * 0.1, i * 0.1 + 0.3))}>
            {!on && <rect x={bx} y={110} width={60} height={60} fill="none" stroke={C.line} strokeDasharray="4 3" />}
            {!on && (
              <T x={bx + 30} y={146} s={14} f={C.quiet} a="middle">
                ?
              </T>
            )}
            {on && <rect x={bx} y={170 - b.v * H * fill} width={60} height={b.v * H * fill} fill={b.name === 'requests' ? C.focus : C.primary} opacity={b.name === 'requests' ? 1 : 0.7} />}
            <T x={bx + 30} y={190} s={13} f={b.name === 'requests' && on ? C.focus : C.secondary} a="middle">
              {b.name}
            </T>
          </g>
        );
      })}
      {/* the month of effort pinned to compute */}
      <g opacity={easeOut(seg(t, 0.6, 0.9)) * (on ? 1 - 0.5 * easeOut(seg(s, 0.4, 0.8)) : 1)}>
        <path d="M70 70 l20 20 m-6 -26 a10 10 0 1 0 12 12" fill="none" stroke={C.secondary} strokeWidth={1.8} />
        <T x={80} y={104} s={13} f={C.secondary} a="middle">
          a month
        </T>
      </g>
      {on && (
        <T x={392} y={26} s={14} f={C.focus} a="middle" w={700} o={easeOut(seg(s, 1.0, 1.3))}>
          {fmt(6100 * fill)} of 7,900
        </T>
      )}
      {!on && (
        <T x={300} y={230} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          which line is biggest?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={234} s={14} f={C.secondary} o={easeOut(seg(s, 0.4, 0.7))}>
            compute
          </T>
          <T x={575} y={234} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.5, 0.8))}>
            where the effort went
          </T>
          <T x={40} y={264} s={14} f={C.focus} o={easeOut(seg(s, 1.2, 1.5))}>
            requests
          </T>
          <T x={575} y={264} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.3, 1.6))}>
            one query's scan volume
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · Five rows, each class with its unit and a figure per thousand orders counted up, each stamped with a dated-page
// tag.
export function RevealFiveClasses({ t }: StepCtx) {
  const UNITS = ['instance-hours, scan-billed', 'GB-months, by tier', 'cross-AZ, cross-region', 'per-call, per-byte', 'per-seat, per-credit'];
  return (
    <Svg label="compute, storage, egress, requests, licence — each re-priced per thousand orders from a dated provider page" h={270}>
      <T x={575} y={20} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        per 1,000 orders
      </T>
      {BILL.map((b, i) => {
        const y = 54 + i * 42;
        const at = 0.2 + i * 0.4;
        const k = easeOut(seg(t, at, at + 0.3));
        const c = easeInOut(seg(t, at + 0.1, at + 0.7));
        const lit = b.name === 'requests';
        return (
          <g key={b.name} opacity={k} transform={`translate(${(1 - k) * -12} 0)`}>
            <T x={40} y={y} s={14} f={lit ? C.focus : C.primary} w={600}>
              {b.name}
            </T>
            <T x={40} y={y + 18} s={13} f={C.secondary}>
              {UNITS[i]}
            </T>
            <T x={575} y={y} s={15} f={lit ? C.focus : C.primary} a="end" w={lit ? 700 : 500}>
              {((b.v / 1000) * c).toFixed(2)}
            </T>
          </g>
        );
      })}
      {/* the dated-page tags */}
      {BILL.map((b, i) => {
        const k = easeOutBack(seg(t, 2.4 + i * 0.12, 2.7 + i * 0.12));
        if (k <= 0) return null;
        return (
          <g key={b.name} opacity={Math.min(1, k)} transform={`translate(${430} ${44 + i * 42}) scale(${0.6 + 0.4 * Math.min(1, k)})`}>
            <rect x={-30} y={-10} width={60} height={18} rx={9} fill={C.ink} stroke={C.line} />
            <T x={0} y={4} s={13} f={C.quiet} a="middle">
              dated
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The five bars stand in the order they were listed, then re-sort by share; requests slides to the front and
// its share counts up to 77%.
export function RevealWaterfall({ t }: StepCtx) {
  const k = easeInOut(seg(t, 1.2, 2.0));
  const listed = [0, 1, 2, 3, 4];
  const sorted = [1, 2, 3, 0, 4]; // compute → 2nd, storage → 3rd, egress → 4th, requests → 1st, licence → 5th
  const order = listed.map((p, i) => lerp(p, sorted[i], k));
  const share = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="the five bars re-sorted by share of the bill — one bar, the query's own scan volume, towers over the rest" h={260}>
      <Bars bars={BILL} x={50} base={160} slot={104} w={60} h={0.022} order={order} grow={easeOut(seg(t, 0, 0.8))} lit={k > 0.9 ? 3 : -1} dim={easeOut(seg(t, 2.2, 2.6))} />
      <T x={80} y={18} s={16} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 2.2, 2.5))}>
        {Math.round(77 * share)}%
      </T>
      <T x={40} y={218} s={14} f={C.secondary} o={easeOut(seg(t, 2.6, 2.9))}>
        four classes
      </T>
      <T x={575} y={218} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        a small share, each
      </T>
      <T x={40} y={246} s={14} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        requests
      </T>
      <T x={575} y={246} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.6))}>
        most of the total
      </T>
    </Svg>
  );
}

/** Three small pictures of the usual dominators. */
function ScanIcon({ x, y, t }: { x: number; y: number; t: number }) {
  const u = Math.max(0, (t * 0.8) % 1);
  return (
    <g>
      <rect x={x} y={y} width={120} height={50} rx={3} fill={C.band} stroke={C.line} />
      {[1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={x + i * 20} y1={y} x2={x + i * 20} y2={y + 50} stroke={C.line} />
      ))}
      <rect x={x} y={y} width={120 * u} height={50} fill={C.focus} opacity={0.35} />
    </g>
  );
}
function AzIcon({ x, y, t }: { x: number; y: number; t: number }) {
  return (
    <g>
      <rect x={x} y={y} width={50} height={50} rx={4} fill="none" stroke={C.line} strokeDasharray="4 3" />
      <rect x={x + 70} y={y} width={50} height={50} rx={4} fill="none" stroke={C.line} strokeDasharray="4 3" />
      {[0, 1, 2].map((i) => {
        const u = (t * 0.9 + i / 3) % 1;
        return <circle key={i} cx={lerp(x + 25, x + 95, u)} cy={y + 18 + i * 8} r={3} fill={C.primary} />;
      })}
    </g>
  );
}
function IdleIcon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x + 20} y={y} width={80} height={50} rx={4} fill="none" stroke={C.line} />
      <path d={`M${x + 28} ${y + 38} H${x + 92}`} stroke={C.secondary} strokeWidth={1.6} />
      <T x={x + 60} y={y + 26} s={13} f={C.quiet} a="middle">
        0% busy
      </T>
    </g>
  );
}

// 5 · Three panels: a table being swept end to end, packets crossing a zone boundary, a paid machine with a flat CPU
// line. The first one lights: that's this bill's shape.
export function RevealThreeDominators({ t }: StepCtx) {
  const pick = easeOut(seg(t, 2.6, 3.0));
  const P: [string, number][] = [
    ['scan volume', 0.2],
    ['cross-AZ', 0.8],
    ['idle compute', 1.4],
  ];
  return (
    <Svg label="scan volume, cross-AZ traffic, idle compute — the three shapes a dominating bar usually takes" h={260}>
      {P.map(([name, at], i) => {
        const x = 40 + i * 190;
        const k = easeOut(seg(t, at, at + 0.3));
        const lit = i === 0 && pick > 0.5;
        return (
          <g key={name} opacity={k * (i === 0 ? 1 : 1 - 0.5 * pick)}>
            <rect x={x - 10} y={20} width={160} height={110} rx={5} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.8 : 1} />
            {i === 0 && <ScanIcon x={x + 10} y={36} t={t} />}
            {i === 1 && <AzIcon x={x + 10} y={36} t={t} />}
            {i === 2 && <IdleIcon x={x} y={36} />}
            <T x={x + 70} y={116} s={13} f={lit ? C.focus : C.primary} a="middle" w={600}>
              {name}
            </T>
          </g>
        );
      })}
      <T x={110} y={152} s={13} f={C.focus} a="middle" o={pick}>
        this bill
      </T>
      <T x={40} y={202} s={14} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        scan volume
      </T>
      <T x={575} y={202} s={14} f={C.focus} a="end" o={easeOut(seg(t, 0.7, 1.0))}>
        bytes read per query
      </T>
      <T x={40} y={232} s={14} f={C.primary} o={easeOut(seg(t, 1.8, 2.1))}>
        cross-AZ, idle compute
      </T>
      <T x={575} y={232} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.9, 2.2))}>
        the other two shapes
      </T>
    </Svg>
  );
}

// 6 · A "pruning layout" arrow lands on the requests bar; the bar shrinks to a tenth (6,100 → 610) and the saving is
// counted beside it; per thousand orders, 6.10 becomes 0.61.
export function RevealLeverRatio({ t }: StepCtx) {
  const land = easeOutBack(seg(t, 0.6, 1.0));
  const shrink = easeInOut(seg(t, 1.2, 2.4));
  const H = 0.022, B = 170;
  const v = lerp(6100, 610, shrink);
  return (
    <Svg label="a layout-and-pruning lever lands on the scan-volume bar — it shrinks by a measured ratio, not a guess" h={270}>
      <line x1={60} y1={B} x2={300} y2={B} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={100} y={B - 6100 * H} width={70} height={6100 * H} fill="none" stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <rect x={100} y={B - v * H} width={70} height={v * H} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={135} y={B + 20} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        requests
      </T>
      <T x={135} y={B - v * H - 8} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        {fmt(v)}
      </T>
      {land > 0 && (
        <g opacity={Math.min(1, land)} transform={`translate(0 ${(1 - Math.min(1, land)) * -30})`}>
          <path d="M230 30 L180 30 L180 22 L160 36 L180 50 L180 42 L230 42 Z" fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
          <T x={240} y={41} s={13} f={C.focus}>
            pruning layout
          </T>
        </g>
      )}
      <T x={400} y={110} s={30} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 1.4, 1.7))}>
        −{Math.round(90 * shrink)}%
      </T>
      <T x={400} y={140} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        saved {fmt(5490 * shrink)} a month
      </T>
      <T x={400} y={164} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>
        6.10 → 0.61 per 1,000 orders
      </T>
      <T x={40} y={222} s={14} f={C.primary} o={easeOut(seg(t, 0.4, 0.7))}>
        before the lever
      </T>
      <T x={575} y={222} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 0.5, 0.8))}>
        the full scan bar
      </T>
      <T x={40} y={252} s={14} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        after the lever
      </T>
      <T x={575} y={252} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        a measured fraction left
      </T>
    </Svg>
  );
}

/** A small waterfall (figures not drawn) whose bar `dom` dominates; `cut` shrinks it under a named lever. */
function MiniFall({ x, names, heights, dom, cut, lever, t, at }: { x: number; names: string[]; heights: number[]; dom: number; cut: number; lever: string; t: number; at: number }) {
  const B = 150;
  return (
    <g opacity={easeOut(seg(t, at, at + 0.3))}>
      <line x1={x} y1={B} x2={x + 240} y2={B} stroke={C.line} />
      {heights.map((h, i) => {
        const hh = i === dom ? lerp(h, h * 0.25, cut) : h;
        return (
          <g key={i}>
            <rect x={x + 6 + i * 48} y={B - hh} width={36} height={hh} fill={i === dom ? C.focus : C.primary} opacity={i === dom ? 1 : 0.6} />
            <T x={x + 24 + i * 48} y={B + 18} s={13} f={i === dom ? C.focus : C.quiet} a="middle">
              {names[i]}
            </T>
          </g>
        );
      })}
      <T x={x + 120} y={B + 42} s={13} f={C.focus} a="middle" o={easeOut(seg(t, at + 0.8, at + 1.1))}>
        lever: {lever}
      </T>
    </g>
  );
}

// 7 · Two small waterfalls, figures left off: one led by cross-AZ, which a locality lever shrinks; one led by idle
// compute, which autoscaling shrinks.
export function RevealOtherLevers({ t }: StepCtx) {
  const NAMES = ['cmp', 'sto', 'egr', 'req', 'lic'];
  return (
    <Svg label="the same waterfall, redrawn for a design dominated instead by cross-AZ traffic, then by idle compute" h={270}>
      <MiniFall x={30} names={NAMES} heights={[30, 18, 110, 22, 10]} dom={2} cut={easeInOut(seg(t, 1.0, 1.8))} lever="locality" t={t} at={0.1} />
      <MiniFall x={330} names={NAMES} heights={[110, 18, 14, 22, 10]} dom={0} cut={easeInOut(seg(t, 2.4, 3.2))} lever="autoscale" t={t} at={1.6} />
      <T x={40} y={226} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        cross-AZ dominant
      </T>
      <T x={575} y={226} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        fixed by locality
      </T>
      <T x={40} y={256} s={14} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        idle compute dominant
      </T>
      <T x={575} y={256} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        fixed by autoscaling
      </T>
    </Svg>
  );
}

// 8 · The saving bar (5,490) and, beside it, a thin red write-amplification bar growing to 150; the saving trims to a
// net 5,340.
export function RevealSecondOrderCost({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 1.0, 2.2));
  const W = 0.07;
  const saving = lerp(5490, 5340, grow);
  return (
    <Svg label="the scan-volume lever's saving bar, with a thin second bar growing beside it: the cost the lever itself introduced" h={230}>
      <T x={40} y={40} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        saving
      </T>
      <rect x={140} y={28} width={5490 * W} height={18} fill="none" stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <rect x={140} y={28} width={saving * W * easeOut(seg(t, 0, 0.6))} height={18} fill={C.focus} />
      <T x={575} y={42} s={14} f={C.focus} a="end" w={700} o={easeOut(seg(t, 0.4, 0.7))}>
        {fmt(saving)}
      </T>
      <T x={40} y={92} s={13} f={C.badText} o={easeOut(seg(t, 0.9, 1.2))}>
        write amp.
      </T>
      <rect x={140} y={84} width={Math.max(2, 150 * W * grow)} height={8} fill={C.bad} stroke={C.badText} />
      <T x={575} y={94} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.2, 1.5))}>
        +{fmt(150 * grow)}
      </T>
      <T x={300} y={136} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        pre-aggregating to cut scans adds its own writes
      </T>
      <T x={40} y={182} s={14} f={C.primary} o={easeOut(seg(t, 0.5, 0.8))}>
        the lever's saving
      </T>
      <T x={575} y={182} s={14} f={C.primary} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        a large bar, shrinking
      </T>
      <T x={40} y={212} s={14} f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
        write amplification
      </T>
      <T x={575} y={212} s={14} f={C.badText} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        a thin bar, growing
      </T>
    </Svg>
  );
}

// 9 · Captions return with small marks: five bars, one tall; an arrow on a bar; a short bar beside a thin red one.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['five classes', 'priced per order'],
    ['waterfall', 'finds the dominator'],
    ['lever', 'a measured ratio'],
    ['every lever', 'its own second cost'],
  ];
  return (
    <Svg label="five classes, priced per unit; the waterfall finds the dominator; a lever moves it by a measured ratio; the lever has its own cost" h={280}>
      {rows.map(([label, value], i) => {
        const y = 44 + i * 64;
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.55 + i * 0.7));
        return (
          <g key={label} opacity={k}>
            <T x={100} y={y} s={14} f={i === 2 ? C.focus : C.primary}>
              {label}
            </T>
            <T x={575} y={y} s={14} f={i === 2 ? C.focus : C.secondary} a="end">
              {value}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        {[8, 6, 5, 7, 4].map((h, i) => (
          <rect key={i} x={28 + i * 10} y={48 - h} width={7} height={h} fill={C.primary} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        {[6, 5, 26, 4, 3].map((h, i) => (
          <rect key={i} x={28 + i * 10} y={112 - h * easeInOut(seg(t, 0.9, 1.5))} width={7} height={h * easeInOut(seg(t, 0.9, 1.5))} fill={i === 2 ? C.focus : C.primary} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={38} y={176 - lerp(26, 6, easeInOut(seg(t, 1.8, 2.4)))} width={14} height={lerp(26, 6, easeInOut(seg(t, 1.8, 2.4)))} fill={C.focus} />
        <path d="M70 152 l-10 0 l0 -4 l-8 7 l8 7 l0 -4 l10 0 z" fill={C.focus} />
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        <rect x={28} y={226} width={40} height={8} fill={C.focus} />
        <rect x={28} y={238} width={10 * easeInOut(seg(t, 2.4, 3.0))} height={4} fill={C.badText} />
      </g>
    </Svg>
  );
}

// 10 · A cross-AZ-led design and a new price sheet sliding in. After the pick, the egress bar is cut hard, falls under
// compute (which never moved), the bars re-sort, and the lead changes hands.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const cut = on ? easeInOut(seg(s, 0.3, 1.2)) : 0;
  const resort = on ? easeInOut(seg(s, 1.3, 2.0)) : 0;
  const bars: Cls[] = [
    { name: 'compute', v: 70 },
    { name: 'storage', v: 30 },
    { name: 'egress', v: lerp(120, 25, cut) },
    { name: 'requests', v: 40 },
    { name: 'licence', v: 15 },
  ];
  const before = [1, 3, 0, 2, 4];
  const after = [0, 2, 3, 1, 4];
  const order = before.map((p, i) => lerp(p, after[i], resort));
  return (
    <Svg label="a second price sheet cuts cross-AZ transfer sharply — does the same waterfall still show the same bar dominating?" h={290}>
      <Bars bars={bars} x={50} base={160} slot={104} w={60} h={1} order={order} grow={easeOut(seg(t, 0, 0.6))} lit={resort > 0.5 ? 0 : 2} />
      <g opacity={easeOut(seg(t, 0.6, 1.0))} transform={`translate(${(1 - easeOut(seg(t, 0.6, 1.0))) * 40} 0)`}>
        <rect x={430} y={8} width={140} height={34} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={500} y={30} s={13} f={C.focus} a="middle">
          new price sheet
        </T>
      </g>
      {!on && (
        <T x={300} y={226} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          same leader?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={222} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            a price sheet
          </T>
          <T x={575} y={222} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            cross-AZ cut sharply
          </T>
          <T x={40} y={250} s={14} f={C.focus} o={easeOut(seg(s, 1.4, 1.7))}>
            the dominator
          </T>
          <T x={575} y={250} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.5, 1.8))}>
            not assumed, re-run
          </T>
          <T x={40} y={278} s={14} f={C.primary} o={easeOut(seg(s, 2.1, 2.4))}>
            the answer
          </T>
          <T x={575} y={278} s={14} f={C.focus} a="end" o={easeOut(seg(s, 2.2, 2.5))}>
            it can move
          </T>
        </>
      )}
      <Reticle x={80} y={100} w={90} h={130} t={on ? 1 + s : 0} at={3.2} />
    </Svg>
  );
}
