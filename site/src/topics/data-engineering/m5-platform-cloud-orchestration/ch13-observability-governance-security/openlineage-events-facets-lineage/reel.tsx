import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed in examples.py: a real openlineage-python client emits a real
// START and COMPLETE event over a real HTTP round trip to a local receiver; the SQL-parse-vs-
// runtime comparison runs on the same synthetic job, counting edges each approach actually finds.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A column in the shop's revenue table is wrong. The catalog says "derived from orders."
          Which input columns, through which transformations, actually produced that number — and
          does reading the SQL text agree with what the engine actually ran?
        </>
      ),
      duration: 6.4,
      fig: 'wrong column. "derived from orders." Which inputs, exactly?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does reading the SQL text see everything?',
      body: (
        <>
          The query has a CASE expression and a table name still a parameter at read time. Reading
          the SQL text alone — does it find the same input columns the engine actually touches?
        </>
      ),
      duration: 6.4,
      fig: 'a CASE, a parameter table name. Same columns found?',
      predict: {
        options: [
          { label: 'Yes — the SQL text already names every column the query touches' },
          { label: 'No — a condition column and an unresolved table name both go missing', correct: true },
        ],
        explain: (
          <>
            Reading the text alone finds only what the query literally spells out. A CASE
            condition and a parameter resolved only at run time both sit outside that reach.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: a job, a run, a dataset',
      body: (
        <>
          A job is the defined piece of work; a run is one occurrence of it in time; a dataset is
          what it reads or writes. A run starts, then reaches a terminal state — later events for
          the same run only add to what's already recorded.
        </>
      ),
      duration: 6.4,
      fig: 'job: the work. run: one occurrence. dataset: read or write.',
      Visual: S.RevealEventModel,
    },
    {
      title: 'Reveal: facets, attached and versioned',
      body: (
        <>
          A facet is a named, optional piece of metadata on a run, job or dataset — a schema, a
          column-lineage mapping, a data-quality result, the job's own SQL — each pointing to its
          own versioned schema, so a consumer that doesn't recognise one can skip it.
        </>
      ),
      duration: 6.4,
      fig: 'schema, column lineage, SQL — each a named, versioned facet.',
      takeaway: 'A facet is optional and versioned — a consumer can skip a facet it does not recognise.',
      Visual: S.RevealFacets,
    },
    {
      title: 'Reveal: who emits the events',
      body: (
        <>
          Airflow's own provider package emits these now — the older integration gets no more
          fixes. Spark emits them from a listener attached to its engine. Flink and dbt have their
          own integrations, each emitting the same event shape.
        </>
      ),
      duration: 6.4,
      fig: "Airflow's provider, Spark's listener, Flink, dbt — one event shape.",
      Visual: S.RevealIntegrations,
    },
    {
      title: 'Reveal: who reads the events',
      body: (
        <>
          Marquez is the reference server for this — built and released by the project that
          defined the standard. DataHub and cloud catalogs read the exact same events; nothing
          about the format favours any one consumer.
        </>
      ),
      duration: 6.4,
      fig: 'Marquez, DataHub, cloud catalogs — one event, many readers.',
      takeaway: 'Marquez, DataHub and a cloud catalog all read the same event shape — the standard carries the meaning.',
      Visual: S.RevealConsumers,
    },
    {
      title: "Reveal: a run that names its parent",
      body: (
        <>
          One task's run can carry a facet naming the run that spawned it — a Spark job's run
          pointing back to the Airflow task that triggered it, and that task's run pointing back
          to its own DAG's run. One failing node, traced to one trigger.
        </>
      ),
      duration: 6.4,
      fig: 'a run names its parent run. One trigger, found from any node.',
      Visual: S.RevealParentRun,
    },
    {
      title: 'Reveal: reading text versus reading the plan',
      body: (
        <>
          Reading the SQL text finds only the table and column names written in the query. Reading
          the engine's own resolved plan sees the CASE's condition column and the parameter's
          actual value — the exact two edges the text alone was always going to miss.
        </>
      ),
      duration: 6.4,
      fig: 'text: names only. the resolved plan: the condition, the parameter too.',
      takeaway: 'Reading SQL text finds only the names written in the query; the resolved plan finds what text never spelled out.',
      Visual: S.RevealParseVsRuntime,
    },
    {
      title: 'Recap',
      body: (
        <>
          A job, a run, a dataset — and a run that starts, then settles. Facets attach optional,
          versioned detail. Airflow, Spark, Flink and dbt emit; Marquez, DataHub and a cloud
          catalog read. A parent-run facet ties any node back to its trigger. And the resolved
          plan sees past a query's own surface in a way the text alone cannot.
        </>
      ),
      duration: 6.4,
      fig: 'job, run, dataset; facets; emitters and readers; text vs plan.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A daily job's output table name is built from the run date, so it's a different literal
          string every single day. Collected from the resolved plan, does this job's lineage show
          one dataset node over time, or a new one every day — and why?
        </>
      ),
      duration: 6.4,
      fig: "table name built from the date. One node over time, or a new one daily?",
      predict: {
        options: [
          { label: 'One node — the lineage graph understands the table is logically the same dataset' },
          { label: 'A new node each day — lineage records exactly the resolved name it saw, nothing more', correct: true },
        ],
        explain: (
          <>
            Lineage collection has no idea two different literal names mean the same table to a
            person. It records the resolved name it actually saw — a new node every day, unless
            something upstream normalises the name first.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
