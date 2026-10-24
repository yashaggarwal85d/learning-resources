import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A checkpoint taken after the real commit returns restarts without
// losing or repeating a single real record; one taken before it can
// look identical, until a crash lands in between the two.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does restart reprocess or lose anything (predict) ──────────────
export function CorrectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checkpoint taken after the real commit returns"
        lines={['crash mid-stream, batch fifteen begins', '// does restart reprocess, or lose anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: restart loses nothing, reprocesses nothing ───────────
export function CorrectReveal({ t }: StepCtx) {
  return (
    <Svg label="checkpoint_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>fourteen batches, genuinely committed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>checkpoint matches: batch fourteen</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>nothing reprocessed, nothing lost</T>
    </Svg>
  );
}

// ── 3 · Does the wrong checkpoint still match (predict) ─────────────────
export function WrongPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checkpoint taken at handoff, before the commit"
        lines={['the identical crash, the identical point', '// does the checkpoint still match reality?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the checkpoint runs one batch ahead ───────────────────
export function WrongReveal({ t }: StepCtx) {
  return (
    <Svg label="checkpoint_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>fourteen batches, genuinely committed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>checkpoint claims: batch fifteen</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a promise the commit never kept</T>
    </Svg>
  );
}

// ── 5 · Does the skipped batch come back later (predict) ────────────────
export function RestartPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="restart resumes right after the checkpoint"
        lines={['batch fifteen is skipped, not retried', '// reprocessed later, or gone for good?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: that batch's records are gone for good ───────────────
export function RestartReveal({ t }: StepCtx) {
  return (
    <Svg label="checkpoint_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>batch fifteen, never actually committed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>ten real records, gone for good</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a loss, not a safe reprocessing</T>
    </Svg>
  );
}

// ── 7 · the standard library's own words on a real sync ────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a commit returns once data reaches disk', 'before that return, nothing is durable yet'];
  return (
    <Svg label="std::fs::File, its own words" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['checkpoint after commit: a clean restart', 'checkpoint before commit: a silent loss', 'the two look identical, until a crash lands'];
  return (
    <Svg label="recap: a checkpoint only as true as its commit" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
