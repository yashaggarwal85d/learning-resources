use std::time::Duration;
use tokio::runtime::Builder;
use tokio::sync::mpsc;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (tx, mut rx) = mpsc::channel::<u32>(4);

        // race recv() against a short timeout while nothing has been sent yet; the timeout
        // must win, and recv()'s future must be dropped without having consumed anything
        let cancelled = tokio::select! {
            _v = rx.recv() => false,
            _ = sleep(Duration::from_millis(20)) => true,
        };
        assert!(cancelled, "with nothing sent, the timeout should win the race");

        // now send a message, and call recv() again, fresh — if the cancelled recv() had
        // lost anything, this would either hang or receive the wrong value
        tx.send(42).await.unwrap();
        let received = tokio::time::timeout(Duration::from_millis(500), rx.recv())
            .await
            .expect("a fresh recv() must not hang")
            .expect("the channel must not be closed");

        println!("{received}");
        assert_eq!(received, 42, "a cancelled recv() must lose nothing: the next recv() should get exactly the message that was sent");
    });
}
