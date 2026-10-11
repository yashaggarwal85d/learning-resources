## The Rust Programming Language, ch. 4.1 What is Ownership?
URL: https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html
Version: current online edition, read 2026-10-11

> Ownership is a set of rules that govern how a Rust program manages memory.

> Rust uses a third approach: Memory is managed through a system of ownership with a set of rules that the compiler checks. If any of the rules are violated, the program won't compile. None of the features of ownership will slow down your program while it's running.

> Each value in Rust has an owner.

> There can only be one owner at a time.

> When the owner goes out of scope, the value will be dropped.

> We need to pair exactly one allocate with exactly one free.

> Rust takes a different path: The memory is automatically returned once the variable that owns it goes out of scope.

> When a variable goes out of scope, Rust calls a special function for us. This function is called drop, and it's where the author of String can put the code to return the memory. Rust calls drop automatically at the closing curly bracket.

> When we assign s1 to s2, the String data is copied, meaning we copy the pointer, the length, and the capacity that are on the stack. We do not copy the data on the heap that the pointer refers to.

> When s2 and s1 go out of scope, they will both try to free the same memory. This is known as a double free error and is one of the memory safety bugs we mentioned previously.

> To ensure memory safety, after the line let s2 = s1;, Rust considers s1 as no longer valid. Therefore, Rust doesn't need to free anything when s1 goes out of scope.

> error[E0382]: borrow of moved value: `s1`

> move occurs because `s1` has type `String`, which does not implement the `Copy` trait

> If you've heard the terms shallow copy and deep copy while working with other languages, the concept of copying the pointer, length, and capacity without copying the data probably sounds like making a shallow copy. But because Rust also invalidates the first variable, instead of being called a shallow copy, it's known as a move. In this example, we would say that s1 was moved into s2.

> Rust will never automatically create "deep" copies of your data. Therefore, any automatic copying can be assumed to be inexpensive in terms of runtime performance.

> When you assign a completely new value to an existing variable, Rust will call drop and free the original value's memory immediately.

> If we do want to deeply copy the heap data of the String, not just the stack data, we can use a common method called clone.

> When you see a call to clone, you know that some arbitrary code is being executed and that code may be expensive. It's a visual indicator that something different is going on.

> If a type implements the Copy trait, variables that use it do not move, but rather are trivially copied, making them still valid after assignment to another variable.

> Rust won't let us annotate a type with Copy if the type, or any of its parts, has implemented the Drop trait.

> as a general rule, any group of simple scalar values can implement Copy, and nothing that requires allocation or is some form of resource can implement Copy.

> Passing a variable to a function will move or copy, just as assignment does.

> Returning values can also transfer ownership.

> Assigning a value to another variable moves it. When a variable that includes data on the heap goes out of scope, the value will be cleaned up by drop unless ownership of the data has been moved to another variable.

> Luckily for us, Rust has a feature for using a value without transferring ownership: references.

Contents:
- Intro: ownership as rules for memory management; GC vs manual alloc/free vs Rust's compiler-checked ownership; no runtime cost
- The Stack and the Heap: LIFO stack, fixed-size data, push/pop; heap allocation returns a pointer; stack faster than heap; function calls push args and locals; ownership manages heap data
- Ownership Rules: each value has an owner; one owner at a time; dropped when owner goes out of scope
- Variable Scope: scope definition, string literal s, Listing 4-1
- The String Type: String as heap-allocated, growable, mutable; String::from; push_str; literals immutable
- Memory and Allocation: request memory at runtime and return it; GC vs manual free; Rust returns memory at scope end; drop called at closing brace; RAII note
- Variables and Data Interacting with Move: Listing 4-2 integers copied; String = pointer, length, capacity on stack; Figures 4-1 to 4-4; double free; s1 invalidated; E0382 error; move vs shallow copy; no automatic deep copies
- Scope and Assignment: assigning a new value drops the old one immediately (Figure 4-5)
- Variables and Data Interacting with Clone: clone deep-copies heap data; visible cost signal
- Stack-Only Data: Copy: integers still valid after let y = x; Copy trait; cannot combine Copy with Drop; types implementing Copy (integers, bool, floats, char, tuples of Copy types)
- Ownership and Functions: Listing 4-3 takes_ownership vs makes_copy; use after move is a compile-time error
- Return Values and Scope: Listing 4-4 gives_ownership / takes_and_gives_back; the move-or-drop pattern; Listing 4-5 returning a tuple (s, length); transition to references

