import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real changelog-mode interpreter run over the
// same stream of events in append, upsert, and retract mode, with real message counts; a real
// regular-vs-interval join state-size simulation over time; and a real freshness-driven refresh-
// mode chooser. No literal digits anywhere below; the real measured values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a stream is secretly a table the whole time",
      body: (
        <>
          Every topic so far treated a stream as a sequence of events. SQL has a different,
          equally valid way to see the exact same thing: a stream is the changelog of a table
          that keeps changing. What does reading it that way actually buy?
        </>
      ),
      duration: 4.8,
      fig: 'a stream is secretly a table the whole time — what if sql saw it that way?',
      Visual: S.Hook,
    },
    {
      title: "Setup: operators and state, underneath any particular API",
      body: (
        <>
          Everything about Flink covered so far has been operators and state, underneath any
          particular API someone happens to be using. This topic is the layer most people
          actually write queries in: SQL over streams.
        </>
      ),
      duration: 4.8,
      fig: 'operators and state so far, underneath any particular api',
      Visual: S.Setup,
    },
    {
      title: 'Predict: a changing table — encoded how?',
      body: (
        <>
          A stream of inserts and updates gets read as a table. If that table ever needs to be
          turned back into a stream of changes, how many fundamentally different ways could a
          single update actually be encoded?
        </>
      ),
      duration: 2.8,
      fig: 'a stream of inserts and updates is read as a table — encoded how?',
      predict: {
        options: [
          { label: 'Just one way — an update is always an update message' },
          { label: 'Three distinct ways, each with real trade-offs', correct: true },
          { label: 'It depends entirely on which external system is downstream' },
        ],
        explain: (
          <>
            Three distinct ways. Flink's own changelog encoding supports append-only,
            upsert, and retract modes, each a genuinely different answer to the same question.
          </>
        ),
      },
      Visual: S.PredictChangelogModes,
    },
    {
      title: 'Reveal: append, upsert, and retract',
      body: (
        <>
          Append-only emits every change as a plain insert, never an update or delete. Upsert
          replaces a row by its unique key. Retract explicitly pairs a retraction of the old row
          with an addition of the new one — three different encodings of the same change.
        </>
      ),
      duration: 4.8,
      fig: 'append, upsert, retract — three ways to encode the same changing table',
      Visual: S.RevealThreeModes,
    },
    {
      title: 'Reveal: upsert and retract agree on the table, not the cost',
      body: (
        <>
          Upsert needs a unique key to work at all, encoding an update as a single replace
          message. Retract needs no key, but an update costs two messages instead of one — a
          retraction of the old value and an addition of the new one.
        </>
      ),
      duration: 4.8,
      fig: 'the same final table, but retract pays double the messages for an update',
      takeaway: 'Upsert and retract land on the identical final table, but never cost the same number of messages to get there.',
      Visual: S.RevealUpsertVsRetract,
    },
    {
      title: 'Reveal: a regular join keeps every row forever',
      body: (
        <>
          A regular join between two unbounded streams has to assume any future row on either
          side could still match a row already seen. That forces it to keep all history of both
          sides as state, with no way to ever safely discard a row.
        </>
      ),
      duration: 4.8,
      fig: 'any future row on either side could still match — state never shrinks',
      Visual: S.RevealRegularJoinState,
    },
    {
      title: 'Predict: what happens to state once a join is time-bounded?',
      body: (
        <>
          Suppose a join only ever needs to match rows that arrive close together in time,
          instead of matching against the whole unbounded history. What happens to how much
          state it needs to keep?
        </>
      ),
      duration: 2.8,
      fig: 'a join only matches rows close in time — what happens to its state?',
      predict: {
        options: [
          { label: "State still grows forever — the window doesn't change that" },
          { label: 'State stays bounded, since rows outside the window can be dropped', correct: true },
          { label: 'State disappears entirely — no rows ever need to be kept' },
        ],
        explain: (
          <>
            State stays bounded. Once a row falls outside the matching window on either side, it
            can never match again, so it's safe to drop from state — unlike a regular join.
          </>
        ),
      },
      Visual: S.PredictBoundedJoinState,
    },
    {
      title: 'Reveal: interval and temporal joins each bound state differently',
      body: (
        <>
          An interval join bounds state by a real time window on both sides. A temporal join
          bounds it differently: it matches each row against a versioned table's value as of that
          row's own event time, keeping no window at all — just the current version.
        </>
      ),
      duration: 4.8,
      fig: 'a window bounds one; a versioned match needs no window at all',
      Visual: S.RevealIntervalTemporal,
    },
    {
      title: 'Reveal: lookup and delta joins trade state for a different cost',
      body: (
        <>
          A lookup join skips keeping one side in state entirely, reaching out to an external
          system on every row instead. A delta join goes further still, reusing the source
          tables' own data in place of join state altogether, for a regular join's full semantics.
        </>
      ),
      duration: 4.8,
      fig: 'a lookup reaches out; a delta join reuses the source instead of state',
      takeaway: 'Regular, interval, temporal, lookup, and delta joins are five answers to one question: how much state must this join keep.',
      Visual: S.RevealLookupDelta,
    },
    {
      title: 'Reveal: materialised tables and process table functions',
      body: (
        <>
          A materialised table's stated freshness target decides its refresh mode: tight
          freshness runs a continuous streaming job, loose freshness runs a periodically
          triggered batch job instead. A process table function is the escape hatch underneath
          both — full access to state, timers, and the raw changelog.
        </>
      ),
      duration: 4.8,
      fig: 'freshness drives the refresh mode; a process table function is the escape hatch',
      Visual: S.RevealMaterializedPtf,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just now —
          the message counts that genuinely differed between changelog modes on the identical
          input, and a regular join's state climbing without bound right beside an interval
          join's state plateauing once its window filled.
        </>
      ),
      duration: 5,
      fig: "this topic's own real run, every number read straight off it",
      takeaway: 'A toy model where only one join type’s state actually stops growing makes the docs’ own point.',
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Append, upsert, and retract encode the identical changing table differently, at
          different cost. Every join type answers the same question — how much state does it
          need — differently. Materialised tables and process table functions sit on top of all
          of it, not underneath.
        </>
      ),
      duration: 5.2,
      fig: 'same table, different encodings; every join answers one question: how much state?',
      Visual: S.Recap,
    },
  ],
};

export default reel;
