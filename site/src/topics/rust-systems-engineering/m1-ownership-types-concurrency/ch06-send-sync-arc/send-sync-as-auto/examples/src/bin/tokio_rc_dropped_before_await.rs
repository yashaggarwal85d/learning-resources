use std::rc::Rc;

fn use_rc(rc: Rc<()>) {
    let _ = rc;
}

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        // The Rc is forced into a scope with no .await inside it.
        {
            let rc = Rc::new(());
            use_rc(rc.clone());
        }
        tokio::task::yield_now().await;
        42u64
    })
    .await
    .unwrap();
    println!("ok");
}
