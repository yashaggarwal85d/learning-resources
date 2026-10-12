#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let mut bufs = vec![pool.get(), pool.get()];
    let bufs2 = vec![pool.get(), pool.get()];
    let a0 = allocs();
    for b in bufs.drain(..) {
        pool.put(b);
    }
    let a1 = allocs();
    for b in bufs2 {
        pool.put(b);
    }
    let a2 = allocs();
    println!("drain allocs={} into_iter allocs={} pool={} kept_cap_ok={}", a1 - a0, a2 - a1, pool.free.len(), bufs.capacity() >= 2);
}
