use std::time::Duration;
use tokio::io::AsyncReadExt;
use tokio::io::AsyncWriteExt;
use tokio::runtime::Builder;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (mut writer, mut reader) = tokio::io::duplex(64);

        tokio::spawn(async move {
            // the first half arrives immediately; the second half only after a delay
            writer.write_all(&[1, 2, 3, 4, 5]).await.unwrap();
            sleep(Duration::from_millis(200)).await;
            writer.write_all(&[6, 7, 8, 9, 10]).await.unwrap();
        });

        // ask for all 10 bytes, but race it against a timeout shorter than the writer's
        // delay: read_exact will have already pulled the first 5 bytes into its internal
        // progress before the timeout cancels it
        let mut buf10 = [0u8; 10];
        let cancelled = tokio::select! {
            _r = reader.read_exact(&mut buf10) => false,
            _ = sleep(Duration::from_millis(50)) => true,
        };
        assert!(cancelled, "the timeout should win before the writer's delayed second half arrives");

        // the remaining data on the stream is only the second half (6..=10); the first
        // half that read_exact had already consumed into its now-dropped buffer is gone
        let mut buf5 = [0u8; 5];
        reader.read_exact(&mut buf5).await.expect("the second half should still be readable");

        println!("{:?}", buf5);
        assert_eq!(buf5, [6, 7, 8, 9, 10], "the cancelled read_exact's already-consumed first half must be lost, not recoverable from a fresh read");
    });
}
