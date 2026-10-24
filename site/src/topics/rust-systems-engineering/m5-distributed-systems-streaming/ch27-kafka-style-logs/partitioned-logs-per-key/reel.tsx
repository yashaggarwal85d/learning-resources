import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A key's own write order is only genuinely guaranteed within one partition;
// key-based routing holds that order only as long as the partition count
// itself never changes.
const reel: Reel = {
  steps: [
    {
      title: "A topic's writes, for many different keys, go through one real partitioning function, hash of the key modulo the partition count. Does every write to the same key genuinely always land in the same partition?",
      body: (
        <>
          Several keys, several partitions, a routing arrow.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely, as long as the count stays fixed', correct: true },
          { label: 'Only if the writes arrive close together in time' },
          { label: 'No, only a human-assigned key ever stays put' },
        ],
        explain: (
          <>
            Yes. The identical key hashes to the identical partition.
          </>
        ),
      },
      Visual: S.RoutePredict,
    },
    {
      title: 'Measured: every one of many writes to the same key genuinely landed in the identical partition, in the identical order it was written',
      body: (
        <>
          The real, measured routing, held across many writes.
        </>
      ),
      duration: 3.0,
      Visual: S.RouteReveal,
    },
    {
      title: "Now the operator grows the topic's own partition count. Does every existing key's own routing genuinely stay put?",
      body: (
        <>
          The same keys, a smaller partition count growing larger.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the function keeps working' },
          { label: "No, at least one key's own routing genuinely changes", correct: true },
          { label: 'Only the newest key changes' },
        ],
        explain: (
          <>
            No. At least one existing key genuinely reroutes.
          </>
        ),
      },
      Visual: S.ResizePredict,
    },
    {
      title: 'Measured: changing the partition count genuinely rerouted at least one existing key to a different partition',
      body: (
        <>
          The real, measured reroute, on a key that was already there.
        </>
      ),
      duration: 3.0,
      takeaway: 'Growing a partition count is never free; it can reroute a key that already exists.',
      Visual: S.ResizeReveal,
    },
    {
      title: 'That rerouted key keeps writing after the resize. Does its own history now genuinely live in one partition, or does it genuinely split?',
      body: (
        <>
          The rerouted key's old entries, and its new entries.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It all catches up into the new partition eventually' },
          { label: 'It genuinely splits across the old and the new partition, forever', correct: true },
          { label: 'The log genuinely merges the two partitions for that key' },
        ],
        explain: (
          <>
            It genuinely splits, and stays split.
          </>
        ),
      },
      Visual: S.SplitPredict,
    },
    {
      title: "Measured: the rerouted key's own history genuinely split across the old and the new partition; the order guarantee it had is genuinely gone",
      body: (
        <>
          The real, measured split, old entries and new entries apart.
        </>
      ),
      duration: 3.0,
      takeaway: "A rerouted key's own order guarantee is genuinely gone once its history splits.",
      Visual: S.SplitReveal,
    },
    {
      title: "Confluent's own documentation states this exact mechanism directly: events with the same key are written to the same partition, and a consumer of a given partition always reads it in exactly the order it was written. Does this topic's own code measure exactly that rule?",
      body: (
        <>
          The documentation's own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.ConfluentReveal,
    },
    {
      title: "The Kafka project's own design document describes the message log itself as just a directory of real files on disk, recopied in whole segments whenever the log cleaner compacts it. Does this topic's own partition-per-vector model mirror that same real, append-only shape?",
      body: (
        <>
          The design document's own words on this exact shape, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DesignDocReveal,
    },
    {
      title: 'Measured: fixed-count order, count-change rerouting, and the resulting split history are all genuinely one coherent set of outcomes, from one real routing function',
      body: (
        <>
          All three real, measured results, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: 'One plain hash-and-modulo function is the entire real routing rule behind all three outcomes.',
      Visual: S.CoherenceReveal,
    },
    {
      title: 'Recap: one real partitioning function, checked against a real resize',
      body: (
        <>
          A key's own write order is only genuinely guaranteed within one partition; key-based routing holds that order only as long as the partition count itself never changes.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
