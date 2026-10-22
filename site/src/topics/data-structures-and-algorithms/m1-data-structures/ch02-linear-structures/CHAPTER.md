# Chapter 2 plan: Linear Structures (Data Structures & Algorithms, Milestone 1)

This is the contract for every topic of Chapter 2. Builders keep to their own entry and read the entries next to theirs. Don't edit this file. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 22 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 2, §2.1–§2.3) and Chapter 1's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 2, title: 'Linear Structures', section: '2.1' | '2.2' | '2.3' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** every topic lives in `…/m1-data-structures/ch02-linear-structures/<folder>`, next to this file.
- **Inherits from Chapter 1** (not re-taught; used directly): `amortized-cost`, `aggregate-method`, `accounting-method`, `dynamic-array-doubling`, `growth-factor` (topics 5–7); `cache-lines`, `hardware-prefetching`, `cache-miss` (topics 2, 8, 10); `latency-percentiles` (topic 7). Chapter 1's handoff: "Chapter two opens with the container itself: growth factor 2 or 1.5 and the memory-reuse argument, reserve and shrink, the pointers a reallocation invalidates, and why contiguous storage wins." Topic 1 of this chapter answers that handoff directly and does not re-prove the amortized O(1) bound — it cites Chapter 1 topics 5–6 for the proof and spends its own budget on the policy question (which factor, and why) and the storage question (contiguous vs pointer-chased).

---

## The chapter

### The problem it solves

Chapter 1 proved that *a* growable array is amortized O(1) to append and named the growth factor as a free parameter. Chapter 2 is about the structures a working engineer actually reaches for to hold a sequence, and the real engineering choices inside each one: which growth factor a real library picked and why, what a pointer-linked structure buys that a contiguous one can't, how a LIFO or FIFO discipline is built on top of either, how to exploit a stack or queue's own ordering invariant to amortize a *second* bound (not just allocation) across a whole run, how to make a queue's memory bounded instead of growing forever, and how a string — the sequence every program touches most — pays for immutability and for being measured in bytes but indexed by meaning. The thread through all six topics is **the same four questions asked of every linear structure**: what does one operation cost, what does a sequence of operations cost, what does contiguity buy or cost on real hardware, and what invariant can be read off the structure's own history to prove a bound tighter than "check the worst case." Later chapters build on this directly: hash tables (Ch.3) resize exactly like topic 1's vector; trees (Ch.4) are built from linked nodes exactly like topic 2's; heaps (Ch.6) are array-backed; graph algorithms (Ch.17 onward) run a BFS queue and a DFS stack from topic 3; sliding-window and two-pointer techniques (Ch.19) lean on topic 4's invariant; lock-free queues (Rust Systems Engineering Ch.10) are topic 5's ring buffer under contention.

### Order of ideas, and why

