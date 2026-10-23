// Compiled twice under -Z randomize-layout with two different -Z layout-seed values (nightly
// only). A struct with just four fields has too few valid orderings for the randomizer to show
// much movement, so this one has eight fields to give it real room to work with.
struct Header {
    a: u8,
    b: u8,
    c: u8,
    d: u8,
    e: u16,
    f: u16,
    g: u32,
    h: u32,
}

fn main() {
    println!(
        "{} {} {} {} {} {} {} {} {}",
        std::mem::size_of::<Header>(),
        std::mem::offset_of!(Header, a),
        std::mem::offset_of!(Header, b),
        std::mem::offset_of!(Header, c),
        std::mem::offset_of!(Header, d),
        std::mem::offset_of!(Header, e),
        std::mem::offset_of!(Header, f),
        std::mem::offset_of!(Header, g),
        std::mem::offset_of!(Header, h),
    );
}
