# Fact-check — de.gdpr-erasure-across-lakehouse

## Claims re-derived against the source

1. **GDPR Article 17(1) gives the data subject the right to obtain erasure from the
   controller.** SOURCES.md's quote supports this directly. Checked step 1's hook treats the
   erasure *request* as the trigger for the whole process, matching Article 17's own framing of
   a subject-initiated right, not a controller-initiated housekeeping task.

2. **GDPR Article 17(1) requires erasure "without undue delay" once a listed ground applies.**
   SOURCES.md's quote supports this directly — `CHAPTER.md` itself names this exact phrase as
   required to quote. Checked step 5's expiry schedule is designed *against* this deadline
   explicitly, not merely inspired by a general sense of urgency — the design decision is named
   as "the schedule that satisfies the legal deadline," matching the quote's own binding
   language.

3. **GDPR Article 17(3)(e) carves out processing necessary for the establishment, exercise or
   defence of legal claims.** SOURCES.md's quote supports this directly. Checked step 5's
   framing ("a lawyer's call the design makes visible and does not make") doesn't overclaim
   which data a given legal-claims exception actually covers — the topic names the exception as
   a legal question, consistent with the exact conditional scope the quote itself carries
   ("necessary for," not a blanket exemption).

4. **NIST SP 800-88 Rev. 2 defines cryptographic erase as sanitizing the keys used to encrypt
   data, or the keys needed to access it, rather than the data itself.** SOURCES.md's quote
   supports this directly. Checked step 6's "delete one per-subject key and every copy becomes
   unreadable at once" matches NIST's own definition exactly — the data itself is never
   touched; only the key is sanitized, which is the real mechanism behind the topic's "every
   copy, including backups" claim (a backup holding ciphertext under a deleted key becomes
   unreadable without any operation performed on the backup itself).

5. **The subject-index design, the blind-spot register, the delete-versus-shred crossover, and
   the proof-pipeline's assembled evidence are this chapter's own established method and this
   topic's own derived design.** Not an independent citation beyond claims 1-4 — `CHAPTER.md`'s
   own scope line states the subject index, the blind-spot register, the crossover, and the
   proof pipeline as this topic's own worked design, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the delete operation itself was buggy") is a
  genuine, plausible first instinct — the name being findable does look like a failed delete —
  but it's ruled out directly against the hook's own stated fact: "the lakehouse delete was
  correct and complete." The correct option names the actual gap: places a table operation
  never reaches, plus a legal question the design can surface but not resolve on its own.
- **Predict 2 (step 10, "Prove it"):** checked that "treat it exactly like a single-region
  request" is ruled out against claim 5's own blind-spot-register design: a replica in a second
  region that the erasure pipeline doesn't know about is precisely the kind of blind spot the
  register exists to catch, not something the design is entitled to assume away. The correct
  option (check the subject index and register for every region) follows directly from the
  register's own stated purpose.

## Illustrative numbers (figs for steps 5, 6, 7, 10)

The hook's "eleven days later," the expiry schedule's specific retention window, the
crossover's request-rate and backup-length numbers, and the second-region timing in step 10 are
illustrative, stated lab numbers for the storyboard and the calculation in `examples.py`, not
cited real-world incident figures — no claim is made about any specific company's actual
erasure-request volume or backup retention.

## Outcome

No open findings. Every claim about GDPR's own deadline and carve-out language, and NIST's own
cryptographic-erase definition, traces to one of SOURCES.md's four verbatim quotes across two
sources (GDPR's own text, NIST's own current special publication); the subject-index, blind-spot
register, crossover, and proof-pipeline designs rest on `CHAPTER.md`'s own stated scope, not an
unsourced factual claim; both predicts are checked against the topic's own cited mechanisms
rather than invented reasoning.
