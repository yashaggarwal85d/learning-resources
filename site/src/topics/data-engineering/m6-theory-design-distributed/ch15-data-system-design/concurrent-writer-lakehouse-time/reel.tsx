import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The conflict-rate simulation, the retry outcome, the retention cost and
// the maintenance-overlap check are asserted in examples.py's own
// writers_conflict(), conflict_rate(), retry_outcome(), retention_cost()
// and maintenance_overlaps_ingest(). The atomic-swap, tag-retention and
// conflict-exception claims trace to Iceberg's and Delta's own docs,
// quoted in SOURCES.md and checked step by step in FACT-CHECK.md. No
// literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: two collisions, one missing decision",
      body: (
        <>
          The compaction job and the CDC merge keep rewriting the same partitions, colliding
          with a commit conflict every few nights. Separately, an auditor asks for the table as
          it stood many months ago — the snapshot was already expired to satisfy erasure.
        </>
      ),
      duration: 5.0,
      fig: "a recurring conflict marker; an expired snapshot an auditor actually needed",
      Visual: S.Hook,
    },
    {
      title: "Predict: which decision prevents both?",
      body: (
        <>
          One of these is about writers touching the same files. The other is about a snapshot
          surviving an expiry sweep. What single decision, taken once, handles both?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "give every writer a faster retry loop, so conflicts just resolve themselves" },
          {
            label: "lay out writers on disjoint partitions, and give the audited snapshot its own retention class and tag",
            correct: true,
          },
        ],
        explain: (
          <>
            A retry doesn't change which files two writers touch — it just repeats the same
            collision until one gives up. Disjoint partitions remove the collision itself, and a
            tag removes exactly one snapshot from the expiry sweep without touching the rest.
          </>
        ),
      },
      fig: "a retry loop changes nothing about which files collide; partitioning does",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: every commit is one atomic swap",
      body: (
        <>
          The CDC merge, a backfill, and compaction each end in an attempt to swap the same
          single metadata pointer. A swap either lands cleanly, or it doesn't — there's no
          partial commit, no corrupted middle state for another writer to see.
        </>
      ),
      duration: 4.8,
      fig: "three writer lanes converge on one pointer; a swap lands, or holds",
      Visual: S.RevealAtomicSwap,
    },
    {
      title: "Reveal: partition writers so conflicts are rare",
      body: (
        <>
          The CDC merge and compaction touch the same partitions and collide. Moving compaction
          onto disjoint partitions removes the collision entirely — not by retrying faster, but
          by making sure the two writers never fight over the same files.
        </>
      ),
      duration: 5.0,
      takeaway: "Every commit is one atomic swap of a single pointer: writers succeed, retry, or fail by whether files overlap.",
      fig: "overlapping partitions colliding; a re-layout onto disjoint partitions, collision gone",
      Visual: S.RevealPartitionWriters,
    },
    {
      title: "Reveal: schema evolution as a written decision",
      body: (
        <>
          A column added under a stated review gate gets absorbed by every writer still running
          the old schema, instead of breaking on whichever writer's commit lands next. Who may
          change the schema, and how, is written down — never a default every writer assumes.
        </>
      ),
      duration: 4.6,
      fig: "a schema change passing through a review gate; old-schema writers kept running",
      Visual: S.RevealSchemaPolicy,
    },
    {
      title: "Reveal: the retention-and-audit collision",
      body: (
        <>
          An expiry line sweeps across the snapshot chain, clearing old history to satisfy
          erasure. A legal-hold tag pins one snapshot ahead of the sweep, and that one survives
          while every other snapshot around it is cleared on schedule.
        </>
      ),
      duration: 4.8,
      takeaway: "A retention policy and a legal-hold tag coexist without changing each other: the tag survives; the rest still expires.",
      fig: "an expiry sweep clearing snapshots; a tagged snapshot surviving it untouched",
      Visual: S.RevealRetentionTag,
    },
    {
      title: "Reveal: maintenance is a writer too",
      body: (
        <>
          Compaction, snapshot expiry, and orphan-file removal each attempt the same pointer
          swap the ingest writers do. Treated as background housekeeping, any one of them can
          starve the ingest it was supposed to be keeping tidy for.
        </>
      ),
      duration: 4.8,
      fig: "maintenance lanes converging on the same pointer as the ingest writers",
      Visual: S.RevealMaintenanceWriter,
    },
    {
      title: "Reveal: scheduling maintenance against ingest",
      body: (
        <>
          A maintenance window is sized and timed against the ingest stream's own growth, so a
          compaction run never overlaps the writers it would otherwise starve. The schedule is
          the design decision, not a job left to run whenever it happens to fire.
        </>
      ),
      duration: 4.8,
      takeaway: "Maintenance is a writer too, and scheduling it against the writers it serves is the design decision, not an afterthought.",
      fig: "a maintenance window timed clear of the ingest window beside it",
      Visual: S.RevealMaintenanceSchedule,
    },
    {
      title: "Recap",
      body: (
        <>
          One atomic swap per commit. Writers laid out on disjoint partitions so conflicts stay
          rare. A written schema-evolution policy. A retention policy and a legal-hold tag that
          coexist without touching each other. And a maintenance schedule timed clear of ingest.
        </>
      ),
      duration: 4.8,
      fig: "the swap protocol, the partition plan, the schema policy, the tag, the schedule",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a new writer joins the table",
      body: (
        <>
          A second CDC connector starts backfilling a different region's orders, on the same
          partitions the existing compaction job already uses. What's the right first move?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "let it run and see whether conflicts actually happen before changing anything" },
          {
            label: "check this new writer's partition overlap against every existing writer before it ships",
            correct: true,
          },
        ],
        explain: (
          <>
            Waiting for a conflict in production treats the method this topic already
            established as optional. The same disjoint-partitioning check that fixed the
            compaction-versus-merge collision applies here before the new writer ever commits.
          </>
        ),
      },
      fig: "a new writer about to share partitions with compaction; check overlap first",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
