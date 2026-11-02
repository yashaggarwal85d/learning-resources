import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy broker that really rejects a replayed
// sequence number, really accepts the same number on a different partition, and really fences a
// zombie session's write. No literal digits anywhere below (duration numbers are exempt); the
// real values are shown in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the same retry, with a rejection now in the way",
      body: (
        <>
          Replay the last topic's lost-ack retry with idempotence off: a real duplicate lands.
          Replay the identical scenario with it on: zero duplicates, the broker's rejection
          logged.
        </>
      ),
      duration: 4.8,
      fig: 'the same crash timeline from the last topic, with the rejection now intercepting the retry before it lands',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a stamp on the way out, a table on the way in',
      body: (
        <>
          Every batch a producer sends carries an identity and a session marker now, plus a
          counter. The broker keeps its own small table of what it last accepted from each one.
        </>
      ),
      duration: 4.8,
      fig: 'a producer stamping each batch with an id/epoch/sequence triple; a broker holding a last-seen table',
      Visual: S.Setup,
    },
    {
      title: 'Predict: can the broker spot an exact resend?',
      body: (
        <>
          The exact same batch, carrying the exact same counter value, arrives a second time.
          Does the broker have any way at all to recognize it as a repeat?
        </>
      ),
      duration: 2.8,
      fig: 'the exact same batch, same sequence number, arrives a second time — can the broker tell?',
      predict: {
        options: [
          { label: "No — a resend looks identical to a brand-new batch" },
          { label: 'Yes — the counter travels with the batch, and a repeat is easy to spot', correct: true },
          { label: 'Only if the producer flags it as a retry itself' },
        ],
        explain: (
          <>
            Yes. The counter rides along with every batch specifically so the broker can compare
            it against what it already accepted, with no extra signal from the producer needed.
          </>
        ),
      },
      Visual: S.PredictDuplicate,
    },
    {
      title: 'Reveal: anything but the very next number bounces off',
      body: (
        <>
          The broker only accepts a counter value exactly one higher than the last one it took.
          The resend carries an old value, so it's recognized and rejected on the spot.
        </>
      ),
      duration: 4.8,
      fig: "the broker rejects anything that isn't exactly one greater than what it last accepted",
      Visual: S.RevealDuplicate,
    },
    {
      title: 'Predict: does the same rule cross partitions?',
      body: (
        <>
          A producer sends the exact same counter value, but to a different partition entirely.
          Does the broker reject this one too, the way it rejected the resend?
        </>
      ),
      duration: 2.8,
      fig: 'the same sequence number, sent to a different partition — does the same rule reject it too?',
      predict: {
        options: [
          { label: 'Yes — the producer only gets one counter in total' },
          { label: "No — each partition keeps its own completely separate counter", correct: true },
          { label: 'It depends on which partition was written to first' },
        ],
        explain: (
          <>
            No. The counter is kept per producer, per partition. The same value on a different
            partition is a perfectly ordinary, independent first write, not a repeat of anything.
          </>
        ),
      },
      Visual: S.PredictCrossPartition,
    },
    {
      title: "Reveal: every partition's counter starts its own story",
      body: (
        <>
          Each partition tracks its own counter, completely independent of every other one. The
          same number showing up twice, in two different lanes, is simply two valid writes.
        </>
      ),
      duration: 4.8,
      fig: 'each partition keeps its own independent counter, so the same number elsewhere is a fresh, valid write',
      takeaway: 'This protection is scoped to one producer, one partition — the same counter value is never a duplicate anywhere else.',
      Visual: S.RevealCrossPartition,
    },
    {
      title: "Reveal: a restart fences out whatever got left behind",
      body: (
        <>
          A producer restarts and is issued a fresh session marker. A write still in flight under
          the old one is recognized as stale and fenced off, no matter what counter it carries.
        </>
      ),
      duration: 4.8,
      fig: 'a producer restarts, gets a new session id, and a late write from the old one is fenced off',
      takeaway: 'A restart issues a new session marker so a stray write from the old session is never mistaken for current.',
      Visual: S.RevealZombieFencing,
    },
    {
      title: 'Reveal: exactly this wide, and no wider',
      body: (
        <>
          This protection covers one producer, one session, one partition. It says nothing about
          two different producers writing the same logical record, and nothing survives a restart
          on its own.
        </>
      ),
      duration: 4.8,
      fig: "one producer session, one partition — nothing wider is covered without more work",
      takeaway: "Idempotence alone never spans two producers, two partitions, or two sessions — naming that boundary precisely is this topic's point.",
      Visual: S.RevealScope,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          producer/broker model, just now — the duplicate rejection, the cross-partition
          independence, and the fencing.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          An identity marks who's writing, a session marker marks which attempt, and a per-lane
          counter catches an exact repeat. Scoped to one producer, one session, one partition.
        </>
      ),
      duration: 4.8,
      fig: "an id, a session marker, and a per-lane counter — exactly scoped, nothing wider assumed",
      Visual: S.Recap,
    },
  ],
};

export default reel;
