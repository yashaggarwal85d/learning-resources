use tokio::runtime::Builder;
use tokio::sync::watch;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (tx, mut rx) = watch::channel(0u32);

        // send 50 values rapidly, with nobody checking in between
        for v in 1..=50u32 {
            tx.send(v).unwrap();
        }

        // a receiver that only checks in at the end must see the latest value only
        let seen = *rx.borrow_and_update();
        println!("{seen}");
        assert_eq!(seen, 50, "a watch receiver that checks in late should see only the latest value, not any of the 49 it missed");

        // changed() must report no new value once this receiver has marked the latest as seen
        let marked_current = !rx.has_changed().unwrap();
        assert!(marked_current, "after borrow_and_update, the receiver should have no unseen change left");
    });
}
