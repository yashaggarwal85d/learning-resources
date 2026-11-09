import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Draw, Plot, Reticle, Bar } from '../../../../../reels/kit';

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
    <Svg label="time passes after the call; still nothing has run" h={200}>
      <Draw pts={[[60, 100], [520, 100]]} t={t} from={0.2} to={1.3} stroke={C.mocha} w={1.5} pen={false} dash="4 5" />
      <Plot pts={[[60, 100]]} t={t} start={0.1} fill={C.caramel} labels={['small_future()']} />
      <Reticle x={520} y={100} w={150} h={46} t={t} at={1.3} />
      <T x={445} y={85} s={13} a="middle" f={C.latte} o={fa(t, 1.3, 0.3)}>still nothing has run</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.7, 0.4)}>constructing it is the only thing that happened</T>
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
  const largeW = lerp(8, 470, easeOut(seg(t, 0.3, 1.2)));
  return (
    <Svg label="future_size.rs: bars race to each measured size" h={220}>
      <T x={60} y={45} s={13} f={C.quiet}>small_future(): nothing held across the await</T>
      <Bar x={60} y={55} w={8} h={24} full={470} fill={C.caramel} />
      <T x={60} y={125} s={13} f={C.quiet}>large_future(): the 4096-byte local held</T>
      <Bar x={60} y={135} w={largeW} h={24} full={470} fill={C.caramel} />
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>the same await point, two very different sizes</T>
    </Svg>
  );
}

// ── 6 · That size difference is a real memcpy (takeaway) ────────────────────────────────────────
export function RealMemcpyReveal({ t }: StepCtx) {
  const k = easeInOut(seg(t, 0.2, 1.1));
  const x = lerp(90, 400, k);
  return (
    <Svg label="Box::pin moves the future: every byte travels with it" h={220}>
      <T x={60} y={40} s={13} f={C.quiet}>Box::pin(large_future())</T>
      <Draw pts={[[90, 150], [400, 150]]} t={t} from={0.2} to={1.1} stroke={C.mocha} w={1.5} pen={false} dash="4 5" />
      <rect x={x} y={120} width={150} height={56} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={x + 75} y={153} s={13} a="middle" f={C.crema}>enum + buffer</T>
      <Reticle x={x + 75} y={148} w={160} h={66} t={t} at={1.1} />
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>every byte the enum holds travels with it</T>
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
