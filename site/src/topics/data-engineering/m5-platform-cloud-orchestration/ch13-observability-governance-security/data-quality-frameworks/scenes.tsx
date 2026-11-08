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

// Every value here is examples.py's own or SOURCES.md's: orders 1 to 3 with order 2's null customer, the discount cases (100.0
// at 10 off to 90.0, 50.0 at 0 to 50.0, 19.99 at 25 to 14.99), the three partitions of 3, 2 and 4 rows, the 100 rows with row
// 63 corrupt against a sample of every 10th, Soda 4, and the May 2026 GX announcement. The non-null count is computed, so it
// is drawn as stacked marks.

// 0 · Hook. A dozen checks bolt onto the pipeline and the runtime bar doubles. Partitions then flow to the dashboard, one of
// them red; it reaches the dashboard, and only afterward does the check that would have caught it run.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const dbl = easeInOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="a dozen checks added, runtime doubles. Two weeks later, a bad partition still ships." h={250}>
      {Array.from({ length: 12 }, (_, i) => (
        <Pip key={i} x={130 + i * 22} y={34} f={C.second} o={k(0.2 + i * 0.06)} s={10} />
      ))}
      <T x={25} y={38} s={11} f={C.latte} o={k(0)}>
        new checks
      </T>
      <T x={25} y={78} s={11} f={C.latte} o={k(1.2)}>
        runtime
      </T>
      <rect x={120} y={66} width={lerp(150, 300, dbl)} height={16} rx={2} fill={dbl > 0.5 ? C.cherryText : C.latte} opacity={k(1.2)} />
      <line x1={25} y1={160} x2={440} y2={160} stroke={C.mocha} strokeWidth={1.2} opacity={k(2.4)} />
      {[0, 1, 2, 3].map((i) => {
        const p = clamp((t - 2.6 - i * 0.25) / 1.0);
        return p > 0 ? <rect key={i} x={lerp(25, 420, p)} y={152} width={18} height={16} rx={2} fill={i === 2 ? C.cherryText : C.latte} opacity={1 - easeOut(seg(p, 0.9, 1))} /> : null;
      })}
      <Cell x={445} y={146} w={130} label="dashboard" o={k(2.4)} stroke={t > 3.8 ? C.cherryText : C.mocha} />
      {t > 4.0 && (
        <T x={25} y={214} s={11} f={C.cherryText} o={k(4.0)}>
          the check that would catch it ran after it shipped
        </T>
      )}
    </Svg>
  );
}

// 1 · Gate versus post-hoc. Top lane: partitions run into the gate's barrier; the bad one stops there, crossed, and never
// publishes. Bottom lane: everything lands, the bad one too; later, the post-hoc scan points at it and only reports.
export function RevealGateVsPosthoc({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const lane = (y: number, d: number, stopBad: boolean) =>
    [0, 1, 2, 3].map((i) => {
      const p = clamp((t - d - i * 0.25) / 1.0);
      const bad = i === 1;
      const end = stopBad && bad ? 240 : 540;
      return p > 0 ? <rect key={i} x={lerp(25, end - i * 24, p)} y={y - 8} width={18} height={16} rx={2} fill={bad ? C.cherryText : C.latte} /> : null;
    });
  return (
    <Svg label="a gate runs in the pipeline and can block; a post-hoc scan runs after and can't" h={250}>
      <Cell x={210} y={30} w={110} label="gate" o={k(0)} stroke={C.focus} />
      <line x1={265} y1={58} x2={265} y2={112} stroke={C.focus} strokeWidth={3} opacity={k(0)} />
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1} opacity={k(0)} />
      {lane(100, 0.4, true)}
      <Cross x={250} y={124} k={k(1.6)} />
      {t > 1.8 && (
        <T x={300} y={128} s={11} f={C.focus} o={k(1.8)}>
          blocked before anyone reads it
        </T>
      )}
      <line x1={25} y1={200} x2={575} y2={200} stroke={C.mocha} strokeWidth={1} opacity={k(2.4)} />
      {lane(200, 2.4, false)}
      <Cell x={400} y={150} w={175} label="post-hoc scan" o={k(3.4)} />
      <path d={`M440 178 L${lerp(440, 525, k(3.8))} ${lerp(178, 190, k(3.8))}`} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="3 3" />
      {t > 4.0 && (
        <T x={25} y={236} s={11} f={C.cherryText} o={k(4.0)}>
          already out: it can only report
        </T>
      )}
    </Svg>
  );
}

