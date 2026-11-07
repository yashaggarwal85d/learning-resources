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

/** Four engine boxes stacked on the left, faded in one by one from `t0`. */
const ENGINES = ['flink', 'trino', 'duckdb', 'this script'];
function Engines({ t, t0, x = 25, y = 22, gap = 44, w = 120 }: { t: number; t0: number; x?: number; y?: number; gap?: number; w?: number }) {
  return (
    <g>
      {ENGINES.map((e, i) => (
        <Cell key={e} x={x} y={y + i * gap} w={w} h={28} label={e} stroke={i === 3 ? C.focus : C.mocha} o={easeOut(seg(t, t0 + i * 0.25, t0 + 0.3 + i * 0.25))} />
      ))}
    </g>
  );
}

/** A version strip: v0 and v1 boxes on one line, a head marker on v1, and a reader marker that can slide back to v0 by `back`. */
function Versions({ t, x = 60, y = 40, back = 0, o = 1 }: { t: number; x?: number; y?: number; back?: number; o?: number }) {
  const k1 = easeOut(seg(t, 0.2, 0.5));
  const k2 = easeOut(seg(t, 0.6, 0.9));
  return (
    <g opacity={o}>
      <Cell x={x} y={y} w={150} h={34} label="v0 · 1,000 rows" o={k1} />
      <line x1={x + 152} y1={y + 17} x2={lerp(x + 152, x + 218, k2)} y2={y + 17} stroke={C.mocha} strokeWidth={1.6} />
      <Cell x={x + 220} y={y} w={150} h={34} label="v1 · 1,010 rows" stroke={C.second} o={k2} />
      <T x={x + 295} y={y + 60} s={11} f={C.second} a="middle" o={k2}>
        the table now
      </T>
      {back > 0 && <path d={`M${lerp(x + 295, x + 75, back)} ${y - 6} l-6 -10 h12 z`} fill={C.focus} />}
    </g>
  );
}

// 1 · Hook. The Delta arc so far as a row of pips ending in "the protocol"; two new pieces branch off it: the release line and the library.
export function Hook({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.8, 2.4));
  const l = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="everything so far is the protocol as it stands. this topic: the release that ships it, and the library that reads it." h={200}>
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={40 + i * 26} cy={95} r={6} fill={C.mocha} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.3 + i * 0.12))} />
      ))}
      <Cell x={200} y={80} w={150} h={30} label="the protocol" stroke={C.second} o={easeOut(seg(t, 0.9, 1.3))} />
      <line x1={352} y1={90} x2={lerp(352, 398, b)} y2={lerp(90, 52, b)} stroke={C.mocha} strokeWidth={1.6} />
      <Cell x={400} y={36} w={160} h={30} label="the release line" o={b} />
      <line x1={352} y1={100} x2={lerp(352, 398, l)} y2={lerp(100, 140, l)} stroke={C.focus} strokeWidth={1.6} />
      <Cell x={400} y={126} w={160} h={30} label="the library" stroke={C.focus} o={l} />
      <T x={400} y={182} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        running right here
      </T>
    </Svg>
  );
}

// 2 · Predict. Four engines on the left, each with its own dashed protocol copy, against one shared box on the right.
export function PredictSharedLibrary({ t, answer }: StepCtx) {
  const c = easeOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="flink, trino, duckdb, this script all want to read delta. does each reimplement the protocol?" h={240}>
      <Engines t={t} t0={0.1} y={14} gap={34} w={110} />
      {ENGINES.map((e, i) => (
        <g key={e} opacity={c}>
          <line x1={137} y1={28 + i * 34} x2={175} y2={28 + i * 34} stroke={C.mocha} strokeWidth={1.4} />
          <rect x={177} y={18 + i * 34} width={60} height={20} rx={3} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
        </g>
      ))}
      <T x={260} y={70} s={14} f={C.second} o={easeOut(seg(t, 2.2, 2.6))}>
        four readers, or one?
      </T>
      <AnswerRow y={182} label="the engines share" answer={answer} value="one library" k={easeOut(seg(t, 2.8, 3.3))} />
      <Verdict answer={answer} y={226} text="a new feature: one patch, not four" />
    </Svg>
  );
}

