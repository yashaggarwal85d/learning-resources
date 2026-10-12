#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let mut slot: Option<Buf> = Some(pool.get());
    if let Some(mut b) = &mut slot {
        b.bytes.push(1);
    }
}
