# Sources: Zero-copy parsing with borrowed views

## Cow - std::borrow - The Rust standard library
URL: https://doc.rust-lang.org/std/borrow/enum.Cow.html
Version: online edition (std 1.0.0 stability marker on the page), no date shown

> A clone-on-write smart pointer.

> The type Cow is a smart pointer providing clone-on-write functionality: it
> can enclose and provide immutable access to borrowed data, and clone the
> data lazily when mutation or ownership is required. The type is designed to
> work with general borrowed data via the Borrow trait.

The worked example this topic reproduces exactly:

> fn abs_all(input: &mut Cow<'_, [i32]>) {
> for i in 0..input.len() {
> let v = input[i];
> if v < 0 {
> // Clones into a vector if not already owned.
> input.to_mut()[i] = -v;
> }
> }
> }

> // No clone occurs because `input` doesn't need to be mutated.
> let slice = [0, 1, 2];
> let mut input = Cow::from(&slice[..]);
> abs_all(&mut input);

> // Clone occurs because `input` needs to be mutated.
> let slice = [-1, 0, 1];

`to_mut`'s own description:

> Acquires a mutable reference to the owned form of the data.

> Clones the data if it is not already owned.

Contents (item by item):
- `Cow` is a clone-on-write smart pointer with two variants, `Borrowed` and `Owned`
- it provides immutable access to borrowed data without cloning, and clones lazily only when mutation or ownership is actually required
- `to_mut` acquires a mutable reference to the owned form, cloning first only if the data is not already owned
- the `abs_all` example: a read-only pass over already-non-negative data never clones; a pass that needs to flip a sign clones into an owned `Vec` first

## Bytes - bytes - docs.rs
URL: https://docs.rs/bytes/latest/bytes/struct.Bytes.html
Version: bytes 1.12.1 (the version this topic's `examples/Cargo.toml` pins via `bytes = "1"`)

> Bytes is an efficient container for storing and operating on contiguous
> slices of memory. It is intended for use primarily in networking code, but
> could have applications elsewhere as well.

> Bytes values facilitate zero-copy network programming by allowing multiple
> Bytes objects to point to the same underlying memory.

The sharing requirement every `Bytes` implementation must meet:

> They are cheaply cloneable and thereby shareable between an unlimited amount
> of components, for example by modifying a reference count.

> Instances can be sliced to refer to a subset of the original buffer.

How cloning actually shares memory:

> When Bytes::clone() is called, Bytes will call the vtable function for
> cloning the backing storage in order to share it behind multiple Bytes
> instances.

> For Bytes implementations which point to a reference counted shared storage
> (e.g. an Arc<[u8]>), sharing will be implemented by increasing the
> reference count.

Contents (item by item):
- `Bytes` is meant for networking code and lets multiple `Bytes` values point at the same underlying memory, for zero-copy use
- every implementation must be cheaply cloneable (shareable, e.g. by bumping a reference count) and sliceable to a subset of the original buffer without copying
- cloning a `Bytes` backed by reference-counted storage shares the storage by increasing its reference count, not by copying the bytes

## yoke - docs.rs
URL: https://docs.rs/yoke/latest/yoke/
Version: yoke 0.8.4

> This crate provides Yoke<Y, C>, which allows one to "yoke" (attach) a zero-copy deserialized
> object (say, a Cow<'a, str>) to the source it was deserialized from, (say, an Rc<[u8]>),
> known in this crate as a "cart", producing a type that looks like Yoke<Cow<'static, str>, Rc<[u8]>>
> and can be moved around with impunity.

> Succinctly, this allows one to "erase" static lifetimes and turn them into dynamic ones, similarly
> to how dyn allows one to "erase" static types and turn them into dynamic ones.

Contents (item by item):
- `Yoke<Y, C>` attaches a zero-copy deserialized object to the "cart" (its backing data) it was deserialized from, producing one movable value instead of two things tied together by a lifetime
- this is described as erasing a static lifetime into a dynamic one, by analogy with how `dyn` erases a static type into a dynamic one

## ouroboros - docs.rs
URL: https://docs.rs/ouroboros/latest/ouroboros/
Version: ouroboros 0.18.5

> A crate for creating safe self-referencing structs.

## self_referencing - ouroboros - docs.rs
URL: https://docs.rs/ouroboros/latest/ouroboros/attr.self_referencing.html
Version: ouroboros 0.18.5

> This macro is used to turn a regular struct into a self-referencing one.

The worked example this topic's `ouroboros_works.rs` is modelled on:

> #[self_referencing]
> struct MyStruct {
> int_data: i32,
> float_data: f32,
> #[borrows(int_data)]
> // the 'this lifetime is created by the #[self_referencing] macro
> // and should be used on all references marked by the #[borrows] macro
> int_reference: &'this i32,
> #[borrows(mut float_data)]
> float_reference: &'this mut f32,
> }

The field vocabulary:

> self-referencing field: a field which borrows at least one other field.

> head field: a field which does not borrow any other fields, I.E. not self-referencing.

Contents (item by item):
- ouroboros exists to make self-referencing structs (a field that borrows another field of the same struct) safe to build and use
- a struct is annotated `#[self_referencing]`, and each self-referencing field is marked `#[borrows(...)]` naming which other field(s) it borrows, immutably or `mut`
- the macro generates a `{Struct}Builder` with a `_builder` closure per self-referencing field, and accessor methods (`borrow_{field}`) replace direct field access on the generated type
