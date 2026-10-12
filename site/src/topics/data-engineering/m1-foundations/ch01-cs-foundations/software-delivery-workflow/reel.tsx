import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: how a change gets from your branch to a merged, released version (deploys come later in the course). Every example is executed by examples.py
// (which runs examples.sh: real pytest, pip, bash, jq, awk and Git in a temporary directory).
const reel: Reel = {
  steps: [
    {
      title: 'Delivery, in five minutes',
      body: (
        <>
          Five minutes on how a change gets merged and released: review, tests, CI, version numbers and pinned dependencies. The strip along the top
          of each step marks where it sits: review, tests, CI or release. Deploying comes later in the course. All familiar? Swipe on to the
          notation for how costs grow.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'Review: design first, keep it small',
      body: (
        <>
          A reviewer takes the broad view first, then the design of the main part: big problems go back at once. Then functionality, complexity,
          tests, naming; style is a <code>Nit:</code> the author may skip. Approve once the change clearly improves the code, not when it is perfect.
          Keep PRs small (about <b>100</b> lines; <b>1,000</b> is usually too large) and answer within one business day.
        </>
      ),
      duration: 4.2,
      Visual: S.Review,
    },
    {
      title: 'A unit test pins the bug',
      body: (
        <>
          pytest runs plain <code>assert</code>s. <code>parametrize</code> turns one test into one case per input, each passing or failing on its
          own; a fixture such as <code>tmp_path</code> hands each test a fresh directory. Then ask the reviewer’s question: does it fail when the code
          is broken? Six tests run: these four cases, the Git refresher’s email oracle and a <code>main()</code> test on a fixture file. On commit{' '}
          <b>731</b>’s <code>clean()</code>: <b>4 failed, 2 passed</b>, exit <b>1</b>. Only the padded inputs fail.
        </>
      ),
      duration: 3.8,
      Visual: S.UnitTest,
    },
    {
      title: 'CI: a chain of exit statuses',
      body: (
        <>
          A workflow file lists jobs; a job lists steps; each <code>run:</code> is a new shell, and its exit status is the step’s verdict. Every step runs
          only if all before it succeeded, so the first non-zero status fails the job and skips the rest. Jobs run in parallel unless one{' '}
          <code>needs</code> another. Make the job a required status check and a red run blocks the merge.
        </>
      ),
      duration: 4,
      Visual: S.CiChain,
    },
    {
      title: 'Which shell runs your step?',
      body: (
        <>
          This step sets no <code>shell:</code>, so GitHub runs it as <code>bash -e {'{0}'}</code> (<code>{'{0}'}</code> is the step’s script).{' '}
          <code>jq</code> can’t open the file and exits <b>2</b>; <code>sort</code> and <code>uniq</code> succeed. Does <code>-e</code> catch it:
          does the step pass or fail?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Fails with 2' }, { label: 'Passes, status 0', correct: true }, { label: 'Fails with 1' }, { label: 'Fails with 127' }],
        explain: (
          <>
            It passes. <code>-e</code> stops a script when a command fails, but a pipeline’s status is its last command’s, <code>uniq</code>’s{' '}
            <b>0</b>, so <code>-e</code> never sees <code>jq</code>’s 2. That holds in any <code>set -e</code> script. Set <code>shell: bash</code>{' '}
            (it runs <code>bash --noprofile --norc -eo pipefail {'{0}'}</code>) and the step fails with <b>2</b>.
          </>
        ),
      },
      Visual: S.WhichShell,
    },
    {
      title: 'Flaky: same code, different verdicts',
      body: (
        <>
          A flaky test passes and fails on the same code. Here the test compared a set’s order. A set’s order isn’t specified; for strings it depends on{' '}
          <code>hash()</code>, which Python seeds randomly per process: <b>10 of 20</b> runs fail. Usually the cause is state the test doesn’t control. Re-running until green hides it, and a gate nobody trusts
          hides real failures too. Fix the cause: here, <code>sorted()</code>.
        </>
      ),
      duration: 4.2,
      Visual: S.Flaky,
    },
    {
      title: 'A version number is a promise',
      body: (
        <>
          Semantic versioning, MAJOR.MINOR.PATCH, is a promise about the public API: what callers are told they can rely on, here the output columns.
          A backward compatible fix bumps PATCH; a compatible addition, MINOR. Now the next release renames the output column{' '}
          <code>status</code> to <code>order_status</code>. Which version?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: '1.5.1' }, { label: '1.6.0' }, { label: '2.0.0', correct: true }, { label: '1.5.0, rebuilt' }],
        explain: (
          <>
            <b>2.0.0</b>. Every reader of <code>row['status']</code> breaks (<code>KeyError: 'status'</code>), so it is an incompatible change to the
            public API: MAJOR goes up, MINOR and PATCH reset to 0. And a released version never changes: 1.5.0 can’t be rebuilt. For data, a rename
            isn’t the only break: a changed type or unit, a column that can now be null, a new <code>status</code> value or even an added column can
            break a reader (Deep dive).
          </>
        ),
      },
      Visual: S.VersionDial,
    },
    {
      title: 'Works on my machine',
      body: (
        <>
          <code>requirements.txt</code> says <code>shopclean{'>='}1.4</code>. Your laptop installed 1.5.0 last week; tests pass. Today 2.0.0, with the
          renamed column, is published. What does a fresh CI run get?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'Installs 1.5.0, passes' }, { label: 'Installs 2.0.0, the app fails', correct: true }, { label: 'Installs 1.4.0, passes' }, { label: 'pip refuses: conflicting versions' }],
        explain: (
          <>
            It installs 2.0.0 and the app fails with <code>KeyError: 'status'</code>. <code>{'>='}1.4</code> admits every later version and pip takes the
            newest that matches. The application should pin exactly, with a lock (next step). A cap such as <code>{'>='}1.4,{'<'}2</code> or{' '}
            <code>~=1.4</code> (compatible release: 1.4 or later, below 2) would have kept 1.5.0; for a library that is a trade-off (Deep dive).
          </>
        ),
      },
      Visual: S.WorksOnMyMachine,
    },
    {
      title: 'A lock file freezes the tree',
      body: (
        <>
          An application pins every package, dependencies included, with <code>==</code> and a SHA-256 checksum of the exact file, the same on every
          machine. A lock tool writes those lines, not you (Deep dive). With <code>--require-hashes</code>, pip installs those bytes or nothing: a
          file that changed under a pinned version, say on a compromised or overwriting index, is refused. A lock guarantees the same install wherever it fits (this one: Python 3.11 and later, on Linux or
          macOS); not that it is correct.
        </>
      ),
      duration: 4,
      Visual: S.LockFile,
    },
    {
      title: 'In one breath',
      body: <>Eight things to keep. The gate checks the answer, not what it costs as the data grows. If any felt rusty, the Prerequisites panel has the best places to brush up; otherwise, on to the last of the five refreshers: the notation for that cost, and the logarithms the chapter counts with.</>,
      duration: 1.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
