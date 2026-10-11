use std::sync::RwLock;
fn main() {
    let lock = RwLock::new(0);
    let mut shared = 0;
    let _ = lock.write().unwrap();
    shared += 1;
    println!("{shared}");
}
