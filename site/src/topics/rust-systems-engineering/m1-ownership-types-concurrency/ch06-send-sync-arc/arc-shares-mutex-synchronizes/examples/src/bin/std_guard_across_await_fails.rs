use std::sync::{Arc, Mutex};

#[tokio::main]
async fn main() {
    let m: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
    tokio::spawn(async move {
        let mut guard = m.lock().unwrap();
        tokio::task::yield_now().await;
        *guard += 1;
    })
    .await
    .unwrap();
}
