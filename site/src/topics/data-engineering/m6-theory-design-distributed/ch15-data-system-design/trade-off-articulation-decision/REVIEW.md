# Review — de.trade-off-articulation-decision

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 8's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 10's syllabus line (source-side
interrogation).

1. **Flow.** The bridge answers topic 8's handoff verbatim, and the handoff to topic 10 matches
   `CHAPTER.md`'s own bridge text exactly. `uses` draws entirely from this chapter (topics 1-5,
   7-8) and Chapter 3's `data-contract-specification`, all confirmed live via `grep` on
   `registry.ts`'s own `introduces` arrays — `declared` stays empty, matching `CHAPTER.md`'s own
   stated `Declared: none.`
2. **Pre-notes.** 6 bullets, under 400 words, no links.
3. **Gap hunt.** The syllabus line splits into five clauses by `CHAPTER.md`'s own breakdown (three
   alternatives with costs; an ADR per major choice; "what would make us change our mind"; the
   next bottleneck at 10× load; pacing a 45-minute whiteboard session with its own parenthetical
   timing breakdown). Caught two build failures from this: the "what would make us change our
   mind" clause needed its syllabus-exact double quotes (I'd first written it with single
   quotes), and the whiteboard-pacing clause needed its full parenthetical
   ("requirements 5–10 min, high level 10, deep dives 20, wrap-up 5") included, not just the
   lead-in phrase — the coverage checker's "union covers the full line" rule caught both before
   either reached a final run.
4. **Expert reader.** The red team's finding (`FACT-CHECK.md`) confirmed the ADR-structure and
   superseded-not-edited claims trace to Nygard's own quoted text, and that this topic doesn't
   stretch either source to cover the individual method steps or requirements gathering, which
   `CHAPTER.md` explicitly leaves to topics 1-8 and 10-11.
5. **Engagement.** Hook (step 1, two engineers presenting the same pipeline, only one not
   surprised later); predict within the first four steps (step 2); three takeaways (steps 4, 6,
   8); recap (step 9); "Prove it" (step 10) extends the chapter's own reasoning to a new scenario
   (an early diagram eating the session clock) rather than restating the hook's own numbers.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 0-12% description
   overlap on every step, longest line 36 words. Spot-checked step 6 (the "what would change our
   mind" reveal): the narrator argues for *why* this field matters more than the decision itself,
   not just naming the field.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. One overlap was caught and fixed on the first `--only reels` run: step 2's row label
   "alternatives, costs, trigger" ran into its own value text on phone width — shortened to
   "costs and a trigger." Every other `scenes.tsx` row was written to 1-3 words per side from the
   start, with row gaps of 65-75px and `Svg` heights sized to the row count.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or amended-result highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. Two step titles with embedded apostrophes or
quotation marks (`don't`, and an originally-quoted "what would change our mind") needed quoting
fixes — one from an escaped single quote the coverage checker's title-extraction regex couldn't
follow, one from a title that embedded its own double quotes, both resolved by rewording rather
than fighting the checker's string parsing. The unrelated `test:editor` check again fails in this
sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-8's reviews.
