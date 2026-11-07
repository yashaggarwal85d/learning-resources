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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A progress track from x 25, `w` wide at y, filled to fraction `p`. */
function Track({ y, p, w = 500, f = C.latte, h = 14 }: { y: number; p: number; w?: number; f?: string; h?: number }) {
  return (
    <g>
      <rect x={25} y={y} width={w} height={h} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <rect x={25} y={y} width={w * clamp(p, 0, 1)} height={h} rx={3} fill={f} />
    </g>
  );
}

// 0 · Hook. The snapshot bar fills most of the way; a kill crosses it; on restart it snaps to empty and creeps again,
// while the retained-WAL bar under it climbs the whole time.
export function Hook({ t }: StepCtx) {
  const first = 0.85 * easeOut(seg(t, 0.3, 2.0));
  const kill = easeOut(seg(t, 2.0, 2.3));
  const again = 0.2 * seg(t, 2.7, 4.6);
  const p = t < 2.5 ? first : again;
  const wal = easeInOut(seg(t, 0.3, 4.4));
  return (
    <Svg label="a connector is killed most of the way through snapshotting a huge table; on restart the progress bar snaps back to empty while the retained-WAL bar keeps climbing." h={220}>
      <T x={25} y={40} s={11} f={C.latte}>
        snapshot progress
      </T>
      <Track y={48} p={p} f={t < 2.5 ? C.latte : C.focus} />
      {t >= 2.0 && t < 2.5 && <Cross x={25 + 500 * 0.85 + 14} y={55} k={kill} />}
      {t >= 2.5 && (
        <T x={25} y={90} s={11} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))}>
          restart: back to empty
        </T>
      )}
      <T x={25} y={130} s={11} f={C.latte}>
        retained WAL
      </T>
      <Track y={138} p={wal} f={C.cherryText} />
      {t >= 3.4 && (
        <T x={25} y={190} s={13} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
          and the log keeps growing the whole time
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The bar killed at most of the way, with two candidate restart points marked. Once answered, the bar
// drains to zero: it starts from the first row.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="on restart, does the snapshot pick up close to where it was killed, or does it begin again from the very first row?" h={200}>
      <Track y={50} p={0.85 * easeOut(seg(t, 0, 0.6)) * (1 - v)} />
      <Cross x={464} y={57} k={easeOut(seg(t, 0.6, 0.9)) * (1 - v)} />
      <path d="M450 70 l-6 9 h12 z" fill={C.latte} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={450} y={96} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        resume here?
      </T>
      <path d="M32 70 l-6 9 h12 z" fill={v > 0 ? C.focus : C.latte} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={96} s={11} f={v > 0 ? C.focus : C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        from row 1?
      </T>
      <AnswerRow y={178} label="on restart" answer={answer} value="from the first row" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Completion only at the end. Three workflow steps; the scan's bar runs and a kill crosses it; the final step stays
// an empty cherry slot, and the durable record holds nothing.
export function RevealCompletionRecordedOnlyAtEnd({ t }: StepCtx) {
  const sc = easeInOut(seg(t, 0.9, 2.0)) * 0.7;
  const kill = easeOut(seg(t, 2.0, 2.3));
  return (
    <Svg label="a snapshot's own completion is written only at its very last step; a kill before that step leaves nothing recorded at all." h={200}>
      <Cell x={25} y={40} w={150} label="read log position" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={180} x2={195} y={54} k={easeOut(seg(t, 0.5, 0.7))} />
      <Cell x={200} y={40} w={150} label="scan every row" o={easeOut(seg(t, 0.6, 0.9))} />
      <rect x={200} y={76} width={150 * sc} height={8} fill={C.latte} />
      <Cross x={200 + 150 * 0.7 + 12} y={80} k={kill} />
      <Req x1={355} x2={370} y={54} k={easeOut(seg(t, 0.8, 1.0))} />
      {kill > 0 ? <Hole x={375} y={40} w={175} stroke={C.cherryText} o={kill} /> : <Cell x={375} y={40} w={175} label="mark finished" o={easeOut(seg(t, 0.8, 1.1))} />}
      {t >= 2.5 && (
        <T x={25} y={130} s={13} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.9))}>
          durable record: nothing at all
        </T>
      )}
      {t >= 3.3 && (
        <T x={25} y={170} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
          a restart has no partial state to find
        </T>
      )}
    </Svg>
  );
}

