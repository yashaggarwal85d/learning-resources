// Cell<T> mutates by copying a whole T in and out; it never hands out a reference to the inside,
// so it needs no runtime borrow tracking at all.
use std::cell::Cell;

struct Node {
    visits: Cell<u32>,
}

fn main() {
    let node = Node { visits: Cell::new(0) };
    node.visits.set(node.visits.get() + 1);
    node.visits.set(node.visits.get() + 1);
    let old = node.visits.replace(100);
    println!("{} {}", old, node.visits.get());
}
