# Sources: Lifetimes as constraints, not durations

## Lifetime elision - The Rust Reference
URL: https://doc.rust-lang.org/reference/lifetime-elision.html
Version: online edition, section id `[lifetime-elision]`, no date shown on the page

The three function-elision rules, quoted in full:

> Each elided lifetime in the parameters becomes a distinct lifetime parameter.

> If there is exactly one lifetime used in the parameters (elided or not), that lifetime is assigned to all elided output lifetimes.

> If the receiver has type &Self or &mut Self, then the lifetime of that reference to Self is assigned to all elided output lifetime parameters.

The illegal cases:

> // Cannot infer, because there are no parameters to infer from.
> fn get_str() -> &str; // ILLEGAL

> // Cannot infer, ambiguous if it is borrowed from the first or second parameter.
> fn frob(s: &str, t: &str) -> &str; // ILLEGAL

It is an error to elide a lifetime that cannot be inferred:

> It is an error to elide lifetime parameters that cannot be inferred.

const/static elision:

> Both constant and static declarations of reference types have implicit 'static lifetimes unless an explicit lifetime is specified.

Contents (item by item):
- the three elision rules for function/method signatures (each elided parameter lifetime distinct; one input lifetime assigned to all elided outputs; `&self`/`&mut self` receiver's lifetime assigned to all elided outputs)
- the two illegal cases: no reference parameters to infer from, and an ambiguous choice between two reference parameters
- the `'_` placeholder as an explicit way to request the same elision
- const/static declarations of reference types get an implicit `'static` lifetime unless written otherwise

## Subtyping and Variance - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/subtyping.html
Version: online edition, no edition number or date shown on the page

The three kinds of variance, quoted exactly:

> F is covariant if F<Sub> is a subtype of F<Super> (the subtype property is passed through)

> F is contravariant if F<Super> is a subtype of F<Sub> (the subtype property is "inverted")

> F is invariant otherwise (no subtyping relationship exists)

The two facts this topic turns into a worked example:

> it was ok for us to treat &'a T as a subtype of &'b T if 'a <: 'b, therefore we can say that &'a T is covariant over 'a.

> we saw that it was not ok for us to treat &mut &'a T as a subtype of &mut &'b T, therefore we can say that &mut T is invariant over T

The variance table's relevant rows:

> &'a T  covariant  covariant

> &'a mut T  covariant  invariant

> Cell<T>  invariant

> UnsafeCell<T>  invariant

Why Cell follows UnsafeCell's variance:

> Cell<T> and all other interior mutability types follow the same logic as UnsafeCell<T>

> UnsafeCell<T> having interior mutability gives it the same variance properties as &mut T

The worked "invariance bites" example, quoted for the claim this topic reproduces:

> Because &mut T is invariant over T, the compiler concludes it can't apply any subtyping to the first argument, and so T must be exactly &'static str.

> since &'a T is covariant over 'a, we are allowed to perform subtyping. So the compiler decides that &'static str can become &'b str if and only if &'static str is a subtype of &'b str, which will hold if 'static <: 'b.

Contents (item by item):
- the definitions of covariant, contravariant and invariant
- `&'a T` is covariant over `'a`; `&'a mut T` is invariant over `T` (and covariant over `'a`)
- `Cell<T>`/`UnsafeCell<T>` are invariant over `T`, because interior mutability gives them `&mut T`'s variance
- the `assign::<T>` worked example: passing `&mut &'static str` and `&mut &'b str` forces `T = &'static str` exactly (invariance), while passing `&'static str` and `&'b str` by value to a `T: Debug` function compiles (covariance lets `'static` shrink to `'b`)
- the struct-field composition rule: a type parameter used in only covariant positions is covariant; invariance in any one field makes the whole type invariant over that parameter

## Higher-Rank Trait Bounds (HRTBs) - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/hrtb.html
Version: online edition, no edition number or date shown on the page

> for<'a> can be read as "for all choices of 'a", and basically produces an infinite list of trait bounds that F must satisfy.

> where for<'a> F: Fn(&'a (u8, u16)) -> &'a u8,

> the lifetime we care about can't be named until we enter the body of call! Also, that isn't some fixed lifetime; call works with any lifetime &self happens to have at that point.

Contents (item by item):
- why an ordinary named lifetime parameter can't express "works for whatever lifetime the caller's `&self` turns out to have"
- the `for<'a> F: Fn(&'a (u8, u16)) -> &'a u8` desugaring and its reading, "for all choices of `'a`"
- that `Fn(a) -> b` is itself sugar that already carries an implicit `for<'a>` when no explicit one is written

## Static - Rust By Example
URL: https://doc.rust-lang.org/rust-by-example/scope/lifetime/static_lifetime.html
Version: online edition, no date shown on the page

> As a reference lifetime 'static indicates that the data pointed to by the reference lives for the remaining lifetime of the running program. It can still be coerced to a shorter lifetime.

> As a trait bound, it means the type does not contain any non-static references. Eg. the receiver can hold on to the type for as long as they want and it will never become invalid until they drop it.

> any owned data always passes a 'static lifetime bound, but a reference to that owned data generally does not

The worked compile-fail this topic reproduces:

> // oops, &i only has the lifetime defined by the scope of
> // main(), so it's not 'static:
> print_it(&i);

> error[E0597]: `i` does not live long enough

Contents (item by item):
- `&'static T`: the referent lives for the rest of the running program; can still be coerced to a shorter lifetime
- `T: 'static` as a bound: `T` contains no non-`'static` references, not a claim about how long a value of `T` actually lives
- owned data (no references inside it) always satisfies a `'static` bound; a reference to local data generally does not
- `Box::leak` as a way to mint a genuine `&'static` reference to data created at run time
