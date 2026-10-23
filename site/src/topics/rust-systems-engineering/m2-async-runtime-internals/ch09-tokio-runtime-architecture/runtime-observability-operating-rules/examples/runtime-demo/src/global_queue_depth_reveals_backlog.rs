use tokio::runtime::Builder;

fn main() {
    let rt = Builder::new_multi_thread().worker_threads(1).enable_all().build().unwrap();
    let handle = rt.handle().clone();

    rt.block_on(async {
        let mut handles = Vec::new();
        for _ in 0..500 {
            handles.push(handle.spawn(async {
                tokio::task::yield_now().await;
            }));
        }
        // the one worker is still busy running this spawning task, so none of the
        // 500 just-spawned tasks have been polled yet: the backlog is real, not assumed
        let depth = handle.metrics().global_queue_depth();
        println!("{depth}");
        assert!(depth > 50, "runtime metrics reported only {depth} tasks queued; the backlog should still be mostly intact");
        for h in handles {
            h.await.unwrap();
        }
    });

    let depth_after = handle.metrics().global_queue_depth();
    assert_eq!(depth_after, 0, "after every task finished, the queue should be empty again");
}