## The Rust Programming Language, ch. 4.2 References and Borrowing
URL: https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html
Version: current online edition, read 2026-10-11

> A reference is like a pointer in that it's an address we can follow to access the data stored at that address; that data is owned by some other variable. Unlike a pointer, a reference is guaranteed to point to a valid value of a particular type for the life of that reference.

> These ampersands represent references, and they allow you to refer to some value without taking ownership of it.

> The &s1 syntax lets us create a reference that refers to the value of s1 but does not own it. Because the reference does not own it, the value it points to will not be dropped when the reference stops being used.

> When functions have references as parameters instead of the actual values, we won't need to return the values in order to give back ownership, because we never had ownership.

> We call the action of creating a reference borrowing. As in real life, if a person owns something, you can borrow it from them. When you're done, you have to give it back. You don't own it.

> error[E0596]: cannot borrow `*some_string` as mutable, as it is behind a `&` reference

> Just as variables are immutable by default, so are references. We're not allowed to modify something we have a reference to.

> to accept a mutable reference with some_string: &mut String. This makes it very clear that the change function will mutate the value it borrows.

> Mutable references have one big restriction: If you have a mutable reference to a value, you can have no other references to that value.

> error[E0499]: cannot borrow `s` as mutable more than once at a time

> The benefit of having this restriction is that Rust can prevent data races at compile time.

> Two or more pointers access the same data at the same time.

> At least one of the pointers is being used to write to the data.

> There's no mechanism being used to synchronize access to the data.

> Data races cause undefined behavior and can be difficult to diagnose and fix when you're trying to track them down at runtime; Rust prevents this problem by refusing to compile code with data races!

> error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable

> We also cannot have a mutable reference while we have an immutable one to the same value.

> multiple immutable references are allowed because no one who is just reading the data has the ability to affect anyone else's reading of the data.

> Note that a reference's scope starts from where it is introduced and continues through the last time that reference is used.

> the compiler will ensure that the data will not go out of scope before the reference to the data does.

> this function's return type contains a borrowed value, but there is no value for it to be borrowed from

> The solution here is to return the String directly:

> This works without any problems. Ownership is moved out, and nothing is deallocated.

> At any given time, you can have either one mutable reference or any number of immutable references.

> References must always be valid.

Contents:
- Intro: tuple return of Listing 4-5 is clumsy; a reference points to data owned by another variable and is guaranteed valid
- calculate_length(&s1) taking &String: & creates a reference without owning; Figure 4-6; dereference operator * note; borrowed value not dropped when reference stops being used; no need to return values
- Borrowing defined: creating a reference is borrowing
- Listing 4-6: modifying through & reference fails with E0596; references immutable by default
- Mutable References: &mut s and &mut String signature; one mutable reference restriction; E0499 on two &mut; data race definition (three conditions); inner scopes allow sequential &mut
- Mixing mutable and immutable references: E0502; multiple immutable allowed; reference scope ends at last use (non-lexical), so r1/r2 then r3 compiles
- Dangling References: compiler guarantees data outlives reference; dangle() fails with E0106; explanation of s dropped at end of dangle; fix by returning String (ownership moved out)
- The Rules of References: either one &mut or any number of &; references must always be valid; next topic slices
## The Rust Reference — Expressions (moved and copied types, place/value expressions)
URL: https://doc.rust-lang.org/reference/expressions.html
Version: current online docs, read 2026-10-11

> A place expression is an expression that represents a memory location.

> These expressions are paths which refer to local variables, static variables, dereferences (*expr), array indexing expressions (expr[expr]), field references (expr.f) and parenthesized place expressions.

> All other expressions are value expressions.

> A value expression is an expression that represents an actual value.

> The initializer of a let statement.

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

