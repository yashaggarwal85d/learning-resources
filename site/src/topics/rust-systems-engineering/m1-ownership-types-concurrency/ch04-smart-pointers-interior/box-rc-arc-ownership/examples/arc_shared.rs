// Arc<T>: the same shared-ownership shape as Rc, but the reference count is atomic, so it's safe
// to clone and drop from more than one thread. That safety is what topic 12's contention
// measurement shows is not free once more than one thread actually touches the same count.
use std::sync::Arc;
use std::thread;

struct Node {
    text: &'static str,
}

fn main() {
    let shared = Arc::new(Node { text: "shared" });
    let mut handles = Vec::new();
    for _ in 0..4 {
        let s = Arc::clone(&shared);
        handles.push(thread::spawn(move || s.text.len()));
    }
    let mut total = 0usize;
    for h in handles {
        total += h.join().unwrap();
    }
    let count = Arc::strong_count(&shared);
    println!("{} {}", total, count);
}
