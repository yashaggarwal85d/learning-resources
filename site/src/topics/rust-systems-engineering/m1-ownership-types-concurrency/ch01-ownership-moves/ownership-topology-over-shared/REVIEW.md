# REVIEW: Ownership topology over shared mutability

## Content review

- **Reviewer:** Opus content review agent (ROUTINE.md section 4). It wrote nothing in this topic before this review.
- **Date:** 2026-10-12
- **What I read, in order:** ROUTINE.md section 4. `../CHAPTER.md`: all of Part A, plus the Part B entries for topics 3 and 4. The syllabus lines for 1.1, Ch.2 "Aliasing XOR mutability", Ch.4, Ch.6, Ch.10 and Ch.30. The previous topics as they exist: topic 3 (`rust.partial-moves-destructuring-as`) has no branch yet, so its seam was checked against its CHAPTER.md entry and A.8. For topic 2 (`origin/topic/rust.raii-drop-order-leak`) I read its registry entry, its `REVIEW.md` and its file list. For topic 1 I read its registry ids. Then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `coverage.json` (syllabus clauses, 7 sources item by item, 20 expert items), `SOURCES.md` (section list, plus the quotes the findings rest on), `FACT-CHECK.md`, `OUTLINE.md` (header, conventions, ledger, clauses, notes, progress, changes), `examples.py` and `examples/*.rs`.
- **What I ran:** rustc 1.97.0 (2d8144b78 2026-07-07), `--edition 2024 -O`, for `examples.py` before and after the fixes. I also wrote a scratch variant of `ring.rs` to test finding 15 (the owner hangs up instead of sending `Stop`), which became `examples/ring_hangup.rs`.
- **Counts:** 21 findings: 5 major, 16 minor. By part: Flow 7, Gap hunt 5, Expert reader 9. All are fixed.
- **What already works:**
  - The four syllabus clauses are each taught in the reel and in the Deep dive.
  - The reflex ladder (E0499, E0373, E0382, E0596) uses real diagnostics.
  - Every on-screen number is a count asserted in `examples.py`, and no timing claim appears anywhere.
  - "0 locks" is qualified as "in our code", and the channel is named as a synchronisation point.
  - The tree is offered for sequential stages and the ring for concurrent ones.
  - The bridge and handoff keep CHAPTER.md A.8's names. The handoff names the Ch.2 rule without teaching it.
  - No concept the topic relies on sits later in the syllabus without a gloss in one line. `Arc`, `Mutex`, `Rc`, `RefCell`, `'static` and `Send` are each named, glossed and pointed forward, as the chapter plan allows. So there is no syllabus bug to log.

### Part 1 · Flow

**1. `move` is used at step 2, eleven steps before step 13 teaches it** (minor)
- *Where:* step 2 caption and narration ("its help says add move. Now the pool moves into the first thread").
- *What:* The E0382 rung only makes sense if `move` makes the closure take ownership. The learner meets `move` here with no gloss. `move-closures` is introduced at step 13.
- *Evidence:* `reel.tsx` step 2. CHAPTER.md A.7 says `move-closures` is introduced by this topic, which therefore has to say what `move` does where it first appears.
- *Fix:* Add a gloss in one clause, "(a `move` closure owns what it uses; step 13)", to the caption, and a matching line to the narration.
- *Status:* fixed. The step 2 caption and narration now say "a move closure owns what it uses", with a pointer to step 13.

**2. Step 2's narration names `Rc<RefCell<…>>`, but nothing on screen shows it, and it is glossed only at step 8** (minor)
- *Where:* narration step 2, last line ("Single-threaded, the same ladder ends at an R C of ref cell").
- *What:* The narration says something the caption and drawing don't show. `Rc` and `RefCell` are first explained at step 8.
- *Evidence:* the `reel.tsx` step 2 body has no `Rc`. Step 8's body has the glosses.
- *Fix:* Add `Rc<RefCell<Pool>>` to the caption as "the single-threaded twins (step 8)". Have the narration call them the single-threaded twins of arc and mutex.
- *Status:* fixed. The caption ends "On one thread the same ladder ends at `Rc<RefCell<Pool>>`, the single-threaded twins (step 8)", and the narration says the same.

