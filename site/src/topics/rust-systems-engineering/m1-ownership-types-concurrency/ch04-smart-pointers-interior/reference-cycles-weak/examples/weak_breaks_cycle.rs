// The identical shape, with the parent link changed to a non-owning Weak: the same counting
// allocator now shows every node freed once both go out of scope.
use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::RefCell;
use std::rc::{Rc, Weak};
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
    parent: RefCell<Weak<Node>>, // non-owning: breaks the cycle
}

fn main() {
    let before = live();
    {
        let parent = Rc::new(Node { children: RefCell::new(Vec::new()), parent: RefCell::new(Weak::new()) });
        let child = Rc::new(Node { children: RefCell::new(Vec::new()), parent: RefCell::new(Weak::new()) });
        parent.children.borrow_mut().push(Rc::clone(&child));
        *child.parent.borrow_mut() = Rc::downgrade(&parent);
    }
    let after = live();
    println!("{}", after - before);
}