Contents:
- Syntax: grammar of ExpressionWithoutBlock and ExpressionWithBlock.
- Introduction, evaluation, operands, behavior and structure: an expression produces a value and may have effects; operands and evaluation order.
- Expression precedence: table of operator precedence and associativity.
- Evaluation order of operands: operands are evaluated left to right, innermost to outermost.
- Place expressions and value expressions: the two main categories, place and value contexts, assignee expressions.
- Moved and copied types: a place expression in a value context is copied if the type is Copy, otherwise moved; which places can be moved out of; a moved-from local is deinitialized.
- Mutability: mutable place expressions and the contexts that require them.
- Temporaries, implicit borrows, overloading traits, and expression attributes.

## std::marker::Copy
URL: https://doc.rust-lang.org/std/marker/trait.Copy.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> Types whose values can be duplicated simply by copying bits.

> By default, variable bindings have ‘move semantics.’ In other words:

> However, if a type implements Copy, it instead has ‘copy semantics’:

> It’s important to note that in these two examples, the only difference is whether you are allowed to access x after the assignment. Under the hood, both a copy and a move can result in bits being copied in memory, although this is sometimes optimized away.

> There are two ways to implement Copy on your type. The simplest is to use derive:

> The derive strategy will also place a Copy bound on type parameters:

> Copies happen implicitly, for example as part of an assignment y = x. The behavior of Copy is not overloadable; it is always a simple bit-wise copy.

> Cloning is an explicit action, x.clone().

> A simple bitwise copy of String values would merely copy the pointer, leading to a double free down the line. For this reason, String is Clone but not Copy.

> Clone is a supertrait of Copy, so everything which is Copy must also implement Clone.

> A type can implement Copy if all of its components implement Copy.

> Shared references (&T) are also Copy, so a type can be Copy, even when it holds shared references of types T that are not Copy.

> Some types can’t be copied safely. For example, copying &mut T would create an aliased mutable reference.

> Generalizing the latter case, any type implementing Drop can’t be Copy, because it’s managing some resource besides its own size_of::<T> bytes.

> Generally speaking, if your type can implement Copy, it should.

> Copying String would duplicate responsibility for managing the String’s buffer, leading to a double free.

> If you try to implement Copy on a struct or enum containing non-Copy data, you will get the error E0204.

> implementing Copy is part of the public API of your type. If the type might become non-Copy in the future, it could be prudent to omit the Copy implementation now, to avoid a breaking API change.

Contents:
- Trait summary: types whose values can be duplicated simply by copying bits; move semantics versus copy semantics with a Foo example.
- How can I implement Copy?: derive, or manual impl of Copy and Clone; derive adds a Copy bound on type parameters.
- What's the difference between Copy and Clone?: implicit bit-wise copy versus explicit, customisable clone; String is Clone but not Copy.
- When can my type be Copy?: all components must be Copy; Point example, PointList (Vec) counter-example, shared references.
- When can't my type be Copy?: &mut T, String, and any type implementing Drop; error E0204.
- When should my type be Copy?: generally yes, but Copy is part of the public API.
- Additional implementors: function items, function pointers, non-capturing or Copy-capturing closures.
- Dyn Compatibility and the list of implementors.

## std::clone::Clone
URL: https://doc.rust-lang.org/std/clone/trait.Clone.html
Version: std 1.99.0 (b940084d7 2026-09-28)

> A common trait that allows explicit creation of a duplicate value.

> Calling clone always produces a new value. However, for types that are references to other data (such as smart pointers or references), the new value may still point to the same underlying data, rather than duplicating it.

> Differs from Copy in that Copy is implicit and an inexpensive bit-wise copy, while Clone is always explicit and may or may not be expensive.

> Copy has no methods, so you cannot change its behavior, but when implementing Clone, the clone method you provide may run arbitrary code.

> Since Clone is a supertrait of Copy, any type that implements Copy must also implement Clone.

> This trait can be used with #[derive] if all fields are Clone. The derived implementation of Clone calls clone on each field.

> For a generic struct, #[derive] implements Clone conditionally by adding bound Clone on generic parameters.

> Types that are Copy should have a trivial implementation of Clone.

> Returns a duplicate of the value.

> For most types, this creates a deep, independent copy

> For smart pointers like Arc or Rc, this increments the reference count but still points to the same underlying data

> Performs copy-assignment from source.

> a.clone_from(&b) is equivalent to a = b.clone() in functionality, but can be overridden to reuse the resources of a to avoid unnecessary allocations.

