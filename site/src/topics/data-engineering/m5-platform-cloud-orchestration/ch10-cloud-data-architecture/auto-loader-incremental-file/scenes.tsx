import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every behaviour here traces to Databricks' own current documentation (SOURCES.md) or to
// examples.py's local simulation of the checkpoint and schema-evolution mechanisms. No real
// Databricks workspace runs in this sandbox (disclosed in OUTLINE.md). Any array cycled by a
// time-derived index uses an explicit Number.isFinite guard (see project memory on this bug
// class).

// 1 · Hook: a new column shows up overnight, and nothing breaks.
export function NewColumnOvernight({ t }: StepCtx) {
  const evolved = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A naive ingestion job crashing on a new column versus a schema-evolving stream absorbing it" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>A partner's feed grows one column overnight</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>naive job: crashes, or silently drops it</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={evolved > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={evolved > 0.5 ? C.second : C.latte} serif>{evolved > 0.5 ? 'evolving stream: picks it up next batch' : 'evolving stream: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what does a restarted stream need to avoid re-ingesting a file?
export function PredictCheckpoint({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A stream restarting and seeing the same file listing, needing a durable memory of what it already ingested" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same file list, seen a second time</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>without memory: the file gets re-ingested</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>with a durable seen-file set: skipped</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'that memory is the checkpoint' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Two discovery modes.
export function TwoDiscoveryModes({ t }: StepCtx) {
  const notification = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Directory listing's own cost shape against file notification's event-driven discovery" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Two ways to notice a file landed</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>directory listing: cost scales with files, not folders</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={notification > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={notification > 0.5 ? C.second : C.latte} w={400}>{notification > 0.5 ? 'file notification: recommended default' : 'file notification: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · The worked payoff: the same file, listed twice, ingested once.
export function RestartReplaySafe({ t }: StepCtx) {
  const second = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A checkpoint accepting only the genuinely new file on a replayed batch" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Restart, then the same batch comes back</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>first run: 2 files ingested</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={second > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={second > 0.5 ? C.caramel : C.latte}>{second > 0.5 ? 'replay + 1 new: only 1 ingested' : 'second run: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Four schema-evolution modes, one card at a time.
export function FourSchemaModes({ t }: StepCtx) {
  const modes = [
    { name: 'addNewColumns', trait: 'fails once, then resumes with the wider schema' },
    { name: 'addNewColumnsWithTypeWidening', trait: 'same, plus widens supported types automatically' },
    { name: 'rescue', trait: 'never fails, never evolves — routes new fields to rescue' },
    { name: 'failOnNewColumns', trait: 'fails and stays failed until someone intervenes' },
  ];
  const raw = Math.floor((t / 5.0) * modes.length);
  const active = Number.isFinite(raw) ? Math.min(modes.length - 1, Math.max(0, raw)) : 0;
  const mode = modes[active];
  return (
    <Stack>
      <Svg label="One schema-evolution mode's own documented reaction to a new column at a time" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Same new column, four different reactions</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={14} a="middle" f={C.caramel} serif w={700}>{mode.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{mode.trait}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Nothing gets silently dropped — the rescued-data column.
export function RescuedColumnReal({ t }: StepCtx) {
  const rescued = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="An unexpected field landing in the rescued-data column instead of being dropped" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One record, one field nobody expected</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>order_id, customer_id, amount: accepted</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={rescued > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={rescued > 0.5 ? C.second : C.latte} w={400}>{rescued > 0.5 ? 'loyalty_tier: captured in _rescued_data' : 'loyalty_tier: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · A lighter answer: COPY INTO.
export function CopyIntoAlternative({ t }: StepCtx) {
  const skip = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="COPY INTO skipping an already-loaded file even though it was modified since" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>A lighter tool for a periodic batch load</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>COPY INTO: retryable, idempotent, file-level</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={skip > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={skip > 0.5 ? C.second : C.latte} w={400}>{skip > 0.5 ? 'already-loaded files: skipped, even if modified' : 'already-loaded files: checking'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['two discovery modes, two real cost shapes', 'a checkpoint makes a replayed file safe', 'four schema modes, one rescued-data column'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Discover it once, lose nothing unexpected</T>
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
      <Svg label="A once-a-day, stable-schema batch load choosing between Auto Loader and COPY INTO" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Once a day, stable schema, fixed location</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>Auto Loader: built for always-on discovery</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'COPY INTO: already covers this, more simply' : 'COPY INTO: pending'}</T>
      </Svg>
    </Stack>
  );
}
