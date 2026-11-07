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

// 1 · Hook. A sealed Parquet file, padlocked; beside it an object store fills with objects; the question of what a table
// even is hangs over it.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a table needs atomic commits, but the storage underneath has no file you can edit in place." h={220}>
      <Cell x={25} y={70} w={170} label="one Parquet file" o={easeOut(seg(t, 0.2, 0.5))} />
      <Lock x={202} y={78} k={easeOut(seg(t, 0.7, 1.0))} />
      <rect x={260} y={45} width={315} height={110} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={270} y={62} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        object store
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={275 + (i % 6) * 49}
          y={74 + Math.floor(i / 6) * 34}
          width={40}
          height={24}
          rx={3}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 1.5 + i * 0.06, 1.8 + i * 0.06))}
        />
      ))}
      <T x={417} y={36} s={18} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        a table?
      </T>
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.1, 3.5))}>
        no file to edit in place, only whole objects
      </T>
    </Svg>
  );
}

// 2 · Predict. A writer's PUT reaches S3; a reader's GET follows at once; the answer: the new object.
export function PredictConsistency({ t, answer }: StepCtx) {
  return (
    <Svg label="write an object to S3, then read it back immediately — does the read see it?" h={200}>
      <Cell x={25} y={60} w={110} label="writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={235} y={45} width={130} height={58} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={300} y={79} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        S3
      </T>
      <Req x1={135} x2={233} y={74} k={easeOut(seg(t, 0.4, 0.9))} label="PUT" />
      <Cell x={465} y={60} w={110} label="reader" o={easeOut(seg(t, 0.9, 1.2))} />
      <Req x1={463} x2={367} y={74} k={easeOut(seg(t, 1.0, 1.4))} label="GET, at once" f={C.second} />
      <AnswerRow y={150} label="the read sees" answer={answer} value="the new object" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} y={190} text="strongly consistent since December 2020" />
    </Svg>
  );
}

// 3 · Consistency. A timeline split at December 2020: before, a write then a read returns the old or nothing; after, a
// write then a read returns the new object.
export function RevealConsistency({ t }: StepCtx) {
  return (
    <Svg label="strong read-after-write consistency, since December 2020 — no wait, no stale read, ever." h={225}>
      <line x1={25} y1={100} x2={lerp(25, 575, easeInOut(seg(t, 0.2, 1.0)))} y2={100} stroke={C.mocha} strokeWidth={2} />
      <line x1={300} y1={84} x2={300} y2={116} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={300} y={135} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        December 2020
      </T>
      <T x={25} y={45} s={12} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))}>
        before: eventually consistent
      </T>
      {[60, 170].map((x, i) => (
        <circle key={x} cx={x} cy={100} r={6} fill={i === 0 ? C.crema : C.second} opacity={easeOut(seg(t, 1.2 + i * 0.3, 1.4 + i * 0.3))} />
      ))}
      <T x={25} y={75} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        write, then read
      </T>
      <Cell x={100} y={150} w={150} h={26} label="old, or nothing" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.9, 2.3))} />
      <T x={325} y={45} s={12} f={C.focus} o={easeOut(seg(t, 2.5, 2.8))}>
        since: strongly consistent
      </T>
      {[360, 470].map((x, i) => (
        <circle key={x} cx={x} cy={100} r={6} fill={i === 0 ? C.crema : C.second} opacity={easeOut(seg(t, 2.7 + i * 0.3, 2.9 + i * 0.3))} />
      ))}
      <Cell x={400} y={150} w={150} h={26} label="new, every time" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))} />
      <T x={300} y={212} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        no stale window at all
      </T>
    </Svg>
  );
}

// 4 · No atomic rename. The two requests of a "rename"; the copy runs and the renamed key appears; a crash lands before
// the delete; both keys sit in the bucket at once.
export function RevealNoAtomicRename({ t }: StepCtx) {
  const cp = easeOut(seg(t, 1.0, 1.5));
  const cr = easeOut(seg(t, 2.2, 2.6));
  return (
    <Svg label="a real local S3 server: copy, then stop before the delete — both objects exist at once." h={230}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a rename is two requests
      </T>
      <Cell x={25} y={52} w={120} label="1 · copy" stroke={cp > 0 ? C.focus : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <g opacity={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.5 * cr)}>
        <rect x={155} y={52} width={120} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={215} y={70.5} s={12} f={C.latte} a="middle">
          2 · delete
        </T>
      </g>
      <Cross x={290} y={66} k={cr} />
      <T x={310} y={71} s={12} f={C.cherryText} o={cr}>
        crash, before the delete
      </T>
      <rect x={25} y={95} width={550} height={90} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={40} y={106} w={360} label="table/data/part-00000.parquet" stroke={cr > 0 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={40} y={144} w={360} label="table/data/part-00000-renamed.parquet" stroke={cr > 0 ? C.cherryText : C.focus} o={cp} />
      <T x={300} y={215} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        both exist at once, a real reachable state
      </T>
    </Svg>
  );
}

// 5 · Predict. Writers A and B both fire at the same key, no lock service between them; the answer: exactly one wins.
export function PredictRace({ t, answer }: StepCtx) {
  return (
    <Svg label="two writers race to create the same key at once — can they both succeed?" h={200}>
      <Cell x={25} y={40} w={110} label="writer A" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={84} w={110} label="writer B" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={360} y={62} w={215} label="commit-001" o={easeOut(seg(t, 0.3, 0.6))} />
      <Req x1={135} x2={358} y={54} k={easeOut(seg(t, 0.6, 1.1))} />
      <Req x1={135} x2={358} y={98} k={easeOut(seg(t, 0.65, 1.15))} />
      <AnswerRow y={150} label="both win?" answer={answer} value="no, exactly one" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} y={190} text="the store itself picks the winner" />
    </Svg>
  );
}

