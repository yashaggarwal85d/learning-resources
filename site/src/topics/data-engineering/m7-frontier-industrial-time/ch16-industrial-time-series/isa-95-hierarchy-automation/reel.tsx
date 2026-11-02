import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real two-plant equipment hierarchy, synthetic but computed directly (examples.py): one
// physical machine moved between two lines partway through the window, and the exact same set
// of readings is joined two ways. One join carries the reading's own timestamp into the lookup;
// the other doesn't. The two totals differ by a real, asserted amount. No literal digits anywhere
// (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a line's own performance number looks solid, until a machine moves",
      body: (
        <>
          A line's output total for the quarter looks fine on its own. But one of the machines
          that fed into that total didn't sit on that line the whole time. Which number is the
          real one: the one the dashboard shows, or the one the machine's own history supports?
        </>
      ),
      duration: 4.8,
      fig: "a line's performance total looks solid on its own, but one of its machines moved to another line partway through the window — which total is real?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the five ISA-95 levels, by time horizon not by job title',
      body: (
        <>
          A plant's systems split into five levels, from the physical process at the bottom to
          business planning at the top. The split isn't about which department owns a box; it's
          about how fast that box has to react, from a control loop measured in a fraction of a
          second to a planning run measured in weeks.
        </>
      ),
      duration: 5.4,
      fig: 'five levels, from the physical process to business planning, split by how fast each one has to react rather than by which department owns it',
      takeaway: "ISA-95's five levels sort activities by how fast each one has to react, not by which department owns the system.",
      Visual: S.RevealLevels,
    },
    {
      title: 'Reveal: the SCADA naming trap',
      body: (
        <>
          The standard's own page places supervisory control and data acquisition at the
          manufacturing-operations level, next to the systems that schedule and track
          production. Plenty of practitioner diagrams draw it one level lower, next to the
          controllers it talks to. Both can't be the official placement — so what actually
          survives the disagreement?
        </>
      ),
      duration: 5.4,
      fig: "the standard's own page and common practitioner diagrams disagree about which level houses supervisory control and data acquisition — what survives the disagreement?",
      Visual: S.RevealScadaTrap,
    },
    {
      title: "Predict: does today's hierarchy answer a question about last quarter?",
      body: (
        <>
          A hierarchy table says exactly where every machine sits right now, kept perfectly up
          to date. A manager asks for last quarter's output by line. Does looking each machine
          up in that same, current table answer the question correctly?
        </>
      ),
      duration: 3.2,
      fig: "a perfectly up-to-date hierarchy table says where every machine sits right now — does looking a machine up in it correctly answer a question about last quarter?",
      predict: {
        options: [
          { label: "Yes — the table is current, so looking a machine up in it gives the right line for any question" },
          {
            label: "No — a reading has to join to whichever hierarchy row was valid when the reading actually happened, not to the machine's current row",
            correct: true,
          },
        ],
        explain: (
          <>
            No, and this holds even with a perfectly current table. A table that only remembers
            where a machine is right now has no way to answer where it was at some earlier time
            unless the lookup itself carries that earlier time into the join.
          </>
        ),
      },
      Visual: S.PredictCurrentTable,
    },
    {
      title: 'Reveal: the hierarchy as a type-2 SCD, keyed durably',
      body: (
        <>
          One physical press gets two separate rows in the hierarchy table: one for its time on
          the first line, one for its time on the second, each with its own window of validity
          and its own surrogate key. The move isn't an edit to the old row — it's a new row
          entirely.
        </>
      ),
      duration: 5.2,
      fig: "one physical press gets two separate hierarchy rows across its move, each with its own validity window and its own surrogate key",
      takeaway: 'The same machine gets two different surrogate keys across a move — a new row, not an edit.',
      Visual: S.RevealScdRows,
    },
    {
      title: 'Reveal: the measured join bug',
      body: (
        <>
          The exact same stream of readings, joined two ways. One join carries each reading's
          own timestamp into the lookup. The other joins every reading to the machine's latest
          row, full stop. The two totals for each line come out measurably different — and
          nothing about any physical reading changed between them.
        </>
      ),
      duration: 5.6,
      fig: "the identical stream of readings, joined by event time against joined to the machine's latest row — the two totals for each line come out measurably different",
      takeaway: "Joining every reading to the equipment's latest row, not its row at reading time, moved real output between lines.",
      Visual: S.RevealJoinBug,
    },
    {
      title: "Reveal: why equipment_id or a tag name can't carry this alone",
      body: (
        <>
          The machine's own identifier is identical across both of its hierarchy rows. What
          tells the join which row answers for which reading is the surrogate key paired with
          the row's own window of validity — the identity alone was never going to be enough.
        </>
      ),
      duration: 4.8,
      fig: "the machine's own identifier is identical across both hierarchy rows — what actually tells the join which row answers for which reading?",
      Visual: S.RevealDurableKey,
    },
    {
      title: 'Recap',
      body: (
        <>
          Five levels split by time horizon, not department. A real disagreement about where
          supervisory control sits, resolved by the idea that survives it. A hierarchy that
          versions itself every time a machine moves. And a measured join bug that moves real
          output from one line to another without touching a single reading.
        </>
      ),
      duration: 5.2,
      fig: 'five levels by time horizon, the SCADA disagreement resolved, a versioned hierarchy, and a measured join bug that moves output between lines without touching a reading',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new dashboard caches each machine's current line once a day and joins every
          incoming reading to that cache, however old the reading is. Is a reading from a few
          days ago, from before today's cache refresh, guaranteed to land on the right line?
        </>
      ),
      duration: 3.2,
      fig: "a dashboard caches each machine's current line once a day and joins every incoming reading to that cache — is an older reading guaranteed to land on the right line?",
      predict: {
        options: [
          { label: "Yes — the cache is refreshed daily, so it's close enough for any reading from the last few days" },
          {
            label: 'No — any reading from before the machine last moved will still land on the wrong line once the cache reflects the move',
            correct: true,
          },
        ],
        explain: (
          <>
            No. The cache answers "where is this machine now," which is exactly the wrong
            question for a reading that happened before the move it just learned about. The
            cache needs the same thing the join needed all along: the reading's own timestamp,
            carried into the lookup.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
