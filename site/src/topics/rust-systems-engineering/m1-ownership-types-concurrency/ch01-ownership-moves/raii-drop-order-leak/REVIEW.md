# REVIEW: RAII, drop order, and leak safety

## Content review (ROUTINE.md section 4)

- **Reviewer:** content review agent (Fable); wrote nothing in this topic.
- **Date:** 2026-10-11
- **Read, in order:** ROUTINE.md section 4; PROJECT_PLAN.md "Learning design"; QUALITY.md; DESIGN.md; `../CHAPTER.md` (all of it, Topic 2 entry and A.4 vocabulary in particular); the previous topic as it really is on `origin/topic/rust.single-ownership-move-semantics` (registry entry, reel step titles, `OUTLINE.md` concept ledger and "Changes after final", `REVIEW.md`); the syllabus lines of 1.1 (this one and "Partial moves and destructuring as transfer"), 2.2, Ch.4, Ch.6, Ch.8, Ch.11, Ch.30 and the Canonical references; this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `coverage.json`, `sources/expert-list.json`, `SOURCES.md` (headings and the quotes the findings rest on), `FACT-CHECK.md`, `OUTLINE.md` (all sections) and `examples.py` with `examples/*.rs`, plus the fetched texts `sources/exit.txt`, `scope.txt`, `rwlock.txt`, `ref-destructors.txt` where a finding needed them.
- **Not re-run:** no compiler in this review; every behavioural claim below is either in a fetched source named by file and line, or marked "verify" for the fix agent to measure in `examples.py`.
- **Counts:** 2 major, 20 minor (Flow 7, Gap hunt 7, Expert reader 8).
- **What already works:** the syllabus line is covered clause by clause in the reel and the Deep dive; the two edition changes are proven by one file compiled twice; every number on screen is asserted; the leak thread (steps 15–19) is the clearest telling of RFC 1066 I have read; the bridge answers topic 1's real handoff word for word and the end card hands off to E0509 without teaching it; no concept this topic uses sits later in the syllabus (dropck is owned here by the chapter plan, `RefCell`, `RwLock`, `thread::scope` and closures are glossed in one line each and declared).

### Part 1 · Flow

**1. `SpillFile` appears in step 2, five steps before step 7 builds it** (minor)
- *Where:* reel step 2 (`spill: SpillFile, // closes + unlinks in Drop` in the `Stage` listing; the caption lists `spill` among the fields); narration step 2 "then name, input, and the spill file".
- *What:* The learner meets a type by name, with a job, that the reel has not shown; the code comment is the only explanation. The chapter plan fixes `Stage`'s fields, so the forward reference is unavoidable, but it needs a word.
- *Fix:* Add to step 2's caption: "(`SpillFile`, built at step 7, closes a temporary file in `Drop`)".
- *Status:* fixed: step 2 caption now says `SpillFile` is built at step 7 and closes a temporary file in `Drop`.

**2. The previous topic promised "exactly this wrapper"; this topic builds a different one and says so late** (minor)
- *Where:* previous topic step 9 ("You'll build exactly this wrapper properly in the next topic", about `Fd(i32)`); this topic step 6 caption ("The previous topic's `Fd` wrapper is about to become real") and drawing (`IF Fd WERE Copy` over a payload labelled `File (4 bytes)`); step 7 builds `SpillFile { path: PathBuf, file: File }`.
- *What:* A learner expecting the `Fd(i32)` wrapper gets a struct that holds a `File`; the step 6 drawing mixes the two names (`Fd` slots pointing at a `File` payload), and the reason the raw-fd version is not built ("Raw descriptors and I/O safety are Chapter 11") is the last clause of step 7's caption.
- *Fix:* In step 6 say it where the name appears: "The previous topic's `Fd(i32)` wrapper is `File` (4 bytes: the descriptor), which std already wraps for you; the raw-fd version, `OwnedFd`, is Chapter 11. Here we build the wrapper one level up: `SpillFile`." Relabel the step 6 slots `a: File` / `b = a`, or the payload `fd`, so one drawing uses one name.
- *Status:* fixed: step 6 caption says the previous topic's `Fd(i32)` is `File` (4 bytes on Linux), raw-fd `OwnedFd` is Chapter 11, and the wrapper built here is `SpillFile`; the step 6 drawing now uses one name (`File`) throughout.

