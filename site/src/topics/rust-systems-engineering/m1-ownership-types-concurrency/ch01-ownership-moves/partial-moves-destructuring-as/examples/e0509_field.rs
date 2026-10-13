#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
impl PooledBuf<'_> {
    fn leak_out(self) -> Option<Buf> { self.buf }
}
fn main() {}
