use std::marker::PhantomData;
use std::thread;

struct OptedOut<T> {
    value: u64,
    _marker: PhantomData<*const T>,
}

fn assert_send<T: Send>(_: &T) {}

fn main() {
    let p: OptedOut<u8> = OptedOut { value: 7, _marker: PhantomData };
    assert_send(&p);
    let handle = thread::spawn(move || p.value);
    println!("{}", handle.join().unwrap());
}
