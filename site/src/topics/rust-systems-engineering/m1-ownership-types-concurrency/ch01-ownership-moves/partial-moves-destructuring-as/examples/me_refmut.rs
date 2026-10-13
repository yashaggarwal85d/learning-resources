#![allow(dead_code, unused_variables)]
fn main() {
    let mut opt = Some(String::from("x"));
    if let Some(ref mut s) = &mut opt { s.push('y'); }
    let [&x] = &[&1u8];
}
