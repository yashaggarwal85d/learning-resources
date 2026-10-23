use std::marker::PhantomPinned;
use std::pin::Pin;

struct SelfRef {
    value: String,
    pointer: *const String,
    _pin: PhantomPinned,
}

impl SelfRef {
    fn new(s: &str) -> Pin<Box<Self>> {
        let this = SelfRef { value: String::from(s), pointer: std::ptr::null(), _pin: PhantomPinned };
        let mut boxed = Box::pin(this);
        let ptr: *const String = &boxed.value;
        unsafe {
            let mut_ref: Pin<&mut Self> = Pin::as_mut(&mut boxed);
            Pin::get_unchecked_mut(mut_ref).pointer = ptr;
        }
        boxed
    }

    fn pointer_is_still_valid(self: Pin<&Self>) -> bool {
        self.pointer == &self.value as *const String
    }
}

fn main() {
    let a = SelfRef::new("hello");
    assert!(a.as_ref().pointer_is_still_valid());
    println!("pinned, still valid after construction = {}", a.as_ref().pointer_is_still_valid());
}
