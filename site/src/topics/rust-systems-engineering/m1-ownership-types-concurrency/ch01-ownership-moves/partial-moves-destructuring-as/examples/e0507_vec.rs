#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let v = vec![pool.get(), pool.get()];
    let first = v[0];
}
