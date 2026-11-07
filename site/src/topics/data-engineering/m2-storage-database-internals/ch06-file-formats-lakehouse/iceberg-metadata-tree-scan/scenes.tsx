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

const DAYS = ['01-01', '01-02', '01-03', '01-04', '01-05'];
const MX = (i: number) => 40 + i * 106;

/** The metadata tree: metadata.json, the manifest list, five manifests and five data files, each level drawn by its own k. */
function Tree({
  k0 = 1,
  k1 = 1,
  k2 = 1,
  k3 = 1,
  mStroke,
  fStroke,
  mO,
  fO,
  y0 = 20,
}: {
  k0?: number;
  k1?: number;
  k2?: number;
  k3?: number;
  mStroke?: (i: number) => string;
  fStroke?: (i: number) => string;
  mO?: (i: number) => number;
  fO?: (i: number) => number;
  y0?: number;
}) {
  return (
    <g>
      <Cell x={210} y={y0} w={180} h={28} label="metadata.json" o={k0} stroke={C.second} />
      <line x1={300} y1={y0 + 28} x2={300} y2={lerp(y0 + 28, y0 + 55, k1)} stroke={C.mocha} strokeWidth={1.5} opacity={k1 > 0 ? 1 : 0} />
      <Cell x={210} y={y0 + 55} w={180} h={28} label="manifest list" o={k1} />
      {DAYS.map((d, i) => (
        <g key={d}>
          <line x1={300} y1={y0 + 83} x2={lerp(300, MX(i) + 47, k2)} y2={lerp(y0 + 83, y0 + 110, k2)} stroke={C.mocha} strokeWidth={1.2} opacity={(k2 > 0 ? 1 : 0) * (mO ? mO(i) : 1)} />
          <Cell x={MX(i)} y={y0 + 110} w={94} h={26} label="manifest" o={k2 * (mO ? mO(i) : 1)} stroke={mStroke ? mStroke(i) : C.mocha} />
          <line x1={MX(i) + 47} y1={y0 + 136} x2={MX(i) + 47} y2={lerp(y0 + 136, y0 + 152, k3)} stroke={C.mocha} strokeWidth={1.2} opacity={(k3 > 0 ? 1 : 0) * (fO ? fO(i) : 1)} />
          <Cell x={MX(i)} y={y0 + 152} w={94} h={26} label={d} o={k3 * (fO ? fO(i) : 1)} stroke={fStroke ? fStroke(i) : C.latte} f={C.latte} />
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. One "snapshot" box; it opens downward into the tree, level by level.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a snapshot has been treated as one thing to reach for -- it is actually a tree." h={200}>
      <Cell x={25} y={20} w={150} h={30} label="a snapshot" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={75} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        one thing to fetch?
      </T>
      <Tree y0={12} k0={easeOut(seg(t, 1.2, 1.5))} k1={easeOut(seg(t, 1.7, 2.1))} k2={easeOut(seg(t, 2.3, 2.8))} k3={0} />
      <T x={300} y={190} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        a tree, walked top to bottom
      </T>
    </Svg>
  );
}

// 2 · Predict. Five manifests, one per day; a reader wants 01-03; the answer: no, the summaries rule groups out first.
export function PredictOpenAllManifests({ t, answer }: StepCtx) {
  return (
    <Svg label="five partitions, one day each -- does a reader open every manifest to find one day's rows?" h={200}>
      {DAYS.map((d, i) => (
        <Cell key={d} x={MX(i)} y={30} w={94} h={28} label={d} stroke={i === 2 && t > 1.0 ? C.focus : C.mocha} o={easeOut(seg(t, 0.1 + i * 0.12, 0.4 + i * 0.12))} />
      ))}
      <T x={40} y={95} s={12} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        the reader wants 2026-01-03
      </T>
      <T x={350} y={95} s={14} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        open all five?
      </T>
      <AnswerRow y={145} label="opens every manifest" answer={answer} value="no" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="the summaries rule groups out first" />
    </Svg>
  );
}

// 3 · The real tree. metadata.json lands with its five contents listed beside it; then the manifest list; then five manifests.
export function RevealRealTree({ t }: StepCtx) {
  const parts = ['schemas', 'partition specs', 'sort orders', 'snapshot log', 'refs: main'];
  return (
    <Svg label="reproduced for real: a real pyiceberg table's metadata.json, manifest list, and manifests." h={230}>
      <Tree y0={30} k0={easeOut(seg(t, 0.1, 0.4))} k1={easeOut(seg(t, 2.0, 2.4))} k2={easeOut(seg(t, 2.8, 3.3))} k3={easeOut(seg(t, 3.6, 4.0))} />
      {parts.map((p, i) => (
        <T key={p} x={i < 3 ? 25 : 405} y={i < 3 ? 22 + i * 22 : 22 + (i - 3) * 22} s={11} f={C.second} o={easeOut(seg(t, 0.5 + i * 0.25, 0.8 + i * 0.25))}>
          {p}
        </T>
      ))}
    </Svg>
  );
}

// 4 · Sequence numbers. The tree, with each of the five commits' manifest and file taking its sequence number in order,
// 1 through 5, left to right.
export function RevealSequenceNumbers({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: every manifest and file inherits its snapshot's sequence number." h={230}>
      <Tree y0={10} k0={easeOut(seg(t, 0.1, 0.4))} />
      {DAYS.map((d, i) => (
        <g key={d}>
          <circle cx={MX(i) + 47} cy={205} r={11} fill={C.cocoa} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5))} />
          <T x={MX(i) + 47} y={209.5} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5))}>
            {String(i + 1)}
          </T>
        </g>
      ))}
      <T x={405} y={85} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        seq, no gaps
      </T>
    </Svg>
  );
}

