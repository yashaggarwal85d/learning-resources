# FACT-CHECK: Ownership topology over shared mutability

This is an adversarial check of `OUTLINE.md` against the fetched primary texts in `sources/*.txt` and against the compiler. It covers the claims list, all 22 reel steps with every predict option, the Deep dive, the examples table and Prerequisites. The checker did not write the plan.

- **Date:** 2026-10-12.
- **Toolchain used:** rustc 1.97.0 (2d8144b78 2026-07-07), `--edition 2024` (and `--edition 2021` for E12), x86_64 Linux, 4 cores. Programs were built with `-O` unless they are compile-fail cases.
- **Currency:** current stable is 1.99.0. The release notes fetched today say "Version 1.99.0 (2026-10-01)". The 1.98.0, 1.98.1 and 1.99.0 notes list no change to anything this topic shows: E0373, E0382, E0499, E0505, E0596, E0277, `static_mut_refs`, `mpsc`, `Mutex`, `Arc` or closure capture. The std pages quoted are 1.99.0. Diagnostics were checked on 1.97 only (see open items).
- **Quote check:**
  - `node scripts/sources.mjs check` passes: 204 quotes before, 215 after this check's additions.
  - A script compared every double-quoted fragment of 18 characters or more in `OUTLINE.md` (318 distinct fragments) with the fetched texts, ignoring whitespace and quote style. Every quote attributed to a source was found. The fragments not found are the plan's own captions, narration, syllabus titles and rustc output; rustc output was checked by compiling.
  - The 18 syllabus quotes used for forward pointers (Ch.2, 4, 6, 7, 10, 30) were found verbatim in `syllabus/rust-systems-engineering.md`, and the chapter numbers match.
  - For the quotes that carry weight, the surrounding context was then read by hand.
- **Behaviour check:**
  - Every lab the plan relies on was rebuilt from CHAPTER.md A.3. The prelude was taken from the chapter's code fence and diffs equal to the planner's `prelude.rs`.
  - The planner's drafts were read line by line before being run.
  - The labs with no draft in the scratchpad were written independently: `tree`, `stall`, `senderr`, `staticmut`.
  - Variants written to break the explanations: a spawn without `move`, `spawn_move`, use-after-spawn, clone cost, the `Rc` ladder, and ring variants that clone, drop, skip `Stop` or record queue depth.
  - All of them are in the session scratchpad under `fc/`.

## Re-run of the plan's key numbers (rustc 1.97.0, edition 2024)

