#![allow(let_underscore_lock)]
use std::sync::RwLock;

fn main() {
    let lock = RwLock::new(0);
    let mut shared = 0;
    let _ = lock.write().unwrap();
    shared += 1;
    println!("after let _: try_read ok = {}", lock.try_read().is_ok());
    let _g = lock.write().unwrap();
    shared += 1;
    println!("after let _g: try_read ok = {}", lock.try_read().is_ok());
    drop(_g);
    let g = lock.write().unwrap();
    let _ = g;
    println!("after let _ = g: try_read ok = {}", lock.try_read().is_ok());
    println!("{shared}");
}
