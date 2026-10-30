# Outline — de.storage-classes-lifecycle-economics

**Kind:** full, §10.1. About 15 minutes.

## Scope (full syllabus line)

"Hot/infrequent/archive tiers across S3/GCS/Azure Blob, minimum-duration and retrieval charges,
Intelligent-Tiering-style automation, lifecycle rules vs table-format snapshot expiry (a lifecycle
rule deleting files a live snapshot references corrupts the table), versioning plus Object
Lock/WORM for ransomware and regulatory retention."

- Clause 1: hot/infrequent/archive tiers across S3/GCS/Azure Blob.
- Clause 2: minimum-duration and retrieval charges.
- Clause 3: Intelligent-Tiering-style automation.
- Clause 4: lifecycle rules vs table-format snapshot expiry (a lifecycle rule deleting files a
  live snapshot references corrupts the table).
- Clause 5: versioning plus Object Lock/WORM for ransomware and regulatory retention.

## Outcomes

Name the hot/infrequent/archive tiers on S3, GCS and Azure Blob and their minimum storage
durations. Price an early-deletion/retrieval charge from a worked example and explain the
retrieval-delay trade-off across Expedited/Standard/Bulk-style options. Explain what automated
tiering (Intelligent-Tiering and its equivalents) buys and what it costs to run. Reproduce, on a
local stand-in, exactly how a time-based lifecycle rule can delete a file a live table snapshot
still needs, and the ordering fix that prevents it. Decide when Object Lock's irreversibility is
worth accepting.

## Engagement arc

- Hook: step 1 (a lifecycle rule deletes a file at day ninety to save money; a time-travel query
  that worked yesterday now errors, with no warning at delete time).
- Predict: step 2, within the first four steps.
- Takeaways: steps 4, 5, 6, 7 (four total, all at or after the midpoint). Step 3 (first
  non-predict step after the predict step) carries **no** takeaway (known gotcha).
- Recap: step 8 (no takeaway — per the recap-takeaway-squeeze gotcha, only give recap its own
  takeaway when it's one of the engagement arc's required ones, which it isn't here).
- Prove it: step 9 (full topic).

## Storyboard (9 steps)

### 1. Hook — a lifecycle rule deletes a file a snapshot still needs
- Visual: a table's manifest with an arrow pointing at a data file; a lifecycle rule sweeps
  through and deletes files past a time cutoff, including that one; the arrow is left dangling.
- What moves: the lifecycle sweep highlights files past the cutoff, deletes them; the manifest
  arrow that pointed at one of them turns red and dangling.
- Narrator's line of thought: open on the surprise — the rule did exactly what it was told, saved
  real money, and broke a table nobody touched. The rule isn't bugged. It's blind to something.
- No takeaway, no predict.

### 2. Predict — what is the lifecycle rule blind to?
- Predict question: "The lifecycle rule and the table were both working exactly as configured.
  What did the rule not know about, that caused this?" Options: "The file's storage tier" /
  "Whether any live snapshot still points at the file" (correct) / "The file's size" / "The
  bucket's versioning setting".
- Answer/explain: a lifecycle rule is purely time-based — it knows an object's age, nothing about
  a table format's own metadata. A snapshot pointing at that file for time travel or rollback is
  invisible to it. The fix is ordering: expire the snapshot first, so the table format itself
  releases the file, before any time-based rule is allowed to delete it.
- What moves: on reveal, a snapshot's own reference line to the file lights up, visibly
  independent of the lifecycle rule's own age-based sweep.

### 3. "Hot, infrequent, archive: the same three tiers, three vendors" — NO takeaway
- Visual: three columns (S3, GCS, Azure Blob), each listing its own named tiers from hot to
  archive, with each tier's minimum storage duration underneath.
- Real numbers/facts shown: S3 Standard-IA/One Zone-IA (30 days), S3 Glacier Instant
  Retrieval/Flexible Retrieval (90 days), S3 Glacier Deep Archive (180 days); GCS Nearline (30
  days), Coldline (90 days), Archive (365 days); Azure Cool (30 days), Cold (90 days), Archive
  (180 days).
- Narrator's line of thought: say the pattern once, clearly, instead of three separate vendor
  stories: cheaper to store, more expensive and slower to read back, and a minimum number of days
  you're committed to before leaving is free.
- Body/caption: the same hot/infrequent/archive shape, under different names, with its own stated
  minimum storage duration, on all three clouds.
- No takeaway (gotcha: first non-predict step after the predict step).

### 4. "Cheaper to store, slower and costlier to read back" — takeaway
- Visual: a retrieval-speed ladder for one archive tier — Expedited, Standard, Bulk-style options
  — each with its own typical completion window, next to Azure's own rehydration window for its
  archive tier.
- Real numbers: Expedited (minutes), Standard (hours), Bulk (longer, cheaper) windows for S3
  Glacier Flexible Retrieval vs Deep Archive; Azure's up-to-fifteen-hour rehydration; executed and
  asserted in `examples.py`'s own worked early-deletion-fee example.
- Narrator's line of thought: name the actual trade in one sentence — archive tiers aren't just
  "cheap storage," they're a bet that you won't need this file back soon, and if you're wrong, you
  pay both a retrieval fee and a real wait measured in hours.
- Takeaway: "An archive tier is cheaper to store and slower and costlier to read back — the same
  trade, named differently, on every cloud."

### 5. "Automated tiering moves the data; it doesn't make the decision free" — takeaway
- Visual: an object's access pattern graph (frequent, then idle) with an automated-tiering policy
  moving it down through tiers as it goes quiet, with a small per-object monitoring fee ticking
  alongside.
- Real numbers: none beyond the per-object monitoring/automation fee's existence (sourced,
  disclosed; no invented dollar figure).