// 3 · Delta Kernel. The four engines' lines converge into one Kernel box, which alone touches the table; its two ports: Rust and C/C++ FFI.
export function RevealDeltaKernel({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.9, 1.7));
  const k = easeOut(seg(t, 1.5, 1.9));
  const d = easeOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="delta kernel: a rust library that handles the protocol, so a connector doesn't have to. query-engine agnostic." h={230}>
      <Engines t={t} t0={0} y={20} gap={46} w={110} />
      {ENGINES.map((e, i) => (
        <line key={e} x1={137} y1={34 + i * 46} x2={lerp(137, 248, c)} y2={lerp(34 + i * 46, 104, c)} stroke={i === 3 ? C.focus : C.mocha} strokeWidth={1.5} />
      ))}
      <Cell x={250} y={84} w={140} h={40} label="Delta Kernel" stroke={C.focus} o={k} />
      <T x={320} y={150} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        Rust API · C/C++ FFI
      </T>
      <line x1={392} y1={104} x2={lerp(392, 448, d)} y2={104} stroke={C.focus} strokeWidth={1.8} />
      <Cell x={450} y={84} w={110} h={40} label="delta table" o={d} />
      <T x={450} y={60} s={11} f={C.latte} o={d}>
        the protocol
      </T>
      <T x={25} y={218} s={12} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        engines call a small, stable API
      </T>
    </Svg>
  );
}