| Lab | Plan says | Re-run result | Verdict |
|---|---|---|---|
| E1 `e0499` | `error[E0499]: cannot borrow `pool` as mutable more than once at a time`, first/second borrow labels | identical, plus `first borrow later used here` on `drop(a)` | holds |
| E1 `e0373` | header + `move` help | identical; label `` `pool` is borrowed here ``; note `function requires argument type to outlive `'static`` | holds |
| E1 `e0382_loop` | `use of moved value: `pool``, `in previous iteration of loop`, `if `Pool` implemented `Clone`…` | identical | holds |
| E1 `e0596` | `cannot borrow data in an `Arc` as mutable` + `DerefMut` help | identical, reported twice (`get` and `put`) | holds |
| `Rc` twin | ladder ends at `Rc<RefCell<Pool>>` | `Rc<Pool>` gives `error[E0596]: cannot borrow data in an `Rc` as mutable` | holds |
| E1 `arcmutex_ok` | compiles, runs | `owners of the pool now: 1`, exit 0 | holds |
| E2 `reviewed` | `owners_pool=3 owners_stats=4`, `locks=5000 locks_per_message=5`, buffers 1..1000 | identical; `next_id` over 12 runs: 62–126 (varies, as the plan says) | holds |
| E2b `arcclone` | `arc_new_allocs=2 arc_clone_allocs=0 strong=2 size_of_arc=8` | identical | holds |
| E2b `getmut` | lock helper never called | `locks=0 created=1 home=1` | holds |
| E3 `tree` (written independently) | `allocs_in_loop=1 buffers_created=1`, last `Header { kind: 1, len: 256 }` | identical | holds |
| E3b `config` | `threads=8 owners_while_running=9 owners_after=1 sum_ok=true` | identical | holds |
| E4 `arena` | `insp=Handle { index: 2, generation: 0 }`, `audit=…generation: 1`, `get(stale)=None`, `remove(stale)=None`, `plain_index=audit`, size 8 | identical | holds (see C9 on `handle_is_copy`) |
| E5 `rcring` | `rc_ring_live_after_drop=4 arena_live_after_drop=0` | identical | holds |
| E6 `ring` ×5 | `buffers_created=3`, `accounting_checks=1000`, `first_ids=[1, 2, 3, 1, 2, 3] trips=[334, 333, 333]`, 196608 / 32 / 32 | identical, 5 runs with one md5 | numbers hold; the check itself is vacuous (C3) |
| Prove it 4 `ring1` | `buffers_created=1`, `[1, 1, 1]`, `[1000]`, 65536 | identical | holds |
| E7 `stall` (written independently) | `created=1000`, ≥ 65,536,000 bytes | `created=1000 home=1000`, bytes delta 65,613,520 / 65,617,408 / 65,616,016 over 3 runs (channel blocks add the rest) | holds |
| E7 `ring_stall` | `buffers_created=3` | identical ×3; the draft hard-codes `let made_while_stalled = 3;` (C10) | holds |
| E8 `send_e0382` | header, `value moved here`, `value borrowed here after move`, clone help | identical | holds |
| E8 `send_e0505` | header, three labels | identical, plus `binding `buf` declared here` and help `&buf.bytes.clone()[..5]` | holds |
| E8 `senderr` (written independently) | `send failed; got buffer 1 back`, `home=1 created=1` | identical | holds |
| E9 `homebuf` | `alive_at_once=3 created=3`, `panics=1 home=3 created=3` | identical; the panic message goes to stderr as expected | holds |
| E10 `rc_e0277` | `` `Rc<RefCell<Pool>>` cannot be sent between threads safely `` | identical | holds |
| E11 `selflock` | `try` → `second_lock_would_block=true`; no arg hangs | identical; killed by `timeout 5` (exit 124, 5.002 s) | holds |
| E12 `staticmut` | 2024: `error: creating a shared reference to mutable static`, `#[deny(static_mut_refs)]`; 2021: warning | identical. The note now reads `` `#[deny(static_mut_refs)]` (part of `#[deny(rust_2024_compatibility)]`) on by default ``, and the plan's substring still matches | holds |

## Per-claim verdicts

V = verified: the quote is in the fetched text and, read in context, supports the claim. M = verified by running it on rustc 1.97. C = corrected in `OUTLINE.md`. N = new claim row added.

