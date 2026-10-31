import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every result shown here is measured by examples.py against a real local PostgreSQL instance.

// 1 · Hook: an engine bypassing the mask.
export function QuietlySkipsMask({ t }: StepCtx) {
  const bypass = clamp(seg(t, 0.3, 0.7));
  return (
    <Stack>
      <Svg label="Two arrows from an engine to the bucket: one through the catalog (masked), one straight past it (unmasked)" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>One engine, two paths to the same files</T>
        <rect x={110} y={56} width={380} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>through the catalog: masked</T>
        <rect x={110} y={126} width={380} height={44} rx={8} fill="none" stroke={bypass > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={bypass > 0.5 ? C.badText : C.latte} serif>{bypass > 0.5 ? 'straight to the bucket: unmasked' : 'a "quick fix" role'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what makes the mask apply to every other engine but not this one?
export function WhatMakesTheMaskApply({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A catalog-vended credential and a bulk credential, with the bulk one lit once revealed" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same files, two credentials</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>catalog-vended, scoped</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.badText : C.latte}>bulk, never asked for by the catalog</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the policy lives in the catalog, not the files' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · One diagram, five vendor names.
export function OneDiagramFiveNames({ t }: StepCtx) {
  const names = ['Lake Formation', 'Unity Catalog', 'BigLake', 'OneLake', 'Polaris'];
  const active = Math.min(names.length - 1, Math.floor((t / 5.2) * names.length));
  return (
    <Stack>
      <Svg label="The catalog-and-vending diagram, relabelled under five vendor names in turn" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>catalog → check policy → vend scoped credential</T>
        <rect x={100} y={56} width={400} height={64} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={16} a="middle" f={C.caramel} serif w={700}>{names[active]}</T>
        <T x={300} y={160} s={12} a="middle" f={C.taupe}>same diagram, a different name underneath each one</T>
      </Svg>
    </Stack>
  );
}

// 4 · Row filter and column mask, both real.
export function RowFilterColumnMask({ t }: StepCtx) {
  const maskOn = clamp(seg(t, 0.3, 0.6));
  return (
    <Stack>
      <Svg label="A row of data filtered by region, then a column masked for salary, both against a real local table" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Row filter + column mask, real</T>
        <rect x={60} y={56} width={480} height={40} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} />
        <T x={300} y={81} s={12} a="middle" f={C.second}>east analyst sees only east rows</T>
        <rect x={60} y={108} width={480} height={40} rx={6} fill="none" stroke={maskOn ? C.caramel : C.mocha} strokeWidth={1.5} />
        <T x={300} y={133} s={12} a="middle" f={maskOn ? C.caramel : C.latte}>{maskOn ? 'salary column: masked to null' : 'salary column: raw value'}</T>
        <T x={300} y={180} s={11} a="middle" f={C.taupe}>same table, enforced at query time</T>
      </Svg>
    </Stack>
  );
}

// 5 · The open-protocol version.
export function OpenProtocolVersion({ t }: StepCtx) {
  const checked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A LoadTableResult response with a storage-credentials field, checked before any other config" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>LoadTableResult, Iceberg REST</T>
        <rect x={90} y={56} width={420} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={86} s={12} a="middle" f={C.latte}>metadata + config</T>
        <rect x={90} y={120} width={420} height={50} rx={8} fill="none" stroke={checked ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={150} s={12} a="middle" f={checked ? C.caramel : C.latte} w={checked ? 700 : 400}>storage-credentials: vended, scoped</T>
        <T x={300} y={200} s={11} a="middle" f={checked ? C.caramel : C.taupe}>{checked ? 'checked first, before any other config' : ''}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Tag-based grant.
export function TagBasedGrant({ t }: StepCtx) {
  const newTable = clamp(seg(t, 0.5, 0.9));
  return (
    <Stack>
      <Svg label="A tag-based grant automatically covering a new table created after the rule was written" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One tag, every tagged table</T>
        <rect x={100} y={56} width={180} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={190} y={83} s={12} a="middle" f={C.second}>table A: pii</T>
        <rect x={320} y={56} width={180} height={44} rx={8} fill="none" stroke={newTable ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={410} y={83} s={12} a="middle" f={newTable ? C.caramel : C.taupe} w={newTable ? 700 : 400}>{newTable ? 'table B (new): pii' : 'table B: not created yet'}</T>
        <T x={300} y={150} s={12} a="middle" f={newTable ? C.caramel : C.taupe}>{newTable ? 'the same grant already applies' : 'the grant targets the tag, not either table'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · The bypass, reproduced for real.
export function BypassReproduced({ t }: StepCtx) {
  const bypassShown = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A scoped read and a bypass read of the identical table, side by side" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Same table, two real reads</T>
        <rect x={60} y={56} width={480} height={48} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.second}>scoped credential: one region, masked</T>
        <rect x={60} y={116} width={480} height={48} rx={8} fill="none" stroke={bypassShown ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={144} s={12} a="middle" f={bypassShown ? C.badText : C.latte} w={bypassShown ? 700 : 400}>{bypassShown ? 'bulk credential: every region, unmasked' : 'bulk credential: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['catalog holds policy', 'engine enforces row/column rules', 'credential: scoped, short-lived'];
  return (
    <Stack>
      <Svg label="The three-part recap of the catalog-and-vending mechanism" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>One mechanism, five names</T>
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

// 9 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Deleting one account versus closing the bypass path itself" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Delete the account, or close the path?</T>
        <rect x={80} y={60} width={200} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={180} y={90} s={12} a="middle" f={C.latte}>one account, gone</T>
        <rect x={320} y={60} width={200} height={50} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={420} y={90} s={12} a="middle" f={revealed ? C.caramel : C.latte} w={revealed ? 700 : 400}>bypass path itself</T>
        <T x={300} y={150} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the next bulk role reopens the same gap' : '?'}</T>
      </Svg>
    </Stack>
  );
}
