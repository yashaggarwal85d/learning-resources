#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
include!("pooled.rs");
#[derive(Debug)]
pub struct BadKind(u8);
pub fn check(buf: &Buf) -> Result<Header, BadKind> {
    let h = inspect(buf);
    if h.kind == 0 { Err(BadKind(h.kind)) } else { Ok(h) }
}
fn stage_by_hand(pool: &mut Pool, src: &[u8]) -> Result<Header, BadKind> {
    let mut buf = pool.get();
    fill(&mut buf, src);
    let h = check(&buf)?; // Err: buf dropped
    pool.put(consume(buf));
    Ok(h)
}
fn stage_guarded(pool: &mut Pool, src: &[u8]) -> Result<Header, BadKind> {
    let mut g = PooledBuf::new(pool);
    fill(g.buf_mut(), src);
    let h = check(g.buf())?;       // early return: `g` drops and puts the buffer back
    Ok(h)
}
fn run(f: fn(&mut Pool, &[u8]) -> Result<Header, BadKind>, label: &str) {
    let good = message(1, BUF_CAP);
    let bad = message(0, BUF_CAP);
    let mut pool = Pool::new();
    let (a0, b0) = (allocs(), BYTES.load(Relaxed));
    let mut errors = 0;
    for i in 0..1000 {
        let src = if i % 10 == 9 { &bad } else { &good };
        if f(&mut pool, src).is_err() { errors += 1; }
    }
    let (a1, b1) = (allocs(), BYTES.load(Relaxed));
    println!("{label}: errors={errors} allocs={} bytes={}", a1 - a0, b1 - b0);
}
fn main() {
    run(stage_by_hand, "by hand");
    run(stage_guarded, "guarded");
    // into_inner: hand the buffer out, the guard returns nothing
    let mut pool = Pool::new();
    let msg = message(1, 261);
    let a0 = allocs();
    for _ in 0..1000 {
        let mut g = PooledBuf::new(&mut pool);
        fill(g.buf_mut(), &msg);
        let buf = consume(g.into_inner());   // owned again; the guard is gone
        pool.put(buf);                        // returned by hand
    }
    println!("into_inner loop allocs={}", allocs() - a0);
}
