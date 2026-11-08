import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// select! dropping its losing branch's future; recv() proven cancel-safe, read_exact proven
// not; a dropped JoinHandle detaching its task rather than cancelling it.
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

// ── 1 · select! races two branches (predict, hook) ──────────────────────────────────────────────
export function SelectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two branches, one winner"
        lines={['select! {', '    v = fast_branch() => v,', '    v = slow_branch() => v,', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the loser never ran (this is the swipe test's "from" step — NO takeaway) ──────
export function SelectReveal({ t }: StepCtx) {
  const fall = easeOut(seg(t, 0.5, 0.85));
  const dy = fall * 25;
  return (
    <Svg label="select_drops_losing_branches.rs: a real, measured drop" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>fast branch wins</T>
      <circle cx={260} cy={57 + dy} r={4} fill={C.cherry} opacity={1 - fall * 0.6} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>loser's side effect: never ran</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>dropped, not delayed</T>
    </Svg>
  );
}

// ── 3 · Cancel a recv() mid-wait (predict) ──────────────────────────────────────────────────────
export function RecvPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="cancel recv(), then send, then recv() again"
        lines={['select! { v = rx.recv() => v, _ = timeout => () }', 'tx.send(42).await?;', 'let v = rx.recv().await?;']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 4 · Measured: nothing lost (takeaway) ───────────────────────────────────────────────────────
export function RecvReveal({ t }: StepCtx) {
  return (
    <Svg label="recv_is_cancel_safe.rs: nothing lost" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cancelled, then sent, then received</T>
      <Draw pts={[[300, 50], [300, 85]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>fresh recv(): the exact value sent</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>safe to drop and start over</T>
    </Svg>
  );
}

// ── 5 · Cancel a read_exact() mid-read (predict) ────────────────────────────────────────────────
export function ReadExactPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="cancel read_exact(), already partway through"
        lines={['select! { r = reader.read_exact(&mut buf) => r, _ = timeout => () }', '// buf already holds some of the stream']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the first half gone for good (takeaway) ──────────────────────────────────────
export function ReadExactReveal({ t }: StepCtx) {
  const lost = easeOut(seg(t, 0.5, 0.85));
  const dy = lost * 25;
  return (
    <Svg label="read_exact_is_not_cancel_safe.rs: a real loss" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cancelled partway through</T>
      <circle cx={170} cy={57 + dy} r={4} fill={C.cherry} opacity={1 - lost * 0.6} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>fresh read: only the second half</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the first half is gone, permanently</T>
    </Svg>
  );
}

// ── 7 · Drop a JoinHandle (predict) ─────────────────────────────────────────────────────────────
export function JoinHandlePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="spawn, then drop the handle immediately"
        lines={['let handle = tokio::spawn(async move { ... });', 'drop(handle);', '// does the task stop?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: still ticking (no takeaway, naming step) ─────────────────────────────────────
export function JoinHandleReveal({ t }: StepCtx) {
  const drop = easeOut(seg(t, 0.4, 0.7));
  const dy = drop * 20;
  const cyclePos = t > 0.9 ? ((t - 0.9) % 0.6) / 0.6 : 0;
  const pulse = cyclePos < 0.5 ? cyclePos * 2 : (1 - cyclePos) * 2;
  return (
    <Svg label="dropped_join_handle_detaches_task.rs: detached, not cancelled" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>handle dropped immediately</T>
      <rect x={300} y={40 + dy} width={60} height={20} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={1 - drop} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {drop > 0.9 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>task: still ticking</T>}
      <circle cx={268} cy={107} r={3} fill={C.caramel} opacity={0.5 + pulse * 0.5} />
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>unobserved, not stopped</T>
    </Svg>
  );
}

// ── 9 · One mechanism, three outcomes (takeaway) ────────────────────────────────────────────────
export function SummaryReveal({ t }: StepCtx) {
  const rows = ['recv() — dropped, nothing lost', 'read_exact — dropped, first half gone', 'a JoinHandle — dropped, task keeps running'];
  const Y = (i: number) => 34 + i * 64;
  const A = (i: number) => 0.2 + i * 0.6;
  const drop = (i: number) => easeInOut(seg(t, A(i) + 0.5, A(i) + 0.9));
  const run = easeOut(seg(t, A(2) + 0.3, 2.8));
  return (
    <Svg label="one drop, three outcomes: a dropped recv leaves the message in the channel; a dropped read_exact loses the bytes it had consumed; a dropped JoinHandle leaves its task running" h={220}>
      {rows.map((r, i) => (
        <RowTitle key={r} t={t} at={A(i)} y={Y(i)} text={r} />
      ))}
      <g opacity={fa(t, A(0), 0.3)}>
        <rect x={60} y={Y(0) + 10} width={60} height={26} rx={5} fill="none" stroke={C.crema} strokeDasharray={drop(0) > 0.5 ? '4 3' : undefined} opacity={1 - drop(0) * 0.6} />
        <T x={90} y={Y(0) + 28} s={12} a="middle" f={C.latte} o={1 - drop(0)}>recv</T>
        <rect x={160} y={Y(0) + 10} width={70} height={26} rx={5} fill="none" stroke={C.mocha} />
        <Chip x={195} y={Y(0) + 23} f={drop(0) >= 1 ? C.caramel : C.crema} />
        <path d={`M240 ${Y(0) + 22} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="24" strokeDashoffset={24 * (1 - drop(0))} opacity={drop(0) > 0 ? 1 : 0} />
      </g>
      <g opacity={fa(t, A(1), 0.3)}>
        {[0, 1, 2, 3, 4, 5].map((j) => {
          const taken = j < 3;
          const k = taken ? easeInOut(seg(t, A(1) + 0.2, A(1) + 0.5)) : 0;
          const gone = taken ? drop(1) : 0;
          return <rect key={j} x={lerp(160 + j * 26, 60 + j * 26, k)} y={Y(1) + 12 + gone * 20} width={22} height={22} rx={3} fill={taken && gone > 0.5 ? C.cherryText : C.crema} opacity={1 - gone} />;
        })}
        <rect x={56} y={Y(1) + 8} width={82} height={30} rx={5} fill="none" stroke={C.latte} strokeDasharray={drop(1) > 0.5 ? '4 3' : undefined} opacity={1 - drop(1) * 0.6} />
      </g>
      <g opacity={fa(t, A(2), 0.3)}>
        <rect x={60} y={Y(2) + 10} width={90} height={26} rx={5} fill="none" stroke={C.crema} strokeDasharray={drop(2) > 0.5 ? '4 3' : undefined} opacity={1 - drop(2) * 0.6} />
        <T x={105} y={Y(2) + 28} s={12} a="middle" f={C.latte} o={1 - drop(2)}>handle</T>
        <line x1={180} y1={Y(2) + 23} x2={lerp(180, 560, run)} y2={Y(2) + 23} stroke={C.caramel} strokeWidth={4} strokeLinecap="round" opacity={run > 0 ? 1 : 0} />
        <circle cx={lerp(180, 560, run)} cy={Y(2) + 23} r={6} fill={C.caramel} opacity={run > 0 && run < 1 ? 1 : 0} />
      </g>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'select! genuinely drops its losing branch',
    "recv() is cancel-safe, loses nothing",
    'read_exact is not, and loses consumed bytes',
    'a dropped JoinHandle detaches, not cancels',
  ];
  return <RecapList t={t} end={3} label="recap: one real drop, four real outcomes" rows={rows} step={55} />;
}
