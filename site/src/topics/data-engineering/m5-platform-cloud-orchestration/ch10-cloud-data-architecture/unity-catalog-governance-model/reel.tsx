import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Unity Catalog's three-level namespace, four securable types, privilege inheritance,
// tag-driven ABAC, column-level lineage/audit system tables, Lakehouse Federation and the
// Delta Sharing protocol — sourced from Databricks' own current documentation and the Delta
// Sharing protocol's own specification, reproduced locally as a disclosed simulation of the
// inheritance/tag mechanisms (no real metastore runs in this sandbox; see OUTLINE.md).
const reel: Reel = {
  steps: [
    {
      title: 'A table governed before anyone writes a rule for it',
      body: (
        <>
          A new table is created inside a schema already tagged restricted. Nobody writes a new
          rule. The table inherits the tag's row filter and column mask the instant it exists —
          while a rival design using per-table grants leaves exactly this kind of table briefly
          ungoverned.
        </>
      ),
      duration: 4.6,
      Visual: S.TableGovernedInstantly,
    },
    {
      title: "What has to be true for a rule to cover a table that doesn't exist yet?",
      body: (
        <>
          Before the mechanism: a policy was written before this table existed. For the policy to
          apply the instant the table is created, what does it have to be checking?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'A list of table names the policy was written against' },
          { label: "A tag the table carries, checked at query time, not at creation time", correct: true },
          { label: "A scheduled job that re-scans every table nightly" },
          { label: 'A manual grant someone has to remember to add' },
        ],
        explain: (
          <>
            A tag, checked live. The policy was never written against a specific table — it was
            written against a tag. Any object that carries that tag is covered the moment it's
            checked, which is why a brand-new table is covered without anyone updating anything.
          </>
        ),
      },
      Visual: S.PredictTagMechanism,
    },
    {
      title: 'Three levels deep, and the extra level is the point',
      body: (
        <>
          Every object is addressed catalog.schema.object. A two-level namespace can't separate
          environments inside one account; the third level is what lets prod and staging live in
          the same metastore without colliding.
        </>
      ),
      duration: 4.6,
      Visual: S.ThreeLevelNamespace,
    },
    {
      title: 'Four kinds of securable, not just tables',
      body: (
        <>
          Tables, volumes for governed access to raw files, functions, and models — each one
          individually permissioned. A catalog scoped only to tables can't govern a model or a
          folder of images the same way.
        </>
      ),
      duration: 4.4,
      Visual: S.FourSecurableTypes,
    },
    {
      title: 'One grant, inherited down, before and after',
      body: (
        <>
          A privilege granted at the schema level reaches every table already there and every
          table created after — reproduced for real against a local permission tree, not just
          described.
        </>
      ),
      duration: 4.6,
      Visual: S.InheritanceTreeReal,
      takeaway: 'Privilege inheritance covers current and future objects — the grant never needs to be repeated.',
    },
    {
      title: 'A rule written once, checked by a tag, not a table list',
      body: (
        <>
          The tag policy never names the new table. It checks whether the table carries the tag
          it was written against — reproduced locally: the policy misses the table before
          tagging, covers it the instant the tag is there.
        </>
      ),
      duration: 4.8,
      Visual: S.TagPolicyReal,
      takeaway: "A tag-based policy governs by what an object carries, not by a list of names someone has to maintain.",
    },
    {
      title: 'Lineage and audit, as tables you can just query',
      body: (
        <>
          Column-level lineage tracks which output column came from which input columns. Every
          access gets logged. Both live as ordinary system tables — not a separate dashboard you
          have to go hunting through.
        </>
      ),
      duration: 4.4,
      Visual: S.LineageAuditTables,
      takeaway: 'Column-level lineage and the audit log are queryable system tables, not a separate UI to hunt through.',
    },
    {
      title: "Reaching another system without copying it first",
      body: (
        <>
          Lakehouse Federation queries an external database or catalog live, governed the same
          way as a native table. Delta Sharing goes further: a recipient reads your table with
          nothing but a bearer token and pre-signed file URLs — no account on your platform at
          all.
        </>
      ),
      duration: 5.0,
      Visual: S.FederationAndSharing,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Three levels deep, four kinds of securable. One grant, inherited forever. One tag,
          checked live instead of a table list. Lineage and audit as queryable tables. And a
          recipient who needs nothing but a bearer token to read a shared table.
        </>
      ),
      duration: 4.0,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A partner organization needs to read one of your tables. They've never heard of your
          Databricks account and never will. Can Delta Sharing still get them the data?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "No — they need their own Databricks account first" },
          { label: "Yes — a bearer token and pre-signed file URLs are all the protocol requires", correct: true },
        ],
        explain: (
          <>
            Yes. Delta Sharing's own protocol specification names the recipient as a principal
            holding a bearer token, full stop — the server answers with pre-signed file URLs or
            temporary cloud credentials, neither of which requires the recipient to run any
            particular platform at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
