import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The slot-retention cap, the heartbeat fix, and the compaction-to-slot
// interaction are asserted in examples.py's own retained_wal(),
// hours_until_cap(), slot_invalidated(), heartbeat_closes_quiet_gap() and
// slot_growth_with_stalled_compaction(). The cap and retention claims trace
// to PostgreSQL's and Debezium's own docs, quoted in SOURCES.md and checked
// step by step in FACT-CHECK.md. No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the connector stopped, and nobody restarted it",
      body: (
        <>
          A CDC connector pauses for a weekend upgrade. Nobody restarts it Monday. By midweek the
          orders database — the one that takes payments — is nearly out of disk, after being
          healthy for the better part of a year.
        </>
      ),
      duration: 5.0,
      fig: "the connector lane goes dark; the source-disk gauge climbs through the week",
      Visual: S.Hook,
    },
    {
      title: "Predict: what did the design fail to say about the slot?",
      body: (
        <>
          The disk didn't fill because of a leak in the connector's own code. What single
          setting bounds a replication slot's growth, and what does that bound actually cost?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "the connector leaked disk space through a bug in its own logging, unrelated to replication" },
          {
            label: "the slot retains every byte of log the stopped connector hasn't confirmed, and a cap bounds that at the cost of a forced re-snapshot",
            correct: true,
          },
        ],
        explain: (
          <>
            A code leak wouldn't track so cleanly with exactly when the connector stopped and
            resumed. The slot's own guarantee — keep everything unconfirmed, outage or not — is
            what turns a paused connector into a growing liability on the source's own disk.
          </>
        ),
      },
      fig: "what single setting bounds the slot, and what does the bound cost?",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the pipeline strip and its correctness boundary",
      body: (
        <>
          The write-ahead log, a replication slot, a connector reading it, a topic, then a merge
          into the lakehouse table ordered by log position, not arrival time. The correctness
          boundary sits at the merge — everything before it can replay or reorder.
        </>
      ),
      duration: 5.0,
      fig: "the pipeline strip lays out left to right; a dashed boundary drops onto the merge",
      Visual: S.RevealPipelineStrip,
    },
    {
      title: "Reveal: the slot's guarantee is the hazard",
      body: (
        <>
          The slot keeps every byte of log the connector hasn't confirmed — that's exactly what
          protects the pipeline from losing data during an outage. It's also exactly what fills
          the source's disk once the connector stops confirming anything at all.
        </>
      ),
      duration: 5.0,
      takeaway: "The guarantee that protects the pipeline from loss is the same guarantee that fills the disk once it stops.",
      fig: "the slot drawn as a growing log column while the connector lane stays dark",
      Visual: S.RevealGuaranteeIsHazard,
    },
    {
      title: "Reveal: the cap and its cost",
      body: (
        <>
          A cap line bounds how far the slot's retained log can grow. Cross it, and the slot is
          invalidated — the connector can't resume, it has to re-snapshot from scratch. A
          heartbeat keeps a slot on a quiet table from drifting toward that same cap unnoticed.
        </>
      ),
      duration: 5.0,
      fig: "a cap line crossed in red; a heartbeat line holding a quiet table's slot well short of it",
      Visual: S.RevealCapAndCost,
    },
    {
      title: "Reveal: snapshot and stream, handed over without a gap",
      body: (
        <>
          A new consumer needs the table's current state, then every change after it — with no
          gap and no overlap between the two. One design takes a consistent snapshot, then
          streams from the snapshot's own log position; the other interleaves log events with
          rows read directly from the table, taking no lock on the source.
        </>
      ),
      duration: 5.0,
      takeaway: "A new consumer needs the table's state and then every change after it, with no gap and no overlap.",
      fig: "a decision card: snapshot-then-stream against a lock-free, interleaved handover",
      Visual: S.RevealSnapshotHandover,
    },
    {
      title: "Reveal: deletes and schema change",
      body: (
        <>
          A deleted source row arrives as a tombstone the merge must apply, not infer. A column
          added at the source rolls out through a coordinated expand, then contract — never a
          same-day rename that breaks whoever is still reading the old shape.
        </>
      ),
      duration: 4.8,
      fig: "a tombstone applied as a delete; a column rollout staged as expand, then contract",
      Visual: S.RevealDeleteSchema,
    },
    {
      title: "Reveal: compaction stalls, and the slot grows with it",
      body: (
        <>
          Row-level merges pile up small delete and data files on the lakehouse table.
          Compaction is supposed to clear them — but a stalled compaction job slows the merge
          itself, which stalls slot consumption, which grows the source's own log right behind
          it.
        </>
      ),
      duration: 5.0,
      takeaway: "A stalled compaction stalls the merge, which stalls the slot, which grows the source's log — a new interaction.",
      fig: "small files piling up; a stalled compaction job, the slot gauge rising in sympathy",
      Visual: S.RevealCompactionStall,
    },
    {
      title: "Recap",
      body: (
        <>
          A pipeline strip with its correctness boundary at the merge. A slot whose own
          guarantee is also its hazard, bounded by a cap that trades availability for
          completeness. A snapshot-and-stream handover without a gap. Deletes and schema change,
          each applied on purpose. And compaction, slot growth, and the merge, all tied together.
        </>
      ),
      duration: 5.0,
      fig: "the strip, the cap trade, the handover choice, the delete-and-schema policy, side by side",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a second slot, already most of the way to its cap",
      body: (
        <>
          A different table's connector pauses for an unrelated maintenance window. Its slot is
          already well past half the configured cap, and climbing. What's the right first move?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "raise the cap further, since more headroom means a bigger safety margin" },
          {
            label: "compute the slot's own growth rate against the time left to the cap, and restart or re-snapshot before it's forced",
            correct: true,
          },
        ],
        explain: (
          <>
            Raising the cap doesn't remove the trade this design names — it only delays the
            choice between the source's own disk and a forced re-snapshot. The growth rate and
            the time remaining, computed from this slot's own numbers, decide the right move now.
          </>
        ),
      },
      fig: "a second slot well past half its cap; the fix is to compute the time left, not add headroom",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
