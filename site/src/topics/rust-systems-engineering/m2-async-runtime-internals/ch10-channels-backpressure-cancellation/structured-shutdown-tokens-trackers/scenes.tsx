import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A CancellationToken genuinely rejecting new work outright; a TaskTracker's wait()
// genuinely waiting for real completion; a real deadline genuinely abandoning a straggler.
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
  const bounce = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 25;
  return (
    <Svg label="shutdown_rejects_new_after_signal.rs: a hard stop" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>before the signal: accepted</T>
      <circle cx={255 + dx} cy={82} r={4} fill={C.cherry} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>after the signal: rejected</T>}
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
  const jobs = [0, 1, 2, 3, 4, 5, 6, 7];
  const len = [0.9, 1.4, 0.7, 1.8, 1.1, 1.6, 0.8, 2.1];
  const close = easeOutBack(seg(t, 0.4, 0.7));
  const done = (i: number) => easeInOut(seg(t, 0.5, 0.5 + len[i]));
  const last = 0.5 + Math.max(...len);
  const ret = easeOutBack(seg(t, last, last + 0.3));
  return (
    <Svg label="tracker_waits_for_every_accepted_job.rs: the tracker closes, eight jobs run to completion at their own pace, and wait() returns only after the last one finishes" h={230}>
      <T x={30} y={26} s={14} f={C.crema} o={fa(t, 0.2, 0.3)}>8 jobs, one tracker</T>
      {jobs.map((i) => (
        <g key={i}>
          <rect x={60} y={42 + i * 18} width={300} height={10} rx={3} fill={C.cocoa} />
          <rect x={60} y={42 + i * 18} width={Math.max(2, 300 * done(i))} height={10} rx={3} fill={done(i) >= 1 ? C.caramel : C.crema} />
        </g>
      ))}
      {close > 0 && (
        <g transform={`translate(390 30) scale(${Math.min(1, close).toFixed(3)}) translate(-390 -30)`}>
          <rect x={380} y={18} width={110} height={24} rx={12} fill="none" stroke={C.latte} />
          <T x={435} y={35} s={12} a="middle" f={C.latte}>closed</T>
        </g>
      )}
      <line x1={370} y1={42} x2={370} y2={186} stroke={ret > 0 ? C.caramel : C.mocha} strokeWidth={2} strokeDasharray="4 3" />
      <T x={480} y={110} s={13} a="middle" f={ret > 0 ? C.caramel : C.latte}>{ret > 0 ? 'wait() returns' : 'wait() …'}</T>
      <T x={30} y={216} s={13} f={C.latte} o={fa(t, last, 0.3)}>completion, not just a signal</T>
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
  const grow = easeOut(seg(t, 0.4, 0.9));
  const w = grow * 220;
  return (
    <Svg label="shutdown_meets_its_deadline.rs: a real limit" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a straggler, still running</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.9 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>stopped at 301ms: the deadline</T>}
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
  const rows = ['stop accepting — a cancellation token', 'drain or cancel — cancel safety', 'wait — a tracker, against a deadline'];
  const Y = (i: number) => 40 + i * 62;
  const A = (i: number) => 0.3 + i * 0.7;
  const pulse = easeInOut(seg(t, 0.2, 0.3 + 2 * 0.7));
  // stage glyphs: a gate that drops and turns new work away; a queue that empties; a tracker bar racing a deadline
  const gate = easeOutBack(seg(t, A(0) + 0.2, A(0) + 0.5));
  const bounce = easeOut(seg(t, A(0) + 0.5, A(0) + 0.8));
  const drain = easeInOut(seg(t, A(1) + 0.2, A(1) + 0.7));
  const fin = easeInOut(seg(t, A(2) + 0.1, A(2) + 0.6));
  return (
    <Svg label="the shutdown sequence, stage by stage: stop accepting is the token, drain or cancel is cancel safety, and wait is the tracker against a deadline" h={220}>
      <line x1={14} y1={Y(0) - 5} x2={14} y2={lerp(Y(0) - 5, Y(2) - 5, pulse)} stroke={C.mocha} strokeWidth={2} />
      <circle cx={14} cy={lerp(Y(0) - 5, Y(2) - 5, pulse)} r={5} fill={C.caramel} opacity={pulse > 0 && pulse < 1 ? 1 : 0} />
      {rows.map((r, i) => (
        <RowTitle key={r} t={t} at={A(i)} y={Y(i)} text={r} />
      ))}
      <g opacity={fa(t, A(0), 0.3)}>
        <line x1={lerp(400, 400, gate)} y1={Y(0) - 22 + 10 * (1 - Math.min(1, gate))} x2={400} y2={Y(0) + 6} stroke={C.cherryText} strokeWidth={3} opacity={gate > 0 ? 1 : 0} />
        <Chip x={lerp(460, 412, Math.min(1, gate)) + bounce * 40} y={Y(0) - 6} f={C.latte} />
      </g>
      <g opacity={fa(t, A(1), 0.3)}>
        {[0, 1, 2].map((j) => (
          <Chip key={j} x={440 + j * 28 + drain * (110 - j * 28)} y={Y(1) - 6} o={1 - Math.max(0, drain * 3 - j) * 0.9} />
        ))}
      </g>
      <g opacity={fa(t, A(2), 0.3)}>
        <rect x={400} y={Y(2) - 12} width={160} height={10} rx={3} fill={C.cocoa} />
        <rect x={400} y={Y(2) - 12} width={130 * fin} height={10} rx={3} fill={C.caramel} />
        <line x1={540} y1={Y(2) - 20} x2={540} y2={Y(2) + 6} stroke={C.cherryText} strokeWidth={2} />
      </g>
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
  return <RecapList t={t} end={3} label="recap: a real stop, a real wait, a real deadline" rows={rows} step={55}
      s={13}
    />;
}
