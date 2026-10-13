#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let header = Header { kind: 1, len: 0 };
    let d0 = DEALLOCS.load(Relaxed);
    let f;
    {
        let bx = Box::new(Frame { header, payload: pool.get() });
        f = *bx;
        println!("inside scope deallocs={}", DEALLOCS.load(Relaxed) - d0);
    }
    println!("after scope deallocs={} f.id={}", DEALLOCS.load(Relaxed) - d0, f.payload.id);
}
