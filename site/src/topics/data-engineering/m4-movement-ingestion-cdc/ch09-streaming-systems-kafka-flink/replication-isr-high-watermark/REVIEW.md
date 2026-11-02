# Review

## Content review, self-review, 2026-10-30

- **Flow**: hook (records believed safe that vanished) → setup (replica column and ruler) →
  predict (which position is committed) → reveal (the high watermark, real numbers) → predict
  (trust the recorded line?) → reveal (truncating by the right marker) → predict (does one
  replica still accept full-durability writes?) → reveal (last replica standing) → prove it →
  recap. Each reveal's takeaway is picked up by the next step, and the recap's three rows map
  one-to-one onto the three reveals. No dangling thread.
- **Pre-notes / post-notes**: pre-notes assume topic 2's acks/durability vocabulary (per
  `prerequisites.mdx`, linking topic 2 as "before this"); post-notes point forward to topic 4
  (KRaft), matching `CHAPTER.md`'s handoff.
- **Gap-hunt**: all nine claims in `OUTLINE.md`'s claims list are sourced in `SOURCES.md` and
  checked in `FACT-CHECK.md`. No claim in `reel.tsx` or `narration.json` lacks a corresponding
  source or `examples.py` measurement. `coverage.json`'s `gapReview.open` stays `[]`.
- **Correction carried through consistently**: `CHAPTER.md`'s "ELR default on new clusters from
  Kafka 4.1" claim is not asserted anywhere in this topic's shipped files — `OUTLINE.md`,
  `FACT-CHECK.md`, `SOURCES.md`, `references.md`, `post-notes.md`, `coverage.json` and
  `narration.json` all describe ELR as a KIP-966 mechanism without a version claim, and
  `coverage.json`'s syllabus clause still quotes `CHAPTER.md`'s exact words (required for the
  build's coverage check) while the taught content itself stays accurate.
- **Expert-reader pass**: a reader who already knows Kafka would not find anything misleading —
  the high-watermark-as-minimum model, the index-slice truncation reimplementation, and the
  last-replica-standing classic-vs-gated comparison are all disclosed as simplified toy models
  (`examples.py`'s docstring, `FACT-CHECK.md`, `references.md`), and the qualitative claims (high
  watermark lags the leader, epoch truncation beats raw-offset truncation, gating on
  `min.insync.replicas` closes the last-replica-standing gap) all match Kafka's real documented
  behavior.
- **Engagement**: three predict steps (which position commits, trust the recorded line, does one
  replica keep accepting writes), each with a plausible wrong option per `FACT-CHECK.md`'s
  red-team section.
- **Narration-teaches**: `narration.json`'s ten blocks explain the reasoning (why the leader's own
  position isn't enough, why a follower's own recorded line is stale, why checking a minimum
  closes the loss window) rather than reading the on-screen rows back; narration avoids every raw
  config name and symbol (`min.insync.replicas`, `acks=all`, `KIP-966`), replacing each with a
  spoken equivalent. `node scripts/narration-teaches.mjs` ran clean (exit 0) on all ten steps.

No findings. Nothing added to `coverage.json`'s `gapReview.open`.

## Looks review, self-review

Reviewed all screenshots in `site/test-results/` for `replication-isr-high-watermark`: every step
(01–10) at desktop and phone width, plus the predict-answer-shown (`-q`) frames for steps 03, 05
and 07.

**No findings.** Applying the lesson from topic 2's title-overflow bug up front — keeping every
predict-step title short (five to nine words) and every `scenes.tsx` Row label/value to one to
three words each, per the project's own visual gotchas — meant this topic's automated reel test
(`node scripts/check-all.mjs --only reels --topic <folder-slug>`, run with the folder slug rather
than the `de.`-prefixed id so it actually exercises the held reel) passed clean on the first run
after that adjustment: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." The
only failure in that check run was `test:editor`, a known, topic-independent sandbox limitation
(headless-Chromium popup handling) unrelated to this topic's own files — documented in project
memory, not a real defect.

Manually reviewed every step's screenshot against DESIGN.md's looks-review checks (the point
visible at a glance, every step landing on a teaching final frame, nothing crowded or clipped,
colour only where it means something — the focus colour on each reveal's stronger-guarantee row,
nowhere else — caption matching the picture): all clean, no nav-bar overlap on any predict title,
no text overflow or overlap on phone.
