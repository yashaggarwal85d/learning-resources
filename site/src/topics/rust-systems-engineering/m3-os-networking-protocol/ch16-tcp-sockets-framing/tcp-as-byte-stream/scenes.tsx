import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// TCP genuinely delivers an undifferentiated byte stream, not discrete messages;
// a real half-close leaves one direction open while closing the other; Nagle's own
// batching and SO_LINGER's own close-blocking are each a different, documented
// surprise about what a byte stream does not promise you.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Several names pour into one idea: a line from each row's dot runs down the left gutter into one node,
// where the idea they share decodes and is locked on.
function Converge({ t, n, y0, dy, at, verdict }: { t: number; n: number; y0: number; dy: number; at: number; verdict: string }) {
  const yN = y0 + n * dy + 5;
  const k = easeOut(seg(t, at + 0.5, at + 0.8));
  const w = 44 + verdict.length * 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Draw key={i} pts={[[30, y0 + i * dy], [14, y0 + i * dy], [14, yN], [30, yN]]} t={t} from={at + i * 0.1} to={at + 0.5 + i * 0.1} stroke={C.taupe} w={1.5} />
      ))}
      <circle cx={30} cy={yN} r={7 * k} fill={C.caramel} />
      <Decode text={verdict} t={t} at={at + 0.6} x={48} y={yN + 5} s={14} f={C.caramel} w={600} />
      <Reticle x={20 + w / 2} y={yN} w={w} h={30} t={t} at={at + 1.0} />
    </g>
  );
}

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

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
  // One long write sits on the sender's side. The receiver's buffer is far smaller, so the bytes come off the
  // front of it a buffer-full at a time: each read() drops one chunk through the small buffer onto the received
  // bar, which grows until the whole write is back — one write, many reads.
  const n = 14;
  const span = 480;
  const cw = span / n;
  const start = 0.5, beat = 0.1;
  const done = clamp((t - start) / beat, 0, n);
  return (
    <Svg label="partial_reads_on_a_real_tcp_stream.rs, measured" h={240}>
      <T x={60} y={34} s={13} f={C.latte} o={fa(t, 0.2, 0.3)}>one real write_all() call, 4 MiB</T>
      <rect x={60 + Math.floor(done) * cw} y={44} width={span - Math.floor(done) * cw} height={16} rx={2} fill={C.caramel} />
      <rect x={250} y={98} width={100} height={30} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={360} y={118} s={13} f={C.taupe}>small read buffer</T>
      {Array.from({ length: n }, (_, i) => {
        const k = seg(t, start + i * beat, start + i * beat + 0.3);
        if (k <= 0 || k >= 1) return null;
        const a = easeOut(Math.min(1, k * 2)), b = easeOut(Math.max(0, k * 2 - 1));
        const x = k < 0.5 ? lerp(60 + i * cw, 300 - cw / 2, a) : lerp(300 - cw / 2, 60 + i * cw, b);
        const y = k < 0.5 ? lerp(44, 105, a) : lerp(105, 168, b);
        return <rect key={i} x={x} y={y} width={cw - 3} height={16} rx={2} fill={C.crema} />;
      })}
      <rect x={60} y={168} width={span} height={16} rx={2} fill="none" stroke={C.mocha} />
      <rect x={60} y={168} width={Math.max(0, Math.floor(clamp((t - start - 0.3) / beat, 0, n)) * cw)} height={16} rx={2} fill={C.caramel} />
      <Decode text="dozens of read() calls" t={t} at={2.1} x={300} y={208} s={14} a="middle" f={C.caramel} w={600} />
      <T x={300} y={232} s={13} a="middle" f={C.latte} o={fa(t, 2.3, 0.4)}>a byte stream, not a queue of messages</T>
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
  // A time axis draws. With SO_LINGER on, close() is a bar that keeps growing while the queued bytes drain out,
  // and returns only when the queue is empty. Later, on the kernel's own lane, TIME-WAIT is a separate wait.
  const axis = 70;
  const drainK = easeOut(seg(t, 0.5, 1.4));
  const queue = [0, 1, 2, 3];
  return (
    <Svg label="socket(7) and RFC 9293, quoted directly" h={210}>
      <Draw pts={[[axis, 180], [570, 180]]} t={t} from={0.1} to={0.5} stroke={C.mocha} w={1.5} pen={false} />
      <T x={570} y={200} s={13} a="end" f={C.taupe} o={fa(t, 0.3, 0.3)}>time</T>
      <T x={axis} y={40} s={13} f={C.crema} o={fa(t, 0.3, 0.3)}>close() with SO_LINGER</T>
      <rect x={axis} y={52} width={Math.max(2, drainK * 230)} height={18} rx={3} fill={C.caramel} />
      {queue.map((i) => {
        const k = easeOut(seg(t, 0.55 + i * 0.2, 0.85 + i * 0.2));
        return <rect key={i} x={lerp(320 + i * 22, 590, k)} y={54} width={16} height={14} rx={2} fill={C.latte} opacity={1 - k} />;
      })}
      <Draw pts={[[axis + 230, 61], [axis + 230, 100]]} t={t} from={1.4} to={1.6} stroke={C.caramel} w={1.5} />
      <T x={axis + 230} y={118} s={13} a="middle" f={C.latte} o={fa(t, 1.5, 0.3)}>queue empty</T>
      <T x={300} y={145} s={13} f={C.cinnamon} o={fa(t, 1.7, 0.3)}>TIME-WAIT, kernel</T>
      <rect x={300} y={152} width={Math.max(2, easeOut(seg(t, 1.8, 2.5)) * 260)} height={14} rx={3} fill={C.cinnamon} />
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
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="no boundaries kept" />
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
    <Svg label="recap: a byte stream keeps none of your boundaries" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={40} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
