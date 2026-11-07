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

// 1 · Hook. A packet marked "?" crosses from primary to replica; then the two things "everything" can mean land beneath it.
export function Hook({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="the replica needs everything. What does that mean to ship?" h={220}>
      <Cell x={25} y={60} w={170} label="primary" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={405} y={60} w={170} label="replica" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={195} y1={74} x2={405} y2={74} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={lerp(200, 340, p)} y={62} w={60} h={24} label="?" stroke={C.second} f={C.second} o={p > 0 ? 1 : 0} />
      <Cell x={190} y={124} w={100} label="bytes" stroke={C.second} o={easeOut(seg(t, 2.5, 2.8))} />
      <Cell x={310} y={124} w={100} label="changes" stroke={C.second} o={easeOut(seg(t, 2.9, 3.2))} />
      <T x={300} y={195} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        two meanings, both called replication
      </T>
    </Svg>
  );
}

// 2 · Physical. Each block on the primary is copied byte for byte into the same slot on the replica; both ends share one version.
export function RevealPhysicalExactBytes({ t }: StepCtx) {
  return (
    <Svg label="exact bytes, block for block. One version, both sides." h={230}>
      <T x={25} y={48} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        primary
      </T>
      <T x={405} y={48} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        replica
      </T>
      {Array.from({ length: 4 }, (_, i) => {
        const p = easeInOut(seg(t, 0.5 + i * 0.3, 1.3 + i * 0.3));
        return (
          <g key={i}>
            <rect x={25 + i * 42} y={60} width={34} height={30} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
            <rect x={405 + i * 42} y={60} width={34} height={30} rx={3} fill={C.cocoa} stroke={p >= 1 ? C.second : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
            <circle cx={lerp(42 + i * 42, 422 + i * 42, p)} cy={75} r={4} fill={C.second} opacity={p > 0 && p < 1 ? 1 : 0} />
          </g>
        );
      })}
      <Row y={150} label="to apply" value="same bytes, same place" k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="both ends" value="the identical version" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 3 · Logical. Raw WAL bytes feed a decoder that emits row changes; those travel to a different version and to a CDC reader.
export function RevealLogicalDecodedChanges({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.8, 1.4));
  const s = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="decoded row changes, not bytes. Readable across versions." h={240}>
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={25 + i * 38} y={62} width={30} height={40} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.6 * d)} />
      ))}
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        WAL bytes
      </T>
      <Cell x={210} y={50} w={150} label="row change" stroke={C.focus} o={d} />
      <Cell x={210} y={88} w={150} label="row change" stroke={C.focus} o={easeOut(seg(t, 1.1, 1.5))} />
      <circle cx={lerp(365, 400, s)} cy={64} r={4} fill={C.focus} opacity={s > 0 && s < 1 ? 1 : 0} />
      <circle cx={lerp(365, 400, s)} cy={102} r={4} fill={C.focus} opacity={s > 0 && s < 1 ? 1 : 0} />
      <Cell x={405} y={50} w={170} label="another version" stroke={C.second} o={easeOut(seg(t, 2.4, 2.7))} />
      <Cell x={405} y={88} w={170} label="a CDC reader" stroke={C.second} o={easeOut(seg(t, 2.6, 2.9))} />
      <Row y={170} label="readable by" value="any major version" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Row y={215} label="and" value="selective" k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 4 · Predict. The consumer is crossed out while the primary's unread log keeps growing beside it.
