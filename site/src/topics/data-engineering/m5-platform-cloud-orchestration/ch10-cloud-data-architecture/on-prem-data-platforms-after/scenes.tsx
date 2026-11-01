import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every claim traces to MinIO's and Trino's own documentation, CIO Dive's own reporting
// (citing Forrester) on the Broadcom/VMware licensing shift, and Dremio's own data-gravity
// explainer (SOURCES.md). The object-store-and-Iceberg demo is run for real in examples.py;
// Kubernetes and a JVM Spark/Trino process are named, not executed (disclosed there and in
// FACT-CHECK.md). Time-cycled arrays use clamp/seg two-state toggles, no multi-item cycling.

// 1 · Hook: moved to the cloud, bill went up.
export function MovedForSavingsHook({ t }: StepCtx) {
  const higher = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A steady workload moved to the cloud for savings, and the bill went up instead" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>A steady, around-the-clock workload, moved to the cloud</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>expected: the bill shrinks once the cloud pays for idle time</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={higher > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={higher > 0.5 ? C.caramel : C.latte} serif>{higher > 0.5 ? 'actual: higher every month — there was no idle time' : 'first bill: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what elasticity failed to deliver.
export function PredictWhyCostMore({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Elasticity's pitch is paying only for use — what happens with no idle time?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>No idle time, no discount to collect</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>elasticity's pitch: scale down, pay less, when idle</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={revealed ? C.caramel : C.latte} w={revealed ? 700 : 400}>{revealed ? 'never idle: never gets the discount at all' : 'what does that mean here?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Legacy HDFS/YARN vs the modern stack.
export function LegacyVsModernStack({ t }: StepCtx) {
  const modern = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A decade-old HDFS/YARN estate, replaced by object storage, Kubernetes, Trino, Iceberg" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>The old estate: HDFS storage, YARN scheduling</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>built for a cluster shape nobody architects fresh now</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={modern > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={modern > 0.5 ? C.second : C.latte} w={400}>{modern > 0.5 ? 'the current pattern: object store, Kubernetes, Trino, Iceberg' : 'current pattern: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Real object-store-and-Iceberg demo.
export function RealObjectStoreDemo({ t }: StepCtx) {
  const second = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A real local object store, a real Iceberg table, two appends, two real snapshots" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Not simulated: a local S3-compatible endpoint, real writes</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>first append: Parquet file, Avro manifest, snapshot one</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={second > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={second > 0.5 ? C.second : C.latte} w={400}>{second > 0.5 ? 'second append: a real second snapshot, queryable now' : 'second append: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Licensing shock.
export function LicensingShock({ t }: StepCtx) {
  const items = ['one acquisition closes', 'perpetual licenses end, subscriptions begin', 'a sprawling line is cut to two offerings', 'the anger: renting forever, not new technology'];
  return (
    <Stack>
      <Svg label="A licensing shift, in named stages, reaching most organisations at once" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>A licensing shift, in named stages</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.12 * i, 0.12 * i + 0.3));
          return (
            <T key={label} x={300} y={76 + i * 46} s={13} a="middle" f={i === 3 ? C.caramel : C.latte} o={show} w={440} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Four falsifiable reasons.
export function FourReasons({ t }: StepCtx) {
  const items = ['data gravity: moving data costs more than moving compute', "OT proximity: a control loop that can't tolerate a round trip", 'sovereignty: data that legally cannot leave a jurisdiction', 'steady utilisation: no idle window for elasticity to discount'];
  return (
    <Stack>
      <Svg label="Four reasons, each a specific test, not a feeling" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Four tests, each falsifiable on its own</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.3));
          return (
            <T key={label} x={300} y={70 + i * 46} s={12} a="middle" f={C.latte} o={show} w={460} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 7 · Operational bill.
export function OperationalBill({ t }: StepCtx) {
  const ownTeam = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Winning on the four reasons doesn't erase the bill the cloud was absorbing" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>On-prem wins the test, and still carries a bill</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>hardware refresh cycles, on your own schedule now</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={ownTeam > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={ownTeam > 0.5 ? C.caramel : C.latte} w={400}>{ownTeam > 0.5 ? 'your own team, no autoscaling safety net underneath' : 'operational cost: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['object store, Kubernetes, Trino, Iceberg replace HDFS/YARN', 'a licensing-model shift pushed the fresh look, not new tech', 'four specific tests, never a feeling, decide when on-prem wins', 'winning the test does not erase the bill the cloud absorbed'];
  return (
    <Stack>
      <Svg label="The four-part recap of this topic's point" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Four points, kept separate</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.25));
          return (
            <T key={label} x={300} y={70 + i * 46} s={12} a="middle" f={C.latte} o={show} w={460} serif>{label}</T>
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
      <Svg label="A fraud job runs minutes a night, idle the rest of the day — do any of the four reasons apply?" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Minutes of work a night, idle the rest of the day</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>proposal: move it on-prem "to save money"</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? "idle time is exactly what elasticity rewards" : 'do any of the four tests apply?'}</T>
      </Svg>
    </Stack>
  );
}
