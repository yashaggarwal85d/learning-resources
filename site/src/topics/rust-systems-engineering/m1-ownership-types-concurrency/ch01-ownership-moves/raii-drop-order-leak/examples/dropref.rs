use std::sync::Mutex;
fn main() {
    let m = Mutex::new(0);
    let g = m.lock().unwrap();
    drop(&g);
    println!("still locked: {}", m.try_lock().is_err());
}
