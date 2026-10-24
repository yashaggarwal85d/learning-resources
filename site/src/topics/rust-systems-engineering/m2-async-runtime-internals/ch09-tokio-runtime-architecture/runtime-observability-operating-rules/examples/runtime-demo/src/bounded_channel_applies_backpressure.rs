use tokio::runtime::Builder;
use tokio::sync::mpsc;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    rt.block_on(async {
        let (tx, mut rx) = mpsc::channel::<u32>(1);

        tx.try_send(1).expect("the first send fits in the channel's one slot of capacity");
        let second = tx.try_send(2);
        assert!(second.is_err(), "a second send into an already-full bounded channel must be refused, not queued without limit");

        let received = rx.recv().await.unwrap();
        assert_eq!(received, 1);

        // the slot just freed by recv is real capacity, not a fluke of the first failure
        tx.try_send(3).expect("capacity freed by recv must let a new send through");
        let received2 = rx.recv().await.unwrap();
        assert_eq!(received2, 3);

        println!("{} {}", second.is_err(), received2);
    });
}
