#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
struct Slot { buf: Option<Buf> }
fn take_buf(slot: &mut Slot) -> Option<Buf> {
    match slot.buf {
        Some(b) => Some(b),
        None => None,
    }
}
fn main() {}
