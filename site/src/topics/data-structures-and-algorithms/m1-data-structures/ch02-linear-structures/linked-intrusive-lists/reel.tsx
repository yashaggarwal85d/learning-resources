import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A dynamic array wins by contiguity; a linked list gives that up on purpose. This topic shows
// what it buys back (O(1) splice, stable addresses, the intrusive design) against the one real,
// measured cost of giving contiguity up (Drepper's sequential-vs-random pointer-chasing numbers),
// then the Linux kernel's own list_head and container_of as the real mechanism. Every number is
// in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'What do you get back?',
      body: (
        <>
          A dynamic array wins by being contiguous: one allocation, one cache line serves several elements. A linked list gives that up on
          purpose. What does it buy back?
        </>
      ),
      duration: 3.2,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Append without a tail pointer',
      body: <>A singly linked list keeps only a head pointer. Appending one more record at the end costs what?</>,
      duration: 1.8,
      fig: 'SinglyAppend',
      takeaway: "A singly linked list is fast at its head and slow everywhere else you haven't kept a pointer to.",
      predict: {
        options: [
          { label: 'Walk every node to find the end: O(n)', correct: true },
          { label: 'O(1), like an array with spare capacity' },
          { label: "O(log n), like a doubling array's resize" },
          { label: 'Impossible without a tail pointer' },
        ],
        explain: (
          <>
            Without a stored tail pointer, appending means walking every node from the head to find the last one, then attaching the new node:
            O(n). A singly linked list&rsquo;s only built-in fast end is the head.
          </>
        ),
      },
      Visual: S.SinglyAppendPredict,
    },
    {
      title: 'Doubly: O(1) remove given a node',
      body: (
        <>
          Add a second, backward pointer and removing a node you already have a pointer to costs nothing but re-pointing its two neighbours:
          O(1), no walk required. Finding that node in the first place is unchanged.
        </>
      ),
      duration: 3.6,
      fig: 'DoublyRemove',
      Visual: S.DoublyRemove,
    },
    {
      title: 'Circular: no null at the ends',
      body: (
        <>
          Close the list into a ring with a sentinel node and no pointer anywhere is ever null, so insert and remove use the same code path at
          the ends as in the middle &mdash; the design the Linux kernel&rsquo;s own list uses.
        </>
      ),
      duration: 3.4,
      fig: 'Circular',
      Visual: S.Circular,
    },
    {
      title: 'Same records, scattered in memory',
      body: (
        <>
          The same records as list nodes, once laid out in the order you&rsquo;ll walk them, once scattered to defeat it &mdash; the list
          itself doesn&rsquo;t control which. The allocator does.
        </>
      ),
      duration: 3,
      fig: 'Scatter',
      Visual: S.Scatter,
    },
    {
      title: 'Is walking a list always slower than an array?',
      body: <>Pointers instead of indices. Does that always cost more to traverse?</>,
      duration: 1.8,
      fig: 'ChasePredict',
      takeaway: "Pointer chasing doesn't lose because it uses pointers — it loses when node order and memory order disagree.",
      predict: {
        options: [
          { label: 'Yes, pointers are always slower than indices' },
          { label: 'Only when traversal order and allocation order disagree', correct: true },
          { label: 'No, modern CPUs make them equal' },
          { label: 'Only for lists longer than the cache' },
        ],
        explain: (
          <>
            When a list&rsquo;s nodes sit in memory in the order you walk them, the hardware prefetcher follows the next pointer almost as
            cheaply as it follows an array index. When they don&rsquo;t, every step is an unpredictable jump the prefetcher can&rsquo;t
            anticipate.
          </>
        ),
      },
      Visual: S.ChasePredictViz,
    },
    {
      title: 'Nine cycles versus four hundred fifty',
      body: (
        <>
          On one real benchmark: a list walked in memory order cost about nine cycles per element beyond the cache; the same list shuffled cost
          about four hundred fifty and climbing &mdash; roughly a fiftyfold gap, from allocation order alone.
        </>
      ),
      duration: 4,
      fig: 'ChaseMeasured',
      Visual: S.ChaseMeasured,
    },
    {
      title: "O(1) splice versus an array's shift",
      body: (
        <>
          Cut a run of nodes out of one list and into another: four pointer rewrites, no matter how long the run is. The same move in an array
          shifts every element from the splice point to the end.
        </>
      ),
      duration: 3.8,
      fig: 'Splice',
      takeaway: 'Splicing a run out of a linked list costs a constant number of pointer rewrites, whatever the run\'s length.',
      Visual: S.Splice,
    },
    {
      title: 'An address that never moves',
      body: (
        <>
          A long-lived pointer into a list node survives every insert and remove elsewhere in the list &mdash; unlike the vector pointer the
          last topic watched die the instant a push_back reallocated.
        </>
      ),
      duration: 3.4,
      fig: 'StableAddress',
      Visual: S.StableAddress,
    },
    {
      title: 'The intrusive idea',
      body: (
        <>
          The Linux kernel&rsquo;s list_head is just two pointers, no payload field at all, embedded directly inside the struct it links &mdash;
          one allocation instead of two, and the same struct can join a second list through a second embedded list_head.
        </>
      ),
      duration: 4,
      fig: 'Intrusive',
      Visual: S.Intrusive,
    },
    {
      title: 'Recovering the struct from the link field',
      body: (
        <>
          container_of casts a pointer to an embedded list_head back out to the struct that contains it, by subtracting that field&rsquo;s
          fixed, compile-time offset &mdash; the mechanism list_entry and list_first_entry are built on.
        </>
      ),
      duration: 4,
      fig: 'ContainerOf',
      takeaway: "container_of recovers a struct's address from a member pointer by subtracting that member's fixed, compile-time offset.",
      Visual: S.ContainerOf,
    },
    {
      title: 'Does container_of check the type?',
      body: <>Pass the wrong struct type into container_of by mistake. Does anything catch it?</>,
      duration: 1.8,
      fig: 'ContainerOfPredict',
      predict: {
        options: [
          { label: "No, it's a macro, it can't check anything" },
          { label: 'Yes — the current macro asserts the pointer and member types match', correct: true },
          { label: 'Only in debug builds' },
          { label: 'Only for list_head specifically' },
        ],
        explain: (
          <>
            The current container_of macro runs a compile-time check that the pointer&rsquo;s type matches the named member&rsquo;s type, and
            reports a mismatch as a compile error, not a silent bad cast.
          </>
        ),
      },
      Visual: S.ContainerOfPredictViz,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          O(1) splice, addresses that never move, and a design &mdash; intrusive linking &mdash; an array literally can&rsquo;t express: three
          things bought back, against one real, measured cost of giving up contiguity.
        </>
      ),
      duration: 4,
      fig: 'Verdict',
      Visual: S.Verdict,
    },
    {
      title: 'Prove it, 1 of 2',
      body: (
        <>
          Splicing a run of nodes out of a 10,000-node list costs exactly 4 pointer rewrites, whether the run is 1 node or 5,000. The array
          equivalent moves thousands of elements every time.
        </>
      ),
      duration: 3.8,
      fig: 'ProveIt1',
      Visual: S.ProveIt1,
    },
    {
      title: 'Prove it, 2 of 2',
      body: (
        <>
          A real C struct, built with ctypes: subtracting the embedded link field&rsquo;s real, compiler-computed offset from its address
          recovers the struct&rsquo;s own address exactly &mdash; container_of, working for real.
        </>
      ),
      duration: 4,
      fig: 'ProveIt2',
      Visual: S.ProveIt2,
    },
  ],
};

export default reel;
