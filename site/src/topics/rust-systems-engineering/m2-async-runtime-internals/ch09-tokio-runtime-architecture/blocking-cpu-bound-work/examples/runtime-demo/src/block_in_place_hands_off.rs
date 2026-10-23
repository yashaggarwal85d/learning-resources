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

        let created = Instant::now();
        tokio::spawn(async move {
            let _ = tx.send(created.elapsed());
        });

        tokio::spawn(async {
            task::block_in_place(|| {
                std::thread::sleep(Duration::from_millis(300));
            });
        });

        let waited = rx.await.unwrap();
        println!("{}", waited.as_millis());
        assert!(
            waited < Duration::from_millis(100),
            "block_in_place should hand the sibling off to a new worker thread before blocking this one"
        );
    });
}