Contents:
- Trait summary: explicit creation of a duplicate value; clone always produces a new value, but references and smart pointers may share the underlying data.
- Difference from Copy: Copy is implicit and cheap, Clone is explicit and may run arbitrary code.
- Derivable: all fields must be Clone; derived impl calls clone on each field; conditional bound on generics.
- How can I implement Clone?: Copy types get a trivial clone (*self); the Generate<T> function-pointer example.
- Clone and PartialEq/Eq: x == x implies x.clone() == x; collections rely on it.
- Additional implementors: function items, function pointers, closures.
- Required method clone: meaning of duplicate for values, references and Arc/Rc, with examples.
- Provided method clone_from: copy-assignment that can reuse existing resources.
- Dyn Compatibility and the list of implementors.
## Error code E0382
URL: https://doc.rust-lang.org/error_codes/E0382.html
Version: current online docs, read 2026-10-11

> A variable was used after its contents have been moved elsewhere.

> Since MyStruct is a type that is not marked Copy, the data gets moved out
> of x when we set y. This is fundamental to Rust’s ownership system: outside
> of workarounds like Rc, a value cannot be owned by more than one variable.

> Sometimes we don’t need to move the value. Using a reference, we can let another
> function borrow the value without changing its ownership.

> we can give it
> a reference to it with & instead.

> A mutable reference can be created with &mut.

> Sometimes we don’t want a reference, but a duplicate. All types marked Clone
> can be duplicated by calling .clone(). Subsequent changes to a clone do not
> affect the original variable.

> If we control the definition of a type, we can implement Clone on it ourselves
> with #[derive(Clone)].

> Some types have no ownership semantics at all and are trivial to duplicate. An
> example is i32 and the other number types.

> We can mark our own types Copy if
> all their members also are marked Copy.

> Alternatively, if we don’t control the struct’s definition, or mutable shared
> ownership is truly required, we can use Rc and RefCell

> With this approach, x and y share ownership of the data via the Rc (reference
> count type). RefCell essentially performs runtime borrow checking: ensuring
> that at most one writer or multiple readers can access the data at any one time.

Contents:
- Erroneous example: a non-Copy struct is moved by `let y = x;`, then `x.s` is used.
- Explanation: the data is moved out of `x`; a value cannot be owned by more than one variable (outside Rc-style workarounds).
- Fix 1: borrow with `&` instead of moving (the `calculate_length(&s1)` example), and `&mut` for mutable references.
- Fix 2: duplicate with `.clone()` (Clone types; `#[derive(Clone)]`; the "many"/"any many" string example).
- Fix 3: make the type `Copy` when all members are Copy (the `Point` example, `let p2 = p1` without moving p1).
- Fix 4: shared ownership with `Rc<RefCell<..>>`, which does runtime borrow checking.
- Pointer to the Book's Understanding Ownership chapter.

## Error code E0505
URL: https://doc.rust-lang.org/error_codes/E0505.html
Version: current online docs, read 2026-10-11

> A value was moved out while it was still borrowed.

> Here, the function eat takes ownership of x. However,
> x cannot be moved because the borrow to _ref_to_val
> needs to last till the function borrow.

> To fix that you can do a few different things:

> Try to avoid moving the variable.

> Release borrow before move.

> Implement the Copy trait on the type.

> eat(&x); // pass by reference, if it's possible

> // ref_to_val is no longer used.

> #[derive(Clone, Copy)] // implement Copy trait

> eat(x); // it will be copied here.

> For more information on Rust’s ownership system, take a look at the
> References & Borrowing section of the Book.

Contents:
- Erroneous example: `eat(x)` takes ownership of `x` while `_ref_to_val` is still used afterwards by `borrow`.
- Explanation: the move is rejected because the borrow must last until the later call.
- Three suggested fixes: avoid the move (pass `&x`), release the borrow before the move (last use of the reference comes first), or implement Copy.
- Three corresponding code examples.
- Pointer to the Book's References & Borrowing section.

## The Rustonomicon — Ownership and Lifetimes
URL: https://doc.rust-lang.org/nomicon/ownership.html
Version: current online docs, read 2026-10-11

> Ownership is the breakout feature of Rust. It allows Rust to be completely
> memory-safe and efficient, while avoiding garbage collection.

> You never have to worry about things going away too soon

