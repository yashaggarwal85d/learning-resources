# OUTLINE: GDPR erasure across lakehouse and backups (`de.gdpr-erasure-across-lakehouse`)

## Learning outcomes
1. Design an automated erasure process that locates a subject from tags, lineage and a subject
   index.
2. Delete by table-format operations and expire snapshots on a schedule that meets a stated
   deadline against audit retention.
3. Handle Kafka, replicas and backups each by a named mechanism, and emit proof.
4. Compute the delete-versus-crypto-shredding crossover; list the blind spots lineage cannot
   see; mark every decision that is a legal question.

## Engagement arc
- Hook: step 1 (an erasure request runs in minutes and the ticket closes; eleven days later an
  audit finds the customer's name in a Kafka topic, a backup, a marketing export and a training
  set — the lakehouse delete was correct and complete).
- Predict: step 2, within the first four steps (which parts of the design were missing, and
  which has no technical answer at all).
- Takeaways: step 4 (a correct delete in one place is not an erasure process), step 6 (crypto
  shredding trades a per-subject key for an unbounded number of copies), step 8 (proof of
  deletion is itself a deliverable, not a side effect).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the erasure request runs in the lakehouse in minutes; the ticket closes. Eleven days
  later, an audit finds the customer's name in a Kafka topic, last week's backup, a marketing
  export, and a data scientist's training set.
- **On screen:** a closed ticket, and four places the name still lives, drawn surfacing one by
  one.

### 2. Predict
- **fig:** the lakehouse delete was correct and complete. Which parts of the design were
  missing, and which of them have no technical answer at all?
- **Options:** (a) the delete operation itself was buggy, since the name is still findable
  [wrong — the delete was correct and complete for the lakehouse; the places the name survived
  were never reached by that operation at all]; (b) the places a table operation never reaches
  — backups, replicas, exports, a model — plus a legal question about what counts as erased
  [correct].

### 3. Reveal — finding the data first
- **fig:** a subject's identifier traced through classification tags, a lineage graph, and a
  subject index that maps the subject directly to the files holding them, so a deletion does
  not scan the whole lake.
- **Moves:** the subject index lights up the exact files and partitions, skipping the rest of
  the lake entirely.

### 4. Reveal — the blind spots a register must name
- **fig:** the same subject's data in a spreadsheet, a model trained on it, and an export — each
  outside the lineage graph's own reach, drawn dashed with a human-owner chip attached.
- **takeaway:** "A correct delete in one place is not an erasure process; the blind spots lineage can't see still need a named owner."

### 5. Reveal — delete, expire, rewrite
- **fig:** a table-format delete writes a new snapshot; the old snapshot still makes the subject
  readable by time travel until it's expired and its files are rewritten or purged on a schedule
  that meets the legal deadline against the audit-retention window.
- **Narrator's line of thought:** she treats the expiry schedule itself as the actual design
  decision, not an afterthought to the delete operation.

### 6. Reveal — crypto shredding as the scalable alternative
- **fig:** one per-subject key deleted, and every copy of that subject's data, including every
  backup, becomes unreadable at once — traded against the cost of a key per subject and a
  decryption lookup on every read.
- **takeaway:** "Crypto shredding trades a per-subject key and a decryption lookup for every copy, including backups, going unreadable at once."

### 7. Reveal — the crossover, computed
- **fig:** delete-and-expire's cost rising with request rate and backup length, crypto
  shredding's cost flat after its own up-front key cost, crossing at a computed request rate.
- **Narrator's line of thought:** she treats "many requests, long backups" and "few requests,
  short retention" as the two sides of one computed line, not a rule of thumb.

### 8. Reveal — proof of deletion
- **fig:** an automated pipeline assembling the snapshot list after expiry, the physical-file
  listing, the key store's deletion record, and a repeat search for the subject — emitted for
  every request, not produced only when an auditor asks.
- **takeaway:** "Proof of deletion is itself a deliverable this pipeline emits, not a side effect an auditor has to go dig up."

### 9. Recap
- **fig:** the subject index, the blind-spot register, the delete-and-expire schedule, the
  crossover, and the proof pipeline, side by side.

### 10. Prove it
- **fig:** a second erasure request arrives for a subject whose data was replicated into a
  second region (the earlier multi-region design) before the request landed.
