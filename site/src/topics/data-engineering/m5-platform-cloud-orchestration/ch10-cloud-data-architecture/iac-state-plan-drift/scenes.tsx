import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every mechanism here traces to HashiCorp's, OpenTofu's, Pulumi's or AWS's own current
// documentation (SOURCES.md), or to examples.py's local simulation of state, locking,
// plan/apply, drift, import and a policy gate. No real Terraform/OpenTofu binary runs in this
// sandbox (disclosed in OUTLINE.md). Any array cycled by a time-derived index uses an explicit
// Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: two unlocked applies, no error, a silent revert.
export function RaceHook({ t }: StepCtx) {
  const second = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Two applies against the same unlocked state, eight seconds apart" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Operator A applies: versioning added</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>bucket policy: private, versioning on</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={second > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={second > 0.5 ? C.second : C.latte} serif>{second > 0.5 ? 'operator B applies: versioning silently gone' : 'operator B: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what is a plan diffed against?
export function PredictDiffTarget({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A plan compares desired configuration against something — but what?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>What does a plan compare against?</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>the live cloud, checked fresh each time</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>the tool's own last-known record</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the record is the state file' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · State is the tool's own record.
export function StateIsTheRecord({ t }: StepCtx) {
  const stale = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="State as a record of the past, compared against a live system that may have moved on" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>State: a record, not a live read</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>last-known binding, written at the last apply</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={stale > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={stale > 0.5 ? C.second : C.latte} w={400}>{stale > 0.5 ? 'every plan is built on this record, stale or not' : 'next plan: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Locking: a hard block, not a warning.
export function LockingGuard({ t }: StepCtx) {
  const blocked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A second lock request failing outright while the first holder still holds it" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Operator A holds the lock</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>lock acquired: writing state</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={blocked > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={blocked > 0.5 ? C.caramel : C.latte}>{blocked > 0.5 ? 'operator B: lock request fails outright' : 'operator B: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Plan, then apply.
export function PlanThenApply({ t }: StepCtx) {
  const applied = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A reviewable plan, then the separate step that actually commits it" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Plan: a description, nothing changes yet</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>reviewed by a human before anything commits</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={applied > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={applied > 0.5 ? C.second : C.latte} w={400}>{applied > 0.5 ? 'apply: remote system and state both updated' : 'apply: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Drift and import, two directions of the same gap.
export function DriftAndImport({ t }: StepCtx) {
  const imported = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A console click causing drift, then import closing the same gap" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>A console click, outside the tool</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>drift: next plan shows record vs reality</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={imported > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={imported > 0.5 ? C.second : C.latte} serif>{imported > 0.5 ? 'import: adopted, not recreated' : 'import: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · One module boundary: bucket, catalog, IAM.
export function ModuleBoundary({ t }: StepCtx) {
  const parts = [
    { name: 'Bucket', trait: 'the storage itself' },
    { name: 'Catalog entry', trait: 'registered, governed, discoverable' },
    { name: 'IAM role', trait: 'who can actually touch it' },
  ];
  const raw = Math.floor((t / 4.4) * parts.length);
  const active = Number.isFinite(raw) ? Math.min(parts.length - 1, Math.max(0, raw)) : 0;
  const part = parts[active];
  return (
    <Stack>
      <Svg label="One reviewable module, three parts shown one at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>One module, one review, three parts</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{part.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{part.trait}</T>
      </Svg>
    </Stack>
  );
}

// 8 · The license changed, a fork answered.
export function LicenseFork({ t }: StepCtx) {
  const forked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A license change in 2023, and the fork that followed" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>2023: open source to Business Source License</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>little advance notice to the community</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={forked > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={forked > 0.5 ? C.second : C.latte} w={400}>{forked > 0.5 ? 'OpenTofu: forked, now under the Linux Foundation' : 'fork: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · A real language instead of a declarative file.
export function GeneralPurposeIac({ t }: StepCtx) {
  const risk = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Real language power, and the real risk that comes with it" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Pulumi, AWS CDK: a real language</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>loops, conditionals, real abstractions</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={risk > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={risk > 0.5 ? C.caramel : C.latte} w={400}>{risk > 0.5 ? 'the same power can quietly break plan/apply' : 'trade-off: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 10 · A policy gate blocking a bad plan.
export function PolicyGate({ t }: StepCtx) {
  const blocked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A plan containing a forbidden resource, blocked before apply can run" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>A plan reaches the gate</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>contains a forbidden resource type</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={blocked > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={blocked > 0.5 ? C.second : C.latte} serif>{blocked > 0.5 ? 'blocked: apply never runs' : 'verdict: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 11 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['state is a record, not a live read', 'locking stops two applies colliding on it', 'a policy gate can block a bad plan before apply'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>The record, the lock, the gate</T>
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

// 12 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A plan that made a bucket public, shipped with no human review" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>A bad plan shipped unreviewed</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>what single mechanism stops this?</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'a policy gate checking the plan itself' : 'which mechanism?'}</T>
      </Svg>
    </Stack>
  );
}
