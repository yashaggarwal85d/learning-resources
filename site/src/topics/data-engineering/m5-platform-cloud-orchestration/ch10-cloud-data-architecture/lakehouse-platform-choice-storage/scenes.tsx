import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every claim here traces to each vendor's own current documentation (SOURCES.md). No real
// Databricks/Snowflake/Fabric/BigQuery account runs in this sandbox; examples.py's dollar
// figures are disclosed-illustrative, matching each platform's own documented billing unit.
// Any array cycled by a time-derived index uses an explicit Number.isFinite guard (see project
// memory on this bug class).

// 1 · Hook: the exit-cost question nobody priced out.
export function OnboardingQuestion({ t }: StepCtx) {
  const later = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A platform picked for low operational burden, and the unpriced cost of leaving it" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Day one: picked for low operational burden</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>vendor storage, vendor's own format</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={later > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={later > 0.5 ? C.second : C.latte} serif>{later > 0.5 ? 'later: a bulk export job nobody budgeted' : 'later: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which ownership model is hardest to leave?
export function PredictHardestToLeave({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Four ownership models, one of them hardest to walk away from" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Whose bucket is this?</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>your bucket, open format</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>vendor storage, vendor format</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the vendor format is the trap' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Four platforms, four storage owners.
export function FourStorageOwners({ t }: StepCtx) {
  const owners = [
    { name: 'Databricks', trait: 'your own cloud bucket' },
    { name: 'Snowflake', trait: 'Snowflake-managed storage' },
    { name: 'Microsoft Fabric', trait: 'OneLake, vendor-unified' },
    { name: 'BigQuery', trait: 'your own Cloud Storage bucket' },
  ];
  const raw = Math.floor((t / 5.4) * owners.length);
  const active = Number.isFinite(raw) ? Math.min(owners.length - 1, Math.max(0, raw)) : 0;
  const owner = owners[active];
  return (
    <Stack>
      <Svg label="One platform's storage owner at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Whose bucket, this time?</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{owner.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{owner.trait}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Open format vs a vendor's compatibility layer.
export function OpenFormatPosture({ t }: StepCtx) {
  const compat = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A genuinely open default table format against a vendor's own compatibility layer" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>UniForm: one copy, two readers</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>Delta + Iceberg metadata, same Parquet files</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={compat > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={compat > 0.5 ? C.second : C.latte} w={400}>{compat > 0.5 ? "Snowflake native: proprietary by default" : 'Snowflake native: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Four zero-copy mechanisms.
export function FourZeroCopyModels({ t }: StepCtx) {
  const models = [
    { name: 'OneLake shortcut', trait: 'a pointer, not a copy' },
    { name: 'Fabric mirroring', trait: 'an actual continuous copy' },
    { name: 'Delta Sharing', trait: 'a bearer token, no duplication' },
    { name: 'Snowflake sharing', trait: 'read-only, zero consumer storage' },
  ];
  const raw = Math.floor((t / 5.0) * models.length);
  const active = Number.isFinite(raw) ? Math.min(models.length - 1, Math.max(0, raw)) : 0;
  const model = models[active];
  return (
    <Stack>
      <Svg label="One zero-copy mechanism at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Zero-copy means four different things</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{model.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{model.trait}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Four billing units, one worked comparison.
export function FourBillingUnits({ t }: StepCtx) {
  const units = [
    { name: 'Databricks DBUs', trait: 'per-DBU rate, compute-shape driven' },
    { name: 'Snowflake credits', trait: 'consumed credits times credit price' },
    { name: 'Fabric capacity-hours', trait: 'smoothed across a 24-hour window' },
    { name: 'BigQuery slots or bytes', trait: 'reserved compute or per-TiB scanned' },
  ];
  const raw = Math.floor((t / 5.4) * units.length);
  const active = Number.isFinite(raw) ? Math.min(units.length - 1, Math.max(0, raw)) : 0;
  const unit = units[active];
  return (
    <Stack>
      <Svg label="One platform's billing unit at a time, same workload each time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Same workload, different meter</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{unit.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{unit.trait}</T>
      </Svg>
    </Stack>
  );
}

// 7 · What leaving actually costs.
export function ExitCostWorked({ t }: StepCtx) {
  const proprietary = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="The same volume of data, open format against proprietary format, exit cost compared" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Same data, two formats</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>open format, your bucket: nothing extra to leave with</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={proprietary > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={proprietary > 0.5 ? C.caramel : C.latte} w={400}>{proprietary > 0.5 ? 'proprietary format: a real export job first' : 'proprietary format: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['four platforms, four storage owners', 'open format is the bytes, not the slogan', 'the billing unit decides which lever saves money'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>The comparison that actually matters</T>
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
      <Svg label="A team planning to leave within a short window, picking what actually matters for that goal" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Planning to leave within a short window</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>candidates: four platforms, one choice</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'storage ownership + open format: the deciding fact' : 'what matters most?'}</T>
      </Svg>
    </Stack>
  );
}
