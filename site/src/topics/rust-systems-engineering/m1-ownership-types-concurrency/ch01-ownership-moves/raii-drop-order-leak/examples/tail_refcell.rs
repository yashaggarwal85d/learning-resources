use std::cell::RefCell;

fn f() -> usize {
    let c = RefCell::new("..");
    c.borrow().len()
}

fn main() {
    println!("{}", f());
}
