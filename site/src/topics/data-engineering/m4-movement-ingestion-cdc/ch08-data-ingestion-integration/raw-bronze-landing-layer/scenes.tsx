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

/** An empty dashed slot, for something deleted or never there. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A layer box (raw or silver) with `n` record lines inside, the lines shown by `k`. */
function Layer({
  x,
  y,
  w,
  h,
  label,
  k,
  lines = 4,
  f = C.latte,
  dash = false,
  o = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  k: number;
  lines?: number;
  f?: string;
  dash?: boolean;
  o?: number;
}) {
  return (
    <g opacity={o}>
      <T x={x} y={y - 8} s={11} f={C.latte}>
        {label}
      </T>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : undefined} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + 12} y={y + 12 + i * 16} width={(w - 24) * clamp(k * lines - i, 0, 1)} height={9} rx={2} fill={f} />
      ))}
    </g>
  );
}

/** A reply arrow from x1 back left toward x2, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

// 0 · Hook. Raw and silver side by side. The bug is found a year on; silver's rows are overwritten in place, raw's
// records fade out as retention closes, and the rebuild arrow reaches an empty box.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const over = t >= 1.4;
  const gone = easeOut(seg(t, 2.0, 2.6));
  const arrow = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a currency bug is found a year later; silver was overwritten, raw was already deleted; the rebuild arrow points at an empty box." h={220}>
      <T x={300} y={20} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        bug found, a year later
      </T>
      <Layer x={25} y={50} w={170} h={80} label="raw" k={a} o={1} f={C.latte} dash={gone >= 1} />
      {gone > 0 && <rect x={30} y={55} width={160} height={70} fill={C.espresso} opacity={gone} />}
      <Layer x={380} y={50} w={170} h={80} label="silver" k={a} f={over ? C.second : C.latte} />
      <Req x1={200} x2={375} y={90} k={arrow} label={arrow > 0 ? 'rebuild' : undefined} f={C.cherryText} />
      {over && (
        <T x={380} y={160} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
          overwritten in place
        </T>
      )}
      {gone > 0 && (
        <T x={25} y={160} s={11} f={C.latte} o={gone}>
          deleted at retention
        </T>
      )}
      {t >= 3.8 && (
        <T x={300} y={205} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
          nothing left to rebuild from
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Raw kept whole; a fixed transform sits between it and an empty silver slot. Once answered, the slot fills
// with the correct numbers from raw alone.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="this raw layer was never deleted. Can a replay with a fixed transform alone reproduce the correct numbers?" h={200}>
      <Layer x={25} y={40} w={170} h={80} label="raw, never deleted" k={easeOut(seg(t, 0.1, 0.7))} />
      <Req x1={200} x2={222} y={80} k={easeOut(seg(t, 0.7, 0.9))} />
      <Cell x={225} y={66} w={150} label="fixed transform" o={easeOut(seg(t, 0.8, 1.2))} stroke={C.focus} />
      <Req x1={380} x2={405} y={80} k={v} f={C.focus} />
      {v > 0 ? <Cell x={410} y={66} w={140} label="correct numbers" o={v} stroke={C.focus} f={C.focus} /> : <Hole x={410} y={66} w={140} o={easeOut(seg(t, 1.0, 1.4))} />}
      <AnswerRow y={178} label="replay alone" answer={answer} value="yes, enough" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

const REC = ['o1 · 100 USD', 'o2 · 200 EUR', 'o3 · 50 USD'];
// 2 · Append-only. Three records at offsets 0-2; the correction pops in as a fourth record at offset 3, pointing back to
// offset 1. Locks close under the first three: unchanged. Replay reads o2 as 210.
export function RevealAppendOnly({ t }: StepCtx) {
  const c = easeOutBack(seg(t, 1.2, 1.6));
  return (
    <Svg label="the real run: a correction arrives as a brand-new record; the first three stay byte for byte unmutated." h={220}>
      {REC.map((r, i) => (
        <g key={i}>
          <T x={25 + i * 135} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))}>
            {`offset ${i}`}
          </T>
          <Cell x={25 + i * 135} y={50} w={125} label={r} o={easeOut(seg(t, 0.1 + i * 0.2, 0.5 + i * 0.2))} />
          <Lock x={79 + i * 135} y={100} k={easeOut(seg(t, 2.4 + i * 0.2, 2.8 + i * 0.2))} f={C.focus} />
        </g>
      ))}
      {c > 0 && (
        <g>
          <T x={430} y={40} s={11} f={C.second} o={clamp(c, 0, 1)}>
            offset 3
          </T>
          <Cell x={430} y={50} w={125} label="o2 · 210 EUR" o={clamp(c, 0, 1)} stroke={C.second} />
        </g>
      )}
      {t >= 1.7 && (
        <T x={492} y={104} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.7, 2.0))}>
          corrects offset 1
        </T>
      )}
      {t >= 3.0 && (
        <T x={25} y={150} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
          first three: byte for byte unchanged
        </T>
      )}
      {t >= 3.6 && (
        <T x={25} y={185} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
          replay reads o2 as 210
        </T>
      )}
    </Svg>
  );
}

/** A checksum drawn as a fixed barcode at (x, y), revealed left to right by `k`. */
const BARS = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3];
function Barcode({ x, y, k, f = C.latte }: { x: number; y: number; k: number; f?: string }) {
  let cx = x;
  return (
    <g>
      {BARS.map((b, i) => {
        const el = <rect key={i} x={cx} y={y} width={b * 2} height={18} fill={f} opacity={clamp(k * BARS.length - i, 0, 1)} />;
        cx += b * 2 + 3;
        return el;
      })}
    </g>
  );
}

