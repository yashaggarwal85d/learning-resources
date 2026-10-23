// repr(Rust) (the default): the compiler picks the field order, not the one written in the
// source. Declaring the same four fields in two different source orders still gives the
// compiler the freedom to lay both out identically, choosing whichever order it likes best.
struct HeaderAB {
    version: u8,
    flags: u8,
    length: u16,
    seq: u32,
}

struct HeaderBA {
    seq: u32,
    length: u16,
    version: u8,
    flags: u8,
}

fn main() {
    let size_ab = std::mem::size_of::<HeaderAB>();
    let size_ba = std::mem::size_of::<HeaderBA>();
    println!("{size_ab} {size_ba}");
}
