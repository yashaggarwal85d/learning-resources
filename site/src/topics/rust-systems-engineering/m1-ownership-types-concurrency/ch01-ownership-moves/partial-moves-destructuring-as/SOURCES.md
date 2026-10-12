# Sources — Partial moves and destructuring as transfer

## All the Places Patterns Can Be Used - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch19-01-all-the-places-for-patterns.html
Version: current stable docs, fetched 2026-10-12
> Every time you’ve used a let statement like this you’ve been using patterns, although you might not have realized it!

> Rust compares the expression against the pattern and assigns any names it finds.

> Listing 19-1: Using a pattern to destructure a tuple and create three variables at once

> You can think of this tuple pattern as nesting three individual variable patterns inside it.

> The particular pattern _ will match anything, but it never binds to a variable, so it’s often used in the last match arm.

> In a for loop, the value that directly follows the keyword for is a pattern.

> Function parameters can also be patterns.

Contents:
- Patterns appear in match arms, let statements, if let, while let, for loops and function parameters.
- A bare variable name is the simplest pattern; let destructures tuples with a pattern like (x, y, z).
- match must be exhaustive; _ matches anything without binding.
- Mismatched element counts give E0308; fix with _ or ...
- Does not cover ref/ref mut (not mentioned on this page).

## Pattern Syntax - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch19-03-pattern-syntax.html
Version: current stable docs, fetched 2026-10-12
> We can also use patterns to destructure structs, enums, and tuples to use different parts of these values.

> This example shows that the names of the variables in the pattern don’t have to match the field names of the struct.

> Rust has a shorthand for patterns that match struct fields: You only need to list the name of the struct field, and the variables created from the pattern will have the same names.

> Listing 19-12: Destructuring a struct’s fields into separate variables

> This code lets us break complex types into their component parts so that we can use the values we’re interested in separately.

> The syntax _x still binds the value to the variable, whereas _ doesn’t bind at all.

> Listing 19-21: An unused variable starting with an underscore still binds the value, which might take ownership of the value.

> We’ll receive an error because the s value will still be moved into _s, which prevents us from using s again.

> However, using the underscore by itself doesn’t ever bind to the value.

> This code works just fine because we never bind s to anything; it isn’t moved.

> With values that have many parts, we can use the .. syntax to use specific parts and ignore the rest, avoiding the need to list underscores for each ignored value.

> The at operator @ lets us create a variable that holds a value at the same time we’re testing that value for a pattern match.

> Using @ lets us test a value and save it in a variable within one pattern.

Contents:
- Struct destructuring with renaming (Point { x: a, y: b }) and field shorthand (Point { x, y }).
- Enum variants and nested struct/tuple destructuring.
- _x binds (and moves) while _ does not bind; Listings 19-21 and 19-22 show the move error vs. success on Option<String>.
- .. ignores remaining parts; @ bindings test and bind.
- This page does not discuss ref / ref mut or Rust 2024 binding-mode reservations (checked: not present).

## Running Code on Cleanup with the Drop Trait - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch15-03-drop.html
Version: current stable docs, fetched 2026-10-12
> The Drop trait requires you to implement one method named drop that takes a mutable reference to self.

> Rust automatically called drop for us when our instances went out of scope, calling the code we specified. Variables are dropped in the reverse order of their creation, so d was dropped before c.

> Rust doesn’t let you call the Drop trait’s drop method manually; instead, you have to call the std::mem::drop function provided by the standard library if you want to force a value to be dropped before the end of its scope.

> error[E0040]: explicit use of destructor method

> This error message states that we’re not allowed to explicitly call drop.

> Rust doesn’t let us call drop explicitly, because Rust would still automatically call drop on the value at the end of main. This would cause a double free error because Rust would be trying to clean up the same value twice.

> The Drop trait is included in the prelude, so we don’t need to bring it into scope.

Contents:
- Drop::drop takes &mut self and runs automatically at scope end, in reverse declaration order.
- Calling c.drop() is error E0040; use std::mem::drop(c) instead (takes ownership by move).
- Reason given: a manual call would cause a double free.

## Vec in std::vec - Rust
URL: https://doc.rust-lang.org/std/vec/struct.Vec.html
Version: current stable docs, fetched 2026-10-12
> Constructs a new, empty Vec<T>.

> The vector will not allocate until elements are pushed onto it.

> Creates an empty Vec<T>.

> Removes an element from the vector and returns it.

> The removed element is replaced by the last element of the vector.

> This does not preserve ordering of the remaining elements, but is O(1). If you need to preserve the element order, use remove instead.

> Removes and returns the element at position index within the vector, shifting all elements after it to the left.

> Because this shifts over the remaining elements, it has a worst-case performance of O(n).

> Removes the last element from a vector and returns it, or None if it is empty.

> Removes the subslice indicated by the given range from the vector, returning a double-ended iterator over the removed subslice.

> If the iterator is dropped before being fully consumed, it drops the remaining removed elements.

> The returned iterator keeps a mutable borrow on the vector to optimize its implementation.

> If the returned iterator goes out of scope without being dropped (due to mem::forget, for example), the vector may have lost and leaked elements arbitrarily, including elements outside the range.

Contents:
- Vec::new is const and creates an empty Vec that does not allocate until a push; the Default impl (`impl<T> Default for Vec<T>`) says the same.
- pop(&mut self) -> Option<T>: removes last element, None if empty.
- swap_remove(&mut self, index) -> T: O(1), replaces with last element, panics if out of bounds, does not preserve order.
- remove(&mut self, index) -> T: shifts left, O(n), panics if out of bounds.
- drain(range) -> Drain: removes a subrange, iterator holds a mutable borrow; leaks possible under mem::forget.
- All of these move elements out of a Vec through &mut self, the supported alternative to moving out of an index (E0507).

## String in std::string - Rust
URL: https://doc.rust-lang.org/std/string/struct.String.html
Version: current stable docs, fetched 2026-10-12
> Creates a new empty String.

> Given that the String is empty, this will not allocate any initial buffer.

> Creates an empty String.

Contents:
- String::new is const and does not allocate an initial buffer; may cause extra allocation later (see with_capacity).
- `impl Default for String` (default() -> String) creates an empty String; this is what mem::take leaves behind.

