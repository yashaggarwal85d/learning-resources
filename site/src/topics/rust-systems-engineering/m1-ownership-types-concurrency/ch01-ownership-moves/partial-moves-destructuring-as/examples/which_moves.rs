#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
use std::rc::Rc;
fn main() {
    let mut pool = Pool::new();
    let v: Vec<Buf> = vec![pool.get()];
    let shared: Rc<Buf> = Rc::new(pool.get());
    let boxed: Box<Buf> = Box::new(pool.get());
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let r: &Frame = &frame;
    let a = v[0];
    let b = *shared;
    let c = *boxed;
    let d = r.payload;
}
