// A repr(C) header with no padding (the "Good" field order from the previous topic) can safely
// derive bytemuck's Pod and Zeroable traits, letting a raw byte buffer be viewed as the struct
// with no unsafe code and no hand-rolled transmute.
use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct Header {
    version: u8,
    flags: u8,
    length: u16,
    seq: u32,
}

fn main() {
    let wire_bytes: [u8; 8] = [1, 0, 10, 0, 42, 0, 0, 0];
    let header: &Header = bytemuck::from_bytes(&wire_bytes);
    println!("{} {} {} {}", header.version, header.flags, header.length, header.seq);
}
