// thread::spawn requires F: Send + 'static. A closure that borrows a local fails to compile,
// because the spawned thread's lifetime is not bounded by the caller's stack frame.
use std::thread;

fn main() {
    let count = 42;
    let handle = thread::spawn(|| {
        println!("{count}");
    });
    handle.join().unwrap();
}
