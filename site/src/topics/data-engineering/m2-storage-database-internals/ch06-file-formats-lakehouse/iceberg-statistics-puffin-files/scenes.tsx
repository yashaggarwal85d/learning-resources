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

/** Sixteen byte cells holding `s`'s characters at (x, y), drawn in left to right by `k`; cell `hi` gets a focus stroke. */
function Bytes({ x, y, s, k, hi = -1, f = C.crema }: { x: number; y: number; s: string; k: number; hi?: number; f?: string }) {
  return (
    <g>
      {s.split('').map((ch, i) => (
        <g key={i} opacity={seg(k * 16, i, i + 1)}>
          <rect x={x + i * 22} y={y} width={20} height={26} rx={2} fill={C.cocoa} stroke={i === hi ? C.focus : C.mocha} strokeWidth={i === hi ? 2.5 : 1.2} />
          <T x={x + i * 22 + 10} y={y + 17.5} s={12} f={i === hi ? C.focus : f} a="middle">
            {ch}
          </T>
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. A manifest's metric row, lower, upper and counts, each ticked as read; then a question mark over the ticks.
export function Hook({ t }: StepCtx) {
  const m = ['lower bound', 'upper bound', 'counts'];
  return (
    <Svg label="a manifest's column metrics were already read, straight off the file, as if they were exact." h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a manifest's column metrics
      </T>
      {m.map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 185} y={45} w={170} h={30} label={n} o={easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3))} />
          <MiniTick x={25 + i * 185 + 80} y={95} k={easeOut(seg(t, 1.3 + i * 0.2, 1.6 + i * 0.2))} />
        </g>
      ))}
      <T x={25} y={140} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        read as exact facts
      </T>
      <T x={300} y={180} s={16} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        always exact?
      </T>
    </Svg>
  );
}

// 2 · Predict. A long value drawn as a long bar beside a fixed-width bound slot; the answer: truncated.
export function PredictBoundsTruncated({ t, answer }: StepCtx) {
  return (
    <Svg label="a real column value is longer than iceberg stores in a bound. what happens to the bound?" h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a long value
      </T>
      <rect x={25} y={40} width={540 * easeInOut(seg(t, 0.3, 1.2))} height={16} rx={2} fill={C.taupe} />
      <T x={25} y={85} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        the bound's slot
      </T>
      <rect x={25} y={95} width={150} height={16} rx={2} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <T x={200} y={108} s={14} f={C.second} o={easeOut(seg(t, 1.9, 2.3))}>
        in full, or cut?
      </T>
      <AnswerRow y={145} label="the bound" answer={answer} value="truncated" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={188} text="a safe range, not the literal value" />
    </Svg>
  );
}

// 3 · Truncated, for real. The real minimum's first sixteen bytes become the lower bound; the 200-byte maximum's first
// sixteen become the upper bound, and its last byte is bumped from z to the next byte up.
export function RevealBoundsTruncatedForReal({ t }: StepCtx) {
  const bump = t > 3.2;
  return (
    <Svg label="truncated, for real: a 200-byte value's bound is stored as 16 bytes, the upper bound's last byte bumped." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        real min: middle_value_here_longer_than_sixteen_bytes
      </T>
      <T x={25} y={50} s={11} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        lower bound, 16 bytes
      </T>
      <Bytes x={25} y={58} s="middle_value_her" k={easeOut(seg(t, 0.6, 1.6))} />
      <T x={25} y={115} s={11} f={C.latte} o={easeOut(seg(t, 1.7, 2.0))}>
        real max: z repeated, 200 bytes
      </T>
      <T x={25} y={140} s={11} f={C.second} o={easeOut(seg(t, 1.9, 2.2))}>
        upper bound, 16 bytes
      </T>
      <Bytes x={25} y={148} s={bump ? 'zzzzzzzzzzzzzzz{' : 'zzzzzzzzzzzzzzzz'} k={easeOut(seg(t, 2.1, 3.0))} hi={bump ? 15 : -1} />
      <T x={390} y={166} s={12} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        last byte + 1
      </T>
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        still sorts above the real max
      </T>
    </Svg>
  );
}

// 4 · The spec. A value axis: the real min and max as two marks; the stored bounds as a bracket that sits just outside
// them, never on them; "never tight" lands under it.
export function RevealSpecConfirmsTruncation({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="the spec says it directly: string and binary bounds are never tight, because they may be truncated." h={230}>
      <line x1={25} y1={100} x2={560} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <circle cx={200} cy={100} r={6} fill={C.crema} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <circle cx={430} cy={100} r={6} fill={C.crema} opacity={easeOut(seg(t, 0.7, 1.0))} />
      <T x={200} y={130} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        real min
      </T>
      <T x={430} y={130} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        real max
      </T>
      <path d={`M${lerp(200, 180, b)} 80 v-14 H${lerp(430, 455, b)} v14`} fill="none" stroke={C.second} strokeWidth={2.2} opacity={b} />
      <T x={317} y={55} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        stored bounds
      </T>
      <T x={25} y={180} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        string and binary bounds: never tight
      </T>
      <T x={25} y={210} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        safe for skipping files, not a literal value
      </T>
    </Svg>
  );
}

// 5 · Predict. Many manifests, each with its own small, capped stats; one table-wide distinct count wanted; the answer: a
// separate statistics file.
export function PredictTableLevelNdv({ t, answer }: StepCtx) {
  return (
    <Svg label="per-file stats are this limited. how does a planner get a real table-wide distinct count?" h={200}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={25 + i * 34} y={35} width={26} height={30} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1 + i * 0.06, 0.3 + i * 0.06))} />
      ))}
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        small, capped stats in every manifest
      </T>
      <T x={400} y={55} s={13} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        table-wide
      </T>
      <T x={400} y={78} s={13} f={C.second} o={easeOut(seg(t, 1.5, 1.9))}>
        distinct count?
      </T>
      <AnswerRow y={145} label="it comes from" answer={answer} value="a stats file" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="an estimate, never a full scan" />
    </Svg>
  );
}

