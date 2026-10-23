use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    let m: Arc<Mutex<u64>> = Arc::new(Mutex::new(0));
    tokio::spawn(async move {
        let mut guard = m.lock().await;
        tokio::task::yield_now().await;
        *guard += 1;
        println!("{}", *guard);
    })
    .await
    .unwrap();
}
