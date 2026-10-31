import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// GDPR Articles 5, 30, 33 and 35 (their own text, gdpr-info.eu) and OpenLineage's own object
// model (SOURCES.md). No real regulator, production pipeline or OpenLineage-integrated system
// runs in this sandbox; examples.py reproduces each mechanism structurally against synthetic data.
const reel: Reel = {
  steps: [
    {
      title: 'A regulator asks for the record, five days to produce it',
      body: (
        <>
          A regulator asks for the record of processing for one specific data flow, with five
          business days' notice. The only copy anyone can find is a slide deck from an onboarding
          workshop, years out of date — replayed against a record built fresh, right now, from
          the pipeline's own current lineage and purpose tags.
        </>
      ),
      duration: 5.0,
      Visual: S.RegulatorHook,
    },
    {
      title: 'Before the mechanism: which principle actually governs reusing data for a new purpose?',
      body: (
        <>
          A pipeline collected this data for one stated reason. Someone now wants to query it for
          a completely different one. Before seeing the rule itself: which principle actually
          governs whether that's allowed?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Data minimisation — collect less of it next time' },
          { label: 'Purpose limitation — the reason it was collected constrains how it can be reused', correct: true },
          { label: 'Storage limitation — delete it before this becomes an issue' },
          { label: 'Accountability — just document the decision either way' },
        ],
        explain: (
          <>
            Purpose limitation. Minimisation is about how much you collect, storage limitation is
            about how long you keep it — only purpose limitation governs whether a different use
            of the same data is even allowed.
          </>
        ),
      },
      Visual: S.PredictWhichPrinciple,
    },
    {
      title: 'A tag stamped at ingestion, checked before every later query',
      body: (
        <>
          The purpose a record was collected for is written down as a tag, right at ingestion —
          not inferred later, not left to policy nobody checks. A later query tagged for a
          different purpose gets mechanically blocked, reproduced for real against the same tag.
        </>
      ),
      duration: 4.8,
      Visual: S.PurposeTagEnforced,
    },
    {
      title: 'Dropping the field before it is ever stored',
      body: (
        <>
          Minimisation isn't a cleanup pass applied after the fact. A field the stated purpose
          never needs — a phone number a marketing-consent record has no use for — is dropped at
          ingestion, before it is stored at all.
        </>
      ),
      duration: 4.4,
      Visual: S.MinimiseAtIngestion,
      takeaway: "A purpose tag at ingestion turns an incompatible reuse into a rule a machine enforces, not a remembered policy.",
    },
    {
      title: "A job that actually deletes, on the tag's own schedule",
      body: (
        <>
          Every purpose tag carries its own retention window. A scheduled job checks each
          record's age against that window and actually deletes what has aged out — reproduced
          for real against a small set of tagged records at different ages.
        </>
      ),
      duration: 4.8,
      Visual: S.RetentionJobRuns,
      takeaway: "Storage limitation means something once a job actually deletes on the tag's clock, not when a document merely states one.",
    },
    {
      title: 'The record assembles itself, instead of being written by hand',
      body: (
        <>
          Nobody writes the record of processing in a separate document that drifts out of date.
          It's assembled automatically from the pipeline's own lineage — which job touched which
          data, tagged with which purpose — the same mechanism the regulator's five-day deadline
          actually tests.
        </>
      ),
      duration: 5.0,
      Visual: S.RecordFromLineage,
    },
    {
      title: 'Three named triggers, not "do one for everything"',
      body: (
        <>
          A data protection impact assessment isn't required for every project. It's required for
          three specifically named categories — large-scale automated profiling with real legal
          effect, large-scale special-category data, large-scale public-area monitoring — checked
          precisely instead of guessed at.
        </>
      ),
      duration: 4.8,
      Visual: S.DpiaTriggers,
      takeaway: "A DPIA trigger is one of three specifically named categories, not a vague instinct about which projects feel sensitive.",
    },
    {
      title: 'The clock starts at awareness, not at the breach itself',
      body: (
        <>
          The notification clock doesn't start when the breach happened — it starts the moment
          the team becomes aware of it. What makes that window survivable isn't luck, it's
          already having the access logs and the record of processing ready before the clock
          ever starts.
        </>
      ),
      duration: 4.6,
      Visual: S.BreachClock,
    },
    {
      title: 'In one breath',
      body: (
        <>
          A purpose tag turns reuse into a check, not a policy. A retention job has to actually
          delete, on schedule. The record of processing assembles itself from lineage instead of
          drifting out of date in a slide deck. A DPIA trigger is one of three named categories.
          And the breach clock starts at awareness, which is why the logs have to exist already.
        </>
      ),
      duration: 4.8,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team wants to reuse data collected under a fraud-detection purpose tag for a new
          marketing campaign, with no new consent and no new tag. Which principle does this
          actually violate?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Storage limitation, because the data has been kept too long' },
          { label: 'Purpose limitation, because the new use is incompatible with the original one', correct: true },
          { label: 'Accountability, because nobody documented the decision' },
          { label: 'Data minimisation, because too many fields were collected' },
        ],
        explain: (
          <>
            Purpose limitation. The data's age and the fields collected are both beside the point
            here — the violation is using fraud-detection data for a purpose it was never tagged
            for, which is exactly what a purpose-tag check at query time would block.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
