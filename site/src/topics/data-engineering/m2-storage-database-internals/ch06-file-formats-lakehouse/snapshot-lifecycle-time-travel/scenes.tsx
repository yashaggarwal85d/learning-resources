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

/** A snapshot marker on a timeline: a numbered circle at (x, y), with `files` small file icons beneath it. */
function Marker({
  x,
  y,
  label,
  files = 0,
  o = 1,
  f = C.crema,
  stroke = C.latte,
  fo = 1,
}: {
  x: number;
  y: number;
  label: string;
  files?: number;
  o?: number;
  f?: string;
  stroke?: string;
  fo?: number;
}) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={15} fill={C.cocoa} stroke={stroke} strokeWidth={2} />
      <T x={x} y={y + 4.5} s={11} f={f} a="middle">
        {label}
      </T>
      {Array.from({ length: files }, (_, i) => (
        <rect key={i} x={x - 6} y={y + 24 + i * 22} width={12} height={16} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={fo} />
      ))}
    </g>
  );
}

// 1 · Hook. Snapshot markers appear along a timeline, one after another; an arrow reaches back to the oldest; then the
// oldest one fades away.
export function Hook({ t }: StepCtx) {
  const forget = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="a column's identity survives change -- how far back can you see a table, and when does it forget?" h={200}>
      <line x1={25} y1={80} x2={lerp(25, 560, easeInOut(seg(t, 0.1, 1.4)))} y2={80} stroke={C.mocha} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={70 + i * 110}
          cy={80}
          r={12}
          fill={C.cocoa}
          stroke={i === 4 ? C.focus : C.latte}
          strokeWidth={2}
          opacity={easeOut(seg(t, 0.3 + i * 0.25, 0.5 + i * 0.25)) * (i === 0 ? 1 - forget : 1)}
        />
      ))}
      <path d="M510 115 Q300 165 76 105" fill="none" stroke={C.second} strokeWidth={1.8} strokeDasharray="600" strokeDashoffset={600 * (1 - easeInOut(seg(t, 1.8, 2.8)))} />
      <T x={300} y={170} s={13} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        how far back?
      </T>
      <T x={70} y={45} s={12} f={C.cherryText} a="middle" o={forget}>
        forgotten
      </T>
    </Svg>
  );
}

// 2 · Predict. A first snapshot, then three more, each with one more file; the answer: yes, until expired.
export function PredictTimeTravelAfterCommits({ t, answer }: StepCtx) {
  return (
    <Svg label="after three more commits, can you still read the table as it looked right after the first one?" h={200}>
      <line x1={25} y1={40} x2={560} y2={40} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4))}>
          <circle cx={80 + i * 140} cy={40} r={11} fill={C.cocoa} stroke={i === 0 ? C.second : C.latte} strokeWidth={2} />
          {Array.from({ length: i + 1 }, (_, j) => (
            <rect key={j} x={92 + i * 140 + j * 16} y={60} width={11} height={15} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
          ))}
        </g>
      ))}
      <T x={60} y={105} s={11} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        the first commit
      </T>
      <AnswerRow y={145} label="read the first version" answer={answer} value="yes, until expired" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={188} text="expiring is a deliberate act" />
    </Svg>
  );
}

// 3 · Time travel and rollback, for real. Snapshots 1, 2, 3 at T0, +1h, +2h with one, two and three files; by id 1
// lights snapshot 1; a timestamp at +1h30 drops between 2 and 3 and resolves to 2; the current pointer moves back to 1.
export function RevealTimeTravelAndRollback({ t }: StepCtx) {
  const xs = [100, 280, 460];
  const at = ['T0', '+1h', '+2h'];
  const id1 = t > 1.0 && t < 1.9;
  const ts = easeOut(seg(t, 1.9, 2.3));
  const rb = easeInOut(seg(t, 3.2, 3.9));
  return (
    <Svg label="reproduced for real: time travel by snapshot id, by timestamp, and rollback." h={230}>
      <line x1={25} y1={70} x2={560} y2={70} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.3))} />
      {xs.map((x, i) => (
        <g key={x}>
          <Marker
            x={x}
            y={70}
            label={String(i + 1)}
            files={i + 1}
            o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}
            stroke={(i === 0 && id1) || (i === 1 && ts > 0.5 && t < 3.0) ? C.second : C.latte}
          />
          <T x={x} y={44} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
            {at[i]}
          </T>
        </g>
      ))}
      <T x={25} y={190} s={12} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        by id 1: one file
      </T>
      <line x1={370} y1={58} x2={370} y2={82} stroke={C.second} strokeWidth={2.5} opacity={ts} />
      <T x={370} y={115} s={11} f={C.second} a="middle" o={ts}>
        +1h30
      </T>
      <T x={200} y={190} s={12} f={C.second} o={easeOut(seg(t, 2.4, 2.7))}>
        at +1h30: snapshot 2
      </T>
      <Pointer x={lerp(460, 100, rb)} k={easeOut(seg(t, 0.8, 1.0))} />
      <T x={25} y={215} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        rollback: current is 1
      </T>
    </Svg>
  );
}

