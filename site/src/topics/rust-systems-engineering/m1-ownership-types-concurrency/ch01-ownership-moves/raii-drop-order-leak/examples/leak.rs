#![allow(dead_code, unused_variables)]
use std::alloc::{GlobalAlloc, Layout, System};
use std::fs::{self, File};
use std::mem::{self, ManuallyDrop};
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};

pub struct CountingAlloc;
pub static ALLOCS: AtomicUsize = AtomicUsize::new(0);
pub static DEALLOCS: AtomicUsize = AtomicUsize::new(0);
pub static BYTES: AtomicUsize = AtomicUsize::new(0); // bytes requested by alloc

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Relaxed);
        BYTES.fetch_add(layout.size(), Relaxed);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        DEALLOCS.fetch_add(1, Relaxed);
        unsafe { System.dealloc(ptr, layout) }
    }
}
#[global_allocator]
static ALLOC: CountingAlloc = CountingAlloc;
pub fn allocs() -> usize { ALLOCS.load(Relaxed) }
pub fn deallocs() -> usize { DEALLOCS.load(Relaxed) }

static CLOSES: AtomicUsize = AtomicUsize::new(0);

struct SpillFile { path: PathBuf, file: File }
impl Drop for SpillFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
        CLOSES.fetch_add(1, Relaxed);
    }
}
impl SpillFile {
    fn create(path: PathBuf) -> std::io::Result<SpillFile> {
        let file = File::create(&path)?;
        Ok(SpillFile { path, file })
    }
}

fn path() -> PathBuf {
    std::env::temp_dir().join(format!("raii-leak-1-{}.bin", std::process::id()))
}
fn live() -> usize { allocs() - deallocs() }
fn open_fds() -> usize { fs::read_dir("/proc/self/fd").unwrap().count() }
fn closes() -> usize { CLOSES.load(Relaxed) }

fn main() -> std::io::Result<()> {
    let tmp = std::env::temp_dir();
    let pid = std::process::id();
    // A baseline close, so `closes` is 1 before the forget (as on screen).
    {
        let s = SpillFile::create(tmp.join(format!("raii-leak-0-{pid}.bin")))?;
    }
    println!("baseline closes={}", closes());

    // forget(SpillFile)
    let fds = open_fds();
    let c = closes();
    let before = allocs() - deallocs();
    {
        let s = SpillFile::create(path())?;
        std::mem::forget(s);     // safe. No drop.
    }
    let after = allocs() - deallocs();
    println!("forget: closes_delta={} exists={} live_delta={} fds_delta={}", closes() - c, path().exists(), after - before, open_fds() - fds);
    let _ = fs::remove_file(path());

    // ManuallyDrop::new(SpillFile): no close; into_inner + drop: close
    let p2 = tmp.join(format!("raii-leak-2-{pid}.bin"));
    let c = closes();
    {
        let spill = SpillFile::create(p2.clone())?;
        let m = ManuallyDrop::new(spill);
    }
    println!("manuallydrop: closes_delta={} exists={}", closes() - c, p2.exists());
    let c = closes();
    {
        let spill = SpillFile::create(p2.clone())?;
        let m = ManuallyDrop::new(spill);
        let s = ManuallyDrop::into_inner(m); drop(s);
    }
    println!("into_inner: closes_delta={} exists={}", closes() - c, p2.exists());

    // forget(Vec::with_capacity(64 * 1024))
    let before = live();
    let b0 = BYTES.load(Relaxed);
    let v: Vec<u8> = Vec::with_capacity(64 * 1024);
    mem::forget(v);
    println!("forget_vec: live_delta={} bytes_delta={}", live() - before, BYTES.load(Relaxed) - b0);

    // ManuallyDrop<Vec>
    let before = live();
    let m = ManuallyDrop::new(Vec::<u8>::with_capacity(64 * 1024));
    let d1 = live() - before;
    let v = ManuallyDrop::into_inner(m);
    drop(v);
    println!("manuallydrop_vec: live_delta={} after_into_inner_drop={}", d1, live() - before);

    // Box::leak
    let before = live();
    let r: &'static mut [u8; 64] =
        Box::leak(Box::new([7u8; 64]));
    println!("box_leak: live_delta={} first={}", live() - before, r[0]);

    // drop on a Copy value does nothing
    let h = 5u32;
    #[allow(dropping_copy_types)]
    drop(h);
    println!("copy_drop: {h}");
    Ok(())
}
