import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** Three zone columns of one region, drawn in by `k`; zone A darkens by `dark`. */
const ZX = [30, 215, 400];
function Zones({ k, dark, top = 40, h = 160 }: { k: number; dark: number; top?: number; h?: number }) {
  return (
    <g>
      {ZX.map((x, i) => (
        <g key={i} opacity={k}>
          <rect
            x={x}
            y={top}
            width={170}
            height={h}
            rx={8}
            fill={i === 0 ? C.bad : 'none'}
            fillOpacity={i === 0 ? 0.18 * dark : 0}
            stroke={i === 0 && dark > 0.5 ? C.cherryText : C.mocha}
            strokeWidth={1.5}
          />
          <T x={x + 8} y={top - 8} s={12} f={i === 0 && dark > 0.5 ? C.cherryText : C.latte}>
            {`Zone ${'ABC'[i]}`}
          </T>
        </g>
      ))}
    </g>
  );
}

// 1 · One zone goes dark. The database lives in zone A only; the object store spans all three zones; the streaming cluster
// keeps one broker per zone. Zone A fails: the database stops answering, the other two keep their requests flowing.
export function OneZoneDark({ t }: StepCtx) {
  const z = easeOut(seg(t, 0, 0.4));
  const dark = easeInOut(seg(t, 1.0, 1.5));
  const out = (d: number) => easeOut(seg(t, 1.5 + d, 1.9 + d));
  const flow = (t * 0.8) % 1;
  return (
    <Svg label="A zone fails; a single-zone database goes dark while a regional store and a multi-zone cluster keep serving" h={250}>
      <Zones k={z} dark={dark} />
      <Cell x={45} y={58} w={130} label="database" o={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.55 * dark)} />
      <Cross x={188} y={72} k={out(0)} />
      <Cell x={45} y={108} w={525} label="regional object store" o={easeOut(seg(t, 0.35, 0.65))} />
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={ZX[i] + 15} y={158} w={140} label="broker" o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1)) * (i === 0 ? 1 - 0.55 * dark : 1)} />
      ))}
      <Cross x={168} y={150} k={out(0.2)} />
      <MiniTick x={500} y={128} k={out(0.4)} />
      <MiniTick x={350} y={150} k={out(0.6)} />
      <MiniTick x={535} y={150} k={out(0.6)} />
      {[0, 1].map((i) => {
        const x = lerp(250, 520, (flow + i * 0.5) % 1);
        return <Pip key={i} x={x} y={97} s={6} f={C.second} o={easeOut(seg(t, 0.8, 1.0))} />;
      })}
      {t > 2.6 && (
        <T x={300} y={235} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          same outage, three outcomes, chosen long before
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict: three services drawn inside the failing zone. After the answer, the bucket's copies slide out into zones B
// and C; the volume and the zonal database are crossed out.
export function WhichSurvives({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const dark = easeInOut(seg(t, 0.4, 1.0));
  const rows = ['block volume', 'single-zone database', 'bucket'];
  return (
    <Svg label="Three services pinned to the same failing zone; only the regional object store keeps serving" h={250}>
      <rect x={25} y={40} width={290} height={150} rx={8} fill={C.bad} fillOpacity={0.18 * dark} stroke={dark > 0.5 ? C.cherryText : C.mocha} strokeWidth={1.5} />
      <T x={33} y={32} s={12} f={dark > 0.5 ? C.cherryText : C.latte}>
        this zone just failed
      </T>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={335 + i * 125} y={40} width={115} height={150} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={343 + i * 125} y={32} s={12} f={C.latte}>
            {`Zone ${'BC'[i]}`}
          </T>
        </g>
      ))}
      {rows.map((r, i) => (
        <Cell key={r} x={40} y={58 + i * 44} w={220} label={r} o={easeOut(seg(t, 0.1 * i, 0.3 + 0.1 * i)) * (i < 2 ? 1 - 0.5 * v : 1)} stroke={i === 2 && v > 0.5 ? C.focus : C.mocha} />
      ))}
      <Cross x={286} y={72} k={v} />
      <Cross x={286} y={116} k={v} />
      {v > 0 && [0, 1].map((i) => <Cell key={i} x={lerp(40, 345 + i * 125, v)} y={146} w={95} label="copy" o={v} stroke={C.focus} f={C.focus} />)}
      <Verdict answer={answer} text="the bucket: one region, copies in every zone" y={225} />
    </Svg>
  );
}