// 5 · Summaries. The manifest list's five rows each carry a day summary; one manifest opens to its file entry with the
// partition tuple and a row-count metric.
export function RevealManifestSummaries({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: per-manifest partition summaries, per-file partition tuples and column metrics." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        manifest list: one summary per manifest
      </T>
      {DAYS.map((d, i) => (
        <Cell key={d} x={MX(i) - 15} y={38} w={100} h={26} label={`day ${d}`} stroke={i === 2 ? C.second : C.mocha} o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))} />
      ))}
      <line x1={MX(2) + 35} y1={64} x2={MX(2) + 35} y2={lerp(64, 100, easeOut(seg(t, 1.8, 2.2)))} stroke={C.second} strokeWidth={1.6} />
      <T x={25} y={118} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        that manifest: one entry per file
      </T>
      <rect x={25} y={130} width={545} height={60} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 2.3, 2.6))} />
      <T x={40} y={155} s={12} f={C.crema} o={easeOut(seg(t, 2.6, 2.9))}>
        partition: day=2026-01-03
      </T>
      <T x={40} y={178} s={12} f={C.crema} o={easeOut(seg(t, 3.1, 3.4))}>
        metrics: 4 rows, column bounds
      </T>
      <T x={25} y={218} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        enough to skip a file unopened
      </T>
    </Svg>
  );
}

