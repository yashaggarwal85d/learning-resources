// RefCell panics, rather than refusing to compile, when two conflicting borrows overlap at run
// time: a shared borrow still live when a mutable borrow is attempted.
use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(vec![1, 2, 3]);
    let _shared = cell.borrow();
    let _exclusive = cell.borrow_mut();
    println!("unreachable");
}