const CHECKS = ['not-null', 'freshness', 'drift'];

// 2 · Predict: which checks gate. Three checks sit above two buckets. Once answered, not-null drops into the gate and freshness
// and drift slide over into post-hoc.
export function PredictGateChecks({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  return (
    <Svg label="not-null, freshness, distribution drift -- which goes in the gate?" h={250}>
      <rect x={25} y={120} width={260} height={80} rx={5} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(0.6)} />
      <T x={39} y={192} s={11} f={C.focus} o={k(0.6)}>
        gate
      </T>
      <rect x={315} y={120} width={260} height={80} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(0.7)} />
      <T x={329} y={192} s={11} f={C.latte} o={k(0.7)}>
        post-hoc
      </T>
      {CHECKS.map((n, i) => {
        const m = answer !== null ? easeInOut(seg(s, 0.2 + i * 0.2, 0.7 + i * 0.2)) : 0;
        const tx = i === 0 ? 40 : 330 + (i - 1) * 120;
        return <Cell key={n} x={lerp(25 + i * 190, tx, m)} y={lerp(40, 134, m)} w={110} label={n} o={k(i * 0.2)} stroke={m > 0.5 ? (i === 0 ? C.focus : C.latte) : C.mocha} />;
      })}
      {answer === null && t > 1.0 && (
        <T x={300} y={104} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="only not-null gates" y={234} />
    </Svg>
  );
}

// 3 · Why. The gate holds not-null: cheap, decisive. Freshness needs a clock and drift needs history; both glyphs appear in the
// post-hoc box, and the same two glyphs at the gate are crossed: it carries neither.
export function RevealGateAnswer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const clock = (x: number, y: number, o: number) => (
    <g opacity={o}>
      <circle cx={x} cy={y} r={10} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <path d={`M${x} ${y} v-6 M${x} ${y} h5`} stroke={C.latte} strokeWidth={1.5} />
    </g>
  );
  const hist = (x: number, y: number, o: number) => <path d={`M${x - 12} ${y + 6} l6 -8 l6 4 l6 -10 l6 6`} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={o} />;
  return (
    <Svg label="not-null: gate, cheap. freshness: needs a clock outside the run. drift: needs history" h={250}>
      <rect x={25} y={30} width={260} height={180} rx={5} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(0)} />
      <T x={39} y={52} s={11} f={C.focus} o={k(0)}>
        gate
      </T>
      <Cell x={40} y={66} w={110} label="not-null" o={k(0.3)} stroke={C.focus} />
      {t > 0.8 && (
        <T x={160} y={85} s={11} f={C.focus} o={k(0.8)}>
          cheap, decisive
        </T>
      )}
      {clock(60, 160, k(3.0))}
      <Cross x={60} y={160} k={k(3.4)} />
      {hist(120, 160, k(3.0))}
      <Cross x={120} y={160} k={k(3.6)} />
      {t > 3.6 && (
        <T x={150} y={165} s={11} f={C.cherryText} o={k(3.6)}>
          has neither
        </T>
      )}
      <rect x={315} y={30} width={260} height={180} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(1.4)} />
      <T x={329} y={52} s={11} f={C.latte} o={k(1.4)}>
        post-hoc
      </T>
      <Cell x={330} y={66} w={120} label="freshness" o={k(1.6)} />
      {clock(480, 80, k(2.0))}
      <Cell x={330} y={130} w={120} label="drift" o={k(2.2)} />
      {hist(480, 142, k(2.6))}
    </Svg>
  );
}

