struct Guard {
    buf: String,
}
impl Drop for Guard {
    fn drop(&mut self) {}
}
fn main() {
    let g = Guard { buf: String::from("x") };
    let Guard { buf } = g;
    println!("{buf}");
}