**3. Step 12 is the first channel code in the reel, and `tx`/`mpsc` get no gloss** (minor)
- *Where:* step 12 caption (`tx.send(buf)`).
- *What:* `threads-and-channels` is declared only as a general concept. The OUTLINE's gloss list promises "`mpsc::channel()`: a FIFO queue between threads", but no step says it before `tx.send` appears.
- *Evidence:* `OUTLINE.md`, "One-line glosses". `reel.tsx` steps 1 to 11 show no channel code.
- *Fix:* Open step 12 with "`tx` is the sending half of a channel (`mpsc`: a first-in, first-out queue between threads)", and say the same in the narration.
- *Status:* fixed. The step 12 caption and narration now open with the gloss.

**4. The Deep dive credits topic 2's ideas to "the previous topic", and pipeline code to topic 1** (minor)
- *Where:* `index.mdx`:
  - "What an Arc of Mutex is": "the previous topic's guard pattern".
  - "A guard that sends its buffer home": "leak-safe in the previous topic's sense".
  - Lab 5: "a temporary that lives to the end of the statement (the previous topic)".
  - "Tree-shaped ownership": "The function signatures from the first topic are the edges".
- *What:* The previous topic is "Partial moves and destructuring as transfer". Guards, leak safety and temporary scopes come from topic 2. Topic 1 taught ownership contracts with `ship(batch)` and never built `fill`/`inspect`/`consume`, as this topic's own OUTLINE notes.
- *Evidence:* CHAPTER.md A.7, which introduces `raii-guard`, `leak-safety` and `temporary-scopes` in topic 2. `OUTLINE.md` header: "topic 1 did **not** build `Buf`/`Pool`/`fill`/`inspect`/`consume`".
- *Fix:* Name topic 2 by its title in those three places. In the fourth, say the first topic's *contracts* are the edges, shown here as the pipeline's signatures.
- *Status:* fixed. All four places are reworded. "`Option::take` (the previous topic's idiom)" was correct and stays.

**5. Two seams say the same thing twice** (minor)
- *Where:* step 1 narration (the bridge sentence, then "The guard borrows the pool exclusively, so a second guard is the double exclusive borrow error"). Step 3's answer ("the pool now has three, the counters four"), which step 4 then opens with word for word.
- *What:* The learner hears the same sentence twice within seconds. Step 4's opening, "Count the owners", lands on something already said.
- *Evidence:* `narration.json` steps 1, 3 and 4. The step 3 `explain` in `reel.tsx`.
- *Fix:*
  - Step 1: say "Here it is in code. A second guard on the same pool is the double exclusive borrow error."
  - Step 3: replace the owners sentence in the explain and in the narration answer with a teaser, "who owns the pool now? Next step."
- *Status:* fixed.

**6. Prove it 2's narration doesn't say which design** (minor)
- *Where:* narration step 20 ("Stage three stalls. Point to the exact line where stage one blocks."). Caption: "Stage 3 stalls."
- *What:* Step 15 has just compared two designs. In the pull request, stage 1 never blocks, so a listener without the picture can't answer.
- *Evidence:* `examples/stall.rs`, where `fill` calls `pool.get()` itself and never waits, against `ring_stall.rs`.
- *Fix:* Say "In the ring" in both the caption and the narration.
- *Status:* fixed.

**7. The end card's "Next" is narrower than the handoff** (minor)
- *Where:* `scenes.tsx` Recap ("Next: why &mut is exclusive") and its aria-label.
- *What:* The handoff to Ch.2 is the whole rule: many shared borrows or one exclusive borrow, never both. The card names only half of it.
- *Evidence:* registry `handoff`, CHAPTER.md A.8, and the Ch.2 syllabus line "many `&T` or exactly one `&mut T`, never both".
- *Fix:* Card: "Next: many &T or one &mut T". The aria-label states the full rule.
- *Status:* fixed. The reel check passed after the change.

### Part 2 · Gap hunt

