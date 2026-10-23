use std::thread;

// Carton<T>: a minimal heap box, like Box<T>, built from a raw pointer.
// The compiler sees only a raw pointer and refuses to derive Send for it.
struct Carton<T>(*mut T);

impl<T> Carton<T> {
    fn new(value: T) -> Self {
        Carton(Box::into_raw(Box::new(value)))
    }
    fn get(&self) -> &T {
        unsafe { &*self.0 }
    }
}

impl<T> Drop for Carton<T> {
    fn drop(&mut self) {
        unsafe { drop(Box::from_raw(self.0)) };
    }
}

// SAFETY: Carton owns its value exclusively (no aliasing raw pointer escapes),
// so moving a Carton<T> to another thread is as safe as moving a Box<T> --
// safe exactly when T itself is Send.
unsafe impl<T: Send> Send for Carton<T> {}

fn main() {
    let c = Carton::new(99u64);
    let handle = thread::spawn(move || *c.get());
    println!("{}", handle.join().unwrap());
}
