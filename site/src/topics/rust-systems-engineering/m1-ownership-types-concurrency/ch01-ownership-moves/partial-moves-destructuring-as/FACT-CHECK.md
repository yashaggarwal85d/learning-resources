# Fact-check: Partial moves and destructuring as transfer (2026-10-12, against raw source texts)

Adversarial re-check (ROUTINE.md 2.3) of `OUTLINE.md` (claims list, every storyboard's real values, explains and captions, Deep dive plan, examples table) by an agent that did not write the plan. Each claim was checked against the fetched texts in `sources/` (not only `SOURCES.md`); `node scripts/sources.mjs check` passes (341 quotes, 0 problems, after the additions below). Every example in `examples/` was compiled and run with `--edition 2024` (and 2021 for `me_*`) on **rustc 1.97.0 (2d8144b78 2026-07-07)**, the plan's toolchain, and on **rustc 1.99.0 (b940084d7 2026-09-28)**, current stable on this date (installed with `rustup toolchain install 1.99.0`; the std docs cited are 1.99.0). Stdout was identical on both; every asserted error header was identical; two help/note texts differ (claim 71).

## Claims

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | E0507 in `drop`, rustc suggests clone | Confirmed (both versions) | `guard_e0507.rs` |
| 2 | clone 1,001 allocs / 65,601,536 B / 1,000 deallocs; take 1 | Confirmed; = 1001 × 65536 | `guard_clone.rs` (both) |
| 3 | `Pool::get` only allocator; 1 alloc for 1,000; `Header { kind: 7, len: 256 }` | Confirmed; `pipeline.rs` is CHAPTER.md A.3 verbatim (diffed; only the first comment line differs) plus Frame/Trace/message | `base.rs` |
| 4 | sizes Buf 32, Header 8, Frame 40, Option<Buf> 32, PooledBuf 40 | Confirmed (x86_64; also Option<Option<Buf>> 32) | `guard_clone.rs`, `variants.rs` |
| 5 | Movable places list | Confirmed. Note: the FLS 15.5 list has no `Box` entry; the `*b` case rests on the Reference | ref-expressions.txt `[expr.move.movable-place]`; fls-ownership.txt 15.5:6–9 |
| 6 | Moving out of a local deinitializes it until reinitialized | Confirmed | Reference `[expr.move.deinitialization]`; `partial.rs` reinit |
| 7 | Move changes owner; Copy copies | Confirmed | Reference `[expr.move.copy]`; FLS 15.5:5 |
| 8 | Partially moved struct unusable as a whole; remaining/Copy parts usable | Confirmed | RBE; Reference `patterns.ident.binding.mixed`; `e0382_partial.rs` |
| 9 | Copy only if all components are Copy | Confirmed | std Copy; E0382 page |
| 10 | Only initialized fields dropped | Confirmed; step 4 explain now quotes the Reference's partial-move comment ("After a partial move, only the remaining fields are dropped.") instead of the "partially initialized" sentence | ref-destructors.txt; `partial.rs` |
| 11 | Locals reverse, fields in declaration order | Confirmed | ref-destructors.txt |
| 12 | Per-field drop flag in MIR | Confirmed: one bool local set `const false`/`const true`, `switchInt` on it before `drop((_2.1: T))`, unconditional `drop((_2.0: T))`. Same shape on 1.99.0 (block numbers differ, so asserting by pattern is right). The Nomicon speaks of variables; per-field is the measurement | `flag_mir.rs --emit=mir` |
| 13 | `*boxed` moves; Vec index, Rc deref, `&` field are E0507 | Confirmed; exactly 3 errors, "aborting due to 3 previous errors" | `which_moves.rs` |
| 14 | Box allocation freed at scope end | Confirmed, **corrected**: step 6 said the box's "40 bytes"; `boxed` there is a `Box<Buf>`, 32 bytes (40 is `Box<Frame>`). Added: refill `*boxed = …` costs 0 allocs/deallocs; reading before refill is `borrow of moved value: `*boxed`` | `box_move.rs`, new `box_refill.rs`, `box_use_after.rs` |
| 15 | Rc gloss; `try_unwrap`/`into_inner` need exactly one strong ref | Confirmed (both methods carry the quoted sentence) | std-rc.txt lines 526–548 |
| 16 | E0509 for field move and destructuring | Confirmed | `e0509_*.rs` |
| 17 | Why: destructor may use fields; single units; `&mut self` | Confirmed | E0509 page; Nomicon destructors; Book 15.3 |
| 18 | Rule is about the container | Confirmed **by measurement only**: the Reference ("Fields of a place expression which can be moved out of and don’t implement Drop") and FLS ("…whose type does not implement…") are grammatically ambiguous. rustc: E0509 names the container type; `Parts` of `Trace`s moves; a field out of `Box<PooledBuf>` is E0509. Step 6 explain reworded ("a field of a movable struct that has no `Drop` itself") | `partial.rs`, new `box_drop_field.rs` |
| 19 | Copy field of a Drop type readable | Confirmed | `drop_copy_field.rs` |
| 20 | E0509 fix is `ref`, which only borrows | Confirmed; `ref` on a Drop type compiles and leaves the guard intact (red team) | E0509 page; `ref_fix.rs` |
| 21 | Moving a member out of `&mut` struct is E0507; put something back | Confirmed | E0507 page; `e0507_mut.rs` |
| 22 | E0507 fixes; Fn/FnMut | Confirmed; red team: an `FnMut` closure moving a capture gives `cannot move out of `b`, a captured variable in an `FnMut` closure` (1.99.0) | E0507 page |
| 23 | E0507 even if refilled next line; match names the variant | Confirmed | `e0507_mut.rs`, `e0507_match.rs` |
| 24 | Owner gets value back (reasoning); panic illustration | Sound as labelled reasoning: unwinding between move and refill would drop the owner's struct with a hole | n/a |
| 25–29 | `Option::take`, `Option::replace` (1.31.0), `take_if` (1.80.0), `mem::take` (`T: Default`, 1.40.0), `mem::replace` ("Neither value is dropped"), `mem::swap` | Confirmed against std 1.99.0 pages, version lines included | option.txt, take.txt, replace.txt, swap.txt |
| 30 | Vec::new/Default and String::new don't allocate | Confirmed (docs for Vec::new, Vec::default, String::new; String::default is "Creates an empty String." only, capacity 0 measured) | std-vec.txt 6632–6636; `idioms.rs` |
| 31 | idioms 0/0; replace with `with_capacity` 1 | Confirmed (the 1 dealloc in that line is the explicit `drop(r)`, not `replace`) | `idioms.rs` |
| 32 | pop/swap_remove/remove/drain semantics | Confirmed | std-vec.txt |
| 33 | into_iter takes ownership | Confirmed | Book 13.2 |
| 34 | take trap 1,000 allocs, 326,275 B | Confirmed = 65,536 + 999 × 261; red team: handing the bytes back (`buf.bytes = bytes`) gives 1 alloc, `drain(..)` 0 | `variants.rs`; scratch run |
| 35–36 | Nomicon Option + take; None drops nothing | Confirmed | nomicon destructors lines 169–192 |
| 37 | `into_inner` + take: drop finds None; 1 alloc | Confirmed | `errpath.rs` |
| 38 | `?` path 100 vs 1; 200 vs 1 | Confirmed (1 initial + 99 or 199 replacements) | `errpath.rs`, `prove6.rs` |
| 39 | Drop runs during unwinding | Confirmed; the cited Reference sentence only covers the *non*-unwinding case, so a direct std quote was added: "because drop() may itself be called during unwinding due to a panic". Step 14's caption correctly says "unwinding" (not true under `panic = "abort"`) | std-drop.txt line 238 |
| 40 | Leaking is safe | Confirmed | ref-destructors.txt |
| 41–42 | Pattern destructuring, identifier move/copy, `ref`, mixed bindings | Confirmed; red team: mixed move/`ref` on a `Copy` struct leaves it whole ("applies only if the type cannot be copied") | ref-patterns.txt |
| 43 | Struct update moves or copies remaining fields | Confirmed, **refined**: the base is partially moved only when a non-`Copy` field comes from it; `Frame { payload: new, ..frame }` leaves `frame` whole; `..guard` on a `Drop` type is E0509. Caption's example is the moving case, kept; limits go to the Deep dive | new `update_copy.rs`, `update_drop.rs` |
| 44 | Patterns in let/match/if let/while let/for/params | Confirmed; **the plan quoted a `SOURCES.md` "Contents" line (a summary)**; replaced by verbatim sentences ("In a for loop, the value that directly follows the keyword for is a pattern.", "Function parameters can also be patterns.") and the page's headings | book-patterns-places.txt |
| 45 | `_` vs `_x` | Confirmed; added `let _ = frame.payload;` (no move) and `let _ = g;` (guard alive, not dropped) | new `wild_let.rs`; Book Listing 19-21 is `Some(_s)` on `Option<String>` as stated |
| 46 | Default binding mode rules | Confirmed in Reference, RFC 2005 and FLS 5.13:8–12 | `modes.rs` |
| 47–48 | RFC 2005 origin; `as_ref`/`as_mut` | Confirmed | edition guide; option.txt |
| 49–50 | 2021 `mut` reset; 2024 reservations | Confirmed. Reference rule ids corrected in the Deep dive plan: `[patterns.ident.binding.mode-limitations-binding]`, `[…-reference]`, each with `.edition2024` (the plan named a non-existent `patterns.ident.binding.mode-limitations`) | ref-patterns.txt 419–451 |
| 51 | The three 2024 error texts | Confirmed on 1.97.0 and 1.99.0 | `me_*.rs` |
| 52 | Lint, group, cargo fix rewrite, `edition = "2021"` left | Confirmed, re-measured with cargo 1.99.0: same rewrite `let &Frame { mut header, ref payload } = &frame;`, `edition = "2021"` left although cargo prints `Migrating Cargo.toml from 2021 edition to 2024`. Lint is `allow` by default and in `rust-2024-compatibility` (`rustc -W help`, both versions) | scratch crate |
| 53 | Silent in 2021 without the lint | Confirmed (empty stderr) | `me_mut_short.rs` 2021 |
| 54 | Rust 2024 in 1.85.0 | Confirmed | edition-2024-index.txt |
| 55–56 | Reservations leave space; cargo fix may keep a silent copy | Confirmed / inference stated as such | edition guide; `me_fixed*.rs` |
| 57 | ManuallyDrop: 0-cost, `take` unsafe for drop, prefer `into_inner` (1.20.0), `take` 1.42.0 | Confirmed | manuallydrop.txt |
| 58 | Placeholder guard: 1,000 placeholders, free 1,001, 8 allocs; all 40 bytes | Confirmed. 8 = 1 + 7 growths of the free list (8→1,024); the `GlobalAlloc` page does not say the default `realloc` calls `alloc`, so state only the measurement (as planned). Step 22 explain **reworded**: "`drop` cannot tell" was too strong (an `id == 0` sentinel check could, by unenforced convention); production bullet likewise | `prove3.rs`, `variants.rs`; std-globalalloc.txt |
| 59–60 | Nomicon forecast; `ptr::read` | Confirmed | nomicon; std-ptr-read.txt |
| 61 | Clippy `mem_replace_option_with_none` (1.31.0), `_with_some` (1.87.0), `mem_replace_with_default` (1.42.0): style, warn | Confirmed (master list, "Added in" lines) | clippy.txt 14067–14140 |
| 62 | E0508; array destructuring moves | Confirmed | `e0508.rs`, `modes.rs` |
| 63 | RFC 2005: non-Copy from behind a reference is an error; no `move` keyword | Confirmed | rfc-2005.txt |
| 64 | RFC 2005 Future Extensions | Confirmed; verbatim quotes added; the RFC's `match &x` on `Box<Option<_>>` is still E0308 on stable 1.97.0/1.99.0, while `match *x { Some(y) … }` moves out | rfc-2005.txt 425–436; new `box_match_ref.rs`, `box_refill.rs` |
| 65 | `Drop::pin_drop` nightly (#130494), field projections | Confirmed against std 1.99.0 | std-drop.txt 251–264 |
| 66 | FLS states binding modes (5.13) and passing (15.5) | Confirmed, **with a scope finding**: the FLS covers "the 2021 Edition … as implemented by … rustc version 1.98.0" and its changelog says "The 2024 edition is outside the scope of the FLS". Frontier (e) rewritten to say exactly this (the plan made it conditional on this check) | new sources fls-general.txt, fls-changelog.txt |
| 67 | E0499 at the handoff | Confirmed | `second_guard.rs` |
| 68 | C-CONV `into_` | Confirmed from a freshly fetched API Guidelines page (the plan deferred it to topic 1's copy): `into_` is "owned -> owned (non-Copy types)"; "access to the wrapped value should be provided by an into_inner() method" | api-naming.txt |
| 69 (new) | Refill needs `let mut`; a fully moved struct can't be refilled by field | Measured (the step 5 caption's "`p` must be `let mut`" had no evidence): E0594 / `assign to part of moved value: `p`` (E0382) | new `reinit_notmut.rs`, `reinit_moved.rs` |
| 70 (new) | Copy and Drop exclusive | std quote added: "You cannot implement both Copy and Drop on the same type." | std-drop.txt 147 |
| 71 (new) | Version-dependent diagnostics | 1.97.0 → 1.99.0: `e0507_match` help `consider borrowing here` (`match &slot.buf`) → `consider borrowing the pattern binding` (`Some(ref b)`); `ref_fix` note `Option::<T>::expect` → `std::option::Option::<T>::expect`. Neither is asserted or shown now | both toolchains |
| 72 (new) | 2024 `mut` under `&mut` on a non-Copy binding | Measured: reservation error **and** E0507 in one run (confirms step 18's "E0507 … right for `payload`" note); E17 now asserts both | `me_mutopt.rs` 2024 |

## Red team (edge cases tried; all compiled on 1.99.0, the ones the topic now relies on are in `examples/`)

- `_` binds nothing in `let`, `if let`, `match`: `let _ = frame.payload;` and `let _ = g;` move nothing (`wild_let.rs`); `Some(_)` keeps `slot` (`modes.rs`). Holds.
- Struct update syntax: moves only non-`Copy` fields taken from the base (refinement above); E0509 on a `Drop` base.
- Closures: `FnMut` moving a capture is E0507 (Deep dive one-liner holds); disjoint capture stays out of scope.
- Two-phase borrows: irrelevant to the topic's claims; `pool.put(pool.get())` is E0499 (two-phase only admits shared use), so no line in the plan may suggest that shorthand. Disjoint field borrows `self.pool.put(self.buf.take().unwrap())` inside `drop` compile.
- Box deref move: refill, use-after-move, field out of `Box<Frame>` (ok) vs `Box<PooledBuf>` (E0509), RFC 2005 auto-deref still absent.
- `ref` with `Drop` types: binding `ref buf` on a guard compiles and the guard still returns its buffer; binding `pool` by value alongside is E0509 (`...and here`).
- Option niche: `Option<Buf>` = `Option<Option<Buf>>` = 32; `Option<Frame>` = 40 (target facts; layout is Ch.5).
- `mem::take` on the pooled buffer: confirmed 1,000 allocs; giving the bytes back restores 1; `drain(..)` 0.
- Predict questions re-derived: steps 4, 6, 8, 11, 13, 16, 18, 20, 21, 22 each have exactly one correct option on both toolchains; no wrong option turned out right. Step 18's "E0507 in both editions" is right only for a non-`Copy` field, which the why-tempting note already says (now measured).
- Wording fixes: step 11 explain "The call moved nothing" contradicted itself (it moves the `Vec` handle) → "copied no bytes"; production bullet "the most common source of a hidden per-message allocation" had no source → removed.

## Corrections applied to `OUTLINE.md`

1. Header: current stable 1.99.0 recorded; all examples re-run on both versions; 9 examples added (61 files).
2. Step 4 explain: quote the Reference's partial-move comment.
3. Step 5 real values: `let mut` requirement and fully-moved refill error, measured (E23).
4. Step 6 explain: "40 bytes" → "32-byte allocation"; container wording; real values point at `box_refill.rs`.
5. Step 8 / step 9 real values: version-dependent note and help flagged, not shown or asserted; E8 asserts the `e0507_match` header only.
6. Step 11 explain: "moved nothing" → "copied no bytes".
7. Step 15 real values: struct-update limits (E24).
8. Step 16 real values: `let _` cases (E24); topic 2's `let _` lesson is about a temporary.
9. Step 18 / 19 real values: 2024 double error for a non-`Copy` field; cargo 1.99.0 re-measurement; lint default level.
10. Step 22 explain and the production "placeholders" bullet: sentinel nuance.
11. Deep dive internals: container reading stated as rustc's behaviour; FLS has no `Box` entry; refill limits; `Box` refill/use-after/`Box<PooledBuf>`; struct-update limits; `match` help version note; correct Reference rule ids; FLS 2021-only scope; `let _` cases.
12. Production: "most common source" claim removed.
13. Frontier (b): verbatim RFC wording plus the stable E0308 measurement; (e): rewritten from the FLS scope statement.
14. Sources line: re-check on 1.99.0; add API Guidelines and FLS scope pages.
15. Examples table: E8 loosened; E17 adds `me_mutopt` E0507 under 2024; E21 rewrite marked required (hard-coded `1`); new E22–E24.
16. Claims 5, 14, 18, 39, 43, 44, 45, 64, 66, 68 updated; claims 69–72 added; expert-list rows 34, 35 extended; Progress ticked for 2.2 sources and 2.3.

Examples added (each run on both toolchains with the outputs in E22–E24): `box_refill.rs`, `box_use_after.rs`, `box_match_ref.rs`, `box_drop_field.rs`, `reinit_notmut.rs`, `reinit_moved.rs`, `update_copy.rs`, `update_drop.rs`, `wild_let.rs`.

`SOURCES.md` additions (all pass `sources.mjs check`): Book 19.1 (two sentences), RFC 2005 (Future Extensions, two), Drop in std::ops (Copy/Drop exclusive; unwinding), new sections Naming - Rust API Guidelines, 1. General - FLS, E. Changelog - FLS.

## Open items

1. **Toolchain.** The machine's default `stable` is 1.97.0; current stable is 1.99.0 (also installed now). The run should decide which one `examples.py` uses and name it in the Deep dive's Sources line; every asserted string in the table holds on both.
2. **Topic 2 seam** (not this topic's file): `raii-drop-order-leak/OUTLINE.md`'s production line says "`let _ = guard;` releases at once", which contradicts its own step explain ("`let _ = g;` where `g` is already a binding moves nothing") and this topic's measurement (`wild_let.rs`). Flag for the release seam check.
3. `prove5_ok.rs` must be rewritten as E21 says (it prints a literal `vec_alloc_for_bufs2=1` and subtracts a hard-coded 1).
4. No source states that `GlobalAlloc`'s default `realloc` calls `alloc`; the "8 allocations = 1 + 7 growths" reading must stay a measurement, not a documented rule.
