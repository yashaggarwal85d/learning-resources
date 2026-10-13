#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
use std::rc::Rc;
fn main() {
    let mut pool = Pool::new();
    let shared = Rc::new(pool.get());
    let b: Buf = *shared;
}
