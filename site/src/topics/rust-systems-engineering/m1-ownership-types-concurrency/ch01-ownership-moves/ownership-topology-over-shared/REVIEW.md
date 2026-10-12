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

## Looks and learning review

- **Reviewer:** Looks and learning review agent (Claude Sonnet 5.5), judging as a demanding designer and teacher.
- **Date:** 2026-10-12
- **What I read and looked at:** `DESIGN.md` (section "The looks review checks", plus the canvas, colour and motion rules it leans on), this topic's `OUTLINE.md` (visual vocabulary and the 22 storyboards), `narration.json`, `reel.tsx` and the scene code where a screenshot needed explaining, and every screenshot in `site/test-results/` for this topic: 22 steps at desktop (1440 x 900) and phone (390 x 664 CSS px at 3x), plus the question frames (`-q`) of the seven predict steps (3, 7, 10, 15, 19, 20, 21). Each step was judged against the checklist: point visible at a glance, final frame a complete summary, crowded / overlapping / clipped / under-sized / low-contrast text, no more than two accents and four competing labels, caption says what the picture shows, and the step belongs to the site while keeping its own idea.
- **Not run (when this review was written):** no new screenshots or builds. Narration audio does not exist yet, so pacing is judged from word counts (about 2.5 words a second) against each step's `duration`.
- **Counts:** 28 findings: 10 major, 18 minor. Now: 24 fixed (all 10 major, 14 minor), 2 partly fixed (26, 27: the in-topic part is done, the shared-code part is logged for the owner), 2 not fixed (25, 28: shared code is locked, logged for the owner).
- **What already works:**
  - The topic's own idea, four maps of one pipeline with the same four places and only the edges changing, is real and consistent (steps 4, 5, 6, 8, 9, 14, 15, 16). The map title and counters let a paused learner say which topology a frame shows.
  - Step 8 (the Rc cycle: four cherry boxes, four caramel arrows, "leaked: 4") and step 15 (SHARED over RING, 1,000 against 3) are the strongest frames: one idea, one number, readable at both sizes.
  - Step 12 (the 32-byte chip crossing while the 64 KiB buffer stays put) is a picture that teaches the mechanism without the caption.
  - Step 21's reveal (dashed removed slot, two cherry `None` arrows) and the step 17 thumbnails are clear and on theme.
  - Palette discipline holds: caramel for the thing to look at, cherry for failures, taupe and latte for structure, never more than two accents. Nothing sits in the right 64 px on desktop. No label overlaps another at desktop size except where listed below.
  - Every phone frame keeps the caption, the "MORE" truncation and the controls out of the drawing.

### Part A · Major

**1. Step 13 ends on its start frame, and its only summary label never shows** (major)
- *Status:* fixed. `MoveClosure` no longer returns the pool to `MAIN`: the frame the step ends on has the pool inside the closure (caramel border, caramel owner arrow from the thread line) with "the closure owns pool" (in by 4.2 s) and "until join() hands it back" as a second line (in by 4.7 s, `duration` 4.8). `MAIN` keeps a dashed "moved" box.
- *Where:* step 13 "move hands a thread what it owns", both sizes. `scenes.tsx` `MoveClosure`.
- *What:* The final frame shows `pool` back in `MAIN` and an empty dashed `closure` box, so it looks like the first frame. The one label that would explain it, "join() hands the pool back", is missing. The moves (E0373, the pool entering the closure, the thread owning it) are gone from the still.
- *Evidence:* `desktop-…-13.png` and `phone-…-13.png`. The label fades in at `fa(t, 4.8, 0.4)` and the step's `duration` is 4.8, so at the last frame its opacity is 0. The pool returns to `MAIN` at `back >= 1`.
- *Fix:* Hold the frame where the idea is: the pool inside the closure with a caramel owner arrow and the label "the closure owns pool until join()". Bring the label in by 4.2 s. Show `join()` as a second small line, not as a return that erases the picture.
- *Severity reason:* a paused or reduced-motion learner sees nothing taught, and the step introduces `move`.

