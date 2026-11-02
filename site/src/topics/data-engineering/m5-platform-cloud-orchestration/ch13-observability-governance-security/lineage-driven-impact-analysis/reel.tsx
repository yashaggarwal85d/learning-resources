import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py): walking a lineage graph's table-level edges downstream from
// a changed column implicates every consumer of the whole table; walking its column-level
// edges implicates a strict subset -- only consumers whose own output actually derives from
// that column -- while a reader never wired to emit a lineage event stays invisible either way.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's data engineer wants to rename `orders.cust_id`. The catalog says three
          tables use it. The planted truth is that eleven downstream tables and two dashboards
          depend on it through other columns, and one nightly export to a partner reads it by
          name in a script no tool instruments. How many owners need to be told, and how many
          will you miss even with perfect lineage?
        </>
      ),
      duration: 5,
      fig: 'rename one column. the catalog undercounts, and one reader is never even seen.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: blast radius is a downstream walk of the lineage graph from a proposed change, scored by what it actually reaches",
      body: (
        <>
          Given a proposed change to a column or table, walk the lineage graph downstream --
          every transitive dependent, not just the direct ones. The resulting score is just the
          size and tier of what that walk actually reaches. A change that touches nothing
          downstream scores zero and needs no extra review at all.
        </>
      ),
      duration: 5,
      fig: 'a change, lit at one node. the walk: everything downstream it actually reaches.',
      Visual: S.RevealBlastRadius,
    },
    {
      title: "Predict: for a column being dropped, does table-level lineage, column-level lineage, both, or neither find every real dependent -- and can column-level ever find fewer?",
      body: (
        <>
          A table has three consumers reading from it. Only two of those three actually derive
          an output column from the specific column being dropped. Walk the graph both ways --
          at the table level and at the column level -- and compare what each one implicates.
        </>
      ),
      duration: 2.8,
      fig: 'one column dropped, three table consumers. table-level vs. column-level: same set?',
      predict: {
        options: [
          { label: 'Both find the same three consumers, since all three read from that table' },
          { label: 'Column-level finds only two -- the one reading unrelated columns drops out', correct: true },
        ],
        explain: (
          <>
            Column-level finds fewer. Table-level lineage only knows that a consumer reads the
            table at all, so it implicates everyone who touches it for any reason. Column-level
            lineage knows which output columns actually derive from which input columns, so a
            consumer reading unrelated columns correctly drops out of the blast radius.
          </>
        ),
      },
      Visual: S.PredictColumnVsTable,
    },
    {
      title: "Reveal: measured directly -- column-level lineage's affected set is a strict, more precise subset of table-level's",
      body: (
        <>
          Measured directly: table-level lineage flags every consumer of the whole table, even
          one that never touches the dropped column at all. Column-level lineage flags only the
          consumers whose own output genuinely derives from that specific column -- a strict
          subset of the table-level set, not just a different one.
        </>
      ),
      duration: 5,
      fig: "table-level: every reader of the table. column-level: a strict subset, measured.",
      takeaway: "A narrower blast radius isn't automatically a safer one -- it's only as safe as the column edges actually recorded.",
      Visual: S.RevealColumnNarrows,
    },
    {
      title: 'Elaborate: the same graph walk, run forward -- an upstream failure marks every downstream dataset potentially stale, with a reason, instead of a silent discovery later',
      body: (
        <>
          Run the identical walk the other direction: when an upstream run fails or lands bad
          data, mark every downstream dataset the graph reaches as potentially stale, labeled
          with exactly which upstream failure caused it -- so a consumer sees "stale because of
          X" up front, instead of discovering the problem on their own, later.
        </>
      ),
      duration: 5,
      fig: 'an upstream failure: the same walk, forward, marks every downstream node -- labeled.',
      Visual: S.ElaborateStalePropagation,
    },
    {
      title: 'Elaborate: resolve every affected node to its owner from the catalog and deduplicate, so an owner of ten affected tables gets exactly one message',
      body: (
        <>
          Once the walk has a list of affected nodes, resolve each one to its owner using the
          catalog, then deduplicate -- an owner responsible for ten different affected tables
          gets exactly one notification listing all ten, not ten separate messages to ignore. A
          deprecation workflow runs the identical resolve-and-notify step, just repeated on a
          schedule until every reader has replied or been escalated.
        </>
      ),
      duration: 5,
      fig: 'ten affected tables, one owner. resolve, dedupe: one message, not ten.',
      takeaway: "Resolving affected nodes to owners and deduplicating turns ten possible pings into one message an owner will actually read.",
      Visual: S.ElaborateOwnerNotification,
    },
    {
      title: "Predict: against the planted truth -- eleven real dependents, two dashboards, and one export no tool instruments -- how many owners does a perfect column-level walk actually reach?",
      body: (
        <>
          Run the walk against the shop's actual planted dependents: eleven downstream tables,
          two dashboards, and one nightly export to a partner that reads the column directly in
          an uninstrumented script. Does a perfect column-level walk notify every one of those
          owners -- including the export's?
        </>
      ),
      duration: 2.8,
      fig: 'eleven tables, two dashboards, one uninstrumented export. all notified, or not?',
      predict: {
        options: [
          { label: "Yes -- a perfect walk, run correctly, reaches every real dependent, by definition" },
          { label: "No -- the uninstrumented export never emitted an event, so no walk can reach it", correct: true },
        ],
        explain: (
          <>
            No walk reaches it, no matter how correctly it runs. The export was never wired to
            emit a lineage event in the first place, so there's no edge in the graph for any
            walk to follow -- the gap isn't a bug in the walk, it's a gap in what was ever
            recorded.
          </>
        ),
      },
      Visual: S.PredictPlantedTruth,
    },
    {
      title: "Reveal: measured directly -- a correct walk notifies every owner the graph can reach, and the uninstrumented export stays missed regardless, because no event for it ever existed",
      body: (
        <>
          Measured directly: the walk correctly notifies every owner reachable through a real,
          recorded edge in the graph. The uninstrumented export never appears in any result,
          under any walk method -- not because the walk failed, but because no lineage event
          for it was ever emitted to begin with.
        </>
      ),
      duration: 5,
      fig: 'every reachable owner: notified, measured. the uninstrumented export: never recorded.',
      Visual: S.RevealPlantedTruthAnswer,
    },
    {
      title: 'Recap',
      body: (
        <>
          Blast radius is just a downstream walk of the lineage graph, scored by what it
          actually reaches. Column-level lineage narrows that walk to what genuinely derives
          from the change. And the honest answer to "how many will you miss" is never zero,
          because a graph can only ever be as complete as what was actually recorded into it.
        </>
      ),
      duration: 5,
      fig: 'blast radius: a walk, scored. the honest answer to "how many missed": never zero.',
      takeaway: "A lineage graph tells you everything it was told; it stays silent about everything nobody ever wired it to see.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
