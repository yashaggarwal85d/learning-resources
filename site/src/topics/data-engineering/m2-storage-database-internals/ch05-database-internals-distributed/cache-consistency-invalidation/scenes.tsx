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
/** A node's timeline: its name on the left and a line from x 110 rightwards; events sit on it as cells. */
function NLane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={110} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
}

// 1 · Hook. The reader misses and starts a slow read; the writer updates and deletes; the reader's stale value lands in the cache after.
export function Hook({ t }: StepCtx) {
  const sr = easeInOut(seg(t, 0.6, 3.0));
  return (
    <Svg label="a reader's stale read lands in the cache right after a writer already deleted that same key" h={250}>
      <NLane y={50} name="reader" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={110} name="writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={170} name="cache" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={115} y={50} w={70} label="miss" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={190} y1={50} x2={190 + 235 * sr} y2={50} stroke={C.latte} strokeWidth={3} strokeDasharray="6 4" />
      <T x={195} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.7, 1.0))}>
        a slow read of the old value
      </T>
      <Ev x={195} y={110} w={110} label="update DB" stroke={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <Ev x={315} y={110} w={100} label="delete key" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <Ev x={315} y={170} w={100} label="empty" o={easeOut(seg(t, 2.0, 2.3))} />
      <Ev x={430} y={50} w={140} label="write back old" stroke={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))} />
      <Ev x={430} y={170} w={140} label="old value" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))} />
      <T x={25} y={230} s={12} f={C.cherryText} o={easeOut(seg(t, 4.0, 4.4))}>
        stale, right after the delete
      </T>
    </Svg>
  );
}

// 2 · Predict. Delete beside update; the answer: updating has the same hole, and worse ordering.
export function PredictUpdateVsDelete({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="would updating the cache instead of deleting it have prevented this race?" h={200}>
      <Cell x={25} y={60} w={250} h={28} label="delete the key" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={325} y={60} w={250} h={28} label="write the new value" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={140} label="would updating fix it?" answer={answer} value="no, it's riskier" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} text="the same timing hole, worse ordering" />
    </Svg>
  );
}

// 3 · Delete, not update. Two deletes, either order: empty both times. Two updates, swapped: the older one lands last and stays.
export function RevealDeleteNotUpdate({ t }: StepCtx) {
  const d = clamp(seg(t, 0.5, 1.1));
  const u = clamp(seg(t, 2.2, 2.8));
  return (
    <Svg label="delete, not update: a delete is idempotent, an update is not" h={240}>
      <T x={25} y={40} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        two deletes, either order
      </T>
      {[0, 1].map((i) => (
        <circle key={i} cx={lerp(40 + i * 40, 395, clamp(d * 1.4 - i * 0.4))} cy={64} r={5} fill={C.focus} opacity={d > 0 && d < 1 ? 1 : 0} />
      ))}
      <Cell x={400} y={50} w={175} label="empty, both ways" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.1, 1.4))} />
      <T x={25} y={120} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        two updates, swapped
      </T>
      <Cell x={25} y={130} w={110} label="set new" o={easeOut(seg(t, 1.8, 2.1)) * (1 - 0.6 * u)} />
      <Cell x={150} y={130} w={110} label="set old" stroke={C.cherryText} o={easeOut(seg(t, 2.0, 2.3)) * (1 - 0.6 * u)} />
      <path d={`M260 144 H${lerp(260, 395, u)}`} stroke={C.cherryText} strokeWidth={2} />
      <Cell x={400} y={130} w={175} label="old, last to land" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))} />
      <Row y={210} label="a delete" value="idempotent" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 4 · The race, reproduced. A replay bar ticks through miss, delete, write-back; then the database reads new and the cache reads old.
export function RevealRaceReproduced({ t }: StepCtx) {
  const r = easeInOut(seg(t, 0.3, 1.9));
  const marks = ['miss', 'delete', 'write-back'];
  return (
    <Svg label="the exact interleaving, reproduced for real — does deleting on write actually close the gap?" h={230}>
      <line x1={25} y1={50} x2={25 + 550 * r} y2={50} stroke={C.latte} strokeWidth={2} />
      {marks.map((m, i) => (
        <g key={m} opacity={r > 0.15 + i * 0.35 ? 1 : 0}>
          <circle cx={100 + i * 200} cy={50} r={5} fill={i === 2 ? C.cherryText : C.focus} />
          <T x={100 + i * 200} y={76} s={11} f={C.latte} a="middle">
            {m}
          </T>
        </g>
      ))}
      <Cell x={25} y={100} w={250} h={30} label="the database: new" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={325} y={100} w={250} h={30} label="the cache: old" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))} />
      <Row y={195} label="the cache, measured" value="still the old value" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 5 · Leases. The reader's miss hands it a token; the writer's delete crosses the token; the stale write-back is refused; the cache stays cold.
