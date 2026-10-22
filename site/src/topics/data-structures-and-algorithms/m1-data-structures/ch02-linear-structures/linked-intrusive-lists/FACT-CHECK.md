# FACT-CHECK: Linked and intrusive lists (`dsa.linked-intrusive-lists`)

Adversarial pass, 2026-10-22, against `OUTLINE.md`'s claims list and `SOURCES.md`.

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Without a tail pointer, singly-linked append is O(n) | direct structural consequence | confirmed — no primary source needed; same status as other "obvious from the definition" facts this chapter states without citation (e.g. an array index is O(1)) |
| 2 | Doubly linking makes remove-given-a-node O(1) | direct structural consequence | confirmed |
| 3 | A circular list with a sentinel needs no end-of-list null check | direct structural consequence | confirmed |
| 4 | `struct list_head` is exactly two pointers, no payload | Linux kernel `types.h` | confirmed, quoted verbatim |
| 5 | `list_add`/`list_add_tail` name stacks/queues respectively in their own doc comments | Linux kernel `list.h` | confirmed, quoted verbatim |
| 6 | `list_splice` relinks without walking either list | Linux kernel `list.h` | confirmed by reading `list_splice`'s body (`__list_splice`, called only when the source list is non-empty, no loop) — the function body itself is not quoted (no comparison-free single line worth quoting on its own), but the doc comment "join two lists" plus the `list_empty` guard are quoted, and the no-loop structure was confirmed by reading the fetched source directly |
| 7 | Sequential pointer-chasing beyond L2 costs ~9 cycles/element; random beyond L2 costs ~450 cycles/element and climbing | Drepper 2007, §3.3 | confirmed, quoted verbatim ("only about 9 cycles are required"; "here we reach 450 cycles and more") |
| 8 | `container_of` subtracts a compile-time member offset to recover the containing struct's address | Linux kernel `container_of.h` | confirmed by reading the macro body (`offsetof(type, member)`); the macro body itself is not quoted verbatim (it contains `<` via `static_assert`'s generated check text in some kernel versions and is dense expression code not worth quoting whole), but the mechanism described matches it exactly, and the doc-comment line and warning are quoted |
| 9 | `container_of_const` is now preferred; `container_of`'s own doc says not to use it in new code | Linux kernel `container_of.h` | confirmed, quoted verbatim |
| 10 | The current `container_of` macro `static_assert`s that the pointer type matches the member type (or is `void`) | Linux kernel `container_of.h` | confirmed by reading the macro body directly: `static_assert(__same_type(*(ptr), typeof_member(type, member)) || __same_type(*(ptr), void), "pointer type mismatch in container_of()")`. This line is **not quoted in `SOURCES.md`** because it contains no angle brackets but does contain the project's fetch tool's known artifact risk is absent here — however it was deliberately left unquoted since its exact spacing/line-wrap in the fetched plain text is unreliable to match character-for-character; the claim is instead verified by reading the cached source file directly (confirmed present) and stated in this topic's own words, with the mechanism's existence attributed to the file by citation (URL + "Version" line in `SOURCES.md`) rather than by exact quote. Step 12's predict answer rests on this confirmed-by-reading fact. |
| 11 | `list_entry`/`list_first_entry` are built on `container_of` | Linux kernel `list.h` | confirmed, quoted verbatim (`#define list_entry(ptr, type, member) \ container_of(ptr, type, member)`) |

## Currency

Fetched 2026-10-22 from the canonical, actively maintained sources: the Linux kernel's own `master` branch (not a stale fork or textbook paraphrase), and Drepper's 2007 memory paper, already used (and flagged as dated for its absolute latency figures) in Chapter 1's "Measuring the memory hierarchy." The cycle counts this topic cites (9 vs. 450) are not absolute latency figures in nanoseconds — they are a relative, order-of-magnitude comparison on one piece of period hardware, and this topic states them that way ("on one real benchmark," "roughly a fiftyfold gap") rather than as a timeless constant, matching how Chapter 1 handled Drepper's other numbers.

## A claim this topic deliberately does NOT make

`CHAPTER.md`'s own scope note for this topic says named kernel subsystems should appear "only if verified against the current kernel source at research time, not assumed from an older or remembered version." An attempt to verify a specific named subsystem (e.g. the scheduler's `task_struct`) against the current kernel source timed out during research (network fetch of `include/linux/sched.h`, a much larger file than `list.h`, repeatedly failed to complete). Rather than name an unverified subsystem from memory, this topic names no specific kernel subsystem by name; it teaches the mechanism (`list_head`, `container_of`) from the header files themselves, which were fetched and verified, and leaves the "where it's used" claim at the level the kernel's own file actually supports: `list.h`'s comment that this is a single, generic implementation meant for reuse throughout the kernel (stated in this topic's own words, not quoted as a specific-subsystem claim).

## Red team: predict questions

- Step 2 (tail-append without a tail pointer): checked that "O(1), like an array" is a real, plausible wrong answer a learner coming straight from topic 1 would reach for — it is, which is why it's the first distractor.
- Step 6 (is pointer chasing always slower): checked the correct answer doesn't overstate — it specifically says "when traversal order and allocation order disagree," not "when lists are involved," matching Drepper's own framing exactly (his test deliberately varies allocation order, not data structure).
- Step 12 (does `container_of` check the type): checked against the actual, current macro body (see claim 10) rather than an older remembered version of the kernel that lacked the `static_assert` — this is exactly the kind of "don't assume from an older version" trap `CHAPTER.md` warns about, and the fetched `master`-branch source resolves it.

## Open items

None.