// 6 · Puffin, built. The file's parts land left to right in byte order, magic, blob, footer, magic; then an arrow
// registers it on the table's metadata through the statistics API.
export function RevealPuffinSketchBuilt({ t }: StepCtx) {
  const parts = [
    { l: 'PFA1', w: 70, f: C.second },
    { l: 'blob: Theta sketch', w: 220, f: C.focus },
    { l: 'footer', w: 110, f: C.latte },
    { l: 'PFA1', w: 70, f: C.second },
  ];
  let x = 25;
  return (
    <Svg label="a real Puffin file, byte-exact to spec, holding a real sketch -- registered on the table for real." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a Puffin file, in byte order
      </T>
      {parts.map((p, i) => {
        const cx = x;
        x += p.w + 8;
        return <Cell key={i} x={cx} y={35} w={p.w} h={34} label={p.l} stroke={p.f} o={easeOut(seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4))} />;
      })}
      <line x1={300} y1={70} x2={300} y2={lerp(70, 128, easeOut(seg(t, 2.4, 2.9)))} stroke={C.focus} strokeWidth={1.8} />
      <Cell x={175} y={130} w={250} h={30} label="table metadata: statistics" stroke={C.focus} o={easeOut(seg(t, 2.8, 3.1))} />
      <T x={25} y={200} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        registered through pyiceberg's public statistics API
      </T>
    </Svg>
  );
}

// 7 · Read back. A hand parser checks the magic at both ends, ticks; the blob yields an estimate bar that lands just short
// of the true distinct-count bar: close, not exact.
export function RevealReadBackAgainstTruth({ t }: StepCtx) {
  return (
    <Svg label="read back independently from raw bytes, and checked against the table's real distinct count." h={230}>
      <Cell x={25} y={25} w={70} h={30} label="PFA1" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={105} y={25} w={300} h={30} label="parsed by hand" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={415} y={25} w={70} h={30} label="PFA1" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <MiniTick x={52} y={68} k={easeOut(seg(t, 0.6, 0.9))} />
      <MiniTick x={442} y={68} k={easeOut(seg(t, 0.9, 1.2))} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        true distinct count
      </T>
      <rect x={200} y={98} width={330 * easeInOut(seg(t, 1.5, 2.3))} height={16} rx={2} fill={C.focus} />
      <T x={25} y={145} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        sketch's estimate
      </T>
      <rect x={200} y={133} width={318 * easeInOut(seg(t, 2.5, 3.3))} height={16} rx={2} fill={C.second} />
      <T x={25} y={200} s={13} f={C.second} o={easeOut(seg(t, 3.5, 3.9))}>
        close, not exact, by design
      </T>
    </Svg>
  );
}

// 8 · Partition stats. The table-level statistics file sits on top; dashed per-partition statistics files appear one
// level below it; each is marked optional.
export function RevealPartitionStatsNamed({ t }: StepCtx) {
  return (
    <Svg label="partition statistics files are the same idea, one level down -- named here, not built." h={230}>
      <Cell x={175} y={25} w={250} h={30} label="table statistics file" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2, 3].map((i) => {
        const x = 25 + i * 140;
        const k = easeOut(seg(t, 1.0 + i * 0.3, 1.4 + i * 0.3));
        return (
          <g key={i}>
            <line x1={300} y1={55} x2={lerp(300, x + 60, k)} y2={lerp(55, 110, k)} stroke={C.mocha} strokeWidth={1.2} opacity={k > 0 ? 1 : 0} />
            <rect x={x} y={110} width={120} height={30} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" opacity={k} />
            <T x={x + 60} y={130} s={11} f={C.second} a="middle" o={k}>
              per partition
            </T>
          </g>
        );
      })}
      <T x={25} y={180} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        one level down, its own spec, optional to read
      </T>
      <T x={25} y={210} s={12} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        named here, not built
      </T>
    </Svg>
  );
}

// 9 · The optimizer. Statistics feed Trino's join enumeration and a good join order comes out; take them away and it falls
// back to a weaker strategy; make them wrong and the plan it picks turns red.
export function RevealOptimizerDependsOnIt({ t }: StepCtx) {
  const rows = [
    { l: 'stats present', r: 'a costed join order', f: C.focus, b: 0.6 },
    { l: 'stats missing', r: 'a weaker fallback', f: C.second, b: 1.8 },
    { l: 'stats wrong', r: 'a genuinely bad plan', f: C.cherryText, b: 3.0 },
  ];
  return (
    <Svg label="a cost-based optimizer leans on exactly this: missing or wrong stats can pick the wrong join plan." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Trino's join enumeration
      </T>
      {rows.map((r, i) => {
        const y = 45 + i * 55;
        return (
          <g key={r.l}>
            <Cell x={25} y={y} w={170} h={30} label={r.l} stroke={r.f} o={easeOut(seg(t, r.b, r.b + 0.3))} />
            <Req x1={197} x2={290} y={y + 15} k={easeOut(seg(t, r.b + 0.3, r.b + 0.7))} f={r.f} />
            <Cell x={295} y={y} w={250} h={30} label={r.r} stroke={r.f} f={r.f} o={easeOut(seg(t, r.b + 0.6, r.b + 0.9))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="per-file stats are already there, truncated; a real sidecar file carries the whole-table picture instead." h={250}>
      <Row y={40} label="per-file bounds" value="truncated, never tight" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="whole table" value="a Puffin sketch" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="per partition" value="the same idea" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="the join plan" value="depends on them" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
