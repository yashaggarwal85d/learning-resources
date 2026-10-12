#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
use std::mem;
struct ReplaceGuard<'p> { buf: Buf, pool: &'p mut Pool }
impl<'p> ReplaceGuard<'p> {
    fn new(pool: &'p mut Pool) -> ReplaceGuard<'p> { let buf = pool.get(); ReplaceGuard { buf, pool } }
    fn into_inner(mut self) -> Buf { mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() }) }
}
impl Drop for ReplaceGuard<'_> {
    fn drop(&mut self) {
        let buf = mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() });
        self.pool.put(buf);
    }
}
fn main() {
    let msg = message(1, 261);
    let mut pool = Pool::new();
    let a0 = allocs();
    for _ in 0..1000 {
        let mut g = ReplaceGuard::new(&mut pool);
        fill(&mut g.buf, &msg);
        let buf = consume(g.into_inner());
        pool.put(buf);
    }
    let a1 = allocs();
    let zero_ids = pool.free.iter().filter(|b| b.id == 0).count();
    println!("placeholder: allocs={} free={} placeholders={}", a1 - a0, pool.free.len(), zero_ids);
    let mut pool = Pool::new();
    let a0 = allocs();
    for _ in 0..1000 {
        let mut g = PooledBuf::new(&mut pool);
        fill(g.buf_mut(), &msg);
        let buf = consume(g.into_inner());
        pool.put(buf);
    }
    println!("option: allocs={} free={}", allocs() - a0, pool.free.len());
}