/** A small "current" tag above x, pointing down at the timeline. */
function Pointer({ x, k }: { x: number; k: number }) {
  return (
    <g opacity={k}>
      <path d={`M${x} 32 l-5 -8 h10 z`} fill={C.focus} />
      <T x={x} y={18} s={11} f={C.focus} a="middle">
        current
      </T>
    </g>
  );
}

// 4 · Files stay alive. Two snapshots reference an old file with lines; a newer snapshot points at its replacement; the old
// file stays solid while any line still reaches it.
export function RevealSnapshotsKeepFilesAlive({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's own words: data files stay until no snapshot references them any more." h={230}>
      {['older', 'old', 'current'].map((n, i) => (
        <Marker key={n} x={100 + i * 180} y={45} label={String(i + 1)} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} stroke={i === 2 ? C.focus : C.latte} />
      ))}
      <Cell x={120} y={140} w={160} h={30} label="old file" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={380} y={140} w={160} h={30} label="replacement" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={100} y1={62} x2={180} y2={138} stroke={C.latte} strokeWidth={1.6} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <line x1={280} y1={62} x2={220} y2={138} stroke={C.latte} strokeWidth={1.6} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <line x1={460} y1={62} x2={460} y2={138} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 1.9, 2.2))} />
      <T x={25} y={205} s={13} f={C.crema} o={easeOut(seg(t, 2.7, 3.1))}>
        still referenced, so never deleted
      </T>
    </Svg>
  );
}

// 5 · Expire and vacuum, for real. Snapshots 101 and 102 hold the two old event files, 103 the compacted one; 101 and 102
// are crossed out, their files go, the reclaimed bytes appear, and a time-travel arrow to 101 is rejected.
export function RevealExpireReclaimsStorage({ t }: StepCtx) {
  const ex = easeOut(seg(t, 1.2, 1.6));
  const gone = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="reproduced for real: expiring old snapshots and vacuuming reclaims real, measured storage." h={230}>
      {['101', '102', '103'].map((n, i) => (
        <g key={n}>
          <Marker x={90 + i * 170} y={40} label={n} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2)) * (i < 2 ? 1 - 0.6 * ex : 1)} stroke={i === 2 ? C.focus : C.latte} />
          {i < 2 && <Cross x={90 + i * 170} y={40} k={ex} />}
        </g>
      ))}
      {['events-0001', 'events-0002'].map((n, i) => (
        <Cell key={n} x={25 + i * 170} y={100} w={150} h={28} label={n} o={easeOut(seg(t, 0.6, 0.9)) * (1 - gone)} />
      ))}
      <Cell x={365} y={100} w={205} h={28} label="events-0003-compacted" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={165} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        {`reclaimed: ${num(80000 * easeOut(seg(t, 2.6, 3.4)), 0)} bytes`}
      </T>
      <T x={25} y={210} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        time travel to 101 or 102: fails
      </T>
    </Svg>
  );
}

// 6 · The GDPR conflict. Snapshot 201 holds the file with PII; the delete commits 202 with a redacted file; the PII file
// stays on disk and a time-travel arrow back to 201 still reaches it; vacuum then removes it and the arrow fails.
export function RevealGdprConflict({ t }: StepCtx) {
  const vac = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a hard delete rewrites the current snapshot -- the old file survives until vacuum." h={230}>
      <Marker x={90} y={40} label="201" o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.6 * vac)} />
      <Marker x={350} y={40} label="202" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={25} y={95} w={190} h={28} label="with-pii" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 0.3, 0.6)) * (1 - vac)} />
      <Cell x={285} y={95} w={190} h={28} label="redacted" stroke={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={285} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        the delete commit
      </T>
      <path d="M300 175 Q200 200 120 128" fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="300" strokeDashoffset={300 * (1 - easeInOut(seg(t, 1.8, 2.5)))} opacity={1 - vac} />
      <T x={310} y={190} s={11} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.6)) * (1 - vac)}>
        still readable by time travel
      </T>
      <Cross x={90} y={40} k={vac} />
      <T x={25} y={222} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        expire and vacuum: only then truly gone
      </T>
    </Svg>
  );
}

