# Sources: Monomorphization and its costs

## Generic Data Types - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch10-01-syntax.html
Version: online edition, no edition number or date shown on the page

> You might be wondering whether there is a runtime cost when using generic type parameters. The good news is that using generic types won't make your program run any slower than it would with concrete types.

> Rust accomplishes this by performing monomorphization of the code using generics at compile time. Monomorphization is the process of turning generic code into specific code by filling in the concrete types that are used when compiled.

> The compiler looks at all the places where generic code is called and generates code for the concrete types the generic code is called with.

> Because Rust compiles generic code into code that specifies the type in each instance, we pay no runtime cost for using generics. When the code runs, it performs just as it would if we had duplicated each definition by hand. The process of monomorphization makes Rust's generics extremely efficient at runtime.

Contents (item by item):
- generics carry no runtime cost because the compiler performs monomorphization
- monomorphization: turning generic code into specific code by filling in the concrete types actually used at compile time
- the compiler looks at every call site and generates code for the concrete types used there
- the worked `Option<T>` example, expanded by the compiler into one specialized definition per concrete type used (`i32`, `f64`)

## Defining Shared Behavior with Traits - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch10-02-traits.html
Version: online edition, no edition number or date shown on the page

> The impl Trait syntax works for straightforward cases but is actually syntax sugar for a longer form known as a trait bound; it looks like this:

> Using impl Trait is appropriate if we want this function to allow item1 and item2 to have different types (as long as both types implement Summary). If we want to force both parameters to have the same type, however, we must use a trait bound, like this:

Contents (item by item):
- `impl Trait` in argument position is sugar for a trait-bounded generic parameter (`<T: Trait>`)
- the one case `impl Trait` in argument position cannot express that a named generic parameter can: forcing two parameters to share the same concrete type (`impl Trait` on each parameter lets them differ; `<T: Trait>` used on both does not)

## Impl trait type - The Rust Reference
URL: https://doc.rust-lang.org/reference/types/impl-trait.html
Version: online edition, section id `[type.impl-trait]`, no date shown on the page

> impl Trait provides ways to specify unnamed but concrete types that implement a specific trait. It can appear in two sorts of places: argument position (where it can act as an anonymous type parameter to functions), and return position (where it can act as an abstract return type).

> That is, impl Trait in argument position is syntactic sugar for a generic type parameter like <T: Trait>, except that the type is anonymous and doesn't appear in the GenericParams list.

> For function parameters, generic type parameters and impl Trait are not exactly equivalent. With a generic parameter such as <T: Trait>, the caller has the option to explicitly specify the generic argument for T at the call site using GenericArgs, for example, foo::<usize>(1). Changing a parameter from either one to the other can constitute a breaking change for the callers of a function, since this changes the number of generic arguments.

> Functions can use impl Trait to return an abstract return type. These types stand in for another concrete type where the caller may only use the methods declared by the specified Trait.

> Each possible return value from the function must resolve to the same concrete type.

> impl Trait in return position allows a function to return an unboxed abstract type.

Contents (item by item):
- `impl Trait` in argument position: an anonymous type parameter, sugar for `<T: Trait>`, chosen by the caller
- `impl Trait` in argument position is not fully equivalent to a named generic parameter: the caller cannot explicitly supply the type via `foo::<usize>(1)` syntax, since the parameter has no name
- `impl Trait` in return position: the function itself picks one concrete type and every return path must resolve to that same concrete type; the caller only sees the trait's interface
- return-position `impl Trait` avoids heap allocation and dynamic dispatch that a boxed trait object (`Box<dyn Fn(i32) -> i32>`) would require for the same closure-returning use case
