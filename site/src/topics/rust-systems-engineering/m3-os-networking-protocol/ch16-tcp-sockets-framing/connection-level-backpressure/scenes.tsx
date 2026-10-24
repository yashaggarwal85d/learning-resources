import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Not reading a real connection genuinely closes its own receive window and blocks
// the remote sender; a real bounded output buffer enforces its cap by genuinely
// rejecting the next push once full; a real per-connection timeout genuinely fires
// against a peer that may never send anything. Backpressure is a choice, not an accident.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A server that never reads (predict, hook) ───────────────────────────────────────────────
export function WindowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a server that accepts, then never reads"
        lines={['let (sock, _) = listener.accept()?;', '// never read from sock again', 'loop { client.write(&chunk)?; } // forever?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1, 2]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a real write genuinely blocks (swipe test's "from" step — NO takeaway) ────────
export function WindowReveal({ t }: StepCtx) {
  return (
    <Svg label="not_reading_closes_the_window.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>several megabytes written successfully</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>then a real write() call blocked</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the kernel's own window, closed</T>
    </Svg>
  );
}

// ── 3 · A bounded buffer, filled past its cap (predict) ─────────────────────────────────────────
export function BufferPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real buffer, capped at 16, filled, then pushed again"
        lines={['for _ in 0..16 { buf.push(msg.clone()); }', 'buf.push(one_more); // what happens to it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: rejected, length never grows past the cap (takeaway) ──────────────────────────
export function BufferReveal({ t }: StepCtx) {
  return (
    <Svg label="bounded_output_buffer_enforces_its_cap.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>filled to exactly 16, the cap</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the next push: genuinely rejected</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>length never grows past the cap</T>
    </Svg>
  );
}

// ── 5 · A stalled peer, a real timeout (predict) ────────────────────────────────────────────────
export function TimeoutPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a peer that connects, then sends nothing at all"
        lines={['sock.set_read_timeout(Some(dur))?;', 'sock.read(&mut buf)?; // wait forever, or time out?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the timeout fires right on schedule (takeaway) ────────────────────────────────
export function TimeoutReveal({ t }: StepCtx) {
  return (
    <Svg label="a_stalled_peer_hits_its_real_timeout.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a peer that sent nothing at all</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>a real timeout, fired on schedule</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>good faith was never the real policy</T>
    </Svg>
  );
}

// ── 7 · RFC 9293's own claim about the closed window (predict) ──────────────────────────────────
export function RfcPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the TCP standard's own claim about a closed window"
        lines={['// a receiver stops reading, the window closes', '// how long can it stay closed, by the standard?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The standard's own words, quoted (no takeaway, connecting step) ─────────────────────────
export function RfcReveal({ t }: StepCtx) {
  return (
    <Svg label="RFC 9293, quoted directly" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>a closed window may stay closed indefinitely</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>not reading is a sanctioned way to say not yet</T>
    </Svg>
  );
}

// ── 9 · Three choices, one state machine (takeaway) ─────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'stop reading: say not yet',
    'cap the buffer: say no more than this',
    'time out: say not forever',
  ];
  return (
    <Svg label="backpressure as an explicit choice" h={220}>
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
    'not reading closes the window, blocks sending',
    'the standard allows that wait indefinitely',
    'a bounded buffer rejects the push past its cap',
    'a real timeout ends a connection that stalls',
  ];
  return (
    <Svg label="recap: a connection that chooses, on purpose" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
