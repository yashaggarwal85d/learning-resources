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

/** A segment block. */
function Seg({ x, y, o = 1, stroke = C.mocha, fill = C.cocoa, dashed = false }: { x: number; y: number; o?: number; stroke?: string; fill?: string; dashed?: boolean }) {
  return <rect x={x} y={y} width={70} height={30} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? '4 3' : undefined} opacity={o} />;
}

const SX = (i: number) => 25 + i * 88;

// 0 · Hook. Six segments on the broker's disk, a long cost bar beneath. Four old segments slide down onto a cheap
// shelf and the cost bar collapses.
export function Hook({ t }: StepCtx) {
  const move = easeInOut(seg(t, 1.4, 2.4));
  const cost = lerp(1, 0.3, easeInOut(seg(t, 2.4, 3.2)));
  return (
    <Svg label="a cost bar collapsing once the tiered region replaces most of the local-disk region" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        broker disk
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Seg key={i} x={SX(i)} y={i < 4 ? lerp(32, 100, move) : 32} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} stroke={i < 4 && move > 0 ? C.second : C.mocha} />
      ))}
      <T x={25} y={150} s={11} f={C.second} o={easeOut(seg(t, 2.2, 2.5))}>
        object storage
      </T>
      <rect x={25} y={168} width={525 * cost} height={12} rx={3} fill={C.cherryText} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={300} y={196} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        the same history, for a fraction of the bill
      </T>
    </Svg>
  );
}

// 1 · Setup. The strip of six segments; a dashed boundary draws between the older and the newer; the older side is
// labelled object storage, the newer local disk.
export function Setup({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="the partition strip with a boundary: older segments remote, newer segments local" h={200}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Seg key={i} x={SX(i)} y={70} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} stroke={i < 3 && b > 0 ? C.second : i >= 3 && b > 0 ? C.focus : C.mocha} />
      ))}
      <line x1={279} y1={lerp(70, 40, b)} x2={279} y2={lerp(100, 130, b)} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={b} />
      <T x={25} y={56} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        older: object storage
      </T>
      <T x={290} y={56} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        newer: the broker's own disk
      </T>
      <T x={25} y={160} s={12} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>
        one strip, one new boundary
      </T>
    </Svg>
  );
}

// 2 · Predict. A segment just rolled and locks; a local-retention bar ticks. On answer a copy pip drops at once to the
// remote shelf.
export function PredictCopyTiming({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  return (
    <Svg label="a segment just rolled — does the copy wait for local retention, or start now?" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        local disk
      </T>
      <Seg x={25} y={32} o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      <Lock x={102} y={52} k={easeOut(seg(t, 0.3, 0.6))} />
      <T x={125} y={58} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        just rolled closed
      </T>
      <rect x={300} y={42} width={250} height={8} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={300} y={42} width={250 * 0.3 * easeInOut(seg(t, 0.5, 2.0))} height={8} rx={3} fill={C.latte} />
      <T x={300} y={70} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        local retention, still ticking
      </T>
      <T x={108} y={154} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        object storage
      </T>
      <Seg x={25} y={134} dashed stroke={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      {v > 0 && v < 1 && <rect x={53} y={lerp(66, 140, v)} width={14} height={14} rx={2} fill={C.second} />}
      <AnswerRow y={190} label="the copy" answer={answer} value="starts at the roll" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Two clocks. The segment rolls; its copy drops to object storage straight away; a separate local-retention bar
// fills, and only when it runs out does the local copy fade.
export function RevealCopyTiming({ t }: StepCtx) {
  const copy = easeInOut(seg(t, 0.8, 1.5));
  const ret = easeInOut(seg(t, 1.6, 3.4));
  const del = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="the copy starts the moment the segment rolls, not when local retention expires" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        local disk
      </T>
      {del < 1 && <Seg x={25} y={32} o={1 - del} stroke={C.focus} />}
      <Lock x={102} y={52} k={easeOut(seg(t, 0.3, 0.6)) * (1 - del)} />
      {copy > 0 && copy < 1 && <rect x={53} y={lerp(66, 140, copy)} width={14} height={14} rx={2} fill={C.second} />}
      <T x={108} y={154} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        object storage
      </T>
      <Seg x={25} y={134} stroke={C.second} dashed={copy < 1} fill={copy >= 1 ? C.cocoa : 'none'} o={easeOut(seg(t, 0.6, 0.9))} />
      <T x={200} y={58} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        clock one: copy at the roll
      </T>
      <rect x={200} y={88} width={350} height={8} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.5, 1.7))} />
      <rect x={200} y={88} width={350 * ret} height={8} rx={3} fill={C.latte} />
      <T x={200} y={116} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        clock two: local retention
      </T>
      <T x={200} y={186} s={11} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        only then: the local copy is deleted
      </T>
    </Svg>
  );
}

