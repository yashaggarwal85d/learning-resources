# Sources: Trait objects, vtables, and dyn compatibility

## Trait object types - The Rust Reference
URL: https://doc.rust-lang.org/reference/types/trait-object.html
Version: online edition, section id `[type.trait-object]`, no date shown on the page

> Due to the opaqueness of which concrete type the value is of, trait objects are dynamically sized types. Like all DSTs, trait objects are used behind some type of pointer; for example &dyn SomeTrait or Box<dyn SomeTrait>. Each instance of a pointer to a trait object includes:

> a pointer to an instance of a type T that implements SomeTrait

> a virtual method table, often just called a vtable, which contains, for each method of SomeTrait and its supertraits that T implements, a pointer to T's implementation (i.e. a function pointer).

> The purpose of trait objects is to permit "late binding" of methods. Calling a method on a trait object results in virtual dispatch at runtime: that is, a function pointer is loaded from the trait object vtable and invoked indirectly.

Contents (item by item):
- a pointer to a trait object is two parts: a pointer to the concrete data, and a pointer to a vtable
- the vtable holds one function pointer per method of the trait (and its supertraits) that the concrete type implements
- calling a method on a trait object loads a function pointer from the vtable at run time and invokes it indirectly ("late binding")

## Traits - The Rust Reference
URL: https://doc.rust-lang.org/reference/items/traits.html
Version: online edition, section id `[items.traits.dyn-compatible]`, no date shown on the page

> A dyn-compatible trait can be the base trait of a trait object. A trait is dyn compatible if it has the following qualities:

> All associated functions must either be dispatchable from a trait object or be explicitly non-dispatchable: Dispatchable functions must: Not have any type parameters (although lifetime parameters are allowed). Be a method that does not use Self except in the type of the receiver. Have a receiver with one of the following types: &Self (i.e. &self) &mut Self (i.e &mut self) Box<Self> Rc<Self> Arc<Self> Pin<P> where P is one of the types above

> Explicitly non-dispatchable functions require: Have a where Self: Sized bound (receiver type of Self (i.e. self) implies this).

> This concept was formerly known as object safety.

Contents (item by item):
- a dyn-compatible trait's associated functions must each be either dispatchable from a trait object or explicitly marked non-dispatchable
- a dispatchable method must take no type parameters and must not use `Self` except as its own receiver's type
- a method is made explicitly non-dispatchable (excluded from the vtable) by adding a `where Self: Sized` bound to it
- "dyn compatible" is the Reference's current name for what was formerly called "object safety"

## Rust 1.86.0 release notes - the Rust blog / RELEASES.md
URL: https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md
Version: Version 1.86.0 (2025-04-03) section

> Version 1.86.0 (2025-04-03)

> Stabilize upcasting trait objects to supertraits.

Contents (item by item):
- upcasting trait objects to supertraits (converting `&dyn Sub` to `&dyn Super` directly) was stabilized in Rust 1.86.0, released 2025-04-03
