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

/** A snapshot box: its name on top, then one row per file it lists, each row drawn in after the box. */
function Snap({
  x,
  y,
  w = 150,
  name,
  files,
  o = 1,
  fo = 1,
  stroke = C.mocha,
  f = C.crema,
}: {
  x: number;
  y: number;
  w?: number;
  name: string;
  files: string[];
  o?: number;
  fo?: number;
  stroke?: string;
  f?: string;
}) {
  const h = 30 + files.length * 22;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.cocoa} stroke={stroke} strokeWidth={1.6} />
      <T x={x + 10} y={y + 19} s={12} f={f}>
        {name}
      </T>
      {files.map((fl, i) => (
        <T key={fl} x={x + 14} y={y + 41 + i * 22} s={11} f={C.latte} o={seg(fo * files.length, i, i + 1)}>
          {fl}
        </T>
      ))}
    </g>
  );
}

/** The "current" pointer box at (x, y), with an arrow to the point (tx, ty). */
function Pointer({ x, y, tx, ty, o = 1, label = 'current' }: { x: number; y: number; tx: number; ty: number; o?: number; label?: string }) {
  const sx = x + 50;
  const sy = y + 28;
  const ang = Math.atan2(ty - sy, tx - sx);
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={100} height={28} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
      <T x={x + 50} y={y + 18.5} s={12} f={C.focus} a="middle">
        {label}
      </T>
      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={C.focus} strokeWidth={2} />
      <path
        d={`M${tx} ${ty} l${-9 * Math.cos(ang - 0.4)} ${-9 * Math.sin(ang - 0.4)} l${9 * Math.cos(ang - 0.4) - 9 * Math.cos(ang + 0.4)} ${9 * Math.sin(ang - 0.4) - 9 * Math.sin(ang + 0.4)} z`}
        fill={C.focus}
      />
    </g>
  );
}

const F2 = ['part-0001.parquet', 'part-0002.parquet'];
const F3 = ['part-0001.parquet', 'part-0002.parquet', 'part-0003.parquet'];

// 1 · Hook. The broken listing from last time: a folder half filled, crossed out; beside it one immutable file,
// padlocked, and a pointer to it.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a directory listing broke as table state -- this topic is the fix: one immutable file, one pointer." h={200}>
      <rect x={25} y={40} width={180} height={90} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={35} y={60} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        LIST of a folder
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={40 + i * 36}
          y={78}
          width={22}
          height={30}
          rx={2}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.3}
          strokeDasharray={i > 1 ? '3 3' : undefined}
          opacity={easeOut(seg(t, 0.3 + i * 0.15, 0.5 + i * 0.15))}
        />
      ))}
      <Cross x={115} y={150} k={easeOut(seg(t, 1.1, 1.4))} />
      <T x={115} y={185} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        could lie
      </T>
      <Snap x={300} y={95} w={160} name="snapshot" files={[]} o={easeOut(seg(t, 1.8, 2.2))} />
      <Lock x={470} y={104} k={easeOut(seg(t, 2.3, 2.6))} />
      <Pointer x={330} y={20} tx={380} ty={93} o={easeOut(seg(t, 2.9, 3.3))} />
      <T x={380} y={160} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        one file, one pointer
      </T>
    </Svg>
  );
}

// 2 · Predict. A padlocked snapshot; how does the table move on? The answer: a whole new one, and the pointer moves.
export function PredictImmutable({ t, answer }: StepCtx) {
  const a = answer !== null ? easeOut(seg(t, 0.2, 0.8)) : 0;
  return (
    <Svg label="a snapshot is immutable -- so how does the table ever change at all?" h={200}>
      <Snap x={25} y={50} w={130} name="snap-1" files={[]} o={easeOut(seg(t, 0.1, 0.4))} />
      <Lock x={165} y={58} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={300} y={108} s={18} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.4)) * (1 - a)}>
        patched?
      </T>
      {answer !== null && <Snap x={420} y={50} w={130} name="snap-2" files={[]} stroke={C.focus} f={C.focus} o={a} />}
      {answer !== null && <Req x1={200} x2={418} y={65} k={a} f={C.focus} />}
      <AnswerRow y={140} label="the table changes by" answer={answer} value="a new snapshot" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={188} text="the old one is never touched again" />
    </Svg>
  );
}

