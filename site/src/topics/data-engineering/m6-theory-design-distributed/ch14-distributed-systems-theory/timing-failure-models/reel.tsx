import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The chapter's own shared tool (CHAPTER.md): a deterministic simulator the builder writes in
// examples.py. This topic's three real runs (message loss, reordering, crash-recovery with a
// lost disk) each break the same two-line primary-backup protocol's one safety invariant for a
// different reason, and the shortest lost-write trace is found by exhaustive search over the
// six orderings of three scheduling events — the executable stand-in for the chapter's one
// skipped TLA+ lab (verification, the chapter's final section). No literal digits anywhere
// (duration numbers are exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a primary-backup register passes every test and loses an acknowledged write',
      body: (
        <>
          The primary applies a write, copies it to the backup, then tells the client it's
          acknowledged. It passes every test the team wrote. In production it loses an
          acknowledged write. The tests assumed machines crash and stay down, on a perfect
          network. Production had a machine that crashed, came back with an empty disk, and a
          message that arrived more than once. Which assumption did the protocol quietly make?
        </>
      ),
      duration: 4.8,
      fig: "a primary-backup register passes every test and still loses an acknowledged write in production — which untested assumption is the real cause?",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does message loss alone, with no other fault, already break it?',
      body: (
        <>
          Set aside reordering and crashes for a moment. The backup never even hears about one
          write; the client was already told it's acknowledged. Is that single fault, on its
          own, already enough to lose the write for good?
        </>
      ),
      duration: 2.8,
      fig: "the backup never hears about one write at all, but the client was already told it's acknowledged — does that single fault already lose the write for good?",
      predict: {
        options: [
          { label: "No — the client was already told, so the write counts as safe regardless" },
          { label: 'Yes — an acknowledged write that only ever existed on one machine is gone the moment that machine is', correct: true },
        ],
        explain: (
          <>
            Yes. Telling the client "acknowledged" is a promise, not a fact about where the data
            lives. If the write only ever reached the primary's own disk and the message to the
            backup never arrives, the promise and the reality have already come apart — before
            any crash, any reordering, anything else goes wrong.
          </>
        ),
      },
      Visual: S.PredictMessageLoss,
    },
    {
      title: 'Reveal: three timing models, the same space-time diagram',
      body: (
        <>
          A synchronous model gives a protocol a known cap on message delay. An asynchronous
          model gives it none at all. Between them, partial synchrony comes in two different
          shapes: a cap that exists but is never revealed, or a cap that only starts holding
          after an unknown moment the protocol can't detect arriving.
        </>
      ),
      duration: 4.8,
      fig: "between a known delay cap and no cap at all, partial synchrony comes in two different shapes — a hidden cap, or a cap that only starts holding after an undetectable moment",
      Visual: S.RevealTimingModels,
    },
    {
      title: 'Reveal: four fault classes, one hierarchy',
      body: (
        <>
          A crash-stop process halts and never comes back. A crash-recovery process halts and
          returns, maybe missing whatever it never finished writing to disk. An omission fault
          drops some of what it should send or receive while otherwise behaving. A Byzantine
          fault can say anything at all, including a convincing lie. Each class contains the
          ones before it.
        </>
      ),
      duration: 4.8,
      fig: "crash-stop, crash-recovery, omission and Byzantine each contain the ones before them — and a lying witness costs a protocol strictly more spare machines to outvote than a silent one",
      takeaway: "A lying witness costs a protocol strictly more spare machines to outvote than a merely silent one does.",
      Visual: S.RevealFaultHierarchy,
    },
    {
      title: 'Reveal: a fair-loss link, and what turns it reliable',
      body: (
        <>
          A fair-loss link only promises that a message retried forever eventually gets through
          at least once; any single attempt can still vanish, double up, or arrive out of turn.
          A reliable link promises every message arrives, once, in some usable order. Nothing
          about the wire grants that second promise. It's retried and deduplicated into existing
          on top of the first.
        </>
      ),
      duration: 4.8,
      fig: "a fair-loss link only promises an endlessly retried message eventually gets through once — a reliable link's stronger promise is built on top of it, by retrying and deduplicating, not granted by the wire",
      takeaway: "A reliable link is a fair-loss link plus retrying and deduplicating on top — never a fact about the wire.",
      Visual: S.RevealLinkModels,
    },
    {
      title: 'Reveal: the same two-line protocol, three different first breaks',
      body: (
        <>
          Run the chapter's own simulator three times on the identical primary-backup protocol.
          Dropping one message alone loses the first write outright. Letting two replicate
          messages for the same key arrive out of order leaves the backup holding the stale
          value for the second write. Crashing the backup before its own disk catches up loses
          the second write again, this time to an ordinary-looking restart.
        </>
      ),
      duration: 4.8,
      fig: "the identical two-line protocol, run three times in the chapter's own simulator — dropped, reordered, or crash-recovered, it loses an acknowledged write for a different reason each time",
      takeaway: "The same protocol breaks its one safety invariant three unrelated ways, each traced to one line of the simulator.",
      Visual: S.RevealLabResults,
    },
    {
      title: 'Recap',
      body: (
        <>
          A timing model is a contract a protocol is correct relative to, not a guess about how
          fast things usually go. The fault hierarchy says a lying witness is a different kind
          of problem than a silent one, not just a worse one. A reliable link is built, never
          given. And one small protocol, tested under one model, broke three separate ways the
          moment reality supplied a different one.
        </>
      ),
      duration: 4.8,
      fig: "a model is a contract, not a guess; a lying witness is a different problem than a silent one; a reliable link is built, not given; and one protocol broke three separate ways under three separate real-shaped faults",
      Visual: S.Recap,
    },
    {
      title: "Prove it: does a clean-looking dashboard mean the model held all week?",
      body: (
        <>
          A monitoring dashboard reports zero dropped messages and zero crashes this week. The
          team reads that as proof their replication protocol's safety promise held the whole
          time. Does a dashboard that tracks only those two things actually prove that?
        </>
      ),
      duration: 2.8,
      fig: "a dashboard reports zero dropped messages and zero crashes all week — does that prove the replication protocol's safety promise held the whole time?",
      predict: {
        options: [
          { label: "Yes — the two fault types the dashboard tracks both stayed at zero, so the model held" },
          { label: "No — reordering and an unflushed-write restart can both look clean on exactly those two counters while the invariant still breaks", correct: true },
        ],
        explain: (
          <>
            No. The dashboard only counts drops and crashes. Two of this topic's own three
            faults don't show up as either: a reordered pair of messages still counts as zero
            dropped, and a restart after losing only unflushed state still counts as zero
            crashes by most definitions of "crash" a dashboard tracks. A counter that never
            fires is evidence the thing it counts didn't happen, not evidence the model held.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
