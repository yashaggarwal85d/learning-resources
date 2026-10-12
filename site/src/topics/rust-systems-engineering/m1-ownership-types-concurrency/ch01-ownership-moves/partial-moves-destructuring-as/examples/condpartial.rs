#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
struct Parts { head: Trace, body: Trace, tail: Trace }
fn maybe(c: bool) {
    let p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
    if c { let b = p.body; }
    push("end");
}
fn main() {
    maybe(true); report("moved path");
    maybe(false); report("kept path");
}