**2. Step 9's final frame is the arena after it has dissolved, at 25 to 40 percent strength** (major)
- *Status:* fixed. The arena no longer dissolves: slots, handles (`1·0 2·0 3·0 0·0`) and the `Arena<Node>` bar stay at full strength; the ghost slots, the fading and the "arena dropped" line are gone, and the `gen` lines are dropped from the slots (indices kept). The drop is two numbers in step 8's style: `live after the drop`, `ARENA 0` against `Rc RING 4`; `HANDLE 8 B` sits at the right. All x positions were already 40; the desktop offset to x = 641 is the shared `Svg fill` centring a height-limited viewBox, which this topic cannot change.
- *Where:* step 9 "One owner for every node: an arena", both sizes. `Arena`.
- *What:* The frame the learner is left with has dashed ghost slots at 0.4 opacity, handle labels (`1·0 2·0 3·0 0·0`) at about 0.35, and slot indices and `gen 0` nearly invisible. The handle idea (an index plus a generation) is the point, and it is the least legible thing on screen. There are also more than four labels competing: map title, "arena dropped" line, four slot names, four indices, four gens, four handle labels, `LIVE`, `SIZE`, `Rc ring: 4`.
- *Evidence:* `desktop-…-09.png`, `phone-…-09.png`. Desktop also draws the map at x = 641 while neighbouring steps start at 590, and "arena dropped: all four slots freed at once" sits 25 px above the `1·0` label.
- *Fix:* End on the live arena at full strength, with the handles and one clear caption. Show the drop as a two-number comparison, `LIVE 0` against `Rc ring 4`, in the same place as step 8's counter. Drop the per-slot indices or the `gen` lines in the final frame. Align the map to x = 40 like steps 4 to 8.

**3. Step 11 never draws the mechanism it names** (major)
- *Status:* fixed. `GenCheck` now draws the mechanism: numbered ticks 1 take, 2 bump on the slot and 3 on a labelled `free list` row, with the index `2` chip sliding from the free list into the slot at the reuse; two handle chips (`2·1`, `2·0`) with arrows to the slot and the check under each (`gen 1 = 1` Some, `gen 0 ≠ 1` None). It reads without the code panel, which a phone hides.
- *Where:* step 11 "The generation catches the stale handle", both sizes.
- *What:* The caption describes three removal steps and a two-number lookup. The picture is one big slot `audit / gen 1`, two floating handle chips (`2·1 Some`, `2·0 None`) with no edge to the slot, and three empty boxes labelled `free` that mean nothing after the slot has been reused. The compare (`gen 1 = 1` passes, `0 ≠ 1` fails) is not shown. On phone the code panel is hidden, so the three steps appear nowhere but in the truncated caption.
- *Evidence:* `desktop-…-11.png`, `phone-…-11.png`.
- *Fix:* Draw each handle as an arrow to the slot with a one-line check beside it (`1 = 1 → Some`, `0 ≠ 1 → None`). Make the free list a labelled row that shows the index 2 leaving it. Show the three removal steps as numbered ticks in the drawing so phone keeps them.

**4. Step 14's final frame is the start state, and the channels have no direction** (major)
- *Status:* fixed. `RingRun` ends on a snapshot of the live ring: buffer 1 inside `consume`, 2 inside `inspect`, 3 inside `fill` (the three reach their places together at 5.6 s), so "one owner each" is visible; the channels have arrowheads (new `head` on `Chan`, also used by steps 15, 16, 17, 22); stage names moved inside the boxes, so no channel line reaches a label; `BUFFERS`, `LOCKS` and `MESSAGES` sit under the ring, with "one owner per buffer" in the middle.
- *Where:* step 14 "One owner, fed by messages", both sizes. `RingRun`, `RingFrame`.
- *What:* The frame the learner keeps shows all three buffers docked at the owner, three empty stage boxes and four plain double lines. The claim "each buffer has exactly one owner at every instant" and the direction of travel are invisible. On phone the vertical channel lines run into the labels `consume` and `inspect`, and `BUFFERS 3 / LOCKS 0 / home` crowd the middle of the ring.
- *Evidence:* `desktop-…-14.png`, `phone-…-14.png` (the lines touch the end of "consume" and the "t" of "inspect").
- *Fix:* End on a frozen frame with one chip in each of owner, fill, inspect and one in a channel (or three docked plus arrowheads). Add arrowheads to the channels. Move the stage names inside the boxes or 16 units clear of the lines. Put the two counters outside the ring.

