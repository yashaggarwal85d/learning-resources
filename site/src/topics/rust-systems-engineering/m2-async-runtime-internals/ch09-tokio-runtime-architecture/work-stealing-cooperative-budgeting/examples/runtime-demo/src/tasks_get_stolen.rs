use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::runtime::Builder;

// A little real work per task, so the one spawning worker cannot drain all 200 itself
// before its idle siblings wake up.
fn work() {
    let start = Instant::now();
    let mut x = 0u64;
    while start.elapsed() < Duration::from_micros(200) {
        x = std::hint::black_box(x.wrapping_add(1));
    }
}

fn main() {
    let rt = Builder::new_multi_thread()
        .worker_threads(4)
        .enable_all()
        .build()
        .unwrap();

    let thread_ids: Arc<Mutex<HashSet<std::thread::ThreadId>>> = Arc::new(Mutex::new(HashSet::new()));

    // Runtime::block_on runs its future on the calling thread, which is not a worker, and a
    // spawn from there goes to the global injection queue. So the 200 tasks are spawned from
    // inside one task that is itself running on a worker: tokio::spawn there pushes every one
    // of them onto that worker's own local queue.
    let ids = thread_ids.clone();
    rt.block_on(async move {
        tokio::spawn(async move {
            let mut handles = Vec::new();
            for _ in 0..200 {
                let ids = ids.clone();
                handles.push(tokio::spawn(async move {
                    work();
                    ids.lock().unwrap().insert(std::thread::current().id());
                }));
            }
            for h in handles {
                h.await.unwrap();
            }
        })
        .await
        .unwrap();
    });

    let distinct = thread_ids.lock().unwrap().len();
    println!("{}", distinct);
    assert!(
        distinct > 1,
        "all 200 tasks were spawned onto one worker's local queue; \
         them running across {distinct} thread(s) is only possible if some were stolen"
    );
    assert!(distinct <= 4, "tasks only ever run on the runtime's 4 worker threads, got {distinct}");
}
