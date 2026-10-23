// Spawn a plain (non-scoped) thread that only borrows a local, non-'static
// value. This must fail to compile: thread::spawn's F: 'static bound means
// the closure can't hold a reference to data the current function might free
// before the new thread finishes. examples.py captures the real rustc error.
use std::thread;

fn main() {
    let data = vec![1, 2, 3];
    let handle = thread::spawn(|| {
        println!("{:?}", data); // borrows `data`, not moved
    });
    handle.join().unwrap();
}