// 3 · Exported snapshot, measured. Creating the slot exports a snapshot; row 9001 lands right after; a second session
// imports the snapshot and counts: 200 rows, and none of them 9001.
export function RevealExportedSnapshotMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a slot's own exported snapshot is read in a second session, while a row written right after the slot is checked against it." h={220}>
      <Cell x={25} y={24} w={150} label="create slot" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={180} x2={198} y={38} k={easeOut(seg(t, 0.4, 0.6))} />
      <Cell x={200} y={24} w={165} label="exports snapshot" o={easeOut(seg(t, 0.5, 0.8))} stroke={C.focus} />
      <Cell x={380} y={24} w={170} label="row 9001 written" o={easeOut(seg(t, 1.1, 1.4))} stroke={C.second} />
      <Cell x={25} y={80} w={220} label="session 2 imports it" o={easeOut(seg(t, 1.8, 2.1))} />
      <Row y={150} label="rows it sees" value={num(200 * easeOut(seg(t, 2.3, 3.0)))} valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.5))} />
      <Row y={195} label="sees row 9001" value="0" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.5))} />
    </Svg>
  );
}

// 4 · One seam. A single instant on the log; the snapshot's band grows left from it and the stream's band grows right
// from it, meeting exactly: nothing skipped, nothing repeated.
export function RevealNoGapNoOverlap({ t }: StepCtx) {
  const P = 290;
  const l = easeOut(seg(t, 0.8, 1.6));
  const r = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="the snapshot position and the stream's own start position are the same point in the log, by construction, not by coincidence." h={200}>
      <line x1={25} y1={110} x2={545} y2={110} stroke={C.mocha} strokeWidth={1.4} />
      <line x1={P} y1={50} x2={P} y2={lerp(50, 125, easeOut(seg(t, 0.1, 0.6)))} stroke={C.focus} strokeWidth={2.5} />
      <T x={P} y={40} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        slot start = snapshot instant
      </T>
      <rect x={P - 265 * l} y={86} width={265 * l} height={16} fill={C.latte} />
      <rect x={P} y={86} width={255 * r} height={16} fill={C.second} />
      <T x={157} y={76} s={11} f={C.latte} a="middle" o={l}>
        the snapshot sees
      </T>
      <T x={417} y={76} s={11} f={C.second} a="middle" o={r}>
        the stream picks up
      </T>
      {t >= 3.0 && (
        <T x={300} y={165} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          nothing skipped, nothing repeated
        </T>
      )}
    </Svg>
  );
}

// 5 · Overlap, measured. The dump's 150 rows fill a grid; the two rows written during the read sit as empty slots
// beside it. In the decoded stream they appear, each exactly once.
export function RevealOverlapMeasured({ t }: StepCtx) {
  const n = 150 * easeInOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="the real run: a row written during the snapshot is missing from the dump and shows up in the decoded stream exactly once." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        snapshot dump: 150 rows
      </T>
      {Array.from({ length: 150 }, (_, i) => (
        <rect key={i} x={25 + (i % 30) * 10} y={32 + Math.floor(i / 30) * 10} width={8} height={8} fill={C.latte} opacity={clamp(n - i, 0, 1)} />
      ))}
      {['9101', '9102'].map((id, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.5 + i * 0.2, 1.8 + i * 0.2))}>
          <Hole x={345 + i * 100} y={36} w={90} stroke={C.cherryText} />
          <T x={390 + i * 100} y={55} s={12} f={C.latte} a="middle">
            {id}
          </T>
        </g>
      ))}
      {t >= 2.0 && (
        <T x={345} y={88} s={11} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.3))}>
          not in the dump
        </T>
      )}
      <T x={345} y={132} s={11} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        decoded stream
      </T>
      {['9101', '9102'].map((id, i) => (
        <Cell key={i} x={345 + i * 100} y={140} w={90} label={id} o={easeOut(seg(t, 2.7 + i * 0.3, 3.0 + i * 0.3))} stroke={C.focus} />
      ))}
      {t >= 3.6 && (
        <T x={345} y={192} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
          each exactly once
        </T>
      )}
    </Svg>
  );
}

// 6 · The kill lab. The source is 300 rows; the loop copies into the target bar row by row and is killed at 120; the
// completion marker's slot stays empty.
export function RevealKillMidSnapshotLab({ t }: StepCtx) {
  const c = (120 / 300) * easeInOut(seg(t, 0.4, 2.3));
  const kill = t >= 2.4;
  return (
    <Svg label="a hand-written snapshot loop, killed on purpose partway through copying rows, leaves a target table that is only partly filled." h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        source: 300 rows
      </T>
      <Track y={32} p={easeOut(seg(t, 0, 0.4))} />
      <T x={25} y={74} s={11} f={C.latte}>
        target
      </T>
      <Track y={82} p={c} f={kill ? C.cherryText : C.focus} />
      <Cross x={25 + 200 + 14} y={89} k={easeOut(seg(t, 2.4, 2.7))} />
      {kill && (
        <T x={25} y={124} s={11} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))}>
          120 rows, then killed
        </T>
      )}
      <Hole x={360} y={140} w={190} o={easeOut(seg(t, 3.0, 3.3))} stroke={C.cherryText} />
      {t >= 3.0 && (
        <T x={455} y={159} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
          no completion marker
        </T>
      )}
    </Svg>
  );
}

