// offset_of! turns "where does this field actually start" into a number the build itself
// computes, and a const assertion turns "I assumed the layout is this" into something the
// build itself verifies — both checked at compile time, never just trusted.
#[repr(C)]
struct Header {
    version: u8,
    flags: u8,
    length: u16,
    seq: u32,
}

const _: () = assert!(std::mem::size_of::<Header>() == 8);
const _: () = assert!(std::mem::offset_of!(Header, seq) == 4);

fn main() {
    println!(
        "{} {} {} {} {}",
        std::mem::size_of::<Header>(),
        std::mem::offset_of!(Header, version),
        std::mem::offset_of!(Header, flags),
        std::mem::offset_of!(Header, length),
        std::mem::offset_of!(Header, seq),
    );
}
