import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, SERIF, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is executed and checked by examples.py.

// 1 · Hook: naive rotation's bars meet exactly, dual-credential's bars overlap.
export function OnePasswordRevoked({ t }: StepCtx) {
  const cut = t > 1.2;
  const overlap = t > 2.6;
  return (
    <Stack>
      <Svg label="A naive rotation's two validity bars meet exactly with a failure mark at the join; a dual-credential rotation's bars overlap with no mark landing in a gap" h={320}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same rotation, two shapes</T>

        <T x={60} y={56} s={13} a="start" f={C.latte} serif>naive: one password</T>
        <Bar x={60} y={66} w={240} h={24} full={240} fill={C.second} />
        <Bar x={300} y={66} w={240 * clamp(seg(t, 0.2, 1))} h={24} full={240} fill={cut ? C.caramel : C.mocha} o={0.6} />
        <circle cx={300} cy={78} r={6} fill={cut ? C.bad : C.mocha} opacity={cut ? 1 : 0} />
        <T x={300} y={104} s={11} a="middle" f={cut ? C.badText : C.taupe} w={700}>{cut ? 'in-flight request fails here' : ''}</T>

        <T x={60} y={160} s={13} a="start" f={C.latte} serif>dual-credential: two roles</T>
        <Bar x={60} y={170} w={260} h={24} full={260} fill={C.second} />
        <Bar x={220} y={170} w={280 * clamp(seg(t, 0.3, 1))} h={24} full={280} fill={C.caramel} o={0.7} />
        <T x={300} y={222} s={12} a="middle" f={overlap ? C.caramel : C.taupe} w={700}>{overlap ? 'overlap window, no mark lands in a gap' : ''}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what prevents every one of those failures?
export function WhatPreventsFailures({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="The hook's two timelines, now with the overlap window itself highlighted and labeled" h={300}>
        <T x={300} y={26} s={15} a="middle" f={C.taupe} serif>Where the fix actually lives</T>

        <rect x={60} y={54} width={480} height={64} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={92} s={13} a="middle" f={C.latte} serif>revoke the instant the new one appears</T>

        <rect x={60} y={138} width={480} height={80} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={170} s={13} a="middle" f={C.latte} serif>revoke only after everything has moved</T>
        <T x={300} y={200} s={13} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the overlap window' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · A secret store is not just a place to put a string.
export function NotJustAPlaceToPut({ t }: StepCtx) {
  const items = ['access control', 'audit log', 'versioning'];
  return (
    <Stack>
      <Svg label="One box labeled the string itself, next to three labeled capabilities a secret store or Vault adds on top of it" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>More than a place to put a string</T>
        <rect x={60} y={56} width={160} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={140} y={86} s={13} a="middle" f={C.latte} serif>the string itself</T>

        {items.map((label, i) => {
          const show = clamp(seg(t, 0.2 + i * 0.25, 0.2 + i * 0.25 + 0.2));
          return (
            <g key={label} opacity={show}>
              <rect x={60 + i * 160} y={140} width={140} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
              <T x={130 + i * 160} y={170} s={12} a="middle" f={C.caramel} w={700}>{label}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · Two roles, not one password, is the whole trick.
export function TwoRolesNotOnePassword({ t }: StepCtx) {
  const naiveBroken = t > 1;
  const dualFixed = t > 2.4;
  return (
    <Stack>
      <Svg label="A real local database rotation run twice: one role's password changed in place breaks the old connection instantly; a second role with the same access keeps both valid until a deliberate cutover" h={320}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same database, two rotation shapes</T>

        <T x={150} y={56} s={13} a="middle" f={C.latte} serif>one role, new password</T>
        <rect x={40} y={66} width={220} height={60} rx={8} fill="none" stroke={naiveBroken ? C.bad : C.mocha} strokeWidth={2} />
        <T x={150} y={100} s={12} a="middle" f={naiveBroken ? C.badText : C.taupe} w={700}>{naiveBroken ? 'old password rejected' : 'rotating...'}</T>

        <T x={450} y={56} s={13} a="middle" f={C.latte} serif>two roles, overlap</T>
        <rect x={340} y={66} width={220} height={60} rx={8} fill="none" stroke={dualFixed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={450} y={100} s={12} a="middle" f={dualFixed ? C.caramel : C.taupe} w={700}>{dualFixed ? 'both still valid' : 'rotating...'}</T>

        <T x={300} y={180} s={13} a="middle" f={C.taupe}>same database, only the rotation shape differs</T>
      </Svg>
    </Stack>
  );
}

// 5 · A credential that expires without anyone revoking it.
export function ExpiresWithoutRevoking({ t }: StepCtx) {
  const before = t < 1.2;
  const after = t > 1.2;
  return (
    <Stack>
      <Svg label="A dynamic database credential connects successfully before its expiry and fails the identical attempt after it, with no revoke command run in between" h={280}>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>No revoke command, ever run</T>
        <rect x={60} y={60} width={480} height={50} rx={8} fill="none" stroke={before ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={80} y={90} s={14} a="start" f={C.latte} serif>before expiry</T>
        <T x={520} y={90} s={12} a="end" f={before ? C.caramel : C.taupe} w={700}>connects</T>

        <rect x={60} y={130} width={480} height={50} rx={8} fill="none" stroke={after ? C.bad : C.mocha} strokeWidth={2} />
        <T x={80} y={160} s={14} a="start" f={C.latte} serif>after expiry</T>
        <T x={520} y={160} s={12} a="end" f={after ? C.badText : C.taupe} w={700}>{after ? 'fails, on its own' : ''}</T>
      </Svg>
    </Stack>
  );
}

// 6 · The orchestrator asks the real store, every time it runs.
export function AsksTheRealStore({ t }: StepCtx) {
  const steps = ['secrets backend', 'environment variables', 'metastore database'];
  return (
    <Stack>
      <Svg label="A task's lookup order drawn as three stacked boxes checked in a fixed sequence, with the secrets backend lit up as the one actually answering" h={300}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Checked in this exact order</T>
        {steps.map((label, i) => {
          const lit = clamp(seg(t, 0.2 + i * 0.3, 0.2 + i * 0.3 + 0.2));
          const isFirst = i === 0;
          return (
            <g key={label}>
              <rect x={60} y={56 + i * 66} width={480} height={48} rx={8} fill="none" stroke={isFirst && lit > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
              <T x={300} y={56 + i * 66 + 30} s={13} a="middle" f={isFirst && lit > 0.5 ? C.caramel : C.latte} w={700} opacity={0.4 + lit * 0.6}>{label}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 7 · Three surfaces, one mistake.
export function ThreeSurfacesOneMistake({ t }: StepCtx) {
  const surfaces = ['image layer', 'notebook output', 'DAG code'];
  return (
    <Stack>
      <Svg label="A scanner run over an image layer and a notebook's committed output, both lighting up as a caught credential, with DAG code named alongside them" h={300} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>One mistake, three places it hides</T>
        {surfaces.map((label, i) => {
          const lit = clamp(seg(t, 0.2 + i * 0.25, 0.2 + i * 0.25 + 0.2));
          return (
            <g key={label} opacity={0.5 + lit * 0.5}>
              <rect x={60 + i * 160} y={70} width={140} height={60} rx={8} fill="none" stroke={lit > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
              <T x={130 + i * 160} y={96} s={12} a="middle" f={lit > 0.5 ? C.badText : C.latte} serif>{label}</T>
              <T x={130 + i * 160} y={116} s={11} a="middle" f={lit > 0.5 ? C.badText : C.taupe} w={700}>{lit > 0.5 ? 'caught' : ''}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap(_: StepCtx) {
  const lines = [
    'A secret store buys access control, an audit log and versioning.',
    'Rotate by adding a second credential, never by overwriting the first.',
    "A dynamic credential's own expiry beats a human remembering to revoke it.",
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
      <Svg label="A rotation script creates a second role, waits a fixed delay, then revokes the first role's login, while one long-running batch job is still mid-run on the old role" h={300}>
        <T x={300} y={28} s={15} a="middle" f={C.taupe} serif>Did the mechanism fail, or the window?</T>
        <rect x={60} y={62} width={480} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={92} s={14} a="start" f={C.latte} serif>fixed delay, then revoke old role</T>

        <rect x={60} y={132} width={480} height={50} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={80} y={162} s={14} a="start" f={C.latte} serif>one long-running batch, still mid-run</T>

        <T x={300} y={226} s={13} a="middle" f={revealed ? C.badText : C.taupe} w={700}>
          {revealed ? 'window sized to a delay, not to the consumer' : 'did the approach itself fail?'}
        </T>
      </Svg>
    </Stack>
  );
}