| # | Verdict | Notes |
|---|---|---|
| 1 | V+M | |
| 2 | V, quote added | The Prerequisites panel quoted the Book ch. 4.2 rule ("either one mutable reference or any number of immutable references"), but no fetched source held it. Book ch. 4.2 was fetched; the quote is now in SOURCES.md and the claim row. |
| 3 | V+M | |
| 4 | V+M | |
| 5 | V+M | |
| 6 | V | Arc docs, "Thread Safety" paragraph, read in context. |
| 7 | V+M | |
| 8 | M | Deterministic. `lock()` blocks and nothing retries. |
| 9 | M | The `Barrier` stops any thread finishing before the count is read. The clones are made in `main` before `spawn`, so 3 and 4 are fixed either way. |
| 10 | V (argument), C | Step 4 said "Two locks taken in different orders deadlock". The Book says this happens when "two threads have each acquired one of the locks". It is a risk, not a certainty, so the step now says "can deadlock". |
| 11 | V | |
| 12 | V+M | Edge, no change: `get_mut` returns a `LockResult` (poisoning is still reported). The docs add "Note that this method does not clear any previous abandoned locks (e.g., via forget() on a MutexGuard)". The Deep dive now mentions the `LockResult`. |
| 13 | V+M | |
| 14 | V+M | |
| 15 | M | `tree.rs` was written independently from step 6's five lines. |
| 16 | V, C (quote) | The cited "Use interior mutability…" line is introduced on the page by "If you do need to mutate through an Arc, you have several options:". That sentence is what limits the advice to mutation, so it was added to SOURCES.md and the claim, along with the docs' own example heading "Sharing some immutable data between threads:". |
| 17 | V+M | |
| 18 | V | |
| 19 | V | |
| 20 | V | |
| 21 | M | Size 8 and 0 live hold. The "is `Copy`" half was printed as a literal string by the draft: see C9. |
| 22 | V | "Those solutions" means "index a Vec, or use slab, stable-vec", per the heading. |
| 23 | V+M | |
| 24 | V | |
| 25 | V | |
| 26 | V+M | "After 231 deletions" is 2^31; the superscript was lost in extraction, and the asterisk on "permanently unique*" points to this note. `u32::MAX.wrapping_add(1) == 0` holds. |
| 27 | V, C | Two changes. (1) The plan's Deep dive teaches "`SlotMap`, `HopSlotMap`, `DenseSlotMap` and when to choose each". In slotmap 1.1.1 `HopSlotMap` is "Deprecated since 1.1.0: Use SlotMap or DenseSlotMap instead, the HopSlotMap is no longer maintained and will be removed in 2.0." The crate page's prose still describes it; only its item list marks it. The HopSlotMap page was fetched and quoted, and the Deep dive now names it only as deprecated (N: 54b). (2) Frontier (b) called cross-map keys "`slotmap`'s own open item". The docs present it as a documented limit with a type-level answer ("If you use a new key type for each slot map you create you can entirely prevent using the wrong key on the wrong slot map"). Reworded, with the quote added. |
| 28 | V, C (caveat) | The keynote's "Generational indexes are never re-used" holds only until the generation wraps. The plan's own step 11 says so, so a caveat was added where the quote is used. The fetched text still shows no author byline, so the plan's "verify the byline" instruction stands. |
| 29 | V+M | |
| 30 | M | |
| 31 | V+M, quote added | `HomeBuf`'s "leak-safe" argument also needs the case where the owner hangs up *after* a successful send. The Sender docs: "a return value of Ok does not mean that the data will be received". Added. |
| 32 | **C** | See C2. The Reference also says "If needed the compiler will infer that instead mutable references should be taken, or that the values should be moved or copied". This was added to SOURCES.md and the claim. |
| 33 | V | |
| 34 | M | 5 runs, identical stdout. |
| 35 | V | |
| 36 | V | |
| 37 | V | The Go Blog says the slogan "is summarized in the document Effective Go", which matches the Book's attribution. |
| 38 | V | |
| 39 | V | |
| 40 | M, C (wording) | The 62.5 MiB is capacity asked of the allocator; each buffer holds 261 bytes. Step 15's explanation and reveal now say "requested". |
| 41 | V | |
| 42 | **C** | See C3. |
| 43 | V+M | A ring with no `Stop` hangs and is killed by `timeout 5`: in a cycle, nobody goes first. |
| 44 | V+M | |
| 45 | V | Tokio tutorial, read in context. The "In production" bullet had it as the reason for self-deadlock and lock order: see C8. |
| 46 | V | |
| 47 | M | |
| 48 | V, C (quote form) | The Deep dive quoted "it is considered 'safe'…" with single quotes. The source has “safe” (curly double quotes); fixed. |
| 49 | V | The page marks `scope` "1.63.0". |
| 50 | V+M | |
| 51–53 | V | |
| 54 | V | |
| 54a | N | Ryhl, "Beware of cycles": "To avoid such a deadlock, you must make sure that there are no cycles of channels with bounded capacity". This is why the ring's four channels are unbounded. Also see C4. |
| 54b | N | `HopSlotMap` deprecation (claim 27). |
| 54c | N, M | A clone copies 261 bytes, not 64 KiB (C1). |
| 55 | V | |

## Main corrections

### C1. Step 12: "clone would copy 64 KiB per message" is false

