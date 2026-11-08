import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// mpsc backpressure, broadcast lagging receivers, watch's latest-value-only guarantee, and
// try_send's immediate refusal, each measured directly against a real Tokio channel.
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

/** A message chip at (x, y): a small rounded block. */
function Chip({ x, y, f = C.crema, o = 1, k = 1 }: { x: number; y: number; f?: string; o?: number; k?: number }) {
  if (o <= 0 || k <= 0) return null;
  return <rect x={x - 11 * k} y={y - 9 * k} width={22 * k} height={18 * k} rx={4} fill={f} opacity={o} />;
}

/** A row title that slides in from the left on its beat. */
function RowTitle({ t, at, y, text }: { t: number; at: number; y: number; text: string }) {
  const k = easeOut(seg(t, at, at + 0.4));
  return (
    <g opacity={k} transform={`translate(${((1 - k) * -30).toFixed(1)} 0)`}>
      <T x={30} y={y} s={13} f={C.crema}>{text}</T>
    </g>
  );
}

// ── 1 · Fast producer, slow consumer (predict, hook) ────────────────────────────────────────────
export function MpscPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one slot, a producer, a slower consumer"
        lines={['let (tx, rx) = mpsc::channel(1);', 'for i in 0..20 { tx.send(i).await?; }', '// consumer: sleep(15ms) between reads']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: paced (this is the swipe test's "from" step — NO takeaway) ────────────────────
export function MpscReveal({ t }: StepCtx) {
  const prod = easeOut(seg(t, 0.9, 1.5));
  const cons = easeOut(seg(t, 0.95, 1.55));
  return (
    <Svg label="mpsc_applies_backpressure.rs: a real, measured pace" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>20 messages, capacity 1</T>
      <rect x={60} y={85} width={prod * 220} height={16} rx={4} fill={C.caramel} opacity={0.6} />
      <rect x={60} y={108} width={cons * 220} height={16} rx={4} fill={C.taupe} opacity={0.6} />
      {prod > 0.9 && <T x={60} y={145} s={13} f={C.mocha}>290ms producer ≈ 290ms consumer</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>paced, not raced</T>
    </Svg>
  );
}

// ── 3 · 5 sends, room for 2, no reader (predict) ────────────────────────────────────────────────
export function BroadcastPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="room for 2, but 5 values are sent"
        lines={['let (tx, mut rx) = broadcast::channel(2);', 'for v in 0..5 { tx.send(v)?; }', '// rx hasn\'t read anything yet']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: Lagged, named (takeaway) ──────────────────────────────────────────────────────
export function BroadcastReveal({ t }: StepCtx) {
  return (
    <Svg label="broadcast_lagging_receiver_drops.rs: a named loss" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>5 sent, 2 kept</T>
      {[0, 1, 2, 3, 4].map((i) => {
        const dropped = i < 3;
        const fall = easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1));
        const dy = dropped ? fall * 20 : 0;
        return (
          <circle key={i} cx={70 + i * 20} cy={82 + dy} r={5} fill={dropped ? C.cherry : C.caramel} opacity={dropped ? 1 - fall * 0.5 : 1} />
        );
      })}
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={170} y={120} s={13} a="middle" f={C.mocha}>Lagged: 3 dropped</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>then resumes from what's left</T>
    </Svg>
  );
}

// ── 5 · 50 sends, one late reader (predict) ─────────────────────────────────────────────────────
export function WatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="50 sends, nobody checking in until the end"
        lines={['let (tx, mut rx) = watch::channel(0);', 'for v in 1..=50 { tx.send(v)?; }', 'let seen = *rx.borrow_and_update();']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 6 · Measured: only the latest (takeaway) ────────────────────────────────────────────────────
export function WatchReveal({ t }: StepCtx) {
  const sweep = easeOut(seg(t, 0.5, 1.0));
  const dotX = 60 + sweep * 220;
  return (
    <Svg label="watch_keeps_only_latest.rs: 49 gone, on purpose" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>50 values sent</T>
      <circle cx={dotX} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.3)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {sweep > 0.9 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>seen: 50 only</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the other 49 were never meant to be kept</T>
    </Svg>
  );
}

// ── 7 · try_send on a full channel (predict) ────────────────────────────────────────────────────
export function TrySendPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the channel is already full"
        lines={['tx.try_send(1)?;', 'let second = tx.try_send(2); // ?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: refused instantly (no takeaway, naming step) ─────────────────────────────────
export function TrySendReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 30;
  return (
    <Svg label="try_send_sheds_load_immediately.rs: a decision, not a wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>channel already full</T>
      <Draw pts={[[230, 82], [260, 82]]} t={t} from={0.5} to={0.65} stroke={C.caramel} w={2} />
      <circle cx={230 + dx} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 0.9, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>refused: under a millisecond</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>no wait, no silent drop</T>
    </Svg>
  );
}

// ── 9 · Four channels, four promises (takeaway) ─────────────────────────────────────────────────
export function ComparisonReveal({ t }: StepCtx) {
  const rows = ['mpsc — waits for room', 'broadcast — drops oldest, reports it', 'watch — keeps only the latest', 'oneshot — exactly one reply'];
  const Y = (i: number) => 34 + i * 62;
  const A = (i: number) => 0.2 + i * 0.5;
  // mpsc: a full buffer; the sender waits until the receiver takes one out, then its message enters.
  const m0 = A(0);
  const take = easeInOut(seg(t, m0 + 0.6, m0 + 1.0));
  const enter = easeInOut(seg(t, m0 + 1.0, m0 + 1.3));
  // broadcast: a new message pushes in, the oldest falls out.
  const b0 = A(1);
  const push = easeInOut(seg(t, b0 + 0.5, b0 + 0.9));
  // watch: three values arrive, each replacing the one before.
  const w0 = A(2);
  const wv = [0, 1, 2].map((j) => easeOutBack(seg(t, w0 + 0.4 + j * 0.3, w0 + 0.6 + j * 0.3)));
  // oneshot: one message crosses, then the channel is closed.
  const o0 = A(3);
  const fly = easeInOut(seg(t, o0 + 0.4, o0 + 0.8));
  const shut = easeOut(seg(t, o0 + 0.8, o0 + 1.0));
  const band = (i: number) => fa(t, A(i), 0.3);
  return (
    <Svg label="four channels, four promises: mpsc makes the sender wait, broadcast drops the oldest and reports it, watch keeps only the latest, oneshot carries one reply and closes" h={260}>
      {rows.map((r, i) => (
        <RowTitle key={r} t={t} at={A(i)} y={Y(i)} text={r} />
      ))}
      <g opacity={band(0)}>
        <rect x={300} y={Y(0) + 8} width={96} height={26} rx={5} fill="none" stroke={C.mocha} />
        {[0, 1, 2].map((j) => (
          <Chip key={j} x={lerp(316 + j * 32, 316 + j * 32 + 32, j === 2 ? take : 0) + (j < 2 ? take * 32 : 0)} y={Y(0) + 21} o={j === 2 ? 1 - take : 1} />
        ))}
        <Chip x={lerp(260 + Math.sin(t * 14) * (take > 0 ? 0 : 2), 316, enter)} y={Y(0) + 21} f={C.caramel} />
      </g>
      <g opacity={band(1)}>
        <rect x={300} y={Y(1) + 8} width={96} height={26} rx={5} fill="none" stroke={C.mocha} />
        {[0, 1, 2].map((j) => (
          <Chip key={j} x={316 + j * 32 + push * 32} y={Y(1) + 21 + (j === 2 ? push * 22 : 0)} f={j === 2 && push > 0.5 ? C.cherryText : C.crema} o={j === 2 ? 1 - push * 0.4 : 1} />
        ))}
        <Chip x={lerp(260, 316, push)} y={Y(1) + 21} f={C.caramel} />
        <T x={410} y={Y(1) + 26} s={13} f={C.cherryText} o={easeOut(seg(t, b0 + 0.9, b0 + 1.1))}>lagged</T>
      </g>
      <g opacity={band(2)}>
        <rect x={300} y={Y(2) + 8} width={36} height={26} rx={5} fill="none" stroke={C.mocha} />
        {wv.map((k, j) => (
          <Chip key={j} x={318} y={Y(2) + 21} k={k * (j < 2 ? 1 - wv[j + 1] : 1)} f={j === 2 ? C.caramel : C.crema} />
        ))}
      </g>
      <g opacity={band(3)}>
        <line x1={260} y1={Y(3) + 21} x2={460} y2={Y(3) + 21} stroke={C.mocha} strokeWidth={1.5} />
        <Chip x={lerp(260, 460, fly)} y={Y(3) + 21} f={C.caramel} o={fly > 0 ? 1 : 0} />
        {shut > 0 && <path d={`M${360 - 8 * shut} ${Y(3) + 13} l${16 * shut} ${16 * shut} M${360 + 8 * shut} ${Y(3) + 13} l${-16 * shut} ${16 * shut}`} stroke={C.cherryText} strokeWidth={2.5} />}
        <T x={480} y={Y(3) + 26} s={13} f={C.latte} o={shut}>closed</T>
      </g>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'mpsc genuinely paces a fast producer',
    'broadcast reports exactly what a receiver missed',
    'watch keeps only the latest value, by design',
    'try_send refuses a full channel outright',
  ];
  return <RecapList t={t} end={3} label="recap: four real promises, each measured" rows={rows} step={55}
      s={14}
    />;
}
