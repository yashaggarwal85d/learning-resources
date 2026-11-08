import { useEffect, useState } from 'react';
import { Bar, C, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

/** Two input streams (left, right) running into a join box at x 300; `flow` moves a few rows along each lane. */
function JoinLanes({ flow = -1, k = 1, wm = 1 }: { flow?: number; k?: number; wm?: number }) {
  return (
    <g opacity={k}>
      {[0, 1].map((l) => (
        <g key={l}>
          <T x={25} y={44 + l * 70} s={11} f={C.latte}>
            {l === 0 ? 'left stream' : 'right stream'}
          </T>
          <line x1={25} y1={60 + l * 70} x2={296} y2={60 + l * 70} stroke={C.mocha} strokeWidth={1.4} strokeDasharray={flow < 0 ? '4 4' : undefined} />
          {flow >= 0 &&
            [0, 1, 2].map((i) => {
              const x = 25 + ((((flow * 270 + i * 90) % 270) + 270) % 270);
              return <rect key={i} x={x} y={54 + l * 70} width={14} height={12} rx={2} fill={C.second} />;
            })}
          {wm < 1 && (
            <g opacity={1 - wm}>
              <rect x={160} y={30 + l * 70} width={110} height={18} rx={3} fill="none" stroke={C.mocha} strokeDasharray="3 3" />
              <T x={215} y={43 + l * 70} s={11} f={C.latte} a="middle">
                no watermark
              </T>
            </g>
          )}
        </g>
      ))}
      <Cell x={300} y={78} w={110} h={34} label="join" />
    </g>
  );
}

// 0 · Hook. Trigger ticks along the bottom; above them a state box keeps a running total and a few rows waiting for
// a match, carried across every tick.
export function Hook({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 1.0, 3.4) * 3.99));
  return (
    <Svg label="the watermark bounds how long state waits. This is what that state is." h={220}>
      <rect x={140} y={30} width={320} height={110} rx={6} fill="none" stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 0.1, 0.5))} />
      <T x={150} y={24} s={11} f={C.second} o={easeOut(seg(t, 0.1, 0.5))}>
        state, kept across triggers
      </T>
      <T x={160} y={66} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        running total
      </T>
      <rect x={330} y={56} width={20 + n * 30} height={12} fill={C.crema} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={160} y={110} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        waiting for a match
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={360 + i * 26} y={98} width={18} height={14} rx={2} fill={C.mocha} stroke={C.second} strokeWidth={1.2} opacity={i <= n - 1 ? 1 : 0} />
      ))}
      <line x1={25} y1={185} x2={565} y2={185} stroke={C.latte} strokeWidth={1.4} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={100 + i * 130} y1={175} x2={100 + i * 130} y2={195} stroke={C.focus} strokeWidth={2} opacity={i <= n ? 1 : 0.25} />
      ))}
    </Svg>
  );
}

// 1 · Three modes. A result table where one trigger changed two rows and added one; three columns fill with what each
// mode hands over, each row sliding out of the result into its column: the one new row, the three changed or new,
// every row; brackets lock onto the whole table.
export function RevealThreeModes({ t }: StepCtx) {
  const rows = [0, 1, 2, 3, 4, 5, 6];
  const kind = (i: number) => (i === 6 ? 'new' : i === 2 || i === 4 ? 'changed' : 'same');
  const out: [string, number[]][] = [
    ['append', [6]],
    ['update', [2, 4, 6]],
    ['complete', rows],
  ];
  const grow = easeOutBack(seg(t, 0.6, 1.0));
  return (
    <Svg label="three output modes: new rows only, changed rows only, or the whole table." h={250}>
      <T x={25} y={22} s={13} f={C.latte}>
        the result
      </T>
      {rows.map((i) => (
        <rect
          key={i}
          x={25}
          y={32 + i * 26}
          width={i === 6 ? 140 * clamp(grow, 0, 1.1) : 140}
          height={20}
          rx={2}
          fill={C.cocoa}
          stroke={kind(i) === 'new' ? C.second : kind(i) === 'changed' ? C.focus : C.mocha}
          strokeWidth={kind(i) === 'same' ? 1.2 : 2}
          opacity={i === 6 ? easeOut(seg(t, 0.6, 1.0)) : 1}
        />
      ))}
      {/* each mode hands rows over: a copy leaves its row in the result and slides into the mode's column */}
      {out.map(([m, ids], c) => {
        const k0 = 1.4 + c * 1.0;
        const step = c === 2 ? 0.07 : 0.18;
        return (
          <g key={m}>
            <T x={230 + c * 120} y={22} s={13} f={C.crema} o={easeOut(seg(t, k0 - 0.2, k0))}>
              {m}
            </T>
            {ids.map((i, j) => {
              const k = easeInOut(seg(t, k0 + j * step, k0 + 0.45 + j * step));
              if (k <= 0) return null;
              return (
                <rect
                  key={i}
                  x={lerp(25, 230 + c * 120, k)}
                  y={lerp(32 + i * 26, 32 + j * 26, k)}
                  width={lerp(140, 90, k)}
                  height={20}
                  rx={2}
                  fill={C.mocha}
                  stroke={kind(i) === 'new' ? C.second : kind(i) === 'changed' ? C.focus : C.latte}
                  strokeWidth={1.4}
                  opacity={clamp(k * 2)}
                />
              );
            })}
          </g>
        );
      })}
      <Reticle x={515} y={120} w={104} h={194} t={t} at={4.3} />
    </Svg>
  );
}

