// Cell<T> is invariant over T (it has the same variance as UnsafeCell<T>, because of interior mutability),
// so Cell<&'static str> cannot stand in for Cell<&'a str> with a shorter 'a, even behind a shared reference.
use std::cell::Cell;

fn require_same<'a>(cell: &Cell<&'a str>, val: &'a str) {
    cell.set(val);
}

fn main() {
    let cell: Cell<&'static str> = Cell::new("hello");
    let world = String::from("world");
    require_same(&cell, world.as_str());
}
