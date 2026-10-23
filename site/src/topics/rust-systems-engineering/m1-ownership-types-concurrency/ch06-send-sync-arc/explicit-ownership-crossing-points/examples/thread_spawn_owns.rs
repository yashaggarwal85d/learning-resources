// thread::spawn's closure is `move`: the String's ownership crosses to the new
// thread for real. The spawning thread can no longer touch it afterwards; only
// the join handle's return value comes back.
use std::thread;

fn main() {
    let message = String::from("owned by the new thread now");
    let handle = thread::spawn(move || {
        // `message` was moved in; this thread owns it.
        message.len()
    });
    let len = handle.join().unwrap();
    println!("{}", len);
}
