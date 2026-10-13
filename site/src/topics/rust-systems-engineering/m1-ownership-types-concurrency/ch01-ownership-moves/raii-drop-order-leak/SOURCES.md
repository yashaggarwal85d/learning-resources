# Sources — RAII, drop order, and leak safety

## std::boxed::Box (leak / into_raw / drop)
URL: https://doc.rust-lang.org/std/boxed/struct.Box.html
Version: std 1.99.0 (b940084d7 2026-09-28); Box::leak stable since 1.26.0, Box::into_raw since 1.4.0

> A pointer type that uniquely owns a heap allocation of type T.

> Consumes the Box, returning a wrapped raw pointer.

> After calling this function, the caller is responsible for the memory previously managed by the Box.

> the caller should properly destroy T and release the memory, taking into account the memory layout used by Box.

> The easiest way to do this is to convert the raw pointer back into a Box with the Box::from_raw function, allowing the Box destructor to perform the cleanup.

> pub fn leak<'a>(b: Box<T, A>) -> &'a mut Twhere

> Consumes and leaks the Box, returning a mutable reference, &'a mut T.

> Note that the type T must outlive the chosen lifetime 'a.

> If the type has only static references, or none at all, then this may be chosen to be 'static.

> This function is mainly useful for data that lives for the remainder of the program’s life, i.e., memory that is meant to leak.

> If the memory should eventually be freed, prefer to use Box::into_raw or Box::into_non_null instead.

> Reconstructing (“unleaking”) a Box from the mutable reference returned here (e.g. via Box::from_raw) is only possible if the allocator is Global, and even then it is a grey area

> many seemingly harmless ways of doing it are undefined behavior

> you have to call it as Box::leak(b) instead of b.leak().

> let static_ref: &'static mut usize = Box::leak(x);

> 1.26.0 · Sourcepub fn leak<'a>(b: Box<T, A>) -> &'a mut Twhere

Contents:
- Struct Box<T, A = Global>: pointer uniquely owning a heap allocation
- from_raw / into_raw / into_non_null and allocator variants
- Box::leak: signature, lifetime rules, unleaking caveat, examples (usize, boxed slice)
- into_pin, downcast, assume_init methods
- Trait impls incl. Drop for Box (not quoted; page is large)

## Destructors - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/destructors.html
Version: undated (Rustonomicon, current online edition as fetched 2026-10-11)

> What the language does provide is full-blown automatic destructors through the Drop trait, which provides the following method:

> fn drop(&mut self);

> This method gives the type time to somehow finish what it was doing.

> After drop is run, Rust will recursively try to drop all of the fields of self.

> This is a convenience feature so that you don’t have to write “destructor boilerplate” to drop children.

> If a struct has no special logic for being dropped other than dropping its children, then it means Drop doesn’t need to be implemented at all!

> There is no stable way to prevent this behavior in Rust 1.0.

> Note that taking &mut self means that even if you could suppress recursive Drop, Rust will prevent you from e.g. moving fields out of self.

> and this works fine because when Rust goes to drop the ptr field it just sees a Unique that has no actual Drop implementation.

> Similarly nothing can use-after-free the ptr because when drop exits, it becomes inaccessible.

> After we deallocate the box’s ptr in SuperBox’s destructor, Rust will happily proceed to tell the box to Drop itself and everything will blow up with use-after-frees and double-frees.

> Note that the recursive drop behavior applies to all structs and enums regardless of whether they implement Drop.

> will have the destructors of its data1 and data2 fields called whenever it “would” be dropped, even though it itself doesn’t implement Drop.

> We say that such a type needs Drop, even though it is not itself Drop.

> will have its inner Box field dropped if and only if an instance stores the Next variant.

> The classic safe solution to overriding recursive drop and allowing moving out of Self during drop is to use an Option:

> // field as `None` to prevent Rust from trying to Drop it.

> However this has fairly odd semantics: you are saying that a field that should always be Some may be None, just because of what happens in the destructor.

> On balance this is an ok choice. Certainly what you should reach for by default.

> However, in the future we expect there to be a first-class way to announce that a field shouldn’t be automatically dropped.

Contents:
- Drop trait: `fn drop(&mut self)` runs first, then fields are dropped recursively; no need to implement Drop just to drop children.
- No stable way to suppress recursive field drop; `&mut self` prevents moving fields out of self.
- Custom Box example: fine because the Unique field has no Drop impl of its own.
- SuperBox counter-example: manually deallocating the inner Box then letting Rust drop it gives double-free/use-after-free.
- Recursive drop applies to all structs/enums (Boxy, enum Link: inner Box dropped iff Next variant); "needs Drop" vs "is Drop".
- Option::take + mem::forget workaround for moving out during drop; its odd semantics (Some field may be None); default recommendation; future first-class "don't drop this field" (now ManuallyDrop).

## Drop Flags - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/drop-flags.html
Version: undated (Rustonomicon, current online edition as fetched 2026-10-11)

> We have seen that it’s possible to conditionally initialize, deinitialize, and reinitialize locations of memory totally safely.

> However types with destructors are a different story: Rust needs to know whether to call a destructor whenever a variable is assigned to, or a variable goes out of scope.

> How can it do this with conditional initialization?

> In particular, assigning through a dereference unconditionally drops, and assigning in a let unconditionally doesn’t drop:

> let mut x = Box::new(0); // let makes a fresh variable, so never need to drop

> *y = Box::new(1); // Deref assumes the referent is initialized, so always drops

> This is only a problem when overwriting a previously initialized variable or one of its subfields.

> It turns out that Rust actually tracks whether a type should be dropped or not at runtime.

> As a variable becomes initialized and uninitialized, a drop flag for that variable is toggled.

> When a variable might need to be dropped, this flag is evaluated to determine if it should be dropped.

> Of course, it is often the case that a value’s initialization state can be statically known at every point in the program.

> If this is the case, then the compiler can theoretically generate more efficient code!

> y = x; // y was init; Drop y, overwrite it, and make x uninit!

> Similarly, branched code where all branches have the same behavior with respect to initialization has static drop semantics:

> However code like this requires runtime information to correctly Drop:

> // x goes out of scope; x might be uninit;

> // check the flag!

> Of course, in this case it’s trivial to retrieve static drop semantics:

> The drop flags are tracked on the stack.

> In old Rust versions, drop flags were stashed in a hidden field of types that implement Drop.

Contents:
- Problem: conditional init/deinit/reinit is safe, so Rust must know whether to run a destructor on assignment or scope exit.
- Assignment rules: `let` never drops; assignment through a deref always drops; only overwriting an initialized variable/subfield is the hard case.
- Runtime drop flag toggled as variable becomes (un)initialized, checked when it might need dropping.
- Static drop semantics: straight-line code and branches with identical init behaviour need no flag (annotated examples).
- Dynamic case: conditional initialization (`if condition { x = ... }`) requires the flag; can be refactored to static.
- Flags live on the stack; older Rust stored them in a hidden field of Drop types.

## std::mem::drop
URL: https://doc.rust-lang.org/std/mem/fn.drop.html
Version: std 1.99.0 (b940084d7 2026-09-28); stable since 1.0.0

> Disposes of a value.

> This effectively does nothing for types which implement Copy, e.g. integers.

> Such values are copied and then moved into the function, so the value persists after this function call.

> This function is not magic; it is literally defined as

> pub fn drop<T>(_x: T) {}

> Because _x is moved into the function, it is automatically dropped before the function returns.

> drop(v); // explicitly drop the vector

> Since RefCell enforces the borrow rules at runtime, drop can release a RefCell borrow:

> drop(mutable_borrow); // relinquish the mutable borrow on this slot

> Integers and other types implementing Copy are unaffected by drop.

> drop(y); // a copy of `y` is moved and dropped

> println!("x: {}, y: {}", x, y.0); // still available

