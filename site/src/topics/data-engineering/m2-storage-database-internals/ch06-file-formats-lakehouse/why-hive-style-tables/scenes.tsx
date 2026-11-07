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

/** A folder tab and body at (x, y), with a name on it, drawn in by `o`. */
function Folder({ x, y, w, h = 30, name, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; name: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <path d={`M${x} ${y} h${Math.min(46, w * 0.35)} l6 6 H${x + w} V${y + h} H${x} z`} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + 8} y={y + h / 2 + 7} s={11} f={f}>
        {name}
      </T>
    </g>
  );
}

/** A tiny data file, drawn in by `o`. */
function DataFile({ x, y, o = 1, f = C.latte }: { x: number; y: number; o?: number; f?: string }) {
  return <rect x={x} y={y} width={14} height={18} rx={2} fill={C.cocoa} stroke={f} strokeWidth={1.4} opacity={o} />;
}

// 1 · Hook. A ledger with a version number is crossed out; a folder tree appears; a LIST sweep runs down it and what
// comes back is labelled "the table".
export function Hook({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="a Hive-style table isn't a thing you commit to -- it's whatever a directory listing returns right now." h={220}>
      <Cell x={25} y={40} w={150} label="version: committed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cross x={100} y={54} k={easeOut(seg(t, 0.6, 0.9))} />
      <Folder x={230} y={30} w={130} name="orders/" o={easeOut(seg(t, 1.0, 1.3))} />
      {['event_date=01', 'event_date=02', 'event_date=03'].map((n, i) => (
        <g key={n}>
          <line x1={250} y1={60} x2={250} y2={92 + i * 42} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.2 + i * 0.15, 1.5 + i * 0.15))} />
          <line x1={250} y1={92 + i * 42} x2={262} y2={92 + i * 42} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.2 + i * 0.15, 1.5 + i * 0.15))} />
          <Folder x={262} y={77 + i * 42} w={150} name={n} o={easeOut(seg(t, 1.2 + i * 0.15, 1.5 + i * 0.15))} />
          {[0, 1].map((j) => (
            <DataFile key={j} x={422 + j * 20} y={83 + i * 42} o={easeOut(seg(t, 1.4 + i * 0.15 + j * 0.1, 1.6 + i * 0.15 + j * 0.1))} />
          ))}
        </g>
      ))}
      <rect x={222} y={lerp(26, 196, sweep)} width={250} height={3} fill={C.second} opacity={t > 2.0 && t < 3.1 ? 1 : 0} />
      <T x={225} y={18} s={11} f={C.second} o={easeOut(seg(t, 1.9, 2.2))}>
        LIST: what's here right now?
      </T>
      <path d="M480 60 h20 v140 h-20" fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.1, 3.4))} />
      <T x={510} y={135} s={14} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
        table
      </T>
    </Svg>
  );
}

// 2 · Predict. A row whose own date is 01-02 is typed into the 01-01 folder; the answer: nothing checks it.
export function PredictValidation({ t, answer }: StepCtx) {
  return (
    <Svg label="a writer inserts a row with event_date='2024-01-01' into the wrong partition directory -- does Hive catch it?" h={200}>
      <Cell x={25} y={40} w={180} label="row: date 2024-01-02" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={92} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        writer types: '2024-01-01'
      </T>
      <Req x1={207} x2={360} y={54} k={easeOut(seg(t, 0.8, 1.4))} label="INSERT" />
      <Folder x={362} y={39} w={213} name="event_date=2024-01-01" o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={468} y={95} s={18} f={C.second} a="middle" o={easeOut(seg(t, 1.5, 1.9))}>
        checked?
      </T>
      <AnswerRow y={140} label="Hive checks the value" answer={answer} value="no, never" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="the writer's word is the partition" />
    </Svg>
  );
}

// 3 · Directory as partition. Table T's two partition columns, ds and ctry; each value drops into the path, which is
// built segment by segment, and the key and the path are shown as the same string.
export function RevealDirectoryPartition({ t }: StepCtx) {
  const segs = ['/wh/T', '/ds=20090101', '/ctry=US'];
  const xs = [60, 128, 260];
  return (
    <Svg label="Hive's own example: table T, partitioned on ds and ctry, lands in /wh/T/ds=20090101/ctry=US." h={230}>
      <T x={25} y={36} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        table T, partitioned on
      </T>
      <Cell x={250} y={18} w={90} label="ds" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={360} y={18} w={90} label="ctry" o={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={295} y1={48} x2={190} y2={112} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.5, 1.8))} />
      <line x1={405} y1={48} x2={300} y2={112} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <rect x={45} y={112} width={300} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      {segs.map((s, i) => (
        <T key={s} x={xs[i]} y={lerp(122, 134, easeOut(seg(t, 1.0 + i * 0.5, 1.4 + i * 0.5)))} s={13} f={i === 0 ? C.crema : C.second} o={easeOut(seg(t, 1.0 + i * 0.5, 1.4 + i * 0.5))}>
          {s}
        </T>
      ))}
      <T x={25} y={180} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        no lookup, no translation layer
      </T>
      <T x={25} y={210} s={14} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        the path on disk is the partition key
      </T>
    </Svg>
  );
}