// 4 · Predict. A consumer's fetch goes to the broker, which has two dashed paths behind it: local disk, object
// storage. On answer both paths carry the same call.
export function PredictColdRead({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a consumer asks for an old offset — can it tell local from remote by the API alone?" h={200}>
      <Cell x={25} y={60} w={120} label="consumer" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={155} x2={245} y={74} k={easeOut(seg(t, 0.3, 0.7))} label="fetch" />
      <Cell x={255} y={60} w={100} label="broker" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={355} y1={70} x2={420} y2={44} stroke={v > 0 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={355} y1={80} x2={420} y2={116} stroke={v > 0 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={425} y={30} w={125} label="local disk" o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={425} y={102} w={125} label="object storage" o={easeOut(seg(t, 0.8, 1.1))} stroke={C.second} />
      {v > 0 && (
        <T x={25} y={130} s={11} f={C.focus} o={v}>
          the same call either way
        </T>
      )}
      <AnswerRow y={182} label="tell from the call?" answer={answer} value="no" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Cold read, measured. The same fetch twice: a short latency bar from local disk, a bar many times longer from
// object storage. Shape only.
export function RevealColdRead({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.0));
  const b = easeInOut(seg(t, 1.8, 3.6));
  return (
    <Svg label="the same fetch call either way — only the measured latency gives away which tier answered" h={200}>
      <T x={25} y={44} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        fetch, local
      </T>
      <rect x={180} y={32} width={30 * a} height={16} rx={3} fill={C.focus} />
      <T x={25} y={104} s={12} f={C.crema} o={easeOut(seg(t, 1.4, 1.7))}>
        fetch, remote
      </T>
      <rect x={180} y={92} width={370 * b} height={16} rx={3} fill={C.second} />
      <T x={180} y={70} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        fast
      </T>
      <T x={180} y={130} s={11} f={C.second} o={easeOut(seg(t, 3.5, 3.8))}>
        more than ten times the cost
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        same call; only the time gives it away
      </T>
    </Svg>
  );
}

// 6 · Two retentions. Two sliders over the strip: total retention spans the whole history; local retention spans the
// newest stretch. The local handle slides shorter; the total one doesn't move.
export function RevealTwoRetentions({ t }: StepCtx) {
  const shrink = easeInOut(seg(t, 2.4, 3.4));
  const localW = lerp(260, 120, shrink);
  return (
    <Svg label="local retention and total retention, two independent knobs where there used to be one" h={200}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Seg key={i} x={SX(i)} y={30} o={easeOut(seg(t, 0.05 * i, 0.3 + 0.05 * i))} />
      ))}
      <rect x={25} y={90} width={510 * easeOut(seg(t, 0.4, 1.0))} height={8} rx={3} fill={C.second} />
      <T x={25} y={116} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        total retention: everywhere
      </T>
      <rect x={535 - localW} y={140} width={localW * easeOut(seg(t, 1.2, 1.8))} height={8} rx={3} fill={C.focus} />
      <circle cx={535 - localW} cy={144} r={7} fill={C.focus} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={174} s={11} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        local retention: this disk only
      </T>
      <T x={25} y={196} s={11} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        shrinking local no longer shrinks total
      </T>
    </Svg>
  );
}

// 7 · No compaction. A tiered segment locks as fixed; compaction reaches to rewrite it and is struck: the combination
// is rejected.
export function RevealNoCompaction({ t }: StepCtx) {
  return (
    <Svg label="a compacted topic can't be tiered — compaction rewrites segments the remote copy assumes are fixed" h={200}>
      <Seg x={25} y={50} stroke={C.second} o={easeOut(seg(t, 0, 0.3))} />
      <Lock x={102} y={70} k={easeOut(seg(t, 0.4, 0.8))} />
      <T x={25} y={110} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        tiered: bytes assumed fixed
      </T>
      <Cell x={330} y={50} w={220} label="compaction" o={easeOut(seg(t, 1.4, 1.7))} />
      <Back x1={320} x2={130} y={64} k={easeOut(seg(t, 1.8, 2.5))} label="rewrite in place" />
      <Cross x={225} y={64} k={easeOut(seg(t, 2.6, 2.9))} />
      <Cell x={25} y={lerp(138, 146, easeOut(seg(t, 3.1, 3.5)))} w={525} label="compact + tiered: rejected" o={easeOut(seg(t, 3.1, 3.5))} stroke={C.cherryText} f={C.cherryText} />
    </Svg>
  );
}

/** A left-pointing arrow from x1 back to x2, drawn by `k`, with a label above. */
function Back({ x1, x2, y, k, label }: { x1: number; x2: number; y: number; k: number; label: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={C.cherryText} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={C.cherryText} />
      <T x={(x1 + x2) / 2} y={y - 10} s={11} f={C.cherryText} a="middle">
        {label}
      </T>
    </g>
  );
}

// 8 · Prove it. The run's results, one by one; under them the six segments, coloured by where each ended up.
export function ProveIt({ t }: StepCtx) {
  const where = ['expired', 'remote', 'remote', 'both', 'both', 'active'];
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={40} label="remote-only segments" value="two of six" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={80} label="remote read cost" value="far larger" valueColor={C.second} k={easeOut(seg(t, 0.9, 1.4))} />
      <Row y={120} label="compacted plus tiered" value="rejected" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      {where.map((w, i) => (
        <g key={i} opacity={easeOut(seg(t, 2.4 + i * 0.15, 2.7 + i * 0.15))}>
          <Seg x={SX(i)} y={160} stroke={w === 'remote' ? C.second : w === 'both' ? C.focus : w === 'active' ? C.crema : C.mocha} dashed={w === 'expired'} />
          <T x={SX(i) + 35} y={212} s={11} f={C.latte} a="middle">
            {w}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the transparent-but-slower read outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['closed segments tier at the roll', 'local and total retention: separate knobs', 'reads stay the same call, not the same speed'];
  return (
    <Svg label="closed segments tier automatically, two independent retention knobs, reads stay transparent but not free" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
