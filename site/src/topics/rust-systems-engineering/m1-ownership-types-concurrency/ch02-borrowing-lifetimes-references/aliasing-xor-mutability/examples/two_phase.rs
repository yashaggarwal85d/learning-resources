// The RFC 2025 motivating example: v.push(v.len()) reads v (len) while v is only "reserved" for the push,
// and only becomes a true exclusive borrow at the call itself.
fn main() {
    let mut v = vec![10, 20, 30];
    v.push(v.len() as i32);
    println!("{:?}", v);
}
