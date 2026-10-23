struct SelfRef {
    value: String,
    pointer: *const String,
}

impl SelfRef {
    fn pointer_is_still_valid(&self) -> bool {
        self.pointer == &self.value as *const String
    }
}

fn main() {
    let mut a = SelfRef { value: String::from("hello"), pointer: std::ptr::null() };
    a.pointer = &a.value;
    assert!(a.pointer_is_still_valid());

    let b = a;
    println!("after move: pointer still valid = {}", b.pointer_is_still_valid());
}
