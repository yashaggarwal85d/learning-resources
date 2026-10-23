// A Weak reference never keeps its value alive. While a strong owner still exists, upgrade
// succeeds; once the last strong owner is dropped, upgrade returns None.
use std::rc::{Rc, Weak};

fn main() {
    let strong = Rc::new(42i32);
    let weak: Weak<i32> = Rc::downgrade(&strong);
    let while_alive = weak.upgrade().is_some();
    drop(strong);
    let after_drop = weak.upgrade().is_none();
    println!("{} {}", while_alive, after_drop);
}
