---
id: rust.raii-drop-order-leak
title: RAII, drop order, and leak safety
---

<section data-section="outcomes">

## After this topic you can

- **Write down the exact order every destructor runs** in a given scope, nested struct, tuple, array, pattern and statement: `Drop::drop` first, then the fields in declaration order; locals in reverse declaration order; temporaries at the end of their statement (a `match` scrutinee's to the end of the whole statement, a `let x = &temp()` extended to the block); and under Rust 2024, `if let` scrutinee temporaries before `else` and tail-expression temporaries before the block's locals.
- **Write a RAII wrapper for an OS resource** (`SpillFile`: a temporary file closed and unlinked in `Drop`) that never releases twice (and releases once whenever its destructor runs), and explain why it cannot release twice: one owner, moves deinitialize the source, `Copy` is forbidden on a type with a destructor (E0184), and no one can call `Drop::drop` by hand (E0040).
- **Explain why `mem::forget` is safe**, list every way a destructor is skipped (`forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle, `process::exit`/`abort`, `panic = "abort"`, `main` returning while other threads run, and best-effort thread-local destructors), measure a leak with a counting allocator, and identify an API whose soundness wrongly depends on `Drop` running (the 2015 `thread::scoped` `JoinGuard`) against one that does not (`thread::scope`, which joins inside a function call).
- **Spot the 2021 to 2024 migration hazards** around lock guards and other temporaries: why the Edition Guide's `if let` plus `RwLock` function deadlocks under 2021 and runs under 2024, why `cargo fix --edition` keeps the deadlock (its `match` rewrite preserves the 2021 order), and why `tail_expr_drop_order` only warns.

</section>

<section data-section="internals">

## Into the internals

Everything measured here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024 unless a lab says both editions; the std documentation quoted is version 1.99.0. The programs are in `examples/*.rs` and are compiled, run and asserted by `examples.py`. Sizes are facts of this target, not layout rules (those are Chapter 5).

### The destructor, as the Reference states it

The Reference says that "when an initialized variable or temporary goes out of scope, its destructor is run or it is dropped", that assignment "also runs the destructor of its left-hand operand, if it's initialized", and that a partially initialized variable drops only its initialized fields (partial moves are the next topic). The destructor of a value is two things, in this order: a call to `<T as Drop>::drop` if `T` implements `Drop`, then the destructors of its fields, recursively. The std `Drop` docs name the second part *drop glue*.

The field rules, all measured in Lab 1: the fields of a struct are dropped in declaration order; so are the fields of a tuple, the fields of the active variant of an enum and the elements of an array or owned slice (first to last); the variables that a closure captures by move are dropped in an unspecified order; a trait object runs the underlying type's destructor. `core::ptr::drop_in_place` "executes the destructor (if any) of the pointed-to value" through a raw pointer: it is "required to use [it] to drop unsized types like trait objects, because they can’t be read out onto the stack and dropped normally", and after it runs the pointee counts as dropped ("using the pointed-to value after calling `drop_in_place` can cause undefined behavior" unless it is `Copy`), which ties to the "a value whose `drop` panicked counts as dropped" bullet below. It is `unsafe`: the pointer must be valid for reads and writes and properly aligned (an unaligned packed field is copied out first, so it is not dropped in place), and it "can be used to drop pinned data when T is not repr(packed)". Allocators that use it are Chapter 30. The FLS states the same field rules as the Reference (chapter 15: destructors, drop scopes, drop order): "Otherwise, if the drop type is a struct type, then its fields are dropped in declaration order", "All other bindings are dropped in reverse declaration order", and parameters "from right to left".

Most types never implement `Drop`. The Rustonomicon: "If a struct has no special logic for being dropped other than dropping its children, then it means Drop doesn't need to be implemented at all!", and it distinguishes a type that *needs* drop (it has drop glue) from one that *is* `Drop` (it has its own code). Only a type that directly manages a resource (memory, a file, a socket, a lock) writes one.

`Drop::drop` takes `&mut self`, not `self`: while it runs, the value's fields are still intact and "self has not yet been deallocated". That is exactly why calling it by hand is E0040 (the value would remain usable and be dropped again) and why, next topic, you cannot move a field out of a type that implements `Drop` (E0509; the Nomicon's `Option::take` workaround is also next topic).

`std::mem::drop` "is not magic; it is literally defined as" `pub fn drop<T>(_x: T) {}`. It moves its argument in, so the argument is dropped before the function returns. On a `Copy` value it does nothing (rustc warns: `dropping_copy_types`), on a reference it drops the reference, not the value (`drop(&g)` keeps `g` locked; rustc warns with `dropping_references`, measured in `examples/dropref.rs`), and on a `RefCell` guard it can release the borrow early.

`Copy` and `Drop` are exclusive, and there are two separate reasons, kept apart on purpose. The std `Copy` docs: a type implementing `Drop` can't be `Copy` "because it's managing some resource besides its own `size_of::<T>` bytes", so a bitwise copy would duplicate responsibility for it (the `String` double-free example). The std `Drop` docs add that implicit duplication would make it unpredictable when and how often a destructor runs. E0184's own text is narrower: the combination "can make some sense in theory", but "the current implementation is incorrect and can lead to memory unsafety", so it is disallowed for now.

### Every drop-order rule, with a trace

The probe is `Trace(&'static str)`, a value whose `Drop` pushes its name onto a log. The log is a `thread_local!` (one copy of the static per thread) holding a `RefCell<Vec<&'static str>>` (a cell whose borrow rules are checked at run time; Chapter 4). Pushing allocates, so never log inside a region whose allocations you count.

```rust
thread_local! {
    static LOG: RefCell<Vec<&'static str>> = RefCell::new(Vec::new());
}
fn push(name: &'static str) {
    LOG.with(|l| l.borrow_mut().push(name));
}
struct Trace(&'static str);          // logs its name in Drop
impl Drop for Trace {
    fn drop(&mut self) {
        push(self.0);
    }
}
```

One table, measured in `examples/trace.rs` (identical under both editions unless marked):

| Construct | Measured order | Rule |
|---|---|---|
| three locals `a`, `b`, `c` | `c b a` | reverse declaration order |
| shadowing: `x`, `y`, then `let x = Trace("x2")` | `x2 y x` | a shadowed binding still drops at the brace, in its own position |
| `Stage { name, input, spill }` with `impl Drop for Stage` | `stage name input spill` | `Drop::drop` first, then the fields in order |
| tuple `(t0, t1, t2)` | `t0 t1 t2` | fields in order |
| array `[e0, e1, e2]` | `e0 e1 e2` | first element to last |
| `let (p, q) = (Trace("p"), Trace("q"));` | `q p` | pattern bindings drop in reverse declaration order |
| `fn params(a, (b, c)) { let d }` | `d c b a` | the local, then parameters last, each after its own pattern's bindings |
| `consume(m); drop(n);` | `m n` | the new owner's scope end; `mem::drop` at once |
| `v = built("v2")` over a live `v1` (`built` logs `built`, then makes a `Trace`) | `built v1 v2`: `v1` at the assignment, `v2` at the brace | the new value is built first, then the old one is dropped, then the new one is stored |
| `Some(Trace("some"))` and `None::<Trace>` | `some` | an enum drops the active variant's fields; `None` drops nothing |
| `let t = o.take();` on `Some(Trace("taken"))` | `took taken` | `take()` leaves a `None` that the glue skips; `t` owns the payload |
| `for _ in 0..2 { let _l = Trace("l"); push("body"); }` | `body l body l` | a local in a loop body drops at the end of every iteration |
| `let _ = Trace("wild")` between two named locals | `wild g f` | `_` binds nothing: the value is a temporary dropped at the semicolon; `let _g` binds and holds |
| `t` moved on one path only, not moved | `z cond` | the drop flag decides (see below) |
| `t` moved on one path only, moved | `cond z` | `cond` died inside `consume` |

The Reference's assignment rules fix the order in the `assign` row: "The assigned value operand is evaluated first, followed by the assignee expression", and the assignment "then has the effect of first dropping the value at the assigned place". So when the new value's constructor needs the resource the old one holds (re-creating a `SpillFile` at the same path, re-taking a lock the old guard holds), the assignment fails or deadlocks; the trace logs `built` to show the order.

Function parameters sit in the function's outermost scope, so they are dropped last. The Reference's own example, `patterns_in_parameters` with `(x, _)` and `(_, y)` over four `PrintOnDrop` values, carries the comment "drop order is 3 2 0 1", and it prints `drop(3) drop(2) drop(0) drop(1)` (measured). For or-patterns, the first subpattern's declaration order is used even when a later one matches. The Reference's `or_pattern_drop_order((Ok([x, y]) | Err([y, x])))` prints `drop(Declared last, dropped first)` then `drop(Declared first, dropped last)` for both the `Ok` and the `Err` call (measured, both editions). Our own extra case, `let ((a, b, 1) | (b, a, 2)) = … else { … };` with `(a, b, 2)`, prints `drop(a) drop(b)`; it is not the Reference's example.

The field-order hazard follows from the table: a field that must outlive another must be declared **after** it. The `ManuallyDrop` docs say the same ("reorder the declarations such that the implicit drop order is the correct one"; using `ManuallyDrop` for order needs `unsafe` and is hard under unwinding), and the Nomicon calls relying on field order "fragile and subtle". Lab 3 measures the directory-left-behind bug.

### Temporaries: scopes, extension, and the two 2024 changes

A temporary is a value with no binding. The Reference gives each expression a *temporary scope*: the smallest enclosing scope from this list. The entire function; a statement; the body of an `if`, `while` or `loop`; each branch of an `if` (an `else` block); the condition of an `if` or `while` that is not a pattern match, or an operand of a match guard; the pattern-matching guard and the body of a match arm; **each** operand of a lazy boolean expression. Rust 2024 adds: the pattern-matching condition(s) and consequent body of an `if`; the pattern-matching condition and loop body of a `while` (the Reference's own `while let` example drops the loop body's temporaries first and the scrutinee's after it, so the scrutinee's guard is held through the body); and the whole tail expression of a block. Temporaries in one scope drop in reverse creation order, and operand temporaries drop early only when an operand breaks out, returns or panics.

A `match` scrutinee is **not** a temporary scope. The Reference: "The scrutinee of a match expression is not a temporary scope, so temporaries in the scrutinee can be dropped after the match expression." Measured (`examples/semi.rs`): `m.lock().unwrap().push(1);` releases the lock at the semicolon (`try_lock` succeeds afterwards), while a guard created in `match m.lock().unwrap().len() { … }` is held through every arm (`try_lock` fails in the arm and succeeds after the match). The same holds for a loop header: `for x in m.lock().unwrap().iter() { … }` holds the lock for the whole loop, and `while let Some(x) = m.lock().unwrap().pop() { … }` holds it through each body (`try_lock` fails in both bodies and succeeds after the loop, measured). A local declared inside a loop body is dropped at the end of every iteration (`body l body l` in the table), so the fix engineers reach for is to end the guard's statement first: `let item = { m.lock().unwrap().pop() };`.

*Temporary lifetime extension.* In a `let`, the temporary scope of some syntactic positions is extended to the end of the enclosing block so that a reference has something to point at: the initializer's operand of `&` or `&mut`, array, cast, braced-struct and tuple operands, the arguments of a tuple-struct or tuple-variant constructor such as `Some(&temp())`, a block's tail (except in an `async` block), `if`/`else` tails and match arms, the super operands of `pin!` and `format_args!`, and `ref` patterns. The positions that do **not** extend: function arguments, method receivers, a match scrutinee, an `async` block's tail, a closure body and `break` operands. `static` and `const` initializers extend to the end of the program. The Reference warns that these rules are subject to change. Measured on 1.97.0: `let x = Some(&S("some"));`, `format_args!("{:?}", S("fa").0)` and `pin!(S("pin"))` keep their temporary to the end of the block, and `let r = id(&S("arg"));` drops it at the semicolon. With a later use of `r` that last case is E0716 (`examples/e0716.rs`); without one it compiles with only a warning.

*The two 2024 rules* (the Reference's `destructors.scope.temporary.edition2024`): in `if let $pat = $expr { .. } else { .. }`, temporaries of `$expr` are dropped before the program enters `else`; temporaries in a block's tail expression are dropped right after the tail expression is evaluated, before the block's locals. Measured by compiling `examples/trace.rs` under both editions and diffing the output:

```text
2021: tail: ["local", "tail"]    else-path: ["else", "guard", "after-if", "outer"]
2024: tail: ["tail", "local"]    else-path: ["guard", "else", "after-if", "outer"]
```

The `match` version of the else path is `["else", "guard", "after-match", "outer"]` under both editions; the `then` path is `["then", "guard", "after-if", "outer"]` under both. Neither change touches locals or fields.

The two Edition Guide examples, measured here. The `RwLock` function deadlocks under 2021 (a read guard held into `else`, where `write()` waits for it; the `RwLock` docs only promise that `write` "might panic" if the lock is already held by the current thread, so the safe wording is "deadlocks, or may panic": on this toolchain it hangs) and runs under 2024. The `RefCell` tail `c.borrow().len()` is E0597 under 2021 ("the temporary is part of an expression at the end of a block") and compiles under 2024, printing `2`. The change cuts the other way too: `let x = { &String::from("1234") }.len();` prints `4` under 2021 and is E0716 under 2024; the fix is to lift the block into a `let`, which is lifetime extension.

### Migrating: if_let_rescope, tail_expr_drop_order, and what cargo fix really does

`if_let_rescope` is in the `rust-2024-compatibility` lint group that `cargo fix --edition` applies. It fires when the scrutinee has a temporary with a non-trivial `Drop`, and **suggests a `match`** that keeps the 2021 order. The lint's own words, measured: "a `match` with a single arm can preserve the drop order up to Edition 2021". The code `cargo fix` actually writes has the pattern arm plus a `_ =>` arm for the `else` (cargo 1.97.0 on `examples/iflet_rwlock.rs`), so do not call it a one-arm `match`. Because a `match` scrutinee's temporaries live to the end of the statement, the migrated function keeps the deadlock under 2024: the Edition Guide says exactly that for this example ("that's probably not what you want due to the aforementioned deadlock!") and tells you to review every `if let` to `match` change and revert to `if let` where you want the new order. `cargo fix --edition` also leaves `edition = "2021"` in `Cargo.toml`; you change it by hand afterwards.

`tail_expr_drop_order` only warns ("relative drop order changing in Rust 2024"), because there is no semantics-preserving rewrite for tail-expression temporaries (RFC 3606 has the details). You can turn both lints on without migrating: `#![warn(if_let_rescope)]` and `#![warn(tail_expr_drop_order)]`. Measured under `--edition 2021`:

```text
warning: `if let` assigns a shorter lifetime since Edition 2024
 5 |     if let Some(x) = *value.read().unwrap() {
   |                       this value has a significant drop implementation which may observe a major change in drop order and requires your discretion
help: the value is now dropped here in Edition 2024
 7 |     } else {
help: a `match` with a single arm can preserve the drop order up to Edition 2021

warning: relative drop order changing in Rust 2024
17 |     let local = Loud("local");
   |         `local` will be dropped later as of Edition 2024
18 |     Loud("tail").len()
   |     up until Edition 2021 `#1` is dropped last but will be dropped earlier in Edition 2024
```

### Drop flags

The Nomicon starts from the question this topic's reel step 13 answers: "`let` never drops" (assigning in a `let` makes a fresh variable) while assigning through a dereference always drops; the hard case is overwriting or dropping a variable that may or may not be initialized. Where the state is statically known (straight-line code, or branches that agree) the compiler emits an unconditional drop or none; otherwise Rust keeps a **run-time drop flag** per variable, toggled as it becomes initialized or moved-from and checked when the variable might need dropping. The flag is a hidden boolean local (`_5` below): the Nomicon's picture puts it on the stack, but where it lives is up to the optimiser (a register, or gone when the branch folds); older Rust stored it in a hidden field of the value. You can read them in the MIR of `fn f(c: bool) { let t = T(1); if c { consume(t); } }` (`rustc --crate-type lib --emit=mir`):

```text
_5 = const false;
_5 = const true;
switchInt(copy _5) -> [0: bb3, otherwise: bb4];
drop(_2) -> [return: bb3, unwind continue];
```

This ties back to the previous topic's Prove it question about a value moved on one path ("Rust then tracks at run time whether the value still needs freeing"). The same machinery works per field for partial moves: next topic.

### Drop check, in one paragraph

No later syllabus topic covers drop check, so it is owned here. The Nomicon's `Inspector`/`World` example is sound and compiles without a `Drop` impl; adding `impl Drop for Inspector` makes the same program fail:

```text
error[E0597]: `world.days` does not live long enough
   | borrow might be used here, when `world` is dropped and runs the destructor for type `World<'_>`
```

Reordering the fields or using a tuple does not help. The rule: "For a generic type to soundly implement drop, its generics arguments must strictly outlive it." The drop checker enforces it conservatively because the borrow checker does not look inside `Drop` bodies, so all borrowed data in a value must strictly outlive the value. The unstable escape hatch is `#[may_dangle]` (RFC 1327) on an `unsafe impl Drop`, and the Nomicon's advice is "It is better to avoid adding the attribute." The full story of lifetimes is Chapter 2.

### RAII in Rust against defer, with, try-with-resources and C++

The same `SpillFile` written four other ways, as a comparison of mechanisms (no foreign code is run here). Go's `defer os.Remove(path)` is a statement you must remember at every acquisition, and it runs "to the moment the surrounding function returns", not at block exit. Python's `with` "wrap[s] the execution of a block", and Java's try-with-resources closes resources "in the reverse order from which they were initialized, after execution of the try block": both are lexical and cover only the block that opened the resource, so handing the resource to another function breaks the pairing. C++ RAII is the same idea as Rust's, but a moved-from object still has a destructor that runs (the draft: a destructor runs for an automatic object "when the block in which an object is created exits", and a moved-from library object stays "in a valid but unspecified state"), so "exactly once" needs a null-out in every move constructor; that last step is our inference from those two quotes, not a quoted rule.

In Rust the release is attached to the *owner*, so it follows the value through moves, early returns, `?` and panics, and the compiler forbids the two ways of breaking it: `Copy` (E0184) and a manual call (E0040). `std::fs::File` itself is "automatically closed when [it goes] out of scope" and "errors detected on closing are ignored by the implementation of Drop"; call `sync_all` first if they matter (durability is Chapter 15). `OwnedFd`, `BorrowedFd`, `from_raw_fd`'s `unsafe` and I/O safety are Chapter 11.

### Leaking is safe: RFC 1066 and the Reference's rule

The Reference's "Not running destructors": `core::mem::forget` and `core::mem::ManuallyDrop` prevent destructors, preventing one is safe even for non-`'static` types, and apart from the places where destructors are guaranteed to run, "types may not safely rely on a destructor being run for soundness". The std `forget` docs: it is not `unsafe` because Rust's safety guarantees do not include a guarantee that destructors always run; `Rc` cycles and `process::exit` skip them in safe code; "Because forgetting a value is allowed, any unsafe code you write must allow for this possibility." and "You cannot return a value and expect that the caller will necessarily run the value's destructor."

RFC 1066 (start date 2015-04-15) is the decision. `thread::scoped`'s `JoinGuard` relied on `Drop` always running; an `Rc` cycle gives a safe `forget`; bugs around `panic!` and `Vec::drain_range` were also affected. The RFC removes `unsafe` from `forget` and states: "The standard library and the primitives it provides will always attempt to run destructors, but will not provide a guarantee that destructors will be run." `unsafe` means memory unsafety, not "avoid this"; the alternatives it considered (guarantee destructors; a `Leak` marker trait) were judged more invasive; and its open question, "are there remaining APIs in the standard library which rely on destructors being run for memory safety?", is still a good audit question.

Ways a destructor is skipped: `forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle (Chapter 4), `std::process::exit` ("no destructors on the current stack or any other thread’s stack will be run"), `std::process::abort`, `panic = "abort"`, and a panic that reaches a non-unwinding ABI boundary (the Reference: either none or all of the destructors up to the boundary run). Two more bite in production. First, `main` returning: the `std::thread` docs say that "when the main thread of a Rust program terminates, the entire program shuts down, even if other threads are still running, and any destructors on the remaining threads’ stacks may not be executed", so a `BufWriter`, a `SpillFile` or a lock guard held by a thread nobody joined is never dropped (measured: `examples/unwind.rs thread` prints `main returns`, `drop b`, `drop a` and no `drop t`; lost log lines at shutdown are this). Second, thread-local destructors (the topic's own `thread_local!` log) are best effort: the `LocalKey` docs say "a “best effort” is made to ensure that destructors for types stored in thread local storage are run", and "on Unix systems when pthread-based TLS is being used, destructors will not be run for TLS values on the main thread when it exits". Statics are never dropped ("Static items do not call drop at the end of the program."). Measured exit codes: normal 0, a panic in `main` 101 with the drops printed, `exit(3)` 3 with none, `-C panic=abort` SIGABRT (-6 from Python's `subprocess`, 134 in a shell) with none.

About the word: "Leakpocalypse" is the title of a section in Aria Desires' post "Pre-Pooping Your Pants With Rust" (Faultlore, 27 April 2015), which calls the episode "Leakpocalypse 2k15" and cites Rust issue #24292, "std::thread::JoinGuard (and scoped) are unsound because of reference cycles". It is a secondary source, so it is credited as the community's name for the episode as used there; the facts are cited from RFC 1066 and the Nomicon.

### Proxy types and leak amplification

The Nomicon's "Leaking" chapter: "It is reasonable for safe code to assume that destructor leaks do not happen, as any program that leaks destructors is probably wrong. However unsafe code cannot rely on destructors to be run in order to be safe." Proxy types (`Drain`, `Rc`, `JoinGuard`) are the hazard. `Drain` borrows the vector, and must leave it consistent even if the `Drain` is forgotten, so it sets `len` first and repairs it in `Drop`. The Nomicon describes it as `len = 0`; the implementation sets `len` to the start of the range. Measured on 1.97.0: `forget(v.drain(..))` on `vec![1, 2, 3]` leaves `len 0`, `cap 3`; `forget(w.drain(1..3))` on five elements leaves `len 1`, `cap 5` (elements 4 and 5, outside the range, are lost too). The std `Vec::drain` docs promise only that the vector "may have lost and leaked elements arbitrarily, including elements outside the range". The author who first called this "pre-pooping your pants" later renamed it **leak amplification**: a leak of the proxy only amplifies into more leaks, never into undefined behavior.

The same post's ladder of leak reliance, from "no dtor - leaking is irrelevant" to "leaves the world in a broken state - unacceptable", comes with the advice to push destructor reliance up that ladder. `Rc`'s reference count can be overflowed with `forget` and then dropped to zero with live clones; the standard library's stance is to abort on overflow.

`thread::scope` (stable since 1.63) is the redesign: all threads spawned in the scope that have not been joined are joined before `scope` returns, so a leaked `ScopedJoinHandle` cannot break it; it panics if a joined thread panicked; and it waits only for the threads' main functions, so thread-local destructors may still be running. The `'scope` and `'env` lifetimes are named, not taught: Chapter 2 uses it, and explains why async has no sound scoped spawn.

</section>

<section data-section="lab">

## Build, break, measure

Install nothing but a Rust toolchain: every command compiles one file from `examples/`. `examples.py` compiles each into a temporary directory and asserts every output quoted here. The deadlock example only ever runs as a child process with a 5 second timeout.

### Lab 1 · Trace every drop in the pipeline stage

`examples/trace.rs` holds `Trace`, the log, `Stage { name, input, spill }` with `impl Drop for Stage`, `SpillFile`, and twenty-two scoped constructs. Compile it twice and diff the output:

```text
$ rustc --edition 2024 trace.rs && ./trace
locals: ["c", "b", "a"]
stage: ["stage", "name", "input", "spill"]
tuple: ["t0", "t1", "t2"]
array: ["e0", "e1", "e2"]
pattern: ["q", "p"]
params: ["d", "c", "b", "a"]
shadow: ["x2", "y", "x"]
memdrop: ["m", "n"]
assign: ["built", "v1", "v2"]
option: ["some"]
option-take: ["took", "taken"]
loop-body: ["body", "l", "body", "l"]
wildcard: ["wild", "g", "f"]
condmove: ["z", "cond"]
condmove-moved: ["cond", "z"]
match: ["arm", "scrut", "after-stmt", "tmpmatch"]
stmt: ["stmt-temp", "next-stmt"]
ext: ["after-let", "ext"]
match-else: ["else", "guard", "after-match", "outer"]
then-path: ["then", "guard", "after-if", "outer"]
tail: ["tail", "local"]
else-path: ["guard", "else", "after-if", "outer"]
```

Under `--edition 2021` only the `tail` and `else-path` lines change: `tail: ["local", "tail"]` and `else-path: ["else", "guard", "after-if", "outer"]`.

### Lab 2 · One file, two editions

`examples/iflet_rwlock.rs` is the Edition Guide's function with `try_write` in the `else` so it cannot hang:

```rust
use std::sync::RwLock;

fn stage(value: &RwLock<Option<bool>>) {
    if let Some(x) = *value.read().unwrap() {
        println!("value is {x}");
    } else {
        match value.try_write() {
            Ok(mut v) => {
                *v = Some(true);
                println!("set to true");
            }
            Err(e) => println!("try_write failed: {e:?}"),
        }
    }
}

fn main() {
    let value = RwLock::new(None);
    stage(&value);
    println!("{:?}", *value.read().unwrap());
}
```

Under `--edition 2021` it prints `try_write failed: "WouldBlock"` and `None`; under `--edition 2024` it prints `set to true` and `Some(true)`. `examples/iflet_rwlock_deadlock.rs` is the same with the real `write()`: under 2021 the child process is still running after 5 seconds and is killed; under 2024 it prints `set` and `Some(true)`. `examples/iflet_rwlock_fixed.rs`, the `match` that `cargo fix` produces, prints `try_write failed: "WouldBlock"` under 2024 as well. The tail-expression pair:

```rust
use std::cell::RefCell;

fn f() -> usize {
    let c = RefCell::new("..");
    c.borrow().len()
}
```

```text
$ rustc --edition 2021 tail_refcell.rs
error[E0597]: `c` does not live long enough
  = note: the temporary is part of an expression at the end of a block;
          consider forcing this temporary to be dropped sooner, before the block's local variables are dropped
$ rustc --edition 2024 tail_refcell.rs && ./tail_refcell
2
```

`examples/tail_string.rs` (`let x = { &String::from("1234") }.len();`) prints `4` under 2021 and fails under 2024 with `error[E0716]: temporary value dropped while borrowed`.

### Lab 3 · SpillFile, exactly once, and the field-order bug

`examples/spill.rs`:

```rust
struct SpillFile { path: PathBuf, file: File }
impl Drop for SpillFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
        CLOSES.fetch_add(1, Relaxed);
    }   // then drop glue closes `file`
}
fn pass(s: SpillFile) -> SpillFile { s }
```

After `pass(pass(SpillFile::create(p.clone())?))` and the end of the scope: `closes=1`, `exists=false`. The `closes` counter ticks in `SpillFile::drop`; the OS close happens afterwards, in `File`'s glue, and is confirmed by the descriptor count in `/proc/self/fd`: `fds_inside=1`, `fds_after=0`. Sizes on this target: `size_of::<File>()` is 4, `size_of::<PathBuf>()` is 24, `size_of::<SpillFile>()` is 32 (and so is `ManuallyDrop<SpillFile>`). `examples/spool.rs` has a directory guard and a file guard:

```rust
struct Spool {
    dir: SpillDir,     // remove_dir in Drop
    spill: SpillFile,  // remove_file in Drop
}
```

With `dir` declared first the directory is left behind (`remove_dir` fails on a non-empty directory and the error is swallowed): `bad: dir exists=true file exists=false`. Declare `spill` before `dir`: `good: dir exists=false file exists=false`.

`examples/unwind.rs` prints a line from each `Drop`. Normal return: `end of main`, `drop b`, `drop a`, exit 0. With `panic!`: `drop b`, `drop a`, exit 101. With `process::exit(3)`: no drop lines, exit 3. Built with `-C panic=abort`: no drop lines, SIGABRT. A thread still running when `main` returns is killed where it stands: `examples/unwind.rs thread` prints `main returns`, `drop b`, `drop a`, exit 0, and no `drop t` from the spawned thread. A destructor that panics during unwinding prints `panic in a destructor during cleanup` and `thread caused non-unwinding panic. aborting.`, then SIGABRT.

### Lab 4 · Leak it: forget, ManuallyDrop, Box::leak, measured

`examples/leak.rs` carries the chapter's counting allocator, a `#[global_allocator]` that counts calls to `alloc` and `dealloc` and the bytes requested. (`unsafe impl GlobalAlloc` is the implementer promising the allocator contract, Chapter 30; `Relaxed` makes the counters plain atomics, Chapter 7; the inner `unsafe { }` blocks are what Rust 2024 asks for.) No other `unsafe` appears in the file. Measure deltas around regions with no I/O inside:

```rust
let before = allocs() - deallocs();
{
    let s = SpillFile::create(path())?;
    std::mem::forget(s);     // safe. No drop.
}
```

Measured: `forget(SpillFile)` leaves `closes` unchanged, the file on disk, live allocations (`ALLOCS - DEALLOCS`) up by exactly 1 (the path's buffer) and `/proc/self/fd` up by 1. `ManuallyDrop::new(spill)` at scope end: `closes` unchanged, file still there; `ManuallyDrop::into_inner` then `drop`: `closes` +1. `forget(Vec::with_capacity(64 * 1024))`: live +1, `BYTES` up by 65,536. A `ManuallyDrop<Vec<u8>>`: live +1, and after `into_inner` and `drop` +0. `Box::leak(Box::new([7u8; 64]))`: live +1. `drop(5u32)` leaves the value usable.

### Lab 5 · Break it on purpose

The compile-fail set, each asserted on its first line:

```text
$ x.drop()                       (examples/e0040.rs)
error[E0040]: explicit use of destructor method
   ^^^^ explicit destructor calls not allowed
help: consider using `drop` function

$ #[derive(Clone, Copy)] on a type with impl Drop   (examples/e0184.rs)
error[E0184]: the trait `Copy` cannot be implemented for this type; the type has a destructor
   ^^ `Copy` not allowed on types with destructors

$ let _ = lock.write().unwrap();   (examples/let_underscore.rs)
error: non-binding let on a synchronization lock
   = note: `#[deny(let_underscore_lock)]` (part of `#[deny(let_underscore)]`) on by default

$ let Guard { buf } = g;   (examples/e0509.rs, a preview of the next topic)
error[E0509]: cannot move out of type `Guard`, which implements the `Drop` trait
```

Also `let r = id(&String::from("a")); println!("{r}");` gives `error[E0716]: temporary value dropped while borrowed` (`examples/e0716.rs`), and the Nomicon's `Inspector` with a `Drop` impl gives the `E0597` of the drop-check section (`examples/dropck.rs`).

</section>

<section data-section="production">

## In production

- **Lock guards held longer than they look.** A guard created in a `match` scrutinee is held through every arm (measured). Under 2021 an `if let` scrutinee guard is held through `else` (the Edition Guide's deadlock). `cargo fix --edition` preserves that behaviour on purpose, so a migrated crate must be reviewed by hand. Diagnose with the `if_let_rescope` and `tail_expr_drop_order` lints and with `try_lock`/`try_write` probes in tests.
- **`let _ = guard;` releases at once; `let _g` holds.** rustc's `let_underscore_lock` is deny by default (measured). Name every guard.
- **Field order is a correctness bug.** A directory guard declared before the file guard inside it (Lab 3). The `ManuallyDrop` docs advise reordering declarations rather than reaching for `ManuallyDrop`.
- **Close errors are invisible in `Drop`** (`File` docs). A wrapper that must report failure offers an explicit fallible `close(self) -> io::Result<()>` or `sync_all`, and keeps `Drop` as the best-effort fallback. A `Drop` body also runs during unwinding, which is why a guard local to the function is the place for panic safety: no caller can forget it, which is how `with_dma` and Prove it 3 stay sound on the unwind path (the same shape, a guard that restores an invariant in its `Drop`, keeps a half-finished unsafe operation memory-safe when a user callback panics; Chapter 30 returns to it with allocators).
- **Panicking in `Drop` during unwinding aborts the process.** The std docs: "this will likely abort the program"; measured on 1.97.0: `panic in a destructor during cleanup`, `thread caused non-unwinding panic. aborting.`, SIGABRT. A value whose `drop` panicked counts as dropped and must not be dropped again.
- **Leaks that are not bugs, and leaks that are.** `Box::leak` for program-lifetime data is fine. `forget` "to fix" a borrow error, or a forgotten `Drain`, is not. A counting allocator finds them in a test (`ALLOCS - DEALLOCS` across a region); heap profilers are Chapter 29.
- **The API-design rule.** If your `unsafe` code is only sound when a destructor runs, the API is unsound (RFC 1066: it is the fault of the type in question). Audit proxy types first. No public post-mortem beyond the 2015 `thread::scoped` issue is cited here, and none is invented.

</section>

<section data-section="frontier">

## The frontier

- The Reference says the temporary-lifetime-extension rules "are subject to change" and documents current behaviour only.
- `tail_expr_drop_order` exists because no semantics-preserving automatic rewrite was found (Edition Guide, RFC 3606): edition migrations of drop timing stay a manual review.
- Async has no sound scoped spawn because futures may be leaked (Chapter 2), and async drop is still unstable, so async cleanup has to be explicit (Chapter 8's wording).
- A version note from the `ManuallyDrop` docs: "Before Rust 1.96.0, if you had a `ManuallyDrop<T>`, where the type T was a Box or contained a Box inside, then dropping the T followed by moving the `ManuallyDrop<T>` was considered to be undefined behavior."
- The one place `Drop` carries a soundness promise today is `Pin`'s drop guarantee: the memory of a pinned value must not be "invalidated or otherwise repurposed during the lifespan of the pinned value until its drop returns or panics", and `mem::forgeting` a `Box<T>` "prevents its storage from ever getting re-used, so the drop guarantee is still satisfied". Chapter 8 teaches it; it is about memory reuse, not a general promise that destructors run. RFC 1066's open question about other such APIs stays open.

</section>

<section data-section="prove">

## Prove it

Answer first, then check. Each was compiled and run in `examples.py`.

**1. Order.** `fn f(a: Trace, (b, c): (Trace, Trace)) { let d = Trace("d"); }` called with fresh values. *`d c b a`*: the local, then the parameters in reverse, and inside the tuple pattern the bindings in reverse. The Reference's own `patterns_in_parameters` prints `3 2 0 1`.

**2. Held or not?** `let _ = lock.write().unwrap(); shared += 1;`. *rustc refuses it* (`let_underscore_lock`, deny by default): `_` binds nothing, so the guard is dropped at the semicolon. With the lint allowed, `try_read` succeeds after `let _` and fails after `let _g` and after `let _ = g;` (the last moves nothing).

**3. A sound design?** A `DmaGuard` that must be dropped to stop a device writing into a borrowed buffer. *Unsound*: a safe caller can `mem::forget` it. Redesign as `fn with_dma(buf: &mut [u8], f: impl FnOnce(&Dma))` (`f` is a closure argument that `with_dma` calls once) that stops the device before it returns, and also when `f` panics (a guard local to `with_dma`, which no caller can forget, or `catch_unwind`), or the redesign has the same hole on the unwind path. The DMA guard is a sketch; `Pin`'s drop guarantee is the one place `Drop` interacts with soundness, and only for memory reuse.

**4. Predict the outcome.** `{ let a = Trace("a"); let b = Trace("b"); drop(a); let c = Trace("c"); }`. *`a c b`*: `drop(a)` runs at once; then the brace drops `c`, then `b`.

**5. Debug this.** A `Stage` whose `spill` directory guard is declared before a field whose `Drop` writes a trailer into that directory. *The trailer write fails* because the directory is already gone (measured: `Err`); declare the field that needs the directory before the guard that removes it, and the write succeeds.

**6. Estimate the cost.** A service `forget`s one `SpillFile` per failed request to dodge a borrow error. Each leak is one heap allocation (the path's bytes; the 24-byte `PathBuf` handle itself is reclaimed with the forgotten variable, as the `forget` docs say), one descriptor and one file on disk (measured). At a soft limit of 1,024 descriptors (systemd's `DefaultLimitNOFILE=` "defaults to 1024") with three already taken by stdin, stdout and stderr, it stops opening files after fewer than 1,021 failures once its listening socket, connections and log files are counted, long before memory matters.

**7. Defend a design.** `fn with_spill<R>(f: impl FnOnce(&mut SpillFile) -> R) -> io::Result<R>` (a closure argument, called once) against returning a `SpillFile` guard. Both are *safe* designs, since a leaked `SpillFile` only wastes a descriptor. Return the guard for flexibility; use the closure form only when something must happen afterwards (a trailer, a rename into place), and never because you need `Drop` for soundness.

</section>

<section data-section="next">

## Where this goes next

A type with `Drop` keeps its fields until it dies. Next: how do you take one field out early, say to hand a buffer (`Buf`) back to its pool (`Pool`) from inside a guard?

</section>
