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
/** A small key glyph: a ring at (x, y) and a shaft with one tooth to the right. */
function Key({ x, y, f = C.second, o = 1 }: { x: number; y: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={5} fill="none" stroke={f} strokeWidth={2} />
      <path d={`M${x + 5} ${y} h14 m-4 0 v5 m-4 -5 v4`} fill="none" stroke={f} strokeWidth={2} />
    </g>
  );
}

// Every value here is examples.py's own: subject 42 (and the untouched subject 1), snapshot 1 before the delete and snapshot 2
// after it, the log scanned from offset 0, delete.retention.ms, and the three copies (table, kafka log, backup).

/** A data file: a framed strip of row marks, one of them (subject 42) red while it is still physically there. */
function DataFile({ x, y, w = 280, has42 = true, o = 1 }: { x: number; y: number; w?: number; has42?: boolean; o?: number }) {
  const n = Math.floor((w - 20) / 22);
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={44} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      {Array.from({ length: n }, (_, i) => (i === 3 && !has42 ? null : <rect key={i} x={x + 10 + i * 22} y={y + 14} width={16} height={16} rx={2} fill={i === 3 ? C.cherryText : C.latte} />))}
    </g>
  );
}

const PLACES = ['the table', 'a message log', "last night's backup"];

// 0 · Hook. The delete runs and the queries come back clean, ticked. A month on, the auditor finds subject 42 in three places
// at once. Only the table is one a delete can reach; the log and the backup get question marks.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="DELETE runs, the row is gone from every query. An auditor still finds the name three places." h={250}>
      <T x={25} y={34} s={12} f={C.crema} o={k(0)}>
        delete subject 42
      </T>
      <MiniTick x={25} y={52} k={k(0.6)} />
      {t > 0.6 && (
        <T x={45} y={60} s={11} f={C.focus} o={k(0.6)}>
          every query comes back clean
        </T>
      )}
      {PLACES.map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 190} y={100} w={180} label={n} o={k(1.6 + i * 0.4)} />
          <Pip x={115 + i * 190} y={150} f={C.cherryText} o={k(2.0 + i * 0.4)} />
          {t > 2.0 + i * 0.4 && (
            <T x={115 + i * 190} y={176} s={11} f={C.cherryText} a="middle" o={k(2.0 + i * 0.4)}>
              subject 42
            </T>
          )}
          {t > 3.6 && (
            <T x={115 + i * 190} y={214} s={i === 0 ? 11 : 15} f={i === 0 ? C.focus : C.taupe} a="middle" o={k(3.6 + i * 0.2)}>
              {i === 0 ? 'a delete reaches' : '?'}
            </T>
          )}
        </g>
      ))}
    </Svg>
  );
}

