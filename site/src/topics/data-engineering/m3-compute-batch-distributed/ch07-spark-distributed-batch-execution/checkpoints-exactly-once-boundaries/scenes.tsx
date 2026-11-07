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

const WORDS = ['dog', 'cat', 'zebra'];

/** The pipeline strip: source, Spark with its checkpoint, sink; `boundary` draws the dashed line at Spark's edge. */
function Strip({ y = 40, sink = 'sink', sinkStroke = C.mocha, boundary = 0 }: { y?: number; sink?: string; sinkStroke?: string; boundary?: number }) {
  return (
    <g>
      <Cell x={25} y={y} w={110} h={34} label="source" />
      <Cell x={205} y={y} w={170} h={34} label="Spark + checkpoint" stroke={C.second} />
      <Cell x={440} y={y} w={130} h={34} label={sink} stroke={sinkStroke} />
      <line x1={135} y1={y + 17} x2={203} y2={y + 17} stroke={C.mocha} strokeWidth={1.4} />
      <line x1={375} y1={y + 17} x2={438} y2={y + 17} stroke={C.mocha} strokeWidth={1.4} />
      {boundary > 0 && <line x1={407} y1={y - 14} x2={407} y2={lerp(y - 14, y + 150, boundary)} stroke={C.focus} strokeWidth={1.8} strokeDasharray="6 4" />}
    </g>
  );
}

/** A batch token travelling along the strip from x0 to x1 at the strip's mid-line. */
function Token({ x, y = 57, f = C.second }: { x: number; y?: number; f?: string }) {
  return <rect x={x - 8} y={y - 7} width={16} height={14} rx={2} fill={f} />;
}

/** The sink's own output as log lines "batch, word" at (x, y); `ks[i]` fades line i in; `dup` marks a cherry line. */
function SinkLog({ x, y, lines, ks, dup = -1 }: { x: number; y: number; lines: [number, string][]; ks: number[]; dup?: number }) {
  return (
    <g>
      {lines.map(([b, w], i) => (
        <T key={i} x={x} y={y + i * 24} s={12} f={i === dup ? C.cherryText : C.crema} o={ks[i] ?? 0}>
          {`${b}, ${w}`}
        </T>
      ))}
    </g>
  );
}

// 0 · Hook. The strip draws in and a batch token travels it; halfway, a cherry crash bolt strikes the middle.
export function Hook({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.8, 2.0));
  const c = easeOut(seg(t, 2.0, 2.3));
  return (
    <Svg label="a stateful query computes the right answer once. This is what survives a crash." h={200}>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <Strip />
      </g>
      {m > 0 && c < 1 && <Token x={lerp(80, 400, m)} y={24} />}
      <path d="M392 90 l-14 26 h12 l-8 24 l22 -32 h-12 l10 -18 z" fill={C.bad} stroke={C.cherryText} strokeWidth={1.4} opacity={c} />
      <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        what is left standing after a crash?
      </T>
    </Svg>
  );
}

