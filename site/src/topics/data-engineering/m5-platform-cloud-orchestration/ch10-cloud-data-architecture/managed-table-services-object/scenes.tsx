import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every number shown here is measured by examples.py: real local metadata files and AWS's own
// disclosed public per-request rates.

// 1 · Hook: a managed service that was supposed to make this mistake impossible.
export function MistakeImpossible({ t }: StepCtx) {
  const broken = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A managed Iceberg table, read fine by most engines, with one reader now crossed out" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>One table, after the managed service's own upgrade</T>
        <rect x={120} y={56} width={360} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>compaction and snapshot expiry: automatic</T>
        <rect x={120} y={126} width={360} height={44} rx={8} fill="none" stroke={broken > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={broken > 0.5 ? C.badText : C.latte} serif>{broken > 0.5 ? 'one read-only engine: can no longer open it' : 'a read-only engine, three weeks later'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what's actually different about the one engine that broke?
export function WhatBroke({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="The same table's spec version, old and new, with the broken engine pinned to the old one" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same table, same files, same rows</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>table's spec version: moved forward</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.badText : C.latte}>one engine's own support: stayed where it was</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the gap is the engine, never the files' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Four vendor cards, one row at a time, what each actually automates.
export function FourVendorCards({ t }: StepCtx) {
  const cards = [
    { name: 'S3 Tables', jobs: 'compaction · snapshot mgmt · unreferenced-file removal' },
    { name: 'BigLake Iceberg tables', jobs: 'compaction · clustering · time-travel GC' },
    { name: 'Unity Catalog managed Iceberg', jobs: 'all read/write/storage/optimization' },
    { name: 'Snowflake-managed Iceberg', jobs: 'managed per table, on by default' },
  ];
  const raw = Math.floor((t / 5.2) * cards.length);
  const active = Number.isFinite(raw) ? Math.min(cards.length - 1, Math.max(0, raw)) : 0;
  const card = cards[active];
  return (
    <Stack>
      <Svg label="One vendor card at a time, naming exactly what that service automates" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>What each one actually automates</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{card.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={400}>{card.jobs}</T>
      </Svg>
    </Stack>
  );
}

// 4 · The bill for not doing it yourself.
export function PremiumBilled({ t }: StepCtx) {
  const compute = clamp(seg(t, 0.3, 0.8));
  const monitoring = Math.round(25 * compute);
  const compaction = Math.round(52 * compute);
  return (
    <Stack>
      <Svg label="A monitoring fee and a compaction fee adding up on top of storage, on a one-million-object table" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One million objects, ten thousand gigabytes compacted</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>monitoring fee: {monitoring} dollars</T>
        <rect x={100} y={116} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={142} s={13} a="middle" f={C.latte}>compaction fee: {compaction} dollars</T>
        <T x={300} y={190} s={12} a="middle" f={C.taupe}>both billed separately from ordinary storage</T>
      </Svg>
    </Stack>
  );
}

// 5 · Someone still owns the job, just a different someone.
export function SomeoneOwnsTheJob({ t }: StepCtx) {
  const handedOff = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Your own job, controlled and timed by you, versus a managed job whose timing and price you don't control" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Who decides when it runs, and what it costs</T>
        <rect x={60} y={60} width={480} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={86} s={12} a="middle" f={C.second}>your own job: you pick the timing and the price</T>
        <rect x={60} y={116} width={480} height={44} rx={8} fill="none" stroke={handedOff > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={142} s={12} a="middle" f={handedOff > 0.5 ? C.caramel : C.latte}>{handedOff > 0.5 ? 'managed job: the vendor picks both' : 'managed job: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · AWS's own engine can't read its own newer format.
export function AthenaCantRead({ t }: StepCtx) {
  const checked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="AWS's own compatibility table, with its own Athena row marked as unable to read the newer format" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One vendor's own compatibility table</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>EMR Spark, S3 Tables' own endpoint: supported</T>
        <rect x={100} y={116} width={400} height={44} rx={8} fill="none" stroke={checked ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={142} s={13} a="middle" f={checked ? C.badText : C.latte} w={checked ? 700 : 400}>{checked ? 'Amazon Athena: not supported' : 'Amazon Athena: checking'}</T>
        <T x={300} y={190} s={11} a="middle" f={checked ? C.caramel : C.taupe}>{checked ? "AWS's own documentation, not a third party" : ''}</T>
      </Svg>
    </Stack>
  );
}

// 7 · The worked payoff: the same table, upgraded once, reproduced for real.
export function SkewReproduced({ t }: StepCtx) {
  const after = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Three named engines reading the same real local table, before and after its one upgrade" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Three engines, one table, one upgrade</T>
        <rect x={60} y={56} width={480} height={40} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} />
        <T x={300} y={81} s={12} a="middle" f={C.second}>before: all three engines read it fine</T>
        <rect x={60} y={108} width={480} height={40} rx={6} fill="none" stroke={after > 0.5 ? C.bad : C.mocha} strokeWidth={1.5} />
        <T x={300} y={133} s={12} a="middle" f={after > 0.5 ? C.badText : C.latte} w={after > 0.5 ? 700 : 400}>{after > 0.5 ? 'after: one of three fails, nothing else changed' : 'after: pending'}</T>
        <T x={300} y={180} s={11} a="middle" f={C.taupe}>measured against real local metadata files</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['four services, four different jobs', 'upkeep billed as its own line item', 'a newer spec version can break an old reader'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Maintenance as a service, with a catch</T>
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
      <Svg label="Pinning every engine to the old spec version forever, versus the risk actually recurring" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Pin to the old version forever?</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>today's break: avoided</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.caramel : C.latte} w={revealed ? 700 : 400}>the next version: still coming</T>
        <T x={300} y={200} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'delayed, not removed' : '?'}</T>
      </Svg>
    </Stack>
  );
}