**5. Step 16 carries two ideas in 110 words, and its final frame contradicts itself** (major)
- *Status:* fixed. Shutdown is out of the step (narration, caption and drawing): `index.mdx` (Deep dive, "Owner thread fed by messages") already teaches `Msg::Stop` and hanging up, so nothing is lost, and `OUTLINE.md` says so. `Ledger` now ends on a split bar, `2 in pool` against `1 out in the ring`, `= 3`, with `checks 1,000` and the buffer 3 still out at `inspect`; the `out` label only shows when its segment is not empty. The caption is 67 words, the narration 60.
- *Where:* step 16 "The owner can count every buffer", both sizes. `Ledger`; narration step 16 (136 words).
- *What:* Accounting (books balance) and shutdown (the `Stop` message) share one step. The final frame greys the whole ring to 30 percent, leaves a `Stop` chip floating over a channel with no owner, and shows the "in pool plus out = 3" bar as one solid latte block, so the caramel label "out in the ring" sits under a segment of zero width. Two lower lines (`checks 1,000`, `Stop arrives last: FIFO`) are a third and fourth idea. The caption is the longest in the topic.
- *Evidence:* `desktop-…-16.png`, `phone-…-16.png`; `Ledger` draws `out` only when `out > 0`, and at the end `inPool = 3`.
- *Fix:* Split into two steps (books, then shutdown), or cut shutdown to the narration and Deep dive. For the bar, end on a split that shows both segments (for example 2 in the pool, 1 out) or drop the "out" label when the segment is empty. Cut the caption to 90 words or fewer.

**6. Step 6's final frame fades the tree's edges and leaves `consume` unconnected** (major)
- *Status:* fixed. All three edges of the tree stay at full strength in the final frame: dashed cinnamon to `fill`, dashed latte to `inspect`, caramel hand-off down to `consume` and the give-back up, and a latte arrow from `inspect` carrying `Header` up to the driver. Only the code highlight changes over time. Counters moved up and `h` cut to 290.
- *Where:* step 6 "Name the owner: a tree", both sizes. `Tree`.
- *What:* After 4.6 s the two lend edges fall to 35 percent and the `Header` chip to 60 percent, so the picture left is four boxes, a `Pool 1` cell and two faint dashed lines. There is no edge from `driver` to `consume` (the hand-off and give-back) and no edge for "results come up". A tree is the point of the step and the frame does not look like one. On phone, `Header` is a 13-unit taupe label at about 9 px on a dark box, and the counters touch the step eyebrow.
- *Evidence:* `desktop-…-06.png`, `phone-…-06.png`; scene code multiplies the edge opacity by `0.35 * faint`.
- *Fix:* Keep the three edges at full strength in the final frame: dashed cinnamon to `fill`, dashed latte to `inspect`, a solid caramel hand-off to `consume` and back, and a short upward arrow carrying `Header`. Use the fade only on the code highlight.

**7. Step 7 shows no mechanism, and its question frame leaks the answer** (major)
- *Status:* fixed. The question frame shows four neutral cards ("lent out, taken back", "bumped every message", "read, never written", "passed stage to stage") with no owner marks and no thread count. The reveal draws one dot per owner: 1 on the pool, 3 on the counters, 8 on the config (caramel, outlined), 1 on the buffer, with a legend `= one owner`. The layout is one 2 x 2 grid for both orientations.
- *Where:* step 7 "Which of these really has many owners?", all four captures.
- *What:* The "picture" is four text cards. The question frame already prints "8 threads, whole run" under the config and "stages run in turn" under the pool, which gives the answer away. The reveal only swaps the second lines for owners (`driver`, `each stage`, `Arc<Config>`, `moved along`) and outlines C. A learner who only watches sees nothing about ownership counts.
- *Evidence:* `desktop-…-07-q.png`, `desktop-…-07.png`, `phone-…-07-q.png`, `phone-…-07.png`.
- *Fix:* Draw owners: one dot per owner on each card, with the question frame showing the cards without owner dots. On reveal, one dot appears on the pool, one per stage on the counters, eight on the config, one travelling dot on the buffer. Remove "8 threads, whole run" from the question frame.

