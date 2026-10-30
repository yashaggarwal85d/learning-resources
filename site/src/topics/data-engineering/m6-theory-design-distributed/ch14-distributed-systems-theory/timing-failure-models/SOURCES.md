## Consensus in the Presence of Partial Synchrony (Dwork, Lynch, Stockmeyer)

URL: https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf
Version: Journal of the ACM, vol. 35, no. 2, April 1988, pp. 288–323 (the journal version; a preliminary version appeared at PODC 1984)

> In addition, the consensus protocol should operate correctly if some of the processors are faulty, for example, if they crash (fail-stop faults), fail to send or receive messageswhen they should (omission faults), or send erroneous messages(Byzantine faults).

> Omission: Faulty processor pi follows its protocol correctly, but Send(m, pj), when executed by pi, might not place m in pj's buffer and Receive(pi) might cause only a subset of the delivered messagesto be actually received by pi.

> Authenticated Byzantine: Arbitrary behavior, but messagescan be signed with the name of the sending processor in such a way that this signature cannot be forged by any other processor.

> Byzantine: Arbitrary behavior and no mechanism for signatures, but we assume that the receiver of a messageknows the identity of the sender.

> Therefore, we impose an additional constraint: For each execution there is a global stabilization time (GST), unknown to the processors, such that the messagesystem respects the upper bound A from time GST onward.

(The paper's Δ is rendered as a bare "A" by this PDF's text extraction — a font-encoding artifact, not a transcription choice; the builder uses "Δ" in its own prose and keeps the quote exactly as extracted.)

> The safety conditions are that no two correct processors should ever reach disagreement, and that no correct processor should ever make a decision that is contrary to the specified validity conditions. The termination property is just that each correct processor should eventually make a decision.

Contents (for the coverage map): §1 Introduction — the fault classes (fail-stop, omission, Byzantine, authenticated Byzantine) and why resiliency depends on both a message-delay bound and a processor-speed bound existing; §2.3 Partial Synchrony — the formal definitions of "Δ known", "Δ unknown" and "Δ holds eventually" (GST), and the designer-vs-adversary framing of each; §2.4 — safety (consistency, validity), termination and the two unanimity conditions, and the proof that the GST condition is equivalent to "safety always, liveness only after GST"; §3 — the basic round model partially-synchronous protocols are built on.

## Introduction to Distributed Algorithms, lecture 1 (Guerraoui, EPFL, following Cachin–Guerraoui–Rodrigues)

URL: https://dcl.epfl.ch/site/_media/education/da21-introduction.pdf
Version: EPFL CS451/CS451a course slides, "da21-introduction.pdf" (the formal link-abstraction definitions, as given in *Introduction to Reliable and Secure Distributed Programming*, Cachin, Guerraoui and Rodrigues, Springer)

> FL1. Fair-loss: If a message is sent infinitely often by pi to pj , and neither pi or pj crashes, then m is delivered infinitely often by pj

> PL1. Validity: If pi and pj are correct, then every message sent by pi to pj is eventually delivered by pj

> Roughly speaking, reliable links ensure that messages exchanged between correct processes are not lost

Contents: the fair-loss link abstraction (FL1 fair-loss, FL2 finite duplication, FL3 no creation) as the weakest useful assumption about a real network link; the reliable (perfect) link abstraction (PL1 validity/no loss, PL2 no duplication, PL3 no creation) built on top of it by retransmission and deduplication; the course's standing assumption of reliable links for the protocols that follow.

## Designing Data-Intensive Applications, 2nd ed. (Kleppmann) — framing only, not quoted

URL: not-fetched-paywalled-book
Version: 2nd edition — used by the plan only to frame why a system model (synchronous/partially synchronous/asynchronous, the fault classes) is worth stating precisely before any consistency model is defined. No claim in this topic rests on a quote from it.

## Notes on Data Base Operating Systems (Gray, 1978) — named only, not independently verified

URL: not-fetched-paywalled-10.1007/3-540-08755-9_9
Version: Springer, *Operating Systems: An Advanced Course*, Lecture Notes in Computer Science vol. 60, 1978, pp. 393–481 — could not be fetched (no accessible free full text found at research time; Springer's page requires a subscription)

The Deep dive names this paper as the origin of the "Two Generals" name for the problem of two parties trying to agree on a time to attack over a messenger who might not arrive, and states only the well-established, widely corroborated facts that do not depend on a page-level quote: the problem shows no protocol over a lossy channel can let both parties be *certain* the other received the final message, however many acknowledgements are added, and that this (not a limit on cleverness) is why "reliable" is always built from retransmission plus an *accepted* residual risk, never a guarantee. This is disclosed as a named pointer, not a verified quote, per `scripts/sources.mjs`'s rule that an unreachable source's claims are kept to what is independently well known rather than attributed to a specific unseen passage.

## Chapter 5: Database Internals and Distributed Storage (this domain, already live) — internal source, not fetched

URL: internal-not-fetched-site/src/topics/data-engineering/m2-storage-database-internals/ch05-database-internals-distributed
Version: this repository's own live topics `synchronous-asynchronous-semi-synchronous` (introduces `replication-ack-modes`) and `write-ahead-logging-fsync` (introduces `wal-lsn-fsync`)

The practitioner anchor this topic makes precise: the primary-backup register the lab runs is Chapter 5's replication-acknowledgement vocabulary, and "a lost disk" in the crash-recovery fault model is exactly what Chapter 5's WAL/fsync topic showed can go missing on an unclean restart.
