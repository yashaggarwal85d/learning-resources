import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// Pin exists because the compiler's generated async state machines can hold a reference into
// their own fields; moving such a value after that reference forms leaves it stale. Every claim
// is executed by examples.py (current stable rustc, edition 2024; pin-project-lite is the one
// real crate dependency, used only for the structural-projection example).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

/** A push-pin glyph at (x, y), scaled by `k`. */
function PinIcon({ x, y, k = 1, f = C.caramel }: { x: number; y: number; k?: number; f?: string }) {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k.toFixed(3)})`}>
      <circle cx={0} cy={-8} r={7} fill={f} />
      <line x1={0} y1={-2} x2={0} y2={10} stroke={f} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

// ── 1 · Can a local point into a sibling local? (predict, hook) ────────────────────────────────
export function SelfPointingLocalsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two ordinary locals, side by side"
        lines={['let mut value = String::from("hello");', 'let mut pointer: *const String = null();', '// could pointer target value\'s own address?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 2 · Named by the standard library itself (no takeaway, "from" step) ────────────────────────
export function NamedByStdlibReveal({ t }: StepCtx) {
  const box = easeOut(seg(t, 0.5, 0.9));
  const fields = easeOut(seg(t, 0.8, 1.2));
  return (
    <Stack>
      <Code title="std::pin's own words" dim={t < 0.1} lines={['// "a key example of such self-referential', '//  types are the state machines generated', '//  by the compiler to implement Future', '//  for async fns"']} t={t} start={0.1} end={0.5} highlight={t > 1.3 ? [1, 2, 3] : [0]} />
      <Svg label="the state machine the compiler generates for an async fn: one of its fields points back at another field inside the same value, a self-reference" h={160} fill>
        <g transform={`translate(0 ${((1 - box) * 20).toFixed(1)})`} opacity={box}>
          <rect x={120} y={24} width={360} height={110} rx={12} fill="none" stroke={C.crema} strokeWidth={1.5} />
          <T x={134} y={18} s={13} f={C.latte}>async fn's future</T>
        </g>
        <g opacity={fields}>
          <rect x={150} y={60} width={120} height={40} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={210} y={85} s={13} a="middle" f={C.crema}>buf</T>
          <rect x={330} y={60} width={120} height={40} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={390} y={85} s={13} a="middle" f={C.crema}>ptr</T>
        </g>
        <Draw pts={Array.from({ length: 25 }, (_, i) => { const u = i / 24; return [lerp(390, 210, u), 100 + Math.sin(u * Math.PI) * 26] as [number, number]; })} t={t} from={1.3} to={1.9} stroke={C.caramel} w={2.5} />
        <T x={300} y={154} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 1.9, 2.2))}>points into itself</T>
        <Reticle x={300} y={79} w={376} h={126} t={t} at={2.2} />
      </Svg>
    </Stack>
  );
}

// ── 3 · Breaks on move (takeaway) ────────────────────────────────────────────────────────────────
export function BreaksOnMoveReveal({ t }: StepCtx) {
  // The struct, with its own pointer arrow curling back into itself, slides to a new spot — but
  // the pointer's target (fixed in place) does not move with it, so the arrow visibly misses.
  const moveX = easeOut(seg(t, 1.1, 1.5)) * 260;
  return (
    <Svg label="self_ref_breaks_on_move.rs: measured, not assumed" h={240}>
      <circle cx={140} cy={60} r={4} fill={C.taupe} opacity={fa(t, 0.3, 0.3)} />
      <g transform={`translate(${moveX},0)`}>
        <rect x={60} y={70} width={160} height={44} rx={6} fill="none" stroke={moveX > 10 ? C.cherryText : C.taupe} strokeWidth={1.5} opacity={fa(t, 0.3, 0.3)} />
        <path d={`M ${140} 70 A 30 30 0 0 1 ${160} 55`} fill="none" stroke={moveX > 10 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={fa(t, 0.6, 0.3)} />
        <T x={140} y={97} s={13} a="middle" f={moveX > 10 ? C.cherryText : C.mocha}>{moveX > 10 ? 'valid: false' : 'valid: true'}</T>
      </g>
      <T x={60} y={150} s={14} f={C.crema} o={fa(t, 1.1, 0.3)}>after the move, it no longer does</T>
      <T x={60} y={190} s={13} f={C.taupe} o={fa(t, 1.7, 0.4)}>the pointer still aims at the old address</T>
    </Svg>
  );
}

// ── 4 · Does Box<T> fix it? (predict) ───────────────────────────────────────────────────────────
export function BoxFixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same struct, now behind a Box"
        lines={['let a: Box<SelfRef> = Box::new(this);', 'let b = a;', '// has moving it into b fixed anything?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 5 · Pin<Ptr> is a promise about the pointee (takeaway) ─────────────────────────────────────
export function PinPromiseReveal({ t }: StepCtx) {
  // Pin wraps around the pointer (drawn growing to enclose it), then an anchor line drops from
  // the wrapped pointer to the pointee, pinning it in place rather than just naming the promise.
  const wrap = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="std::pin's own definition" h={220}>
      <rect x={60} y={30} width={60 + wrap * 60} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={70} y={56} s={12} f={C.crema}>Pin&lt;</T>
      <rect x={100} y={38} width={60} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.1, 0.3)} />
      <T x={130} y={56} s={11} a="middle" f={C.crema}>ptr</T>
      <Draw pts={[[130, 74], [130, 130]]} t={t} from={0.7} to={0.95} stroke={C.caramel} w={2} pen />
      <rect x={90} y={130} width={80} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.3)} />
      <T x={130} y={152} s={11} a="middle" f={C.crema}>pinned</T>
      <T x={60} y={190} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>almost every ordinary type never needed it: Unpin</T>
    </Svg>
  );
}

// ── 6 · Pinned both ways, still valid (takeaway) ────────────────────────────────────────────────
export function PinnedBothWaysReveal({ t }: StepCtx) {
  // Each box's own self-pointer arrow tries the same move the earlier topic broke, and this time
  // stays anchored instead of slipping, drawn in rather than only labelled "valid".
  return (
    <Svg label="pin_prevents_the_break.rs and pin_macro_stack_pin.rs" h={240}>
      <rect x={60} y={50} width={220} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.3, 0.3)} />
      <T x={170} y={80} s={13} a="middle" f={C.crema}>Box::pin, heap: valid</T>
      <Draw pts={[[170, 100], [170, 140]]} t={t} from={0.6} to={0.85} stroke={C.taupe} w={1.5} pen />
      <rect x={320} y={50} width={220} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.9, 0.3)} />
      <T x={430} y={80} s={13} a="middle" f={C.crema}>pin!, stack: valid</T>
      <Draw pts={[[430, 100], [430, 140]]} t={t} from={1.2} to={1.45} stroke={C.caramel} w={1.5} pen />
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>the identical promise, two different places</T>
    </Svg>
  );
}

// ── 7 · Can T still be moved out? (predict) ─────────────────────────────────────────────────────
export function MoveOutPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the pinned value, handed to a by-value function"
        lines={['fn takes_by_value(_: SelfRef) {}', 'let a: Pin<Box<SelfRef>> = SelfRef::new("x");', 'takes_by_value(*a); // does this compile?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 8 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function CompileFailReveal({ t, portrait }: StepCtx) {
  const box = easeOut(seg(t, 0.4, 0.8));
  const pull = easeInOut(seg(t, 1.0, 1.5));
  const snap = easeOutBack(seg(t, 1.6, 2.0));
  const dx = pull * 150 * (1 - snap);
  const err = easeOutBack(seg(t, 1.7, 2.1));
  return (
    <Stack>
      {!portrait && <Code title="move_out_of_pin_fails.rs — a real compile error" dim={t < 0.1} lines={['error[E0507]: cannot move out of', '  dereference of Pin<Box<SelfRef>>', '// no Unpin, so no plain SelfRef to take']} t={t} start={0.1} end={0.5} highlight={t > 1.7 ? [0, 1] : []} />}
      <Svg label="an attempt to drag the SelfRef out of its Pin<Box> is pulled back: E0507, nothing can be moved out of the pinned value" h={160} fill>
        <g opacity={box}>
          <rect x={60} y={30} width={240} height={96} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={74} y={22} s={13} f={C.latte}>{'Pin<Box<SelfRef>>'}</T>
          <PinIcon x={290} y={34} />
        </g>
        <g transform={`translate(${dx.toFixed(1)} 0)`} opacity={box}>
          <rect x={100} y={56} width={160} height={44} rx={8} fill={C.cocoa} stroke={pull > 0.9 && snap < 0.5 ? C.cherryText : C.crema} strokeWidth={1.5} />
          <T x={180} y={83} s={14} a="middle" f={C.crema}>SelfRef</T>
        </g>
        <line x1={420} y1={78} x2={lerp(420, 330, pull)} y2={78} stroke={C.latte} strokeWidth={2} opacity={pull > 0 && snap < 1 ? 1 : 0} />
        <T x={470} y={70} s={13} a="middle" f={C.latte} o={pull > 0 && snap < 1 ? 1 : 0}>move out?</T>
        {err > 0 && (
          <g transform={`translate(470 120) scale(${err.toFixed(3)}) translate(-470 -120)`}>
            <T x={470} y={126} s={15} a="middle" f={C.cherryText} w={700}>E0507</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 9 · Structural projection, a per-field choice (takeaway) ────────────────────────────────────
export function StructuralProjectionReveal({ t, portrait }: StepCtx) {
  const box = easeOut(seg(t, 0.4, 0.8));
  const hop = easeInOut(seg(t, 1.0, 1.6)); // #[pin]: the pin passes to this one field only
  const proj = [easeOut(seg(t, 1.8, 2.3)), easeOut(seg(t, 2.0, 2.5))];
  return (
    <Stack>
      {!portrait && <Code title="pin-project-lite: structural_projection.rs" lines={['pin_project! { struct Combined<T, U> {', '    #[pin] pinned: T,', '    unpinned: U,', '} }']} t={t} start={0.1} end={0.5} highlight={t > 1.0 ? [1] : [0]} />}
      <Svg label="Combined is pinned; the #[pin] field inherits the pin and projects to Pin<&mut T>, while the other field projects to an ordinary &mut U, read as 42" h={180} fill>
        <g opacity={box}>
          <rect x={30} y={30} width={230} height={130} rx={12} fill="none" stroke={C.crema} strokeWidth={1.5} />
          <T x={44} y={22} s={13} f={C.latte}>{'Pin<&mut Combined>'}</T>
          <PinIcon x={250} y={34} />
          <rect x={50} y={52} width={190} height={38} rx={7} fill={C.cocoa} stroke={hop >= 1 ? C.caramel : C.mocha} strokeWidth={1.5} />
          <T x={70} y={76} s={13} f={C.crema}>pinned: T</T>
          <rect x={50} y={104} width={190} height={38} rx={7} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={70} y={128} s={13} f={C.crema}>unpinned: U</T>
        </g>
        <PinIcon x={lerp(250, 222, hop)} y={lerp(34, 70, hop)} k={hop > 0 ? 1 : 0} f={C.cinnamon} />
        <Draw pts={[[240, 71], [360, 71]]} t={t} from={1.8} to={2.3} stroke={C.caramel} w={2} />
        <Draw pts={[[240, 123], [360, 123]]} t={t} from={2.0} to={2.5} stroke={C.latte} w={2} />
        <g opacity={proj[0]}>
          <rect x={360} y={52} width={200} height={38} rx={7} fill="none" stroke={C.caramel} strokeWidth={1.5} />
          <T x={460} y={76} s={13} a="middle" f={C.caramel}>{'Pin<&mut T>'}</T>
        </g>
        <g opacity={proj[1]}>
          <rect x={360} y={104} width={200} height={38} rx={7} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={460} y={128} s={13} a="middle" f={C.crema}>{'&mut U: 42'}</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a value pointing into itself breaks once it moves',
    'Pin<Ptr> is a type-level promise, not a convention',
    'the compiler enforces that promise, rejecting the move',
    'pin projection is a per-field choice, never automatic',
  ];
  return <RecapList t={t} end={3} label="recap: self-reference and Pin, proven both ways" rows={rows} step={55}
      s={13}
    />;
}