Contents:
- Signature pub fn drop<T>(_x: T), stable 1.0.0
- Definition: literally an empty function taking ownership
- Copy types: drop is a no-op, value persists
- Examples: Vec, releasing a RefCell borrow, Copy types unaffected

## Drop Check - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/dropck.html
Version: undated (Rustonomicon, current online edition as fetched 2026-10-11); cites RFC 1857 and RFC 1327

> variables are dropped in the reverse order of their definition, fields of structs and tuples in order of their definition.

> There are some more details about order of drop in RFC 1857.

> The borrow checker could track fields of tuples separately, but it would still be unable to decide what outlives what in case of vector elements, which are dropped manually via pure-library code the borrow checker doesn’t understand.

> We care because if the type system isn’t careful, it could accidentally make dangling pointers.

> This program is totally sound and compiles today. The fact that days does not strictly outlive inspector doesn’t matter. As long as the inspector is alive, so is days.

> However if we add a destructor, the program will no longer compile!

> error[E0597]: `world.days` does not live long enough

> You can try changing the order of fields or use a tuple instead of the struct, it’ll still not compile.

> Implementing Drop lets the Inspector execute some arbitrary code during its death. This means it can potentially observe that types that are supposed to live as long as it does actually were destroyed first.

> Interestingly, only generic types need to worry about this. If they aren’t generic, then the only lifetimes they can harbor are 'static, which will truly live forever.

> This is why this problem is referred to as sound generic drop. Sound generic drop is enforced by the drop checker.

> For a generic type to soundly implement drop, its generics arguments must strictly outlive it.

> Obeying this rule is (usually) necessary to satisfy the borrow checker; obeying it is sufficient but not necessary to be sound.

> However, both of the above variants are rejected by the borrow checker during the analysis of fn main, saying that days does not live long enough.

> Therefore, the drop checker forces all borrowed data in a value to strictly outlive that value.

> The current analysis is deliberately conservative; it forces all borrowed data in a value to outlive that value, which is certainly sound.

> That attribute is called may_dangle and was introduced in RFC 1327.

> unsafe impl<#[may_dangle] 'a> Drop for Inspector<'a> {

> Use of this attribute requires the Drop impl to be marked unsafe because the compiler is not checking the implicit assertion that no potentially expired data (e.g. self.0 above) is accessed.

> However, when dealing with a generic type parameter, such access can occur indirectly. Examples of such indirect access are: invoking a callback, via a trait method call.

> It is better to avoid adding the attribute.

> While the drop order of fields inside a struct is defined, relying on it is fragile and subtle. When the order matters, it is better to use the ManuallyDrop wrapper.

