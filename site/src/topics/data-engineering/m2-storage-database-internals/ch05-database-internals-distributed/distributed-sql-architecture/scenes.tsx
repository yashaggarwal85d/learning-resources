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
/** One transaction's timeline: its name on the left and a thin line running right; events sit on it as cells. */
function Lane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={60} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
}

/** A labelled round-trip arc from x to x + 50 on a baseline at y, drawn in by `k`. */
function Arc({ x, y, k, f, label, lo }: { x: number; y: number; k: number; f: string; label: string; lo: number }) {
  return (
    <g>
      <path d={`M${x} ${y} Q${x + 25} ${y - 38} ${x + 50} ${y}`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="90" strokeDashoffset={90 * (1 - k)} />
      <T x={x + 25} y={y + 22} s={11} f={C.latte} a="middle" o={lo}>
        {label}
      </T>
    </g>
  );
}

// 1 · Hook. The chapter's three mechanisms, each on its own, slide together into one system that runs them on every write.
export function Hook({ t }: StepCtx) {
  const m = easeInOut(seg(t, 2.2, 3.0));
  const chips = ['range sharding', 'per-range consensus', 'two-phase commit'];
  return (
    <Svg label="three mechanisms, already built. One system runs them together." h={230}>
      {chips.map((c, i) => (
        <Cell key={c} x={25 + i * 190} y={lerp(50, 126, m)} w={170} label={c} stroke={C.second} o={easeOut(seg(t, 0.3 + i * 0.5, 0.6 + i * 0.5))} />
      ))}
      <rect x={15} y={116} width={570} height={48} rx={6} fill="none" stroke={C.focus} strokeWidth={2} opacity={m} />
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        one real system, all three, every write
      </T>
    </Svg>
  );
}

// 2 · Predict. Three known pieces and a dashed fourth marked "something new?"; after the answer the fourth is crossed.
export function PredictNewMechanism({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const chips = ['sharding', 'consensus', '2PC'];
  return (
    <Svg label="a new mechanism, or pieces already covered?" h={200}>
      {chips.map((c, i) => (
        <Cell key={c} x={25 + i * 140} y={60} w={130} label={c} stroke={C.second} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} />
      ))}
      <rect x={445} y={60} width={130} height={28} rx={4} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={510} y={79} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        something new?
      </T>
      <Cross x={510} y={106} k={a} />
      <AnswerRow y={140} label="a new mechanism?" answer={answer} value="no, a composition" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the same three pieces, chained" />
    </Svg>
  );
}

// 3 · The composition. Range A's group commits its piece, then range B's; a two-phase commit beneath links both.
export function RevealComposition({ t }: StepCtx) {
  const box = (x: number, l: string, a: number) => (
    <g opacity={easeOut(seg(t, 0.1, 0.4))}>
      <rect x={x} y={40} width={240} height={74} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={x + 10} y={58} s={11} f={C.latte}>
        {l}
      </T>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 60 + i * 60} cy={88} r={12} fill={C.cocoa} stroke={C.second} strokeWidth={2} />
      ))}
      <MiniTick x={x + 212} y={60} k={easeOut(seg(t, a, a + 0.3))} />
    </g>
  );
  const c = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="two ranges, each committing on its own, then agreeing." h={240}>
      {box(25, "range A's own group", 0.9)}
      {box(335, "range B's own group", 1.5)}
      <Cell x={210} y={150} w={180} label="two-phase commit" stroke={C.focus} o={easeOut(seg(t, 2.1, 2.4))} />
      <path d="M145 114 L230 150 M455 114 L370 150" stroke={C.focus} strokeWidth={1.5} opacity={c} />
      <MiniTick x={400} y={160} k={easeOut(seg(t, 3.0, 3.3))} />
      <Row y={215} label="new mechanisms" value="none" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 4 · HLC. The physical readings 100, 101, 99, 99, 103, 102 dip backward twice; the HLC's timestamps beneath only climb.
export function RevealHLC({ t }: StepCtx) {
  const r = [100, 101, 99, 99, 103, 102];
  const ts = ['(100, 0)', '(101, 0)', '(101, 1)', '(101, 2)', '(103, 0)', '(103, 1)'];
  const y = (v: number) => 126 - (v - 99) * 12;
  return (
    <Svg label="real clock skew, twice. Timestamps still only go up." h={250}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        physical readings
      </T>
      {r.map((v, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4));
        const back = i > 0 && v < r[i - 1];
        return (
          <g key={i}>
            {i > 0 && (
              <line x1={80 + (i - 1) * 90} y1={y(r[i - 1])} x2={lerp(80 + (i - 1) * 90, 80 + i * 90, k)} y2={lerp(y(r[i - 1]), y(v), k)} stroke={back ? C.cherryText : C.latte} strokeWidth={2} />
            )}
            <circle cx={80 + i * 90} cy={y(v)} r={5} fill={back ? C.cherryText : C.latte} opacity={k} />
            <T x={80 + i * 90 + 10} y={y(v) - 8} s={11} f={back ? C.cherryText : C.latte} o={k}>
              {`${v}`}
            </T>
            <T x={80 + i * 90} y={180} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6 + i * 0.4, 0.9 + i * 0.4))}>
              {ts[i]}
            </T>
          </g>
        );
      })}
      <T x={25} y={158} s={12} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        HLC timestamps
      </T>
      <path d={`M50 198 H${50 + 500 * easeOut(seg(t, 3.0, 3.6))}`} stroke={C.focus} strokeWidth={2} />
      <path d="M545 192 l8 6 l-8 6" fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.5, 3.7))} />
      <T x={300} y={232} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        strictly increasing, every time
      </T>
    </Svg>
  );
}

