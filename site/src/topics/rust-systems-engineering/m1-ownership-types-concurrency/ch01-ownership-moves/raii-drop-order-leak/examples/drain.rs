fn main() {
    let mut v = vec![1, 2, 3];
    let d = v.drain(..);
    std::mem::forget(d);
    println!("drain_all: len={} cap={}", v.len(), v.capacity());
    let mut w = vec![1, 2, 3, 4, 5];
    std::mem::forget(w.drain(1..3));
    println!("drain_mid: len={} cap={}", w.len(), w.capacity());
}
