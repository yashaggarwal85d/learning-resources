# OUTLINE: Dynamic arrays and growth policy (`dsa.dynamic-arrays-growth-policy`)

Content plan and storyboard, written 2026-10-22 against this topic's entry (#1) in [`CHAPTER.md`](../CHAPTER.md). Writing follows this file; a change of plan is made here first, with its reason.

- **Syllabus line (DSA §2.1, full topic):** "amortized O(1) append, growth factor 2 vs 1.5 (memory-reuse argument), reserve/shrink, pointer invalidation on reallocation, and why contiguous storage wins on cache locality."
- **Previous topic (Chapter 1, live):** "Measuring the memory hierarchy" (`dsa.measuring-memory-hierarchy`). Its handoff, which this topic answers directly: "You have proved the doubling array's cost and measured it. Chapter two opens with the container itself: growth factor 2 or 1.5 and the memory-reuse argument, reserve and shrink, the pointers a reallocation invalidates, and why contiguous storage wins."
- **Concepts from Chapter 1, used directly, not re-taught:** `amortized-cost`, `aggregate-method`, `dynamic-array-doubling`, `growth-factor` (topic 5); `cache-lines`, `cache-miss` (topic 2, declared again here).
- **Next topic (§2.1):** "Linked and intrusive lists". Its bridge: "A dynamic array wins by contiguity. A linked list gives contiguity up on purpose." So this topic's last step must leave the cache-locality claim as a stated result with a number, not a fully built measurement (topic 2 builds and measures the pointer-chased side).
- **Kind:** full, about 12 minutes, 14 steps: open on the problem (1), a predict in step 2, mechanism (3–11) with one more predict (6 and 9), "Back to the problem" (12), "Prove it, 1 of 2 … 2 of 2" (13–14).
- **Running example:** the chapter's log buffer, 16-byte records, appended from empty. `examples.py` simulates, in Python, the growth-rule arithmetic itself (as Chapter 1's topics 5–7 do, not by shelling out to a real C++/Rust/Python runtime) for three real policies: g = 2, g = 1.5, and CPython's own formula `new_allocated = (newsize + newsize//8 + 6) rounded down to a multiple of 4` (the clean, comparison-free line quoted in `SOURCES.md`), each run to 1,000,000 appends from empty.

## Learning outcomes

1. State the amortized O(1) append bound as settled by Chapter 1, for any fixed g > 1, and say that this topic asks a different question: which g, and why.
2. Explain the memory-reuse argument: g = 2 makes every new chunk strictly bigger than the sum of every chunk ever freed before it (1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1), so the vector can never reuse its own memory; any g < 2 eventually can, and name real libraries' real, differing choices.
3. Use `reserve` and `shrink_to_fit` correctly, stating exactly what each guarantees and what it leaves to the implementation.
4. State exactly what reallocation invalidates and why, and give the cache-locality reason contiguous storage is the default choice.

## The problem (opened in step 1, closed in step 12)

"Chapter one proved a doubling vector is amortized O(1) to append, for any fixed growth factor. It never said *which* factor, or why it should be two, or what you give up for that choice. Four real libraries answered that question four different ways. Which one is right?" Closed in step 12: there isn't one right answer — there is a trade-off (reuse vs crawl-forward memory; a few large copies vs many small ones; a documented contract vs none at all) and each of the four made it differently, for reasons that hold up.

## Conventions for this topic (chapter grammar, `DESIGN.md` briefing theme)

