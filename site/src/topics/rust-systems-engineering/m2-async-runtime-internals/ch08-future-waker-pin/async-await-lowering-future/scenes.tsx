import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// async fn lowers to an enum of suspension states, one per await point, each holding its own
// live locals; that size, and the !Send propagation rule, are both measured for real by
// examples.py (rustc 1.97.0, edition 2024; std::future::ready only, no external crate needed).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="the same laziness from last topic, by a different name" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>constructing a future does no work</T>
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>calling an async fn is exactly that</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>a value comes back, nothing has run</T>
    </Svg>
  );
}

// ── 3 · So what is that value, exactly? (takeaway) ──────────────────────────────────────────────
export function AnonymousEnumReveal({ t }: StepCtx) {
  return (
    <Code
      title="the Rust Reference's own description"
      lines={['// an anonymous type, like a closure\'s', '// roughly: an enum with one variant', '// per await point, holding what that', '// point needs to resume']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[1, 2, 3]}
    />
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
  return (
    <Svg label="future_size.rs: real measured sizes" h={220}>
      <rect x={60} y={50} width={100} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={110} y={80} s={13} a="middle" f={C.crema}>small</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <rect x={220} y={50} width={320} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={380} y={80} s={13} a="middle" f={C.crema}>large: holds the buffer</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>the same await point, two very different sizes</T>
    </Svg>
  );
}

// ── 6 · That size difference is a real memcpy (takeaway) ────────────────────────────────────────
export function RealMemcpyReveal({ t }: StepCtx) {
  return (
    <Svg label="moving the future copies every byte it holds" h={220}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>Box::pin(large_future()) moves the whole enum</T>
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
export function CompilerDiagnosticReveal({ t }: StepCtx) {
  return (
    <Code
      title="not_send_across_await.rs — a real compile error"
      dim
      lines={['error: future cannot be sent', '  between threads safely', '// Rc<i32> is not Send', '// used across an await']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
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
  return (
    <Svg label="recap: lowering and size, proven both ways" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
