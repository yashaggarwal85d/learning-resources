use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use tokio::runtime::Builder;

fn main() {
    let rt = Builder::new_multi_thread()
        .worker_threads(4)
        .enable_all()
        .build()
        .unwrap();

    let thread_ids: Arc<Mutex<HashSet<std::thread::ThreadId>>> = Arc::new(Mutex::new(HashSet::new()));

    rt.block_on(async {
        let mut handles = Vec::new();
        for _ in 0..200 {
            let ids = thread_ids.clone();
            handles.push(tokio::spawn(async move {
                tokio::task::yield_now().await;
                ids.lock().unwrap().insert(std::thread::current().id());
            }));
        }
        for h in handles {
            h.await.unwrap();
        }
    });

    let distinct = thread_ids.lock().unwrap().len();
    println!("{}", distinct);
    assert!(
        distinct > 1,
        "all 200 tasks were spawned from the one worker running block_on; \
         them running across {distinct} thread(s) is only possible if some were stolen"
    );
}
