import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// TCP genuinely delivers an undifferentiated byte stream, not discrete messages;
// a real half-close leaves one direction open while closing the other; Nagle's own
// batching and SO_LINGER's own close-blocking are each a different, documented
// surprise about what a byte stream does not promise you.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · One write, how many reads? (predict, hook) ──────────────────────────────────────────────
export function PartialReadsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real write, a small read buffer on the other end"
        lines={['stream.write_all(&payload)?; // 4 MiB, one call', 'sock.read(&mut buf)?; // a 64 KiB buffer', '// how many real read() calls does that take?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: dozens of real reads (swipe test's "from" step — NO takeaway) ─────────────────
export function PartialReadsReveal({ t }: StepCtx) {
  const chunks = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Svg label="partial_reads_on_a_real_tcp_stream.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one real write_all() call, 4 MiB</T>
      {chunks.map((i) => {
        const land = easeOut(seg(t, 0.5 + i * 0.05, 0.7 + i * 0.05));
        return <rect key={i} x={66 + i * 26} y={70} width={20} height={10} rx={2} fill={C.caramel} opacity={land} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>dozens of real read() calls to receive it</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a byte stream, not a queue of messages</T>
    </Svg>
  );
}

// ── 3 · Half-close (predict) ────────────────────────────────────────────────────────────────────
export function HalfClosePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="shutdown(Write) on just one side of a real connection"
        lines={['stream.shutdown(Shutdown::Write)?;', '// the other side reads: an error, or EOF?', '// and can it still reply?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 4 · Measured: EOF, but still writable the other way (takeaway) ──────────────────────────────
export function HalfCloseReveal({ t }: StepCtx) {
  const close = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(close - 0.5) * 2) * 20;
  const reply = easeOut(seg(t, 0.9, 1.2));
  const dx2 = reply * -120;
  return (
    <Svg label="half_close_lets_the_peer_still_reply.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the server's own read() saw a real EOF</T>
      <circle cx={260 + dx} cy={57} r={4} fill={C.cherry} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>and still sent a real reply back</T>}
      <circle cx={300 + dx2} cy={93} r={4} fill={C.taupe} opacity={fa(t, 0.9, 0.3)} />
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>one direction closed, the other still open</T>
    </Svg>
  );
}

// ── 5 · Nagle / TCP_NODELAY (predict) ───────────────────────────────────────────────────────────
export function NaglePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="tcp(7)'s own documentation on TCP_NODELAY"
        lines={['// Nagle left on: what happens to small writes?', 'stream.set_nodelay(true)?; // this disables it']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · The documentation's own words, quoted (no takeaway, connecting step) ────────────────────
export function NagleReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="tcp(7), quoted directly" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>Nagle on: small writes wait for a fuller packet</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>TCP_NODELAY is what turns that batching off</T>
      </g>
    </Svg>
  );
}

// ── 7 · SO_LINGER (predict) ─────────────────────────────────────────────────────────────────────
export function LingerPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="socket(7)'s own documentation on SO_LINGER"
        lines={['// with SO_LINGER enabled:', 'drop(stream); // does close() itself wait now?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured (quoted): close() itself blocks, and TIME-WAIT is separate (takeaway) ──────────
export function LingerReveal({ t }: StepCtx) {
  const rows = [
    'SO_LINGER on: close() itself now waits',
    'TIME-WAIT: a separate, later wait',
  ];
  return (
    <Svg label="socket(7) and RFC 9293, quoted directly" h={160}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · One shared surprise (takeaway) ──────────────────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'partial reads: no message boundaries',
    'half-close: one direction, not the whole',
    'Nagle, SO_LINGER: each its own real wait',
  ];
  return (
    <Svg label="four surprises, one shared cause" h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'one write, dozens of reads to receive it',
    'half-close: EOF one way, still open the other',
    'Nagle batches writes; NODELAY turns it off',
    'SO_LINGER waits in close(), TIME-WAIT after',
  ];
  return (
    <Svg label="recap: a byte stream keeps none of your boundaries" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
