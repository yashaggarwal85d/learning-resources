# OUTLINE: File ingestion and landing zones (`de.file-ingestion-landing-zones`)

## Learning outcomes
1. Design a landing, validation and promotion flow where a half-written batch is never read.
2. Choose among a manifest, a success marker and a conditional write for a given producer.
3. Route a poison file to quarantine with a reason.
4. Decide between notification-driven and list-driven discovery and handle the duplicates the
   first one delivers.

## Engagement arc
- Hook: step 1 (a crashed producer's partial batch is read as if it were complete, and the
  revenue figure is quietly wrong — measured directly).
- Predict: step 2, within the first four steps (what a manifest gate does to that same crash).
- Takeaways: step 4 (a manifest turns a silent partial read into nothing read at all), step 6
  (a conditional write turns a silent overwrite into a loud rejection), step 8 (quarantine a
  poison file, don't retry it forever and don't silently drop it), step 10 (schema-on-write
  catches a bad file immediately; schema-on-read defers the same bug for a long time).
- Recap: step 11. Prove it: step 12 (notification dedup and listing cost).

## Steps (storyboard)

### 1. Hook
- **fig:** a producer writes forty files and crashes after thirty-one; a naive reader lists the
  prefix and reads whatever is there, reporting a revenue figure measurably short of the truth,
  with no error raised anywhere.
- **On screen:** a landing prefix shown as a shelf that fills one file at a time, with nine empty
  slots where the crash left off.

### 2. Predict
- **fig:** the identical crash, but this reader refuses to read anything until a manifest object
  exists, written strictly after every data file. What does this reader see?
- **Options:** (a) the same thirty-one files, since they really did land [wrong — a reader
  gated on the manifest never looks at the data files directly at all]; (b) nothing at all,
  because the manifest itself never got written [correct].

### 3. Reveal — why rename isn't the fix
- **fig:** the Hadoop S3A committers' own documented reason: committing by renaming directories
  is unsafe and slow on an object store, because there is no atomic rename to begin with — only
  an atomic write of one object.
- **Moves:** a landing shelf filling one object at a time; a crossed-out arrow where a rename
  from a staging directory to a final one would have to happen.

### 4. Reveal — the manifest gate, measured
- **fig:** the real run: the crashed batch with no manifest is read as nothing, not as a partial
  batch; the identical producer, finishing normally, writes a manifest whose own file count
  matches the batch exactly.
- **takeaway:** "A manifest turns a silent partial read into nothing read at all — the reader never trusts a file it can't find listed."

### 5. Reveal — success markers and conditional writes
- **fig:** the Hadoop S3A pattern of a `_SUCCESS` marker written strictly last; S3's own
  conditional-write header that makes two producers racing to publish the same key resolve to
  exactly one winner instead of a silent overwrite.
- **Narrator's line of thought:** she treats all three protocols — manifest, marker, conditional
  write — as the same underlying move: make the reader wait for one small, final, unambiguous
  signal instead of trusting a pile of files directly.

### 6. Reveal — the conditional-write race, measured
- **fig:** the real run: a plain overwrite lets the second of two racing producers silently
  replace the first one's manifest with zero complaint; the identical race under a conditional
  write rejects the second producer outright, and the first producer's manifest is the one that
  survives.
- **takeaway:** "A plain overwrite lets the second writer win silently — a conditional write rejects it loudly instead."

### 7. Reveal — poison files
- **fig:** a file that fails validation moved aside with its own reason attached; the named
  anti-pattern (a blanket ignore-corrupt-files setting) that drops a bad file with no record at
  all of why.
- **Narrator's line of thought:** she treats quarantine as a promise to someone debugging this
  later — a reason attached, not just a file missing.

### 8. Reveal — quarantine, measured
- **fig:** the real run: three files land, one fails validation on its own amount field and is
  routed to quarantine with that exact reason; the other two land normally, untouched.
- **takeaway:** "A poison file gets quarantined with its own reason — never retried forever, and never silently skipped."