- Narrator's line of thought: say what this buys and what it costs in the same sentence —
  automated tiering removes the need to predict access patterns yourself, but it isn't free
  monitoring; for small or very predictable objects, picking the tier by hand is often cheaper.
- Takeaway: "Automated tiering removes guessing an access pattern, but its own monitoring fee is a
  real cost, not a free upgrade."

### 6. "The ordering fix, reproduced" — takeaway
- Visual: the hook's scenario rerun on a local stand-in, twice — once in the broken order (a
  time-based delete runs before the snapshot is expired, corrupting the manifest), once in the
  fixed order (the snapshot is expired first, so the file is no longer referenced before any
  time-based delete runs, and nothing breaks).
- Real numbers: the local reproduction's own pass/fail outcome in each order, executed and
  asserted in `examples.py` against a minimal local manifest, not a real cloud account or a real
  table-format engine.
- Narrator's line of thought: say plainly which half of this is sourced and which is demonstrated
  — Iceberg's own documentation states a data file is kept until no snapshot may need it for time
  travel or rollback; what's new here is seeing a lifecycle-style rule's blindness to that break
  something, and seeing the one-line ordering fix close it.
- Takeaway: "Expire the snapshot before any time-based rule can delete its files — never the other
  way around."

### 7. "Object Lock trades flexibility for a guarantee you can't take back" — takeaway
- Visual: an object under governance mode (most users blocked, one permission can still override
  it) beside an object under compliance mode (blocked for every user, including the account's own
  root, until the retention date).
