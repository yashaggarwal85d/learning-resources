import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every mechanism here traces to BigQuery's, Snowflake's, Databricks' or Google Cloud's own
// current documentation (SOURCES.md), or to examples.py's local simulation. No real account in
// any of the four platforms runs in this sandbox. Any array cycled by a time-derived index uses
// an explicit Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: a runaway query, then the same query guarded.
export function RunawayQueryHook({ t }: StepCtx) {
  const guarded = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A query with no limit and no filter, unguarded then guarded" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>No LIMIT, no partition filter</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>unguarded: scans the whole table, full cost</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={guarded > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={guarded > 0.5 ? C.second : C.latte} serif>{guarded > 0.5 ? 'guarded: fails instantly, zero cost' : 'guarded: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which controls stop a cost vs merely flag it?
export function PredictStopsVsFlags({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A tag, an alert, and a guardrail — which one actually stops the money?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Which one stops the cost, not just flags it?</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>a tag, or an alert after the fact</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>a guardrail that refuses to run</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'only a before-the-fact check actually stops it' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Max bytes billed: fails before the charge.
export function MaxBytesBilled({ t }: StepCtx) {
  const blocked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A byte estimate checked before execution, blocking the query before any charge" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Estimate first, then decide</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>estimated bytes checked against the cap</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={blocked > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={blocked > 0.5 ? C.second : C.latte} serif>{blocked > 0.5 ? 'over the cap: fails now, zero charge' : 'verdict: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Warehouse sizing, auto-suspend, and a resource monitor that acts.
export function WarehouseAndMonitor({ t }: StepCtx) {
  const monitor = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="An idle warehouse auto-suspending, and a resource monitor acting at a credit threshold" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Idle warehouse: auto-suspend stops billing</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>per-second billing, nothing while suspended</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={monitor > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={monitor > 0.5 ? C.second : C.latte} w={400}>{monitor > 0.5 ? 'resource monitor: suspends at the credit quota' : 'monitor: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · A tag is not a cap.
export function TaggingNotCapping({ t }: StepCtx) {
  const spent = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A budget policy's tag attached to spend that happens regardless" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>A tag travels with the spend</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>tag applied: shows up correctly in the bill</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={spent > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={spent > 0.5 ? C.caramel : C.latte} w={400}>{spent > 0.5 ? 'the spend happens exactly the same either way' : 'spend: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Preemption, and checkpoint-and-resume.
export function PreemptionCheckpoint({ t }: StepCtx) {
  const resumed = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A preemption mid-job, and a checkpoint limiting how much work is actually lost" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Preempted partway through the job</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>without a checkpoint: the whole job is lost</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={resumed > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={resumed > 0.5 ? C.second : C.latte} serif>{resumed > 0.5 ? 'with a checkpoint: only since the last save' : 'resume: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · Commitment break-even.
export function CommitmentBreakeven({ t }: StepCtx) {
  const above = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A committed discount that only wins above its own break-even utilization" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Below break-even: on-demand would be cheaper</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>light usage: the commitment loses to flexibility</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={above > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={above > 0.5 ? C.second : C.latte} w={400}>{above > 0.5 ? 'past break-even: the commitment actually wins' : 'utilization: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Cost regression failing a CI run.
export function CostRegressionGate({ t }: StepCtx) {
  const red = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A pipeline's cost crossing a stated budget, turning a green CI run red" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Pipeline cost, measured on every run</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>within budget: build stays green</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={red > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={red > 0.5 ? C.caramel : C.latte}>{red > 0.5 ? 'over budget: build fails, same as any regression' : 'next run: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['a cap and a monitor block; a tag only labels', 'a discount costs you interruption or commitment', 'a cost spike can fail a build on its own'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Blocking, flagging, and the difference</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.25));
          return (
            <T key={label} x={300} y={86 + i * 36} s={13} a="middle" f={C.latte} o={show} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 10 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="An unattended overnight job, no cap configured, picking what would have actually stopped it" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Unattended, overnight, no byte cap</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>what would have stopped the cost itself?</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'a byte cap, checked before the query runs' : 'which change?'}</T>
      </Svg>
    </Stack>
  );
}