// 2 · Predict. Two streams flow into a join; a "complete" mode chip clicks onto its output. Runs, or refuses?
export function PredictCompleteOnJoin({ t, answer }: StepCtx) {
  return (
    <Svg label="a stream-stream join, asked for complete mode. Accepted, or rejected?" h={230}>
      <JoinLanes flow={t * 0.4} />
      <Req x1={410} x2={455} y={95} k={easeOut(seg(t, 0.3, 0.6))} f={C.latte} />
      <Cell x={460} y={78} w={110} h={34} label="complete" stroke={C.focus} o={easeOut(seg(t, 0.5, 0.9))} />
      <Verdict answer={answer} y={205} text="refused: a join can't take back" />
    </Svg>
  );
}

// 3 · Refused at start. The start arrow reaches the query and is crossed at once; the lanes stay empty and dashed;
// the analysis error types in.
export function RevealRejected({ t }: StepCtx) {
  return (
    <Svg label="measured: rejected before the query even starts. A real analysis error." h={230}>
      <JoinLanes />
      <Cell x={460} y={78} w={110} h={34} label="complete" stroke={C.cherryText} />
      <Cross x={435} y={95} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={180} s={13} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.4))}>
        AnalysisException
      </T>
      <T x={25} y={214} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        at the start, before one row moves
      </T>
    </Svg>
  );
}

// 4 · Append only. A matched row leaves the join for the sink; an arrow trying to revise it is crossed; "complete" is
// crossed, "append" ticks.
export function ElaborateWhyJoinsAppendOnly({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.3, 1.1));
  return (
    <Svg label="a join's own rows can't be revised once emitted -- only append fits that." h={230}>
      <Cell x={25} y={40} w={110} h={34} label="join" />
      <rect x={400} y={30} width={160} height={54} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={410} y={22} s={11} f={C.latte}>
        handed over
      </T>
      <rect x={lerp(145, 420, m)} y={50} width={50} height={16} rx={2} fill={C.second} />
      <line x1={480} y1={98} x2={lerp(480, 420, easeOut(seg(t, 1.4, 1.9)))} y2={98} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 3" opacity={t > 1.4 ? 1 : 0} />
      <T x={480} y={118} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        revise it?
      </T>
      <Cross x={445} y={98} k={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={25} y={150} w={150} h={30} label="complete" o={easeOut(seg(t, 2.6, 2.9))} />
      <Cross x={195} y={165} k={easeOut(seg(t, 3.0, 3.3))} />
      <Cell x={240} y={150} w={150} h={30} label="append" stroke={C.second} o={easeOut(seg(t, 3.2, 3.5))} />
      <MiniTick x={402} y={165} k={easeOut(seg(t, 3.6, 3.9))} f={C.second} />
    </Svg>
  );
}

// 5 · Predict. The same join; each lane's watermark chip goes dashed, "no watermark". Runs, or refuses?
export function PredictNoWatermarkJoin({ t, answer }: StepCtx) {
  return (
    <Svg label="the same join, with no watermark on either side. Accepted, or rejected?" h={230}>
      <JoinLanes flow={t * 0.4} wm={1 - easeOut(seg(t, 0.4, 0.9))} />
      <Verdict answer={answer} y={205} text="it runs fine" />
    </Svg>
  );
}

