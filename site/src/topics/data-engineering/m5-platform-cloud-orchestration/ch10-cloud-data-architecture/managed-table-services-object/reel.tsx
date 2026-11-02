import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Four managed-table services (S3 Tables, BigLake Iceberg tables, Unity Catalog managed Iceberg,
// Snowflake-managed Iceberg), what each actually automates, the per-request premium, and the
// engine-skew failure mode — reproduced against real local metadata files and AWS's own
// documented Iceberg V3 compatibility table (disclosed in OUTLINE.md/examples.py).
const reel: Reel = {
  steps: [
    {
      title: 'A managed service that was supposed to make this mistake impossible',
      body: (
        <>
          A team adopts a managed Iceberg service expecting automatic compaction and snapshot expiry to end the
          corruption risk they learned about earlier. Three weeks later, one of their own read-only query engines
          can no longer open the table at all.
        </>
      ),
      duration: 4.4,
      Visual: S.MistakeImpossible,
    },
    {
      title: "What's actually different about the one engine that broke?",
      body: (
        <>
          Every other engine in the stack still reads the table fine. Nothing about the data changed. One engine,
          and only one, stopped working the moment the managed service did its job. What changed?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'That engine has a bug unrelated to this table' },
          { label: "The managed writer moved the table to a newer spec version that engine was never updated to read", correct: true },
          { label: 'The table was accidentally deleted and recreated' },
          { label: 'That engine ran out of memory on this specific query' },
        ],
        explain: (
          <>
            A spec-version move. The managed service's own writer upgraded the table to a newer version of the
            Iceberg format. Every engine that already understands that version reads it fine. The one engine still
            running an older version simply never learned the new format — and can't be patched by anyone but its
            own vendor.
          </>
        ),
      },
      Visual: S.WhatBroke,
    },
    {
      title: 'Four names, four different things actually automated',
      body: (
        <>
          S3 Tables compacts, manages snapshots and removes unreferenced files. BigQuery's managed Iceberg tables
          compact, cluster, and garbage-collect past the time-travel window. Unity Catalog manages reads, writes,
          storage and optimization outright. Snowflake draws the line per table: managed or not.
        </>
      ),
      duration: 5.2,
      Visual: S.FourVendorCards,
    },
    {
      title: 'The bill for not doing it yourself',
      body: (
        <>
          A managed table service doesn't fold its upkeep into ordinary storage pricing. It bills an object
          monitoring fee and a separate compaction fee, by the object and by the gigabyte processed, measured here
          against the service's own published rates.
        </>
      ),
      duration: 4.4,
      Visual: S.PremiumBilled,
      takeaway: 'A managed table service bills its own upkeep separately: a monitoring fee plus a compaction fee, on top of storage.',
    },
    {
      title: 'Someone still owns the job, just a different someone',
      body: (
        <>
          Run your own rewrite_data_files and expire_snapshots jobs, and you control exactly when they run and
          what they cost. Hand that to a managed service, and you control neither the timing nor the price — only
          whether it happens at all.
        </>
      ),
      duration: 4.0,
      Visual: S.SomeoneOwnsTheJob,
      takeaway: 'Maintenance as a service trades control over timing and cost for not having to run the job yourself.',
    },
    {
      title: "AWS's own engine can't read its own newer format",
      body: (
        <>
          This isn't a hypothetical. AWS's current documentation for Iceberg V3 says plainly: Amazon Athena can't
          read V3 tables. The same company ships the writer that creates V3 tables and a reader that can't open
          them.
        </>
      ),
      duration: 4.2,
      Visual: S.AthenaCantRead,
    },
    {
      title: 'The same table, upgraded once, reproduced for real',
      body: (
        <>
          One real local table, read by three named engines before an upgrade and after it. Before: every engine
          reads it. After: the one engine modeled on Athena's own documented gap fails, on the exact same files,
          with nothing else about the table touched.
        </>
      ),
      duration: 4.6,
      Visual: S.SkewReproduced,
      takeaway: 'An engine that never learned a newer spec version fails on a table nothing else about it changed.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Four managed services, four different automated jobs — never assume one implies the others. Each bills
          its upkeep as its own line item. And a writer that adopts a newer spec version before every reader does
          can break a working engine without touching a single row.
        </>
      ),
      duration: 3.6,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The team's fix is to pin every engine to read only V2 tables forever. Does that actually remove the
          engine-skew risk, or does it just delay the day they have to deal with it?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It removes the risk — staying on V2 forever is a safe, permanent fix' },
          { label: "It only delays it — eventually a feature, a vendor default, or a dependency will force the move to a newer version", correct: true },
        ],
        explain: (
          <>
            It only delays it. Pinning to V2 avoids today's break, but it doesn't make spec versions stop
            advancing — eventually a new feature only available in a newer version, a vendor's own default, or an
            upstream dependency will force the same decision. The actual fix is making sure every engine's upgrade
            path is tracked, not freezing one engine in place forever.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
