use async_trait::async_trait;
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};

struct CountingAllocator;
static ALLOCS: AtomicUsize = AtomicUsize::new(0);

unsafe impl GlobalAlloc for CountingAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Ordering::SeqCst);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}

#[global_allocator]
static GLOBAL: CountingAllocator = CountingAllocator;

#[async_trait]
trait Advertisement {
    async fn run(&self) -> &'static str;
}

struct Modal;

#[async_trait]
impl Advertisement for Modal {
    async fn run(&self) -> &'static str {
        "modal shown"
    }
}

fn main() {
    // dyn dispatch, impossible without the macro (E0038 without it).
    let ads: Vec<Box<dyn Advertisement + Sync>> = vec![Box::new(Modal)];

    let before = ALLOCS.load(Ordering::SeqCst);
    let fut = ads[0].run();
    let after_construct = ALLOCS.load(Ordering::SeqCst);
    let result = futures_lite::future::block_on(fut);

    println!("{}", result);
    println!("allocations during future construction: {}", after_construct - before);
}
