// Two nodes holding strong Rc references to each other form a cycle neither node's Drop can ever
// break: safe Rust compiles this without complaint, and it leaks for the life of the program.
// Measured with a counting global allocator, the same technique Chapter 1's leak-safety topic
// used.
use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};

struct CountingAlloc;
static ALLOCS: AtomicUsize = AtomicUsize::new(0);
static DEALLOCS: AtomicUsize = AtomicUsize::new(0);

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Relaxed);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        DEALLOCS.fetch_add(1, Relaxed);
        unsafe { System.dealloc(ptr, layout) }
    }
}
#[global_allocator]
static ALLOC: CountingAlloc = CountingAlloc;
fn live() -> usize {
    ALLOCS.load(Relaxed) - DEALLOCS.load(Relaxed)
}

struct Node {
    children: RefCell<Vec<Rc<Node>>>,
    parent: RefCell<Option<Rc<Node>>>, // strong, on purpose: this is the leak
}

fn main() {
    let before = live();
    {
        let parent = Rc::new(Node { children: RefCell::new(Vec::new()), parent: RefCell::new(None) });
        let child = Rc::new(Node { children: RefCell::new(Vec::new()), parent: RefCell::new(None) });
        parent.children.borrow_mut().push(Rc::clone(&child));
        *child.parent.borrow_mut() = Some(Rc::clone(&parent));
        // parent and child now both go out of scope here, each still held by the other.
    }
    let after = live();
    println!("{}", after - before);
}