**8. Four phone frames set code and labels at about 5 to 7 CSS px** (major)
- *Status:* fixed. Steps 10, 19, 20 and 21 are redrawn at the 600-unit width with `fill` inside a `Stack`, with `h` 252, 214 (answer on a phone), 150 and 226 (down from 360 to 380 before), so the phone scale is about 0.55 to 0.6 instead of 0.4 to 0.5. Step 20 uses a four-line excerpt (`for msg in rx {`, the source line, `fill`, the send) with line one highlighted, and the answer draws it with `← blocks here`; step 21's slot row is 512 units wide. On a phone the question shows the code and the answer shows the drawing (the code and the drawing do not both fit), as steps 3, 9 and 11 do. The reel test's 9 px floor passes at both sizes; the `Svg` still takes its height from a predict step's small frame (about 150 px), which is shared layout.
- *Where:* steps 10, 19, 20 and 21 on phone (answer frames especially). `Reuse`, `ProveView`, `ProveBlock`, `ProveArena`.
- *What:* These scenes use `<Svg h={360}>` without `fill`, so the drawing is scaled to the container height, not the width. The slot labels (`gen 0`, indices), the `blocks here` tag and the code lines render at roughly 6 px; on step 20 the answer frame shrinks the seven code lines to about 5.5 px. The reel test's 9 px floor is the standard in `DESIGN.md`. Step 21's phone drawing fills barely half the width.
- *Evidence:* `phone-…-10.png`, `phone-…-19.png`, `phone-…-20.png`, `phone-…-21.png` (compare character width with steps 12 and 15, which use `fill`). In `phone-…-20.png` the five code lines after `for msg in rx` are unreadable without zooming.
- *Fix:* Give these scenes `fill` and a 600-unit-wide layout, as steps 3, 4 and 14 do. For step 20 use a four-line excerpt (`for msg in rx {` … `tx.send`) and highlight line one. Make step 21's slot row 520 units wide.

**9. Step 3 on phone cuts off the code the question is about** (major)
- *Status:* fixed. On portrait the code is five lines without the stage comments (`PR_LINES_PORTRAIT`; the desktop panel keeps all eight), so the last line, `lock(&pool).put(buf);`, is on screen; the panel's own top padding is unchanged and, with five lines, it clears the nav (see `phone-…-03-q.png`).
- *Where:* step 3 "How many locks per message?", phone question frame.
- *What:* The code panel scrolls under the top nav, so its title bar and first line are overlapped, and the last line, `lock(&pool).put(buf);` (the fifth lock), is cut off at the panel's bottom edge. The learner is asked to count the locks while one is hidden. Comment lines (`// fill`, `// inspect`, `// consume`) take three of eight lines.
- *Evidence:* `phone-…-03-q.png` (the panel ends at `lock(&stats).consumed += 1;`); `desktop-…-03-q.png` shows all eight lines.
- *Fix:* On portrait, drop the comments and show five lines, or two lines per stage on one row each. Keep the panel clear of the nav (top padding like the other steps).

