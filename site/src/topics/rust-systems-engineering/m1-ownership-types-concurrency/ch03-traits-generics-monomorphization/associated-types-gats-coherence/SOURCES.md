# Sources: Associated types, GATs, and coherence

## Advanced Traits - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch20-02-advanced-traits.html
Version: online edition, no edition number or date shown on the page

> The associated type is named Item and stands in for the type of the values the type implementing the Iterator trait is iterating over.

> With associated types, we don't need to annotate types, because we can't implement a trait on a type multiple times. In Listing 20-13 with the definition that uses associated types, we can choose what the type of Item will be only once because there can be only one impl Iterator for Counter.

Contents (item by item):
- `Iterator`'s associated `Item` stands in for the type of value the implementor iterates over
- an associated type is chosen only once because a type can have only one impl of a given trait
- a trait can have at most one implementation for any given type (the basis of the duplicate-impl failure this topic reproduces)

## Defining Shared Behavior with Traits - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch10-02-traits.html
Version: online edition, no edition number or date shown on the page

> Implementations of a trait on any type that satisfies the trait bounds are called blanket implementations and are used extensively in the Rust standard library. For example, the standard library implements the ToString trait on any type that implements the Display trait.

Contents (item by item):
- a blanket implementation implements a trait for every type that satisfies a stated trait bound, in one declaration
- the standard library's own `impl<T: Display> ToString for T` is the canonical example

## Associated items - The Rust Reference
URL: https://doc.rust-lang.org/reference/items/associated-items.html
Version: online edition, section id `[items.associated.type.generic]`, no date shown on the page

> Associated types may include generic parameters and where clauses; these are often referred to as generic associated types, or GATs.

> trait LendingIterator { type Item<'x> where Self: 'x; fn next<'a>(&'a mut self) -> Self::Item<'a>; }

> In the above, on the next function, we can prove that Self: 'a, because of the implied bounds from &'a mut self; therefore, we must write the equivalent bound on the GAT itself: where Self: 'x.

Contents (item by item):
- an associated type that itself takes generic parameters (commonly a lifetime) is a generic associated type (GAT)
- the Reference's own canonical example of a GAT is exactly a `LendingIterator` whose `Item<'x>` is bound by `where Self: 'x`
- a GAT's own `where Self: 'x` bound is required because it must match what can be proven at the point the GAT is actually used in the trait's methods

## Implementations - The Rust Reference
URL: https://doc.rust-lang.org/reference/items/implementations.html
Version: online edition, section id `[items.impl.trait.orphan-rule]`, no date shown on the page

> The orphan rule states that a trait implementation is only allowed if either the trait or at least one of the types in the implementation is defined in the current crate. It prevents conflicting trait implementations across different crates and is key to ensuring coherence.

> An orphan implementation is one that implements a foreign trait for a foreign type. If these were freely allowed, two crates could implement the same trait for the same type in incompatible ways, creating a situation where adding or updating a dependency could break compilation due to conflicting implementations.

Contents (item by item):
- the orphan rule: an impl is allowed only if the trait or at least one of its types is defined in the current crate
- an orphan impl is one that implements a foreign trait for a foreign type, which the rule forbids
- the orphan rule exists to guarantee coherence: exactly one impl of any trait for any type can ever exist, program-wide
