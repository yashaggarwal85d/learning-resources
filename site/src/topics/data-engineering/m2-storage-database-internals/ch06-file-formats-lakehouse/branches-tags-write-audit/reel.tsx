import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own snapshot-references
// section (branches and tags), the project's own Spark procedures documentation (fast_forward,
// publish_changes), and the Apache Iceberg view spec -- and against real pyiceberg (0.12.0)
// behavior in this sandbox: a real tag and branch from the same snapshot, a branch-scoped write
// provably invisible to main, a real validation check, a real fast-forward publish, and a real
// rejected publish that never touches main, all through pyiceberg's own public
// manage_snapshots()/append(branch=...) APIs.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Iceberg's own snapshot history is already addressable by id. This topic gives some of
          those snapshots stable, human-meaningful names — and, for one of them, the ability to
          move independently of `main`.
        </>
      ),
      duration: 4.8,
      fig: 'snapshots are already addressable by id. this topic gives some of them names, and motion.',
      Visual: S.Hook,
    },
    {
      title: "Predict: what's the real difference between a tag and a branch?",
      body: (
        <>
          A tag and a branch are both created from the same snapshot. What's the real difference
          between them?
        </>
      ),
      duration: 4.8,
      fig: "a tag and a branch are both created from the same snapshot. what's the real difference?",
      predict: {
        options: [
          { label: 'No real difference — both are just names' },
          { label: 'One is fixed forever; the other can move', correct: true },
        ],
        explain: (
          <>
            A tag is a fixed label on one snapshot. A branch is a mutable reference that moves as
            new snapshots are committed against it.
          </>
        ),
      },
      Visual: S.PredictTagVsBranch,
    },
    {
      title: 'Reveal: created for real, from the same snapshot',
      body: (
        <>
          Created for real: a tag, `released-v1`, and a branch, `audit`, both pointing at this
          table's one snapshot — built through pyiceberg's own real snapshot-management API.
        </>
      ),
      duration: 4.8,
      fig: "created for real: a tag and a branch, both pointing at this table's one snapshot.",
      Visual: S.RevealCreatedForReal,
    },
    {
      title: 'Reveal: the spec says it directly',
      body: (
        <>
          The spec says it directly: tags are labels for individual snapshots; branches are
          mutable named references that move as new snapshots are committed.
        </>
      ),
      duration: 4.8,
      fig: 'the spec says it directly: tags are fixed labels, branches are mutable references that move.',
      takeaway: 'A tag is fixed, for retention and reproducibility. A branch moves, which is what makes isolated writes possible.',
      Visual: S.RevealSpecDistinguishesThem,
    },
    {
      title: 'Predict: what happens to main when the audit branch gets new rows?',
      body: (
        <>
          New rows are written to the `audit` branch. What happens to `main`: does it get the new
          rows too, or stay completely untouched?
        </>
      ),
      duration: 4.8,
      fig: 'new rows are written to the audit branch. what happens to main?',
      predict: {
        options: [
          { label: 'main gets the new rows too' },
          { label: 'main is completely unaffected until moved', correct: true },
        ],
        explain: (
          <>
            A branch's own writes stay invisible to every other ref, main included, until
            something explicitly moves that ref.
          </>
        ),
      },
      Visual: S.PredictBranchWritesIsolated,
    },
    {
      title: 'Reveal: staged for real, main provably untouched',
      body: (
        <>
          Staged for real: three new rows written to the `audit` branch only. `main`'s own
          snapshot id, checked directly, hasn't moved.
        </>
      ),
      duration: 4.8,
      fig: "staged for real: three new rows on the audit branch; main's own snapshot id, unchanged.",
      takeaway: "A branch's writes are invisible to every other ref until something explicitly moves it.",
      Visual: S.RevealMainProvablyUntouched,
    },
    {
      title: 'Reveal: validated, then published for real',
      body: (
        <>
          Validated, then published: a real check for duplicate ids runs against the staged
          branch, passes, and `main` is fast-forwarded to that branch's snapshot — the tag from
          earlier stays exactly where it was.
        </>
      ),
      duration: 4.8,
      fig: 'validated, then published: a real check passes, and main is fast-forwarded for real.',
      Visual: S.RevealValidatedThenPublished,
    },
    {
      title: 'Reveal: a second attempt, for real, fails and never reaches main',
      body: (
        <>
          A second attempt, run the same way: this batch reintroduces an id already in the table.
          The same real check catches it, the branch is discarded, and `main`'s snapshot id never
          moved.
        </>
      ),
      duration: 4.8,
      fig: 'a second attempt, for real, fails the same check and never reaches main.',
      Visual: S.RevealSecondAttemptRejected,
    },
    {
      title: 'Reveal: this is one table — views and the catalog are a different layer',
      body: (
        <>
          All of this is one table. An Iceberg view is a separate kind of catalog object
          entirely, with its own metadata and version history and no data of its own. Branching
          more than one table together, atomically, is the catalog's job, not a single table's.
        </>
      ),
      duration: 4.8,
      fig: "this is one table. views are a separate object entirely; more than one table at once is the catalog's job.",
      takeaway: 'Write-audit-publish here is single-table; true multi-table branching is a catalog-level feature.',
      Visual: S.RevealOneTableViewsAndCatalog,
    },
    {
      title: 'Recap',
      body: (
        <>
          A tag is a fixed pointer; a branch is a movable one, built from the same snapshot. A
          full write-audit-publish flow ran twice in this sandbox — once published, once
          rejected — and neither touched `main` until a real check decided it.
        </>
      ),
      duration: 4.8,
      fig: "this metadata tree is one mechanism; the next topic is a visibly different one: Delta's log.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
