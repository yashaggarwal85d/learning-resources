// PooledBuf (CHAPTER.md A.3): the RAII guard for stage 3. Include after pipeline.rs.
pub struct PooledBuf<'p> { buf: Option<Buf>, pool: &'p mut Pool }
impl<'p> PooledBuf<'p> {
    pub fn new(pool: &'p mut Pool) -> PooledBuf<'p> {
        let buf = pool.get();
        PooledBuf { buf: Some(buf), pool }
    }
    pub fn buf(&self) -> &Buf { self.buf.as_ref().expect("present") }
    pub fn buf_mut(&mut self) -> &mut Buf { self.buf.as_mut().expect("present") }
    pub fn into_inner(mut self) -> Buf {
        self.buf.take().expect("present")
    }   // self drops here
}
impl Drop for PooledBuf<'_> {
  fn drop(&mut self) {
    if let Some(b) = self.buf.take() {
      self.pool.put(b);
    }
  }
}

