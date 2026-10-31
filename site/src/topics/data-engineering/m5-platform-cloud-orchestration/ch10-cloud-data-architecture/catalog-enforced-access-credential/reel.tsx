import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The catalog-and-vending mechanism, row/column filters, Iceberg REST credential vending, and
// the bypass failure mode. Every result shown in the visuals is measured by examples.py against
// a real local PostgreSQL instance (RLS and a security-invoker view standing in for a real
// catalog's enforcement — disclosed in OUTLINE.md).
const reel: Reel = {
  steps: [
    {
      title: "A quick fix that quietly skips every mask",
      body: (
        <>
          An analytics engine gets configured with the data lake's own broad storage role, meant as a temporary fix. It reads every file in
          the bucket directly. A column mask every other tool respects never applies to it at all.
        </>
      ),
      duration: 4.4,
      Visual: S.QuietlySkipsMask,
    },
    {
      title: 'What makes that mask apply to every other engine but not this one?',
      body: (
        <>
          Every other engine goes through the same catalog, the same policy, the same mask. This one engine reads the exact same files and
          sees the raw column anyway. What's actually different about it?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The mask itself has a bug for this one engine' },
          { label: "This engine holds a bulk storage credential, not a catalog-vended one", correct: true },
          { label: 'The engine is reading a cached, stale copy of the data' },
          { label: 'The column mask only applies to the first query of the day' },
        ],
        explain: (
          <>
            A bulk credential. The mask, the filter, the policy — none of it lives in the files themselves. It lives in the catalog, and it
            only applies to a read that goes through the catalog. A credential that reaches the bucket directly was never asked to obey it.
          </>
        ),
      },
      Visual: S.WhatMakesTheMaskApply,
    },
    {
      title: 'One diagram, five vendor names',
      body: (
        <>
          A catalog holds policy. A trusted engine asks it for a table. The catalog checks who's asking, then hands back a credential scoped
          to exactly those rows and columns — never a key to the whole bucket. The same diagram, five different company logos.
        </>
      ),
      duration: 5.2,
      Visual: S.OneDiagramFiveNames,
    },
    {
      title: 'A row filter and a column mask, both real',
      body: (
        <>
          A row filter is a predicate silently appended to every query from a given principal. A column mask is a function applied to a
          column's value before it ever reaches that principal. Both reproduced here against a real local database, not simulated.
        </>
      ),
      duration: 4.8,
      Visual: S.RowFilterColumnMask,
      takeaway: 'A row filter and a column mask are enforced by the catalog itself, never by trusting an engine to behave.',
    },
    {
      title: 'The open-protocol version has a name too',
      body: (
        <>
          The Iceberg REST catalog's own response for loading a table carries a field for exactly this: a short-lived, scoped storage
          credential, checked by the client before anything else. Vendor names aside, this is the same mechanism, written as an open spec.
        </>
      ),
      duration: 4.8,
      Visual: S.OpenProtocolVersion,
      takeaway: 'Iceberg REST credential vending is the open-protocol instance of the exact mechanism every proprietary catalog also runs.',
    },
    {
      title: 'A grant on a tag survives a table the policy never knew about',
      body: (
        <>
          Tag a table once, and every rule written against that tag applies automatically — including to a table created tomorrow that
          happens to get the same tag. A grant written per-object has to be rewritten by hand every time a new object shows up.
        </>
      ),
      duration: 4.2,
      Visual: S.TagBasedGrant,
    },
    {
      title: 'The bypass, reproduced for real',
      body: (
        <>
          The exact same table, the exact same row filter and column mask, read two ways: once through a catalog-vended, scoped credential,
          once through a bulk credential that was never asked to go through the catalog at all.
        </>
      ),
      duration: 4.8,
      Visual: S.BypassReproduced,
      takeaway: 'Every row and every unmasked column return the instant a read reaches storage without going through the catalog first.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          One diagram, five vendor names: catalog holds policy, trusted engine enforces row and column filters, catalog vends a scoped,
          short-lived credential. The open-protocol version of that same credential has its own field in the REST spec. Next: who runs upkeep.
        </>
      ),
      duration: 3.8,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team notices the bypass and responds by deleting the bulk engine's account entirely. Does that actually close the bypass, or
          does it just remove the one example that got caught?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It closes the bypass — deleting the account removes the whole risk' },
          { label: "It only removes this example — any credential that skips the catalog reopens the same bypass", correct: true },
        ],
        explain: (
          <>
            It only removes this one example. The actual defect is any credential that reaches storage without going through the catalog's
            own check — deleting one account that happened to have one doesn't touch the next bulk role someone creates for the same reason.
            What closes it is removing the ability to bypass the catalog at all, not removing one identity that exercised it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
