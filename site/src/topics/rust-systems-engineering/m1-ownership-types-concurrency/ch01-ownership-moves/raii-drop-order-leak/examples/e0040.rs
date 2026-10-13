struct Foo;
impl Drop for Foo {
    fn drop(&mut self) {
        println!("kaboom");
    }
}
fn main() {
    let x = Foo;
    x.drop();
}
