use std::marker::PhantomPinned;
use std::pin::{pin, Pin};

struct SelfRef {
    value: String,
    pointer: *const String,
    _pin: PhantomPinned,
}

impl SelfRef {
    fn pointer_is_still_valid(self: Pin<&Self>) -> bool {
        self.pointer == &self.value as *const String
    }
}

fn main() {
    let this = SelfRef { value: String::from("stack-pinned"), pointer: std::ptr::null(), _pin: PhantomPinned };
    let mut pinned: Pin<&mut SelfRef> = pin!(this);
    let ptr: *const String = &pinned.value;
    unsafe {
        Pin::get_unchecked_mut(Pin::as_mut(&mut pinned)).pointer = ptr;
    }
    println!("pin!-macro, stack-pinned, still valid = {}", pinned.as_ref().pointer_is_still_valid());
}
