#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
use std::mem::{self, ManuallyDrop};
// Variant A: a placeholder instead of an Option
struct ReplaceGuard<'p> { buf: Buf, pool: &'p mut Pool }
impl Drop for ReplaceGuard<'_> {
    fn drop(&mut self) {
        let buf = mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() });
        self.pool.put(buf);
    }
}
// Variant B: ManuallyDrop + unsafe (Ch.30)
struct MdGuard<'p> { buf: ManuallyDrop<Buf>, pool: &'p mut Pool }
impl Drop for MdGuard<'_> {
    fn drop(&mut self) {
        // SAFETY: `self.buf` is never used again after this line.
        let buf = unsafe { ManuallyDrop::take(&mut self.buf) };
        self.pool.put(buf);
    }
}
fn main() {
    let full = message(1, BUF_CAP);
    let mut pool = Pool::new();
    let a0 = allocs();
    for _ in 0..1000 {
        let b = pool.get();
        let mut g = ReplaceGuard { buf: b, pool: &mut pool };
        fill(&mut g.buf, &full);
    }
    println!("replace guard allocs={}", allocs() - a0);
    let mut pool = Pool::new();
    let a0 = allocs();
    for _ in 0..1000 {
        let b = pool.get();
        let mut g = MdGuard { buf: ManuallyDrop::new(b), pool: &mut pool };
        fill(&mut g.buf, &full);
    }
    println!("manuallydrop guard allocs={}", allocs() - a0);
    println!("sizes ReplaceGuard={} MdGuard={} PooledBuf={}", mem::size_of::<ReplaceGuard>(), mem::size_of::<MdGuard>(), mem::size_of::<PooledBuf>());
    // the take trap: taking the bytes leaves a capacity-0 Vec in the pooled buffer
    let msg = message(1, 261);
    let mut pool = Pool::new();
    let a0 = allocs(); let b0 = BYTES.load(Relaxed);
    for _ in 0..1000 {
        let mut buf = pool.get();
        fill(&mut buf, &msg);
        let bytes = mem::take(&mut buf.bytes);
        drop(bytes); // written elsewhere
        pool.put(buf);
    }
    println!("take-bytes trap allocs={} bytes={}", allocs() - a0, BYTES.load(Relaxed) - b0);
}
