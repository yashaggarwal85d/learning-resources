#![allow(dead_code)]
include!("pipeline.rs");
struct NaiveGuard<'p> { buf: Buf,
    pool: &'p mut Pool }
impl Drop for NaiveGuard<'_> {
    fn drop(&mut self) {
        self.pool.put(self.buf);
    }
}
fn main() {}
