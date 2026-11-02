import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg REST Catalog OpenAPI spec itself
// (config negotiation and its merge order, commit requirements, multi-table transactions, the
// views and register endpoints, X-Iceberg-Access-Delegation and storage-credentials, server-side
// scan planning, SQL UDFs, the deprecated oauth/tokens endpoint) and Apache Iceberg's own
// releases page (server-side scan planning's real release) -- plus a real local REST catalog
// server and HTTP client built in this sandbox: real config negotiation, a real load, and a real
// commit with a requirement assertion that a real 409 enforces. No deltalake/delta-rs/
// iceberg-python/pyiceberg library is used.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A minimal catalog proved the idea works. This topic is the real, vendor-neutral
          protocol for it, built for real right here: a local REST catalog speaking the exact
          contract real engines use.
        </>
      ),
      duration: 4.8,
      fig: "a minimal catalog proved the idea works. this topic: the real, vendor-neutral protocol for it.",
      Visual: S.Hook,
    },
    {
      title: "Predict: does a client just start sending requests?",
      body: (
        <>
          A client meets a REST catalog it's never talked to before. Does it just start sending
          requests with its own assumed config, or does something happen first?
        </>
      ),
      duration: 4.8,
      fig: "a client meets a rest catalog it's never seen. does it just start sending requests?",
      predict: {
        options: [
          { label: 'It just starts sending requests' },
          { label: 'Something happens first', correct: true },
        ],
        explain: (
          <>
            A real first call negotiates config before any other request is sent.
          </>
        ),
      },
      Visual: S.PredictFirstCall,
    },
    {
      title: 'Reveal: config negotiation, for real',
      body: (
        <>
          A real first call to the config endpoint, a real server response the client must apply
          over its own config — defaults first, then the client's own config, then the server's
          overrides last.
        </>
      ),
      duration: 4.8,
      fig: 'config negotiation: a real first call, a real response the client must apply over its own config.',
      Visual: S.RevealConfigNegotiation,
    },
    {
      title: 'Reveal: a real load, then a real race',
      body: (
        <>
          A real load over real HTTP, exactly as a query engine would before planning a scan.
          Then two engines read the same table and race to commit, each naming the exact snapshot
          it read as a requirement.
        </>
      ),
      duration: 4.8,
      fig: 'a real load over real http. two engines read the same table, race to commit with a requirement.',
      takeaway: "A commit's requirement names the exact snapshot it read -- the server checks that for real before committing.",
      Visual: S.RevealLoadAndRace,
    },
    {
      title: 'Predict: what does the server do with a stale requirement?',
      body: (
        <>
          One engine's requirement no longer matches the server's real state by the time its
          commit lands. Does the server accept it anyway, or refuse it?
        </>
      ),
      duration: 4.8,
      fig: "one engine's requirement no longer matches the server's real state. what does the server do?",
      predict: {
        options: [
          { label: 'Accepts it anyway' },
          { label: 'Refuses it, naming why', correct: true },
        ],
        explain: (
          <>
            A real 409 names exactly which requirement failed, not a generic error.
          </>
        ),
      },
      Visual: S.PredictStaleRequirement,
    },
    {
      title: 'Reveal: a real conflict, a real retry',
      body: (
        <>
          A real 409, naming exactly which requirement failed against the server's own state. The
          loser reloads the table and retries, succeeding against the new state.
        </>
      ),
      duration: 4.8,
      fig: 'a real conflict, naming exactly which requirement failed. the loser reloads and retries, for real.',
      takeaway: 'A real 409 names exactly which requirement failed -- the loser reloads and retries, no guessing needed.',
      Visual: S.RevealConflictAndRetry,
    },
    {
      title: 'Reveal: named, sourced, not built',
      body: (
        <>
          Multi-table transactions commit updates to several tables as one atomic operation. The
          views endpoint and the register endpoint are both real, named parts of the protocol —
          out of this script's own scope.
        </>
      ),
      duration: 4.8,
      fig: 'named, sourced, not built: multi-table transactions, the views and register endpoints.',
      Visual: S.RevealNamedNotBuilt,
    },
    {
      title: 'Reveal: credential vending, named precisely',
      body: (
        <>
          A client signals which delegated-access mechanisms it supports; the server may supply
          any or none. Real, sourced, not issued here — this sandbox can't hand out real cloud
          credentials.
        </>
      ),
      duration: 4.8,
      fig: 'credential vending and remote signing, named precisely: sourced-only, since this sandbox issues no real cloud credentials.',
      Visual: S.RevealCredentialVending,
    },
    {
      title: "Reveal: the protocol's current features",
      body: (
        <>
          Server-side scan planning and SQL UDFs are current, real protocol features. The
          protocol's own built-in OAuth2 token endpoint is deprecated, in favor of external
          identity providers.
        </>
      ),
      duration: 4.8,
      fig: 'server-side scan planning, new in iceberg’s latest release line, and sql udfs: current protocol features. oauth two is deprecated.',
      takeaway: 'Server-side scan planning and SQL UDFs are new real protocol capabilities -- the built-in OAuth2 endpoint is deprecated, not removed.',
      Visual: S.RevealCurrentFeatures,
    },
    {
      title: 'Recap',
      body: (
        <>
          A real REST catalog, speaking a real subset of the real protocol: config negotiation, a
          load, and a commit with a requirement assertion, all over real HTTP.
        </>
      ),
      duration: 4.8,
      fig: 'a real rest catalog, speaking a real subset of the real protocol. next: which format and catalog do you pick?',
      Visual: S.Recap,
    },
  ],
};

export default reel;
