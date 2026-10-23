// Rc is the standard library's own canonical non-Send example. Holding one across an await point
// puts it inside the compiler-generated suspension-state enum's live-across-that-point variant,
// and Send is an auto trait: the enum is Send only if every field of every variant is. This must
// fail to compile with the exact error the compiler gives for a type that is not Send.
use std::future::ready;
use std::rc::Rc;

async fn holds_rc_across_await() {
    let rc = Rc::new(5);
    ready(()).await;
    println!("{}", rc);
}

fn requires_send<F: Send>(_: F) {}

fn main() {
    requires_send(holds_rc_across_await());
}
