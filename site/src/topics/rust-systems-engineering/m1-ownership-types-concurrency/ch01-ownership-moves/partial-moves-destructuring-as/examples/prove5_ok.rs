#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let mut bufs = vec![pool.get(), pool.get()];
    let a0 = allocs();
    for b in bufs.drain(..) {
        pool.put(b);
    }
    let bufs2 = vec![pool.get(), pool.get()];
    let a1 = allocs();
    for b in bufs2 {
        pool.put(b);
    }
    println!("drain allocs={} into_iter allocs={} vec_alloc_for_bufs2={} pool={}", a1 - a0 - 1, allocs() - a1, 1, pool.free.len());
}
