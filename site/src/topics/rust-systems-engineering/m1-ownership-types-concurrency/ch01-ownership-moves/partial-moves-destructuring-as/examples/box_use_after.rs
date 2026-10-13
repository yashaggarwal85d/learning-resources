#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let boxed: Box<Buf> = Box::new(pool.get());
    let c = *boxed;
    println!("{}", boxed.id);
}
