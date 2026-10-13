#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let &Frame { mut header, .. } = &frame;
    let Frame { payload, .. } = &frame;
    let &[&x] = &[&1u8];
    println!("rewrites ok: {} {} {}", header.len, payload.id, x);
}
