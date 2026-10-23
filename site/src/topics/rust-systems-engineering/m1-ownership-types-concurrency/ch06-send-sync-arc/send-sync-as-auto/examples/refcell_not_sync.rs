use std::cell::RefCell;
use std::sync::Arc;
use std::thread;

fn main() {
    let counter: Arc<RefCell<u64>> = Arc::new(RefCell::new(0));
    let c2 = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        *c2.borrow_mut() += 1;
    });
    handle.join().unwrap();
    println!("{}", counter.borrow());
}