// 3 · Whole file list. A diff card "+ part-0003" appears and is crossed out; snap-2 lists every file, row by row.
export function RevealSnapshotIsWholeFile({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is the complete file list at one moment -- the whole table, not a diff." h={230}>
      <Cell x={25} y={30} w={190} label="+ part-0003.parquet" o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={82} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        a diff since last time
      </T>
      <Cross x={120} y={44} k={easeOut(seg(t, 0.9, 1.2))} />
      <Snap x={300} y={30} w={245} name="snap-2: the whole table" files={F3} fo={seg(t, 1.6, 3.2)} o={easeOut(seg(t, 1.3, 1.6))} stroke={C.focus} />
      <T x={25} y={190} s={14} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        readable on its own, nothing else to consult
      </T>
    </Svg>
  );
}

// 4 · Atomic pointer swap. snap-1 and snap-2 sit side by side; the "current" pointer swings from one to the other in a
// single move; snap-1 stays where it is, untouched.
export function RevealAtomicPointerSwap({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="the commit is one atomic swap of a pointer -- never an edit to the listing." h={230}>
      <Snap x={25} y={90} w={210} name="snap-1" files={F2} o={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={340} y={90} w={210} name="snap-2" files={F3} fo={seg(t, 0.9, 1.8)} o={easeOut(seg(t, 0.7, 1.0))} stroke={sw > 0.5 ? C.focus : C.mocha} />
      <T x={445} y={80} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        written out first, in full
      </T>
      <Pointer x={235} y={20} tx={lerp(130, 445, sw)} ty={lerp(88, 88, sw)} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={215} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        one swap; snap-1 is left alone
      </T>
    </Svg>
  );
}

// 5 · Predict. A reader padlocked to snap-1; a writer commits snap-2 and the pointer moves; the answer: never.
export function PredictPinnedReader({ t, answer }: StepCtx) {
  const sw = easeInOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="a reader pins a snapshot, then a second writer commits -- can the pinned reader ever see that change?" h={200}>
      <Snap x={25} y={40} w={130} name="snap-1" files={[]} o={easeOut(seg(t, 0.1, 0.4))} />
      <Snap x={300} y={40} w={130} name="snap-2" files={[]} o={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={25} y={92} w={130} h={26} label="reader" o={easeOut(seg(t, 0.3, 0.6))} />
      <Lock x={165} y={98} k={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={445} y={40} w={130} h={30} label="writer" o={easeOut(seg(t, 0.7, 1.0))} />
      <line x1={lerp(90, 365, sw)} y1={20} x2={lerp(90, 365, sw)} y2={38} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <AnswerRow y={145} label="the pinned reader sees it" answer={answer} value="never" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} y={188} text="only if it asks for current again" />
    </Svg>
  );
}

// 6 · Pinned reader, for real. Read one of snap-1: two files; a writer commits snap-2; read two of snap-1: the same two
// files, ticked identical; a fresh reader gets snap-2 and three files.
export function RevealPinnedReaderUnaffected({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the pinned reader's file list is identical before and after the second commit." h={230}>
      <Snap x={25} y={25} w={180} name="read one: snap-1" files={F2} fo={seg(t, 0.3, 1.0)} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={225} y={50} w={140} h={30} label="snap-2 commits" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.3, 1.6))} />
      <Snap x={385} y={25} w={180} name="read two: snap-1" files={F2} fo={seg(t, 2.0, 2.7)} o={easeOut(seg(t, 1.8, 2.1))} />
      <T x={385} y={135} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        identical
      </T>
      <MiniTick x={482} y={127} k={easeOut(seg(t, 2.9, 3.2))} />
      <T x={25} y={190} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.7))}>
        a fresh reader asks again:
      </T>
      <T x={25} y={215} s={13} f={C.second} o={easeOut(seg(t, 3.7, 4.0))}>
        snapshot 2, three files
      </T>
    </Svg>
  );
}