// 6 · Conditional create. Writer A's create with If-None-Match lands and is ticked; writer B's identical create arrives,
// bounces back, and its 412 lands.
export function RevealConditionalCreate({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.8, 2.4));
  const bb = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="a real If-None-Match request, twice, against a real local server — the second one really fails." h={225}>
      <Cell x={25} y={50} w={110} label="writer A" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={135} x2={328} y={64} k={easeOut(seg(t, 0.4, 1.0))} label="If-None-Match: *" />
      <Cell x={330} y={50} w={245} label="commit-001" stroke={easeOut(seg(t, 1.0, 1.3)) > 0 ? C.focus : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={545} y={92} k={easeOut(seg(t, 1.1, 1.4))} />
      <Cell x={25} y={120} w={110} label="writer B" o={easeOut(seg(t, 1.5, 1.8))} />
      <Req x1={135} x2={328} y={134} k={b} label="If-None-Match: *" f={bb > 0 ? C.cherryText : C.crema} back={bb} />
      <T x={330} y={139} s={13} f={C.cherryText} o={easeOut(seg(t, 2.7, 3.1))}>
        412 PreconditionFailed
      </T>
      <T x={300} y={205} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        commit-001 holds writer A's version
      </T>
    </Svg>
  );
}

// 7 · Conditional update. The counter at 0 with ETag v0; an update carrying v0 commits and the counter moves to 1 with a
// new ETag; a second update still carrying v0 bounces with a 412.
export function RevealConditionalUpdate({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.5, 1.1));
  const s1 = easeOut(seg(t, 1.1, 1.5));
  const r2 = easeOut(seg(t, 2.0, 2.6));
  const bb = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="If-Match is the same primitive for updates — a real compare-and-swap on the ETag." h={225}>
      <Cell x={330} y={40} w={245} label="counter 0 · etag v0" o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.6 * s1)} />
      <Cell x={330} y={80} w={245} label="counter 1 · etag v1" stroke={C.focus} o={s1} />
      <Cell x={25} y={60} w={200} label="set 1, If-Match v0" o={easeOut(seg(t, 0.3, 0.6))} />
      <Req x1={225} x2={328} y={74} k={r1} f={C.focus} />
      <Cell x={25} y={130} w={200} label="set 2, If-Match v0" o={easeOut(seg(t, 1.8, 2.1))} />
      <Req x1={225} x2={328} y={144} k={r2} f={bb > 0 ? C.cherryText : C.crema} back={bb} />
      <T x={330} y={149} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.3))}>
        412: that etag is stale
      </T>
      <T x={300} y={205} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        a compare-and-swap on the ETag
      </T>
    </Svg>
  );
}

// 8 · LIST cost. Two hundred fifty object pips; each round trip lights one page of fifty as the count of trips runs to
// five; then the per-prefix ceiling.
export function RevealListCost({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.6, 3.0)) * 5;
  const trips = Math.min(5, Math.ceil(p - 0.001));
  return (
    <Svg label="a real paginated LIST of 250 objects takes 5 separate round trips, not 1." h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        250 objects, 50 per page
      </T>
      {Array.from({ length: 250 }, (_, i) => {
        const page = Math.floor(i / 50);
        const on = p > page;
        return (
          <rect key={i} x={25 + (i % 25) * 22} y={52 + Math.floor(i / 25) * 9} width={18} height={6} rx={1} fill={on ? C.focus : C.mocha} opacity={easeOut(seg(t, 0.1, 0.4)) * (on ? 0.85 : 0.7)} />
        );
      })}
      <Row y={175} label="LIST round trips" value={`${Math.max(trips, 0)} of 5`} valueColor={C.focus} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={215} s={13} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))}>
        and every prefix has its own request ceiling
      </T>
    </Svg>
  );
}

// 9 · What this buys. Left, with no header: A's version lands, then B's quietly replaces it and A's is lost with no error.
// Right, with a conditional header: A's version lands and B's is rejected.
export function RevealWhatThisBuys({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 0.8));
  const mv = easeInOut(seg(t, 1.2, 1.7));
  const b = easeOut(seg(t, 1.7, 2.1));
  const rb = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="conditional writes turn 'whoever writes last wins' into 'exactly one commit survives.'" h={230}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        no conditional header
      </T>
      <Cell x={25} y={lerp(54, 96, mv)} w={250} label="A's version" o={a * (1 - 0.6 * mv)} stroke={mv > 0 ? C.cherryText : C.mocha} />
      <Cross x={260} y={lerp(68, 110, mv)} k={easeOut(seg(t, 1.7, 2.0))} />
      <Cell x={25} y={54} w={250} label="B's version" o={b} />
      <T x={25} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.5))}>
        last write wins, silently
      </T>
      <T x={325} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        If-None-Match or If-Match
      </T>
      <Cell x={325} y={54} w={250} label="A's version" stroke={C.focus} o={a} />
      <Cell x={325} y={96} w={250} label="B's version" stroke={C.cherryText} o={rb * 0.7} />
      <Cross x={560} y={110} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={325} y={160} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        exactly one survives: 412
      </T>
      <T x={300} y={212} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        no lock service needed
      </T>
    </Svg>
  );
}

// 10 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="object storage: strongly consistent reads, no atomic rename, and conditional writes as the real commit primitive." h={210}>
      <Row y={45} label="reads" value="strong since 2020" k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={100} label="rename" value="never atomic" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={155} label="conditional writes" value="the commit primitive" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
