import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real degenerate order number, a real shared dim_date joined twice,
// a real junk dimension against its full Cartesian product, and a real outrigger's extra join
// (SOURCES.md, examples.py). Every number on screen traces to a literal constant in examples.py;
// everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'Four patterns, four shortcuts',
      body: (
        <>
          A dimension with no table behind it. One table playing two roles. Flags collapsed into
          one small table. A dimension pointing at another dimension. Four shortcuts, each with its
          own honest cost.
        </>
      ),
      duration: 4.8,
      fig: 'degenerate, role-playing, junk, outrigger',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: degenerate dimension, quoted directly',
      body: (
        <>
          Sometimes a dimension has no content left except its own primary key, once line items
          inherit everything descriptive from the invoice above them — yet that bare key still
          belongs in the fact table.
        </>
      ),
      duration: 4.8,
      fig: 'a bare key, no content left, no dimension table at all',
      Visual: S.RevealDegenerateQuote,
    },
    {
      title: 'Predict: does a bare order number still work as a grouping key?',
      body: (
        <>
          An order number with no dimension table of its own sits directly in the fact table. Can
          you still group by it correctly?
        </>
      ),
      duration: 2.8,
      fig: 'no dimension table behind it — still groups correctly?',
      predict: {
        options: [
          { label: "No — grouping needs a real dimension table to work against" },
          { label: 'Yes — a bare key groups exactly like any other key', correct: true },
        ],
        explain: (
          <>
            Yes. Grouping only needs equal values to compare, and the bare order number has that;
            the missing dimension table was never required for grouping to work.
          </>
        ),
      },
      Visual: S.PredictDegenerateGrouping,
    },
    {
      title: 'Reveal: degenerate dimension, measured',
      body: (
        <>
          Built for real: two order lines sharing one bare order number group together correctly,
          and a separate line under a different order number groups on its own — with no dimension
          table involved anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'grouped by a bare key, correctly, with no table behind it',
      takeaway: 'A degenerate dimension still groups correctly; it just carries no descriptive attributes of its own.',
      Visual: S.RevealDegenerateMeasured,
    },
    {
      title: 'Reveal: role-playing dimension, quoted directly',
      body: (
        <>
          One physical dimension can be referenced more than once from the same fact table, each
          reference standing in for its own logically separate role.
        </>
      ),
      duration: 4.8,
      fig: 'one physical table, two logically independent roles',
      Visual: S.RevealRolePlayingQuote,
    },
    {
      title: 'Reveal: role-playing dimension, measured',
      body: (
        <>
          Built for real: a single shared date table, joined twice from the same order row, returns
          a genuinely distinct order date and ship date — the identical table, playing two roles at once.
        </>
      ),
      duration: 4.8,
      fig: 'one shared date table, joined twice, two distinct dates back',
      takeaway: 'One physical dimension can serve several roles at once, as long as each join names its own role.',
      Visual: S.RevealRolePlayingMeasured,
    },
    {
      title: 'Reveal: junk dimension, quoted directly',
      body: (
        <>
          Miscellaneous low-cardinality flags don't each need their own dimension — one junk
          dimension can hold them all, storing only the combinations that actually occur.
        </>
      ),
      duration: 4.8,
      fig: 'flags collapsed into one table — only real combinations, not every possible one',
      Visual: S.RevealJunkQuote,
    },
    {
      title: 'Reveal: junk dimension, measured',
      body: (
        <>
          Built for real: three shipping flags could combine eight different ways, but only three
          combinations ever actually occurred, and that's exactly how many rows the junk dimension
          needed to store.
        </>
      ),
      duration: 4.8,
      fig: 'three rows stored, against eight that were possible',
      Visual: S.RevealJunkMeasured,
    },
    {
      title: 'Predict: does an outrigger ever cost you anything to use?',
      body: (
        <>
          A dimension referencing another dimension sounds like a free modeling convenience. Does
          it actually cost anything to query?
        </>
      ),
      duration: 2.8,
      fig: 'a dimension pointing at a dimension — any real cost?',
      predict: {
        options: [
          { label: "No — it's purely a modeling convenience, free at query time" },
          { label: 'Yes — it adds a genuine extra join every time you need it', correct: true },
        ],
        explain: (
          <>
            Yes. Every query that needs the outrigger's own attribute has to join through it, which
            is exactly why Kimball's own material says to use outriggers sparingly.
          </>
        ),
      },
      Visual: S.PredictOutriggerCost,
    },
    {
      title: 'Reveal: outrigger dimension, quoted directly',
      body: (
        <>
          A dimension can reference another dimension table — an outrigger — but it's permissible
          only sparingly; in most cases that correlation belongs in the fact table instead, as its
          own separate foreign key.
        </>
      ),
      duration: 4.8,
      fig: 'permissible, sparingly — demote to the fact table instead',
      Visual: S.RevealOutriggerQuote,
    },
    {
      title: 'Reveal: outrigger dimension, measured',
      body: (
        <>
          Built for real: reading one account's opened-date through its outrigger touches three
          tables in the query — one more than a flattened design, with that date as a plain column,
          would have needed.
        </>
      ),
      duration: 4.8,
      fig: 'three tables touched, where a flattened design needs two',
      takeaway: 'An outrigger is a real extra join on every query, not a cost-free modeling choice.',
      Visual: S.RevealOutriggerMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A bare key groups fine but carries no attributes. One table can play several roles, if
          named separately. A junk dimension skips the combinations that never happen. An outrigger
          works, but every query pays for the extra join.
        </>
      ),
      duration: 4.8,
      fig: 'degenerate, role-playing, junk, outrigger — each with its own honest cost',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A support ticket needs both an opened date and a closed date. Degenerate, role-playing,
          junk, or outrigger — which pattern actually fits?
        </>
      ),
      duration: 2.8,
      fig: 'opened date and closed date — which pattern fits?',
      predict: {
        options: [
          { label: 'Junk dimension — collapse both dates into one small table' },
          { label: 'Role-playing — the same date dimension, referenced twice', correct: true },
        ],
        explain: (
          <>
            Role-playing. Both columns are genuinely dates from the same calendar, just in two
            independent roles — exactly the case the pattern exists for, with each foreign key
            naming its own role.
          </>
        ),
      },
      Visual: S.ProveTicketDates,
    },
  ],
};

export default reel;
