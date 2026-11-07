import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the window or the chosen value, cherryText = the misleading or costly one, crema = data,
// latte = labels, taupe = structure.

const QUIET = [1, 3, 5, 7, 9, 11, 12];
const BUSY = [100, 100, 100, 101, 101, 101, 101];

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

// 1 · Overview: three lines, each with its own small machine: a tally filling, a bracket sliding, and bars sorting to find the middle.
export function Overview({ t }: StepCtx) {
  const items = [
    ['running total', 'a tally is enough'],
    ['moving average', 'a tally, with rows leaving'],
    ['median, p99', 'the whole ordered set'],
  ];
  const hs = [30, 12, 44, 20, 38, 8, 26];
  const order = [...hs].sort((a, b) => a - b);
  return (
    <Svg label="Running totals and moving averages need a tally; percentiles like the median need the whole ordered set" h={280}>
      {items.map((it, i) => {
        const k = easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
        const g = seg(t, i * 1.0 + 0.4, i * 1.0 + 1.3);
        const y = 40 + i * 76;
        return (
          <g key={it[0]} opacity={k}>
            <T x={25} y={y + 20} s={18} f={i === 2 ? C.cherryText : C.caramel} w={700}>
              {it[0]}
            </T>
            <T x={25} y={y + 46} s={14} f={C.latte}>
              {it[1]}
            </T>
            {i === 0 && Array.from({ length: 7 }, (_, j) => <rect key={j} x={370 + j * 29} y={y + 8} width={24} height={24} rx={4} fill={g * 7 > j ? C.caramel : C.cocoa} stroke={C.mocha} />)}
            {i === 1 && (
              <>
                {Array.from({ length: 7 }, (_, j) => (
                  <rect key={j} x={370 + j * 29} y={y + 8} width={24} height={24} rx={4} fill={C.cocoa} stroke={C.mocha} />
                ))}
                <rect x={366 + lerp(0, 4, easeInOut(g)) * 29} y={y + 4} width={3 * 29 + 2} height={32} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
              </>
            )}
            {i === 2 &&
              hs.map((h, j) => {
                const to = order.indexOf(h);
                const x = lerp(370 + j * 29, 370 + to * 29, easeInOut(g));
                const mid = to === 3 && g >= 1;
                return <rect key={j} x={x} y={y + 40 - h * 0.8} width={22} height={h * 0.8} rx={3} fill={mid ? C.caramel : C.latte} opacity={mid ? 1 : 0.6} />;
              })}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Grow vs slide: the top block only grows (a plus under each new cell); the bottom one slides, a plus entering and a minus leaving.
export function GrowSlide({ t }: StepCtx) {
  const cur = Math.min(13, Math.floor(seg(t, 0.4, 3.2) * 14));
  const on = t > 0.4;
  const xc = (i: number) => 41 + i * 39;
  return (
    <Svg label="A cumulative frame only grows; a moving frame slides, so rows leaving it must be subtracted out" h={260}>
      <T x={25} y={36} s={14} f={C.latte}>
        cumulative: start → current
      </T>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + i * 39} y={48} width={32} height={26} rx={5} fill={on && i <= cur ? C.caramel : C.cocoa} stroke={C.mocha} />
      ))}
      {on && (
        <T x={xc(cur)} y={96} s={14} f={C.caramel} a="middle" w={700}>
          +
        </T>
      )}
      <T x={25} y={136} s={14} f={C.latte}>
        moving: the last 7 rows
      </T>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + i * 39} y={148} width={32} height={26} rx={5} fill={on && i <= cur && i > cur - 7 ? C.caramel : i === cur - 7 && on ? C.cherry : C.cocoa} stroke={C.mocha} />
      ))}
      {on && (
        <T x={xc(cur)} y={196} s={14} f={C.caramel} a="middle" w={700}>
          +
        </T>
      )}
      {on && cur >= 7 && (
        <T x={xc(cur - 7)} y={196} s={14} f={C.cherryText} a="middle" w={700}>
          −
        </T>
      )}
      <T x={25} y={236} s={13} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.9))}>
        rows leaving the frame must be subtracted out
      </T>
    </Svg>
  );
}

