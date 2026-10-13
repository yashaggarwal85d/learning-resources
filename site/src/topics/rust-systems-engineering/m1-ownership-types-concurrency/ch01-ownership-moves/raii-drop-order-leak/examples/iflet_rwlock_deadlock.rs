use std::sync::RwLock;

fn stage(value: &RwLock<Option<bool>>) {
    if let Some(x) = *value.read().unwrap() {
        println!("value is {x}");
    } else {
        let mut v = value.write().unwrap();
        *v = Some(true);
        println!("set");
    }
}

fn main() {
    let value = RwLock::new(None);
    stage(&value);
    println!("{:?}", *value.read().unwrap());
}
