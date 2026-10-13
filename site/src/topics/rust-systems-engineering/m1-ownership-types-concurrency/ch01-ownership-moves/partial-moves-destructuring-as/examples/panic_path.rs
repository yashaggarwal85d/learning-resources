#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
include!("pooled.rs");
use std::panic::{catch_unwind, AssertUnwindSafe};
fn check_or_panic(buf: &Buf) -> Header {
    let h = inspect(buf);
    if h.kind == 0 { panic!("malformed message"); }
    h
}
fn stage_guarded(pool: &mut Pool, src: &[u8]) -> Header {
    let mut g = PooledBuf::new(pool);
    fill(g.buf_mut(), src);
    check_or_panic(g.buf())        // a panic here unwinds through `g`, whose drop puts the buffer back
}
fn main() {
    std::panic::set_hook(Box::new(|_| {}));
    let good = message(1, BUF_CAP);
    let bad = message(0, BUF_CAP);
    let mut pool = Pool::new();
    let a0 = allocs();
    let mut caught = 0;
    for i in 0..100 {
        let src = if i % 10 == 9 { &bad } else { &good };
        let r = catch_unwind(AssertUnwindSafe(|| stage_guarded(&mut pool, src)));
        if r.is_err() { caught += 1; }
    }
    let counted = allocs() - a0;
    println!("guarded: caught={caught} buffers_made={} free={}", pool.next_id, pool.free.len());
    println!("panic machinery: allocations beyond the one buffer={}", counted > 1);
}
