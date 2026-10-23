// RefCell<T> hands out tracked Ref/RefMut guards, checked at run time rather than compile time.
use std::cell::RefCell;

struct Node {
    children: RefCell<Vec<String>>,
}

fn main() {
    let node = Node { children: RefCell::new(Vec::new()) };
    node.children.borrow_mut().push("leaf one".to_string());
    node.children.borrow_mut().push("leaf two".to_string());
    let count = node.children.borrow().len();
    println!("{}", count);
}