// 1 · The new snapshot. Snapshot 1 points at the data file holding subject 42. The delete writes snapshot 2 beside it, with its
// own "42 gone" note, pointing at the very same file. Snapshot 1's pointer never moves, and the file is never touched.
export function RevealNewSnapshot({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a DELETE writes a new snapshot; the old one still references the old file, untouched" h={250}>
      <Cell x={25} y={40} w={140} label="snapshot 1" o={k(0)} />
      <DataFile x={150} y={150} o={k(0.3)} />
      <line x1={95} y1={68} x2={95 + (220 - 95) * k(0.6)} y2={68 + 82 * k(0.6)} stroke={C.latte} strokeWidth={1.4} />
      <Cell x={240} y={40} w={140} label="snapshot 2" o={k(1.6)} stroke={C.second} />
      <Cell x={400} y={40} w={150} label="42 is gone" o={k(2.0)} stroke={C.second} />
      <line x1={310} y1={68} x2={310 - 20 * k(2.4)} y2={68 + 82 * k(2.4)} stroke={C.second} strokeWidth={1.4} />
      <MiniTick x={445} y={168} k={k(3.4)} />
      {t > 3.4 && (
        <T x={150} y={226} s={11} f={C.taupe} o={k(3.4)}>
          the file itself: untouched
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict: time travel. Snapshot 1 lights and reaches for the file. Once answered, subject 42's mark in the file pulses:
// still there.
export function PredictTimeTravel({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="time-travel to the snapshot from before the DELETE. Still shows the subject?" h={250}>
      <Cell x={25} y={40} w={140} label="snapshot 1" o={k(0)} stroke={C.focus} />
      <Cell x={240} y={40} w={140} label="snapshot 2" o={k(0.2) * 0.6} />
      <line x1={95} y1={68} x2={95 + 125 * k(0.5)} y2={68 + 82 * k(0.5)} stroke={C.focus} strokeWidth={1.6} />
      <DataFile x={150} y={150} o={k(0.3)} />
      <circle cx={227} cy={172} r={lerp(10, 16, a)} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={a} />
      {answer === null && t > 1.0 && (
        <T x={500} y={110} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="still there, in the untouched file" y={228} />
    </Svg>
  );
}

// 3 · Measured. Two reads. The current read, through snapshot 2, returns the rows with a gap where 42 was: hidden, ticked. The
// read at snapshot 1 returns the same rows with 42 back in place, red.
export function RevealTimeTravelShows({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const row = (y: number, with42: boolean, d: number) =>
    Array.from({ length: 10 }, (_, i) =>
      i === 3 && !with42 ? (
        <Hole key={i} x={180 + i * 34} y={y} w={24} h={20} o={k(d + i * 0.08)} />
      ) : (
        <rect key={i} x={180 + i * 34} y={y} width={24} height={20} rx={2} fill={i === 3 ? C.cherryText : C.latte} opacity={k(d + i * 0.08)} />
      ),
    );
  return (
    <Svg label="measured: yes -- the current read hides them, the old snapshot does not" h={250}>
      <T x={25} y={74} s={11} f={C.crema} o={k(0.2)}>
        current read
      </T>
      {row(60, false, 0.5)}
      <MiniTick x={300} y={104} k={k(1.6)} />
      {t > 1.6 && (
        <T x={320} y={112} s={11} f={C.focus} o={k(1.6)}>
          42 hidden
        </T>
      )}
      <T x={25} y={164} s={11} f={C.crema} o={k(2.2)}>
        at snapshot 1
      </T>
      {row(150, true, 2.5)}
      {t > 3.6 && (
        <T x={180} y={206} s={11} f={C.cherryText} o={k(3.6)}>
          42 comes right back, untouched
        </T>
      )}
    </Svg>
  );
}

// 4 · Expire and compact. Snapshot 1 is expired, crossed and gone from the metadata. Then compaction rewrites the file: a new
// file slides in without subject 42 and the old one is crossed out. Below, how long it waits if nobody asks: about a week.
export function ElaborateExpireCompact({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ex = easeOut(seg(t, 0.8, 1.4));
  const cp = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="expiring snapshots and compacting physically removes the row" h={250}>
      <Cell x={25} y={30} w={140} label="snapshot 1" o={1 - 0.7 * ex} stroke={ex > 0.5 ? C.cherryText : C.mocha} f={ex > 0.5 ? C.taupe : C.crema} />
      <Cross x={185} y={44} k={ex} />
      <T x={205} y={49} s={11} f={C.taupe} o={k(1.0)}>
        expire
      </T>
      <Cell x={300} y={30} w={140} label="snapshot 2" o={k(0)} stroke={C.second} />
      <DataFile x={25} y={90} o={1 - 0.6 * cp} />
      <Cross x={320} y={112} k={cp} />
      <DataFile x={lerp(575, 345, cp) - 0} y={90} w={230} has42={false} o={cp} />
      {t > 2.8 && (
        <T x={345} y={158} s={11} f={C.focus} o={k(2.8)}>
          compacted: 42 gone
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={200} s={11} f={C.latte} o={k(3.4)}>
          left alone
        </T>
      )}
      <rect x={120} y={190} width={Math.max(0, 300 * easeOut(seg(t, 3.5, 4.5)))} height={12} rx={2} fill={C.taupe} />
      {t > 4.4 && (
        <T x={430} y={200} s={11} f={C.taupe} o={k(4.4)}>
          about a week
        </T>
      )}
    </Svg>
  );
}

/** A log record: a small labelled cell. */
function Rec({ x, y, label, f = C.latte, o = 1, w = 80 }: { x: number; y: number; label: string; f?: string; o?: number; w?: number }) {
  return <Cell x={x} y={y} w={w} label={label} o={o} stroke={f} />;
}

// 5 · Predict: the tombstone. The log holds 42's value; a tombstone for 42 is appended. Once answered, the value is crossed out
// but the tombstone stays lit: kept for its own window.
export function PredictTombstone({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a Kafka tombstone removes the value. Does it remove the record a deletion happened?" h={250}>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1} opacity={k(0)} />
      <Rec x={25} y={86} label="1" o={k(0)} />
      <Rec x={115} y={86} label="42: value" w={110} f={C.cherryText} o={k(0.2)} />
      <Rec x={235} y={86} label="1" o={k(0.3)} />
      <Rec x={325} y={86} label="42: tombstone" w={150} f={C.second} o={k(0.6)} />
      <Cross x={170} y={140} k={a} />
      <MiniTick x={394} y={136} k={a} />
      {answer === null && t > 1.0 && (
        <T x={530} y={106} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the tombstone stays, for its own window" y={214} />
    </Svg>
  );
}

// 6 · The tombstone expires. Right after it is written, the value is gone and the tombstone is present, ticked. The
// delete.retention.ms bar fills; when it runs out, a later cleanup sweeps the tombstone away too.
export function RevealTombstoneExpires({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const w = easeInOut(seg(t, 1.6, 3.4));
  const swept = easeOut(seg(t, 3.5, 4.0));
  return (
    <Svg label="measured: not immediately -- the tombstone itself expires after delete.retention.ms" h={250}>
      <line x1={25} y1={70} x2={575} y2={70} stroke={C.mocha} strokeWidth={1} opacity={k(0)} />
      <Rec x={25} y={56} label="1" o={k(0)} />
      <Hole x={115} y={56} w={110} o={k(0.2)} />
      <Rec x={235} y={56} label="1" o={k(0)} />
      <Rec x={325} y={56} label="42: tombstone" w={150} f={C.second} o={k(0.2) * (1 - swept)} />
      <Hole x={325} y={56} w={150} o={swept} />
      <MiniTick x={394} y={108} k={k(0.8) * (1 - swept)} />
      {t > 0.8 && (
        <T x={325} y={130} s={11} f={swept > 0.5 ? C.taupe : C.second} o={k(0.8)}>
          {swept > 0.5 ? 'tombstone gone too' : 'tombstone present'}
        </T>
      )}
      <T x={25} y={180} s={11} f={C.latte} o={k(1.4)}>
        delete.retention.ms
      </T>
      <rect x={200} y={170} width={350} height={12} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} opacity={k(1.4)} />
      <rect x={200} y={170} width={Math.max(0, 350 * w)} height={12} rx={2} fill={C.second} />
    </Svg>
  );
}

// 7 · The lagging consumer. The log runs on; the tombstone's window passes and it is swept. Only then does the lagging
// consumer scan from offset 0, its marker crossing the whole log and finding nothing about 42. Below, the old backup still
// holds 42.
export function ElaborateLaggingConsumer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const swept = easeOut(seg(t, 1.2, 1.7));
  const scan = easeInOut(seg(t, 2.0, 3.6));
  return (
    <Svg label="a lagging consumer can miss the delete marker entirely" h={250}>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.mocha} strokeWidth={1} opacity={k(0)} />
      {[0, 1, 2, 3, 4, 5].map((i) =>
        i === 2 ? (
          <Hole key={i} x={25 + i * 92} y={46} w={80} o={k(0.1)} />
        ) : i === 4 ? (
          <g key={i}>
            <Rec x={25 + i * 92} y={46} label="tomb" f={C.second} o={k(0.1) * (1 - swept)} />
            <Hole x={25 + i * 92} y={46} w={80} o={swept} />
          </g>
        ) : (
          <Rec key={i} x={25 + i * 92} y={46} label="1" o={k(0.1)} />
        ),
      )}
      <path d={`M${lerp(30, 560, scan)} 84 l-6 10 h12 z`} fill={C.focus} opacity={k(0.4)} />
      {t > 0.4 && t < 2.3 && (
        <T x={25} y={116} s={11} f={C.focus} o={k(0.4) * (1 - k(1.9))}>
          lagging consumer, at offset 0
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={116} s={11} f={C.taupe} o={k(3.6)}>
          no value, no tombstone, no sign
        </T>
      )}
      <Cell x={25} y={170} w={220} label="backup, taken earlier" o={k(3.8)} />
      <Pip x={265} y={184} f={C.cherryText} o={k(4.0)} />
      {t > 4.0 && (
        <T x={280} y={188} s={11} f={C.cherryText} o={k(4.0)}>
          42, quietly still there
        </T>
      )}
    </Svg>
  );
}

const COPIES = ['table', 'kafka log', 'backup'];

// 8 · Crypto-shredding. Three copies, each holding subject 42 under key 42 and subject 1 under key 1. Key 42 is deleted:
// 42's cell in all three copies scrambles in the same instant; subject 1 stays readable everywhere, ticked.
export function RevealCryptoShredding({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const del = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="delete one key: every copy unreadable at once, measured, including the backup" h={250}>
      <Key x={36} y={84} f={del > 0.5 ? C.cherryText : C.second} o={1 - 0.6 * del} />
      <Cross x={44} y={84} k={del} />
      <T x={66} y={88} s={11} f={C.crema} o={k(0)}>
        key 42
      </T>
      <Key x={36} y={154} f={C.focus} o={k(0.1)} />
      <T x={66} y={158} s={11} f={C.crema} o={k(0.1)}>
        key 1
      </T>
      {COPIES.map((n, i) => {
        const x = 180 + i * 135;
        return (
          <g key={n}>
            <T x={x + 55} y={42} s={11} f={C.taupe} a="middle" o={k(0.4 + i * 0.4)}>
              {n}
            </T>
            <rect x={x} y={70} width={110} height={28} rx={3} fill={C.cocoa} stroke={del > 0.5 ? C.cherryText : C.second} strokeWidth={1.4} opacity={k(0.6 + i * 0.4)} />
            {del > 0.5 ? (
              [0, 1, 2, 3, 4, 5, 6].map((j) => <rect key={j} x={x + 8 + j * 14} y={78 + ((j * 5) % 3) * 4} width={8} height={4} rx={1} fill={C.cherryText} />)
            ) : (
              <T x={x + 55} y={89} s={11} f={C.crema} a="middle" o={k(0.6 + i * 0.4)}>
                subject 42
              </T>
            )}
            <rect x={x} y={140} width={110} height={28} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} opacity={k(0.8 + i * 0.4)} />
            <T x={x + 55} y={159} s={11} f={C.crema} a="middle" o={k(0.8 + i * 0.4)}>
              subject 1
            </T>
            <MiniTick x={x + 50} y={186} k={k(3.6 + i * 0.1)} />
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={180} y={124} s={11} f={C.cherryText} o={k(3.0)}>
          unreadable, all three at once
        </T>
      )}
      {t > 3.8 && (
        <T x={180} y={232} s={11} f={C.focus} o={k(3.8)}>
          another key, untouched: still readable
        </T>
      )}
    </Svg>
  );
}

const EVIDENCE = ['the snapshot list, after expiry', 'the physical file listing', "the key store's deletion record", 'the search, run again: empty'];

// 9 · Proving deletion. The four pieces of evidence tick in, one by one. Then the retention rule is written as a versioned
// card of code beneath them: something a reviewer can check.
export function RevealProvingDeletion({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="evidence for an auditor: the snapshot list, the file listing, the key store's own record" h={250}>
      {EVIDENCE.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={34 + i * 34} k={k(0.5 + i * 0.6)} />
          <T x={50} y={42 + i * 34} s={12} f={C.crema} o={k(0.4 + i * 0.6)}>
            {n}
          </T>
        </g>
      ))}
      <rect x={25} y={180} width={400} height={50} rx={5} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} strokeDasharray="5 3" opacity={k(3.4)} />
      <T x={39} y={200} s={11} f={C.second} o={k(3.6)}>
        retention rule, as code
      </T>
      <T x={39} y={220} s={11} f={C.latte} o={k(4.0)}>
        versioned, reviewed, checkable
      </T>
    </Svg>
  );
}

const RECAP: [string, boolean][] = [
  ['a delete leaves the old snapshot standing', false],
  ['expire and compact erase the file', true],
  ['a tombstone outlives the value it hid', false],
  ['one deleted key reaches every copy', true],
];

// 10 · Recap. The four lines land in order: the two traps crossed, the two fixes ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a SQL delete leaves the old snapshot untouched; a key deletion reaches every copy at once" h={250}>
      {RECAP.map(([n, ok], i) => (
        <g key={n}>
          {ok ? <MiniTick x={25} y={44 + i * 46} k={k(0.6 + i * 1.0)} /> : <Cross x={32} y={46 + i * 46} k={k(0.6 + i * 1.0)} />}
          <T x={55} y={50 + i * 46} s={12} f={C.crema} o={k(0.5 + i * 1.0)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}
