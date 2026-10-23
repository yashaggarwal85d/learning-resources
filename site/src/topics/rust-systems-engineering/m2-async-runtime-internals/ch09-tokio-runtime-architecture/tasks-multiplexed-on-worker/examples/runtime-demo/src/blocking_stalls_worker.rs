use std::time::{Duration, Instant};
use tokio::runtime::Builder;

fn main() {
    let rt = Builder::new_multi_thread()
        .worker_threads(1)
        .enable_all()
        .build()
        .unwrap();

    rt.block_on(async {
        let (tx, rx) = tokio::sync::oneshot::channel();

        // Spawned first: occupies the only worker thread with a real, non-yielding sleep.
        let blocker = tokio::spawn(async {
            std::thread::sleep(Duration::from_millis(300));
        });

        // Spawned second, right behind it in the same worker's queue: records how long it
        // actually waited before it got to run at all.
        let created = Instant::now();
        tokio::spawn(async move {
            let waited = created.elapsed();
            let _ = tx.send(waited.as_millis());
        });

        let waited_ms = rx.await.unwrap();
        blocker.await.unwrap();
        println!("{}", waited_ms);
    });
}