export function PredictStalledConsumer({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.8, 2.4));
  return (
    <Svg label="a consumer stops reading. What happens to the data?" h={200}>
      <Row y={40} label="the consumer" value="stops reading" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={66} w={150} label="primary" o={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={185} y={72} width={lerp(30, 230, g)} height={16} rx={3} fill={answer !== null ? C.cherryText : C.second} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={445} y={66} w={130} label="consumer" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cross x={510} y={80} k={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="its unread data" answer={answer} value="kept, however long" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the primary can't guess, so it keeps it all" />
    </Svg>
  );
}

// 5 · Replication slots. The recycler sweeps old WAL segments away from the left and stops dead at the slot's marker.
export function RevealReplicationSlotsNamed({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.4, 2.6));
  return (
    <Svg label="a slot is a promise. Keep the WAL until it is read." h={220}>
      {Array.from({ length: 9 }, (_, i) => {
        const removed = i < 3 && sw * 3 > i + 0.5;
        return (
          <rect
            key={i}
            x={25 + i * 61}
            y={70}
            width={53}
            height={30}
            rx={3}
            fill={C.cocoa}
            stroke={i >= 3 ? C.second : C.mocha}
            strokeWidth={1.5}
            opacity={easeOut(seg(t, 0.2 + i * 0.05, 0.5 + i * 0.05)) * (removed ? 0.15 : 1)}
          />
        );
      })}
      <line x1={204} y1={56} x2={204} y2={112} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={210} y={52} s={12} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        the slot: keep from here
      </T>
      <line x1={25} y1={124} x2={25 + 175 * sw} y2={124} stroke={C.latte} strokeWidth={2} strokeDasharray="4 3" />
      <T x={25} y={144} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        recycled
      </T>
      <Row y={195} label="how long" value="no built-in limit" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 6 · A stalled slot, measured. Writes keep dropping into the retained-WAL bar, and its byte count climbs past a million.
export function RevealStalledSlotMeasured({ t }: StepCtx) {
  const g = easeInOut(seg(t, 1.0, 3.4));
  const n = Math.round(1_000_000 * g);
  return (
    <Svg label="real writes, nothing consuming. Real WAL retained." h={230}>
      <Row y={40} label="a slot, no consumer" value="writes keep landing" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={80} width={550} height={20} rx={3} fill={C.cocoa} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <rect x={25} y={80} width={550 * g} height={20} rx={3} fill={C.second} />
      {[0, 1, 2, 3, 4].map((i) => {
        const q = clamp(seg(t, 1.0 + i * 0.45, 1.4 + i * 0.45));
        return <circle key={i} cx={25 + 550 * clamp(g) - 6} cy={lerp(56, 86, q)} r={4} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <Row y={150} label="WAL retained" value={g >= 1 ? 'over 1,000,000 bytes' : `${num(n)} bytes`} valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={200} label="read by" value="nobody" k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 7 · The outage and the fix. The full bar threatens the log's disk; then a real consumer arrives and drains it to nothing.
export function RevealOutageAndFixMeasured({ t }: StepCtx) {
  const dr = easeInOut(seg(t, 2.2, 3.4));
  return (
    <Svg label="left too long, it fills the disk. Caught up, it clears." h={240}>
      <rect x={25} y={60} width={380 * (1 - dr)} height={20} rx={3} fill={C.cherryText} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={104} s={12} f={C.cherryText} o={easeOut(seg(t, 0.7, 1.0)) * (1 - dr)}>
        it can fill the log's whole disk
      </T>
      <Cell x={425} y={56} w={150} label="a real consumer" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      {[0, 1, 2].map((i) => {
        const q = clamp(seg(t, 2.2 + i * 0.35, 2.7 + i * 0.35));
        return <circle key={i} cx={lerp(380 * (1 - dr) + 20, 420, q)} cy={70} r={4} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <Row y={160} label="the consumer" value="catches all the way up" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={210} label="retained after" value="0 bytes" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 8 · Failover-safe slots. The primary is crossed; the logical slot's tag slides across to the new primary.
export function RevealFailoverSafeLogicalSlots({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="a logical slot can now survive its own failover." h={240}>
      <Cell x={25} y={50} w={170} label="primary" o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.5 * easeOut(seg(t, 0.8, 1.1)))} />
      <Cross x={110} y={64} k={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={405} y={50} w={170} label="new primary" stroke={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={lerp(25, 405, mv)} y={92} w={170} h={26} label="logical slot" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={170} label="PostgreSQL 17" value="the slot survives" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={215} label="this sandbox" value="runs 16" k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 9 · MySQL's row-based binlog. One statement fans out into one logged event per changed row; the statement itself isn't what's logged.
export function RevealSameIdeaElsewhere({ t }: StepCtx) {
  return (
    <Svg label="not the statement that ran. Every row it changed." h={230}>
      <Cell x={25} y={76} w={230} label="one UPDATE statement" o={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={255} y1={90} x2={325} y2={54 + i * 36} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.9 + i * 0.3, 1.2 + i * 0.3))} />
          <Cell x={325} y={40 + i * 36} w={250} h={28} label="one changed row, logged" stroke={C.focus} o={easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3))} />
        </g>
      ))}
      <Row y={190} label="MySQL binlog" value="row-based" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <T x={25} y={224} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        what changed, not the command
      </T>
    </Svg>
  );
}

// 10 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bytes or changes. A promise, and its cost." h={200}>
      <Row y={40} label="physical" value="bytes, one version" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="logical" value="changes, any version" valueColor={C.focus} k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={160} label="a slot" value="a promise with a cost" valueColor={C.cherryText} k={easeOut(seg(t, 2.7, 3.2))} />
    </Svg>
  );
}

// 11 · Prove. The retained bar climbs steeply through six hours; after the answer a catch-up drain is still owed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const g = easeInOut(seg(t, 0.8, 2.4));
  return (
    <Svg label="down for hours, double the writes. What happens?" h={220}>
      <Row y={40} label="consumer down" value="six hours, double writes" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="a restart alone" answer={answer} value="stops growth only" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={120} width={400 * g} height={18} rx={3} fill={C.cherryText} />
      <T x={435} y={134} s={12} f={C.cherryText} o={seg(g, 0.8, 1)}>
        still retained
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            the pile still has to be read through
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
