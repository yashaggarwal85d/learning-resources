import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic hosts no lab of its own, by design (CHAPTER.md: the full index-mechanism lab needs
// the *(skipped)* upstream topics). The six-axis decision procedure this reel walks is coded as
// a real function in examples.py and run against two very different corpora, so the procedure's
// own evidence is executable, not just narrated.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two teams both need vector search: one has ten thousand support tickets and a Postgres
          database already; the other has two billion product images across a thousand tenants
          with strict per-tenant isolation.
        </>
      ),
      duration: 2.8,
      fig: 'one small and simple. One huge and strict about isolation.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: is there one best database for both',
      body: (
        <>
          Is there one "best" vector database that fits both teams equally well?
        </>
      ),
      duration: 2.4,
      fig: 'same question, two very different teams.',
      predict: {
        options: [
          { label: 'Yes — whichever engine wins the most independent benchmarks fits any team' },
          { label: "No — naming the \"best\" one is the wrong question before asking what each team actually needs", correct: true },
        ],
        explain: (
          <>
            A single ranking hides exactly the differences that matter here: corpus size, how
            complex the filtering needs to be, how fast data changes, tenancy, a latency target,
            and who wants to run the operations.
          </>
        ),
      },
      Visual: S.PredictOneBest,
    },
    {
      title: 'Reveal: the six axes',
      body: (
        <>
          Corpus size, filter complexity, update rate, tenancy, a latency target, and operational
          ownership — six criteria to walk through, not a score to add up.
        </>
      ),
      duration: 4.2,
      fig: 'six criteria. Not a leaderboard.',
      Visual: S.RevealSixAxes,
    },
    {
      title: 'Reveal: pgvector and pgvectorscale',
      body: (
        <>
          pgvector is a Postgres extension, so a team already running Postgres gets vector search
          without operating a new system at all. pgvectorscale's own disk-backed index closes the
          scale gap once the usual in-memory index no longer fits.
        </>
      ),
      duration: 4.5,
      fig: 'already running Postgres. Nothing new to operate.',
      takeaway: 'Not adding a second system to operate is itself a real, countable advantage, not an afterthought.',
      Visual: S.RevealPgvector,
    },
    {
      title: 'Reveal: the dedicated engines',
      body: (
        <>
          Four engines, four different trade-offs: one built for the largest sharded deployments,
          one known for strong filtering and simple self-hosting, one with hybrid search as a
          first-class feature, and one fully managed, trading a vendor bill for operations time.
        </>
      ),
      duration: 4.5,
      fig: 'four engines. Four different bets, not four rows on one chart.',
      takeaway: "Every specific number a vendor publishes is that vendor's own benchmark, not a fact about the whole category.",
      Visual: S.RevealDedicatedEngines,
    },
    {
      title: 'Reveal: search engines and lakehouse-native options',
      body: (
        <>
          A text-search engine with vectors added fits a team whose main need was hybrid search
          already. A lakehouse-native vector format skips a separate database entirely, at the
          cost of slower queries.
        </>
      ),
      duration: 4.2,
      fig: 'no new database at all, if query speed can give a little.',
      takeaway: 'Skipping a separate database is a trade, not a free win — the cost shows up in query latency.',
      Visual: S.RevealSearchAndLakehouse,
    },
    {
      title: "Reveal: walking the six axes on the shop's own corpus",
      body: (
        <>
          Small corpus, a simple tenant model, a comfortable latency target, and a team that
          wants to keep its own operations — the procedure lands on pgvector because of these
          specific numbers, not because pgvector "won" anything.
        </>
      ),
      duration: 4.5,
      fig: "the shop's own numbers, walked through, land here.",
      takeaway: 'The answer follows from the numbers in front of you, never from which engine has the loudest marketing.',
      Visual: S.RevealShopWalkthrough,
    },
    {
      title: 'Reveal: the same procedure on a different corpus',
      body: (
        <>
          Run the identical six axes on a hypothetical corpus instead: billions of vectors, a
          high update rate, strict per-tenant isolation. The same procedure lands somewhere else
          entirely.
        </>
      ),
      duration: 4.5,
      fig: 'same six axes. A completely different corpus. A different landing spot.',
      takeaway: 'The lesson is the procedure itself, never either specific answer it happened to reach.',
      Visual: S.RevealDifferentCorpus,
    },
    {
      title: 'Recap',
      body: (
        <>
          Walk six axes as criteria, never a score. Let a team already on Postgres stay there.
          Pick a dedicated engine for its own trade-off. Trust the procedure, not a vendor's
          headline number.
        </>
      ),
      duration: 4.5,
      fig: 'six axes, a procedure, two honest answers.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A vendor publishes a benchmark showing their engine beats every competitor, at every
          scale.
        </>
      ),
      duration: 2.6,
      fig: 'one benchmark. Every competitor. Every scale, they say.',
      predict: {
        options: [
          { label: "Trust the number outright — a published benchmark is evidence enough on its own" },
          { label: "Trust the measured number at its own tested configuration; don't assume it transfers to your corpus", correct: true },
        ],
        explain: (
          <>
            The number may be real at the configuration the vendor actually tested. Whether it
            holds for a different corpus size, update rate, or tenancy model is exactly what the
            six-axis procedure checks — on your own numbers, not theirs.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
