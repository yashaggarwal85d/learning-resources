import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No new mechanism of its own: this topic compares tools taught earlier in this chapter
// (Airflow, Dagster) against tools sourced only (AWS Step Functions, Google Workflows,
// Lakeflow Jobs, Netflix Maestro, Prefect, Kestra). Every number on screen is verified word
// for word against the fetched source text in examples.py (FACT-CHECK.md, SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A team picks Airflow because everyone uses it, then spends more engineer-hours a year
          keeping the scheduler and metadata database healthy than the pipelines took to write.
        </>
      ),
      duration: 4.8,
      fig: 'picked because everyone uses it. wrong quadrant for the job.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the grid, named',
      body: (
        <>
          Four axes any orchestrator sits on: data-awareness, operational burden, ecosystem, and
          how hard it is to leave. Every tool compared in this topic gets placed on all four.
        </>
      ),
      duration: 4.8,
      fig: 'four axes, not one best tool.',
      Visual: S.RevealGrid,
    },
    {
      title: "Predict: which axis does the hook's team get wrong?",
      body: (
        <>
          The team's workload is short, high-volume, and uses no custom operators. Airflow fits
          none of those traits especially well. Which axis actually explains their choice?
        </>
      ),
      duration: 2.8,
      fig: "which axis did the hook's team actually get wrong?",
      predict: {
        options: [
          { label: 'Ecosystem -- they needed a specific connector only Airflow has' },
          { label: 'None of the four -- they optimized for familiarity instead', correct: true },
        ],
        explain: (
          <>
            Nothing about data-awareness, burden, ecosystem, or coupling drove the choice. The
            team picked the tool it already knew, not the tool that fit the job's actual shape.
          </>
        ),
      },
      Visual: S.PredictWhichAxis,
    },
    {
      title: 'Reveal: Standard vs. Express, with real numbers',
      body: (
        <>
          AWS's own two serverless state-machine types: Standard runs up to a year with
          exactly-once semantics; Express runs up to five minutes with at-least-once semantics,
          priced and billed on entirely different terms.
        </>
      ),
      duration: 4.8,
      fig: 'standard vs express, sourced from aws own docs.',
      takeaway: "A serverless state machine isn't one tool with two modes. It's two different trade-offs wearing the same name.",
      Visual: S.RevealStandardExpress,
    },
    {
      title: "Predict: does a serverless state machine have its own fan-out primitive?",
      body: (
        <>
          Topic four's dynamic task mapping let an Airflow DAG expand to match data discovered at
          runtime. Does a serverless state machine have anything built for that same shape of job?
        </>
      ),
      duration: 2.8,
      fig: "does a serverless state machine need its own fan-out primitive?",
      predict: {
        options: [
          { label: "No -- fan-out has to be hand-rolled with a loop state" },
          { label: 'Yes -- a managed primitive exists for exactly this', correct: true },
        ],
        explain: (
          <>
            A dedicated primitive handles large-scale fan-out as a first-class managed feature,
            the same way dynamic task mapping does on the task-DAG side.
          </>
        ),
      },
      Visual: S.PredictFanoutPrimitive,
    },
    {
      title: 'Reveal: Distributed Map, sourced',
      body: (
        <>
          AWS's own Distributed Map runs up to ten thousand child workflow executions in parallel
          by default, each with its own separate execution history from the parent's.
        </>
      ),
      duration: 4.8,
      fig: 'distributed map: 10,000 parallel child executions, sourced.',
      takeaway: "A managed fan-out primitive isn't a bigger loop. It gives every child its own history, by design.",
      Visual: S.RevealDistributedMap,
    },
    {
      title: 'Reveal: the rest of the field, named',
      body: (
        <>
          Dagster and Prefect 3, Python-native and dynamic; Kestra, YAML-declarative; Netflix
          Maestro, sourced but not independently runnable; Lakeflow Jobs, the renamed Databricks
          Workflows; Azure/Fabric Data Factory; Google Workflows -- each placed on the same grid.
        </>
      ),
      duration: 4.8,
      fig: 'the rest of the field, placed on the same grid.',
      Visual: S.RevealTheField,
    },
    {
      title: 'Recap',
      body: (
        <>
          Four axes, not one best tool: data-awareness, operational burden, ecosystem, cloud
          coupling. The hook's team optimized for none of them -- only for what it already knew.
        </>
      ),
      duration: 4.8,
      fig: 'four axes, not one best tool.',
      takeaway: 'There is no single best orchestrator. There is only the tool that fits a workload on all four axes.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A different workload this time: short-running, high-volume, no custom operators needed.
          Does the same four-axis grid still point toward the hook's shop's own choice, Airflow?
        </>
      ),
      duration: 2.8,
      fig: 'a different workload. same grid, same tool?',
      predict: {
        options: [
          { label: "Yes -- the grid always points to whichever tool is already in use" },
          { label: "No -- this workload's shape points toward a serverless state machine instead", correct: true },
        ],
        explain: (
          <>
            Short, high-volume, no custom operators is exactly the Express workflow's own shape.
            The grid doesn't pick a favorite; it just stops pointing at Airflow once the job's
            shape no longer calls for it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
