import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: a controlled `cost_demo` schema (j1..j12, each 100,000 rows, chained by id equality, one
// selective filter on j1) built specifically to vary join order and FROM-item count while holding row counts and
// selectivity fixed and known — plus one reuse of topic 19's own measured `orders` table for the cost formula.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Two totals for the same question',
      body: (
        <>
          Nine tables, the same data, the same meaning — join them all and count. One version of the query reports a total cost of 23,837.70. Another reports
          1,697.40. Nothing about the data changed.
        </>
      ),
      duration: 4,
      fig: '23,837.70 vs. 1,697.40',
      Visual: S.TwoTotals,
    },
    {
      title: 'Predict: a Seq Scan, by the numbers',
      body: (
        <>
          <code>orders</code> has 46,484 disk pages and 2,400,000 rows. <code>seq_page_cost</code> is 1.0, <code>cpu_tuple_cost</code> is 0.01. What total cost
          does <code>EXPLAIN</code> report for scanning the whole table?
        </>
      ),
      duration: 1.8,
      fig: '46,484 pages, 2,400,000 rows',
      predict: {
        options: [{ label: '46,484' }, { label: '70,484', correct: true }, { label: '2,400,000' }, { label: '2,446,484' }],
        explain: (
          <>
            70,484 — (46,484 × 1.0) + (2,400,000 × 0.01). PostgreSQL's own documentation gives this exact formula and works a smaller table through it by hand;
            this is the same arithmetic on a real one.
          </>
        ),
      },
      Visual: S.PredictSeqScan,
    },
    {
      title: 'Reveal: the formula, exactly',
      body: (
        <>
          <code>EXPLAIN SELECT * FROM orders</code> reports <code>cost=0.00..70484.00</code>. The hand arithmetic and the planner's own number match to the
          decimal — nothing about this cost is a mystery or a sampled estimate.
        </>
      ),
      duration: 3.6,
      fig: 'cost=0.00..70484.00',
      takeaway: "A plan's cost isn't measured after the fact — it's computed, in arbitrary units, before anything runs.",
      Visual: S.RevealSeqScan,
    },
    {
      title: 'Five constants, one scale',
      body: (
        <>
          <code>seq_page_cost</code> 1.0, <code>random_page_cost</code> 4.0, <code>cpu_tuple_cost</code> 0.01, <code>cpu_index_tuple_cost</code> 0.005,
          <code>cpu_operator_cost</code> 0.0025. Every plan's cost is built from just these five, and the planner picks whichever plan's top-level total is
          lowest.
        </>
      ),
      duration: 4.4,
      fig: 'the five constants',
      Visual: S.FiveConstants,
    },
    {
      title: 'Choosing a join order is also a search',
      body: (
        <>
          Scanning one table has a handful of options. Joining twelve has 28.2 trillion possible orders — a real count, not a guess, checked against a
          brute-force enumeration before trusting it. At fourteen tables: 64.8 quadrillion.
        </>
      ),
      duration: 4.6,
      fig: '8 → 12 → 14 tables',
      takeaway: 'The number of join orders to search is why a planner needs a strategy, not just a formula.',
      Visual: S.TreeCounts,
    },
    {
      title: 'Predict: a query written in a bad order',
      body: (
        <>
          Nine tables, written in the worst order: the one selective filter (50 of 100,000 rows) sits last, after eight unfiltered joins. The default{' '}
          <code>join_collapse_limit</code> is 8. Does the planner fix the order anyway?
        </>
      ),
      duration: 1.8,
      fig: '9 tables, filter last',
      predict: {
        options: [
          { label: 'Yes — 8 is enough room to reorder all 9' },
          { label: "No — 8 can't cover a 9-table list, so the written order sticks", correct: true },
          { label: 'It depends only on how many rows match the filter' },
        ],
        explain: (
          <>
            No — a 9-item FROM list is one more than the default limit allows the planner to flatten and freely reorder, so the literal, bad, written order
            is what actually runs.
          </>
        ),
      },
      Visual: S.PredictCollapse,
    },
    {
      title: 'Reveal: the same query, 14× apart',
      body: (
        <>
          Forced to the literal bad order (<code>join_collapse_limit = 1</code>): cost 23,837.70 — every unfiltered table joined in full before the filter
          ever applies. Let loose to reorder (<code>= 20</code>): cost 1,697.40. Same tables, same data, same WHERE clause.
        </>
      ),
      duration: 4.4,
      fig: '23,837.70 → 1,697.40',
      takeaway: "A join's written order isn't just style — the planner is stuck with it once the limit stops.",
      Visual: S.RevealCollapse,
    },
    {
      title: 'from_collapse_limit, join_collapse_limit',
      body: (
        <>
          Both default to 8: "smaller values reduce planning time but might yield inferior query plans." Setting <code>join_collapse_limit = 1</code> isn't a
          bug — it's how you pin a join order you already know is better than the planner's default.
        </>
      ),
      duration: 4.2,
      fig: 'default 8, or pin it at 1',
      Visual: S.CollapseLimitMechanism,
    },
    {
      title: 'Predict: past the threshold',
      body: (
        <>
          <code>geqo_threshold</code> defaults to 12 FROM items. Push a chain of joins from 11 tables to 12 and beyond — what changes about the plan, and
          about how long it takes to find one?
        </>
      ),
      duration: 1.8,
      fig: '11 tables → 12 → 14',
      predict: {
        options: [
          { label: 'Nothing — PostgreSQL always searches exhaustively' },
          { label: 'The plan gets worse, but finding it gets faster', correct: true },
          { label: 'The plan gets better, and finding it gets faster' },
        ],
        explain: (
          <>
            Faster to find, not guaranteed as good — PostgreSQL switches from exhaustive search to a genetic search once there are at least{' '}
            <code>geqo_threshold</code> FROM items, trading a guarantee of the best plan for a bound on planning time.
          </>
        ),
      },
      Visual: S.PredictGeqo,
    },
    {
      title: 'Reveal: the planning-time curve',
      body: (
        <>
          Forcing exhaustive search: 36 ms at 8 tables, 1.74 s at 12, 36.1 s at 14 — and a 16-table attempt that took the server itself down before it
          returned a plan. GEQO, on by default past 12: 132 ms and 125 ms at those same sizes — landing on the exact same cost both times, here.
        </>
      ),
      duration: 4.8,
      fig: '36ms → 36.1s, then GEQO at ~130ms',
      takeaway: "GEQO bounds planning time; it doesn't promise the best plan — this query just happened to get both.",
      Visual: S.RevealGeqo,
    },
    {
      title: 'How GEQO actually searches',
      body: (
        <>
          Join orders are encoded as integer strings, like stops on a tour. A population of candidate orders competes on estimated cost; the least fit are
          discarded, and new candidates are bred from the survivors — a genetic algorithm, not a shortcut version of exhaustive search.
        </>
      ),
      duration: 4.4,
      fig: 'join orders as strings, bred and culled',
      Visual: S.GeqoMechanism,
    },
    {
      title: 'Interesting orders: a sort you never paid for',
      body: (
        <>
          <code>WHERE order_id &lt; 1000 ORDER BY order_id</code>, no index on <code>order_id</code>: the planner adds an explicit <code>Sort</code> node,
          total cost 60,084.45. Add the index, same query: no <code>Sort</code> node at all — cost 53.19. The scan's own output order already matched.
        </>
      ),
      duration: 4.4,
      fig: '60,084.45 → 53.19',
      takeaway: "The planner tracks a scan's output order too — a later step might skip a sort entirely.",
      Visual: S.InterestingOrders,
    },
    {
      title: 'Before you trust a plan',
      body: (
        <>
          What do the five constants assume about this hardware — is storage really 4× slower at random reads here? Would a smaller collapse limit have
          blocked a better order? Is this query already past where GEQO took over?
        </>
      ),
      duration: 4,
      fig: 'three questions',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>A table has 2,000 disk pages and 50,000 rows. Using the default constants, what total cost does a Seq Scan of it report?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '500' }, { label: '2,500', correct: true }, { label: '52,000' }],
        explain: <>2,500 — (2,000 × 1.0) + (50,000 × 0.01). The same formula, different numbers.</>,
      },
      Visual: S.ProveFormula,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          A query joins 7 tables, written in a bad order. <code>join_collapse_limit</code> is left at its default (8). Can the planner still fix the order?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Yes — 7 FROM items fit under the limit of 8', correct: true },
          { label: "No — the limit is too small for 7 tables" },
        ],
        explain: <>Yes — a 7-item FROM list is within the default collapse limit, so the planner can flatten it and search freely regardless of how it was written.</>,
      },
      Visual: S.ProveCollapse,
    },
  ],
};

export default reel;
