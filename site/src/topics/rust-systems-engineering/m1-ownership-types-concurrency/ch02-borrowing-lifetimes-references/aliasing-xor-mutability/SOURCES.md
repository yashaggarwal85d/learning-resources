# Sources: Aliasing XOR mutability

## Aliasing - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/aliasing.html
Version: online edition, no edition number or date shown on the page

The working definition and the rule:

> With that said, here’s our working definition: variables and pointers alias
> if they refer to overlapping regions of memory.

> In Rust we know this input should be impossible because &mut isn’t allowed to be
> aliased. So we can safely reject its possibility and perform this optimization.
> In most other languages, this input would be entirely possible, and must be considered.

Why it matters to the optimizer (the exact passage the reel's `compute` example and its optimization come from):

> This is why alias analysis is important: it lets the compiler perform useful
> optimizations! Some examples:

> keeping values in registers by proving no pointers access the value’s memory

> eliminating reads by proving some memory hasn’t been written to since last we read it

> eliminating writes by proving some memory is never read before the next write to it

> moving or reordering reads and writes by proving they don’t depend on each other

> In the previous example, we used the fact that &mut u32 can’t be aliased to prove
> that writes to *output can’t possibly affect *input. This lets us cache *input
> in a register, eliminating a read.

The full example function, quoted for `examples.rs`:

> fn compute(input: &u32, output: &mut u32) {
> if *input > 10 {
> *output = 1;
> }
> if *input > 5 {
> *output *= 2;
> }
> // remember that `output` will be `2` if `input > 10`
> }

> compute(&x, &mut x)

Contents (item by item):
- the working definition of aliasing (overlapping regions of memory)
- the `compute(input: &u32, output: &mut u32)` example and its hand-optimized version
- why the optimization is unsound if `input`/`output` could alias (the `compute(&x, &mut x)` counter-example)
- the four classes of optimization alias analysis enables: register-caching reads, eliminating dead reads, eliminating dead writes, reordering reads/writes
- "writes are the primary hazard for optimizations" and the all-reads-reordered example with the write moved to the end
- the chapter's closing caveat: a full aliasing model must also handle function calls, raw pointers (no aliasing requirements of their own) and `UnsafeCell` (which lets the referent of a `&` be mutated)

## Pointer types - The Rust Reference
URL: https://doc.rust-lang.org/reference/types/pointer.html
Version: online edition, section ids `[type.pointer.*]`, no date shown on the page

> Shared references point to memory which is owned by some other value.

> When a shared reference to a value is created, it prevents direct mutation of the value. Interior mutability provides an exception for this in certain circumstances. As the name suggests, any number of shared references to a value may exist. A shared reference type is written &type, or &'a type when you need to specify an explicit lifetime.

> Copying a reference is a “shallow” operation: it involves only copying the pointer itself, that is, pointers are Copy.

> Mutable references point to memory which is owned by some other value. A mutable reference type is written &mut type or &'a mut type.

> A mutable reference (that hasn’t been borrowed) is the only way to access the value it points to, so is not Copy.

> This can also be used to convert a raw pointer to a reference by reborrowing it (&* or &mut *).

Contents (item by item):
- shared references: any number may exist, prevent direct mutation (modulo interior mutability), are `Copy`
- exclusive (`&mut`) references: the only way to access the value, not `Copy`
- raw pointers have no aliasing requirements of their own; dereferencing one is `unsafe`
- reborrowing a raw pointer into a reference via `&*`/`&mut *`

## 2025-nested-method-calls (two-phase borrows) - The Rust RFC Book
URL: https://rust-lang.github.io/rfcs/2025-nested-method-calls.html
Version: RFC 2025, as merged into the RFC book (no revision date shown on the page)

The mechanism, in the RFC's own words:

> is done by extending MIR with the concept of a two-phase borrow;
> in this model, select &mut borrows are modified so that they begin
> with a “reservation” phase and can later be “activated” into a full
> mutable borrow. During the reservation phase, reads and shared borrows
> of the borrowed data are permitted (but not mutation), as long as they
> are confined to the reservation period. Once the mutable borrow is
> activated, it acts like an ordinary mutable borrow.

> Two-phase borrows in this RFC are only used when desugaring method
> calls; this is intended as a conservative step.

The motivating example and the desugaring:

> The overriding goal here is that we want to accept nested method calls
> where the outer call is an &mut self method, like
> vec.push(vec.len()).

> /* 0 */ tmp0 = &mut2 vec; // reservation of `vec` starts here
> /* 1 */ tmp1 = &vec;
> /* 2 */ tmp2 = Vec::len(tmp1);
> /* 3 */ Vec::push(tmp0, tmp2); // first use of `tmp0`, upgrade is here

> The first use of tmp0 is on line 3, and hence the mutable borrow
> begins then, and lasts until the end of the borrow region. Crucially,
> lines 1 and 2 (which did a shared borrow of vec) took place during
> the reservation period, and hence no error results. This is because a
> reservation is equivalent to a shared borrow, and multiple shared
> borrows are allowed.

The rejected "sneaky" case, which shows reservation is not full exemption from the aliasing rule:

> fn foo<'a>(x: &'a Vec<i32>) -> &'a i32 { &x[0] }
>
> let mut v = vec![0, 1, 2];
> let p;
> v.push({p = foo(&v); 3});
> use(*p);

> tmp0 = &'a mut2 v; // reservation begins
> tmp1 = &'b v; // shared borrow begins; allowed, because `v` is reserved
> p = foo(tmp1);
> Vec::push(tmp0, 3); // mutable borrow activated
> EndRegion('a); // mutable borrow ends
> tmp2 = *p; // shared borrow still valid!
> use(tmp2)
> EndRegion('b);

> Note that, here, we created a borrow of v[0] before we called
> Vec::push(), and we continue to use it afterwards. This should not
> be accepted, but it could be without this additional check at the
> activation point.

Contents (item by item):
- the reservation/activation two-phase model, and why it's limited to desugared method calls
- the `vec.push(vec.len())` motivating example and its accepted desugaring
- the invariant that a reservation behaves exactly like a shared borrow (so other shared borrows may coexist with it, but not a second exclusive borrow or a write)
- the activation-point check that rejects the "sneaky" example, showing the rule still catches a borrow that outlives the reservation
