use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Builder;
use tokio::time::sleep;
use tokio_util::task::TaskTracker;

fn main() {
    let rt = Builder::new_multi_thread().enable_all().build().unwrap();
    let completed = Arc::new(AtomicUsize::new(0));

    rt.block_on(async {
        let tracker = TaskTracker::new();
        const N: usize = 8;

        for i in 0..N {
            let completed = completed.clone();
            tracker.spawn(async move {
                sleep(Duration::from_millis(20 + (i as u64 * 5))).await;
                completed.fetch_add(1, Ordering::SeqCst);
            });
        }

        // close the tracker, signalling that no more jobs will be added, then wait
        tracker.close();
        tracker.wait().await;

        let finished = completed.load(Ordering::SeqCst);
        println!("{finished}");
        assert_eq!(finished, N, "wait() must not return until every accepted job has actually completed, not merely been signalled");
    });
}
