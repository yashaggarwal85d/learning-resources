import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every claim traces to Matillion's and Theobald Software's own tech notes, the DEV Community
// CDS article, SAP's own knowledge base articles, and the Databricks press release
// (SOURCES.md). No real SAP tenant runs in this sandbox; examples.py reproduces the mechanism
// comparison, the licensing check, and the effective-dated query logic (disclosed there and in
// FACT-CHECK.md). Time-cycled arrays use clamp/seg two-state toggles, no multi-item cycling.

// 1 · Hook: an undocumented endpoint, fine for years, flagged on audit.
export function UndocumentedEndpoint({ t }: StepCtx) {
  const flagged = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A pipeline against an undocumented SAP endpoint, fine for years, flagged on audit" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>An extraction pipeline, running cheaply for years</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>correct output, every run, the whole time</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={flagged > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={flagged > 0.5 ? C.caramel : C.latte} serif>{flagged > 0.5 ? "an auditor reads SAP's own note: never licensed" : 'audit: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which mechanism is implicated.
export function PredictWhichMechanism({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Nothing about the pipeline's behavior changed — so what did?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same behavior, same throughput — then a note</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>a non-SAP tool, pulling data out over ODP-RFC</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={revealed ? C.caramel : C.latte} w={revealed ? 700 : 400}>{revealed ? 'exactly the restricted combination' : 'which mechanism?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Raw tables, and CDS views over them.
export function ModuleTablesAndCds({ t }: StepCtx) {
  const cds = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Raw, densely coded module tables, with CDS views adding names and relationships" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Finance, materials, production, quality: raw tables</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>coded field names, built for the application</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={cds > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={cds > 0.5 ? C.second : C.latte} w={400}>{cds > 0.5 ? 'CDS view: names, annotations, relationships added' : 'semantic layer: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Four mechanisms, four different capabilities.
export function FourMechanisms({ t }: StepCtx) {
  const items = [
    { label: 'ODP delta queue: inserts, updates, deletes', good: true },
    { label: 'SLT trigger replication: inserts, updates, deletes', good: true },
    { label: "OData: inserts, updates — deletes often missed", good: false },
    { label: 'database-level CDC: every row-level state, including deletes', good: true },
  ];
  return (
    <Stack>
      <Svg label="Four extraction mechanisms, compared by what each can actually see" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>What each mechanism can actually see</T>
        {items.map((item, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.3));
          return (
            <T key={item.label} x={300} y={70 + i * 46} s={13} a="middle" f={item.good ? C.latte : C.caramel} o={show} w={440} serif>{item.label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 5 · The note's own version history, in named stages.
export function NoteHistory({ t }: StepCtx) {
  const items = ['first published: third-party ODP use, unsupported', 'a later version: ODP over RFC, now prohibited', 'a still later update: use SAP Datasphere instead'];
  return (
    <Stack>
      <Svg label="SAP's own support note, moving through three named stages" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>A note that tightened in named, dated stages</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.14 * i, 0.14 * i + 0.3));
          return (
            <T key={label} x={300} y={76 + i * 56} s={13} a="middle" f={i === 1 ? C.caramel : C.latte} o={show} w={440} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Datasphere, Business Data Cloud, and SAP Databricks.
export function DatasphereAndDatabricks({ t }: StepCtx) {
  const partner = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="SAP's vendor-preferred path, and a named outside partner inside the same platform" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Datasphere and SAP Business Data Cloud: the steer</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>SAP's own preferred replication destination</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={partner > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={partner > 0.5 ? C.second : C.latte} w={400}>{partner > 0.5 ? 'SAP Databricks: bi-directional sharing, sold by SAP' : 'partner product: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · Effective-dated records: a different cursor problem.
export function EffectiveDatedCursor({ t }: StepCtx) {
  const filtered = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="An as-of date outside a record's effective window returns nothing, not a stale row" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>SuccessFactors: as-of date, not updated-at</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>as-of date inside the window: record returned</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={filtered > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={filtered > 0.5 ? C.caramel : C.latte} w={400}>{filtered > 0.5 ? 'outside the window: filtered out, not stale' : 'window check: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['CDS views give raw SAP tables meaning', 'mechanisms differ in what they can see, not just speed', "SAP's own note tightened in named, dated stages", 'an effective-dated record is a cursor problem of its own'];
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
      <Svg label="A fixed as-of date, run nightly, missing a position promoted since that date" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Nightly extract, fixed as-of date, one gap</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>a new position, promoted after that fixed date</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'outside the effective window: filtered out, silently' : 'which failure mode?'}</T>
      </Svg>
    </Stack>
  );
}
