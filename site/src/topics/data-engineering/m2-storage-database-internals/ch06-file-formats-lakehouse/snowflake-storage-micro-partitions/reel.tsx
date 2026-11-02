import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic is disclosed as sourced-only throughout: this sandbox has no Snowflake account,
// so nothing here is a real execution, unlike the engines earlier in this section. Every
// architectural and numeric claim is a word-for-word quote from Snowflake's own current
// documentation (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every engine so far reads a table this chapter built and owns itself. This topic turns
          to the first one this sandbox can't run directly at all: Snowflake's own proprietary
          storage.
        </>
      ),
      duration: 4.8,
      fig: "every engine so far reads a table this chapter owns. the first one this sandbox can't run at all: snowflake.",
      Visual: S.Hook,
    },
    {
      title: "Predict: who defines a table's partitions?",
      body: (
        <>
          A table's rows have to be grouped into storage units somehow. Does a person define
          those units up front in Snowflake, or does something else do it?
        </>
      ),
      duration: 4.8,
      fig: "a table's rows: split into partitions a person defines, or something else entirely?",
      predict: {
        options: [
          { label: 'A person defines them' },
          { label: 'Something else does', correct: true },
        ],
        explain: (
          <>
            Snowflake's own docs: micro-partitions are derived automatically; they don't need to
            be explicitly defined up front or maintained by users.
          </>
        ),
      },
      Visual: S.PredictPartitionDefinition,
    },
    {
      title: 'Reveal: immutable micro-partitions',
      body: (
        <>
          Contiguous, columnar, immutable units of storage -- fifty to five hundred megabytes of
          uncompressed data each, derived automatically, never defined by hand.
        </>
      ),
      duration: 4.8,
      fig: 'immutable micro-partitions, fifty to five hundred megabytes uncompressed, derived automatically, never defined by hand.',
      Visual: S.RevealMicroPartitions,
    },
    {
      title: 'Reveal: pruning from per-column metadata',
      body: (
        <>
          Snowflake keeps per-column metadata on every micro-partition. A query's filter uses it
          to skip whole micro-partitions outright, not scan past them.
        </>
      ),
      duration: 4.8,
      fig: "per-column metadata on every micro-partition lets a query skip the ones it doesn't need at all.",
      takeaway: 'Per-column metadata on an immutable block lets a filter skip it -- pruning, not a scan that stops early.',
      Visual: S.RevealPruning,
    },
    {
      title: 'Reveal: clustering depth and automatic clustering',
      body: (
        <>
          Clustering depth measures how much overlap is left to prune around. Automatic
          Clustering reclusters a table in the background on its own, suspended or resumed any
          time.
        </>
      ),
      duration: 4.8,
      fig: 'clustering depth measures the overlap; automatic clustering reclusters in the background, on its own.',
      Visual: S.RevealClusteringAutomatic,
    },
    {
      title: 'Predict: does pruning alone speed up a point lookup?',
      body: (
        <>
          A point lookup needs one row out of a huge table, on a column with countless distinct
          values. Does pruning and clustering alone make that fast, or does something else take
          over?
        </>
      ),
      duration: 4.8,
      fig: 'a point lookup on a high-cardinality column. does pruning and clustering alone make it fast?',
      predict: {
        options: [
          { label: 'Pruning alone handles it' },
          { label: 'A separate service does', correct: true },
        ],
        explain: (
          <>
            Snowflake's own docs: the search optimization service improves point-lookup and
            substring queries on structured data in Snowflake tables -- a different mechanism
            for a different access pattern.
          </>
        ),
      },
      Visual: S.PredictPointLookup,
    },
    {
      title: 'Reveal: the search optimization service',
      body: (
        <>
          A separate service entirely: search optimization, built for point lookups and
          substrings, not the range scans pruning and clustering already handle.
        </>
      ),
      duration: 4.8,
      fig: 'a separate service: search optimization, built for point lookups, not range scans.',
      takeaway: 'Pruning and clustering speed up range scans; a point lookup on a high-cardinality column needs a separate, purpose-built service instead.',
      Visual: S.RevealSearchOptimization,
    },
    {
      title: 'Reveal: time travel and fail-safe',
      body: (
        <>
          Because a micro-partition is never overwritten in place, the old version simply
          survives. Time travel holds it for a defined window; fail-safe is a last-resort week
          after that, recoverable only by Snowflake itself.
        </>
      ),
      duration: 4.8,
      fig: 'because micro-partitions are never overwritten, old versions survive -- time travel, then a last-resort fail-safe window.',
      Visual: S.RevealTimeTravelFailSafe,
    },
    {
      title: 'Reveal: zero-copy cloning and secure data sharing',
      body: (
        <>
          A clone shares the source's own underlying storage -- no bytes copied. A share moves
          no data at all between accounts, for the identical reason: the files underneath never
          change.
        </>
      ),
      duration: 4.8,
      fig: 'a clone and a share both point at the same immutable files -- no bytes copied, nothing moved.',
      takeaway: "Cloning and secure sharing both work because the storage underneath is immutable -- neither one copies a single file.",
      Visual: S.RevealCloneAndShare,
    },
    {
      title: 'Recap',
      body: (
        <>
          One immutable design underneath all of it: pruning and clustering read it directly,
          and time travel, cloning and sharing all lean on the exact same guarantee.
        </>
      ),
      duration: 4.8,
      fig: 'one immutable design: pruning, clustering, time travel, cloning and sharing, all consequences of it. next: bigquery.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