**3. Step 1 asks a temporaries question; step 2 answers a different one, and nothing says when step 1's thread resumes** (minor)
- *Where:* steps 1 → 2 (the problem is `if let` temporaries; step 2 is destructor anatomy; temporaries return at step 9, the problem is closed at step 11).
- *What:* The layering (problem first, mechanism later) is right, but the jump has no signpost, and a learner who came for the deadlock sees seven steps of `Stage`, `Fd` and `SpillFile` before it comes back.
- *Fix:* End step 1's caption (or start step 2's) with one clause: "First what a destructor is and where it runs (steps 2–8); then when a *temporary* dies, which is what changed (9–12)."
- *Status:* fixed: step 1 caption and narration end with the signpost (destructor and where it runs, steps 2 to 8; then when a temporary dies, 9 to 12); narration step 2 also says the spill file is built a few steps on.

**4. Step 12's answer depends on a fact the question does not give** (minor)
- *Where:* step 12 body ("a cell whose borrow rules are checked at run time; `borrow()` returns a guard") and explain ("`c.borrow()` returns a `Ref` guard whose destructor touches `c`").
- *What:* The question is answerable only if the learner knows the `Ref` guard *borrows* `c` (so its destructor needs `c` alive). `RefCell` is Chapter 4; the gloss says "guard" but not "a guard that holds a borrow of `c`", so the predict question tests Chapter 4 knowledge, not this step's rule.
- *Fix:* Body: "`borrow()` returns a guard that holds a borrow of `c` and releases it in `Drop`". Then the learner has both facts the rule needs.
- *Status:* fixed: step 12 body says the guard holds a borrow of `c` and releases it in `Drop`.

**5. Step 22 uses `impl FnOnce(&Dma)` and `DmaGuard<'_>` without a word** (minor)
- *Where:* step 22 explain and reveal (`fn with_dma(buf: &mut [u8], f: impl FnOnce(&Dma))`); Deep dive Prove it 3 and 7 (`impl FnOnce(&mut SpillFile) -> R`).
- *What:* `FnOnce` is Book ch. 13; `closures-basics` declares lambdas as an idea, not Rust's closure traits. The chapter plan says Rust's closure syntax is "shown on the spot".
- *Fix:* In the explain: "`f: impl FnOnce(&Dma)` is a closure argument, called once" (or show the call site `with_dma(buf, |dma| …)` instead of the trait bound on screen).
- *Status:* fixed: step 22 explain glosses `f: impl FnOnce(&Dma)` as a closure argument called once; Deep dive Prove it 3 and 7 gloss it too; `prerequisites.mdx` lists it among the one-line glosses.

