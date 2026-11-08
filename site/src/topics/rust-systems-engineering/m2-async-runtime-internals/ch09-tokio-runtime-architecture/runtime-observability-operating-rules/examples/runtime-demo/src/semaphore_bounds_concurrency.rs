use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::runtime::Builder;
use tokio::sync::Semaphore;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_multi_thread().worker_threads(4).enable_all().build().unwrap();
    let semaphore = Arc::new(Semaphore::new(4));
    // Every permit holder waits on this gate until the count below is taken, so the
    // snapshot is not a race against tasks finishing: four hold, sixteen wait.
    let gate = Arc::new(Semaphore::new(0));
    let current = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(AtomicUsize::new(0));
    let max_seen = Arc::new(AtomicUsize::new(0));

    rt.block_on(async {
        let mut handles = Vec::new();
        for _ in 0..20 {
            let semaphore = semaphore.clone();
            let gate = gate.clone();
            let current = current.clone();
            let started = started.clone();
            let max_seen = max_seen.clone();
            handles.push(tokio::spawn(async move {
                let _permit = semaphore.acquire().await.unwrap();
                let now = current.fetch_add(1, Ordering::SeqCst) + 1;
                max_seen.fetch_max(now, Ordering::SeqCst);
                started.fetch_add(1, Ordering::SeqCst);
                drop(gate.acquire().await.unwrap());
                current.fetch_sub(1, Ordering::SeqCst);
            }));
        }
        // wait until the four permit holders are all running, then give any fifth
        // task every chance to slip through before counting
        let deadline = Instant::now() + Duration::from_secs(5);
        while current.load(Ordering::SeqCst) < 4 {
            assert!(Instant::now() < deadline, "four tasks never got permits");
            sleep(Duration::from_millis(1)).await;
        }
        sleep(Duration::from_millis(20)).await;
        let available = semaphore.available_permits();
        let running = current.load(Ordering::SeqCst);
        let waiting = 20 - started.load(Ordering::SeqCst);
        gate.add_permits(20);
        for h in handles {
            h.await.unwrap();
        }
        let observed_max = max_seen.load(Ordering::SeqCst);
        println!("{} {} {} {}", available, running, waiting, observed_max);
        assert_eq!(available, 0, "with 20 tasks contending for 4 permits, the semaphore must be fully saturated");
        assert_eq!(running, 4, "exactly the four permit holders should be running");
        assert_eq!(waiting, 16, "the other sixteen tasks should still be waiting for a permit");
        assert_eq!(observed_max, 4, "the semaphore let {observed_max} tasks run at once; it should be exactly its 4 permits");
    });
}
