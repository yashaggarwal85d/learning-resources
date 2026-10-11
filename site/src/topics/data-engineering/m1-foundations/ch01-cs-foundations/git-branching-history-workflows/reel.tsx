import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the Git a senior engineer uses to shape, search and share history. Every example is run by
// examples.sh (real git, fixed dates, so every ID below is reproducible) and re-asserted by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Git, in five minutes',
      body: (
        <>
          You've got the Python; every change to it lands as a commit. Five minutes on shaping that history, searching it and sharing it. All familiar?
          Swipe on to the shell.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'Merge or rebase?',
      body: (
        <>
          Our repo is <code>clean.py</code>, a data-cleaning script; the branch <code>dedupe</code> adds deduplication while <code>main</code> moves on. Two ways
          to bring a branch in. A merge keeps both lines and ties them with a commit that has two parents: history as it happened. A rebase replays your commits
          on top of the target: a straight line, as if the work happened in order. Rebase <code>dedupe</code> onto <code>main</code>: what happens to its
          commits?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'They move on top, same IDs' }, { label: 'Three new commits, new IDs', correct: true }, { label: 'Squashed into one commit' }, { label: 'A merge commit is added' }],
        explain: (
          <>
            Three new commits, <code>9f711a4 a0a20c8 30d3436</code>: rebase replays each change onto <code>main</code>, and a commit's ID is a hash of its
            parent, its files, its author and committer with their dates, and its message, so every replayed commit gets a new one (this demo pins the dates; a
            real rebase also stamps a new committer date). The originals stay in the reflog. A merge keeps them and adds a commit with two parents.
            Both end with the same files: tree <code>827c45a</code>.
          </>
        ),
      },
      Visual: S.MergeOrRebase,
    },
    {
      title: 'Clean up before you push',
      body: (
        <>
          Before you push your branch <code>emails</code>, rewrite freely. <code>git rebase -i</code> lets you reorder, <code>reword</code>, <code>squash</code>, <code>fixup</code> and{' '}
          <code>drop</code> commits. Commit a fix with <code>git commit --fixup</code>, and <code>--autosquash</code> moves it under its target for you. Never
          rewrite what others have pulled: they would have to repair their history. And a rewrite is undoable: the old branch is one reflog entry back.
        </>
      ),
      duration: 4,
      Visual: S.Tidy,
    },
    {
      title: 'Conflicts: base, ours, theirs',
      body: (
        <>
          When both sides change the same or neighbouring lines, Git stops and keeps three versions: the common ancestor, yours and theirs. Set{' '}
          <code>merge.conflictStyle</code> to <code>zdiff3</code> and the file shows the ancestor too, so you can see what each side changed. Edit,{' '}
          <code>git add</code>, then <code>--continue</code>, or <code>--abort</code> to back out. In a rebase, ours and theirs swap: ours is the branch you
          rebase onto plus your commits replayed so far; theirs is your commit being replayed.
        </>
      ),
      duration: 3.6,
      Visual: S.Conflict,
    },
    {
      title: 'bisect halves the suspects',
      body: (
        <>
          <code>git bisect</code> is a binary search through history. Mark one commit good and one bad; it checks out the middle, you test it, and every
          answer halves the suspects. A thousand commits: how many tests until the first bad commit?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'About 10', correct: true }, { label: 'About 32' }, { label: 'About 500' }, { label: 'About 1,000' }],
        explain: (
          <>
            10. Each test halves the suspects: 1,000 commits need about log₂ 1,000 ≈ 10 tests, because 2¹⁰ = 1,024: ten halvings take 1,024 suspects down to
            one (9 or 10, depending on where the bug sits). Checking the 999 suspects one by one could take 998. Here the run found <code>784d178</code> in 10 tests.
          </>
        ),
      },
      Visual: S.BisectHalves,
    },
    {
      title: 'bisect run: the test is the oracle',
      body: (
        <>
          Give <code>git bisect run</code> a command and it tests every step for you. It reads one thing back: the exit status, the number every command ends
          with, where 0 means success. Exit 0 means good, 1 to 127 means bad, except 125, which means "can't test this one, skip it". Anything else stops the
          bisect. A test that fails only because of the bug is the ideal oracle; keep it outside the repo,
          so checking out old commits can't change it.
        </>
      ),
      duration: 4,
      Visual: S.ExitCodes,
    },
    {
      title: 'Three ways to land a PR',
      body: (
        <>
          A pull request asks for review and CI (automated build and test checks) before a branch lands. GitHub can land it three ways: a merge commit keeps
          every commit; squash makes one commit; rebase-and-merge replays them as new commits in a straight line. Squash suits short-lived branches. You
          squash-merge a three-commit PR, then add one commit to the same branch and open a new PR: how many commits does it list?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '1' }, { label: '4', correct: true }, { label: '0' }, { label: '2: the squash and the new one' }],
        explain: (
          <>
            4: the squash commit isn't made of your three commits, so Git still sees them as unmerged, and the new PR shows them again with the new one. Here
            it also conflicts: merging or rebasing that branch onto <code>main</code> stops in <code>dedupe.py</code>. After a squash merge, start a fresh
            branch from <code>main</code>.
          </>
        ),
      },
      Visual: S.Landing,
    },
    {
      title: 'Short-lived branches, one trunk',
      body: (
        <>
          Trunk-based development: everyone merges into one branch, the trunk, at least daily, through short-lived PR branches that exist for review and checks.
          Bigger changes still land in small steps, with feature flags and branch by abstraction. A long-lived branch drifts: the longer it lives, the bigger
          the final merge, and keeping it in step means resolving the same conflicts again on every rebase or test merge.
        </>
      ),
      duration: 3.2,
      Visual: S.Trunk,
    },
    {
      title: 'In one breath',
      body: <>Eight things to keep. If any felt rusty, the Prerequisites panel has the best places to brush up; otherwise, on to the shell, where those exit codes come from.</>,
      duration: 1.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
