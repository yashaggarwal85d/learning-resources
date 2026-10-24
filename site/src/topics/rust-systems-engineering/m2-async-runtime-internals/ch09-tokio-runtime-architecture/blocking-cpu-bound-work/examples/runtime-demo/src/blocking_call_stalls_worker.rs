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

        tokio::spawn(async {
            std::thread::sleep(Duration::from_millis(300));
        });

        let created = Instant::now();
        tokio::spawn(async move {
            let _ = tx.send(created.elapsed());
        });

        let waited = rx.await.unwrap();
        println!("{}", waited.as_millis());
        assert!(
            waited >= Duration::from_millis(250),
            "a real blocking call directly on the only worker should stall a trivial sibling for its full length"
        );
    });
}
