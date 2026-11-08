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
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own or SOURCES.md's: the Sunday crawl every 7 × 24 hours, the rename at hour 72 and
// the search at hour 96, orders_table becoming orders_archive, temp_export's 2 events, and the two dated status facts. The
// staleness window is computed, so it is drawn as a length.

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 0 · Hook. A week strip. Sunday gets the crawl. Wednesday gets three changes: a drop, a new table, a rename. Thursday's search
// pulls up the old table, still badged certified, and it turns red: stale.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="crawled Sunday. Wednesday: drop, create, rename. Thursday's search finds the old one, certified." h={250}>
      {DAYS.map((d, i) => (
        <Cell key={d} x={25 + i * 78} y={30} w={70} label={d} o={k(i * 0.06)} stroke={(i === 0 && t > 0.6) || (i === 4 && t > 3.0) ? C.focus : i === 3 && t > 1.6 ? C.second : C.mocha} />
      ))}
      <MiniTick x={54} y={76} k={k(0.7)} />
      {t > 0.7 && (
        <T x={60} y={102} s={11} f={C.focus} a="middle" o={k(0.7)}>
          crawl
        </T>
      )}
      <Cross x={294} y={80} k={k(1.7)} />
      <path d="M288 104 h12 m-6 -6 v12" stroke={C.second} strokeWidth={2.2} opacity={k(1.9)} />
      <T x={294} y={134} s={11} f={C.second} a="middle" o={k(2.1)}>
        renamed
      </T>
      <Cell x={300} y={160} w={275} label="orders_table, certified" o={k(3.0)} stroke={t > 3.6 ? C.cherryText : C.mocha} />
      {t > 3.6 && (
        <T x={300} y={212} s={11} f={C.cherryText} o={k(3.6)}>
          Thursday's search: stale
        </T>
      )}
      {t > 4.2 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(4.2)}>
          right within seconds: who does the work?
        </T>
      )}
    </Svg>
  );
}

const NODES: [string, number, number][] = [
  ['person', 25, 40],
  ['table', 230, 100],
  ['dashboard', 445, 40],
  ['column', 230, 190],
  ['term', 25, 190],
  ['tag', 445, 160],
];
const EDGES: [number, number, string, number, number][] = [
  [0, 1, 'owns', 150, 58],
  [1, 2, 'derives from', 370, 70],
  [1, 5, 'tagged with', 360, 168],
  [3, 4, 'means', 170, 184],
];

