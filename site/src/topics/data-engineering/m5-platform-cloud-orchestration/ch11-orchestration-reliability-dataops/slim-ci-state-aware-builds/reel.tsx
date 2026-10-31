import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// state:modified+--defer and SQLMesh's virtual-environment promotion, measured against a full
// rebuild on the shop's own model graph (examples.py): column-level breaking-change detection
// tied to the prior topic's expand/contract discipline, a seeded-sample coverage trade quantified
// directly, and a CI gate that fails on a broken lineage edge or a measured SLA regression.
// Sourced: dbt's own state/defer docs, SQLMesh's own plan/virtual-environment docs, dbt Labs'
// Fusion engine announcement.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A large dbt project's full CI run rebuilds every model on every pull request, most of
          which nobody touched. A single-model change, run through a state-aware build instead,
          builds only what that change could actually reach.
        </>
      ),
      duration: 4.8,
      fig: 'one model changed. the whole project rebuilt anyway.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does safety require rebuilding everything?',
      body: (
        <>
          A full rebuild is certainly safe -- it tests everything. Is rebuilding everything the
          only way to be safe about one small change?
        </>
      ),
      duration: 2.8,
      fig: 'is a full rebuild the only safe option?',
      predict: {
        options: [
          { label: 'Yes -- anything less risks missing something' },
          { label: 'No -- changed plus downstream is just as safe', correct: true },
        ],
        explain: (
          <>
            Everything the change could possibly reach is exactly the changed model plus
            everything downstream of it. Nothing outside that set could have been affected.
          </>
        ),
      },
      Visual: S.PredictSafetyRequiresEverything,
    },
    {
      title: 'Reveal: state:modified + --defer',
      body: (
        <>
          Compare against a stored manifest of the last build. Select the changed node, plus
          everything downstream. Defer everything else to its already-built production
          relation instead of rebuilding it.
        </>
      ),
      duration: 4.8,
      fig: 'changed, plus downstream. everything else deferred.',
      Visual: S.RevealStateModifiedDefer,
    },
    {
      title: "Reveal: SQLMesh's virtual environment",
      body: (
        <>
          A plan previews exactly what a change would affect before anything runs. Once
          verified, promotion repoints production at what dev already built -- no
          recomputation, no data movement.
        </>
      ),
      duration: 4.8,
      fig: 'already built. just point production at it.',
      takeaway: 'A verified output does not need to be computed twice to be trusted in production.',
      Visual: S.RevealVirtualEnvironment,
    },
    {
      title: "Predict: does an unchanged contract mean nothing broke?",
      body: (
        <>
          A model's overall shape -- its name, its grain -- can look exactly the same while one
          column underneath it quietly changes. Does an unchanged model-level contract mean
          nothing downstream could break?
        </>
      ),
      duration: 2.8,
      fig: "same model. does unchanged mean safe?",
      predict: {
        options: [
          { label: 'Yes -- if the model contract looks the same, it is' },
          { label: 'No -- one renamed or retyped column is still breaking', correct: true },
        ],
        explain: (
          <>
            A column rename or type change breaks any consumer reading that exact column, even
            when the model around it looks completely unchanged.
          </>
        ),
      },
      Visual: S.PredictContractUnchangedMeansSafe,
    },
    {
      title: 'Reveal: column-level breaking-change detection',
      body: (
        <>
          The same column rename this chapter warned about earlier gets caught here directly:
          contracting straight to a new column name is flagged breaking. The same change, done
          through expand first, is not.
        </>
      ),
      duration: 4.8,
      fig: 'skip expand: breaking. do expand first: not breaking.',
      Visual: S.RevealColumnBreakingChange,
    },
    {
      title: 'Reveal: CI on a seeded sample',
      body: (
        <>
          A small, fixed sample runs fast. Measured directly against the same planted bugs
          checked on the full table, that sample only ever catches the fraction of bugs that
          happen to land inside it.
        </>
      ),
      duration: 4.8,
      fig: 'fast and small. how much of the real bug count?',
      takeaway: 'A seeded sample only ever catches the bugs that happen to land inside it.',
      Visual: S.RevealSeededSample,
    },
    {
      title: 'Reveal: the lineage and SLA gate',
      body: (
        <>
          A build can fail for reasons that have nothing to do with a wrong value: an expected
          dependency silently disappearing, or a measured latency that has already crossed this
          chapter's own SLO, checked before the merge, not after.
        </>
      ),
      duration: 4.8,
      fig: 'wrong value. broken lineage. a breached SLO.',
      Visual: S.RevealLineageSlaGate,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two state-aware ways to build only what changed, a column-level safety net for a
          contract that looks unchanged, a quantified sampling tradeoff, and a gate that fails
          on more than a wrong answer.
        </>
      ),
      duration: 4.8,
      fig: 'state-aware. column-aware. gate-aware.',
      takeaway: 'A CI run is both fast and safe once it builds exactly what a change could reach.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real comparison: the shop's model graph, the same single-model
          change, run once as a full rebuild and once through state:modified+--defer.
        </>
      ),
      duration: 2.8,
      fig: 'same change. full rebuild vs state-aware build.',
      predict: {
        options: [
          { label: 'Both approaches build the same number of models' },
          { label: 'The state-aware build builds fewer and still is safe', correct: true },
        ],
        explain: (
          <>
            The state-aware build selects only the changed model and its downstream, skipping
            every model the change genuinely could not have reached.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
