import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The delete-after-write race and its lease fix are both reproduced for real in examples.py:
// the exact interleaving the hook describes, run with and without a lease, with the cache's own
// resulting state read back directly rather than asserted. The CDC-driven-invalidation and
// per-field-staleness claims are sourced from Memcache's and TAO's own documentation, named but
// not separately run, since both describe infrastructure (a commit-log daemon, a multi-region
// read router) this course's own sandbox does not stand up.
// No literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a reader's stale read lands in the cache right after a writer already deleted that key",
      body: (
        <>
          A reader misses the cache and starts a slow read of the old value. Before that read
          finishes, a writer updates the database and deletes the same key. The reader's own
          stale read then lands in the cache anyway — right after the delete that was supposed to
          prevent exactly this.
        </>
      ),
      duration: 5.2,
      fig: "a reader's stale read lands in the cache right after a writer already deleted that same key",
      Visual: S.Hook,
    },
    {
      title: 'Predict: would updating the cache instead of deleting it have prevented this',
      body: (
        <>
          The writer already deleted the key, and the race still happened. Would writing the new
          value directly into the cache, instead of deleting it, have closed this gap?
        </>
      ),
      duration: 2.8,
      fig: 'would updating the cache instead of deleting it have prevented this race?',
      predict: {
        options: [
          { label: 'Yes — updating leaves the cache holding something, instead of nothing' },
          { label: 'No — the timing problem is the same either way, and updating is riskier', correct: true },
        ],
        explain: (
          <>
            No. The race is about timing, not which write operation was used. Updating is
            actually worse: two concurrent updates can land in either order, silently overwriting
            a newer value with an older one, while two concurrent deletes always leave the same
            result.
          </>
        ),
      },
      Visual: S.PredictUpdateVsDelete,
    },
    {
      title: 'Reveal: delete, not update',
      body: (
        <>
          Sending a delete twice, in any order, leaves the cache in the exact same cold state
          either time. Sending an update twice can leave the cache holding whichever value landed
          last, which is not necessarily the newest one.
        </>
      ),
      duration: 4.8,
      fig: 'delete, not update: a delete is idempotent, an update is not',
      Visual: S.RevealDeleteNotUpdate,
    },
    {
      title: 'Reveal: the race, reproduced for real',
      body: (
        <>
          The exact interleaving from the hook, run for real against this course's own
          cache-aside layer. The database ends up holding the new value. The cache, measured
          directly afterward, ends up holding the old one.
        </>
      ),
      duration: 4.8,
      fig: "the exact interleaving, reproduced for real — does deleting on write actually close the gap?",
      takeaway: 'Deleting on write alone does not close the race; the stale value still lands in the cache.',
      Visual: S.RevealRaceReproduced,
    },
    {
      title: 'Reveal: leases close it',
      body: (
        <>
          A lease token, handed to the reader on its original miss, is invalidated the moment the
          writer's delete arrives for that key. The reader's own stale write-back now carries an
          invalid token and is rejected, measured directly, rather than stored.
        </>
      ),
      duration: 5.2,
      fig: "a lease token, invalidated by the writer's delete, rejects the reader's own stale write-back",
      takeaway: "A lease invalidated by a delete rejects exactly the stale write-back that caused the race.",
      Visual: S.RevealLeasesClose,
    },
    {
      title: "Reveal: CDC-driven invalidation",
      body: (
        <>
          Instead of trusting every write path to remember to send a delete, a daemon reads the
          database's own commit log directly and extracts the deletes from it. A write path that
          forgets to call the invalidation code still gets caught.
        </>
      ),
      duration: 5.2,
      fig: "a daemon reads the database's own commit log directly and extracts the deletes itself",
      takeaway: "Reading the database's own commit log catches an invalidation even a forgetful write path missed.",
      Visual: S.RevealCdcInvalidation,
    },
    {
      title: 'Reveal: per-field staleness, the TAO case study',
      body: (
        <>
          Not every field needs the same consistency. A real system marks most reads as tolerant
          of a little staleness, and marks the one field that cannot afford it — authentication,
          in this case study — as critical instead.
        </>
      ),
      duration: 4.8,
      fig: "not every field needs the same consistency — one real system marks a critical few differently",
      takeaway: 'How stale is acceptable is a per-field decision, not one global rule for the whole store.',
      Visual: S.RevealPerFieldStaleness,
    },
    {
      title: 'Recap',
      body: (
        <>
          Delete, not update, because deletes are idempotent. A lease closes the race update
          alone could not. A commit-log daemon never forgets to invalidate. And how stale is
          acceptable is decided field by field, not once for the whole store.
        </>
      ),
      duration: 5.2,
      fig: 'delete beats update, leases close the race, a commit-log daemon never forgets, and staleness tolerance is a per-field decision',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team adds a brand-new write path that updates the database directly but never calls
          the existing cache-invalidation code. Which of this topic's own fixes would have caught
          that automatically, and why?
        </>
      ),
      duration: 2.8,
      fig: 'a new write path never calls the cache-invalidation code — which fix catches this automatically?',
      predict: {
        options: [
          { label: 'Leases — they reject any stale write regardless of its source' },
          { label: "CDC-driven invalidation — it reads the database's own commit log, not application code", correct: true },
        ],
        explain: (
          <>
            CDC-driven invalidation. It never relies on the new write path remembering to call
            anything; it reads what the database itself already committed, so a forgotten call to
            an explicit delete function can't slip past it the way it would with any approach that
            depends on application code calling the right function.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
