# OUTLINE: Linked and intrusive lists (`dsa.linked-intrusive-lists`)

Content plan and storyboard, written 2026-10-22 against this topic's entry (#2) in [`CHAPTER.md`](../CHAPTER.md).

- **Syllabus line (DSA §2.1, full topic):** "singly, doubly, circular; why pointer chasing usually loses to arrays; where lists still win: O(1) splice, stable addresses, intrusive lists in kernels and allocators (Linux list_head)."
- **Previous topic (live):** "Dynamic arrays and growth policy" (`dsa.dynamic-arrays-growth-policy`). Its handoff, answered directly here: "A dynamic array wins by keeping everything next to everything else. Next: the structure that gives that up on purpose, and what it buys back."
- **Concepts used, not re-taught:** `contiguous-storage`, `pointer-invalidation`, `cache-lines`, `cache-miss`, `dynamic-array-doubling` (all topic 1 / Chapter 1).
- **Next topic (§2.2):** "Stacks, queues and deques" (refresher). Its bridge needs this topic to leave "a list can hold a sequence" settled without yet picking an access discipline.
- **Kind:** full, about 13 minutes, 15 steps: open (1), predict (2), mechanism (3–12) with two more predicts (6, 12), recap (13), "Prove it, 1 of 2 … 2 of 2" (14–15).
- **Running example:** the chapter's log-buffer records, now linked instead of packed: the same records as nodes scattered across memory, each carrying a next pointer (and, from step 4, a prev pointer).

## Learning outcomes

1. Draw and distinguish singly, doubly and circular linked lists, and say what each buys over the others.
2. Explain, with a measurement, why pointer chasing usually loses to array traversal, and under what condition it doesn't (allocation order vs traversal order, not an absolute law).
3. Name the operations a list does in O(1) that an array cannot (splice, insert/remove given a node), and why stable addresses matter.
4. Explain the intrusive-list idea and read a real `container_of`-style recovery of the owning struct from the Linux kernel.

## The problem (opened in step 1, closed in step 13)

"A dynamic array wins by being contiguous: one allocation, one cache line serves several elements. A linked list gives that up on purpose. What does it buy back?" Closed in step 13: three concrete things, each shown with a mechanism — O(1) splice, addresses that never move, and a design (intrusive linking) the array can't express at all.

## Conventions for this topic (chapter grammar, `DESIGN.md` briefing theme)

