use std::time::Instant;
use tokio::runtime::Builder;
use tokio::sync::{mpsc, oneshot};
use tokio::task;

const N: usize = 2_000_000;

fn main() {
    let rt = Builder::new_multi_thread()
        .worker_threads(1)
        .enable_all()
        .build()
        .unwrap();

    rt.block_on(async {
        let (tx, mut rx) = mpsc::unbounded_channel::<()>();
        for _ in 0..N {
            tx.send(()).unwrap();
        }
        drop(tx);

        let (loop_done_tx, loop_done_rx) = oneshot::channel();
        let loop_start = Instant::now();
        tokio::spawn(task::unconstrained(async move {
            while rx.recv().await.is_some() {}
            let _ = loop_done_tx.send(loop_start.elapsed());
        }));

        let (ready_tx, ready_rx) = oneshot::channel();
        let created = Instant::now();
        tokio::spawn(async move {
            let _ = ready_tx.send(created.elapsed());
        });

        let sibling_waited = ready_rx.await.unwrap();
        let loop_total = loop_done_rx.await.unwrap();

        println!("{} {}", sibling_waited.as_millis(), loop_total.as_millis());
        let gap_ms = (sibling_waited.as_millis() as i64 - loop_total.as_millis() as i64).abs();
        assert!(
            gap_ms < 10,
            "unconstrained opts the hot loop out of the budget entirely; the sibling, \
             queued behind it on the one worker, only gets to run once the loop itself finishes \
             (the two should land within a few ms of each other): \
             sibling waited {sibling_waited:?}, loop took {loop_total:?}"
        );
    });
}