// 1 · The metadata graph. Six kinds of node arrive, then the edges draw between them one by one, each with its name.
export function RevealMetadataGraph({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const c = (i: number) => [NODES[i][1] + 65, NODES[i][2] + 14];
  return (
    <Svg label="a metadata graph: tables, columns, a glossary term, an owner, a tag -- as nodes and edges" h={250}>
      <line x1={295} y1={128} x2={295} y2={128 + 62 * k(1.2)} stroke={C.mocha} strokeWidth={1.4} />
      {EDGES.map(([a, b, l, lx, ly], i) => {
        const [x1, y1] = c(a);
        const [x2, y2] = c(b);
        const g = k(2.0 + i * 0.5);
        return (
          <g key={l}>
            <line x1={x1} y1={y1} x2={lerp(x1, x2, g)} y2={lerp(y1, y2, g)} stroke={C.second} strokeWidth={1.4} />
            {t > 2.2 + i * 0.5 && (
              <T x={lx} y={ly} s={11} f={C.second} a="middle" o={k(2.2 + i * 0.5)}>
                {l}
              </T>
            )}
          </g>
        );
      })}
      {NODES.map(([n, x, y], i) => (
        <Cell key={n} x={x} y={y} w={130} label={n} o={k(0.2 + i * 0.15)} />
      ))}
    </Svg>
  );
}

// 2 · Predict: crawl or push. Two catalogs side by side, both still reading orders_table, the crawl one waiting on its clock.
// Once answered, the push one flips to orders_archive, ticked; the crawl one stays put.
export function PredictCrawlVsPush({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="Wednesday's rename. Crawl-based or push-based: which shows it first on Thursday?" h={250}>
      <T x={25} y={40} s={12} f={C.crema} o={k(0)}>
        crawl-based
      </T>
      <Cell x={25} y={56} w={250} label="orders_table" o={k(0.2)} />
      <T x={325} y={40} s={12} f={C.crema} o={k(0.4)}>
        push-based
      </T>
      <Cell x={325} y={56} w={250} label={a > 0.5 ? 'orders_archive' : 'orders_table'} o={k(0.6)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={445} y={104} k={a} />
      <circle cx={150} cy={130} r={16} fill="none" stroke={C.taupe} strokeWidth={1.4} opacity={k(0.8)} />
      <line x1={150} y1={130} x2={150 + 11 * Math.sin(t * 3)} y2={130 - 11 * Math.cos(t * 3)} stroke={C.taupe} strokeWidth={1.6} opacity={k(0.8)} />
      {answer === null && t > 1.0 && (
        <T x={300} y={140} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="push: the rename is the update" y={214} />
    </Svg>
  );
}

const X0 = 100;
const W = 460;
const hx = (h: number) => X0 + (h / (7 * 24)) * W;

// 3 · Push wins by the whole gap. A week axis. The rename lands at hour 72 and the push row turns to the new name at once. The
// crawl row stays on the old name all the way to its next run; Thursday's search at hour 96 falls inside that red gap.
export function RevealPushWinsImmediately({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = clamp((t - 0.4) / 2.4);
  const now = 7 * 24 * g;
  const bar = (y: number, switchAt: number) => (
    <g>
      <rect x={X0} y={y} width={Math.max(0, hx(Math.min(now, switchAt)) - X0)} height={14} rx={2} fill={C.latte} />
      {now > switchAt && <rect x={hx(switchAt)} y={y} width={Math.max(0, hx(now) - hx(switchAt))} height={14} rx={2} fill={C.second} />}
    </g>
  );
  return (
    <Svg label="measured: push shows it at once; crawl waits for its next scheduled run" h={250}>
      <rect x={25} y={24} width={10} height={10} rx={2} fill={C.latte} opacity={k(0)} />
      <T x={40} y={33} s={11} f={C.latte} o={k(0)}>
        orders_table
      </T>
      <rect x={160} y={24} width={10} height={10} rx={2} fill={C.second} opacity={k(0)} />
      <T x={175} y={33} s={11} f={C.second} o={k(0)}>
        orders_archive
      </T>
      <T x={25} y={82} s={11} f={C.crema} o={k(0.2)}>
        push
      </T>
      {bar(70, 72)}
      <T x={25} y={132} s={11} f={C.crema} o={k(0.2)}>
        crawl
      </T>
      {bar(120, 7 * 24)}
      <line x1={hx(96)} y1={56} x2={hx(96)} y2={150} stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(1.8)} />
      {t > 1.8 && (
        <T x={hx(96)} y={170} s={11} f={C.focus} a="middle" o={k(1.8)}>
          the search
        </T>
      )}
      <rect x={hx(72)} y={190} width={Math.max(0, (hx(7 * 24) - hx(72)) * easeOut(seg(t, 3.0, 3.8)))} height={10} rx={2} fill={C.cherryText} />
      {t > 3.8 && (
        <T x={25} y={232} s={11} f={C.cherryText} o={k(3.8)}>
          crawl: stale until its next run
        </T>
      )}
    </Svg>
  );
}

// 4 · The three daily uses. Three cards in turn. Search: a list re-sorting by use. Trust: query count, owner and freshness
// rows tick in. Agree: one term wired to the columns it means.
export function ElaborateDailyUses({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sort = easeInOut(seg(t, 0.8, 1.6));
  const lens = [40, 110, 70, 130];
  const order = [1, 3, 2, 0];
  return (
    <Svg label="search, usage statistics and a glossary: what a catalog is used for day to day" h={250}>
      {['search', 'usage stats', 'glossary'].map((n, i) => (
        <g key={n}>
          <rect x={25 + i * 190} y={30} width={170} height={190} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={k(i * 1.2)} />
          <T x={39 + i * 190} y={52} s={12} f={C.crema} o={k(i * 1.2)}>
            {n}
          </T>
        </g>
      ))}
      {lens.map((l, i) => {
        const rank = order.indexOf(i);
        const y = lerp(70 + i * 30, 70 + rank * 30, sort);
        return <rect key={i} x={39} y={y} width={l} height={12} rx={2} fill={rank === 0 && sort > 0.5 ? C.second : C.latte} opacity={k(0.3)} />;
      })}
      {['queries', 'owner', 'freshness'].map((n, i) => (
        <g key={n}>
          <MiniTick x={229} y={76 + i * 36} k={k(1.6 + i * 0.3)} />
          <T x={249} y={84 + i * 36} s={11} f={C.latte} o={k(1.5 + i * 0.3)}>
            {n}
          </T>
        </g>
      ))}
      <Cell x={429} y={70} w={120} label="term" o={k(2.8)} stroke={C.second} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={489} y1={98} x2={444 + i * 45} y2={160} k={k(3.2 + i * 0.15)} f={C.second} />
          <rect x={430 + i * 45} y={164} width={30} height={30} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={k(3.0)} />
        </g>
      ))}
    </Svg>
  );
}

// 5 · Predict: created and dropped between crawls. The week again: temp_export appears Monday and is gone Tuesday, both between
// two crawls. Once answered, both crawls show an empty slot: it was never seen.
export function PredictCreateDropBetweenCrawls({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a table created and dropped between two crawls. Does the crawl-based catalog ever see it?" h={250}>
      {[...DAYS, 'Sun'].map((d, i) => (
        <T key={i} x={50 + i * 70} y={40} s={11} f={i === 0 || i === 7 ? C.focus : C.taupe} a="middle" o={k(i * 0.04)}>
          {d}
        </T>
      ))}
      <line x1={50} y1={56} x2={540} y2={56} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      <rect x={120} y={68} width={70} height={18} rx={3} fill="none" stroke={C.second} strokeWidth={1.4} opacity={k(0.5)} />
      <Cross x={190} y={77} k={k(0.9)} />
      {t > 0.5 && (
        <T x={120} y={106} s={11} f={C.second} o={k(0.5)}>
          temp_export
        </T>
      )}
      <Hole x={20} y={130} w={60} o={a} stroke={C.cherryText} />
      <Hole x={510} y={130} w={60} o={a} stroke={C.cherryText} />
      {answer === null && t > 1.0 && (
        <T x={300} y={150} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="never seen, not even as deleted" y={214} />
    </Svg>
  );
}

// 6 · Measured. Crawl lane: its two snapshots, Sunday and the next Sunday, each opened and each empty of temp_export. Push lane:
// the create event and the drop event land one after the other, counted: 2.
export function RevealCrawlNeverSeesIt({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="measured: no -- the crawl-based catalog never learns it existed at all" h={250}>
      <T x={25} y={44} s={12} f={C.crema} o={k(0)}>
        crawl
      </T>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={140 + i * 220} y={30} width={150} height={56} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.3} opacity={k(0.3 + i * 0.6)} />
          <T x={150 + i * 220} y={50} s={11} f={C.taupe} o={k(0.3 + i * 0.6)}>
            {i === 0 ? 'Sunday crawl' : 'next Sunday'}
          </T>
          <rect x={150 + i * 220} y={60} width={90} height={10} rx={2} fill={C.latte} opacity={k(0.5 + i * 0.6)} />
          <Hole x={250 + i * 220} y={57} w={32} h={16} o={k(0.7 + i * 0.6)} stroke={C.cherryText} />
        </g>
      ))}
      {t > 1.6 && (
        <T x={140} y={110} s={11} f={C.cherryText} o={k(1.6)}>
          temp_export: never in either
        </T>
      )}
      <T x={25} y={164} s={12} f={C.crema} o={k(2.2)}>
        push
      </T>
      <Cell x={140} y={150} w={150} label="create" o={k(2.6)} stroke={C.second} />
      <Cell x={310} y={150} w={150} label="drop" o={k(3.2)} stroke={C.second} />
      {t > 3.6 && (
        <T x={480} y={169} s={12} f={C.focus} o={k(3.6)}>
          2 events
        </T>
      )}
    </Svg>
  );
}