**10. Narration runs 30 to 65 seconds over animations of about 5 seconds** (major)
- *Status:* fixed. Every narration is now 60 words or fewer (steps 1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18 and 22 were cut; step 7's answer 61 to 46); steps 1 and 2 together are 115 words, down from 300. Steps 1, 2 and 16 are built to change as they are spoken: step 1 (`duration` 8.6) shows the code, the first loan, the E0499 collision, the pull request's box and then "compiles. the right fix?"; step 2 (10.2) lights one rung at a time, 2 s apart, top to bottom, with the left spine growing; step 16 (6.5) sends buffers round, splits the bar and counts the checks. Each predict step still has exactly one `answer` clip and the structure of `narration.json` is unchanged. No audio exists yet, so no takes are stale.
- *Where:* narration against `duration` for all 22 steps; worst steps 1 (136 words, about 54 s), 2 (164 words, about 66 s) and 16 (136 words, about 54 s). Steps 4, 8, 12, 14 and 22 are 90 to 100 words.
- *What:* The animation plays for 5 s and then holds. Whatever is on screen for the remaining 30 to 60 seconds is the final frame. Many final frames are weak (findings 1, 2, 4, 5, 6), so a long narration lands on a picture that does not match it. Steps 1 and 2 are also the two heaviest steps and come before the first predict step, so the learner listens for about two minutes before interacting.
- *Evidence:* word counts from `narration.json` and the `duration` values in `reel.tsx`.
- *Fix:* Cut each narration to 60 words or fewer where the caption already says it, and add 2 or 3 sub-beats to steps 1, 2 and 16 so the picture changes as the narration moves on (for step 2, light one rung at a time as it is spoken). Steps 1 and 2 together are 300 words of narration before the first question; trim them so the learner reaches step 3 sooner.

### Part B · Minor

**11. Four captions run over the 90-word limit** (minor)
- *Status:* fixed. Captions now run 44 (step 1), 88 (2), 82 (4), 84 (12) and 67 (16) words; the longest of the rest is 90 (steps 6 and 22). Step 2's `Rc<RefCell<Pool>>` sentence is a one-line tag in the drawing; step 12's `SendError` sentence is in the Deep dive (it was already there). Step 1's first screen is the 44-word caption plus the 50-word bridge from `registry.ts`, about 94 words, down from 134.
- *Where:* step 2 (116 words), step 16 (110), step 12 (106), step 4 (99). Step 1 is 84 words plus the 50-word bridge on its first screen.
- *What:* `OUTLINE.md` sets 90 words or fewer. On phone each caption shows three lines and "MORE", so the longer ones are mostly hidden.
- *Evidence:* word counts of the `body` JSX in `reel.tsx`; `phone-…-02.png`, `-04.png`, `-12.png`, `-16.png`.
- *Fix:* Cut each to 90 words or fewer. Step 2: drop the `Rc<RefCell<…>>` closing sentence to a one-line tag in the drawing. Step 12: move the `SendError` sentence to the Deep dive.

**12. Step 2's ladder reads in the opposite order to the story** (minor)
- *Status:* fixed. The rungs run top to bottom E0499, E0373, E0382, E0596, then the `Arc<Mutex<Pool>> compiles` box last, joined to the last rung by the spine on the left (which now grows with the rungs).
- *Where:* step 2 "Four errors, four patches", both sizes.
- *What:* The caption and narration go E0499, E0373, E0382, E0596. The drawing lists E0596 first at the top and E0499 last at the bottom, under a "compiles" box. A learner reads downwards and meets the last patch first. Each row's two lines (error gist, caramel patch) are good.
- *Evidence:* `desktop-…-02.png`, `phone-…-02.png`.
- *Fix:* Put E0499 at the top and run down to "Arc<Mutex<Pool>> compiles" at the bottom, or number the rungs 1 to 4. Keep the bracket on the left only if it joins the last rung to the result.

**13. Step 3's picture does not itemise the five locks, and `inspect` has no edge** (minor)
- *Status:* fixed. `LockCount` draws the two locks, `Arc<Mutex<Pool>>` and `Arc<Mutex<Stats>>` (the `Stats` box is new), each with numbered ticks in the order of the code: 1 get, 2 fill, 3 inspect, 4 consume, 5 put. Every stage has its own tick, so `inspect` is no longer missing; `LOCKS 5,000` and `5 per message` stay.
- *Where:* step 3 reveal, desktop and phone (`LockCount`).
- *What:* Three caramel arrows (main, fill, consume) run into the hub, `inspect` has none, and the arrows are not the five acquisitions (get, put, three counters). The reveal is a label "5 per message" and the counter 5,000. The `Stats` box that takes three of the five locks is not drawn.
- *Evidence:* `desktop-…-03.png`, `phone-…-03.png`; scene code draws three `Own` arrows.
- *Fix:* Show five small lock ticks on the hub as the code lines run, in the order of the code, and add a second hub or a lower row for `Stats`.

**14. Step 4 is cluttered, and one label fills its box edge to edge on phone** (minor)
- *Status:* fixed. The `Stats` box is 220 units wide; the thin edges end at box borders and none passes through a label; the `LOCKS` counter and the two text lines are gone (the caption has them); `OWNERS` moved up so it clears `fill`. `h` is 330, down from 420.
- *Where:* step 4 "Everyone owns it, so no one does", phone more than desktop.
- *What:* The `Arc<Mutex<Stats>>` text touches both sides of its rounded box, and thin latte lines from `main` and `consume` pass through its label. The `LOCKS` label sits on the bottom edge of `inspect`. Counters are in two places (`OWNERS` top-right, `LOCKS` bottom-right) and the left has two text lines, so more than four labels compete.
- *Evidence:* `phone-…-04.png`, `desktop-…-04.png` (the thin lines cross each other and the boxes).
- *Fix:* Widen the Stats box to 220 units. Route the counter edges around the boxes, or draw them only to the box edge. Keep `OWNERS 3` and drop the `LOCKS` repeat; move the two text lines into the caption.

**15. Step 5 holds two ideas, an orphan counter and no picture of waiting** (minor)
- *Status:* fixed. A second `fill` waits behind the first with a dashed edge to the same lock ("waits"), the guard shows on the run-time edge, the leftover `LOCKS` counter is gone, and the `Arc::clone` line is its own tag at 15 units in latte ("Arc::clone: 0 allocations"; the pointer-and-count detail is in the caption).
- *Where:* step 5 "A lock is exclusivity checked at run time", both sizes. `RuntimeLock`.
- *What:* The STATIC/RUN TIME comparison is good. But the RUN TIME half has no edge between the hub and `fill`, so "a second caller waits" is not drawn. A `LOCKS 5` counter is left over from step 3 with no reason to be 5 here, and the bottom line, `Arc::clone: 0 allocations, a pointer and a count`, is a different idea in 13-unit taupe on dark (low contrast).
- *Evidence:* `desktop-…-05.png`, `phone-…-05.png`.
- *Fix:* Add a second `fill` waiting behind the first at the hub. Remove `LOCKS 5`. Move the `Arc::clone` line to step 4 or give it its own tag at 15 units in latte.

**16. Step 10's reveal is a 30-unit stub, and its `None` floats** (minor)
- *Status:* fixed. The handle is a labelled chip `2·0` ("fill holds") with a 2 px arrow to slot 2 and `None` on the arrow. The question frame shows slot 2 as `inspect`, gen 0; the swap to `audit`, gen 1, is the reveal (the old `audit gen 1` no longer shows before the answer).
- *Where:* step 10 "Remove a node, reuse its slot", desktop and phone.
- *What:* The only link between `outputs: [2·0]` and slot 2 is a short curve ending at the slot's top edge, in thin latte or dark cherry. The red `None` sits 100 units to the right of it. The question frame already shows `audit gen 1`, so the picture is the same before and after the answer apart from two lines.
- *Evidence:* `desktop-…-10.png`, `desktop-…-10-q.png`.
- *Fix:* Draw the handle as a labelled chip with a 2 px arrow to slot 2 and put `None` on the arrow. Hide `audit gen 1` in the question frame so the swap is the reveal.

**17. Step 12 is crowded at both sizes** (minor)
- *Status:* fixed. The `fix:` line is a fourth line of the code panel (`// fix: let id = buf.id; first`), the chip cells are 46 units wide on a 50-unit step (`ptr`, `cap` and `len` no longer touch), the thread boxes are wider and the channel label clears them; `SIZE 32 B` is the one serif number.
- *Where:* step 12 "Sending is moving".
- *What:* Nine labels (two thread names, channel, `moved`, `E0382`, `64 KiB buffer`, the four chip fields, the `fix:` line and `SIZE`) share one drawing. On phone `ptr`, `cap` and `len` touch, and the `fix:` line and `SIZE 32 B` sit on a diagonal that leaves the right column half empty. The code panel's highlighted line is the error line but the panel does not say so.
- *Evidence:* `desktop-…-12.png`, `phone-…-12.png`.
- *Fix:* Move the `fix:` line into the code panel (a fourth line, `let id = buf.id;`). Make the chip fields 8 units wider, or show only `ptr cap len`. Keep `SIZE 32 B` as the one serif number.

**18. Step 15 has a label under a padlock and invisible channel stubs** (minor)
- *Status:* fixed. "unbounded channels" no longer sits under the padlock; the channels are 55 units long in the shared row and the ring boxes are 96 wide with 30-unit channels with arrowheads; the three ring buffers are drawn as chips next to `RING` after the answer; a stalled `consume` is at 60 percent (the shared `grey` is now 0.6).
- *Where:* step 15 "Stage 3 stalls. How many buffers?", desktop and phone.
- *What:* The padlock glyph overlaps the end of "unbounded". In the ring, the channels between boxes are about 12 units long and unreadable on phone, and `consume` is dimmed to 40 percent contrast. The three ring buffers are not drawn, so "3" is only a number.
- *Evidence:* `desktop-…-15.png`, `phone-…-15.png`, `phone-…-15-q.png`.
- *Fix:* Move "unbounded" left of the arrow. Widen the ring spacing, or draw the ring as a small loop with three chips. Dim `consume` to 60 percent, not 40.

**19. Step 17's owner-thread and `Arc<Mutex>` thumbnails look the same** (minor)
- *Status:* fixed. One set of glyphs (`Glyph`, 120 x 70) is shared by step 17 and the recap: the owner thread is the four-box ring with arrowheads in both, and `Arc<Mutex<T>>` is a box with a padlock and spokes; its cost line is in `C.cherryText`.
- *Where:* step 17 "Pick the shape by the data", both sizes (`Thumb`, kinds 2 and 3).
- *What:* Both are a central box with six spokes. Only the spoke colour (latte against caramel) and the box size differ. The learner is asked to choose between exactly these two. Step 22 draws the owner thread as a ring, which is a third look for the same shape.
- *Evidence:* `desktop-…-17.png`, `desktop-…-22.png`.
- *Fix:* Use the step 22 ring thumbnail for the owner thread in both steps, and a lock glyph on the `Arc<Mutex>` box. Colour the cost line of the anti-pattern in cherry text.

**20. Step 18 draws two unlabelled doodles** (minor)
- *Status:* fixed. The dots are labelled "8 threads", the ticks "lock held briefly", and a third box `owner task` hangs under the mutex with a caramel arrow; the vertical gap is closed (`h` 340, down from 400).
- *Where:* step 18 "When Arc<Mutex<T>> is the right shape", both sizes.
- *What:* Eight dots into `Arc<Config>` and three tick marks on a line below `Arc<Mutex<Counts>>` are not labelled (eight what? ticks of what?). The Tokio guide's third point, moving state into an owner task, is in the caption but not drawn. A tall empty gap separates the drawing from the last line.
- *Evidence:* `desktop-…-18.png`, `phone-…-18.png`.
- *Fix:* Label the dots "8 threads", the ticks "lock held briefly", and add a small third box "owner task" with an arrow from the mutex box. Close the vertical gap.

**21. Step 19's code is loose text, and the phone answer frame drops the lines that explain the error** (minor)
- *Status:* fixed. Step 19 uses the `Code` panel (the borrow and the later use highlighted) on desktop; the empty `channel` stub now carries an arrow. On a phone the question shows the five-line code and the answer draws the three lines that matter (`let view`, `tx.send`, `println!`, the send in cherry) above the picture, so E0505's cause is on screen when the explanation is read.
- *Where:* step 19 "Prove it · 1 of 3".
- *What:* The five code lines are drawn as large bare text in the drawing, not in the code panel that steps 1, 3, 6, 9, 11 and 12 use. On phone the answer frame keeps only `tx.send(buf).unwrap();`, so `let view = &buf.bytes[..5]` and the later `println!` that cause E0505 are not on screen when the learner reads the explanation. The `channel` double line at the right has nothing in it.
- *Evidence:* `desktop-…-19.png`, `phone-…-19.png`.
- *Fix:* Use the `Code` panel with the borrow and the later use highlighted, and drop the empty `channel` stub or put the buffer chip in it.

**22. Step 20 shows four unlabelled boxes** (minor)
- *Status:* fixed. The ring buffers are drawn as three chips labelled `BUFFERS 3, all past fill` next to the code (desktop and phone); the 2 x 2 group is deleted.
- *Where:* step 20 "Prove it · 2 of 3", desktop and phone.
- *What:* A 2 x 2 group of boxes (one dimmed) at the lower right is never named. The learner can't tell if they are buffers (there are three) or stages. `BUFFERS 3` is on the left, far from them.
- *Evidence:* `desktop-…-20.png`, `phone-…-20.png` (`ProveBlock`, four `cell` rects).
- *Fix:* Draw three buffer chips and label them, or delete the group.

**23. Step 21's dependency lines cross the `j3` label** (minor)
- *Status:* fixed. Edges end at the box borders with arrowheads; `done` sits on its own line under the faded `j3`; the question frame no longer has a line through a label.
- *Where:* step 21 "Prove it · 3 of 3", question frame, both sizes.
- *What:* The four edges are drawn centre to centre and run through the faded `j3` box and its text. They have no arrowheads, so the direction of dependency is lost.
- *Evidence:* `desktop-…-21-q.png`, `phone-…-21-q.png`.
- *Fix:* End the edges at the box borders, add arrowheads, and put `j3` and `done` on a line of their own.

**24. The recap gives the anti-pattern the same weight as the three fixes** (minor)
- *Status:* fixed. The `Arc<Mutex<T>>` row is in latte with a cherry cross over its glyph; the three fixes are crema with their glyphs (the same ones as step 17).
- *Where:* step 22 "In one breath", both sizes.
- *What:* Four equal rows. The `Arc<Mutex<T>>` row, the anti-pattern, is in the same crema and caramel as the shapes that replace it, so a glance does not say which is the problem and which are the fixes. The `Next:` handoff is clear. The owner-thread icon differs from step 17's.
- *Evidence:* `desktop-…-22.png`.
- *Fix:* Draw the first row in latte with a cherry cross, and the three fixes in crema with caramel icons.

**25. Phone predict reveals start below the fold with no cue** (minor)
- *Status:* not fixed: shared code is locked, logged for the owner. The `ReelPlayer.tsx` change (scroll the explanation into view, or fade the caption's bottom edge) belongs to the owner of `site/src/reels`.
- *Where:* steps 3, 7, 10, 15, 19, 20 and 21 on phone after the learner answers.
- *What:* The caption area scrolls (`overflow-y-auto`), but the explanation box begins near the control bar and is cut after one or two lines. Nothing says there is more. The highlighted option does give the answer, but the reason is the teaching.
- *Evidence:* `phone-…-03.png`, `-07.png`, `-15.png`, `-19.png`, `-20.png`, `-21.png`.
- *Fix:* In `ReelPlayer.tsx` scroll the explanation into view when an answer is chosen, or fade the caption's bottom edge. This is a site change, outside this topic's files.

**26. A 250 px empty band sits above many phone drawings** (minor)
- *Status:* partly fixed. In this topic's files the drawings that were height-limited are now sized to the frame (step 15 `h` 238, step 4 330, step 6 290, and the predict steps above), so the 600-unit width fills the phone more often. The vertical alignment of a drawing in the frame is `Stack`, `Svg` and `ReelPlayer` behaviour: not fixed: shared code is locked, logged for the owner.
- *Where:* steps 2, 5, 8, 9, 11, 13, 14, 16 on phone.
- *What:* The drawing is centred in a frame that starts under the nav, with 200 to 250 px of empty space above and the drawing at about 0.6 scale, while the caption is cut to three lines below. The room could be used by a larger drawing.
- *Evidence:* `phone-…-13.png` (from y = 160 to 450 empty), `phone-…-09.png`, `phone-…-14.png`.
- *Fix:* Align drawings to the top of the visual frame, or use `h` values that match the canvas, so the 600-unit width fills the screen at the largest size.

**27. The phone capture of step 1 was taken mid-transition** (minor)
- *Status:* partly fixed. In this topic's files `Problem` now has a portrait variant (the code first, then the map in its place), so the phone has room for the 320-unit map (`phone-…-01.png` shows it). The test's 700 ms wait before the phone capture of step 1 and the `ReelPlayer` blur transition are in shared code: not fixed: shared code is locked, logged for the owner.
- *Where:* `phone-ownership-topology-over-shared-01.png`.
- *What:* The frame shows the code panel and a blurred, unreadable caption with no map, because `ReelPlayer` animates the first step in with `blur(10px)` over 0.5 s. I could not judge step 1 on phone, and nobody reading the screenshots can. Desktop step 1 is fine except that the bridge, caption and prerequisites button stack up to about 134 words before the first interaction.
- *Evidence:* `phone-…-01.png` against `desktop-…-01.png`; `ReelPlayer.tsx` lines 285 to 301.
- *Fix:* Have the test wait 700 ms before the phone capture of step 1, and re-check the map on phone (the `Problem` scene has no portrait variant, so its code panel plus a 320-unit map will need about 664 px).

**28. The domain tab "Rust Systems Engineering" is clipped at phone width** (minor)
- *Status:* not fixed: shared code is locked, logged for the owner (`ReelFeed.tsx`: scroll the active tab fully into view, or shorten the label on phone).
- *Where:* every phone frame, top nav.
- *What:* The active tab reads "Rust Systems Engin" and runs under the right button. This is site chrome, not this topic, and is logged only so it is not lost.
- *Evidence:* every `phone-…png`.
- *Fix:* In `ReelFeed.tsx` scroll the active tab fully into view, or shorten the label on phone. Outside this topic's files.

### Summary

- **Major (10):** 1 step 13 final frame empty; 2 step 9 final frame dissolved; 3 step 11 mechanism undrawn; 4 step 14 final frame is the start state; 5 step 16 two ideas and a contradictory bar; 6 step 6 final frame fades the tree; 7 step 7 no mechanism and a leaking question frame; 8 tiny phone text in steps 10, 19, 20, 21; 9 step 3 phone code clipped; 10 narration 30 to 65 seconds over a 5-second animation.
- **Minor (18):** 11 to 28.
- **Fix order:** 1, 2, 4, 6 (final frames) first, then 8 and 9 (phone legibility), then 5, 7, 10, 3.
