import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A CancellationToken genuinely rejecting new work outright; a TaskTracker's wait()
// genuinely waiting for real completion; a real deadline genuinely abandoning a straggler.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Cancel a token, then submit (predict, hook) ─────────────────────────────────────────────
export function TokenPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="cancel the token, then try to submit"
        lines={['token.cancel();', 'let accepted = try_accept(&token, &pool);', '// accepted?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: rejected outright (this is the swipe test's "from" step — NO takeaway) ────────
export function TokenReveal({ t }: StepCtx) {
  return (
    <Svg label="shutdown_rejects_new_after_signal.rs: a hard stop" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>before the signal: accepted</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>after the signal: rejected</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a hard stop, not a queue</T>
    </Svg>
  );
}

// ── 3 · Close, then wait() (predict) ────────────────────────────────────────────────────────────
export function TrackerPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="close the tracker, then wait"
        lines={['tracker.close();', 'tracker.wait().await;', '// does this return right away?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: waits for real completion (takeaway) ─────────────────────────────────────────
export function TrackerReveal({ t }: StepCtx) {
  return (
    <Svg label="tracker_waits_for_every_accepted_job.rs: a real wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>8 jobs, one tracker</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>wait() returns: all finished</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>completion, not just a signal</T>
    </Svg>
  );
}

// ── 5 · A deadline against a straggler (predict) ────────────────────────────────────────────────
export function DeadlinePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="wait, but only up to a deadline"
        lines={['timeout(deadline, tracker.wait()).await', '// one job runs far longer than deadline']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · Measured: stops right on time (takeaway) ────────────────────────────────────────────────
export function DeadlineReveal({ t }: StepCtx) {
  return (
    <Svg label="shutdown_meets_its_deadline.rs: a real limit" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a straggler, still running</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>wait: stopped at the deadline</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>not a moment longer</T>
    </Svg>
  );
}

// ── 7 · What is this answering to? (predict) ────────────────────────────────────────────────────
export function SignalPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the real signal behind all of this"
        lines={['// an unhandled crash?', '// or a deliberate request, with a real deadline?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The assembled sequence (no takeaway, connecting step) ──────────────────────────────────
export function SequenceReveal({ t }: StepCtx) {
  const steps = ['1. stop accepting', '2. signal', '3. drain or cancel', '4. close', '5. wait'];
  return (
    <Svg label="the full shutdown sequence, assembled" h={240}>
      {steps.map((s, i) => (
        <g key={s} opacity={fa(t, 0.2 + i * 0.3, 0.4)}>
          <circle cx={30} cy={40 + i * 40} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 40} s={13} f={C.crema}>{s}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Three proven mechanisms, one sequence (takeaway) ────────────────────────────────────────
export function MechanismsReveal({ t }: StepCtx) {
  const rows = [
    'stop accepting — a cancellation token',
    'drain or cancel — cancel safety',
    'wait — a tracker, against a deadline',
  ];
  return (
    <Svg label="every stage, already proven" h={220}>
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
    'a cancellation signal stops new work outright',
    "a tracker's wait means real completion, not a signal",
    'a stated deadline is genuinely enforced',
    'three proven mechanisms, one explicit sequence',
  ];
  return (
    <Svg label="recap: a real stop, a real wait, a real deadline" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
