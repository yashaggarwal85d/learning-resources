use std::cell::Cell;
use std::sync::Arc;
use std::thread;

fn main() {
    let counter: Arc<Cell<u64>> = Arc::new(Cell::new(0));
    let c2 = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        c2.set(c2.get() + 1);
    });
    handle.join().unwrap();
    println!("{}", counter.get());
}
