status: fixed

# REVIEW: External-memory (I/O) model (`dsa.external-memory-i-o`)

Redone from scratch (the previous `REVIEW.md` here was a report-only pass with no "status: fixed" line, so per the loop's rule it was treated as not yet fixed, and this folder — which was still at the old path `chapters/.../ch01-cost-models/external-memory-io-model` — was re-reviewed and actually corrected this time, not just re-reported). Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/CHAPTER.md`. Every cited URL was re-fetched via the proxy; the Vitter 2008 survey PDF was fetched fresh and grepped directly for the two facts the draft depends on (the PDM constraint and the two bibliography entries).

## Important context discovered during this pass

This exact topic (`dsa.external-memory-i-o`) already exists, fully built (`reel.tsx`, `scenes.tsx`, `examples.py`, `coverage.json`) and **`status: 'live'`**, at `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/external-memory-i-o/`. This `chapters/` folder was the pre-promotion draft (parked under the wrong parent folder with the wrong id — see Flow/ID below) and appears to have never been cleaned up after the topic shipped. After the fixes below, this draft's `index.mdx` is byte-for-byte identical to the shipped version except for one sentence's wording (same fact, phrased slightly differently).

Worth flagging to a human separately (out of this task's scope, which is only `chapters/` drafts): the **shipped, live** copy has the exact same unfixed Basics-section short bullets, the same "sixteen thousand" vs "sixteen thousand three hundred and eighty-four" rounding mismatch, the same "a few hundred thousand" imprecision, and the same answer-less "Three of three" narration step that this review found and fixed here. A maintainer may want a follow-up pass on the live copy, independent of this draft.

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | `https://doi.org/10.1145/48529.48535` (Aggarwal & Vitter, CACM 1988) | No — ACM returns HTTP 403 (bot/JS gate), same as the prior pass. | Corroborated via Vitter's 2008 survey bibliography, ref. [23], refetched and grepped directly this pass: "A. Aggarwal and J. S. Vitter, 'The Input/Output complexity of sorting and related problems,' Communications of the ACM, vol. 31, no. 9, pp. 1116–1127, 1988." Matches the draft's citation exactly. |
| 2 | `https://www.ittc.ku.edu/~jsv/Papers/Vit.IO_book.pdf` (Vitter 2008 survey) | Yes, HTTP 200, fetched fresh and converted with `pdftotext`. | Yes. Table 3.1's four bounds confirmed verbatim. **The constraint the prior pass flagged was real and is now fixed**: the PDF states "where M < N and 1 ≤ DB ≤ M/2" (§2.1) — for the single-disk case D = 1 this chapter uses, that is B ≤ M/2, not B ≤ M as the draft's internals section said. |
| 3 | `https://doi.org/10.1109/SFFCS.1999.814600` (Frigo, Leiserson, Prokop, Ramachandran, FOCS 1999) | No — IEEE Xplore returns HTTP 202 with no body (bot/JS gate). | Corroborated via Vitter's bibliography ref. [168], refetched and grepped: "M. Frigo, C. E. Leiserson, H. Prokop, and S. Ramachandran, 'Cache-oblivious algorithms,' in Proceedings of the IEEE Symposium on Foundations of Computer Science, pp. 285–298, 1999." Matches exactly. |
| 4 | Data Engineering "Memory hierarchy and latency numbers" / "The external-memory (I/O) cost model" (prerequisites.mdx cross-links) | N/A, internal | Both syllabus headings confirmed against `syllabus/data-engineering.md` lines 61 and 72, word for word. **Fixed:** the `<Resource>` title for the second one was the registry's short display title ("The I/O cost model") instead of the syllabus heading `Resource.astro` actually looks up (`live.position()` matches on the syllabus title, confirmed by reading `src/lib/live.ts` and `src/components/Resource.astro`) — this would have thrown `"The I/O cost model" is not a topic in syllabus/data-engineering.md` at build time. Corrected to "The external-memory (I/O) cost model", matching `syllabus/data-engineering.md` line 72 and the shipped topic's own prerequisites.mdx. |

Neither bot-blocked DOI is evidence of a dead link (both ACM and IEEE front their abstract pages with bot/JS challenges); both are independently corroborated through the fully-reachable Vitter survey.

## 2. Numbers

- **Fixed:** the internals section said the model "requires M < N … and B ≤ M (a block fits in memory)." Vitter's stated PDM constraint is 1 ≤ DB ≤ M/2, i.e. B ≤ M/2 for D = 1 — twice as loose as the real bound. Corrected to B ≤ M/2 with the citation inline.
- Every other number was recomputed and is correct: N/B = 262,144, M/B = 16,384, N/M = 16; log₅₁₂(2²⁷) = 3 against log₂(2²⁷) = 27; log₁₆₃₈₄(262,144) ≈ 1.29 → two passes; N·log₂N ≈ 3.6 billion comparisons (134,217,728 × 27 = 3,623,878,656, checked exactly); 2·N/B ≈ 524,288 ≈ "half a million."
- **Fixed, narration precision:** step 9 (0-indexed 8) said block transfers were "a few hundred thousand," understating 524,288 — changed to "about half a million" to match `index.mdx`'s own arithmetic.
- **Fixed, narration consistency:** step 4 (0-indexed 3) gives M/B precisely ("sixteen thousand three hundred and eighty-four"); step 7 (0-indexed 6) had rounded the same quantity to "sixteen thousand" — made consistent.

## 3. Narration & format

- Valid JSON, 14 steps, confirmed with a fresh parse.
- No unspeakable characters (digits, symbols, code-style names) in any line, confirmed by running the checker's own regexes (`UNSPEAKABLE`, `CODE_NAME`) over every line and answer.
- No line exceeds the voice's 50-word budget (`narration/voice.json: pace.max_words_per_line`), confirmed by a word-count scan.
- Four predict steps with answers (within the chapter's stated "2–4 predict questions" shape for a full topic).
- Opens on the bridge verbatim (confirmed programmatically: step 1's first two lines concatenate to `registry-entry.ts`'s `bridge` field exactly).
- **Fixed:** step 14 (0-indexed 13), the closing step, said "The I/O model needs M and B…" — a literal slash in a spoken line, which the chapter's own narration rule forbids. Reworded to "This model needs capital M and capital B…", preserving the handoff's meaning without the symbol (the same kind of light rewording already used elsewhere in this script to keep the bridge speakable).
- **Fixed:** step 14 was headed "Three of three, and the honest caveat," continuing the "prove it, one/two/three of three" numbering steps 12–13 start — but it asks no question and has no `answer`, breaking the pattern those two steps establish. Reworded to "One last word, and an honest caveat," dropping the false "three of three" framing without inventing a fifth predict question (already at four, the top of the chapter's stated 2–4 range).
- **prerequisites.mdx, Basics section — fixed, three bullets were under the 25-word minimum:** "Scan" (14 words), "Run" (22 words) and "Cache line" (23 words) named the term without explaining it or giving a "where you meet it" scenario, as the house rule (owner rule 2026-10-15) requires. Rewrote all three to ≥25 words each, each now ending with a concrete "Where you meet it" scenario, consistent with the other three bullets. Re-checked: 6 bullets, 368 total words (within 150–900), Basics is still the first section, no links.
- **prerequisites.mdx — fixed a build-breaking `<Resource>` title** (see Sources item 4 above).
- index.mdx: frontmatter `id`/`title` present; all five `<section data-section="…">` blocks present and in the required order (outcomes, internals, lab, production, sources).

## 4. Flow

`uses` (`word-ram`, `cache-miss`, `big-o-theta-omega`, `sorting-lower-bound`, `information-theoretic-bound`, `recursion-tree`, `dynamic-array-doubling`, `amortized-cost`, plus declared `logarithms`/`standard-sorts`) matches `CHAPTER.md`'s own ledger for this topic word for word. Checked each id against the as-built `site/src/topics/registry.ts`: `word-ram`/`cache-miss` ← `dsa.word-ram-model-assumptions`; `big-o-theta-omega` ← `dsa.asymptotic-notation`; `sorting-lower-bound`/`information-theoretic-bound` ← `dsa.lower-bounds-adversary-arguments`; `recursion-tree` ← `dsa.recurrences-master-theorem-akra`; `dynamic-array-doubling`/`amortized-cost` ← `dsa.aggregate-accounting-methods`. All precede this topic in the chapter. `introduces` matches `CHAPTER.md` exactly. (Note: the already-shipped live registry entry actually drops `logarithms`/`standard-sorts` from its own `uses` array — a harmless, unexplained deviation from `CHAPTER.md`'s written plan for this topic. This draft keeps the contract's version, which is more faithful to the plan, so it was left as is.)

## 5. ID / slug / folder — fixed (the major finding)

`CHAPTER.md` assigns this topic (no. 8, §1.3) `id: dsa.external-memory-i-o`, folder `external-memory-i-o`, under `…/m1-data-structures/ch01-cost-models-amortized/` (topics 2–10's parent folder; only topic 1 lives under `ch01-cost-models`). The draft was built as `id: dsa.external-memory-io-model` in folder `external-memory-io-model`, directly under `ch01-cost-models` — the wrong parent folder (topic 1's) and a different id/slug than the contract assigns, with no `OUTLINE.md` recording the deviation as `CHAPTER.md` requires for any departure from the plan.

**Fixed:** moved the whole folder to `chapters/data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/external-memory-i-o/` and updated `registry-entry.ts` (`id`, `slug`), `narration.json` (`topic` field) and `index.mdx` (frontmatter `id`) to `dsa.external-memory-i-o` throughout. This now matches `CHAPTER.md` exactly, and matches the id/slug of the already-shipped live topic noted above.

## Final state

All five review areas now pass: sources are fetched and corroborated (two DOIs are bot-blocked but corroborated via Vitter's own bibliography, not dead), the one wrong constant (B ≤ M, should be B ≤ M/2) is corrected with its citation, narration is valid, speakable, consistently rounded and has no orphaned "prove it" step, the Basics section's three underweight bullets are expanded into real explanations with scenarios, a build-breaking `<Resource>` title is fixed, and the folder/id/slug now match the chapter contract.

status: fixed