### 9. Reveal — schema-on-read vs. schema-on-write
- **fig:** the identical malformed file, validated immediately at landing time in one case, and
  left completely untouched until a downstream query finally reads the broken column in the
  other.
- **Narrator's line of thought:** she treats this as a timing choice, not a right-or-wrong one —
  the question is only how long a real bug is allowed to sit undetected.

### 10. Reveal — detection timing, measured
- **fig:** the real run: schema-on-write catches the malformed file at the moment it lands; the
  identical file under schema-on-read goes completely unnoticed for dozens of runs, until the one
  run that finally touches that column.
- **takeaway:** "Schema-on-write catches a bad file at landing time — schema-on-read can leave the identical bug unnoticed for a long time."

### 11. Recap
- **fig:** the four fixes side by side — manifest or marker or conditional write for the commit,
  quarantine for a poison file, the landing-time-versus-read-time tradeoff for schema — and the
  property every source so far has needed its own version of.

### 12. Prove it
- **fig:** event notifications are documented to be delivered at least once; a discovery process
  that dedups by key processes each real object exactly once despite repeated deliveries, while
  the same discovery done by listing instead pays a cost that grows with how many objects already
  sit under the prefix.
- **predict options:** (a) listing is simpler, so it should always be preferred over
  notification-driven discovery [wrong — listing's own cost keeps growing with the prefix, which
  a notification already avoids by naming the one object that just landed]; (b) notifications
  need their own dedup logic because delivery is at-least-once, but they avoid a cost that grows
  with the prefix's own size [correct].

## Post-notes headings
- **Internals:** none claimed independently — the object-storage contract (Chapter 1 topic 11)
  and idempotent-merge-load (Chapter 3 topic 13) are reused, not re-taught; table-format commit
  protocols (Iceberg, Delta) are named as the generalisation and left to Chapter 6.
- **Lab:** none of its own, per `CHAPTER.md` — the producer-crash-with-manifest measurement is
  this topic's own executable example; the idempotent re-run that closes the chapter lab is
  topic 6's.
- **Production:** the hook's own scenario (a crashed producer's partial batch silently read as
  complete, quietly understating revenue) as the concrete shape every protocol in this topic
  exists to prevent.
- **Frontier:** none claimed — manifests, success markers, conditional writes and
  notification-driven discovery are each established, long-documented practice.
- **Where this goes next:** every source so far has needed its own trick to avoid losing or
  repeating rows. They share one underlying property, worth naming on its own: a run that can be
  repeated, or resumed, without changing the answer.

## Concept ledger
- **Introduces:** `landing-validation-promotion`, `object-store-commit-protocols`.
- **Uses:** `object-storage`, `read-after-write-consistency`, `conditional-writes` (Chapter 1
  topic 11), `idempotent-merge-load` (Chapter 3 topic 13), `ingestion-modes-ownership` (topic 1)
  — all confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 4.

## Changes from the chapter plan
None. All five named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. Committing by renaming directories on an object store is unsafe and slow. — SOURCES.md
   (Hadoop hadoop-aws committers docs).
2. S3's `If-None-Match` header prevents an overwrite when a key already exists. — SOURCES.md
   (AWS S3 conditional writes docs).
3. S3 event notifications are delivered at least once, typically in seconds but sometimes a
   minute or longer. — SOURCES.md (AWS S3 event notifications docs).
4. Spark's `ignoreCorruptFiles` option silently skips a corrupt file and keeps running. —
   SOURCES.md (Spark generic file source options).
5. A manifest-gated reader sees nothing from a crashed batch with no manifest, not a silent
   partial read. — measured directly in `examples.py`.
6. A conditional write resolves a two-producer race to exactly one winner, with a loud rejection
   for the loser. — measured directly in `examples.py`.
7. A poison file is quarantined with a reason, separately from files that pass validation. —
   measured directly in `examples.py`.
8. Schema-on-write catches a malformed file immediately; schema-on-read can defer the identical
   bug for many runs. — measured directly in `examples.py`.
9. Deduping notification deliveries by key processes each real event once despite repeats;
   listing's own cost grows with the number of objects under the prefix. — measured directly in
   `examples.py`.
