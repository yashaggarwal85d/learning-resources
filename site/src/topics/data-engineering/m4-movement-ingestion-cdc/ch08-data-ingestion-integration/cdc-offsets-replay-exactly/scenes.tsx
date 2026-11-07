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

/** `n` record squares from x at y, `k` of them shown. */
function Recs({ x, y, k, n = 5, f = C.latte, gap = 18 }: { x: number; y: number; k: number; n?: number; f?: string; gap?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * gap} y={y} width={14} height={14} rx={2} fill={f} opacity={clamp(k * n - i, 0, 1)} />
      ))}
    </g>
  );
}

// 0 · Hook. The connector produces a batch into the topic; its offset commit is cut by a kill; on restart the same batch
// lands again in cherry, and the downstream sum overshoots its dashed true length.
export function Hook({ t }: StepCtx) {
  const b1 = easeOut(seg(t, 0.3, 1.1));
  const kill = easeOut(seg(t, 1.3, 1.6));
  const b2 = easeOut(seg(t, 2.0, 2.8));
  const sum = 200 * b1 + 200 * b2;
  return (
    <Svg
      label="a connector pod is killed between producing five thousand change events and committing their offsets; on restart it emits them again, and a downstream counter that sums amount is now five thousand orders too high."
      h={220}
    >
      <Cell x={25} y={30} w={140} label="connector" />
      <T x={200} y={22} s={11} f={C.latte}>
        topic
      </T>
      <rect x={200} y={30} width={345} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <Recs x={210} y={37} k={b1} />
      <Recs x={320} y={37} k={b2} f={C.cherryText} />
      <Hole x={25} y={80} w={140} o={easeOut(seg(t, 1.0, 1.3))} stroke={kill > 0 ? C.cherryText : C.mocha} />
      <T x={95} y={99} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        commit offset
      </T>
      <Cross x={180} y={94} k={kill} />
      {t >= 1.8 && (
        <T x={200} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))}>
          restart: the same batch again
        </T>
      )}
      <T x={25} y={150} s={11} f={C.latte}>
        downstream sum of amount
      </T>
      <rect x={25} y={158} width={200} height={14} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
      <rect x={25} y={158} width={sum} height={14} fill={b2 > 0 ? C.cherryText : C.latte} />
      {t >= 3.0 && (
        <T x={25} y={205} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
          every record counted twice
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The batch is in the topic; the offset commit's slot is empty and crossed. Once answered, the identical
// batch lands a second time.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="the offset was never committed before the crash. Does the restart skip the batch it already produced, or emit the identical batch again?" h={200}>
      <Cell x={25} y={30} w={140} label="connector" o={easeOut(seg(t, 0, 0.3))} />
      <rect x={200} y={30} width={345} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <Recs x={210} y={37} k={easeOut(seg(t, 0.3, 0.9))} />
      <Recs x={320} y={37} k={v} f={C.cherryText} />
      <Hole x={25} y={80} w={140} o={easeOut(seg(t, 0.8, 1.1))} stroke={C.cherryText} />
      <T x={95} y={99} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        offset: never moved
      </T>
      <AnswerRow y={178} label="on restart" answer={answer} value="emits it again" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Two positions. The source log with its position caret; the Kafka topic with its record offset; between them the
// framework's own offsets store, flashing a commit only every so often.
export function RevealTwoPositions({ t }: StepCtx) {
  const flash = (i: number) => {
    const p = seg(t, 2.0 + i * 0.9, 2.4 + i * 0.9);
    return p > 0 && p < 1;
  };
  return (
    <Svg label="a connector tracks a source position and a Kafka offset, stored in different places; Kafka Connect commits the source position to its own topic periodically, not per record." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        source database's log
      </T>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={25 + i * 37} y={30} width={30} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, i * 0.05, 0.3 + i * 0.05))} />
      ))}
      <path d="M173 56 l-6 9 h12 z" fill={C.focus} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={173} y={82} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        source position
      </T>
      <T x={315} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        Kafka topic
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={315 + i * 37} y={30} width={30} height={22} rx={3} fill={C.latte} opacity={easeOut(seg(t, 0.9 + i * 0.05, 1.2 + i * 0.05))} />
      ))}
      <path d="M500 56 l-6 9 h12 z" fill={C.second} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={500} y={82} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        record offset
      </T>
      <Cell x={150} y={120} w={280} label="Connect's own offsets topic" o={easeOut(seg(t, 1.6, 1.9))} stroke={[0, 1, 2].some(flash) ? C.focus : C.mocha} />
      {t >= 2.0 && (
        <T x={290} y={176} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
          written on a schedule, not per record
        </T>
      )}
    </Svg>
  );
}

