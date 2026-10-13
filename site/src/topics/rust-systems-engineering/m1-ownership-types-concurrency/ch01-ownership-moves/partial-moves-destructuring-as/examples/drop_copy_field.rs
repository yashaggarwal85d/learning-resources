#![allow(dead_code)]
struct Lease { id: u32, name: String }
impl Drop for Lease { fn drop(&mut self) { println!("drop lease {}", self.id); } }
fn main() {
    let l = Lease { id: 7, name: String::from("a") };
    let id = l.id;                     // Copy field of a Drop type: a copy, allowed
    let Lease { id: id2, ref name } = l; // ref + copy: allowed
    println!("id={id} id2={id2} name={name}");
}