- Real numbers: none (mechanism only, sourced directly from AWS's own wording).
- Narrator's line of thought: name the one hard trade-off out loud — compliance mode is exactly
  as irreversible as it sounds; the only way to delete a compliance-locked object early is to
  delete the whole AWS account, which is why governance mode exists first, to rehearse the
  retention settings before committing to something that can't be undone.
- Takeaway: "Compliance-mode Object Lock can't be undone short of deleting the whole account — use
  governance mode first to rehearse it."

### 8. Recap — no takeaway
- Three bullets: the same hot/infrequent/archive shape across three clouds, each with its own
  minimum duration (step 3); cheaper to store is slower and costlier to read back (step 4);
  automated tiering isn't free monitoring (step 5); expire the snapshot before the time-based rule
  runs (step 6); Object Lock's compliance mode can't be undone (step 7).
- Narrator's line of thought: close by handing back the one habit that generalizes — every tier
  and every lock is a trade an operator has to read, not a default to trust.

### 9. Prove it
- A described scenario (e.g. "a table's snapshot expiry job is scheduled nightly at 2am; a
  bucket's lifecycle rule runs at 1am and deletes any file older than ninety days") — does this
  ordering risk the same corruption as the hook, and why?

## Examples to execute (`examples.py`)

1. `early_deletion_fee_cool_tier`: Azure's own worked example — a blob moved to the cool tier
   (30-day minimum) and deleted after 21 days is charged for the remaining 9 days (30 − 21);
   asserted exactly as AWS/Azure's own source states it.
2. `early_deletion_fee_archive_tier`: Azure's own worked example — a blob moved to the archive
   tier (180-day minimum) and deleted after 45 days is charged for the remaining 135 days
   (180 − 45); asserted exactly.
3. `lifecycle_rule_blind_to_snapshot_corrupts_table`: a minimal local manifest (`{snapshot: {id,
   files: [...]}}`) plus a lifecycle-style script that deletes any file older than a cutoff,
   directly off disk, with no knowledge of the manifest; run in the broken order (delete before
   expiring the snapshot) and assert the manifest now references a missing file (corruption:
   `os.path.exists` is False for a still-referenced file).
4. `expire_snapshot_before_lifecycle_rule_prevents_corruption`: the same scenario, run in the
   fixed order (the snapshot is expired first, dropping its reference to the file, then the
   lifecycle-style delete runs); assert no referenced file is missing afterward.
5. `retrieval_windows_by_tier`: the sourced typical-completion windows for Expedited/Standard/Bulk
   retrieval on S3 Glacier Flexible Retrieval vs Deep Archive, encoded as plain data and asserted
   against the exact hours named in `SOURCES.md` (no invented numbers).

Object Lock is sourced-only (disclosed): AWS's own governance/compliance-mode behaviour cannot be
demonstrated against a local stand-in without a real AWS account's IAM and retention enforcement,
which this chapter's engine-of-record note already scopes out of local reproduction. Every claim
about it is quoted directly from AWS's own documentation.

## Bridge and handoff

- Bridge (from `CHAPTER.md` topic 3 entry, verbatim): "A conditional write protects one key at
  one instant. This topic is what happens to that byte over months and years: which tier it should
  sit in, what moving or deleting it costs, and the one rule mistake that can delete a file a live
  table still needs."
- Handoff (from `CHAPTER.md` topic 3 entry, verbatim): "Everything so far has been about data at
  rest. The next two topics are about who is allowed to touch it at all — starting with identity,
  because the alternative to a scoped role is a static key sitting in a notebook."

## Concept ledger

- **Introduces:** `storage-tier-lifecycle-tradeoff`, `lifecycle-snapshot-corruption`.
- **Uses:** `object-store-consistency-guarantee` (topic 2).
- **Declared:** none beyond topic 2.

## Claims list (source for each)

1. S3's minimum storage durations: Standard-IA/One Zone-IA 30 days; Glacier Instant
   Retrieval/Flexible Retrieval 90 days; Glacier Deep Archive 180 days. — AWS storage-classes docs.
2. A lifecycle transition or deletion before the minimum duration is charged for the remainder of
   that duration; two chained transitions through minimum-duration classes need their combined
   minimum (e.g. 94 days). — AWS lifecycle-transitions docs.
3. Expedited/Standard/Bulk retrieval typical completion windows (1–5 min / 3–5 hr or 12 hr / 5–12
   hr or 48 hr, Flexible Retrieval vs Deep Archive). — AWS archive-retrieval-options docs.
4. Compliance-mode Object Lock can't be overwritten/deleted by any user including the account's
   root user; the only way to delete it early is to delete the AWS account. — AWS Object Lock docs.
5. Governance-mode Object Lock can be overridden only with `s3:BypassGovernanceRetention` and an
   explicit bypass header; it's also used to rehearse compliance-mode settings. — same source.
6. GCS Nearline/Coldline/Archive minimum storage durations: 30/90/365 days. — GCS storage-classes
   docs.
7. Azure's Cool/Cold/Archive minimum storage durations: 30/90/180 days, with a prorated early
   deletion penalty and worked examples (9 days charged at 21/30; 135 days charged at 45/180). —
   Microsoft Learn access-tiers docs.
8. Azure's archive tier is unreadable until rehydrated, up to 15 hours. — same source.
9. Iceberg's `expireSnapshots` removes expired snapshots from metadata (ending their availability
   for time travel); a data file is not deleted until no snapshot that may need it for time travel
   or rollback still references it. — Apache Iceberg maintenance docs.
10–14. The five `examples.py` reproductions, each executed and asserted (see `FACT-CHECK.md`).