// 3 · Rebuild, measured. Raw builds silver and its checksum prints; silver is deleted to a dashed box; raw builds it
// again and the second checksum prints under the first, bar for bar the same.
export function RevealRebuildMeasured({ t }: StepCtx) {
  const b1 = easeOut(seg(t, 0.5, 1.1));
  const del = easeOut(seg(t, 1.7, 2.1));
  const b2 = easeOut(seg(t, 2.4, 3.0));
  const s1 = t < 1.7 ? b1 : 1 - del;
  return (
    <Svg label="the real run: silver built twice from the identical raw layer, checksummed both times." h={200}>
      <Layer x={25} y={40} w={150} h={80} label="raw" k={easeOut(seg(t, 0, 0.4))} />
      {t < 2.4 && <Req x1={180} x2={375} y={60} k={b1} label="build" />}
      {t >= 2.4 && <Req x1={180} x2={375} y={60} k={b2} label="build again" />}
      {t < 2.4 ? <Cell x={380} y={46} w={170} label="silver" o={s1} /> : <Cell x={380} y={46} w={170} label="silver" o={b2} />}
      {t >= 1.7 && t < 2.4 && <Hole x={380} y={46} w={170} o={del} />}
      <Barcode x={380} y={92} k={easeOut(seg(t, 1.0, 1.5))} />
      <Barcode x={380} y={122} k={easeOut(seg(t, 3.0, 3.5))} f={C.focus} />
      <MiniTick x={535} y={114} k={easeOut(seg(t, 3.6, 4.0))} />
      {t >= 3.7 && (
        <T x={380} y={172} s={13} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
          checksums match
        </T>
      )}
    </Svg>
  );
}

// 4 · Metadata. One record card; its three stamps slide in one by one: when it arrived, where from, which schema. Then
// one stamp is crossed out and the replay turns into a guess.
export function RevealMetadataFields({ t }: StepCtx) {
  const fields = [
    ['ingest_ts', 'when it arrived'],
    ['source_offset', 'where in the source'],
    ['schema_version', 'which schema'],
  ];
  const x2 = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="every raw record carries three fields: when it arrived, where from, and under which schema." h={200}>
      <rect x={100} y={24} width={400} height={128} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={120} y={48} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        order o2 · 200 EUR
      </T>
      {fields.map(([k, v], i) => {
        const p = easeOut(seg(t, 0.6 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={i} opacity={p}>
            <T x={lerp(110, 124, p)} y={80 + i * 26} s={12} f={C.focus}>
              {k}
            </T>
            <T x={320} y={80 + i * 26} s={12} f={C.crema}>
              {v}
            </T>
          </g>
        );
      })}
      <Cross x={112} y={102} k={x2} />
      {x2 > 0 && (
        <T x={300} y={185} s={13} f={C.cherryText} a="middle" o={x2}>
          drop one: replay becomes a guess
        </T>
      )}
    </Svg>
  );
}

