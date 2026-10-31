import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Storage tiers, their real costs, and the one ordering mistake that corrupts a table. Every
// number is executed and checked by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'A rule saves money and breaks a table nobody touched',
      body: (
        <>
          A lifecycle rule deletes files older than ninety days to save money. It runs exactly as configured. A time-travel query that worked
          yesterday now errors, with no warning at the moment the file was deleted.
        </>
      ),
      duration: 4,
      Visual: S.LifecycleHook,
    },
    {
      title: 'What is the rule blind to?',
      body: (
        <>
          The rule and the table were both working exactly as configured. What did the rule never know about, that caused this?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "The file's storage tier" },
          { label: 'Whether a live snapshot still points at the file', correct: true },
          { label: "The file's size" },
          { label: "The bucket's versioning setting" },
        ],
        explain: (
          <>
            Whether a live snapshot still points at the file. A lifecycle rule only ever knows an object's age, its tags and its prefix — nothing
            about a table format's own metadata. A snapshot kept for time travel or rollback is invisible to it. The fix is ordering: expire the
            snapshot first, so the table itself releases the file, before any age-based rule is allowed to delete it.
          </>
        ),
      },
      Visual: S.WhatIsItBlindTo,
    },
    {
      title: 'Hot, infrequent, archive: the same three tiers, three vendors',
      body: (
        <>
          Three clouds, the same shape under different names: a hot tier for active data, an infrequent tier with a real minimum stay, an archive
          tier with a longer one. Each tier states exactly how many days you're committed to before leaving is free.
        </>
      ),
      duration: 5,
      Visual: S.ThreeCloudsThreeTiers,
    },
    {
      title: 'Cheaper to store, slower and costlier to read back',
      body: (
        <>
          An archive tier is not just cheap storage. It is a bet that you will not need the file back soon. Ask for it back anyway, and you pay a
          retrieval fee and a real wait measured in hours, not seconds.
        </>
      ),
      duration: 4.6,
      Visual: S.RetrievalLadder,
      takeaway: 'An archive tier is cheaper to store and slower and costlier to read back, the same trade on every cloud.',
    },
    {
      title: "Automated tiering moves the data; it doesn't make the decision free",
      body: (
        <>
          Intelligent-Tiering style automation watches how often an object is actually read and moves it down through the tiers as it goes quiet,
          removing the need to predict an access pattern yourself. That automation itself carries its own per-object monitoring fee.
        </>
      ),
      duration: 4.4,
      Visual: S.AutomatedTiering,
      takeaway: 'Automated tiering removes guessing an access pattern, but its own monitoring fee is a real cost, not a free upgrade.',
    },
    {
      title: 'The ordering fix, reproduced',
      body: (
        <>
          Run the hook's own scenario twice, on a local stand-in. Delete-before-expire corrupts the table every time. Expire the snapshot first,
          so nothing still points at the file, and the exact same delete is harmless.
        </>
      ),
      duration: 4.8,
      Visual: S.OrderingFix,
      takeaway: 'Expire the snapshot before any age-based rule can delete its files — never the other way around.',
    },
    {
      title: "Object Lock trades flexibility for a guarantee you can't take back",
      body: (
        <>
          Governance mode blocks most users, with one permission that can still override it. Compliance mode blocks everyone, including the
          account's own root user, until the retention date — the only way around it early is deleting the whole account.
        </>
      ),
      duration: 4.6,
      Visual: S.ObjectLockModes,
      takeaway: "Compliance-mode Object Lock can't be undone short of deleting the whole account — rehearse it in governance mode first.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          The same hot, infrequent, archive shape on every cloud, each with its own minimum stay. Cheaper to store means slower and costlier to
          read back. Automated tiering isn't free monitoring. Expire the snapshot before the rule runs. Next: who is even allowed to touch any of
          this.
        </>
      ),
      duration: 3.4,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table's snapshot-expiry job runs nightly at two in the morning. A bucket's lifecycle rule runs at one in the morning and deletes any
          file older than ninety days. Does this ordering risk the same corruption as the hook?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No — the lifecycle rule only deletes old files, which are safe to remove' },
          { label: "Yes — the rule can delete a file before that night's expiry has released it", correct: true },
        ],
        explain: (
          <>
            Yes. The lifecycle rule runs before the snapshot-expiry job that night, so any file old enough to be swept is deleted while a snapshot
            from the previous day may still reference it. The rule being scheduled nightly changes nothing about its blindness — only running
            expiry first, every time, closes the gap.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
