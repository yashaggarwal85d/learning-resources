import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every structure before this topic compared whole keys, or whole values, to each other. A
// trie compares one character at a time instead. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Every structure this course has built so far — hash tables, balanced trees, heaps, loser trees — answers 'which key, right now' by comparing whole keys, or whole values, against each other. A trie asks a different question: given a string, where does it live, found out one character at a time?",
      body: (
        <>
          Not comparing keys to each other anymore — walking the string's own characters
          instead.
        </>
      ),
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A trie stores characters in its nodes, not keys: each node has one child per possible next character, and walking from the root one character at a time either finds the string or proves it isn't there.",
      body: <>The node for "ca" is shared by every word that starts "ca" — "cat", "car", "care" all walk through it.</>,
      duration: 4,
      fig: 'TrieReveal',
      Visual: S.TrieReveal,
    },
    {
      title: 'A trie lookup walks one character at a time, stopping at the key’s own length. Does that cost depend on how many other keys are stored in the trie?',
      body: <>Does a trie lookup's cost depend on how many other keys share the trie?</>,
      duration: 2,
      fig: 'CostPredict',
      predict: {
        options: [
          { label: 'Yes — more stored keys means more nodes to search through' },
          { label: "No — the cost depends only on the key's own length", correct: true },
          { label: 'Yes, but only logarithmically, the same as a balanced tree' },
          { label: 'It depends on the alphabet size, not the key or the dictionary' },
        ],
        explain: (
          <>
            Each step consumes one character and moves to exactly one child — that cost
            never references how many other keys share the trie.
          </>
        ),
      },
      Visual: S.CostPredict,
    },
    {
      title: "Every chapter before this one paid a cost that grew with n — the number of keys stored. A trie lookup pays for exactly the key's own length, L, and nothing else: each step consumes one character and moves to exactly one child.",
      body: <>Add a million more words to the dictionary. This lookup's cost doesn't move.</>,
      duration: 4,
      fig: 'CostReveal',
      takeaway: 'A trie lookup costs exactly the key’s own length — adding more stored keys never changes it.',
      Visual: S.CostReveal,
    },
    {
      title: 'The most direct way to store a node’s children is a fixed-size array, one slot per possible character. For a sparse dictionary over a 26-letter alphabet, what happens to most of those slots?',
      body: <>What happens to most of a node's own 26 child slots, on a sparse dictionary?</>,
      duration: 2,
      fig: 'ArrayPredict',
      predict: {
        options: [
          { label: 'Most stay empty — one node rarely has anywhere near 26 real children', correct: true },
          { label: 'Most fill up, because every letter eventually appears somewhere' },
          { label: 'Exactly half stay empty, on average, for any alphabet' },
          { label: "None stay empty — a trie only allocates a slot when it's used" },
        ],
        explain: (
          <>
            An array allocates every slot up front, used or not — that's the trade it makes
            for a single indexed lookup.
          </>
        ),
      },
      Visual: S.ArrayPredict,
    },
    {
      title: 'Array children: one slot per possible character, found in one step with no comparison at all — and, measured on this exact 21-word dictionary, 96.3 percent of those slots sit empty.',
      body: <>Fast to the point of free. The cost shows up somewhere else: memory allocated but never used.</>,
      duration: 4.5,
      fig: 'ArrayReveal',
      Visual: S.ArrayReveal,
    },
    {
      title: 'Three other ways to store the same children, each trading the array’s free lookup step for something smaller: a hash table keyed by character, a sorted list of children searched by binary search, or a ternary search tree — a tiny three-child structure built around comparing one character at a time.',
      body: <>Same shared-prefix tree underneath. Only the per-node storage changes.</>,
      duration: 4.5,
      fig: 'AlternativesReveal',
      takeaway: 'Array, hash, sorted-list and ternary-search-tree children answer the same question — they just store a node’s children differently.',
      Visual: S.AlternativesReveal,
    },
    {
      title: 'A ternary search tree still walks one character at a time, like the array — it just uses two extra comparisons per node instead of a direct slot. Can it beat the array’s own memory without losing that one-character-per-step discipline?',
      body: <>Can a smaller representation keep the array's own one-step-per-character discipline?</>,
      duration: 2,
      fig: 'TSTPredict',
      predict: {
        options: [
          { label: 'No — saving memory always costs at least one extra traversal step per character' },
          { label: 'Yes — comparing against one stored character needs far less memory per node', correct: true },
          { label: 'No — three child pointers always cost more than one array' },
          { label: 'Yes, but only by giving up the O(key length) bound entirely' },
        ],
        explain: (
          <>
            Comparing against one stored character, not indexing into 26 slots, needs far
            less memory per node.
          </>
        ),
      },
      Visual: S.TSTPredict,
    },
    {
      title: 'A ternary search tree node holds exactly one character, a value, and three children: lo and hi compare against the same character position, equal advances to the next one — the array’s own one-step-per-character discipline, kept, with three references instead of 26 slots.',
      body: <>Measured on the identical dictionary, the ternary search tree used the least memory of all four.</>,
      duration: 4.5,
      fig: 'TSTReveal',
      takeaway: 'A ternary search tree keeps the trie’s own one-character-per-step cost with three child references per node, not R.',
      Visual: S.TSTReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: real bytes per representation, on the identical dictionary
          — array, hash, sorted-list, and ternary search tree — and the real fraction of an
          array node's own slots that go unused.
        </>
      ),
      duration: 4.5,
      fig: 'ProveIt',
      takeaway: 'The array representation measured the most memory of all four — the gap later trie variants exist to close.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
