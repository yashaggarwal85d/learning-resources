import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// select! dropping its losing branch's future; recv() proven cancel-safe, read_exact proven
// not; a dropped JoinHandle detaching its task rather than cancelling it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="select_drops_losing_branches.rs: a real, measured drop" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>fast branch wins</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>loser's side effect: never ran</T>
      </g>
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
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>fresh recv(): the exact value sent</T>
      </g>
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
  return (
    <Svg label="read_exact_is_not_cancel_safe.rs: a real loss" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cancelled partway through</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>fresh read: only the second half</T>
      </g>
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
  return (
    <Svg label="dropped_join_handle_detaches_task.rs: detached, not cancelled" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>handle dropped immediately</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>task: still ticking</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>unobserved, not stopped</T>
    </Svg>
  );
}

// ── 9 · One mechanism, three outcomes (takeaway) ────────────────────────────────────────────────
export function SummaryReveal({ t }: StepCtx) {
  const rows = [
    'recv() — dropped, nothing lost',
    'read_exact — dropped, first half gone',
    'a JoinHandle — dropped, task keeps running',
  ];
  return (
    <Svg label="one drop, three different outcomes" h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
  return (
    <Svg label="recap: one real drop, four real outcomes" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
