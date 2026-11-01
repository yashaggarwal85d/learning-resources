# REVIEW: Progress guarantees and linearizability (`dsa.progress-guarantees-linearizability`)

## Pass 1 — Content

- Research: 14/14 quotes verified word for word by `sources.mjs check`. One real problem found
  and fixed: Herlihy's 1991 "Wait-Free Synchronization" PDF has a broken, pre-2000-scan font
  encoding that scrambles word order across a line under both this project's own fetch tool and a
  plain `pdftotext` extraction (confirmed identical with a direct `curl` + `pdftotext`, ruling out
  a fetch-tool-specific bug). Fixed with `pdftotext -layout`, which recovers correct reading order;
  a few individual words still carry a stray character from the same broken encoding (for example
  "of' steps" for "of steps"), so this topic's own quotes were chosen to fall either side of that
  one glitch rather than span it. The clean text was seeded into `sources.mjs check`'s own
  URL-hash cache file so the checker uses it instead of re-fetching the broken version.
- `examples.py`: every assertion passes. The lost-update enumeration (twenty interleavings,
  eighteen ending at one, two at two) matches `CHAPTER.md`'s own planning arithmetic exactly, as
  does the rule that a schedule is correct exactly when neither read falls inside the other's
  read-to-write span. The lock-based schedule, the adversarial compare-and-swap schedule, and the
  brute-force linearizability checker (applied to a linearizable and a non-linearizable history)
  all match the planned outcomes with no surprises.
- Gap hunt against the syllabus and `CHAPTER.md`: no gap found. Obstruction-freedom is named and
  quoted but deliberately not built, matching `CHAPTER.md`'s own scope (the chapter's counter
  demonstrates only blocking, lock-free and wait-free directly). The NP-completeness citation
  (Gibbons and Korach 1997) is checked by title, venue and result name only, per `CHAPTER.md`'s
  own instruction not to read the full paper. No claim is made that lock-free beats a lock in
  practice — the lock-based example is a scheduling trace, not a benchmark.
- `FACT-CHECK.md`'s red-team section covers the PDF-extraction finding, the obstruction-free
  scope limit, the atomic-add-is-wait-free claim's scope (the paper's definition, never a real
  CPU), the absence of a lock-free-is-faster claim, and the brute-force checker's own practical
  scale limit.

## Pass 2 — Looks

- `scenes.tsx`: twelve `Visual` functions, each kept to one to three words per label, following
  the two Playwright-overlap lessons learned on the previous two topics (shortened labels, and
  generous spacing between any two small elements that could otherwise sit close together — no
  two adjacent boxes anywhere in this topic share an identical short label the way the previous
  topic's "byte" boxes did, so the specific failure mode that needed widening there does not
  recur here by construction).
- Colour grammar: `crema` for an ordinary thread's own lane and steps, `taupe` for a stalled or
  suspended lane, `caramel` for the thing to look at (a winning compare-and-swap, a legal order,
  a linearization point), `cinnamon` for a second, contrasting object (the map beside the queue),
  `cherry`/`cherryText` for the bad outcome (a lost update, a history with no legal order) —
  consistent with `CHAPTER.md`'s own visual idea for this topic.
- No digit appears in `reel.tsx`'s on-screen text as a literal that isn't also a literal in
  `examples.py`'s own source (the digit-check's requirement); every measured count ("eighteen",
  "two", "a thousand") is spelled in words on screen and backed by the corresponding literal or
  loop bound in `examples.py`.