> This is exactly what Rust’s ownership system was built to solve.
> Rust knows the scope in which the &s lives, and as such can prevent it from
> escaping.

> It’s up to the programmer to prove to the
> compiler that everything is sound.

> Of course, Rust’s story around ownership is much more complicated than just
> verifying that references don’t escape the scope of their referent.

> naive scope analysis would be insufficient to prevent this bug, because data
> does in fact live as long as we needed. However it was changed while we had
> a reference into it. This is why Rust requires any references to freeze the
> referent and its owners.

Contents:
- Motivation: GC versus manual memory management; ownership gives memory safety without a garbage collector.
- Example 1: `as_str` returning a reference to a local (dangling pointer), which does not compile.
- Why a C compiler's escape analysis falls short while Rust makes the programmer prove soundness.
- Example 2: `data.push(4)` while `x = &data[0]` is live (reallocation, dangling pointer), which does not compile.
- Conclusion: references freeze the referent and its owners.

## RFC 2094 Non-lexical lifetimes
URL: https://rust-lang.github.io/rfcs/2094-nll.html
Version: Start Date 2017-08-02, RFC PR rust-lang/rfcs#2094 (current online docs, read 2026-10-11)

> The basic idea of the borrow checker is that values may not be mutated
> or moved while they are borrowed, but how do we know whether a value
> is borrowed?

> whenever you create a borrow,
> the compiler assigns the resulting reference a lifetime. This
> lifetime corresponds to the span of the code where the reference may
> be used.

> The compiler will infer this lifetime to be the smallest
> lifetime that it can have that still encompasses all the uses of the
> reference.

> if you make a
> reference to a value, the lifetime of that reference cannot outlive
> the scope of that value. Otherwise, your reference would be pointing
> into freed memory.

> Since capitalize does not return the reference back,
> the lifetime of this borrow will be confined to just that call.

> We say that a variable is live
> if the current value that it holds may be used later.

> Note that moves count as “deep writes”.

> A write means that the data may be mutated to new values or
> otherwise invalidated (for example, it could be de-initialized, as
> in a move operation).

> A move let x = y is
> similar: it writes to the shallow content of y, but then – via the
> new name x – we can access all other content accessible through
> y.

> these are lifetimes that are based on the control-flow graph, rather
> than lexical scopes.

> if you have a
> value v of type Foo<'a> that implements Drop, then 'a
> typically cannot dangle when v is dropped

Contents:
- Summary: extend the borrow system to lifetimes based on the control-flow graph rather than lexical scopes.
- Motivation, "What is a lifetime?": values may not be mutated or moved while borrowed; a reference's lifetime is the span where it may be used; lifetime versus scope; the `capitalize` example where the borrow ends after the call.
- Lifetime inference constraints and liveness: a variable is live if its value may be used later; a lifetime is live where a variable whose type mentions it is live.
- Reporting errors and access rules: reads and writes; moves count as deep writes; legality of an access against in-scope loans.
- Drop as last use, and appendix on remaining borrow-checker limitations.

## std::string::String
URL: https://doc.rust-lang.org/std/string/struct.String.html
Version: std 1.99.0 (read 2026-10-11)

> A String is made up of three components: a pointer to some bytes, a length, and a capacity.

> This buffer is always stored on the heap.

> pub const fn len(&self) -> usize

(Fact-check: `String::len` is `pub const fn len(&self) -> usize` (const since 1.87); the line `pub fn len(&self) -> usize` on this page is `str::len`, under "Methods from Deref<Target = str>".)

> pub fn push_str(&mut self, string: &str)

> pub const fn into_bytes(self) -> Vec<u8>

> This consumes the String, so we do not need to copy its contents.

> This consumes the String on the left-hand side and re-uses its buffer (growing it if necessary).

> The string on the right-hand side is only borrowed;

Contents:
- Representation: pointer, length, capacity; buffer always on the heap; as_ptr, len, capacity accessors.
- Methods by receiver: len(&self), push_str(&mut self, &str), into_bytes(self) consumes without copying.
- impl Add<&str> for String: consumes the left operand and reuses its buffer; the right operand is borrowed.

## std::pin (module docs)
URL: https://doc.rust-lang.org/std/pin/index.html
Version: std 1.99.0 (read 2026-10-11)

