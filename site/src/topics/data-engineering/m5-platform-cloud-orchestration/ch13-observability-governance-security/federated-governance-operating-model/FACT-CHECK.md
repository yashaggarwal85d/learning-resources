# Fact-check — de.federated-governance-operating-model

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Dehghani names the four data mesh principles: domain-oriented decentralized data ownership and architecture, data as a product, self-serve data infrastructure as a platform, and federated computational governance. | Dehghani — Data Mesh Principles and Logical Architecture | Verified, quoted. |
| 2 | Dehghani defines federated computational governance as a governance model requiring "automated execution of decisions by the platform," and writes "I call this a federated computational governance." | Dehghani — Data Mesh Principles and Logical Architecture | Verified, quoted. |
| 3 | The federation of domain and platform product owners creates and adheres to "a set of global rules - rules applied to all data products and their interfaces." | Dehghani — Data Mesh Principles and Logical Architecture | Verified, quoted. |
| 4 | Domain data quality and SLO specifications must follow a global standard "defined by the global federated governance team, and automated by the platform." | Dehghani — Data Mesh Principles and Logical Architecture | Verified, quoted. |
| 5 | Conway's 1968 paper "How Do Committees Invent?" was reprinted by permission of Datamation magazine, where it appeared in April 1968, copyright F. D. Thompson Publications, Inc. | Conway — How Do Committees Invent? | Verified, quoted with its own publication line. |
| 6 | Conway's own 1968 thesis: "organizations which design systems (in the broad sense used here) are constrained to produce designs which are copies of the communication structures of these organizations." | Conway — How Do Committees Invent? | Verified, quoted in full from the paper's own conclusion. |
| 7 | `engine-enforced-row-column-security`, `CHAPTER.md`'s planning-time guess for a `uses` id from topic 8, does not exist anywhere in `registry.ts`; topic 8's own entry introduces `row-column-policies-in-engine` instead. | Read directly from `registry.ts` (topic 8's own entry) in this session, not a vendor page. | Verified by direct inspection. |
| 8 | No `section: '10.5'` or `section: '11.4'` entry exists anywhere in `registry.ts` — Chapter 10 §10.5 (compliance regimes) and Chapter 11 §11.4 (contract enforcement in CI) are both unbuilt. | Read directly from `registry.ts` via `grep` in this session, not a vendor page. | Verified by direct inspection. |
| 9 | The self-serve registration gate (`check_schema`, `check_contract`, `check_classification`) admits a well-formed table and rejects two malformed ones, each with a reason naming the failing gate. | Read directly from this session's own Python run (see `examples.py`). | Verified by direct execution. |
| 10 | The six governance decisions split exactly 3 automated (each with a stated rule) and 3 human (each with a named steward and a reason). | Read directly from this session's own Python run (see `examples.py`). | Verified by direct execution. |
| 11 | Chapter 19 (team topology, §19.1) is not built and is referenced by name only, consistent with `CHAPTER.md`'s own prerequisites-panel note ("Chapter 19 named as 'Goes deeper later'"). | Read directly from `registry.ts` (no Chapter 19 entries anywhere) in this session, not a vendor page. | Verified by direct inspection. |

## Red-team analysis

- **Is "federated computational governance" Dehghani's own term, or a paraphrase?** Her own
  sentence, quoted in full in `SOURCES.md`, states it directly: "I call this a federated
  computational governance." Not a paraphrase.
- **Does using a 125-character-limited fragment from the research fork risk misquoting Dehghani or
  Conway?** No — every quote actually written into `SOURCES.md` was re-fetched and re-verified
  against the full plain text of each page directly in this session (`sources.mjs fetch`), not
  copied from the fork's own truncated fragments; the fork's report was used only to locate which
  sentences to look for.
- **Is Conway's quote the original 1968 text, or the page's own later paraphrase?** The page
  carries both: the original 1968 conclusion ("are constrained to produce designs which are copies
  of the communication structures of these organizations") and a shorter popular paraphrase the
  author added 33 years later ("will inevitably produce a design whose structure is a copy of the
  organization's communication structure"). `SOURCES.md` and `reel.tsx` use only the original 1968
  sentence, since `CHAPTER.md` asks for Conway's thesis "in his own words" from the 1968 paper
  specifically.
- **Is "reverse Conway's law" Conway's own term?** No, and the reel does not claim it is — Conway
  states the forward observation only; "reverse Conway's law" (deliberately choosing a team
  structure to produce a wanted architecture) is a later, widely used extension, and `reel.tsx`'s
  prose attributes the forward thesis to Conway by name and presents the reverse as the
  extension's own idea, not as something quoted from the 1968 paper.
- **Does the registration gate's `check_classification` logic match the syllabus's own "ambiguous
  PII classification" framing?** Yes — a column with no `classification` key at all (not merely a
  missing sub-field) is the gate's rejection case, mirroring topic 4's discovery-false-negative
  theme (a scanner that never tagged the column in the first place, not a tagging error); this was
  confirmed working only after fixing a bug where the gate also rejected a column whose
  `category` was intentionally `None` (a non-personal column still needs a `tier`, but not a
  `category`) — caught by running `examples.py` and seeing the well-formed table wrongly rejected,
  fixed by checking for key presence rather than non-null values.
- **Is the `uses` list for Chapter 10 §10.5 and Chapter 11 §11.4 correctly moved to `declared`
  rather than silently dropped?** Yes — both gaps are logged explicitly in `OUTLINE.md`'s concept
  ledger, following the same pattern topics 11 and 12 established for their own unbuilt Chapter 11
  dependencies; no `uses` id is claimed that does not resolve to a live `registry.ts` entry.
