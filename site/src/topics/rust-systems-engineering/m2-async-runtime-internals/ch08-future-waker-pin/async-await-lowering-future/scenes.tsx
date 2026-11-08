import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// async fn lowers to an enum of suspension states, one per await point, each holding its own
// live locals; that size, and the !Send propagation rule, are both measured for real by
// examples.py (rustc 1.97.0, edition 2024; std::future::ready only, no external crate needed).
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

// ── 1 · Call an async function — what comes back? (predict, hook) ──────────────────────────────
export function CallReturnsValuePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="calling, not running"
        lines={['async fn small_future() {', '    ready(()).await;', '}', 'let f = small_future();', '// has anything run yet?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[3, 4]}
      />
    </Stack>
  );
}

// ── 2 · A value, the same laziness (no takeaway, "from" step) ──────────────────────────────────
export function SameLazinessReveal({ t }: StepCtx) {
  // The call slides a value out from the function name into view, instead of only naming the idea.
  const slide = easeOut(seg(t, 0.3, 0.6));
  const dx = (1 - slide) * -80;
  return (
    <Svg label="the same laziness from last topic, by a different name" h={200}>
      <g transform={`translate(${dx},0)`} opacity={fa(t, 0.3, 0.3)}>
        <rect x={60} y={40} width={140} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={130} y={65} s={12} a="middle" f={C.crema}>a future value</T>
      </g>
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>calling an async fn is exactly that</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>a value comes back, nothing has run</T>
    </Svg>
  );
}

// ── 3 · So what is that value, exactly? (takeaway) ──────────────────────────────────────────────
export function AnonymousEnumReveal({ t }: StepCtx) {
  const lane = easeOut(seg(t, 0.4, 0.9));
  const variants = [
    { name: 'Start', locals: [] as string[], from: 40 },
    { name: 'at first await', locals: ['x'], from: 80 },
    { name: 'at second await', locals: ['x', 'y'], from: 120 },
    { name: 'Done', locals: [] as string[], from: 160 },
  ];
  return (
    <Stack>
      <Code title="the Rust Reference's own description" lines={['// an anonymous type, like a closure\'s', '// roughly: an enum with one variant', '// per await point, holding what that', '// point needs to resume']} t={t} start={0.1} end={0.5} highlight={t > 1.2 ? [1, 2, 3] : []} />
      <Svg label="the async fn's body has two await points; the compiler's anonymous enum gets one variant per point, each holding just the locals still alive there" h={190} fill>
        <T x={30} y={20} s={13} f={C.taupe} o={lane}>async fn body</T>
        <line x1={60} y1={32} x2={60} y2={lerp(32, 172, lane)} stroke={C.mocha} strokeWidth={2} />
        {[80, 120].map((y) => (
          <g key={y} opacity={lane}>
            <circle cx={60} cy={y} r={6} fill={C.caramel} />
            <T x={76} y={y + 5} s={13} f={C.caramel}>.await</T>
          </g>
        ))}
        <rect x={250} y={20} width={330} height={164} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.9, 1.2))} />
        {variants.map((v, i) => {
          const k = easeInOut(seg(t, 1.2 + i * 0.3, 1.6 + i * 0.3));
          if (k <= 0) return null;
          const y = 30 + i * 38;
          return (
            <g key={v.name} transform={`translate(${lerp(-180, 0, k).toFixed(1)} ${lerp(v.from - y - 14, 0, k).toFixed(1)})`} opacity={Math.min(1, k * 2)}>
              <rect x={262} y={y} width={306} height={30} rx={6} fill={C.cocoa} stroke={k >= 1 ? C.crema : C.mocha} strokeWidth={1.5} />
              <T x={274} y={y + 20} s={13} f={C.crema}>{v.name}</T>
              {v.locals.map((l, j) => (
                <g key={l}>
                  <rect x={470 + j * 44} y={y + 5} width={36} height={20} rx={10} fill={C.cinnamon} />
                  <T x={488 + j * 44} y={y + 20} s={12} a="middle" f={C.espresso} w={700}>{l}</T>
                </g>
              ))}
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// ── 4 · Does a bigger local change the future's size? (predict) ────────────────────────────────
export function BiggerLocalPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical await point, two different locals"
        lines={['async fn small_future() { ready(()).await; }', '', 'async fn large_future() {', '    let buf = [0u8; 4096];', '    ready(()).await;', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[3]}
      />
    </Stack>
  );
}

// ── 5 · Measured: two bytes versus over four thousand (takeaway) ───────────────────────────────
export function MeasuredSizesReveal({ t }: StepCtx) {
  // The large future's box grows from the small future's own width out to its full measured
  // width, so the size difference is seen widening, not just placed side by side.
  const grow = easeOut(seg(t, 0.5, 1.0));
  const w = 100 + grow * 320;
  return (
    <Svg label="future_size.rs: real measured sizes" h={220}>
      <rect x={60} y={50} width={100} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={110} y={80} s={13} a="middle" f={C.crema}>small</T>
      <rect x={220} y={50} width={w} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={280} y={80} s={13} f={C.crema} o={fa(t, 0.4, 0.3)}>large: holds the buffer</T>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>the same await point, two very different sizes</T>
    </Svg>
  );
}

// ── 6 · That size difference is a real memcpy (takeaway) ────────────────────────────────────────
export function RealMemcpyReveal({ t }: StepCtx) {
  // The whole future box slides from its old spot into the box it gets moved into, carrying its
  // full width with it — the move itself, not just a claim about one.
  const move = easeOut(seg(t, 0.3, 0.7));
  const x = 60 + move * 260;
  return (
    <Svg label="moving the future copies every byte it holds" h={240}>
      <rect x={x} y={30} width={240} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={x + 120} y={60} s={12} a="middle" f={C.crema}>large_future()</T>
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>every byte measured gets copied, once</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>a real cost, paid on every move</T>
    </Svg>
  );
}

// ── 7 · Hold something not Send across an await — still fine? (predict) ────────────────────────
export function NotSendPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same await point, a non-Send local"
        lines={['async fn holds_rc_across_await() {', '    let rc = Rc::new(5);', '    ready(()).await;', '    println!("{}", rc);', '}', 'requires_send(holds_rc_across_await());']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1, 5]}
      />
    </Stack>
  );
}

