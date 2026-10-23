use std::time::{Duration, Instant};
use tokio::runtime::Builder;
use tokio::sync::mpsc;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_multi_thread().enable_all().build().unwrap();
    const N: usize = 20;
    const CONSUMER_DELAY_MS: u64 = 15;

    rt.block_on(async {
        let (tx, mut rx) = mpsc::channel::<usize>(1);

        let consumer = tokio::spawn(async move {
            let mut received = 0;
            while let Some(_v) = rx.recv().await {
                sleep(Duration::from_millis(CONSUMER_DELAY_MS)).await;
                received += 1;
            }
            received
        });

        let start = Instant::now();
        for i in 0..N {
            tx.send(i).await.expect("consumer is still running");
        }
        drop(tx);
        let producer_elapsed = start.elapsed();
        let received = consumer.await.unwrap();

        println!("{} {}", producer_elapsed.as_millis(), received);
        assert_eq!(received, N, "every sent message should have been received");
        // with a channel of capacity 1, the producer can get at most one message ahead of the
        // consumer; it cannot finish N sends before the consumer has drained most of them
        let min_expected_ms = (N as u64 - 2) * CONSUMER_DELAY_MS;
        assert!(
            producer_elapsed.as_millis() as u64 >= min_expected_ms,
            "a bounded channel of capacity 1 should have made the producer wait on the slow consumer, got {producer_elapsed:?}"
        );
    });
}