- **predict options:** (a) treat it exactly like a single-region request, since the mechanism is
  the same [wrong — a replica the pipeline doesn't know about is exactly the kind of blind spot
  this design registers rather than assumes doesn't exist]; (b) check the subject index and the
  blind-spot register for every region the data was placed in, not only the one the request
  arrived through [correct].

## Post-notes headings
- **Internals:** none claimed independently — the erasure mechanisms themselves (Chapter 13
  topics 5, 6, 9 and the table formats of Chapter 6) are composed, not re-taught; lineage
  collection and impact analysis (Chapter 13 topics 11 and 14) are referenced; the legal
  analysis of what must be erased and when is counsel's, which this topic states plainly; the
  skipped audit-logging and tamper-evidence topic is named; tenant-level erasure belongs to
  topic 19.
- **Lab:** none of its own as a separate syllabus lab leg (the erasure lab itself is Chapter
  13 topic 9's); the end-to-end erasure process on the shop's synthetic estate, the crossover
  calculation, and the proof-pipeline output are this topic's executable evidence.
- **Production:** the hook's own scenario (a correct, complete lakehouse delete that still
  leaves the subject findable elsewhere) as the concrete shape "erasure as a process, not an
  operation" takes in practice.
- **Frontier:** none claimed — composing table-format deletes, snapshot expiry, and
  crypto-shredding into one process is each established practice, not an emerging technique.
- **Where this goes next:** an erasure process is only as good as its inputs: the tags, the
  lineage, the quality of the data it touches. The next design is the platform that watches all
  of that continuously: a data-quality monitoring platform that runs checks, finds the blast
  radius of a failure and, above all, does not cry wolf.

## Concept ledger
- **Introduces:** `erasure-process-design`, `subject-index-and-blind-spot-register`,
  `delete-vs-shred-crossover`, `erasure-proof-pipeline`.
- **Uses:** the method concepts as in topic 12, plus `dek-kek-envelope-hierarchy`,
  `crypto-shredding-key-deletion`, `kek-rotation-vs-dek-reencryption`,
  `sensitivity-tier-and-category`, `tag-propagation-lineage`, `discovery-false-negatives`,
  `snapshot-retention-audit-vs-erasure`, `multi-writer-lakehouse-design`,
  `tiering-retention-designed-up-front`, `physical-vs-logical-replication` — all confirmed live
  via a Node.js script parsing `registry.ts`'s `introduces` arrays.
- **Declared:** `erasure-vs-time-travel-snapshot-expiry`, `delete-files-until-compaction`,
  `per-subject-crypto-shredding-cost`, `erasure-proof-retention-as-code`,
  `openlineage-run-job-dataset-events` and `blast-radius-scoring` (each an existing placeholder,
  already introduced by prior topics for the identical Chapter 13 gap), plus
  `kafka-tombstones-retention-erasure`, `lineage-coverage-gaps` and
  `owner-notification-deprecation-workflow` (same gap, new ids — no prior topic has needed
  these exact distinctions).

## Changes from the chapter plan
`CHAPTER.md` lists `Declared: none`, but nine of the named `uses` ids resolve to Chapter 13,
which remains entirely unplanned, so all nine move to `declared`. Six reuse exact placeholder
ids already introduced by prior topics for the identical gap; three
(`kafka-tombstones-retention-erasure`, `lineage-coverage-gaps`,
`owner-notification-deprecation-workflow`) are new placeholders, confirmed by grep to have no
existing id for the same distinction. Every other named `uses` id is confirmed live via the
same script. No scope cut — this topic still composes, rather than re-teaches, the erasure
mechanisms, lineage collection, and the legal analysis, per `CHAPTER.md`'s own "Leaves out"
line.

## Claims list (for fact-check)
1. GDPR Article 17(1) gives the data subject the right to obtain erasure from the controller.
   — SOURCES.md (GDPR Art. 17).
2. GDPR Article 17(1) requires erasure "without undue delay" once a listed ground applies. —
   SOURCES.md (GDPR Art. 17).
3. GDPR Article 17(3)(e) carves out processing necessary for the establishment, exercise or
   defence of legal claims. — SOURCES.md (GDPR Art. 17).
4. NIST SP 800-88 Rev. 2 defines cryptographic erase as sanitizing the keys used to encrypt
   data, or the keys needed to access it, rather than the data itself. — SOURCES.md (NIST
   800-88).
5. The subject-index design, the blind-spot register, the delete-versus-shred crossover, and
   the proof-pipeline's assembled evidence are this chapter's own established method and this
   topic's own derived design, not an independent citation beyond claims 1-4.