**6. The ledger departs from the chapter plan in a way topics 3 and 4 will trip over** (minor)
- *Where:* registry entry: `introduces` ends with `counting-allocator`; `uses` is `ownership, move-semantics, deinitialized-place, copy-trait, clone-cost, ownership-signatures`. `OUTLINE.md` → "Changes from the chapter plan" items 1–2 explain why (topic 1's real ids differ from the plan's; topic 1 built the instrument but did not register the id).
- *What:* Right for this topic, and the build's ledger check will pass. But the chapter ledger now says the counting allocator is *introduced* by topic 2, while topic 1's reel and Lab 2 teach it; and topics 3 and 4, built in parallel to the plan, will write `uses: ['single-ownership', 'copy-vs-clone', 'counting-allocator', …]` and fail the same check. Nothing in `syllabus/review-notes/` records either.
- *Fix:* Log it (ROUTINE.md section 4 says reviews that touch other topics go to `syllabus/review-notes/`): at release, add `counting-allocator` to topic 1's `introduces` (its run can still do it while content-final; an unlock is needed only once it is live) and drop it here; topics 3 and 4 must use topic 1's real ids. Keep this topic's entry as it is until then.
- *Status:* fixed: logged in `syllabus/review-notes/rust-ch01-topic2-ledger-departure.md` (move `counting-allocator` to topic 1 at its release; topics 3 and 4 use topic 1's real ids). Registry entry kept as is, as the finding says.

**7. Step 23's recap drops the one rule the handoff needs** (minor)
- *Where:* step 23 rows and caption; registry `handoff`.
- *What:* The handoff is "A type with `Drop` keeps its fields until it dies", and the end card shows `E0509`. But no step states *why* a `Drop` type keeps its fields (the Deep dive does: `Drop::drop` takes `&mut self` and expects every field initialised). The recap rows restate steps 2–19 and the handoff sentence arrives without a hook in the reel.
- *Fix:* Add half a sentence to step 5's explain or step 6's caption, which already talk about `&mut self`: "and because `drop` gets `&mut self`, every field must still be there when it runs: a `Drop` type keeps its fields until it dies". Then the recap's handoff lands on something taught.
- *Status:* fixed: step 5 explain now says that because `drop` gets `&mut self` every field must still be there, so a `Drop` type keeps its fields until it dies; the recap handoff lands on it.

### Part 2 · Gap hunt

**8. "Every way a destructor is skipped" omits the two that bite in production: `main` returning while other threads run, and thread-local destructors** (major)
- *Where:* outcome 3 ("list every way a destructor is skipped"); step 14 caption and the Deep dive "Leaking is safe" list (`forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle, `exit`, `abort`, `panic = "abort"`, a non-unwinding ABI boundary, statics).
- *What:* (a) When `main` returns, the process ends and every other thread is killed where it stands: its locals (a `BufWriter`, a `SpillFile`, a lock guard) are never dropped. This is the leak a senior engineer has actually been bitten by (lost log lines at shutdown), and `process::exit` has the same property on *other* threads' stacks, which the topic does not say although the fetched text does. (b) Thread-local destructors (the topic's own `thread_local!` log) are best-effort and may not run on the main thread at exit; the Deep dive mentions them only in the `thread::scope` caveat.
- *Evidence:* `sources/exit.txt` line 26: "no destructors on the current stack or any other thread's stack will be run" (fetched, not quoted in `SOURCES.md`). The std `thread` module docs say a spawned thread may outlive its caller "unless the caller thread is the main thread; the whole process is terminated when the main thread finishes", and the `LocalKey` docs say destructors are run on a "best effort" basis and may not run on the main thread: both to be fetched with `sources.mjs fetch` before quoting.
- *Fix:* One sentence in step 14's caption ("…and when `main` returns, every other thread dies where it stands, destructors unrun") and two bullets in the Deep dive list with the quotes; fetch the two std pages and add them to `SOURCES.md` and `coverage.json`. Optional: a measured case in `unwind.rs` (a spawned thread holding a `Noisy` that `main` does not join; assert no `drop` line).
- *Status:* fixed: step 14 caption and narration, Deep dive 'Ways a destructor is skipped' (the `std::thread` and `LocalKey` quotes, `process::exit` quote) and outcome 3 now cover `main` returning and best-effort thread-local destructors; fetched and quoted in `SOURCES.md`, mapped in `coverage.json`; measured in `unwind.rs` (mode `thread`, asserted in `examples.py`: no `drop t`).

**9. Expert item 13's second half, `drop` of a reference, is marked covered but not taught** (minor)
- *Where:* `coverage.json` expert item "…it does nothing to a Copy value or a reference" → steps 4 and 5; step 4 caption and Deep dive teach only the `Copy` half.
- *What:* `drop(&guard)` or `drop(&mut guard)` drops the reference and keeps the guard alive: the classic "I dropped the lock" bug, and rustc has a warn-by-default lint for it (`dropping_references`, the sibling of the `dropping_copy_types` lint the Deep dive already names).
- *Fix:* Add to step 4's caption or the Deep dive's `mem::drop` paragraph: "and on a reference it drops the reference, not the value: `drop(&g)` keeps `g` locked (`dropping_references` warns)". Verify the lint name and warning text on the toolchain and assert it in `examples.py`.
- *Status:* fixed: step 4 caption, narration and Deep dive `mem::drop` paragraph teach `drop(&g)` keeps `g` locked; `examples/dropref.rs` measures it and `examples.py` asserts the `dropping_references` warning text.

**10. `for` and `while let` loop headers: the lock-held-longer-than-it-looks case engineers hit most is missing** (minor)
- *Where:* step 9 (the `match` scrutinee case); Deep dive "Temporaries: scopes, extension, and the two 2024 changes" (lists the 2024 "pattern-matching condition and loop body of a `while`" entry without saying what it means).
- *What:* `for x in m.lock().unwrap().iter() { … }` holds the lock for the whole loop (the loop's iterator expression lives like a `match` scrutinee), and a `while let Some(x) = m.lock().unwrap().pop() { … }` holds it through each body. Neither is said, and nothing says that a local declared in a loop body is dropped at the end of every iteration (the fix engineers reach for: `let item = { m.lock().unwrap().pop() };`).
- *Evidence:* `sources/ref-destructors.txt` lines 407–411: the Reference's own `while let` example, "`while let loop body` dropped here. `while let scrutinee` dropped here." The `for` case: verify with `try_lock` inside the loop body in `semi.rs` (the Reference describes `for` as a `loop` over a `match` on `IntoIterator::into_iter(expr)`).
- *Fix:* One row in step 9 (or a sentence in its caption) for `for` with the measured `try_lock` result, and a Deep dive sentence for `while let` quoting the Reference's example; one clause on loop-body locals dropping per iteration.
- *Status:* fixed: step 9 caption and narration, and the Deep dive, cover `for` headers, `while let` scrutinees and loop-body locals; `semi.rs` measures `try_lock` in both loop bodies, `trace.rs` adds `loop-body`, all asserted.

**11. `ptr::drop_in_place` and panic-safety guards are mapped to places that only name them and promise a chapter that does not cover them** (minor)
- *Where:* `coverage.json` expert item 38 (`drop_in_place`) → "The destructor, as the Reference states it" ("named here, taught with allocators in Chapter 30"); item 39 (drop guards for panic safety) → "In production" ("the place for panic-safety guards (Chapter 30)").
- *What:* No Ch.30 syllabus line mentions `drop_in_place`, exception safety or drop guards (30.1 is contracts, UB and Miri; 30.2 is allocators and reclamation). So the items are "covered elsewhere" by a chapter that does not say so, and the Deep dive gives neither the two clauses the expert list asks for.
- *Fix:* Either give each its clauses here (`drop_in_place`: runs a destructor through a pointer, needed for unsized values, and the pointee counts as dropped afterwards, which ties to the "a value whose `drop` panicked counts as dropped" bullet; drop guards: a guard *local to the function*, which no caller can forget, is how `with_dma` and Prove it 3 stay sound on the unwind path, which the Deep dive already describes without naming the pattern), or log the Ch.30 gap in `syllabus/review-notes/`.
- *Status:* fixed: Deep dive gives `drop_in_place` its clauses (runs a destructor through a pointer, required for unsized values, pinned data, pointee counts as dropped; quotes added to `SOURCES.md`) and names the local-guard pattern for panic safety in 'In production'; `coverage.json` items still point there and now match.

**12. Enum variants, and `Option<T>` in particular, have no trace row** (minor)
- *Where:* Deep dive "Every drop-order rule, with a trace" table; `examples/trace.rs`.
- *What:* The Reference rule for "the fields of the active variant" is stated but not measured, and `Option<SpillFile>` is exactly what topic 3's `PooledBuf { buf: Option<Buf> }` rests on: dropping `None` runs nothing, `Some` drops its payload, and `take()` leaves a `None` that the glue then skips. One row makes the handoff concrete.
- *Fix:* Add `Some(Trace("some"))` and `None::<Trace>` cases to `trace.rs` and one table row ("enum: the active variant's fields").
- *Status:* fixed: `trace.rs` has `option` (`Some` drops its payload, `None` nothing) and `option-take` cases, with two table rows in the Deep dive and in Lab 1; `examples.py` asserts them (trace is now 22 lines).

**13. The FLS, a canonical M1 reference, is not cited** (minor)
- *Where:* `SOURCES.md`, `index.mdx` Sources, `coverage.json` → `sources`.
- *What:* The syllabus names the Reference *and* the FLS as M1's specification texts; the previous topic's review (finding 12) asked for the FLS and its run added it. This topic quotes the Reference only. The FLS has a "Destruction" chapter (drop scopes, drop order, temporaries) that would be the normative anchor for the rules this topic states.
- *Fix:* Fetch the FLS destruction chapter (`https://rust-lang.github.io/fls/destructors.html`, check the current path), quote the drop-order and drop-scope rules, add it as a source with items mapped; or record in `coverage.json` why it was not used, as topic 1 did for *Rust for Rustaceans*.
- *Status:* fixed: FLS chapter 15 (`ownership-and-deconstruction.html`; the plan's `destructors.html` path is a 404) fetched, quoted in `SOURCES.md`, added to `coverage.json` sources, `index.mdx` Sources and the Deep dive.

**14. `coverage.json` → `gapReview` is still the placeholder** (minor)
- *Where:* `coverage.json` → `gapReview.by: "pending: the content review … replaces this placeholder"`.
- *Fix:* After the fixes above, record this review (date, reviewer, `open: []`, with notes for anything left out of scope on purpose, as topic 1 did).
- *Status:* fixed: `coverage.json` `gapReview` is now the real record (2026-10-11, 'Fable content review', `open: []`).

**Coverage placements checked:** every `topic` placement quotes text that really appears in that topic's syllabus line: "why you cannot partially move out of a type that implements Drop" (Partial moves); "OwnedFd closes on Drop", "into_raw_fd(self)/from_raw_fd are the explicit ownership handoffs that prevent use-after-close", "I/O safety (RFC 3128, stable 1.63)" (File descriptors and I/O safety); "safe Rust can still leak through cyclic logical ownership" (Reference cycles and Weak); "Pin exists because an async state machine may hold references into itself after its first poll" (Pin and self-referential state). All 10 syllabus clauses are in the reel; all 40 expert items are placed, one `out` with a sound reason (closure capture timing, Ch.2); six source items `out` with reasons. Only findings 9 and 11 are placements that overstate what the place teaches.

### Part 3 · Expert reader

**15. "Exactly once is a theorem" is contradicted nine steps later by the topic's own second half** (major)
- *Where:* step 6 caption ("Put the three rules together and 'exactly once' is a theorem, not a convention"); narration step 6 ("Exactly once isn't a convention... it's a theorem"); step 23 row 4 ("One owner, one release: RAII") and narration ("One owner means one release").
- *What:* The three rules (one owner, a move deinitialises, no `Copy` with `Drop`) prove *never twice*. They do not prove *once*: steps 15–19 show that `forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle and `exit` make it zero times, and the chapter's own A.4 defines "leak-safe" around that. A sceptical reader stops at step 15 and asks which step was wrong. The syllabus says "closes it exactly once"; that holds *when the destructor runs*, which Rust does not promise, and the topic's whole point is that it does not.
- *Fix:* Step 6: "'Never twice' is a theorem: one owner, a move empties the source, no `Copy` on a type with a destructor. 'Exactly once' follows whenever the destructor runs at all, and, as you'll see, Rust does not promise that." Step 23 row 4: "One owner: one release, never two". Narration step 6 and 23 to match.
- *Status:* fixed: step 6 caption and narration say 'never twice' is the theorem and 'exactly once' holds whenever the destructor runs, which Rust does not promise; step 23 row, caption and narration say 'one release, never two'; outcome 2 in `index.mdx` reworded. Step titles unchanged (coverage keys on them).

**16. Step 3 states a reason for reverse drop order that no source gives, as if it were the rule's basis** (minor)
- *Where:* step 3 explain ("The reason is borrowing: a later local may hold a reference to an earlier one (`let r = &a;`), so the later one must die first"); narration answer ("there's a reason. A later local may be borrowing an earlier one").
- *What:* The Reference states the rule (`ref-destructors.txt` line 101) and gives no reason. The borrowing rationale only bites for a later value whose *destructor* uses the borrow (drop check, the Deep dive's own paragraph); a plain `&a` has no destructor and NLL ends it before either dies. C++ destroys automatics in the same reverse order with no borrow checker at all. Presented as "the reason", an expert will object; as "the case the rule makes safe", it is right.
- *Fix:* "Reverse order is the stack discipline, and it is what makes a later value that borrows an earlier one sound: a guard holding `&a` (its destructor may still read `a`) dies before `a` does. The Deep dive's drop check is this rule made precise."
- *Status:* fixed: step 3 explain and narration now present reverse order as the stack discipline that makes a later value that borrows an earlier one sound (guard holding `&a`), pointing to drop check.

**17. Step 9 calls the `match` scrutinee case an "exception" to end-of-statement; it is not one** (minor)
- *Where:* step 9 caption ("Two exceptions matter. … And a `match` scrutinee is **not** a temporary scope, so its temporaries live to the end of the whole `match` statement").
- *What:* Those temporaries *do* die at the end of the enclosing statement, the `match`; the surprise is that the scrutinee is not a *smaller* scope of its own, the way an `if` condition is (Reference list, quoted in the Deep dive). Calling it an exception to the rule the caption just stated muddles the one rule the step teaches.
- *Fix:* "One exception and one trap. The exception: lifetime extension … The trap: an `if` condition is a scope of its own, a `match` scrutinee is not, so a lock taken in the scrutinee lives to the end of the whole `match`."
- *Status:* fixed: step 9 caption now says 'one exception and one trap': an `if` condition is a scope of its own, a `match` scrutinee is not.

**18. Step 1 says "hangs forever"; the chapter plan asked for "deadlocks (or may panic)"** (minor)
- *Where:* step 1 caption ("it hangs forever when the flag is unset") and narration ("it hangs forever"); CHAPTER.md Topic 2 "Suggested opening problem" ("say 'deadlocks (or may panic)' and report what the topic's own run does").
- *Evidence:* `SOURCES.md` → `std::sync::RwLock`: "This function might panic when called if the lock is already held by the current thread in read or write mode." The Deep dive has the nuance; the reel asserts the toolchain's behaviour as the language's.
- *Fix:* Caption: "it deadlocks (the `RwLock` docs allow a panic instead; on this toolchain it hangs)"; narration: "it deadlocks. Here, it hangs forever."
- *Status:* fixed: step 1 caption says it deadlocks (the `RwLock` docs allow a panic; on this toolchain it hangs) and narration says 'it deadlocks. Here, it hangs forever.'

**19. Step 4's "drops the old `v1` on the spot" hides the order that matters for resources** (minor)
- *Where:* step 4 caption ("Assignment also runs the destructor: `v = Trace("v2")` drops the old `v1` on the spot"); Deep dive table row `assign`.
- *What:* The right operand is built first, then the old value is dropped, then the new one is written. So when the new value's constructor needs the resource the old one holds (re-creating a `SpillFile` at the same path; re-taking a lock the old guard holds), the assignment fails or deadlocks, which "on the spot" does not predict. The measured trace `["v1", "v2"]` cannot show this because `v2` logs nothing when built.
- *Fix:* "drops the old `v1` after the new value is built and before it is stored"; log a `built-v2` marker in `trace.rs` to measure the order; quote the Reference's assignment-expression sentence on operand order (fetch `expressions/operator-expr.html` → "Assignment expressions").
- *Status:* fixed: step 4 caption and narration say the new value is built first, then the old one dropped, then the new one stored; `trace.rs` logs `built` (`assign: [built, v1, v2]`, asserted); Reference assignment sentences quoted in `SOURCES.md`; Deep dive row and paragraph updated.

**20. The `closes` counter counts `SpillFile::drop`, not `close(2)`** (minor)
- *Where:* step 7 (`CLOSES.fetch_add(1, Relaxed)` inside `SpillFile::drop`, counter labelled `CLOSES`), steps 15 and 17; `spill.rs`, `leak.rs`.
- *What:* The OS close happens in `File`'s glue *after* the counter ticks, and nothing counts it; the counter proves the wrapper's destructor ran once, which is the point, but a reader who checks the code sees the name promise more than it measures. The `/proc/self/fd` delta in `leak.rs` is the real close evidence and is only in the Deep dive.
- *Fix:* Rename the on-screen label to `DROPS` (or say once in step 7: "`closes` counts the wrapper's `Drop`; the descriptor count in `/proc/self/fd` confirms the close, Lab 4"), and add the fd delta to step 7's values.
- *Status:* fixed: step 7 caption says `closes` ticks in the wrapper's `Drop` and the `/proc/self/fd` count confirms the close; the drawing shows 'descriptors open: +1 inside, +0 after'; `spill.rs` prints `fds_inside=1 fds_after=0`, asserted.

**21. Step 21's example cannot happen as written** (minor)
- *Where:* step 21 body and `wild.rs` (`let lock = RwLock::new(0); let mut shared = 0; let _ = lock.write().unwrap(); shared += 1;`).
- *What:* With `RwLock<T>` the protected data is mutated *through* the guard, so "the increment runs unlocked" is impossible for the data the lock holds; the bug exists only when a lock stands guard over state outside it (a file, FFI state, a `static`), the `Mutex<()>` idiom. An expert will ask what `shared` has to do with `lock`.
- *Fix:* Say it in the body ("a lock used as a plain mutex around state it does not hold, `RwLock<()>`") and make `wild.rs` use `RwLock<()>` so the example is the real idiom.
- *Status:* fixed: step 21 body says `lock` is a plain mutex around state it does not hold (`RwLock<()>`) and `wild.rs` now uses `RwLock::new(())` (outputs unchanged, asserted).

**22. Narration step 19 states the `Drain` design as a general fact the Deep dive contradicts** (minor)
- *Where:* narration step 19 ("A vector sets its length to zero before it gives out a drain"); step 19 caption ("put the owner into a consistent state *before* handing out the proxy, so a leak only amplifies"); Deep dive ("the implementation sets `len` to the start of the range", measured `drain(1..3)` → `len 1`; std promises only that elements "may have lost and leaked … arbitrarily").
- *What:* "Sets its length to zero" is true for `drain(..)` only; and the caption presents the Nomicon's design as behaviour, where std's guarantee is weaker (nothing freed twice, elements may be lost).
- *Fix:* Narration: "sets its length to the start of the drained range, zero for a full drain"; caption: "…so a leak only amplifies into more leaks: std promises nothing is freed twice, not which elements survive."
- *Status:* fixed: narration step 19, step 19 caption and the drawing now say the length is set to the start of the drained range (zero for a full drain) and that std promises only that nothing is freed twice.

**23. Smaller precision points** (minor)
- Step 13 caption and narration: "the flags live on the stack" / "a one-bit flag on the stack". The MIR shows a local (`_5`); where it lives is up to the optimiser (a register, or gone when the branch folds). Say "a hidden boolean local (`_5` in the MIR)", keeping the Nomicon's "on the stack" for the unoptimised picture.
- Step 7 caption: "`File` is 4 bytes here: the descriptor" is a Linux fact (`OwnedFd` over an `i32`); say "on Linux" on screen as the Deep dive does.
- Deep dive Prove it 6: "stops opening files after about 1,021 failures" assumes the service holds no other descriptors; a service has a listening socket, connections and a log. Say "fewer than 1,021, once its sockets and logs are counted".
- A.4 "guard" is used from step 1 ("guards that unlock when dropped") but never given the chapter's definition ("a value whose only job is to do something in `Drop`"), and `raii-guard` is introduced here. One clause in step 7: "a *guard* is a value whose only job is to do something in `Drop`; `SpillFile` is one, and so is a lock guard."
- Step 16 body: "Four ways … Which one needs `unsafe`?" while the options list three ways plus "None of them"; make the body say "Four ways are on screen" or add `process::exit` as an option in place of one, so the question and the options match.
- *Status:* fixed: step 13 caption, narration, drawing label and Deep dive say 'hidden boolean local (`_5`)'; 'on Linux' added to step 6/7 captions and the step 7 drawing; Prove it 6 says 'fewer than 1,021'; step 7 defines *guard*; step 16 body now says four ways are drawn and asks which of the first three needs `unsafe`.

