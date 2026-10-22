// &'a T is covariant over 'a: a &'static str can stand in wherever a shorter &'b str is expected,
// even when it's passed alongside a genuinely shorter-lived reference to the same generic parameter.
fn debug_pair<T: std::fmt::Debug>(a: T, b: T) {
    println!("{a:?} {b:?}");
}

fn main() {
    let s: &'static str = "hello";
    let world = String::from("world");
    debug_pair(s, world.as_str());
}