1. **§2.1 Arrays and lists (1–2).** Dynamic arrays, named by Chapter 1's handoff (1) → linked and intrusive lists (2), the pointer-based alternative, compared against 1 on the same axis (contiguity, cache behaviour, what each makes cheap). Arrays first because the chapter's running comparison is "contiguous vs pointer-chased," and contiguous is both the default choice in practice and the one Chapter 1 already set up.
2. **§2.2 Discipline on top of a sequence (3–5).** Stacks, queues and deques (3, the refresher: the two disciplines and the structures that give O(1) at both ends) → monotonic stacks and queues (4, the first structure in the whole syllabus whose amortized bound comes from an *invariant on the data*, not from paying off a resize) → ring buffers and bounded queues (5, back to arrays, now fixed-size and circular, closing the chapter's array/list comparison with the structure that is neither growing nor pointer-chased). 3 before 4 because 4 needs the deque as its container; 4 before 5 because 4's amortized argument (each element enters and leaves once) is the simplest clean example of an accounting argument since Chapter 1, and 5 needs no such argument (every operation is already O(1) worst case) — so the learner sees the technique once more before leaving it behind.
3. **§2.3 The structure every program touches most (6).** Strings and string builders (6): a different kind of sequence (immutable in most languages, measured in bytes, indexed by a code point or a grapheme the bytes don't align with one-to-one), closing the chapter by applying its whole toolkit (amortized cost, contiguity, growth policy) to the one structure the learner already thinks they understand.
4. **Handoff to Chapter 3.** Topic 6 ends on string hashing as a teaser with no mechanism; Chapter 3 opens with "Practical hash functions and HashDoS," the mechanism itself.

### One running example: the log buffer

Every topic that needs data takes it from one running scenario, so numbers and pictures carry across reels: **a service's request log**, a sequence of fixed-size records (a timestamp and a short status code, 16 bytes each) arriving one at a time, read back in arrival order or peeked from either end. A topic may narrow it (one key per record, a string payload) or widen it (bursts, a producer and a consumer) if it says how it relates to the shared scenario. Every number on screen is computed or asserted in that topic's own `examples.py`; the values below are planning values, and a builder who finds one wrong fixes it in its own topic and records it in `REVIEW.md` for the release seam check.

| Piece | Planning values (each topic's builder computes and asserts its own) | Used by |
|---|---|---|
| Record size | 16 bytes (8-byte timestamp, 8-byte status/payload word), language-neutral | 1, 2, 5 |
| Growth factors compared | **g = 2** (doubling) against **g = 1.5** (the golden-ratio argument) | 1 |
| The append run | 1,000,000 records appended from empty; reused from Chapter 1 topic 5/7's own counts where the number is the same quantity (copies per append, total copies) so the two chapters don't disagree | 1 |
| Pointer-chased list | the same 1,000,000 records as list nodes, one unrelated structure interleaved to break any accidental sequential allocation on screen, so the cache miss is real and not an artifact | 2 |
| The call/undo stack & the task queue | a depth of 12 calls (stack) and a burst of 12 enqueued tasks (queue), small enough to draw every frame | 3 |
| Sliding window | the log's status codes over a window of width 5, finding the next-greater status and the window maximum over 16 records | 4 |
| Ring buffer | capacity 16 (power of two), a producer/consumer trace of 24 operations that wraps the index at least twice | 5 |
| Strings | the log line itself as text: a 40-character formatted record; a batch of 10,000 lines concatenated two ways (append in a loop vs a builder) | 6 |

### Shared notation and terms

- **Amortized cost, the aggregate and accounting methods, the potential method:** exactly as Chapter 1 topics 5–6 define them; this chapter never rederives them, only applies them (topics 1 and 4) or contrasts with them (topic 5's "every operation is already worst-case O(1), no amortization needed").
- **Growth factor g:** Chapter 1's letter and meaning; topic 1 is where a *reason* for choosing a particular g enters the syllabus (the memory-reuse argument), not a new definition.
- **Contiguous vs pointer-chased:** `contiguous` = one allocation, index arithmetic to find an element; `pointer-chased` = each node its own allocation, traversal follows stored addresses. Named once in topic 1, used as the chapter's recurring axis in 2 and 5.
- **Cache line, cache miss, prefetcher:** Chapter 1 topic 2/10's terms, declared again wherever a topic's picture depends on them (1, 2, 5).
- **LIFO / FIFO:** last-in-first-out and first-in-first-out, defined once in topic 3 and used by name afterward (4, 5).
- **Invariant-based amortization:** the chapter's second amortization idiom (topic 4): a bound proved by charging each element's cost to an event in its own lifetime (entering, leaving) that can happen only a bounded number of times — distinct from Chapter 1's "charge for a future resize" idiom, and said to be distinct once, in topic 4's bridge.
- **Code point vs byte vs grapheme:** defined in topic 6 only (Unicode scalar value / UTF-8 code unit / user-perceived character); no earlier topic needs them.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "big O of one amortized", "capacity sixteen", "UTF-8", and add new terms (Sattolo is already in the lexicon from Chapter 1; add `golden ratio`, `intrusive`, `monotonic`, `circular buffer`, `code point`, `grapheme cluster`, `small-string optimization` the first time each appears, QUALITY.md #29).

### One visual language for the chapter's reels

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing", owner decision 2026-10-20): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` data and values as they are (records, keys, cells); `latte` secondary labels; `taupe` axes, empty slots, quiet notes; `caramel` **the thing to look at**: the chosen policy, the element currently being charged, the slot just written, the answer; `cinnamon` (rare) **the alternative being compared**, always the same side of each pair: g = 1.5 against g = 2 (topic 1, cinnamon is the alternative, caramel the one the reel ends up endorsing per its fact-checked conclusion), pointer-chased against contiguous (topic 2); `cherry` with `cherryText` **the bad outcome**: the cache miss, the dangling pointer after a reallocation, the overflow a bounded queue has to refuse, the quadratic blowup of repeated string concatenation.
- **The sequence is drawn the same way in every topic that holds the log:** a row of cells, filled `crema` with the record's short label, capacity shown as the row's length (empty slots outlined `taupe`). A reallocation (1) draws the new row below and moves cells up along short `caramel` arrows, with the old row's addresses marked `cherry`-dashed where topic 1 shows the dangling-pointer frame. A linked traversal (2) draws the same records as separate boxes joined by arrows that visibly do **not** sit next to each other on the memory strip beneath, so contiguous and pointer-chased are told apart at a glance.
- **A memory strip** (as Chapter 1 topic 10 draws it) sits under the cell row in topics 1, 2 and 5 whenever the picture needs to show real adjacency: addresses increase left to right, and a `cherry` flash marks a jump the pointer-chased structure makes that the array never does.
- **Monotonicity (4):** the stack or queue is drawn as a row of bars by value, and the invariant is visible as the bars forming one shape (strictly decreasing, say) at every frame; a bar that would break the shape is popped with a short `caramel` sweep before the new one is pushed, so the "each element enters and leaves once" argument is seen, not asserted.
- **The ring (5):** drawn as an actual circle of capacity slots (not a row), with `caramel` head and tail markers that advance by index arithmetic (shown as `i & (capacity − 1)`, never `i % capacity`, unless the topic explicitly contrasts the two); wraparound is a marker crossing the twelve-o'clock seam, never a cut.
- **Strings (6):** a row of byte cells under a second row of code-point brackets, so a multi-byte character's byte count and code-point count are both visible on the same frame; repeated concatenation draws a new, longer row each time (as 1's reallocation does), making the quadratic cost visually the same shape as 1's cost strip, on purpose.
- **Reel shape.** Topic 3 is this chapter's only refresher (about 6 minutes). Full topics (1, 2, 4, 5, 6) open on a problem drawn from the log buffer, ask a predict question in the first three steps, show the mechanism, then "Prove it." About 10–14 minutes, 2–4 predict questions.

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch02-linear-structures/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it. The ledger is per domain; ids Data Engineering also uses keep the same meaning here.

### 1. Dynamic arrays and growth policy (`dsa.dynamic-arrays-growth-policy`): full, §2.1

- **Folder:** `dynamic-arrays-growth-policy`. About 12 min.
- **Scope (syllabus clause → what it delivers):**
  - "amortized O(1) append": restated from Chapter 1 topics 5–6 as a fact already proved (one frame, citing the aggregate bound), not reproved; the budget goes to what Chapter 1 left open.
  - "growth factor 2 vs 1.5 (memory-reuse argument)": Chapter 1 showed *any* fixed g > 1 gives amortized O(1); this topic asks which g a real system should pick. The **memory-reuse argument**: after enough resizes, the total size of every previously freed buffer is ≥ the size of the next buffer to allocate iff g ≤ φ = (1 + √5)/2 ≈ 1.618 — so an allocator that reuses freed blocks can satisfy the next growth from what the vector itself already discarded only when g stays at or below the golden ratio; g = 2 can never reuse its own freed memory this way, g = 1.5 can, in the limit. (The precise inequality and its derivation to verify against the primary source before claiming the exact threshold on screen; if the source states a different threshold the reel follows it.) Real libraries' actual choices, named with their current behaviour verified against each library's own source or documentation at research time, not from memory: at minimum, one library using doubling and one using a sub-2 factor, each cited to where its growth is actually implemented or documented (not to a blog post's claim about it) — the specific libraries and factors are chosen during research (section 3) from what can be verified at that time, since vendor behaviour changes across versions.
  - "reserve/shrink": `reserve(n)` as a programmer-supplied lower bound on capacity that skips the early resizes the aggregate argument charges for; `shrink`/`shrink_to_fit` as a non-binding request (verify against a current standard-library reference) and why it can't be a hard guarantee without inviting the thrash Chapter 1 topic 6 already proved (shrink-at-½ vs shrink-at-¼); this topic doesn't re-derive the thrash bound, it cites it.
  - "pointer invalidation on reallocation": every pointer, reference and iterator into the old buffer is invalid the instant a reallocation happens, because the elements moved to new addresses; shown as the `cherry`-dashed old row in the chapter's shared picture; the general rule (which operations invalidate what) is cited from a current language reference, not asserted from memory, and the topic says plainly that the rule differs by language and container and that the reel shows one concrete language's rule, verified.
  - "and why contiguous storage wins on cache locality": a scan of the array touches one cache line per B elements (Chapter 1 topic 2's cache-line term, declared); the same N elements as linked nodes (topic 2's structure, previewed in one frame and fully drawn there) touch up to one cache line *per element* if nodes aren't allocated in order. This topic states the result as the chapter's throughline and lets topic 2 build and measure it.
  - Leaves the proof of amortized O(1) to Chapter 1 topics 5–6 (cited, not repeated), the pointer-chased alternative's full treatment to topic 2, and the C++/Rust/Python specifics beyond growth factor and invalidation (e.g. small-size optimizations for other containers) out of scope.
- **Outcomes:**
  - State the amortized O(1) append bound as a consequence of Chapter 1 and say which g it holds for.
  - Explain the memory-reuse argument for choosing g ≤ φ and name real libraries' actual choices, as verified at research time.
  - Use `reserve` and `shrink`/`shrink_to_fit` correctly and say what each does and does not guarantee.
  - Say exactly what reallocation invalidates and why, and give the cache-locality reason contiguous storage is preferred by default.
- **Introduces:** `memory-reuse-argument`, `golden-ratio-growth-bound`, `reserve-capacity`, `shrink-to-fit`, `pointer-invalidation`, `contiguous-storage`. **Uses:** `amortized-cost`, `aggregate-method`, `dynamic-array-doubling`, `growth-factor`, `cache-lines`, `cache-miss`. **Declared:** `cache-lines`, `cache-miss`.
- **Bridge:** "Chapter one proved that doubling an array is amortized O(1) and left the growth factor as a free choice. Here is how a real library chooses it, and what you give up the moment a resize moves everything."
- **Handoff:** "A dynamic array wins by keeping everything next to everything else. Next: the structure that gives that up on purpose, and what it buys back."
- **Prerequisites panel:** Chapter 1 topics 5–7 (Before this: amortized cost, the growth factor, resize hysteresis); Chapter 1 topic 2 (cache lines, declared). On-site: none new.
- **Visual idea:** the log buffer's row doubling under g = 2 in `caramel` beside the same append run under g = 1.5 in `cinnamon`, with a small stack of discarded buffers drawn below each; under g = 1.5 the discarded stack's total length visibly catches up to the next buffer's length, under g = 2 it never does.
- **Sources to start from (verify exact figures and current behaviour at research time):** the current C++ standard and a current major standard-library implementation's documentation or source for `std::vector` growth and `reserve`/`shrink_to_fit` semantics; the current Rust `std::vec::Vec` documentation for its stated (or explicitly unstated) growth behaviour; a primary engineering source for the memory-reuse/golden-ratio argument (an engineering write-up from a team that chose a sub-2 growth factor for this reason, read in full, not summarized from memory); a current language reference on iterator/pointer invalidation rules.

### 2. Linked and intrusive lists (`dsa.linked-intrusive-lists`): full, §2.1

- **Folder:** `linked-intrusive-lists`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "singly, doubly, circular": the three shapes as pictures (one next-pointer; next and prev; a circular list with a sentinel or simply no null); what each buys (singly: cheapest, only forward; doubly: O(1) remove given a node and backward traversal; circular: no null check at the ends, a natural ring).
  - "why pointer chasing usually loses to arrays": topic 1's claim measured: traversing N nodes allocated in arrival order vs N nodes allocated in an order that defeats the allocator's locality (the chapter's running example does this on purpose), counted in cache misses (Chapter 1 topic 2's term) and timed; the result stated honestly — the gap is about allocation order and working-set size, not an absolute law, and the reel says so.
  - "where lists still win: O(1) splice": moving a contiguous run of elements from one list to another by re-pointing a constant number of links, against an array's O(k) shift of the elements between the splice point and the end; "stable addresses": a node's address never changes for its lifetime (unlike a vector element's, which moves on reallocation, topic 1's invalidation rule), which is why a long-lived pointer into a collection needs a list (or a container documented to keep addresses stable) and not a vector.
  - "intrusive lists in kernels and allocators (Linux list_head)": the **intrusive** idea — the link fields live inside the payload struct itself rather than the payload living inside a generic node — and why: no second allocation per element, and the same struct can be a member of several lists at once via several embedded `list_head`s; the `container_of` idea (recovering the owning struct's address from a pointer to its embedded list field via a known field offset), read from the actual kernel header, not paraphrased from a secondary source; named uses (the exact subsystems named only if verified against the current kernel source at research time, not assumed from an older or remembered version).
  - Leaves stack/queue discipline on top of a list to topic 3; the measured locality numbers feed the chapter's running contrast, not restated.
- **Outcomes:**
  - Draw and distinguish singly, doubly and circular linked lists and say what each buys over the others.
  - Explain, with a measurement, why pointer chasing usually loses to array traversal, and under what condition it doesn't.
  - Name the operations a list does in O(1) that an array cannot, and why stable addresses matter.
  - Explain the intrusive-list idea and read a real `container_of`-style recovery of the owning struct.
- **Introduces:** `singly-linked-list`, `doubly-linked-list`, `circular-list`, `splice-operation`, `stable-addresses`, `intrusive-list`, `container-of-pattern`. **Uses:** `contiguous-storage`, `pointer-invalidation`, `cache-lines`, `cache-miss`, `dynamic-array-doubling`. **Declared:** none new beyond Chapter 1's.
- **Bridge:** "A dynamic array wins by contiguity. A linked list gives contiguity up on purpose — here is what that costs, measured, and the three things it buys back."
- **Handoff:** "Both structures can hold a sequence; neither says anything yet about the *order* you're allowed to touch it in. Next: the two disciplines that do — stacks and queues."
- **Prerequisites panel:** topic 1 (Before this); pointers and structs in a systems language (declared, with a self-check); Chapter 1 topic 2 (cache miss, declared). On-site: none new.
- **Visual idea:** the log buffer's row (contiguous, `caramel` memory strip beneath, tight) next to the same records as linked nodes scattered across a wide memory strip with `cherry` jumps between consecutive traversal steps; a splice shown as three arrows repointed in one frame while the array equivalent shows a whole block sliding.
- **Sources to start from (verify at research time):** the Linux kernel's own `list.h` / `list_types.h` header and its documentation (Documentation/core-api/kernel-api or current equivalent) read directly from the current kernel source tree, for the intrusive-list and `container_of` mechanism; CLRS 4th ed.'s linked-list chapter (framing, a book); a primary engineering source or well-documented microbenchmark methodology for the pointer-chasing-vs-array locality comparison (Chapter 1 topic 10's own sources, reused, since this is the same measurement technique applied to nodes instead of a permutation).

### 3. Stacks, queues and deques (`dsa.stacks-queues-deques`): refresher, §2.2

- **Folder:** `stacks-queues-deques`. About 6 min.
- **Scope (syllabus clause → what it delivers):**
  - "LIFO/FIFO semantics": the stack (push/pop at one end, last in first out) and the queue (enqueue at one end, dequeue at the other, first in first out), each with one canonical use (undo history; a task queue) drawn from the chapter's log-buffer scenario.
  - "array-backed circular deque vs chunked block deque (`std::deque`) and their iterator-stability trade-offs": a deque supports O(1) push/pop at *both* ends; two real designs: an array-backed circular buffer (topic 5's mechanism, previewed by name only) that gives O(1) at both ends but invalidates on resize exactly as topic 1's array does, and a chunked design (an array of fixed-size blocks, each block's elements stable in place; growing allocates a new block rather than moving existing elements) whose iterator-stability behaviour differs (verify the current standard's exact invalidation guarantees for the library this topic names, rather than asserting a specific rule from memory). The comparison is named and drawn; the circular buffer's own mechanism is left whole to topic 5.
  - Leaves the invariant-based amortized bound to topic 4, and the fixed-capacity/overwrite policy to topic 5.
- **Outcomes:**
  - State LIFO and FIFO and give one real use of each.
  - Say what a deque adds over a stack or queue alone.
  - Name the two common deque implementations and one real trade-off between them (resize behaviour vs iterator stability).
- **Introduces:** `lifo`, `fifo`, `stack`, `queue`, `deque`, `chunked-deque`. **Uses:** `contiguous-storage`, `pointer-invalidation`, `singly-linked-list`, `doubly-linked-list`. **Declared:** `stacks` (restated for this domain's ledger; Chapter 1 topic 5 already declared it there).
- **Bridge:** "Arrays and lists hold a sequence; they say nothing about which end you may touch. Stacks and queues are that rule made concrete."
- **Handoff:** "A plain stack or queue only promises O(1) at the ends it supports. Next: a stack or queue whose own shape proves a second bound — all without ever resizing for it."
- **Prerequisites panel:** topics 1 and 2 (Before this). On-site: none new.
- **Visual idea:** the undo stack as a vertical pile of the log's records that only ever grows or shrinks from the top; the task queue as the same records entering one end of a row and leaving the other, with a deque shown as both ends lit at once.
- **Sources to start from:** CLRS 4th ed.'s stack/queue sections (framing, a book); the current C++ standard library reference for `std::deque`'s iterator-invalidation guarantees (verify the exact clause at research time); a current systems language's standard collections documentation for its own deque design, as a second real example.

### 4. Monotonic stacks and queues (`dsa.monotonic-stacks-queues`): full, §2.2

- **Folder:** `monotonic-stacks-queues`. About 12 min.
- **Scope (syllabus clause → what it delivers):**
  - "next-greater-element … in O(n) amortized": scanning left to right, popping every stack element smaller than the current one before pushing it, so each popped element has just found its next-greater element; the stack stays monotonically decreasing by construction.
  - "sliding-window maximum in O(n) amortized": a monotonic deque over a window of fixed width, popping from the back any element smaller than the one just added (they can never be the window max while the new one is in range) and from the front any index that has fallen out of the window; the deque stays monotonically decreasing front to back, so the front is always the current window's maximum.
  - "the invariant that makes each element enter and leave once": the chapter's second amortization idiom, distinct from Chapter 1's resize-charging idiom (named once, in the bridge): every element is pushed exactly once and popped at most once across the whole run, so n operations do O(n) total pushes and pops regardless of how the pops are distributed — an aggregate argument over the *structure's own invariant*, not over a resize schedule.
  - Leaves the general sliding-window/two-pointer technique family to Ch.19; this topic teaches the two canonical monotonic structures only.
- **Outcomes:**
  - Compute next-greater-element with a monotonic stack and explain why it's O(n), not O(n²).
  - Compute a sliding-window maximum with a monotonic deque.
  - State the "enters and leaves once" invariant argument and tell it apart from Chapter 1's amortization idiom.
- **Introduces:** `monotonic-stack`, `next-greater-element`, `monotonic-deque`, `sliding-window-maximum`, `invariant-based-amortization`. **Uses:** `stack`, `deque`, `lifo`, `fifo`, `amortized-cost`, `aggregate-method`. **Declared:** `aggregate-method` (Chapter 1 topic 5 already introduces it; restated as the family this topic's argument belongs to).
- **Bridge:** "A plain stack or queue costs what you'd expect, one operation at a time. Keep one extra invariant on what the stack or queue is allowed to hold, and a whole run amortizes to O(n) for a reason that has nothing to do with resizing."
- **Handoff:** "An invariant on the data gave a bound with no resizing at all. Next: a queue that never resizes in the first place, because its capacity is fixed on purpose."
- **Prerequisites panel:** topic 3 (Before this); Chapter 1 topics 5–6 (Before this, for the aggregate-method contrast). Ch.19 "Sliding window and two pointers" as "Goes deeper later".
- **Visual idea:** the log's status codes as a row of bars; a monotonic stack drawn as the surviving bars forming a staircase at every frame, with each eliminated bar swept away by a short `caramel` arrow the instant a taller one arrives and a small per-bar "entered / left" tick that never exceeds one of each.
- **Sources to start from:** CLRS 4th ed. or an equivalent current algorithms text's treatment of amortized stack/queue arguments (framing, a book); a primary or well-regarded reference for the monotonic-deque sliding-window-maximum technique (its original source or a current, citable lecture-note treatment, read in full); this topic reuses Chapter 1's own amortized-analysis primary sources (Tarjan 1985) for the "enters and leaves once" argument's lineage.

### 5. Ring buffers and bounded queues (`dsa.ring-buffers-bounded-queues`): full, §2.2

- **Folder:** `ring-buffers-bounded-queues`. About 12 min.
- **Scope (syllabus clause → what it delivers):**
  - "power-of-two index masking": a fixed-capacity array with head and tail indices that advance mod capacity; when capacity is a power of two, `index & (capacity − 1)` replaces the division `index % capacity`, and the reel says why that's a real, measurable win (a mask is one cheap bitwise op; a modulo by a non-power-of-two is a division, far more expensive on real hardware — cited from a current source on integer-division cost, not asserted from memory) and *not* claim more than that source supports.
  - "full/empty disambiguation": the ambiguity (head == tail means either empty or full when both indices simply wrap) and the real fixes: sacrifice one slot (capacity usable = allocated − 1, so full means tail is one behind head); keep an explicit count or a full/empty flag alongside the indices; use unmasked monotonically increasing indices and mask only on access (so head and tail can be compared directly before masking). The topic picks one as its running mechanism and names the others as real alternatives with the same trade-off made explicit.
  - "overwrite vs block policies": what happens when a producer writes to a full ring — overwrite the oldest entry (lossy, used when only the latest matters, e.g. a metrics ring) vs block/refuse the write (lossless, used when every entry must be kept, e.g. the log buffer itself) — and that this is a policy choice orthogonal to the mechanism above.
  - "and boundedness as backpressure → Rust Systems Engineering Ch.7, Ch.10": a bounded queue forces a producer to slow down or drop work the instant a consumer falls behind, instead of growing without limit the way topic 1's array would — named as **backpressure**, with the concurrent, lock-free version of this same structure left whole to Rust Systems Engineering Ch.7 and Ch.10 (named, not built: this topic's ring buffer is single-threaded).
  - Leaves concurrency and memory-ordering concerns entirely to the Rust chapters; this topic's examples are single-threaded.
- **Outcomes:**
  - Implement power-of-two index masking and explain the real cost difference against modulo.
  - Disambiguate full from empty with at least two different mechanisms and state each one's trade-off.
  - Choose overwrite vs block policy for a given scenario and justify it.
  - Explain boundedness as backpressure and say what changes when the ring buffer is shared across threads (pointer to Rust Ch.7, Ch.10, not built here).
- **Introduces:** `ring-buffer`, `power-of-two-masking`, `full-empty-disambiguation`, `overwrite-policy`, `block-policy`, `backpressure`. **Uses:** `deque`, `fifo`, `contiguous-storage`, `pointer-invalidation`. **Declared:** none new beyond Chapter 1's and this chapter's own.
- **Bridge:** "The monotonic structures amortized a bound by never growing past what the invariant allowed. A ring buffer takes that further: it never grows at all, by design — and that refusal is itself the feature."
- **Handoff:** "Every structure so far has held fixed-size records at known offsets. The next one doesn't: a string's own length, in bytes, isn't the length a person reading it would count."
- **Prerequisites panel:** topics 1 and 3 (Before this); bitwise AND and power-of-two arithmetic (declared, with a self-check: what is 13 & 15?). Rust Systems Engineering Ch.7 "Lock-free queues" and Ch.10 "Backpressure and bounded channels" as "Goes deeper later".
- **Visual idea:** the ring drawn as an actual circle of 16 slots with `caramel` head and tail markers advancing clockwise; a producer/consumer trace that wraps the tail past the twelve-o'clock seam twice, with a `cherry` flash the one time the trace tries to overrun a full ring under the block policy, resolved differently under the overwrite policy in the next frame.
- **Sources to start from:** a current CPU/compiler-optimization reference on integer division vs bitwise-AND cost (verify the exact figures at research time; Agner Fog's instruction tables or the relevant vendor optimization manual, Chapter 1 topic 2's source family, reused); a well-documented real ring-buffer implementation's own source or design notes for the full/empty disambiguation choice (e.g. a current, widely used lock-free or embedded ring-buffer library, read directly); the backpressure framing from a primary systems-engineering source (a current systems text or a well-documented production write-up on bounded channels).

### 6. Strings and string builders (`dsa.strings-string-builders`): refresher, §2.3

- **Folder:** `strings-string-builders`. About 6 min.
- **Scope (syllabus clause → what it delivers):**
  - "immutability": most high-level languages make strings immutable (named with at least one verified current example); what that buys (safe sharing, hashable as dictionary keys) and what it costs (every "modification" allocates a new string).
  - "quadratic repeated concatenation": building a long string by repeatedly appending in a loop with `s = s + piece` costs Θ(k²) total for k pieces, the same shape as topic 1's reallocation cost strip, because each `+` allocates a whole new buffer; a string builder (a mutable, amortized-growable buffer, i.e. topic 1's dynamic array specialized to bytes) turns the same loop amortized O(k). This topic says explicitly that it is applying topic 1's result, not proving a new one.
  - "UTF-8 byte vs code-point indexing costs": a UTF-8 code point takes 1–4 bytes; indexing "the n-th byte" is O(1) but indexing "the n-th code point" is O(n) unless the structure keeps extra information, because the byte offset of code point n depends on how many of the preceding code points were multi-byte; at least one real language's design choice here verified at research time (e.g. a language that indexes strings by byte and panics or errors on landing mid-character, or one that stores a fixed-width internal representation to keep indexing O(1) at the cost of extra memory or preprocessing) — named only once verified against that language's own current documentation.
  - Leaves grapheme clusters (what a person would call "one character," which can itself span several code points) to a one-sentence mention with no mechanism, and string hashing and interning entirely to Chapter 3 (the handoff).
- **Outcomes:**
  - Explain why string immutability trades allocation cost for safety and hashability.
  - Explain why naive repeated concatenation is quadratic and why a string builder fixes it, citing topic 1's own result.
  - Say why UTF-8 code-point indexing can't be O(1) for free, and name one real language's trade-off.
- **Introduces:** `string-immutability`, `quadratic-concatenation`, `string-builder`, `utf8-byte-vs-codepoint`. **Uses:** `dynamic-array-doubling`, `growth-factor`, `amortized-cost`, `aggregate-method`, `contiguous-storage`. **Declared:** none new.
- **Bridge:** "Every structure in this chapter has held records whose size you knew in advance. A string looks like it should be the simplest of all of them, and it hides the chapter's whole toolkit — amortized growth, a reallocation, an indexing cost — inside something that looks like plain text."
- **Handoff:** "A string is a sequence of bytes, and so far this chapter has only ever compared them byte by byte or copied them whole. Turning a string, or any key, into a number fast and safely is a mechanism of its own: next, practical hash functions, and the attack a bad one invites."
- **Prerequisites panel:** topic 1 (Before this: amortized growth, reallocation); basic Unicode/UTF-8 familiarity (declared, with a self-check: how many bytes can one UTF-8 code point take?). Chapter 3 "Practical hash functions and HashDoS" as "Goes deeper later".
- **Visual idea:** the log line's 40 characters drawn as a byte row with a second row of brackets grouping bytes into code points (one multi-byte character sized visibly wider); beside it, two growing stacks of buffers for the same 10,000-line build — the naive loop's stack of ever-larger discarded buffers (shaped exactly like topic 1's cherry-dashed discard pile) against the builder's single steadily growing row.
- **Sources to start from:** the Unicode Standard's own description of UTF-8 encoding and code points (unicode.org, current version) read directly; a current language reference for its string immutability and indexing design (at least one language whose string indexing is byte-based and one note on what landing mid-character does, verified at research time); any well-documented engineering source on string-builder / `StringBuilder`-style amortized concatenation (can reuse Chapter 1's own amortized-array sources, since the mechanism is identical).

---

## Concept ledger at a glance (introduces, in order)

1. `memory-reuse-argument`, `golden-ratio-growth-bound`, `reserve-capacity`, `shrink-to-fit`, `pointer-invalidation`, `contiguous-storage`
2. `singly-linked-list`, `doubly-linked-list`, `circular-list`, `splice-operation`, `stable-addresses`, `intrusive-list`, `container-of-pattern`
3. `lifo`, `fifo`, `stack`, `queue`, `deque`, `chunked-deque`
4. `monotonic-stack`, `next-greater-element`, `monotonic-deque`, `sliding-window-maximum`, `invariant-based-amortization`
5. `ring-buffer`, `power-of-two-masking`, `full-empty-disambiguation`, `overwrite-policy`, `block-policy`, `backpressure`
6. `string-immutability`, `quadratic-concatenation`, `string-builder`, `utf8-byte-vs-codepoint`

Each concept is introduced once. Declared across the chapter (each topic declares its own again): `cache-lines`, `cache-miss` (Chapter 1), `stacks` (Chapter 1, restated for this domain by topic 3), `aggregate-method` (Chapter 1, restated by topic 4).

## Notes for the release run

1. **Verification discipline carries over from Chapter 1.** Every "to verify" and every library/language-version claim above is a placeholder for the research stage (section 3 of the skill): fetch the current primary source, quote it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 1's bridge against Chapter 1 topic 10's handoff (word for word, both already fixed above); topic 1's "contiguous wins" claim against topic 2's measured result (topic 2 must not contradict it, only quantify it); topic 3's deque entry against topic 5's ring buffer (topic 3 previews, topic 5 builds; no overlap); topic 4's "invariant-based amortization" against Chapter 1's idiom (must be named as distinct, not a special case, unless the fact-check finds it genuinely is one — then fix this plan's wording, don't let the topic silently contradict it); topic 6's handoff against Chapter 3's first topic's actual opening.
3. **Facts to verify, not assume** (each topic's fact-check): the exact golden-ratio inequality and which real libraries use which factor, and as of which version (1); the current C++/Rust invalidation rules named (1); Linux kernel `list_head`/`container_of` read from the current source, and which subsystems are actually named there now (2); `std::deque`'s current iterator-invalidation guarantees and a second language's own deque design (3); the primary or best-citable source for the monotonic-deque sliding-window-maximum technique (4); integer-division-vs-mask cost figures for the CPU family actually cited, and a real ring-buffer implementation's full/empty mechanism (5); the Unicode Standard's own wording for code points and at least one language's verified indexing behaviour (6).
4. **Lab:** this chapter's syllabus has no *Lab* bullet; no topic hosts one.
