use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Builder;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_multi_thread().enable_all().build().unwrap();
    let ticks = Arc::new(AtomicUsize::new(0));
    let ticks2 = ticks.clone();

    rt.block_on(async {
        let handle = tokio::spawn(async move {
            for _ in 0..10 {
                sleep(Duration::from_millis(20)).await;
                ticks2.fetch_add(1, Ordering::SeqCst);
            }
        });

        // drop the handle immediately, without aborting or awaiting it
        drop(handle);

        // the task keeps running on the runtime even though nothing holds a handle to it
        sleep(Duration::from_millis(150)).await;
        let ticked = ticks.load(Ordering::SeqCst);
        println!("{ticked}");
        assert!(ticked >= 3, "the detached task should have kept ticking after its JoinHandle was dropped, got {ticked} ticks");
    });
}