const TECHQ = ['where are its files?', 'who may read it?'];
const BIZQ = ['what does a column mean?', 'who owns it?', 'where did it come from?'];

// 7 · Technical versus business. Two headers. The technical catalog's two questions drop in on the left, the business
// catalog's three on the right.
export function ElaborateTechnicalVsBusiness({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a technical catalog answers where files are; a business catalog answers what a column means" h={250}>
      <Cell x={25} y={30} w={250} label="technical catalog" o={k(0.2)} stroke={C.second} />
      <Cell x={325} y={30} w={250} label="business catalog" o={k(2.0)} stroke={C.focus} />
      {TECHQ.map((q, i) => (
        <T key={q} x={35} y={100 + i * 34} s={11} f={C.crema} o={k(0.8 + i * 0.4)}>
          {q}
        </T>
      ))}
      {BIZQ.map((q, i) => (
        <T key={q} x={335} y={100 + i * 34} s={11} f={C.crema} o={k(2.6 + i * 0.4)}>
          {q}
        </T>
      ))}
      <line x1={300} y1={30} x2={300} y2={30 + 190 * k(1.6)} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 4" />
    </Svg>
  );
}

const TECH = ['Unity Catalog OSS', 'Apache Polaris'];
const DISC = ['DataHub', 'OpenMetadata'];
const PAID = ['Collibra', 'Atlan', 'Alation'];

