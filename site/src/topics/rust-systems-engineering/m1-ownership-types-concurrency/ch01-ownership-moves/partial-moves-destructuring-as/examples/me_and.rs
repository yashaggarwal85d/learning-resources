#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let b = pool.get();
    let pair = (Some(&b), 7u8);
    let (Some(&Buf { id, .. }), kind) = &pair else { return };
    println!("{id} {kind}");
}
