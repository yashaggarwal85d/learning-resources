import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// A structured field sums exactly, every time, no matter how its own
// event is worded; a formatted sentence can silently lose the
// identical value the moment it is phrased differently; and a real,
// specified format like traceparent survives being built by one
// program and parsed by a completely different one, exactly.
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


// ── 1 · Does the structured field sum correctly (predict) ───────────────
export function StructuredPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="three events, one real typed field each"
        lines={['info!(attempt = 1u64, "attempt 1 of 3 failed")', '// sum the real field directly: correct total?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the typed field sums exactly ─────────────────────────────
// Three events, each worded differently (their message lines are scribbles of different lengths), each carrying the
// same typed attempt field. The fields lift out of their events one by one and drop into the sum, which counts up
// to its exact total however the sentences were worded.
export function StructuredReveal({ t }: StepCtx) {
  const vals = [1, 2, 3];
  const lens = [150, 90, 120];
  const lift = (i: number) => easeInOut(seg(t, 0.8 + i * 0.35, 1.2 + i * 0.35));
  const sum = vals.reduce((s, v, i) => s + (lift(i) >= 1 ? v : 0), 0);
  return (
    <Svg label="field_demo, captured" h={240}>
      {vals.map((v, i) => {
        const y = 26 + i * 44;
        const k = ez(t, 0.1 + i * 0.12);
        return (
          <g key={v}>
            <g opacity={k} transform={`translate(${((1 - k) * -20).toFixed(1)} 0)`}>
              <rect x={30} y={y} width={300} height={34} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} />
              <rect x={44} y={y + 13} width={lens[i]} height={8} rx={2} fill={C.taupe} />
            </g>
            <g transform={`translate(${lerp(0, 440 - 270, lift(i)).toFixed(1)} ${lerp(0, 70 - y + 4, lift(i)).toFixed(1)})`} opacity={k * (lift(i) >= 1 ? 0 : 1)}>
              <rect x={250} y={y + 6} width={66} height={22} rx={11} fill="none" stroke={C.second} strokeWidth={1.5} />
              <T x={283} y={y + 22} s={13} a="middle" f={C.second}>{v}</T>
            </g>
          </g>
        );
      })}
      <rect x={420} y={50} width={130} height={60} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.5)} />
      <T x={485} y={42} s={13} a="middle" f={C.latte} o={ez(t, 0.5)}>sum</T>
      <T x={485} y={90} s={22} a="middle" f={C.focus} w={600} o={ez(t, 0.5)}>{sum || ''}</T>
      <Line t={t} at={0.8} y={196} text="attempt field: 1, 2, 3" mf={C.second} />
      <Line t={t} at={2.0} y={230} text="structured total: 6, genuinely right" mark="tick" />
    </Svg>
  );
}

// ── 3 · Does the formatted text give the same total (predict) ───────────
export function FormattedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same total, pulled from the message text"
        lines={['"third attempt now running" // no digit at all', '// re-parse the sentence: same total?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the formatted total is genuinely wrong (takeaway) ─────
export function FormattedReveal({ t }: StepCtx) {
  const bars = [0, 1, 2];
  return (
    <Svg label="field_demo, captured" h={210}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>recovered from text: 1, 1, 1</T>
      {bars.map((i) => {
        const start = 0.2 + i * 0.15;
        const grow = easeOut(seg(t, start, start + 0.25));
        return (
          <rect key={i} x={30 + i * 50} y={95 - grow * 14} width={30} height={grow * 14} fill={C.cherry} opacity={fa(t, start, 0.2)} />
        );
      })}
      <Draw pts={[[200, 60], [200, 85]]} t={t} from={0.6} to={0.75} stroke={C.caramel} w={2} pen />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={150} y={95} width={210} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={255} y={122} s={13} a="middle" f={C.mocha}>total: 3, wrong (should be 6)</T>
      </g>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a sentence's own words are not a value</T>
    </Svg>
  );
}

// ── 5 · Does the traceparent header round-trip (predict) ────────────────
export function TraceContextPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real traceparent header, built then parsed"
        lines={['00-4bf92f35...e4736-00f067aa...02b7-01', '// round-trips exactly? a bad header rejected?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it round-trips, the bad header is rejected (takeaway) ─
export function TraceContextReveal({ t }: StepCtx) {
  const good = easeOut(seg(t, 0.2, 0.5));
  const bad = easeOut(seg(t, 0.35, 0.6));
  return (
    <Svg label="field_demo, captured" h={210}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>built header</T>
      <Draw pts={[[90, 35], [260, 65]]} t={t} from={0.2} to={0.5} stroke={C.caramel} w={2} pen />
      <circle cx={90 + good * 170} cy={35 + good * 30} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={30} y={85} s={11} f={C.latte} o={fa(t, 0.3, 0.2)}>malformed header</T>
      <Draw pts={[[110, 90], [230, 90]]} t={t} from={0.35} to={0.6} stroke={C.latte} w={2} pen />
      <circle cx={110 + bad * 60} cy={90} r={5} fill={C.cherry} opacity={fa(t, 0.35, 0.2)} />
      <circle cx={230} cy={90} r={7} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.6, 0.2)} />
      <g opacity={fa(t, 0.75, 0.3)}>
        <rect x={190} y={45} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={270} y={70} s={12} a="middle" f={C.mocha}>exact round-trip</T>
        <T x={240} y={112} s={11} f={C.latte}>rejected, not guessed at</T>
      </g>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a specified format survives a new parser</T>
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, a trace id and a parent id settle into their fixed slots of a header as exact values.
// Next to them, a field as key and value stays typed, while the same fact as free text blurs into a scribble.
export function DocsReveal({ t }: StepCtx) {
  const slots = [
    { x: 40, w: 170, label: 'trace id' },
    { x: 220, w: 110, label: 'parent id' },
  ];
  return (
    <Svg label="W3C and tracing's own docs, quoted" h={220}>
      <Quote t={t} lines={['a trace id: a real, specific byte value', 'fields: key-value data, not free text']} hot={1} y0={40} gap={38} beat={0.45} />
      {slots.map((s, i) => {
        const k = easeInOut(seg(t, 0.8 + i * 0.3, 1.2 + i * 0.3));
        return (
          <g key={s.label}>
            <rect x={s.x} y={130} width={s.w} height={30} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={ez(t, 0.7)} />
            <Decode text={s.label} t={t} at={1.0 + i * 0.3} dur={0.4} x={s.x + s.w / 2} y={lerp(120, 150, k)} s={13} a="middle" f={C.caramel} />
          </g>
        );
      })}
      <g opacity={ez(t, 1.7)} transform={`translate(${((1 - ez(t, 1.7)) * 20).toFixed(1)} 0)`}>
        <rect x={360} y={130} width={200} height={30} rx={15} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={460} y={150} s={13} a="middle" f={C.second}>key = value</T>
      </g>
      <rect x={360} y={176} width={200 * (1 - 0.4 * ez(t, 2.1))} height={8} rx={2} fill={C.taupe} opacity={ez(t, 1.9) * (1 - 0.6 * ez(t, 2.1))} />
      <path d="M380 172 l14 14 m0 -14 l-14 14" stroke={C.cherryText} strokeWidth={2} strokeDasharray={40} strokeDashoffset={40 * (1 - ez(t, 2.2, 0.3))} />
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a field that survives being queried"
      rows={['a structured field sums exactly, always', 'a sentence can silently lose the value', 'a specified format survives a new parser']}
      gap={70}
      y0={60}
    />
  );
}
