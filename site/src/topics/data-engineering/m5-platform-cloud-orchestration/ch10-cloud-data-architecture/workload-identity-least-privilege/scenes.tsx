import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, SERIF, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is executed and checked by examples.py.

// 1 · Hook: a static key's long validity bar versus a federated credential's short, resetting ticks.
export function StolenKeyVsCredential({ t }: StepCtx) {
  const show = clamp(seg(t, 0.2, 1));
  return (
    <Stack>
      <Svg label="A static key's validity bar stretches unbroken across one wide box labeled raw and curated; a federated credential's validity bar is a row of short ticks, each scoped to a narrow raw-only box" h={320}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same theft, two keys</T>

        <T x={60} y={60} s={13} a="start" f={C.latte} serif>static key</T>
        <Bar x={60} y={70} w={480 * show} h={28} full={480} fill={C.bad} o={0.6} />
        <T x={300} y={90} s={12} a="middle" f={C.badText} w={700}>raw + curated, unbroken</T>

        <T x={60} y={150} s={13} a="start" f={C.latte} serif>federated credential</T>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={60 + i * 98} y={160} width={70} height={28} rx={4} fill={C.second} opacity={clamp(seg(t, 0.3 + i * 0.1, 0.3 + i * 0.1 + 0.2))} />
        ))}
        <T x={300} y={222} s={12} a="middle" f={C.caramel} w={700}>raw only, resets every tick</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what made the difference?
