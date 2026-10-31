import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A mechanism-level comparison of Databricks, Snowflake, Microsoft Fabric and BigQuery across
// storage ownership, open-format posture, zero-copy access, pricing model and exit cost —
// sourced from each vendor's own current documentation (SOURCES.md). No real account in any of
// the four platforms runs in this sandbox; the worked cost comparison (examples.py) uses
// disclosed-illustrative rates applied to each platform's own documented billing unit.
const reel: Reel = {
  steps: [
    {
      title: "The onboarding question nobody priced out",
      body: (
        <>
          A team picks a vendor-managed warehouse for its low operational burden. Eighteen months
          later, their data sits in that vendor's own internally-optimized storage format, and
          getting it back out into something else means a bulk export job nobody budgeted for.
        </>
      ),
      duration: 4.8,
      Visual: S.OnboardingQuestion,
    },
    {
      title: 'Before the comparison: which ownership model is hardest to leave?',
      body: (
        <>
          Four platforms, four different answers to "whose bucket is this." Before seeing them
          side by side: which ownership model should you expect to be the most expensive to walk
          away from?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "Your own cloud bucket, holding an open file format" },
          { label: "The vendor's own storage, holding the vendor's own internal format", correct: true },
          { label: "A unified vendor lake that stores everything as open Delta files" },
          { label: "They're all roughly the same to leave" },
        ],
        explain: (
          <>
            The vendor's own storage, in the vendor's own format. If the bucket was never yours
            and the bytes in it were never a format anything else reads, leaving means a bulk
            export job before you can use the data anywhere else — the exact shape of the hook.
          </>
        ),
      },
      Visual: S.PredictHardestToLeave,
    },
    {
      title: 'Who actually owns the storage',
      body: (
        <>
          Databricks: a bucket you create in your own cloud account. Snowflake: storage Snowflake
          itself manages end to end. Microsoft Fabric: OneLake, a vendor-unified lake. BigQuery:
          your own Cloud Storage bucket, configured before the table exists. Four different
          answers to the same question.
        </>
      ),
      duration: 5.4,
      Visual: S.FourStorageOwners,
    },
    {
      title: "Open format, or a vendor's compatibility layer?",
      body: (
        <>
          UniForm generates real Iceberg metadata from the same Parquet files Delta already
          wrote — one copy, two readers. BigQuery's managed Iceberg tables work the same way.
          Snowflake's Iceberg option is genuinely open, but its default native table is not.
          Fabric stores natively in Delta, already open.
        </>
      ),
      duration: 5.2,
      Visual: S.OpenFormatPosture,
      takeaway: "Open format is a property of the bytes a table writes by default, not what the platform merely reads.",
    },
    {
      title: 'Zero-copy, four different ways',
      body: (
        <>
          A OneLake shortcut is a pointer, not a copy — delete it and the target is untouched.
          Fabric's own database mirroring is the opposite: an actual continuous copy. Delta
          Sharing and Snowflake's Secure Data Sharing both hand a recipient read access without
          ever duplicating the underlying bytes.
        </>
      ),
      duration: 5.0,
      Visual: S.FourZeroCopyModels,
    },
    {
      title: 'Four billing units, one worked comparison',
      body: (
        <>
          The same nightly workload, priced through each platform's own unit: Databricks' DBUs,
          Snowflake's credits, Fabric's smoothed capacity-hours, BigQuery's slots or its
          per-byte on-demand model. Reproduced for real against each platform's own documented
          formula, not a guess.
        </>
      ),
      duration: 5.4,
      Visual: S.FourBillingUnits,
      takeaway: "Smoothing, credits, DBUs and slots are four different billing mechanics — the unit you are billed in decides the lever.",
    },
    {
      title: 'What leaving actually costs',
      body: (
        <>
          Five hundred gigabytes already sitting in an open format, in a bucket you own, costs
          nothing extra to leave with — you just stop paying. The same data locked in a vendor's
          proprietary columnar format needs a real export job first, and that job's cost scales
          with how much data there is.
        </>
      ),
      duration: 4.8,
      Visual: S.ExitCostWorked,
      takeaway: "Exit cost is not negotiated later — it follows from the storage and format choice already made on day one.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          Four platforms, four different owners of the storage. Open format is a property of the
          bytes, not a slogan. Zero-copy means four different mechanisms, not one. And the
          pricing model you're billed under decides which lever actually saves you money.
        </>
      ),
      duration: 4.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team expects to leave this platform within two years and wants that exit to be cheap
          no matter which vendor they pick. Which single fact about a candidate platform matters
          most for that goal?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "Which pricing model it bills under" },
          { label: "Whether its default table format is genuinely open and the storage is in a bucket they own", correct: true },
          { label: "How many regions it operates in" },
          { label: "Whether it supports zero-copy sharing" },
        ],
        explain: (
          <>
            Storage ownership and open-format posture, together. Pricing model changes what you
            pay while you stay; zero-copy sharing changes how others reach your data. Only
            storage ownership and format decide what it costs the day you actually want to leave.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
