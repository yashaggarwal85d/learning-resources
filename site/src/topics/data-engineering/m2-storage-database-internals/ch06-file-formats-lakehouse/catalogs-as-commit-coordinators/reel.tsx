import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Apache Iceberg's own Table Spec (the atomic-swap /
// check-and-put commit mechanism) and REST Catalog API (vended credentials, namespaces), the
// Hive Metastore's own thrift interface (its real privilege grants, and what its delegation
// tokens actually authenticate to), and AWS's own Lake Formation docs (why fine-grained access
// control and credential vending are a separate, bolted-on service, not Glue Data Catalog
// itself) -- plus a real minimal catalog built in this sandbox: a real compare-and-swap pointer
// race, real access control checked before the CAS runs, and a real scoped credential issued
// only to an authorized principal. No deltalake/delta-rs/iceberg-python library is used.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Both Iceberg and Delta now exist as real, fully built arcs, each committing by its own
          atomic pointer move. This topic names that pointer's own home: the catalog, built
          directly in this sandbox.
        </>
      ),
      duration: 4.8,
      fig: "both iceberg and delta commit by their own atomic pointer move. this topic names that pointer's home.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: is tracking the pointer the whole job?',
      body: (
        <>
          A catalog obviously tracks a table's current-metadata pointer. Is that the whole job a
          catalog does, or is there more to it?
        </>
      ),
      duration: 4.8,
      fig: 'a catalog tracks the current-metadata pointer. is that the whole job, or does it do more?',
      predict: {
        options: [
          { label: "That's the whole job" },
          { label: 'There are more real jobs', correct: true },
        ],
        explain: (
          <>
            A real catalog does four things, not one — the pointer is only the most visible of
            them.
          </>
        ),
      },
      Visual: S.PredictCatalogJob,
    },
    {
      title: 'Reveal: four real jobs',
      body: (
        <>
          Four real jobs: namespace management, the current-metadata pointer moved by a real
          compare-and-swap, access control, and credential issuance — built one at a time, for
          real, right here.
        </>
      ),
      duration: 4.8,
      fig: 'four real jobs: namespace, the pointer by compare-and-swap, access control, credential issuance.',
      Visual: S.RevealFourJobs,
    },
    {
      title: 'Reveal: a real compare-and-swap race',
      body: (
        <>
          A real table, registered with its first pointer. Two engines race for the next version
          with the exact put-if-absent compare-and-swap this chapter has used since topic 13 —
          one wins, the other gets a real conflict and retries.
        </>
      ),
      duration: 4.8,
      fig: "a real table, registered. two engines race for the pointer's next version, for real.",
      takeaway: "The pointer's compare-and-swap is the same primitive this chapter has used all along, just named as the catalog's own job.",
      Visual: S.RevealCasRace,
    },
    {
      title: "Predict: does an unauthorized request even reach the CAS?",
      body: (
        <>
          An unauthorized caller tries to move the pointer. Should that request reach the
          compare-and-swap at all, or should something stop it first?
        </>
      ),
      duration: 4.8,
      fig: "should an unauthorized caller's request even reach the compare-and-swap?",
      predict: {
        options: [
          { label: 'It reaches the CAS, then fails there' },
          { label: 'Access control stops it first', correct: true },
        ],
        explain: (
          <>
            Access control is checked before the compare-and-swap is even attempted — an
            unauthorized request never touches the pointer at all.
          </>
        ),
      },
      Visual: S.PredictAccessBeforeCas,
    },
    {
      title: 'Reveal: access control, for real',
      body: (
        <>
          A real unauthorized request is rejected for real, before the compare-and-swap is ever
          attempted — not a failed CAS, a request that never reaches it.
        </>
      ),
      duration: 4.8,
      fig: 'no -- rejected for real, before the compare-and-swap is ever attempted.',
      takeaway: 'Access control running before the pointer is touched is stronger than a CAS that merely fails politely.',
      Visual: S.RevealAccessControlReal,
    },
    {
      title: 'Reveal: credential issuance',
      body: (
        <>
          A real scoped, time-limited credential — naming exactly one table's own storage prefix
          — issued only to a principal with real access. This is the catalog's fourth real job.
        </>
      ),
      duration: 4.8,
      fig: "a real scoped, time-limited credential, naming exactly one table's own prefix, issued only to a real principal.",
      Visual: S.RevealCredentialIssuance,
    },
    {
      title: 'Reveal: the legacy options, named with their limits',
      body: (
        <>
          Hive Metastore's thrift interface does grant real privileges, but its own delegation
          tokens only authenticate to the metastore itself, not to cloud storage. Glue Data
          Catalog needs AWS Lake Formation bolted on for the same access control this catalog
          built directly. A JDBC catalog is just a compare-and-swap row.
        </>
      ),
      duration: 4.8,
      fig: "the legacy options, named with their real limits: hive metastore, glue data catalog, a jdbc catalog.",
      Visual: S.RevealLegacyOptions,
    },
    {
      title: 'Reveal: why this matters for a multi-cloud estate',
      body: (
        <>
          Vendor lock-in to one engine's own metastore, no credential vending without a separate
          service bolted on, and a single region or account by default — three real, named
          limits, not vague complaints.
        </>
      ),
      duration: 4.8,
      fig: 'why this matters for a multi-engine, multi-cloud estate: three real, named limits.',
      takeaway: 'A catalog missing even one of its four jobs pushes that gap onto every engine working around it.',
      Visual: S.RevealMultiCloudLimits,
    },
    {
      title: 'Recap',
      body: (
        <>
          A minimal catalog, built for real, doing all four jobs: namespace, a compare-and-swap
          pointer, access control, and credential issuance. The legacy options are named with
          their real, sourced limits.
        </>
      ),
      duration: 4.8,
      fig: 'a minimal catalog, for real, doing all four jobs. next: a real, vendor-neutral protocol for one.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
