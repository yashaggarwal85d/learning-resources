// channel().send() is the fourth ownership-crossing point: the value's
// ownership moves from the sending thread into the channel, and out again
// only when the receiving thread calls recv(). Many senders (clone-able),
// one receiver: std::sync::mpsc's own shape.
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();

    let h1 = thread::spawn(move || {
        tx.send(String::from("from producer one")).unwrap();
    });
    let h2 = thread::spawn(move || {
        tx2.send(String::from("from producer two")).unwrap();
    });

    h1.join().unwrap();
    h2.join().unwrap();

    let mut received = vec![rx.recv().unwrap(), rx.recv().unwrap()];
    received.sort();
    println!("{}", received.len());
}
