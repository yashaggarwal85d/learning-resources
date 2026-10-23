// Rc<T>: many owners of the same heap value, on one thread, via a plain, non-atomic reference
// count. Cloning an Rc never copies the Node; it bumps a count and hands back a pointer to the
// same allocation.
use std::rc::Rc;

struct Node {
    text: &'static str,
}

fn main() {
    let shared = Rc::new(Node { text: "shared" });
    let a = Rc::clone(&shared);
    let before = Rc::strong_count(&shared);
    let b = Rc::clone(&shared);
    let after = Rc::strong_count(&shared);
    drop(b);
    let after_drop = Rc::strong_count(&shared);
    println!("{} {} {} {}", a.text, before, after, after_drop);
}
