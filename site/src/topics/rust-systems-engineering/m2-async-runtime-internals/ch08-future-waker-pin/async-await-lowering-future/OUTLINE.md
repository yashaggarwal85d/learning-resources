# Outline: async/await lowering and future size (`rust.async-await-lowering-future`)

Chapter 8, topic 25 (second of four). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Describe what `async fn` lowers to: an enum of suspension states, one per `.await` point, each holding exactly the locals still live there — and measure a real future's size to make that concrete rather than asserted.
2. Explain why a future that holds a sizeable local across an `.await` point is measurably larger than one that does not, and why that size is a real cost (a `memcpy` every time the future moves) rather than a style concern.
3. Reproduce the `!Send` propagation rule directly: a `!Send` value held across an `.await` point makes the entire future `!Send`, shown by the exact compiler diagnostic.

## Reel steps (storyboard)

1. **"Call an async function — what comes back?"** (predict) — hook, folded into the first predict. `fig`: `async fn small_future()`, called but not awaited. Options: the function's body starts running / a value comes back, and nothing has run yet (correct) / it blocks until the body finishes.
2. **"A value. The same laziness as last topic, by a different name"** — `fig`: `let f = small_future();` next to topic 24's "constructing a future does no work." NO takeaway (first non-predict step after a predict step).
3. **"So what is that value, exactly?"** — `fig`: the Rust Reference's own words, quoted directly: an anonymous type, roughly an enum with one variant per await point. Takeaway: "async fn lowers to an enum with one variant per await point, each variant holding exactly the locals still live there."
4. **"Does holding a bigger local across the same await point change the future's size?"** (predict) — `fig`: two async functions, identical except one holds a four-kilobyte array across its one `.await`. Options: no, the await point is the same / yes, the enum variant now has to hold that local too (correct) / only if the local is boxed.
5. **"Measured, not assumed: two bytes versus over four thousand"** — `fig`: `future_size.rs`'s real measured sizes. Takeaway: "A future's size is fixed by what its generated enum has to hold across its await points — a real, measured cost, not a style concern."
6. **"That size difference is a real memcpy every time the future moves"** — `fig`: the size numbers reframed as a moving cost. Takeaway: "Moving a large future (into a Box, into a spawned task) copies every byte that future's suspension-state enum holds — the size this topic measured is the memcpy this topic is paying."
7. **"Hold something not safe to move between threads across an await — still fine?"** (predict) — `fig`: `Rc::new(5)` held across the same `ready(()).await`. Options: yes, Send only applies to the function itself / no, the generated future inherits it from whatever it holds (correct) / only if Rc is cloned.
8. **"rustc's own diagnostic: this future cannot be sent between threads"** — `fig`: `not_send_across_await.rs`'s real compile error, the exact message. Takeaway: "Holding a value that is not Send across an await point makes the whole generated future not Send — Send is an auto trait, inherited structurally from every live local."
9. **Recap** — async fn lowers to a real enum, one variant per await point; that enum's size is the sum of what each point holds, and a bigger local there is a real, measured, movable cost; Send propagates into the generated future exactly the way it propagates into any other type holding the same fields. Handoff: the next topic asks what happens when one of those held locals ends up pointing at another one — right next to it, in the same enum.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 4.
- Third prediction: step 7 — the chapter's Send-propagation claim, directly testable with the opposite answer from steps 1/4, kept as a genuine prediction rather than folded into a reveal.
- Surprising fact: step 5 (a real, measured size difference, not a described one).
- Takeaways: steps 3, 5, 6, 8 (four — step 2 deliberately has none, the test-harness rule).
- Recap: step 9.

## Claims list

| Claim | Source |
|---|---|
| Executing an async block, like a closure, produces an anonymous type and runs nothing | `doc.rust-lang.org/reference/expressions/block-expr.html` (quoted) |
| The future type rustc generates is roughly an enum with one variant per await point, each variant holding the data needed to resume from that point | `doc.rust-lang.org/reference/expressions/block-expr.html` (quoted) |
| A future with nothing held across its one await point measures a few bytes; an otherwise-identical future holding a four-kilobyte local across the same await point measures at least that much larger | `examples/future_size.rs` (executed, both sizes measured) |
| An await expression suspends at `poll`'s `Pending` result and resumes execution from that exact point on the next poll | `doc.rust-lang.org/reference/expressions/await-expr.html` (quoted) |
| Send is an auto trait, automatically implemented when the compiler determines it is appropriate, never written by hand | `doc.rust-lang.org/std/marker/trait.Send.html` (quoted) |
| Holding an Rc (the standard library's own canonical non-Send example) across an await point makes the whole generated future not Send, with the exact compiler diagnostic naming the live-across-await value | `examples/not_send_across_await.rs` (executed, fails to compile with that exact message) |

## Concept ledger

- `introduces`: `async-state-machine-lowering`, `not-send-future-propagation` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `future-laziness-backpressure`, `waker-contract`, `send-auto-trait`
- `declared`: []

## Bridge and handoff

- Bridge: topic 24's own handoff line, reused verbatim: "A future that does nothing until polled, and a waker that promises to ask again — that's the whole contract, proven by a loop with no hidden thread in it anywhere. The next question is what the compiler actually builds when it turns ordinary-looking async code into exactly this shape."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "That state machine is just an enum, holding exactly the locals still alive at each pause point — simple, until one of those locals points at another one sitting right next to it in the same enum. What happens when the whole thing moves?"