// 3 · Ask it one service at a time. Each row shades the zones a service occupies: the volume one zone, the database one
// zone with its multi-zone box left unticked by default, object storage every zone by design. Then the three providers.
export function ZonalRegionalStrip({ t }: StepCtx) {
  const rows: [string, number, string, boolean][] = [
    ['Block volume', 1, 'zonal', true],
    ['Managed database', 1, 'opt-in, off', true],
    ['Object storage', 3, 'regional', false],
  ];
  const warn = easeOut(seg(t, 2.4, 2.9));
  const clouds = ['AWS', 'Google Cloud', 'Azure'];
  return (
    <Svg label="Five hundred gigabytes replicated each direction per day, at one cent per gigabyte each way, costs ten dollars a day" h={250}>
      {['A', 'B', 'C'].map((z, j) => (
        <T key={z} x={235 + j * 70} y={30} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
          {`zone ${z}`}
        </T>
      ))}
      {rows.map(([svc, n, tag, bad], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
        const y = 45 + i * 50;
        return (
          <g key={svc} opacity={k}>
            <T x={25} y={y + 20} s={13} f={C.crema}>
              {svc}
            </T>
            {[0, 1, 2].map((j) => {
              const on = j < n ? easeOut(seg(t, 0.4 + i * 0.6 + j * 0.15, 0.7 + i * 0.6 + j * 0.15)) : 0;
              return <rect key={j} x={205 + j * 70} y={y} width={60} height={30} rx={4} fill={C.second} fillOpacity={0.5 * on} stroke={C.mocha} strokeWidth={1.5} />;
            })}
            {i === 1 && <Hole x={275} y={y} w={60} h={30} o={warn * (0.6 + 0.4 * Math.sin(t * 6))} stroke={C.cherryText} />}
            <T x={575} y={y + 20} s={12} f={bad ? C.cherryText : C.focus} a="end" w={600}>
              {tag}
            </T>
          </g>
        );
      })}
      {t > 2.4 && <rect x={18} y={88} width={562} height={44} rx={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={warn} />}
      {clouds.map((c, i) => {
        const k = easeOut(seg(t, 3.4 + i * 0.3, 3.7 + i * 0.3));
        return (
          <g key={c}>
            <Cell x={25 + i * 190} y={200} w={150} label={c} o={k} />
            <MiniTick x={180 + i * 190} y={212} k={k} />
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The price of the spread. Replication packets cross the zone boundary both ways; the per-gigabyte rate, the day's
// bill and the month's bill land one after another.
export function CrossAzCost({ t }: StepCtx) {
  const z = easeOut(seg(t, 0, 0.4));
  const p = easeOut(seg(t, 0.4, 0.8));
  const flow = (t * 0.7) % 1;
  const line = (d: number) => easeOut(seg(t, d, d + 0.4));
  return (
    <Svg label="Five hundred gigabytes replicated each direction per day, at one cent per gigabyte each way, costs ten dollars a day" h={250}>
      <Cell x={25} y={50} w={150} h={70} label="zone A" o={z} />
      <Cell x={425} y={50} w={150} h={70} label="zone B" o={z} />
      <line x1={300} y1={40} x2={300} y2={130} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={z} />
      <T x={300} y={32} s={11} f={C.latte} a="middle" o={p}>
        500 GB / day each way
      </T>
      {[0, 1, 2].map((i) => {
        const f = (flow + i / 3) % 1;
        return (
          <g key={i} opacity={p}>
            <Pip x={lerp(185, 415, f)} y={70} s={8} f={C.second} />
            <Pip x={lerp(415, 185, f)} y={100} s={8} f={C.second} />
            {Math.abs(f - 0.5) < 0.04 && <circle cx={300} cy={70} r={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />}
          </g>
        );
      })}
      <T x={25} y={165} s={13} f={C.latte} o={line(1.4)}>
        $0.01 per GB, each direction
      </T>
      <T x={25} y={200} s={17} f={C.caramel} w={700} o={line(2.2)}>
        $10 / day
      </T>
      <T x={25} y={235} s={13} f={C.latte} o={line(3.2)}>
        a month: $300, its own line item
      </T>
    </Svg>
  );
}

// 5 · Cells. A routing layer sends each customer to one of twenty cells; a bad deploy strikes one cell, and it turns red
// alone. Two strips compare one cell's slice with a whole region's.
export function CellBlastRadius({ t }: StepCtx) {
  const g = easeOut(seg(t, 0, 0.5));
  const drop = easeIn2(seg(t, 1.2, 1.7));
  const bad = easeOut(seg(t, 1.7, 2.0));
  const s1 = easeOut(seg(t, 2.4, 2.9));
  const s2 = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="A grid of twenty independent cells; one cell turns bad while every other cell keeps serving its own customers" h={255}>
      <Cell x={110} y={20} w={384} h={22} label="routing layer" o={g} />
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 110 + (i % 5) * 80;
        const y = 56 + Math.floor(i / 5) * 30;
        const pulse = 0.4 + 0.4 * Math.max(0, Math.sin(t * 4 - i * 0.7));
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.02, 0.4 + i * 0.02))}>
            <rect
              x={x}
              y={y}
              width={64}
              height={22}
              rx={4}
              fill={i === 0 ? C.bad : 'none'}
              fillOpacity={i === 0 ? 0.7 * bad : 0}
              stroke={i === 0 && bad > 0.5 ? C.cherryText : C.mocha}
              strokeWidth={1.5}
            />
            {!(i === 0 && bad > 0.5) && <Pip x={x + 32} y={y + 11} s={6} f={C.second} o={pulse} />}
          </g>
        );
      })}
      {drop > 0 && bad < 1 && <Bolt x={80} y={lerp(30, 67, drop)} k={1 - bad} />}
      <T x={25} y={190} s={12} f={C.latte} o={s1}>
        one bad cell
      </T>
      <T x={575} y={190} s={12} f={C.cherryText} a="end" o={s1}>
        5% of customers
      </T>
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={25 + i * 27.5} y={197} width={25} height={8} rx={2} fill={i === 0 ? C.cherryText : C.mocha} opacity={s1} />
      ))}
      <T x={25} y={228} s={12} f={C.latte} o={s2}>
        a whole region
      </T>
      <T x={575} y={228} s={12} f={C.cherryText} a="end" o={s2}>
        every customer
      </T>
      <rect x={25} y={235} width={550 * s2} height={8} rx={2} fill={C.cherryText} opacity={s2 > 0 ? 0.8 : 0} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}