## Match ergonomics reservations - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/match-ergonomics.html
Version: current stable docs (Rust 2024 edition guide), fetched 2026-10-12

> Writing mut, ref, or ref mut on a binding is only allowed within a pattern when the pattern leading up to that binding is fully explicit (i.e. when it does not use match ergonomics).

> Put differently, when the default binding mode is not move, writing mut, ref, or ref mut on a binding is an error.

> Reference patterns (& or &mut) are only allowed within the fully-explicit prefix of a pattern.

> Put differently, reference patterns can only match against references in the scrutinee when the default binding mode is move.

> let &[&mut [ref x]] = &[&mut [()]]; // x: &()

> Such a pattern is called fully explicit because it does not elide (i.e. “skip” or “pass”) any references within the scrutinee. By contrast, this otherwise-equivalent pattern is not fully explicit:

> let [[x]] = &[&mut [()]]; // x: &()

> Patterns such as this are said to be using match ergonomics, originally introduced in RFC 2005.

> Under match ergonomics, as we incrementally match a pattern against a scrutinee, we keep track of the default binding mode. This mode can be one of move, ref mut, or ref, and it starts as move.

> let ref x = (); // &()

> Here, in the pattern, we pass the outer shared reference in the scrutinee. This causes the default binding mode to switch from move to ref. Since there is no explicit binding mode specified, the ref binding mode is used when binding x.

> let [x, mut y] = &[(), ()]; // x: &(), mut y: ()

> But then, in these editions, writing mut on the binding resets the default binding mode to move.

> To leave space to fix this, in Rust 2024 it’s an error to write mut on a binding when the default binding mode is not move. That is, mut can only be written on a binding when the pattern (leading up to that binding) is fully explicit.

> let &[ref x, mut y] = &[(), ()]; // x: &(), mut y: ()

> let [ref x] = &[()]; // x: &()

> To leave space for other language possibilities, we are disallowing explicit binding modes where they are redundant in Rust 2024.

> let [&x, y] = &[&(), &()]; // x: (), y: &&()

> Here, the & in the pattern both matches against the reference on &() and resets the default binding mode to move.

> To leave space to fix this, in Rust 2024 it’s an error to write & or &mut in the pattern when the default binding mode is not move. That is, & or &mut can only be written when the pattern (leading up to that point) is fully explicit.

> let &[&x, ref y] = &[&(), &()];

> The rust_2024_incompatible_pat lint flags patterns that are not allowed in Rust 2024. This lint is part of the rust-2024-compatibility lint group which is automatically applied when running cargo fix --edition. This lint will automatically convert affected patterns to fully explicit patterns that work correctly in Rust 2024 and in all prior editions.

> let &[ref x] = &[()];

> // Add this to the root of your crate to do a manual migration.

> #![warn(rust_2024_incompatible_pat)]

Contents:
- Summary: mut / ref / ref mut on a binding only allowed when the pattern leading to it is fully explicit; & / &mut reference patterns only allowed in the fully-explicit prefix (i.e. only when default binding mode is move).
- Details/Background: fully explicit pattern vs match ergonomics (RFC 2005); default binding mode is move, ref mut or ref, starts as move; explicit `ref x` vs `[x] = &[()]` giving ref mode.
- mut restriction: 2021 and earlier `let [x, mut y] = &[(), ()];` resets mode to move (surprising); 2024 makes it an error; write `let &[ref x, mut y] = &[(), ()];`.
- ref / ref mut restriction: `let [ref x] = &[()];` redundant explicit ref is disallowed in 2024; write `let [x] = &[()];`.
- Reference patterns restriction: `let [&x, y] = &[&(), &()];` (x: (), y: &&()) disallowed in 2024; write `let &[&x, ref y] = &[&(), &()];`.
- Migration: lint `rust_2024_incompatible_pat` (in group `rust-2024-compatibility`), run `cargo fix --edition`; auto-rewrites to fully explicit patterns (`let &[ref x, mut y] = ...; let &[ref x] = ...; let &[&x, ref y] = ...;`); manual: `#![warn(rust_2024_incompatible_pat)]`.

## 2005-match-ergonomics - The Rust RFC Book
URL: https://rust-lang.github.io/rfcs/2005-match-ergonomics.html
Version: RFC 2005, feature name pattern-binding-modes, start date 2016-08-12, tracking issue rust-lang/rust#42640; page fetched 2026-10-12

> Better ergonomics for pattern-matching on references.

> This is accomplished through automatic dereferencing and the introduction of default binding modes.

> getting the correct combination of *, &, and ref to satisfy the type and borrow checkers is a common problem, and one which is often encountered early by Rust beginners.

> If the type of x does not have the Copy bound, then this will give a borrow check error. We must use the ref keyword to take a reference: E::Foo(ref x) (or &E::Foo(ref x) if we match e rather than *e).

> The ref keyword is a pain for Rust beginners, and a bit of a wart for everyone else.

> Rather than using auto-deref and auto-referencing, this RFC introduces default binding modes used when a reference value is matched by a non-reference pattern.

> When an auto-dereference occurs, the compiler will automatically treat the inner bindings as ref or ref mut bindings.

> Note that this RFC applies to all instances of pattern-matching, not just match expressions:

> A reference pattern is any pattern which can match a reference without coercion. Reference patterns include bindings, wildcards (_), consts of reference types, and patterns beginning with & or &mut. All other patterns are non-reference patterns.

> Default binding mode: this mode, either move, ref, or ref mut, is used to determine how to bind new pattern variables. When the compiler sees a variable binding not explicitly marked ref, ref mut, or mut, it uses the default binding mode to determine how the variable should be bound. Currently, the default binding mode is always move. Under this RFC, matching a reference with a non-reference pattern, would shift the default binding mode to ref or ref mut.

> The default binding mode starts out as move. When matching a pattern, the compiler starts from the outside of the pattern and works inwards. Each time a reference is matched using a non-reference pattern, it will automatically dereference the value and update the default binding mode:

> If the reference encountered is &val, set the default binding mode to ref.

> If the reference encountered is &mut val: if the current default binding mode is ref, it should remain ref. Otherwise, set the current binding mode to ref mut.

