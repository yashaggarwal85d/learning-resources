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

/** A pointer from (x1, y) back toward x2 < x1, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}
function Coin({ x, y, k, f = C.caramel }: { x: number; y: number; k: number; f?: string }) {
  return <circle cx={x} cy={y} r={5 * k} fill="none" stroke={f} strokeWidth={2} opacity={k} />;
}

// Every claim here traces to each project's own documentation, Forrester's and the press's reporting on the licensing
// shift, and Dremio's own data-gravity explainer (SOURCES.md); the object store and Iceberg table are examples.py's real run.

// 0 · A busy-every-hour strip across the top. The same workload moves from on-prem to the cloud; nothing about it changes.
// Then the two bills: the depreciated cluster's flat one, and the cloud's, which grows past it every month.
export function MovedForSavingsHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const move = easeInOut(seg(t, 1.0, 1.7));
  const cloud = easeOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="A steady workload moved to the cloud for savings, and the bill went up instead" h={250}>
      {Array.from({ length: 24 }, (_, j) => (
        <Pip key={j} x={36 + j * 22.5} y={32} s={10} f={C.focus} o={easeOut(seg(t, j * 0.02, 0.3 + j * 0.02))} />
      ))}
      <T x={25} y={58} s={11} f={C.taupe} o={k(0.3)}>
        busy every hour, around the clock
      </T>
      <T x={25} y={82} s={12} f={C.crema} o={k(0.4)}>
        on-prem
      </T>
      <Hole x={25} y={90} w={200} h={44} o={k(0.4)} />
      <T x={375} y={82} s={12} f={C.crema} o={k(0.5)}>
        cloud
      </T>
      <Hole x={375} y={90} w={200} h={44} o={k(0.5)} stroke={C.second} />
      <Cell x={lerp(50, 400, move)} y={98} w={160} label="the same workload" o={k(0.6)} />
      <rect x={95} y={164} width={40} height={56} rx={2} fill={C.second} opacity={k(2.2)} />
      {t > 2.3 && (
        <T x={145} y={214} s={11} f={C.second} o={k(2.3)}>
          fully depreciated
        </T>
      )}
      <rect x={530} y={220 - 76 * cloud} width={40} height={76 * cloud} rx={2} fill={C.cherryText} opacity={cloud > 0 ? 1 : 0} />
      {t > 3.4 && (
        <T x={520} y={214} s={11} f={C.cherryText} a="end" o={k(3.4)}>
          higher, every month
        </T>
      )}
      {t > 4.1 && (
        <T x={300} y={162} s={12} f={C.crema} a="middle" o={k(4.1)}>
          no idle moment to reward
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A day of usage, full from edge to edge. A marker sweeps the top looking for an idle window to shrink
// into. Once answered, it finds none and is crossed: no idle time, no discount.
export function PredictWhyCostMore({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sweep = easeInOut(seg(t, 0.4, 1.3));
  return (
    <Svg label="Elasticity's pitch is paying only for use — what happens with no idle time?" h={250}>
      <T x={25} y={40} s={11} f={C.taupe} o={k(0)}>
        a day of usage
      </T>
      <rect x={25} y={80} width={550 * k(0.1)} height={70} rx={2} fill={C.second} opacity={0.7} />
      <line x1={25} y1={150} x2={575} y2={150} stroke={C.mocha} strokeWidth={1.5} />
      <path d={`M${lerp(35, 560, sweep)} 62 l-6 -10 h12 z`} fill={C.caramel} opacity={k(0.3)} />
      {t > 0.5 && (
        <T x={25} y={176} s={11} f={C.caramel} o={k(0.5)}>
          looking for a quiet hour to shrink into
        </T>
      )}
      <Cross x={560} y={40} k={v} />
      <Verdict answer={answer} text="no idle time, no discount" y={220} />
    </Svg>
  );
}

// 2 · The old estate: one cluster shape holding YARN over HDFS. The new pattern builds beside it as four general-purpose
// layers; YARN's job goes to Kubernetes, HDFS's to an object store, and the engine and table format become layers of
// their own.
export function LegacyVsModernStack({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const modern = ['Iceberg: table format', 'Spark or Trino: engine', 'Kubernetes: scheduling', 'object store: storage'];
  const when = [3.4, 2.8, 1.6, 2.2];
  return (
    <Svg label="A decade-old HDFS/YARN estate, replaced by object storage, Kubernetes, Trino, Iceberg" h={250}>
      <rect x={25} y={40} width={200} height={172} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={62} s={11} f={C.taupe} o={k(0)}>
        one cluster shape
      </T>
      <Cell x={37} y={136} w={176} label="YARN: scheduling" o={k(0.3)} />
      <Cell x={37} y={172} w={176} label="HDFS: storage" o={k(0.5)} />
      {modern.map((m, i) => (
        <Cell key={m} x={355} y={40 + i * 48} w={220} label={m} o={k(when[i])} stroke={C.second} />
      ))}
      <Req x1={218} x2={349} y={150} k={easeInOut(seg(t, 1.3, 1.7))} f={C.second} />
      <Req x1={218} x2={349} y={192} k={easeInOut(seg(t, 1.9, 2.3))} f={C.second} />
      {t > 4.0 && (
        <T x={355} y={240} s={11} f={C.focus} o={k(4.0)}>
          each its own layer now
        </T>
      )}
    </Svg>
  );
}

// 3 · The real run. The warehouse bucket holding plant.events. The first batch's three rows slide up and become one
// Parquet file, an Avro manifest and snapshot one; the second batch's two rows add snapshot two. A reader reads it back.
export function RealObjectStoreDemo({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const b1 = ['1 · eu', '2 · us', '3 · eu'];
  const b2 = ['4 · eu', '5 · eu'];
  const rows = (labels: string[], d: number) =>
    labels.map((l, i) => {
      const m = easeInOut(seg(t, d + i * 0.1, d + 0.5 + i * 0.1));
      const gone = easeOut(seg(t, d + 0.6, d + 0.9));
      return gone < 1 ? <Cell key={l} x={lerp(25, 140, m)} y={40 + i * 36} w={90} label={l} o={k(d - 0.2) * (1 - gone)} /> : null;
    });
  const file = (y: number, d: number, n: string) => (
    <g>
      <Cell x={262} y={y} w={82} h={26} label="parquet" o={k(d)} stroke={C.second} />
      <Cell x={352} y={y} w={70} h={26} label="avro" o={k(d + 0.15)} />
      <Pip x={438} y={y + 13} s={12} f={C.focus} o={k(d + 0.3)} />
      {t > d + 0.3 && (
        <T x={452} y={y + 17} s={11} f={C.focus} o={k(d + 0.3)}>
          {n}
        </T>
      )}
    </g>
  );
  return (
    <Svg label="A real local object store, a real Iceberg table, two appends, two real snapshots" h={250}>
      <rect x={250} y={30} width={325} height={130} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={262} y={50} s={11} f={C.taupe} o={k(0)}>
        s3://warehouse/ · plant.events
      </T>
      {rows(b1, 0.4)}
      {file(66, 1.3, 'snapshot one')}
      {rows(b2, 2.2)}
      {file(110, 3.1, 'snapshot two')}
      <Back x1={300} x2={185} y={200} k={easeInOut(seg(t, 3.8, 4.3))} f={C.focus} />
      <Cell x={25} y={186} w={150} label="reader" o={k(3.8)} stroke={C.focus} />
      {t > 4.3 && (
        <T x={315} y={205} s={12} f={C.focus} o={k(4.3)}>
          5 rows back, 2 real snapshots
        </T>
      )}
    </Svg>
  );
}

// 4 · One acquisition closes; weeks later "own it once" turns into "keep paying". A sprawl of products collapses to
// two offerings, and a row of organisations, nearly all of them, lights up as the change reaches them.
export function LicensingShock({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const merge = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="A licensing shift, in named stages, reaching most organisations at once" h={250}>
      <T x={25} y={24} s={11} f={C.caramel} o={k(0)}>
        one acquisition closes
      </T>
      <Cell x={25} y={36} w={150} label="own it once" o={k(0.2)} stroke={t > 1.2 ? C.taupe : C.mocha} f={t > 1.2 ? C.taupe : C.crema} />
      <Req x1={180} x2={419} y={50} k={easeInOut(seg(t, 0.6, 1.2))} label="weeks later" f={C.caramel} />
      <Cell x={425} y={36} w={150} label="keep paying" o={k(1.2)} stroke={C.cherryText} f={C.cherryText} />
      {[0, 1, 2, 3].map((j) => (
        <Coin key={j} x={440 + j * 30} y={82} k={easeOutBack(seg(t, 1.4 + j * 0.15, 1.7 + j * 0.15))} f={C.cherryText} />
      ))}
      {Array.from({ length: 12 }, (_, j) => {
        const target = j < 6 ? 260 : 300;
        return <Pip key={j} x={lerp(40 + j * 40, target, merge)} y={128} s={12} f={C.second} o={k(1.8)} />;
      })}
      {t > 2.8 && (
        <T x={330} y={133} s={11} f={C.second} o={k(2.8)}>
          cut to two offerings
        </T>
      )}
      {Array.from({ length: 16 }, (_, j) => (
        <Pip key={j} x={40 + j * 33} y={190} s={10} f={t > 3.2 + j * 0.07 && j !== 11 ? C.caramel : C.mocha} o={k(3.0)} />
      ))}
      {t > 4.4 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(4.4)}>
          renting forever, not new technology
        </T>
      )}
    </Svg>
  );
}

// 5 · Four reasons down the side, three workloads across the top, filled a column at a time: the big analytics estate
// passes data gravity and steady utilisation, the plant control loop passes OT proximity, the bursty job passes none.
export function FourReasons({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const reasons = ['data gravity', 'OT proximity', 'sovereignty', 'steady utilisation'];
  const cols = [
    { x: 280, label: 'big analytics', pass: [true, false, false, true], d: 1.2 },
    { x: 400, label: 'control loop', pass: [false, true, false, false], d: 2.4 },
    { x: 515, label: 'bursty job', pass: [false, false, false, false], d: 3.6 },
  ];
  return (
    <Svg label="Four reasons, each a specific test, not a feeling" h={250}>
      {cols.map((c) => (
        <T key={c.label} x={c.x} y={40} s={11} f={C.crema} a="middle" o={k(c.d - 0.3)}>
          {c.label}
        </T>
      ))}
      {reasons.map((r, i) => {
        const y = 72 + i * 38;
        return (
          <g key={r}>
            <T x={25} y={y + 4} s={12} f={C.crema} o={k(0.2 + i * 0.15)}>
              {r}
            </T>
            {cols.map((c, j) => (c.pass[i] ? <MiniTick key={j} x={c.x - 6} y={y} k={k(c.d + i * 0.1)} /> : <Cross key={j} x={c.x} y={y} k={k(c.d + i * 0.1) * 0.6} />))}
          </g>
        );
      })}
      {t > 4.6 && (
        <T x={25} y={234} s={12} f={C.focus} o={k(4.6)}>
          a test it passes or fails, not a feeling
        </T>
      )}
    </Svg>
  );
}

// 6 · The cloud as a band over three jobs it was quietly doing. The band lifts away, and each job lands on your own team
// in turn, red; then the ongoing bill's coins stack up beneath them.
export function OperationalBill({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lift = easeInOut(seg(t, 1.4, 2.0));
  const jobs = ['hardware refresh', 'running the cluster', 'capacity cushion'];
  return (
    <Svg label="Winning on the four reasons doesn't erase the bill the cloud was absorbing" h={250}>
      <g opacity={k(0) * (1 - lift)} transform={`translate(0 ${(-20 * lift).toFixed(2)})`}>
        <rect x={25} y={30} width={550} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={1.5} />
        <T x={37} y={57} s={12} f={C.second}>
          the cloud, doing it quietly
        </T>
      </g>
      {jobs.map((j, i) => {
        const d = 2.1 + i * 0.6;
        const mine = t > d;
        return (
          <g key={j}>
            <Cell x={25 + i * 190} y={lerp(92, 112, easeOut(seg(t, d, d + 0.3)))} w={170} label={j} o={k(0.3 + i * 0.15)} stroke={mine ? C.cherryText : C.mocha} f={mine ? C.cherryText : C.crema} />
          </g>
        );
      })}
      {t > 2.4 && (
        <T x={25} y={168} s={11} f={C.cherryText} o={k(2.4)}>
          now your own team's, on your own schedule
        </T>
      )}
      {Array.from({ length: 8 }, (_, j) => (
        <Coin key={j} x={40 + j * 26} y={200} k={easeOutBack(seg(t, 3.8 + j * 0.08, 4.1 + j * 0.08))} f={C.cherryText} />
      ))}
      {t > 4.3 && (
        <T x={260} y={205} s={12} f={C.cherryText} o={k(4.3)}>
          an ongoing bill
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in: the stack replaced piece by piece, a licensing shift not new technology, four tests,
// and the bill that stays. Then the one caution between them.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['replaced piece by piece', 'licensing, not technology', 'four tests decide the winner', 'the bill does not disappear'];
  return (
    <Svg label="The four-part recap of this topic's point" h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.7;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 40 + Math.floor(i / 2) * 60;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} stroke={i === 3 ? C.cherryText : C.mocha} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={200} s={12} f={C.crema} a="middle" o={k(3.6)}>
          winning a test is not escaping the bill
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A day with one short spike at night and nothing after it, and the four tests below. Once answered, each
// test is crossed: idle time is exactly what elasticity already rewards.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const tests = ['data gravity', 'OT proximity', 'sovereignty', 'steady use'];
  return (
    <Svg label="A fraud job runs minutes a night, idle the rest of the day — do any of the four reasons apply?" h={250}>
      <line x1={25} y1={110} x2={575} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <rect x={60} y={110 - 70 * k(0.2)} width={20} height={70 * k(0.2)} rx={2} fill={C.caramel} />
      <T x={95} y={96} s={11} f={C.taupe} o={k(0.5)}>
        minutes a night, then idle all day
      </T>
      {tests.map((x, i) => {
        const c = answer !== null ? easeOut(seg(s, 0.1 + i * 0.12, 0.4 + i * 0.12)) : 0;
        return (
          <g key={x}>
            <Cell x={25 + i * 140} y={150} w={130} label={x} o={k(0.7 + i * 0.12) * (1 - 0.5 * c)} />
            <Cross x={90 + i * 140} y={198} k={c} />
          </g>
        );
      })}
      <Verdict answer={answer} text="none apply: elasticity fits it" y={238} />
    </Svg>
  );
}