const BUILT: [string, string, boolean][] = [
  ['order 1', 'c1', true],
  ['order 2', 'null', false],
  ['order 3', 'c3', true],
];
const CASES = ['100.0, 10 off: 90.0', '50.0, 0 off: 50.0', '19.99, 25 off: 14.99'];

// 4 · Data test versus unit test. Left: a not-null test sweeps the built orders and flags order 2. Right: a dashed, unbuilt
// table, and the unit test's three mocked cases each ticked against the logic.
export function RevealDataVsUnitTest({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a data test checks built data; a unit test checks the transformation's own logic" h={250}>
      <T x={25} y={32} s={12} f={C.crema} o={k(0)}>
        data test: built rows
      </T>
      {BUILT.map(([o, c, ok], i) => (
        <g key={o}>
          <rect x={25} y={50 + i * 36} width={250} height={28} rx={3} fill={C.cocoa} stroke={!ok && t > 1.4 ? C.cherryText : C.mocha} strokeWidth={1.4} opacity={k(0.3 + i * 0.1)} />
          <T x={37} y={69 + i * 36} s={11} f={C.latte} o={k(0.3 + i * 0.1)}>
            {o}
          </T>
          <T x={150} y={69 + i * 36} s={11} f={ok ? C.latte : C.cherryText} o={k(0.3 + i * 0.1)}>
            {c}
          </T>
          {!ok && <Cross x={255} y={64 + i * 36} k={k(1.4)} />}
        </g>
      ))}
      <T x={315} y={32} s={12} f={C.crema} o={k(2.2)}>
        unit test: mocked rows
      </T>
      <Hole x={315} y={190} w={260} h={34} o={k(2.2)} />
      {t > 2.2 && (
        <T x={327} y={212} s={11} f={C.taupe} o={k(2.2)}>
          no table built yet
        </T>
      )}
      {CASES.map((c, i) => (
        <g key={c}>
          <T x={315} y={69 + i * 36} s={11} f={C.crema} o={k(2.6 + i * 0.4)}>
            {c}
          </T>
          <MiniTick x={545} y={63 + i * 36} k={k(2.9 + i * 0.4)} />
        </g>
      ))}
    </Svg>
  );
}

const FRAMEWORKS: [string, string][] = [
  ['GX Core', 'declared expectations'],
  ['Soda 4', 'a written contract'],
  ['Deequ', 'computed metrics'],
  ['DQX', 'checks in PySpark code'],
];

