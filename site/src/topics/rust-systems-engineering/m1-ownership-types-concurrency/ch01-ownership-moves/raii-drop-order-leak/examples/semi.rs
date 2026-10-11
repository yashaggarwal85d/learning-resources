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
}
