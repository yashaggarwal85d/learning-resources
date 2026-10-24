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
}

fn takes_by_value(_: SelfRef) {}

fn main() {
    let a = SelfRef::new("hello");
    takes_by_value(*a);
}
