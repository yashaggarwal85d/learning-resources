// &'a mut T is invariant over T: assigning a shorter-lived &str into a *mut* binding typed &'static str
// is rejected, even though the same two references passed by value above compiled fine.
fn assign<T>(input: &mut T, val: T) {
    *input = val;
}

fn main() {
    let mut hello: &'static str = "hello";
    let world = String::from("world");
    assign(&mut hello, world.as_str());
    println!("{hello}");
}
