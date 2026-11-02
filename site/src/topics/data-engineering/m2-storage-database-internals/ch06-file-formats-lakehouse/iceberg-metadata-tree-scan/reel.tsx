import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own metadata-tree
// section (metadata.json's fields; manifest list rows carrying per-manifest partition stats
// and file counts to skip manifests; manifests carrying per-file partition data, metrics and
// tracking info; sequence numbers inherited per snapshot and monotonically increasing; scan
// planning producing live data files from the root, pruning manifests by partition summary
// and column stats, then filtering files by partition predicate) and the Iceberg maintenance
// docs' own rewrite-manifests section (the metadata tree as an index; manifests compacted in
// write order; rewriteManifests re-grouping files when write pattern doesn't match read
// pattern) -- and against a real Apache Iceberg table built in this sandbox with the real
// pyiceberg library (a real SQL catalog, real Avro manifest and manifest-list files, a real
// metadata.json), with every structural claim and scan-planning result read directly off that
// table, and a real rewrite_manifests reproduced from pyiceberg's own real manifest-writing
// and snapshot-commit primitives.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every topic so far has treated "the snapshot" as a single thing a reader reaches for.
          This topic opens it up: a snapshot is a tree, and a scan plans by walking down it.
        </>
      ),
      duration: 4.8,
      fig: 'a snapshot has looked like one thing -- this topic opens it up as a tree a scan walks.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: five day-partitions, one wanted — does a reader open every manifest to find out?',
      body: (
        <>
          A reader wants one partition's worth of rows out of a table with five partitions, one
          per day. Does it have to open every manifest to find out which files match?
        </>
      ),
      duration: 4.8,
      fig: 'one day wanted out of five partitions -- does a reader open every manifest to check?',
      predict: {
        options: [
          { label: 'Yes — every manifest gets opened' },
          { label: 'No — most are skipped by a summary', correct: true },
        ],
        explain: (
          <>
            The manifest list carries a per-manifest partition summary, so planning can rule a
            manifest out before opening it at all.
          </>
        ),
      },
      Visual: S.PredictOpenAllManifests,
    },
    {
      title: 'Reveal: reproduced for real — a real table’s metadata.json, manifest list, and manifests',
      body: (
        <>
          The real tree, built in this sandbox with a real `pyiceberg` table: `metadata.json`
          at the root — schemas, partition specs, sort orders, snapshot log, refs — points at a
          manifest list, which points at manifests.
        </>
      ),
      duration: 4.8,
      fig: 'metadata.json at the root, pointing to a manifest list, pointing to manifests.',
      Visual: S.RevealRealTree,
    },
    {
      title: 'Reveal: reproduced for real — every manifest and file inherits its snapshot’s sequence number',
      body: (
        <>
          Every manifest, data file, and delete file inherits its snapshot's sequence number.
          A real table's five commits read back with sequence numbers 1 through 5, in order,
          with no gaps.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: sequence numbers 1, 2, 3, 4, 5 across five real commits.',
      Visual: S.RevealSequenceNumbers,
    },
    {
      title: 'Reveal: reproduced for real — per-manifest partition summaries, per-file partition tuples and metrics',
      body: (
        <>
          The manifest list carries per-manifest partition summaries; each manifest carries
          per-file partition tuples and column metrics — read directly off the real Avro files
          through the table's own inspect tables.
        </>
      ),
      duration: 4.8,
      fig: 'the manifest list summarizes manifests; manifests carry partition tuples and metrics per file.',
      takeaway: 'The tree carries its own summaries, one level before the files it describes.',
      Visual: S.RevealManifestSummaries,
    },
    {
      title: 'Predict: does planning skip manifests outside the target partition, or filter rows after opening all of them?',
      body: (
        <>
          Scale the same question up: does planning actually skip manifests outside the target
          partition, or does it open all five and filter rows afterward?
        </>
      ),
      duration: 4.8,
      fig: 'does planning skip the manifests outside one partition, or open all five anyway?',
      predict: {
        options: [
          { label: 'It opens all five, then filters' },
          { label: 'It prunes manifests before opening them', correct: true },
        ],
        explain: (
          <>
            A manifest with no matching partition in its summary never gets opened — planning
            rules it out first, the same way it ruled out whole manifests in the prediction
            above.
          </>
        ),
      },
      Visual: S.PredictPruningReal,
    },
    {
      title: 'Reveal: reproduced for real — scan planning measured, manifests pruned before files',
      body: (
        <>
          Measured directly: an unfiltered scan plans 5 files; a scan filtered to one day's
          partition plans exactly 1 — the other 4 manifests are pruned by their partition
          summaries before any file inside them is touched.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: unfiltered plans 5 files; filtered to one day plans exactly 1.',
      takeaway: 'Planning prunes the tree level by level — manifests first, then files.',
      Visual: S.RevealPruningMeasured,
    },
    {
      title: 'Reveal: many small commits leave as many manifests as commits',
      body: (
        <>
          This is why a streaming-style table — one small commit per arrival, each with its own
          one-manifest snapshot — ends up with as many manifests as commits: the same bloat
          found at the data-file level, one level up the tree.
        </>
      ),
      duration: 4.8,
      fig: 'one small commit per arrival leaves one manifest per commit -- bloat, one level up.',
      Visual: S.RevealManifestBloat,
    },
    {
      title: 'Reveal: reproduced for real — a real rewrite_manifests merges five manifests into one',
      body: (
        <>
          A real `rewrite_manifests`, built from pyiceberg's own manifest-writing and
          snapshot-commit primitives: the five one-manifest commits merge into a single
          manifest, committed as the table's new live snapshot — same row count, same data, one
          manifest instead of five.
        </>
      ),
      duration: 4.8,
      fig: 'real measured result: 5 manifests before the rewrite, 1 after, same rows readable.',
      takeaway: 'Rewriting the tree, not just the files, undoes the bloat a write pattern leaves.',
      Visual: S.RevealRewriteManifests,
    },
    {
      title: 'Recap',
      body: (
        <>
          A snapshot is a tree: `metadata.json`, a manifest list, manifests, then files.
          Planning prunes it level by level — manifests by partition summary, files by column
          metrics — before touching a single row. Many small commits bloat it one manifest at a
          time; `rewrite_manifests` undoes that.
        </>
      ),
      duration: 4.8,
      fig: 'a query prunes this tree by partition tuple, as long as it never has to name the column.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
