use std::sync::RwLock;

fn stage(value: &RwLock<Option<bool>>) {
    match *value.read().unwrap() {
        Some(x) => {
            println!("value is {x}");
        }
        _ => match value.try_write() {
            Ok(mut v) => {
                *v = Some(true);
                println!("set to true");
            }
            Err(e) => println!("try_write failed: {e:?}"),
        },
    }
}

fn main() {
    let value = RwLock::new(None);
    stage(&value);
}