// 6 · Recap: three lines, each beside a small picture of its idea, then the one habit.
export function Recap({ t }: StepCtx) {
  const lines = ['Zonal, regional or multi-zone: check the service', 'Cross-zone traffic for redundancy is billed', 'A cell bounds a failure below the region'];
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.6, 0.5 + i * 0.6));
  const h = easeOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="Recap: check each service's failure domain, cross-zone traffic is billed, a cell bounds a failure" h={240}>
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25 + j * 22} y={34} width={18} height={18} rx={3} fill={j === 0 ? C.second : 'none'} fillOpacity={0.5} stroke={C.mocha} strokeWidth={1.5} />
        ))}
        <T x={110} y={48} s={13} f={C.crema}>
          {lines[0]}
        </T>
      </g>
      <g opacity={k(1)}>
        <line x1={25} y1={103} x2={85} y2={103} stroke={C.mocha} strokeWidth={1.5} />
        <Pip x={lerp(28, 82, (t * 0.8) % 1)} y={103} s={8} f={C.second} />
        <T x={110} y={108} s={13} f={C.crema}>
          {lines[1]}
        </T>
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={25 + (j % 2) * 30} y={152 + Math.floor(j / 2) * 14} width={26} height={11} rx={2} fill={j === 0 ? C.cherryText : 'none'} stroke={C.mocha} strokeWidth={1.2} />
        ))}
        <T x={110} y={168} s={13} f={C.crema}>
          {lines[2]}
        </T>
      </g>
      {t > 2.1 && (
        <T x={300} y={225} s={13} f={C.focus} a="middle" o={h}>
          ask which failure it promises to survive
        </T>
      )}
    </Svg>
  );
}
