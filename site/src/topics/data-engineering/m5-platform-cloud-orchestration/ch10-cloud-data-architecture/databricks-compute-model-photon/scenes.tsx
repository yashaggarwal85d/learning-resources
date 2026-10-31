import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every figure here traces to Databricks' own current documentation (SOURCES.md) or to
// examples.py's lifecycle-billing simulation. No real Databricks workspace runs in this
// sandbox (disclosed in OUTLINE.md). Any array cycled by a time-derived index uses an explicit
// Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: same query, same cluster size, one runs noticeably faster.
export function SameQueryFasterRun({ t }: StepCtx) {
  const checked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Two equally-sized clusters running the same query, one finishing noticeably faster" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Same query, same cluster size</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>cluster A: finished</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={checked > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={checked > 0.5 ? C.badText : C.latte} serif>{checked > 0.5 ? 'cluster B: still running' : 'cluster B: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what's actually different about the faster run?
export function WhatsDifferent({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Row-at-a-time execution against vectorized batch execution" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same rows, two ways of executing them</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>cluster B: one row at a time</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>cluster A: vectorized batches</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'batches win on modern hardware' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Four compute types, one card at a time.
export function FourComputeTypes({ t }: StepCtx) {
  const types = [
    { name: 'All-purpose', trait: 'autostarts after terminating — built to sit idle' },
    { name: 'Job compute', trait: 'terminates at job end, cannot be restarted' },
    { name: 'Serverless', trait: "runs in Databricks' own managed plane" },
    { name: 'SQL warehouse', trait: 'its own compute type, built for querying' },
  ];
  const raw = Math.floor((t / 5.4) * types.length);
  const active = Number.isFinite(raw) ? Math.min(types.length - 1, Math.max(0, raw)) : 0;
  const type = types[active];
  return (
    <Stack>
      <Svg label="One compute type's own start-and-billing shape at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Four shapes, not one menu item repeated</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{type.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{type.trait}</T>
      </Svg>
    </Stack>
  );
}

// 4 · The worked payoff: idle minutes an all-purpose cluster quietly bills for.
export function IdleMinutesBilled({ t }: StepCtx) {
  const allPurpose = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Four ten-minute jobs: job compute's exact billed minutes against all-purpose's idle-inclusive total" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Four ten-minute jobs, short gaps between them</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>job compute: 40 minutes billed</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={allPurpose > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={allPurpose > 0.5 ? C.badText : C.latte}>{allPurpose > 0.5 ? 'all-purpose: 85 minutes billed' : 'all-purpose: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Photon's own documented benchmark.
export function PhotonBenchmark({ t }: StepCtx) {
  const observed = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Photon's documented TPC-DS benchmark speedup against customer-observed speedups" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Databricks' own published numbers</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>TPC-DS 1TB benchmark: 2x faster</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={observed > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={observed > 0.5 ? C.caramel : C.latte}>{observed > 0.5 ? 'customer workloads: 3x to 8x' : 'customer workloads: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · A pool holds idle instances so the next cluster starts faster.
export function PoolIdleInstances({ t }: StepCtx) {
  const noCharge = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A pool's idle instances speeding up cluster start without being DBU-billed" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Idle instances, ready to go</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte}>pool: idle instances cut start time</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={noCharge > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={noCharge > 0.5 ? C.second : C.latte}>{noCharge > 0.5 ? 'no DBU charge while idle in the pool' : 'DBU charge: checking'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · One knob an admin sets, every user inherits.
export function PolicyAndSpot({ t }: StepCtx) {
  const driverPinned = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A compute policy's limits, and the driver node staying on-demand even on a spot cluster" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>An admin's limit, a cost-saving instance type</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>policy: caps cluster type, count, cost</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={driverPinned > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={driverPinned > 0.5 ? C.caramel : C.latte}>{driverPinned > 0.5 ? 'spot: driver always on-demand' : 'spot: checking the driver node'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · The DBU isn't one number — it's a price list by SKU.
export function DbuBySku({ t }: StepCtx) {
  const skus = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A single DBU definition against a published price list that varies by SKU and cloud" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>One unit, priced differently per product</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>DBU: a normalized unit, not fixed hardware</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={skus > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={skus > 0.5 ? C.caramel : C.latte} w={400}>{skus > 0.5 ? 'price list: varies by SKU and cloud' : 'price list: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['four compute types, four billing shapes', 'Photon: vectorization, written in C++', 'the DBU is a price list, not one number'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>What actually runs the code, and what it costs</T>
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
      <Svg label="A ten-minute weekly job at an unpredictable time, choosing among three compute types" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Ten minutes, once a week, no fixed time</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>all-purpose: bills every idle day between runs</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'job compute: bills only the ten minutes' : 'job compute: pending'}</T>
      </Svg>
    </Stack>
  );
}