The step 12 caption and narration said that rustc's *clone it* suggestion "would copy 64 KiB per message". Measured with the counting allocator, after `pool.get()`:

```
clone_empty allocs=0 bytes=0 ; clone_filled allocs=1 bytes=261 len=261 cap_clone=261
```

`Vec::clone` allocates for the length, not the capacity, which is exactly the trap CHAPTER.md A.3 warns about. `send.rs`'s buffer is empty, so its clone allocates nothing. A buffer filled with one message clones 261 bytes. What changed:

- The caption now says "a second buffer, every message", and the narration "a clone would allocate and copy a second buffer every message".
- The heap bar is labelled `64 KiB buffer`, not `64 KiB payload`. The capacity is 64 KiB; the payload is 261 bytes.
- E8 now asserts `clonecost`, and claim 54c was added.

The same step drew the 32-byte handle as three cells `ptr · cap · len`. A `Buf` is `id` plus the `Vec`'s three words (`size_of` 32 with padding), so it now has four cells `id · ptr · cap · len`.

### C2. Step 13: the ring's spawn compiles without `move`

Step 13's picture, beats and caption relied on `thread::spawn(move || { fill_stage(fill_rx, to_inspect, src) })` failing with `E0373` once `move` is removed. **It compiles and runs without `move`** (measured: `nomove compiles: n=1 got=Ok(7)`). The body passes all three values to `fill_stage` by value, so the closure captures them by value whether or not `move` is written. This is the Reference's "If needed the compiler will infer … that the values should be moved". The caption's "A closure that only reads its surroundings borrows them" did not describe this closure.

Step 13 is now built on the program that really fails, `e0373.rs`, plus `move` and the pool returned through `join()`:

```
let mut pool = Pool::new();
let h = thread::spawn(move || {
    let buf = pool.get();
    pool.put(buf);
    pool
});
let pool = h.join().unwrap();
```

What was measured:

- Without `move`, the closure captures `pool` by `&mut` and fails with `E0373`, label `` `pool` is borrowed here ``.
- With `move`, it compiles and prints `created=1 home=1`.
- Using `pool` after the spawn gives `error[E0382]: borrow of moved value: `pool`` with `value moved into closure here`.

The borrow edge is now cinnamon (exclusive), not latte. A new examples row, E1b, asserts all three, plus the fact that the ring's spawn compiles without `move`. The caption ends by saying the ring's closures move their channels in anyway, and that `move` says so on the page. The step title is unchanged.

### C3. Step 16: the owner's "accounting" check could not fail

The plan's check in `Owner::home` was:

```
let out = self.sent - self.back;
let home = self.pool.free.len() as u32;
let made = self.pool.next_id;
assert_eq!(home + out, made);
```

Each call to `home` adds 1 to `back`, and 1 to either `sent` (re-dispatch) or `free.len()` (put back). So `home + sent − back` stays at its starting value whatever the stages do: the check is an identity of the owner's own counters, not an observation of the ring. Two broken variants were measured at `-O`.

**`inspect` clones one buffer into the ring:**

```
messages=1000 returned=1001 buffers_created=3 home_at_end=4
accounting_checks=1001 same_order=false
```

The check passed all 1,001 times. On the last one, `sent − back` wrapped as a `u32`.

**`inspect` drops one buffer:**

```
messages=1000 returned=999 buffers_created=3 home_at_end=2
accounting_checks=999 same_order=false
```

The check passed all 999 times. Step 16's "It held at all 1,000 checks" was therefore true and meant nothing.

**Fix (measured):** the owner keeps `out: VecDeque<u32>`, the ids it sent out in order. Every channel is FIFO (claim 35) and every buffer takes the same path, so the buffer that comes home must be the oldest one out: `assert_eq!(self.out.pop_front(), Some(buf.id))`. The ledger check is now `home + self.out.len() == made`, and after shutdown `free.len() == next_id`. Results:

- On the correct ring, all outputs are unchanged: `accounting_checks=1000 same_order=true`, `first_ids`, `trips`.
- The clone and drop variants both panic at the first wrong return.