// 3 · Crash, measured. Top: peek, peek again without advancing: the same five inserts both times, ten in all. Bottom:
// read, advance at once: the next read is empty, five in all.
export function RevealCrashMeasured({ t }: StepCtx) {
  return (
    <Svg
      label="run directly against this sandbox's real PostgreSQL: peeking the decoded batch twice without ever advancing the slot returns the identical batch both times, and advancing right after producing leaves nothing for the next peek to find."
      h={220}
    >
      <T x={25} y={22} s={11} f={C.latte}>
        peek twice, never advance
      </T>
      <T x={25} y={44} s={11} f={C.latte}>
        peek 1
      </T>
      <Recs x={80} y={33} k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={200} y={44} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        peek 2
      </T>
      <Recs x={255} y={33} k={easeOut(seg(t, 0.9, 1.4))} f={C.cherryText} />
      <T x={375} y={44} s={11} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))}>
        10 inserts seen
      </T>
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        read, then advance at once
      </T>
      <T x={25} y={134} s={11} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        read
      </T>
      <Recs x={80} y={123} k={easeOut(seg(t, 2.2, 2.7))} />
      <MiniTick x={180} y={126} k={easeOut(seg(t, 2.8, 3.1))} />
      <T x={200} y={134} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        read again
      </T>
      <Hole x={270} y={121} w={90} h={18} o={easeOut(seg(t, 3.1, 3.4))} stroke={C.focus} />
      <T x={375} y={134} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
        5 inserts seen
      </T>
    </Svg>
  );
}

// 4 · No dedup layer. Debezium beside the slot where its own dedup layer would be: empty and crossed. Underneath, a
// recovery replays a few events, outlined cherry: at-least-once by design.
export function RevealNoDedupLayer({ t }: StepCtx) {
  const ev = 10 * easeInOut(seg(t, 1.6, 2.8));
  const dup = [3, 4];
  return (
    <Svg
      label="Debezium does not implement an internal deduplication layer of its own, and provides at-least-once delivery by default; recovering from a fault can emit some duplicate change events."
      h={200}
    >
      <Cell x={25} y={30} w={160} label="Debezium" o={easeOut(seg(t, 0, 0.3))} />
      <Hole x={200} y={30} w={210} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={305} y={49} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        its own dedup layer
      </T>
      <Cross x={428} y={44} k={easeOut(seg(t, 0.9, 1.2))} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        recovering from a fault
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 26}
          y={110}
          width={20}
          height={20}
          rx={3}
          fill={dup.includes(i) ? C.cocoa : C.latte}
          stroke={dup.includes(i) ? C.cherryText : 'none'}
          strokeWidth={2}
          opacity={clamp(ev - i, 0, 1)}
        />
      ))}
      {t >= 3.0 && (
        <T x={25} y={170} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
          at-least-once: a few repeats expected
        </T>
      )}
    </Svg>
  );
}

// 5 · Dedup, measured. The duplicated batch: five positions, each twice. The naive sum's bar runs to double the dashed
// true total; the reader deduping by position stops exactly on it.
export function RevealDedupMeasured({ t }: StepCtx) {
  const pos = ['A', 'B', 'C', 'D', 'E', 'A', 'B', 'C', 'D', 'E'];
  const n = easeInOut(seg(t, 1.0, 2.2));
  const d = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg
      label="run against the duplicated batch from the crash above: a reader that only sums what it sees comes out double the true total; one that dedupes by each change's own log position matches it exactly."
      h={220}
    >
      {pos.map((p, i) => (
        <Cell key={i} x={25 + i * 52} y={24} w={44} label={p} o={easeOut(seg(t, 0.1 + i * 0.06, 0.4 + i * 0.06))} stroke={i >= 5 && d > 0 ? C.cherryText : C.mocha} />
      ))}
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        naive sum
      </T>
      <rect x={160} y={80} width={360 * n} height={14} fill={C.cherryText} />
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        deduped by position
      </T>
      <rect x={160} y={120} width={180 * d} height={14} fill={C.focus} />
      <line x1={340} y1={70} x2={340} y2={146} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.7, 1.0))} />
      <T x={340} y={164} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        true total
      </T>
      {t >= 3.6 && (
        <T x={300} y={205} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          only the deduping reader is right
        </T>
      )}
    </Svg>
  );
}