- **Colour:** `crema` nodes/records; `latte` secondary labels; `taupe` axes, empty/null slots, quiet notes; `caramel` the structure or operation the step is demonstrating; `cinnamon` (rare) the compared alternative (the array, when contrasted against the list); `cherry`/`cherryText` the bad/impossible case (a dangling null check avoided by circular lists is *not* cherry — it's resolved; cherry is reserved for the pointer-chasing cost blowing up and for any genuinely bad outcome). At most two accents per step.
- **The node-and-arrow picture:** small `crema` squares (nodes) scattered at different x-positions on a wide memory strip (the chapter's contiguous-array strip from topic 1, reused, now mostly empty/`taupe` to show the nodes are *not* packed into it); `caramel` arrows for next, a second thinner arrow row for prev once introduced (step 4).
- **Kit only:** `site/src/reels/kit.tsx` (`Stack`, `Svg`, `T`, `Bar`, `C`), never copied.
- **Narration:** no digits, symbols or code names; say "next pointer", "previous pointer", "the kernel's list head", "contain er of" is wrong — say "container of"; numbers spelled in words with rounding for large ones (e.g. "about four hundred fifty cycles", "nine cycles").

## Reel steps and storyboard

### 1. What do you get back? (Opening)
- **Fig:** `Opening`. The log row from topic 1, contiguous and `caramel`, fading to mostly `taupe` as its cells "scatter" into loose nodes connected by a first `caramel` arrow.
- **Narrator's line of thought:** names contiguity's cost — a linked structure pays one pointer per element and gives up the free ride on cache lines — and poses the chapter's real question for today: what three things does that buy back, concretely.
- **Takeaway:** none (opening).

### 2. Append without a tail pointer (predict)
- **Fig:** `SinglyAppend`. A singly linked list (one next-pointer per node) with only a head pointer, asked to append one more record at the end.
- **Options:** **"Walk every node to find the end: O(n)"** (correct) / "O(1), like an array with spare capacity" / "O(log n), like a doubling array's resize" / "Impossible without a tail pointer".
- **Wrong options, why tempting:** "O(1)" over-generalizes topic 1's array result to a structure with no extra capacity to grow into; "O(log n)" confuses this with an unrelated amortized bound; "impossible" overstates — it's slow, not impossible.
- **Answer / explain:** "Without a stored tail pointer, appending means walking every node from the head to find the last one, then attaching the new node: O(n). A singly linked list's only built-in fast end is the head."
- **Takeaway:** "A singly linked list is fast at its head and slow everywhere else you haven't kept a pointer to."

### 3. Doubly: O(1) remove given a node
- **Fig:** `DoublyRemove`. The same nodes, now each carrying a second, thinner `caramel` prev-arrow pointing back.
- **On screen:** removing a node in the middle: its prev and next neighbours' pointers re-point around it in one frame, no walk required, *given a pointer to the node itself*.
- **Narrator's line of thought:** stresses the condition in italics — doubly linking doesn't make *finding* a node any faster, only *removing one you already have a pointer to*, which is exactly what a hash table's bucket chain or an LRU cache's eviction needs.
- **Takeaway:** "Doubly linking turns remove-given-a-node into O(1); finding that node in the first place is unchanged."

### 4. Circular: no null at the ends
- **Fig:** `Circular`. The same doubly linked nodes, now closed into a ring with a sentinel node standing in for "head", so no pointer anywhere in the structure is ever null.
- **Narrator's line of thought:** explains why this matters operationally, not just aesthetically: every insert/remove function can use the same code path at the ends as in the middle, because there's no special-cased null to check — exactly the design the Linux kernel's own `list_head` uses (named here, built in steps 10–11).
- **Takeaway:** "A circular list with a sentinel removes every null check an open-ended list needs at its ends."

### 5. Same records, scattered in memory
- **Fig:** `Scatter`. The chapter's log records redrawn as list nodes at memory addresses in allocation order (left) versus an order that defeats it (right, nodes shuffled far apart) — same records, same next-pointers, different placement.
- **Narrator's line of thought:** sets up honestly that the *list* doesn't control this — the *allocator* does, and whether traversal order matches allocation order is what the next two steps actually measure.

### 6. Is walking a list always slower than an array? (predict)
- **Fig:** `ChasePredict`. The two memory layouts from step 5, each about to be traversed.
- **Options:** "Yes, pointers are always slower than indices" / **"Only when traversal order and allocation order disagree"** (correct) / "No, modern CPUs make them equal" / "Only for lists longer than the cache".
- **Wrong options, why tempting:** "always slower" ignores that a pointer *can* point at the very next address; "CPUs make them equal" overstates hardware prefetching's reach; "only longer than the cache" is close but names the wrong variable — size changes the *size* of the gap, not whether one exists.
- **Answer / explain:** "When a list's nodes sit in memory in the order you walk them, the hardware prefetcher follows the next pointer almost as cheaply as it follows an array index. When they don't, every step is an unpredictable jump the prefetcher can't anticipate."
- **Takeaway:** "Pointer chasing doesn't lose because it uses pointers — it loses when node order and memory order disagree."

### 7. Nine cycles versus four hundred fifty
- **Fig:** `ChaseMeasured`. The two traversals from step 6, now with a real measured cost attached to each.
- **On screen:** sequential-order traversal beyond cache, `caramel`, labelled "about nine cycles per element"; random-order traversal, `cinnamon`, labelled "about four hundred fifty cycles per element and climbing" — both sourced to the same benchmark, same hardware, same element size.
- **Narrator's line of thought:** is explicit these are real measured numbers from one real benchmark (Drepper's), not a general law, and that the fifty-times gap is the whole reason "arrays usually win" is a real engineering default and not folklore.
- **Takeaway:** "On one real benchmark, a list walked in memory order cost about nine cycles per element; the same list shuffled cost about four hundred fifty and climbing — roughly a fiftyfold gap from allocation order alone."

### 8. O(1) splice versus an array's shift
- **Fig:** `Splice`. A run of several nodes cut from the middle of one list and spliced into another, shown as four arrows repointed in a single frame, beside the array equivalent: the same run removed from an array, which must shift every element after it.
- **On screen:** the list splice: exactly four pointer rewrites regardless of how long the run is; the array: every element from the splice point to the end sliding left, then right into its new position.
- **Narrator's line of thought:** names the exact invariant: a list splice's cost depends only on whether you're relinking at one boundary or two, never on how many nodes move with it, which is precisely what an array's shift can't offer.
- **Takeaway:** "Splicing a run out of a linked list costs a constant number of pointer rewrites, no matter how long the run is; the same move in an array costs one shift per element after it."

### 9. An address that never moves
- **Fig:** `StableAddress`. A node with a long-lived external pointer into it, surviving every insert and remove elsewhere in the list — contrasted with topic 1's vector, where the same kind of external pointer died the instant a `push_back` reallocated.
- **Narrator's line of thought:** connects directly back to topic 1's invalidation rule by name, so the two topics' facts combine into one actionable rule: if code needs to hold onto an element's address across other insertions, that's a sign it needs a list (or a container documented to keep addresses stable), not a vector.
- **Takeaway:** carried into the recap.

### 10. The intrusive idea
- **Fig:** `Intrusive`. Two pictures side by side: a generic list where each node is a separate allocation holding a copy of (or a pointer to) the payload, versus an intrusive list where the link fields live inside the payload struct itself, no second allocation.
- **On screen:** the Linux kernel's own `struct list_head` — just two pointers, next and prev, no payload field at all — embedded as a member inside a drawn example payload struct; a second embedded `list_head` shown inside the same struct, labelled "the same record can be a member of two different lists at once."
- **Narrator's line of thought:** is precise about the trade: intrusive linking costs one allocation instead of two per element and lets one object belong to several lists through several embedded link fields, at the price that the link type itself can't carry its own payload — it has to be embedded in someone else's.
- **Takeaway:** "An intrusive list's link fields live inside the payload struct, so adding a node costs no second allocation, and the same struct can join several lists through several embedded link fields."

### 11. Recovering the struct from the link field
- **Fig:** `ContainerOf`. A pointer to one embedded `list_head` inside a payload struct, with an arrow walking backward by the field's fixed, compile-time offset to land on the struct's own address.
- **On screen:** the kernel's real macro, named and quoted: `container_of` casts a member pointer back out to its containing struct by subtracting that member's offset; `list_entry` and `list_first_entry`, built directly on `container_of`, do the same for a `list_head` specifically.
- **Narrator's line of thought:** walks through *why* this works at all — the member's offset inside its struct is fixed at compile time, so "subtract the offset" is always correct, not a guess — and is candid that the kernel's own comment now steers new code toward `container_of_const` instead, which does the same recovery without discarding `const`.
- **Takeaway:** "`container_of` recovers a struct's address from a pointer to one of its members by subtracting that member's fixed, compile-time offset — the mechanism every kernel list macro is built on."

### 12. Does `container_of` check the type? (predict)
- **Fig:** `ContainerOfPredict`. The same recovery, now with a deliberately wrong `type` argument passed.
- **Options:** "No, it's a macro, it can't check anything" / **"Yes — the current macro asserts the pointer and member types match"** (correct) / "Only in debug builds" / "Only for `list_head` specifically".
- **Wrong options, why tempting:** "a macro can't check" was true of simpler, older versions of this idea and still describes much hand-rolled intrusive-link code; "only in debug builds" confuses this with the kernel's separate, optional list-corruption checking; "only for list_head" mistakes a general mechanism for one of its users.
- **Answer / explain:** "The current `container_of` macro runs a compile-time `static_assert` that the pointer's type matches the named member's type (or is `void`), and reports a mismatch as a compile error, not a silent bad cast."
- **Takeaway:** carried into the recap.

### 13. Back to the problem
- Recaps the three things a linked list buys back for giving up contiguity: O(1) splice (step 8), addresses that never move (step 9), and the intrusive design an array literally can't express (steps 10–12) — against the one real, measured cost of giving it up (steps 6–7). Hands off: "A list can hold a sequence. Neither a list nor an array says anything yet about the *order* you're allowed to touch it in. Next: the two disciplines that do."

### 14. Prove it, 1 of 2 — splice vs shift, in numbers
- `examples.py` simulates removing a contiguous run of `k` nodes from the middle of a 10,000-node structure and reinserting it elsewhere: a plain Python doubly linked list counts exactly 4 pointer rewrites regardless of `k`; the array equivalent (Python list slicing) is checked against the exact number of elements that must shift. Both counted exactly, not estimated.

### 15. Prove it, 2 of 2 — recovering a struct's address for real
- `examples.py` builds a real C struct with `ctypes` (an int field, then an embedded two-pointer link struct mirroring `list_head`), reads the link field's real, compiler-computed byte offset, and recovers the struct's base address from a synthetic "pointer" to the link field by subtracting that offset — asserting the recovered address equals the struct's known real address. The sequential/random cycle counts from step 7 (about 9 and about 450) are asserted as the cited source numbers, not re-measured.

## Post-notes (Deep dive) headings and what each covers

- `## After this topic you can` — the four outcomes above.
- `## Into the internals`, with `### Singly, doubly, circular, compared` (a table of what each buys, tying steps 2–4 together), `### Why pointer chasing usually loses, precisely` (the full benchmark setup and the 9-vs-450 numbers, step 7's full account), `### Splice and stable addresses` (step 8–9, plus the pointer/reference/iterator contrast with topic 1's vector), `### Intrusive lists and container_of` (steps 10–12 in full, including `container_of_const` and the type-check `static_assert`).
- `## In production` — the real shape of a kernel-style intrusive list use (an object that is simultaneously a member of a free list and an active list via two embedded `list_head`s), stated only in the pattern the sources support.
- `## The frontier` — lock-free/RCU-protected list variants (named only, not built; the kernel ships `list_for_each_entry_rcu` and friends, out of scope here) and skip lists / XOR-linked lists as further structures that trade the same contiguity away differently.
- `## More questions` — self-check on when doubly linking helps and when it doesn't; on what exactly a splice's O(1) bound does and doesn't depend on.
- `## Where this goes next` — stacks, queues and deques as a discipline on top of either structure.

## Examples to execute (`examples.py`)

1. Build a minimal doubly linked list (plain Python objects, `next`/`prev` attributes) of 10,000 nodes; implement `splice(run_head, run_tail, dest_after)` that relinks exactly 4 pointers; assert the rewrite count is exactly 4 for three different run lengths (`k` = 1, 37, 5000).
2. Model the array equivalent: removing a contiguous run of `k` elements from a Python list of length 10,000 at a given position and reinserting it elsewhere; assert the number of element moves (computed directly from the slice lengths involved, not timed) scales with the elements between the two splice points, not with a constant.
3. Use `ctypes` to define a real C struct with an embedded two-pointer link field; read `LinkedPayload.link.offset` (the real, compiler-computed byte offset); given the real address of an instance's embedded link field (via `ctypes.addressof`), subtract the offset and assert the result equals `ctypes.addressof(instance)` exactly — a working `container_of`.
4. Assert the two cited cycle counts from Drepper's benchmark (about 9 cycles/element sequential beyond cache, about 450 cycles/element and climbing for random) as sourced constants, and assert their ratio rounds to 50 (450/9 ≈ 50), the "about fiftyfold" figure step 7 states.

## Claims list (every factual claim, with its source)

1. Without a tail pointer, appending to a singly linked list is O(n) — direct consequence of the structure; not independently sourced (standard CS fact, same status as "array append is O(1) amortized" assumed in Chapter 1).
2. Doubly linking makes remove-given-a-node O(1) — direct consequence of the structure.
3. A circular list with a sentinel needs no null check at its ends — direct consequence of the structure.
4. `struct list_head` is exactly two pointers (`next`, `prev`), no payload field — Linux kernel `include/linux/types.h`.
5. `list_add`/`list_add_tail` insert in O(1) by relinking; the kernel's own comments name stacks and queues as their respective uses — Linux kernel `include/linux/list.h`.
6. `list_splice` joins two lists by relinking, without walking either — Linux kernel `include/linux/list.h`.
7. Sequential pointer-chasing beyond the L2 cache costs about 9 cycles per element; random-order pointer-chasing beyond L2 costs about 450 cycles per element and climbing — U. Drepper, "What Every Programmer Should Know About Memory" (2007), §3.3.
8. `container_of` recovers a containing struct's address from a member pointer by subtracting that member's compile-time offset, and the current macro asserts the pointer and member types match — Linux kernel `include/linux/container_of.h`.
9. `container_of_const` is now the kernel's preferred form, preserving `const`; `container_of`'s own doc comment says not to use it in new code — Linux kernel `include/linux/container_of.h`.
10. `list_entry`/`list_first_entry` are built directly on `container_of` — Linux kernel `include/linux/list.h`.

## Concept ledger

- **Introduces:** `singly-linked-list`, `doubly-linked-list`, `circular-list`, `splice-operation`, `stable-addresses`, `intrusive-list`, `container-of-pattern`.
- **Uses:** `contiguous-storage`, `pointer-invalidation`, `cache-lines`, `cache-miss`, `dynamic-array-doubling`.
- **Declared:** none new beyond Chapter 1 / topic 1.

## Bridge and handoff

- **Bridge:** "A dynamic array wins by contiguity. A linked list gives contiguity up on purpose — here is what that costs, measured, and the three things it buys back."
- **Handoff:** "Both structures can hold a sequence; neither says anything yet about the *order* you're allowed to touch it in. Next: the two disciplines that do — stacks and queues."

## Progress

Research done (`SOURCES.md`, 22/22 quotes verified); this content plan and storyboard written. Next: fact-check pass (`FACT-CHECK.md`), `coverage.json` against these exact step titles and post-notes headings, then build every file.