> If the automatically dereferenced value is still a reference, it is dereferenced and this process repeats.

> Note that there is no exit from the ref binding mode. This is because an &mut inside of a & is still a shared reference, and thus cannot be used to mutate the underlying value.

> Also note that no transitions are taken when using an explicit ref or ref mut binding. The default binding mode only changes when matching a reference with a non-reference pattern.

> // `p` is a variable binding. Hence, this is **not** a ref-defaulting

> // match, and `p` is bound with `move` semantics

> // (and has type `&Option<i32>`).

> // In the second half of the tuple there's no non-reference pattern,

> // so `b` will be `i32` (bound with `move` mode). Moreover, `b` is

> let Foo(x) = &Foo(3);

> let &Foo(ref x) = &Foo(3);

> In order to guarantee backwards-compatibility, this proposal only modifies pattern-matching when a reference is matched with a non-reference pattern, which is an error today.

> We could allow writing move in patterns. Without this, move, unlike ref and ref mut, would always be implicit, leaving no way override a default binding mode of ref or ref mut and move the value out from behind a reference.

> However, moving a value out from behind a shared or mutable reference is only possible for Copy types, so this would not be particularly useful in practice, and would add unnecessary complexity to the language.

> In the future, this RFC could be extended to add support for autodereferencing custom smart-pointer types using the Deref and DerefMut traits.

> future DerefMove trait or similar.

Contents:
- Summary: matching on references currently needs `&Some(ref y)` or `*x`; after the RFC `match x { Some(y) => ... }` works, y a reference; done via auto-deref and default binding modes.
- Motivation: ergonomics vs explicitness; `*`, `&`, `ref` "type Tetris"; `ref` is a wart and confused with `&`; moving non-Copy out of `*e` is a borrow-check error.
- Detailed design: default binding modes used when a reference is matched by a non-reference pattern; applies to match, let, etc. (`let Foo(x) = foo_ref;`).
- Definitions: reference pattern vs non-reference pattern; default binding mode (move / ref / ref mut).
- Binding mode rules: start move; &val gives ref; &mut val gives ref mut unless already ref; repeat while still a reference; no exit from ref; explicit ref/ref mut cause no transitions; state diagram.
- Examples: plain binding `p` stays move; `Some(p)` becomes `ref p`; or-patterns treated independently; tuple `(Some(a), &Some(mut b))` mixes modes; multiple dereferences; nested references; `&mut x` giving `ref mut y`; `let Foo(x) = &Foo(3)` desugars to `let &Foo(ref x) = &Foo(3)`.
- Backwards compatibility: only changes ref-matched-by-non-ref-pattern (previously an error); unknown inference variable types assumed non-reference (move mode).
- How We Teach This / Drawbacks / Future Extensions (Box via Deref, DerefMove) / Alternatives (infer only ref; explicit mut confusing; auto-ref; allow writing `move` in patterns).

## E0509 - Error codes index
URL: https://doc.rust-lang.org/error_codes/E0509.html
Version: current stable docs, fetched 2026-10-12

> This error occurs when an attempt is made to move out of a value whose type implements the Drop trait.

> let fancy_field = drop_struct.fancy; // Error E0509

> However, a struct cannot be dropped if one or more of its fields have been moved.

> This destructor may use the fields of the struct, so moving out of the struct could make it impossible to run the destructor.

> Therefore, we must think of all values whose type implements the Drop trait as single units whose fields cannot be moved.

> This error can be fixed by creating a reference to the fields of a struct, enum, or tuple using the ref keyword:

> let ref fancy_field = drop_struct.fancy; // No more errors!

> Note that this technique can also be used in the arms of a match expression:

> DropEnum::Fancy(ref fancy_field) => // No error!

Contents:
- Error occurs when moving a field out of a value whose type implements Drop.
- Erroneous example: `DropStruct` (impl Drop) with field `fancy: FancyNum`; `let fancy_field = drop_struct.fancy;` fails.
- Reason: the implicit destructor may use the fields, so a Drop type is a single unit whose fields cannot be moved.
- Fix 1: bind by reference with `let ref fancy_field = drop_struct.fancy;`.
- Fix 2: same technique in match arms on a Drop enum: `DropEnum::Fancy(ref fancy_field) => ...`.

## E0507 - Error codes index
URL: https://doc.rust-lang.org/error_codes/E0507.html
Version: current stable docs, fetched 2026-10-12

> A borrowed value was moved out.

> x.borrow().nothing_is_true(); // error: cannot move out of borrowed content

> self cannot be moved because .borrow() only provides an &TheDarkKnight, which is a borrow of the content owned by the RefCell.

> Try to avoid moving the variable.

> Somehow reclaim the ownership.

> Implement the Copy trait on the type.

> This can also happen when using a type implementing Fn or FnMut, as neither allows moving out of them (they usually represent closures which can be called more than once).

> fn nothing_is_true(&self) {} // First case, we don't take ownership

> let x = x.into_inner(); // we get back ownership

> Moving a member out of a mutably borrowed struct will also cause E0507 error:

> borrowed.knight.nothing_is_true(); // E0507

> It is fine only if you put something back. mem::replace can be used for that:

> mem::replace(&mut borrowed.knight, TheDarkKnight).nothing_is_true(); // ok!

Contents:
- Moving a value out from behind a borrow (e.g. RefCell::borrow gives &T) is E0507.
- Three fixes: avoid moving (take &self), reclaim ownership (RefCell::into_inner), or implement Copy.
- Also applies to Fn/FnMut closure bodies, which can be called more than once.
- Moving a field out of `&mut Batcave` (`borrowed.knight.nothing_is_true()`) is E0507.
- Fix: mem::replace(&mut borrowed.knight, TheDarkKnight) puts a replacement back.

## E0382 - Error codes index
URL: https://doc.rust-lang.org/error_codes/E0382.html
Version: current stable docs, fetched 2026-10-12

> A variable was used after its contents have been moved elsewhere.

> Since MyStruct is a type that is not marked Copy, the data gets moved out of x when we set y.

> This is fundamental to Rust’s ownership system: outside of workarounds like Rc, a value cannot be owned by more than one variable.

