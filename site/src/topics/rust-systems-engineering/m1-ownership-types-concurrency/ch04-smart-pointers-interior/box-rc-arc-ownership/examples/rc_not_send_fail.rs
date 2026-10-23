// Rc<T> is !Send: its refcount is a plain, non-atomic counter, unsafe to touch from two threads
// at once. Moving one into thread::spawn must fail to compile.
use std::rc::Rc;
use std::thread;

fn main() {
    let shared = Rc::new(42i32);
    let handle = thread::spawn(move || {
        println!("{}", shared);
    });
    handle.join().unwrap();
}
