import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a happens-before graph built from the hook's order/payment/shipment chain plus an
// unrelated customer's order, checked acyclic with the unrelated pair coming back concurrent; the
// scalar-clock update rule (IR1/IR2) producing strictly increasing stamps along the causal chain,
// unaffected by injected physical skew; a constructed tie resolved by an arbitrary process-id
// tie-break into a definite total order; the independent order's scalar stamp differing from
// shipment's despite being concurrent with it. No literal digits anywhere (duration numbers are
// exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: three services, three disagreeing clocks, and one log that must get the order right',
      body: (
        <>
          An order, its payment, and its shipment happen on three different services, and their
          clocks don't agree. You must produce one global log that never shows the shipment
          before the payment that caused it. You can't use the clocks to do it. What do you use
          instead?
        </>
      ),
      duration: 4.8,
      fig: "the shop's order, payment and shipment events occur on three services whose clocks disagree. You must produce one global log that never shows the shipment before the payment that caused it. You cannot use the clocks. What do you use?",
      Visual: S.Hook,
    },
    {
      title: "Predict: does the log's order between two strangers' orders mean anything?",
      body: (
        <>
          Your log also lists a completely unrelated customer's order, placed on neither of
          these services. The log puts that order before the shipment. Does that ordering tell
          you the stranger's order genuinely happened first?
        </>
      ),
      duration: 2.8,
      fig: "a log orders a genuinely independent customer's order before the shipment — does that ordering mean the independent order really happened first?",
      predict: {
        options: [
          { label: "Yes — the log's order is built from real causal information, so it must be accurate" },
          { label: 'No — two events with no causal link can still land in some order in the log, and that order carries no meaning about which came first', correct: true },
        ],
        explain: (
          <>
            No. The log's ordering has to put every pair of events somewhere, including pairs
            that never exchanged a message and never shared a process. For a pair like that,
            the order is arbitrary — a tie-break, not a fact about causality.
          </>
        ),
      },
      Visual: S.PredictLogOrderMeaning,
    },
    {
      title: 'Reveal: happens-before, three conditions and nothing more',
      body: (
        <>
          One event happens before another if they're on the same service and come in that
          order, or one is the sending of a message and the other its receipt, or there's a
          chain of such steps connecting them. Two events with no such chain, in either
          direction, are concurrent.
        </>
      ),
      duration: 4.8,
      fig: 'the happens-before relation: same-process order, a send linked to its matching receipt, and transitivity through a chain of such steps; anything outside that chain is concurrent',
      Visual: S.RevealHappensBefore,
    },
    {
      title: 'Reveal: a counter, incremented and advanced past every message it sees',
      body: (
        <>
          Each service keeps a counter and bumps it before every event. Every outgoing message
          carries the counter's current value. On receipt, the counter jumps to one past the
          larger of its own value and the message's value. That alone guarantees every caused
          event gets a strictly larger number than its cause.
        </>
      ),
      duration: 4.8,
      fig: 'a counter incremented between events and bumped past any incoming message timestamp guarantees the clock condition: a cause always gets a smaller number than what it caused',
      takeaway: 'Two purely local rules are enough to guarantee every caused event gets a strictly larger number than its cause.',
      Visual: S.RevealScalarClock,
    },
    {
      title: "Reveal: the same guarantee, however badly a physical clock would have disagreed",
      body: (
        <>
          Run the causal chain through a simulator that injects real clock skew between the
          services. The scalar counters never once read a physical clock, so the guarantee
          holds exactly as before: the order's number stays smaller than the payment's, and the
          payment's smaller than the shipment's.
        </>
      ),
      duration: 4.8,
      fig: 'the scalar clock guarantee holds along the causal chain regardless of injected physical-clock skew, because the scalar clock never reads a physical clock at all',
      Visual: S.RevealSkewDoesNotMatter,
    },
    {
      title: 'Reveal: a definite order for everyone, by breaking ties on who you are',
      body: (
        <>
          Two counters can land on the exact same number with no message between them. Settle
          that tie with any fixed ordering of the services themselves — alphabetical is fine.
          The result puts every event somewhere, in a single line, and never contradicts which
          one actually caused which.
        </>
      ),
      duration: 4.8,
      fig: 'tied scalar numbers are broken by a fixed ordering of the services themselves, producing a single total order that never contradicts the causal chain it extends',
      takeaway: 'A fixed tie-break on identity turns colliding numbers into one definite line, usable for granting a shared resource fairly.',
      Visual: S.RevealTieBreak,
    },
    {
      title: 'Reveal: the one question that single line cannot answer',
      body: (
        <>
          That line puts the stranger's order somewhere relative to the shipment — but nothing
          in that placement says the stranger's order actually happened first. The reverse of
          the guarantee doesn't hold: a smaller number never proves a cause. This is exactly
          the gap the hook's predict stepped into.
        </>
      ),
      duration: 4.8,
      fig: 'the converse fails: a smaller number never proves one event caused another, so two genuinely independent events still receive some order with no meaning behind it',
      Visual: S.RevealConverseFails,
    },
    {
      title: 'Recap',
      body: (
        <>
          Happens-before is a chain of same-service steps and matched sends and receipts, and
          nothing outside that chain counts. A counter, bumped locally and advanced past every
          incoming message, respects that chain no matter how any physical clock behaves. Break
          ties on identity and the chain extends into one usable line — but that line still
          can't tell you which pairs were ever truly independent.
        </>
      ),
      duration: 4.8,
      fig: 'happens-before is built from local order and message links; a scalar counter respects it regardless of physical clocks; a tie-broken total order extends it usably, but cannot reveal which pairs were concurrent',
      takeaway: "A Lamport clock's promise is narrower than it sounds: it never contradicts a cause, but never proves one.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it: is a smaller timestamp always safe to read as "happened first, so caused it"?',
      body: (
        <>
          A system sees request B's counter value is larger than request A's, and concludes B
          must depend on A. Is that conclusion always safe to act on?
        </>
      ),
      duration: 2.8,
      fig: 'a system reads request B\'s larger counter value as proof that B depends on A — is that conclusion always safe?',
      predict: {
        options: [
          { label: 'Yes — a larger counter value always means the later event genuinely depends on the earlier one' },
          { label: "No — the counters only guarantee a real cause gets a larger number; they never guarantee a larger number means a real cause", correct: true },
        ],
        explain: (
          <>
            No. The Clock Condition only runs one direction: if A happened before B, B's number
            is larger. It says nothing about the reverse. Two events that never exchanged a
            message or shared a process can still get any relative numbers at all, and reading
            that difference as a dependency invents a cause that was never there.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