// 5 · Commit wait. T1 takes timestamp 100, waits out a 10-unit window, becomes visible at 110; T2 starts there and gets 111.
export function RevealCommitWait({ t }: StepCtx) {
  const x = (v: number) => 25 + (v - 95) * 25;
  const w = easeInOut(seg(t, 1.0, 2.4));
  return (
    <Svg label="a commit waits out its own uncertainty." h={240}>
      <line x1={25} y1={110} x2={575} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={x(100)} cy={110} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={x(100)} y={90} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        T1: 100
      </T>
      <rect x={x(100)} y={104} width={(x(110) - x(100)) * w} height={12} rx={3} fill={C.second} opacity={0.85} />
      <T x={(x(100) + x(110)) / 2} y={140} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        commit wait: a window of 10
      </T>
      <T x={x(110)} y={90} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>
        visible at 110
      </T>
      <circle cx={x(111)} cy={110} r={6} fill={C.second} opacity={easeOut(seg(t, 3.0, 3.3))} />
      <T x={x(111)} y={172} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        T2 starts: 111
      </T>
      <Row y={215} label="earlier commit" value="smaller timestamp, always" valueColor={C.focus} k={easeOut(seg(t, 3.8, 4.3))} />
    </Svg>
  );
}

// 6 · Predict #2. Two transactions read the same row at version 0, no lock on either side; the answer: only at commit.
export function PredictOCCTiming({ t, answer }: StepCtx) {
  return (
    <Svg label="two transactions, same row, no locks. When?" h={200}>
      <Row y={40} label="locks taken" value="none" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={64} w={250} h={28} label="T1 reads version 0" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={325} y={64} w={250} h={28} label="T2 reads version 0" o={easeOut(seg(t, 0.7, 1.0))} />
      <AnswerRow y={140} label="the conflict is noticed" answer={answer} value="only at commit" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="after all the work is done" />
    </Svg>
  );
}

// 7 · OCC, measured. Both read version 0 and work; T1 commits first; T2's commit comes back OC000, crossed.
export function RevealOCCMeasured({ t }: StepCtx) {
  return (
    <Svg label="both read, unlocked. First commits; second rejected." h={240}>
      <Lane y={60} name="T1" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={125} name="T2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={60} w={100} label="read v0" o={easeOut(seg(t, 0.3, 0.6))} />
      <Ev x={70} y={125} w={100} label="read v0" o={easeOut(seg(t, 0.5, 0.8))} />
      <Ev x={185} y={60} w={80} label="work" o={easeOut(seg(t, 0.9, 1.2))} />
      <Ev x={185} y={125} w={80} label="work" o={easeOut(seg(t, 1.0, 1.3))} />
      <Ev x={280} y={60} w={100} label="commit" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.6, 1.9))} />
      <MiniTick x={390} y={60} k={easeOut(seg(t, 1.9, 2.2))} />
      <Ev x={400} y={125} w={150} label="commit: OC000" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.5, 2.8))} />
      <Cross x={562} y={125} k={easeOut(seg(t, 2.8, 3.1))} />
      <Row y={200} label="the loser finds out" value="at its own commit" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · The latency price. One Postgres node: no extra round trip. Across two ranges: four arcs, two consensus and two 2PC.
export function RevealLatencyPrice({ t }: StepCtx) {
  const labels = ['consensus A', 'consensus B', 'prepare', 'commit'];
  return (
    <Svg label="single-node: no extra trip. Spread across ranges: several." h={230}>
      <Row y={40} label="one Postgres node" value="0 extra round trips" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="across 2 ranges" value="4 extra round trips" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      {labels.map((l, i) => (
        <Arc key={l} x={60 + i * 135} y={160} k={easeOut(seg(t, 2.2 + i * 0.4, 2.6 + i * 0.4))} f={C.cherryText} label={l} lo={easeOut(seg(t, 2.4 + i * 0.4, 2.7 + i * 0.4))} />
      ))}
    </Svg>
  );
}

// 9 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a composition, with a real, measured price." h={260}>
      <Row y={40} label="the pattern" value="three pieces, composed" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="HLC" value="never goes backward" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={140} label="commit wait" value="real-time order" valueColor={C.second} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={190} label="optimistic" value="checks at commit" k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={240} label="none of it" value="free" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 10 · Prove. Distributed SQL and one Postgres side by side; after the answer the distributed cell is crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="data fits on one machine. Distributed SQL, or Postgres?" h={220}>
      <Row y={40} label="fits on one machine" value="one table" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the right choice" answer={answer} value="plain Postgres" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="distributed SQL" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={255} y={132} k={a} />
      <Cell x={325} y={118} w={250} h={28} label="one Postgres" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            nothing to coordinate, nothing to pay
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