// 4 · Stale metastore. The metastore's list and the disk side by side, agreeing; a folder appears on disk and one is
// removed, while the metastore stays put; the mismatch turns red; a sync arrow catches it up.
export function RevealStaleMetastore({ t }: StepCtx) {
  const sync = easeOut(seg(t, 3.4, 3.9));
  const add = easeOut(seg(t, 1.0, 1.4));
  const drop = easeOut(seg(t, 1.6, 2.0));
  const red = easeOut(seg(t, 2.3, 2.7)) * (1 - sync);
  return (
    <Svg label="add or drop files on disk, and the metastore doesn't know -- until a sync." h={230}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        metastore says
      </T>
      <T x={330} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        disk has
      </T>
      {['date=01', 'date=02', 'date=03'].map((n, i) => (
        <g key={n}>
          <Cell
            x={25}
            y={45 + i * 40}
            w={150}
            label={n}
            o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1)) * (i === 0 ? 1 - sync : 1)}
            stroke={i === 0 ? (red > 0.5 ? C.cherryText : C.mocha) : C.mocha}
          />
          <Folder x={330} y={45 + i * 40} w={150} name={n} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1)) * (i === 0 ? 1 - drop : 1)} />
        </g>
      ))}
      <Folder x={330} y={165} w={150} name="date=04" o={add} stroke={C.second} f={C.second} />
      <Cell x={25} y={165} w={150} label="date=04" o={sync} stroke={C.focus} f={C.focus} />
      <T x={185} y={64} s={13} f={C.cherryText} o={red}>
        gone
      </T>
      <T x={185} y={184} s={13} f={C.cherryText} o={red}>
        unseen
      </T>
      <Req x1={325} x2={180} y={215} k={sync} label="sync" f={C.focus} />
    </Svg>
  );
}

// 5 · Predict. One write fans into two folders at once; a reader looks in the middle; the answer: it can see one done.
export function PredictAtomicCommit({ t, answer }: StepCtx) {
  return (
    <Svg label="a write touches two partitions at once -- does it commit as one atomic unit?" h={200}>
      <Cell x={25} y={55} w={100} label="writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <Folder x={300} y={25} w={160} name="date=today" o={easeOut(seg(t, 0.2, 0.5))} />
      <Folder x={300} y={80} w={160} name="date=yesterday" o={easeOut(seg(t, 0.3, 0.6))} />
      <Req x1={127} x2={298} y={42} k={easeOut(seg(t, 0.6, 1.1))} />
      <Req x1={127} x2={298} y={96} k={easeOut(seg(t, 0.8, 1.3))} />
      <T x={520} y={76} s={18} f={C.second} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        reader?
      </T>
      <AnswerRow y={145} label="a reader can see" answer={answer} value="one done, one not" k={easeOut(seg(t, 1.9, 2.4))} />
      <Verdict answer={answer} y={188} text="two folders, two unrelated events" />
    </Svg>
  );
}

// 6 · The real partial read. Partition A's four files land; partition B fills two of four; the LIST taken at that pause
// freezes a snapshot showing A whole and B half; then B finishes.
export function RevealPartialWriteReproduced({ t }: StepCtx) {
  const bTimes = [1.6, 1.9, 3.4, 3.7];
  const snap = easeOut(seg(t, 2.3, 2.7));
  return (
    <Svg label="reproduced for real: a listing taken mid-write sees partition A whole, partition B half-written." h={230}>
      <Folder x={25} y={30} w={190} name="event_date=2024-01-01" o={easeOut(seg(t, 0.1, 0.4))} />
      <Folder x={25} y={105} w={190} name="event_date=2024-01-02" o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3].map((i) => (
        <DataFile key={'a' + i} x={230 + i * 22} y={36} o={easeOut(seg(t, 0.5 + i * 0.2, 0.7 + i * 0.2))} />
      ))}
      {bTimes.map((s, i) => (
        <DataFile key={'b' + i} x={230 + i * 22} y={111} o={easeOut(seg(t, s, s + 0.2))} />
      ))}
      <line x1={335} y1={20} x2={335} y2={150} stroke={C.second} strokeWidth={2} strokeDasharray="4 4" opacity={snap} />
      <T x={345} y={20} s={11} f={C.second} o={snap}>
        LIST, at the pause
      </T>
      <Cell x={360} y={32} w={150} label="A: 4 of 4" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))} />
      <Cell x={360} y={107} w={150} label="B: 2 of 4" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))} />
      <T x={25} y={190} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        B finishes later; the reader already saw half
      </T>
      <T x={25} y={218} s={14} f={C.cherryText} o={easeOut(seg(t, 4.0, 4.3))}>
        a real partial read
      </T>
    </Svg>
  );
}