// 5 · Bug fix, measured. Four orders, a buggy column and a fixed column. Only o2 (EUR) and o3 (GBP) change, outlined
// as before/after; o1 and o4 tick as identical.
export function RevealBugFixMeasured({ t }: StepCtx) {
  const rows = [
    ['o1 · USD', '100', '100'],
    ['o2 · EUR', '200', '200 × 0.92'],
    ['o3 · GBP', '300', '300 × 0.79'],
    ['o4 · USD', '400', '400'],
  ];
  return (
    <Svg label="the real run: the identical raw layer rebuilt once buggy, once fixed. Only the rows the bug touched differ." h={220}>
      <T x={285} y={22} s={11} f={C.latte} a="middle">
        buggy
      </T>
      <T x={465} y={22} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        fixed
      </T>
      {rows.map(([o, b, f], i) => {
        const diff = b !== f;
        const p = easeOut(seg(t, 1.2 + i * 0.5, 1.6 + i * 0.5));
        return (
          <g key={i}>
            <Cell x={25} y={30 + i * 40} w={160} label={o} o={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))} />
            <Cell x={210} y={30 + i * 40} w={150} label={b} o={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} stroke={diff && p > 0 ? C.second : C.mocha} />
            <Cell x={390} y={30 + i * 40} w={160} label={f} o={p} stroke={diff ? C.second : C.mocha} />
            {!diff && <MiniTick x={368} y={42 + i * 40} k={easeOut(seg(t, 1.6 + i * 0.5, 2.0 + i * 0.5))} />}
          </g>
        );
      })}
      {t >= 3.6 && (
        <T x={300} y={208} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          only o2 and o3 differ
        </T>
      )}
    </Svg>
  );
}

// 6 · Tension. The append-only strip grows to the edge; a retention line drops in across it; the records past the line
// outline cherry. Two arrows pull opposite ways on them.
export function RevealRetentionTension({ t }: StepCtx) {
  const n = 14 * easeInOut(seg(t, 0.2, 1.8));
  const line = easeOut(seg(t, 2.1, 2.5));
  const pull = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="an append-only strip that never shrinks, against a duty to keep personal data no longer than necessary." h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        append-only: never shrinks
      </T>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + i * 37} y={40} width={30} height={30} rx={3} fill={C.cocoa} stroke={line >= 1 && i < 7 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={clamp(n - i, 0, 1)} />
      ))}
      {line > 0 && <line x1={280} y1={32} x2={280} y2={lerp(32, 92, line)} stroke={C.cherryText} strokeWidth={2.5} strokeDasharray="5 4" />}
      {line > 0 && (
        <T x={280} y={112} s={11} f={C.cherryText} a="middle" o={line}>
          duty: keep no longer than needed
        </T>
      )}
      <Req x1={300} x2={545} y={145} k={pull} f={C.focus} />
      <Back x1={270} x2={25} y={145} k={pull} f={C.cherryText} />
      {pull > 0 && (
        <g opacity={pull}>
          <T x={422} y={136} s={11} f={C.focus} a="middle">
            rebuild needs it
          </T>
          <T x={150} y={136} s={11} f={C.cherryText} a="middle">
            the law: let it go
          </T>
        </g>
      )}
      {t >= 3.8 && (
        <T x={300} y={185} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
          both pull on the same record
        </T>
      )}
    </Svg>
  );
}

// 7 · Tokenization. Three raw records show an email; each swaps to a token. A separate vault, the one mutable piece,
// holds the only mapping back.
export function RevealTokenization({ t }: StepCtx) {
  const sw = t >= 1.2;
  const v = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="an email in every raw record is replaced by a token; a small, separate vault maps it back." h={200}>
      <T x={25} y={28} s={11} f={C.latte}>
        raw, append-only
      </T>
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={25 + i * 140} y={36} w={125} label={sw ? 'tok-1' : 'a@example.com'} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} stroke={sw ? C.second : C.mocha} />
      ))}
      <Lock x={460} y={50} k={easeOut(seg(t, 1.5, 1.9))} f={C.focus} />
      {v > 0 && <line x1={87} y1={68} x2={200} y2={140} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" opacity={v} />}
      <T x={200} y={112} s={11} f={C.focus} o={v}>
        vault, kept apart
      </T>
      <rect x={200} y={120} width={300} height={40} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 3" opacity={v} />
      {v > 0 && (
        <T x={350} y={145} s={12} f={C.crema} a="middle" o={v}>
          tok-1 → a@example.com
        </T>
      )}
      {t >= 3.0 && (
        <T x={350} y={190} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          the one mutable thing
        </T>
      )}
    </Svg>
  );
}

