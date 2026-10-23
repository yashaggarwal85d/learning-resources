// repr(C) fixes field order to source order, matching the platform's C ABI — so here, unlike
// repr(Rust), the order fields are written in genuinely decides how much padding gets inserted.
#[repr(C)]
struct Good {
    version: u8,
    flags: u8,
    length: u16,
    seq: u32,
}

#[repr(C)]
struct Bad {
    version: u8,
    length: u16,
    flags: u8,
    seq: u32,
}

fn main() {
    let size_good = std::mem::size_of::<Good>();
    let size_bad = std::mem::size_of::<Bad>();
    println!("{size_good} {size_bad}");
}
