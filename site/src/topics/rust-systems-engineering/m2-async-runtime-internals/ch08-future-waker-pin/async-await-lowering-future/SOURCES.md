# Sources — async/await lowering and future size

## Block expressions — async blocks (The Rust Reference)
URL: https://doc.rust-lang.org/reference/expressions/block-expr.html
Version: fetched 2026-10-23

> Executing an async block is similar to executing a closure expression: its immediate effect is to produce and return an anonymous type.

> The future type that rustc generates is roughly equivalent to an enum with one variant per await point, where each variant stores the data needed to resume from its corresponding point.

> Async blocks capture variables from their environment using the same capture modes as closures.

Contents:
- the reference's own statement that executing an async block, like a closure, produces an anonymous type rather than running anything
- the reference's own characterization of the generated type's shape: an enum, one variant per await point, each variant holding exactly what that point needs to resume
- the reference's own statement of capture semantics: an async block captures from its environment the same way a closure does, which is exactly how a captured value's own traits (or lack of them) end up inside the generated type

## Await expressions (The Rust Reference)
URL: https://doc.rust-lang.org/reference/expressions/await-expr.html
Version: fetched 2026-10-23

> An await expression is a syntactic construct for suspending a computation provided by an implementation of std::future::IntoFuture until the given future is ready to produce a value.

> If the call to poll returns Poll::Pending, then the future returns Poll::Pending, suspending its state so that, when the surrounding async context is re-polled, execution returns to step 3

Contents:
- the reference's own definition of what `.await` actually is: a suspension point, not a blocking call, built directly on `poll`
- the reference's own approximate desugaring showing the suspend-and-resume loop explicitly, naming the exact point execution resumes from on a later poll — the mechanism each suspension-state enum variant exists to capture

## Send (std::marker)
URL: https://doc.rust-lang.org/std/marker/trait.Send.html
Version: Rust std 1.99.1

> This trait is automatically implemented when the compiler determines it's
appropriate.

> An example of a non-Send type is the reference-counting pointer
rc::Rc.

Contents:
- `Send`'s own statement that it is an auto trait: never written by hand, derived structurally by the compiler from whether a type is actually appropriate — exactly the mechanism that decides whether a compiler-generated suspension-state enum is `Send`
- the trait's own canonical non-`Send` example, `Rc`, used directly as the value this topic holds across an `.await` point to make the whole future `!Send`
