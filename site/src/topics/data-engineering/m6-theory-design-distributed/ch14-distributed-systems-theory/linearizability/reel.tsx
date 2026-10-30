import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a brute-force checker over candidate total orders finding a linearization for a
// correctly ordered history; the same checker finding none for the hook's stale-leader read;
// the same history fixed by a quorum-confirmed read regaining a linearization; the
// Attiya-Welch model's two regimes (a synchronized-clock round-trip floor, a skewed-clock
// per-operation floor) computed directly. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a read from the leader, after the leader has already been replaced',
      body: (
        <>
          The shop's stock register is read straight from the leader, so it's considered
          strongly consistent. The leader gets partitioned away. The other two nodes elect a
          new leader, which accepts a write setting stock to a new value, and that write
          completes. A client still talking to the old leader reads the register afterward and
          gets the old value back.
        </>
      ),
      duration: 4.8,
      fig: "a leader is partitioned away; the remaining nodes elect a new leader that accepts and completes a write; a client still talking to the old leader reads the register afterward and gets the old value",
      Visual: S.Hook,
    },
    {
      title: 'Predict: is this system linearizable?',
      body: (
        <>
          Linearizable because there's always exactly one leader, not linearizable because that
          read is stale, or linearizable anyway because the system is eventually consistent?
        </>
      ),
      duration: 2.8,
      fig: "is a read-from-the-leader register linearizable, not linearizable because the read was stale, or linearizable because the system is only eventually consistent?",
      predict: {
        options: [
          { label: "Linearizable — there's only ever one leader at a time, so reads go through a single, consistent source" },
          { label: "Not linearizable — the read's response comes after the write's response, so it must see the new value, and it doesn't", correct: true },
        ],
        explain: (
          <>
            Not linearizable. The write finished before the read even began. Any correct
            linearization has to place that write earlier, and a register that respects program
            order after a write must return the new value. The read returning the old value has
            no legal place to go — there is no linearization at all.
          </>
        ),
      },
      Visual: S.PredictLinearizable,
    },
    {
      title: 'Reveal: every operation takes effect at one instant inside its own interval',
      body: (
        <>
          Linearizability gives each operation the illusion of happening all at once, at some
          single point between when it was called and when it returned — and that point has to
          respect real time: if one operation's response comes before another's invocation, the
          first one's point must come first too.
        </>
      ),
      duration: 4.8,
      fig: "each operation appears to take effect at a single instant between its invocation and response, and that instant must respect real time: an earlier response means an earlier point",
      Visual: S.RevealInstant,
    },
    {
      title: 'Reveal: linearizable objects compose, and never make another operation wait',
      body: (
        <>
          If every object in a system is linearizable on its own, the whole system is — you can
          verify and implement each object independently, nothing more is needed. And a pending
          operation never has to block another one just to stay correct.
        </>
      ),
      duration: 4.8,
      fig: "linearizable objects compose: a system is linearizable if each individual object is, verified independently; and no pending operation is ever forced to block another",
      takeaway: "Linearizability's real engineering payoff is that it composes: verify each object alone, and the whole system's guarantee follows for free.",
      Visual: S.RevealLocality,
    },
    {
      title: 'Reveal: the checker, replaying a history that works',
      body: (
        <>
          Feed a correctly ordered write, read, write into a checker that searches every
          possible ordering for one that both obeys the register's own rules and respects real
          time. It finds one immediately — the order things actually happened in.
        </>
      ),
      duration: 4.8,
      fig: 'a checker searching every candidate ordering for one that obeys the register and respects real time finds a linearization immediately for a correctly ordered history',
      Visual: S.RevealCheckerWorks,
    },
    {
      title: 'Reveal: the identical checker, finding nothing at all',
      body: (
        <>
          Feed the same checker the hook's own history: a write that finishes, then a read that
          starts afterward and returns the old value. Every single ordering either breaks the
          register's rules or breaks real time. None of them work. That absence is the formal
          proof the hook's system is broken.
        </>
      ),
      duration: 4.8,
      fig: "the same checker fed the stale-leader history finds no ordering that both obeys the register and respects real time — that absence is the proof the history is not linearizable",
      takeaway: 'Finding no legal ordering is not the checker failing — it is the checker proving the history broken.',
      Visual: S.RevealCheckerFails,
    },
    {
      title: 'Reveal: the fix, and what it actually costs',
      body: (
        <>
          Make the deposed leader confirm it still holds a quorum before answering any read, and
          the stale value can never surface again. But that confirmation is not free: with
          perfectly synchronized clocks it costs a full round trip on one of the two operations,
          and once clocks carry any real uncertainty, every single operation costs roughly that
          uncertainty, no matter how the implementation is built.
        </>
      ),
      duration: 4.8,
      fig: "a quorum-confirmed read removes the stale-leader anomaly, but costs a full round trip under synchronized clocks and, once clock uncertainty is real, roughly that uncertainty on every operation, provably",
      Visual: S.RevealCost,
    },
    {
      title: 'Recap',
      body: (
        <>
          Linearizability is a property of a recorded history: an instant for each operation,
          respecting real time, and composable one object at a time. A stale leader read has
          formally no legal order; a quorum-confirmed read does. None of that is free — a
          sharper, proven bound says exactly what it costs.
        </>
      ),
      duration: 4.8,
      fig: 'linearizability is a property of a history — instantaneous effect, real-time order, local composability; the stale-leader read has no legal order, the fixed one does, and neither comes free',
      takeaway: "A history is linearizable or it isn't: the checker finds an ordering, or it finds nothing.",
      Visual: S.Recap,
    },
    {
      title: "Prove it: is a leader that's never been deposed automatically linearizable?",
      body: (
        <>
          A store serves every read straight from one designated leader, no quorum check at
          all, and in production that leader has never once been deposed. Does that track record
          make its reads linearizable?
        </>
      ),
      duration: 2.8,
      fig: 'a leader that has never yet been deposed in production serves reads with no quorum check — does that history of good luck make its reads linearizable?',
      predict: {
        options: [
          { label: "Yes — if it's never happened, the read-from-the-leader design has been proven safe in practice" },
          { label: 'No — linearizability has to hold for every possible history, and nothing about never-yet-deposed rules out the next partition', correct: true },
        ],
        explain: (
          <>
            No. Linearizability is a guarantee about every history the system could produce, not
            a statement about the histories observed so far. A design with no quorum check has
            exactly the hook's failure waiting in it; the fact that a partition hasn't happened
            yet changes nothing about whether the design is correct.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
