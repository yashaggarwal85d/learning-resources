use tokio::runtime::Builder;
use tokio::sync::broadcast;
use tokio::sync::broadcast::error::RecvError;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (tx, mut rx) = broadcast::channel::<u32>(2);

        // the receiver never reads while 5 values are sent into a channel with capacity 2;
        // the oldest ones must be overwritten and reported as lagged, not silently queued
        for v in 0..5u32 {
            tx.send(v).unwrap();
        }

        let first = rx.recv().await;
        let lagged_count = match first {
            Err(RecvError::Lagged(n)) => n,
            other => panic!("expected a Lagged error after falling behind, got {other:?}"),
        };

        let next = rx.recv().await.expect("the oldest retained value should now be readable");
        println!("{lagged_count} {next}");
        assert!(lagged_count >= 1, "falling behind a 2-capacity channel by 5 sends should report at least 1 dropped message");
        assert_eq!(next, 3, "after lagging, the next value must be the oldest one still retained");
    });
}