- **Colour:** `crema` the log records and cells; `latte` secondary labels; `taupe` axes, empty slots, quiet notes; `caramel` the policy the reel is demonstrating at that moment, the chosen answer, the thing to look at; `cinnamon` (rare, text/shapes only) the alternative being compared (g = 1.5 against g = 2 in steps 3–4; the gentler CPython policy in step 14); `cherry` with `C.cherryText` the bad outcome (the dangling pointer, the discarded chunk that can never be reused). At most two accents per step.
- **The log row:** a row of square cells, filled `crema` with a short record label, capacity = row length, empty slots `taupe`-outlined. A reallocation draws the new, longer row below and moves cells up along short `caramel` arrows; the old row, once abandoned, is outlined `cherry`-dashed (steps 3, 9, 10).
- **The discard pile** (steps 3–5, new in this topic): a stack of rectangles below the row, one per freed chunk, sized to scale, growing downward as chunks are freed; under g = 2 the next request (drawn to its right) is always taller than the whole pile stacked together; under g = 1.5 the pile eventually reaches as tall as the next request.
- **Kit only:** `site/src/reels/kit.tsx` (`Stack`, `Svg`, `T`, `Bar`, `C`), never copied; `Draw`/`Plot`/`Decode`/`Surface`/counts for the kit moves each step uses.
- **Narration:** no digits, symbols or code names; say "growth factor two", "g dash e dash c dash c" is wrong — say "the GCC C++ library", "fbvector", "see python" is wrong — say "C Python", "reserve", "shrink to fit". New lexicon terms added on first use: `golden ratio` is **not** used this topic (the fact-check in `FACT-CHECK.md` found the primary source's argument is "any g less than two", not a golden-ratio threshold — see Changes below); add `fbvector`, `jemalloc` (Deep dive only), `reallocation`.

## Changes from the chapter plan

`CHAPTER.md`'s topic-1 entry speculated that the memory-reuse threshold might be the golden ratio φ ≈ 1.618 (the "sum of every previously freed buffer ≥ the next buffer" property). The fetched primary source (Folly's `FBVector.md`) makes a different, weaker, and correctly cited claim: g = 2 can *never* reuse any previously freed chunk (every new chunk exceeds the sum of all previous ones), while *any* g < 2 eventually can reuse a specific previously freed chunk, with concrete examples (1.5 → after 4 reallocations, 1.45 → after 3, 1.3 → after 2). This topic teaches Folly's actual, sourced argument, not the golden-ratio sum property (which may be true of a different, stronger notion of "reuse" but has no primary source fetched for it here). The concept id `golden-ratio-growth-bound` from `CHAPTER.md` is therefore not introduced by this topic; the registry entry introduces `memory-reuse-argument` only. `CHAPTER.md` is not edited (per the skill's rule); this is recorded here and in `REVIEW.md`.

## Reel steps and storyboard

### 1. The doubling array, proved and left open (Opening)
- **Fig:** `Opening`. **Visual idea:** the log row from Chapter 1's last reel, already doubling, with a question mark over "2".
- **On screen:** the row filling by doubling (0→1→2→4→8…), Chapter 1's dashed `caramel` amortized-bound line reappearing as a settled fact (one frame, not re-derived), then a `?` landing on the growth factor itself.
- **What moves:** `Draw` grows the row in the familiar doubling pattern; a `Decode` move reveals the amortized-O(1) line as already proved, then fades it to make room for the open question.
- **Narrator's line of thought (beyond the caption):** she doesn't reprove amortized O(1) — she names it as *this chapter's starting capital* from the last topic, and immediately asks the sharper question a textbook usually skips: a bound holding for every fixed g doesn't tell you which g a real system should pick, or why "2" became the default answer so many places use without re-deriving it.
- **Takeaway:** none (opening).
- **Caption's point:** amortized O(1) holds for any fixed g; this topic is about which g, and why.

### 2. Does the old memory ever come back? (predict)
- **Fig:** `Reuse`. **Visual idea:** the discard pile forming beside the row as it resizes repeatedly; the predict asks whether the pile ever grows tall enough to supply the next chunk.
- **On screen (question frame):** the row doubling through 4 resizes (capacity 1→2→4→8→16), each old chunk dropping into the discard pile beside it; a `?` over whether the pile, summed, ever reaches the height of the next chunk requested.
- **Options:** "Yes, after a few resizes" / "Yes, immediately" / **"No, never"** (correct) / "It depends on the allocator".
- **Wrong options, why tempting:** "a few resizes" feels right because doubling looks generous; "immediately" overestimates how fast small chunks add up; "depends on the allocator" is true for some growth factors but not for g = 2 specifically, which is what's asked.
- **Answer / explain:** "Never. Each new chunk is bigger than the sum of every chunk freed before it: 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1, always one short. The vector can only ever crawl forward in memory."
- **Narrator's line of thought:** she sets up the next two steps' proof before giving it, so the reveal lands as confirmation of a real mechanism, not a trivia answer.
- **Takeaway:** "Doubling a vector can never reuse any of the memory it has already freed."

### 3. Doubling outgrows everything it ever freed
- **Fig:** `Crawl`. **Visual idea:** the discard pile and the next request drawn to scale, side by side, so "one short" is visibly one short, every time.
- **On screen:** chunks of size C, 2C, 4C, 8C stacking in the discard pile (`cherry`-dashed, abandoned); beside it, the next requested chunk (16C, `caramel`) always taller than the whole pile combined.
- **What moves:** `Plot` draws the geometric series bar by bar; a running sum ticks up beside the pile and is shown falling just short of the next request each time.
- **Narrator's line of thought:** she names this "crawling forward" the way Folly's engineers named it, and makes the learner see *why* a sum of a geometric series with ratio exactly 2 is always one short of the next term, rather than asserting it.
- **Takeaway:** "1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1: one short of the next chunk, forever."

