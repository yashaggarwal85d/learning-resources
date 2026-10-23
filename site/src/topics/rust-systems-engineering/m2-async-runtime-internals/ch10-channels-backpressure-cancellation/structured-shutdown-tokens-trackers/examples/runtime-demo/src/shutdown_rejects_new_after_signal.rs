use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Builder;
use tokio::time::sleep;
use tokio_util::sync::CancellationToken;

fn try_accept(token: &CancellationToken, accepted: &Arc<AtomicUsize>) -> bool {
    if token.is_cancelled() {
        return false;
    }
    accepted.fetch_add(1, Ordering::SeqCst);
    true
}

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let token = CancellationToken::new();
        let accepted = Arc::new(AtomicUsize::new(0));

        // accept a few jobs normally, before any shutdown signal
        for _ in 0..3 {
            assert!(try_accept(&token, &accepted), "jobs submitted before shutdown should be accepted");
        }
        let accepted_before = accepted.load(Ordering::SeqCst);

        // signal shutdown: stop accepting new work from this point on
        token.cancel();
        sleep(Duration::from_millis(5)).await;

        // every attempt after the signal must be rejected, not queued
        let mut rejected_count = 0;
        for _ in 0..5 {
            if !try_accept(&token, &accepted) {
                rejected_count += 1;
            }
        }

        let accepted_after = accepted.load(Ordering::SeqCst);
        println!("{} {} {}", accepted_before, accepted_after, rejected_count);
        assert_eq!(accepted_before, 3, "3 jobs should have been accepted before shutdown");
        assert_eq!(accepted_after, accepted_before, "no new job should be accepted once shutdown has been signalled");
        assert_eq!(rejected_count, 5, "every post-shutdown submission should be rejected outright");
    });
}
