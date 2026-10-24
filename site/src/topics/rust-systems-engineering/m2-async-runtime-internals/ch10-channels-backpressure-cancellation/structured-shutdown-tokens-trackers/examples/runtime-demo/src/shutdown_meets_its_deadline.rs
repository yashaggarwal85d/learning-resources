use std::time::{Duration, Instant};
use tokio::runtime::Builder;
use tokio::time::{sleep, timeout};
use tokio_util::task::TaskTracker;

fn main() {
    let rt = Builder::new_multi_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let tracker = TaskTracker::new();

        // 3 jobs finish quickly, but one straggler takes far longer than the shutdown
        // deadline this sequence is willing to wait for
        for _ in 0..3 {
            tracker.spawn(async { sleep(Duration::from_millis(30)).await });
        }
        tracker.spawn(async { sleep(Duration::from_millis(2000)).await });
        tracker.close();

        let deadline = Duration::from_millis(300);
        let start = Instant::now();
        let result = timeout(deadline, tracker.wait()).await;
        let elapsed = start.elapsed();

        println!("{} {}", result.is_err(), elapsed.as_millis());
        assert!(result.is_err(), "a shutdown sequence waiting on a straggler past its deadline must time out, not hang");
        assert!(elapsed < Duration::from_millis(500), "the wait must stop close to its own deadline, not well past it, got {elapsed:?}");
        assert!(elapsed >= deadline, "the wait must not return before its deadline either, got {elapsed:?}");
    });
}
