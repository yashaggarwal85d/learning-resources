use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Builder;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    let loser_completed = Arc::new(AtomicUsize::new(0));
    let loser_completed2 = loser_completed.clone();

    rt.block_on(async {
        let winner = tokio::select! {
            v = async { sleep(Duration::from_millis(10)).await; 1usize } => v,
            v = async { sleep(Duration::from_millis(300)).await; loser_completed2.fetch_add(1, Ordering::SeqCst); 2usize } => v,
        };
        assert_eq!(winner, 1, "the faster branch should win the race");

        // give the loser's original sleep duration plenty of time to have elapsed, if it
        // were still running in the background instead of genuinely having been dropped
        sleep(Duration::from_millis(400)).await;
        let ran = loser_completed.load(Ordering::SeqCst);
        println!("{} {}", winner, ran);
        assert_eq!(ran, 0, "the losing branch's future must have been dropped, not left running to complete later");
    });
}