**8. The general owner task, request and reply, is only prose: no code and no measurement** (major)
- *Where:* Deep dive "Owner thread fed by messages" (Ryhl's recipe paragraph). Prove it 6 ("a get becomes a request plus a reply ... 3 messages per request").
- *What:* The syllabus clause is "an owner task fed by messages". Expert items 17 and 18 are about the recipe: a cloneable handle holding a `Sender`, requests that carry a reply channel, an owner that ends when the last handle drops. The topic builds only the ring, a special case where the owner pushes buffers around a fixed cycle and nobody ever asks it for anything. Prove it 6 counts messages for a shape that nothing in the topic shows or runs.
- *Evidence:* `coverage.json` expert items 17 and 18 point to "Owner thread fed by messages", which had no code for them. No `examples/*.rs` file had a reply channel.
- *Fix:* New `examples/owner_rpc.rs`: one owner thread owns the `Pool`; `PoolMsg { Get(Sender<Buf>), Put(Buf) }`; a `#[derive(Clone)] PoolHandle`; three stage threads, 1,000 rounds each. `examples.py` E6d asserts four things:
  - `requests=3000 messages=9000 messages_per_request=3`;
  - at most 3 buffers made, with every one home at the end;
  - no `Mutex` or `Arc` in the file;
  - the run is otherwise deterministic, and only the bound on buffers is asserted.

  The Deep dive shows the handle and the message enum, gives the measured counts, explains why the bound is 3, and states the cost the ring avoids. Lab 4 and Prove it 6 now cite it.
- *Status:* fixed.

**9. Three coverage entries point to places that didn't hold the item** (minor)
- *Where:* the `coverage.json` sources:
  - `thread::spawn` "Behaviour": dropping the `JoinHandle` detaches the thread, and a panic makes `join` return `Err`.
  - Book 16.3 "Comparing RefCell/Rc and Mutex/Arc": `Mutex` "provides interior mutability, as the Cell family does".
  - Book 16.2 Listing 16-8: `try_recv` doesn't block.
- *What:* Each points to a step or Deep dive heading where the item wasn't said. This is the "wrongly covered" case.
- *Evidence:* `grep` found no "detach", "interior", "Cell family" or "try_recv" in `index.mdx` or `reel.tsx`. The quotes already exist in `SOURCES.md`.
- *Fix:* Add one clause each to the Deep dive:
  - `join()` returns `Err` on panic (measured in `homebuf.rs`), plus the "implicitly be detached" quote, under "Owner thread fed by messages".
  - The Book's interior-mutability sentence, with `Mutex` is to `Arc` what `RefCell` is to `Rc` (Chapter 4), under "What an Arc of Mutex is".
  - "the `try_recv` method doesn't block" (polling is Chapter 10), in the `mpsc` paragraph.
- *Status:* fixed. `sources.mjs check` passes with 215 quotes.

**10. The case between read-only `Arc<T>` and `Arc<Mutex<T>>` isn't named** (minor)
- *Where:* step 18, and the Deep dive "Choosing a topology".
- *What:* A senior reader's next question after "read-only config: `Arc` with no lock" is a config reloaded now and then. The `Arc` docs name `RwLock`. The syllabus's Ch.4 names `arc-swap` for read-mostly config. The topic named neither.
- *Evidence:* `SOURCES.md` (`Arc`): "Use interior mutability with synchronization primitives like Mutex, RwLock, or one of the Atomic types". Syllabus Ch.4: "`arc-swap` (RCU-style) for read-mostly config".
- *Fix:* Add a paragraph after the Tokio quote that names `RwLock` with the docs quote, names `arc-swap`, and points both to Chapter 4.
- *Status:* fixed (Deep dive). The reel is unchanged, because step 18 already points to Chapter 4 for contention.

**11. Arenas: the topic doesn't say what the generation buys compared with keys that are never reused** (minor)
- *Where:* Deep dive "A generational arena", the costs paragraph.
- *What:* A reviewer will ask why not just use a `u64` id in a `HashMap`. The answer, that the generation lets dense `Vec` slots be reused while stale handles are still caught, is the reason generational arenas exist. The `slotmap` docs' "why not" item is in `coverage.json`, but the trade-off was never stated.
- *Evidence:* `coverage.json` slotmap item "Why not index a Vec, slab, stable-vec".
- *Fix:* Add two sentences: keys that are never reused (a `u64` counter as a `HashMap` key) have no ABA until 2^64 insertions, but cost a hash per access and lose dense storage; the generation is what lets an arena reuse slots.
- *Status:* fixed.

**12. The ring never says where the reviewed design's shared counters went** (minor)
- *Where:* steps 14 and 16, Deep dive "Owner thread fed by messages".
- *What:* The PR's second `Arc<Mutex<Stats>>` disappears from the ring without a word. Each stage's `seen` vector is its counter, and it comes back through `join()`. Step 7's answer claims "each stage owns its counters" for the tree, but the ring version is never stated.
- *Evidence:* `examples/ring.rs`: `fill_stage` returns `seen`, and `main` joins it.
- *Fix:* One sentence in the Deep dive after the ring's measured results.
- *Status:* fixed.

### Part 3 · Expert reader

**13. The Deep dive's "thirty lines" arena block opened with 25 lines of the pipeline** (major)
- *Where:* `index.mdx` "A generational arena in thirty lines". The rust block began with `Header`, `Pool`, `Pool::get`/`put`, `fill`, `inspect` and `consume`, and only then the arena.
- *What:* The pipeline code was pasted in from `arena.rs`. It repeats code the page has already described, and it buries the arena under unrelated code. `examples.py` only checks that each line exists in some lab file, so the check passed.
- *Evidence:* `index.mdx` lines 85–109 before the fix.
- *Fix:* Start the block at `// A generational arena, by hand`.
- *Status:* fixed.

**14. Step 15's question is false for the ring as asked** (major)
- *Where:* step 15 caption ("How many buffers does stage 1 end up making in each"), narration ("How many buffers does stage one end up making in each?"), and the correct option "1,000 in the PR, 3 in the ring".
- *What:* In the ring, stage 1 makes no buffers. The owner makes all three, as step 14 and this step's own explain say. A careful learner either finds no true option or learns the wrong owner, which is the very point the step teaches.
- *Evidence:* `examples/ring_stall.rs`, where only `Owner` calls `pool.get()` and `MADE` is the owner's count. The step 15 explain: "In the ring only the owner makes buffers".
- *Fix:* Ask "How many buffers exist in each design by the time stage 3 wakes?" (caption and narration). In the answer narration, say the owner makes them in the ring.
- *Status:* fixed. The options and their numbers are unchanged and still asserted.

**15. "In a cycle ... no one can go first" is false** (major)
- *Where:* step 16 caption ("so no one goes first") and narration ("so no one can go first"). The Deep dive says otherwise, in brackets: "the owner could also drop its `Sender` first".
- *What:* The owner can go first. If it drops `to_fill` after the last dispatch, `fill`'s loop ends, which drops `fill`'s `Sender`, and so on round the ring. The `mpsc` docs guarantee that messages sent before the disconnect are still received. The true point is narrower: no loop in a cycle ends *on its own*, so the one place that knows the work is done has to start the shutdown.
- *Evidence:* I measured a variant that sets `to_fill = None` after the last dispatch and sends no `Stop`. It printed output identical to `ring.rs` and exited 0.
- *Fix:*
  - Add the variant as `examples/ring_hangup.rs`. `examples.py` E6c asserts that its output equals `ring.rs`'s and that the owner sends no `Stop`.
  - Step 16 caption and narration: "no loop in a cycle ends on its own, because each waits for a sender that is itself waiting. The owner, who knows the work is done, starts it: `Msg::Stop` behind the last buffer (hanging up its sender works too)".
  - Rewrite the Deep dive's shutdown paragraph to match, citing the measurement.
- *Status:* fixed.

**16. The ledger check is presented as evidence, but it can't fail once the FIFO check has passed** (major)
- *Where:* step 16 ("Then in the pool plus out in the ring equals every buffer ever made, at all 1,000 checks"), the narration ("At every one of a thousand checks"), and the Deep dive ("1,000 passed checks").
- *What:* `out` is pushed on every dispatch and popped on every return, and `pool.free` changes only by `put`. So `free.len() + out.len() == next_id` holds by construction whenever the `pop_front` matched. That is the same kind of identity that FACT-CHECK.md caught in the first version (`home + (sent - back) == made`). The real test is the FIFO assertion, which compares what arrives with what must arrive.
- *Evidence:* the `Owner::dispatch` and `Owner::home` code in `examples/ring.rs`. `ring_clone` and `ring_drop` fail at the FIFO assert, not at the balance.
- *Fix:* Present the balance as the books balancing *because* the FIFO check passed. Count "1,000 returns checked", not "1,000 passed checks". In the Deep dive, explain why the balance follows from the first assertion and what it is still good for (guarding later edits to the owner).
- *Status:* fixed in the caption, narration and Deep dive. The assertion stays in `ring.rs` and on screen, described correctly.

**17. "Removal is three moves"** (minor)
- *Where:* step 11 caption and narration.
- *What:* Only `take()` moves anything. Bumping a counter and pushing an index are not moves. "Move" is a defined term in this chapter (CHAPTER.md A.4: a transfer of ownership).
- *Fix:* "Removal is three steps."
- *Status:* fixed.

**18. Step 12's narration said "the small handle crosses" right after three steps about arena handles** (minor)
- *Where:* narration step 12, and the step 12 aria-label ("the 32-byte handle of the buffer").
- *What:* For three steps "a handle" meant the arena's `Handle`. CHAPTER.md A.4 requires saying that the `Vec` handle is unrelated, but only step 9's caption does, and a listener only hears the word.
- *Fix:* Say "Its small fixed part, the id and the vector's pointer, capacity and length, crosses to the other thread". The caption and aria-label say "the 32-byte `Buf`", which matches the four cells and "SIZE 32 B" in the drawing.
- *Status:* fixed.

**19. Step 7's explain contradicted itself about the config** (minor)
- *Where:* step 7 explain: "none is its natural owner, so ownership really is shared ... (scoped threads, Chapter 2, could simply borrow it)".
- *What:* If scoped threads could borrow it, `main` *is* a natural owner. Ownership is shared only because `thread::spawn` threads may outlive whoever would lend the config (`'static`).
- *Fix:* "a spawned thread may outlive whoever would lend it, so ownership really is shared ... (With scoped threads, Chapter 2, `main` could own it and lend it.)" Matching narration. The explain is still under 75 words.
- *Status:* fixed.

**20. "Every holder can do anything, at any time" overstated the cost** (minor)
- *Where:* step 4 caption and narration.
- *What:* Holders can do only what `Pool`'s API allows. The design cost is that any of them can call any method at any time, and none is in charge.
- *Fix:* "every holder can call any method at any time and none is in charge" (caption). The narration says the same.
- *Status:* fixed.

**21. "A generational arena in thirty lines" is 44 lines of code** (minor)
- *Where:* the Deep dive heading and outcome 3 ("about thirty lines").
- *What:* `Handle`, `Slot`, `Arena` and its four methods come to 44 lines once blank lines and comments are left out. A reader who counts will distrust the rest of the page.
- *Evidence:* `awk` over `examples/arena.rs` from the arena comment to `pub struct Node`, without blank or comment lines, gives 44.
- *Fix:* "A generational arena in about forty lines". Outcome 3 says "about forty lines of code", and the six `coverage.json` references follow the heading. CHAPTER.md's "about 30 lines" was orientation, not a contract on the heading.
- *Status:* fixed.

### Checks after the fixes

- `python3 examples.py`: all examples passed on rustc 1.97.0, including the new `ring_hangup` and `owner_rpc`.
- `node scripts/sources.mjs check <topic>`: 215 quotes, 0 problems.
- `cd site && npm run build`: complete, including the flow, coverage and topic-file checks.
- `node scripts/check-all.mjs --only reels --topic ownership-topology-over-shared`: passed at desktop and phone sizes.
- `coverage.json` → `gapReview`: `{ "date": "2026-10-12", "by": "Opus content review", "open": [] }`.
- Narration audio has not been generated yet (ROUTINE.md section 7), so the reworded lines have no takes to redo.
