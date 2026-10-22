// The identical borrow compiles under thread::scope: the scope guarantees every spawned
// thread is joined before the scope() call itself returns, so the borrow really does
// outlive the thread.
use std::thread;

fn main() {
    let count = 42;
    thread::scope(|s| {
        s.spawn(|| {
            println!("{count}");
        });
    });
    println!("scope returned, count is still {count}");
}