> Sometimes we don’t need to move the value. Using a reference, we can let another function borrow the value without changing its ownership.

> Sometimes we don’t want a reference, but a duplicate. All types marked Clone can be duplicated by calling .clone().

> We can mark our own types Copy if all their members also are marked Copy.

> Alternatively, if we don’t control the struct’s definition, or mutable shared ownership is truly required, we can use Rc and RefCell:

> RefCell essentially performs runtime borrow checking: ensuring that at most one writer or multiple readers can access the data at any one time.

Contents:
- Use after move; erroneous example moves `x` into `y` then assigns `x.s = 6`.
- Fixes: borrow with & / &mut; clone with .clone() (#[derive(Clone)]); derive Copy when all members are Copy (Point example); Rc<RefCell<_>> for shared mutable ownership.

## Drop Flags - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/drop-flags.html
Version: current stable docs, fetched 2026-10-12

> Rust needs to know whether to call a destructor whenever a variable is assigned to, or a variable goes out of scope.

> assigning through a dereference unconditionally drops, and assigning in a let unconditionally doesn’t drop:

> It turns out that Rust actually tracks whether a type should be dropped or not at runtime.

> As a variable becomes initialized and uninitialized, a drop flag for that variable is toggled.

> code has such static drop semantics:

> However code like this requires runtime information to correctly Drop:

> // x goes out of scope; x might be uninit; // check the flag!

> The drop flags are tracked on the stack. In old Rust versions, drop flags were stashed in a hidden field of types that implement Drop.

Contents:
- Conditional initialization/deinitialization/reinitialization is safe; Rust must know when to run destructors.
- `*y = ...` always drops (referent assumed initialized); `let` never drops.
- Drop flags are toggled at runtime as a variable is initialized/uninitialized.
- Straight-line and uniformly-branching code has static drop semantics (no flag needed); conditional init (`let x; if condition { x = ... }`) needs the flag.
- Flags live on the stack; formerly hidden in a field of Drop types.

## Destructors - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/destructors.html
Version: current stable docs, fetched 2026-10-12

> fn drop(&mut self);

> After drop is run, Rust will recursively try to drop all of the fields of self.

> There is no stable way to prevent this behavior in Rust 1.0.

> Note that taking &mut self means that even if you could suppress recursive Drop, Rust will prevent you from e.g. moving fields out of self.

> After we deallocate the box’s ptr in SuperBox’s destructor, Rust will happily proceed to tell the box to Drop itself and everything will blow up with use-after-frees and double-frees.

> Note that the recursive drop behavior applies to all structs and enums regardless of whether they implement Drop.

> We say that such a type needs Drop, even though it is not itself Drop.

> will have its inner Box field dropped if and only if an instance stores the Next variant.

> The classic safe solution to overriding recursive drop and allowing moving out of Self during drop is to use an Option:

> field as `None` to prevent Rust from trying to Drop it.

> let my_box = self.my_box.take().unwrap();

> mem::forget(my_box);

> However this has fairly odd semantics: you are saying that a field that should always be Some may be None, just because of what happens in the destructor.

> On balance this is an ok choice. Certainly what you should reach for by default.

> However, in the future we expect there to be a first-class way to announce that a field shouldn’t be automatically dropped.

Contents:
- Drop::drop takes &mut self; afterwards Rust recursively drops all fields; no stable way to suppress this.
- &mut self also prevents moving fields out of self in drop.
- Naive SuperBox<T> { my_box: Box<T> } that deallocates my_box's pointer causes double-free/use-after-free.
- Types with Drop-needing fields "need Drop" even without impl Drop (Boxy, enum Link).
- Classic fix: field as Option<Box<T>>, `self.my_box.take().unwrap()` in drop, then mem::forget.
- Caveat: invariant "always Some" is weakened; still the default choice; a first-class mechanism is anticipated.
- This page does not mention ManuallyDrop.

## Expressions - The Rust Reference
URL: https://doc.rust-lang.org/reference/expressions.html
Version: current stable docs, fetched 2026-10-12

> A place expression is an expression that represents a memory location.

> These expressions are paths which refer to local variables, static variables, dereferences (*expr), array indexing expressions (expr[expr]), field references (expr.f) and parenthesized place expressions.

> All other expressions are value expressions.

> A value expression is an expression that represents an actual value.

> The initializer of a let statement.

> The scrutinee of an if let, match, or while let expression.

> The operand of a unary borrow, raw borrow or dereference operator.

> The base of a functional update struct expression.

> When a place expression is evaluated in a value expression context, or is bound by value in a pattern, it denotes the value held in that memory location.

> If the type of that value implements Copy, then the value will be copied.

> In the remaining situations, if that type is Sized, then it may be possible to move the value.

> Only the following place expressions may be moved out of:

> Variables which are not currently borrowed.

> Temporary values.

> Fields of a place expression which can be moved out of and don’t implement Drop.

> The result of dereferencing an expression with type Box<T> and that can also be moved out of.

> After moving out of a place expression that evaluates to a local variable, the location is deinitialized and cannot be read from again until it is reinitialized.

> In all other cases, trying to use a place expression in a value expression context is an error.

> When using a value expression in most place expression contexts, a temporary unnamed memory location is created and initialized to that value.

> Certain expressions will treat an expression as a place expression by implicitly borrowing it.

> Left operand in method-call expressions.

> Left operand in field expressions.

> An assignee expression is an expression that appears in the left operand of an assignment expression.

> For a place expression to be assigned to, mutably borrowed, implicitly mutably borrowed, or bound to a pattern containing ref mut, it must be mutable.

Contents:
- [expr.place-value]: two categories, place expressions and value expressions, plus minor assignee expressions; operands occur in place or value context.
- Place expression kinds: local/static paths, `*expr`, `expr[expr]`, `expr.f`, parenthesized place expressions; everything else is a value expression.
- Place expression contexts: compound-assignment left operand, borrow/raw borrow/deref operand, field-expression operand, indexed operand, tuple-index operand, implicit borrows, `let` initializer, scrutinee of `if let`/`match`/`while let`, functional-update base.
- Assignee expressions: places, `_`, tuples/slices/tuple structs/structs/unit structs of assignees (basis of destructuring assignment).
- [expr.move] Moved and copied types: place in value context or bound by value in a pattern denotes the value; `Copy` is copied; otherwise a `Sized` value may be moved.
- [expr.move.movable-place] Only movable: unborrowed variables, temporaries, fields of a movable place whose type does not implement `Drop`, and deref of `Box<T>` that is itself movable. Anything else is an error (the E0507 / E0509 situations: move out of borrow/deref, move out of a `Drop` type's field).
- Moving out of a local variable deinitializes it until reinitialized.
- [expr.mut] Mutability: mutable place expressions required for assignment, `&mut`, implicit mutable borrow, and `ref mut` bindings.
- [expr.temporary] Temporaries: value expression in place context creates an unnamed temporary location.
- [expr.implicit-borrow]: implicit borrows for method-call/field/call/index left operands, deref operand, comparison operands, compound assignment, `format_args!` arguments.
- Also covered but peripheral: syntax, precedence, operand evaluation order, super macros (`format_args!`, `pin!`), overloading, attributes.

## Destructors - The Rust Reference
URL: https://doc.rust-lang.org/reference/destructors.html
Version: current stable docs, fetched 2026-10-12

> When an initialized variable or temporary goes out of scope, its destructor is run or it is dropped.

> Assignment also runs the destructor of its left-hand operand, if it’s initialized.

> If a variable has been partially initialized, only its initialized fields are dropped.

> If T: Drop, calling <T as core::ops::Drop>::drop

> Recursively running the destructor of all of its fields.

> The fields of a struct are dropped in declaration order.

> The fields of the active enum variant are dropped in declaration order.

> The fields of a tuple are dropped in order.

> The elements of an array or owned slice are dropped from the first element to the last.

> The variables that a closure captures by move are dropped in an unspecified order.

> // After a partial move, only the remaining fields are dropped.

> // Perform a partial move, leaving only `partial_move.0` initialized.

> // When partial_move's scope ends, only the first field is dropped.

> // Uninitialized does not drop.

> // No destructor run on assignment.

> // Drops now, but is then uninitialized.

> When control flow leaves a drop scope all variables associated to that scope are dropped in reverse order of declaration (for variables) or creation (for temporaries).

> Overloaded operators are not distinguished from built-in operators and binding modes are not considered.

> Local variables declared in a let statement are associated to the scope of the block that contains the let statement.

> Local variables declared in a match expression or pattern-matching match guard are associated to the arm scope of the match arm that they are declared in.

> Variables in patterns are dropped in reverse order of declaration within the pattern.

> For the purpose of drop order, or-patterns declare bindings in the order given by the first subpattern.

> All function parameters are in the scope of the entire function body, so are dropped last when evaluating the function. Each actual function parameter is dropped after any bindings introduced in that parameter’s pattern.

> // Drops `y`, then the second parameter, then `x`, then the first parameter

> The scrutinee of a match expression is not a temporary scope, so temporaries in the scrutinee can be dropped after the match expression.

> Since the temporaries are moved from once the expression is evaluated, dropping them has no effect unless one of the operands to an expression breaks out of the expression, returns, or panics.

> An identifier pattern that binds by reference or mutable reference.

> core::mem::forget can be used to prevent the destructor of a variable from being run, and core::mem::ManuallyDrop provides a wrapper to prevent a variable or field from being dropped automatically.

> Preventing a destructor from being run via core::mem::forget or other means is safe even if it has a type that isn’t 'static.

Contents:
- [destructors.intro]: drop on scope exit and on assignment (if initialized); partially initialized variables drop only initialized fields.
- [destructors.operation]: `Drop::drop` first, then fields recursively; struct fields in declaration order, enum active variant fields in order, tuples in order, arrays first to last, closure move-captures unspecified.
- Example: overwritten assignment drops old value; moved-from `moved;` drops then is uninitialized; uninitialized not dropped; after partial move (`mem::forget(partial_move.1)`) only remaining field dropped.
- [destructors.scope]: drop scopes (function, statement, expression, block, match arm), nesting; variables dropped in reverse declaration order.
- Function parameters: dropped after body locals; each parameter after bindings from its pattern (example order 3 2 0 1 with `(x, _)` / `(_, y)` patterns).
- Locals in `let`/match arms; pattern variables dropped in reverse declaration order; or-patterns use first subpattern order.
- Temporary scopes, 2024 edition differences (if-let temporaries dropped before else; tail-expression temporaries dropped immediately); match scrutinee not a temporary scope.
- Operands temporaries, constant promotion, temporary lifetime extension (extending patterns such as `ref x`, extending expressions).
- [destructors.forget]: `mem::forget`, `ManuallyDrop`; process termination without unwinding skips destructors.

## Patterns - The Rust Reference
URL: https://doc.rust-lang.org/reference/patterns.html
Version: current stable Rust Reference (includes 2024 Edition differences), fetched 2026-10-12

> Patterns can be used to destructure structs, enums, and tuples. Destructuring breaks up a value into its component pieces. The syntax used is almost the same as when creating such values.

> In a pattern whose scrutinee expression has a struct, enum or tuple type, a wildcard pattern (_) stands in for a single data field, whereas an et cetera or rest pattern (..) stands in for all the remaining fields of a particular variant.

> When destructuring a data structure with named (but not numbered) fields, it is allowed to write fieldname as a shorthand for fieldname: fieldname.

> Patterns that consist of only an identifier, possibly with a mut, match any value and bind it to that identifier.

> By default, identifier patterns bind a variable to a copy of or move from the matched value depending on whether the matched value implements Copy.

> This can be changed to bind to a reference by using the ref keyword, or to a mutable reference using ref mut.

> In the first match expression, the value is copied (or moved). In the second match, a reference to the same memory location is bound to the variable value.

> This syntax is needed because in destructuring subpatterns the & operator can’t be applied to the value’s fields.

> if let Person { name: &person_name, age: 18..=150 } = value { }

> if let Person { name: ref person_name, age: 18..=150 } = value { }

> Thus, ref is not something that is being matched against. Its objective is exclusively to make the matched binding a reference, instead of potentially copying or moving what was matched.

> It is an error if ref or ref mut is specified and the identifier shadows a constant.

> To service better ergonomics, patterns operate in different binding modes in order to make it easier to bind references to values. When a reference value is matched by a non-reference pattern, it will be automatically treated as a ref or ref mut binding.

> // y was converted to `ref y` and its type is &i32

> Non-reference patterns include all patterns except bindings, wildcard patterns (_), const patterns of reference types, and reference patterns.

> If a binding pattern does not explicitly have ref, ref mut, or mut, then it uses the default binding mode to determine how the variable is bound.

> The default binding mode starts in “move” mode which uses move semantics.

> When matching a pattern, the compiler starts from the outside of the pattern and works inwards.

> Each time a reference is matched using a non-reference pattern, it will automatically dereference the value and update the default binding mode.

> References will set the default binding mode to ref.

> Mutable references will set the mode to ref mut unless the mode is already ref in which case it remains ref.

> If the automatically dereferenced value is still a reference, it is dereferenced and this process repeats.

> The binding pattern may only explicitly specify a ref or ref mut binding mode, or specify mutability with mut, when the default binding mode is “move”. For example, these are not accepted:

> let [mut x] = &[()]; //~ ERROR

> let [ref x] = &[()]; //~ ERROR

> let [ref mut x] = &mut [()]; //~ ERROR

> Before the 2024 edition, bindings could explicitly specify a ref or ref mut binding mode even when the default binding mode was not “move”, and they could specify mutability on such bindings with mut. In these editions, specifying mut on a binding set the binding mode to “move” regardless of the current default binding mode.

> Similarly, a reference pattern may only appear when the default binding mode is “move”. For example, this is not accepted:

> let [&x] = &[&()]; //~ ERROR

> Before the 2024 edition, reference patterns could appear even when the default binding mode was not “move”, and had both the effect of matching against the scrutinee and of causing the default binding mode to be reset to “move”.

> Move bindings and reference bindings can be mixed together in the same pattern. Doing so will result in partial move of the object bound to and the object cannot be used afterwards. This applies only if the type cannot be copied.

> In the example below, name is moved out of person. Trying to use person as a whole or person.name would result in an error because of partial move.

> // `name` is moved from person and `age` referenced

> let Person { name, ref age } = person;

> Unlike identifier patterns, it does not copy, move, or borrow the value it matches.

> Reference patterns dereference the pointers that are being matched and, thus, borrow them.

> Adding the mut keyword dereferences a mutable reference. The mutability must match the mutability of the reference.

> Struct patterns match struct, enum, and union values that match all criteria defined by its subpatterns. They are also used to destructure a struct, enum, or union value.

> The IDENTIFIER syntax matches any value and binds it to a variable with the same name as the given field. It is a shorthand for fieldname: fieldname. The ref and mut qualifiers can be included with the behavior as described in patterns.ident.ref.

> Tuple patterns match tuple values that match all criteria defined by its subpatterns. They are also used to destructure a tuple.

> The rest pattern (the .. token) acts as a variable-length pattern which matches zero or more elements that haven’t been matched already before and after.

Contents:
- patterns.destructure: destructuring structs/enums/tuples; wildcard `_` for one field, `..` for remaining; named-field shorthand
- patterns.refutable: refutable vs irrefutable patterns
- patterns.ident.bare / scrutinized / move / ref / ref-ignored: identifier patterns, `x @ subpattern`, default move-or-copy, `ref`/`ref mut`, Person example
- patterns.ident.precedent / constraint / refutable: path-over-identifier precedence, ref on constants is an error
- patterns.ident.binding.*: intro, non-reference, default-mode, move, top-down, auto-deref, ref, ref-mut, nested-references
- patterns.ident.binding.mode-limitations-binding (+ .edition2024) and mode-limitations-reference (+ .edition2024): 2024 reservations on explicit ref/mut/& under non-move default mode
- patterns.ident.binding.mixed: partial move example
- patterns.wildcard: `_` does not copy, move or borrow
- patterns.rest, patterns.ref (reference patterns), patterns.struct (shorthand, union single field), tuple-struct, tuple, slice, path patterns

## take in std::mem - Rust
URL: https://doc.rust-lang.org/std/mem/fn.take.html
Version: std 1.99.0

> pub fn take<T>(dest: &mut T) -> Twhere
>  T: Default,

> Replaces dest with the default value of T, returning the previous dest value.

> take allows taking ownership of a struct field by replacing it with an “empty” value.

> // error: cannot move out of dereference of `&mut`-pointer
>  let buf = self.buf;

> Note that T does not necessarily implement Clone, so it can’t even clone and reset
> self.buf.

> But take can be used to disassociate the original value of self.buf from
> self, allowing it to be returned:

> mem::take(&mut self.buf)

> let old_v = mem::take(&mut v);
> assert_eq!(vec![1, 2], old_v);
> assert!(v.is_empty());

Contents:
- Signature requires T: Default; takes &mut T and returns owned T.
- Leaves the default value behind; returns the old value.
- Example with Vec<i32>; Buffer<T> example showing the E0507-style error when moving self.buf out of &mut self.
- Fix via mem::take; no Clone bound needed.
- Cross-references to swap and replace.

## replace in std::mem - Rust
URL: https://doc.rust-lang.org/std/mem/fn.replace.html
Version: std 1.99.0

> pub const fn replace<T>(dest: &mut T, src: T) -> T

> Moves src into the referenced dest, returning the previous dest value.

> Neither value is dropped.

> replace allows consumption of a struct field by replacing it with another value.

> let t = self.buf[i];

> Note that T does not necessarily implement Clone, so we can’t even clone self.buf[i] to
> avoid the move.

> mem::replace(&mut self.buf[i], v)

> let old_v = mem::replace(&mut v, vec![3, 4, 5]);

Contents:
- No Default bound; caller supplies the replacement.
- Neither value dropped; old value returned.
- Example with Vec and with indexed field moving out of buf[i] (error without replace).
- Cross-references to swap and take.

## swap in std::mem - Rust
URL: https://doc.rust-lang.org/std/mem/fn.swap.html
Version: std 1.99.0

> pub const fn swap<T>(x: &mut T, y: &mut T)

> Swaps the values at two mutable locations, without deinitializing either one.

> If you want to swap with a default or dummy value, see take.

> If you want to swap with a passed value, returning the old value, see replace.

> mem::swap(&mut x, &mut y);

Contents:
- Swaps two &mut T locations; neither is deinitialized.
- Points to take and replace for default/passed values.
- Example swapping 5 and 42.

## Option in std::option - Rust
URL: https://doc.rust-lang.org/std/option/enum.Option.html
Version: std 1.99.0

> pub const fn as_ref(&self) -> Option<&T>

> Converts from &Option<T> to Option<&T>.

> The map method takes the self argument by value,
> consuming the original, so this technique uses as_ref to first take an Option to a
> reference to the value inside the original.

> let text_length: Option<usize> = text.as_ref().map(|s| s.len());

> pub const fn as_mut(&mut self) -> Option<&mut T>

> Converts from &mut Option<T> to Option<&mut T>.

> Some(v) => *v = 42,

> pub const fn take(&mut self) -> Option<T>

> Takes the value out of the option, leaving a None in its place.

> let y = x.take();
> assert_eq!(x, None);
> assert_eq!(y, Some(2));

> pub fn take_if<P>(&mut self, predicate: P) -> Option<T>where
>  P: FnOnce(&mut T) -> bool,

> Takes the value out of the option, but only if the predicate evaluates to
> true on a mutable reference to the value.

> In other words, replaces self with None if the predicate returns true.
> This method operates similar to Option::take but conditional.

> let prev = x.take_if(|v| *v == 43);

> pub const fn replace(&mut self, value: T) -> Option<T>

> Replaces the actual value in the option by the value given in parameter,
> returning the old value if present,
> leaving a Some in its place without deinitializing either one.

> let old = x.replace(5);

Contents:
- as_ref: &Option<T> to Option<&T>; lets map consume a borrowed view, leaving the original usable (const since 1.48.0).
- as_mut: &mut Option<T> to Option<&mut T>; mutate payload in place (const since 1.83.0).
- take: since 1.0.0; leaves None, returns the old Option; works on None too.
- take_if: since 1.80.0; predicate gets &mut T; None left only when true.
- replace: since 1.31.0; leaves Some(value), returns old Option; deinitializes neither.
- No niche/size notes exist on this page version (grep found none), so none quoted.

## ManuallyDrop in std::mem - Rust
URL: https://doc.rust-lang.org/std/mem/struct.ManuallyDrop.html
Version: std 1.99.0

> A wrapper to inhibit the compiler from automatically calling T’s
> destructor. This wrapper is 0-cost.

> ManuallyDrop<T> is guaranteed to have the same layout and bit validity as
> T, and is subject to the same layout optimizations as T.

> Note that accessing the value inside a ManuallyDrop<T> is safe.

> pub const fn into_inner(slot: ManuallyDrop<T>) -> T

> Extracts the value from the ManuallyDrop container.

> This allows the value to be dropped again.

> pub unsafe fn take(slot: &mut ManuallyDrop<T>) -> T

> Takes the value from the ManuallyDrop<T> container out.

> This method is primarily intended for moving out values in drop.

> Whenever possible, it is preferable to use into_inner
> instead, which prevents duplicating the content of the ManuallyDrop<T>.

> This function semantically moves out the contained value without preventing further usage,
> leaving the state of this container unchanged.
> It is your responsibility to ensure that this ManuallyDrop is not used again.

Contents:
- Intro: wrapper inhibiting automatic destructor; zero cost; same layout as T.
- into_inner (safe, since 1.20.0): consumes the wrapper, value can be dropped again.
- take (unsafe, since 1.42.0): moves out of &mut ManuallyDrop, intended for moving fields out in Drop; duplicates content, caller must not reuse the container.


## Partial moves - Rust By Example
URL: https://doc.rust-lang.org/rust-by-example/scope/move/partial_move.html
Version: current stable docs, fetched 2026-10-12

> Within the destructuring of a single variable, both by-move and

> by-reference pattern bindings can be used at the same time.

> the parent variable cannot be used afterwards as a

> whole, however the parts that are only referenced (and not moved)

> Drop trait cannot be partially moved from, because

> its drop method would use it afterwards as a whole.

Contents:
- Destructuring can mix by-move and by-reference bindings, giving a partial move.
- The parent cannot be used as a whole afterwards; the referenced parts can.
- Drop types cannot be partially moved from.

## Struct expressions - The Rust Reference
URL: https://doc.rust-lang.org/reference/expressions/struct-expr.html
Version: current stable docs, fetched 2026-10-12

> The entire expression uses the given values for the fields that were specified and moves or copies the remaining fields from the base expression.

Contents:
- Functional update syntax: remaining fields are moved or copied from the base expression.

## Copy in std::marker - Rust
URL: https://doc.rust-lang.org/std/marker/trait.Copy.html
Version: std 1.99.0

> A type can implement Copy if all of its components implement Copy.

> managing some resource besides its own size_of::<T> bytes.

Contents:
- Copy requires all components to be Copy.
- Types managing a resource beyond their own bytes cannot be Copy.

## 15. Ownership and Destruction - FLS
URL: https://rust-lang.github.io/fls/ownership-and-deconstruction.html
Version: no version on the page; fetched 2026-10-12

> A value of a move type is passed

> by move. Passing by move changes the owner of the value.

> A field of a place expression that can be

> implement the core::ops::Drop trait, or

> The value is unassigned from the source owner.

Contents:
- Passing by move changes the owner.
- A field can be passed by move only if its type does not implement Drop.
- The moved-from source is unassigned.

## 5. Patterns - FLS
URL: https://rust-lang.github.io/fls/patterns.html
Version: no version on the page; fetched 2026-10-12

> Initially, the binding mode of a binding is by value.

> If the reference is an immutable reference, then the

> binding mode is updated to by reference.

> If the reference is a mutable reference and the binding mode

> is by value, then the binding mode is updated to

> by mutable reference.

Contents:
- Binding mode starts by value and changes when a reference is matched against a non-reference pattern.

## Rc in std::rc - Rust
URL: https://doc.rust-lang.org/std/rc/struct.Rc.html
Version: std 1.99.0

> Returns the inner value, if the Rc has exactly one strong reference.

Contents:
- Rc::into_inner / try_unwrap return the inner value only when the strong count is one.

## E0508 - Error codes index
URL: https://doc.rust-lang.org/error_codes/E0508.html
Version: current stable docs, fetched 2026-10-12

> A value was moved out of a non-copy fixed-size array.

> If you really want to move the value out, you can use a destructuring array

> pattern to move it:

Contents:
- Moving out of an indexed non-Copy array is an error; a destructuring array pattern moves the elements.

## Processing a Series of Items with Iterators - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch13-02-iterators.html
Version: current stable docs, fetched 2026-10-12

> ownership of v1 and returns owned values, we can call into_iter instead of

Contents:
- into_iter yields owned values and takes ownership of the collection.

## read in std::ptr - Rust
URL: https://doc.rust-lang.org/std/ptr/fn.read.html
Version: std 1.99.0

> read creates a bitwise copy of T, regardless of whether T is Copy.

> If T is not Copy, using both the returned value and the value at

> *src can violate memory safety.

Contents:
- ptr::read duplicates bits; using both copies of a non-Copy value can violate memory safety.

## Drop in std::ops - Rust
URL: https://doc.rust-lang.org/std/ops/trait.Drop.html
Version: std 1.99.0

> This is a nightly-only experimental API. (pin_ergonomics #130494)

> Execute the destructor for this type, but different to Drop::drop, it requires self

> which enables us to support field projections of Self type safely.

> You cannot implement both Copy and Drop on the same type.

> because drop() may itself be called during unwinding due to a panic

Contents:
- Frontier only: nightly pinned-drop API (pin_ergonomics) enabling safe field projections.
- "Copy and Drop are exclusive" section (no type implements both).
- Panics section: drop may run during unwinding.

## Clippy Lints - Clippy Documentation
URL: https://rust-lang.github.io/rust-clippy/master/index.html
Version: master, fetched 2026-10-12

> Checks for mem::replace() on an Option with

> Option already has the method take() for

> taking its current value (Some(..) or None) and replacing it with

> Checks for mem::replace() on an Option with Some(…).

> Checks for std::mem::replace on a value of type

> std::mem module already has the method take to

Contents:
- mem_replace_option_with_none, mem_replace_option_with_some and mem_replace_with_default lints.

## Rust 2024 - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/index.html
Version: current stable docs, fetched 2026-10-12

> Release version

> 1.85.0

Contents:
- Rust 2024 release version is 1.85.0.

## Patterns and Matching - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch19-00-patterns.html
Version: current stable docs, fetched 2026-10-12

> Patterns and Matching - The Rust Programming Language

Contents:
- Confirms the chapter is number 19 (ch18-00-patterns.html redirects).

## Naming - Rust API Guidelines
URL: https://rust-lang.github.io/api-guidelines/naming.html
Version: no version on the page; fetched 2026-10-12

> Ad-hoc conversions follow as_, to_, into_ conventions (C-CONV)

> owned -> owned (non-Copy types)

> When a type wraps a single value to associate it with higher-level semantics, access to the wrapped value should be provided by an into_inner() method.

Contents:
- C-CASE casing; C-CONV as_/to_/into_ prefixes by cost and ownership (into_: owned -> owned, non-Copy); wrappers expose into_inner().
- C-GETTER, C-ITER (iter/iter_mut/into_iter), C-ITER-TY, C-FEATURE, C-WORD-ORDER.

## 1. General - FLS
URL: https://rust-lang.github.io/fls/general.html
Version: states it covers rustc 1.98.0, 2021 Edition; fetched 2026-10-12

> This document specifies the form and meaning of programs written in the 2021 Edition of the

> version 1.98.0.

Contents:
- Scope: the 2021 Edition as implemented by rustc 1.98.0; prefers documenting rustc's behaviour.

## E. Changelog - FLS
URL: https://rust-lang.github.io/fls/changelog.html
Version: latest entry "Language changes in Rust 1.99.0"; fetched 2026-10-12

> The 2024 Edition is now stable.

> The 2024 edition is outside the scope of the FLS.

Contents:
- Per-release language changes and how each affected the FLS; the 1.85.0 entry records the 2024 Edition as outside the FLS's scope.

## Exception Safety - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/exception-safety.html
Version: current stable docs, fetched 2026-10-12

> Unless you are very careful and tightly control what code runs, pretty much everything can unwind, and you need to be ready for it.

> Code that transiently creates unsound states must be careful that a panic does not cause that state to be used.

> Generally this means ensuring that only non-panicking code is run while these states exist, or making a guard that cleans up the state in the case of a panic.

Contents:
- Anything that can panic (unwrap, indexing, arithmetic in debug builds, user code such as Clone) must be survivable; minimal and maximal exception safety.
- A transient hole (two copies of one value, a length set too large) must not be observable if a panic unwinds; the fix is a guard whose destructor fills the hole again.

## replace_with - Rust (docs.rs)
URL: https://docs.rs/replace_with/latest/replace_with/
Version: replace_with 0.1.8, fetched 2026-10-12

> Temporarily take ownership of a value at a mutable location, and replace it with a new value based on the old one.

> the desired ability to temporarily move out of &mut T doesn’t exist yet, so this crate is my interim solution.

> If the second closure (FnOnce() -> T) panics, however, then it does indeed abort.

> The “abort on first panic” behaviour is available with replace_with_or_abort().

Contents:
- A third-party crate (not std): move out of a `&mut T`, compute a replacement, put it back; on a panic in the replacement closure it aborts, or with `replace_with_or_default` writes `Default::default()`.
- Its motivating example is an enum state machine advanced through `&mut self` (E0507 without the crate).

## Concise Control Flow with if let and let...else - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch06-03-if-let.html
Version: current stable docs, fetched 2026-10-12

> The let...else syntax takes a pattern on the left side and an expression on the right, very similar to if let, but it does not have an if branch, only an else branch.

> If the pattern matches, it will bind the value from the pattern in the outer scope.

Contents:
- `if let` is a match that cares about one pattern; `let...else` binds in the outer scope and its else arm must return from the function (diverge).