/** Seven orders on a day axis: spread over the days, or stacked on the same day. One day = 49 units. */
function DayDots({ days, y, lo, o = 1, drop = 1 }: { days: number[]; y: number; lo: number; o?: number; drop?: number }) {
  const seen: Record<number, number> = {};
  return (
    <g opacity={o}>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {days.map((d, i) => {
        const k = (seen[d] = (seen[d] ?? -1) + 1);
        const p = easeOutBack(seg(drop, i / 9, i / 9 + 0.3));
        return p > 0 ? <circle key={i} cx={30 + (d - lo) * 49} cy={lerp(y - 70, y - k * 16, p)} r={7} fill={C.crema} /> : null;
      })}
    </g>
  );
}

// 3 · Predict: the same seven orders land spread over twelve days and stacked into two. After the answer, the two spans are measured.
export function RowsLie({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const drop = seg(t, 0.1, 1.5);
  const span = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="Seven rows span 12 days when quiet and 2 days when busy: a frame of seven rows is not a week" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>
        quiet: 7 rows
      </T>
      <DayDots days={QUIET} y={80} lo={1} drop={drop} />
      <T x={25} y={130} s={13} f={C.latte}>
        busy: 7 rows
      </T>
      <DayDots days={BUSY} y={210} lo={100} drop={drop} />
      {answered && (
        <>
          <line x1={30} y1={100} x2={lerp(30, 569, span)} y2={100} stroke={C.caramel} strokeWidth={2} />
          <T x={300} y={122} s={14} f={C.caramel} a="middle" o={span}>
            12 days
          </T>
          <line x1={30} y1={230} x2={lerp(30, 79, span)} y2={230} stroke={C.cherryText} strokeWidth={2} />
          <T x={95} y={235} s={14} f={C.cherryText} o={span}>
            2 days
          </T>
          <T x={300} y={278} s={15} f={C.crema} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
            the same 7 rows cover 12 days, or 2
          </T>
        </>
      )}
      {!answered && (
        <T x={500} y={170} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}

// 4 · RANGE with INTERVAL: on the quiet line the bracket grows back seven days from day 12 and holds 4 orders; on the busy line it holds all 7.
export function RangeInterval({ t }: StepCtx) {
  const g1 = easeInOut(seg(t, 0.4, 1.5));
  const b = easeOut(seg(t, 2.0, 2.3));
  const g2 = easeInOut(seg(t, 2.4, 3.3));
  const qx = (d: number) => 30 + (d - 1) * 49;
  const left1 = lerp(qx(12), qx(6), g1);
  const left2 = lerp(30 + 6 * 49, 30, g2);
  return (
    <Svg label="RANGE with an INTERVAL includes every row within 7 days of the current row: 4 orders on the quiet stretch, all 7 on the busy one" h={290}>
      <rect x={left1 - 14} y={46} width={qx(12) - left1 + 28} height={50} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} />
      <DayDots days={QUIET} y={74} lo={1} />
      {QUIET.map((d, i) => (d >= 6 && g1 >= 1 ? <circle key={i} cx={qx(d)} cy={74} r={7} fill={C.caramel} /> : null))}
      <T x={left1 - 14} y={116} s={13} f={C.latte} o={g1}>
        {g1 >= 1 ? 'day 6' : ''}
      </T>
      <T x={575} y={30} s={15} f={C.caramel} a="end" w={700} o={easeOut(seg(t, 1.5, 1.8))}>
        4 rows
      </T>
      <g opacity={b}>
        <rect x={left2 - 14} y={136} width={30 + 6 * 49 - left2 + 28} height={86} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} />
        <DayDots days={BUSY.map((d) => d - 95)} y={204} lo={0} />
        {g2 >= 1 && BUSY.map((d, i) => <circle key={i} cx={30 + (d - 95) * 49} cy={204 - (i < 3 ? i : i - 3) * 16} r={7} fill={C.caramel} />)}
      </g>
      <T x={575} y={170} s={15} f={C.caramel} a="end" w={700} o={easeOut(seg(t, 3.3, 3.6))}>
        7 rows
      </T>
      <T x={300} y={272} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        every row within 7 days, however many
      </T>
    </Svg>
  );
}

// 5 · Ordered set: the four values lift on separate arcs and land sorted; then the middle is marked and the syntax appears.
export function OrderedSet({ t }: StepCtx) {
  const vals = [30, 10, 40, 20];
  const to = [2, 0, 3, 1];
  const lift = [-45, 45, -90, 90];
  const p = easeInOut(seg(t, 0.6, 2.0));
  const done = easeOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="A percentile has to sort the whole set first: 30, 10, 40, 20 become 10, 20, 30, 40, and the middle exists only then" h={300}>
      {vals.map((v, i) => {
        const x = lerp(60 + i * 100, 60 + to[i] * 100, p);
        const y = 120 + lift[i] * Math.sin(Math.PI * p);
        return (
          <g key={v}>
            <rect x={x} y={y} width={80} height={40} rx={8} fill={C.cocoa} stroke={p >= 1 ? C.caramel : C.mocha} />
            <T x={x + 40} y={y + 26} s={16} f={C.crema} a="middle">
              {String(v)}
            </T>
          </g>
        );
      })}
      <path d="M250 176 l-8 12 h16 z" fill={C.caramel} opacity={done} />
      <T x={250} y={208} s={13} f={C.caramel} a="middle" o={done}>
        middle
      </T>
      <T x={25} y={248} s={15} f={C.caramel} w={700} o={easeOut(seg(t, 2.6, 3.0))}>
        WITHIN GROUP (ORDER BY …)
      </T>
      <T x={25} y={276} s={13} f={C.latte} o={easeOut(seg(t, 2.9, 3.3))}>
        the engine must sort first
      </T>
    </Svg>
  );
}

