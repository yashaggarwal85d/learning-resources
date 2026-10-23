use std::time::{Duration, Instant};
use tokio::runtime::Builder;
use tokio::task;

fn main() {
    let rt = Builder::new_multi_thread()
        .worker_threads(1)
        .enable_all()
        .build()
        .unwrap();

    rt.block_on(async {
        let (tx, rx) = tokio::sync::oneshot::channel();

        task::spawn_blocking(|| {
            std::thread::sleep(Duration::from_millis(300));
        });

        let created = Instant::now();
        tokio::spawn(async move {
            let _ = tx.send(created.elapsed());
        });

        let waited = rx.await.unwrap();
        println!("{}", waited.as_millis());
        assert!(
            waited < Duration::from_millis(100),
            "the identical blocking call moved to spawn_blocking's own pool should leave the one async worker free"
        );
    });
}
