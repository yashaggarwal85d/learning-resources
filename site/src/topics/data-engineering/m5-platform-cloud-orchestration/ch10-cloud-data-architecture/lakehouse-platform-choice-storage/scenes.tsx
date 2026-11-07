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

/** A bucket outline at (x, y), w wide, drawn in by `k`. */
function Bucket({ x, y, w, k, f = C.mocha }: { x: number; y: number; w: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} L${x + 12} ${y + 56} H${x + w - 12} L${x + w} ${y}`} fill="none" stroke={f} strokeWidth={2} opacity={k} />;
}

// Every claim here traces to each vendor's own current documentation (SOURCES.md); every dollar figure is examples.py's
// disclosed-illustrative rate applied to that platform's own documented billing unit.

// 0 · Day one and later, with the gap between them stretching out. The vendor takes the storage work off the team's hands;
// later the export job lands. Performance is crossed off: the question was always whose bucket this was.
export function OnboardingQuestion({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gap = easeInOut(seg(t, 0.9, 1.8));
  const chores = ['backups', 'scaling', 'patching'];
  return (
    <Svg label="A platform picked for low operational burden, and the unpriced cost of leaving it" h={250}>
      <T x={25} y={26} s={12} f={C.crema} o={k(0)}>
        day one
      </T>
      <Cell x={25} y={40} w={206} label="vendor runs the storage" o={k(0)} />
      {chores.map((c, i) => {
        const gone = easeIn2(seg(t, 0.5 + i * 0.15, 0.9 + i * 0.15));
        return (
          <T key={c} x={25 + i * 72} y={lerp(96, 110, gone)} s={11} f={C.taupe} o={k(0.2) * (1 - gone)}>
            {c}
          </T>
        );
      })}
      {t > 1.4 && (
        <T x={25} y={100} s={11} f={C.focus} o={k(1.4)}>
          less to manage
        </T>
      )}
      <Req x1={232} x2={368} y={54} k={gap} label="later" />
      <Cell x={375} y={40} w={200} label="bulk export job" o={k(1.8)} stroke={C.cherryText} />
      {t > 2.2 && (
        <T x={375} y={100} s={11} f={C.cherryText} o={k(2.2)}>
          nobody budgeted it
        </T>
      )}
      {t > 2.7 && (
        <T x={25} y={160} s={12} f={C.taupe} o={k(2.7)}>
          performance
        </T>
      )}
      <Cross x={137} y={156} k={k(3.1)} />
      <Bucket x={375} y={138} w={200} k={k(3.4)} />
      {t > 3.6 && (
        <T x={475} y={180} s={12} f={C.crema} a="middle" o={k(3.6)}>
          vendor's bucket
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={232} s={13} f={C.focus} o={k(4.0)}>
          it was always: whose bucket was this?
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Two owners against two formats, bytes sitting in each square. Once answered, the vendor-and-vendor square
// locks; a vendor's bucket with open bytes inside still gets a tick.
export function PredictHardestToLeave({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sq = [
    { x: 220, y: 60, open: true },
    { x: 400, y: 60, open: false },
    { x: 220, y: 110, open: true },
    { x: 400, y: 110, open: false },
  ];
  return (
    <Svg label="Four ownership models, one of them hardest to walk away from" h={250}>
      <T x={295} y={44} s={11} f={C.crema} a="middle" o={k(0)}>
        open format
      </T>
      <T x={475} y={44} s={11} f={C.crema} a="middle" o={k(0)}>
        vendor format
      </T>
      <T x={25} y={83} s={12} f={C.crema} o={k(0.1)}>
        your bucket
      </T>
      <T x={25} y={133} s={12} f={C.crema} o={k(0.1)}>
        vendor's storage
      </T>
      {sq.map((q, i) => (
        <g key={i} opacity={k(0.2 + i * 0.15)}>
          <rect x={q.x} y={q.y} width={150} height={38} rx={4} fill="none" stroke={i === 3 && v > 0.5 ? C.cherryText : i === 2 && v > 0.5 ? C.focus : C.mocha} strokeWidth={1.5} />
          {[0, 1, 2, 3, 4].map((j) => (
            <Pip key={j} x={q.x + 22 + j * 18} y={q.y + 19} s={9} f={q.open ? C.second : C.taupe} />
          ))}
        </g>
      ))}
      <Lock x={530} y={124} k={v} f={C.cherryText} />
      <MiniTick x={352} y={127} k={v} />
      <Verdict answer={answer} text="vendor storage and vendor format, together" y={200} />
    </Svg>
  );
}

// 2 · Four platforms in turn, each handing its bytes to a bucket labelled with its owner: yours, theirs, theirs, yours.
// The owner column is outlined last, the one word doing the work.
export function FourStorageOwners({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { name: 'Databricks', who: 'yours', where: 'your account' },
    { name: 'Snowflake', who: 'theirs', where: 'Snowflake-run' },
    { name: 'Fabric', who: 'theirs', where: 'OneLake' },
    { name: 'BigQuery', who: 'yours', where: 'Cloud Storage' },
  ];
  const ring = easeOut(seg(t, 4.8, 5.3));
  return (
    <Svg label="One platform's storage owner at a time" h={250}>
      {rows.map((r, i) => {
        const d = 0.3 + i * 1.15;
        const mine = r.who === 'yours';
        const y = 30 + i * 52;
        return (
          <g key={r.name}>
            <Cell x={25} y={y} w={150} label={r.name} o={k(d)} />
            <Req x1={182} x2={328} y={y + 14} k={easeInOut(seg(t, d + 0.2, d + 0.6))} />
            {t > d + 0.6 && <Cell x={340} y={y} w={100} label={r.who} o={k(d + 0.6)} stroke={mine ? C.focus : C.caramel} f={mine ? C.focus : C.caramel} />}
            {t > d + 0.8 && (
              <T x={455} y={y + 19} s={11} f={C.taupe} o={k(d + 0.8)}>
                {r.where}
              </T>
            )}
          </g>
        );
      })}
      <rect x={332} y={22} width={116} height={200} rx={6} fill="none" stroke={C.crema} strokeWidth={1.5} strokeDasharray="420" strokeDashoffset={420 * (1 - ring)} />
      {t > 5.0 && (
        <T x={390} y={242} s={11} f={C.crema} a="middle" o={k(5.0)}>
          the one word that changes
        </T>
      )}
    </Svg>
  );
}

// 3 · UniForm: a Delta log and Iceberg metadata both pointing at the same Parquet files, so two readers read one copy.
// Snowflake's native table: its bytes locked in its own format, an Iceberg table only there if you ask for one.
export function OpenFormatPosture({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A genuinely open default table format against a vendor's own compatibility layer" h={250}>
      <T x={25} y={24} s={12} f={C.crema} o={k(0)}>
        UniForm, by default
      </T>
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <Pip key={j} x={60 + j * 38} y={150} s={14} f={C.second} o={k(0.2 + j * 0.06)} />
      ))}
      {t > 0.7 && (
        <T x={155} y={184} s={11} f={C.second} a="middle" o={k(0.7)}>
          one copy of Parquet files
        </T>
      )}
      <Cell x={25} y={40} w={115} label="Delta log" o={k(0.9)} />
      <Fan x1={82} y1={70} x2={120} y2={138} k={easeOut(seg(t, 1.1, 1.6))} />
      <Cell x={150} y={40} w={150} label="Iceberg metadata" o={k(1.6)} stroke={C.focus} />
      <Fan x1={225} y1={70} x2={190} y2={138} k={easeOut(seg(t, 1.8, 2.3))} f={C.focus} />
      {t > 2.4 && (
        <T x={25} y={214} s={12} f={C.focus} o={k(2.4)}>
          one copy, two readers
        </T>
      )}
      <T x={330} y={24} s={12} f={C.crema} o={k(2.8)}>
        Snowflake native table
      </T>
      {[0, 1, 2, 3, 4].map((j) => (
        <Pip key={j} x={355 + j * 34} y={150} s={14} f={C.taupe} o={k(3.0 + j * 0.06)} />
      ))}
      <Lock x={530} y={144} k={k(3.4)} f={C.cherryText} />
      {t > 3.4 && (
        <T x={330} y={184} s={11} f={C.cherryText} o={k(3.4)}>
          its own format, by default
        </T>
      )}
      <Hole x={330} y={40} w={245} h={56} o={k(3.9)} />
      {t > 4.2 && (
        <T x={452} y={73} s={11} f={C.taupe} a="middle" o={k(4.2)}>
          Iceberg: only if you ask
        </T>
      )}
      {t > 4.6 && (
        <T x={330} y={214} s={12} f={C.caramel} o={k(4.6)}>
          open on request is not open
        </T>
      )}
    </Svg>
  );
}

// 4 · Four zero-copy mechanisms in turn, source on the left and recipient on the right. Only mirroring moves bytes across;
// the other three move a line of sight and leave the bytes where they were.
export function FourZeroCopyModels({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { name: 'OneLake shortcut', how: 'a pointer' },
    { name: 'Fabric mirroring', how: 'a real copy' },
    { name: 'Delta Sharing', how: 'a token' },
    { name: 'Snowflake share', how: 'read access' },
  ];
  return (
    <Svg label="One zero-copy mechanism at a time" h={250}>
      {rows.map((r, i) => {
        const d = 0.2 + i * 1.05;
        const y = 34 + i * 46;
        const copy = i === 1;
        const draw = easeInOut(seg(t, d + 0.3, d + 0.7));
        return (
          <g key={r.name}>
            <T x={25} y={y + 5} s={12} f={C.crema} o={k(d)}>
              {r.name}
            </T>
            <rect x={170} y={y - 12} width={70} height={24} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(d)} />
            {[0, 1, 2].map((j) => (
              <Pip key={j} x={185 + j * 20} y={y} s={8} f={C.second} o={k(d)} />
            ))}
            <rect x={340} y={y - 12} width={70} height={24} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(d + 0.1)} />
            {copy ? (
              [0, 1, 2].map((j) => {
                const m = easeInOut(seg(t, d + 0.3 + j * 0.15, d + 0.75 + j * 0.15));
                return m > 0 ? <Pip key={j} x={lerp(185 + j * 20, 355 + j * 20, m)} y={y} s={8} f={C.caramel} /> : null;
              })
            ) : (
              <line x1={245} y1={y} x2={lerp(245, 335, draw)} y2={y} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={draw > 0 ? 1 : 0} />
            )}
            {t > d + 0.8 && (
              <T x={425} y={y + 5} s={11} f={copy ? C.caramel : C.focus} o={k(d + 0.8)}>
                {r.how}
              </T>
            )}
          </g>
        );
      })}
      {t > 4.4 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(4.4)}>
          bytes moved in one row; sight moved in three
        </T>
      )}
    </Svg>
  );
}

// 5 · The same nightly job, five bars through four meters. Then a shorter run: the DBU bar shrinks, the bytes-scanned bar
// does not move, because that meter never counted time.
export function FourBillingUnits({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const bars = [
    { name: 'Databricks DBUs', v: 22, label: '$22' },
    { name: 'Snowflake credits', v: 60, label: '$60' },
    { name: 'Fabric CU-hours', v: 18, label: '$18' },
    { name: 'BigQuery bytes', v: 12.5, label: '$12.5' },
    { name: 'BigQuery slots', v: 2, label: '$2' },
  ];
  const shrink = easeInOut(seg(t, 3.6, 4.3));
  return (
    <Svg label="One platform's billing unit at a time, same workload each time" h={250}>
      {bars.map((b, i) => {
        const d = 0.2 + i * 0.6;
        const y = 34 + i * 38;
        const grow = easeOut(seg(t, d, d + 0.5));
        const w = (b.v / 60) * 280 * grow * (i === 0 ? 1 - 0.4 * shrink : 1);
        return (
          <g key={b.name}>
            <T x={25} y={y + 5} s={12} f={C.crema} o={k(d)}>
              {b.name}
            </T>
            {i === 0 && shrink > 0 && <Hole x={180} y={y - 8} w={(b.v / 60) * 280} h={16} />}
            <rect x={180} y={y - 8} width={Math.max(0, w)} height={16} rx={2} fill={C.second} opacity={k(d)} />
            {t > d + 0.5 && (
              <T x={188 + (b.v / 60) * 280} y={y + 5} s={12} f={C.crema} o={k(d + 0.5)}>
                {b.label}
              </T>
            )}
          </g>
        );
      })}
      {t > 3.3 && (
        <T x={575} y={236} s={12} f={C.caramel} a="end" o={k(3.3)}>
          the job runs shorter
        </T>
      )}
      <MiniTick x={325} y={31} k={easeOut(seg(t, 4.3, 4.7))} />
      <Cross x={312} y={148} k={easeOut(seg(t, 4.6, 5.0))} />
    </Svg>
  );
}

/** The same five hundred gigabytes, drawn as a block of pips. */
function Block({ x, y, o, f = C.second }: { x: number; y: number; o: number; f?: string }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 12 }, (_, j) => (
        <Pip key={j} x={x + 6 + (j % 6) * 18} y={y + 6 + Math.floor(j / 6) * 16} s={10} f={f} />
      ))}
    </g>
  );
}

// 6 · The same 500 GB twice. In an open format in your bucket, leaving is just stopping payment: $0. In the vendor's own
// format it must pass through a bulk unload first, and that bar grows to $25. The zero was earned on day one.
export function ExitCostWorked({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const bar = easeOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="The same volume of data, open format against proprietary format, exit cost compared" h={250}>
      <T x={25} y={24} s={11} f={C.crema} o={k(0)}>
        500 GB, open format, your bucket
      </T>
      <Block x={25} y={36} o={k(0.1)} />
      <Req x1={140} x2={300} y={50} k={easeInOut(seg(t, 0.6, 1.1))} label="stop paying" f={C.focus} />
      {t > 1.1 && (
        <T x={315} y={56} s={15} f={C.focus} o={k(1.1)}>
          $0
        </T>
      )}
      <T x={25} y={124} s={11} f={C.crema} o={k(0.4)}>
        500 GB, the vendor's own format
      </T>
      <Block x={25} y={136} o={k(0.5)} f={C.taupe} />
      <Req x1={140} x2={172} y={150} k={easeInOut(seg(t, 1.3, 1.6))} />
      <Cell x={180} y={136} w={130} label="bulk unload" o={k(1.5)} stroke={C.cherryText} />
      {t > 1.8 && (
        <T x={245} y={186} s={11} f={C.taupe} a="middle" o={k(1.8)}>
          $0.05 per GB
        </T>
      )}
      <rect x={320} y={142} width={160 * bar} height={16} rx={2} fill={C.cherryText} opacity={bar > 0 ? 1 : 0} />
      {t > 2.9 && (
        <T x={490} y={156} s={15} f={C.cherryText} o={k(2.9)}>
          $25
        </T>
      )}
      {t > 3.3 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.3)}>
          same data; only where it lived, and its shape
        </T>
      )}
      {t > 3.9 && (
        <T x={140} y={86} s={11} f={C.focus} o={k(3.9)}>
          the hard part, already done on day one
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The storage owner is laid first as the base; open format, zero-copy and the billing meter drop onto it one by
// one, and the base lights: everything else rests on who owns the storage.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const parts = [
    { head: 'open format', body: 'the bytes' },
    { head: 'zero-copy', body: 'four mechanisms' },
    { head: 'billing meter', body: 'which lever' },
  ];
  const lit = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="The three-part recap of this topic's point" h={250}>
      <Cell x={25} y={170} w={550} h={32} label="who owns the storage" o={k(0)} stroke={lit > 0.5 ? C.focus : C.mocha} f={lit > 0.5 ? C.focus : C.crema} />
      {parts.map((p, i) => {
        const d = 0.6 + i * 0.7;
        const drop = easeOutBack(seg(t, d, d + 0.45));
        const x = 25 + i * 187.5;
        return (
          <g key={p.head}>
            {drop > 0 && <Cell x={x} y={lerp(60, 120, drop)} w={175} label={p.body} o={clamp(drop * 2)} />}
            <line x1={x + 87.5} y1={148} x2={x + 87.5} y2={170} stroke={C.mocha} strokeWidth={1.5} opacity={k(d + 0.45)} />
            {t > d + 0.45 && (
              <T x={x + 87.5} y={108} s={11} f={C.taupe} a="middle" o={k(d + 0.45)}>
                {p.head}
              </T>
            )}
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={300} y={232} s={12} f={C.focus} a="middle" o={k(3.4)}>
          everything else quietly depends on it
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. Four candidate facts and the exit day. Once answered, storage owner and open format reach the exit; pricing
// and sharing dim, facts that matter only while you stay.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const facts = ['pricing model', 'sharing mechanism', 'storage owner', 'open format'];
  return (
    <Svg label="A team planning to leave within a short window, picking what actually matters for that goal" h={250}>
      {facts.map((f, i) => {
        const key = i >= 2;
        return (
          <Cell
            key={f}
            x={25}
            y={34 + i * 40}
            w={190}
            label={f}
            o={k(i * 0.2) * (v > 0 && !key ? 1 - 0.5 * v : 1)}
            stroke={key && v > 0.5 ? C.focus : C.mocha}
            f={key && v > 0.5 ? C.focus : C.crema}
          />
        );
      })}
      <Cell x={420} y={94} w={155} label="the exit day" o={k(1.0)} stroke={C.caramel} f={C.caramel} />
      <Fan x1={220} y1={128} x2={414} y2={112} k={v} f={C.focus} />
      <Fan x1={220} y1={168} x2={414} y2={116} k={v} f={C.focus} />
      {v > 0.5 && (
        <T x={230} y={66} s={11} f={C.taupe} o={v}>
          matter while you stay
        </T>
      )}
      <Verdict answer={answer} text="ownership and format decide the exit" y={222} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}

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
