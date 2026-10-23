// arc-swap's RCU-style ArcSwap: readers load a consistent snapshot with no lock at all; a writer
// swaps in a whole new value atomically. A reader never sees a half-updated struct, and never
// sees a version older than the one it already saw.
use arc_swap::ArcSwap;
use std::sync::Arc;
use std::thread;

#[derive(Clone)]
struct Config {
    version: u32,
}

fn main() {
    let shared = Arc::new(ArcSwap::from_pointee(Config { version: 1 }));
    let reader_shared = Arc::clone(&shared);

    let reader = thread::spawn(move || {
        let mut last_seen = 0u32;
        let mut went_backward = false;
        for _ in 0..200_000 {
            let snapshot = reader_shared.load();
            if snapshot.version < last_seen {
                went_backward = true;
            }
            last_seen = snapshot.version;
        }
        (last_seen, went_backward)
    });

    for v in 2..=5u32 {
        shared.store(Arc::new(Config { version: v }));
    }

    let (last_seen, went_backward) = reader.join().unwrap();
    println!("{} {}", last_seen >= 1, went_backward);
}
