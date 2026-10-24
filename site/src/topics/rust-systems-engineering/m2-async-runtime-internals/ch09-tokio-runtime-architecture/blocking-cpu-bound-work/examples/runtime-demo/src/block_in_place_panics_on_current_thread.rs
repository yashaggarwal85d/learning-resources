use tokio::runtime::Builder;
use tokio::task;

fn main() {
    let rt = Builder::new_current_thread().enable_all().build().unwrap();

    rt.block_on(async {
        task::block_in_place(|| {});
    });
}