// 6 · Exactly-once source. Records and offsets commit inside one transaction box; an old task generation is fenced
// out; an existing cluster steps from preparing to enabled.
export function RevealExactlyOnce({ t }: StepCtx) {
  const tx = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg
      label="Kafka Connect's own exactly-once source support writes records and offsets atomically in one transaction, and fences out old task generations; an existing cluster enables it across two rolling upgrades, preparing then enabled."
      h={220}
    >
      <T x={25} y={22} s={11} f={C.focus} o={tx}>
        one transaction
      </T>
      <rect x={25} y={30} width={300} height={64} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 3" opacity={tx} />
      <Cell x={40} y={48} w={125} label="records" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={185} y={48} w={125} label="offsets" o={easeOut(seg(t, 0.7, 1.0))} />
      <MiniTick x={300} y={104} k={easeOut(seg(t, 1.1, 1.4))} />
      <Cell x={380} y={30} w={170} label="old task" o={easeOut(seg(t, 1.5, 1.8))} stroke={C.cherryText} />
      <Cross x={365} y={44} k={easeOut(seg(t, 1.9, 2.2))} />
      <Cell x={380} y={70} w={170} label="new task" o={easeOut(seg(t, 1.7, 2.0))} stroke={C.focus} />
      <T x={25} y={146} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        an existing cluster: two rolling upgrades
      </T>
      <Cell x={25} y={156} w={160} label="preparing" o={easeOut(seg(t, 2.6, 2.9))} />
      <Req x1={190} x2={235} y={170} k={easeOut(seg(t, 3.0, 3.4))} />
      <Cell x={240} y={156} w={160} label="enabled" o={easeOut(seg(t, 3.3, 3.6))} stroke={C.focus} />
    </Svg>
  );
}

// 7 · Purged, measured. The stored offset names a slot; the slot is dropped to an empty frame; startup reads it and
// fails; only a brand-new slot gets the pipeline running.
export function RevealPurgedMeasured({ t }: StepCtx) {
  const drop = easeOut(seg(t, 0.8, 1.2));
  const rd = easeOut(seg(t, 1.5, 2.0));
  return (
    <Svg label="run directly against the real database: dropping a slot and reading from its own name raises an error immediately; only a brand-new slot lets the pipeline run again." h={200}>
      <Cell x={25} y={30} w={200} label="stored offset" o={easeOut(seg(t, 0, 0.3))} />
      {drop > 0 && <Hole x={300} y={30} w={250} o={drop} stroke={C.cherryText} />}
      <Cell x={300} y={30} w={250} label="topic18_purged" o={easeOut(seg(t, 0.2, 0.5)) * (1 - drop)} />
      <Req x1={230} x2={295} y={44} k={rd} f={C.cherryText} />
      <Cross x={262} y={44} k={easeOut(seg(t, 2.0, 2.3))} />
      {t >= 2.1 && (
        <T x={300} y={84} s={11} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))}>
          error at startup
        </T>
      )}
      <Cell x={300} y={110} w={250} label="a brand-new slot" o={easeOut(seg(t, 2.8, 3.1))} stroke={C.focus} />
      {t >= 3.3 && (
        <T x={25} y={170} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
          runs again, starting clean
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Four rows, one lesson each.
export function Recap({ t }: StepCtx) {
  const rows = ['two positions, two stores, two schedules', 'a crash between them: a replay', 'Debezium has no dedup: dedup yourself', 'a transaction closes it; purged means start over'];
  return (
    <Svg
      label="two positions, two stores, committed on different schedules; a crash before the commit replays; Debezium offers no dedup of its own; a transaction can close that gap; a purged position closes the account entirely."
      h={260}
    >
      {rows.map((r, i) => (
        <Cell key={i} x={25} y={30 + i * 50} w={530} label={r} o={easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8))} stroke={i === 3 ? C.focus : C.mocha} />
      ))}
    </Svg>
  );
}

// 9 · Prove it. Connector and topic inside the transaction's boundary; the consumer outside it. Once answered, the
// consumer outlines cherry: dedup there is its own job.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a source connector just enabled exactly-once source support successfully. Does that alone guarantee the consumer downstream can never double-count a record?" h={200}>
      <rect x={20} y={30} width={320} height={56} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={35} y={44} w={130} label="connector" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={195} y={44} w={130} label="topic" o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={345} x2={405} y={58} k={easeOut(seg(t, 0.8, 1.2))} />
      <Cell x={410} y={44} w={140} label="consumer" o={easeOut(seg(t, 0.9, 1.2))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <T x={180} y={108} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        what the guarantee covers
      </T>
      {v > 0 && (
        <T x={480} y={108} s={11} f={C.cherryText} a="middle" o={v}>
          dedup is its own job
        </T>
      )}
      <AnswerRow y={178} label="consumer safe?" answer={answer} value="no, its own job" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
