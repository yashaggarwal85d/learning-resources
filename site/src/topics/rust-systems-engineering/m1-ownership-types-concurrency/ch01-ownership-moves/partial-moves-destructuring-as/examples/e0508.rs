#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let pair = [pool.get(), pool.get()];
    let first = pair[0];
}
