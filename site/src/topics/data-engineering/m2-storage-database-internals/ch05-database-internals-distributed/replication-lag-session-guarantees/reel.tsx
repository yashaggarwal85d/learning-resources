import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Five real measured experiments against this sandbox's own primary (5432) and standby (5434)
// Postgres pair (examples.py): a real paused standby breaks read-your-writes, a real LSN token
// fixes it, monotonic reads and consistent-prefix reads are shown holding on the single standby,
// and write_lag/flush_lag/replay_lag are real intervals Postgres itself computed under load.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A client writes an order, then reads it right back — on the same database it just wrote
          to, that's never in question. What happens when the read lands on a different node?
        </>
      ),
      duration: 4.8,
      fig: 'write an order, read it back. What if the read hits a different node?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the client see its own write on a lagging standby?',
      body: (
        <>
          The standby has the write, but hasn't applied it yet. Does the client's very next read
          see its own order?
        </>
      ),
      duration: 2.8,
      fig: "the standby hasn't applied it yet. Does the client's own read see it?",
      predict: {
        options: [
          { label: 'Yes — the client just wrote it, so it must see it' },
          { label: "No — the standby's visible state is frozen at the moment of the pause", correct: true },
        ],
        explain: (
          <>
            The write landed on the primary. The standby's own replay position is what decides
            what it can show, and that position hasn't moved yet — the client's own write is
            simply not there until replay catches up.
          </>
        ),
      },
      Visual: S.PredictOwnWriteOnLaggingStandby,
    },
    {
      title: 'Reveal: read-your-writes, defined',
      body: (
        <>
          The guarantee, stated precisely: a process's own write must be visible to that same
          process's own later read.
        </>
      ),
      duration: 4.8,
      fig: "a process's own write. Visible to that same process's own later read.",
      Visual: S.RevealReadYourWritesDefined,
    },
    {
      title: 'Reveal: broken, measured',
      body: (
        <>
          A real paused standby, a real committed write, a real read: the row the client itself
          just wrote is missing.
        </>
      ),
      duration: 4.8,
      fig: 'a real write, a real read. The row the client itself wrote: missing.',
      takeaway: 'Read-your-writes is not automatic across nodes — it breaks wherever the write and the read disagree about what is applied.',
      Visual: S.RevealBrokenMeasured,
    },
    {
      title: 'Reveal: the LSN token, built',
      body: (
        <>
          The primary's own commit position, captured as a token; the standby polled until it has
          replayed past that exact position — not a sleep guessed to be long enough.
        </>
      ),
      duration: 4.8,
      fig: "the primary's own commit position, as a token. Polled, not guessed.",
      Visual: S.RevealLsnTokenBuilt,
    },
    {
      title: 'Reveal: fixed, measured',
      body: (
        <>
          The identical write, the identical read, now correct: the row is visible the moment the
          standby's replay position passes the token.
        </>
      ),
      duration: 4.8,
      fig: "the same write, the same read. Visible the moment replay passes the token.",
      takeaway: 'The fix is the position, not the wait — any wait reaching that position works, none stopping short does.',
      Visual: S.RevealFixedMeasured,
    },
    {
      title: 'Predict: what does violating monotonic reads actually require?',
      body: (
        <>
          This single standby's reads never go backward in these experiments. What would it take
          to actually make one go backward?
        </>
      ),
      duration: 2.8,
      fig: 'reads never go backward here. What would make one actually go backward?',
      predict: {
        options: [
          { label: 'Reading the same standby twice, with a pause in between' },
          { label: 'Bouncing the session to a second replica with independently varying lag', correct: true },
        ],
        explain: (
          <>
            One standby replays one WAL stream in one order — its own state can only move forward.
            A real monotonic-reads violation needs a session served by two different replicas
            whose lag varies independently, so the second one can genuinely be further behind than
            the first was.
          </>
        ),
      },
      Visual: S.PredictMonotonicViolationNeeds,
    },
    {
      title: 'Reveal: the other two guarantees',
      body: (
        <>
          Monotonic reads (a session's reads never move backward) and consistent-prefix reads (an
          effect is never seen before its cause) — both measured holding on this single standby; a
          real violation of either needs a second, independently-lagging replica, named and
          sourced, not built here.
        </>
      ),
      duration: 5.4,
      fig: 'reads never move backward; an effect never precedes its cause — both measured holding.',
      takeaway: "A single replica can't violate either guarantee — one ordered WAL stream can't produce the anomaly it's defined against.",
      Visual: S.RevealOtherTwoGuarantees,
    },
    {
      title: 'Reveal: lag under load, measured',
      body: (
        <>
          2,000 real writes, then Postgres's own write_lag, flush_lag and replay_lag — the real
          interval the server itself computed, not a guess.
        </>
      ),
      duration: 4.8,
      fig: '2,000 real writes. write_lag, flush_lag, replay_lag: real, measured intervals.',
      takeaway: "A replica dashboard isn't stale by accident — it's exactly as far behind as replay_lag says, measured by Postgres.",
      Visual: S.RevealLagUnderLoadMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three guarantees, one real fix: a token that names the exact position a read must wait
          for.
        </>
      ),
      duration: 4.8,
      fig: 'three guarantees, one fix: a token naming the position a read must wait for.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard reads order counts from a lagging replica during a flash sale. A customer
          who just placed an order calls support asking where it is.
        </>
      ),
      duration: 2.8,
      fig: "a lagging replica, mid-sale. What does the fix cost, applied everywhere?",
      predict: {
        options: [
          { label: "Apply the LSN-token wait to every dashboard read — it's always the right fix" },
          { label: 'The token wait only belongs on the one read that needs read-your-writes', correct: true },
        ],
        explain: (
          <>
            The dashboard doesn't need read-your-writes — nobody's own write is being checked
            there, and forcing every dashboard query to wait for the latest LSN would just make the
            dashboard as slow as the primary. The token belongs on the support lookup for that one
            customer's own order; sticky routing back to the primary is the cheaper fix for that
            single case, and the dashboard is left exactly as it was.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