// 6 · Predict. The manifest list's summaries and five manifests; a filter for 01-03; the answer: it skips four.
export function PredictPruningReal({ t, answer }: StepCtx) {
  return (
    <Svg label="does planning actually skip manifests outside the target partition, or filter rows after opening all of them?" h={200}>
      {DAYS.map((d, i) => (
        <Cell key={d} x={MX(i)} y={30} w={94} h={28} label={d} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={40} y={95} s={12} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        filter: day = 2026-01-03
      </T>
      <T x={330} y={95} s={13} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        skip, or open all?
      </T>
      <AnswerRow y={145} label="planning" answer={answer} value="skips four" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="before a single file is touched" />
    </Svg>
  );
}

// 7 · Pruning, measured. First every file lights for the unfiltered scan, 5 files; then four manifests are crossed out by
// their summaries and only the 01-03 path stays lit, 1 file.
export function RevealPruningMeasured({ t }: StepCtx) {
  const all = t > 0.8 && t < 2.0;
  const pr = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="reproduced for real: planning prunes manifests by partition summary before any file is touched." h={230}>
      <Tree
        y0={4}
        k0={easeOut(seg(t, 0.1, 0.4))}
        mStroke={(i) => (pr > 0.5 && i !== 2 ? C.cherryText : pr > 0.5 ? C.focus : C.mocha)}
        fStroke={(i) => (all || (pr > 0.5 && i === 2) ? C.focus : C.latte)}
        fO={(i) => (pr > 0.5 && i !== 2 ? 0.3 : 1)}
      />
      {[0, 1, 3, 4].map((i) => (
        <Cross key={i} x={MX(i) + 47} y={127} k={pr} />
      ))}
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        no filter: 5 files planned
      </T>
      <T x={300} y={205} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        day 01-03: 1 file
      </T>
      <T x={25} y={226} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        manifests cut first, then files
      </T>
    </Svg>
  );
}

// 8 · Bloat. Commits arrive one at a time; each adds its own manifest under the manifest list until the tree is bushy.
export function RevealManifestBloat({ t }: StepCtx) {
  return (
    <Svg label="small streaming-style commits leave one manifest each -- bloat, one level up the tree." h={230}>
      <Cell x={210} y={20} w={180} h={28} label="manifest list" o={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 30 + i * 46;
        const k = easeOut(seg(t, 0.6 + i * 0.22, 0.85 + i * 0.22));
        return (
          <g key={i}>
            <line x1={300} y1={48} x2={lerp(300, x + 18, k)} y2={lerp(48, 100, k)} stroke={C.mocha} strokeWidth={1} opacity={k > 0 ? 1 : 0} />
            <rect x={x} y={100} width={36} height={22} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.3} opacity={k} />
            <circle cx={x + 18} cy={150} r={4} fill={C.second} opacity={k} />
          </g>
        );
      })}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        one small commit, one manifest
      </T>
      <T x={25} y={212} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        small-file bloat, one level up
      </T>
    </Svg>
  );
}

// 9 · rewrite_manifests. Five manifests slide together into one; the manifest list now points at one; the twenty rows and
// the data underneath are unchanged.
export function RevealRewriteManifests({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="reproduced for real: a real rewrite_manifests merges five one-manifest commits into one." h={230}>
      <Cell x={210} y={15} w={180} h={28} label="manifest list" o={easeOut(seg(t, 0.1, 0.4))} />
      {DAYS.map((d, i) => (
        <g key={d}>
          <rect
            x={lerp(MX(i), 253, m)}
            y={70}
            width={94}
            height={26}
            rx={4}
            fill={C.cocoa}
            stroke={m > 0.95 ? C.focus : C.mocha}
            strokeWidth={1.5}
            opacity={easeOut(seg(t, 0.1, 0.4)) * (i === 2 ? 1 : 1 - seg(t, 1.9, 2.0))}
          />
          <line x1={lerp(MX(i), 253, m) + 47} y1={96} x2={MX(i) + 47} y2={135} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1, 0.4))} />
          <Cell x={MX(i)} y={135} w={94} h={26} label={d} f={C.latte} stroke={C.latte} o={easeOut(seg(t, 0.1, 0.4))} />
        </g>
      ))}
      <line x1={300} y1={43} x2={300} y2={70} stroke={C.focus} strokeWidth={1.5} opacity={m} />
      <T x={360} y={88} s={12} f={C.focus} o={easeOut(seg(t, 2.1, 2.4))}>
        one manifest
      </T>
      <T x={25} y={200} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>
        same 20 rows, same data files
      </T>
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        committed as the new live snapshot
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is a tree; planning prunes it level by level before any file is read." h={250}>
      <Row y={40} label="a snapshot" value="a tree of metadata" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="manifests" value="cut by summaries" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="files" value="cut by metrics" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={220} label="many small commits" value="rewrite_manifests" valueColor={C.second} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}
