import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed in examples.py: a Wednesday change under a weekly crawl stays
// stale until the following Sunday; the same change under push is stale for zero time; a search
// ranked by usage returns the live table ahead of the stale one despite both being "certified."
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's catalog was last crawled on Sunday. By Wednesday a table's dropped, another's
          created, a column's renamed. A stakeholder searches Thursday — and finds the old table,
          confidently marked certified.
        </>
      ),
      duration: 6,
      fig: 'crawled Sunday. Changed Wednesday. Still "certified" Thursday.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: crawl faster, push, or both?',
      body: (
        <>
          To be right within seconds of a change, not days: crawl more often, switch to push
          events, or does it take both — and what does each one actually buy you?
        </>
      ),
      duration: 6,
      fig: 'right within seconds. Crawl faster, push, or both?',
      predict: {
        options: [
          { label: 'Crawling more often closes the gap on its own' },
          { label: 'Push closes it; crawling only ever narrows the same gap', correct: true },
        ],
        explain: (
          <>
            A crawl is only ever as fresh as its last run — more frequent crawls shrink the
            window between a change and its detection, but never close it. A push event fires the
            instant the change happens.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: what a catalog actually stores',
      body: (
        <>
          A table, a column, a person, a tag — each one a node. "Owns," "derives from," "tagged
          with" — each one a named edge between two nodes. A catalog is that graph, held in one
          place and made searchable.
        </>
      ),
      duration: 6,
      fig: 'nodes for things, named edges between them. One searchable graph.',
      Visual: S.RevealGraphModel,
    },
    {
      title: 'Reveal: two ways metadata gets in',
      body: (
        <>
          A crawler sweeps a source system on a schedule — stale for exactly as long as its own
          interval, every time. A push integration emits metadata the instant code runs — stale
          for none of that time at all.
        </>
      ),
      duration: 6.4,
      fig: "crawl: stale for a whole interval. Push: stale for none of it.",
      takeaway: 'A crawl is stale for its whole interval, every time — a push integration is stale for none of it.',
      Visual: S.RevealCrawlVsPush,
    },
    {
      title: 'Reveal: the three daily jobs',
      body: (
        <>
          Find a dataset — search ranked by usage. Trust it — query counts, owners, freshness.
          Agree on what it means — a glossary of terms linked to the columns that carry them.
        </>
      ),
      duration: 6,
      fig: 'find it, trust it, agree on it. Three jobs, every day.',
      Visual: S.RevealDailyJobs,
    },
    {
      title: 'Reveal: open source and enterprise, named',
      body: (
        <>
          DataHub, OpenMetadata, Unity Catalog's open edition, Apache Polaris — open technical
          catalogs. Collibra, Atlan, Alation — enterprise products, named here without a feature
          claim beyond what each one's own page actually says.
        </>
      ),
      duration: 6,
      fig: 'open: DataHub, OpenMetadata, Polaris. Enterprise: Collibra, Atlan, Alation.',
      Visual: S.RevealOpenVsEnterprise,
    },
    {
      title: 'Reveal: two different questions, two catalogs',
      body: (
        <>
          A technical catalog answers where this table's files live and who may read them. A
          business catalog answers what the column means, who owns it, whether it's certified.
          Same table, two different questions.
        </>
      ),
      duration: 6.4,
      fig: 'where, and who may read. What it means, and who owns it.',
      takeaway: 'A technical catalog answers where and who may read; a business catalog answers what it means and who owns it.',
      Visual: S.RevealTechnicalVsBusiness,
    },
    {
      title: 'Reveal: a name worth retiring',
      body: (
        <>
          The syllabus still calls one open-source catalog "low-activity." Its own repository says
          something stronger: archived by its owner, for inactivity. The page is right; the label
          is the thing that's gone stale here.
        </>
      ),
      duration: 6,
      fig: '"low-activity," the syllabus says. "Archived," the repo says.',
      takeaway: 'A syllabus label can go stale faster than the project it describes — check the primary page, not the label.',
      Visual: S.RevealNameRetired,
    },
    {
      title: 'Recap',
      body: (
        <>
          A catalog is a graph of entities and edges. Crawling has a staleness window a push
          doesn't. Finding, trusting and agreeing on meaning are the three daily jobs. Open source
          and enterprise both exist. Technical and business catalogs answer different questions.
          And a label can outlive what it once described.
        </>
      ),
      duration: 6.4,
      fig: 'a graph; a staleness gap; three jobs; two kinds of catalog.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The same shop adds push for its tables, but its dashboards are still only crawled
          nightly. A dashboard changes on Wednesday. Is the catalog's view of it current by
          Thursday, or still stale — and why?
        </>
      ),
      duration: 6.4,
      fig: 'tables: push. Dashboards: still crawled. Current by Thursday?',
      predict: {
        options: [
          { label: 'Current — once any part of the catalog uses push, the whole thing is fresh' },
          { label: 'Still stale — freshness is per integration, and dashboards are still on the crawl', correct: true },
        ],
        explain: (
          <>
            Freshness isn't a property of the catalog as a whole — it's a property of each
            integration feeding it. Tables being pushed doesn't touch dashboards, which are still
            waiting on their own next scheduled crawl.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
