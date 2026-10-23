use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Builder;
use tokio::sync::Semaphore;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_multi_thread().worker_threads(4).enable_all().build().unwrap();
    let semaphore = Arc::new(Semaphore::new(4));
    let current = Arc::new(AtomicUsize::new(0));
    let max_seen = Arc::new(AtomicUsize::new(0));

    rt.block_on(async {
        let mut handles = Vec::new();
        for _ in 0..20 {
            let semaphore = semaphore.clone();
            let current = current.clone();
            let max_seen = max_seen.clone();
            handles.push(tokio::spawn(async move {
                let _permit = semaphore.acquire().await.unwrap();
                let now = current.fetch_add(1, Ordering::SeqCst) + 1;
                max_seen.fetch_max(now, Ordering::SeqCst);
                sleep(Duration::from_millis(30)).await;
                current.fetch_sub(1, Ordering::SeqCst);
            }));
        }
        // give enough tasks time to pile up on the semaphore that it saturates
        sleep(Duration::from_millis(10)).await;
        let available = semaphore.available_permits();
        println!("{} {}", available, max_seen.load(Ordering::SeqCst));
        assert_eq!(available, 0, "with 20 tasks contending for 4 permits, the semaphore must be fully saturated");
        for h in handles {
            h.await.unwrap();
        }
    });

    let observed_max = max_seen.load(Ordering::SeqCst);
    assert!(observed_max <= 4, "the semaphore let {observed_max} tasks run at once, more than its 4 permits");
    assert!(observed_max >= 2, "the semaphore never let more than one task run at once; concurrency was not exercised");
}
