import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every count traces to examples.py: a real graph walk finds far more table-level consumers than
// the catalog's static index, a column-level walk excludes exact named false positives, stale
// propagation and deduplicated notification both run on the same planted graph, and an
// uninstrumented reader is checked absent from every traversal, not just assumed invisible.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An engineer wants to rename a column everyone calls `cust_id`. The catalog's own index
          says a small handful of tables use it. How many owners actually need telling — and how
          many will still be missed, even with lineage that works perfectly?
        </>
      ),
      duration: 6.8,
      fig: 'rename one column. the catalog says a few. is that the real count?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: whose number is right?',
      body: (
        <>
          The catalog's own count, a full lineage walk's count, or neither — is either one the
          true number of people who should hear about this change before it ships?
        </>
      ),
      duration: 6.8,
      fig: 'catalog says one number. the graph says another. which wins?',
      predict: {
        options: [
          { label: "The catalog's own index is the authoritative count" },
          { label: 'Neither alone — a full graph walk finds more, but not all of them matter', correct: true },
        ],
        explain: (
          <>
            The catalog only knows what it was told directly. A full graph walk finds everyone
            downstream — including tables that never actually touch the column being changed.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: walking the graph, table by table',
      body: (
        <>
          Start at the renamed column's own table and follow every downstream edge, any number of
          hops, no matter which column actually carries the data. On the real run here, that finds
          far more consumers than the catalog's static index ever listed.
        </>
      ),
      duration: 7.2,
      fig: "follow every edge downstream. many more consumers than the catalog knew.",
      Visual: S.RevealTableLevel,
    },
    {
      title: 'Reveal: walking the graph, column by column',
      body: (
        <>
          Follow only the edges where the actual column propagates, tracked through every rename,
          counting a value used indirectly as well as one copied straight through. On the same
          graph, this walk excludes exact, named tables the table-level walk wrongly implicated.
        </>
      ),
      duration: 7.2,
      fig: 'follow only where the column itself lands. fewer tables, named exclusions.',
      takeaway: "Table-level lineage finds who's downstream; column-level lineage finds who actually reads the thing changing.",
      Visual: S.RevealColumnLevel,
    },
    {
      title: 'Reveal: a failed partition spreads differently',
      body: (
        <>
          Blast radius asks what reads one column. A run failing outright is a different question —
          the whole partition is suspect, not one field — so staleness follows the table-level
          graph, not the column-level one, on the real run here marking every table-level
          dependent stale.
        </>
      ),
      duration: 7.2,
      fig: 'a whole partition fails. every downstream table, marked stale.',
      takeaway: 'Blast radius and stale propagation ask different questions, so they walk the graph differently.',
      Visual: S.RevealStalePropagation,
    },
    {
      title: 'Reveal: one notice per owner, not per table',
      body: (
        <>
          Resolve every affected table back to its owner and send exactly one message listing
          everything of theirs that's touched. On the real run here, eleven affected tables
          collapse into a small, named handful of notifications — nobody gets the same news twice.
        </>
      ),
      duration: 7.2,
      fig: 'many affected tables, one message per owner, nothing repeated.',
      takeaway: 'Deduplicating by owner, not by table, is what keeps one incident from flooding an inbox.',
      Visual: S.RevealNotification,
    },
    {
      title: 'Reveal: deprecation, blocked',
      body: (
        <>
          A table with live dependents cannot be deprecated out from under them. On the real run
          here, deprecating a table with dependents still outstanding is refused, and the refusal
          names exactly which owners haven't signed off yet.
        </>
      ),
      duration: 6.8,
      fig: "dependents still outstanding. refused, naming who's still missing.",
      Visual: S.RevealDeprecationBlocked,
    },
    {
      title: 'Reveal: deprecation, cleared',
      body: (
        <>
          Once every dependent's owner has signed off — or a table never had dependents to begin
          with — the same workflow proceeds. Both cases run for real on the same graph: a leaf
          table deprecates immediately, a dependent-heavy one only after every sign-off lands.
        </>
      ),
      duration: 6.8,
      fig: 'every sign-off in. the same table now deprecates cleanly.',
      Visual: S.RevealDeprecationCleared,
    },
    {
      title: 'Recap',
      body: (
        <>
          A catalog's static index undercounts. A table-level walk overcounts, naming real false
          positives. A column-level walk narrows it precisely. Staleness follows the whole table,
          not one column. One notice per owner, not per table. Deprecation waits on every sign-off.
        </>
      ),
      duration: 7.2,
      fig: 'catalog, table-level, column-level; stale; one notice; every sign-off.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table is read by name inside a script that never calls the lineage API at all. As the
          rest of the graph's coverage keeps improving, will blast-radius scoring, stale
          propagation, or owner notification ever see that reader — and why or why not?
        </>
      ),
      duration: 7.2,
      fig: 'a reader with no edge. does better coverage elsewhere ever find it?',
      predict: {
        options: [
          { label: "Eventually — a complete enough graph will catch up to it" },
          { label: 'Never, from this gap alone — no edge exists for any walk to follow', correct: true },
        ],
        explain: (
          <>
            Every one of these methods walks edges that already exist in the graph. A reader that
            never reports a run has no edge to find, no matter how much of the rest improves.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
