use std::sync::RwLock;

fn stage(value: &RwLock<Option<bool>>) {
    if let Some(x) = *value.read().unwrap() {
        println!("value is {x}");
    } else {
        match value.try_write() {
            Ok(mut v) => {
                *v = Some(true);
                println!("set to true");
            }
            Err(e) => println!("try_write failed: {e:?}"),
        }
    }
}

fn main() {
    let value = RwLock::new(None);
    stage(&value);
    println!("{:?}", *value.read().unwrap());
}