Step 16's code panel, visual, beats, caption and narration were rewritten, along with learning outcome 4, claim 42, E6, the new E6b row, Lab 4 and the Deep dive's owner-thread section. The step 16 beats also had `Stop` leave "after the last chip returns home". In the code, `Stop` is sent straight after the last dispatch and travels *behind* the last buffers, which is what the caption says. Fixed.

### C4. The ring's channels can hold 4 messages, not 3

The Deep dive said the unbounded channels "can never hold more than 3 messages, because only 3 buffers exist". `Stop` is sent right after the 1,000th dispatch. If `fill` is slow, its channel then holds three buffers plus `Stop`. This was measured by instrumenting `ring.rs` with a send/receive counter and pausing `fill` before its 998th receive: `max_queued_in_to_fill=4`.

The Deep dive now says "3 buffers plus the one `Stop`". It also adds Ryhl's warning that a cycle of *bounded* channels can deadlock ("you must make sure that there are no cycles of channels with bounded capacity"), the reason the ring uses `channel()` and takes its bound from the 3 buffers instead (claim 54a).

### Other corrections made in OUTLINE.md

- **C5. Step 7's explanation.** The config's ownership was justified by "no one outlives the others", which is not a reason. With `thread::spawn` none of the eight threads is a natural owner, hence `Arc`. With scoped threads (Ch.2) `main` could simply lend `&Config`. Reworded to 67 words with that nuance.
- **C6. Step 21.** The plan dismissed `Rc<RefCell<Job>>` because it "leaks on a cycle", but a dependency graph is normally acyclic, so that argument decides nothing. The real problem is that dependents' `Rc`s keep a finished job alive, so it never reads as gone. `Weak` (Ch.4) is the other valid fix. Both "Why tempting" and the explanation (70 words) were rewritten.
- **C7. Step 5's caption.** "checked at run time" became "enforced at run time (a second caller waits)". A `Mutex` waits; it doesn't check-and-fail like `RefCell`. The title is unchanged because it is a coverage key.
- **C8. "In production".** "both are why the Tokio guide's first fix for contention is 'a dedicated task'" attributed to Tokio a reason it doesn't give: its list answers contention, not self-deadlock or lock order. Reworded.
- **C9. E4.** The draft printed `handle_is_copy=true` as a literal, which proves nothing. The builder must prove `Copy` in code, for example with `assert_copy::<Handle>()`.
- **C10. E7.** The `ring_stall` draft has `let made_while_stalled = 3;` as a constant. The builder must print the owner's real count instead.
- **Deep dive.**
  - "a cloned `Pool` compiles and is wrong" is now conditional: `Pool` doesn't implement `Clone`, and A.3 forbids changing it.
  - "measured E13" is now E2b; E13 is the constants row.
  - The quote-marked paraphrase "if you own it, you don't need the lock" lost its quote marks.
  - The topology table's "buffers: unbounded" became "not bounded by the design (62–126 in 12 unstalled runs, never shown; 1,000 stalled)".
- **Step 19.** "the cheaper fix" became "the fix that clones nothing". It is a count, not a cost claim.
- **Tables.** The E1 row's unescaped `||` broke the Markdown table; escaped. The new E1b row is escaped too.
- **Header.** A currency note was added (1.99.0 current; nothing relevant changed).
- **Sources list and Progress.** Updated.

Every edited caption is at most 90 words and every explanation at most 75. Counted by script: step 12 has 88, step 13 87, step 16 90, step 7's explanation 67, step 21's 70.

## Predict questions: answers and wrong options