// 4 · delta-rs, for real. deltalake sits on delta-rs (Kernel dimmed, set apart); its log fills with v0 (write) and v1 (append), and v0's
// raw protocol action is read back off disk.
export function RevealDeltaRsRealTable({ t }: StepCtx) {
  const f0 = easeOut(seg(t, 1.4, 1.8));
  const f1 = easeOut(seg(t, 2.2, 2.6));
  const n = Math.round(lerp(1000, 1010, easeOut(seg(t, 2.3, 2.9))));
  return (
    <Svg label="delta-rs: a separate, real implementation, not a kernel connector. a real table, written and appended, no spark." h={230}>
      <Cell x={25} y={20} w={170} h={28} label="deltalake (python)" o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={110} y1={50} x2={110} y2={lerp(50, 76, easeOut(seg(t, 0.4, 0.7)))} stroke={C.focus} strokeWidth={1.6} />
      <Cell x={25} y={78} w={170} h={32} label="delta-rs" stroke={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={25} y={160} w={170} h={28} label="Delta Kernel" o={0.45 * easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={142} s={11} f={C.second} o={easeOut(seg(t, 0.9, 1.2))}>
        separate, not Kernel
      </T>
      <T x={240} y={30} s={12} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
        _delta_log/
      </T>
      <Cell x={240} y={44} w={290} h={28} label="…000.json · write, 1,000 rows" o={f0} />
      <Cell x={240} y={84} w={290} h={28} label="…001.json · append, 10 rows" stroke={C.second} o={f1} />
      <T x={240} y={140} s={13} f={C.crema} o={f1}>
        {`version 1 · ${num(n)} rows`}
      </T>
      <T x={240} y={176} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        v0's own protocol action:
      </T>
      <T x={240} y={202} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        minReader 1 · minWriter 2
      </T>
    </Svg>
  );
}

// 5 · Predict. The version strip, the table sitting at v1; can the library alone read v0?
export function PredictTimeTravel({ t, answer }: StepCtx) {
  return (
    <Svg label="the table has already moved to version one. can delta-rs still read version zero, alone?" h={200}>
      <Versions t={t} y={30} />
      <T x={60} y={124} s={13} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        read v0 again, no cluster?
      </T>
      <AnswerRow y={160} label="read v0, alone" answer={answer} value="yes, by number" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={194} text="every version stays addressable" />
    </Svg>
  );
}

// 6 · Time travel, for real. A reader marker slides from v1 back to v0; the row count drops from 1,010 to v0's 1,000; a crossed-out
// Spark box: none needed.
export function RevealTimeTravelReal({ t }: StepCtx) {
  const b = easeInOut(seg(t, 1.0, 2.0));
  const n = Math.round(lerp(1010, 1000, easeOut(seg(t, 1.6, 2.4))));
  return (
    <Svg label="yes, for real: a time-travel read by version number, delta-rs alone, no spark session anywhere." h={230}>
      <Versions t={t + 1} y={34} back={b} />
      <T x={25} y={20} s={11} f={C.focus} o={b > 0 ? 1 : 0}>
        version=0
      </T>
      <T x={60} y={140} s={15} f={C.focus} o={easeOut(seg(t, 1.5, 1.9))}>
        {`read: ${num(n)} rows`}
      </T>
      <T x={60} y={168} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        exactly the count before the append
      </T>
      <Cell x={420} y={124} w={110} h={30} label="Spark" o={easeOut(seg(t, 3.0, 3.3))} />
      <Cross x={545} y={139} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={420} y={190} s={11} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        the format's own
      </T>
    </Svg>
  );
}

// 7 · One call, two features. The add_feature call lands; reader and writer versions count 1→3 and 2→7; the feature lists appear.
export function RevealFeaturesEnabled({ t }: StepCtx) {
  const r = Math.round(lerp(1, 3, easeOut(seg(t, 1.2, 2.0))));
  const w = Math.round(lerp(2, 7, easeOut(seg(t, 1.2, 2.0))));
  const j = easeOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="one call enables deletion vectors and row tracking for real. the table's own protocol numbers jump." h={230}>
      <Cell x={25} y={16} w={400} h={30} label="add_feature([DeletionVectors, RowTracking])" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={84} label="minReaderVersion" value={String(r)} valueColor={j > 0.99 ? C.focus : C.crema} k={easeOut(seg(t, 0.8, 1.1))} />
      <Row y={124} label="minWriterVersion" value={String(w)} valueColor={j > 0.99 ? C.focus : C.crema} k={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={172} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        writer needs
      </T>
      <T x={575} y={172} s={12} f={C.second} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        deletionVectors, rowTracking
      </T>
      <T x={25} y={206} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        reader needs
      </T>
      <T x={575} y={206} s={12} f={C.second} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        deletionVectors
      </T>
    </Svg>
  );
}

// 8 · Variant, the same switch. variantType lands in both lists; then collations and geospatial chips slide in under "in Kernel".
export function RevealVariantFeature({ t }: StepCtx) {
  const c1 = easeOut(seg(t, 2.2, 2.7));
  const c2 = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="the same switch enables variant, back to topic eight. collations and geospatial land the same way, in kernel." h={230}>
      <Cell x={25} y={16} w={250} h={30} label="add_feature([VariantType])" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={84} label="writer needs" value="variantType" valueColor={C.focus} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={124} label="reader needs" value="variantType" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Cell x={25} y={lerp(184, 160, c1)} w={130} h={28} label="collations" stroke={C.second} o={c1} />
      <Cell x={175} y={lerp(184, 160, c2)} w={130} h={28} label="geospatial" stroke={C.second} o={c2} />
      <T x={330} y={179} s={12} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        in Delta Kernel, 4.2
      </T>
    </Svg>
  );
}

// 9 · The release line. Delta 4.4 ticks off three Spark versions; type widening's bar runs preview 3.2 to full 4.0; variant shredding
// sits under a preview tag at 4.3.
export function RevealReleaseLinePrecise({ t }: StepCtx) {
  const sp = ['4.0.1', '4.1.0', '4.2.0'];
  const tw = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="the 4.x line, precisely: spark compatibility, identity columns, type widening since four oh, and variant shredding -- still preview-named in 4.3." h={250}>
      <T x={25} y={30} s={13} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Delta 4.4, tested on Spark
      </T>
      {sp.map((v, i) => (
        <g key={v}>
          <Cell x={25 + i * 100} y={44} w={86} h={28} label={v} o={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))} />
          <MiniTick x={62 + i * 100} y={86} k={easeOut(seg(t, 0.7 + i * 0.3, 1.0 + i * 0.3))} />
        </g>
      ))}
      <T x={25} y={110} s={13} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        type widening
      </T>
      <line x1={190} y1={106} x2={lerp(190, 400, tw)} y2={106} stroke={C.focus} strokeWidth={3} />
      <T x={190} y={130} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        preview 3.2
      </T>
      <T x={400} y={130} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        full 4.0
      </T>
      <T x={25} y={180} s={13} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        variant shredding, 4.3
      </T>
      <Cell x={25} y={196} w={250} h={30} label="variantShredding-preview" stroke={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))} />
      <T x={300} y={216} s={12} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
        still preview
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delta kernel is the shared library; delta-rs is a separate real one, used right here; the 4.x line's features are real and versioned." h={250}>
      <Row y={40} label="Delta Kernel" value="the shared library" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="delta-rs" value="separate, used here" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the 4.x line" value="real, versioned" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
