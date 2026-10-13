#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let bufs = vec![pool.get(), pool.get()];
    for b in &bufs {
        pool.put(*b);
    }
}