Contents:
- Why inclusive outlives matters: let-desugaring into nested scopes; drop order is reverse of definition for variables, definition order for struct/tuple fields (RFC 1857).
- Borrow checker cannot infer outlives between tuple fields or Vec elements dropped by library code.
- Inspector/World example: sound and compiles without Drop; adding a Drop impl yields E0597; reordering fields or using a tuple does not help.
- Sound generic drop; The Big Rule (generic args must strictly outlive the type); necessary-for-borrowck but sufficient-not-necessary for soundness.
- Two non-accessing Inspector variants still rejected, since borrowck does not look inside Drop bodies; dropck forces borrowed data to strictly outlive the value.
- Escape hatch: unstable `#[may_dangle]` (dropck_eyepatch, RFC 1327), requires `unsafe impl`; per-parameter application (lifetime 'b and T example).
- Indirect access hazards: callbacks, trait method calls (Display), nested method calls; advice to avoid may_dangle.
- Side note: field drop order is fragile; use ManuallyDrop when order matters. Points to PhantomData section next.

## Error code E0040
URL: https://doc.rust-lang.org/error_codes/E0040.html
Version: Rust Error codes index (no version shown on page; fetched with std 1.99.0 docs)

> It is not allowed to manually call destructors in Rust.

> x.drop(); // error: explicit use of destructor method

> It is unnecessary to do this since drop is called automatically whenever a value goes out of scope.

> However, if you really need to drop a value by hand, you can use the std::mem::drop function:

> drop(x); // ok!

> impl Drop for Foo {

> println!("kaboom");

Contents:
- Error description
- Erroneous example (x.drop())
- Fix: use std::mem::drop

## Error code E0184
URL: https://doc.rust-lang.org/error_codes/E0184.html
Version: Rust Error codes index (no version shown on page; fetched with std 1.99.0 docs)

> The Copy trait was implemented on a type with a Drop implementation.

> #[derive(Copy)]

> struct Foo; // error!

> impl Drop for Foo {

> Explicitly implementing both Drop and Copy trait on a type is currently disallowed.

> This feature can make some sense in theory, but the current implementation is incorrect and can lead to memory unsafety (see issue #20126), so it has been disabled for now.

Contents:
- Error description
- Erroneous example (derive(Copy) + Drop)
- Explanation: disallowed, issue #20126

## Error code E0597
URL: https://doc.rust-lang.org/error_codes/E0597.html
Version: Rust Error codes index (no version shown on page; fetched with std 1.99.0 docs)

> This error occurs because a value was dropped while it was still borrowed.

> x.x = Some(&y); // error: `y` does not live long enough

> Here, y is dropped at the end of the inner scope, but it is borrowed by x until the println.

> To fix the previous example, just remove the scope so that y isn’t dropped until after the println

> let mut x = Foo { x: None };

> println!("{:?}", x.x);

Contents:
- Error description
- Erroneous example (inner scope)
- Fix: remove inner scope

## Rust 2024 - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/index.html
Version: Release version 1.85.0 (no date shown)

> Rust 2024

> RFC

> #3501

> Release version

> 1.85.0

Contents:
- The fetched page is only a stub: title "Rust 2024", RFC link #3501, and release version 1.85.0. It lists no per-feature chapters in the fetched text, so fewer than 12 quotes exist (5 usable lines); nothing on if let rescope, tail-expression scope, lints, or cargo fix is present here.

## std::fs::File (drop / close / sync_all)
URL: https://doc.rust-lang.org/std/fs/struct.File.html
Version: std 1.99.0 (b940084d7 2026-09-28); File stable since 1.0.0, sync_all since 1.0.0

> An object providing access to an open file on the filesystem.

> Files are automatically closed when they go out of scope.

> Errors detected on closing are ignored by the implementation of Drop.

> Use the method sync_all if these errors must be manually handled.

> File does not buffer reads and writes.

> consider wrapping the file in a BufReader or BufWriter when performing many small read or write calls, unless unbuffered reads and writes are required.

> Attempts to sync all OS-internal file content and metadata to disk.

> This function will attempt to ensure that all in-memory data reaches the filesystem before returning.

> This can be used to handle errors that would otherwise only be caught when the File is closed, as dropping a File will ignore all errors.

> Note, however, that sync_all is generally more expensive than closing a file by dropping it, because the latter is not required to block until the data has been written to the filesystem.

> If synchronizing the metadata is not required, use sync_data instead.

> 1.0.0 · Sourcepub fn sync_all(&self) -> Result<()>

Contents:
- Struct File: open file handle, Read/Write/Seek
- Close-on-drop with ignored errors; sync_all advice
- Unbuffered I/O note (BufReader/BufWriter)
- open, create, create_new, options constructors
- sync_all, sync_data, lock/unlock methods and more (only relevant parts quoted)

## std::mem::forget
URL: https://doc.rust-lang.org/std/mem/fn.forget.html
Version: std 1.99.0 (b940084d7 2026-09-28); forget stable since 1.0.0, const since 1.46.0

> Takes ownership and “forgets” about the value without running its destructor.

> Any resources the value manages, such as heap memory or a file handle, will linger forever in an unreachable state.

> However, it does not guarantee that pointers to this memory will remain valid.

> If you want to leak memory, see Box::leak.

> If you want to obtain a raw pointer to the memory, see Box::into_raw.

> If you want to dispose of a value properly, running its destructor, see mem::drop.

> forget is not marked as unsafe, because Rust’s safety guarantees do not include a guarantee that destructors will always run.

> a program can create a reference cycle using Rc, or call process::exit to exit without running destructors.

> Thus, allowing mem::forget from safe code does not fundamentally change Rust’s safety guarantees.

> That said, leaking resources such as memory or I/O objects is usually undesirable.

> even then, ManuallyDrop is typically preferred.

> Because forgetting a value is allowed, any unsafe code you write must allow for this possibility.

> You cannot return a value and expect that the caller will necessarily run the value’s destructor.

> this will leak a File, i.e. reclaim the space taken by the variable but never close the underlying system resource:

> This is useful when the ownership of the underlying resource was previously transferred to code outside of Rust, for example by transmitting the raw file descriptor to C code.

> ManuallyDrop errs on the side of leaking instead of erring on the side of (double-)dropping.

Contents:
- Signature pub const fn forget<T>(t: T); stable 1.0.0, const 1.46.0
- Summary: takes ownership, skips destructor, resources linger unreachable
- Pointers: no guarantee pointers to the memory stay valid
- Cross-references: Box::leak, Box::into_raw, mem::drop
- Safety section: why forget is safe (Rc cycles, process::exit); leaking usually undesirable; unsafe code must allow for forgetting
- Example: forgetting a File (fd handed to C code)
- Relationship with ManuallyDrop: forget+from_raw_parts double-free hazard vs ManuallyDrop robust version

## if let temporary scope - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/temporary-if-let-scope.html
Version: no date shown on page; Rust 2024 edition chapter (release 1.85.0 per the Rust 2024 index page)

> In an if let $pat = $expr { .. } else { .. } expression, the temporary values generated from evaluating $expr will be dropped before the program enters the else branch instead of after.

> The 2024 Edition changes the drop scope of temporary values in the scrutinee1 of an if let expression.

> This is intended to help reduce the potentially unexpected behavior involved with the temporary living for too long.

> Before 2024, the temporaries could be extended beyond the if let expression itself.

> // Before 2024

> use std::sync::RwLock;

> if let Some(x) = *value.read().unwrap() {

> let mut v = value.write().unwrap();

> // <--- Read lock is dropped here in 2021

> In this example, the temporary read lock generated by the call to value.read() will not be dropped until after the if let expression (that is, after the else block).

> In the case where the else block is executed, this causes a deadlock when it attempts to acquire a write lock.

> The 2024 Edition shortens the lifetime of the temporaries to the point where the then-block is completely evaluated or the program control enters the else block.

> // Starting with 2024

> // <--- Read lock is dropped here in 2024

> See the temporary scope rules for more information about how temporary scopes are extended.

> See the tail expression temporary scope chapter for a similar change made to tail expressions.

> It is always safe to rewrite if let with a match.

> The temporaries of the match scrutinee are extended past the end of the match expression (typically to the end of the statement), which is the same as the 2021 behavior of if let.

> The if_let_rescope lint suggests a fix when a lifetime issue arises due to this change or the lint detects that a temporary value with a custom, non-trivial Drop destructor is generated from the scrutinee of the if let.

> For instance, the earlier example may be rewritten into the following when the suggestion from cargo fix is accepted:

> // <--- Read lock is dropped here in both 2021 and 2024

> In this particular example, that’s probably not what you want due to the aforementioned deadlock!

> However, some scenarios may be assuming that the temporaries are held past the else clause, in which case you may want to retain the old behavior.

> The if_let_rescope lint is part of the rust-2024-compatibility lint group which is included in the automatic edition migration.

> cargo fix --edition

> After the migration, it is recommended that you review all of the changes of if let to match and decide what is the behavior that you need with respect to when temporaries are dropped.

> If you determine that the change is unnecessary, then you can revert the change back to if let.

> If you want to manually inspect these warnings without performing the edition migration, you can enable the lint with:

> #![warn(if_let_rescope)]

> The scrutinee is the expression being matched on in the if let expression.

Contents:
- Summary: temporaries from the if let scrutinee drop before the else branch in 2024 instead of after.
- Details: scope change; pre-2024 temporaries could outlive the if let; RwLock example (read lock held into else, write lock deadlocks) in 2021 vs 2024 versions; cross-links to temporary scope rules and tail expression chapter.
- Migration: rewriting to match is always safe and preserves 2021 behaviour; if_let_rescope lint (non-trivial Drop temporaries); cargo fix output example (match with Some(x)/_ arms); caveat that it reintroduces the deadlock here; lint in rust-2024-compatibility group; cargo fix --edition; recommendation to review each rewrite and optionally revert to if let; #![warn(if_let_rescope)] for manual inspection.
- Footnote defining scrutinee.

## Leaking - The Rustonomicon
URL: https://doc.rust-lang.org/nomicon/leaking.html
Version: undated (Rustonomicon, current online edition as fetched 2026-10-11)

> Many people like to believe that Rust eliminates resource leaks. In practice, this is basically true.

> However from a theoretical perspective this is absolutely not the case, no matter how you look at it.

> In the strictest sense, “leaking” is so abstract as to be unpreventable.

> We may consider a more restricted form of leak: failing to drop a value that is unreachable. Rust also doesn’t prevent this. In fact Rust has a function for doing this: mem::forget. This function consumes the value it is passed and then doesn’t run its destructor.

> In the past mem::forget was marked as unsafe as a sort of lint against using it

> there are many ways to fail to call a destructor in safe code. The most famous example is creating a cycle of reference-counted pointers using interior mutability.

> It is reasonable for safe code to assume that destructor leaks do not happen, as any program that leaks destructors is probably wrong. However unsafe code cannot rely on destructors to be run in order to be safe.

> However where we must be careful with destructor leaks are proxy types. These are types which manage access to a distinct object, but don’t actually own it.

> drain is a collections API that moves data out of the container without consuming the container.

> Now, consider Drain in the middle of iteration: some values have been moved out, and others haven’t. This means that part of the Vec is now full of logically uninitialized data!

> Instead, we would like Drain to fix the Vec’s backing storage when it is dropped.

> // Oops, vec[0] was dropped, we're reading a pointer into free'd memory!

> Failing to maintain consistent state gives us Undefined Behavior in safe code (making the API unsound).

> So what can we do? Well, we can pick a trivially consistent state: set the Vec’s len to be 0 when we start the iteration, and fix it up if necessary in the destructor.

> But if someone has the audacity to mem::forget us in the middle of the iteration, all that does is leak even more (and possibly leave the Vec in an unexpected but otherwise consistent state).

> We call leaks causing more leaks a leak amplification.

> This code contains an implicit and subtle assumption: ref_count can fit in a usize, because there can’t be more than usize::MAX Rcs in memory. However this itself assumes that the ref_count accurately reflects the number of Rcs in memory, which we know is false with mem::forget.

> Using mem::forget we can overflow the ref_count, and then get it down to 0 with outstanding Rcs. Then we can happily use-after-free the inner data.

> The standard library’s stance is to just abort, because your program has become horribly degenerate.

> Note: This API has already been removed from std, for more information you may refer issue #24292.

> The thread::scoped API intended to allow threads to be spawned that reference data on their parent’s stack without any synchronization over that data by ensuring the parent joins the thread before any of the shared data goes out of scope.

> When the JoinGuard does get dropped it blocks the parent thread, ensuring the child terminates before any of the closed-over data goes out of scope in the parent.

> In principle, this totally works! Rust’s ownership system perfectly ensures it! …except it relies on a destructor being called to be safe.

> // Because the guard is forgotten, expiring the loan without blocking this

> Here the destructor running was pretty fundamental to the API, and it had to be scrapped in favor of a completely different design.

Contents:
- Thesis: RAII makes leaks rare in practice, but leaking is theoretically unpreventable (collection held forever; unreachable value never dropped).
- mem::forget consumes a value without running its destructor; formerly `unsafe` as a lint, untenable because safe code can leak (Rc cycles via interior mutability).
- Safe code may assume no leaks; unsafe code must not rely on destructors for safety. Proxy types (Drain, Rc, JoinGuard) are the risk.
- vec::Drain: moves data out without consuming Vec; partial iteration leaves uninitialized slots; mem::forget(drainer) example gives use-after-free; fix is set len to 0 up front and repair in destructor; leak amplification.
- Rc: simplified implementation; ref_count overflow via mem::forget enables use-after-free; std aborts.
- thread::scoped / JoinGuard: removed from std (issue #24292); lifetime-bound guard blocks on drop; usage example; mem::forget(guard) example gives data race/use-after-free; API scrapped.

## std::mem::ManuallyDrop
URL: https://doc.rust-lang.org/std/mem/struct.ManuallyDrop.html
Version: std 1.99.0 (b940084d7 2026-09-28); stable since 1.20.0

> A wrapper to inhibit the compiler from automatically calling T’s destructor. This wrapper is 0-cost.

> ManuallyDrop<T> is guaranteed to have the same layout and bit validity as T, and is subject to the same layout optimizations as T.

> Note that accessing the value inside a ManuallyDrop<T> is safe.

> a ManuallyDrop<T> whose content has been dropped must not be exposed through a public safe API.

> Correspondingly, ManuallyDrop::drop is unsafe.

> Rust has a well-defined drop order of values.

> To make sure that fields or locals are dropped in a specific order, reorder the declarations such that the implicit drop order is the correct one.

> It is possible to use ManuallyDrop to control the drop order, but this requires unsafe code and is hard to do correctly in the presence of unwinding.

> Rust guarantees that fields are dropped in the order of declaration.

> let mut x = ManuallyDrop::new(String::from("Hello World!"));

> // But `Drop` will not be run here

> Extracts the value from the ManuallyDrop container.

> This allows the value to be dropped again.

> This method is primarily intended for moving out values in drop.

> Manually drops the contained value.

> This is exactly equivalent to calling ptr::drop_in_place with a pointer to the contained value.

> However, this “zombie” value should not be exposed to safe code, and this function should not be called more than once.

> users of ManuallyDrop must uphold those guarantees without assistance from the compiler.

Added by the fact-check (2026-10-11), verbatim from the same fetched text:

> Before Rust 1.96.0, if you had a ManuallyDrop<T>, where the type T was a Box or contained a Box inside, then dropping the T followed by moving the ManuallyDrop<T> was considered to be undefined behavior.

> In particular, deriving Debug, Clone, PartialEq, PartialOrd, Ord, or Hash on the struct or enum could be unsound, since the derived implementations of these traits would access the ManuallyDrop field.

> Note that similar unsoundness can arise without derive. The cause of the unsoundness are public APIs which allow to access an already dropped value inside ManuallyDrop.

Contents:
- Struct docs: 0-cost wrapper inhibiting auto drop; same layout/bit validity as T
- Safe access, unsafe ManuallyDrop::drop
- Section ManuallyDrop and drop order: field declaration order guarantee, ManuallyDrop hazardous with unwinding
- Section Safety hazards storing ManuallyDrop in struct/enum (derive(Debug) unsound example)
- Section Pre-1.96 interaction with Box (UB before Rust 1.96.0)
- Methods: new, into_inner, take (unsafe), drop (unsafe) with safety notes
- Trait impls list (Clone, Copy, Deref, DerefMut, etc.)

## Destructors - The Rust Reference
URL: https://doc.rust-lang.org/reference/destructors.html
Version: The Rust Reference (no version string in fetched text; page includes 2024 Edition differences)

> When an initialized variable or temporary goes out of scope, its destructor is run or it is dropped. Assignment also runs the destructor of its left-hand operand, if it’s initialized. If a variable has been partially initialized, only its initialized fields are dropped.

> If T: Drop, calling <T as core::ops::Drop>::drop

> Recursively running the destructor of all of its fields.

> The fields of a struct are dropped in declaration order.

> The elements of an array or owned slice are dropped from the first element to the last.

> The variables that a closure captures by move are dropped in an unspecified order.

> If a destructor must be run manually, such as when implementing your own smart pointer, core::ptr::drop_in_place can be used.

> Each variable or temporary is associated to a drop scope. When control flow leaves a drop scope all variables associated to that scope are dropped in reverse order of declaration (for variables) or creation (for temporaries).

> All function parameters are in the scope of the entire function body, so are dropped last when evaluating the function. Each actual function parameter is dropped after any bindings introduced in that parameter’s pattern.

> Variables in patterns are dropped in reverse order of declaration within the pattern.

> The scrutinee of a match expression is not a temporary scope, so temporaries in the scrutinee can be dropped after the match expression. For example, the temporary for 1 in match 1 { ref mut z => z }; lives until the end of the statement.

> The 2024 edition added two new temporary scope narrowing rules: if let temporaries are dropped before the else block, and temporaries of tail expressions of blocks are dropped immediately after the tail expression is evaluated.

> The entirety of the tail expression of a block (destructors.scope.temporary.edition2024).

> // Scrutinee is dropped at the end of the function, before local variables

> Temporaries are also created to hold the result of operands to an expression while the other operands are evaluated. The temporaries are associated to the scope of the expression with that operand. Since the temporaries are moved from once the expression is evaluated, dropping them has no effect unless one of the operands to an expression breaks out of the expression, returns, or panics.

> The temporary scopes for expressions in let statements are sometimes extended to the scope of the block containing the let statement. This is done when the usual temporary scope would be too small, based on certain syntactic rules.

> The exact rules for temporary lifetime extension are subject to change. This is describing the current behavior only.

> Lifetime extension also applies to static and const items, where it makes temporaries live until the end of the program.

> Arguments to function calls are not extending expressions. The

> Receivers of method calls are not extending expressions.

> core::mem::forget can be used to prevent the destructor of a variable from being run, and core::mem::ManuallyDrop provides a wrapper to prevent a variable or field from being dropped automatically.

> Preventing a destructor from being run via core::mem::forget or other means is safe even if it has a type that isn’t 'static. Besides the places where destructors are guaranteed to run as defined by this document, types may not safely rely on a destructor being run for soundness.

> There are some ways to terminate the process without unwinding, in which case destructors will not be run.

> The standard library provides std::process::exit and std::process::abort to do this explicitly. Additionally, if the panic handler is set to abort, panicking will always terminate the process without destructors being run.

> There is one additional case to be aware of: when a panic reaches a non-unwinding ABI boundary, either no destructors will run, or all destructors up until the ABI boundary will run.

Added by the fact-check (2026-10-11), verbatim from the same fetched text:

> For the purpose of drop order, or-patterns declare bindings in the order given by the first subpattern.

> Apart from lifetime extension, the temporary scope of an expression is the smallest scope that contains the expression and is one of the following:

> The entire function.

> The body of an if, while or loop expression.

> The else block of an if expression.

> The non-pattern matching condition expression of an if or while expression or a non-pattern-matching match guard condition operand.

> The pattern-matching guard, if present, and body expression for a match arm.

> Each operand of a lazy boolean expression.

> The pattern-matching condition(s) and consequent body of if (destructors.scope.temporary.edition2024).

> The pattern-matching condition and loop body of while.

> The arguments to an extending tuple struct or tuple enum variant constructor expression.

> The super operands of an extending super macro call expression.

> So the borrow expressions in &mut 0, (&1, &mut 2), and Some(&mut 3) are all extending expressions. The borrows in &0 + &1 and f(&mut 0) are not.

> Final expressions of `async` blocks are not extending expressions.

> Operands of loop breaks are not extending expressions.

> Scrutinees of match expressions are not extending expressions.

> The parent of the initializer of a let statement is the let statement’s scope.

Contents:
- Intro: destructor runs when an initialized variable/temporary goes out of scope; assignment drops the old left-hand value; partially initialized variables drop only initialized fields.
- Destructor operation: Drop::drop then recursive field destructors; struct fields in declaration order; active enum variant fields in order; tuple fields in order; array/slice elements first to last; closure move-captures unspecified order; trait objects run the underlying destructor; ptr::drop_in_place for manual runs.
- Examples: overwrite drops old value, moved-out value, uninitialized variable does not drop, partial move after mem::forget.
- Drop scopes: scopes for function, statement, expression, block, match arm; nesting rules (function, body, statement, let initializer, match guard, arm); inner-to-outer dropping.
- Scopes of function parameters: dropped last, after pattern bindings; example drop order 3 2 0 1.
- Scopes of local variables: let bindings tied to enclosing block; match-arm and pattern-guard bindings (if-let guards); pattern variables dropped in reverse declaration order; or-patterns use first subpattern's order.
- Temporary scopes: smallest enclosing scope from list (function, statement, if/while/loop body, else block, conditions, match arm guard/body, lazy boolean operands, tail expression of a block in 2024); match scrutinee is not a temporary scope; destructuring assignment note.
- 2024 Edition differences: if let temporaries dropped before else; block tail-expression temporaries dropped right after evaluation; annotated examples.
- Operands: operand temporaries dropped in reverse order if evaluation breaks out, returns or panics.
- Constant promotion: promotion to 'static only for values without interior mutability or destructors.
- Temporary lifetime extension: let statements, static/const; sub-expressions (borrow, deref, field, tuple index, indexing); extending patterns (ref bindings and containing patterns); extending expressions (initializer, borrow operand, array/cast/struct/tuple operands, tuple-struct args, block final expr, if/else, match arms, super macros like pin!/format_args!); non-extending cases (function args, method receivers, match scrutinee, async block, closure body, loop break operands, labelled break).
- Not running destructors: mem::forget and ManuallyDrop; forgetting is safe, soundness must not rely on destructors running.
- Process termination without unwinding: process::exit, process::abort, panic=abort; non-unwinding ABI boundary caveat.
- Not covered in this source: drop flags, File close errors.

## 1066-safe-mem-forget - The Rust RFC Book
URL: https://rust-lang.github.io/rfcs/1066-safe-mem-forget.html
Version: Start Date 2015-04-15; RFC PR rust-lang/rfcs#1066; Rust issue rust-lang/rust#25186

> Alter the signature of the std::mem::forget function to remove unsafe. Explicitly state that it is not considered unsafe behavior to not run destructors.

> It was recently discovered by @arielb1 that the thread::scoped API was unsound.

> The join-on-drop behavior here is critical to the safety of the API to ensure that the parent does not pop the stack frames the child is referencing.

> the safety of thread::scoped relied on the fact that the Drop implementation for JoinGuard was always run.

> The underlying issue for this safety hole was that it is possible to write a version of mem::forget without using unsafe code (which drops a value without running its destructor). This is done by creating a cycle of Rc pointers, leaking the actual contents.

> It has been pointed out that Rc is not the only vector of leaking contents today as there are known bugs where panic! may fail to run destructors.

> not running destructors can affect the safety of APIs like Vec::drain_range in addition to thread::scoped.

> It has never been a guarantee of Rust that destructors for a type will run, and this aspect was overlooked with the thread::scoped API which requires that its destructor be run!

> This strategy proposed in this RFC aims to fit uninvasively into the standard library to avoid large overhauls or destabilizations of APIs.

> Primarily, the unsafe annotation on the mem::forget function will be removed, allowing it to be called from safe Rust.

> The standard library and the primitives it provides will always attempt to run destructors, but will not provide a guarantee that destructors will be run.

> It is still likely to be a footgun to call mem::forget as memory leaks are almost always undesirable, but the purpose of the unsafe keyword in Rust is to indicate memory unsafety instead of being a general deterrent for “should be avoided” APIs.

> Given the premise that types must be written assuming that their destructor may not run, it is the fault of the type in question if mem::forget would trigger memory unsafety, hence allowing mem::forget to be a safe function.

> Note that this modification to mem::forget is a breaking change due to the signature of the function being altered

> Admitting that destructors may not be run can lead to difficult API decisions later on and even accidental unsafety.

> The main alternative this proposal is to provide the guarantee that a destructor for a type is always run and that it is memory unsafe to not do so.

> Unfortunately, forbidding all cycles is likely to be too limiting for Rc to be useful.

> Another alternative, as proposed by @arielb1, would be a Leak marker trait to indicate that a type is “safe to leak”.

> Overall the changes necessary for this strategy are more invasive than admitting destructors may not run, so this alternative is not proposed in this RFC.

> Are there remaining APIs in the standard library which rely on destructors being run for memory safety?

Added by the fact-check (2026-10-11), verbatim from the same fetched text:

> it is expected that most code will not break in practice and this would be an acceptable change to cherry-pick into the 1.0 release.

Contents:
- Summary: make mem::forget safe; state that not running destructors is not unsafe behaviour.
- Motivation: thread::scoped/JoinGuard unsoundness found by arielb1; Rc-cycle safe forget; panic bugs skipping destructors; Vec::drain_range also affected.
- Design: remove `unsafe` from mem::forget; std attempts but does not guarantee destructors; unsafe means memory unsafety, not "avoid"; blame lies with the type; breaking signature change for 1.0.
- Drawbacks: loses the ability to rely on destructors for API design.
- Alternatives: guarantee destructors (needs fixes to panicking destructors, containers, Rc/Arc cycle prevention, audit); Leak marker trait (Send-like or Sized-like ?Leak) and why it is invasive.
- Unresolved question: other std APIs relying on destructors for safety.

## std::sync::RwLock
URL: https://doc.rust-lang.org/std/sync/struct.RwLock.html
Version: std 1.99.0 (b940084d7 2026-09-28); stable since 1.0.0

> A reader-writer lock

> This type of lock allows a number of readers or at most one writer at any point in time.

> The priority policy of the lock is dependent on the underlying operating system’s implementation, and this type does not guarantee that any particular policy will be used.

> a writer which is waiting to acquire the lock in write might or might not block concurrent calls to read

> // may deadlock |

> The RAII guards returned from the locking methods implement Deref (and DerefMut for the write methods) to allow access to the content of the lock.

> An RwLock, like Mutex, will usually become poisoned on a panic.

> an RwLock may only be poisoned if a panic occurs while it is locked exclusively (write mode).

> If a panic occurs in any reader, then the lock will not be poisoned.

> Locks this RwLock with exclusive write access, blocking the current thread until it can be acquired.

> This function will not return while other writers or other readers currently have access to the lock.

> Returns an RAII guard which will drop the write access of this RwLock when dropped.

> This function might panic when called if the lock is already held by the current thread in read or write mode.

> Returns an RAII guard which will release this thread’s shared access once it is dropped.

> // Read lock unlocked when going out of scope.

> 1.0.0 · Sourcepub fn write(&self) -> LockResult<RwLockWriteGuard<'_, T>>

Contents:
- Struct docs: readers/writers, no priority guarantee, potential deadlock example
- Poisoning (write-mode panic only)
- Examples
- new, read, try_read, write, try_write, get_mut, into_inner, is_poisoned, clear_poison
- write: blocking, RAII guard, Errors (poison), Panics (may panic if already held)
- Nightly-only: get_cloned, set, replace

## std::thread::scope
URL: https://doc.rust-lang.org/std/thread/fn.scope.html
Version: std 1.99.0 (b940084d7 2026-09-28); stable since 1.63.0

> 1.63.0 · Source

> pub fn scope<'env, F, T>(f: F) -> Twhere

> Creates a scope for spawning scoped threads.

> The function passed to scope will be provided a Scope object, through which scoped threads can be spawned.

> Unlike non-scoped threads, scoped threads can borrow non-'static data, as the scope guarantees all threads will be joined at the end of the scope.

> All threads spawned within the scope that haven’t been manually joined will be automatically joined before this function returns.

> joining will only wait for the main function of these threads to finish; even when this function returns, destructors of thread-local variables in these threads might still be running.

> If any of the automatically joined threads panicked, this function will panic.

> If you want to handle panics from spawned threads, join them before the end of the scope.

> We can borrow `a` here.

> We can even mutably borrow `x` here, // because no other threads are using it.

> After the scope, we can modify and access our variables again:

> Scoped threads involve two lifetimes: 'scope and 'env.

> Once this lifetime ends, all scoped threads are joined.

> It ends after f returns and all scoped threads have been joined, but before scope returns.

> The 'env: 'scope bound is part of the definition of the Scope type.

Contents:
- Signature, stable 1.63.0
- Guarantee: all threads joined at end of scope, so can borrow non-static data
- Auto-join and thread-local destructor caveat
- Panics section
- Example with shared and mutable borrows
- Lifetimes section: 'scope and 'env

## Copy in std::marker
URL: https://doc.rust-lang.org/std/marker/trait.Copy.html
Version: std 1.99.0 (b940084d7 2026-09-28); trait since 1.0.0

> Types whose values can be duplicated simply by copying bits.

> By default, variable bindings have ‘move semantics.’ In other

> However, if a type implements Copy, it instead has ‘copy semantics’:

> are allowed to access x after the assignment. Under the hood, both a copy and a move

> can result in bits being copied in memory, although this is sometimes optimized away.

> Copies happen implicitly, for example as part of an assignment y = x. The behavior of

> Copy is not overloadable; it is always a simple bit-wise copy.

> Cloning is an explicit action, x.clone(). The implementation of Clone can

> buffer in the heap. A simple bitwise copy of String values would merely copy the

> pointer, leading to a double free down the line. For this reason, String is Clone

> Clone is a supertrait of Copy, so everything which is Copy must also implement

> A type can implement Copy if all of its components implement Copy. For example, this

> Some types can’t be copied safely. For example, copying &mut T would create an aliased

> mutable reference. Copying String would duplicate responsibility for managing the

> Generalizing the latter case, any type implementing Drop can’t be Copy, because it’s

> managing some resource besides its own size_of::<T> bytes.

> If you try to implement Copy on a struct or enum containing non-Copy data, you will get

> the error E0204.

> that implementing Copy is part of the public API of your type. If the type might become

Contents:
- Overview: Copy = duplicable by bit copy; move vs copy semantics; only difference is whether source is usable afterwards.
- How to implement: derive (adds Copy bound on type parameters) or manual impl with Clone returning *self.
- Copy vs Clone: Copy implicit and non-overloadable; Clone explicit; String is Clone but not Copy (double free); Clone is a supertrait.
- When can my type be Copy: all components Copy; Point vs PointList; shared references are Copy.
- When can't: &mut T, String, and any type implementing Drop.
- When should: generally yes, but Copy is public API.
- Additional implementors: function items/pointers, capture-less or all-Copy-capture closures.
- Not dyn compatible; implementors list (ManuallyDrop<T: Copy>, &T, raw pointers, etc.).
- Not covered in this source: drop flags, leaking, File close errors.
- Note: URL (2) was taken as the std Copy page; the Reference special-types-and-traits page was not fetched.

## Drop in std::ops
URL: https://doc.rust-lang.org/std/ops/trait.Drop.html
Version: std 1.99.0 (b940084d7 2026-09-28); trait since 1.0.0

> When a value is no longer needed, Rust will run a “destructor” on that value.

> A call to Drop::drop for that value, if this special Drop trait is implemented for its type.

> The automatically generated “drop glue” which recursively calls the destructors

> of all the fields of this value.

> Once a value of that type is no longer going to be used, it should “clean up” its

> resource by freeing the memory or closing the file or socket. This is

> Rust will first call Drop::drop for _x and then for both _x.one and _x.two,

> Because Drop::drop is used to clean up a value, it may be dangerous to use this value after

> the method has been called. As Drop::drop does not take ownership of its input,

> Rust prevents misuse by not allowing you to call Drop::drop directly.

> If you’d like to explicitly call the destructor of a value, mem::drop can be used instead.

> order that they’re declared: first one, then two. If you’d like to try

> integer, and then use it in the println! inside of Drop. This behavior is

> guaranteed by the language.

> Unlike for structs, local variables are dropped in reverse order:

> You cannot implement both Copy and Drop on the same type. Types that

> are Copy get implicitly duplicated by the compiler, making it very

> hard to predict when, and how often destructors will be executed. As such,

> these types cannot have destructors.

> Dropping interacts with the borrow checker in subtle ways: when a type T is being implicitly

> stably guaranteed and subject to change. Currently, the analysis works as follows:

> and cannot be called explicitly (this is compiler error E0040).

> When this method has been called, self has not yet been deallocated.

> Implementations should generally avoid panic!ing, because drop() may itself be called

> during unwinding due to a panic, and if the drop() panics in that situation (a “double

> panic”), this will likely abort the program.

> Note that even if this panics, the value is considered to be dropped;

> you must not cause drop to be called again. This is normally automatically

> handled by the compiler, but when using unsafe code, can sometimes occur

> unintentionally, particularly when using ptr::drop_in_place.

Contents:
- Overview: destructor = Drop::drop call plus compiler-generated drop glue recursing into fields; Drop is mainly for types owning resources (memory, file descriptor, socket).
- Example HasTwoDrops: output order Running!, outer drop, then fields; fields still dropped without a Drop impl.
- Cannot call Drop::drop yourself (E0040); use mem::drop.
- Drop order: struct fields in declaration order (guaranteed by the language); locals in reverse order; example Foo/Bar.
- Copy and Drop are exclusive, with reason.
- Drop check: borrow checker rules, example rejected for cyclic references, drop-glue/owned-types analysis, generic params must be live if T: Drop, may_dangle is nightly-only.
- Provided method drop: self not yet deallocated during drop; Panics section (double panic aborts, value considered dropped even if drop panics, do not drop twice with ptr::drop_in_place).
- Provided method pin_drop (nightly, pin_ergonomics).
- Dyn compatible; implementors list (Box, Rc, Arc, Vec, MutexGuard, BufWriter, OwnedFd, etc.).
- Not covered in this source: drop flags, File close errors, leaking (mem::forget).

## Tail expression temporary scope - The Rust Edition Guide
URL: https://doc.rust-lang.org/edition-guide/rust-2024/temporary-tail-expr-scope.html
Version: no date shown on page; Rust 2024 edition chapter (release 1.85.0 per the Rust 2024 index page)

> Temporary values generated in evaluation of the tail expression of a function or closure body, or a block may now be dropped before local variables, and are sometimes not extended to the next larger temporary scope.

> The 2024 Edition changes the drop order of temporary values in tail expressions.

> It often comes as a surprise that, before the 2024 Edition, temporary values in tail expressions can live longer than the block itself, and are dropped later than the local variable bindings, as in the following example:

> // Before 2024

> use std::cell::RefCell;

> let c = RefCell::new("..");

> c.borrow().len() // error[E0597]: `c` does not live long enough

> This yields the following error with the 2021 Edition:

> | ... and the borrow might be used here, when that temporary is dropped and runs the destructor for type `Ref<'_, &str>`

> = note: the temporary is part of an expression at the end of a block;

> consider forcing this temporary to be dropped sooner, before the block's local variables are dropped

> In 2021 the local variable c is dropped before the temporary created by c.borrow().

> The 2024 Edition changes this so that the temporary value c.borrow() is dropped first, followed by dropping the local variable c, allowing the code to compile as expected.

> When a temporary is created in order to evaluate an expression, the temporary is dropped based on the temporary scope rules.

> Before 2024, temporaries from tail expressions of a block would be extended outside the block to the next temporary scope boundary.

> In many cases this would be the end of a statement or function body.

> In 2024, the temporaries of the tail expression may now be dropped immediately at the end of the block (before any local variables in the block).

> This narrowing of the temporary scope may cause programs to fail to compile in 2024.

> // This example works in 2021, but fails to compile in 2024.

> let x = { &String::from("1234") }.len();

> In this example, in 2021, the temporary String is extended outside of the block, past the call to len(), and is dropped at the end of the statement.

> In 2024, it is dropped immediately at the end of the block, causing a compile error about the temporary being dropped while borrowed.

> The solution for these kinds of situations is to lift the block expression out to a local variable so that the temporary lives long enough:

> let s = { &String::from("1234") };

> Temporary lifetime extension is a set of specific rules which allow temporaries to live longer than they normally would.

> Because the String temporary is behind a reference, the String temporary is extended long enough for the next statement to call len() on it.

> See the if let temporary scope chapter for a similar change made to temporary scopes of if let expressions.

> Unfortunately, there are no semantics-preserving rewrites to shorten the lifetime for temporary values in tail expressions1.

> The tail_expr_drop_order lint detects if a temporary value with a custom, non-trivial Drop destructor is generated in a tail expression.

> Warnings from this lint will appear when running cargo fix --edition, but will otherwise not automatically make any changes.

> It is recommended to manually inspect the warnings and determine whether or not you need to make any adjustments.

> #![warn(tail_expr_drop_order)]

> Details are documented at RFC 3606

Contents:
- Summary: tail-expression temporaries may drop before locals and may not extend to the next larger temporary scope.
- Details: pre-2024 RefCell example (c.borrow().len()) failing with E0597, full compiler error text, 2024 fix (temporary dropped before c).
- Temporary scope may be narrowed: pre-2024 extension to enclosing boundary vs 2024 drop at end of block; `{ &String::from("1234") }.len()` compiles in 2021 and fails in 2024; fix by lifting to a local (relies on temporary lifetime extension); cross-link to if let chapter.
- Migration: no semantics-preserving rewrite; tail_expr_drop_order lint; cargo fix --edition only warns, makes no changes; manual inspection; #![warn(tail_expr_drop_order)]; RFC 3606 footnote.


## Patterns - The Rust Reference (wildcard pattern)
URL: https://doc.rust-lang.org/reference/patterns.html
Version: The Rust Reference (no version string in fetched text), fetched 2026-10-11 by the fact-check

> The wildcard pattern (an underscore symbol) matches any value. It is used to ignore values when they don’t matter.

> Unlike identifier patterns, it does not copy, move, or borrow the value it matches.

> The wildcard pattern is always irrefutable.

Contents:
- Wildcard pattern: syntax `_`; matches any value; inside other patterns matches one field; does not copy, move or borrow; always irrefutable; examples (tuple, closure parameter, struct field, `Some(_)`).
- (Rest of the chapter, not used here: literal, identifier, rest, range, reference, struct, tuple, slice, path and or-patterns; binding modes.)

## Deny-by-default Lints - The rustc book (let_underscore_lock)
URL: https://doc.rust-lang.org/rustc/lints/listing/deny-by-default.html
Version: rustc book, current online edition as fetched 2026-10-11 (no version string in the text); the lint's message matches rustc 1.97.0 (measured)

> The let_underscore_lock lint checks for statements which don’t bind a mutex to anything, causing the lock to be released immediately instead of at end of scope, which is typically incorrect.

> let _ = data.lock().unwrap();

> error: non-binding let on a synchronization lock

> this lock is not assigned to a binding and is immediately dropped

> = note: `#[deny(let_underscore_lock)]` (part of `#[deny(let_underscore)]`) on by default

> help: consider binding to an unused variable to avoid immediately dropping the value

Contents:
- let_underscore_lock: what it checks (a lock not bound to anything is released at once), example with `Arc<Mutex<_>>` in a spawned thread, the error text, deny by default, part of the `let_underscore` group.
- (Rest of the page: the other deny-by-default lints, not used here.)

## Running Code on Cleanup with the Drop Trait - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch15-03-drop.html
Version: the Book, current online edition as fetched 2026-10-11 (chapter 15.3 per the URL); prerequisite reading only

> Rust doesn’t let you call the Drop trait’s drop method manually; instead, you have to call the std::mem::drop function provided by the standard library if you want to force a value to be dropped before the end of its scope.

> Rust doesn’t let us call drop explicitly, because Rust would still automatically call drop on the value at the end of main. This would cause a double free error because Rust would be trying to clean up the same value twice.

Contents:
- `Drop` in the smart-pointer context; `CustomSmartPointer` example (variables dropped in reverse order of creation); why `drop` can't be called manually (E0040, double free); `std::mem::drop` to drop early.

## Reference Cycles Can Leak Memory - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch15-06-reference-cycles.html
Version: the Book, current online edition as fetched 2026-10-11 (chapter 15.6 per the URL)

> Rust’s memory safety guarantees make it difficult, but not impossible, to accidentally create memory that is never cleaned up (known as a memory leak).

> Preventing memory leaks entirely is not one of Rust’s guarantees, meaning memory leaks are memory safe in Rust.

Contents:
- Leaks are memory safe; `Rc<T>` + `RefCell<T>` cycles never reach a count of 0; creating a cycle; preventing cycles with `Weak<T>` (Ch.4 material here).

## std::vec::Vec::drain (Leaking)
URL: https://doc.rust-lang.org/std/vec/struct.Vec.html
Version: std 1.99.0 (b940084d7 2026-09-28); Vec::drain stable since 1.6.0

> 1.6.0 · Sourcepub fn drain<R>(&mut self, range: R) -> Drain<'_, T, A>

> If the iterator is dropped before being fully consumed, it drops the remaining removed elements.

> If the returned iterator goes out of scope without being dropped (due to mem::forget, for example), the vector may have lost and leaked elements arbitrarily, including elements outside the range.

Contents:
- `Vec::drain`: removes a range, returns a double-ended iterator; dropping it early drops the remaining removed elements; Panics; Leaking (a forgotten `Drain` may lose and leak elements, including outside the range); examples (`drain(1..)`, `drain(..)` clears).
- (The rest of the large `Vec` page is not used here.)

## std::pin (Drop guarantee)
URL: https://doc.rust-lang.org/std/pin/index.html
Version: std 1.99.0 docs as fetched 2026-10-11 (module page)

> Therefore, pinning data also comes with the “Drop guarantee”.

> The memory location that stores the value must not get invalidated or otherwise repurposed during the lifespan of the pinned value until its drop returns or panics

> Thus, in any situation where we may want to overwrite a pinned value, that value’s drop must be called beforehand (unless the pinned value implements Unpin, in which case we can ignore all of Pin’s guarantees, as usual).

> Of course, leaking memory in such a way that its underlying storage will never get invalidated or re-used is still fine: mem::forgeting a Box<T> prevents its storage from ever getting re-used, so the drop guarantee is still satisfied.

Contents:
- Pinning, address-sensitive values, `Unpin`; "Subtle details and the Drop guarantee": a pinned value's storage must not be reused or invalidated until its `drop` ran; leaking is still allowed; `ManuallyDrop` inside a pinned box can never be made safe; structural pinning and `VecDeque`'s destructor. (Taught in Ch.8; one frontier sentence here.)

## Static items - The Rust Reference
URL: https://doc.rust-lang.org/reference/items/static-items.html
Version: The Rust Reference (no version string in fetched text), fetched 2026-10-11

> Static items have the static lifetime, which outlives all other lifetimes in a Rust program. Static items do not call drop at the end of the program.

Contents:
- Static items: `'static` lifetime, never dropped at program end; mutable statics; statics with generics; `static` vs `const`.

## Pre-Pooping Your Pants With Rust - Faultlore (secondary)
URL: https://faultlore.com/blah/everyone-poops/
Version: Aria Desires, dated "April 27, 2015" on the page (the author preserved the post and added an undated preface); secondary source

> Pre-Pooping Your Pants With Rust

> Aria Desires

> April 27, 2015

> Also I rebranded “Pre-Pooping Your Pants” as just “Leak Amplification”.

> §Leakpocalypse

> Much existential anguish and ennui was recently triggered by Rust Issue #24292: std::thread::JoinGuard (and scoped) are unsound because of reference cycles. If you feel like you’re sufficiently familiar with Leakpocalypse 2k15, feel free to skip to the next section.

> You can use a reference cycle to leak a JoinGuard and then the scoped thread can access freed memory

> no dtor - leaking is irrelevant: primitives, pointers.

> leaks system resources - not a big deal: Most collections and smaht pointer types, when they contain primitives will simply waste heap space if leaked.

> leaks arbitrary other dtors - acceptable but nasty: Collections and smaht pointer types in general.

> leaves the world in an unexpected but safe state - a scary footgun:

> leaves the world in a broken state - unacceptable: Vec::drain_range as written above.

> Generally, one should strive to push their destructor reliance as far up this hierarchy as is practical, with the last category in the hierarchy verboten by an API that claims to be safe.

> unsafe { self.set_len(a); }

Contents:
- Preface: the author points to the Nomicon's "Leaking" section as the better version and renames the pattern "Leak Amplification".
- "Leakpocalypse": issue #24292, `JoinGuard`/`thread::scoped` unsound through reference cycles; why `thread::scoped` was attractive.
- The leak-reliance ladder (no dtor; leaks system resources; leaks other dtors; unexpected but safe state; broken state).
- Pre-poop pattern: `drain_range` sets `len` to the range start before handing out the proxy.

## Go spec: Defer statements
URL: https://go.dev/ref/spec
Version: Language version go1.27 (May 26, 2026)

> A "defer" statement invokes a function whose execution is deferred to the moment the surrounding function returns, either because the surrounding function executed a return statement, reached the end of its function body, or because the corresponding goroutine is panicking.

Contents:
- Defer statements only (the rest of the spec is not used): deferred to function return, not block exit.

## Python: The with statement
URL: https://docs.python.org/3/reference/compound_stmts.html
Version: Python 3.15.0 documentation

> The with statement is used to wrap the execution of a block with methods defined by a context manager

Contents:
- The `with` statement (a block wrapped by a context manager's `__enter__`/`__exit__`); the rest of the chapter is not used.

## JLS 14.20.3 try-with-resources
URL: https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html
Version: The Java Language Specification, Java SE 27 Edition, chapter 14

> A try-with-resources statement is parameterized with variables (known as resources) that are initialized before execution of the try block and closed automatically, in the reverse order from which they were initialized, after execution of the try block.

Contents:
- 14.20.3 try-with-resources only: resources closed automatically after the try block, in reverse order.

## C++ draft standard [class.dtor]
URL: https://eel.is/c++draft/class.dtor
Version: C++ working draft as published at eel.is, fetched 2026-10-11

> for a constructed object with automatic storage duration ([basic.stc.auto]) when the block in which an object is created exits ([stmt.dcl]),

Contents:
- Destructors: declaration, implicit invocation for static, thread, automatic and temporary objects; array elements destroyed in reverse order of construction.

## C++ draft standard [lib.types.movedfrom]
URL: https://eel.is/c++draft/lib.types.movedfrom
Version: C++ working draft as published at eel.is, fetched 2026-10-11

> Unless otherwise specified, such moved-from objects shall be placed in a valid but unspecified state

Contents:
- Moved-from standard-library objects stay valid (so they still exist and are destroyed later).

## systemd-system.conf (DefaultLimitNOFILE)
URL: https://raw.githubusercontent.com/systemd/systemd/main/man/systemd-system.conf.xml
Version: systemd `main` branch man page source, fetched 2026-10-11

> DefaultLimitNOFILE= defaults to 1024

Contents:
- Manager defaults; resource-limit defaults (`DefaultLimitNOFILE=` soft limit 1024, `DefaultLimitMEMLOCK=` 8M). Used only for Prove it 6's descriptor limit.

## Announcing Rust 1.0 | Rust Blog
URL: https://blog.rust-lang.org/2015/05/15/Rust-1.0/
Version: The Rust Core Team, May 15, 2015

> May 15, 2015

> Today we are very proud to announce the 1.0 release of Rust

Contents:
- The 1.0 release announcement (date only; anchors "just before Rust 1.0" for RFC 1066, start date 2015-04-15).

## std::process::exit
URL: https://doc.rust-lang.org/std/process/fn.exit.html
Version: std 1.99.0

> no destructors on the current stack or any other thread’s stack will be run

Contents:
- `exit` runs no destructors on any thread's stack (step 14, Deep dive "Ways a destructor is skipped").

## std::thread (module)
URL: https://doc.rust-lang.org/std/thread/index.html
Version: std 1.99.0

> When the main thread of a Rust program terminates, the entire program shuts down, even if other threads are still running, and any destructors on the remaining threads’ stacks may not be executed.

Contents:
- Main thread ends the process; other threads' destructors may not run (step 14, Deep dive; measured in `examples/unwind.rs`, mode `thread`).

## std::thread::LocalKey
URL: https://doc.rust-lang.org/std/thread/struct.LocalKey.html
Version: std 1.99.0

> Note that a “best effort” is made to ensure that destructors for types stored in thread local storage are run, but not all platforms can guarantee that destructors will be run for all types in thread local storage.

> On Unix systems when pthread-based TLS is being used, destructors will not be run for TLS values on the main thread when it exits.

Contents:
- Thread-local destructors are best effort and may not run on the main thread at exit (Deep dive "Ways a destructor is skipped").

## Operator expressions (assignment) - The Rust Reference
URL: https://doc.rust-lang.org/reference/expressions/operator-expr.html
Version: Reference, as fetched 2026-10-11

> Evaluating assignment expressions begins by evaluating its operands. The assigned value operand is evaluated first, followed by the assignee expression.

> It then has the effect of first dropping the value at the assigned place, unless the place is an uninitialized local variable or an uninitialized field of a local variable.

Contents:
- Assignment evaluates the new value first, then drops the old one (step 4, Deep dive table row `assign`; measured with `built("v2")` in `examples/trace.rs`).

## Ownership and Destruction - The Rust Specification (FLS)
URL: https://rust-lang.github.io/fls/ownership-and-deconstruction.html
Version: FLS, chapter 15, as fetched 2026-10-11

> Dropping a value is the act of invoking the destructor of the related type.

> If the drop type implements the core::ops::Drop trait, then core::ops::Drop::drop of the drop type is invoked.

> Otherwise, if the drop type is a struct type, then its fields are dropped in declaration order.

> Otherwise, if the drop type is an enum type, then the fields of the active enum variant are dropped in declaration order.

> All other bindings are dropped in reverse declaration order.

> When a drop scope of a function is left, then each function parameter is dropped from right to left as follows:

> When multiple drop scopes are left at once, the values are dropped from the innermost drop scope to the outermost drop scope.

> Drop scope extension is the process of extending a drop scope associated with a temporary to prevent the premature dropping of the temporary.

Contents:
- 15.7 Destructors, 15.8 Drop Scopes (and 15.8.1 Drop Scope Extension), 15.9 Drop Order: the specification text for the rules the Reference states (Deep dive).

## std::ptr::drop_in_place
URL: https://doc.rust-lang.org/std/ptr/fn.drop_in_place.html
Version: std 1.99.0

> Executes the destructor (if any) of the pointed-to value.

> It is required to use drop_in_place to drop unsized types like trait objects, because they can’t be read out onto the stack and dropped normally.

> It can be used to drop pinned data when T is not repr(packed) (pinned data must not be moved before it is dropped).

> Additionally, if T is not Copy, using the pointed-to value after calling drop_in_place can cause undefined behavior.

Contents:
- `drop_in_place` runs a destructor through a pointer, is required for unsized values, and the pointee must not be used afterwards (Deep dive "The destructor, as the Reference states it").
