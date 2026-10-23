import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Consistent hashing answered where a piece of data lives. It said nothing about whether two
// copies of it actually agree. Merkle trees prove they do, without comparing either one whole.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Consistent hashing answers where a piece of data lives. It says nothing about whether two copies of it actually agree. This topic proves they do, without comparing either one whole.',
      body: (
        <>
          Last topic was about location &mdash; where a key lives, and how little moves when machines come and go.
          This one asks a completely different question: do two copies of the same data actually agree?
        </>
      ),
      duration: 3.8,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Hash each piece of data, then hash the hashes, two at a time, all the way up. One number at the top speaks for everything underneath it.',
      body: (
        <>
          Same hashing idea as this whole chapter &mdash; just used to combine many hashes into one. Every leaf's
          hash rises into its parent's, up to a single root hash at the top.
        </>
      ),
      duration: 3.8,
      fig: 'TreeBuilt',
      Visual: S.TreeBuilt,
    },
    {
      title: 'Two trees, two root hashes — they match. What does that actually tell you?',
      body: <>Two complete trees, built independently. Their root hashes match. What does that actually guarantee?</>,
      duration: 2,
      fig: 'RootMatchPredict',
      predict: {
        options: [
          { label: "Probably agree — but you'd still want to spot-check a few leaves" },
          { label: 'Every single leaf underneath is identical, guaranteed', correct: true },
          { label: 'Only the top level of the tree agrees' },
          { label: 'Nothing — root hashes can match by coincidence too often to trust' },
        ],
        explain: (
          <>
            A root hash is built from every leaf beneath it. If any leaf anywhere had differed, that difference would
            have propagated all the way up and changed the root. One comparison is as strong as comparing every leaf.
          </>
        ),
      },
      Visual: S.RootMatchPredict,
    },
    {
      title: "A mismatched root tells you the two copies disagree somewhere — but not yet where.",
      body: (
        <>
          Flip it around: the roots now disagree. That one comparison just told you, for certain, that something
          underneath is different. Finding exactly what is the next problem.
        </>
      ),
      duration: 3.6,
      fig: 'RootMismatch',
      takeaway: 'A matching root hash guarantees every leaf beneath it matches too — one comparison, not n.',
      Visual: S.RootMismatch,
    },
    {
      title: 'One leaf out of many changed. How many hashes do you have to check to find which one?',
      body: <>Somewhere in this tree, exactly one leaf changed. How many hashes do you actually have to check to find it?</>,
      duration: 2,
      fig: 'WalkDownPredict',
      predict: {
        options: [
          { label: "Every leaf — there's no way around checking them all" },
          { label: 'Half the leaves, on average' },
          { label: 'Only the one path from the root down to the differing leaf — about log n hashes', correct: true },
          { label: 'Just the one leaf itself, nothing else' },
        ],
        explain: (
          <>
            At each level, only one of the two children's hashes can disagree with what you expect, so you only ever
            follow one branch down. A tree of n leaves has about log n levels, so the walk costs about log n hashes.
          </>
        ),
      },
      Visual: S.WalkDownPredict,
    },
    {
      title: 'At each level, only one child can be wrong. Follow that branch down, and you reach the exact leaf in about log n steps.',
      body: (
        <>
          Exactly the same binary halving every divide-and-conquer idea in this curriculum relies on. Follow the one
          branch that disagrees, level by level, and the search space halves every single step.
        </>
      ),
      duration: 3.8,
      fig: 'ProofPath',
      takeaway: 'Walking from a root mismatch down to the one differing leaf costs about log n comparisons, not n.',
      Visual: S.ProofPath,
    },
    {
      title: 'A real database repair process, a version-control system, and a public certificate log all run on exactly this tree.',
      body: (
        <>
          This isn't theoretical. A real database's repair process, a version-control system's entire history, and a
          public certificate log all run on exactly this idea, verified against each system's own source.
        </>
      ),
      duration: 3.8,
      fig: 'ProductionUses',
      Visual: S.ProductionUses,
    },
    {
      title: "Split data into fixed-size pieces, and one early edit shifts every boundary after it. Split it where the data's own content says to, and only one boundary moves.",
      body: (
        <>
          The tree's whole promise is cheap verification. That promise breaks if editing one byte invalidates every
          chunk hash after it. Setting chunk boundaries from the data's own content, instead of a fixed byte count,
          fixes exactly that.
        </>
      ),
      duration: 3.8,
      fig: 'ContentDefinedChunking',
      takeaway: 'Content-defined chunking lets one small edit reshape only the chunks near it — fixed-offset chunking reshapes every chunk after it.',
      Visual: S.ContentDefinedChunking,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: finding one changed leaf costs about log n comparisons, not n, and one small edit
          reshapes far fewer chunks under content-defined chunking than under fixed-offset chunking.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
