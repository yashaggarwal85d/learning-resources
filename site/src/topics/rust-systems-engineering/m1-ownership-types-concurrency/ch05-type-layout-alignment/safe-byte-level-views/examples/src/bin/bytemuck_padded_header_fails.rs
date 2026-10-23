// The same four fields in the "Bad" order from the previous topic leaves real padding bytes
// between flags and seq. Deriving Pod on a type with padding is refused by the derive itself,
// at compile time, rather than silently letting an uninitialized byte be read as data later.
use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct BadHeader {
    version: u8,
    length: u16,
    flags: u8,
    seq: u32,
}

fn main() {
    println!("{}", std::mem::size_of::<BadHeader>());
}
