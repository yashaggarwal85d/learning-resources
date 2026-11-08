import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A real FFI boundary is a protocol: who frees a handle, where a
// failure's real answer is written, and what a panic crossing the
// line is actually defined to do.
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


// ── 1 · Does a second free on the same handle get rejected (predict) ───
export function OwnershipPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real handle, freed once, then freed again"
        lines={['free_buffer_handle(handle); // first free', 'free_buffer_handle(handle); // same handle, again']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: ownership kept by hand ───────────────────────────────────
// The boundary runs down the middle: Rust's table of live handles on the left, the foreign caller on the right.
// Each handle is allocated and crosses over, then comes back to be freed and is ticked off the table. Then the
// caller frees the same handle a second time: it bounces off the boundary, struck out, and the table stays empty.
export function OwnershipReveal({ t }: StepCtx) {
  const pairs = [0, 1, 2];
  const second = easeInOut(seg(t, 1.75, 2.05));
  const bounce = easeOut(seg(t, 2.05, 2.35));
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={240}>
      <Draw pts={[[300, 14], [300, 150]]} t={t} from={0} to={0.3} stroke={C.mocha} w={2} dash="6 5" pen={false} />
      <T x={150} y={28} s={13} a="middle" f={C.latte} o={ez(t, 0)}>rust: live handles</T>
      <T x={450} y={28} s={13} a="middle" f={C.latte} o={ez(t, 0)}>foreign caller</T>
      <rect x={60} y={50} width={180} height={70} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.1)} />
      {pairs.map((i) => {
        const a = 0.25 + i * 0.5;
        const alloc = ez(t, a, 0.15);
        const out = easeInOut(seg(t, a, a + 0.2));
        const back = easeInOut(seg(t, a + 0.25, a + 0.45));
        const freed = ez(t, a + 0.45, 0.1);
        const x = 100 + i * 50;
        return (
          <g key={i}>
            <rect x={x - 10} y={75} width={20} height={20} rx={3} fill={C.second} opacity={alloc * (1 - freed)} />
            {out > 0 && back < 1 && <rect x={lerp(lerp(x, 440, out), x, back) - 10} y={lerp(75, 165, out * (1 - back)) - 10 + 10} width={20} height={20} rx={3} fill={C.second} opacity={0.9} />}
            <path d={`M${400 + i * 40} 190 l4 4 l8 -9`} fill="none" stroke={C.focus} strokeWidth={2} strokeDasharray={20} strokeDashoffset={20 * (1 - ez(t, a + 0.45, 0.2))} />
          </g>
        );
      })}
      {second > 0 && <rect x={lerp(440, 306, second) + bounce * 90 - 10} y={160} width={20} height={20} rx={3} fill={C.cherryText} opacity={1 - ez(t, 2.4, 0.3) * 0.5} />}
      <path d="M314 154 l16 16 m0 -16 l-16 16" stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={46} strokeDashoffset={46 * (1 - ez(t, 2.05, 0.3))} />
      <Line t={t} at={1.2} y={210} text="every correct pair: accepted once each" mark="tick" />
      <Line t={t} at={2.1} y={234} text="a second free: genuinely rejected" mark="cross" mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · What happens to the out pointer on failure (predict) ────────────
