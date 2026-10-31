import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a vector comparison showing two vectors with no entry dominating the other as
// concurrent; the Dynamo paper's own D1-D5 worked example reproduced directly, including the
// reconciling write; a vector truncated past a threshold turning a genuinely dominating pair
// into one that compares as concurrent; a same-coordinator pair of writes that a plain version
// vector cannot tell apart, which a dot still distinguishes. No literal digits anywhere
// (duration numbers are exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: two carts, two replicas, one partition, and a reconnect with two versions',
      body: (
        <>
          Two customers each add an item to the same shopping cart on two different replicas,
          during a partition. When the replicas reconnect, the store has two versions of one
          cart. A scalar clock or a timestamp would pick one and quietly drop an item. How does
          the store know both versions are actually current?
        </>
      ),
      duration: 4.8,
      fig: 'two customers add an item to the same cart on two replicas during a partition; reconnecting leaves two versions, and a scalar clock or timestamp would silently keep only one',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which version does the store keep?',
      body: (
        <>
          The version with the larger clock, both versions, or neither? Pick before you read
          on.
        </>
      ),
      duration: 2.8,
      fig: 'does the store keep the version with the larger clock, both versions, or neither?',
      predict: {
        options: [
          { label: 'The version with the larger clock — larger still means more recent' },
          { label: 'Both — neither version dominates the other, so neither can be safely discarded', correct: true },
        ],
        explain: (
          <>
            Both. Comparing the two versions' vectors, neither one's entries are all greater
            than or equal to the other's. That is the definition of concurrent: the store has no
            basis for calling one more current, so dropping either one would silently lose a
            real edit.
          </>
        ),
      },
      Visual: S.PredictWhichVersion,
    },
    {
      title: 'Reveal: one counter per process, merged by the largest value seen',
      body: (
        <>
          Each process keeps a vector with one entry per process. It bumps its own entry on
          every event, and on receiving another vector, takes the larger value in every
          position. One vector dominates another exactly when every entry is at least as large
          and one is strictly larger — and that happens exactly when the first happened before
          the second.
        </>
      ),
      duration: 4.8,
      fig: 'a vector with one entry per process, bumped on its own events and merged by element-wise maximum on receipt; one vector dominates another exactly when it happened before it',
      Visual: S.RevealVectorRule,
    },
    {
      title: 'Reveal: the Dynamo example, five versions, one real trace',
      body: (
        <>
          One coordinator writes the first two versions, bumping its own entry each time. Two
          other coordinators each write a third version from the same starting point — neither
          dominates the other. A client reads both, and the reconciling write dominates them
          both at once.
        </>
      ),
      duration: 4.8,
      fig: "Dynamo's own worked example: one coordinator writes the first two versions, two others each branch from the second concurrently, and a reconciling write dominates both branches",
      takeaway: 'Five versions and three coordinators are exactly the mechanism — nothing about the method changes as more processes join in.',
      Visual: S.RevealDynamoExample,
    },
    {
      title: 'Reveal: the same rule, pointed at a replica instead of a process',
      body: (
        <>
          A vector clock tracks events happening at processes. A version vector tracks versions
          of one data item at the replicas that have coordinated a write to it. Same comparison,
          same guarantee — this is the form a real store actually keeps on disk.
        </>
      ),
      duration: 4.8,
      fig: 'a vector clock tracks events at processes; a version vector tracks versions of one data item at replicas, with the identical comparison rule — the form stores actually use',
      Visual: S.RevealVersionVector,
    },
    {
      title: 'Reveal: siblings, and the setting that lets them multiply',
      body: (
        <>
          When two versions are concurrent, the store keeps both as siblings for the
          application to merge. A client that reads siblings but never writes a merged version
          back leaves them piling up, and every new coordinator that joins in adds another
          column to the vector itself.
        </>
      ),
      duration: 4.8,
      fig: 'concurrent versions are kept as siblings for the application to merge; a client that never merges lets them multiply, and the vector grows with every new coordinator',
      takeaway: "Siblings aren't a bug the store failed to resolve — they're the honest alternative to silently picking a winner.",
      Visual: S.RevealSiblings,
    },
    {
      title: 'Reveal: the dot that tells two writes apart',
      body: (
        <>
          Two clients writing through the exact same coordinator can bump its entry identically
          and look like a single update, not two concurrent ones. A dot, one event identifier
          attached to each write, tells them apart — so siblings grow with how many updates were
          genuinely concurrent, not with how delivery happened to be ordered.
        </>
      ),
      duration: 4.8,
      fig: 'two writes through the same coordinator can produce an identical plain vector and appear to merge; a dot, one event identifier per write, tells them apart and bounds sibling growth to real concurrency',
      Visual: S.RevealDot,
    },
    {
      title: 'Recap',
      body: (
        <>
          A vector detects concurrency exactly, which a single number cannot. Dynamo's own
          example shows the whole mechanism end to end. Siblings are the application's honest
          job, not a failure, and a dot keeps them from multiplying for the wrong reason.
          Shrinking the vector on purpose trades that exactness away.
        </>
      ),
      duration: 4.8,
      fig: 'a vector detects concurrency exactly; the Dynamo trace shows the full mechanism; siblings are the honest alternative to guessing, and a dot bounds their growth to real concurrency; truncation trades exactness away deliberately',
      takeaway: 'Every shortcut this chapter takes — truncation included — has one specific, named failure, never a vague edge case.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: can truncating a vector make an ordered pair look concurrent?',
      body: (
        <>
          A store truncates every vector past a fixed number of entries to keep metadata from
          growing forever. Can that choice ever make two versions that really were ordered —
          one a true descendant of the other — look concurrent instead?
        </>
      ),
      duration: 2.8,
      fig: "a store truncates vectors past a fixed size — can that ever make a genuinely ordered pair of versions look concurrent?",
      predict: {
        options: [
          { label: 'No — truncation only discards old information, it never changes what the remaining entries say' },
          { label: 'Yes — dropping the entry that proved one version dominated the other can make them compare as concurrent', correct: true },
        ],
        explain: (
          <>
            Yes. If the dropped entry was the only one carrying the proof that the earlier
            version's history was included in the later one, comparing what's left can find no
            entry dominating the other way either, and the pair reads as concurrent even though
            it never was. The paper names this risk directly and accepts it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
