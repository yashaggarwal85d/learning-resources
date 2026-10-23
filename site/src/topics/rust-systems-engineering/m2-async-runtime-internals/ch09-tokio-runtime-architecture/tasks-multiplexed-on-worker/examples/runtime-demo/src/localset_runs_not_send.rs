use std::rc::Rc;
use tokio::runtime::Builder;
use tokio::task::LocalSet;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();
    let local = LocalSet::new();

    let result: String = rt.block_on(local.run_until(async {
        // Rc is !Send; tokio::spawn would refuse this at compile time (see
        // not_send_rejected_by_spawn.rs). spawn_local accepts it because LocalSet
        // only ever runs its tasks on this one thread.
        let data = Rc::new(String::from("not sent anywhere"));
        let data2 = data.clone();
        tokio::task::spawn_local(async move { (*data2).clone() }).await.unwrap()
    }));

    println!("{}", result);
}
