import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A trait's async fn is neither dyn compatible nor Send-constrainable by callers — two separate
// gaps in the stable 2026 language, each proven by a real compiler error. trait-variant and
// async-trait are real crate dependencies, each fixing exactly one of the two gaps.
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

// ── 1 · Can an async trait method be boxed as dyn? (predict, hook) ─────────────────────────────
export function DynBoxPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a trait with one async method"
        lines={['trait Greeter {', '    async fn greet(&self);', '}', 'fn make() -> Box<dyn Greeter> { .. }']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[3]}
      />
    </Stack>
  );
}

// ── 2 · No — the compiler's own diagnostic (no takeaway, "from" step) ──────────────────────────
export function DynFailReveal({ t }: StepCtx) {
  const shapes = [
    { w: 170, label: "A's future", y: 30 },
    { w: 90, label: "B's", y: 110 },
  ];
  const go = easeInOut(seg(t, 0.6, 1.3));
  const back = easeOutBack(seg(t, 1.35, 1.75));
  const err = easeOutBack(seg(t, 1.6, 2.0));
  return (
    <Stack>
      <Code title="async_fn_in_trait_not_dyn_safe.rs" dim={t < 0.1} lines={['error[E0038]: the trait Greeter is', '  not dyn compatible', '// because method greet is async']} t={t} start={0.1} end={0.5} highlight={t > 1.6 ? [0, 1] : []} />
      <Svg label="each implementor's greet returns a future of its own size and type; none of them fits one fixed vtable slot, so Greeter is not dyn compatible: E0038" h={170} fill>
        <rect x={400} y={60} width={130} height={44} rx={7} fill="none" stroke={err > 0 ? C.cherryText : C.crema} strokeWidth={2} strokeDasharray="6 4" />
        <T x={465} y={18} s={13} a="middle" f={C.latte}>vtable: greet</T>
        {shapes.map((s, i) => {
          const x = lerp(30, 400 - (s.w - 130) / 2, go) - back * 60 * go;
          const y = lerp(s.y, 60, go) + (i ? 1 : -1) * back * 30 * go;
          return (
            <g key={s.label} transform={`translate(${(x - 30).toFixed(1)} ${(y - s.y).toFixed(1)})`}>
              <rect x={30} y={s.y} width={s.w} height={44} rx={7} fill={C.cocoa} stroke={i ? C.cinnamon : C.crema} strokeWidth={1.5} />
              <T x={30 + s.w / 2} y={s.y + 27} s={13} a="middle" f={i ? C.cinnamon : C.crema}>{s.label}</T>
            </g>
          );
        })}
        {err > 0 && (
          <g transform={`translate(465 140) scale(${err.toFixed(3)}) translate(-465 -140)`}>
            <T x={465} y={146} s={15} a="middle" f={C.cherryText} w={700}>E0038</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 3 · Can a generic caller require Send? (predict) ────────────────────────────────────────────
export function SendGenericPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a Send implementor, a generic spawn"
        lines={['fn run<G: Greeter + Send>(g: G) {', '    multi_threaded_spawn(g.greet());', '}', '// does this type-check?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function SendFailReveal({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.4, 0.7));
  const fut = easeOutBack(seg(t, 0.8, 1.1));
  const go = easeInOut(seg(t, 1.3, 1.8));
  const stop = easeOutBack(seg(t, 1.8, 2.1));
  const fx = lerp(250, 360, go) - stop * 40;
  return (
    <Stack>
      <Code title="returned_future_not_send.rs" dim={t < 0.1} lines={['error[E0277]: impl Future<..> cannot', '  be sent between threads safely', '// even though G itself is Send']} t={t} start={0.1} end={0.5} highlight={t > 1.8 ? [0, 1] : [2]} />
      <Svg label="G itself is Send, but the future its method returns carries no Send promise, so it is stopped at the thread boundary: E0277" h={160} fill>
        <g opacity={g}>
          <rect x={30} y={50} width={110} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
          <T x={85} y={77} s={14} a="middle" f={C.crema}>G</T>
          <T x={85} y={116} s={13} a="middle" f={C.caramel}>Send</T>
        </g>
        <Draw pts={[[140, 72], [190, 72]]} t={t} from={0.7} to={0.9} stroke={C.latte} w={2} pen={false} />
        <line x1={420} y1={20} x2={420} y2={140} stroke={stop > 0 ? C.cherryText : C.mocha} strokeWidth={2.5} strokeDasharray="6 5" opacity={easeOut(seg(t, 0.5, 0.8))} />
        <T x={500} y={30} s={13} a="middle" f={C.taupe}>other thread</T>
        {fut > 0 && (
          <g transform={`translate(${(fx - 250).toFixed(1)} 0)`}>
            <g transform={`translate(255 72) scale(${fut.toFixed(3)}) translate(-255 -72)`}>
              <rect x={195} y={50} width={120} height={44} rx={8} fill={C.cocoa} stroke={stop > 0 ? C.cherryText : C.crema} strokeWidth={1.5} />
              <T x={255} y={77} s={13} a="middle" f={C.crema}>impl Future</T>
              <T x={255} y={116} s={13} a="middle" f={stop > 0 ? C.cherryText : C.taupe}>{stop > 0 ? 'not Send' : 'Send?'}</T>
            </g>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 5 · trait-variant generates a second trait (takeaway) ──────────────────────────────────────
export function TraitVariantReveal({ t, portrait }: StepCtx) {
  const orig = easeOut(seg(t, 0.4, 0.8));
  const copy = easeInOut(seg(t, 1.0, 1.7)); // a second trait slides out of the annotation
  const stamp = easeOutBack(seg(t, 1.8, 2.2));
  return (
    <Stack>
      {!portrait && <Code title="trait_variant's own example" lines={['#[trait_variant::make(Greeter: Send)]', 'trait LocalGreeter {', '    async fn greet(self) -> String;', '}']} t={t} start={0.1} end={0.5} highlight={t > 1.0 ? [0] : [1]} />}
      <Svg label="the annotation leaves LocalGreeter untouched and generates a second trait, Greeter, whose futures carry Send in its own definition" h={150} fill>
        <g opacity={orig}>
          <rect x={30} y={40} width={210} height={64} rx={9} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={135} y={78} s={14} a="middle" f={C.crema}>LocalGreeter</T>
          <T x={135} y={126} s={13} a="middle" f={C.taupe}>unchanged</T>
        </g>
        {copy > 0 && (
          <g transform={`translate(${lerp(0, 310, copy).toFixed(1)} 0)`} opacity={Math.min(1, copy * 2)}>
            <rect x={30} y={40} width={210} height={64} rx={9} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            <T x={135} y={78} s={14} a="middle" f={C.caramel}>Greeter</T>
          </g>
        )}
        {stamp > 0 && (
          <g transform={`translate(520 40) scale(${stamp.toFixed(3)}) translate(-520 -40)`}>
            <rect x={486} y={28} width={68} height={24} rx={12} fill={C.caramel} />
            <T x={520} y={45} s={13} a="middle" f={C.espresso} w={700}>Send</T>
          </g>
        )}
        <T x={445} y={126} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.2, 2.5))}>generated</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · Proven: spawned on a real thread (takeaway) ──────────────────────────────────────────────
export function TraitVariantProvenReveal({ t }: StepCtx) {
  // A task token travels from the generated trait straight to a real thread, crossing a drawn
  // line rather than only being named as spawned.
  return (
    <Svg label="trait-variant-fix: a real cross-thread spawn" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>through the generated Greeter trait</T>
      <Draw pts={[[90, 72], [170, 83]]} t={t} from={0.9} to={1.1} stroke={C.mocha} w={2} pen />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.6, 0.3)} />
      <T x={170} y={112} s={13} a="middle" f={C.mocha}>spawned, joined, correct</T>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a real thread, not merely described</T>
    </Svg>
  );
}

// ── 7 · Does fixing Send fix dyn too? (predict) ─────────────────────────────────────────────────
export function StillNotDynPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same boxed attempt, after the Send fix"
        lines={['fn make() -> Box<dyn Greeter> { .. }', '// Send is fixed now. does this compile?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · async-trait boxes every call (takeaway) ─────────────────────────────────────────────────
export function AsyncTraitReveal({ t, portrait }: StepCtx) {
  const ws = [150, 80, 120];
  const box = easeInOut(seg(t, 0.7, 1.4)); // every future is boxed to one uniform shape
  const slot = easeInOut(seg(t, 1.6, 2.3)); // which one vtable slot can hold
  return (
    <Stack>
      {!portrait && <Code title="async-trait's own documented expansion" lines={['fn run(&self)', '  -> Pin<Box<dyn Future<Output=()>', '       + Send + \'async_trait>>']} t={t} start={0.1} end={0.6} highlight={t > 0.7 ? [1, 2] : [0]} />}
      <Svg label="each implementor's differently shaped future is wrapped in one uniform Pin<Box<dyn Future>>, and that single shape fits one vtable slot; one heap allocation per call" h={180} fill>
        <rect x={420} y={66} width={120} height={40} rx={7} fill="none" stroke={slot >= 1 ? C.caramel : C.crema} strokeWidth={2} strokeDasharray="6 4" />
        <T x={480} y={56} s={13} a="middle" f={C.latte}>vtable: run</T>
        {ws.map((w0, i) => {
          const w = lerp(w0, 120, box);
          const x = lerp(30, 420, i === 0 ? slot : 0);
          const y = lerp(20 + i * 52, 66, i === 0 ? slot : 0);
          return (
            <g key={i} opacity={i > 0 && slot > 0 ? 1 - slot * 0.5 : 1}>
              <rect x={x} y={y} width={w} height={40} rx={box > 0.5 ? 7 : 2} fill={C.cocoa} stroke={box > 0.5 ? C.caramel : C.latte} strokeWidth={1.5} />
              {box > 0.5 && <T x={x + w / 2} y={y + 25} s={13} a="middle" f={C.caramel}>Box</T>}
            </g>
          );
        })}
        <T x={300} y={172} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>one Box per call</T>
      </Svg>
    </Stack>
  );
}

// ── 9 · Measured: one real allocation (takeaway) ────────────────────────────────────────────────
export function AllocationCountReveal({ t }: StepCtx) {
  // A single allocation token drops into the counter box, landing exactly once.
  const drop = easeOut(seg(t, 0.7, 1.0));
  const dy = (1 - drop) * -30;
  return (
    <Svg label="async-trait-fix: a real counting allocator" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one dyn-dispatched call, through the macro</T>
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.6, 0.3)} />
      <circle cx={100} cy={85 + dy} r={5} fill={C.caramel} opacity={drop > 0 && drop < 1 ? 1 : 0} />
      <T x={170} y={112} s={13} a="middle" f={C.mocha}>allocations: exactly one</T>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>counted directly, not cited</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'an async method is neither dyn-safe nor Send by default',
    'trait-variant fixes Send with a generated sibling trait',
    'async-trait fixes dyn, at one measured allocation',
    'the two gaps are separate; each needs its own fix',
  ];
  return <RecapList t={t} end={3} label="recap: two gaps, two fixes, proven both ways" rows={rows} step={55}
      s={13}
    />;
}
