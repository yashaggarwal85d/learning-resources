#![allow(dead_code, unused_variables, irrefutable_let_patterns)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let slot = Some(pool.get());
    if let Some(_) = slot {}
    if let Some(_b) = slot {}
    println!("{}", slot.is_some());
}