| Step | Correct answer | Wrong options | Result |
|---|---|---|---|
| 3 | 5 | 1, 2 and 0 are all wrong (counted: `locks=5000`) | holds |
| 7 | C (config) | holds; the explanation is now precise about `spawn` vs `scope` (C5) | holds, C |
| 10 | `None` | `Some(audit)` is the plain-index result (measured); `Some(inspect)` is impossible (moved out); no panic, because the arena uses `slots.get(i)?` | holds |
| 15 | 1,000 / 3 | "3 in both" fails (the PR pool allocates on every empty `get`); no deadlock (ring stall completes 1,000) | holds |
| 19 | E0505 | the program has only E0505 (no E0382); it does not compile, so it can't race | holds |
| 20 | `for msg in rx` | `send` never blocks on `channel()` ("This method will never block the caller in order to wait for space to become available"); no lock in the file | holds |
| 21 | Arena | `Rc<RefCell>` wrong for a different reason than the plan gave (C6) | holds, C |

## Red-team cases tried that need no change

- The ring with no `Stop` hangs (killed at 5 s). This confirms "in a cycle no one goes first".
- `try_lock` in the same statement as a live guard gives `WouldBlock`. Two `lock()`s in one `println!` hang under edition 2024; the 2024 temporary-scope changes don't cover call arguments.
- Ids `1, 2, 3, 1, …` and trips `334/333/333` are deterministic. FIFO channels and one-thread stages preserve order, and `home()` re-dispatches the same buffer at once.
- The reviewed design's owner counts don't depend on scheduling: the clones are taken in `main` before `spawn`.
- `Arc::clone` makes 0 allocations, while `Arc::new(Mutex::new(Pool::new()))` makes 2 (the `Arc` block and the pool's 8-slot free list).
- `Sender` is also `Sync` since 1.72 ("impl<T: Send> Sync for Sender<T>", now in SOURCES.md). The plan only needs `Send`.
- slotmap's version wrap (2^31) and ours (2^32) are both stated as counts, and both are safe.
- The Book chapter titles for Prerequisites match the fetched pages: 16.1 "Using Threads to Run Code Simultaneously", 16.2 "Transfer Data Between Threads with Message Passing", 16.3 "Shared-State Concurrency".

## Performance and timing claims

There are none. The only time values in the plan are the 5 s and 60 s test timeouts. "One compare per access", "a channel hop per request" and "a lock per access" are counts of operations. Contention and throughput are sent to Ch.4/Ch.6, which is correct per the syllabus: Ch.4 "Arc<Mutex<T>> as hidden serialization" and Ch.6's lab measure them. Step 19's "cheaper" was reworded (above).

## What changed in SOURCES.md (204 → 215 quotes, check green)

All additions are word for word from the fetched texts:

- **Reference, closure expressions:** capture inference by `&mut` or by value.
- **Arc:** "If you do need to mutate through an Arc, you have several options:" and "Sharing some immutable data between threads:".
- **Sender:** "a return value of Ok does not mean that the data will be received" and `impl<T: Send> Sync for Sender<T>`.
- **Ryhl:** the "Beware of cycles" bounded-channel deadlock paragraph, and the single-ownership pitfall line.
- **slotmap:** the `new_key_type` line.
- **New section, slotmap `HopSlotMap` item page:** the deprecation notice.
- **New section, Book ch. 4.2:** "At any given time, you can have either one mutable reference or any number of immutable references."
- **New section, Edition Guide (further quote):** "if possible it is best to avoid mutable global state".

New fetched texts: `sources/book-04-02.txt`, `sources/slotmap-HopSlotMap.txt`, plus the cache files the check made from their URLs.

## Open items for the builder

- **Re-run on 1.99.** Run `examples.py` on 1.99 if the toolchain is available. Diagnostics were checked on 1.97 only; the release notes suggest no change.
- **New lab files.** Write `spawn_move.rs`, `spawn_after_move.rs`, `spawn_nomove.rs` (E1b), `ring_clone.rs` and `ring_drop.rs` (E6b), and the `clonecost` assertion (E8). Use the `Owner` with `out: VecDeque<u32>` as step 16 shows it.
- **Keynote byline.** The RustConf 2018 keynote post's author byline is still unverified in the fetched text; don't print a name without it.
- **Coverage anchor.** The heading "Lab 4 · The ring: buffers as messages, accounted at every hand-over" was kept (it is a coverage anchor). The owner now checks at every hand-over *home*, which the Deep dive text states.