export function WhatMadeTheDifference({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="The federated credential's validity window is highlighted and labeled with its own lifetime, separate from the laptop's own defenses" h={320}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>What actually changed</T>
        <rect x={60} y={64} width={480} height={64} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={90} s={13} a="middle" f={C.latte} serif>the laptop's own defenses</T>
        <T x={300} y={114} s={13} a="middle" f={C.taupe} w={700}>already failed, both times</T>

        <rect x={60} y={150} width={480} height={64} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={176} s={13} a="middle" f={C.latte} serif>the credential itself</T>
        <T x={300} y={200} s={13} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'short-lived, scoped' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Three clouds, the same broker pattern.
export function ThreeCloudsBrokerPattern({ t }: StepCtx) {
  const step2 = clamp(seg(t, 0.3, 0.6));
  const step3 = clamp(seg(t, 0.6, 0.9));
  return (
    <Stack>
      <Svg label="One shared diagram: a workload proves its identity to a broker, and the broker hands back a short-lived credential, with each cloud's own name filled in underneath" h={320} fill>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>One exchange, three names</T>

        <rect x={40} y={56} width={140} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={110} y={84} s={12} a="middle" f={C.latte} serif>workload</T>

        <rect x={230} y={56} width={140} height={48} rx={8} fill="none" stroke={step2 > 0.1 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.crema} serif>identity broker</T>

        <rect x={420} y={56} width={140} height={48} rx={8} fill="none" stroke={step3 > 0.1 ? C.caramel : C.mocha} strokeWidth={2} opacity={step3 > 0.1 ? 1 : 0.4} />
        <T x={490} y={84} s={12} a="middle" f={C.caramel} w={700}>short-lived credential</T>

        {['AWS: IRSA / Pod Identity', 'GKE: Workload Identity Federation', 'Azure: Entra workload identity'].map((label, i) => (
          <T key={label} x={300} y={150 + i * 36} s={13} a="middle" f={C.taupe} opacity={clamp(seg(t, 0.2 + i * 0.25, 0.2 + i * 0.25 + 0.2))}>{label}</T>
        ))}
      </Svg>
    </Stack>
  );
}

// 4 · A trust policy answers one question; a permission policy answers another.
export function TrustVsPermission({ t }: StepCtx) {
  const gate1 = t > 0.8;
  const gate2 = t > 1.8;
  return (
    <Stack>
      <Svg label="Two independent gates in sequence on one role: who may assume it, then what it may do, both required before a credential does anything" h={260}>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>Two gates, one role</T>

        <rect x={40} y={60} width={220} height={60} rx={8} fill="none" stroke={gate1 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={150} y={86} s={13} a="middle" f={C.crema} serif>trust policy</T>
        <T x={150} y={106} s={11} a="middle" f={C.taupe}>who may assume it</T>

        <rect x={340} y={60} width={220} height={60} rx={8} fill="none" stroke={gate2 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={450} y={86} s={13} a="middle" f={C.crema} serif>permission policy</T>
        <T x={450} y={106} s={11} a="middle" f={C.taupe}>what it may then do</T>

        <T x={300} y={170} s={13} a="middle" f={gate2 ? C.caramel : C.taupe} w={700}>{gate2 ? 'both must open' : 'both gates checked in order'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · A boundary and an org guardrail are the same idea, drawn at different sizes.
export function BoundaryAndGuardrail({ t }: StepCtx) {
  const shrink = clamp(seg(t, 0.3, 1.2));
  const wide = t > 1.6;
  return (
    <Stack>
      <Svg label="A permission policy's region shrinks once intersected with a smaller permission-boundary region, then the same cap is redrawn at account scale as an SCP" h={300}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same cap, two sizes</T>

        <rect x={60} y={56} width={480 * (1 - shrink * 0.5)} height={40} rx={6} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.caramel} w={700}>permission ∩ boundary</T>

        <rect x={60} y={150} width={480} height={40} rx={6} fill="none" stroke={wide ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={176} s={12} a="middle" f={wide ? C.badText : C.taupe} w={700}>{wide ? 'SCP caps the whole account, root included' : 'same rule, drawn around an account'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · The escalation, reproduced — and closed.
export function EscalationReproduced({ t }: StepCtx) {
  const broken = t > 1;
  const fixed = t > 2.6;
  return (
    <Stack>
      <Svg label="A policy evaluator runs twice: wide PassRole lets a launch escalate to an admin role's permissions; scoped PassRole rejects the same admin role while still allowing an approved one" h={320}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same launch, two PassRole scopes</T>

        <T x={150} y={56} s={13} a="middle" f={C.latte} serif>Resource: "*"</T>
        <rect x={40} y={66} width={220} height={60} rx={8} fill="none" stroke={broken ? C.bad : C.mocha} strokeWidth={2} />
        <T x={150} y={100} s={12} a="middle" f={broken ? C.badText : C.taupe} w={700}>{broken ? 'admin role passed' : 'launching...'}</T>

        <T x={450} y={56} s={13} a="middle" f={C.latte} serif>Resource: approved pattern</T>
        <rect x={340} y={66} width={220} height={60} rx={8} fill="none" stroke={fixed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={450} y={100} s={12} a="middle" f={fixed ? C.caramel : C.taupe} w={700}>{fixed ? 'admin role rejected' : 'launching...'}</T>

        <T x={300} y={180} s={13} a="middle" f={C.taupe}>the only difference is which roles the Resource element allows</T>
      </Svg>
    </Stack>
  );
}

// 7 · Raw and curated are never the same role.
export function RawVsCuratedRoles({ t }: StepCtx) {
  const breach = t > 1;
  return (
    <Stack>
      <Svg label="A breach arrow hits a raw-role box and visibly stops at its boundary, never reaching a separate curated-role box" h={280}>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>One breach, two roles</T>

        <rect x={60} y={64} width={200} height={70} rx={8} fill="none" stroke={breach ? C.bad : C.mocha} strokeWidth={2} />
        <T x={160} y={92} s={13} a="middle" f={C.crema} serif>raw role</T>
        <T x={160} y={114} s={12} a="middle" f={breach ? C.badText : C.taupe} w={700}>{breach ? 'breached' : 'scoped to raw'}</T>

        <rect x={340} y={64} width={200} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={440} y={92} s={13} a="middle" f={C.crema} serif>curated role</T>
        <T x={440} y={114} s={12} a="middle" f={C.taupe} w={700}>untouched</T>

        <T x={300} y={180} s={13} a="middle" f={C.taupe}>zero shared permissions, zero shared blast radius</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap(_: StepCtx) {
  const lines = [
    'Roles over static keys, everywhere this topic looked.',
    'Trust, permission, boundary and org guardrail are four distinct gates.',
    'Scope which role may be passed; never let raw and curated roles overlap.',
  ];
  return (
    <Stack>
      <div className="flex flex-col gap-3">
        {lines.map((l, i) => (
          <div key={i} className="rounded-lg border px-4 py-3" style={{ borderColor: C.mocha }}>
            <span style={{ color: C.crema, fontFamily: SERIF, fontSize: 15 }}>{l}</span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

// 9 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A CI service account is given permission to pass any role in the account, reasoning that today's roles are already scoped tightly; the gap reopens the moment a higher-privileged role is created later" h={300}>
        <T x={300} y={28} s={15} a="middle" f={C.taupe} serif>Safe today, safe tomorrow?</T>
        <rect x={60} y={62} width={480} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={92} s={14} a="start" f={C.latte} serif>CI account can pass any role</T>

        <rect x={60} y={132} width={480} height={50} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={80} y={162} s={14} a="start" f={C.latte} serif>a new, higher-privileged role appears later</T>

        <T x={300} y={226} s={13} a="middle" f={revealed ? C.badText : C.taupe} w={700}>
          {revealed ? 'that role is passable too — same gap, reopened' : 'is today\'s scoping enough?'}
        </T>
      </Svg>
    </Stack>
  );
}
