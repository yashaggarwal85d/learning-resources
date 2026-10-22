import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A customer/order/product domain built fresh for this topic's lab — no customers/products table
// exists in this sandbox's public schema (SOURCES.md). The join counts below are the literal JOIN
// count in each query's own SQL text, measured directly on PostgreSQL, not estimated (examples.py).
// The hash-key determinism check is a real Python computation, not an assertion.
const reel: Reel = {
  steps: [
    {
      title: 'Same domain, three models, one question',
      body: (
        <>
          A customer, an order, a product — modeled three separate ways. "What was this customer's
          address on this order's date" is a question every one of them can answer, at a very
          different cost.
        </>
      ),
      duration: 4.8,
      fig: '3NF, star, Data Vault — same domain, same question',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a hub hold descriptive data too?',
      body: (
        <>
          A hub holds a business key. Does it also hold the descriptive attributes that go along
          with it — a customer's name, say, alongside their customer number?
        </>
      ),
      duration: 2.8,
      fig: 'a hub holds the business key — descriptive data too?',
      predict: {
        options: [
          { label: 'Yes — everything about the key lives in one place' },
          { label: 'No — descriptive attributes live somewhere else entirely', correct: true },
        ],
        explain: (
          <>
            No. A hub holds the business key and nothing else; everything descriptive is kept in a
            separate table, on purpose.
          </>
        ),
      },
      Visual: S.PredictHubContents,
    },
    {
      title: 'Reveal: hubs',
      body: (
        <>
          A hub holds the business key, and nothing else. Its own definition, quoted directly: low
          propensity to change, no descriptive attributes at all.
        </>
      ),
      duration: 4.8,
      fig: 'hub: business key only. no descriptive attributes.',
      Visual: S.RevealHubs,
    },
    {
      title: 'Reveal: links',
      body: (
        <>
          A link captures the relationship between hubs, often many to many. The participating hub
          keys themselves define the grain of that relationship.
        </>
      ),
      duration: 4.8,
      fig: 'link: the relationship between hubs, often many-to-many',
      Visual: S.RevealLinks,
    },
    {
      title: 'Reveal: satellites',
      body: (
        <>
          A satellite holds the descriptive attributes, and their history, attached to a hub or
          link. Append-only: every change is preserved, not overwritten.
        </>
      ),
      duration: 4.8,
      fig: 'satellite: descriptive attributes, append-only history',
      Visual: S.RevealSatellites,
    },
    {
      title: 'Predict: can separate loaders run with no coordinator?',
      body: (
        <>
          Hubs, links and satellites are loaded by separate processes, with nothing coordinating
          between them. Is that actually safe?
        </>
      ),
      duration: 2.8,
      fig: 'separate loaders, no coordinator — actually safe?',
      predict: {
        options: [
          { label: 'Only with a sequence assigning keys in order' },
          { label: "Yes, if every loader derives the same key independently", correct: true },
        ],
        explain: (
          <>
            Yes — but only because the key itself is derived the same way everywhere, not assigned by
            a single coordinator anyone has to wait on.
          </>
        ),
      },
      Visual: S.PredictParallelLoad,
    },
    {
      title: 'Reveal: hash keys make it safe, computed',
      body: (
        <>
          Two separate loaders hash the same business key, with zero coordination between them, and
          land on the identical key. That determinism, computed directly, not just asserted, is the
          whole mechanism.
        </>
      ),
      duration: 4.8,
      fig: 'loader A hash = loader B hash, no coordination at all',
      takeaway: 'Every loader deriving the identical key independently is what makes coordination-free loading safe.',
      Visual: S.RevealHashDeterminism,
    },
    {
      title: 'Reveal: why a sequence could not do this',
      body: (
        <>
          A sequence-generated key forces a child row to look up its parent's already-assigned key
          first. That lookup is a load-order dependency a deterministic hash key removes entirely.
        </>
      ),
      duration: 4.8,
      fig: 'sequence: look up the parent key first. hash: nothing to look up.',
      Visual: S.RevealSequenceDependency,
    },
    {
      title: 'Reveal: the same query, three ways, measured',
      body: (
        <>
          The as-of-address query against this topic's own built domain: one join in the 3NF schema,
          one join in the star schema, four joins and a correlated lookup in raw Data Vault — the
          literal count in each query's own SQL, not an estimate.
        </>
      ),
      duration: 4.8,
      fig: '3NF: one join. star: one join. raw vault: four joins, one lookup.',
      Visual: S.RevealJoinCounts,
    },
    {
      title: 'Reveal: why raw vault costs more to query',
      body: (
        <>
          The exact split that makes loading easy — business keys, relationships and history kept in
          separate tables — is what makes querying expensive: every one of those tables has to be
          rejoined at read time.
        </>
      ),
      duration: 4.8,
      fig: 'easy to load, because split apart. expensive to query, same reason.',
      Visual: S.RevealWhyExpensive,
    },
    {
      title: 'Reveal: a point-in-time table cuts it back down, measured',
      body: (
        <>
          The same query against a point-in-time table that resolves the as-of lookup once, at load
          time: one fewer join, and the correlated lookup disappears entirely from the query itself.
        </>
      ),
      duration: 4.8,
      fig: 'with a point-in-time table: three joins, no correlated lookup',
      takeaway: 'A point-in-time table moves the as-of lookup from every query to a single load-time step.',
      Visual: S.RevealPITImprovement,
    },
    {
      title: 'Reveal: bridge tables, for the other kind of cost',
      body: (
        <>
          A point-in-time table resolves one satellite's history ahead of time. A bridge table does
          the same job for a query path that would otherwise cross several links at once.
        </>
      ),
      duration: 4.8,
      fig: 'point-in-time table: one satellite. bridge table: several links.',
      takeaway: 'A point-in-time table and a bridge table pre-resolve two different kinds of join, both at load time.',
      Visual: S.RevealBridgeTable,
    },
    {
      title: 'Reveal: what the join cost actually buys',
      body: (
        <>
          Every change preserved, nothing deleted, and a new source system adding hubs and satellites
          instead of forcing a redesign — measured against the 3NF and star alternatives, not merely
          asserted.
        </>
      ),
      duration: 4.8,
      fig: 'every change kept. a new source adds tables, not a redesign.',
      Visual: S.RevealWorthIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Hubs, links, satellites. Hash keys remove the coordination a sequence would force. Raw
          vault's join cost is real and measured; point-in-time and bridge tables buy it back down.
          The tradeoff is auditability and source agility, against a counted cost, not a guess.
        </>
      ),
      duration: 4.8,
      fig: 'hub, link, satellite. hash keys, no coordinator. cost vs. auditability.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new source system joins the warehouse next quarter, with its own definition of the same
          business key. Which of the three schemas absorbs that with the least redesign?
        </>
      ),
      duration: 2.8,
      fig: 'a new source, a different key definition — least redesign?',
      predict: {
        options: [
          { label: 'The 3NF schema' },
          { label: 'Data Vault — a new hub and satellite, not a rebuild', correct: true },
        ],
        explain: (
          <>
            Data Vault: a new hub and its own satellites absorb the new source without touching
            tables that already hold production history.
          </>
        ),
      },
      Visual: S.ProveDataVaultChoice,
    },
  ],
};

export default reel;
