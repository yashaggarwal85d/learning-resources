import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The three-way timing gap (built-in expression vs. Arrow pandas UDF vs. pickled Python UDF,
// identical doubling computation on 3 million rows, local[4], AQE disabled) is measured directly
// against a real local Apache Spark 4.0.1 session in examples.py, taking the median of three
// repeated runs each. Built-in fastest, Arrow several times slower, pickled slowest of all, with
// pickled several times slower than built-in — the exact ordering and gap size this topic quotes
// a real measured run for, not an illustrative guess. The row-at-a-time pickling mechanism and
// Arrow's batch-at-a-time alternative are sourced and quoted from Spark's own source.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Codegen just fused three operators into one native loop. What happens the instant one
          of those operators is a function you wrote yourself, in plain Python?
        </>
      ),
      duration: 4.5,
      fig: "a user's own function joins the pipeline. Still fused in, or not?",
      Visual: S.Hook,
    },
    {
      title: 'Predict: can codegen fuse it?',
      body: (
        <>
          Catalyst fuses operators it understands well enough to generate code for. Can it fuse a
          plain Python function the exact same way it fused Range, Filter, and Project?
        </>
      ),
      duration: 2.8,
      fig: 'can a plain Python function get fused in, the same way?',
      predict: {
        options: [
          { label: 'Yes — codegen can generate a call into any function, Python included' },
          { label: 'No — the function is completely opaque to Catalyst, so fusion stops cold', correct: true },
        ],
        explain: (
          <>
            Codegen generates JVM bytecode. It has no way to inline a Python function's own body
            into that bytecode at all, so the fused loop simply cannot reach across that boundary.
          </>
        ),
      },
      Visual: S.PredictCanFuse,
    },
    {
      title: 'Reveal: opaque, and pickled one row at a time',
      body: (
        <>
          Measured, and sourced directly from Spark's own code: a pickled Python UDF's own
          execution path pickles every single row by itself, one at a time, to cross into Python.
        </>
      ),
      duration: 4.8,
      fig: "Spark's own source: rows cross the boundary one at a time, pickled.",
      Visual: S.RevealOpaque,
    },
    {
      title: 'Reveal: the same computation, three real speeds',
      body: (
        <>
          Measured: doubling three million rows, three ways. The built-in expression is fastest
          by far. The Arrow UDF is several times slower. The pickled UDF is slower still.
        </>
      ),
      duration: 4.8,
      fig: 'built-in fastest. Arrow UDF slower. Pickled UDF slowest of all three.',
      takeaway: 'The identical computation runs at three genuinely different speeds, purely from how each one crosses the JVM boundary.',
      Visual: S.RevealThreeTimes,
    },
    {
      title: 'Predict: why Arrow still wins',
      body: (
        <>
          Both the Arrow UDF and the pickled UDF leave the JVM to run Python code. So why is the
          Arrow one still dramatically faster than the pickled one, if both cross the same line?
        </>
      ),
      duration: 2.8,
      fig: 'both cross into Python. So why is one so much faster?',
      predict: {
        options: [
          { label: 'Arrow just uses a faster serialization format for the exact same per-row crossing' },
          { label: 'Arrow crosses the boundary once per batch of rows; pickling crosses it once per single row', correct: true },
        ],
        explain: (
          <>
            The format isn't the real story. Arrow hands over a whole column of rows at once, so
            the expensive boundary crossing happens far less often, not merely faster each time.
          </>
        ),
      },
      Visual: S.PredictWhyArrowFaster,
    },
    {
      title: 'Reveal: once per batch, versus once per row',
      body: (
        <>
          Measured and sourced together: Arrow's own UDF documentation confirms vectorised,
          batch-at-a-time transfer — the structural reason the pickled path pays its cost per row.
        </>
      ),
      duration: 4.8,
      fig: 'Arrow: one crossing per batch. Pickled: one crossing per row.',
      takeaway: 'Arrow beats pickling for one structural reason: a batch crossing a boundary once, instead of every row crossing it alone.',
      Visual: S.RevealBatchVsRow,
    },
    {
      title: 'Recap',
      body: (
        <>
          Built-in stays fully fused and fastest. Arrow crosses the boundary once per batch.
          Pickling crosses it once per row, and pays for it every single time. Reach for built-in
          expressions first, Arrow UDFs second, and keep a pickled UDF off anything that runs often.
        </>
      ),
      duration: 4.8,
      fig: 'built-in, then Arrow, then pickled — in that order, for a real reason.',
      takeaway: 'Reach for a built-in expression first, an Arrow UDF second, and keep a pickled Python UDF off any hot path.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
