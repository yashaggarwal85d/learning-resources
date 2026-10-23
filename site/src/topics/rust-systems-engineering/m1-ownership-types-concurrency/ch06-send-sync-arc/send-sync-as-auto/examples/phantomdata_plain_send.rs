use std::marker::PhantomData;
use std::thread;

struct Plain<T> {
    value: u64,
    _marker: PhantomData<T>,
}

fn assert_send<T: Send>(_: &T) {}

fn main() {
    let p: Plain<u8> = Plain { value: 7, _marker: PhantomData };
    assert_send(&p);
    let handle = thread::spawn(move || p.value);
    println!("{}", handle.join().unwrap());
}