// 6 · Predict: the two middle values pulse. After the answer, a point slides to halfway (25) and the discrete pick lands on 20.
export function MedianPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 2 + Math.sin(t * 5);
  const slide = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="The median of 10, 20, 30, 40: continuous gives 25, discrete gives 20" h={260}>
      {[10, 20, 30, 40].map((v, i) => (
        <g key={i}>
          <rect x={60 + i * 100} y={50} width={80} height={40} rx={8} fill={C.cocoa} stroke={i === 1 || i === 2 ? C.caramel : C.mocha} strokeWidth={i === 1 || i === 2 ? pulse : 1} />
          <T x={100 + i * 100} y={76} s={16} f={C.crema} a="middle">
            {String(v)}
          </T>
        </g>
      ))}
      {!answered ? (
        <T x={300} y={180} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <circle cx={lerp(200, 250, slide)} cy={110} r={7} fill={C.caramel} />
          <path d="M200 98 l-6 10 h12 z" fill={C.cinnamon} opacity={easeOut(seg(s, 0.9, 1.2))} />
          <T x={300} y={170} s={24} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.9, 1.3))}>
            cont 25 · disc 20
          </T>
        </>
      )}
    </Svg>
  );
}

// 7 · Cont vs disc: outlined rings travel along the line to 25 and 37 (values nobody recorded); then the discrete picks snap onto 20 and 40.
export function ContDisc({ t }: StepCtx) {
  const x = (v: number) => 40 + (v - 10) * 15;
  const a = easeInOut(seg(t, 0.4, 1.3));
  const b = easeInOut(seg(t, 1.6, 2.5));
  const c = easeOutBack(seg(t, 2.7, 3.0));
  const d = easeOutBack(seg(t, 3.1, 3.4));
  return (
    <Svg label="Continuous percentiles interpolate to 25 and 37; discrete ones return a real value, 20 and 40" h={300}>
      <line x1={x(10)} y1={100} x2={x(40)} y2={100} stroke={C.taupe} strokeWidth={2} />
      {[10, 20, 30, 40].map((v) => (
        <g key={v}>
          <circle cx={x(v)} cy={100} r={8} fill={C.crema} />
        </g>
      ))}
      {a > 0 && <circle cx={lerp(x(10), x(25), a)} cy={100} r={10} fill="none" stroke={C.caramel} strokeWidth={3} />}
      <T x={x(25)} y={140} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        cont 0.5 = 25
      </T>
      {b > 0 && <circle cx={lerp(x(10), x(37), b)} cy={100} r={10} fill="none" stroke={C.caramel} strokeWidth={3} />}
      <T x={x(37)} y={176} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        cont 0.9 = 37
      </T>
      <path d={`M${x(20)} ${lerp(40, 84, clamp(c))} l-7 -10 h14 z`} fill={C.cinnamon} opacity={c > 0 ? 1 : 0} />
      <T x={x(20)} y={40} s={14} f={C.cinnamon} a="middle" o={clamp(c)}>
        disc 0.5 = 20
      </T>
      <path d={`M${x(40)} ${lerp(40, 84, clamp(d))} l-7 -10 h14 z`} fill={C.cinnamon} opacity={d > 0 ? 1 : 0} />
      <T x={575} y={40} s={14} f={C.cinnamon} a="end" o={clamp(d)}>
        disc 0.9 = 40
      </T>
    </Svg>
  );
}

