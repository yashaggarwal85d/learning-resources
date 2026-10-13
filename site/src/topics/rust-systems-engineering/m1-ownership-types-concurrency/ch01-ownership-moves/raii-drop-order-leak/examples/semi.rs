use std::sync::Mutex;

fn main() {
    let m = Mutex::new(Vec::new());
    m.lock().unwrap().push(1);
    println!("after statement: try_lock ok = {}", m.try_lock().is_ok());
    match m.lock().unwrap().len() {
        n => {
            println!("in arm: try_lock ok = {}", m.try_lock().is_ok());
        }
    }
    println!("after match: try_lock ok = {}", m.try_lock().is_ok());
    for x in m.lock().unwrap().iter() {
        println!("in for body: try_lock ok = {}", m.try_lock().is_ok());
    }
    println!("after for: try_lock ok = {}", m.try_lock().is_ok());
    while let Some(x) = m.lock().unwrap().pop() {
        println!("in while let body: try_lock ok = {}", m.try_lock().is_ok());
    }
    println!("after while let: try_lock ok = {}", m.try_lock().is_ok());
}
