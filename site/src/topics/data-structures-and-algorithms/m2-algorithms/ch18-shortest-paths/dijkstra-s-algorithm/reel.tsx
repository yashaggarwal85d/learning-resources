import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Dijkstra's own label-setting algorithm, confirmed against brute-force
// relaxation; the exact negative-edge counterexample demonstrating why non-negative
// weights are required; lazy deletion vs. decrease-key, compared by queue bookkeeping
// cost on the same graph. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A road network where every edge has a drive time, and the question is the fastest way from one city to every other — answered without ever reconsidering a city once its fastest time is known, as long as no road can ever make a trip shorter by being driven.',
      body: <>A weighted graph with more than one way to reach most vertices.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'If a graph has a single negative-weight edge somewhere in it, does the algorithm still find the correct shortest distances?',
      body: <>A vertex can be settled before a later relaxation through the negative edge would have improved it.</>,
      duration: 2.5,
      fig: 'PredictNegative',
      predict: {
        options: [
          { label: 'No — a negative edge can make an already-settled vertex wrong', correct: true },
          { label: 'Yes — the algorithm only cares about edge count, not sign' },
          { label: 'Yes, as long as the negative edge is not on the shortest path' },
          { label: 'It depends on whether the negative edge points toward the source' },
        ],
        explain: (
          <>
            The algorithm settles the closest unsettled vertex and never revisits it. If a cheaper route to that
            vertex exists only through a negative edge discovered later, the algorithm has already moved on — it
            settled the vertex at a distance that a later relaxation could have beaten, and never finds out.
          </>
        ),
      },
      Visual: S.PredictNegative,
    },
    {
      title: 'The algorithm pops the closest unsettled vertex from a priority queue, settles it, and relaxes every one of its outgoing edges — repeating until the queue is empty.',
      body: <>One settled vertex per round, each one final the moment it is popped.</>,
      duration: 4.5,
      fig: 'DijkstraMechanism',
      takeaway: 'Settling the closest unsettled vertex first is what makes each pop final immediately.',
      Visual: S.DijkstraMechanism,
    },
    {
      title: 'On the exact graph where a greedy choice goes wrong, the algorithm settles a vertex at a distance that a negative edge, reached only later, could have beaten. The settled vertex is never revisited, so the wrong distance stands.',
      body: <>The shorter path through the negative edge arrives after the vertex is already finalized.</>,
      duration: 4,
      fig: 'NegativeFailure',
      takeaway: 'Non-negative weights are what make settling a vertex early safe at all.',
      Visual: S.NegativeFailure,
    },
    {
      title: 'Lazy deletion and a true decrease-key operation produce the identical final distances on any graph — do they also do the identical amount of work in the priority queue, or does one of them do strictly more?',
      body: <>Lazy deletion pushes a new entry every time a distance improves, rather than updating one in place.</>,
      duration: 2.5,
      fig: 'LazyVsDecreaseKey',
      predict: {
        options: [
          { label: 'Lazy deletion does strictly more queue work — it pushes duplicates it must later discard', correct: true },
          { label: 'They do the identical amount of queue work either way' },
          { label: 'Decrease-key does strictly more work, since it has to search for the entry first' },
          { label: 'It depends only on the number of vertices, not which method is used' },
        ],
        explain: (
          <>
            Lazy deletion never removes a stale entry when a vertex's distance improves — it just pushes a smaller
            one and leaves the old one sitting in the queue. Every one of those old entries still has to be popped
            and discarded later as stale. Decrease-key updates a vertex's single existing entry in place, so it never
            creates that extra work to begin with.
          </>
        ),
      },
      Visual: S.LazyVsDecreaseKey,
    },
    {
      title: "Dijkstra's algorithm settles the closest vertex first, and that greedy choice is only safe because no edge can ever make a path shorter by being added to it. The moment even one edge weight can be negative, that safety breaks, and the closest-first order stops being trustworthy.",
      body: <>Handling that case, and detecting when it makes the question itself unanswerable, is next.</>,
      duration: 4,
      fig: 'Recap',
      takeaway: 'Dijkstra needs non-negative weights for the same reason it never revisits a settled vertex.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
