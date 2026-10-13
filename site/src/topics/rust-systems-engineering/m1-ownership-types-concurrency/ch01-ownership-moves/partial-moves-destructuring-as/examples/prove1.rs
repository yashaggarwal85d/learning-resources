#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
struct Parts { head: Trace, body: Trace, tail: Trace }
fn main() {
    {
        let p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
        let Parts { tail, .. } = p;
        drop(p.head);
        push("end");
    }
    report("prove1");
}
