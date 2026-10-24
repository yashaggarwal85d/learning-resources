# Outline: Unsafe contracts and safety comments (`rust.unsafe-contracts-safety-comments`)

Chapter 30, topic 77 (first topic, opens Chapter 30). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, documented unsafe function (a real `# Safety` contract) and a real safe guard that checks its own precondition before ever delegating to it, since this topic must never execute a real invalid case to demonstrate undefined behavior.
2. Measure that every real call within the documented contract genuinely returns the correct value.
3. Measure that the real safe guard genuinely never invokes the unsafe function outside its own contract, which is exactly what soundness ("no safe caller can trigger UB") requires.
4. Measure, without ever actually calling the unsafe function out of contract, that an unguarded caller's own logic would genuinely have violated the identical documented contract for the identical invalid input.
5. State, from the Rust Reference's own "Behavior considered undefined" page and from the Rust API Guidelines' own documentation page, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real safety contract and a real safe guard; this topic never executes a real invalid case, per the chapter plan's own A.3.

## Reel steps (storyboard)

1. **"A function is marked unsafe and ships with a documented contract. Does calling it from behind a real safe guard that checks the contract first ever reach undefined behavior?"** (predict, hook) — `fig`: a locked door, a guard in front of it. Options: yes, genuinely; unsafe code can always misbehave / no, genuinely; a guard that truly enforces the contract keeps it sound (correct) / only if the guard is also marked unsafe.
2. **"Measured: every real call that genuinely satisfies the documented contract returns the genuinely correct value, every time"** — `fig`: the real, measured in-contract results. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now send the guard three requests outside the real contract. Does it still let any of them reach the unsafe code underneath it?"** (predict) — `fig`: three requests, a guard, a locked door. Options: yes, it lets some through anyway / no, genuinely; every one is rejected before the unsafe code ever runs (correct) / only if the request count is small.
4. **"Measured: the real guard genuinely rejected every one of the three out-of-contract requests; the unsafe function's own real call counter never moved for them"** — `fig`: the real, measured call counter. Takeaway naming exactly what soundness requires of a safe guard.
5. **"Suppose a different caller skipped the guard and called the unsafe function directly, with the identical invalid inputs. Would that genuinely violate the documented contract?"** (predict) — `fig`: the identical inputs, no guard this time. Options: no, the function would genuinely handle it anyway / yes, genuinely; those inputs are exactly outside the contract's own documented bound (correct) / only for the largest of the three inputs.
6. **"Measured: the identical invalid inputs genuinely violate the real documented contract, the exact real bound the guard above was built to enforce"** — `fig`: the real, measured contract check. Takeaway naming exactly why "my callers don't" is weaker than a real, enforced guard.
7. **"The Rust Reference's own words and the Rust API Guidelines' own words both state this exact rule directly: unsafe code is sound only if no safe caller can ever trigger undefined behavior through it, and a real 'Safety' section is how that contract gets written down. Does this topic's own guard measure exactly that rule?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). Takeaway naming the real discipline both sources agree on (a third takeaway, required by DESIGN.md → What makes a reel engaging).
8. **Recap** — a documented safety contract plus a real guard that genuinely enforces it is what makes unsafe code sound: no safe caller, not even one handed the exact inputs that would break it, can ever reach undefined behavior through it.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Step 7 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (the guard's own enforcement is total, not partial) and step 6 (the identical invalid input really would have broken an unguarded caller).
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; the recap itself, step 8, carries the closing statement instead of a fourth takeaway).

## Claims list

| Claim | Source |
|---|---|
| Rust code is incorrect if it exhibits undefined behavior, including inside unsafe blocks and functions; unsafe only moves the responsibility for avoiding it onto the programmer | The Rust Reference (quoted) |
| unsafe code is sound only if no safe code interacting with it can trigger undefined behavior; if safe code can misuse it to cause UB, it is unsound | The Rust Reference (quoted) |
| unsafe functions should be documented with a "Safety" section explaining every invariant the caller is responsible for upholding | Rust API Guidelines (quoted) |
| std::ptr::read's own real Safety section states exactly why the function is unsafe: it semantically moves a value out of a pointer without preventing further use of it | Rust API Guidelines (quoted) |
| every in-contract call genuinely returns the correct value | `examples/runtime-demo/src/safety_contracts_bound_what_a_caller_can_trigger.rs` (executed, measured) |
| the real safe guard genuinely never invokes the unsafe function outside its own documented contract | `examples/runtime-demo/src/safety_contracts_bound_what_a_caller_can_trigger.rs` (executed, measured) |
| an unguarded caller's own logic would genuinely violate the identical documented contract for the identical invalid input | `examples/runtime-demo/src/safety_contracts_bound_what_a_caller_can_trigger.rs` (executed, measured) |

## Concept ledger

- `introduces`: `safety-contracts-bound-what-a-caller-can-trigger` (per `CHAPTER.md` §A.7's concept table)
- `uses`: [] (this topic opens Chapter 30 and changes subject to soundness itself, per the chapter plan's own A.7)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "a proof obligation unsafe code itself carries, one no benchmark or profiler can discharge on its own."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A safe guard decides whether a caller is even allowed to reach the unsafe code; it says nothing yet about what, exactly, makes a value inside that unsafe code valid or invalid once a caller does reach it."
