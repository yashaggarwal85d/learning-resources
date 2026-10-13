#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn payload_of(r: &Frame) -> Buf {
    r.payload
}
fn main() {}
