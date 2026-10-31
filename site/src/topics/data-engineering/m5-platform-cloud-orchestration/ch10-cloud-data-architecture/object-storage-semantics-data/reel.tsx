import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Object storage's exact read-after-write and write-coordination guarantees, run against a
// local S3-compatible server. Every number is executed and checked by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Two writers, one key, no error',
      body: (
        <>
          Two clients both check the same key, both find it absent, and both write it. Neither write raises an error. One of them simply
          disappears, overwritten with no warning from either side.
        </>
      ),
      duration: 4,
      Visual: S.TwoWritersOneKey,
    },
    {
      title: 'Which guarantee closes this gap?',
      body: (
        <>
          Both writes above succeeded. Which single guarantee, if the store had it, would make one of these two writes fail instead of silently
          losing data?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Stronger read-after-write consistency' },
          { label: "A conditional write tied to the key's current state", correct: true },
          { label: 'A bigger request-rate limit' },
          { label: 'Versioned buckets' },
        ],
        explain: (
          <>
            A conditional write. Consistency decides what a read sees after a write; it says nothing about whether a second write is allowed to
            happen at all. Only a precondition checked by the store itself at write time closes this race — a client reading first and writing
            second is still two separate steps with a gap between them.
          </>
        ),
      },
      Visual: S.WhichGuaranteeCloses,
    },
    {
      title: 'What strong consistency actually promised, and when',
      body: (
        <>
          Since December 2020 any read or list request on Amazon S3 immediately reflects the most recent write, at no extra cost. A single key's
          own read right after its own write was never the hard case — a list right after a write used to be the one that needed a workaround,
          and that workaround is what this removed.
        </>
      ),
      duration: 4.6,
      Visual: S.ConsistencyTimeline,
    },
    {
      title: 'One PUT is atomic; a rename never was — unless the store has a hierarchy',
      body: (
        <>
          A single write to one key is atomic: a concurrent read sees the old bytes or the new bytes, never a mix. A rename is two separate
          operations, a copy then a delete, with a real gap between them, because there is no way to make an update of one key depend on an
          update of another. A hierarchical namespace, like Azure Data Lake Storage Gen2's, buys that guarantee back by updating one directory
          entry instead of copying every file underneath it.
        </>
      ),
      duration: 5,
      Visual: S.AtomicPutVsRename,
      takeaway: 'A single key is atomic; a rename across two keys never is — unless the store has a hierarchical namespace.',
    },
    {
      title: 'Conditional writes turn one key into a lock',
      body: (
        <>
          A write that only succeeds if the key is still absent creates a commit log entry with no coordinator, no database and no client-side
          consensus. A write that only succeeds if the key's current tag still matches renews a lease without ever clobbering another holder's
          write. Both checks are evaluated by the store itself, not the client.
        </>
      ),
      duration: 5.2,
      Visual: S.ConditionalLock,
      takeaway: "A create-if-absent or update-if-unchanged write turns a single key into a real compare-and-swap, enforced by the store, not the client.",
    },
    {
      title: 'A hot key range throttles, even though the bucket has no limit',
      body: (
        <>
          The request-rate limit lives on the key prefix, not the whole bucket. A burst against one narrow prefix past the baseline comes back
          with a wave of throttling, while the exact same burst, spread across several prefixes, completes without a single one.
        </>
      ),
      duration: 4.8,
      Visual: S.HotPrefixThrottle,
      takeaway: 'A request-rate limit lives on the key prefix, not the bucket. Splitting the prefix fixes it, not a quota increase.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Strong read-after-write and list consistency since December 2020. One key is atomic; a rename never is, without a hierarchical
          namespace. A conditional write is a real compare-and-swap. A hot prefix throttles on its own. Next: what still has to be built on top of
          just these two primitives.
        </>
      ),
      duration: 3.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A client writes a key with a conditional check tied to a tag it read three refreshes ago, and the key has been written twice since by
          someone else. Accepted, rejected, or does it depend on something not yet given?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Accepted — the client still holds a valid tag from its own read' },
          { label: "Rejected — the store checks the key's current tag, not the client's memory of it", correct: true },
          { label: 'It depends on which of the two later writers checked first' },
        ],
        explain: (
          <>
            Rejected. The store compares the condition against the key's current state at the moment of this write, not against whatever the
            client last happened to read. Two writes have landed since, so the tag the client is holding is stale — the precondition fails and
            the write is refused, exactly as it should be.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