// ── 8 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function CompilerDiagnosticReveal({ t, portrait }: StepCtx) {
  const P = 300;
  const box = easeOut(seg(t, 0.4, 0.8));
  const rc = easeOut(seg(t, 0.8, 1.9));
  const x = lerp(90, 450, rc);
  const crossed = x > P;
  const stamp = easeOutBack(seg(t, 2.0, 2.4));
  return (
    <Stack>
      {!portrait && <Code title="not_send_across_await.rs — a real compile error" dim={t < 0.1} lines={['error: future cannot be sent', '  between threads safely', '// Rc<i32> is not Send', '// used across an await']} t={t} start={0.1} end={0.5} highlight={t > 2.0 ? [0, 1] : t > 1.4 ? [2, 3] : []} />}
      <Svg label="the Rc's lifetime runs across the await point, so it is stored in the future itself, and the whole future cannot be sent between threads" h={170} fill>
        <rect x={40} y={30} width={520} height={100} rx={12} fill="none" stroke={stamp > 0 ? C.cherryText : C.mocha} strokeWidth={stamp > 0 ? 2.5 : 1.5} opacity={box} />
        <T x={54} y={22} s={13} f={stamp > 0 ? C.cherryText : C.taupe} o={box}>the future</T>
        <line x1={P} y1={40} x2={P} y2={120} stroke={crossed ? C.cherryText : C.taupe} strokeWidth={2} strokeDasharray="4 4" opacity={box} />
        <T x={P} y={150} s={13} a="middle" f={crossed ? C.cherryText : C.taupe} o={box}>.await</T>
        <T x={70} y={74} s={13} f={C.latte} o={box}>Rc&lt;i32&gt;</T>
        <line x1={90} y1={92} x2={x} y2={92} stroke={crossed ? C.cherryText : C.caramel} strokeWidth={8} strokeLinecap="round" opacity={rc > 0 ? 1 : 0} />
        {stamp > 0 && (
          <g transform={`translate(470 66) scale(${stamp.toFixed(3)}) rotate(-6) translate(-470 -66)`}>
            <rect x={410} y={50} width={120} height={30} rx={5} fill="none" stroke={C.cherryText} strokeWidth={2} />
            <T x={470} y={71} s={14} a="middle" f={C.cherryText} w={700}>not Send</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'async fn lowers to a real enum, one variant per await',
    'that enum\'s size is what each point holds, measured',
    'moving a large future copies every byte it holds',
    'Send propagates in exactly like any other field',
  ];
  return <RecapList t={t} end={3} label="recap: lowering and size, proven both ways" rows={rows} step={55}
      s={13}
    />;
}
