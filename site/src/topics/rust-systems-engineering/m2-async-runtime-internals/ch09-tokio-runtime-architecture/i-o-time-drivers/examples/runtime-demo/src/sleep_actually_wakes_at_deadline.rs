use std::time::{Duration, Instant};
use tokio::runtime::Builder;
use tokio::time::sleep;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();

    rt.block_on(async {
        let started = Instant::now();
        sleep(Duration::from_millis(200)).await;
        let elapsed = started.elapsed();

        println!("{}", elapsed.as_millis());
        assert!(
            elapsed >= Duration::from_millis(190),
            "the timer driver should not wake the sleep early: elapsed {elapsed:?}"
        );
        assert!(
            elapsed < Duration::from_millis(500),
            "the timer driver should wake the sleep close to its deadline, not long after: elapsed {elapsed:?}"
        );
    });
}