// 7 · Optimistic. Two writer lanes stage files with no lock, side by side; both run to one narrow commit gate; one passes,
// the other loops back to retry.
export function RevealOptimisticCommit({ t }: StepCtx) {
  return (
    <Svg label="the protocol is optimistic by design: stage first, race to commit, retry on a stale base." h={230}>
      {['writer A', 'writer B'].map((w, i) => {
        const y = 40 + i * 70;
        return (
          <g key={w}>
            <T x={25} y={y + 18} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
              {w}
            </T>
            {[0, 1, 2].map((j) => (
              <rect
                key={j}
                x={120 + j * 34}
                y={y}
                width={24}
                height={28}
                rx={2}
                fill={C.cocoa}
                stroke={C.latte}
                strokeWidth={1.3}
                opacity={easeOut(seg(t, 0.4 + j * 0.25 + i * 0.1, 0.6 + j * 0.25 + i * 0.1))}
              />
            ))}
            <line
              x1={230}
              y1={y + 14}
              x2={lerp(230, 380, easeInOut(seg(t, 1.6, 2.2)))}
              y2={lerp(y + 14, 89, easeInOut(seg(t, 1.6, 2.2)))}
              stroke={i === 0 ? C.focus : C.cherryText}
              strokeWidth={1.8}
              opacity={seg(t, 1.6, 1.7)}
            />
          </g>
        );
      })}
      <T x={120} y={160} s={11} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
        stage: no lock
      </T>
      <rect x={380} y={70} width={14} height={38} rx={2} fill={C.focus} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <T x={387} y={60} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        commit
      </T>
      <Req x1={396} x2={520} y={89} k={easeOut(seg(t, 2.4, 2.8))} f={C.focus} label="wins" />
      <path d="M380 112 q-30 60 -120 48" fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="200" strokeDashoffset={200 * (1 - easeOut(seg(t, 2.9, 3.5)))} />
      <T x={300} y={200} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))}>
        loses: retry on the new base
      </T>
    </Svg>
  );
}

// 8 · The race, for real. Base snap-10; A writes snap-11 and B writes snap-12, both on base 10; both race for slot v11;
// A commits, B is rejected; B retries as snap-13 on base 11 and takes slot v12.
export function RevealCompareAndSwapRace({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: two writers race for the same slot -- exactly one wins." h={230}>
      <Cell x={25} y={90} w={100} h={30} label="snap-10" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={175} y={40} w={110} h={30} label="A: snap-11" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={175} y={140} w={110} h={30} label="B: snap-12" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={125} y1={100} x2={175} y2={55} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={125} y1={110} x2={175} y2={155} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={340} y={90} w={80} h={30} label="slot v11" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <line x1={285} y1={55} x2={lerp(285, 340, easeOut(seg(t, 1.3, 1.7)))} y2={lerp(55, 100, easeOut(seg(t, 1.3, 1.7)))} stroke={C.focus} strokeWidth={2} />
      <line x1={285} y1={155} x2={lerp(285, 340, easeOut(seg(t, 1.5, 1.9)))} y2={lerp(155, 112, easeOut(seg(t, 1.5, 1.9)))} stroke={C.cherryText} strokeWidth={2} />
      <T x={300} y={28} s={12} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        committed
      </T>
      <Cross x={320} y={175} k={easeOut(seg(t, 2.2, 2.5))} />
      <T x={340} y={180} s={12} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.6))}>
        rejected
      </T>
      <Cell x={440} y={40} w={130} h={30} label="snap-13" stroke={C.focus} o={easeOut(seg(t, 3.0, 3.3))} />
      <T x={440} y={90} s={11} f={C.latte} o={easeOut(seg(t, 3.1, 3.4))}>
        retry on base 11
      </T>
      <T x={440} y={135} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
        slot v12: ok
      </T>
    </Svg>
  );
}

// 9 · Delta's same shape. A serial row of version blocks joined by links, drawn in left to right; a reader follows the
// log along them; a LIST call beside it is crossed out.
export function RevealDeltaSameShape({ t }: StepCtx) {
  const r = easeInOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="Delta's own protocol: a single serial history of atomic versions, read through a log -- not a listing." h={230}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Delta: one serial history of versions
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.2, 0.5 + i * 0.2))}>
          <rect x={25 + i * 90} y={55} width={60} height={34} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.6} />
          {i < 5 && <line x1={85 + i * 90} y1={72} x2={115 + i * 90} y2={72} stroke={C.mocha} strokeWidth={1.5} />}
        </g>
      ))}
      <circle cx={lerp(55, 505, r)} cy={110} r={6} fill={C.focus} opacity={seg(t, 2.0, 2.1)} />
      <T x={25} y={140} s={12} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        the reader follows the log
      </T>
      <Cell x={25} y={170} w={160} h={30} label="LIST files" o={easeOut(seg(t, 3.4, 3.7))} />
      <Cross x={105} y={185} k={easeOut(seg(t, 3.8, 4.1))} />
      <T x={210} y={190} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.1))}>
        never asked
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is immutable, a commit is one atomic swap, and exactly one of two racing writers wins." h={250}>
      <Row y={40} label="a snapshot" value="never edited" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a commit" value="one pointer swap" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="two racing writers" value="exactly one wins" valueColor={C.second} k={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}
