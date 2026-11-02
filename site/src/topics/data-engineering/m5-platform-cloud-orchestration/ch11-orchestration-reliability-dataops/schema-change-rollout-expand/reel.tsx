import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Expand, migrate, contract, demonstrated on a real column rename (examples.py): a toy
// Confluent-style compatibility checker proves expand is backward and forward compatible, and
// a genuinely premature contract raises a real KeyError on the one consumer still unmigrated.
// Sourced: Confluent's compatibility modes, Martin Fowler's Parallel Change, Google Cloud's own
// critique of dual-write.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A column is renamed in one deploy, every consumer expected to "just pick it up," and
          downstream dashboards go blank the next morning because nobody migrated them first.
        </>
      ),
      duration: 4.8,
      fig: 'renamed in one deploy. dashboards went blank.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: can a single-deploy rename ever be safe?',
      body: (
        <>
          Could the same rename, timed carefully, roll out in a single deploy without breaking
          anyone?
        </>
      ),
      duration: 2.8,
      fig: 'can timing alone make a single-deploy rename safe?',
      predict: {
        options: [
          { label: 'Yes -- deploy it at a quiet hour and it is fine' },
          { label: 'No -- it has to be split into separate phases', correct: true },
        ],
        explain: (
          <>
            Timing changes who notices, not whether the change is safe. A renamed field still
            vanishes out from under every consumer still reading its old name.
          </>
        ),
      },
      Visual: S.PredictSingleDeploy,
    },
    {
      title: 'Reveal: expand, migrate, contract, named',
      body: (
        <>
          The same rename, split into three phases instead: add the new field alongside the old,
          migrate every consumer across to it one at a time, and only then remove the old field.
        </>
      ),
      duration: 4.8,
      fig: 'expand. migrate. contract.',
      Visual: S.RevealPhases,
    },
    {
      title: 'Reveal: the compatibility modes that decide what is allowed',
      body: (
        <>
          Expanding the schema has to pass real rules: can a reader on the new schema still
          process old data, and can a reader on the old schema still process new data.
        </>
      ),
      duration: 4.8,
      fig: 'backward. forward. full.',
      takeaway: 'Expand only counts as safe once it genuinely passes both the backward and the forward rule.',
      Visual: S.RevealCompatibilityModes,
    },
    {
      title: 'Predict: is a contract right after expand just as safe as after migrate?',
      body: (
        <>
          Expand already passed every compatibility rule. Is contracting right away just as safe
          as waiting for migrate to finish?
        </>
      ),
      duration: 2.8,
      fig: 'is contracting right after expand just as safe?',
      predict: {
        options: [
          { label: 'Yes -- expand already proved the schema is compatible' },
          { label: 'No -- a consumer still on the old field is not done migrating', correct: true },
        ],
        explain: (
          <>
            Expand only proves the schema change itself is safe. It says nothing about whether
            every consumer has actually finished switching over yet.
          </>
        ),
      },
      Visual: S.PredictEarlyContract,
    },
    {
      title: 'Reveal: a premature contract genuinely breaks the laggard',
      body: (
        <>
          Run contract while one consumer has not migrated yet, and that exact consumer raises a
          real error reaching for a field that is simply gone.
        </>
      ),
      duration: 4.8,
      fig: 'one consumer still unmigrated. contract runs anyway.',
      Visual: S.RevealPrematureContract,
    },
    {
      title: 'Reveal: dual-write, bounded',
      body: (
        <>
          Through the whole migrate phase, the producer writes both the old and the new field at
          once. That window is measured, and it ends -- it does not quietly become permanent.
        </>
      ),
      duration: 4.8,
      fig: 'both fields, written at once -- for a measured window.',
      takeaway: 'A dual-write window without a measured end is just a schema that never finished migrating.',
      Visual: S.RevealDualWrite,
    },
    {
      title: 'Recap',
      body: (
        <>
          Expand, migrate, contract. A compatibility rule that decides whether expand is allowed.
          A premature contract's real, specific failure. A dual-write window with an actual end.
        </>
      ),
      duration: 4.8,
      fig: 'three phases. one rule. one bounded window.',
      takeaway: 'A breaking change survives contact with production by never actually being deployed as one.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real rollout: the shop's own orders table gets a column renamed, with
          one consumer deliberately left behind mid-migration.
        </>
      ),
      duration: 2.8,
      fig: 'one consumer, deliberately left behind. what happens?',
      predict: {
        options: [
          { label: 'Nothing -- the old field is still there somewhere' },
          { label: 'A real error, naming exactly that consumer', correct: true },
        ],
        explain: (
          <>
            The laggard consumer raises a genuine KeyError reaching for the renamed field. No
            other consumer is affected, because every other one had already migrated.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
