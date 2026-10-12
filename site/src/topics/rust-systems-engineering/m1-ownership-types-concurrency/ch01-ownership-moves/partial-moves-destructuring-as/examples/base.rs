#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let msg = message(7, 261);
    let mut pool = Pool::new();
    let a0 = allocs(); let b0 = BYTES.load(Relaxed);
    let mut last = None;
    for _ in 0..1000 {
        let mut buf = pool.get();
        fill(&mut buf, &msg);
        let h = inspect(&buf);
        let buf = consume(buf);
        pool.put(buf);
        last = Some(h);
    }
    println!("base: allocs={} bytes={} header={:?} free={}", allocs() - a0, BYTES.load(Relaxed) - b0, last.unwrap(), pool.free.len());
}