### 4. A factor under two can reuse a block
- **Fig:** `Reuse2`. **Visual idea:** the same picture with g = 1.5 (`cinnamon`) instead of 2: the discard pile this time catches up.
- **On screen:** chunks growing by ×1.5 instead of ×2; after four resizes, the discard pile's running sum reaches the size of a future request (the exact reallocation-count examples from the source: 1.5 after 4, 1.45 after 3, 1.3 after 2, shown as a small side-by-side table).
- **What moves:** the same `Plot` pattern as step 3, now catching up instead of falling short; a short table counts in from the three g values.
- **Narrator's line of thought:** she contrasts this directly with step 3's "always one short," so the learner reads the two pictures as the same mechanism with one number changed.
- **Takeaway:** "Any growth factor under two eventually lets the vector reuse its own discarded memory."

### 5. Four libraries, four growth policies
- **Fig:** `Libraries`. **Visual idea:** four small rows growing side by side at their real rates over the same ten resizes, so the gap between "aggressive" and "gentle" is visible at a glance.
- **On screen:** GCC's libstdc++ (g = 2, `caramel`, cited to Folly's own account of it), Folly's `fbvector` (g = 1.5, `cinnamon`), CPython's `list` (the quoted growth pattern 0, 4, 8, 16, 24, 32, 40, 52, 64, 76 — visibly much gentler, each step only about 1.125× plus a small constant), and Rust's `Vec` (drawn with a `?` instead of a fixed rate, since it makes none).
- **What moves:** four `Draw` rows grow in parallel over ten beats, each at its own real rate.
- **Narrator's line of thought:** she is explicit that this isn't four implementations of the same idea — it's four different, real, shipped answers to the same trade-off, and the gap between CPython's curve and GCC's is the whole lesson in one picture.
- **Takeaway:** "Growth factor is a real engineering choice: GCC's std::vector doubles, Folly's fbvector uses 1.5, CPython's list grows by about one eighth, and Rust's Vec promises no rate at all."

### 6. What does Rust actually guarantee? (predict)
- **Fig:** `RustGuarantee`. **Visual idea:** Rust's row from step 5, still growing at an unlabelled rate, with the question turned around: if there's no fixed factor, what *is* promised?
- **Options:** "Nothing at all" / "That it will double" / **"Amortized O(1) push, nothing about the rate"** (correct) / "That it matches the C++ standard".
- **Wrong options, why tempting:** "nothing at all" overreads "no particular strategy" as "no guarantee of any kind"; "double" assumes Rust must follow C++'s convention; "matches the C++ standard" confuses two unrelated languages' documentation.
- **Answer / explain:** "Rust's own documentation is explicit: no particular growth strategy is guaranteed, but whatever strategy is used will of course guarantee O(1) amortized push. The complexity bound is the contract; the mechanism is free to change."
- **Narrator's line of thought:** she uses this to make a general point that applies beyond Rust — a language or library's real contract is usually the complexity bound, not the mechanism, and conflating the two is a common, costly mistake when porting code between libraries.
- **Takeaway:** "A library's real promise is usually the complexity bound, not the growth factor that happens to deliver it."

### 7. Reserve skips the early resizes
- **Fig:** `Reserve`. **Visual idea:** the same log row, built two ways side by side: one resizing from empty, one calling `reserve` once up front and never resizing again for the same run.
- **On screen:** left row: the familiar resize cascade; right row: one allocation at the final size, records simply filling in; the C++ standard's own wording (quoted) under both: reallocation happens at `reserve(n)` if and only if the current capacity is less than n, and no reallocation happens on later insertions until the size would exceed that capacity.
- **What moves:** `Draw` grows the left row in steps; the right row appears once, full-sized but empty, then fills with `Plot` ticks, no resizing.
- **Narrator's line of thought:** she is precise about what `reserve` is not: it isn't a resize itself, it's a directive that can skip resizes that would otherwise happen, and the standard states exactly when it does and doesn't reallocate.
- **Takeaway:** "reserve(n) reallocates only if the current capacity is already below n, and then nothing resizes again until the vector would exceed it."

