fn id<T>(x: T) -> T {
    x
}
fn main() {
    let r = id(&String::from("a"));
    println!("{r}");
}
