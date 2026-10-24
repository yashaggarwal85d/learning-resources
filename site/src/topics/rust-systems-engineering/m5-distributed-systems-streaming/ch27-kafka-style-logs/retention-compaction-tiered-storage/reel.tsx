import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Time/size retention deletes by age alone; compaction keeps the latest
// value per key forever instead, until a real tombstone genuinely removes
// that key for good.
const reel: Reel = {
  steps: [
    {
      title: "One key's own only entry is already old; another key has several recent updates. Time-based retention runs over the whole log. Does it genuinely delete the old entry, even though it is that key's own latest?",
      body: (
        <>
          An old entry, a recent entry, a retention cutoff.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, a key's own latest entry is always kept" },
          { label: 'Yes, genuinely; retention never checks whether an entry is a key\'s own latest', correct: true },
          { label: 'Only if the key has no other entries at all' },
        ],
        explain: (
          <>
            Yes. Retention never looks at a key at all.
          </>
        ),
      },
      Visual: S.RetentionPredict,
    },
    {
      title: "Measured: retention genuinely deleted the old entry, even though it was that key's own only, latest value",
      body: (
        <>
          The real, measured deletion, by age alone.
        </>
      ),
      duration: 3.0,
      Visual: S.RetentionReveal,
    },
    {
      title: 'Now run compaction over the identical log instead. Does the old entry survive this time, just because it is still that key\'s own latest value?',
      body: (
        <>
          The identical log, compaction instead of retention.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, compaction deletes by age too' },
          { label: "Yes, genuinely; compaction keeps a key's own latest value forever", correct: true },
          { label: 'Only if the entry is newer than some fixed age' },
        ],
        explain: (
          <>
            Yes, genuinely. Compaction never checks age at all.
          </>
        ),
      },
      Visual: S.CompactionPredict,
    },
    {
      title: "Measured: compaction genuinely kept the old entry, because it is still that key's own latest value, with no age check at all",
      body: (
        <>
          The real, measured survival, on the identical log.
        </>
      ),
      duration: 3.0,
      takeaway: "Compaction has no age check at all; it only ever asks whether a value is still a key's own latest.",
      Visual: S.CompactionReveal,
    },
    {
      title: 'A real tombstone, a message with the same key and no value, is appended after all the others. Compaction runs past it. Does the key genuinely disappear entirely?',
      body: (
        <>
          A tombstone, appended after every real entry.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, the key's last real value is kept instead" },
          { label: 'Yes, genuinely; the key is genuinely removed entirely', correct: true },
          { label: "Only after a human confirms the delete" },
        ],
        explain: (
          <>
            Yes, genuinely. The tombstone removes the key itself.
          </>
        ),
      },
      Visual: S.TombstonePredict,
    },
    {
      title: 'Measured: the tombstone genuinely removed the key entirely, once compaction ran past it, with every other key genuinely untouched',
      body: (
        <>
          The real, measured removal, with no other key touched.
        </>
      ),
      duration: 3.0,
      takeaway: 'A tombstone removes the key itself from the log, not merely its most recent value.',
      Visual: S.TombstoneReveal,
    },
    {
      title: "Confluent's own documentation and the Kafka project's own design document both state this exact mechanism directly: compaction keeps at least the last state for each key, and a null-payload message is treated as a real delete. Does this topic's own code measure exactly that rule?",
      body: (
        <>
          Both sources' own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DocsReveal,
    },
    {
      title: 'Measured: time/size retention, keep-the-latest compaction, and the tombstone\'s own removal are all genuinely one coherent set of outcomes, from the identical log',
      body: (
        <>
          All three real, measured results, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: 'Retention, compaction, and a tombstone are three genuinely different answers to how long data lasts.',
      Visual: S.CoherenceReveal,
    },
    {
      title: "This chapter measured a partitioned, product-facing log's own order, delivery, and retention rules, end to end. Does a real tombstone's own removal close the loop on everything this chapter set out to measure?",
      body: (
        <>
          The chapter's own three topics, named directly.
        </>
      ),
      duration: 2.8,
      Visual: S.ChapterArcReveal,
    },
    {
      title: 'Recap: a real log, retention, and compaction',
      body: (
        <>
          Time/size retention deletes by age alone; compaction keeps the latest value per key forever instead, until a real tombstone genuinely removes that key for good.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