/** The offsets and commits logs for batches 0..2, entry heights small; `c2` is commit 2's state (0 none, 1 written). */
function Logs({ x, y, c2, gone = 0 }: { x: number; y: number; c2: number; gone?: number }) {
  return (
    <g>
      <T x={x} y={y} s={11} f={C.latte}>
        offsets/
      </T>
      <T x={x + 130} y={y} s={11} f={C.second}>
        commits/
      </T>
      {[0, 1, 2].map((j) => (
        <g key={j}>
          <rect x={x} y={y + 12 + j * 30} width={100} height={22} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
          <T x={x + 10} y={y + 27 + j * 30} s={11} f={C.crema}>
            {`${j}`}
          </T>
          {j < 2 ? (
            <g>
              <rect x={x + 130} y={y + 12 + j * 30} width={100} height={22} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} />
              <T x={x + 140} y={y + 27 + j * 30} s={11} f={C.crema}>
                {`${j}`}
              </T>
            </g>
          ) : (
            <g>
              {gone > 0 && c2 < 1 && <rect x={x + 130} y={y + 72} width={100} height={22} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={gone} />}
              {c2 > 0 && (
                <g opacity={c2}>
                  <rect x={x + 130} y={y + 72} width={100} height={22} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} />
                  <T x={x + 140} y={y + 87} s={11} f={C.crema}>
                    2
                  </T>
                </g>
              )}
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

// 1 · Restart, clean. Batch 2's work done, its commit entry missing (dashed cherry); restart replays batch 2 and its
// commit lands; the three words come out once each.
export function RevealRestartClean({ t }: StepCtx) {
  const rp = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="kill the batch mid-run, restart from checkpoint. Measured: no row lost or doubled." h={250}>
      <Logs x={25} y={24} c2={rp} gone={easeOut(seg(t, 0.4, 0.8))} />
      <T x={25} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 0.6, 1.0)) * (1 - rp)}>
        killed before the commit
      </T>
      <T x={300} y={150} s={11} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        restart: batch 2 replayed
      </T>
      {WORDS.map((w, i) => (
        <T key={w} x={330 + i * 80} y={64} s={13} f={C.crema} o={easeOut(seg(t, 2.4 + i * 0.2, 2.7 + i * 0.2))}>
          {w}
        </T>
      ))}
      <T x={330} y={100} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        each one exactly once
      </T>
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        nothing missing, nothing doubled
      </T>
    </Svg>
  );
}

// 2 · Predict. The sink box now reads "at least once"; its log holds three lines; batch 2's replay token heads for it.
export function PredictAtLeastOnceSink({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="an at-least-once sink, restarted the same way. Still exactly-once end to end?" h={230}>
      <Strip sink="at least once" />
      {m > 0 && m < 1 && <Token x={lerp(382, 430, m)} />}
      <SinkLog
        x={440}
        y={110}
        lines={[
          [0, 'dog'],
          [1, 'cat'],
          [2, 'zebra'],
        ]}
        ks={[1, 1, 1]}
      />
      <T x={25} y={130} s={15} f={C.focus} o={answer === null ? easeOut(seg(t, 1.6, 2.0)) : 0}>
        still exact?
      </T>
      <Verdict answer={answer} y={214} text="it writes batch 2 twice" />
    </Svg>
  );
}

// 3 · Duplicate. The replay lands: a fourth line, batch 2 again, in cherry; Spark's own side ticked as correct.
export function RevealDuplicateSurvives({ t }: StepCtx) {
  return (
    <Svg label="measured: no. One batch's row shows up twice in the sink's own output." h={230}>
      <Strip sink="at least once" />
      <MiniTick x={278} y={98} k={easeOut(seg(t, 0.3, 0.6))} f={C.second} />
      <T x={210} y={126} s={11} f={C.second} o={easeOut(seg(t, 0.5, 0.9))}>
        replay: right batch
      </T>
      <SinkLog
        x={440}
        y={110}
        lines={[
          [0, 'dog'],
          [1, 'cat'],
          [2, 'zebra'],
          [2, 'zebra'],
        ]}
        ks={[1, 1, 1, easeOut(seg(t, 1.2, 1.6))]}
        dup={3}
      />
      <T x={25} y={214} s={12} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        four lines from three batches
      </T>
    </Svg>
  );
}

// 4 · The boundary. A dashed line drops at Spark's edge; left of it "replay the right batch" ticks; right of it the
// sink's job, "survive a repeat", waits.
export function ElaborateSparkBoundary({ t }: StepCtx) {
  return (
    <Svg label="Spark's guarantee stops at its own boundary. The sink's replay is the sink's job." h={230}>
      <Strip boundary={easeOut(seg(t, 0.3, 1.0))} />
      <T x={210} y={130} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        Spark's job: replay
      </T>
      <T x={210} y={150} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        the right batch
      </T>
      <MiniTick x={210} y={172} k={easeOut(seg(t, 1.8, 2.2))} f={C.second} />
      <T x={420} y={130} s={11} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        the sink's job:
      </T>
      <T x={420} y={150} s={11} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        survive a repeat
      </T>
    </Svg>
  );
}

// 5 · Predict. The sink keeps a set of seen batch ids, 0 1 2; the replayed batch 2 token heads for it. Exact now?
export function PredictDedupByBatchId({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="the same sink, now deduplicating by batchId. Exactly-once this time?" h={230}>
      <Strip sink="checks batchId" sinkStroke={C.second} />
      {m > 0 && m < 1 && <Token x={lerp(382, 430, m)} />}
      <T x={440} y={112} s={11} f={C.latte}>
        seen: 0, 1, 2
      </T>
      <T x={25} y={130} s={15} f={C.focus} o={answer === null ? easeOut(seg(t, 1.6, 2.0)) : 0}>
        exact this time?
      </T>
      <Verdict answer={answer} y={214} text="yes: never written twice" />
    </Svg>
  );
}

// 6 · Zero duplicates. The replayed batch 2 meets the seen set: its write is crossed and skipped; three lines remain.
export function RevealZeroDuplicates({ t }: StepCtx) {
  return (
    <Svg label="measured: yes. Same crash, same restart -- zero duplicates this time." h={230}>
      <Strip sink="checks batchId" sinkStroke={C.second} />
      <T x={440} y={104} s={11} f={C.latte}>
        seen: 0, 1, 2
      </T>
      <Cross x={420} y={57} k={easeOut(seg(t, 0.5, 0.8))} />
      <SinkLog
        x={440}
        y={134}
        lines={[
          [0, 'dog'],
          [1, 'cat'],
          [2, 'zebra'],
        ]}
        ks={[1, 1, 1]}
      />
      <Row y={214} label="duplicates" value={t > 1.4 ? '0' : '…'} valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
    </Svg>
  );
}

// 7 · Same number. First run: batch zebra gets id 2. Replay: the same id 2 again, an equals between them; a fresh id
// 3 is crossed out.
export function ElaborateBatchIdDeterministic({ t }: StepCtx) {
  return (
    <Svg label="the same batch gets the same id on every replay -- exactly what dedup needs." h={220}>
      <T x={25} y={40} s={11} f={C.latte}>
        first run
      </T>
      <Cell x={25} y={52} w={140} h={32} label="batch 2: zebra" o={easeOut(seg(t, 0.2, 0.6))} />
      <T x={330} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        replay
      </T>
      <Cell x={330} y={52} w={140} h={32} label="batch 2: zebra" stroke={C.second} o={easeOut(seg(t, 1.0, 1.4))} />
      <T x={248} y={74} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        =
      </T>
      <Cell x={330} y={110} w={140} h={32} label="batch 3: zebra" o={easeOut(seg(t, 2.2, 2.5)) * 0.6} />
      <Cross x={490} y={126} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        never a fresh number: what a check needs
      </T>
    </Svg>
  );
}

// 8 · Incompatible. The checkpoint's state is keyed by word; the restarted query groups by word and category; the new
// key shape does not fit the saved slot and the restart is crossed before any row.
export function RevealIncompatibleChange({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="swap the grouping keys, restart from the same checkpoint -- it fails before a row moves." h={250}>
      <T x={25} y={30} s={11} f={C.second}>
        saved state, keyed by
      </T>
      <rect x={25} y={42} width={120} height={34} rx={4} fill="none" stroke={C.second} strokeWidth={1.8} />
      <T x={85} y={64} s={12} f={C.crema} a="middle">
        word
      </T>
      <T x={330} y={30} s={11} f={C.latte}>
        the restarted query
      </T>
      <rect x={lerp(330, 25, m)} y={lerp(42, 100, m)} width={230} height={34} rx={4} fill={C.cocoa} stroke={m > 0.95 ? C.cherryText : C.latte} strokeWidth={1.6} />
      <T x={lerp(445, 140, m)} y={lerp(64, 122, m)} s={12} f={C.crema} a="middle">
        word, category
      </T>
      <Cross x={275} y={117} k={easeOut(seg(t, 2.0, 2.3))} />
      <T x={25} y={180} s={13} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        refused, before one new row
      </T>
      <T x={25} y={225} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        the saved state no longer fits the question
      </T>
    </Svg>
  );
}

// 9 · Recap. The strip with its boundary: Spark's side ticked for replay; past the line, the sink must survive repeats,
// and the checkpoint must still match the query.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Spark's guarantee has a boundary. What's past it is the source's and sink's job." h={250}>
      <Strip boundary={easeOut(seg(t, 0.4, 1.0))} />
      <T x={25} y={130} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        replayed correctly: Spark's promise
      </T>
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.6))}>
        handed it twice: the sink's to survive
      </T>
      <T x={25} y={210} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        saved state must still match the query
      </T>
    </Svg>
  );
}
