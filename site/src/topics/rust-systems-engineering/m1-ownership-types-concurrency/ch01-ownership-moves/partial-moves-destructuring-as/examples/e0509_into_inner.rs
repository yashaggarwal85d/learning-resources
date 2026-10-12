#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
pub struct PooledBuf<'p> { buf: Option<Buf>, pool: &'p mut Pool }
impl Drop for PooledBuf<'_> {
  fn drop(&mut self) {
    if let Some(b) = self.buf.take() {
      self.pool.put(b);
    }
  }
}
impl PooledBuf<'_> {
    fn into_inner(self) -> Buf {
        let PooledBuf { buf, .. } = self;
        buf.expect("present")
    }
}
fn main() {}
