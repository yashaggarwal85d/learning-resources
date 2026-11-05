import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the chapter's proved guarantees give way, on purpose, to the family with
// none. Local search (2-opt) on the traveling salesman problem, measured honestly against
// a true optimum found by exact dynamic programming; simulated annealing and a genetic
// algorithm measured on the identical instance, with no claim that either beats the other
// in general; and a real system's own documentation (PostgreSQL's GEQO) read directly for
// the engineering call to give up a worst-case guarantee on purpose. Every count is in
// examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Every guarantee this chapter has proved so far gets set aside now, on purpose. A query joins twelve tables, and the number of left-deep join orders alone is twelve factorial — hundreds of millions — with bushy trees far more still. No exhaustive search finishes checking all of them in reasonable time.',
      body: <>Every bound so far was proved. Now: a count in the hundreds of millions, and no guarantee at all.</>,
      duration: 5,
      fig: 'JoinOrderCount',
      Visual: S.JoinOrderCount,
    },
    {
      title: 'Local search, defined on the problem it is famous on: a closed tour visiting every point once. A neighborhood is every tour one small change away. Two-opt removes two edges and reconnects the other way, reversing the segment between them — the move that uncrosses a crossing tour.',
      body: <>A tour, a neighborhood one move away, and the move that uncrosses a crossing path.</>,
      duration: 4.5,
      fig: 'TwoOptMove',
      Visual: S.TwoOptMove,
    },
    {
      title: "Here is the honest measurement, not an assumption: twelve points, their true shortest tour found by checking every possibility exactly. Run two-opt from a hundred different random starting tours, and it stops at that true optimum well under half the time.",
      body: <>Checked against the true optimum directly: two-opt lands on it well under half the time.</>,
      duration: 5,
      fig: 'TwoOptMeasured',
      Visual: S.TwoOptMeasured,
    },
    {
      title: "Two-opt always stops. It never says where. Before the next technique's own numbers: would a search that is sometimes willing to accept a worse move actually escape a local optimum like this one, or would it just wander randomly and never settle anywhere at all?",
      body: <>A search stuck at a local optimum. Would accepting a worse move sometimes actually help?</>,
      duration: 4,
      fig: 'PredictAnnealing',
      predict: {
        options: [
          { label: 'No — it would only wander and never settle on anything' },
          { label: 'Yes — occasionally accepting worse moves can escape a local optimum, if done carefully', correct: true },
          { label: 'No — once stuck at a local optimum, no further move changes anything' },
          { label: 'Yes — but only if every worse move is accepted, not some of them' },
        ],
        explain: (
          <>
            Simulated annealing accepts a worse move with a probability that falls as a temperature is lowered —
            readily early on, rarely by the end. On the identical instance, measured directly, it reaches the true
            optimum far more often than plain two-opt does.
          </>
        ),
      },
      Visual: S.PredictAnnealing,
    },
    {
      title: "Simulated annealing: accept a worse move with a probability that falls as a temperature is lowered, following Kirkpatrick, Gelatt and Vecchi's own rule from 1983. Measured on the identical twelve-point instance, it reaches the true optimum far more often than plain two-opt — a measured result, not an assumed one.",
      body: <>A falling temperature, and the same instance's true optimum reached far more often.</>,
      duration: 5,
      fig: 'AnnealingMeasured',
      takeaway: "Simulated annealing's falling-probability rule measurably escapes local optima that stop plain local search cold.",
      Visual: S.AnnealingMeasured,
    },
    {
      title: "A genetic search: a population of candidate tours, selection by fitness, crossover combining two parents, mutation. Run on the identical instance with this topic's own implementation, it actually does worse than plain two-opt — not because genetic algorithms are weak in general, but because no fixed ranking holds among these searches.",
      body: <>Population, crossover, mutation — and on this instance, worse than plain local search.</>,
      duration: 5,
      fig: 'GeneticSurprise',
      takeaway: 'No universal ranking exists among these searches: here, a genetic algorithm did worse than plain local search.',
      Visual: S.GeneticSurprise,
    },
    {
      title: "PostgreSQL's own documentation names the real system doing exactly this. Below a threshold, it searches every join order exhaustively. At or above it, a genetic algorithm takes over: a join tree becomes an integer string, two strings cross over into a child, and mutation is deprecated outright so no repair step is ever needed.",
      body: <>A join tree as a string, crossed over like a tour — mutation dropped on purpose.</>,
      duration: 5.5,
      fig: 'GeqoDocumented',
      Visual: S.GeqoDocumented,
    },
    {
      title: "One query runs once an hour. Another runs ten thousand times a second. Both would cross the threshold where the exhaustive planner becomes too slow. Which one should the documented genetic planner actually be trusted on?",
      body: <>One query runs once an hour, another constantly. Which should risk the weaker plan?</>,
      duration: 4,
      fig: 'PredictGeqoThreshold',
      predict: {
        options: [
          { label: 'The one that runs constantly, since its planning cost repeats the most' },
          { label: 'The one that runs once an hour — planning time barely matters there, so a weaker plan is the smaller risk', correct: true },
          { label: 'Neither — the exhaustive planner should always be forced on, whatever the cost' },
          { label: 'Both equally — the threshold applies the same way regardless of how often a query runs' },
        ],
        explain: (
          <>
            The query that runs once an hour pays its planning cost once; even a weaker plan is cheap there, because
            planning time is a rounding error next to how rarely it happens. The query run constantly pays its
            planning cost on every single execution, which is exactly where an inferior plan compounds the most.
          </>
        ),
      },
      Visual: S.PredictGeqoThreshold,
    },
    {
      title: "Its own documentation admits the fit is imperfect: a traveling-salesman tour's cost per piece doesn't depend on the rest of the tour, but a join order's cost does. The honest engineering call: give up the worst-case guarantee only where the exhaustive search's own cost is the bigger risk, and say so plainly.",
      body: <>The documentation's own words: the analogy is imperfect, and the trade-off is named directly.</>,
      duration: 5,
      fig: 'Recap',
      takeaway: "A guarantee is given up only when its absence costs less than keeping it — PostgreSQL's documentation says so plainly.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
