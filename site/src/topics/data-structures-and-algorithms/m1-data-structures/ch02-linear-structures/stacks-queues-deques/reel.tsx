import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: arrays and lists hold a sequence; stacks, queues and deques say which end you may
// touch. The deque's two real implementations (ring buffer, chunked blocks) trade resize behaviour
// for iterator stability in opposite ways. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Which end may you touch?',
      body: (
        <>
          An array or a list holds a sequence but says nothing about which end you may touch. Stacks, queues and deques are that rule made
          concrete.
        </>
      ),
      duration: 3,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'LIFO: last in, first out',
      body: <>A stack: push and pop at the same end only. An undo history is one real use — the most recent action is always undone first.</>,
      duration: 3,
      fig: 'Stack',
      Visual: S.Stack,
    },
    {
      title: 'FIFO: first in, first out',
      body: <>A queue: enqueue at one end, dequeue at the other. A task queue is one real use — the oldest waiting task runs first.</>,
      duration: 3,
      fig: 'Queue',
      Visual: S.Queue,
    },
    {
      title: 'Does a deque need two separate structures?',
      body: <>A structure that supports push and pop at both ends. Does that take two glued-together structures, or one?</>,
      duration: 1.8,
      fig: 'DequePredict',
      takeaway: 'A deque is one structure with O(1) push and pop at both ends, not two simpler ones composed.',
      predict: {
        options: [
          { label: 'Two linked stacks glued together' },
          { label: 'One structure, O(1) at both ends', correct: true },
          { label: 'A queue with a reversed second copy' },
          { label: "It can't be done with one structure" },
        ],
        explain: (
          <>
            One structure, with push, pop and peek at both ends, each O(1) directly &mdash; not a composition of two simpler structures glued
            together.
          </>
        ),
      },
      Visual: S.DequePredictViz,
    },
    {
      title: 'The deque: both ends, O(1)',
      body: <>Both ends lit at once. A stack or a queue is a deque used with one hand tied behind its back.</>,
      duration: 3,
      fig: 'Deque',
      Visual: S.Deque,
    },
    {
      title: 'Two real designs, two trade-offs',
      body: (
        <>
          An array-backed circular buffer (the next topic builds it) resizes exactly like a vector. A chunked block deque &mdash; std::deque
          &mdash; grows by allocating a new block, moving nothing already there.
        </>
      ),
      duration: 4,
      fig: 'TwoDesigns',
      takeaway: 'A ring buffer resizes like a vector; a chunked deque grows by adding a block, moving nothing already there.',
      Visual: S.TwoDesigns,
    },
    {
      title: "Does pushing onto a deque's front move anything?",
      body: <>Call push_front on a std::deque. What happens to existing iterators and references into it?</>,
      duration: 1.8,
      fig: 'InvalidatePredict',
      takeaway: "A deque's own ends invalidate iterators but not references — the opposite split from a vector's reallocation.",
      predict: {
        options: [
          { label: 'Both stay valid' },
          { label: 'Both become invalid' },
          { label: "Iterators become invalid; references to surviving elements don't", correct: true },
          { label: 'Only references at the front are affected' },
        ],
        explain: (
          <>
            The standard states this exactly: insertion at either end invalidates every iterator into the deque, but has no effect on the
            validity of references to elements already there &mdash; the opposite split from a vector, where reallocation invalidates
            everything at once.
          </>
        ),
      },
      Visual: S.InvalidatePredictViz,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          A stack and a queue are each one end&rsquo;s worth of a deque&rsquo;s full power. The two real implementations trade resize
          behaviour for iterator stability in opposite directions.
        </>
      ),
      duration: 3.6,
      fig: 'Verdict',
      Visual: S.Verdict,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A real ring-buffer-backed deque: push and pop at either end cost the same small number of steps whether it holds ten elements or ten
          thousand. A plain list used the same way shifts every element, every time.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
