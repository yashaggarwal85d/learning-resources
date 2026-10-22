// impl Trait in return position returns one hidden, concrete type directly, unboxed.
// The Reference's own motivating case is a closure: before impl Trait, the only way to
// return one was Box<dyn Fn(..)>, which heap-allocates. This counts real allocations
// (same counting-allocator technique as Chapter 1's raii-drop-order-leak topic) to show
// the impl Trait version allocates nothing extra while the boxed version allocates once.
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};

struct CountingAlloc;
static ALLOCS: AtomicUsize = AtomicUsize::new(0);

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Relaxed);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}
#[global_allocator]
static ALLOC: CountingAlloc = CountingAlloc;

fn make_adder_impl_trait(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}

fn make_adder_boxed(n: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |x| x + n)
}

fn main() {
    let before = ALLOCS.load(Relaxed);
    let f = make_adder_impl_trait(5);
    let after_impl_trait = ALLOCS.load(Relaxed);
    let result_impl_trait = f(10);

    let g = make_adder_boxed(5);
    let after_boxed = ALLOCS.load(Relaxed);
    let result_boxed = g(10);

    println!(
        "{} {} {} {} {}",
        result_impl_trait,
        result_boxed,
        before,
        after_impl_trait,
        after_boxed
    );
}