// 8 · Array form: three calls fill three sort bars one after another; then one call fills one bar and three answers fan out from it.
export function ArrayForm({ t }: StepCtx) {
  const ans = ['25', '37', '39.7'];
  const one = seg(t, 1.8, 2.3);
  return (
    <Svg label="Three percentile calls sort three times; one call with an array of fractions sorts once and returns all three answers" h={260}>
      <T x={25} y={40} s={15} f={C.cherryText}>
        three calls: three sorts
      </T>
      {[0, 1, 2].map((i) => {
        const f = seg(t, 0.3 + i * 0.45, 0.7 + i * 0.45);
        return (
          <g key={i}>
            <rect x={25 + i * 110} y={54} width={96} height={28} rx={6} fill="none" stroke={C.mocha} />
            <rect x={25 + i * 110} y={54} width={96 * f} height={28} rx={6} fill={C.cherry} />
          </g>
        );
      })}
      <T x={25} y={136} s={15} f={C.caramel} w={700}>
        one call: ARRAY[0.5, 0.9, 0.99]
      </T>
      <rect x={25} y={150} width={96} height={28} rx={6} fill="none" stroke={C.mocha} />
      <rect x={25} y={150} width={96 * one} height={28} rx={6} fill={C.caramel} />
      {ans.map((a, i) => {
        const k = easeOutBack(seg(t, 2.4 + i * 0.25, 2.7 + i * 0.25));
        return (
          <g key={a} opacity={clamp(k)}>
            <line x1={121} y1={164} x2={lerp(121, 170 + i * 80, clamp(k))} y2={164} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="3 3" />
            <rect x={170 + i * 80} y={150} width={64} height={28} rx={6} fill={C.cocoa} stroke={C.caramel} />
            <T x={202 + i * 80} y={169} s={13} f={C.crema} a="middle">
              {a}
            </T>
          </g>
        );
      })}
      <T x={25} y={222} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        one sort, three answers
      </T>
    </Svg>
  );
}

