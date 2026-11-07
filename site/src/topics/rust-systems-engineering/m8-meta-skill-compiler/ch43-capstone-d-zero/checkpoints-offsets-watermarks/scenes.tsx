import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const commit = easeOut(seg(t, 0.2, 0.55));
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>fourteen batches, genuinely committed</T>
      <Draw pts={[[40, 55], [320, 55]]} t={t} from={0.2} to={0.55} stroke={C.caramel} w={2} pen />
      <circle cx={40 + commit * 280} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <Draw pts={[[320, 40], [320, 70]]} t={t} from={0.6} to={0.8} stroke={C.caramel} w={2} />
      <T x={300} y={35} s={10} f={C.latte} o={fa(t, 0.65, 0.2)}>checkpoint</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={95} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={117} s={12} a="middle" f={C.mocha}>checkpoint matches: batch fourteen</T>
      </g>
      <T x={60} y={150} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>nothing reprocessed, nothing lost</T>
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
  const commit = easeOut(seg(t, 0.2, 0.5));
  const claim = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>fourteen batches, genuinely committed</T>
      <Draw pts={[[40, 55], [280, 55]]} t={t} from={0.2} to={0.5} stroke={C.caramel} w={2} pen />
      <circle cx={40 + commit * 240} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <Draw pts={[[40, 80], [320, 80]]} t={t} from={0.4} to={0.7} stroke={C.cherry} w={2} pen />
      <circle cx={40 + claim * 280} cy={80} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.4, 0.15)} />
      <T x={330} y={83} s={9} f={C.latte}>claimed</T>
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={100} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={122} s={12} a="middle" f={C.mocha}>checkpoint claims: batch fifteen</T>
      </g>
      <T x={60} y={155} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>a promise the commit never kept</T>
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
  const ids = Array.from({ length: 10 }, (_, i) => i);
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>batch fifteen, never actually committed</T>
      {ids.map((i) => {
        const start = 0.15 + i * 0.03;
        const vanish = easeOut(seg(t, 0.55 + i * 0.02, 0.75 + i * 0.02));
        return (
          <circle
            key={i}
            cx={40 + i * 28}
            cy={55}
            r={5}
            fill="none"
            stroke={C.cherry}
            strokeWidth={1.5}
            opacity={fa(t, start, 0.15) * (1 - vanish)}
          />
        );
      })}
      <T x={40} y={85} s={10} f={C.latte} o={fa(t, 0.6, 0.2)}>restart resumes right after, skipping these</T>
      <g opacity={fa(t, 1.0, 0.3)}>
        <rect x={60} y={105} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={127} s={12} a="middle" f={C.mocha}>ten real records, gone for good</T>
      </g>
      <T x={60} y={165} s={12} f={C.latte} o={fa(t, 1.4, 0.3)}>a loss, not a safe reprocessing</T>
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
