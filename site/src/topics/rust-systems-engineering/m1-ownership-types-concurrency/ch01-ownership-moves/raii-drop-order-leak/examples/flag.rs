pub struct T(pub u32);
impl Drop for T {
    fn drop(&mut self) {}
}
pub fn consume(t: T) {}
pub fn f(c: bool) {
    let t = T(1);
    if c {
        consume(t);
    }
}
