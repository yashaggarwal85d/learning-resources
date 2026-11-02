import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py, modelling the exact architectures DataHub's and
// OpenMetadata's own documentation describe): a push-based catalog reflects a change the
// instant its event arrives, while a crawl-based catalog shows the old state until its next
// scheduled crawl; and an object created and dropped entirely between two crawl runs is never
// seen by a crawl-based catalog at all, while a push-based one records both its create and
// drop events.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's catalog was last crawled on Sunday. On Wednesday a table was dropped,
          another created, and a column renamed. A stakeholder searching Thursday finds the old
          table, confidently marked certified. What would the catalog need to be built
          differently to be right within seconds, and what does that change in who has to do the
          work?
        </>
      ),
      duration: 5,
      fig: 'crawled Sunday. Changes Wednesday. Thursday search still finds the old, certified one.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a metadata graph -- tables, columns, a glossary term, an owner and a tag, as nodes; owns/derives-from/tagged-with as edges',
      body: (
        <>
          A catalog is a graph. A table, a column, a dashboard, a person, a tag and a glossary
          term are all nodes. "Owns," "derives from" and "tagged with" are the edges between
          them, held in a store with a search index over it.
        </>
      ),
      duration: 4.8,
      fig: 'tables, columns, terms, owners, tags as nodes; owns/derives/tagged as edges.',
      Visual: S.RevealMetadataGraph,
    },
    {
      title: 'Predict: the Wednesday rename. Does a crawl-based catalog or a push-based one show it first on Thursday?',
      body: (
        <>
          The rename happens Wednesday. The search happens Thursday. One of these two catalog
          designs shows the new name by then. Which one?
        </>
      ),
      duration: 2.8,
      fig: 'rename Wednesday, search Thursday. Crawl-based or push-based: which already knows?',
      predict: {
        options: [
          { label: "The crawl-based one -- it's had almost a full day to catch up" },
          { label: "The push-based one -- it never waits for a scheduled run at all", correct: true },
        ],
        explain: (
          <>
            The push-based one. It doesn't wait for anything scheduled; the rename itself emits
            an event the moment it happens. The crawl-based catalog only updates when its own
            schedule says to.
          </>
        ),
      },
      Visual: S.PredictCrawlVsPush,
    },
    {
      title: 'Reveal: push wins by the whole gap, measured directly -- push sees the rename immediately; crawl shows the old name until its next scheduled run',
      body: (
        <>
          Measured directly: at the moment of Thursday's search, the push-based catalog already
          shows the new name. The crawl-based one still shows the old name, and will keep
          showing it until its next scheduled crawl actually runs -- days away, by this
          schedule.
        </>
      ),
      duration: 4.8,
      fig: 'Thursday: push already renamed. Crawl: still old, days from its next run, measured.',
      Visual: S.RevealPushWinsImmediately,
    },
    {
      title: 'Elaborate: search, usage statistics and a glossary are the three things a catalog is used for day to day',
      body: (
        <>
          Underneath the architecture debate, a catalog earns its keep on three everyday jobs.
          Search, ranked by usage, finds a dataset. Query counts, owners and freshness let
          someone trust it. A glossary of business terms linked to columns lets people agree on
          what something even means.
        </>
      ),
      duration: 5,
      fig: 'find it: search. trust it: usage stats. agree on it: glossary.',
      takeaway: 'A catalog earns its use three ways: finding a dataset, trusting it, and agreeing what it actually means.',
      Visual: S.ElaborateDailyUses,
    },
    {
      title: 'Predict: a table is created and dropped entirely between two crawl runs. Does a crawl-based catalog ever see it existed?',
      body: (
        <>
          A table gets created on Monday and dropped on Tuesday. The next scheduled crawl isn't
          until the following Sunday. Does that crawl-based catalog ever learn the table
          existed at all?
        </>
      ),
      duration: 2.8,
      fig: 'created Monday, dropped Tuesday, next crawl Sunday. Does the crawl ever see it?',
      predict: {
        options: [
          { label: "Yes -- it will show up as a deleted entity once the next crawl runs" },
          { label: "No -- the crawl only ever sees what exists at crawl time, never in between", correct: true },
        ],
        explain: (
          <>
            No. A crawler only ever reads the source as it is at the moment it runs. If the
            table is already gone by then, nothing about that crawl run has any way to know it
            was ever there.
          </>
        ),
      },
      Visual: S.PredictCreateDropBetweenCrawls,
    },
    {
      title: 'Reveal: no -- measured directly, a crawl-based catalog never sees it at all; a push-based one sees both the create and the drop events',
      body: (
        <>
          Measured directly: the crawl-based catalog's state never contains the table at any
          point -- not as present, not as deleted. The push-based catalog, meanwhile, recorded
          both the create event and the drop event as they happened.
        </>
      ),
      duration: 4.8,
      fig: 'crawl: never knew it existed, measured. push: recorded both create and drop.',
      Visual: S.RevealCrawlNeverSeesIt,
    },
    {
      title: 'Elaborate: a technical catalog answers where a table’s files are and who may read them; a business catalog answers what a column means, who owns it, and where it came from',
      body: (
        <>
          Those are two different questions, answered by two different kinds of catalog. A
          technical catalog resolves a table name to its files and enforces who can read them.
          A business catalog describes and relates assets across systems -- meaning, ownership,
          origin.
        </>
      ),
      duration: 5,
      fig: 'technical: files, access. business: meaning, owner, lineage.',
      takeaway: "A technical catalog answers where the files are; a business catalog answers what the column even means.",
      Visual: S.ElaborateTechnicalVsBusiness,
    },
    {
      title: 'Reveal: open source splits along that line -- Unity Catalog OSS and Apache Polaris are technical catalogs; DataHub and OpenMetadata are business/discovery catalogs; Collibra, Atlan and Alation are commercial products covering the business side',
      body: (
        <>
          Unity Catalog OSS and Apache Polaris resolve a table to its files and enforce access --
          technical catalogs, building on this course's own table-format and catalog-protocol
          topics. DataHub and OpenMetadata describe and relate assets across systems --
          discovery catalogs. Collibra, Atlan and Alation are commercial products doing the same
          discovery job.
        </>
      ),
      duration: 5,
      fig: 'technical: Unity Catalog OSS, Polaris. discovery: DataHub, OpenMetadata, Collibra, Atlan, Alation.',
      Visual: S.RevealOpenSourceSplit,
    },
    {
      title: 'Reveal: Polaris graduated to a top-level Apache project in February 2026; Amundsen was archived for inactivity in September 2026 -- stronger than the syllabus’s own "low-activity"',
      body: (
        <>
          Two status facts worth getting exactly right. Apache Polaris's own blog announced its
          graduation from the Incubator to a top-level Apache Software Foundation project in
          February 2026. Amundsen's own repository says it was archived due to inactivity in
          September 2026 -- not merely low-activity but actually closed to new contributions.
        </>
      ),
      duration: 5,
      fig: "Polaris: top-level ASF project, February 2026. Amundsen: archived, September 2026.",
      Visual: S.RevealStatusFacts,
    },
    {
      title: 'Recap',
      body: (
        <>
          A catalog is a graph of entities and relationships, kept current by push events, not
          by a scheduled crawl. It earns its use through search, trust signals and a glossary.
          And a technical catalog's question is never the same as a business catalog's.
        </>
      ),
      duration: 5,
      fig: 'graph, kept current by push. technical vs business: different questions entirely.',
      takeaway: "A catalog that only crawls is always behind; one built on events can be as current as the change itself.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
