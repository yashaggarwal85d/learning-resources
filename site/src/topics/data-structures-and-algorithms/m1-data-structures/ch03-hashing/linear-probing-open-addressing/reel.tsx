import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Chaining pays a pointer per entry. Open addressing gives that pointer up, at the cost of a
// probe sequence when two keys compete for a slot. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Chaining pays a pointer per entry. Open addressing gives that up — every entry lives in the table itself.',
      body: (
        <>
          Last topic&rsquo;s one real cost was a pointer per entry. This topic&rsquo;s whole mechanism exists to avoid paying it &mdash;
          every entry lives directly in the table.
        </>
      ),
      duration: 3.2,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Given an ordinary hash function, linear probing uses the next slot',
      body: (
        <>
          Linear probing&rsquo;s own rule: h(k,i) = (h&rsquo;(k) + i) mod m. When a slot is full, try the next one, then the next,
          until an empty slot stops the search.
        </>
      ),
      duration: 3,
      fig: 'ProbeMechanism',
      Visual: S.ProbeMechanism,
    },
    {
      title: 'After a few collisions, where does the next colliding key end up?',
      body: <>Two short runs have already formed. Where does the next colliding key probably land?</>,
      duration: 2,
      fig: 'ClusterPredict',
      predict: {
        options: [
          { label: "It lands in whichever run is shorter, since that's faster to search" },
          { label: 'It very likely lands at the end of one of the runs, making that run longer', correct: true },
          { label: "It's equally likely to land anywhere in the empty slots, regardless of the runs" },
          { label: 'It always starts a new run of its own, one slot away from both existing ones' },
        ],
        explain: (
          <>
            Any key whose probe sequence enters a run has to walk to its far end before finding an empty slot &mdash; so a collision
            with a run almost always extends it. Longer runs then catch even more of the next collisions.
          </>
        ),
      },
      Visual: S.ClusterPredictViz,
    },
    {
      title: "Linear probing's own collisions make its runs longer, and longer runs catch even more of the next collisions.",
      body: (
        <>
          This is primary clustering, in the lecture&rsquo;s own words: &ldquo;long runs of occupied slots build up&hellip; the long
          runs of occupied slots tend to get longer.&rdquo; The mechanism that made linear probing simple is the same one that
          slows it down.
        </>
      ),
      duration: 3.8,
      fig: 'ClusteringReveal',
      takeaway: "Linear probing's own collisions make its runs longer, which then catch even more collisions.",
      Visual: S.ClusteringReveal,
    },
    {
      title: 'Two real fixes: quadratic probing scatters instead of extending a run; double hashing diverges immediately.',
      body: (
        <>
          Quadratic probing steps by 1, 4, 9&hellip; scattering a collision&rsquo;s overflow instead of extending a run. Double
          hashing goes further: a second hash function sets the step itself, so two keys that collide don&rsquo;t even follow the
          same path after that.
        </>
      ),
      duration: 3.6,
      fig: 'TwoFixes',
      Visual: S.TwoFixes,
    },
    {
      title: "Quadratic probing's guarantee needs a prime table size and α under one half — and it still clusters by starting slot.",
      body: (
        <>
          The guarantee has fine print: with a prime table size and load factor under one half, the first m/2 probes are
          guaranteed distinct. And two keys that start probing at the same slot still follow the identical sequence after that
          &mdash; secondary clustering.
        </>
      ),
      duration: 3.6,
      fig: 'QuadraticCaveat',
      takeaway: "Quadratic probing's guarantee needs a prime table size and α under one half — and still clusters by starting slot.",
      Visual: S.QuadraticCaveat,
    },
    {
      title: 'When you delete an entry, can you just empty its slot?',
      body: <>When you delete an entry from this run, can you just empty its slot and move on?</>,
      duration: 2,
      fig: 'DeletionPredict',
      predict: {
        options: [
          { label: 'Yes — an empty slot is always safe to leave behind' },
          { label: 'No — a later search could stop at that empty slot and miss entries beyond it', correct: true },
          { label: 'Only if the table is more than half empty' },
          { label: 'Only under double hashing, not plain linear probing' },
        ],
        explain: (
          <>
            A search for a key placed beyond the deleted slot walks the same probe sequence &mdash; and stops the instant it sees an
            empty slot, long before reaching that key. Emptying the slot silently breaks every search that used to pass through it.
          </>
        ),
      },
      Visual: S.DeletionPredictViz,
    },
    {
      title: 'A tombstone keeps a slot occupied forever; rehashing the cluster costs a scan now instead.',
      body: (
        <>
          Two real answers. A tombstone marks &ldquo;no data here, but don&rsquo;t stop probing.&rdquo; A real production table
          instead rehashes every later entry in the same run, right away, freeing the slot immediately.
        </>
      ),
      duration: 4,
      fig: 'DeletionTwoWays',
      takeaway: 'A tombstone keeps a slot occupied forever; rehashing the cluster costs a scan now instead.',
      Visual: S.DeletionTwoWays,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Three load factors, two real probing strategies, one real measurement each time: linear probing&rsquo;s average probe
          count climbs fastest as the table fills, while double hashing stays closer to the uniform-hashing bound at every one.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
