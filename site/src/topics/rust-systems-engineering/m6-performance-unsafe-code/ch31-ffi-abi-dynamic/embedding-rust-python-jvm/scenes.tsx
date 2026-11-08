import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Draw, Reticle, Decode } from '../../../../../reels/kit';

// PyO3 can hand Python the same real buffer it already has, and can
// explicitly step out of the interpreter's own way while real Rust
// work runs; a data-platform deployment built this way gets both for
// free, if the code asks for them.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


// ── 1 · Does the address match on both sides (predict) ──────────────────
export function ZeroCopyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real bytearray, read from the Rust side"
        lines={['buffer_address_py(buf); // reads the real address', '// does ctypes see the identical address in Python?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: zero copies ──────────────────────────────────────────────
// One buffer in memory. Python's pointer is already on it. Rust's pointer swings in from the other side and lands
// on the very same spot; the dashed copy a naive binding would have made appears, and is struck out: never made.
export function ZeroCopyReveal({ t }: StepCtx) {
  const swing = easeInOut(seg(t, 0.6, 1.3));
  const ghost = ez(t, 1.5, 0.3);
  const ang = lerp(50, 0, swing);
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={240}>
      <rect x={220} y={60} width={160} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={230 + i * 21} y={70} width={15} height={24} rx={2} fill={C.latte} opacity={ez(t, 0.05 + i * 0.03)} />
      ))}
      <T x={300} y={44} s={13} a="middle" f={C.latte} o={ez(t, 0)}>buffer</T>
      <g opacity={ez(t, 0.1)}>
        <T x={40} y={87} s={13} f={C.crema}>python</T>
        <line x1={110} y1={82} x2={212} y2={82} stroke={C.second} strokeWidth={2.5} />
        <path d="M212 82 l-9 -5 v10 z" fill={C.second} />
      </g>
      <T x={560} y={87} s={13} a="end" f={C.crema} o={ez(t, 0.3)}>rust</T>
      <g transform={`rotate(${ang.toFixed(1)} 490 82)`} opacity={ez(t, 0.3)}>
        <line x1={490} y1={82} x2={388} y2={82} stroke={C.caramel} strokeWidth={2.5} />
        <path d="M388 82 l9 -5 v10 z" fill={C.caramel} />
      </g>
      <Decode text="same address" t={t} at={1.3} dur={0.4} x={300} y={130} s={13} a="middle" f={C.focus} w={600} />
      <g opacity={ghost}>
        <rect x={420} y={130} width={130} height={36} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 4" />
        <T x={485} y={153} s={13} a="middle" f={C.taupe}>copy</T>
        <path d="M430 136 l110 24 m0 -24 l-110 24" stroke={C.cherryText} strokeWidth={2} strokeDasharray={240} strokeDashoffset={240 * (1 - ez(t, 1.8, 0.4))} />
      </g>
      <Line t={t} at={0.6} y={200} text="the real address, read from the Rust side" />
      <Line t={t} at={1.3} y={232} text="the real address, read from the Python side" mf={C.second} />
    </Svg>
  );
}

// ── 3 · How much progress while the GIL is held (predict) ───────────────
export function HeldGilPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real busy loop, the GIL held the whole time"
        lines={['busy_wait_holding_gil_py(200); // real CPU work', '// a separate Python thread, counting, meanwhile']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: very little progress (takeaway) ────────────────────────
export function HeldGilReveal({ t }: StepCtx) {
  const rust = easeOut(seg(t, 0.4, 0.75));
  const counter = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the other thread's own real counter</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>Rust work (GIL held)</T>
      <rect x={60} y={82} width={rust * 260} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>other thread's counter</T>
      <rect x={60} y={119} width={counter * 15} height={16} rx={3} fill={C.taupe} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>genuinely very little progress made</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>holding it leaves almost no room to run</T>
    </Svg>
  );
}

// ── 5 · Does releasing it change that (predict) ──────────────────────────
export function ReleasedGilPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical real work, the GIL released now"
        lines={['busy_wait_releasing_gil_py(200); // same real work', '// does the other thread now get more done?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: dramatically more progress (takeaway) ──────────────────
export function ReleasedGilReveal({ t }: StepCtx) {
  const rust = easeOut(seg(t, 0.4, 0.75));
  const counter = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical counter, the GIL released now</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>Rust work (GIL released)</T>
      <rect x={60} y={82} width={rust * 260} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>other thread's counter</T>
      <rect x={60} y={119} width={counter * 230} height={16} rx={3} fill={C.cherry} opacity={0.85} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>many times more real progress made</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>detach is the act that lets this happen</T>
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, the interpreter's lock sits on the Rust call. detach lifts it off, and from that
// moment other Python work runs on its own track at the same time as Rust's, both bars drawing together.
export function DocsReveal({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="PyO3 guide / PyByteArrayMethods docs, quoted" h={220}>
      <Quote t={t} lines={['detach: other work runs while Rust runs', 'as_bytes: the buffer itself, not a copy']} hot={0} y0={40} gap={38} beat={0.45} />
      <T x={30} y={146} s={13} f={C.crema} o={ez(t, 0.7)}>rust</T>
      <T x={30} y={186} s={13} f={C.crema} o={ez(t, 0.7)}>python</T>
      <g transform={`translate(${(lift * 40).toFixed(1)} ${(-lift * 22).toFixed(1)})`} opacity={ez(t, 0.7) * (1 - 0.7 * lift)}>
        <path d="M128 134 v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke={C.second} strokeWidth={2} />
        <rect x={124} y={134} width={22} height={16} rx={2} fill={C.second} />
      </g>
      <T x={190} y={118} s={13} f={C.second} o={ez(t, 1.2)}>detach</T>
      <Draw pts={[[160, 141], [560, 141]]} t={t} from={1.4} to={2.5} stroke={C.caramel} w={8} pen={false} />
      <Draw pts={[[160, 181], [560, 181]]} t={t} from={1.4} to={2.5} stroke={C.second} w={8} pen={false} />
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: PyO3 gets both, if the code asks"
      rows={['the same real buffer, handed over, not copied', 'the interpreter, explicitly stepped out of', 'neither happens unless the code asks for it']}
      gap={70}
      y0={60}
    />
  );
}