/** State size per batch as eight bars on a baseline at y 180, heights from `hs`, grown by `k`. */
function StateBars({ hs, k, f = C.latte }: { hs: number[]; k: number; f?: string }) {
  return (
    <g>
      {hs.map((h, i) => (
        <rect key={i} x={60 + i * 60} y={180 - h * clamp(k * 8 - i, 0, 1)} width={36} height={h * clamp(k * 8 - i, 0, 1)} fill={C.mocha} stroke={f} strokeWidth={1.3} />
      ))}
      <line x1={50} y1={180} x2={545} y2={180} stroke={C.mocha} strokeWidth={1.4} />
    </g>
  );
}

const GROW = [18, 36, 54, 72, 90, 108, 126, 144];
const PLATEAU = [18, 40, 56, 62, 60, 63, 61, 62];

// 6 · Growing. State size per batch climbs bar after bar, never once stepping down.
export function RevealAcceptedButGrowing({ t }: StepCtx) {
  return (
    <Svg label="measured: accepted, and running -- but its buffered state only grows." h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        rows held in state, per batch
      </T>
      <StateBars hs={GROW} k={easeOut(seg(t, 0.3, 2.8))} f={C.cherryText} />
      <T x={25} y={214} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
        only ever up, nothing let go
      </T>
    </Svg>
  );
}

// 7 · Both sides buffer. Rows pile up in a left buffer and a right buffer, each waiting for a match; a "give up?" probe
// finds no signal and is crossed.
export function ElaborateBothSidesBuffer({ t }: StepCtx) {
  return (
    <Svg label="a join buffers both sides as state -- with no safe point to drop any of it." h={230}>
      {[0, 1].map((s) => (
        <g key={s}>
          <T x={60 + s * 260} y={24} s={11} f={C.latte}>
            {s === 0 ? 'left rows, waiting' : 'right rows, waiting'}
          </T>
          <rect x={60 + s * 260} y={34} width={200} height={120} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} />
          {Array.from({ length: 15 }, (_, i) => (
            <rect
              key={i}
              x={70 + s * 260 + (i % 5) * 38}
              y={136 - Math.floor(i / 5) * 24}
              width={30}
              height={16}
              rx={2}
              fill={C.mocha}
              stroke={C.latte}
              strokeWidth={1}
              opacity={clamp(seg(t, 0.3 + s * 0.2, 3.0) * 15 - i, 0, 1)}
            />
          ))}
        </g>
      ))}
      <T x={60} y={190} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        waited long enough? nothing says so
      </T>
      <Cross x={420} y={186} k={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

// 8 · Bounded. The same chart with a watermark and a time range: bars climb for a few batches, then hold level under a
// dashed line, beside a faint ghost of the unbounded climb.
export function RevealBoundedPlateau({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 2.8));
  return (
    <Svg label="add a watermark and a time-range condition, and the growth stops." h={250}>
      <T x={25} y={24} s={11} f={C.latte}>
        rows held in state, per batch
      </T>
      <polyline points={GROW.map((h, i) => `${78 + i * 60},${180 - h}`).join(' ')} fill="none" stroke={C.mocha} strokeWidth={1.4} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <StateBars hs={PLATEAU} k={k} f={C.second} />
      <line x1={50} y1={115} x2={lerp(50, 545, easeOut(seg(t, 2.8, 3.4)))} y2={115} stroke={C.second} strokeWidth={1.4} strokeDasharray="6 4" opacity={t > 2.8 ? 1 : 0} />
      <T x={25} y={230} s={12} f={C.second} o={easeOut(seg(t, 3.5, 3.9))}>
        climbs a little, then holds steady
      </T>
    </Svg>
  );
}

// 9 · Recap. Left: the three modes, with a join allowed only append. Right: a state bar that climbs, then holds.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three modes decide what gets emitted; a watermark decides what gets kept." h={250}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        what it hands over
      </T>
      {['append', 'update', 'complete'].map((m, i) => (
        <Cell key={m} x={25} y={50 + i * 44} w={150} h={30} label={m} stroke={i === 0 ? C.second : C.mocha} o={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))} />
      ))}
      <T x={190} y={70} s={11} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        a join: this one
      </T>
      <T x={330} y={30} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>
        what it may keep
      </T>
      <polyline points={[0, 1, 2, 3, 4, 5].map((i) => `${330 + i * 45},${180 - Math.min(i, 2) * 40}`).join(' ')} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 2.5, 3.2))} />
      <T x={330} y={210} s={11} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        a watermark sets the bound
      </T>
    </Svg>
  );
}