// 7 · Restart, measured. Attempt one is killed at row 90 and its partial rows are discarded; attempt two copies all
// 250 from row 1 while the stream adds 9201 and 9202; the diff against the source comes back clean.
export function RevealRestartMeasured({ t }: StepCtx) {
  const a1 = (90 / 250) * easeInOut(seg(t, 0.2, 1.0));
  const kill = easeOut(seg(t, 1.0, 1.2));
  const drop = easeOut(seg(t, 1.3, 1.7));
  const a2 = easeInOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="the real run: the killed attempt's partial rows are discarded, a fresh attempt restarts from the first row, and the final target is diffed row for row against the source." h={240}>
      <T x={25} y={22} s={11} f={C.latte}>
        attempt 1: killed at row 90
      </T>
      {drop < 1 && <Track y={30} p={a1} f={kill > 0 ? C.cherryText : C.latte} />}
      <Cross x={25 + 180 + 14} y={37} k={kill * (1 - drop)} />
      {drop > 0 && <Hole x={25} y={30} w={180} h={14} o={drop} stroke={C.cherryText} />}
      {drop > 0 && (
        <T x={215} y={42} s={11} f={C.cherryText} o={drop}>
          discarded
        </T>
      )}
      <T x={25} y={82} s={11} f={C.latte} o={easeOut(seg(t, 1.7, 2.0))}>
        attempt 2: from row 1, all 250
      </T>
      {t >= 1.7 && <Track y={90} p={a2} f={C.focus} />}
      <Cell x={25} y={120} w={90} label="9201" o={easeOut(seg(t, 2.6, 2.9))} stroke={C.second} />
      <Cell x={125} y={120} w={90} label="9202" o={easeOut(seg(t, 2.8, 3.1))} stroke={C.second} />
      <T x={230} y={139} s={11} f={C.second} o={easeOut(seg(t, 2.8, 3.1))}>
        from the stream
      </T>
      <MiniTick x={25} y={184} k={easeOut(seg(t, 3.4, 3.8))} />
      {t >= 3.4 && (
        <T x={45} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
          diff vs source: no gap, no overlap
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Three causes, each with an arrow to its effect; then the cost of the one design choice: a short bar for a
// small table, a long cherry one for a huge table.
export function Recap({ t }: StepCtx) {
  const qs = ['a kill before the end', 'snapshot and stream', 'the snapshot mode'];
  const as = ['the whole thing restarts', 'share one seam', 'sets what a restart does'];
  const c = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="a crash before the last step restarts the whole snapshot; the exported snapshot and the stream share one seam; several modes decide what a restart does." h={260}>
      {qs.map((q, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 48} w={200} label={q} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
          <Req x1={230} x2={308} y={34 + i * 48} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
          <Cell x={315} y={20 + i * 48} w={240} label={as[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={C.focus} />
        </g>
      ))}
      <T x={25} y={190} s={11} f={C.latte} o={c}>
        small table
      </T>
      <rect x={130} y={181} width={40 * c} height={10} fill={C.latte} />
      <T x={25} y={220} s={11} f={C.latte} o={c}>
        huge table
      </T>
      <rect x={130} y={211} width={410 * c} height={10} fill={C.cherryText} />
    </Svg>
  );
}

// 9 · Prove it. The slot's start point on the log; the rows this connector needs all sit to its right. Two modes wait
// below; once answered, initial_only is crossed and no_data lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg
      label="a brand-new connector, one just restarted, and one recovering from a gap each want a different snapshot mode. Which fits a connector that only ever needs fresh rows, never the old ones?"
      h={200}
    >
      <line x1={25} y1={70} x2={545} y2={70} stroke={C.mocha} strokeWidth={1.4} />
      <path d="M200 72 l-6 9 h12 z" fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={200} y={98} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        slot start
      </T>
      <rect x={200} y={52} width={345 * easeOut(seg(t, 0.5, 1.2))} height={12} fill={C.second} />
      <T x={372} y={42} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        the only rows it needs
      </T>
      <Cell x={25} y={112} w={150} label="initial_only" o={easeOut(seg(t, 1.0, 1.3)) * (1 - 0.5 * v)} />
      <Cross x={163} y={126} k={v} />
      <Cell x={215} y={112} w={150} label="no_data" o={easeOut(seg(t, 1.1, 1.4))} stroke={v > 0 ? C.focus : C.mocha} />
      <AnswerRow y={182} label="the mode" answer={answer} value="no_data" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
