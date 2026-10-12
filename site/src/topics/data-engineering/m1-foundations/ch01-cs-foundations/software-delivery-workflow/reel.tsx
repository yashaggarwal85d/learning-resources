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
          of each step marks where it sits. Deploying comes later in the course. All familiar? Swipe on.
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
          <code>parametrize</code> turns one test into one case per input; a fixture such as <code>tmp_path</code> hands each test a fresh directory.
          Six tests run: four cases, the Git refresher’s email oracle and a <code>main()</code> test. Does it fail when the code is broken? On
          commit <b>731</b>: <b>4 failed, 2 passed</b>, exit <b>1</b>. Only the padded inputs fail.
        </>
      ),
      duration: 4.8,
      Visual: S.UnitTest,
    },
    {
      title: 'CI: a chain of exit statuses',
      body: (
        <>
          A job lists steps; each <code>run:</code> is a new shell, and its exit status is the step’s verdict. A step runs only if all before it
          succeeded, so the first non-zero status fails the job and skips the rest. Make the job a required status check and a red run blocks the
          merge.
        </>
      ),
      duration: 4,
      Visual: S.CiChain,
    },
    {
      title: 'Which shell runs your step?',
      body: (
        <>
          No <code>shell:</code> is set, so GitHub runs <code>bash -e {'{0}'}</code>. <code>jq</code> can’t open the file and exits <b>2</b>;{' '}
          <code>sort</code> and <code>uniq</code> succeed. Does the step pass or fail?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Fails with 2' }, { label: 'Passes, status 0', correct: true }, { label: 'Fails with 1' }, { label: 'Fails with 127' }],
        explain: (
          <>
            It passes: a pipeline’s status is its last command’s, <code>uniq</code>’s <b>0</b>, so <code>-e</code> never sees <code>jq</code>’s 2.
            Set <code>shell: bash</code>, which adds <code>pipefail</code>, and the step fails with <b>2</b>.
          </>
        ),
      },
      Visual: S.WhichShell,
    },
    {
      title: 'Flaky: same code, different verdicts',
      body: (
        <>
          A flaky test passes and fails on the same code. Here it compared a set’s order, which depends on <code>hash()</code>, and Python seeds that
          randomly per process: <b>10 of 20</b> runs fail. Re-running until green hides the cause. Fix it: here, <code>sorted()</code>.
        </>
      ),
      duration: 5.6,
      Visual: S.Flaky,
    },
    {
      title: 'A version number is a promise',
      body: (
        <>
          A fix bumps PATCH, a compatible addition MINOR. The next release renames the output column <code>status</code> to{' '}
          <code>order_status</code>. Which version?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: '1.5.1' }, { label: '1.6.0' }, { label: '2.0.0', correct: true }, { label: '1.5.0, rebuilt' }],
        explain: (
          <>
            <b>2.0.0</b>. Every reader of <code>row['status']</code> breaks: MAJOR goes up, the others reset to 0. A released version never changes.
            Other data breaks: Deep dive.
          </>
        ),
      },
      Visual: S.VersionDial,
    },
    {
      title: 'Works on my machine',
      body: (
        <>
          <code>requirements.txt</code> says <code>shopclean{'>='}1.4</code>. Your laptop got 1.5.0 last week. Today 2.0.0, with the renamed column,
          is out. What does a fresh CI run get?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'Gets 1.5.0, passes' }, { label: 'Gets 2.0.0, app fails', correct: true }, { label: 'Gets 1.4.0, passes' }, { label: 'pip refuses' }],
        explain: (
          <>
            2.0.0, and the app fails with <code>KeyError: 'status'</code>. <code>{'>='}1.4</code> admits every later version. An application should
            pin exactly, with a lock (next step). Caps: Deep dive.
          </>
        ),
      },
      Visual: S.WorksOnMyMachine,
    },
    {
      title: 'A lock file freezes the tree',
      body: (
        <>
          An application pins every package, dependencies included, with <code>==</code> and a SHA-256 checksum of the exact file; a lock tool writes
          those lines. With <code>--require-hashes</code>, pip installs those bytes or nothing: a changed file is refused. The gate’s own tools are
          locked the same way: 5 pins, 5 hashes. A lock guarantees the same install, not that it is correct.
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