export function ErrorCodePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a status code crosses back; so does an out pointer"
        lines={['checked_divide(10, 0, out); // denominator is zero', '// what happens to *out now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: success writes, failure leaves it alone ─────────────────
// Two calls cross the boundary. The success comes back with status 0 and its value drops into the caller's out slot.
// The failure comes back with its own status code, and the out slot keeps its old placeholder, locked on.
export function ErrorCodeReveal({ t }: StepCtx) {
  const ok = easeInOut(seg(t, 0.3, 0.8));
  const fill = easeOut(seg(t, 0.8, 1.0));
  const err = easeInOut(seg(t, 1.1, 1.6));
  const row = (y: number, label: string) => (
    <g opacity={ez(t, 0)}>
      <T x={30} y={y + 5} s={13} f={C.latte}>{label}</T>
      <rect x={420} y={y - 14} width={90} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={465} y={y - 22} s={13} a="middle" f={C.taupe}>out</T>
    </g>
  );
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={250}>
      <Draw pts={[[300, 20], [300, 140]]} t={t} from={0} to={0.3} stroke={C.mocha} w={2} dash="6 5" pen={false} />
      {row(50, 'success')}
      {row(115, 'failure')}
      {ok > 0 && ok < 1 && <circle cx={lerp(200, 410, ok)} cy={50} r={6} fill={C.focus} />}
      <rect x={445} y={40} width={40} height={20} rx={3} fill={C.focus} opacity={fill} />
      {err > 0 && err < 1 && <circle cx={lerp(200, 410, err)} cy={115} r={6} fill={C.cherryText} />}
      <T x={350} y={120} s={13} f={C.cherryText} o={ez(t, 1.6)}>code</T>
      <rect x={445} y={105} width={40} height={20} rx={3} fill="none" stroke={C.taupe} strokeDasharray="3 3" opacity={ez(t, 0.1)} />
      <Reticle x={465} y={115} w={104} h={40} t={t} at={1.8} />
      <Line t={t} at={0.4} y={176} text="a real success, a real failure, compared" />
      <Line t={t} at={1.4} y={208} text="failure: the out pointer, untouched" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={240} text="a code alone is only half the protocol" />
    </Svg>
  );
}

// ── 5 · Does the caller survive a panic crossing C-unwind (predict) ─────
export function UnwindPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real panic, inside an extern C-unwind function"
        lines={['catch_unwind(|| run_step(true)); // it panics', '// does the caller keep running after this?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: caught, caller genuinely keeps running (takeaway) ─────
export function UnwindReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.4, 0.7));
  const resume = easeOut(seg(t, 0.95, 1.2));
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real unwind, caught at the boundary</T>
      <Draw pts={[[70, 80], [200, 80]]} t={t} from={0.4} to={0.7} stroke={C.cherry} w={2} pen />
      <circle cx={70 + travel * 130} cy={80} r={5} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <rect x={200} y={65} width={60} height={30} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.75, 0.2)} />
      <circle cx={200 + resume * 90} cy={80} r={5} fill={C.caramel} opacity={fa(t, 0.95, 0.2)} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>the caller: genuinely still running</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>C-unwind defines exactly this crossing</T>
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, a resource crosses the boundary into a Rust value. The value's scope bracket draws
// round it and closes; as it closes the destructor fires and the release travels back to the foreign side.
export function DocsReveal({ t }: StepCtx) {
  const in_ = easeInOut(seg(t, 0.8, 1.2));
  const scope = seg(t, 1.2, 1.8);
  const rel = easeInOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="Rustonomicon / Rust Reference, quoted" h={220}>
      <Quote t={t} lines={['destructors release a handed-off resource', 'cleaning up the stack: a named duty']} hot={0} y0={40} gap={38} beat={0.45} />
      <Draw pts={[[400, 110], [400, 210]]} t={t} from={0.6} to={0.8} stroke={C.mocha} w={2} dash="6 5" pen={false} />
      <T x={500} y={130} s={13} a="middle" f={C.latte} o={ez(t, 0.6)}>foreign side</T>
      <rect x={lerp(470, 200, in_) - 14} y={146} width={28} height={22} rx={3} fill={C.second} opacity={in_ > 0 ? 1 - rel : 0} />
      <Draw pts={[[150, 126], [140, 126], [140, 188], [150, 188]]} t={t} from={1.2} to={1.5} stroke={C.caramel} w={2} pen={false} />
      <Draw pts={[[250, 126], [260, 126], [260, 188], [250, 188]]} t={t} from={1.5} to={1.8} stroke={C.caramel} w={2} pen={false} />
      <T x={200} y={206} s={13} a="middle" f={C.crema} o={ez(t, 1.8) * (scope > 0.9 ? 1 : 0)}>drop</T>
      {rel > 0 && rel < 1 && <circle cx={lerp(200, 480, rel)} cy={157} r={6} fill={C.focus} />}
      <T x={500} y={186} s={13} a="middle" f={C.focus} o={ez(t, 2.4)}>released</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: the boundary is a protocol, not just layout"
      rows={['who frees a handle, kept by hand, both sides', 'where a failure writes its own real answer', 'what a panic crossing the line must do']}
      gap={70}
      y0={60}
    />
  );
}
