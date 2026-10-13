#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
struct Parts { head: Trace, body: Trace, tail: Trace }
fn main() {
    let mut p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
    let q = p;
    p.body = Trace("body2");
}
