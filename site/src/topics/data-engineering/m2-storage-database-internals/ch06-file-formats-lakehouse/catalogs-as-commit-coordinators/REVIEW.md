# REVIEW — de.catalogs-as-commit-coordinators

## What this topic builds

A real, minimal table catalog in this sandbox, built entirely from this script's own code, doing
all four of a catalog's real jobs: namespace management (a duplicate `create_namespace` is really
rejected), a current-metadata pointer moved only by a real compare-and-swap (reusing the exact
put-if-absent primitive this chapter has used since topic 13), access control checked and enforced
*before* the CAS is even attempted (a real `PermissionError` raised prior to any pointer-file
write), and credential issuance (a real scoped, time-limited credential naming exactly one table's
storage prefix, issued only to an authorized principal). The legacy options -- Hive Metastore, AWS
Glue Data Catalog, a JDBC catalog -- are named with their real, sourced limits rather than rebuilt.

## A correction worth flagging

Hive Metastore's own thrift interface is not devoid of access control, which a casual reading of
the syllabus line might suggest: it defines real privilege-grant operations
(`GrantRevokePrivilegeRequest`). What it genuinely lacks, per the thrift file's own comments, is
*credential vending* -- its delegation tokens authenticate a caller to the metastore server itself,
not to cloud storage. This topic states that precise distinction instead of the blunter claim.

## Checks run

- `python3 examples.py` x3 for determinism: byte-identical.
- `sources.mjs check`: 9/9 quotes found word for word (one fix needed: a footnote marker `[1]`
  inline in the Iceberg spec's own text broke an initial quote ending right before it; trimmed the
  quote to end just before the marker).
- `narration-teaches.mjs`: clean on the first try (0-12% description-overlap, max 34 words).
- `check-all.mjs --skip reels,links,narration --topic catalogs-as-commit-coordinators`: passed
  clean on the first run (locked 76.3s, docs 0.3s, sources 0.0s, build 48.6s) -- no errors, having
  applied the coverage.json-clause and digit-backing lessons from topics 29-30 up front.
- `check-all.mjs --only links,narration`: passed (2161 links, 0 broken, 184 blocked, 89 pre-existing
  title mismatches across the whole site, unrelated to this topic).
- `check-all.mjs --only reels`: the reel smoke test passed clean on the first try at both desktop
  and phone sizes ("1 live reel(s) at desktop and phone sizes"). `test:editor` failed with its
  known pre-existing sandbox limitation (confirmed by multiple prior topics; not a regression).

Two reel.tsx takeaways were initially over the 20-word limit (21 and 22 words); trimmed both to
17 and 18 words before the first check run.

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, plus the four `-q` predict-wait variants:
desktop/phone x step02/step05) reviewed by hand, including the hook, the four-real-jobs reveal, the
three-row legacy-options step on phone (checked for overflow given the three stacked rows), and the
recap on both viewports. No overflow, no layout issues.

## Sourcing

Four sources, 9 quotes verified word-for-word: Apache Iceberg's own Table Spec (the atomic-swap /
check-and-put mechanism) and REST Catalog API (vended credentials, namespaces), Hive Metastore's
own thrift interface, and AWS's own Lake Formation docs. No deltalake/delta-rs/iceberg-python
library is used -- the catalog is built entirely from this script's own code.

## Ships as

`status: 'held'`, §6.3.4. `registry.ts` and `renarration.json` entries added. Next up: topic 32,
`de.iceberg-rest-catalog-protocol` (§6.3.4, the vendor-neutral protocol this topic's handoff names).