> All values in Rust are trivially moveable.

> The compiler is allowed to move a value to a new address without running any code to notify that value that its address has changed.

> there are many places where a value may be moved. For example, when doing assignment or passing a value into a function.

Contents:
- Moves relocate values without running code; address-sensitive types need pinning (self-referential structs, futures).

## The Rust Programming Language, ch. 15.1 Using Box<T> to Point to Data on the Heap
URL: https://doc.rust-lang.org/book/ch15-01-box.html
Version: current online edition, read 2026-10-11

> transferring ownership of a large amount of data can take a long time because the data is copied around on the stack.

> only the small amount of pointer data is copied around on the stack, while the data it references stays in one place on the heap.

Contents:
- When to use Box: recursive types, moving large data without copying it, trait objects.

## The Rust Programming Language, ch. 5.3 Methods
URL: https://doc.rust-lang.org/book/ch05-03-method-syntax.html
Version: current online edition, read 2026-10-11

> this technique is usually used when the method transforms self into something else and you want to prevent the caller from using the original instance after the transformation.

> Rust can figure out definitively whether the method is reading (&self), mutating (&mut self), or consuming (self).

Contents:
- &self, &mut self and self receivers; consuming self prevents later use; automatic referencing for receivers.

## The Rust Reference — Loop expressions
URL: https://doc.rust-lang.org/reference/expressions/loop-expr.html
Version: current online docs, read 2026-10-11

> A for expression is a syntactic construct for looping over elements provided by an implementation of std::iter::IntoIterator.

