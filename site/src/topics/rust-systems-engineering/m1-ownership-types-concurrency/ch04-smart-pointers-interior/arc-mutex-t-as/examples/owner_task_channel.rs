// Trading a lock for a queue: one thread owns the counter outright and never shares it; every
// other thread only ever sends a message asking for it to be incremented. No Mutex, no shared
// pointer to the counter at all.
use std::sync::mpsc;
use std::thread;

const TOTAL_OPS: usize = 400_000;
const SENDERS: usize = 4;

fn main() {
    let (tx, rx) = mpsc::channel::<()>();
    let per_sender = TOTAL_OPS / SENDERS;

    let owner = thread::spawn(move || {
        let mut count: u64 = 0;
        for _ in rx {
            count += 1;
        }
        count
    });

    let senders: Vec<_> = (0..SENDERS)
        .map(|_| {
            let tx = tx.clone();
            thread::spawn(move || {
                for _ in 0..per_sender {
                    tx.send(()).unwrap();
                }
            })
        })
        .collect();
    drop(tx); // the owner's loop ends once every clone of tx is dropped
    for s in senders {
        s.join().unwrap();
    }
    let count = owner.join().unwrap();
    println!("{}", count);
}
