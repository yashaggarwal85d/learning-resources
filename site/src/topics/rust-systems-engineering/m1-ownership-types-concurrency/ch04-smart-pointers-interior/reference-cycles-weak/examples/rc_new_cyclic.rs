// Rc::new_cyclic hands the constructor a Weak reference to the value it is still building,
// for structures that need to reference themselves from the moment they exist.
use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Node {
    name: &'static str,
    self_ref: RefCell<Weak<Node>>,
}

fn main() {
    let node = Rc::new_cyclic(|weak_self| Node { name: "root", self_ref: RefCell::new(weak_self.clone()) });
    let before_upgrade = Rc::strong_count(&node);
    let upgraded = node.self_ref.borrow().upgrade().expect("the node is still alive");
    println!("{} {} {}", upgraded.name, before_upgrade, Rc::strong_count(&node));
}
