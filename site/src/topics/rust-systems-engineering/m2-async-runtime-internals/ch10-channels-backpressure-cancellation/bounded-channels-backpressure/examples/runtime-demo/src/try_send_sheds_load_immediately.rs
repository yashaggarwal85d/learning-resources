use std::time::Instant;
use tokio::runtime::Builder;
use tokio::sync::mpsc;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (tx, _rx) = mpsc::channel::<u32>(1);

        tx.try_send(1).expect("the first send fits in the channel's one slot of capacity");

        // the channel is now full, and nobody is reading; try_send must refuse immediately,
        // not wait even briefly for room
        let start = Instant::now();
        let second = tx.try_send(2);
        let refusal_elapsed = start.elapsed();

        println!("{} {}", second.is_err(), refusal_elapsed.as_micros());
        assert!(second.is_err(), "try_send on a full channel must be refused outright, not queued");
        assert!(refusal_elapsed.as_millis() < 10, "try_send should refuse immediately, not wait, got {refusal_elapsed:?}");
    });
}
