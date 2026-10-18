---
id: rust.partial-moves-destructuring-as
title: Partial moves and destructuring as transfer
---

<section data-section="outcomes">

## After this topic you can

- **Move a field out of a struct and state exactly what is dropped at scope end, and when.** The moved field dies with its new owner; the struct drops only its still-initialized fields, in declaration order, at its own scope end; a field moved on only one path gets its own drop flag; a refilled field makes the struct whole again; `*b` moves out of a `Box`.
- **Explain E0509 and E0507 and fix each without cloning.** A type with `Drop` is a single unit because `Drop::drop` gets `&mut self` and may read every field; a borrower may never leave a hole. Fix with an `Option` field and `take`, with `mem::take`/`mem::replace`/`mem::swap`/`Option::replace`, or with an owning removal (`pop`, `swap_remove`, `drain`), and know what each costs (measured: 0 allocations, and the capacity trap of `mem::take` on a pooled `Vec`).
- **Write a RAII guard that hands its contents back.** `PooledBuf` returns its `Buf` to the `Pool` in `Drop` via `Option::take`, hands it out with `into_inner(mut self)`, and keeps the pool whole on the `?` error path (measured: 100 allocations for 100 errors by hand, 1 with the guard).
- **Predict whether each binding in a pattern moves, copies or borrows.** That includes default binding modes under match ergonomics (`&frame` binds `&Header` and `&Buf`), `_` against `_b`, struct update syntax, and Rust 2024's three reservations (`mut`, `ref`/`ref mut`, and `&`/`&mut` under implicit borrowing), and migrating a 2021 pattern that silently copied.

</section>

<section data-section="internals">

## Into the internals

Everything measured here was run with rustc 1.97.0 (2d8144b78 2026-07-07) and again with rustc 1.99.0 (b940084d7 2026-09-28) on x86_64 Linux, edition 2024 unless a lab says both editions; the standard library documentation quoted is version 1.99.0. The programs are in `examples/*.rs` and are compiled, run and asserted by `examples.py`. Sizes (`Buf` 32 bytes, `Header` 8, `Frame` 40, `Option<Buf>` 32, `PooledBuf` 40) are facts of this target, not layout rules; those are Chapter 5.

### What may be moved out of, and what is dropped after

A move takes the value out of a *place expression*. The Reference lists the only places you may move out of: variables that are not currently borrowed, temporaries, "fields of a place expression which can be moved out of and don't implement Drop", and the result of dereferencing an expression of type `Box<T>` that can itself be moved out of. The FLS says the same in its passing conventions (chapter 15): "A value of a move type is passed by move. Passing by move changes the owner of the value", and a place may be passed by move when it is a variable that is not borrowed, a temporary, or "a field of a place expression that can be passed by move and whose type does not implement the core::ops::Drop trait". The FLS list has no `Box` entry; the `*b` case rests on the Reference alone.

Both sentences can be read grammatically in two ways (whose `Drop` counts?), and rustc settles it: the rule is about the **container**. `Parts { head, body, tail }` has no `Drop`, so a field of it can be moved out even though the field's own type (`Trace`) implements `Drop`; `Buf` has no `Drop` while its `Vec<u8>` does. E0509 always names the container's type, and a field out of a `Box<PooledBuf>` is E0509 too (measured, `box_drop_field.rs`).

A `Copy` field is copied, not moved, so a partial move "applies only if the type cannot be copied" (Reference). A type can be `Copy` only if all its components are (std `Copy`). After `let payload = frame.payload;`, `frame.header` is still readable, and `frame` as a whole is not. Measured, the three partial forms of E0382:

```text
error[E0382]: use of partially moved value: `frame`
  let payload = frame.payload; // move        value partially moved here
  send(frame);                 // E0382       value used here after partial move
  = note: partial move occurs because `frame.payload` has type `Buf`, which does not implement the `Copy` trait
error[E0382]: borrow of partially moved value: `frame`        (e0382_pattern.rs, help: borrow this binding in the pattern to avoid moving the value)
error[E0382]: borrow of partially moved value: `slot`         (wild_move.rs, help: if let Some(ref _b) = slot {})
```

What is dropped afterwards: "If a variable has been partially initialized, only its initialized fields are dropped" (Reference, whose `partial_move` example comments "After a partial move, only the remaining fields are dropped"). The traces, from `partial.rs`, show the moved field dying with its new owner:

```text
partial: ["moved", "body", "head", "tail"]
early: ["body", "after-drop", "head", "tail"]
reinit: ["whole", "head", "body2", "tail", "body"]
destructure: ["destructured", "body", "head", "tail"]
```