// 8 · The open-source split. Two technical chips drop under the files-and-access side, two discovery chips under the
// meaning-and-ownership side, and three dashed commercial chips join that side as paid platforms.
export function RevealOpenSourceSplit({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const drop = (d: number) => (1 - easeOutBack(seg(t, d, d + 0.4))) * -14;
  return (
    <Svg label="Unity Catalog OSS, Polaris: technical. DataHub, OpenMetadata: business. Collibra, Atlan, Alation: enterprise" h={250}>
      <T x={25} y={34} s={11} f={C.second} o={k(0)}>
        files and access
      </T>
      <T x={325} y={34} s={11} f={C.focus} o={k(0)}>
        meaning and ownership
      </T>
      {TECH.map((n, i) => (
        <g key={n} transform={`translate(0 ${drop(0.6 + i * 0.4).toFixed(1)})`}>
          <Cell x={25} y={50 + i * 44} w={250} label={n} o={k(0.6 + i * 0.4)} stroke={C.second} />
        </g>
      ))}
      {DISC.map((n, i) => (
        <g key={n} transform={`translate(0 ${drop(2.0 + i * 0.4).toFixed(1)})`}>
          <Cell x={325} y={50 + i * 44} w={250} label={n} o={k(2.0 + i * 0.4)} stroke={C.focus} />
        </g>
      ))}
      {PAID.map((n, i) => (
        <g key={n}>
          <Hole x={325 + i * 86} y={150} w={78} o={k(3.4 + i * 0.2)} />
          <T x={364 + i * 86} y={169} s={11} f={C.latte} a="middle" o={k(3.4 + i * 0.2)}>
            {n}
          </T>
        </g>
      ))}
      {t > 4.0 && (
        <T x={325} y={206} s={11} f={C.taupe} o={k(4.0)}>
          commercial, the same side
        </T>
      )}
    </Svg>
  );
}

// 9 · Two status facts. Polaris's card rises a step: graduated to a top-level Apache project. Amundsen's card drops into an
// archive box: archived for inactivity.
export function RevealStatusFacts({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const up = easeOutBack(seg(t, 0.8, 1.6));
  const dn = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="Polaris: top-level ASF project, Feb 2026. Amundsen: archived for inactivity, Sept 2026" h={250}>
      <path d="M25 120 h80 v-30 h80 v-30 h80" fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      <Cell x={lerp(105, 185, up)} y={lerp(62, 32, up)} w={110} label="Polaris" o={k(0.3)} stroke={C.focus} />
      {t > 1.6 && (
        <T x={25} y={150} s={11} f={C.focus} o={k(1.6)}>
          top-level Apache project, February 2026
        </T>
      )}
      <rect x={400} y={150} width={150} height={60} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.4} opacity={k(2.4)} />
      <path d="M392 150 h166" stroke={C.taupe} strokeWidth={2} opacity={k(2.4)} />
      <Cell x={410} y={lerp(60, 170, dn)} w={130} label="Amundsen" o={k(2.4) * (1 - 0.4 * dn)} stroke={dn > 0.5 ? C.taupe : C.mocha} f={dn > 0.5 ? C.taupe : C.crema} />
      {t > 3.6 && (
        <T x={25} y={226} s={11} f={C.cherryText} o={k(3.6)}>
          Amundsen: archived for inactivity, September 2026
        </T>
      )}
    </Svg>
  );
}

const RECAP = ['a graph of things and their links', 'kept honest by push, not a schedule', 'technical: where the files are', 'business: what any of it means'];

// 10 · Recap. The four lines land in order, each ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a graph of nodes and edges, kept current by push, not crawl; technical vs business catalogs differ in question" h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={44 + i * 46} k={k(0.6 + i * 1.0)} />
          <T x={50} y={50 + i * 46} s={12} f={C.crema} o={k(0.5 + i * 1.0)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}
