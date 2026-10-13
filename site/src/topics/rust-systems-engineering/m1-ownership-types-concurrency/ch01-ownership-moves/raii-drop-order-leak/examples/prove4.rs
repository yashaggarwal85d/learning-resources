#![allow(unused_variables)]
use std::cell::RefCell;
use std::mem;
thread_local! { static LOG: RefCell<Vec<&'static str>> = RefCell::new(Vec::new()); }
struct Trace(&'static str);
impl Drop for Trace {
    fn drop(&mut self) {
        LOG.with(|l| l.borrow_mut().push(self.0));
    }
}
fn main() {
    {
        let a = Trace("a");
        let b = Trace("b");
        drop(a);
        let c = Trace("c");
    }
    let v = LOG.with(|l| mem::take(&mut *l.borrow_mut()));
    println!("prove4: {v:?}");
}
