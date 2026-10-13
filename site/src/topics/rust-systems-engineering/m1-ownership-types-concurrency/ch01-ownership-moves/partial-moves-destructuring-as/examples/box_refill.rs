#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let b = pool.get();
    let (a0, by0) = (allocs(), BYTES.load(Relaxed));
    let mut boxed: Box<Buf> = Box::new(b);
    let (a1, by1) = (allocs(), BYTES.load(Relaxed));
    let d0 = DEALLOCS.load(Relaxed);
    let c = *boxed;                              // move out of the box
    let d1 = DEALLOCS.load(Relaxed);
    *boxed = Buf { id: 9, bytes: Vec::new() };   // refill the same allocation
    let d2 = DEALLOCS.load(Relaxed);
    println!("Box<Buf>: allocs={} bytes={}", a1 - a0, by1 - by0);
    println!("after *boxed: deallocs={}; refilled: deallocs={} id={} moved id={}", d1 - d0, d2 - d0, boxed.id, c.id);
    let x: Box<Option<Buf>> = Box::new(Some(pool.get()));
    match *x {                                   // a by-value pattern on *box moves out
        Some(y) => println!("match *box moved out id={}", y.id),
        None => {}
    }
}
