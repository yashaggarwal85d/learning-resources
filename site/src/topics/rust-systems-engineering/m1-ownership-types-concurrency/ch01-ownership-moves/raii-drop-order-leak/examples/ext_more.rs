#![allow(dead_code, unused_variables)]
use std::cell::RefCell;
use std::mem;
use std::pin::pin;

thread_local! { static LOG: RefCell<Vec<&'static str>> = RefCell::new(Vec::new()); }
struct S(&'static str);
impl Drop for S {
    fn drop(&mut self) {
        LOG.with(|l| l.borrow_mut().push(self.0));
    }
}
fn push(n: &'static str) {
    LOG.with(|l| l.borrow_mut().push(n));
}
fn report(label: &str) {
    let v = LOG.with(|l| mem::take(&mut *l.borrow_mut()));
    println!("{label}: {v:?}");
}
fn id<T>(x: T) -> T {
    x
}

fn main() {
    {
        let x = Some(&S("some"));
        push("after-some");
    }
    report("some");
    {
        let f = format_args!("{:?}", S("fa").0);
        let g = pin!(S("pin"));
        push("after-pin");
    }
    report("pin");
    {
        let r = id(&S("arg"));
        push("after-arg");
    }
    report("arg");
}
