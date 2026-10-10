import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: fast revision of what a senior uses in code review and what
// later topics rely on. Every example is executed by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Python, in five minutes',
      body: (
        <>
          The first of five refreshers: the Python a senior engineer leans on in code review and that the pipelines later in this course are written in.
          If it's all familiar, swipe on to Git.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'Defaults are evaluated once',
      body: (
        <>
          Functions are objects, and a default value is created once, when <code>def</code> runs, not on every call. What does the second call return?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: '[1]' }, { label: '[1, 1]', correct: true }, { label: 'None' }, { label: 'An error' }],
        explain: (
          <>
            <code>[1, 1]</code>: both calls share the one list made when <code>def</code> ran. Default to <code>None</code> and create the list inside the
            function.
          </>
        ),
      },
      Visual: S.MutableDefault,
    },
    {
      title: 'Closures bind late',
      body: (
        <>
          An inner function or lambda looks up the names it uses when it <em>runs</em>, not when it is made. Three lambdas built in a loop: what do they
          return?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: '[0, 1, 2]' }, { label: '[2, 2, 2]', correct: true }, { label: '[3, 3, 3]' }, { label: 'NameError' }],
        explain: (
          <>
            <code>[2, 2, 2]</code>: all three look up <code>i</code> after the loop has finished. Bind the value now with a default, <code>lambda i=i: i</code>{' '}
            (defaults are evaluated once, at <code>def</code>), or with <code>functools.partial</code>.
          </>
        ),
      },
      Visual: S.LateBinding,
    },
    {
      title: 'Comprehensions: filter, then map',
      body: (
        <>
          <code>[f(x) for x in xs if p(x)]</code> keeps the items that pass the test, transforms them and collects the result. The same shape builds
          dicts and sets, and the loop variable stays inside the comprehension.
        </>
      ),
      duration: 4,
      Visual: S.Comprehension,
    },
    {
      title: 'Generators stream; lists pile up',
      body: (
        <>
          A generator produces one item at a time. Both lines compute the same sum, but the list version first builds a million-element list. Measured
          peak: about <b>40 MB</b> against <b>half a kilobyte</b>. That's how a pipeline reads files bigger than memory.
        </>
      ),
      duration: 4.4,
      Visual: S.Generators,
    },
    {
      title: 'yield pauses; next() resumes',
      body: (
        <>
          A function with <code>yield</code> returns a generator. Each request for the next value runs the body up to the next <code>yield</code>, hands
          that value back and pauses there, keeping its local state. Batching a stream takes a few lines.
        </>
      ),
      duration: 4.6,
      Visual: S.YieldBatches,
    },
    {
      title: 'Context managers always clean up',
      body: (
        <>
          A context manager guarantees teardown: its exit code runs when the block ends, normally or through an exception. Files, connections, locks and
          transactions rely on it. <code>@contextmanager</code> turns a generator into one: setup before <code>yield</code>, teardown in{' '}
          <code>finally</code>.
        </>
      ),
      duration: 4.2,
      Visual: S.ContextManager,
    },
    {
      title: 'Decorators wrap functions',
      body: (
        <>
          <code>@timed</code> above <code>def load</code> means <code>load = timed(load)</code>: a function that takes a function and returns a new one.
          Retries, caching, timing and auth checks are usually decorators. Use <code>functools.wraps</code>, or the wrapper hides the original's name and
          docstring.
        </>
      ),
      duration: 3.2,
      Visual: S.Decorator,
    },
    {
      title: 'Dataclasses write the boilerplate',
      body: (
        <>
          <code>@dataclass</code> generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the annotated fields.{' '}
          <code>frozen=True</code> makes instances immutable; <code>slots=True</code> (Python 3.10+) drops the per-instance <code>__dict__</code>, so
          millions of small records take less memory.
        </>
      ),
      duration: 3.6,
      Visual: S.Dataclass,
    },
    {
      title: 'Classes: equal must mean same hash',
      body: (
        <>
          Special methods plug a class into Python: <code>__iter__</code> makes <code>for</code> work, <code>__len__</code> makes{' '}
          <code>len()</code> work, <code>__eq__</code> defines <code>==</code>. Defining <code>__eq__</code> removes <code>__hash__</code>, and{' '}
          <code>@dataclass</code> defines <code>__eq__</code>. Can this record be a dict key?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Yes' }, { label: 'TypeError: unhashable', correct: true }, { label: 'Only once' }, { label: 'KeyError' }],
        explain: (
          <>
            <code>TypeError: unhashable type: 'Key'</code>. Equal objects must hash equally, and a mutable record could change after it is stored. Make it{' '}
            <code>frozen=True</code> and it is hashable, and safe as a key.
          </>
        ),
      },
      Visual: S.Hashable,
    },
    {
      title: 'Type hints don’t run',
      body: (
        <>
          Given <code>def double(n: int) -&gt; int</code>, what does <code>double('ab')</code> do?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Raises TypeError' }, { label: "Returns 'abab'", correct: true }, { label: 'Returns None' }, { label: 'SyntaxError' }],
        explain: (
          <>
            It returns <code>'abab'</code>. Python doesn't check hints at runtime; type checkers such as mypy and pyright do. Run one in CI and the hints
            catch this before it ships.
          </>
        ),
      },
      Visual: S.TypeHints,
    },
    {
      title: 'In one breath',
      body: <>Nine things to keep. If any felt rusty, the Prerequisites panel has the best places to brush up; otherwise, on to Git.</>,
      duration: 1.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