// 7 · Predict. A reader pinned to snapshot 1 with its two files; maintenance comes for snapshot 1; the answer: it can fail.
export function PredictRetentionTooShort({ t, answer }: StepCtx) {
  return (
    <Svg label="maintenance expires a snapshot a reader is still mid-read on -- what happens?" h={200}>
      <Marker x={60} y={50} label="1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={95} y={36} w={110} h={28} label="reader" o={easeOut(seg(t, 0.3, 0.6))} />
      <Lock x={215} y={44} k={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={260} y={36} w={100} h={28} label="r-0001" o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={370} y={36} w={100} h={28} label="r-0002" o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={260} y={100} s={12} f={C.cherryText} o={easeOut(seg(t, 1.4, 1.8))}>
        maintenance expires snapshot 1
      </T>
      <AnswerRow y={145} label="the read" answer={answer} value="can fail" k={easeOut(seg(t, 2.2, 2.7))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="its file was cleaned away" f={C.cherryText} />
    </Svg>
  );
}

// 8 · Two runs, for real. Two lanes: a reader's read bar runs across each; in the short-window lane a cleanup tick lands
// mid-read, the file vanishes, the read fails; in the long-window lane the window outlasts the read and it finishes.
export function RevealReaderCorrupted({ t }: StepCtx) {
  const lanes = [
    { l: 'too-short window', cut: 300, ok: false },
    { l: 'long-enough window', cut: 540, ok: true },
  ];
  return (
    <Svg label="reproduced for real: a too-short retention window corrupts a reader mid-read." h={230}>
      {lanes.map((ln, i) => {
        const y = 50 + i * 85;
        const b = 0.3 + i * 1.9;
        const r = easeInOut(seg(t, b + 0.3, b + 1.5));
        const end = ln.ok ? 480 : 300;
        return (
          <g key={ln.l}>
            <T x={25} y={y - 14} s={11} f={C.latte} o={easeOut(seg(t, b, b + 0.3))}>
              {ln.l}
            </T>
            <rect x={160} y={y} width={(end - 160) * r} height={14} rx={2} fill={ln.ok ? C.focus : C.cherryText} />
            <line x1={ln.cut} y1={y - 8} x2={ln.cut} y2={y + 22} stroke={C.second} strokeWidth={2} strokeDasharray="3 3" opacity={easeOut(seg(t, b, b + 0.3))} />
            <T x={ln.cut} y={y + 38} s={11} f={C.second} a="middle" o={easeOut(seg(t, b, b + 0.3))}>
              cleanup
            </T>
            <T x={25} y={y + 12} s={12} f={C.crema} o={easeOut(seg(t, b, b + 0.3))}>
              reader
            </T>
            {ln.ok ? <MiniTick x={490} y={y + 6} k={easeOut(seg(t, b + 1.5, b + 1.8))} /> : <Cross x={318} y={y + 7} k={easeOut(seg(t, b + 1.5, b + 1.8))} />}
            <T x={ln.ok ? 380 : 340} y={y + 38} s={12} f={ln.ok ? C.focus : C.cherryText} o={easeOut(seg(t, b + 1.6, b + 1.9))}>
              {ln.ok ? 'read ok' : 'read failed'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · One knob. A retention slider: the knob slides to the short end, where reader and writer are crossed; then to the
// long end, where storage and PII linger; then settles in the band that outlasts the longest transaction.
export function RevealRetentionTradeoff({ t }: StepCtx) {
  const kx = t < 1.8 ? lerp(300, 80, easeInOut(seg(t, 0.6, 1.2))) : t < 3.0 ? lerp(80, 520, easeInOut(seg(t, 1.8, 2.4))) : lerp(520, 330, easeInOut(seg(t, 3.0, 3.6)));
  return (
    <Svg label="the one knob: retention must outlast every reader and writer, yet short enough to reclaim storage or honor a delete." h={230}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        retention window
      </T>
      <line x1={60} y1={80} x2={540} y2={80} stroke={C.mocha} strokeWidth={3} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={280} y={70} width={120} height={20} rx={4} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.2, 3.6))} />
      <circle cx={kx} cy={80} r={10} fill={C.second} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={125} s={12} f={C.cherryText} o={easeOut(seg(t, 1.1, 1.4))}>
        too short: a reader or writer breaks
      </T>
      <T x={25} y={155} s={12} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.6))}>
        too long: storage and deleted PII linger
      </T>
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        longer than the longest running transaction
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="time travel and rollback read the same chain; expiry reclaims storage and finally makes a delete real." h={250}>
      <Row y={40} label="time travel, rollback" value="one snapshot chain" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="expire, vacuum" value="space back, delete real" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the window" value="one knob for all three" valueColor={C.second} k={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}