// 8 · Erasure, measured. Top, plaintext: three records naming a@ are rewritten in cherry. Bottom, tokenized: the raw
// records stand; one vault row fades out; raw's checksum ticks unchanged.
export function RevealErasureMeasured({ t }: StepCtx) {
  const plain = ['a@example.com', 'b@example.com', 'a@example.com', 'a@example.com'];
  const tok = ['tok-1', 'tok-2', 'tok-1', 'tok-1'];
  const er = t >= 1.2;
  const vd = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="the real run: a plaintext erasure mutates three historical records; a tokenized erasure leaves raw's own checksum unchanged." h={220}>
      <T x={25} y={20} s={11} f={C.latte}>
        plaintext raw
      </T>
      {plain.map((p, i) => (
        <Cell key={i} x={25 + i * 135} y={28} w={125} label={er && i !== 1 ? 'erased' : p} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} stroke={er && i !== 1 ? C.cherryText : C.mocha} />
      ))}
      {er && (
        <T x={25} y={76} s={11} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.6))}>
          3 records mutated
        </T>
      )}
      <T x={25} y={102} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        tokenized raw
      </T>
      {tok.map((p, i) => (
        <Cell key={i} x={25 + i * 135} y={110} w={125} label={p} o={easeOut(seg(t, 1.9 + i * 0.1, 2.2 + i * 0.1))} />
      ))}
      <Cell x={25} y={160} w={250} label="tok-1 → a@example.com" o={easeOut(seg(t, 2.2, 2.5)) * (1 - vd)} />
      {vd > 0 && <Hole x={25} y={160} w={250} o={vd} stroke={C.cherryText} />}
      <Cell x={290} y={160} w={250} label="tok-2 → b@example.com" o={easeOut(seg(t, 2.3, 2.6))} />
      {t >= 3.5 && (
        <g opacity={easeOut(seg(t, 3.5, 3.9))}>
          <MiniTick x={25} y={204} k={easeOut(seg(t, 3.6, 4.0))} />
          <T x={45} y={210} s={11} f={C.focus}>
            1 vault row deleted; raw checksum unchanged
          </T>
        </g>
      )}
    </Svg>
  );
}

// 9 · Recap. Four pieces drop into a 2x2: the strip, the three fields, the replay, the vault. A frame closes around all
// four: one design, and everything outside the vault left untouched.
export function Recap({ t }: StepCtx) {
  const parts = ['append-only strip', 'three metadata fields', 'replay rebuilds silver', 'a vault for what changes'];
  const fr = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="an append-only strip, three metadata fields, a replay that rebuilds silver, and a vault for the one thing allowed to change." h={260}>
      {parts.map((p, i) => (
        <Cell key={i} x={i % 2 === 0 ? 30 : 300} y={i < 2 ? 34 : 90} w={250} label={p} o={easeOut(seg(t, 0.2 + i * 0.5, 0.6 + i * 0.5))} stroke={i === 3 ? C.second : C.mocha} />
      ))}
      {fr > 0 && <rect x={18} y={22} width={544} height={110} rx={8} fill="none" stroke={C.focus} strokeWidth={2} opacity={fr} />}
      {fr > 0 && (
        <T x={300} y={164} s={15} f={C.focus} a="middle" o={fr}>
          one design
        </T>
      )}
      {t >= 3.5 && (
        <T x={300} y={205} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
          everything else untouched, on purpose
        </T>
      )}
    </Svg>
  );
}

// 10 · Prove it. Three tokenized records with locks and one vault row. Once answered, the vault row fades to a cherry
// hole and the records tick: untouched.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="an erasure request arrives for a tokenized raw layer. What has to change, and what must not?" h={200}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25 + i * 140} y={30} w={125} label="tok-1" o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} />
          <MiniTick x={80 + i * 140} y={72} k={v} />
        </g>
      ))}
      <Cell x={150} y={100} w={260} label="tok-1 → a@example.com" o={easeOut(seg(t, 0.7, 1.1)) * (1 - v)} />
      {v > 0 && <Hole x={150} y={100} w={260} o={v} stroke={C.cherryText} />}
      <AnswerRow y={178} label="what changes" answer={answer} value="one vault row" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
