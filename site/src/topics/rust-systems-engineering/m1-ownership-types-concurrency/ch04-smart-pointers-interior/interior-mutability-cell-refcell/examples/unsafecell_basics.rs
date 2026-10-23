// UnsafeCell<T> is the one legal way to obtain a *mut T from a &T; every safe interior-mutability
// type in std (Cell, RefCell) is ultimately built on it.
use std::cell::UnsafeCell;

struct Counter {
    value: UnsafeCell<u32>,
}

impl Counter {
    fn new(start: u32) -> Self {
        Counter { value: UnsafeCell::new(start) }
    }

    fn increment(&self) {
        // SAFETY: only ever called from one thread, with no overlapping calls, so no other
        // reference to `value` is live while this raw pointer is used.
        unsafe {
            *self.value.get() += 1;
        }
    }

    fn get(&self) -> u32 {
        unsafe { *self.value.get() }
    }
}

fn main() {
    let counter = Counter::new(0);
    counter.increment();
    counter.increment();
    counter.increment();
    println!("{}", counter.get());
}