`early` is `drop(p.body)`: a moved field dropped at once. `destructure` shows that pattern bindings are locals, so they drop before the struct's remainder. A moved-out *local* is deinitialized "until it is reinitialized" (Reference); a partly moved struct can be refilled field by field (`p.body = Trace("body2");`), but only if `p` is `let mut` (otherwise `error[E0594]: cannot assign to `p.body`, as `p` is not declared as mutable`), and a *fully* moved struct cannot be refilled that way (`error[E0382]: assign to part of moved value: `p``).

`Box` is the one pointer you can move out of. Moving `*boxed` (or a field out of a `Box<Frame>`) compiles; the box's own allocation (32 bytes for a `Box<Buf>`, 40 for a `Box<Frame>`) is freed when the box goes out of scope, not at the move: 0 deallocations inside the scope, 1 after it. Until then it can be refilled with `*boxed = ...` (0 allocations, 0 deallocations), and reading it is `borrow of moved value: `*boxed``. Arrays are different: `pair[0]` on a `[Buf; 2]` is E0508 (`cannot move out of type `[Buf; 2]`, a non-copy array`), and the error index's own fix is a destructuring array pattern, `let [first, second] = pair;`, which moves both.

Struct update syntax "moves or copies the remaining fields from the base expression" (Reference), so `Frame { header: h2, ..frame }` partially moves `frame` when a non-`Copy` field comes from the base (E0382 on the next use, `update.rs`). If only `Copy` fields come from it, the base stays whole: `Frame { payload: pool.get(), ..frame }` copies just `header` (`update copied header only: frame whole id=1 next id=2`). And on a base that implements `Drop`, taking a field is E0509 (`update_drop.rs`).

Closures make partial moves too, silently. From edition 2021, a `move ||` that uses `frame.payload` captures only that field: `let c = move || drop(frame.payload); c();` leaves `frame.header` readable (`closure_partial.rs` prints `closure moved only the payload: header kind=7` under 2021 and 2024; under 2018 it is `error[E0382]: borrow of moved value: `frame``). The capture rules themselves are the closures topic's (`move-closures`), so they are only noted here.

### Why a Drop type is a single unit (E0509)

The error index: a struct "cannot be dropped if one or more of its fields have been moved", because "this destructor may use the fields of the struct, so moving out of the struct could make it impossible to run the destructor. Therefore, we must think of all values whose type implements the Drop trait as single units whose fields cannot be moved." Rust By Example: "types that implement the Drop trait cannot be partially moved from, because its drop method would use it afterwards as a whole." The Nomicon gives the signature reason: "taking &mut self means that even if you could suppress recursive Drop, Rust will prevent you from e.g. moving fields out of self."

