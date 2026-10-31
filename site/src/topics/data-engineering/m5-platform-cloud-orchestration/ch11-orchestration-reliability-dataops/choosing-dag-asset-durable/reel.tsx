import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No new mechanism of its own: this topic is a decision between three models already taught
// (Airflow's batch DAG, topics 1-7; Dagster's asset graph, topic 8) or named and sourced only
// (Temporal's durable execution -- its internals are *(skipped)* syllabus entries this chapter).
// The real evidence is this session's own two Airflow sensor runs (examples.py); every Temporal
// claim is verified word for word against its own fetched documentation (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A five-day vendor-approval wait, modelled as an Airflow sensor, survives by luck -- until
          a routine deploy restarts the scheduler mid-wait, and the approval state is gone.
        </>
      ),
      duration: 4.8,
      fig: 'restart mid-wait. the approval state is gone.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: three shapes, named',
      body: (
        <>
          The batch DAG, the asset graph, and durable execution have each already earned their
          place. This topic is only about choosing among the three for a given piece of work.
        </>
      ),
      duration: 4.8,
      fig: 'three shapes already taught. now: which one, when.',
      Visual: S.RevealShapes,
    },
    {
      title: 'Predict: what property actually decides?',
      body: (
        <>
          Not every long wait needs a different model. What property of a workload actually pushes
          it from a batch DAG toward durable execution instead?
        </>
      ),
      duration: 2.8,
      fig: 'what property actually decides?',
      predict: {
        options: [
          { label: 'How many tasks the DAG has' },
          { label: 'How long the work runs and whether a human is in the loop', correct: true },
        ],
        explain: (
          <>
            Task count is a property of the DAG model itself. Duration and a human-paced wait are
            what actually push a workload toward a different model entirely.
          </>
        ),
      },
      Visual: S.PredictProperty,
    },
    {
      title: 'Reveal: the decision rule',
      body: (
        <>
          Duration (minutes/hours vs. days/months), human-in-the-loop, whether the work reads as a
          data product rather than an action, and whether a multi-system saga is needed.
        </>
      ),
      duration: 4.8,
      fig: 'duration. human-in-the-loop. data product. saga.',
      takeaway: 'Three models, one explicit rule -- not a vibe about which tool feels modern.',
      Visual: S.RevealDecisionRule,
    },
    {
      title: 'Predict: what does a hybrid design look like?',
      body: (
        <>
          Most real pipelines are mostly short tasks with one long, human-paced step buried inside.
          Does the whole pipeline have to move to a durable-execution engine?
        </>
      ),
      duration: 2.8,
      fig: 'does the whole pipeline have to move?',
      predict: {
        options: [
          { label: 'Yes -- durable execution replaces the batch DAG entirely' },
          { label: 'No -- the DAG hands off just the long step and waits on it', correct: true },
        ],
        explain: (
          <>
            Only the long, human-paced leg needs a different engine. The surrounding batch work
            keeps running exactly where it already runs well.
          </>
        ),
      },
      Visual: S.PredictHybrid,
    },
    {
      title: 'Reveal: the hybrid handoff',
      body: (
        <>
          A batch DAG or asset, at the point it needs a long-lived, human-paced step, triggers a
          durable workflow and polls or waits for it, instead of modelling the wait itself.
        </>
      ),
      duration: 4.8,
      fig: 'the dag hands off the long step. it does not model the wait.',
      takeaway: 'A hybrid design is not a compromise. It puts each shape of work on the model that fits it.',
      Visual: S.RevealHybridHandoff,
    },
    {
      title: "Reveal: why the durable side survives, sourced",
      body: (
        <>
          Per Temporal's own documentation, a crashed worker recreates a workflow's state from a
          durable, ordered history of what already happened, never from the process's own memory.
        </>
      ),
      duration: 4.8,
      fig: 'state lives in a durable history, not a process.',
      Visual: S.RevealDurableSurvival,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three models, one decision rule, and a hybrid pattern for the common case where only one
          step of a pipeline is actually long-lived and human-paced.
        </>
      ),
      duration: 4.8,
      fig: 'three models. one rule. hand off the long step.',
      takeaway: "The hook's failure wasn't Airflow being bad at waiting. It was the wrong model for a wait that long.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Two real sensors, same reschedule mode, this session's own Airflow sandbox: one polls a
          fact the metadata database holds, one polls a fact held only in a Python process.
        </>
      ),
      duration: 2.8,
      fig: 'same reschedule mode. does either survive a real restart?',
      predict: {
        options: [
          { label: 'Both survive -- reschedule mode itself is what matters' },
          { label: 'Only the one polling durable state survives', correct: true },
        ],
        explain: (
          <>
            Both tasks ran in the identical reschedule mode. Only the sensor checking a fact held
            outside the process survived a real scheduler restart mid-wait; the other's state was
            gone, exactly as the hook described.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