// 9 · Buckets: ten rows are dealt into four buckets (3, 3, 2, 2); the sizes land under them, then the CUME_DIST line.
export function Buckets({ t }: StepCtx) {
  const bucket = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3];
  const cols = [C.caramel, C.cinnamon, C.latte, C.taupe];
  const centers = [25 + 46 + 20, 25 + 4 * 46 + 24 + 20, 25 + 6.5 * 46 + 48 + 20, 25 + 8.5 * 46 + 72 + 20];
  return (
    <Svg label="NTILE(4) over 10 rows gives buckets of 3, 3, 2 and 2, the remainder rows going first" h={260}>
      {bucket.map((b, i) => {
        const a = easeOut(seg(t, i * 0.06, i * 0.06 + 0.3));
        const m = easeInOut(seg(t, 0.7 + i * 0.12, 1.1 + i * 0.12));
        return <rect key={i} x={lerp(25 + i * 54, 25 + i * 46 + b * 24, m)} y={lerp(30, 80, m)} width={lerp(46, 40, m)} height={40} rx={8} fill={m > 0.5 ? cols[b] : C.crema} opacity={a} />;
      })}
      {[3, 3, 2, 2].map((n, b) => (
        <T key={b} x={centers[b]} y={150} s={16} f={cols[b]} a="middle" w={700} o={easeOut(seg(t, 2.1 + b * 0.15, 2.4 + b * 0.15))}>
          {String(n)}
        </T>
      ))}
      <T x={25} y={192} s={15} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>
        remainder rows go to the first buckets
      </T>
      <T x={25} y={228} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        CUME_DIST: share of rows at or below
      </T>
    </Svg>
  );
}

// 10 · Scale: the exact bar fills three times, once per refresh; the sketch bar fills once, short, and stays.
export function Scale({ t }: StepCtx) {
  const cyc = Math.min(2, Math.floor(Math.max(0, t - 0.3) / 0.9));
  const fill = seg(t, 0.3 + cyc * 0.9, 1.0 + cyc * 0.9);
  const sk = easeOut(seg(t, 0.5, 0.9));
  return (
    <Svg label="Exact percentiles sort everything on every refresh; approximate sketches use one pass and bounded memory" h={260}>
      <T x={25} y={40} s={15} f={C.cherryText} w={700}>
        exact: full sort per refresh
      </T>
      <T x={575} y={40} s={13} f={C.latte} a="end" o={t > 0.3 ? 1 : 0}>
        {`refresh ${cyc + 1}`}
      </T>
      <rect x={25} y={54} width={500} height={24} rx={6} fill="none" stroke={C.mocha} />
      <rect x={25} y={54} width={500 * fill} height={24} rx={6} fill={C.cherry} />
      <T x={25} y={130} s={15} f={C.caramel} w={700}>
        approximate sketch: one pass
      </T>
      <rect x={25} y={144} width={90 * sk} height={24} rx={6} fill={C.caramel} />
      <T x={25} y={206} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>
        a trade-off, covered in full later
      </T>
    </Svg>
  );
}

// 11 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['calendar window', 'RANGE with INTERVAL'],
    ['percentile', 'say CONT or DISC'],
    ['many percentiles', 'one call, an array'],
  ];
  return (
    <Svg label="Three habits for running statistics: RANGE with INTERVAL for calendar windows, say CONT or DISC, one call with an array for many percentiles" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.5));
        const bar = easeInOut(seg(t, i * 0.9 + 0.3, i * 0.9 + 0.9));
        const tick = easeOut(seg(t, i * 0.9 + 0.8, i * 0.9 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={20} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={360 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveDisc({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const snap = answered ? easeOutBack(seg(s, 0.5, 0.9)) : 0;
  return (
    <Svg label="percentile_disc always returns a value that is in the data" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        always in the data →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.caramel} w={700} o={k}>
            percentile_disc
          </T>
          <line x1={40} y1={190} x2={340} y2={190} stroke={C.taupe} strokeWidth={2} />
          {[40, 140, 240, 340].map((x) => (
            <circle key={x} cx={x} cy={190} r={6} fill={C.crema} />
          ))}
          <path d={`M140 ${lerp(150, 178, clamp(snap))} l-7 -10 h14 z`} fill={C.cinnamon} opacity={snap > 0 ? 1 : 0} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveNtile({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="The first bucket of NTILE(4) over 10 rows holds 3 rows" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        first bucket →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.caramel} w={700} o={k}>
            3 rows
          </T>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={40 + i * 40} y={170} width={32} height={28} rx={5} fill={i < 3 && s > 0.5 + i * 0.15 ? C.caramel : C.cocoa} stroke={C.mocha} />
          ))}
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