export function RevealLeasesClose({ t }: StepCtx) {
  const sr = easeInOut(seg(t, 0.8, 2.8));
  return (
    <Svg label="a lease token, invalidated by the writer's delete, rejects the reader's own stale write-back" h={250}>
      <NLane y={50} name="reader" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={110} name="writer" o={easeOut(seg(t, 0.1, 0.4))} />
      <NLane y={170} name="cache" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={115} y={50} w={70} label="miss" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={120} y={74} w={60} h={20} label="token" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={190} y1={50} x2={190 + 235 * sr} y2={50} stroke={C.latte} strokeWidth={3} strokeDasharray="6 4" />
      <Ev x={250} y={110} w={100} label="delete key" stroke={C.focus} o={easeOut(seg(t, 1.5, 1.8))} />
      <Cross x={150} y={84} k={easeOut(seg(t, 1.9, 2.2))} />
      <Ev x={430} y={50} w={140} label="write back old" stroke={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))} />
      <Cross x={500} y={82} k={easeOut(seg(t, 3.4, 3.7))} />
      <Ev x={430} y={170} w={140} label="stays cold" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.8, 4.1))} />
      <T x={25} y={230} s={12} f={C.focus} o={easeOut(seg(t, 4.3, 4.7))}>
        refused, measured directly
      </T>
    </Svg>
  );
}

// 6 · CDC invalidation. Three write paths into the database, one forgetting to delete; the commit log carries every change to a daemon, which deletes from the cache.
export function RevealCdcInvalidation({ t }: StepCtx) {
  const lg = clamp(seg(t, 2.0, 3.4));
  const del = clamp(seg(t, 3.6, 4.2));
  return (
    <Svg label="a daemon reads the database's own commit log directly and extracts the deletes itself" h={240}>
      {['a write path', 'a write path', 'forgets to delete'].map((l, i) => (
        <g key={i}>
          <Cell x={25} y={40 + i * 40} w={160} h={28} label={l} stroke={i === 2 ? C.cherryText : C.mocha} f={i === 2 ? C.cherryText : C.crema} o={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))} />
          <line x1={185} y1={54 + i * 40} x2={220} y2={94} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))} />
        </g>
      ))}
      <Cell x={220} y={80} w={150} label="the database" o={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={220} y={132} width={355} height={18} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={220} y={170} s={11} f={C.second} o={easeOut(seg(t, 1.7, 2.0))}>
        its own commit log
      </T>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={lerp(235, 410, clamp(lg * 1.6 - i * 0.3))} cy={141} r={4} fill={i === 2 ? C.cherryText : C.second} opacity={lg > 0 && clamp(lg * 1.6 - i * 0.3) < 1 ? 1 : 0} />
      ))}
      <Cell x={420} y={80} w={155} label="CDC daemon" stroke={C.focus} o={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={420} y={30} w={155} h={26} label="cache" o={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={497} cy={lerp(80, 58, del)} r={4} fill={C.focus} opacity={del > 0 && del < 1 ? 1 : 0} />
      <Row y={215} label="the forgetful path" value="still caught" valueColor={C.focus} k={easeOut(seg(t, 4.3, 4.8))} />
    </Svg>
  );
}

// 7 · Per-field staleness. Most fields are tagged "stale is fine"; the authentication field is tagged critical and routed to the current copy.
export function RevealPerFieldStaleness({ t }: StepCtx) {
  const fields = ['name', 'photo', 'friends', 'authentication'];
  return (
    <Svg label="not every field needs the same consistency — one real system marks a critical few differently" h={230}>
      {fields.map((f, i) => {
        const crit = i === 3;
        const a = 0.4 + i * 0.6;
        return (
          <g key={f}>
            <Cell x={25} y={40 + i * 40} w={170} h={28} label={f} stroke={crit ? C.focus : C.mocha} o={easeOut(seg(t, a, a + 0.3))} />
            <T x={215} y={59 + i * 40} s={12} f={crit ? C.focus : C.latte} o={easeOut(seg(t, a + 0.2, a + 0.5))}>
              {crit ? 'critical' : 'a little stale is fine'}
            </T>
          </g>
        );
      })}
      <path d={`M300 174 H${lerp(300, 400, easeOut(seg(t, 2.8, 3.4)))}`} stroke={C.focus} strokeWidth={2} />
      <Cell x={400} y={160} w={175} h={28} label="the current copy" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))} />
      <T x={25} y={218} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        decided field by field
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delete beats update, leases close the race, a commit-log daemon never forgets, and staleness tolerance is a per-field decision" h={240}>
      <Row y={40} label="delete, not update" value="idempotent" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="a lease" value="closes the race" valueColor={C.second} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={150} label="a commit-log daemon" value="never forgets" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={205} label="staleness" value="decided per field" k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 9 · Prove. Leases beside the CDC daemon; after the answer the lease cell is crossed and the daemon lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a new write path never calls the cache-invalidation code — which fix catches this automatically?" h={220}>
      <Row y={40} label="a new write path" value="never invalidates" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="caught by" answer={answer} value="CDC, from the log" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="leases" stroke={a > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={255} y={132} k={a} />
      <Cell x={325} y={118} w={250} h={28} label="the CDC daemon" stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} o={easeOut(seg(t, 1.0, 1.3))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            nothing had to remember anything
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
