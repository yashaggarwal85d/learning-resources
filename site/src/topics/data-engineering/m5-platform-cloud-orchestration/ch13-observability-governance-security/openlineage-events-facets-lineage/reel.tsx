import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py, modelling OpenLineage's own documented run-event and
// column-lineage-facet mechanics): a START event carries no output dataset, and a later
// COMPLETE event for the same run id adds the output and a schema facet; and for a query with
// a UDF and a table name built from a runtime parameter, parsing the SQL text alone misses the
// UDF's hidden second input and never resolves the dynamic table name, while walking the
// actual runtime plan sees both.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A column in `analytics.daily_revenue` is wrong. You have the Spark code and a catalog
          that says "derived from orders." Which input columns, through which transformations,
          produced that one number -- and would parsing the SQL text give the same answer as
          reading the plan the engine actually ran?
        </>
      ),
      duration: 5,
      fig: 'one column, wrong. Which inputs, which transforms -- and does SQL match the plan?',
      Visual: S.Hook,
    },
    {
      title: "Reveal: a Job, a Run and a Dataset -- OpenLineage's own object model",
      body: (
        <>
          OpenLineage's own object model has three parts. A Job is a defined piece of work -- a
          task, a model, a query. A Run is one occurrence of that job executing. A Dataset is
          whatever it reads or writes.
        </>
      ),
      duration: 4.8,
      fig: 'Job: defined work. Run: one occurrence. Dataset: what it reads or writes.',
      Visual: S.RevealObjectModel,
    },
    {
      title: "Predict: a job's run sends a START event, then later a COMPLETE event. Does the COMPLETE event know about the output dataset from the very start?",
      body: (
        <>
          A run sends a START event when the job begins, and a COMPLETE event when it finishes.
          Does the output dataset already show up at START, or only once COMPLETE is sent?
        </>
      ),
      duration: 2.8,
      fig: 'START fires first. Output dataset: known then, or only at COMPLETE?',
      predict: {
        options: [
          { label: 'It shows up at START too -- the job already knows what it will write' },
          { label: "Only at COMPLETE -- START can't know an output that doesn't exist yet", correct: true },
        ],
        explain: (
          <>
            Only at COMPLETE. OpenLineage's own events are additive: START carries what's known
            when the job begins, and COMPLETE adds whatever became true by the time it finished
            -- including the output dataset itself.
          </>
        ),
      },
      Visual: S.PredictStartComplete,
    },
    {
      title: 'Reveal: no -- measured directly, START carries no output at all; COMPLETE adds it later, under the same run id',
      body: (
        <>
          Measured directly: the START event for a run has an empty output list. The COMPLETE
          event for that exact same run id adds the output dataset and a schema facet --
          nothing about the output existed in the record until that moment.
        </>
      ),
      duration: 4.8,
      fig: 'START: no outputs, measured. COMPLETE, same run id: output added.',
      Visual: S.RevealAdditiveEvents,
    },
    {
      title: "Elaborate: facets are optional, versioned attachments -- a schema, a column-lineage mapping, a data-quality result, a job's own SQL",
      body: (
        <>
          A facet is an optional, versioned attachment to a run, a job or a dataset -- a
          schema, a column-lineage mapping, a data-quality result, the SQL text itself. A
          consumer that doesn't recognize a particular facet just ignores it and keeps the rest.
        </>
      ),
      duration: 5,
      fig: 'facets: schema, lineage, quality, SQL. unknown facet? ignored, not broken.',
      takeaway: "A facet is optional by design, so a consumer that doesn't understand one simply skips it instead of breaking.",
      Visual: S.ElaborateFacets,
    },
    {
      title: 'Predict: a query has a CASE expression, a UDF and a table name built from a parameter. Does parsing its SQL text find the same column lineage as reading the engine’s actual plan?',
      body: (
        <>
          Parse the raw SQL text of a job that has a CASE expression, calls a user-defined
          function, and reads from a table name assembled from a runtime parameter. Does that
          text parse find the same column-to-column lineage as actually watching the engine run
          the query?
        </>
      ),
      duration: 2.8,
      fig: 'CASE, a UDF, a dynamic table name. Text parse vs. the real plan: same lineage?',
      predict: {
        options: [
          { label: 'Yes -- the SQL text names every column and table the query touches' },
          { label: "No -- a UDF's own insides and a parameter-built name are invisible to plain text", correct: true },
        ],
        explain: (
          <>
            No. The SQL text shows that a UDF gets called, but nothing about what it actually
            reads inside its own body, and a table name built from a parameter never resolves
            to an actual name in the text at all.
          </>
        ),
      },
      Visual: S.PredictSqlVsPlan,
    },
    {
      title: "Reveal: no -- measured directly, SQL-text parsing misses the UDF's hidden input and never resolves the dynamic table name; the runtime plan sees both",
      body: (
        <>
          Measured directly: parsing the text finds only the UDF's one visible argument,
          missing a second column the function actually reads internally, and the table name
          stays an unresolved placeholder. Walking the actual runtime plan sees the UDF's real,
          full set of inputs and the table name exactly as it resolved.
        </>
      ),
      duration: 5,
      fig: 'text parse: misses a hidden input, unresolved table, measured. plan: sees both.',
      Visual: S.RevealSqlMissesEdges,
    },
    {
      title: 'Elaborate: integrations -- the Airflow provider is now built directly into Airflow itself; Spark, Flink and dbt each emit the same event shape from their own internals',
      body: (
        <>
          The Airflow integration used to be a separate, fragile package; it now lives inside
          Airflow itself as a built-in provider. Spark listens on its own job events, Flink and
          dbt do the equivalent from their own internals -- different engines, the identical
          event shape.
        </>
      ),
      duration: 5,
      fig: 'Airflow: now built in. Spark, Flink, dbt: same events, different engines.',
      takeaway: 'Every integration speaks the same event shape, so one consumer can read lineage from engines that share nothing else.',
      Visual: S.ElaborateIntegrations,
    },
    {
      title: 'Reveal: Marquez is the reference implementation, open-sourced by WeWork; DataHub and cloud catalogs consume the same events too',
      body: (
        <>
          Marquez is the reference implementation of the OpenLineage spec, open-sourced by
          WeWork, storing and visualizing exactly these events. It isn't the only consumer --
          DataHub and various cloud catalogs read the same event stream into their own graphs.
        </>
      ),
      duration: 5,
      fig: 'Marquez: reference server, WeWork. same events also feed DataHub, cloud catalogs.',
      Visual: S.RevealMarquezConsumers,
    },
    {
      title: 'Elaborate: the gaps static lineage misses -- anything decided at runtime, and anything that leaves the instrumented systems',
      body: (
        <>
          A lineage graph built this way is only as complete as its instrumentation. Anything
          decided purely at runtime and never emitted as an event, and anything that leaves the
          instrumented systems entirely -- a spreadsheet export, a manual copy -- simply isn't
          in the graph.
        </>
      ),
      duration: 5,
      fig: 'misses: whatever runtime decides but never emits; whatever leaves the system.',
      Visual: S.ElaborateStaticLineageGaps,
    },
    {
      title: 'Recap',
      body: (
        <>
          A Job, a Run and a Dataset, reported through additive START and COMPLETE events.
          Facets attach optional meaning that a consumer can safely ignore. And reading the
          actual runtime plan always sees more than parsing the SQL text ever can.
        </>
      ),
      duration: 5,
      fig: 'events: additive. facets: optional. the plan always knows more than the text.',
      takeaway: 'A lineage graph is exactly as trustworthy as whatever actually ran, not whatever the SQL text merely suggests.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
