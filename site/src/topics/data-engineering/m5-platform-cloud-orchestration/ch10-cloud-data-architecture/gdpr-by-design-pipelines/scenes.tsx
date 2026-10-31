import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every legal claim here traces to GDPR's own Article text (5, 30, 33, 35) or OpenLineage's own
// object model (SOURCES.md). No real regulator, pipeline or OpenLineage system runs in this
// sandbox; examples.py reproduces each mechanism structurally. Time-cycled arrays use an explicit
// Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: the stale slide deck vs the record built fresh from lineage.
export function RegulatorHook({ t }: StepCtx) {
  const fresh = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A regulator's request, met with a stale slide deck, then a record built fresh" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Produce the record of processing, five days' notice</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>the only copy: an onboarding slide deck, years old</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={fresh > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={fresh > 0.5 ? C.second : C.latte} serif>{fresh > 0.5 ? 'built fresh now, from current lineage and tags' : 'alternative: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which principle governs reusing data for a new purpose.
export function PredictWhichPrinciple({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Reusing data for a new purpose — which principle actually governs it?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Collected for one reason, queried for another</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>how much was collected, how long it's kept</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>the reason it was collected in the first place</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'purpose limitation governs reuse, not minimisation or storage' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Purpose tag enforced at query time.
export function PurposeTagEnforced({ t }: StepCtx) {
  const blocked = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A purpose tag checked before a query runs, allowing a match and blocking a mismatch" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Tag written at ingestion: fraud_detection</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>same-purpose query: allowed</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={blocked > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={blocked > 0.5 ? C.caramel : C.latte} serif>{blocked > 0.5 ? 'different-purpose query: blocked' : 'different purpose: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Minimisation at ingestion.
export function MinimiseAtIngestion({ t }: StepCtx) {
  const dropped = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A field with no use for the stated purpose, dropped before it is ever stored" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Raw record arrives: email, phone, consent timestamp</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>marketing-consent purpose never needs the phone number</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={dropped > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={dropped > 0.5 ? C.second : C.latte} w={400}>{dropped > 0.5 ? 'stored: email and timestamp only, phone dropped' : 'storage: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Retention job actually deletes on schedule.
export function RetentionJobRuns({ t }: StepCtx) {
  const ran = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A scheduled job checking each record's age against its own tagged retention window" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Each tag carries its own retention window</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>aged-out record, within window: kept either way</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={ran > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={ran > 0.5 ? C.second : C.latte} serif>{ran > 0.5 ? 'past the window: the job actually deletes it' : 'job run: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · The Art. 30 record assembles itself from lineage.
export function RecordFromLineage({ t }: StepCtx) {
  const assembled = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A record of processing assembled automatically from the pipeline's own lineage and tags" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Lineage: which job touched which tagged data</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>not a document someone maintains by hand</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={assembled > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={assembled > 0.5 ? C.second : C.latte} w={400}>{assembled > 0.5 ? 'the record builds itself from current metadata' : 'assembly: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · DPIA triggers: three named categories.
export function DpiaTriggers({ t }: StepCtx) {
  const items = ['large-scale automated profiling with legal effect', 'large-scale special-category or criminal data', 'large-scale monitoring of a public area'];
  return (
    <Stack>
      <Svg label="The three specifically named categories that trigger a DPIA" h={280} fill>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>Three named triggers, not every project</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.3));
          return (
            <T key={label} x={300} y={86 + i * 44} s={13} a="middle" f={C.latte} o={show} w={420} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 8 · Breach clock starts at awareness, not the breach itself.
export function BreachClock({ t }: StepCtx) {
  const ready = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="The notification clock starting at awareness, and what has to already be ready" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Clock starts the moment the team becomes aware</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>not the moment the breach itself happened</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={ready > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={ready > 0.5 ? C.second : C.latte} w={400}>{ready > 0.5 ? 'access logs and the Art. 30 record: ready already' : 'readiness: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['a purpose tag turns reuse into a check', 'a retention job has to actually delete', 'the record assembles itself from lineage'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Law becomes pipeline design</T>
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
      <Svg label="Fraud-detection data reused for marketing, with no new tag — which principle breaks?" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Fraud-tagged data, reused for a marketing campaign</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>no new consent, no new tag — what breaks?</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'purpose limitation: the new use is incompatible' : 'which principle?'}</T>
      </Svg>
    </Stack>
  );
}
