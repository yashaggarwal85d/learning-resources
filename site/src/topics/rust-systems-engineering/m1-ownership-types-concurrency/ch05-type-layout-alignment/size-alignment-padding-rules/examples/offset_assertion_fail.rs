// The same assertion technique catching a wrong layout claim at compile time: this assumes
// seq sits at offset 999, which is false, so the build itself refuses to compile — never a
// silent wrong answer discovered later at run time.
#[repr(C)]
struct Header {
    version: u8,
    flags: u8,
    length: u16,
    seq: u32,
}

const _: () = assert!(std::mem::offset_of!(Header, seq) == 999);

fn main() {}
