import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const grow = easeOut(seg(t, 0.4, 0.8));
  const w = grow * 260;
  return (
    <Svg label="not_reading_closes_the_window.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>several megabytes written successfully</T>
      <rect x={60} y={70} width={w} height={10} rx={3} fill={C.caramel} opacity={0.6} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.9 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>then a real write() call blocked</T>}
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
  const slots = Array.from({ length: 16 }, (_, i) => i);
  const bounce = easeOut(seg(t, 1.0, 1.25));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 15;
  return (
    <Svg label="bounded_output_buffer_enforces_its_cap.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>filled to exactly 16, the cap</T>
      {slots.map((i) => {
        const land = easeOut(seg(t, 0.4 + i * 0.03, 0.6 + i * 0.03));
        return <rect key={i} x={66 + i * 15} y={70} width={12} height={10} rx={2} fill={C.caramel} opacity={land} />;
      })}
      <circle cx={300 + dx} cy={75} r={4} fill={C.cherry} opacity={fa(t, 1.0, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>the next push: genuinely rejected</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>length never grows past the cap</T>
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
  const grow = easeOut(seg(t, 0.5, 1.0));
  const w = grow * 260;
  return (
    <Svg label="a_stalled_peer_hits_its_real_timeout.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a peer that sent nothing at all</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.9 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>a real timeout, fired on schedule</T>}
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
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="RFC 9293, quoted directly" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>a closed window may stay closed indefinitely</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>not reading is a sanctioned way to say not yet</T>
      </g>
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
