import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every rate and ratio here comes from examples.py: real public per-unit rates (Glue's
// $0.44/DPU-hour, Dataproc's $0.06/DCU-hour) and a break-even formula solved numerically,
// never asserted. Any array cycled by a time-derived index below uses an explicit
// Number.isFinite guard, since a bare Math.min(len-1, Math.floor(...)) can return NaN on an
// early render and crash the step (see project memory on this exact bug class).

// 1 · Hook: the move that was supposed to save money nearly doubled the bill.
export function NearlyDoubled({ t }: StepCtx) {
  const moved = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A job's daily cost on a provisioned cluster, then on serverless after the move" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Same job, six hours a day, every day</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>provisioned, flat rate: $2.88 a day</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={moved > 0.5 ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={moved > 0.5 ? C.badText : C.latte} serif>{moved > 0.5 ? 'serverless, "to save money": $5.28 a day' : 'serverless: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which job is more likely to get cheaper on serverless?
export function PredictWhichJob({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Job A running six hours a day against Job B running six minutes a day" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Two jobs, two very different footprints</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>job A: six hours a day</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>job B: six minutes a day</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the short one wins on serverless' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Five vendors, five different billing units, one card at a time.
export function FiveBillingUnits({ t }: StepCtx) {
  const units = [
    { name: 'AWS Glue', unit: 'DPU-hour · 4 vCPU + 16 GB · $0.44/hr' },
    { name: 'AWS EMR Serverless', unit: 'vCPU-second + GB-second, actually consumed' },
    { name: 'Google Dataproc Serverless', unit: 'DCU · 12-DCU session floor · $0.06/hr' },
    { name: 'Databricks serverless', unit: 'DBU · a normalized unit, not fixed hardware' },
    { name: 'Google BigQuery', unit: 'bytes scanned on-demand, or bought slot capacity' },
  ];
  const raw = Math.floor((t / 5.4) * units.length);
  const active = Number.isFinite(raw) ? Math.min(units.length - 1, Math.max(0, raw)) : 0;
  const unit = units[active];
  return (
    <Stack>
      <Svg label="One vendor's own billing unit at a time, named and sourced" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Each vendor's own billing unit</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{unit.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{unit.unit}</T>
      </Svg>
    </Stack>
  );
}

// 4 · BigQuery's unit isn't a billing unit at all.
export function SlotMsGap({ t }: StepCtx) {
  const resolved = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Slot-ms as it looks at first versus what BigQuery's own docs actually say" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>"Slot-ms" — a fifth unit to match the other four?</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>what it looks like: a billing unit</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={resolved > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={resolved > 0.5 ? C.caramel : C.latte} w={resolved > 0.5 ? 700 : 400}>{resolved > 0.5 ? 'what it is: a usage metric, reported after the fact' : 'checking BigQuery\'s own docs'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · The same job, converted into two real units.
export function SameJobConverted({ t }: StepCtx) {
  const dataproc = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="One job's resource shape converted into Glue DPU-hours and Dataproc DCU-hours" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>8 vCPU, 32 GB, ten minutes a run</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>AWS Glue: 2 DPUs, $0.1467 the run</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={dataproc > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={dataproc > 0.5 ? C.caramel : C.latte}>{dataproc > 0.5 ? 'Dataproc Serverless: 12 DCUs, $0.12 the run' : 'Dataproc Serverless: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Four costs serverless hides, one line at a time.
export function FourHiddenCosts({ t }: StepCtx) {
  const items = ['cold start: a fresh process spinning up', 'autoscaling lag: capacity arriving after demand', 'noisy neighbours: hardware you don\'t own alone', 'version lag: the platform upgrades on its own clock'];
  return (
    <Stack>
      <Svg label="The four costs serverless trades for per-second billing, revealed one at a time" h={260} fill>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>What per-second billing doesn't show you</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.12 * i, 0.12 * i + 0.22));
          return (
            <T key={label} x={300} y={76 + i * 34} s={12} a="middle" f={C.latte} o={show}>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 7 · Every one of these has a documented escape hatch, one card at a time.
export function EscapeHatches({ t }: StepCtx) {
  const hatches = [
    { name: 'AWS Glue', hatch: 'pin a fixed worker type and count' },
    { name: 'AWS EMR Serverless', hatch: 'configure pre-initialized capacity' },
    { name: 'Google Dataproc Serverless', hatch: 'the 12-DCU session floor itself' },
    { name: 'Google BigQuery', hatch: 'buy baseline slot capacity' },
  ];
  const raw = Math.floor((t / 4.6) * hatches.length);
  const active = Number.isFinite(raw) ? Math.min(hatches.length - 1, Math.max(0, raw)) : 0;
  const hatch = hatches[active];
  return (
    <Stack>
      <Svg label="One vendor's own documented override of its serverless default at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>A documented way to override the default</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{hatch.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={400}>{hatch.hatch}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Where the two lines cross: break-even utilisation.
export function BreakEvenChart({ t }: StepCtx) {
  const crossed = clamp(seg(t, 0.4, 0.85));
  const x = 100 + crossed * 300;
  return (
    <Stack>
      <Svg label="Provisioned's flat line and serverless's rising line crossing at the break-even point" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Flat cost against rising cost, one crossing point</T>
        <line x1={80} y1={220} x2={520} y2={220} stroke={C.mocha} strokeWidth={1} />
        <line x1={80} y1={220} x2={80} y2={60} stroke={C.mocha} strokeWidth={1} />
        <line x1={80} y1={150} x2={520} y2={150} stroke={C.second} strokeWidth={2} />
        <T x={420} y={140} s={11} a="middle" f={C.second}>provisioned: flat</T>
        <line x1={80} y1={220} x2={520} y2={70} stroke={C.caramel} strokeWidth={2} />
        <T x={430} y={85} s={11} a="middle" f={C.caramel}>serverless: rising</T>
        <circle cx={x} cy={220 - crossed * 70} r={5} fill={crossed > 0.6 ? C.bad : C.taupe} />
        <T x={300} y={270} s={12} a="middle" f={crossed > 0.6 ? C.badText : C.taupe}>{crossed > 0.6 ? 'break-even: 3.27 hours a day, this job\'s shape' : 'tracing the crossing point'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · Two honest answers to the same re-run problem.
export function BookmarksVsIncremental({ t }: StepCtx) {
  const portable = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Glue's own job bookmarks against a table format's portable incremental-read API" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Don't reprocess what a run already handled</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>Glue job bookmarks: only Glue reads its own bookmark</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={portable > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={portable > 0.5 ? C.second : C.latte} w={400}>{portable > 0.5 ? 'table format incremental reads: any engine, portable' : 'table format incremental reads: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['five units, one of them not a billing unit', 'four hidden costs, four documented escape hatches', 'break-even utilisation decides, not a guess'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Serverless and provisioned, priced honestly</T>
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

// 11 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A job running four hours a day against this topic's own break-even line of just over three hours" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Four hours a day — which side of the line?</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>break-even for this shape: 3.27 hours a day</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.badText : C.latte} w={revealed ? 700 : 400}>{revealed ? 'four hours: already past it' : 'this job: four hours a day'}</T>
        <T x={300} y={200} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'provisioned wins from here' : '?'}</T>
      </Svg>
    </Stack>
  );
}
