#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let x: Box<Option<Buf>> = Box::new(Some(pool.get()));
    match &x {          // RFC 2005's "Future Extensions" example: no auto-deref through Box
        Some(y) => {}
        None => {}
    }
}