The measured diagnostics, all for the chapter's `PooledBuf<'p> { buf: Option<Buf>, pool: &'p mut Pool }`:

```text
error[E0509]: cannot move out of type `PooledBuf<'_>`, which implements the `Drop` trait
  let PooledBuf { buf, pool } = guard;        ...and here (pool: a &mut is not Copy, so it would move too)
  help: consider borrowing the pattern binding   (let PooledBuf { ref buf, pool } = guard;)
```

`guard.buf` in a by-value method is E0509 as well (`e0509_field.rs`), and so is `into_inner`'s destructuring (`e0509_into_inner.rs`, help `let PooledBuf { ref buf, .. } = self;`). The `ref` fix is the error index's own, and it is right when you only need to *look* at the field. It is wrong for `into_inner`: `ref buf` binds `&Option<Buf>`, and `expect` takes its receiver by value, so the result is `error[E0507]: cannot move out of `*buf` which is behind a shared reference`, with help `consider calling `.as_ref()``. The same `ref` technique works in the arms of a `match` on a `Drop` enum (the error index's `DropEnum::Fancy(ref fancy_field) =>`). Reading a `Copy` field of a `Drop` type compiles (`id=7 id2=7 name=a`, then `drop lease 7`). `Copy` and `Drop` are exclusive (previous topic), which is why a `Drop` type can never be "copied out" whole.

### Moving out through a borrow (E0507), and the idioms that put something back

The E0507 forms, all measured: behind a shared reference (`cannot move out of `r.payload` which is behind a shared reference`), behind a mutable reference even when the next line refills the field (`cannot move out of `frame.payload` which is behind a mutable reference`), a `match` on a field (`... as enum variant `Some` which is behind a mutable reference`; its help is version-dependent, `match &slot.buf` on 1.97.0 and `Some(ref b)` on 1.99.0, so neither is quoted as *the* fix), an `Rc` (`cannot move out of an `Rc``), a `Vec` index (`cannot move out of index of `Vec<Buf>``, the first topic), a `for b in &bufs` loop body, and the error index's `RefCell::borrow` case with its three fixes (avoid the move, reclaim ownership with `into_inner`, make the type `Copy`). The index also notes it "can also happen when using a type implementing Fn or FnMut, as neither allows moving out of them" (the first topic covered it).

Why: the owner gets the value back when the loan ends and will use or drop it, and anything that can panic between `let old = frame.payload;` and the refill would hand the owner a hole. The Rustonomicon's Exception Safety chapter states the principle for code that creates a transient hole: "Code that transiently creates unsound states must be careful that a panic does not cause that state to be used." and "Generally this means ensuring that only non-panicking code is run while these states exist, or making a guard that cleans up the state in the case of a panic." Its examples are `unsafe`; applying the principle to a field behind a `&mut` (the type has no state for "temporarily empty", so the language allows only single-step swaps) is our reading, not a quoted rule. The error index states the way out: "It is fine only if you put something back. mem::replace can be used for that." Reel step 1 is the same rule one level down: `drop(&mut self)` holds only a `&mut`, so `self.buf` is E0507; the by-value `into_inner(self)` hits E0509 instead, because `PooledBuf` has a destructor (both protect the owner's `drop`).

The idioms, with signatures and what they leave behind:

- `Option::take(&mut self) -> Option<T>` leaves `None`. `Option::replace` leaves `Some(value)` and returns the old value. `Option::take_if` (since 1.80) takes conditionally.
- `mem::take<T: Default>(dest: &mut T) -> T` leaves `T::default()`; "take allows taking ownership of a struct field by replacing it with an empty value". `Vec::new` and `String::new` do not allocate.
- `mem::replace(dest: &mut T, src: T) -> T` moves `src` in and returns the old value; "Neither value is dropped", and `T` need not be `Clone` (the docs' own example is `mem::replace(&mut self.buf[i], v)`).
- `mem::swap(x, y)` exchanges two places "without deinitializing either one".

The most common production use is not a struct field but a state machine advanced through `&mut self`: `*self = match mem::replace(self, Stage::Empty) { Stage::Full(buf) => Stage::Done(buf), other => other };` moves the owned payload out of the old variant by value, with a valid `Empty` in place for the whole match (`state.rs`: `Full -> Done -> Done`, 0 allocations, 0 deallocations). Written as `match *self { ... }` instead, it is E0507 (`state_e0507.rs`). The third-party `replace_with` crate exists for the case where you want to move out, compute and put back: "Temporarily take ownership of a value at a mutable location, and replace it with a new value based on the old one." It is honest about the price: "the desired ability to temporarily move out of &mut T doesn’t exist yet, so this crate is my interim solution", and "If the second closure (FnOnce() -> T) panics, however, then it does indeed abort." Its `replace_with_or_abort` aborts on a panic in the mapping closure, the cost of the hole the reel's step 9 describes.

Costs, measured with the counting allocator: each of them is 0 allocations and 0 deallocations. `mem::replace` with a fresh `Vec::with_capacity(BUF_CAP)` costs the replacement's own allocation (1). The trap: `mem::take(&mut buf.bytes)` on a *pooled* buffer leaves capacity 0 (`left_cap=0 taken_cap=65536`), so 1,000 messages of 261 bytes cost 1,000 allocations and 326,275 bytes (65,536 + 999 x 261) instead of one.

Owning removals do the same job for collections: `pop` returns `Option<T>`, `swap_remove` is O(1) and reorders, `remove` is O(n) and shifts, `drain` keeps a `&mut` borrow on the vector and drops any element the iterator did not yield, and `into_iter` consumes the collection ("an iterator that takes ownership of v1 and returns owned values", the Book). All are 0 allocations here. Clippy's style lints point at the right idiom: `mem_replace_option_with_none` ("Option already has the method take()"), `mem_replace_option_with_some` (use `Option::replace`) and `mem_replace_with_default` (use `mem::take`). Shared ownership has its own exits: `Rc::try_unwrap`/`Rc::into_inner` give the value back only "if the Rc has exactly one strong reference" (Chapter 4).

### Drop flags per field

The previous topic's drop flags, now per field. `examples/flag_mir.rs`, compiled with `rustc --crate-type lib --emit=mir`, has one flag local set by `const false` / `const true`, a `switchInt` on it guarding the drop of the field moved on one path, and an unconditional drop of the other:

```text
_7 = const false;            // flag for p.body
_7 = const true;
switchInt(copy _7) -> [0: bb3, otherwise: bb6];
drop((_2.1: T)) -> ...       // p.body, only if the flag says it is still there
drop((_2.0: T)) -> ...       // p.head, unconditionally
```

The local numbers and block numbers are the compiler's and may change; the shape is what `examples.py` asserts. The traces of both paths (`condpartial.rs`): `moved path: ["body", "end", "head", "tail"]`, `kept path: ["end", "head", "body", "tail"]`. The Reference's "only its initialized fields are dropped" is what the flag implements; the Nomicon describes the mechanism for variables ("a drop flag for that variable is toggled"), and the per-field flag is the measurement.

### Binding modes, precisely

The Reference: identifier patterns "bind a variable to a copy of or move from the matched value depending on whether the matched value implements Copy"; "This can be changed to bind to a reference by using the ref keyword, or to a mutable reference using ref mut"; "ref is not something that is being matched against". Mixing move and `ref` bindings in one pattern is a partial move: "Move bindings and reference bindings can be mixed together in the same pattern. Doing so will result in partial move of the object bound to and the object cannot be used afterwards. This applies only if the type cannot be copied." Rust By Example's `Person { name, ref age }` is the same example.

Default binding modes (Reference and RFC 2005; the FLS 5.13 states the rules for the 2021 edition): the default starts as `move`. Matching a reference with a non-reference pattern dereferences it automatically and sets the mode to `ref` for `&`, or `ref mut` for `&mut` unless it is already `ref`; if the dereferenced value is still a reference, the process repeats; and "there is no exit from the ref binding mode". Measured with `type_name_of_val`:

```text
&frame: header &Header payload &Buf
&mut frame: header &mut Header payload &mut Buf
& &mut frame: header &Header payload &Buf        (no way back from ref)
ref by value: payload &Buf frame still whole: 1
frame: header Header payload Buf
as_ref: &Buf     as_mut: &mut Buf     &slot: &Buf     by value: Buf
```

RFC 2005 declined a `move` keyword for patterns because "moving a value out from behind a shared or mutable reference is only possible for Copy types".

`_` against `_x`: the Book, "The syntax _x still binds the value to the variable, whereas _ doesn't bind at all"; the Reference, `_` "does not copy, move, or borrow". The same holds in a `let`: `let _ = frame.payload;` leaves `frame` whole, and `let _ = g;` neither moves nor drops a named guard (`let _: frame whole id=1 guard alive id=1`). Only a *temporary* on the right of `let _ =` is dropped at once (previous topic). Patterns are everywhere the Book lists: `let`, `match` arms, `if let`, `while let`, `for`, and function parameters; the bindings drop in reverse order of declaration within the pattern. `let ... else` is one more place where ownership changes hands: "The let...else syntax takes a pattern on the left side and an expression on the right, very similar to if let, but it does not have an if branch, only an else branch." (Book 6.3). `let Some(buf) = slot.take() else { return None; };` moves the `Buf` out of the temporary into `buf` for the rest of the block, and a second call finds `None` and takes the `else` arm (`state.rs`: `first=Some(2) second=None slot_is_none=true`).

One consequence for the chapter's guard, and the pattern half's tie to the reel's running example: in `if let Some(b) = self.buf.take()` the scrutinee is a temporary `Option<Buf>`; the by-value binding moves the `Buf` out of it, so the buffer changes owner right there (into `b`, then into `pool.put`) and the temporary has nothing left to drop when its temporary scope ends.

### Rust 2024 match ergonomics reservations

The Edition Guide, in its own words: before Rust 2024, `let [x, mut y] = &[(), ()];` reset the mode to move ("writing mut on the binding resets the default binding mode to move"), `let [ref x] = &[()];` was redundant, and `let [&x, y] = &[&(), &()];` also reset. To leave space to fix this, "in Rust 2024 it's an error to write mut on a binding when the default binding mode is not move", and "to leave space for other language possibilities, we are disallowing explicit binding modes where they are redundant"; "similarly, a reference pattern may only appear when the default binding mode is move". The Reference notes the same under `[patterns.ident.binding.mode-limitations-binding]` ("In these editions, specifying mut on a binding set the binding mode to move regardless of the current default binding mode").

The three measured rustc 1.97.0 errors (identical on 1.99.0):

```text
error: cannot mutably bind by value within an implicitly-borrowing pattern     (let Frame { mut header, .. } = &frame;)
error: cannot explicitly borrow within an implicitly-borrowing pattern         (let Frame { ref payload, .. } = &frame;)
error: cannot explicitly dereference within an implicitly-borrowing pattern    (let [&x] = &[&1u8];)
```

The 2021 behaviour is a silent copy for a `Copy` field (`copy edited: 99 original: 0`, no warning at all), and E0507 for a non-`Copy` field. In 2024, a non-`Copy` field reports both: the reservation error and the same E0507 (`me_mutopt.rs`). The migration: the lint `rust_2024_incompatible_pat` is allow-by-default and part of `rust-2024-compatibility`; `cargo fix --edition` applies it and "will automatically convert affected patterns to fully explicit patterns that work correctly in Rust 2024 and in all prior editions". Measured on cargo 1.97.0 and 1.99.0: it rewrote `let Frame { mut header, payload } = &frame;` to `let &Frame { mut header, ref payload } = &frame;` and left `edition = "2021"` in `Cargo.toml` (change it by hand). The rewrite prints `copy edited: 99 original: 0` under both editions: it keeps the old meaning, including a silent copy that was probably a bug. With the lint enabled under 2021 its words are `cannot mutably bind by value within an implicitly-borrowing pattern in Rust 2024` and `this changes meaning in Rust 2024`; in 2024 the same pattern is a hard error. The FLS does not cover any of this: it "specifies the form and meaning of programs written in the 2021 Edition", and its changelog says "The 2024 edition is outside the scope of the FLS". The 2024 rules live in the Reference and the Edition Guide.

### Guard field designs: Option, placeholder, ManuallyDrop

Three designs for the guard's field, all measured at 40 bytes and 1 allocation in the plain loop (`variants.rs`). The `Option<Buf>` with `take()` is the Nomicon's "classic safe solution", "certainly what you should reach for by default", with the caveat of "fairly odd semantics: you are saying that a field that should always be Some may be None". Here the caveat has a concrete price: `buf()`, `buf_mut()` and `into_inner` (Lab 1) each call `expect("present")`, a run-time check of an invariant (always `Some` until handed out) that the type no longer states, and `ManuallyDrop` avoids it only with `unsafe`. Giving the guard `Deref` and `DerefMut`, as smart pointers do, would change how callers reach the buffer, not the `expect` behind it. A **placeholder** (`mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() })`) works in the plain loop, but with `into_inner` its `drop` returns the empty `Buf` to the pool: after 1,000 messages the free list holds 1,000 placeholders (`placeholder: allocs=8 free=1001 placeholders=1000`; measured, the free list growing shows up as 7 extra counted allocations). Only an unenforced sentinel check (`id == 0`) could tell, by convention.

`ManuallyDrop<Buf>` with `unsafe { ManuallyDrop::take(&mut self.buf) }` in `drop` also works (the docs: "primarily intended for moving out values in drop"; "It is your responsibility to ensure that this ManuallyDrop is not used again"; prefer `into_inner` "whenever possible"). Its code in `variants.rs` carries a `// SAFETY:` comment; the details of that contract are Chapter 30, as is `ptr::read`, which makes a bitwise copy "regardless of whether T is Copy" and so a double-drop hazard. Finally, `into_inner(mut self) -> Buf` against `fn take_buf(&mut self) -> Option<Buf>`: consuming `self` makes a second take impossible at compile time, and follows the API Guidelines' `into_` convention (C-CONV).

