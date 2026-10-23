use std::rc::Rc;

fn use_rc(rc: Rc<()>) {
    let _ = rc;
}

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        let rc = Rc::new(());
        tokio::task::yield_now().await;
        use_rc(rc.clone());
    })
    .await
    .unwrap();
}