// 7 · Hive's own motive. Streaming writers keep dropping tiny files into a live partition; a reader catches a dirty
// read; the NameNode's load bar fills; ACID arrives as the answer.
export function RevealDirtyReadMotivation({ t }: StepCtx) {
  const load = easeInOut(seg(t, 1.6, 3.2));
  return (
    <Svg label="this is exactly Hive's own documented reason for adding ACID: streaming writers, dirty reads, too many small files." h={230}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={30 + i * 38} w={110} h={26} label="stream" o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
          <Req x1={137} x2={208} y={43 + i * 38} k={easeOut(seg(t, 0.4 + i * 0.1, 0.8 + i * 0.1))} />
        </g>
      ))}
      <Folder x={210} y={28} w={170} h={110} name="" o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={218} y={52} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        live partition
      </T>
      {Array.from({ length: 21 }, (_, i) => (
        <rect
          key={i}
          x={220 + (i % 7) * 22}
          y={64 + Math.floor(i / 7) * 22}
          width={10}
          height={13}
          rx={1.5}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.8 + i * 0.1, 1.0 + i * 0.1))}
        />
      ))}
      <Cell x={410} y={30} w={165} h={26} label="reader" o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={410} y={80} s={13} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.9))}>
        dirty read
      </T>
      <T x={410} y={112} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        NameNode load
      </T>
      <rect x={410} y={120} width={165} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <rect x={412} y={122} width={161 * load} height={10} rx={2} fill={C.cherryText} />
      <Lock x={25} y={186} k={easeOut(seg(t, 3.6, 3.9))} f={C.focus} />
      <T x={52} y={197} s={14} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        Hive adds ACID transactions
      </T>
    </Svg>
  );
}

// 8 · Listing cost. Three directories at 100, 1,000 and 5,000 files, each denser with pips; a LIST bar beside each
// grows longer; then the metastore sync pays the same tax.
export function RevealListingCost({ t }: StepCtx) {
  const rows = [
    { n: '100 files', pips: 4, w: 60 },
    { n: '1,000 files', pips: 16, w: 160 },
    { n: '5,000 files', pips: 40, w: 300 },
  ];
  return (
    <Svg label="a real listing call gets slower as a directory fills with files -- measured at 100, 1,000 and 5,000." h={230}>
      <T x={260} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        time for one LIST call
      </T>
      {rows.map((r, i) => {
        const y = 40 + i * 50;
        const g = easeInOut(seg(t, 1.0 + i * 0.7, 1.6 + i * 0.7));
        return (
          <g key={r.n}>
            <T x={25} y={y + 18} s={12} f={C.crema} o={easeOut(seg(t, 0.2 + i * 0.7, 0.5 + i * 0.7))}>
              {r.n}
            </T>
            {Array.from({ length: r.pips }, (_, j) => (
              <circle key={j} cx={140 + (j % 20) * 5.5} cy={y + 8 + Math.floor(j / 20) * 8} r={1.8} fill={C.latte} opacity={easeOut(seg(t, 0.4 + i * 0.7, 0.9 + i * 0.7))} />
            ))}
            <rect x={260} y={y + 4} width={r.w * g} height={16} rx={2} fill={C.second} />
          </g>
        );
      })}
      <T x={25} y={210} s={14} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        a full metastore sync pays it at table scale
      </T>
    </Svg>
  );
}

// 9 · One choice. Four problem cards appear, then lines converge from each to one box: the table's state is a LIST call.
export function RevealFixShape({ t }: StepCtx) {
  const probs = ['no validation', 'stale metastore', 'no atomic commit', 'slow listing'];
  return (
    <Svg label="every problem traces back to one choice: using a LIST call as the table's state." h={230}>
      {probs.map((p, i) => {
        const y = 20 + i * 42;
        const g = easeInOut(seg(t, 1.6 + i * 0.15, 2.2 + i * 0.15));
        return (
          <g key={p}>
            <Cell x={25} y={y} w={220} h={30} label={p} stroke={C.cherryText} o={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))} />
            <line x1={247} y1={y + 15} x2={lerp(247, 328, g)} y2={lerp(y + 15, 98, g)} stroke={C.mocha} strokeWidth={1.5} opacity={g > 0 ? 1 : 0} />
          </g>
        );
      })}
      <Cell x={330} y={82} w={245} h={32} label="table state = a LIST call" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))} />
      <T x={300} y={215} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        nobody ever wrote the state down
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="directory-as-partition, no atomic multi-partition commit, listing cost that grows -- fixed by an explicit, versioned table state." h={250}>
      <Row y={40} label="partitions" value="named folders, trusted" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={90} label="multi-folder write" value="never atomic" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={140} label="listing" value="grows with the table" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={200} label="the fix" value="explicit table state" valueColor={C.focus} big k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}