// 5 · The landscape. Four cards land in the order the narration names them, each with its own lens and a small glyph: a
// checklist, a contract page, a metric bar, code brackets with a stream arrow.
export function ElaborateFrameworkLandscape({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="GX Core, Soda 4, Deequ, DQX: expectations, contracts, metrics, PySpark checks" h={250}>
      {FRAMEWORKS.map(([n, d], i) => {
        const x = 25 + (i % 2) * 280;
        const y = 30 + Math.floor(i / 2) * 105;
        const o = k(0.3 + i * 1.0);
        return (
          <g key={n} opacity={o}>
            <rect x={x} y={y} width={270} height={92} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} />
            <T x={x + 14} y={y + 26} s={12} f={C.crema}>
              {n}
            </T>
            <T x={x + 14} y={y + 50} s={11} f={C.taupe}>
              {d}
            </T>
            {i === 0 && [0, 1, 2].map((j) => <MiniTick key={j} x={x + 14 + j * 30} y={y + 66} k={k(0.6 + j * 0.15)} />)}
            {i === 1 && [0, 1, 2].map((j) => <rect key={j} x={x + 14} y={y + 64 + j * 6} width={80 - j * 20} height={3} rx={1} fill={C.latte} />)}
            {i === 2 && <rect x={x + 14} y={y + 66} width={Math.max(0, 120 * k(2.6))} height={10} rx={2} fill={C.second} />}
            {i === 3 && (
              <g>
                <T x={x + 14} y={y + 78} s={12} f={C.second}>
                  {'{ }'}
                </T>
                <path d={`M${x + 50} ${y + 73} h${50 * k(3.6)} l-6 -4 m6 4 l-6 4`} fill="none" stroke={C.second} strokeWidth={1.5} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · GX's change of hands. One GX box splits. GX Cloud slides right under FICO; GX Core slides left under Fivetran, still open
// source. The announcement's date settles underneath.
export function ElaborateGxStewardship({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sp = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="in May 2026 FICO acquired GX Cloud -- Fivetran became steward of GX Core" h={250}>
      <Cell x={lerp(170, 25, sp)} y={100} w={130} label="GX Core" o={k(0)} stroke={sp > 0.5 ? C.focus : C.mocha} />
      <Cell x={lerp(300, 445, sp)} y={100} w={130} label="GX Cloud" o={k(0)} stroke={sp > 0.5 ? C.second : C.mocha} />
      <Cell x={445} y={36} w={130} label="FICO" o={k(2.2)} stroke={C.second} />
      <line x1={510} y1={64} x2={510} y2={64 + 36 * k(2.4)} stroke={C.second} strokeWidth={1.4} />
      {t > 2.6 && (
        <T x={445} y={152} s={11} f={C.second} o={k(2.6)}>
          acquired
        </T>
      )}
      <Cell x={25} y={36} w={130} label="Fivetran" o={k(3.0)} stroke={C.focus} />
      <line x1={90} y1={64} x2={90} y2={64 + 36 * k(3.2)} stroke={C.focus} strokeWidth={1.4} />
      {t > 3.4 && (
        <T x={25} y={152} s={11} f={C.focus} o={k(3.4)}>
          steward, still open source
        </T>
      )}
      {t > 4.0 && (
        <T x={300} y={222} s={11} f={C.taupe} a="middle" o={k(4.0)}>
          announced May 2026
        </T>
      )}
    </Svg>
  );
}

const LEVERS = ['full rescan', 'incremental metric', 'a small sample'];

// 7 · Predict: cost and misses. Three methods with empty cost bars. Once answered, the bars grow, long, short, shortest, and the
// sample gets a cross: it can miss a rare row.
export function PredictCostLever({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const lens = [300, 90, 40];
  return (
    <Svg label="full rescan, incremental metric, a small sample -- rank by cost, and by what each can miss" h={250}>
      {LEVERS.map((n, i) => {
        const g = answer !== null ? easeOut(seg(s, 0.2 + i * 0.2, 0.7 + i * 0.2)) : 0;
        return (
          <g key={n}>
            <T x={25} y={54 + i * 44} s={11} f={C.crema} o={k(i * 0.2)}>
              {n}
            </T>
            <rect x={190} y={42 + i * 44} width={320} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" opacity={k(0.3)} />
            <rect x={190} y={42 + i * 44} width={Math.max(0, lens[i] * g)} height={16} rx={2} fill={C.latte} />
            {i === 2 && <Cross x={540} y={138} k={g} />}
          </g>
        );
      })}
      {answer === null && t > 1.0 && (
        <T x={540} y={96} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="cheaper bets it won't miss the one row" y={210} />
    </Svg>
  );
}

const PARTS = [
  [true, false, true],
  [true, true],
  [false, true, true, true],
];

// 8 · Incremental equals full. Three partitions of 3, 2 and 4 rows, two of them holding a null (hollow). Top: the rescan sweeps
// every partition and stacks a mark per non-null row. Bottom: each partition folds its own count into the running stack.
// The two stacks finish level: equal.
export function RevealIncrementalEqualsFull({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const flat = PARTS.flat();
  const nonNull = flat.filter(Boolean).length;
  const fullN = Math.round(nonNull * clamp((t - 1.0) / 1.4));
  let acc = 0;
  const cum = PARTS.map((p) => (acc += p.filter(Boolean).length));
  const incN = t > 4.0 ? cum[2] : t > 3.4 ? cum[1] : t > 2.8 ? cum[0] : 0;
  return (
    <Svg label="measured: a metric merged partition by partition equals the full rescan, exactly" h={250}>
      {PARTS.map((p, j) => (
        <g key={j}>
          <rect x={25 + j * 110} y={60} width={100} height={110} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(j * 0.15)} />
          {p.map((ok, i) =>
            ok ? (
              <rect key={i} x={45 + j * 110} y={72 + i * 24} width={60} height={14} rx={2} fill={C.latte} opacity={k(0.2 + j * 0.15)} />
            ) : (
              <rect key={i} x={45 + j * 110} y={72 + i * 24} width={60} height={14} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.2} strokeDasharray="3 2" opacity={k(0.2 + j * 0.15)} />
            ),
          )}
        </g>
      ))}
      <T x={380} y={44} s={11} f={C.latte} o={k(0.8)}>
        full rescan
      </T>
      <T x={480} y={44} s={11} f={C.second} o={k(2.6)}>
        incremental
      </T>
      {Array.from({ length: nonNull }, (_, i) => (
        <g key={i}>
          {i < fullN && <rect x={390} y={210 - i * 18} width={50} height={12} rx={2} fill={C.latte} />}
          {i < incN && <rect x={490} y={210 - i * 18} width={50} height={12} rx={2} fill={C.second} />}
        </g>
      ))}
      <line x1={380} y1={210 - (nonNull - 1) * 18 - 4} x2={555} y2={210 - (nonNull - 1) * 18 - 4} stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(4.2)} />
      {t > 4.2 && (
        <T x={25} y={214} s={12} f={C.focus} o={k(4.2)}>
          equal, and far cheaper
        </T>
      )}
    </Svg>
  );
}

// 9 · The sample misses. A 10 × 10 grid of the 100 rows, row 63 planted red. The full scan sweeps every cell and rings it. The
// sample lights only every 10th row, one column, and the red row sits between its picks: missed.
export function RevealSampleMisses({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sweep = clamp((t - 0.8) / 1.4);
  const samp = k(2.8);
  return (
    <Svg label="measured: a small sample missed the one bad row a full scan always catches" h={250}>
      {Array.from({ length: 100 }, (_, n) => {
        const r = Math.floor(n / 10);
        const c = n % 10;
        const bad = n === 62;
        const picked = c === 0;
        const scanned = n / 100 < sweep && t < 2.6;
        return <rect key={n} x={25 + c * 20} y={30 + r * 20} width={14} height={14} rx={2} fill={bad ? C.cherryText : picked && samp > 0.5 ? C.second : scanned ? C.crema : C.mocha} opacity={0.9} />;
      })}
      <circle cx={72} cy={157} r={lerp(14, 11, k(2.2))} fill="none" stroke={C.focus} strokeWidth={2} opacity={k(2.2) * (1 - k(2.8))} />
      {t > 2.2 && (
        <T x={250} y={80} s={11} f={C.focus} o={k(2.2)}>
          full scan: found it, row 63
        </T>
      )}
      {t > 3.0 && (
        <T x={250} y={120} s={11} f={C.second} o={k(3.0)}>
          every 10th row: the sample
        </T>
      )}
      {t > 3.6 && (
        <T x={250} y={160} s={11} f={C.cherryText} o={k(3.6)}>
          landed between its picks: missed
        </T>
      )}
    </Svg>
  );
}

// 10 · Recap. Two questions, each with its two answers: where a check lives (block, or only report) and how it is computed
// (what it costs, and what it might miss).
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="where decides if it can block; how it's computed decides what it costs and misses" h={250}>
      <Cell x={25} y={36} w={250} label="where it lives" o={k(0.4)} stroke={C.focus} />
      <T x={39} y={96} s={11} f={C.crema} o={k(1.0)}>
        stop it before anyone reads it
      </T>
      <T x={39} y={124} s={11} f={C.taupe} o={k(1.4)}>
        or only report afterward
      </T>
      <Cell x={325} y={36} w={250} label="how it is computed" o={k(2.2)} stroke={C.second} />
      <T x={339} y={96} s={11} f={C.crema} o={k(2.8)}>
        what you pay for it
      </T>
      <T x={339} y={124} s={11} f={C.cherryText} o={k(3.4)}>
        and what it might miss
      </T>
    </Svg>
  );
}
