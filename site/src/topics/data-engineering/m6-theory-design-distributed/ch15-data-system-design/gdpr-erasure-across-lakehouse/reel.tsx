import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The erasure-process coverage, the delete-and-expire versus crypto-shredding
// cost crossover, and the proof-pipeline assembly are asserted in
// examples.py's own erasure_process_coverage(), delete_and_expire_cost(),
// crypto_shredding_cost(), crossover_requests_per_year() and erasure_proof().
// The GDPR Article seventeen and NIST's cryptographic-erase claims trace to
// SOURCES.md's own quotes and are checked step by step in FACT-CHECK.md.
// No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the delete was correct, the name wasn't gone",
      body: (
        <>
          An erasure request runs in the lakehouse in minutes, and the ticket closes. An audit
          days later finds the same customer's name in a Kafka topic, last week's backup, a
          marketing export, and a data scientist's training set. The lakehouse delete was correct
          and complete.
        </>
      ),
      duration: 5.0,
      fig: "a closed ticket, and four places the name still lives, surfacing one by one",
      Visual: S.Hook,
    },
    {
      title: "Predict: which parts of the design were missing?",
      body: (
        <>
          Which parts of the design were missing, and which of them have no technical answer at
          all?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: "the delete operation itself was buggy, since the name is still findable" },
          {
            label: "the places a table operation never reaches, plus a legal question about what counts as erased",
            correct: true,
          },
        ],
        explain: (
          <>
            The delete was correct and complete for the lakehouse; the places the name survived
            were never reached by that operation at all. The real gap is everywhere a table
            operation doesn't reach, plus a question only a lawyer can answer.
          </>
        ),
      },
      fig: "the delete was correct; the gap is what it never touched, plus a legal call",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: finding the data first",
      body: (
        <>
          A subject's identifier is traced through classification tags and a lineage graph, then
          a subject index maps it straight to the files and partitions that hold them, so a
          deletion never scans the whole lake.
        </>
      ),
      duration: 4.8,
      fig: "the subject index lighting up exact files and partitions, skipping the rest of the lake",
      Visual: S.RevealSubjectIndex,
    },
    {
      title: "Reveal: the blind spots a register must name",
      body: (
        <>
          The same subject's data can sit in a spreadsheet, a model trained on it, or an export —
          each outside the lineage graph's own reach. A register names each one with a human
          owner, rather than pretending lineage already covers it.
        </>
      ),
      duration: 5.0,
      takeaway: "A correct delete in one place isn't an erasure process; blind spots lineage can't see still need a named owner.",
      fig: "a spreadsheet, a model and an export drawn dashed, each with an owner chip attached",
      Visual: S.RevealBlindSpots,
    },
    {
      title: "Reveal: delete, expire, rewrite",
      body: (
        <>
          A table-format delete writes a new snapshot, but the old snapshot still makes the
          subject readable by time travel until it's expired and its files are rewritten or
          purged — on a schedule that meets the legal deadline against the audit-retention window.
        </>
      ),
      duration: 4.8,
      fig: "a delete writing a new snapshot, the old one staying readable until its expiry",
      Visual: S.RevealDeleteExpire,
    },
    {
      title: "Reveal: crypto shredding as the scalable alternative",
      body: (
        <>
          Delete one per-subject key, and every copy of that subject's data, including every
          backup, becomes unreadable at once — traded against the cost of a key per subject and a
          decryption lookup on every read.
        </>
      ),
      duration: 4.8,
      takeaway: "Crypto shredding trades a per-subject key and a decryption lookup for every copy, including backups, going unreadable at once.",
      fig: "one key deleted, every copy across the estate going unreadable at the same instant",
      Visual: S.RevealCryptoShred,
    },
    {
      title: "Reveal: the crossover, computed",
      body: (
        <>
          Delete-and-expire's cost rises with how often requests arrive and how long backups are
          kept. Crypto shredding's cost is flat after its own up-front key cost. The two lines
          cross at a computed request rate.
        </>
      ),
      duration: 4.8,
      fig: "delete-and-expire's cost rising with request rate and backup length, shredding flat beside it",
      Visual: S.RevealCrossover,
    },
    {
      title: "Reveal: proof of deletion",
      body: (
        <>
          An automated pipeline assembles the snapshot list after expiry, the physical-file
          listing, the key store's deletion record, and a repeat search for the subject —
          emitted for every request, not produced only when an auditor asks.
        </>
      ),
      duration: 5.0,
      takeaway: "Proof of deletion is itself a deliverable this pipeline emits, not an auditor's job to dig up afterward.",
      fig: "four pieces of evidence assembling into one proof record for a single request",
      Visual: S.RevealProof,
    },
    {
      title: "Recap",
      body: (
        <>
          A subject index and a blind-spot register for finding the data. A delete-and-expire
          schedule against a computed crypto-shredding crossover. And proof of deletion, emitted
          automatically for every request.
        </>
      ),
      duration: 4.8,
      fig: "the index, the register, the delete-versus-shred choice, and the proof pipeline, side by side",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a replica in a second region",
      body: (
        <>
          A second erasure request arrives for a subject whose data was replicated into a second
          region before the request landed. Does the same process still find everything?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "treat it exactly like a single-region request, since the mechanism is the same" },
          {
            label: "check the subject index and the blind-spot register for every region the data was placed in",
            correct: true,
          },
        ],
        explain: (
          <>
            A replica in a region the erasure pipeline doesn't know about is exactly the kind of
            blind spot this design registers rather than assumes doesn't exist. Checking every
            region the data was placed in follows directly from the register's own purpose.
          </>
        ),
      },
      fig: "a second region's replica, caught by checking the index and register everywhere, not just where the request arrived",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