### 8. Shrink is a request, not a promise
- **Fig:** `ShrinkToFit`. **Visual idea:** a row that has shrunk back down after a burst, with `shrink_to_fit` called on it, and two possible outcomes drawn side by side under a fork.
- **On screen:** a row at low load factor; `shrink_to_fit()` called; one branch shows a smaller reallocated row (`caramel`), the other shows the same row unchanged (`taupe`, labelled "the implementation may decline"), both equally standards-compliant.
- **What moves:** `Decode` reveals the standard's own words: "a non-binding request... to allow latitude for implementation-specific optimizations"; the fork animates both branches from the same starting frame.
- **Narrator's line of thought:** she flags this as a place engineers get overconfident — code that assumes `shrink_to_fit` always frees memory is relying on something the standard explicitly does not promise.
- **Takeaway:** "shrink_to_fit never increases capacity and may reduce it, but the standard calls it non-binding by name: it can do nothing at all."

### 9. Is a pointer safe after shrink_to_fit? (predict)
- **Fig:** `Dangle`. **Visual idea:** the same fork from step 8, now with a pointer drawn into one of the row's cells before the call.
- **Options:** "Always safe" / "Always invalid" / **"Only if that branch reallocated"** (correct) / "Safe only for the first element".
- **Wrong options, why tempting:** "always safe" assumes shrink can't move what's already tight; "always invalid" overgeneralizes the previous step's "may do nothing"; "only the first element" confuses this with a different container's guarantee.
- **Answer / explain:** "It depends on which branch actually ran. If shrink_to_fit reallocated, every pointer, reference and iterator into the old buffer is invalid, the past-the-end iterator included. If it didn't reallocate, they're all still valid. The standard states this as one remark attached to both reserve and shrink_to_fit."
- **Takeaway:** carried into step 10.

### 10. Every pointer into the old buffer dies at once
- **Fig:** `Invalidate`. **Visual idea:** the chapter's shared cherry-dashed-old-row picture, now with several pointers drawn into it, all snapping to `cherry` the instant the new row appears.
- **On screen:** the row reallocating; three labelled pointers/iterators into specific cells, all flashing `cherry` the moment the new row's cells finish moving; the past-the-end iterator included, drawn one slot past the last cell.
- **What moves:** `Surface` or a sharp `Draw` flash times the invalidation to land exactly on the frame the new row completes, not before or after.
- **Narrator's line of thought:** she stresses "all at once, unconditionally" — this isn't a probability or a maybe, it's every pointer, every time reallocation actually happens, which is why the two previous predicts both hinged on "did it reallocate."
- **Takeaway:** "Reallocation invalidates every pointer, reference and iterator into the old buffer, the past-the-end iterator included, the instant it happens."

### 11. Contiguous wins before the first cache miss
- **Fig:** `Locality`. **Visual idea:** the memory strip from Chapter 1 topic 10, now under the log row, with a second, scattered row of the same records previewed as a ghost beneath it (full picture built in the next topic).
- **On screen:** the log row's memory strip showing one cache line covering several records at once (Chapter 1's cache-line term, declared); beneath it, a faint preview of the same records as separate nodes scattered across a wider strip, each touching its own line.
- **What moves:** a single `caramel` highlight sweeps across one cache line covering several `crema` cells at once (a scan that pays for one line for several elements); the ghost row beneath shows (not yet measures) what the next topic will build and measure.
- **Narrator's line of thought:** she is careful to say this is a result stated here and measured in the very next topic, not a number invented for this one.
- **Takeaway:** "A contiguous array lets one cache-line fetch serve several elements at once; the next topic measures what the alternative costs."

### 12. Back to the problem
- Recaps the four libraries' choices as one trade-off (reuse vs crawl-forward memory; a documented contract vs none), restates `reserve`/`shrink_to_fit` as precise-but-non-binding tools, and the invalidation rule as unconditional. Hands off: "A dynamic array wins by contiguity. Next: the structure that gives that up on purpose."

### 13. Prove it, 1 of 2
- `examples.py` simulates 1,000,000 appends from empty under g = 2 and g = 1.5, asserting total element copies, final capacity, and number of reallocations for each; the reel shows the two totals side by side (g = 2: fewer, larger copies; g = 1.5: more, smaller copies, lower peak waste).

### 14. Prove it, 2 of 2
- `examples.py` runs the same 1,000,000-append simulation under CPython's own quoted formula and reports its reallocation count and final over-allocation against g = 2 and g = 1.5, closing on the real spread between "aggressive" and "gentle" growth policies named in step 5.

## Post-notes (Deep dive) headings and what each covers

