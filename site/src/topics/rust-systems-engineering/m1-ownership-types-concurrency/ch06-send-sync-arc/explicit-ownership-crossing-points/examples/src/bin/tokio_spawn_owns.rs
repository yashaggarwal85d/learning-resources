// tokio::spawn needs the identical Send + 'static contract as thread::spawn,
// now on a Future instead of a closure. The task may run on the current
// thread or be moved to another one by the runtime — tokio's own docs say so
// directly — which is exactly why Send is required at all.
#[tokio::main]
async fn main() {
    let message = String::from("owned by the spawned task now");
    let handle = tokio::spawn(async move {
        // `message` was moved in; this task owns it.
        message.len()
    });
    let len = handle.await.unwrap();
    println!("{}", len);
}