> let result = match IntoIterator::into_iter(iter_expr) {

Contents:
- for loops desugar to IntoIterator::into_iter on the iterated expression, which takes it by value.

## The Rust Reference — Array and index expressions
URL: https://doc.rust-lang.org/reference/expressions/array-expr.html
Version: current online docs, read 2026-10-11

> For other types an index expression a[b] is equivalent to *std::ops::Index::index(&a, b)

Contents:
- Index expressions on non-array types are a dereference of Index::index, i.e. a place behind a reference.

## Error code E0507
URL: https://doc.rust-lang.org/error_codes/E0507.html
Version: current online docs, read 2026-10-11

> A borrowed value was moved out.

> This can also happen when using a type implementing Fn or FnMut, as neither allows moving out of them

Contents:
- Moving out of borrowed content; fixes: avoid the move, reclaim ownership, implement Copy; also in Fn/FnMut closures.

## Error code E0184
URL: https://doc.rust-lang.org/error_codes/E0184.html
Version: current online docs, read 2026-10-11

> Explicitly implementing both Drop and Copy trait on a type is currently disallowed.

Contents:
- Copy and Drop on the same type is rejected.

## Keyword move
URL: https://doc.rust-lang.org/std/keyword.move.html
Version: std 1.99.0 (read 2026-10-11)

> the traits implemented by a closure type are determined by what the closure does with captured values, not how it captures them

> move is often used when threads are involved.

Contents:
- move closures capture by value; Fn/FnMut/FnOnce depend on the body; threads and async blocks.

## The Rust Programming Language, ch. 13.1 Closures
URL: https://doc.rust-lang.org/book/ch13-01-closures.html
Version: current online edition, read 2026-10-11

> A closure that moves captured values out of its body will only implement FnOnce and none of the other Fn traits because it can only be called once.

Contents:
- Capturing by reference or by value; move closures; FnOnce, FnMut, Fn.

## Primitive type reference
URL: https://doc.rust-lang.org/std/primitive.reference.html
Version: std 1.99.0 (read 2026-10-11)

> &mut T references get all of the above except Copy and Clone (to prevent creating multiple simultaneous mutable borrows)

Contents:
- Trait implementations of &T and &mut T; &mut T is not Copy or Clone.

## std::mem::size_of
URL: https://doc.rust-lang.org/std/mem/fn.size_of.html
Version: std 1.99.0 (read 2026-10-11)

> In general, the size of a type is not stable across compilations, but specific types such as primitives are.

> for any type T and length n, [T; n] has a size of n * size_of::<T>().

> The types *const T, &T, Box<T>, Option<&T>, and Option<Box<T>> all have the same size. If T is Sized, all of those types have the same size as usize.

Contents:
- Size of a type in bytes; guaranteed sizes for primitives, pointers and arrays; other layouts unspecified.

## std::alloc (module docs)
URL: https://doc.rust-lang.org/std/alloc/index.html
Version: std 1.99.0 (read 2026-10-11)

> This attribute allows configuring the choice of global allocator.

Contents:
- GlobalAlloc trait, System allocator, the #[global_allocator] attribute.

## The Rust Reference — Destructors
URL: https://doc.rust-lang.org/reference/destructors.html
Version: current online docs, read 2026-10-11

> When an initialized variable or temporary goes out of scope, its destructor is run or it is dropped.

> Assignment also runs the destructor of its left-hand operand, if it’s initialized.

> // Uninitialized does not drop.

> // No destructor run on assignment.

Contents:
- Drop scopes; only initialized variables are dropped; moved-from and partially moved variables (detail belongs to the next topic).

## The Rustonomicon — Drop Flags
URL: https://doc.rust-lang.org/nomicon/drop-flags.html
Version: current online docs, read 2026-10-11

> It turns out that Rust actually tracks whether a type should be dropped or not at runtime.

> As a variable becomes initialized and uninitialized, a drop flag for that variable is toggled.

Contents:
- Conditional initialization and moves; runtime drop flags; static elision when the state is known.

## The Rust Performance Book — Type Sizes (secondary)
URL: https://nnethercote.github.io/perf-book/type-sizes.html
Version: current online edition, read 2026-10-11
Secondary source (a book): used for framing next to our own executed measurement.

> Rust types that are larger than 128 bytes are copied with memcpy rather than inline code.

Contents:
- Measuring and shrinking type sizes; memcpy for large types; DHAT copy profiling.

## C++ working draft — [forward] (std::move)
URL: https://eel.is/c++draft/forward
Version: C++ working draft as published on eel.is, read 2026-10-11

> template<class T> constexpr remove_reference_t<T>&& move(T&& t) noexcept;

> Returns: static_cast<remove_reference_t<T>&&>(t).

Contents:
- std::forward and std::move are casts.

## C++ working draft — [lib.types.movedfrom]
URL: https://eel.is/c++draft/lib.types.movedfrom
Version: C++ working draft as published on eel.is, read 2026-10-11

> Unless otherwise specified, such moved-from objects shall be placed in a valid but unspecified state

Contents:
- Moved-from standard library objects are valid but unspecified.

## C++ working draft — [string.cons]
URL: https://eel.is/c++draft/string.cons
Version: C++ working draft as published on eel.is, read 2026-10-11

> Effects: Constructs an object whose value is that of str prior to this call.

> Remarks: In the second form, str is left in a valid but unspecified state.

Contents:
- basic_string copy and move constructors.

## C++ working draft — [class.dtor]
URL: https://eel.is/c++draft/class.dtor
Version: C++ working draft as published on eel.is, read 2026-10-11

> for a constructed object with automatic storage duration ([basic.stc.auto]) when the block in which an object is created exits ([stmt.dcl])

Contents:
- When destructors are invoked implicitly.

## Python — copy module
URL: https://docs.python.org/3/library/copy.html
Version: Python 3.15.0 documentation, read 2026-10-11

> Assignment statements in Python do not copy objects, they create bindings between a target and an object.

Contents:
- Assignment binds; shallow and deep copies.

## The Go Programming Language Specification
URL: https://go.dev/ref/spec
Version: current online spec, read 2026-10-11

> A slice therefore shares storage with its array and with other slices of the same array

Contents:
- Slice types share an underlying array.

## The Java Language Specification, SE 25 — Chapter 4
URL: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html
Version: Java SE 25 edition, read 2026-10-11

> The reference values (often just references) are pointers to these objects

> There may be many references to the same object.

Contents:
- §4.3.1 Objects: reference values are pointers; many references to one object.

## CWE-415: Double Free
URL: https://cwe.mitre.org/data/definitions/415.html
Version: CWE 4.20, read 2026-10-11

> The product calls free() twice on the same memory address.

> When a program calls free() twice with the same argument, the program's memory management data structures may become corrupted, potentially leading to the reading or modification of unexpected memory addresses.

Contents:
- Definition of double free; consequences (allocator corruption, two mallocs returning the same pointer, exploitation).
