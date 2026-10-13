#![allow(dead_code)]
include!("pipeline.rs");
include!("pooled.rs");
struct NaiveGuard<'p> { buf: Buf,
    pool: &'p mut Pool }
impl<'p> NaiveGuard<'p> {
    fn new(pool: &'p mut Pool) -> NaiveGuard<'p> { let buf = pool.get(); NaiveGuard { buf, pool } }
}
impl Drop for NaiveGuard<'_> {
    fn drop(&mut self) {
        self.pool.put(self.buf.clone());
    }
}
fn main() {
    let msg = message(1, BUF_CAP);
    let mut pool = Pool::new();
    let (a0, b0, d0) = (allocs(), BYTES.load(Relaxed), DEALLOCS.load(Relaxed));
    for _ in 0..1000 {
        let mut g = NaiveGuard::new(&mut pool);
        fill(&mut g.buf, &msg);
        let h = inspect(&g.buf);
        assert_eq!(h, Header { kind: 1, len: (BUF_CAP - 5) as u32 });
    }
    let (a1, b1, d1) = (allocs(), BYTES.load(Relaxed), DEALLOCS.load(Relaxed));
    println!("clone: allocs={} bytes={} deallocs={}", a1 - a0, b1 - b0, d1 - d0);
    let mut pool = Pool::new();
    let (a0, b0, d0) = (allocs(), BYTES.load(Relaxed), DEALLOCS.load(Relaxed));
    for _ in 0..1000 {
        let mut g = PooledBuf::new(&mut pool);
        fill(g.buf_mut(), &msg);
        let h = inspect(g.buf());
        assert_eq!(h.kind, 1);
    }
    let (a1, b1, d1) = (allocs(), BYTES.load(Relaxed), DEALLOCS.load(Relaxed));
    println!("take: allocs={} bytes={} deallocs={}", a1 - a0, b1 - b0, d1 - d0);
    println!("sizes: Buf={} Option<Buf>={} Header={} Frame={} PooledBuf={}", std::mem::size_of::<Buf>(), std::mem::size_of::<Option<Buf>>(), std::mem::size_of::<Header>(), std::mem::size_of::<Frame>(), std::mem::size_of::<PooledBuf>());
}
