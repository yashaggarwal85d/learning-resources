import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const n = 10;
  const total = 280;
  return (
    <Svg label="partial_reads_on_a_real_tcp_stream.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>one real write_all() call, 4 MiB</T>
      <rect x={60} y={45} width={total} height={22} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {Array.from({ length: n }).map((_, i) => {
        const start = 0.2 + i * 0.08;
        const k = easeOut(seg(t, start, start + 0.2));
        const cell = total / n;
        return <rect key={i} x={62 + i * (cell - 2)} y={47} width={Math.max(0, (cell - 4) * k)} height={18} rx={2} fill={C.caramel} />;
      })}
      <T x={60} y={100} s={13} f={C.mocha} o={fa(t, 1.0, 0.3)}>dozens of real read() calls to receive it</T>
      <T x={60} y={130} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>a byte stream, not a queue of messages</T>
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
  const stopOpac = 1 - easeOut(seg(t, 0.2, 0.4));
  const replyX = lerp(340, 80, easeOut(seg(t, 0.5, 0.9)));
  return (
    <Svg label="half_close_lets_the_peer_still_reply.rs, measured" h={200}>
      <T x={60} y={25} s={12} f={C.quiet}>client → server (write)</T>
      <circle cx={200} cy={45} r={5} fill={C.cherryText} opacity={stopOpac} />
      <T x={260} y={25} s={11} f={C.cherryText} o={fa(t, 0.3, 0.2)}>EOF</T>
      <T x={60} y={75} s={12} f={C.quiet}>server → client (reply)</T>
      <circle cx={replyX} cy={95} r={5} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <T x={60} y={135} s={13} f={C.mocha} o={fa(t, 0.9, 0.3)}>the server's own read() saw EOF, and still sent a reply</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.2, 0.3)}>one direction closed, the other still open</T>
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
  const mergeK = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg label="tcp(7), quoted directly" h={160}>
      {[0, 1, 2].map((i) => {
        const x = lerp(60 + i * 20, 150, mergeK);
        return <circle key={i} cx={x} cy={25} r={4} fill={C.caramel} opacity={fa(t, 0.1 + i * 0.05, 0.2)} />;
      })}
      <T x={60} y={65} s={13} f={C.crema} o={fa(t, 0.5, 0.4)}>Nagle on: small writes wait for a fuller packet</T>
      <T x={60} y={95} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>TCP_NODELAY is what turns that batching off</T>
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
