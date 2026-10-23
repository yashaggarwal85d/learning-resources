use std::pin::Pin;
use pin_project_lite::pin_project;

pin_project! {
    struct Combined<T, U> {
        #[pin]
        pinned: T,
        unpinned: U,
    }
}

impl<T, U: std::fmt::Display> Combined<T, U> {
    fn report(self: Pin<&mut Self>) -> String {
        let this = self.project();
        let _pinned_ref: Pin<&mut T> = this.pinned;
        format!("unpinned field, reached through an ordinary &mut: {}", this.unpinned)
    }
}

fn main() {
    let combined = Combined { pinned: String::from("holds the address-sensitive field"), unpinned: 42u32 };
    let mut boxed = Box::pin(combined);
    let report = boxed.as_mut().report();
    println!("{}", report);
}