</section>

<section data-section="lab">

## Build, break, measure

Install nothing but a Rust toolchain: every command compiles one file from `examples/`, which `include!`s `pipeline.rs` (the chapter's pipeline and counting allocator, plus `Frame`, `Trace` and a `message` helper) and, where needed, `pooled.rs` (`PooledBuf`). `examples.py` compiles each into a temporary directory and asserts every output quoted here. Never print inside a counted region; the counters are read before and after.

### Lab 1 · Stage 3: own the buffer and return it to the pool

`base.rs` sends 1,000 messages of 261 bytes through `get`, `fill`, `inspect`, `consume`, `put`. `guard_clone.rs` compares the naive guard with rustc's clone against `PooledBuf`:

```text
$ rustc --edition 2024 base.rs && ./base
base: allocs=1 bytes=65536 header=Header { kind: 7, len: 256 } free=1
$ rustc --edition 2024 guard_clone.rs && ./guard_clone
clone: allocs=1001 bytes=65601536 deallocs=1000
take: allocs=1 bytes=65536 deallocs=0
sizes: Buf=32 Option<Buf>=32 Header=8 Frame=40 PooledBuf=40
```

`pooled.rs` is the whole guard, which every other file includes:

```rust
pub struct PooledBuf<'p> { buf: Option<Buf>, pool: &'p mut Pool }
impl<'p> PooledBuf<'p> {
    pub fn new(pool: &'p mut Pool) -> PooledBuf<'p> {
        let buf = pool.get();
        PooledBuf { buf: Some(buf), pool }
    }
    pub fn buf(&self) -> &Buf { self.buf.as_ref().expect("present") }
    pub fn buf_mut(&mut self) -> &mut Buf { self.buf.as_mut().expect("present") }
    pub fn into_inner(mut self) -> Buf {
        self.buf.take().expect("present")
    }   // self drops here
}
impl Drop for PooledBuf<'_> {
  fn drop(&mut self) {
    if let Some(b) = self.buf.take() {
      self.pool.put(b);
    }
  }
}
```

`new` takes the buffer from the pool; `buf()` and `buf_mut()` lend it for as long as the guard lives (a stage writes `fill(g.buf_mut(), src)`); `drop` and `into_inner` are the two ways out. Each accessor's `expect` is the price of the `Option`: the guard holds a `Some` from `new` until `take`, and the type cannot say so. `errpath.rs`'s `into_inner` loop (hand the buffer out, put it back by hand) is `into_inner loop allocs=1`. The instrument is the counting allocator of the previous topics, copied verbatim: an `unsafe impl GlobalAlloc` (the implementer promises the allocator contract; Chapter 30) with `Relaxed` counters (a plain counter; Chapter 7).

### Lab 2 · Break the guard on purpose

Each file fails to compile, and its first line is the lesson:

```text
guard_e0507.rs        error[E0507]: cannot move out of `self.buf` which is behind a mutable reference
                      help: consider cloning the value if the performance cost is acceptable
e0509_destructure.rs  error[E0509]: cannot move out of type `PooledBuf<'_>`, which implements the `Drop` trait
e0509_field.rs        error[E0509]: cannot move out of type `PooledBuf<'_>`, which implements the `Drop` trait
e0509_into_inner.rs   error[E0509]: ... help: let PooledBuf { ref buf, .. } = self;
ref_fix.rs            error[E0507]: cannot move out of `*buf` which is behind a shared reference
second_guard.rs       error[E0499]: cannot borrow `pool` as mutable more than once at a time
```

`second_guard.rs` is the handoff: two guards would borrow the same `Pool` exclusively at once.

### Lab 3 · Partial moves out of Frame, traced

`e0382_partial.rs`, `e0382_pattern.rs`, `update.rs` and `wild_move.rs` are the E0382 forms. `partial.rs` prints the four traces above and `frame deallocs: at move=0 at drop(payload)=1`: moving the `Buf` out of `frame` frees nothing, dropping it frees the heap bytes. `condpartial.rs` shows both paths, and `flag_mir.rs` (`--crate-type lib --emit=mir`) the flag. `box_move.rs` prints `inside scope deallocs=0` then `after scope deallocs=1 f.id=1`. The E0507/E0508 set: `e0507_shared.rs`, `e0507_mut.rs`, `e0507_match.rs`, `e0507_rc.rs`, `e0507_vec.rs`, `e0508.rs`, and `which_moves.rs`, the four lines of the reel's step 6, which fails with exactly three errors (on `v[0]`, `*shared`, `r.payload`) and none on `*boxed`.

Edge cases found by the fact-check: `box_refill.rs` (`Box<Buf>: allocs=1 bytes=32`; `after *boxed: deallocs=0; refilled: deallocs=0 id=9 moved id=1`; `match *box moved out id=2`), `box_use_after.rs` (E0382 on `*boxed`), `box_match_ref.rs` (`error[E0308]: mismatched types`), `box_drop_field.rs` (E0509), `reinit_notmut.rs` (E0594), `reinit_moved.rs` (E0382), `update_copy.rs`, `update_drop.rs`, `wild_let.rs`.

### Lab 4 · The error path, with and without the guard

`errpath.rs`: 1,000 messages of 65,536 bytes, every tenth malformed.

```text
by hand: errors=100 allocs=100 bytes=6553600
guarded: errors=100 allocs=1 bytes=65536
```

The 100 allocations by hand are 1 + 99, not 100 replacements: every tenth message is bad, including the last, whose lost buffer no later message needs. `prove6.rs` repeats it for 10,000 messages with every fiftieth malformed (2%): 200 allocations (1 + 199; 13,107,200 bytes, 12.5 MiB) by hand against 1 (65,536 bytes) guarded.

`panic_path.rs` runs the guarded stage 100 times with every tenth call panicking inside `check`, each caught with `catch_unwind`: `guarded: caught=10 buffers_made=1 free=1`. The guard returned the buffer every time, because unwinding runs `drop` (previous topic; under `panic = "abort"` or `process::exit` no destructor runs). Count buffers made (`pool.next_id`) and `free`, not allocations: the allocation counter also rises, because the panic machinery allocates its own payload, which would wrongly suggest lost buffers.

### Lab 5 · What each idiom costs

```text
Option::take: allocs=0 deallocs=0 slot_is_none=true
mem::take(bytes): allocs=0 deallocs=0 left_cap=0 taken_cap=65536 before=65536
mem::replace(payload, pooled): allocs=0 deallocs=0
mem::swap: allocs=0 deallocs=0
Option::replace: allocs=0 deallocs=0 old_was_none=true
mem::replace(bytes, with_capacity): allocs=1 deallocs=1
pop/swap_remove/remove: allocs=0 deallocs=0 len=0
default Vec cap=0 String cap=0
```

`variants.rs` adds the placeholder guard (1 allocation), the `ManuallyDrop` guard (1), the sizes (`ReplaceGuard=40 MdGuard=40 PooledBuf=40`) and the take trap (`take-bytes trap allocs=1000 bytes=326275`). `prove3.rs` is the placeholder with `into_inner` (`free=1001 placeholders=1000`) against the `Option` guard (`allocs=1 free=1`). `sink_ok.rs`: `replace allocs=0 clone allocs=1 clone_cap=261 id_left=0`.

### Lab 6 · One pattern, two editions

`modes.rs` prints the binding types listed above. Compile each of these with `--edition 2021` and `--edition 2024`: `me_mut_short.rs` and `me_mut.rs` (2021 prints `copy edited: 99 original: 0` and no warning; 2024 is the `mut` error), `me_ref.rs`, `me_ref_short.rs` (2021 prints `1`; 2024 is the `ref` error), `me_and.rs` (2021 prints `1 7`; 2024 is the `&` error), `me_refmut.rs`, `me_mutopt.rs`. With `#![warn(rust_2024_incompatible_pat)]` under 2021, `me_lint_short.rs` and `me_lint.rs` print the lint's message. `me_fixed_short.rs` and `me_fixed.rs` (the migrated patterns) print the same `copy edited: 99 original: 0` under both editions; `me_ok2024.rs` (`let Frame { header, payload } = &mut frame;`) prints `edited in place: 99`; `me_rewrites.rs` holds the three rewrites of step 19 (`rewrites ok: 0 1 1`). Optional, by hand: run `cargo fix --edition` on a one-file crate and read the rewrite.

</section>

<section data-section="production">

## In production

- **The compiler's `.clone()` help has a price.** For E0507 rustc says "consider cloning the value if the performance cost is acceptable". In a pooled pipeline that adds a hidden allocation per message (measured: 1,001 allocations against 1). The same help appears behind `&`, behind `&mut`, for an `Rc`, an index and a loop over `&Vec` (all measured). Prefer moving the field out with `take`/`replace`, or change the signature (the first topic).
- **Hand-written return paths lose pooled resources** on `?` and on panics; a guard makes the return structural (Lab 4). Its cost is an `Option` (0 extra bytes here, measured), one branch in `drop` and an `expect` in each accessor. Only a guard whose destructor never runs (leaked, `process::exit`, `panic = "abort"`) loses its buffer.
- **Move out of a `&mut`, compute, put back: a crate, and an abort.** The `replace_with` crate does it by aborting if the mapping closure panics (Deep dive, "Moving out through a borrow"); in your own code prefer `mem::replace` with a valid placeholder or an `Option` and `take`.
- **The capacity trap.** `mem::take` of a pooled buffer's bytes moves the capacity out of the pool (Lab 5). Take the whole `Buf`, or give the bytes back.
- **Placeholders hide state.** A sentinel (an empty `Buf`, `id: 0`) that `drop` can tell apart from a real one only by a convention the type does not enforce; `Option` makes the state visible to the type system. The Nomicon still calls the `Option` field what you should reach for by default.
- **Edition migration preserves 2021 pattern semantics.** `cargo fix --edition` keeps a pattern that edited a *copy* as a fully explicit copy, so a latent bug survives the migration: review every `&Frame { mut ... }` it writes.
- **Clippy** (style, warn by default): `mem_replace_option_with_none`, `mem_replace_option_with_some`, `mem_replace_with_default`.
- No public post-mortem about partial moves is cited here, and none is invented; the claims above are measured.

</section>

<section data-section="frontier">

## The frontier

- The Edition Guide frames the 2024 reservations as room for a future match-ergonomics change ("To leave space to fix this"; "To leave space for other language possibilities"). No fetched source says what will replace them, so nothing more is claimed.
- RFC 2005's "Future Extensions" proposes "autodereferencing custom smart-pointer types using the Deref and DerefMut traits" (its example matches `&x` for a `Box<Option<i32>>`), left out because of unclear "interactions with a future DerefMove trait or similar". On stable (1.97.0 and 1.99.0) that example is still `error[E0308]: mismatched types`, while `match *x { Some(y) => ... }` moves out through the `Box` rule. Moving out of `*b` is still a `Box`-only language rule today.
- The Nomicon's "first-class way to announce that a field shouldn't be automatically dropped" became `ManuallyDrop` (stable; `into_inner` since 1.20.0, `take` since 1.42.0, per the docs' version lines), and taking from it is still `unsafe`.
- `Drop::pin_drop` (nightly, `pin_ergonomics`, rust-lang/rust#130494), as the std docs list it, receives `Pin<&mut Self>`, which "enables us to support field projections of Self type safely": field-level access to pinned structs is active work (Chapter 8).
- The FLS, adopted by the Rust Project as its specification text, "specifies the form and meaning of programs written in the 2021 Edition" for rustc 1.98.0, and its changelog says "The 2024 edition is outside the scope of the FLS". Its binding-mode rules are therefore the 2021 rules.

</section>

<section data-section="prove">

## Prove it

Answer first, then check. Each was compiled and run in `examples.py`. Questions 1 to 3 are the reel's.

**1. Predict the outcome.** `let Parts { tail, .. } = p; drop(p.head);` then the brace. *`head, tail, body`*: `drop(p.head)` ends the field at once; at the brace, locals in reverse: `tail`, then `p` with only `body` left (`prove1: ["head", "end", "tail", "body"]`).

**2. Debug this.** `fn finish(&mut self) -> Buf { self.buf }` on a `Sink`. *`mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() })`* allocates nothing; `clone` allocates (1 allocation, 261 bytes), `mem::take` needs `Buf: Default` (E0277), and `let Sink { buf, .. } = *self` is E0507. The placeholder is fine here because `Sink` has no `Drop` and `finish` runs once; if something later reads `buf` (a `Drop`, a second `finish`), the empty `Buf` is a lie, and the field should be an `Option<Buf>` (question 3).

**3. Defend a design.** Placeholder, `ManuallyDrop` or `Option<Buf>` for the guard's field. *`Option<Buf>`*: only `None` tells `drop` the buffer is gone; the placeholder leaves 1,000 empty buffers in the pool, `ManuallyDrop::take` is `unsafe`. All three measure 40 bytes. The `Option`'s price is an `expect` in each accessor, a check the type cannot remove; `ManuallyDrop` avoids it only with `unsafe`.

**4. Predict the outcome.** What are the types of `header` and `payload` in `match &mut frame { Frame { header, payload } => ... }` and in `match & &mut frame { ... }`? *`&mut Header`/`&mut Buf`* and *`&Header`/`&Buf`*: the shared reference makes the mode `ref`, and a `&mut` behind it cannot change it back (`modes.rs`).

**5. Debug this.** `for b in &bufs { pool.put(*b); }` is E0507 (`cannot move out of `*b` which is behind a shared reference`, help: clone). Fix with `for b in bufs.drain(..)` (keeps the `Vec`'s allocation) or `for b in bufs` (consumes it): `drain allocs=0 into_iter allocs=0`, and the pool holds the buffers afterwards (`prove5_ok.rs`, each delta measured around its own loop).

**6. Estimate the cost.** 10,000 messages, 2% malformed, no guard. *200 allocations of 64 KiB (1 + 199), 13,107,200 bytes (12.5 MiB)*, against 1 with the guard (`prove6.rs`).

**7. Defend a design.** `into_inner(mut self) -> Buf` against `take_buf(&mut self) -> Option<Buf>`. The first makes a second take a compile error and follows C-CONV's `into_`; the second keeps the guard alive and returns `Option`. Pick `into_inner` for a guard whose job ends when its contents leave.

</section>

<section data-section="next">

## Where this goes next

`PooledBuf` holds the `Pool` by exclusive borrow, so only one guard can exist at a time. Next: when three stages need buffers at once, do you reach for `Arc<Mutex<Pool>>`, or change who owns what?

</section>
