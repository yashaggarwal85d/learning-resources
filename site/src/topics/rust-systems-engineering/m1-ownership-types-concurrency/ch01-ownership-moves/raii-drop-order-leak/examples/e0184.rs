#[derive(Clone, Copy)]
struct Fd(i32);
impl Drop for Fd {
    fn drop(&mut self) {}
}
fn main() {}
