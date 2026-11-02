import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Matillion's and Theobald Software's own tech notes on SAP Note 3255746, the DEV Community
// article on CDS views, SAP's own knowledge base articles on effective dating, and the
// Databricks press release on SAP Databricks (SOURCES.md). No real S/4HANA, ECC or
// SuccessFactors tenant runs in this sandbox; examples.py reproduces the mechanism
// comparison, the licensing check, and the effective-dated query logic structurally.
const reel: Reel = {
  steps: [
    {
      title: 'A pipeline that worked perfectly for two years, and still failed an audit',
      body: (
        <>
          An extraction pipeline built against an undocumented SAP endpoint ran cheaply and
          correctly for two years straight. Then an auditor opened SAP's own support note on
          that endpoint and flagged the pipeline anyway — not because it ever broke, but because
          it was never licensed to exist in the first place.
        </>
      ),
      duration: 5.0,
      Visual: S.UndocumentedEndpoint,
    },
    {
      title: 'Before the mechanisms: what actually changed here?',
      body: (
        <>
          The pipeline's behavior never changed. Its throughput never changed. What changed was
          a support note, years after the pipeline shipped. Before the four extraction
          mechanisms: can you already guess which one just got pulled out from under it?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The pipeline was reading raw tables directly, which is now banned' },
          { label: 'It used the ODP framework over RFC, from a non-SAP tool, which the note now restricts', correct: true },
          { label: 'It used OData, which SAP has always restricted for third parties' },
          { label: 'SAP banned all third-party extraction from SAP systems outright' },
        ],
        explain: (
          <>
            ODP over RFC, used by a non-SAP tool to move data out of SAP, is exactly the
            combination SAP's note restricts. RFC itself, table or CDS extraction, and OData are
            all still fine — the restriction is narrower than it first sounds.
          </>
        ),
      },
      Visual: S.PredictWhichMechanism,
    },
    {
      title: "Raw tables, and the semantic layer built over them",
      body: (
        <>
          SAP's modules — finance, materials, production, quality — store their data as raw,
          densely coded tables meant for the application, not for a human or a query engine. CDS
          views sit over those tables, written in a SQL-like language, adding names and
          relationships a table alone never carries.
        </>
      ),
      duration: 4.8,
      Visual: S.ModuleTablesAndCds,
    },
    {
      title: 'Four mechanisms, four different things they can actually see',
      body: (
        <>
          ODP delta queues and SLT trigger-based replication both see inserts, updates and
          deletes. OData's own documented limit is that it cannot reliably surface deletes.
          Database-level CDC sees row-level intermediate states that a delta queue never
          exposes. The right mechanism depends entirely on which of those a pipeline needs.
        </>
      ),
      duration: 5.0,
      Visual: S.FourMechanisms,
      takeaway: 'OData can miss a delete a trigger- or log-based mechanism would catch — the mechanism decides what gets seen.',
    },
    {
      title: "SAP's own note, stated precisely",
      body: (
        <>
          SAP first described third-party ODP use as merely unsupported. A later version turned
          that into an outright prohibition on non-SAP tools using ODP over RFC to pull data out
          of SAP. A still later update pointed customers toward SAP Datasphere instead — RFC
          itself, and table or CDS extraction, were never touched.
        </>
      ),
      duration: 5.0,
      Visual: S.NoteHistory,
      takeaway: "A note that starts as 'unsupported' and later becomes 'prohibited' is a licensing clock, not a one-time warning.",
    },
    {
      title: 'The vendor-preferred path, and a named outside partner',
      body: (
        <>
          SAP steers customers who need data outside SAP toward Datasphere and SAP Business Data
          Cloud. Inside that same platform, SAP also sells SAP Databricks, built with Databricks
          itself, sharing data in both directions with a customer's own separate Databricks
          environment under Unity Catalog governance.
        </>
      ),
      duration: 5.0,
      Visual: S.DatasphereAndDatabricks,
    },
    {
      title: 'Effective-dated records: a different cursor problem entirely',
      body: (
        <>
          SuccessFactors serves HR data over OData with an as-of-date parameter, not a plain
          updated-at column. A query whose as-of date falls outside a record's effective window
          doesn't return a stale row — it returns nothing for that record at all, and the data is
          special-category, raising the stakes of getting the window wrong.
        </>
      ),
      duration: 5.0,
      Visual: S.EffectiveDatedCursor,
      takeaway: "A record outside its effective window isn't returned stale. It isn't returned at all.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          CDS views give raw SAP tables meaning. The four mechanisms differ in what they can
          actually see, not just how fast. SAP's own note turned a once-unsupported path into a
          prohibited one, in named stages. Datasphere and SAP Databricks are the vendor's answer.
          And effective-dated HR records are a cursor problem of their own.
        </>
      ),
      duration: 4.8,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team extracts SuccessFactors position data nightly using a fixed as-of date from
          last month, and today's query is silently missing a position that was promoted into
          existence last week. Which of this topic's failure modes does that match?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "SAP Note 3255746's restriction on ODP over RFC" },
          { label: 'OData missing a delete event' },
          { label: "The as-of date falling outside the new record's effective window", correct: true },
          { label: "CDS views lacking semantic annotations" },
        ],
        explain: (
          <>
            A stale as-of date. The new position's effective window starts after the fixed
            as-of date the pipeline keeps using, so SuccessFactors filters that record out
            entirely — not a delete, a licensing issue, or a missing annotation.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