- `## After this topic you can` — the four outcomes above, each as a sentence.
- `## Into the internals`, with `### The memory-reuse argument, in full` (the complete geometric-series derivation, both directions), `### Four libraries, four choices` (GCC, Folly, CPython, Rust, each with its citation and what it trades off; jemalloc cooperation named here, not in the reel), `### reserve and shrink_to_fit, precisely` (the full standard wording, both functions, both complexity clauses), `### What reallocation invalidates, and why` (the exact remark, plus why a vector can't avoid this without giving up contiguity — forward to topic 2).
- `## In production` — a real incident shape (holding a reference across a push_back that should have called reserve first) stated only in the pattern the sources support, no invented specifics.
- `## The frontier` — object relocation (Folly's `IsRelocatable`, named only, not built) and allocator cooperation (jemalloc size classes) as two ideas that change the growth-factor question again; named with "Goes deeper later" where no syllabus topic hosts them.
- `## More questions` — self-check questions on reserve vs shrink_to_fit, and on which pointers survive a `push_back` that doesn't resize.
- `## Where this goes next` — topic 2's contiguous-vs-pointer-chased measurement.

## Examples to execute (`examples.py`)

1. Simulate g = 2 and g = 1.5 growth (capacity starts at 0, first append allocates 1, a full vector resizes to `ceil(g * cap)` with a minimum of `cap + 1`) for 1,000,000 appends from empty; assert total element copies, final capacity, and reallocation count for each g.
2. Simulate CPython's quoted formula (`new_allocated = ((newsize + newsize // 8 + 6) // 4) * 4`, with the small-size floor the quoted comment implies) for the same 1,000,000 appends; assert its reallocation count and compare its final over-allocation (allocated − used) against g = 2 and g = 1.5's.
3. Folly's three reuse-after-N-reallocations numbers (1.5 → 4, 1.45 → 3, 1.3 → 2) are cited, not re-derived: the obvious "sum of discarded chunks ≥ next chunk" model converges at the same count (2) for every g < φ, so it cannot be Folly's model and `examples.py` does not pretend to reconstruct it (see `FACT-CHECK.md`, claim 3).

## Claims list (every factual claim, with its source)

1. Amortized O(1) append for any fixed g > 1 — Chapter 1 topics 5–6 (not re-sourced here).
2. g = 2 means every new chunk is bigger than the sum of all chunks freed before it — Folly `FBVector.md`.
3. Any g < 2 eventually permits reuse of a previously freed chunk; 1.5 → after 4 reallocations, 1.45 → after 3, 1.3 → after 2 — Folly `FBVector.md`.
4. GCC's libstdc++ `std::vector` uses g = 2; other compilers have used 1.5 — Folly `FBVector.md` (Folly's own account, cited as such, not independently confirmed against libstdc++'s source in this topic).
5. Folly's `fbvector` uses g = 1.5 — Folly `FBVector.md`.
6. CPython's `list` over-allocates by about newsize/8 + 6, rounded to a multiple of 4; growth pattern 0, 4, 8, 16, 24, 32, 40, 52, 64, 76 — CPython `listobject.c`.
7. Rust's `Vec` does not guarantee any particular growth strategy; whatever strategy is used guarantees O(1) amortized push — Rust `std::vec::Vec` docs.
8. `reserve(n)` reallocates iff current capacity < n; no reallocation on subsequent insertions until size would exceed the reserved capacity — N4868 [vector].
9. `shrink_to_fit()` is a non-binding request; never increases capacity; may reallocate — N4868 [vector].
10. Reallocation invalidates all references, pointers and iterators into the sequence, including the past-the-end iterator; if no reallocation happens, they remain valid — N4868 [vector].
11. A contiguous scan touches one cache line per B elements — Chapter 1 topics 2 and 10 (not re-sourced here; stated as a carried-forward result).

## Concept ledger

- **Introduces:** `memory-reuse-argument`, `reserve-capacity`, `shrink-to-fit`, `pointer-invalidation`, `contiguous-storage`.
- **Uses:** `amortized-cost`, `aggregate-method`, `dynamic-array-doubling`, `growth-factor`, `cache-lines`, `cache-miss`.
- **Declared:** `cache-lines`, `cache-miss`.

## Bridge and handoff

- **Bridge:** "Chapter one proved that doubling an array is amortized O(1) and left the growth factor as a free choice. Here is how four real libraries chose it, and what you give up the moment a resize moves everything."
- **Handoff:** "A dynamic array wins by keeping everything next to everything else. Next: the structure that gives that up on purpose, and what it buys back."

## Progress

Research done (`SOURCES.md`, 18/18 quotes verified); expert list and coverage map drafted; this content plan and storyboard written. Next: fact-check pass (`FACT-CHECK.md`), finalize `coverage.json` against these exact step titles and post-notes headings, then build every file.
